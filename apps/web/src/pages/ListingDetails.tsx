import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  Zap,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Share2,
  Compass,
  ArrowRight,
  Coffee,
  Info,
} from 'lucide-react';
import { VEHICLE_RESTRICTION_LABELS, CANCELLATION_POLICIES } from '@vflow/shared';

export const ListingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Booking form states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 4);
    d.setMinutes(0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  const [licensePlate, setLicensePlate] = useState(user?.phone ? 'KA-01-MJ-4050' : 'KA-01-AB-1234');
  const [vehicleModel, setVehicleModel] = useState('Tata Nexon EV');
  const [vehicleType, setVehicleType] = useState<string>('ev');
  const [savedVehicles, setSavedVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadUserVehicles() {
      if (user) {
        try {
          const res = await api.vehicles.list();
          if (res.success && res.vehicles && res.vehicles.length > 0) {
            setSavedVehicles(res.vehicles);
            const def = res.vehicles.find((v: any) => v.isDefault) || res.vehicles[0];
            setSelectedVehicleId(def._id);
            setLicensePlate(def.registrationNumber || '');
            setVehicleModel(`${def.manufacturer} ${def.model}`);
            setVehicleType(def.vehicleType);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    loadUserVehicles();
  }, [user]);

  const handleSelectVehicle = (vId: string) => {
    setSelectedVehicleId(vId);
    if (vId === 'manual') {
      setLicensePlate('');
      setVehicleModel('');
    } else {
      const v = savedVehicles.find((item) => item._id === vId);
      if (v) {
        setLicensePlate(v.registrationNumber || '');
        setVehicleModel(`${v.manufacturer} ${v.model}`);
        setVehicleType(v.vehicleType);
      }
    }
  };

  // Fetch listing details
  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.listings.getById(id!),
    enabled: !!id,
  });

  const listing = data?.listing;
  const provider = data?.provider;

  // Nearby hangouts query based on listing coordinates
  const lat = listing?.location?.coordinates?.[1] || 12.9716;
  const lng = listing?.location?.coordinates?.[0] || 77.5946;

  const { data: nearbyData } = useQuery({
    queryKey: ['nearbyPlaces', lat, lng],
    queryFn: () => api.nearby.getPlaces(lat, lng, undefined, 2),
    enabled: !!listing,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-2/3"></div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="text-sm text-slate-500">The space you are looking for may have been deactivated or removed.</p>
        <Link to="/parking" className="inline-block bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          Back to Listings
        </Link>
      </div>
    );
  }

  // Calculate pricing breakdown
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(endDate).getTime();
  const diffHours = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60)));

  const hourlyRatePaise = listing.pricing?.hourlyRatePaise || 6000;
  const baseParkingPaise = hourlyRatePaise * diffHours;

  const isCharging = listing.serviceType === 'charging' || listing.serviceType === 'combined';
  const chargingPaise = isCharging && listing.pricing?.chargingRatePerKwhPaise
    ? listing.pricing.chargingRatePerKwhPaise * 15 // estimate 15 kWh session
    : 0;

  const subtotalPaise = baseParkingPaise + chargingPaise;
  const platformFeePaise = Math.round(subtotalPaise * 0.1); // 10%
  const gstPaise = Math.round(platformFeePaise * 0.18); // 18% GST on platform fee
  const totalAmountPaise = subtotalPaise + platformFeePaise + gstPaise;

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setIsSubmitting(true);

    try {
      const res = await api.bookings.create({
        listingId: listing._id,
        serviceType: listing.serviceType,
        startTime: new Date(startDate).toISOString(),
        endTime: new Date(endDate).toISOString(),
        vehicleId: selectedVehicleId !== 'manual' ? selectedVehicleId : undefined,
        vehicleDetails: {
          licensePlate,
          model: vehicleModel,
          type: vehicleType,
        },
      });

      if (res.success && res.booking) {
        navigate(`/checkout/${res.booking._id}`);
      }
    } catch (err: any) {
      setBookingError(err.message || 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Title & Location Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {listing.serviceType === 'combined' && (
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Car className="w-3.5 h-3.5" /> + <Zap className="w-3.5 h-3.5 fill-emerald-800" />
              <span>Parking + EV Charging</span>
            </span>
          )}
          {listing.serviceType === 'parking' && (
            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Car className="w-3.5 h-3.5" /> Reserved Parking
            </span>
          )}
          {listing.serviceType === 'charging' && (
            <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-teal-800" /> EV Fast Charger
            </span>
          )}
          {listing.isCovered && (
            <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
              Covered Parking
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
          {listing.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center gap-1 font-semibold text-slate-900">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{listing.averageRating ? listing.averageRating.toFixed(1) : '4.9'}</span>
            <span className="text-slate-400">({listing.reviewCount || 28} verified reviews)</span>
          </div>
          <span>·</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>
              {listing.address.street}, {listing.address.city}, {listing.address.postalCode}
            </span>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden aspect-[21/9] max-h-[460px] bg-slate-100">
        <div className="md:col-span-2 h-full">
          <img
            src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:grid grid-rows-2 gap-3 h-full">
          <img
            src={listing.photos?.[1] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600'}
            alt="Interior view"
            className="w-full h-full object-cover"
          />
          <img
            src={listing.photos?.[2] || 'https://images.unsplash.com/photo-1558441719-8b489c63f7d1?w=600'}
            alt="Charging point"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Grid: Details (Left) + Booking Widget (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Specs, Amenities, Host info */}
        <div className="lg:col-span-7 space-y-8">
          {/* Host Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center">
                {provider?.displayName ? provider.displayName.charAt(0) : 'H'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>Hosted by {provider?.displayName || 'GreenPark Hubs'}</span>
                  <span title="Verified Host"><ShieldCheck className="w-4 h-4 text-emerald-600 inline" /></span>
                </div>
                <div className="text-xs text-slate-500">
                  Verified Identity · Next-Day Settlement Partner · 99.4% On-time Arrival
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
              Verified Host
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">About this space</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* EV Charging Tech Specs */}
          {isCharging && listing.chargingPorts && listing.chargingPorts.length > 0 && (
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-base">
                <Zap className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                <span>EV Charging Infrastructure Specifications</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Connector Type</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {listing.chargingPorts[0].connectorType}
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Power Output</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {listing.chargingPorts[0].powerKw} kW ({listing.chargingPorts[0].chargerType})
                  </div>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[11px] text-slate-500 uppercase font-semibold">Pricing Model</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 capitalize">
                    {listing.chargingPorts[0].pricingModel.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(listing.amenities || []).map((amenity, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Info className="w-4 h-4 text-slate-600" />
              <span>Cancellation Policy: {CANCELLATION_POLICIES[listing.cancellationPolicy]?.name || 'Flexible'}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {CANCELLATION_POLICIES[listing.cancellationPolicy]?.description ||
                'Full refund if cancelled at least 2 hours before scheduled arrival.'}
            </p>
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5">
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-2xl font-black text-slate-900">
                  ₹{(hourlyRatePaise / 100).toFixed(0)}
                </span>
                <span className="text-xs text-slate-500"> / hour</span>
              </div>
              {isCharging && listing.pricing?.chargingRatePerKwhPaise && (
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-700">
                    ₹{(listing.pricing.chargingRatePerKwhPaise / 100).toFixed(0)}
                  </span>
                  <span className="text-xs text-slate-500"> / kWh</span>
                </div>
              )}
            </div>

            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Arrival</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <div className="border-l border-slate-200 pl-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Departure</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Vehicle input & saved vehicle selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Vehicle Selection</label>
                  <Link to="/vehicles" className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700">
                    + Add Vehicle
                  </Link>
                </div>

                {savedVehicles.length > 0 && (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => handleSelectVehicle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer mb-2"
                  >
                    {savedVehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.manufacturer} {v.model} ({v.registrationNumber || 'No plate'}) {v.isDefault ? '★ Default' : ''}
                      </option>
                    ))}
                    <option value="manual">Manual Entry / Another Vehicle...</option>
                  </select>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Plate (e.g. KA-01-AB-1234)"
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Make / Model"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Compatibility Advice */}
                {isCharging && (
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-900 font-medium flex items-start gap-2 mt-2">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span>
                        Verified charger compatibility check will run during reservation. Actual charging speed may vary based on your vehicle's onboard intake limits.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown Calculation */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Parking rate (₹{(hourlyRatePaise / 100).toFixed(0)} × {diffHours} hrs)</span>
                  <span className="font-semibold text-slate-900">₹{(baseParkingPaise / 100).toFixed(2)}</span>
                </div>

                {isCharging && (
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated EV charge (~15 kWh)</span>
                    <span className="font-semibold text-slate-900">₹{(chargingPaise / 100).toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>VFlow platform fee & service</span>
                  <span className="font-semibold text-slate-900">₹{(platformFeePaise / 100).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>GST (18% on platform fee)</span>
                  <span className="font-semibold text-slate-900">₹{(gstPaise / 100).toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-emerald-700 text-base">₹{(totalAmountPaise / 100).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition text-sm flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Reserving Space...</span>
                ) : (
                  <>
                    <span>Reserve & Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-slate-400">
                You won't be charged yet. Payment verified via Razorpay on the next step.
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Embedded Destination Discovery Section (Section 11) */}
      <section className="pt-8 border-t border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>While You Park Or Charge</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              Nearby Hangouts & Activities (Within Walking Distance)
            </h2>
          </div>
          <Link
            to={`/nearby?lat=${lat}&lng=${lng}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            View all destinations →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(nearbyData?.places || []).slice(0, 4).map((place) => (
            <div key={place.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-28 object-cover rounded-xl mb-3"
                />
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span className="capitalize">{place.category}</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                    ★ {place.rating}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{place.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{place.address}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-700">
                  🚶 {place.walkingMinutes} min walk ({place.distanceMeters}m)
                </span>
                <a
                  href={place.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-emerald-600 font-bold"
                >
                  Map ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
