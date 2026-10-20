import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Car,
  Zap,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Layers,
  Clock,
  BatteryCharging,
  Sliders,
  DollarSign,
  Info,
} from 'lucide-react';
import {
  ServiceType,
  ParkingType,
  CancellationPolicyType,
  ConnectorType,
  ChargerType,
  ChargingPricingModel,
  COMMON_CHARGER_POWERS_KW,
} from '@vflow/shared';

const PRESET_POWERS = [3.3, 7.4, 11, 22, 30, 50, 60, 120, 150];

export const CreateListing: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('combined');
  const [parkingType, setParkingType] = useState<ParkingType>('commercial_building');

  // Location
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');
  const [entryExitInstructions, setEntryExitInstructions] = useState('');

  // Pricing
  const [hourlyRate, setHourlyRate] = useState('80'); // ₹
  const [chargingPricePerUnit, setChargingPricePerUnit] = useState('18'); // ₹
  const [pricingModel, setPricingModel] = useState<ChargingPricingModel>('per_kwh');

  // EV Charging Hardware Specifications
  const [chargerType, setChargerType] = useState<'AC' | 'DC'>('AC');
  const [connectorType, setConnectorType] = useState<ConnectorType>('Type 2');
  const [powerKw, setPowerKw] = useState('7.4');
  const [isCustomPower, setIsCustomPower] = useState(false);
  const [chargerManufacturer, setChargerManufacturer] = useState('Exicom / Delta');
  const [chargerModel, setChargerModel] = useState('FastBox Pro');
  const [physicalPortsCount, setPhysicalPortsCount] = useState<number>(1);
  const [isParkingIncluded, setIsParkingIncluded] = useState(false);
  const [requiresSimultaneousParking, setRequiresSimultaneousParking] = useState(true);
  const [operatingHours, setOperatingHours] = useState('24/7');

  // Amenities & Policies
  const [isCovered, setIsCovered] = useState(true);
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicyType>('flexible');
  const [instantBooking, setInstantBooking] = useState(true);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'cctv',
    'security_guard',
    'ev_charging',
    'covered',
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handlePowerPreset = (kw: number) => {
    setPowerKw(String(kw));
    setIsCustomPower(false);
    if (kw >= 30) {
      setChargerType('DC');
      if (connectorType === 'Type 2') setConnectorType('CCS2');
    } else {
      setChargerType('AC');
      if (connectorType === 'CCS2') setConnectorType('Type 2');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const parsedPower = parseFloat(powerKw) || 7.4;
      const parsedChargingRatePaise = Math.round(parseFloat(chargingPricePerUnit) * 100);

      const payload: any = {
        title,
        description,
        serviceType,
        parkingType,
        address: {
          street,
          city,
          state,
          postalCode,
          country: 'India',
        },
        location: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)], // [lng, lat]
        },
        pricing: {
          hourlyRatePaise: Math.round(parseFloat(hourlyRate) * 100),
          chargingRatePerKwhPaise:
            pricingModel === 'per_kwh' && serviceType !== 'parking' ? parsedChargingRatePaise : undefined,
          chargingFlatRatePaise:
            pricingModel === 'flat_session' && serviceType !== 'parking' ? parsedChargingRatePaise : undefined,
        },
        amenities: selectedAmenities,
        photos: [
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
        ],
        isCovered,
        cancellationPolicy,
        instantBooking,
        entryExitInstructions,
        parkingSpacesCount: serviceType !== 'charging' ? 1 : 0,
        isParkingIncluded,
        requiresSimultaneousParking,
      };

      if (serviceType !== 'parking') {
        // Individual bookable ports modelled as independent resources
        const ports = [];
        for (let i = 1; i <= physicalPortsCount; i++) {
          ports.push({
            portIdentifier: `Gun #${i}`,
            chargerType: chargerType === 'DC' ? ('DC' as const) : ('AC' as const),
            connectorType,
            powerKw: parsedPower,
            ratedPowerKw: parsedPower,
            chargerManufacturer,
            chargerModel,
            pricingModel,
            pricePerUnitPaise: parsedChargingRatePaise,
            isParkingIncluded,
            requiresSimultaneousParking,
            operatingHours,
          });
        }
        payload.chargingPorts = ports;

        payload.chargingStations = [
          {
            stationName: `${title} - Main Station`,
            manufacturer: chargerManufacturer,
            model: chargerModel,
            chargerType: chargerType === 'DC' ? 'DC' : 'AC',
            ratedPowerKw: parsedPower,
            totalPorts: physicalPortsCount,
            status: 'operational',
          },
        ];
      }

      const res = await api.listings.create(payload);
      if (res.success && res.listing) {
        navigate(`/listings/${res.listing._id}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen text-neutral-900">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 bg-yellow-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
          <Layers className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Provider Resource Hub</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 mt-1">
          Create Parking or EV Charger Listing
        </h1>
        <p className="text-sm text-neutral-500 mt-1 font-medium">
          Publish your parking space or EV charging ports with verified technical specifications and guaranteed next-day payouts.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-neutral-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Service Type Selection */}
        <div>
          <label className="block text-xs font-black text-neutral-700 mb-2 uppercase">Service Type</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'parking', label: '🅿️ Parking Only' },
              { id: 'charging', label: '⚡ EV Charging Only' },
              { id: 'combined', label: '🅿️+⚡ Combined Package' },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setServiceType(t.id as ServiceType)}
                className={`py-3 px-3 rounded-2xl border-2 text-xs font-black transition text-center active:scale-95 ${
                  serviceType === t.id
                    ? 'bg-yellow-400 border-black text-black shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-black'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-black text-neutral-700 mb-1">Listing Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Indiranagar Metro Covered Bay + 22 kW EV Wallbox"
              className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-neutral-700 mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide directions, basement level info, entry guidelines, security presence..."
              className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-medium focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>Bay Location & Geo-Coordinates</span>
          </h4>

          <div>
            <label className="block text-xs font-black text-neutral-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="100 Feet Road, HAL 2nd Stage"
              className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold cursor-pointer"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi-NCR">Delhi-NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="560038"
                className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black text-neutral-500 uppercase mb-1">Latitude</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-neutral-500 uppercase mb-1">Longitude</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Pricing Configuration */}
        <div className="space-y-3 pt-3 border-t border-neutral-100">
          <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-black stroke-[2.5]" />
            <span>Pricing & Tariffs (INR)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-neutral-700 mb-1">Hourly Parking Rate (₹)</label>
              <input
                type="number"
                min="0"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-black text-neutral-900"
              />
            </div>

            {serviceType !== 'parking' && (
              <div>
                <label className="block text-xs font-black text-neutral-700 mb-1">
                  EV Charging Rate (₹ per kWh / unit)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={chargingPricePerUnit}
                  onChange={(e) => setChargingPricePerUnit(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-black text-amber-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* EV Hardware Specifications if Charging enabled */}
        {serviceType !== 'parking' && (
          <div className="space-y-4 pt-3 border-t border-neutral-100 bg-yellow-50/70 p-5 rounded-2xl border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-black stroke-black" />
                <span>EV Charger Technical Specifications</span>
              </h4>
              <span className="text-[10px] bg-yellow-400 text-black font-black px-2 py-0.5 rounded-full shadow-xs">
                Resource Model
              </span>
            </div>

            {/* AC / DC Toggle */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 mb-1.5">Current Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setChargerType('AC');
                    if (connectorType === 'CCS2') setConnectorType('Type 2');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition border-2 ${
                    chargerType === 'AC'
                      ? 'bg-black text-yellow-400 border-black shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                  }`}
                >
                  ⚡ AC Wallbox (Slow / Fast)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChargerType('DC');
                    if (connectorType === 'Type 2') setConnectorType('CCS2');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition border-2 ${
                    chargerType === 'DC'
                      ? 'bg-black text-yellow-400 border-black shadow-xs'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-black'
                  }`}
                >
                  🚀 DC High-Speed (Rapid)
                </button>
              </div>
            </div>

            {/* Rated Charging Power in kW: Presets + Custom */}
            <div>
              <label className="block text-[11px] font-black text-neutral-700 mb-1.5">
                Rated Charging Power (kW)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {PRESET_POWERS.map((kw) => (
                  <button
                    type="button"
                    key={kw}
                    onClick={() => handlePowerPreset(kw)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                      powerKw === String(kw) && !isCustomPower
                        ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/30'
                        : 'bg-white border border-neutral-300 text-neutral-700 hover:border-black'
                    }`}
                  >
                    {kw} kW
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsCustomPower(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                    isCustomPower
                      ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/30'
                      : 'bg-white border border-neutral-300 text-neutral-700 hover:border-black'
                  }`}
                >
                  Custom kW
                </button>
              </div>

              {isCustomPower && (
                <div className="mt-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="350"
                    value={powerKw}
                    onChange={(e) => setPowerKw(e.target.value)}
                    placeholder="Enter custom kW (e.g. 24)"
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-black text-neutral-900"
                    required
                  />
                </div>
              )}
            </div>

            {/* Connector Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-neutral-700 mb-1">Connector Gun Type</label>
                <select
                  value={connectorType}
                  onChange={(e) => setConnectorType(e.target.value as ConnectorType)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-semibold"
                >
                  <option value="Type 2">Type 2 AC (Mennekes - IEC 62196)</option>
                  <option value="CCS2">CCS-2 DC Combo (Standard India EV Fast)</option>
                  <option value="CHAdeMO">CHAdeMO DC Fast</option>
                  <option value="Bharat AC-001">Bharat AC-001 (10 kW)</option>
                  <option value="Bharat DC-001">Bharat DC-001 (15 kW)</option>
                  <option value="15A_3Pin">15A Domestic 3-Pin Plug</option>
                </select>
              </div>

              {/* Physical Bookable Ports */}
              <div>
                <label className="block text-[11px] font-black text-neutral-700 mb-1">
                  Number of Physical Charging Guns
                </label>
                <select
                  value={physicalPortsCount}
                  onChange={(e) => setPhysicalPortsCount(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-semibold"
                >
                  <option value={1}>1 Gun (Single user at a time)</option>
                  <option value={2}>2 Guns (Dual port dual car)</option>
                  <option value={4}>4 Guns (Multi-bay hub)</option>
                </select>
              </div>
            </div>

            {/* Manufacturer & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-neutral-700 mb-1">Charger Manufacturer</label>
                <input
                  type="text"
                  value={chargerManufacturer}
                  onChange={(e) => setChargerManufacturer(e.target.value)}
                  placeholder="e.g. Exicom, Delta, ABB, Tata"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-neutral-700 mb-1">Model / Serial</label>
                <input
                  type="text"
                  value={chargerModel}
                  onChange={(e) => setChargerModel(e.target.value)}
                  placeholder="e.g. Terra 54 / Spin AC"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-semibold"
                />
              </div>
            </div>

            {/* Pricing Method & Operational Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-yellow-200">
              <div>
                <label className="block text-[11px] font-black text-neutral-700 mb-1">Pricing Billing Method</label>
                <select
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as ChargingPricingModel)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-semibold"
                >
                  <option value="per_kwh">Per kWh Consumed</option>
                  <option value="per_hour">Per Hour Connected</option>
                  <option value="flat_session">Fixed Flat Session Fee</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-neutral-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="24/7 or 06:00 - 23:00"
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-semibold"
                />
              </div>
            </div>

            {/* Parking Included & Simultaneous Parking Toggles */}
            <div className="space-y-2 pt-2 border-t border-yellow-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isParkingIncluded}
                  onChange={(e) => setIsParkingIncluded(e.target.checked)}
                  className="rounded accent-black"
                />
                <span className="text-xs text-neutral-800 font-bold select-none">
                  Parking is included in the charging rate (no separate parking fee)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresSimultaneousParking}
                  onChange={(e) => setRequiresSimultaneousParking(e.target.checked)}
                  className="rounded accent-black"
                />
                <span className="text-xs text-neutral-800 font-bold select-none">
                  Charger occupies a dedicated parking bay (automatically locks the bay to avoid double-booking)
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Amenities Selection */}
        <div className="space-y-2 pt-3 border-t border-neutral-100">
          <label className="block text-xs font-black text-neutral-700 uppercase">Available Amenities</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'cctv', label: 'CCTV Surveillance' },
              { id: 'security_guard', label: 'Security Guard' },
              { id: 'covered', label: 'Covered Roof' },
              { id: 'ev_charging', label: 'EV Charger' },
              { id: 'lighting', label: 'Bright Lighting' },
              { id: 'wheelchair', label: 'Wheelchair Access' },
            ].map((a) => (
              <button
                type="button"
                key={a.id}
                onClick={() => toggleAmenity(a.id)}
                className={`p-2.5 rounded-xl border text-xs font-black text-center transition active:scale-95 ${
                  selectedAmenities.includes(a.id)
                    ? 'bg-yellow-400 border-yellow-500 text-black shadow-xs'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:border-black'
                }`}
              >
                {selectedAmenities.includes(a.id) ? '✓ ' : '+ '}{a.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-4 px-4 rounded-2xl shadow-xs border border-yellow-500/20 transition active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? 'Publishing Listing...' : 'Publish Listing to VFlow Marketplace'}
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
