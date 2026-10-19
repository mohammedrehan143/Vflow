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

export default router;
