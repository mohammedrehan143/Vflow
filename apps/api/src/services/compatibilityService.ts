import { IVehicle, IChargingPort, ConnectorType, ChargerType } from '@vflow/shared';

export interface CompatibilityResult {
  isCompatible: boolean;
  requiresVerification: boolean;
  status: 'compatible' | 'incompatible' | 'unknown';
  reason?: string;
  warning?: string;
  effectiveChargingPowerKw?: number;
  chargerRatedPowerKw?: number;
  vehicleMaxSupportedPowerKw?: number;
  connectorMatch: boolean;
}

export class CompatibilityService {
  /**
   * Check compatibility between a customer vehicle and an EV charger port
   */
  static checkCompatibility(
    vehicle: Partial<IVehicle> | null | undefined,
    chargerPort: {
      chargerType: ChargerType;
      connectorType: string;
      powerKw: number;
    }
  ): CompatibilityResult {
    // If no vehicle selected, return unknown verification state
    if (!vehicle) {
      return {
        isCompatible: true,
        requiresVerification: true,
        status: 'unknown',
        warning: 'No vehicle selected. Please verify connector and charging specs before reserving.',
        effectiveChargingPowerKw: chargerPort.powerKw,
        chargerRatedPowerKw: chargerPort.powerKw,
        connectorMatch: true,
      };
    }

    // 1. Powertrain check
    const isElectricCapable =
      vehicle.powertrain === 'electric' ||
      vehicle.powertrain === 'hybrid' ||
      vehicle.vehicleType === 'electric_car' ||
      vehicle.vehicleType === 'electric_two_wheeler' ||
      vehicle.vehicleType === 'electric_three_wheeler' ||
      vehicle.vehicleType === 'hybrid_car';

    if (!isElectricCapable) {
      return {
        isCompatible: false,
        requiresVerification: false,
        status: 'incompatible',
        reason: `${vehicle.manufacturer} ${vehicle.model} is a conventional combustion engine (${vehicle.powertrain || 'ICE'}) and does not support EV charging.`,
        connectorMatch: false,
      };
    }

    const vehicleConnectors = vehicle.supportedConnectorTypes || [];
    const chargerConnector = chargerPort.connectorType;

    // 2. Connector match logic
    let connectorMatches = false;

    if (vehicleConnectors.length === 0) {
      // Vehicle connectors not configured by user
      return {
        isCompatible: true,
        requiresVerification: true,
        status: 'unknown',
        warning: `Connector specifications for ${vehicle.model} are unknown. Please check your car manual for ${chargerConnector} compatibility.`,
        effectiveChargingPowerKw: chargerPort.powerKw,
        chargerRatedPowerKw: chargerPort.powerKw,
        connectorMatch: false,
      };
    }

    // Standard matching
    if (vehicleConnectors.includes(chargerConnector as ConnectorType)) {
      connectorMatches = true;
    } else if (chargerConnector === 'Type 2' && vehicleConnectors.includes('CCS2')) {
      // CCS2 inlets in India accept Type 2 AC plugs
      connectorMatches = true;
    } else if (chargerConnector === '15A 3-Pin') {
      // Domestic 3-pin socket works with portable EVSE for most EVs
      connectorMatches = true;
    }

    if (!connectorMatches) {
      return {
        isCompatible: false,
        requiresVerification: false,
        status: 'incompatible',
        reason: `Incompatible connector: Charger provides ${chargerConnector}, but vehicle supports [${vehicleConnectors.join(', ')}].`,
        connectorMatch: false,
      };
    }

    // 3. Power rate calculation (AC vs DC)
    const isDc = chargerPort.chargerType === 'DC' || chargerPort.chargerType === 'DC_Fast';
    let maxVehiclePower = isDc ? vehicle.maxDcPowerKw : vehicle.maxAcPowerKw;

    if (!maxVehiclePower && isElectricCapable) {
      // Defaults if not specified: AC 7.4 kW, DC 50 kW
      maxVehiclePower = isDc ? 50 : 7.4;
    }

    const effectivePowerKw = maxVehiclePower
      ? Math.min(chargerPort.powerKw, maxVehiclePower)
      : chargerPort.powerKw;

    const warning =
      effectivePowerKw < chargerPort.powerKw
        ? `Charging power will be throttled to your vehicle's max limit of ${effectivePowerKw} kW (charger can deliver up to ${chargerPort.powerKw} kW).`
        : undefined;

    return {
      isCompatible: true,
      requiresVerification: false,
      status: 'compatible',
      warning,
      effectiveChargingPowerKw: effectivePowerKw,
      chargerRatedPowerKw: chargerPort.powerKw,
      vehicleMaxSupportedPowerKw: maxVehiclePower,
      connectorMatch: true,
    };
  }
}
