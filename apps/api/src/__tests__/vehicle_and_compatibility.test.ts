import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { CompatibilityService } from '../services/compatibilityService';
import { CreateVehicleSchema, RoleSelectionSchema, IVehicle } from '@vflow/shared';

describe('Vehicle Management & Charger Compatibility Service', () => {
  it('validates customer vehicle creation across various vehicle types and powertrains', () => {
    const electricCar = {
      vehicleType: 'electric_car' as const,
      powertrain: 'electric' as const,
      manufacturer: 'Tata Motors',
      model: 'Nexon EV Max',
      registrationNumber: 'KA-01-EQ-9999',
      supportedConnectorTypes: ['CCS2', 'Type 2'],
      maxAcPowerKw: 7.2,
      maxDcPowerKw: 50,
      isDefault: true,
    };

    const parsedElectric = CreateVehicleSchema.safeParse(electricCar);
    expect(parsedElectric.success).toBe(true);

    const petrolTwoWheeler = {
      vehicleType: 'petrol_two_wheeler' as const,
      powertrain: 'petrol' as const,
      manufacturer: 'Honda',
      model: 'Activa 6G',
      registrationNumber: 'KA-03-HA-1234',
      isDefault: false,
    };

    const parsedPetrol = CreateVehicleSchema.safeParse(petrolTwoWheeler);
    expect(parsedPetrol.success).toBe(true);

    const electricThreeWheeler = {
      vehicleType: 'electric_three_wheeler' as const,
      powertrain: 'electric' as const,
      manufacturer: 'Mahindra',
      model: 'Treo Zor',
      supportedConnectorTypes: ['15A_3Pin', 'Bharat AC-001'],
      maxAcPowerKw: 3.3,
    };

    const parsedThreeWheeler = CreateVehicleSchema.safeParse(electricThreeWheeler);
    expect(parsedThreeWheeler.success).toBe(true);
  });

  it('rejects combustion vehicles (petrol/diesel) attempting EV charging', () => {
    const dieselCar: Partial<IVehicle> = {
      vehicleType: 'diesel_car',
      powertrain: 'diesel',
      manufacturer: 'Toyota',
      model: 'Innova Crysta',
    };

    const result = CompatibilityService.checkCompatibility(dieselCar, {
      chargerType: 'AC',
      connectorType: 'Type 2',
      powerKw: 22,
    });

    expect(result.isCompatible).toBe(false);
    expect(result.status).toBe('incompatible');
    expect(result.reason).toContain('combustion engine');
  });

  it('validates Type 2 connector compatibility and throttles to vehicle max power', () => {
    const mgZsEv: Partial<IVehicle> = {
      vehicleType: 'electric_car',
      powertrain: 'electric',
      manufacturer: 'MG',
      model: 'ZS EV',
      supportedConnectorTypes: ['CCS2', 'Type 2'],
      maxAcPowerKw: 7.4,
      maxDcPowerKw: 50,
    };

    // 22 kW AC public charger
    const result = CompatibilityService.checkCompatibility(mgZsEv, {
      chargerType: 'AC',
      connectorType: 'Type 2',
      powerKw: 22,
    });

    expect(result.isCompatible).toBe(true);
    expect(result.status).toBe('compatible');
    expect(result.effectiveChargingPowerKw).toBe(7.4); // Capped by car's AC onboard charger
    expect(result.chargerRatedPowerKw).toBe(22);
    expect(result.warning).toContain('throttled');
  });

  it('allows CCS2 vehicles to connect to Type 2 AC chargers (IEC 62196)', () => {
    const nexonEv: Partial<IVehicle> = {
      vehicleType: 'electric_car',
      powertrain: 'electric',
      manufacturer: 'Tata Motors',
      model: 'Nexon EV',
      supportedConnectorTypes: ['CCS2'], // Only CCS2 listed on car specs
      maxAcPowerKw: 3.3,
      maxDcPowerKw: 25,
    };

    const result = CompatibilityService.checkCompatibility(nexonEv, {
      chargerType: 'AC',
      connectorType: 'Type 2',
      powerKw: 7.2,
    });

    // CCS2 vehicles have an integrated Type-2 AC inlet
    expect(result.isCompatible).toBe(true);
    expect(result.effectiveChargingPowerKw).toBe(3.3);
  });

  it('flags connector mismatch when vehicle does not support charger connector', () => {
    const nissanLeaf: Partial<IVehicle> = {
      vehicleType: 'electric_car',
      powertrain: 'electric',
      manufacturer: 'Nissan',
      model: 'Leaf',
      supportedConnectorTypes: ['CHAdeMO', 'Type 1'],
      maxDcPowerKw: 50,
    };

    const result = CompatibilityService.checkCompatibility(nissanLeaf, {
      chargerType: 'DC',
      connectorType: 'CCS2',
      powerKw: 60,
    });

    expect(result.isCompatible).toBe(false);
    expect(result.connectorMatch).toBe(false);
    expect(result.reason).toContain('Incompatible connector');
  });

  it('provides a verification warning when no vehicle is selected', () => {
    const result = CompatibilityService.checkCompatibility(null, {
      chargerType: 'DC',
      connectorType: 'CCS2',
      powerKw: 60,
    });

    expect(result.isCompatible).toBe(true);
    expect(result.requiresVerification).toBe(true);
    expect(result.status).toBe('unknown');
    expect(result.warning).toContain('verify');
  });

  it('validates post-registration role selection', () => {
    const validDriver = { role: 'customer' as const };
    const validHost = { role: 'provider' as const };
    const invalidRole = { role: 'superhero' };

    expect(RoleSelectionSchema.safeParse(validDriver).success).toBe(true);
    expect(RoleSelectionSchema.safeParse(validHost).success).toBe(true);
    expect(RoleSelectionSchema.safeParse(invalidRole).success).toBe(false);
  });

  it('cryptographically verifies simulated Razorpay payment signature', () => {
    const keySecret = 'test_secret_key_12345';
    const orderId = 'order_test_98765';
    const paymentId = 'pay_test_45678';

    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(generatedSignature).toBe(expectedSignature);
    expect(crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(expectedSignature))).toBe(true);
  });
});
