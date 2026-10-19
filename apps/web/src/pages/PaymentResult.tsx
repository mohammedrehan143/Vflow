import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  CheckCircle,
  MapPin,
  Calendar,
  KeyRound,
  Download,
  ArrowRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const { data, isLoading } = useQuery({
    queryKey: ['confirmedBooking', bookingId],
    queryFn: () => api.bookings.getById(bookingId!),
    enabled: !!bookingId,
  });

  const booking = data?.booking;
  const listing = data?.listing;

  if (isLoading || !booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-pulse space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full mx-auto"></div>
        <div className="h-6 bg-slate-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  const mapsUrl = listing?.location?.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.location.coordinates[1]},${listing.location.coordinates[0]}`
    : '#';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed!</h1>
        <p className="text-sm text-slate-500">
          Your space is reserved and payment has been verified by Razorpay.
        </p>
      </div>

      {/* Booking Pass Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Pass Top Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex justify-between items-center">
          <div>
            <div className="text-xs uppercase font-bold text-emerald-100 tracking-wider">
              Digital Entry Pass
            </div>
            <div className="font-mono text-xl font-black">{booking.bookingNumber}</div>
          </div>
          <div className="text-right">
            <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase">
              {booking.status}
            </span>
          </div>
        </div>

        {/* Digital Access PIN Highlight */}
        <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase">Access Barrier PIN</div>
              <div className="text-xs text-slate-600">Enter this code on the gate keypad</div>
            </div>
          </div>
          <div className="font-mono text-3xl font-extrabold tracking-widest text-emerald-950 bg-white px-4 py-1.5 rounded-xl border border-emerald-300 shadow-sm">
            {booking.accessPin || '8492'}
          </div>
        </div>

        {/* Details Table */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">{listing?.title}</h4>
            <p className="text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{listing?.address?.street}, {listing?.address?.city}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Arrival Date & Time</span>
              <span className="font-bold text-slate-900 text-xs">
                {new Date(booking.startTime).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Departure Date & Time</span>
              <span className="font-bold text-slate-900 text-xs">
                {new Date(booking.endTime).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-600">Amount Paid (Inc. GST)</span>
            <span className="text-slate-900">₹{(booking.pricing.totalAmountPaise / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-center text-xs shadow transition flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-4 h-4" />
            <span>Open in Google Maps</span>
          </a>

          <Link
            to="/bookings"
            className="flex-1 bg-white hover:bg-slate-100 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-center text-xs border border-slate-200 transition"
          >
            View My Bookings
          </Link>
        </div>
      </div>

      {/* Explore Hangouts callout */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm">Need a coffee while you park?</h4>
          <p className="text-xs text-slate-400">Discover cafes and places within 5 minutes walking distance.</p>
        </div>
        <Link
          to={`/nearby?lat=${listing?.location?.coordinates?.[1]}&lng=${listing?.location?.coordinates?.[0]}`}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shrink-0 flex items-center gap-1"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Explore</span>
        </Link>
      </div>
    </div>
  );
};
