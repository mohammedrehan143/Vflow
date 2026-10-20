import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Clock,
  Car,
  Zap,
  MapPin,
  KeyRound,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { IBooking } from '@vflow/shared';

export const MyBookings: React.FC = () => {
  const queryClient = useQueryClient();
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');

  const { data, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => api.bookings.getMyBookings(),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.bookings.cancel(id, cancelReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      setCancellingBookingId(null);
    },
  });

  const bookings = data?.bookings || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen text-neutral-900">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 bg-yellow-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
          <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Driver Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
          My Reservations & Sessions
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
          View your confirmed parking spots, charging sessions, and digital PIN passes
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 bg-neutral-100 rounded-3xl animate-pulse border border-neutral-200" />
          ))}
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isConfirmed = booking.status === 'confirmed';
            const isCompleted = booking.status === 'completed';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking._id}
                className="bg-white rounded-3xl border-2 border-neutral-200 p-5 shadow-xs hover:border-black transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-neutral-500">
                      #{booking.bookingNumber}
                    </span>
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-yellow-400 text-black shadow-xs'
                          : isCompleted
                          ? 'bg-black text-white'
                          : isCancelled
                          ? 'bg-red-100 text-red-800'
                          : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded capitalize border border-neutral-200">
                      {booking.serviceType}
                    </span>
                  </div>

                  <h3 className="font-black text-neutral-900 text-base">
                    {booking.listing?.title || 'Reserved Parking Bay'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>
                        {new Date(booking.startTime).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        · {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {booking.vehicleDetails && (
                      <div className="flex items-center gap-1 font-black text-neutral-900">
                        <Car className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{booking.vehicleDetails.licensePlate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right PIN and Actions */}
                <div className="flex flex-wrap items-center gap-4 self-end md:self-center">
                  {isConfirmed && booking.accessPin && (
                    <div className="bg-yellow-50 border-2 border-yellow-300 px-4 py-2 rounded-xl text-center shadow-xs">
                      <div className="text-[10px] font-black text-neutral-900 uppercase">Entry PIN</div>
                      <div className="font-mono font-black text-xl text-black">
                        {booking.accessPin}
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-base font-black text-neutral-900">
                      ₹{(booking.pricing.totalAmountPaise / 100).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-medium">Total Paid</div>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => setCancellingBookingId(booking._id)}
                      className="text-xs font-black text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition border border-red-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-neutral-200 p-8 space-y-3 shadow-xs">
          <Car className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-black text-neutral-900">No Reservations Yet</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
            Ready to find parking or fast EV charging? Search spots in Bangalore, Mumbai, and Delhi.
          </p>
          <Link
            to="/parking"
            className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-xs border border-yellow-500/20 transition active:scale-95"
          >
            Find Parking Now
          </Link>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border-2 border-neutral-200 text-neutral-900">
            <div className="flex items-center gap-2 text-red-600 font-black text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Reservation</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              Are you sure you want to cancel this booking? According to the listing policy, eligible refunds are automatically credited back to your original payment method via Razorpay.
            </p>

            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold focus:outline-none focus:border-black"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Booked wrong vehicle or time">Booked wrong vehicle or time</option>
                <option value="Found alternative space">Found alternative space</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-black text-neutral-600 hover:bg-neutral-100"
              >
                Keep Booking
              </button>
              <button
                onClick={() => cancelMutation.mutate(cancellingBookingId)}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-black bg-black text-white hover:text-yellow-400 transition shadow-xs"
              >
                {cancelMutation.isPending ? 'Processing Refund...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
