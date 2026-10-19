import { Router } from 'express';
import { BookingService } from '../services/bookingService';
import { PaymentService } from '../services/paymentService';
import { ProviderService } from '../services/providerService';
import { authenticate } from '../middleware/auth';
import { CreateBookingSchema } from '@vflow/shared';

const router = Router();

// Create booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const validated = CreateBookingSchema.parse(req.body);
    const booking = await BookingService.createBooking({
      customerId: req.user!.id,
      ...validated
    });
    res.status(201).json({ success: true, booking });
  } catch (err) {
    next(err);
  }
});

// Get customer bookings
router.get('/customer/mine', authenticate, async (req, res, next) => {
  try {
    const bookings = await BookingService.getCustomerBookings(req.user!.id);
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
});

// Get provider bookings
router.get('/provider/mine', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const bookings = await BookingService.getProviderBookings(provider._id.toString());
    res.json({ success: true, bookings });
  } catch (err) {
    next(err);
  }
});

// Get booking details
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const details = await BookingService.getBookingById(req.params.id);
    if (!details) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }
    res.json({ success: true, ...details });
  } catch (err) {
    next(err);
  }
});

// Mark booking completed (Arrival/Departure confirmed)
router.post('/:id/complete', authenticate, async (req, res, next) => {
  try {
    const booking = await BookingService.markCompleted(req.params.id);
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
});

// Cancel booking and trigger refund
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const reason = req.body.reason || 'User requested cancellation';
    const refund = await PaymentService.processRefund(req.params.id, reason);
    res.json({ success: true, refund });
  } catch (err) {
    next(err);
  }
});

export default router;
