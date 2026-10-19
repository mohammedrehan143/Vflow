import { Router } from 'express';
import { FavoriteModel } from '../models/Favorite';
import { ListingModel } from '../models/Listing';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toggle favorite
router.post('/toggle', authenticate, async (req, res, next) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      res.status(400).json({ success: false, error: 'listingId is required' });
      return;
    }

    const existing = await FavoriteModel.findOne({ userId: req.user!.id, listingId });
    if (existing) {
      await FavoriteModel.findByIdAndDelete(existing._id);
      res.json({ success: true, isFavorite: false });
    } else {
      await FavoriteModel.create({ userId: req.user!.id, listingId });
      res.json({ success: true, isFavorite: true });
    }
  } catch (err) {
    next(err);
  }
});

// Get user favorites
router.get('/', authenticate, async (req, res, next) => {
  try {
    const favorites = await FavoriteModel.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    const listingIds = favorites.map((f) => f.listingId);
    const listings = await ListingModel.find({ _id: { $in: listingIds } });
    res.json({ success: true, listings });
  } catch (err) {
    next(err);
  }
});

export default router;
