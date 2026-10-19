import { Router } from 'express';
import { NearbyService } from '../services/nearbyService';
import { NearbySearchQuerySchema } from '@vflow/shared';

const router = Router();

// Get nearby hangouts by coordinates and optional category filter
router.get('/', async (req, res, next) => {
  try {
    const validated = NearbySearchQuerySchema.parse({
      lat: req.query.lat,
      lng: req.query.lng,
      radiusKm: req.query.radiusKm || 3,
      category: req.query.category
    });

    const hangouts = NearbyService.getNearbyHangouts(
      validated.lat,
      validated.lng,
      validated.category as any,
      validated.radiusKm
    );

    res.json({ success: true, count: hangouts.length, hangouts });
  } catch (err) {
    next(err);
  }
});

export default router;
