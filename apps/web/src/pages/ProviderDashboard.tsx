import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Settings,
  BatteryCharging,
  Layers,
  RefreshCw,
  Power,
  RotateCcw,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header with Host Info & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <LayoutDashboard className="w-4 h-4" />
            <span>Canonical Provider Command Center</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-1">
            {provider?.displayName || user?.fullName || 'Host Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Single canonical provider profile managing all parking bays, EV charging stations, and daily payouts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              refetch();
              refetchResources();
            }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/provider/payouts"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Next-Day Payouts Ledger</span>
          </Link>
          <Link
            to="/provider/listings/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>List New Space / Charger</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Financials & Summary</span>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'resources' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Resource Management ({resources?.totalParkingSpaces || 0} spaces · {resources?.totalChargingPorts || 0} ports)</span>
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'reservations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Reservations ({upcomingBookings.length} upcoming · {completedBookings.length} completed)</span>
        </button>
      </div>

      {/* Primary Financial & Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Net Earnings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Net Earnings</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">₹{netRupees}</div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>Gross: ₹{grossRupees}</span>
            <span>Fee: -₹{commissionRupees}</span>
          </div>
          {parseFloat(refundsRupees) > 0 && (
            <div className="text-[11px] text-red-600 font-semibold">Refunds debited: -₹{refundsRupees}</div>
          )}
        </div>

        {/* Metric 2: Pending Next-Day Payout */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-900 font-bold uppercase">
            <span>Pending Next-Day Payout</span>
            <span className="p-1.5 rounded-lg bg-white text-emerald-700 shadow-sm">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950">₹{pendingPayoutRupees}</div>
          <div className="text-[11px] text-emerald-800 font-medium">
            Next settlement transfer queued · Transferred to date: ₹{paidOutRupees}
          </div>
        </div>

        {/* Metric 3: Parking Resources & Bookings */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Parking Spaces & Bookings</span>
            <span className="p-1.5 rounded-lg bg-slate-50 text-slate-700">
              <Car className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {resources?.totalParkingSpaces || 0} <span className="text-sm font-normal text-slate-400">bays</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {bookings?.totalParkingBookings ?? 0} total reservations booked
          </div>
        </div>

        {/* Metric 4: EV Stations & Charging Sessions */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>EV Stations & Ports</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Zap className="w-4 h-4 fill-teal-700" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-950">
            {resources?.totalChargingPorts || 0} <span className="text-sm font-normal text-teal-600">ports</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {resources?.totalChargingStations || 0} stations · {bookings?.totalChargingSessions ?? 0} charging sessions
          </div>
        </div>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Listings Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Active Listings</h2>
              <Link to="/provider/listings/new" className="text-xs font-semibold text-emerald-700 hover:underline">
                + Add Listing
              </Link>
            </div>

            {resources?.listings && resources.listings.length > 0 ? (
              <div className="space-y-3">
                {resources.listings.map((l: any) => (
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
                          <span className="text-xs text-slate-400">{l.address?.city}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">{l.title}</h4>
                        <div className="text-xs text-slate-500 font-semibold mt-0.5">
                          ₹{(l.pricing?.hourlyRatePaise / 100).toFixed(0)}/hr
                          {l.pricing?.chargingRatePerKwhPaise && (
                            <span className="text-emerald-700">
                              {' '}· ₹{(l.pricing.chargingRatePerKwhPaise / 100).toFixed(0)}/kWh
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/listings/${l._id}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition"
                    >
                      View Live
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Building className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Listings Yet</h4>
                <p className="text-xs text-slate-500">Publish your parking space or EV charger to start receiving bookings.</p>
                <Link
                  to="/provider/listings/new"
                  className="inline-block bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl mt-2"
                >
                  Create Listing
                </Link>
              </div>
            )}
          </div>

          {/* Quick Payouts & Settlement Overview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Payout Status Breakdown</h2>
              <Link to="/provider/payouts" className="text-xs font-semibold text-emerald-700 hover:underline">
                Full Ledger →
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-semibold">Completed Transfers</span>
                <span className="font-bold text-emerald-700">₹{paidOutRupees}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-semibold">Pending Next-Day</span>
                <span className="font-bold text-slate-900">₹{pendingPayoutRupees}</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                <span className="text-slate-600 font-semibold">Refunds Processed</span>
                <span className="font-bold text-red-600">₹{refundsRupees}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Next-Day Payout Guarantee</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  All confirmed bookings are calculated in integer paise and settled directly to your bank account or UPI every calendar day.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Resource Management (Bays, Stations & Ports) */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {/* Parking Spaces Management */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Car className="w-5 h-5 text-emerald-600" />
                  <span>Individual Parking Spaces & Bays</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Manage availability status for each individual parking slot to prevent overbooking.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {(resources?.parkingSpaces || []).map((space: any) => (
                <div
                  key={space._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{space.spaceIdentifier}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        space.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {space.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div>Roof: {space.isCovered ? 'Covered Roof' : 'Open Air'}</div>
                    {space.attachedChargingPortId && (
                      <div className="text-emerald-700 font-semibold">⚡ Linked to EV Charging Port</div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      updateSpaceMutation.mutate({
                        id: space._id,
                        status: space.status === 'available' ? 'maintenance' : 'available',
                      })
                    }
                    className="w-full text-xs font-bold py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
                  >
                    {space.status === 'available' ? 'Mark Maintenance' : 'Mark Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* EV Charging Ports & Stations Management */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                  <span>Individual Charging Stations & Ports</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Each physical port is an independently bookable resource. Overbooking is strictly prevented.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {(resources?.chargingPorts || []).map((port: any) => (
                <div
                  key={port._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-emerald-50/30 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{port.portIdentifier}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        port.status === 'available'
                          ? 'bg-emerald-100 text-emerald-800'
                          : port.status === 'charging'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {port.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-emerald-900">
                      {port.powerKw} kW {port.chargerType} · {port.connectorType}
                    </div>
                    <div>Rate: ₹{(port.pricePerUnitPaise / 100).toFixed(0)} / {port.pricingModel === 'per_kwh' ? 'kWh' : 'unit'}</div>
                    {port.isParkingIncluded && (
                      <div className="text-emerald-700 text-[11px] font-semibold">✓ Parking included</div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      updatePortMutation.mutate({
                        id: port._id,
                        status: port.status === 'available' ? 'maintenance' : 'available',
                      })
                    }
                    className="w-full text-xs font-bold py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition"
                  >
                    {port.status === 'available' ? 'Take Offline' : 'Set Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Upcoming & Completed Reservations */}
      {activeTab === 'reservations' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Upcoming Reservations */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Upcoming Reservations</span>
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {upcomingBookings.length} Active
              </span>
            </div>

            {upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {upcomingBookings.map((b: any) => (
                  <div key={b._id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-800">#{b.bookingNumber}</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {b.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div>Driver Vehicle: <span className="font-semibold text-slate-900">{b.vehicleDetails?.model || 'Standard EV'} ({b.vehicleDetails?.licensePlate || 'N/A'})</span></div>
                      <div>Service: <span className="capitalize font-semibold">{b.serviceType}</span> · PIN: <span className="font-mono font-bold text-emerald-800">{b.accessPin}</span></div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {new Date(b.startTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })} → {new Date(b.endTime).toLocaleString('en-IN', { timeStyle: 'short' })}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Provider Share:</span>
                      <span className="font-bold text-emerald-800">₹{(b.pricing?.providerSharePaise / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">No upcoming reservations right now.</div>
            )}
          </div>

          {/* Completed Reservations */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed Reservations</span>
              </h3>
              <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded-full">
                {completedBookings.length} Completed
              </span>
            </div>

            {completedBookings.length > 0 ? (
              <div className="space-y-3">
                {completedBookings.map((b: any) => (
                  <div key={b._id} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-slate-700">#{b.bookingNumber}</span>
                      <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        Completed
                      </span>
                    </div>
                    <div className="text-xs text-slate-600">
                      <div>Vehicle: <span className="font-medium text-slate-800">{b.vehicleDetails?.model || 'EV'}</span></div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(b.endTime).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Settled Share:</span>
                      <span className="font-bold text-slate-900">₹{(b.pricing?.providerSharePaise / 100).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">No completed reservations logged yet.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
