import { Router } from 'express';
import { NotificationModel } from '../models/Notification';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get user notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await NotificationModel.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(30);
    const unreadCount = await NotificationModel.countDocuments({ userId: req.user!.id, isRead: false });
    res.json({ success: true, unreadCount, notifications });
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Mark all as read
router.patch('/mark-all-read', authenticate, async (req, res, next) => {
  try {
    await NotificationModel.updateMany({ userId: req.user!.id, isRead: false }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
