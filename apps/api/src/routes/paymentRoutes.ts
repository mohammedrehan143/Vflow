import { Router } from 'express';
import { PaymentService } from '../services/paymentService';
import { authenticate } from '../middleware/auth';
import { VerifyPaymentSchema } from '@vflow/shared';

const router = Router();

// Create Razorpay order
router.post('/create-order', authenticate, async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      res.status(400).json({ success: false, error: 'bookingId is required' });
      return;
    }

    const orderData = await PaymentService.createOrder(bookingId, req.user!.id);
    res.json({ success: true, ...orderData });
  } catch (err) {
    next(err);
  }
});

// Verify payment signature
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    const validated = VerifyPaymentSchema.parse(req.body);
    const result = await PaymentService.verifyPayment(validated);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
