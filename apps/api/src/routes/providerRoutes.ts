import { Router } from 'express';
import { ProviderService } from '../services/providerService';
import { authenticate, requireRole } from '../middleware/auth';
import { ProviderRegistrationSchema, PayoutConfigurationSchema } from '@vflow/shared';

const router = Router();

// Register as a provider
router.post('/register', authenticate, async (req, res, next) => {
  try {
    const validated = ProviderRegistrationSchema.parse(req.body);
    const provider = await ProviderService.registerOrGetProvider(req.user!.id, validated);
    res.status(201).json({ success: true, provider });
  } catch (err) {
    next(err);
  }
});

// Get authenticated provider profile
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found for this account' });
      return;
    }
    res.json({ success: true, provider });
  } catch (err) {
    next(err);
  }
});

// Provider dashboard overview
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const overview = await ProviderService.getProviderDashboardOverview(provider._id.toString());
    res.json({ success: true, overview });
  } catch (err) {
    next(err);
  }
});

// Update payout configuration
router.put('/payout-config', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const validated = PayoutConfigurationSchema.parse(req.body);
    provider.payoutConfiguration = validated;
    provider.payoutAccountStatus = 'active';
    await provider.save();

    res.json({ success: true, provider });
  } catch (err) {
    next(err);
  }
});

// Get provider resources (spaces, stations, ports)
router.get('/resources', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const { ListingService } = await import('../services/listingService');
    const resources = await ListingService.getProviderResources(provider._id.toString());
    res.json({ success: true, resources });
  } catch (err) {
    next(err);
  }
});

// Update individual parking space
router.patch('/resources/spaces/:id', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const { ListingService } = await import('../services/listingService');
    const updated = await ListingService.updateParkingSpace(req.params.id, provider._id.toString(), req.body);
    res.json({ success: true, space: updated });
  } catch (err) {
    next(err);
  }
});

// Update individual charging port
router.patch('/resources/ports/:id', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const { ListingService } = await import('../services/listingService');
    const updated = await ListingService.updateChargingPort(req.params.id, provider._id.toString(), req.body);
    res.json({ success: true, port: updated });
  } catch (err) {
    next(err);
  }
});

// Update individual charging station
router.patch('/resources/stations/:id', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const { ListingService } = await import('../services/listingService');
    const updated = await ListingService.updateChargingStation(req.params.id, provider._id.toString(), req.body);
    res.json({ success: true, station: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
