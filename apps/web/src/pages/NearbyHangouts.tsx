import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import {
  Compass,
  Coffee,
  Utensils,
  ShoppingBag,
  Gamepad2,
  Trees,
  Laptop,
  Film,
  MapPin,
  Star,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { HANGOUT_CATEGORIES, HangoutCategory } from '@vflow/shared';

export const NearbyHangouts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const lat = parseFloat(searchParams.get('lat') || '12.9716');
  const lng = parseFloat(searchParams.get('lng') || '77.5946');

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(3);

  const { data, isLoading } = useQuery({
    queryKey: ['nearbyHangouts', lat, lng, selectedCategory, radiusKm],
    queryFn: () =>
      api.nearby.getPlaces(
        lat,
        lng,
        selectedCategory !== 'all' ? selectedCategory : undefined,
        radiusKm
      ),
  });

  const places = data?.places || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen text-neutral-900">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-neutral-900 bg-yellow-400 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs mb-1">
          <Compass className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Destination Engine</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 mt-1">
          Explore Nearby Hangouts While You Charge
        </h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-2xl font-medium">
          Discover top-rated cafes, bistros, shopping arcades, and gaming zones within easy walking distance from your vehicle's parking or charging spot.
        </p>
      </div>

      {/* Category Filter Pills: Black and Yellow buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1.5 active:scale-95 ${
            selectedCategory === 'all'
              ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/30'
              : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-black'
          }`}
        >
          <span>All Categories</span>
        </button>

        {HANGOUT_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1.5 active:scale-95 ${
              selectedCategory === cat.id
                ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/30'
                : 'bg-white border-2 border-neutral-200 text-neutral-700 hover:border-black'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Hangouts */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-neutral-100 rounded-3xl animate-pulse border border-neutral-200" />
          ))}
        </div>
      ) : places.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-3xl overflow-hidden border-2 border-neutral-200 shadow-xs hover:border-black hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                  <img
                    src={place.imageUrl}
                    alt={place.name}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-black text-neutral-900 capitalize shadow-xs border border-neutral-200">
                    {place.category.replace(/_/g, ' ')}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-xs font-black text-white flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{place.rating ? place.rating.toFixed(1) : '4.5'}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-black text-neutral-900 text-base line-clamp-1">{place.name}</h3>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-black shrink-0 stroke-[2.5]" />
                    <span>{place.address}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-yellow-50 border border-yellow-200 text-neutral-900 p-2.5 rounded-xl font-bold">
                      <span className="block text-[10px] text-neutral-500 uppercase font-black">Walking</span>
                      <span>🚶 {place.walkingMinutes} mins ({place.distanceMeters}m)</span>
                    </div>
                    <div className="bg-neutral-50 border border-neutral-200 text-neutral-800 p-2.5 rounded-xl font-bold">
                      <span className="block text-[10px] text-neutral-500 uppercase font-black">Driving</span>
                      <span>🚗 {place.drivingMinutes} mins</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-500 text-[11px] font-medium">Open 10:00 AM – 11:00 PM</span>
                <a
                  href={place.mapDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-black text-black bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 rounded-xl transition shadow-xs active:scale-95"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-neutral-200 p-8 shadow-xs">
          <Compass className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
          <h3 className="font-black text-neutral-900">No hangouts found nearby</h3>
          <p className="text-xs text-neutral-500 mt-1 font-medium">Try switching categories or expanding search distance.</p>
        </div>
      )}
    </div>
  );
};
