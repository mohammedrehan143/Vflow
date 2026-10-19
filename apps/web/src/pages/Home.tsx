import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ListingCard } from '../components/listings/ListingCard';
import {
  Car,
  Zap,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Compass,
  CheckCircle,
  Building,
  TrendingUp,
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'parking' | 'charging' | 'combined'>('parking');
  const [city, setCity] = useState('Bangalore');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Fetch featured listings
  const { data: listingsData, isLoading } = useQuery({
    queryKey: ['featuredListings'],
    queryFn: () => api.listings.search({}),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      serviceType: activeTab,
      city,
    });
    if (activeTab === 'parking') {
      navigate(`/parking?${query.toString()}`);
    } else {
      navigate(`/charging?${query.toString()}`);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background glow & pattern */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Urban Mobility & Clean Energy Infrastructure
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Find parking. Charge your EV.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Explore what's nearby.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Reserve verified private and commercial parking spaces with fast EV charging wallboxes. Powered by Razorpay secure payments and guaranteed next-day host settlements.
          </p>

          {/* Search Box Widget */}
          <div className="pt-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-2xl text-slate-900 border border-slate-100">
              {/* Service Tab Switcher */}
              <div className="flex items-center gap-2 mb-3 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('parking')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'parking'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-4 h-4 text-emerald-600" />
                  <span>Reserve Parking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('charging')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'charging'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>Find EV Charging</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('combined')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'combined'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🅿️+⚡ Combined</span>
                </button>
              </div>

              {/* Input Fields */}
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-left w-full">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">City / Area</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer"
                    >
                      <option value="Bangalore">Bangalore (Indiranagar, Koramangala)</option>
                      <option value="Mumbai">Mumbai (BKC, Andheri, Lower Parel)</option>
                      <option value="Delhi-NCR">Delhi-NCR (Connaught Place, Cyber City)</option>
                      <option value="Hyderabad">Hyderabad (Hitec City, Gachibowli)</option>
                      <option value="Pune">Pune (Koregaon Park, Hinjewadi)</option>
                    </select>
                  </div>
                </div>

                <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="text-left w-full">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Date & Timing</label>
                    <input
                      type="text"
                      placeholder="Today · Anytime"
                      className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-emerald-600/30 transition text-sm"
                >
                  <span>Search Spaces</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              Verified Marketplace Listings
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Popular Spaces & Fast Charging Hubs
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Instant Airbnb-style reservations with live confirmation and digital PIN access
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/parking"
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
            >
              All Parking
            </Link>
            <Link
              to="/charging"
              className="text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition"
            >
              All EV Chargers
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : listingsData?.listings && listingsData.listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listingsData.listings.slice(0, 6).map((listing) => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">Ready for Live Bookings</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Explore parking and EV charging spaces in Bangalore and top metropolitan areas.
            </p>
            <Link
              to="/parking"
              className="inline-block bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              Browse Parking Directory
            </Link>
          </div>
        )}
      </section>

      {/* Destination Discovery Teaser (Section 11) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              Nearby Hangout Engine
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Turn waiting time into leisure time.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              While your vehicle is parked or rapidly charging, VFlow automatically discovers artisanal cafes, restaurants, shopping malls, gaming arcades, and tranquil parks within walking distance.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/nearby"
                className="bg-white text-emerald-950 font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition text-sm inline-flex items-center gap-2 shadow"
              >
                <span>Discover Nearby Hangouts</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Valet Section — Section 12 Coming Soon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/50 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase tracking-wider border border-amber-200">
              <span>🚀 Valet Mobility — Coming Soon</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Doorstep Valet Parking & EV Charging Concierge
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Never circle for parking or wait at chargers again. Our upcoming vetted valet specialists will safely park and fast-charge your vehicle while you work or dine.
            </p>
            <p className="text-xs text-amber-800 font-medium">
              * Note: Valet bookings and payments are currently disabled while we onboard partner venues. Join the priority waitlist for early invite access.
            </p>
          </div>

          <Link
            to="/valet"
            className="shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-md transition text-sm flex items-center gap-2"
          >
            <span>Join Valet Waitlist</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Provider Call to Action — Section 9 & 21 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" />
              For Space Owners & Charging Operators
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Monetize your unused driveway, garage, or EV charger.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              List individual parking slots or commercial EV chargers. Enjoy guaranteed <strong>next-day settlements</strong> directly to your bank account or UPI ID with automated transparent ledger reporting.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Single canonical host dashboard for parking spaces and charging ports</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Next-day calendar settlement cutoff with complete transaction audit logs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Set your own rates, availability schedules, and vehicle restrictions</span>
              </li>
            </ul>

            <div className="pt-4 flex flex-wrap gap-3">
              <Link
                to="/become-a-host"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow transition text-sm inline-flex items-center gap-2"
              >
                <span>Become a VFlow Host</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/provider/payouts"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-xl transition text-sm"
              >
                Learn About Payouts
              </Link>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Host Next-Day Settlement Simulation
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-700">
                <span className="text-slate-300">Customer Reservation Payment</span>
                <span className="font-bold text-white">₹500.00</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-slate-700">
                <span className="text-slate-300">VFlow Platform Commission (10%)</span>
                <span className="font-bold text-emerald-400">-₹50.00</span>
              </div>
              <div className="flex justify-between items-center text-base py-2 font-bold">
                <span className="text-white">Host Net Payable Earnings</span>
                <span className="text-emerald-400 text-lg">₹450.00</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-xl text-xs text-slate-400 flex items-center justify-between">
                <span>Settlement Target:</span>
                <span className="font-semibold text-white">Next Calendar Day 12:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
