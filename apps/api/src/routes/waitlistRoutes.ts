import { Router } from 'express';
import { WaitlistEntryModel } from '../models/WaitlistEntry';
import { authenticate, requireRole } from '../middleware/auth';
import { WaitlistSubmissionSchema } from '@vflow/shared';

const router = Router();

// Submit waitlist entry for Valet (Coming Soon)
router.post('/', async (req, res, next) => {
  try {
    const validated = WaitlistSubmissionSchema.parse(req.body);
    const entry = await WaitlistEntryModel.create(validated);
    res.status(201).json({
      success: true,
      message: 'Thank you for joining the VFlow Valet early access waitlist!',
      entry
    });
  } catch (err) {
    next(err);
  }
});

// Admin views waitlist
router.get('/', authenticate, requireRole('admin'), async (req, res, next) => {
  try {
    const entries = await WaitlistEntryModel.find().sort({ createdAt: -1 });
    res.json({ success: true, count: entries.length, entries });
  } catch (err) {
    next(err);
  }
});

export default router;
