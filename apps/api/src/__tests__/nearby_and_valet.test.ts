import { describe, it, expect } from 'vitest';
import { NearbyService } from '../services/nearbyService';
import { WaitlistSubmissionSchema } from '@vflow/shared';

describe('NearbyService & Valet Coming Soon', () => {
  it('calculates accurate Haversine distance between two known coordinates', () => {
    // Bangalore MG Road (12.9754, 77.6066) to Brigade Road junction (~500m away, 12.9719, 77.6070)
    const distanceMeters = NearbyService.calculateDistanceMeters(12.9754, 77.6066, 12.9719, 77.6070);
    expect(distanceMeters).toBeGreaterThan(300);
    expect(distanceMeters).toBeLessThan(700);
  });

  it('generates structured destination list sorted by proximity', () => {
    const lat = 12.9716;
    const lng = 77.5946;
    const places = NearbyService.getNearbyHangouts(lat, lng, 'cafe', 3);

    expect(places.length).toBeGreaterThan(0);
    places.forEach((p) => {
      expect(p.category).toBe('cafe');
      expect(p.distanceMeters).toBeGreaterThan(0);
      expect(p.walkingMinutes).toBeGreaterThan(0);
      expect(p.drivingMinutes).toBeGreaterThan(0);
      expect(p.mapDirectionsUrl).toContain('google.com/maps/dir');
    });

    // Check ascending sort order
    for (let i = 1; i < places.length; i++) {
      expect(places[i].distanceMeters).toBeGreaterThanOrEqual(places[i - 1].distanceMeters);
    }
  });

  it('validates valet waitlist submission schema with required contact info', () => {
    const validWaitlist = {
      name: 'Rahul Sharma',
      email: 'driver@example.com',
      phone: '9876543210',
      city: 'Bangalore',
      vehicleModel: 'Hyundai Ioniq 5',
      interestedIn: 'valet_parking' as const,
      notes: 'Interested in early pilot access'
    };

    const parsed = WaitlistSubmissionSchema.safeParse(validWaitlist);
    expect(parsed.success).toBe(true);

    // Invalid email fails
    const invalidEmail = { ...validWaitlist, email: 'not-an-email' };
    const invalidResult = WaitlistSubmissionSchema.safeParse(invalidEmail);
    expect(invalidResult.success).toBe(false);

    // Invalid phone fails
    const invalidPhone = { ...validWaitlist, phone: '123' };
    const invalidPhoneResult = WaitlistSubmissionSchema.safeParse(invalidPhone);
    expect(invalidPhoneResult.success).toBe(false);
  });
});
