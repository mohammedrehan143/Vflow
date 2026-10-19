import React from 'react';
import { Link } from 'react-router-dom';
import { IListing } from '@vflow/shared';
import { Star, MapPin, Zap, Shield, Car, CheckCircle2, ChevronRight } from 'lucide-react';

interface ListingCardProps {
  listing: IListing;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const isCombined = listing.serviceType === 'combined';
  const isCharging = listing.serviceType === 'charging' || isCombined;
  const isParking = listing.serviceType === 'parking' || isCombined;

  const photoUrl =
    listing.photos && listing.photos.length > 0
      ? listing.photos[0]
      : 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80';

  const hourlyRateRupees = listing.pricing?.hourlyRatePaise
    ? (listing.pricing.hourlyRatePaise / 100).toFixed(0)
    : null;

  const kwhRateRupees = listing.pricing?.chargingRatePerKwhPaise
    ? (listing.pricing.chargingRatePerKwhPaise / 100).toFixed(0)
    : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Listing Photo & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={photoUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Service Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isCombined ? (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <Car className="w-3 h-3" />
              <span>+</span>
              <Zap className="w-3 h-3 fill-white" />
              <span>Parking + EV Fast</span>
            </span>
          ) : isCharging ? (
            <span className="bg-teal-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <Zap className="w-3 h-3 fill-white" />
              <span>EV Charging Station</span>
            </span>
          ) : (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <Car className="w-3 h-3" />
              <span>Reserved Parking</span>
            </span>
          )}

          {listing.isCovered && (
            <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded-full shadow">
              Covered
            </span>
          )}
        </div>

        {/* Instant Booking Badge */}
        {listing.instantBooking && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Instant Book</span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{listing.averageRating ? listing.averageRating.toFixed(1) : '4.9'}</span>
          <span className="text-slate-300 text-[10px]">({listing.reviewCount || 24})</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              {listing.address?.city || 'Bangalore'} · {listing.address?.street?.split(',')[0] || 'Central Hub'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-700 transition">
            {listing.title}
          </h3>

          {/* Technical EV specs if charging is present */}
          {isCharging && listing.chargingPorts && listing.chargingPorts.length > 0 && (
            <div className="mt-2.5 py-1.5 px-2 bg-emerald-50 rounded-lg flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span className="font-semibold">{listing.chargingPorts[0].connectorType}</span>
              </div>
              <span className="bg-emerald-200/80 px-2 py-0.5 rounded font-bold text-[11px]">
                {listing.chargingPorts[0].powerKw} kW {listing.chargingPorts[0].chargerType}
              </span>
            </div>
          )}

          {/* Amenities tags */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(listing.amenities || []).slice(0, 3).map((a, i) => (
              <span key={i} className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded capitalize">
                {a.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              {hourlyRateRupees && (
                <div>
                  <span className="text-lg font-extrabold text-slate-900">₹{hourlyRateRupees}</span>
                  <span className="text-xs text-slate-500 font-normal"> / hour</span>
                </div>
              )}
              {kwhRateRupees && (
                <div className={hourlyRateRupees ? 'pl-2 ml-2 border-l border-slate-200' : ''}>
                  <span className="text-lg font-extrabold text-emerald-700">₹{kwhRateRupees}</span>
                  <span className="text-xs text-slate-500 font-normal"> / kWh</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-400">All taxes & fees included at checkout</div>
          </div>

          <Link
            to={`/listings/${listing._id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <span>Book</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
