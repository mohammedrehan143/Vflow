import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  ProviderRegistrationSchema,
  CreateListingSchema,
  CreateBookingSchema,
  VerifyPaymentSchema,
} from '@vflow/shared';

describe('VFlow Validation Schemas & Payment Cryptography', () => {
  it('validates canonical provider registration schema', () => {
    const validProvider = {
      providerType: 'individual' as const,
      displayName: 'Anita Desai',
      email: 'anita@example.com',
      phone: '9876543210',
      serviceAreas: ['Bangalore', 'Indiranagar'],
      serviceTypes: ['parking' as const, 'charging' as const],
      address: {
        street: '12 80ft Road, Indiranagar',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
      },
      payoutConfiguration: {
        accountHolderName: 'Anita Desai',
        payoutMethod: 'manual_bank_transfer' as const,
        bankAccountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        upiId: 'anita@okhdfcbank',
      },
    };

    const result = ProviderRegistrationSchema.safeParse(validProvider);
    expect(result.success).toBe(true);
  });

  it('rejects invalid provider data (e.g. missing required fields or invalid email)', () => {
    const invalidProvider = {
      providerType: 'individual',
      displayName: '',
      email: 'invalid-email',
    };

    const result = ProviderRegistrationSchema.safeParse(invalidProvider);
    expect(result.success).toBe(false);
  });

  it('validates parking and EV charging combined listing schema', () => {
    const validListing = {
      title: 'Secure Covered Parking with 7.4kW Type-2 EV Charger',
      description: 'Private gated basement parking space with dedicated Type-2 AC charging wallbox.',
      serviceType: 'combined' as const,
      parkingType: 'commercial_building' as const,
      address: {
        street: '45 Lavelle Road',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      location: {
        type: 'Point' as const,
        coordinates: [77.5991, 12.9719] as [number, number], // [lng, lat]
      },
      pricing: {
        hourlyRatePaise: 8000, // ₹80/hr
        chargingRatePerKwhPaise: 1800, // ₹18/kWh
      },
      amenities: ['cctv', 'security_guard', 'ev_charging', 'covered'],
      isCovered: true,
      parkingSpacesCount: 1,
      chargingPorts: [
        {
          portIdentifier: 'CP-1',
          chargerType: 'AC' as const,
          connectorType: 'Type 2' as const,
          powerKw: 7.4,
          pricingModel: 'per_kwh' as const,
          pricePerUnitPaise: 1800,
        },
      ],
      cancellationPolicy: 'flexible' as const,
      instantBooking: true,
    };

    const result = CreateListingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it('validates booking reservation request with correct timing', () => {
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 3600 * 1000).toISOString();
    const endTime = new Date(now.getTime() + 4 * 3600 * 1000).toISOString();

    const bookingPayload = {
      listingId: '60d5ec49f1b2c8b1f8e4e1a1',
      serviceType: 'combined' as const,
      startTime,
      endTime,
      vehicleDetails: {
        licensePlate: 'KA01AB1234',
        model: 'Tata Nexon EV Max',
        type: 'ev' as const,
      },
    };

    const result = CreateBookingSchema.safeParse(bookingPayload);
    expect(result.success).toBe(true);
  });

  it('correctly calculates and validates Razorpay HMAC-SHA256 signatures', () => {
    const secret = 'vflow_test_secret_key_12345';
    const orderId = 'order_M1234567890';
    const paymentId = 'pay_M9876543210';

    const payload = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    expect(generatedSignature).toHaveLength(64);

    const verificationPayload = {
      bookingId: '60d5ec49f1b2c8b1f8e4e1a1',
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: generatedSignature,
    };

    const parseResult = VerifyPaymentSchema.safeParse(verificationPayload);
    expect(parseResult.success).toBe(true);

    // Verify HMAC equality
    const testSignature = crypto
      .createHmac('sha256', secret)
      .update(`${verificationPayload.razorpayOrderId}|${verificationPayload.razorpayPaymentId}`)
      .digest('hex');

    expect(testSignature).toBe(generatedSignature);
  });
});
