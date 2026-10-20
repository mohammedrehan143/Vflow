import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Zap,
  MapPin,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { PLATFORM_CONFIG } from '@vflow/shared';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const BookingCheckout: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Booking details
  const { data, isLoading, error } = useQuery({
    queryKey: ['checkoutBooking', bookingId],
    queryFn: () => api.bookings.getById(bookingId!),
    enabled: !!bookingId,
  });

  const booking = data?.booking;
  const listing = data?.listing;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
        <div className="h-64 bg-neutral-200 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-black text-neutral-900">Booking Session Expired</h2>
        <p className="text-xs text-neutral-500">Could not retrieve reservation details.</p>
        <Link to="/parking" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-4 py-2.5 rounded-xl shadow-xs transition">
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const pricing = booking.pricing;
  const totalRupees = (pricing.totalAmountPaise / 100).toFixed(2);

  const handlePayWithRazorpay = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Request Order Creation from Backend
      const orderRes = await api.payments.createOrder(booking._id);

      if (!orderRes.success) {
        throw new Error('Failed to generate payment order');
      }

      // 2. Check if Razorpay JS SDK is loaded and we have live/test client
      if (window.Razorpay && !orderRes.isMock) {
        const options = {
          key: orderRes.keyId,
          amount: orderRes.amountPaise,
          currency: orderRes.currency,
          name: 'VFlow Mobility',
          description: `Reservation ${orderRes.bookingNumber}`,
          order_id: orderRes.orderId,
          prefill: {
            name: user?.fullName || 'VFlow Driver',
            email: user?.email || 'driver@vflow.in',
            contact: user?.phone || '+919876543210',
          },
          theme: {
            color: '#FACC15',
          },
          handler: async function (response: any) {
            // 3. Verify Payment Signature on Backend
            const verifyRes = await api.payments.verify({
              bookingId: booking._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              navigate(`/payment/result?bookingId=${booking._id}&paymentId=${verifyRes.payment._id}`);
            } else {
              setErrorMessage('Payment signature verification failed on backend.');
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          setErrorMessage(resp.error?.description || 'Payment failed');
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Dev / Mock test mode verified signature flow
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = `sig_mock_${Date.now()}`;

        const verifyRes = await api.payments.verify({
          bookingId: booking._id,
          razorpayOrderId: orderRes.orderId,
          razorpayPaymentId: mockPaymentId,
          razorpaySignature: mockSignature,
        });

        if (verifyRes.success) {
          navigate(`/payment/result?bookingId=${booking._id}&paymentId=${verifyRes.payment._id}`);
        } else {
          setErrorMessage('Failed to verify mock payment.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen text-neutral-900">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 bg-yellow-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
          <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Encrypted Checkout</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
          Review & Pay for Reservation
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
          Booking Ref: <span className="font-mono font-black text-neutral-900">{booking.bookingNumber}</span>
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-bold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Booking Summary & Policy */}
        <div className="md:col-span-7 space-y-6">
          {/* Listing Card Preview */}
          <div className="bg-white rounded-3xl p-5 border-2 border-neutral-200 shadow-xs space-y-4">
            <div className="flex gap-4">
              <img
                src={listing?.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400'}
                alt="Listing"
                className="w-24 h-24 object-cover rounded-2xl shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[11px] font-black text-black uppercase bg-yellow-400 px-2.5 py-0.5 rounded-full shadow-xs border border-yellow-500/20">
                  {booking.serviceType}
                </span>
                <h3 className="font-black text-neutral-900 text-sm sm:text-base line-clamp-1">{listing?.title}</h3>
                <p className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
                  <span>{listing?.address?.street}, {listing?.address?.city}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100 text-xs">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase font-black block">Arrival</span>
                <span className="font-black text-neutral-900 text-xs">
                  {new Date(booking.startTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase font-black block">Departure</span>
                <span className="font-black text-neutral-900 text-xs">
                  {new Date(booking.endTime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>

            {booking.vehicleDetails && (
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-neutral-500 font-bold">Reserved Vehicle:</span>
                <span className="font-black text-neutral-900">
                  {booking.vehicleDetails.licensePlate} ({booking.vehicleDetails.model})
                </span>
              </div>
            )}
          </div>

          {/* Guarantee disclosure */}
          <div className="bg-yellow-50/80 p-4 rounded-2xl border border-yellow-200 space-y-2 text-xs text-neutral-900">
            <div className="flex items-center gap-2 font-black">
              <ShieldCheck className="w-4 h-4 text-black stroke-[2.5]" />
              <span>VFlow Next-Day Payout Commitment</span>
            </div>
            <p className="text-neutral-700 leading-relaxed text-[11px] font-medium">
              Your payment is safeguarded in escrow and will be disbursed to the host next calendar day following successful completion of your parking session.
            </p>
          </div>
        </div>

        {/* Right: Transparent Price Breakdown & Checkout Action */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border-2 border-neutral-200 shadow-xl space-y-6">
          <h3 className="font-black text-neutral-900 text-base">Payment Summary</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-neutral-600 font-medium">
              <span>Space Reservation Fee</span>
              <span className="font-black text-neutral-900">
                ₹{(pricing.baseAmountPaise / 100).toFixed(2)}
              </span>
            </div>

            {pricing.chargingAmountPaise ? (
              <div className="flex justify-between text-neutral-600 font-medium">
                <span>EV Charging Fee</span>
                <span className="font-black text-neutral-900">
                  ₹{(pricing.chargingAmountPaise / 100).toFixed(2)}
                </span>
              </div>
            ) : null}

            <div className="flex justify-between text-neutral-600 font-medium">
              <span>Platform Service Fee</span>
              <span className="font-black text-neutral-900">
                ₹{(pricing.platformCommissionPaise / 100).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-neutral-600 font-medium">
              <span>GST (18% on platform fee)</span>
              <span className="font-black text-neutral-900">
                ₹{((pricing.platformCommissionPaise * 0.18) / 100).toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-between text-base font-black text-neutral-900">
              <span>Total Payable</span>
              <span className="text-black bg-yellow-400 px-2 py-0.5 rounded-lg shadow-xs text-lg">₹{totalRupees}</span>
            </div>
          </div>

          <button
            onClick={handlePayWithRazorpay}
            disabled={isProcessing}
            className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-4 px-4 rounded-2xl shadow-xs border border-yellow-500/20 transition active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <CreditCard className="w-4 h-4 stroke-[2.5]" />
            <span>{isProcessing ? 'Verifying with Razorpay...' : `Pay ₹${totalRupees} via Razorpay`}</span>
          </button>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Razorpay Verified Gateway · Instant PIN Generation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
