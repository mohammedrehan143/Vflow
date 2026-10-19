import { Router } from 'express';
import { SettlementService } from '../services/settlementService';
import { ProviderService } from '../services/providerService';
import { PayoutModel } from '../models/Payout';
import { FinancialLedgerModel } from '../models/FinancialLedger';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Provider views payout history
router.get('/mine', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const payouts = await PayoutModel.find({ providerId: provider._id.toString() }).sort({ createdAt: -1 });
    res.json({ success: true, payouts });
  } catch (err) {
    next(err);
  }
});

// Provider views financial ledger
router.get('/ledger', authenticate, async (req, res, next) => {
  try {
    const provider = await ProviderService.getProviderByAuthId(req.user!.id);
    if (!provider) {
      res.status(404).json({ success: false, error: 'Provider profile not found' });
      return;
    }

    const ledger = await FinancialLedgerModel.find({ providerId: provider._id.toString() }).sort({ createdAt: -1 });
    res.json({ success: true, ledger });
  } catch (err) {
    next(err);
  }
});

// Trigger next-day payout settlement run
router.post('/process-daily', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const targetDate = req.body.targetDate; // Optional "YYYY-MM-DD"
    const result = await SettlementService.processDailyPayouts(targetDate);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// Admin executes payout
router.post('/:id/execute', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const reference = req.body.referenceNumber || `BANK-TRF-${Date.now()}`;
    const payout = await SettlementService.executePayout(req.params.id, req.user!.id, reference);
    res.json({ success: true, payout });
  } catch (err) {
    next(err);
  }
});

export default router;
