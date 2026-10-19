import { VehicleModel, IVehicleDocument } from '../models/Vehicle';
import { IVehicle, CustomerVehicleType, PowertrainType, ConnectorType } from '@vflow/shared';

export class VehicleService {
  /**
   * Get all vehicles belonging to a customer
   */
  static async getCustomerVehicles(userId: string): Promise<IVehicleDocument[]> {
    return VehicleModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  }

  /**
   * Get customer's default vehicle
   */
  static async getDefaultVehicle(userId: string): Promise<IVehicleDocument | null> {
    const defaultVehicle = await VehicleModel.findOne({ userId, isDefault: true });
    if (defaultVehicle) return defaultVehicle;
    return VehicleModel.findOne({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Add a new vehicle for a customer
   */
  static async addVehicle(
    userId: string,
    data: {
      vehicleType: CustomerVehicleType;
      powertrain: PowertrainType;
      manufacturer: string;
      model: string;
      registrationNumber?: string;
      supportedConnectorTypes?: ConnectorType[];
      maxAcPowerKw?: number;
      maxDcPowerKw?: number;
      batteryCapacityKwh?: number;
      isDefault?: boolean;
    }
  ): Promise<IVehicleDocument> {
    const existingCount = await VehicleModel.countDocuments({ userId });
    const isDefault = data.isDefault || existingCount === 0;

    if (isDefault) {
      await VehicleModel.updateMany({ userId }, { isDefault: false });
    }

    const vehicle = await VehicleModel.create({
      userId,
      ...data,
      isDefault,
    });

    return vehicle;
  }

  /**
   * Update an existing vehicle with customer ownership check
   */
  static async updateVehicle(
    userId: string,
    vehicleId: string,
    updateData: Partial<IVehicle>
  ): Promise<IVehicleDocument> {
    const vehicle = await VehicleModel.findOne({ _id: vehicleId, userId });
    if (!vehicle) {
      throw new Error('Vehicle not found or you are not authorized to edit it');
    }

    if (updateData.isDefault) {
      await VehicleModel.updateMany({ userId, _id: { $ne: vehicleId } }, { isDefault: false });
    }

    Object.assign(vehicle, updateData);
    await vehicle.save();
    return vehicle;
  }

  /**
   * Set vehicle as default
   */
  static async setDefaultVehicle(userId: string, vehicleId: string): Promise<IVehicleDocument> {
    const vehicle = await VehicleModel.findOne({ _id: vehicleId, userId });
    if (!vehicle) {
      throw new Error('Vehicle not found or unauthorized');
    }

    await VehicleModel.updateMany({ userId }, { isDefault: false });
    vehicle.isDefault = true;
    await vehicle.save();
    return vehicle;
  }

  /**
   * Delete a vehicle with customer ownership check
   */
  static async deleteVehicle(userId: string, vehicleId: string): Promise<{ success: boolean }> {
    const vehicle = await VehicleModel.findOne({ _id: vehicleId, userId });
    if (!vehicle) {
      throw new Error('Vehicle not found or unauthorized to delete');
    }

    const wasDefault = vehicle.isDefault;
    await VehicleModel.deleteOne({ _id: vehicleId, userId });

    // If default vehicle was deleted, promote another vehicle to default
    if (wasDefault) {
      const remaining = await VehicleModel.findOne({ userId }).sort({ createdAt: -1 });
      if (remaining) {
        remaining.isDefault = true;
        await remaining.save();
      }
    }

    return { success: true };
  }
}
