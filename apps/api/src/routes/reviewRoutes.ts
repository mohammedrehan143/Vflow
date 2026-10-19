import { Router } from 'express';
import { ReviewModel } from '../models/Review';
import { ListingModel } from '../models/Listing';
import { BookingModel } from '../models/Booking';
import { authenticate } from '../middleware/auth';
import { ReviewSubmissionSchema } from '@vflow/shared';

const router = Router();

// Submit review for completed booking
router.post('/', authenticate, async (req, res, next) => {
  try {
    const validated = ReviewSubmissionSchema.parse(req.body);

    const booking = await BookingModel.findById(validated.bookingId);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found' });
      return;
    }

    if (booking.customerId !== req.user!.id) {
      res.status(403).json({ success: false, error: 'You can only review your own bookings' });
      return;
    }

    const review = await ReviewModel.create({
      listingId: validated.listingId,
      bookingId: validated.bookingId,
      userId: req.user!.id,
      userName: req.user!.fullName,
      rating: validated.rating,
      comment: validated.comment
    });

    // Update listing rating average
    const allReviews = await ReviewModel.find({ listingId: validated.listingId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await ListingModel.findByIdAndUpdate(validated.listingId, {
      averageRating: Number(avg.toFixed(1)),
      reviewCount: allReviews.length
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
});

// Get reviews for listing
router.get('/listing/:listingId', async (req, res, next) => {
  try {
    const reviews = await ReviewModel.find({ listingId: req.params.listingId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
});

export default router;
