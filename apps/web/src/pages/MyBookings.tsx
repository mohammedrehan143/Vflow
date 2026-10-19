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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Driver Dashboard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          My Reservations & Sessions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View your confirmed parking spots, charging sessions, and digital PIN passes
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
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
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      #{booking.bookingNumber}
                    </span>
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCompleted
                          ? 'bg-blue-100 text-blue-800'
                          : isCancelled
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded capitalize">
                      {booking.serviceType}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {booking.listing?.title || 'Reserved Parking Bay'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(booking.startTime).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        · {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {booking.vehicleDetails && (
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Car className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{booking.vehicleDetails.licensePlate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right PIN and Actions */}
                <div className="flex flex-wrap items-center gap-4 self-end md:self-center">
                  {isConfirmed && booking.accessPin && (
                    <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-center">
                      <div className="text-[10px] font-bold text-emerald-800 uppercase">Entry PIN</div>
                      <div className="font-mono font-extrabold text-lg text-emerald-950">
                        {booking.accessPin}
                      </div>
                    </div>
                  )}

                  <div className="text-right">
                    <div className="text-base font-extrabold text-slate-900">
                      ₹{(booking.pricing.totalAmountPaise / 100).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">Total Paid</div>
                  </div>

                  {isConfirmed && (
                    <button
                      onClick={() => setCancellingBookingId(booking._id)}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition"
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
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800">No Reservations Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ready to find parking or fast EV charging? Search spots in Bangalore, Mumbai, and Delhi.
          </p>
          <Link
            to="/parking"
            className="inline-block bg-emerald-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-sm"
          >
            Find Parking Now
          </Link>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Reservation</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this booking? According to the listing policy, eligible refunds are automatically credited back to your original payment method via Razorpay.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Booked wrong vehicle or time">Booked wrong vehicle or time</option>
                <option value="Found alternative space">Found alternative space</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Keep Booking
              </button>
              <button
                onClick={() => cancelMutation.mutate(cancellingBookingId)}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow"
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
