import React from 'react';
import { Link } from 'react-router-dom';
import { IListing } from '@vflow/shared';
import { Star, MapPin, Zap, Car, CheckCircle2, ChevronRight } from 'lucide-react';

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
    <div className="group bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/10 transition-all duration-300 flex flex-col text-white">
      {/* Listing Photo & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
        <img
          src={photoUrl}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Service Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isCombined ? (
            <span className="bg-yellow-400 text-black text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Car className="w-3 h-3 text-black" />
              <span>+</span>
              <Zap className="w-3 h-3 fill-black text-black" />
              <span>Parking + EV Fast</span>
            </span>
          ) : isCharging ? (
            <span className="bg-yellow-400 text-black text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
              <Zap className="w-3 h-3 fill-black text-black" />
              <span>EV Fast Charging</span>
            </span>
          ) : (
            <span className="bg-black/85 text-white border border-neutral-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow flex items-center gap-1">
              <Car className="w-3 h-3 text-yellow-400" />
              <span>Reserved Parking</span>
            </span>
          )}

          {listing.isCovered && (
            <span className="bg-black/80 backdrop-blur-md text-neutral-200 border border-neutral-700 text-[11px] font-medium px-2 py-0.5 rounded-full">
              Covered
            </span>
          )}
        </div>

        {/* Instant Booking Badge */}
        {listing.instantBooking && (
          <div className="absolute bottom-3 left-3 bg-black/90 backdrop-blur-md text-yellow-400 border border-yellow-400/30 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-yellow-400" />
            <span>Instant Book</span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg border border-neutral-800 flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span>{listing.averageRating ? listing.averageRating.toFixed(1) : '4.9'}</span>
          <span className="text-neutral-400 text-[10px]">({listing.reviewCount || 24})</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
            <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span className="truncate">
              {listing.address?.city || 'Bangalore'} · {listing.address?.street?.split(',')[0] || 'Central Bay'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-white text-base line-clamp-1 group-hover:text-yellow-400 transition">
            {listing.title}
          </h3>

          {/* Prominent Charger Specifications Badge */}
          {((listing as any).specBadge || (isCharging && listing.chargingPorts && listing.chargingPorts.length > 0)) && (
            <div className="mt-2.5 py-1.5 px-2.5 bg-yellow-400/10 border border-yellow-400/30 rounded-xl flex items-center justify-between text-xs text-yellow-400 font-bold">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 shrink-0" />
                <span className="truncate">
                  {(listing as any).specBadge ||
                    `${listing.chargingPorts?.[0]?.powerKw || 22} kW ${listing.chargingPorts?.[0]?.chargerType || 'AC'} · ${
                      listing.chargingPorts?.[0]?.connectorType || 'Type 2'
                    }${listing.isCovered ? ' · Parking Available' : ''}`}
                </span>
              </div>
            </div>
          )}

          {/* Vehicle Compatibility Status Badge if available */}
          {(listing as any).compatibility && (
            <div className="mt-1.5 text-[11px]">
              {(listing as any).compatibility.compatible ? (
                <div className="text-yellow-300 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-yellow-400 shrink-0" />
                  <span className="truncate">
                    Compatible (up to {(listing as any).compatibility.effectivePowerKw} kW)
                    {(listing as any).compatibility.isSpeedThrottled && ' · Car limited'}
                  </span>
                </div>
              ) : (
                <div className="text-red-400 bg-red-950/40 border border-red-800/40 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                  <span className="shrink-0">✕</span>
                  <span className="truncate">
                    Incompatible: {(listing as any).compatibility.reasons?.[0] || 'Connector mismatch'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Amenities tags */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {(listing.amenities || []).slice(0, 3).map((a, i) => (
              <span key={i} className="text-[11px] text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded capitalize">
                {a.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing Footer */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              {hourlyRateRupees && (
                <div>
                  <span className="text-lg font-black text-white">₹{hourlyRateRupees}</span>
                  <span className="text-xs text-neutral-400 font-normal"> / hr</span>
                </div>
              )}
              {kwhRateRupees && (
                <div className={hourlyRateRupees ? 'pl-2 ml-2 border-l border-neutral-700' : ''}>
                  <span className="text-lg font-black text-yellow-400">₹{kwhRateRupees}</span>
                  <span className="text-xs text-neutral-400 font-normal"> / kWh</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-neutral-500">Taxes & fees included</div>
          </div>

          <Link
            to={`/listings/${listing._id}`}
            className="inline-flex items-center gap-1 text-xs font-black text-black bg-yellow-400 hover:bg-yellow-300 px-3.5 py-2 rounded-xl shadow-md transition active:scale-95"
          >
            <span>Book</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
