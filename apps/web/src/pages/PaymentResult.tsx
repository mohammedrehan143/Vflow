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
        <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto"></div>
        <div className="h-6 bg-neutral-200 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  const mapsUrl = listing?.location?.coordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.location.coordinates[1]},${listing.location.coordinates[0]}`
    : '#';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 bg-white min-h-screen text-neutral-900">
      {/* Success Badge & Header */}
      <div className="text-center space-y-3">
        <div className="w-20 h-20 bg-yellow-400 text-black rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Booking Confirmed!</h1>
        <p className="text-sm text-neutral-500 font-medium">
          Your space is reserved and payment has been verified by Razorpay.
        </p>
      </div>

      {/* Booking Pass Card */}
      <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-xl overflow-hidden">
        {/* Pass Top Banner */}
        <div className="bg-neutral-900 p-6 text-white flex justify-between items-center border-b border-neutral-800">
          <div>
            <div className="text-xs uppercase font-black text-yellow-400 tracking-wider">
              Digital Entry Pass
            </div>
            <div className="font-mono text-xl font-black">{booking.bookingNumber}</div>
          </div>
          <div className="text-right">
            <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black uppercase shadow-xs">
              {booking.status}
            </span>
          </div>
        </div>

        {/* Digital Access PIN Highlight */}
        <div className="p-6 bg-yellow-50 border-b border-yellow-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-yellow-400 flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-[11px] font-black text-neutral-900 uppercase">Access Barrier PIN</div>
              <div className="text-xs text-neutral-600 font-medium">Enter this code on the gate keypad</div>
            </div>
          </div>
          <div className="font-mono text-3xl font-black tracking-widest text-black bg-yellow-400 px-5 py-2 rounded-xl border-2 border-black shadow-xs">
            {booking.accessPin || '8492'}
          </div>
        </div>

        {/* Details Table */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <h4 className="font-black text-neutral-900 text-sm mb-1">{listing?.title}</h4>
            <p className="text-neutral-500 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
              <span>{listing?.address?.street}, {listing?.address?.city}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-100">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Arrival Date & Time</span>
              <span className="font-black text-neutral-900 text-xs">
                {new Date(booking.startTime).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase font-bold block">Departure Date & Time</span>
              <span className="font-black text-neutral-900 text-xs">
                {new Date(booking.endTime).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex justify-between items-center text-sm font-black">
            <span className="text-neutral-600">Amount Paid (Inc. GST)</span>
            <span className="text-black bg-yellow-400 px-2 py-0.5 rounded-lg shadow-xs">₹{(booking.pricing.totalAmountPaise / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Actions Footer: Black & Yellow Buttons */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap gap-2.5 justify-between items-center">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 px-4 rounded-xl text-center text-xs shadow-xs border border-yellow-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-4 h-4 stroke-[2.5]" />
            <span>Open in Google Maps</span>
          </a>

          <Link
            to="/bookings"
            className="flex-1 bg-black hover:bg-neutral-800 text-white hover:text-yellow-400 font-black py-3 px-4 rounded-xl text-center text-xs transition active:scale-95 shadow-xs"
          >
            View My Bookings
          </Link>
        </div>
      </div>

      {/* Explore Hangouts callout */}
      <div className="bg-neutral-900 text-white rounded-2xl p-5 flex items-center justify-between gap-4 border border-neutral-800 shadow-sm">
        <div>
          <h4 className="font-black text-sm text-white">Need a coffee while you park?</h4>
          <p className="text-xs text-neutral-400 font-medium">Discover cafes and places within 5 minutes walking distance.</p>
        </div>
        <Link
          to={`/nearby?lat=${listing?.location?.coordinates?.[1]}&lng=${listing?.location?.coordinates?.[0]}`}
          className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-4 py-2.5 rounded-xl shrink-0 flex items-center gap-1.5 transition active:scale-95 shadow-xs"
        >
          <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Explore</span>
        </Link>
      </div>
    </div>
  );
};
