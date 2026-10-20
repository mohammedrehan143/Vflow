import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Car,
  Zap,
  TrendingUp,
  CreditCard,
  Plus,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'reservations'>('overview');

  // Fetch full dashboard overview from canonical provider
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['providerDashboardOverview'],
    queryFn: () => api.provider.getDashboardOverview(),
  });

  // Fetch resources directly for real-time management
  const { data: resourcesData, refetch: refetchResources } = useQuery({
    queryKey: ['providerResources'],
    queryFn: () => api.provider.getResources(),
  });

  const overview = dashboardData?.overview;
  const provider = overview?.provider;
  const resources = overview?.resources || resourcesData?.resources;
  const bookings = overview?.bookings;
  const financials = overview?.financials;

  // Toggle Space Status Mutation
  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.provider.updateSpace(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerResources'] });
      queryClient.invalidateQueries({ queryKey: ['providerDashboardOverview'] });
    },
  });

  // Toggle Port Status Mutation
  const updatePortMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.provider.updatePort(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerResources'] });
      queryClient.invalidateQueries({ queryKey: ['providerDashboardOverview'] });
    },
  });

  const grossRupees = financials ? (financials.grossRevenue / 100).toFixed(2) : '0.00';
  const commissionRupees = financials ? (financials.platformCommission / 100).toFixed(2) : '0.00';
  const refundsRupees = financials ? (financials.refundTotal / 100).toFixed(2) : '0.00';
  const netRupees = financials ? (financials.netEarnings / 100).toFixed(2) : '0.00';
  const pendingPayoutRupees = financials ? (financials.pendingPayoutAmount / 100).toFixed(2) : '0.00';
  const paidOutRupees = financials ? (financials.paidOutAmount / 100).toFixed(2) : '0.00';

  const upcomingBookings = bookings?.upcoming || [];
  const completedBookings = bookings?.completedList || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen text-neutral-900">
      {/* Header with Host Info & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 bg-yellow-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
            <LayoutDashboard className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Canonical Provider Command Center</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-900 mt-1">
            {provider?.displayName || user?.fullName || 'Host Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
            Single canonical provider profile managing all parking bays, EV charging stations, and daily payouts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              refetch();
              refetchResources();
            }}
            className="p-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/provider/payouts"
            className="bg-black hover:bg-neutral-800 text-yellow-400 text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            <CreditCard className="w-4 h-4 stroke-[2.5]" />
            <span>Next-Day Payouts Ledger</span>
          </Link>
          <Link
            to="/provider/listings/new"
            className="bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-xs border border-yellow-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>List Space / Charger</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-neutral-100 rounded-2xl w-fit border border-neutral-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-black text-yellow-400 shadow-xs' : 'text-neutral-600 hover:text-black'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Financials & Summary</span>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'resources' ? 'bg-black text-yellow-400 shadow-xs' : 'text-neutral-600 hover:text-black'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>Bays & Chargers ({resources?.spaces?.length || 0} bays · {resources?.ports?.length || 0} ports)</span>
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
            activeTab === 'reservations' ? 'bg-black text-yellow-400 shadow-xs' : 'text-neutral-600 hover:text-black'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Reservations ({upcomingBookings.length} active)</span>
        </button>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-black uppercase">
            <span>Net Earnings</span>
            <span className="p-1.5 rounded-lg bg-yellow-400 text-black shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">₹{netRupees}</div>
          <div className="text-[11px] text-neutral-500 font-semibold">
            Gross: ₹{grossRupees} · VFlow (10%): ₹{commissionRupees}
          </div>
        </div>

        {/* Next-Day Settlement Queue */}
        <div className="bg-yellow-50/90 p-5 rounded-3xl border-2 border-yellow-300 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-900 font-black uppercase">
            <span>Pending Next-Day Payout</span>
            <span className="p-1.5 rounded-lg bg-yellow-400 text-black shadow-xs">
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">₹{pendingPayoutRupees}</div>
          <div className="text-[11px] text-neutral-700 font-bold">
            Settled next calendar day (18:30 UTC cutoff)
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-black uppercase">
            <span>Parking Reservations</span>
            <span className="p-1.5 rounded-lg bg-neutral-100 text-neutral-900">
              <Car className="w-4 h-4 stroke-[2.5]" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">{provider?.totalParkingBookings || 0}</div>
          <div className="text-[11px] text-neutral-500 font-semibold">
            Total completed: {provider?.totalCompletedBookings || 0}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-500 font-black uppercase">
            <span>EV Charging Sessions</span>
            <span className="p-1.5 rounded-lg bg-yellow-400 text-black">
              <Zap className="w-4 h-4 fill-black stroke-black" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-neutral-900">{provider?.totalChargingSessions || 0}</div>
          <div className="text-[11px] text-neutral-500 font-semibold">
            AC & DC high-voltage sessions
          </div>
        </div>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Listings Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-neutral-900">Active Listings</h2>
              <Link to="/provider/listings/new" className="text-xs font-black text-black hover:underline">
                + Add Listing
              </Link>
            </div>

            {overview?.listings && overview.listings.length > 0 ? (
              <div className="space-y-3">
                {overview.listings.map((l: any) => (
                  <div
                    key={l._id}
                    className="bg-white p-4 rounded-2xl border-2 border-neutral-200 shadow-xs flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={l.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200'}
                        alt="Thumbnail"
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                            {l.serviceType}
                          </span>
                          <span className="text-xs text-neutral-500 font-semibold">{l.address?.city}</span>
                        </div>
                        <h4 className="font-black text-neutral-900 text-sm mt-0.5 line-clamp-1">{l.title}</h4>
                        <div className="text-xs text-neutral-600 font-bold mt-0.5">
                          ₹{(l.pricing?.hourlyRatePaise / 100).toFixed(0)}/hr
                          {l.pricing?.chargingRatePerKwhPaise && (
                            <span className="text-amber-600">
                              {' '}· ₹{(l.pricing.chargingRatePerKwhPaise / 100).toFixed(0)}/kWh
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/listings/${l._id}`}
                        className="p-2 text-neutral-400 hover:text-black rounded-lg transition"
                        title="View Public Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-neutral-50 p-8 rounded-3xl border-2 border-dashed border-neutral-200 text-center space-y-3">
                <Car className="w-8 h-8 text-neutral-300 mx-auto" />
                <h4 className="font-black text-neutral-900 text-sm">No Active Listings Created Yet</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
                  Create your first parking bay or high-voltage EV charging listing to start earning daily.
                </p>
                <Link
                  to="/provider/listings/new"
                  className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-4 py-2 rounded-xl transition shadow-xs"
                >
                  Create Listing Now
                </Link>
              </div>
            )}
          </div>

          {/* Quick Payouts Summary */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border-2 border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-neutral-900 text-base">Next-Day Settlement Details</h3>
              <Link to="/provider/payouts" className="text-xs font-black text-black hover:underline">
                View Ledger
              </Link>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-semibold">Account Status:</span>
                <span className="font-black text-black bg-yellow-400 px-2 py-0.5 rounded uppercase text-[10px]">
                  {provider?.payoutAccountStatus || 'Active'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-semibold">Account Holder:</span>
                <span className="font-bold text-neutral-900">
                  {provider?.payoutConfiguration?.accountHolderName || provider?.displayName || 'Primary Host'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-semibold">Disbursement Target:</span>
                <span className="font-mono font-bold text-neutral-800">
                  {provider?.payoutConfiguration?.bankAccountNumber
                    ? `••••${provider.payoutConfiguration.bankAccountNumber.slice(-4)}`
                    : provider?.payoutConfiguration?.upiId || 'Direct Bank Settlement'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-semibold">Settlement Rule:</span>
                <span className="font-bold text-neutral-900">Next Calendar Day Automated</span>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-300 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-neutral-900">
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>Next-Day Payout Guarantee</span>
              </div>
              <p className="text-neutral-700 font-medium text-[11px] leading-relaxed">
                Bookings completed before 18:30 UTC are automatically transferred to your registered bank account on the very next calendar day.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Resources Management */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Parking Spaces Management */}
          <div className="bg-white rounded-3xl border-2 border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-neutral-900" />
                  <span>Physical Parking Spaces</span>
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Toggle availability when maintenance or private use is required.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {(resources?.spaces || []).map((space: any) => (
                <div
                  key={space._id}
                  className="p-4 rounded-2xl border-2 border-neutral-200 bg-neutral-50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-neutral-900">{space.spaceIdentifier}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        space.status === 'available'
                          ? 'bg-yellow-400 text-black shadow-xs'
                          : 'bg-neutral-800 text-yellow-400'
                      }`}
                    >
                      {space.status}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 space-y-1 font-medium">
                    <div>Roof: {space.isCovered ? 'Covered Roof' : 'Open Air'}</div>
                    {space.attachedChargingPortId && (
                      <div className="text-neutral-900 font-bold">⚡ Linked to EV Charging Port</div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      updateSpaceMutation.mutate({
                        id: space._id,
                        status: space.status === 'available' ? 'maintenance' : 'available',
                      })
                    }
                    className="w-full text-xs font-black py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-900 transition shadow-xs"
                  >
                    {space.status === 'available' ? 'Mark Maintenance' : 'Mark Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* EV Charging Ports & Stations Management */}
          <div className="bg-white rounded-3xl border-2 border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 fill-black stroke-black" />
                  <span>Individual Charging Stations & Ports</span>
                </h3>
                <p className="text-xs text-neutral-500 font-medium">
                  Each physical port is an independently bookable resource. Overbooking is strictly prevented.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {(resources?.ports || []).map((port: any) => (
                <div
                  key={port._id}
                  className="p-4 rounded-2xl border-2 border-neutral-200 bg-yellow-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-neutral-900">{port.portIdentifier}</span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        port.status === 'available'
                          ? 'bg-yellow-400 text-black shadow-xs'
                          : port.status === 'charging'
                          ? 'bg-black text-yellow-400'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      {port.status}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-700 space-y-1 font-medium">
                    <div className="font-black text-neutral-900">
                      {port.powerKw} kW • {port.connectorType} ({port.chargerType})
                    </div>
                    <div>Rate: ₹{(port.pricePerUnitPaise / 100).toFixed(0)}/unit</div>
                  </div>

                  <button
                    onClick={() =>
                      updatePortMutation.mutate({
                        id: port._id,
                        status: port.status === 'available' ? 'maintenance' : 'available',
                      })
                    }
                    className="w-full text-xs font-black py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-100 text-neutral-900 transition shadow-xs"
                  >
                    {port.status === 'available' ? 'Mark Offline' : 'Mark Operational'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Reservations */}
      {activeTab === 'reservations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Upcoming Reservations */}
          <div className="bg-white rounded-3xl border-2 border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Active & Upcoming Reservations</span>
              </h3>
              <span className="text-xs bg-yellow-400 text-black font-black px-2.5 py-0.5 rounded-full">
                {upcomingBookings.length} Active
              </span>
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((b: any) => (
                  <div key={b._id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-black text-neutral-900">#{b.bookingNumber}</span>
                      <span className="font-black text-black bg-yellow-400 px-2 py-0.5 rounded text-[10px] uppercase">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">
                      <div>Driver: <span className="font-bold text-neutral-900">{b.customer?.fullName || 'Registered User'}</span></div>
                      <div>Vehicle: <span className="font-bold text-neutral-900">{b.vehicleDetails?.model || 'EV'}</span></div>
                      <div className="text-[11px] text-neutral-400">
                        {new Date(b.startTime).toLocaleTimeString([], { timeStyle: 'short' })} - {new Date(b.endTime).toLocaleTimeString([], { timeStyle: 'short' })}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-bold">Provider Share:</span>
                      <span className="font-black text-neutral-900 text-sm">₹{(b.pricing?.providerSharePaise / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-neutral-500 font-medium">No upcoming reservations right now.</div>
            )}
          </div>

          {/* Completed Reservations */}
          <div className="bg-white rounded-3xl border-2 border-neutral-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-neutral-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Completed Reservations</span>
              </h3>
              <span className="text-xs bg-black text-white font-black px-2.5 py-0.5 rounded-full">
                {completedBookings.length} Completed
              </span>
            </div>

            {completedBookings.length > 0 ? (
              <div className="space-y-3">
                {completedBookings.map((b: any) => (
                  <div key={b._id} className="p-3.5 rounded-2xl bg-white border border-neutral-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-black text-neutral-700">#{b.bookingNumber}</span>
                      <span className="font-black text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                        Completed
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">
                      <div>Vehicle: <span className="font-bold text-neutral-900">{b.vehicleDetails?.model || 'EV'}</span></div>
                      <div className="text-[11px] text-neutral-400">
                        {new Date(b.endTime).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-xs">
                      <span className="text-neutral-500 font-bold">Settled Share:</span>
                      <span className="font-black text-neutral-900">₹{(b.pricing?.providerSharePaise / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-neutral-500 font-medium">No completed reservations logged yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
