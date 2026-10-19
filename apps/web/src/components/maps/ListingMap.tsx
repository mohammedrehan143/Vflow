import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { IListing } from '@vflow/shared';
import { Link } from 'react-router-dom';

interface ListingMapProps {
  listings: IListing[];
  center?: [number, number];
  zoom?: number;
  selectedId?: string;
  onSelectListing?: (id: string) => void;
}

export const ListingMap: React.FC<ListingMapProps> = ({
  listings,
  center = [12.9716, 77.5946], // Default Bangalore
  zoom = 13,
  selectedId,
  onSelectListing,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(center, zoom);

      // OpenStreetMap clean tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Custom SVG Pin creator
    listings.forEach((item) => {
      if (!item.location || !item.location.coordinates) return;
      const [lng, lat] = item.location.coordinates;

      const isEv = item.serviceType === 'charging' || item.serviceType === 'combined';
      const priceText = item.pricing?.hourlyRatePaise
        ? `₹${Math.round(item.pricing.hourlyRatePaise / 100)}`
        : item.pricing?.chargingRatePerKwhPaise
        ? `₹${Math.round(item.pricing.chargingRatePerKwhPaise / 100)}/u`
        : '🅿️';

      const pinColor = isEv ? '#059669' : '#0f172a';
      const isSelected = selectedId === item._id;

      const customHtml = `
        <div style="
          background-color: ${isSelected ? '#047857' : pinColor};
          color: white;
          padding: 4px 8px;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 11px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          white-space: nowrap;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.2s;
        ">
          ${isEv ? '⚡ ' : '🅿️ '}${priceText}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'vflow-custom-pin',
        html: customHtml,
        iconSize: [60, 24],
        iconAnchor: [30, 24],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupHtml = `
        <div style="padding: 10px; width: 220px; font-family: inherit;">
          <img src="${item.photos?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400'}" 
               style="width: 100%; height: 90px; object-fit: cover; border-radius: 6px; margin-bottom: 6px;" />
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.2;">
            ${item.title}
          </h4>
          <p style="margin: 0 0 6px; font-size: 11px; color: #64748b;">
            ${item.address?.city || ''} · ${item.address?.street?.split(',')[0] || ''}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 800; color: #059669; font-size: 13px;">${priceText}/hr</span>
            <a href="/listings/${item._id}" style="
              background: #059669;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
              text-decoration: none;
            ">Book Now</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (onSelectListing) onSelectListing(item._id);
      });

      markersRef.current.push(marker);
    });

    // If there are coordinates, fit map bounds
    if (listings.length > 0) {
      const validCoords = listings
        .filter((l) => l.location?.coordinates)
        .map((l) => [l.location.coordinates[1], l.location.coordinates[0]] as [number, number]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [listings, selectedId]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
