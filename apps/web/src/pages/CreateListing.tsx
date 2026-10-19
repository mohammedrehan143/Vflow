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
} from 'lucide-react';
import { ServiceType, ParkingType, CancellationPolicyType } from '@vflow/shared';

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

  // Pricing
  const [hourlyRate, setHourlyRate] = useState('80'); // ₹
  const [chargingRatePerKwh, setChargingRatePerKwh] = useState('18'); // ₹

  // EV Charging Specs
  const [connectorType, setConnectorType] = useState<'Type 2' | 'CCS2' | 'CHAdeMO' | 'GB/T' | '15A 3-Pin'>('Type 2');
  const [powerKw, setPowerKw] = useState('7.4');
  const [chargerType, setChargerType] = useState<'AC' | 'DC_Fast'>('AC');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
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
            serviceType !== 'parking' ? Math.round(parseFloat(chargingRatePerKwh) * 100) : undefined,
        },
        amenities: selectedAmenities,
        photos: [
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
        ],
        isCovered,
        cancellationPolicy,
        instantBooking,
        parkingSpacesCount: 1,
      };

      if (serviceType !== 'parking') {
        payload.chargingPorts = [
          {
            portIdentifier: 'CP-1',
            chargerType,
            connectorType,
            powerKw: parseFloat(powerKw),
            pricingModel: 'per_kwh',
            pricePerUnitPaise: Math.round(parseFloat(chargingRatePerKwh) * 100),
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Inventory Creator</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mt-1">
          Create New Space or Charger Listing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Publish your parking bay or EV charging wallbox to drivers in real-time.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        {/* Service Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">Service Type</label>
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
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition text-center ${
                  serviceType === t.id
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Listing Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Secure Covered Bay with 7.4kW Type-2 AC Wallbox"
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe access gate, security guards, roof protection, and parking dimensions..."
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Address & Coordinates */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Location & Coordinates</h4>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="45 Lavelle Road, Shanthala Nagar"
              className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi-NCR">Delhi-NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">PIN Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="560001"
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs"
                required
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pricing Configuration</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hourly Parking Rate (₹)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="80"
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                required
              />
            </div>

            {serviceType !== 'parking' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">EV Charging Rate (₹ / kWh)</label>
                <input
                  type="number"
                  value={chargingRatePerKwh}
                  onChange={(e) => setChargingRatePerKwh(e.target.value)}
                  placeholder="18"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-bold text-emerald-800"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* EV Hardware Specifications if Charging enabled */}
        {serviceType !== 'parking' && (
          <div className="space-y-3 pt-3 border-t border-slate-100 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
              EV Charger Technical Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Connector</label>
                <select
                  value={connectorType}
                  onChange={(e) => setConnectorType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                >
                  <option value="Type 2">Type 2 AC</option>
                  <option value="CCS2">CCS2 DC Fast</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="15A 3-Pin">15A 3-Pin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Power Output (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={powerKw}
                  onChange={(e) => setPowerKw(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Charger Current</label>
                <select
                  value={chargerType}
                  onChange={(e) => setChargerType(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                >
                  <option value="AC">AC (Slow / Fast)</option>
                  <option value="DC_Fast">DC Fast / Rapid</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Amenities Selection */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">Available Amenities</label>
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
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition ${
                  selectedAmenities.includes(a.id)
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Publishing Space...' : 'Publish Listing to VFlow Marketplace'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
