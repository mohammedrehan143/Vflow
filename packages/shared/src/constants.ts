export const PLATFORM_CONFIG = {
  DEFAULT_COMMISSION_PERCENTAGE: 10, // 10%
  GST_PERCENTAGE: 18, // 18% GST on platform service fee
  MINIMUM_PAYOUT_AMOUNT_PAISE: 10000, // ₹100 min payout threshold
  CURRENCY: 'INR',
  CUTOFF_HOUR_UTC: 18, // 18:30 UTC = 00:00 IST (midnight) for next calendar day settlement
  SUPPORT_PHONE: '+91 80 4567 8900',
  SUPPORT_EMAIL: 'support@vflow.in',
  BRAND_NAME: 'VFlow',
  TAGLINE: "Find parking. Charge your EV. Explore what's nearby."
};

export const VEHICLE_RESTRICTION_LABELS: Record<string, string> = {
  two_wheeler: '2-Wheeler (Bike / Scooter)',
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  suv: 'SUV / MUV',
  ev: 'Electric Vehicle',
  commercial: 'Commercial / Tempo'
};

export const CONNECTOR_TYPE_LABELS: Record<string, string> = {
  'Type 2': 'Type 2 AC (up to 22 kW)',
  'CCS2': 'CCS-2 DC Fast (up to 350 kW)',
  'CHAdeMO': 'CHAdeMO DC Fast (up to 50 kW)',
  'GB/T': 'GB/T DC Fast (up to 15 kW)',
  '15A 3-Pin': '15A Domestic 3-Pin Socket (3.3 kW)',
  'Bharat AC-001': 'Bharat AC-001 (10 kW / 3.3 kW x 3)',
  'Bharat DC-001': 'Bharat DC-001 (15 kW / 48V-72V DC)'
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  electric_car: 'Electric Car (EV)',
  petrol_car: 'Petrol Car',
  diesel_car: 'Diesel Car',
  hybrid_car: 'Hybrid Car (PHEV / HEV)',
  electric_two_wheeler: 'Electric Two-Wheeler (Scooter / Bike)',
  petrol_two_wheeler: 'Petrol Two-Wheeler',
  electric_three_wheeler: 'Electric Three-Wheeler (Auto)',
  other: 'Other Vehicle'
};

export const POWERTRAIN_LABELS: Record<string, string> = {
  electric: 'Pure Electric (Battery EV)',
  petrol: 'Petrol (ICE)',
  diesel: 'Diesel (ICE)',
  hybrid: 'Hybrid (PHEV / Strong Hybrid)',
  other: 'Other'
};

export const COMMON_CHARGER_POWERS_KW = [3.3, 7.4, 11, 22, 30, 50, 60, 120, 150];

export const CANCELLATION_POLICIES = {
  flexible: {
    name: 'Flexible',
    description: 'Full refund if cancelled up to 2 hours before scheduled arrival time.'
  },
  moderate: {
    name: 'Moderate',
    description: 'Full refund if cancelled up to 24 hours before arrival, 50% refund thereafter.'
  },
  strict: {
    name: 'Strict',
    description: '50% refund if cancelled up to 48 hours before arrival, no refund thereafter.'
  }
};

export const HANGOUT_CATEGORIES: { id: string; label: string; icon: string }[] = [
  { id: 'cafe', label: 'Cafes & Bakeries', icon: 'Coffee' },
  { id: 'restaurant', label: 'Restaurants', icon: 'Utensils' },
  { id: 'mall', label: 'Shopping Malls', icon: 'ShoppingBag' },
  { id: 'gaming_zone', label: 'Gaming & Fun Zones', icon: 'Gamepad2' },
  { id: 'park', label: 'Parks & Nature', icon: 'Trees' },
  { id: 'coworking', label: 'Coworking Spaces', icon: 'Laptop' },
  { id: 'cinema', label: 'Cinemas & Theatres', icon: 'Film' },
  { id: 'tourist_attraction', label: 'Sightseeing & Attractions', icon: 'Compass' }
];
