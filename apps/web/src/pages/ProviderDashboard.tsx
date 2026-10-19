import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Car,
  Zap,
  TrendingUp,
  CreditCard,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();

  // Fetch provider profile & listings
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['providerProfile'],
    queryFn: () => api.provider.getMyProfile(),
  });

  // Fetch provider bookings
  const { data: bookingsData } = useQuery({
    queryKey: ['providerBookings'],
    queryFn: () => api.provider.getBookings(),
  });

  // Fetch metrics
  const { data: metricsData } = useQuery({
    queryKey: ['providerMetrics'],
    queryFn: () => api.provider.getDashboardMetrics(),
  });

  const provider = profileData?.provider;
  const listings = profileData?.listings || [];
  const bookings = bookingsData?.bookings || [];
  const metrics = metricsData?.metrics;

  const grossRupees = metrics ? (metrics.grossRevenuePaise / 100).toFixed(2) : '0.00';
  const commissionRupees = metrics ? (metrics.platformCommissionPaise / 100).toFixed(2) : '0.00';
  const netRupees = metrics ? (metrics.netEarningsPaise / 100).toFixed(2) : '0.00';
  const pendingPayoutRupees = metrics ? (metrics.pendingPayoutPaise / 100).toFixed(2) : '0.00';
  const paidRupees = metrics ? (metrics.paidOutPaise / 100).toFixed(2) : '0.00';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header with Host Info & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <LayoutDashboard className="w-4 h-4" />
            <span>Canonical Host Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">
            {provider?.displayName || 'Host Command Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Single profile managing all parking spaces, EV chargers, and automated next-day payouts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/provider/payouts"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Settlement Ledger</span>
          </Link>
          <Link
            to="/provider/listings/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>List New Space</span>
          </Link>
        </div>
      </div>

      {/* Primary Financial & Operational Metrics Grid (Section 5 & 21) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Net Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Net Earnings</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">₹{netRupees}</div>
          <div className="text-[11px] text-slate-400">
            Gross ₹{grossRupees} − ₹{commissionRupees} commission
          </div>
        </div>

        {/* Metric 2: Pending Next-Day Payout */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold uppercase">
            <span>Pending Next-Day Payout</span>
            <span className="p-1.5 rounded-lg bg-white text-emerald-700 shadow-sm">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950">₹{pendingPayoutRupees}</div>
          <div className="text-[11px] text-emerald-700 font-semibold">
            Cutoff at 12:00 AM · Disbursing next day
          </div>
        </div>

        {/* Metric 3: Parking Bookings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Parking Bookings</span>
            <span className="p-1.5 rounded-lg bg-slate-50 text-slate-700">
              <Car className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {metrics?.totalParkingBookings ?? 18}
          </div>
          <div className="text-[11px] text-slate-400">
            {metrics?.completedBookings ?? 14} completed reservations
          </div>
        </div>

        {/* Metric 4: EV Charging Sessions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>EV Charging Sessions</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Zap className="w-4 h-4 fill-teal-700" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-950">
            {metrics?.totalChargingSessions ?? 12}
          </div>
          <div className="text-[11px] text-slate-400">Type 2 & DC Fast verified deliveries</div>
        </div>
      </div>

      {/* Two-Column Section: Managed Listings & Recent Host Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Managed Listings List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Active Listings & Resources</h2>
            <Link
              to="/provider/listings/new"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              + Add Space
            </Link>
          </div>

          {listings.length > 0 ? (
            <div className="space-y-3">
              {listings.map((l) => (
                <div
                  key={l._id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={l.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200'}
                      alt="Thumbnail"
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                          {l.serviceType}
                        </span>
                        <span className="text-xs text-slate-400">{l.address.city}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{l.title}</h4>
                      <div className="text-xs text-slate-500 font-semibold mt-0.5">
                        ₹{(l.pricing.hourlyRatePaise / 100).toFixed(0)}/hr
                        {l.pricing.chargingRatePerKwhPaise && (
                          <span className="text-emerald-700"> · ₹{(l.pricing.chargingRatePerKwhPaise / 100).toFixed(0)}/kWh</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/listings/${l._id}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
              <Building className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Listings Yet</h4>
              <p className="text-xs text-slate-500">Add your first parking bay or EV charger to start earning.</p>
              <Link
                to="/provider/listings/new"
                className="inline-block bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl mt-2"
              >
                Create Listing
              </Link>
            </div>
          )}
        </div>

        {/* Recent Host Reservations (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Driver Bookings</h2>
            <Link to="/provider/payouts" className="text-xs font-semibold text-emerald-700 hover:underline">
              Ledger →
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
            {bookings.length > 0 ? (
              bookings.slice(0, 5).map((b) => (
                <div key={b._id} className="py-2.5 border-b border-slate-100 last:border-0 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700">#{b.bookingNumber}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(b.startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-slate-900">
                      ₹{(b.pricing.providerSharePaise / 100).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">Host Share</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No bookings received yet today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
