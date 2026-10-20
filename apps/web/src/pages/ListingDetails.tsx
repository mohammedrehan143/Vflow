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
        <div className="h-8 bg-neutral-200 rounded-lg w-2/3"></div>
        <div className="h-96 bg-neutral-200 rounded-3xl"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-black text-neutral-900">Listing Not Found</h2>
        <p className="text-sm text-neutral-500">The space you are looking for may have been deactivated or removed.</p>
        <Link to="/parking" className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-black px-5 py-2.5 rounded-xl shadow-xs transition">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 bg-white min-h-screen">
      {/* Title & Location Header */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {listing.serviceType === 'combined' && (
            <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs border border-yellow-500/20">
              <Car className="w-3.5 h-3.5 stroke-[2.5]" /> + <Zap className="w-3.5 h-3.5 fill-black stroke-black" />
              <span>Parking + EV Charging</span>
            </span>
          )}
          {listing.serviceType === 'parking' && (
            <span className="bg-black text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
              <Car className="w-3.5 h-3.5 text-yellow-400 stroke-[2.5]" /> Reserved Parking
            </span>
          )}
          {listing.serviceType === 'charging' && (
            <span className="bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-xs border border-yellow-500/20">
              <Zap className="w-3.5 h-3.5 fill-black stroke-black" /> EV Fast Charger
            </span>
          )}
          {listing.isCovered && (
            <span className="bg-neutral-100 text-neutral-800 text-xs font-bold px-3 py-1 rounded-full border border-neutral-300">
              Covered
            </span>
          )}
          {listing.instantBooking && (
            <span className="bg-white text-neutral-900 border-2 border-neutral-300 text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-black stroke-[2.5]" />
              <span>Instant Confirmation</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
          {listing.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm text-neutral-600 font-semibold">
          <div className="flex items-center gap-1 text-neutral-900 font-black">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
            <span>{listing.averageRating ? listing.averageRating.toFixed(1) : '4.9'}</span>
            <span className="text-neutral-500 font-normal">({listing.reviewCount || 18} reviews)</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-black stroke-[2.5]" />
            <span>
              {listing.address?.street}, {listing.address?.city}, {listing.address?.state} {listing.address?.postalCode}
            </span>
          </div>
        </div>
      </div>

      {/* Photo Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden max-h-[460px] border-2 border-neutral-200">
        <div className="md:col-span-2 h-72 md:h-full">
          <img
            src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden md:flex flex-col gap-3">
          <img
            src={listing.photos?.[1] || 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=600&q=80'}
            alt="Space viewpoint"
            className="w-full h-1/2 object-cover"
          />
          <img
            src={listing.photos?.[2] || 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80'}
            alt="Charger view"
            className="w-full h-1/2 object-cover"
          />
        </div>
        <div className="hidden md:block h-full">
          <img
            src={listing.photos?.[3] || 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=600&q=80'}
            alt="Entrance view"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Details & Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Specifications, Host & Amenities */}
        <div className="lg:col-span-7 space-y-8">
          {/* Host Info Bar */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-yellow-400 text-black font-black text-lg flex items-center justify-center shadow-xs">
                {provider?.businessName ? provider.businessName.charAt(0) : 'H'}
              </div>
              <div>
                <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Hosted By</div>
                <div className="font-black text-neutral-900 text-base flex items-center gap-1.5">
                  <span>{provider?.businessName || 'Verified Urban Bay Host'}</span>
                  <span title="Verified Host"><ShieldCheck className="w-4 h-4 text-black inline stroke-[2.5]" /></span>
                </div>
              </div>
            </div>
            <span className="text-xs font-black px-3 py-1 bg-yellow-400 text-black rounded-full border border-yellow-500/20 shadow-xs">
              Instant Gate Access
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-black text-neutral-900 mb-2">About this space</h3>
            <p className="text-neutral-600 text-sm leading-relaxed whitespace-pre-line font-medium">
              {listing.description}
            </p>
          </div>

          {/* EV Charging Tech Specs */}
          {isCharging && listing.chargingPorts && listing.chargingPorts.length > 0 && (
            <div className="p-5 bg-yellow-50/80 rounded-2xl border-2 border-yellow-300 space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 font-black text-base">
                <Zap className="w-5 h-5 fill-black stroke-black" />
                <span>EV Charging Infrastructure Specifications</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white p-3 rounded-xl border border-yellow-200 shadow-xs">
                  <div className="text-[11px] text-neutral-500 uppercase font-black">Connector Type</div>
                  <div className="font-black text-neutral-900 text-sm mt-0.5">
                    {listing.chargingPorts[0].connectorType}
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-yellow-200 shadow-xs">
                  <div className="text-[11px] text-neutral-500 uppercase font-black">Power Output</div>
                  <div className="font-black text-amber-600 text-sm mt-0.5">
                    {listing.chargingPorts[0].powerKw} kW ({listing.chargingPorts[0].chargerType})
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-yellow-200 shadow-xs">
                  <div className="text-[11px] text-neutral-500 uppercase font-black">Pricing Model</div>
                  <div className="font-black text-neutral-900 text-sm mt-0.5 capitalize">
                    {listing.chargingPorts[0].pricingModel.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-black text-neutral-900 mb-3">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(listing.amenities || []).map((amenity, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-bold text-neutral-800">
                  <CheckCircle2 className="w-4 h-4 text-black shrink-0 stroke-[2.5]" />
                  <span className="capitalize">{amenity.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <div className="flex items-center gap-2 text-xs font-black text-neutral-900">
              <Info className="w-4 h-4 text-neutral-700 stroke-[2.5]" />
              <span>Cancellation Policy: {CANCELLATION_POLICIES[listing.cancellationPolicy]?.name || 'Flexible'}</span>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed font-medium">
              {CANCELLATION_POLICIES[listing.cancellationPolicy]?.description ||
                'Full refund if cancelled at least 2 hours before scheduled arrival.'}
            </p>
          </div>
        </div>

        {/* Right Column: Sticky Booking Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl border-2 border-neutral-200 shadow-xl p-6 space-y-5 text-neutral-900">
            <div className="flex items-baseline justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-2xl font-black text-neutral-900">
                  ₹{(hourlyRatePaise / 100).toFixed(0)}
                </span>
                <span className="text-xs text-neutral-500 font-medium"> / hour</span>
              </div>
              {isCharging && listing.pricing?.chargingRatePerKwhPaise && (
                <div className="text-right">
                  <span className="text-lg font-black text-amber-600">
                    ₹{(listing.pricing.chargingRatePerKwhPaise / 100).toFixed(0)}
                  </span>
                  <span className="text-xs text-neutral-500 font-medium"> / kWh</span>
                </div>
              )}
            </div>

            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-800 text-xs font-bold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              {/* Vehicle Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-neutral-800 uppercase tracking-wider">Vehicle to Park</label>
                  <Link to="/vehicles" className="text-[11px] font-black text-black hover:underline">
                    Manage Vehicles
                  </Link>
                </div>

                {savedVehicles.length > 0 && (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => handleSelectVehicle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-neutral-50 border border-neutral-300 font-semibold focus:outline-none focus:border-black cursor-pointer mb-2"
                  >
                    {savedVehicles.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.manufacturer} {v.model} ({v.registrationNumber || 'No plate'})
                      </option>
                    ))}
                    <option value="manual">+ Enter different vehicle</option>
                  </select>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Reg / Plate No."
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Vehicle Model"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    className="px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-300 text-xs font-semibold focus:outline-none focus:border-black"
                  />
                </div>

                {isCharging && (
                  <div className="p-2.5 rounded-xl bg-yellow-50 border border-yellow-200 text-[11px] text-neutral-900 font-medium flex items-start gap-2 mt-2">
                    <Zap className="w-3.5 h-3.5 fill-black stroke-black shrink-0 mt-0.5" />
                    <span>Includes high-speed EV connector reservation with verified power delivery.</span>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div className="space-y-2">
                <label className="text-xs font-black text-neutral-800 uppercase tracking-wider block">Duration</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-neutral-500 font-bold block mb-1">Check-in</span>
                    <input
                      type="datetime-local"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 font-bold block mb-1">Check-out</span>
                    <input
                      type="datetime-local"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl font-semibold focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-neutral-500 text-right font-bold">
                  Duration: {diffHours} {diffHours === 1 ? 'hour' : 'hours'}
                </div>
              </div>

              {/* Pricing Breakdown Card */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>Parking ({diffHours} hrs @ ₹{(hourlyRatePaise / 100).toFixed(0)}/hr)</span>
                  <span className="font-bold text-neutral-900">₹{(baseParkingPaise / 100).toFixed(2)}</span>
                </div>
                {isCharging && chargingPaise > 0 && (
                  <div className="flex justify-between text-neutral-600 font-medium">
                    <span>Est. Charging (~15 kWh session)</span>
                    <span className="font-bold text-neutral-900">₹{(chargingPaise / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>VFlow Platform Fee (10%)</span>
                  <span>₹{(platformFeePaise / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-600 font-medium">
                  <span>GST (18% on fee)</span>
                  <span>₹{(gstPaise / 100).toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between font-black text-sm text-neutral-900">
                  <span>Total Due</span>
                  <span className="text-black text-base bg-yellow-400 px-2 py-0.5 rounded-lg shadow-xs">₹{(totalAmountPaise / 100).toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-black font-black py-4 px-4 rounded-2xl shadow-xs border border-yellow-500/20 transition active:scale-95 text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Reserving Space...</span>
                ) : (
                  <>
                    <span>Reserve & Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <div className="text-center text-[11px] text-neutral-500 font-medium">
                You won't be charged yet. Payment verified via Razorpay on the next step.
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Embedded Destination Discovery Section (Section 11) */}
      <section className="pt-8 border-t border-neutral-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 bg-yellow-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
              <Compass className="w-4 h-4 stroke-[2.5]" />
              <span>While You Park Or Charge</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
              Nearby Hangouts & Activities (Within Walking Distance)
            </h2>
          </div>
          <Link
            to={`/nearby?lat=${lat}&lng=${lng}`}
            className="text-xs font-black text-black hover:underline"
          >
            View all destinations →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(nearbyData?.places || []).slice(0, 4).map((place) => (
            <div key={place.id} className="bg-white rounded-2xl p-4 border-2 border-neutral-200 shadow-xs flex flex-col justify-between">
              <div>
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  className="w-full h-28 object-cover rounded-xl mb-3"
                />
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 mb-1">
                  <span className="capitalize">{place.category}</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-black">
                    ★ {place.rating}
                  </span>
                </div>
                <h4 className="font-black text-neutral-900 text-sm line-clamp-1">{place.name}</h4>
                <p className="text-xs text-neutral-500 mt-0.5 font-medium">{place.address}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="font-black text-neutral-900">
                  🚶 {place.walkingMinutes} min walk ({place.distanceMeters}m)
                </span>
                <a
                  href={place.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-black hover:underline"
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
