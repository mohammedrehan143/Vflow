import { Router, Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';

const router = Router();

// Razorpay webhook handler
router.post('/razorpay', async (req: Request, res: Response) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const rawBody = JSON.stringify(req.body);
    const result = await PaymentService.handleWebhook(signature, rawBody, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    console.error('[Webhook Error]', err.message);
    res.status(400).json({ error: err.message });
  }
});

export default router;
