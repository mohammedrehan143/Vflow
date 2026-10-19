import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingMap } from '../components/maps/ListingMap';
import {
  Zap,
  Filter,
  Map as MapIcon,
  Grid,
  CheckCircle2,
  BatteryCharging,
  Sparkles,
  X,
} from 'lucide-react';
import { CONNECTOR_TYPE_LABELS } from '@vflow/shared';

export const FindCharging: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>();

  // Filter state
  const [city, setCity] = useState(searchParams.get('city') || 'Bangalore');
  const [connectorType, setConnectorType] = useState<string>('all');
  const [isCombinedOnly, setIsCombinedOnly] = useState<boolean>(false);

  // Fetch listings
  const { data, isLoading } = useQuery({
    queryKey: ['chargingListings', city, connectorType, isCombinedOnly],
    queryFn: () =>
      api.listings.search({
        serviceType: isCombinedOnly ? 'combined' : 'charging',
        city: city || undefined,
        connectorType: connectorType !== 'all' ? connectorType : undefined,
      }),
  });

  const listings = data?.listings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & View Toggle Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-emerald-600" />
            <span>EV Charging Infrastructure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            EV Charging Stations & Fast Hubs in {city}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover Type-2 AC Wallboxes & CCS2 DC High-Speed Charging Stations
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
            <button
              onClick={() => setViewMode('split')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'split' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map & List</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* City Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
          <span className="text-slate-500">City:</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="Bangalore">Bangalore</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi-NCR">Delhi-NCR</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
          </select>
        </div>

        {/* Connector Type Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
          <span className="text-slate-500">Connector:</span>
          <select
            value={connectorType}
            onChange={(e) => setConnectorType(e.target.value)}
            className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="all">All Connectors</option>
            <option value="Type 2">Type 2 AC (up to 22 kW)</option>
            <option value="CCS2">CCS-2 DC Fast (up to 150 kW)</option>
            <option value="CHAdeMO">CHAdeMO DC Fast</option>
            <option value="15A 3-Pin">15A Domestic 3-Pin</option>
          </select>
        </div>

        {/* Combined Parking + Charging Toggle */}
        <button
          onClick={() => setIsCombinedOnly(!isCombinedOnly)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
            isCombinedOnly
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BatteryCharging className={`w-3.5 h-3.5 ${isCombinedOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
          <span>Reserved Parking + EV Charging Package</span>
        </button>

        {(connectorType !== 'all' || isCombinedOnly) && (
          <button
            onClick={() => {
              setConnectorType('all');
              setIsCombinedOnly(false);
            }}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 ml-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {listings.map((l) => (
                  <ListingCard key={l._id} listing={l} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h3 className="font-bold text-slate-800">No charging stations match your criteria</h3>
                <p className="text-xs text-slate-500 mt-1">Try switching connector type or selecting a different city.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 h-[650px] sticky top-24">
            <ListingMap
              listings={listings}
              selectedId={selectedListingId}
              onSelectListing={(id) => setSelectedListingId(id)}
            />
          </div>
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <ListingCard key={l._id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">No charging stations match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try switching connector type or selecting a different city.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
