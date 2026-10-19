import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ListingCard } from '../components/listings/ListingCard';
import { ListingMap } from '../components/maps/ListingMap';
import { IVehicle, ConnectorType, CONNECTOR_TYPE_LABELS } from '@vflow/shared';
import {
  Zap,
  Filter,
  Map as MapIcon,
  Grid,
  CheckCircle2,
  BatteryCharging,
  Sparkles,
  X,
  Car,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  Info,
} from 'lucide-react';

export const FindCharging: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('split');
  const [selectedListingId, setSelectedListingId] = useState<string | undefined>();

  // Filter state
  const [city, setCity] = useState(searchParams.get('city') || 'Bangalore');
  const [chargerType, setChargerType] = useState<string>('all'); // all | AC | DC
  const [connectorType, setConnectorType] = useState<string>('all');
  const [minPowerKw, setMinPowerKw] = useState<string>('all');
  const [speedCategory, setSpeedCategory] = useState<string>('all'); // all | slow | fast | rapid
  const [isParkingIncluded, setIsParkingIncluded] = useState<boolean | undefined>(undefined);
  const [isCombinedOnly, setIsCombinedOnly] = useState<boolean>(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Customer vehicles
  const [customerVehicles, setCustomerVehicles] = useState<IVehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('none');

  useEffect(() => {
    async function loadVehicles() {
      if (isAuthenticated) {
        try {
          const res = await api.vehicles.list();
          if (res.success && res.vehicles) {
            setCustomerVehicles(res.vehicles);
            const defaultVehicle = res.vehicles.find((v) => v.isDefault) || res.vehicles[0];
            if (defaultVehicle) {
              setSelectedVehicleId(defaultVehicle._id);
            }
          }
        } catch (e) {
          console.error('Failed to load user vehicles', e);
        }
      }
    }
    loadVehicles();
  }, [isAuthenticated]);

  const activeVehicle = customerVehicles.find((v) => v._id === selectedVehicleId);

  // Fetch listings
  const { data, isLoading } = useQuery({
    queryKey: [
      'chargingListings',
      city,
      chargerType,
      connectorType,
      minPowerKw,
      speedCategory,
      isParkingIncluded,
      isCombinedOnly,
      selectedVehicleId,
    ],
    queryFn: () =>
      api.listings.search({
        serviceType: isCombinedOnly ? 'combined' : 'charging',
        city: city || undefined,
        chargerType: chargerType !== 'all' ? chargerType : undefined,
        connectorType: connectorType !== 'all' ? connectorType : undefined,
        minPowerKw: minPowerKw !== 'all' ? Number(minPowerKw) : undefined,
        speedCategory: speedCategory !== 'all' ? speedCategory : undefined,
        isParkingIncluded: isParkingIncluded,
        vehicleId: selectedVehicleId !== 'none' ? selectedVehicleId : undefined,
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
            <span>EV Charging Infrastructure & Compatibility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            EV Charging Stations & Fast Hubs in {city}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover verified AC Wallboxes (up to 22 kW) & DC High-Speed Hubs (up to 240 kW) with real-time port availability
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

      {/* Customer Vehicle Compatibility Bar */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Compatibility Filter Active
            </div>
            <div className="text-sm font-semibold text-white">
              {activeVehicle
                ? `${activeVehicle.manufacturer} ${activeVehicle.model} (${activeVehicle.powertrain})`
                : 'No vehicle selected — showing all public chargers'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                <option value="none" className="text-slate-900">
                  Select a Vehicle...
                </option>
                {customerVehicles.map((v) => (
                  <option key={v._id} value={v._id} className="text-slate-900">
                    {v.manufacturer} {v.model} {v.isDefault ? '★' : ''}
                  </option>
                ))}
              </select>
              <Link
                to="/vehicles"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
              >
                Manage Vehicles
              </Link>
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              Sign In to Filter by Vehicle
            </Link>
          )}
        </div>
      </div>

      {/* Primary Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
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
              <option value="Chennai">Chennai</option>
            </select>
          </div>

          {/* AC / DC Toggle */}
          <div className="flex p-0.5 bg-slate-100 rounded-xl">
            <button
              onClick={() => setChargerType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                chargerType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setChargerType('AC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                chargerType === 'AC' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              ⚡ AC Wallboxes
            </button>
            <button
              onClick={() => setChargerType('DC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                chargerType === 'DC' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              🚀 DC Fast
            </button>
          </div>

          {/* Speed Category */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
            <span className="text-slate-500">Speed:</span>
            <select
              value={speedCategory}
              onChange={(e) => setSpeedCategory(e.target.value)}
              className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Speeds</option>
              <option value="slow">Standard (&lt;11 kW)</option>
              <option value="fast">Fast (11–50 kW)</option>
              <option value="rapid">Rapid / Ultra (&gt;50 kW)</option>
            </select>
          </div>

          {/* Connector Filter */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
            <span className="text-slate-500">Connector:</span>
            <select
              value={connectorType}
              onChange={(e) => setConnectorType(e.target.value)}
              className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="all">All Inlets</option>
              <option value="Type 2">Type 2 AC (up to 22 kW)</option>
              <option value="CCS2">CCS-2 DC Fast</option>
              <option value="CHAdeMO">CHAdeMO DC</option>
              <option value="Bharat AC-001">Bharat AC-001</option>
              <option value="Bharat DC-001">Bharat DC-001</option>
              <option value="15A_3Pin">15A Domestic 3-Pin</option>
            </select>
          </div>

          {/* Parking Included Filter */}
          <button
            onClick={() => setIsParkingIncluded(isParkingIncluded ? undefined : true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              isParkingIncluded
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isParkingIncluded ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span>Parking Included</span>
          </button>

          {/* Advanced toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 ml-auto font-semibold px-2 py-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showAdvancedFilters ? 'Fewer Filters' : 'More Filters'}</span>
          </button>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-in fade-in">
            {/* Min Power in kW */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold">
              <span className="text-slate-500">Min Power:</span>
              <select
                value={minPowerKw}
                onChange={(e) => setMinPowerKw(e.target.value)}
                className="bg-transparent text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="all">Any Power (kW)</option>
                <option value="3.3">3.3 kW+</option>
                <option value="7.4">7.4 kW+</option>
                <option value="22">22 kW+</option>
                <option value="50">50 kW+ (DC Fast)</option>
                <option value="120">120 kW+ (Ultra Fast)</option>
              </select>
            </div>

            {/* Combined Package */}
            <button
              onClick={() => setIsCombinedOnly(!isCombinedOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                isCombinedOnly
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BatteryCharging className={`w-3.5 h-3.5 ${isCombinedOnly ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Simultaneous Parking Bay Required</span>
            </button>

            {/* Reset All */}
            {(chargerType !== 'all' ||
              connectorType !== 'all' ||
              minPowerKw !== 'all' ||
              speedCategory !== 'all' ||
              isParkingIncluded !== undefined ||
              isCombinedOnly) && (
              <button
                onClick={() => {
                  setChargerType('all');
                  setConnectorType('all');
                  setMinPowerKw('all');
                  setSpeedCategory('all');
                  setIsParkingIncluded(undefined);
                  setIsCombinedOnly(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
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
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
                <Zap className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800">No charging stations match your criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try relaxing power kW filters, changing connector type, or selecting another city.
                </p>
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
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
              <Zap className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800">No charging stations match your criteria</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try relaxing power kW filters, changing connector type, or selecting another city.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
