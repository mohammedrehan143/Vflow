import { Router } from 'express';
import { AdminService } from '../services/adminService';
import { ProviderModel } from '../models/Provider';
import { ListingModel } from '../models/Listing';
import { BookingModel } from '../models/Booking';
import { PayoutModel } from '../models/Payout';
import { FinancialLedgerModel } from '../models/FinancialLedger';
import { UserModel } from '../models/User';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// Protect all admin endpoints with admin role check
router.use(authenticate, requireRole('admin'));

// Platform-wide metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const metrics = await AdminService.getPlatformMetrics();
    res.json({ success: true, metrics });
  } catch (err) {
    next(err);
  }
});

// List all providers
router.get('/providers', async (req, res, next) => {
  try {
    const query: any = {};
    if (req.query.status) {
      query.verificationStatus = req.query.status;
    }
    const providers = await ProviderModel.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: providers.length, providers });
  } catch (err) {
    next(err);
  }
});

// Update provider verification status
router.patch('/providers/:id/status', async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'status is required' });
      return;
    }
    const provider = await AdminService.updateProviderStatus(req.params.id, status, req.user!.id, reason);
    res.json({ success: true, provider });
  } catch (err) {
    next(err);
  }
});

// List all listings for moderation
router.get('/listings', async (req, res, next) => {
  try {
    const listings = await ListingModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: listings.length, listings });
  } catch (err) {
    next(err);
  }
});

// Update listing status
router.patch('/listings/:id/status', async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!status) {
      res.status(400).json({ success: false, error: 'status is required' });
      return;
    }
    const listing = await AdminService.updateListingStatus(req.params.id, status, req.user!.id, reason);
    res.json({ success: true, listing });
  } catch (err) {
    next(err);
  }
});

// List all bookings
router.get('/bookings', async (req, res, next) => {
  try {
    const bookings = await BookingModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    next(err);
  }
});

// List all payouts
router.get('/payouts', async (req, res, next) => {
  try {
    const payouts = await PayoutModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: payouts.length, payouts });
  } catch (err) {
    next(err);
  }
});

// List all financial ledger entries
router.get('/ledger', async (req, res, next) => {
  try {
    const ledger = await FinancialLedgerModel.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: ledger.length, ledger });
  } catch (err) {
    next(err);
  }
});

// Get admin audit logs
router.get('/audit-logs', async (req, res, next) => {
  try {
    const logs = await AdminService.getAuditLogs(100);
    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    next(err);
  }
});

export default router;
