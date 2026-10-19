import { IHangoutPlace, HangoutCategory } from '@vflow/shared';

// Pre-defined quality destination templates for fallback / offline / rapid lookup
const CATEGORY_TEMPLATES: Record<HangoutCategory, Array<{ name: string; prefix: string; avgRating: number; image: string }>> = {
  cafe: [
    { name: 'Third Wave Coffee', prefix: 'Artisanal Cafe', avgRating: 4.6, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80' },
    { name: 'Blue Tokai Coffee Roasters', prefix: 'Specialty Roastery', avgRating: 4.7, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80' },
    { name: 'Starbucks Coffee', prefix: 'Premium Cafe', avgRating: 4.4, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cafe Coffee Day Lounge', prefix: 'Relaxed Cafe', avgRating: 4.2, image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=600&q=80' }
  ],
  restaurant: [
    { name: 'Toscano Italian Bistro', prefix: 'Fine Dining', avgRating: 4.5, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80' },
    { name: 'Punjab Grill', prefix: 'North Indian Cuisine', avgRating: 4.6, image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80' },
    { name: 'Mainland China', prefix: 'Pan-Asian Restaurant', avgRating: 4.4, image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80' },
    { name: 'Barbeque Nation', prefix: 'Buffet & Grill', avgRating: 4.3, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80' }
  ],
  mall: [
    { name: 'Nexus Phoenix Marketcity', prefix: 'Mega Shopping Mall', avgRating: 4.7, image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=600&q=80' },
    { name: 'Forum Mall & Multiplex', prefix: 'Retail & Entertainment', avgRating: 4.5, image: 'https://images.unsplash.com/photo-1567449303078-57ad995bd301?auto=format&fit=crop&w=600&q=80' },
    { name: 'Orion Gateway Mall', prefix: 'Lakeside Mall', avgRating: 4.6, image: 'https://images.unsplash.com/photo-1581404476143-fb31d742929f?auto=format&fit=crop&w=600&q=80' }
  ],
  gaming_zone: [
    { name: 'Smaaash VR & Bowling Arena', prefix: 'Sports & VR Center', avgRating: 4.5, image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80' },
    { name: 'Timezone Arcade & Laser Tag', prefix: 'Family Amusement', avgRating: 4.4, image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Torq03 Karting & Gaming', prefix: 'Go-Karting Track', avgRating: 4.7, image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=600&q=80' }
  ],
  park: [
    { name: 'Cubbon Biodiversity Park', prefix: 'Public Park & Garden', avgRating: 4.8, image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Lalbagh Botanical Gardens', prefix: 'Historical Park', avgRating: 4.7, image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=600&q=80' },
    { name: 'Greenview Lake Promenade', prefix: 'Walking Trail', avgRating: 4.4, image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' }
  ],
  coworking: [
    { name: 'WeWork Coworking & Lounge', prefix: 'Flexible Workspace', avgRating: 4.6, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80' },
    { name: 'Innov8 High-Speed Workspace', prefix: 'Hot Desks & Cafe', avgRating: 4.5, image: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=600&q=80' }
  ],
  cinema: [
    { name: 'PVR INOX IMAX', prefix: 'Multiplex Cinema', avgRating: 4.6, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' },
    { name: 'Cinepolis 4DX', prefix: 'Entertainment Cinema', avgRating: 4.5, image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80' }
  ],
  shopping: [
    { name: 'Central High Street Commercial Hub', prefix: 'Shopping District', avgRating: 4.4, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80' }
  ],
  tourist_attraction: [
    { name: 'Heritage Palace & Arts Pavillion', prefix: 'Historical Landmark', avgRating: 4.7, image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80' }
  ]
};

export class NearbyService {
  /**
   * Haversine formula distance in meters
   */
  static calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }

  /**
   * Discover destinations near given coordinates
   */
  static getNearbyHangouts(
    lat: number,
    lng: number,
    categoryFilter?: HangoutCategory,
    maxDistanceKm: number = 3
  ): IHangoutPlace[] {
    const places: IHangoutPlace[] = [];
    const categoriesToInclude = categoryFilter
      ? [categoryFilter]
      : (Object.keys(CATEGORY_TEMPLATES) as HangoutCategory[]);

    let index = 1;

    for (const cat of categoriesToInclude) {
      const templates = CATEGORY_TEMPLATES[cat] || [];
      for (const tpl of templates) {
        // Deterministic offset within radius based on index and coordinates
        const offsetAngle = (index * 47) % 360;
        const distRatio = 0.2 + ((index * 23) % 80) / 100;
        const distanceMeters = Math.round(distRatio * maxDistanceKm * 1000);

        // Approximate 1 deg ~ 111km
        const dLat = (distanceMeters / 111000) * Math.cos((offsetAngle * Math.PI) / 180);
        const dLng = (distanceMeters / (111000 * Math.cos((lat * Math.PI) / 180))) * Math.sin((offsetAngle * Math.PI) / 180);

        const placeLat = Number((lat + dLat).toFixed(6));
        const placeLng = Number((lng + dLng).toFixed(6));

        // Walking speed ~ 4.5 km/h => ~75 meters/min
        const walkingMinutes = Math.max(1, Math.round(distanceMeters / 75));
        // Driving speed ~ 25 km/h in city traffic => ~400 meters/min
        const drivingMinutes = Math.max(1, Math.round(distanceMeters / 400));

        places.push({
          id: `place_${cat}_${index}`,
          name: tpl.name,
          category: cat,
          distanceMeters,
          walkingMinutes,
          drivingMinutes,
          address: `${tpl.prefix}, within ${distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(1)}km`}`,
          rating: tpl.avgRating,
          reviewCount: 120 + (index * 37),
          openingHours: '10:00 AM – 11:00 PM',
          mapDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${placeLat},${placeLng}`,
          imageUrl: tpl.image
        });

        index++;
      }
    }

    // Sort by distance
    return places.sort((a, b) => a.distanceMeters - b.distanceMeters);
  }
}
