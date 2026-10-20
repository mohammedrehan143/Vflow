import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingMap } from '../components/maps/ListingMap';
import {
  Car,
  Filter,
  Map as MapIcon,
  Grid,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export const FindParking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>();

  // Filter state
  const [city, setCity] = useState(searchParams.get('city') || 'Bangalore');
  const [isCovered, setIsCovered] = useState<boolean>(false);
  const [instantOnly, setInstantOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(200);

  // Fetch listings
  const { data, isLoading } = useQuery({
    queryKey: ['parkingListings', city, isCovered, instantOnly, maxPrice],
    queryFn: () =>
      api.listings.search({
        serviceType: 'parking',
        city: city || undefined,
        isCovered: isCovered || undefined,
        instantBooking: instantOnly || undefined,
        maxPrice: maxPrice * 100, // paise
      }),
  });

  const listings = data?.listings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-white min-h-screen">
      {/* Title & View Toggle Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider shadow-xs mb-1">
            <Car className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Airbnb for Parking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 mt-1">
            Reserve Parking Spaces in {city}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
            {listings.length} verified parking spots available with digital access
          </p>
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex items-center gap-2">
          <div className="bg-neutral-100 p-1 rounded-xl flex items-center gap-1 border border-neutral-200">
            <button
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
                viewMode === 'split' ? 'bg-black text-yellow-400 shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map & List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition ${
                viewMode === 'grid' ? 'bg-black text-yellow-400 shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-neutral-200 shadow-xs flex flex-wrap items-center gap-3">
        {/* City Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-900">
          <span className="text-neutral-500 font-semibold">City:</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-neutral-900 font-black focus:outline-none cursor-pointer"
          >
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi-NCR">Delhi-NCR</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
          </select>
        </div>

        {/* Max Hourly Rate Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 rounded-xl border border-neutral-300 text-xs">
          <span className="text-neutral-500 font-semibold">Max Rate:</span>
          <span className="font-black text-neutral-900">₹{maxPrice}/hr</span>
          <input
            type="range"
            min="30"
            max="300"
            step="10"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-24 accent-black cursor-pointer"
          />
        </div>

        {/* Covered Toggle */}
        <button
          onClick={() => setIsCovered(!isCovered)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-black transition flex items-center gap-1.5 active:scale-95 ${
            isCovered
              ? 'bg-yellow-400 border-yellow-500 text-black shadow-xs'
              : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${isCovered ? 'text-black stroke-[2.5]' : 'text-neutral-400'}`} />
          <span>Covered Parking Only</span>
        </button>

        {/* Instant Booking Toggle */}
        <button
          onClick={() => setInstantOnly(!instantOnly)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-black transition flex items-center gap-1.5 active:scale-95 ${
            instantOnly
              ? 'bg-yellow-400 border-yellow-500 text-black shadow-xs'
              : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${instantOnly ? 'text-black stroke-[2.5]' : 'text-neutral-400'}`} />
          <span>Instant Bookable</span>
        </button>

        {(isCovered || instantOnly || maxPrice < 200) && (
          <button
            onClick={() => {
              setIsCovered(false);
              setInstantOnly(false);
              setMaxPrice(200);
            }}
            className="text-xs text-neutral-500 hover:text-black font-black flex items-center gap-1 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Listings List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-64 rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((l) => (
                  <ListingCard key={l._id} listing={l} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-xs">
                <Car className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                <h3 className="font-black text-neutral-900">No parking spaces found</h3>
                <p className="text-xs text-neutral-500 mt-1 font-medium">Try relaxing your price or feature filters.</p>
              </div>
            )}
          </div>

          {/* Map View (5 cols sticky) */}
          <div className="lg:col-span-5 h-[650px] sticky top-24">
            <ListingMap
              listings={listings}
              selectedId={selectedListingId}
              onSelectListing={(id) => setSelectedListingId(id)}
            />
          </div>
        </div>
      ) : (
        /* Full Grid Layout */
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-neutral-200 p-8 shadow-xs">
              <Car className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
              <h3 className="font-black text-neutral-900">No parking spaces found</h3>
              <p className="text-xs text-neutral-500 mt-1 font-medium">Try relaxing your price or feature filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
