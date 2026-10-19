import crypto from 'crypto';
import { getRazorpayClient, isRazorpayConfigured } from '../config/razorpay';
import { PaymentModel, IPaymentDocument } from '../models/Payment';
import { BookingModel } from '../models/Booking';
import { RefundModel } from '../models/Refund';
import { NotificationModel } from '../models/Notification';
import { SettlementService } from './settlementService';

export class PaymentService {
  /**
   * Create Razorpay Order for a booking
   */
  static async createOrder(bookingId: string, customerId: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.customerId !== customerId) {
      throw new Error('Unauthorized: Booking does not belong to you');
    }

    if (booking.status !== 'pending_payment' && booking.status !== 'draft') {
      throw new Error(`Booking is in ${booking.status} state, cannot initiate payment`);
    }

    const amountPaise = booking.pricing.totalAmountPaise;
    const razorpay = getRazorpayClient();

    let razorpayOrderId: string;

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: booking.bookingNumber,
        notes: {
          bookingId: booking._id.toString(),
          providerId: booking.providerId,
          serviceType: booking.serviceType
        }
      });
      razorpayOrderId = order.id;
    } else {
      // Mock / Dev mode fallback order
      razorpayOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    }

    // Create or update payment document
    let payment = await PaymentModel.findOne({ bookingId: booking._id.toString() });
    if (!payment) {
      payment = await PaymentModel.create({
        bookingId: booking._id.toString(),
        customerId,
        providerId: booking.providerId,
        amountPaise,
        currency: 'INR',
        razorpayOrderId,
        status: 'created'
      });
    } else {
      payment.razorpayOrderId = razorpayOrderId;
      payment.amountPaise = amountPaise;
      payment.status = 'created';
      await payment.save();
    }

    booking.paymentId = payment._id.toString();
    await booking.save();

    return {
      orderId: razorpayOrderId,
      amountPaise,
      currency: 'INR',
      bookingNumber: booking.bookingNumber,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_vflow_demo_mock',
      isMock: !isRazorpayConfigured()
    };
  }

  /**
   * Verify Razorpay payment signature and confirm booking
   */
  static async verifyPayment(params: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const payment = await PaymentModel.findOne({ razorpayOrderId: params.razorpayOrderId });
    if (!payment) throw new Error('Payment record not found for this order ID');

    const booking = await BookingModel.findById(params.bookingId);
    if (!booking) throw new Error('Booking not found');

    // Signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_vflow_demo_mock';
    const isMock = !isRazorpayConfigured();

    if (!isMock) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
        .digest('hex');

      if (expectedSignature !== params.razorpaySignature) {
        payment.status = 'failed';
        payment.failureReason = 'Invalid Razorpay payment signature';
        await payment.save();
        throw new Error('Payment signature verification failed');
      }
    }

    // Idempotent confirmation
    if (payment.status === 'captured') {
      return { success: true, booking, payment };
    }

    payment.status = 'captured';
    payment.razorpayPaymentId = params.razorpayPaymentId;
    payment.razorpaySignature = params.razorpaySignature;
    await payment.save();

    booking.status = 'confirmed';
    booking.paymentStatus = 'captured';
    await booking.save();

    // Create financial ledger entry for provider (next-day settlement tracking)
    await SettlementService.recordBookingPayment(booking, payment);

    // Send notifications
    await NotificationModel.create([
      {
        userId: booking.customerId,
        title: 'Booking Confirmed!',
        message: `Your reservation ${booking.bookingNumber} is confirmed. PIN: ${booking.accessPin}`,
        type: 'booking',
        linkUrl: `/bookings/${booking._id}`
      },
      {
        userId: booking.providerId,
        title: 'New Booking Received',
        message: `You have received a new booking ${booking.bookingNumber} worth ₹${(booking.pricing.providerSharePaise / 100).toFixed(2)}`,
        type: 'booking',
        linkUrl: `/provider/dashboard`
      }
    ]);

    return { success: true, booking, payment };
  }

  /**
   * Handle Razorpay Webhooks idempotently
   */
  static async handleWebhook(signature: string, bodyRaw: string, payload: any) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyRaw)
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature');
      }
    }

    const event = payload.event;
    console.log(`[Webhook] Razorpay event received: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        const payment = await PaymentModel.findOne({ razorpayOrderId: paymentEntity.order_id });
        if (payment && payment.status !== 'captured') {
          payment.status = 'captured';
          payment.razorpayPaymentId = paymentEntity.id;
          await payment.save();

          const booking = await BookingModel.findById(payment.bookingId);
          if (booking && booking.status === 'pending_payment') {
            booking.status = 'confirmed';
            booking.paymentStatus = 'captured';
            await booking.save();
            await SettlementService.recordBookingPayment(booking, payment);
          }
        }
      }
    }

    return { received: true };
  }

  /**
   * Process refund upon cancellation
   */
  static async processRefund(bookingId: string, reason: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error('Booking not found');

    const payment = await PaymentModel.findOne({ bookingId: booking._id.toString(), status: 'captured' });
    if (!payment) throw new Error('No captured payment found for this booking');

    // Cancellation policy calculation
    const start = new Date(booking.startTime).getTime();
    const now = Date.now();
    const hoursBeforeArrival = (start - now) / (1000 * 60 * 60);

    let refundPercent = 100;
    if (hoursBeforeArrival < 2) {
      refundPercent = 50; // Late cancellation
    }

    const refundAmountPaise = Math.round((payment.amountPaise * refundPercent) / 100);

    const razorpay = getRazorpayClient();
    let razorpayRefundId: string | undefined;

    if (razorpay && payment.razorpayPaymentId && !payment.razorpayPaymentId.startsWith('pay_mock')) {
      const refundRes = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: refundAmountPaise,
        notes: { bookingId: booking._id.toString(), reason }
      });
      razorpayRefundId = refundRes.id;
    } else {
      razorpayRefundId = `rfnd_mock_${crypto.randomBytes(6).toString('hex')}`;
    }

    const refund = await RefundModel.create({
      paymentId: payment._id.toString(),
      bookingId: booking._id.toString(),
      amountPaise: refundAmountPaise,
      reason,
      razorpayRefundId,
      status: 'processed',
      processedAt: new Date().toISOString()
    });

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date().toISOString();
    await booking.save();

    payment.status = 'refunded';
    await payment.save();

    // Reconcile financial ledger
    await SettlementService.recordRefund(booking, refund);

    return refund;
  }
}
