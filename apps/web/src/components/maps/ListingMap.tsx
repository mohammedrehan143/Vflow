import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { IListing } from '@vflow/shared';
import { Link } from 'react-router-dom';
import {
  Zap,
  Car,
  Navigation,
  Compass,
  Plus,
  Minus,
  RotateCcw,
  X,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  BatteryCharging,
} from 'lucide-react';

interface ListingMapProps {
  listings: IListing[];
  center?: [number, number]; // [lat, lng] or [lng, lat]
  zoom?: number;
  selectedId?: string;
  onSelectListing?: (id: string) => void;
  className?: string;
  height?: string;
}

// Haversine straight-line distance calculation
function calculateStraightLineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const ListingMap: React.FC<ListingMapProps> = ({
  listings,
  center = [12.9716, 77.5946], // Default Bangalore lat/lng
  zoom = 12,
  selectedId,
  onSelectListing,
  className = '',
  height = '100%',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<'all' | 'charging' | 'parking'>('all');
  const [activeSelectedId, setActiveSelectedId] = useState<string | undefined>(selectedId);

  // Synchronize internal selected ID with external prop
  useEffect(() => {
    setActiveSelectedId(selectedId);
  }, [selectedId]);

  // Convert incoming center format: if [lat, lng] (lat < 50 && lng > 50 for India/world), convert to MapLibre [lng, lat]
  const initialCoordinates = useMemo<[number, number]>(() => {
    if (center[0] < 60 && center[1] > 60) {
      return [center[1], center[0]]; // [lng, lat]
    }
    return [center[0], center[1]];
  }, [center]);

  // Filter listings based on map search query and service type filter
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Filter by service type
      if (serviceFilter === 'charging' && item.serviceType === 'parking') return false;
      if (serviceFilter === 'parking' && item.serviceType === 'charging') return false;

      // Filter by search text
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = item.title?.toLowerCase().includes(query);
        const cityMatch = item.address?.city?.toLowerCase().includes(query);
        const streetMatch = item.address?.street?.toLowerCase().includes(query);
        if (!titleMatch && !cityMatch && !streetMatch) return false;
      }
      return true;
    });
  }, [listings, serviceFilter, searchQuery]);

  // Active selected listing object
  const selectedListing = useMemo(() => {
    return listings.find((item) => item._id === activeSelectedId);
  }, [listings, activeSelectedId]);

  // MapLibre tile style URL (Configurable via env var)
  const mapStyleUrl =
    import.meta.env.VITE_MAPLIBRE_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';

  // 1. Initialize MapLibre instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent recreation

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: mapStyleUrl,
        center: initialCoordinates,
        zoom: zoom,
        attributionControl: false,
        pitch: 20,
        bearing: 0,
      });

      // Add slim attribution
      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: '© OpenFreeMap / MapLibre / OpenStreetMap',
        }),
        'bottom-right'
      );

      map.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
        map.resize();
      });

      map.on('error', (e: any) => {
        console.warn('MapLibre tile/style error:', e);
        // If critical style load error, record error state
        if (!mapLoaded && (e.error?.message?.includes('Failed to fetch') || e.error?.message?.includes('404'))) {
          setMapError('Map tiles could not be reached. Retrying with fallback tiles...');
        }
      });

      mapInstanceRef.current = map;
    } catch (err: any) {
      console.error('Failed to initialize MapLibre GL:', err);
      setMapError(err?.message || 'WebGL is not supported or map could not be initialized.');
    }

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Render Markers on Listings change or SelectedId change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const validCoordinates: [number, number][] = [];

    filteredListings.forEach((item) => {
      if (!item.location || !Array.isArray(item.location.coordinates) || item.location.coordinates.length < 2) {
        return;
      }

      const [lng, lat] = item.location.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
        return;
      }

      validCoordinates.push([lng, lat]);

      const isSelected = activeSelectedId === item._id;
      const isEv = item.serviceType === 'charging';
      const isParking = item.serviceType === 'parking';
      const isCombined = item.serviceType === 'combined';

      // Price or Power Tag
      const priceText = item.pricing?.chargingRatePerKwhPaise
        ? `₹${Math.round(item.pricing.chargingRatePerKwhPaise / 100)}/u`
        : item.pricing?.hourlyRatePaise
        ? `₹${Math.round(item.pricing.hourlyRatePaise / 100)}/h`
        : isEv
        ? '⚡ FAST'
        : '🅿️ SPOT';

      // Create Custom DOM Marker Element
      const el = document.createElement('div');
      el.className = `group cursor-pointer transition-all duration-300 ${
        isSelected ? 'z-50 scale-110 marker-selected-pulse' : 'z-20 hover:scale-105 hover:z-40'
      }`;
      el.style.transformOrigin = 'bottom center';

      // Design: Pill badge with icon and price (Zepto-style consumer UI)
      let bgStyle = 'background-color: #0F172A; color: #FFFFFF; border: 2px solid #FFFFFF;'; // Parking Black
      let iconHtml = `<span style="font-size: 11px;">🅿️</span>`;

      if (isEv) {
        bgStyle = 'background-color: #FACC15; color: #000000; border: 2px solid #000000;'; // EV Charging Yellow
        iconHtml = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
      } else if (isCombined) {
        bgStyle = 'background-color: #0F172A; color: #FACC15; border: 2px solid #FACC15;'; // Combined
        iconHtml = `<span style="font-size: 10px;">⚡🅿️</span>`;
      }

      el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          ${bgStyle}
          padding: ${isSelected ? '6px 10px' : '4px 8px'};
          border-radius: 9999px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          font-family: inherit;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
          user-select: none;
        ">
          ${iconHtml}
          <span>${priceText}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${isEv ? '#000000' : isCombined ? '#FACC15' : '#FFFFFF'};
          margin: 0 auto;
        "></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setActiveSelectedId(item._id);
        if (onSelectListing) {
          onSelectListing(item._id);
        }
        // Smooth camera ease to station
        map.easeTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 14),
          duration: 600,
        });
      });

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Auto-fit bounds if we have valid listings and no specific station selected
    if (validCoordinates.length > 0 && !activeSelectedId && mapLoaded) {
      const bounds = new maplibregl.LngLatBounds();
      validCoordinates.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        maxZoom: 15,
        duration: 800,
      });
    }
  }, [filteredListings, activeSelectedId, mapLoaded]);

  // Recenter map to all listings or user
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        essential: true,
      });
      return;
    }

    const validCoords = filteredListings
      .filter((l) => l.location?.coordinates && l.location.coordinates.length >= 2)
      .map((l) => l.location.coordinates as [number, number]);

    if (validCoords.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      validCoords.forEach((coord) => bounds.extend(coord));
      map.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 800,
      });
    } else {
      map.flyTo({
        center: initialCoordinates,
        zoom: zoom,
        essential: true,
      });
    }
  };

  // Locate user position using browser geolocation API
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationLoading(false);

        const map = mapInstanceRef.current;
        if (!map) return;

        // Create or update user location pin
        if (userMarkerRef.current) {
          userMarkerRef.current.setLngLat([longitude, latitude]);
        } else {
          const userEl = document.createElement('div');
          userEl.className = 'user-location-pin';
          userEl.innerHTML = `
            <div style="
              width: 18px;
              height: 18px;
              border-radius: 50%;
              background: #2563EB;
              border: 3px solid #FFFFFF;
              box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.4), 0 4px 10px rgba(0,0,0,0.3);
            "></div>
          `;
          userMarkerRef.current = new maplibregl.Marker({ element: userEl })
            .setLngLat([longitude, latitude])
            .addTo(map);
        }

        // Fly camera to user location
        map.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          essential: true,
          duration: 1000,
        });
      },
      (error) => {
        setLocationLoading(false);
        console.warn('Geolocation error:', error.message);
        if (error.code === error.PERMISSION_DENIED) {
          alert('Location permission was denied. You can still browse all stations on the map.');
        } else {
          alert('Unable to retrieve your location. Please check your device location settings.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // Zoom handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut({ duration: 300 });
  };

  const handleResetNorth = () => {
    mapInstanceRef.current?.resetNorthPitch({ duration: 400 });
  };

  // Compute straight-line distance if user location is available
  const straightLineDistance = useMemo(() => {
    if (!userLocation || !selectedListing?.location?.coordinates) return null;
    const [stationLng, stationLat] = selectedListing.location.coordinates;
    return calculateStraightLineDistanceKm(userLocation.lat, userLocation.lng, stationLat, stationLng);
  }, [userLocation, selectedListing]);

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border-2 border-neutral-200 shadow-md bg-neutral-100 flex flex-col ${className}`}
      style={{ height }}
    >
      {/* =========================================================================
          TOP FLOATING SEARCH & FILTER BAR (Zepto Modern Aesthetic)
          ========================================================================= */}
      <div className="absolute top-3 left-3 right-3 z-30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pointer-events-none">
        {/* Search input */}
        <div className="pointer-events-auto flex-1 flex items-center bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-neutral-300 shadow-lg text-xs font-bold text-neutral-800 transition focus-within:border-neutral-900">
          <Search className="w-4 h-4 text-neutral-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search stations, locality, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-neutral-900 placeholder:text-neutral-400 text-xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-neutral-400 hover:text-black rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          <button
            onClick={() => setServiceFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition shadow-md whitespace-nowrap ${
              serviceFilter === 'all'
                ? 'bg-black text-yellow-400 border border-black'
                : 'bg-white/95 text-neutral-700 hover:text-black border border-neutral-200'
            }`}
          >
            All ({listings.length})
          </button>
          <button
            onClick={() => setServiceFilter('charging')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition shadow-md flex items-center gap-1 whitespace-nowrap ${
              serviceFilter === 'charging'
                ? 'bg-yellow-400 text-black border border-yellow-500'
                : 'bg-white/95 text-neutral-700 hover:text-black border border-neutral-200'
            }`}
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>EV Charging</span>
          </button>
          <button
            onClick={() => setServiceFilter('parking')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition shadow-md flex items-center gap-1 whitespace-nowrap ${
              serviceFilter === 'parking'
                ? 'bg-black text-yellow-400 border border-black'
                : 'bg-white/95 text-neutral-700 hover:text-black border border-neutral-200'
            }`}
          >
            <Car className="w-3 h-3" />
            <span>Parking</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT-SIDE FLOATING MAP CONTROLS
          ========================================================================= */}
      <div className="absolute right-3 top-20 z-30 flex flex-col items-center gap-2">
        {/* Locate User button */}
        <button
          onClick={handleLocateMe}
          disabled={locationLoading}
          title="Locate my position"
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-300 shadow-lg text-neutral-900 hover:bg-yellow-400 hover:text-black hover:border-yellow-500 flex items-center justify-center transition active:scale-95 disabled:opacity-50"
        >
          {locationLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Navigation className={`w-4 h-4 ${userLocation ? 'text-blue-600 fill-blue-600' : ''}`} />
          )}
        </button>

        {/* Recenter / Fit bounds */}
        <button
          onClick={handleRecenter}
          title="Recenter stations"
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-300 shadow-lg text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Reset North / Compass */}
        <button
          onClick={handleResetNorth}
          title="Reset orientation"
          className="w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-300 shadow-lg text-neutral-900 hover:bg-neutral-100 flex items-center justify-center transition active:scale-95"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Zoom controls group */}
        <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md border border-neutral-300 shadow-lg overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-10 h-9 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition border-b border-neutral-200"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-10 h-9 flex items-center justify-center text-neutral-900 hover:bg-neutral-100 transition"
          >
            <Minus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAP CONTAINER
          ========================================================================= */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Loading overlay */}
      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
          <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border-2 border-neutral-200 shadow-xl">
            <Loader2 className="w-5 h-5 text-neutral-900 animate-spin" />
            <span className="text-xs font-black text-neutral-900 uppercase tracking-wider">
              Rendering MapLibre GL...
            </span>
          </div>
        </div>
      )}

      {/* Error state */}
      {mapError && (
        <div className="absolute bottom-4 left-4 right-4 z-40 bg-red-50 border-2 border-red-300 text-red-900 p-4 rounded-2xl shadow-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold">{mapError}</p>
            <p className="mt-1 text-red-700">
              Listing cards remain fully interactive below. Check network connectivity or tile provider.
            </p>
          </div>
          <button
            onClick={() => setMapError(null)}
            className="text-xs font-black px-2.5 py-1 bg-red-200 text-red-900 rounded-lg hover:bg-red-300"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =========================================================================
          RESPONSIVE BOTTOM SHEET / SELECTED STATION CARD (Zepto Style)
          ========================================================================= */}
      {selectedListing && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white rounded-3xl p-4 border-2 border-neutral-900 shadow-2xl space-y-3">
            {/* Header: Photo + Badge + Close */}
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 relative">
                <img
                  src={
                    selectedListing.photos?.[0] ||
                    'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400'
                  }
                  alt={selectedListing.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[10px] font-black text-yellow-400">
                  {selectedListing.serviceType === 'charging'
                    ? '⚡ EV'
                    : selectedListing.serviceType === 'parking'
                    ? '🅿️ PARK'
                    : '⚡+🅿️'}
                </span>
              </div>

              <div className="flex-1 min-w-0 pr-6 relative">
                <button
                  onClick={() => setActiveSelectedId(undefined)}
                  className="absolute -top-1 right-0 p-1 text-neutral-400 hover:text-black rounded-full"
                  title="Close station details"
                >
                  <X className="w-4 h-4" />
                </button>

                <h4 className="text-sm font-black text-neutral-900 truncate">
                  {selectedListing.title}
                </h4>
                <p className="text-xs text-neutral-500 truncate mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0 text-neutral-400" />
                  <span>
                    {selectedListing.address?.city || ''} ·{' '}
                    {selectedListing.address?.street?.split(',')[0] || 'Verified Location'}
                  </span>
                </p>

                {/* Distance Badge */}
                {straightLineDistance !== null ? (
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                    <Navigation className="w-2.5 h-2.5" />
                    <span>{straightLineDistance} km straight-line</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                    <span>Click 'Locate Me' for live distance</span>
                  </div>
                )}
              </div>
            </div>

            {/* Station Specs Pill (Actual Backend Data) */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-neutral-50 p-2.5 rounded-2xl border border-neutral-200">
              {/* Power / Ports */}
              {selectedListing.serviceType !== 'parking' && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                    Connector / Speed
                  </span>
                  <span className="font-extrabold text-neutral-900 text-xs">
                    {selectedListing.chargingPorts?.[0]?.powerKw
                      ? `${selectedListing.chargingPorts[0].powerKw} kW • ${
                          selectedListing.chargingPorts[0].connectorType || 'Fast'
                        }`
                      : 'High-Power EV Charger'}
                  </span>
                </div>
              )}

              {/* Price */}
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                  {selectedListing.serviceType === 'parking' ? 'Hourly Tariff' : 'Energy Rate'}
                </span>
                <span className="font-black text-neutral-900 text-xs">
                  {selectedListing.pricing?.chargingRatePerKwhPaise
                    ? `₹${Math.round(selectedListing.pricing.chargingRatePerKwhPaise / 100)} / kWh`
                    : selectedListing.pricing?.hourlyRatePaise
                    ? `₹${Math.round(selectedListing.pricing.hourlyRatePaise / 100)} / hr`
                    : 'Verified Rate'}
                </span>
              </div>
            </div>

            {/* Actions: Book Now + Google Maps Directions */}
            <div className="flex items-center gap-2 pt-1">
              <Link
                to={`/listings/${selectedListing._id}`}
                className="flex-1 py-2.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black rounded-xl text-center shadow-xs transition flex items-center justify-center gap-1.5 active:scale-95 border border-yellow-500/30"
              >
                <span>Book Station</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </Link>

              {selectedListing.location?.coordinates && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedListing.location.coordinates[1]},${selectedListing.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3.5 bg-black hover:bg-neutral-800 text-yellow-400 text-xs font-black rounded-xl shadow-xs transition flex items-center gap-1.5 active:scale-95 shrink-0"
                  title="Navigate with Google Maps"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
