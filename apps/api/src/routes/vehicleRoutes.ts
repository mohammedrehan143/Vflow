import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { VehicleService } from '../services/vehicleService';
import { CreateVehicleSchema, UpdateVehicleSchema } from '@vflow/shared';

const router = Router();

// All vehicle routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/vehicles - List customer's vehicles
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await VehicleService.getCustomerVehicles(req.user!.id);
    res.json({ success: true, vehicles });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/vehicles/default - Get customer's default vehicle
 */
router.get('/default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await VehicleService.getDefaultVehicle(req.user!.id);
    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/vehicles - Add new vehicle
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateVehicleSchema.parse(req.body);
    const vehicle = await VehicleService.addVehicle(req.user!.id, validated);
    res.status(201).json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/vehicles/:id - Update vehicle
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = UpdateVehicleSchema.parse(req.body);
    const vehicle = await VehicleService.updateVehicle(req.user!.id, req.params.id, validated);
    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/vehicles/:id/default - Set as default vehicle
 */
router.patch('/:id/default', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicle = await VehicleService.setDefaultVehicle(req.user!.id, req.params.id);
    res.json({ success: true, vehicle });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/vehicles/:id - Remove vehicle
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await VehicleService.deleteVehicle(req.user!.id, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
