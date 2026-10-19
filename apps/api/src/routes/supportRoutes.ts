import { Router } from 'express';
import { SupportTicketModel } from '../models/SupportTicket';
import crypto from 'crypto';

const router = Router();

// Submit support ticket
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message, category } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400).json({ success: false, error: 'Name, email, subject, and message are required' });
      return;
    }

    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    const ticket = await SupportTicketModel.create({
      ticketNumber,
      userId: (req as any).user?.id,
      name,
      email,
      subject,
      message,
      category: category || 'general',
      status: 'open',
      priority: 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully. Our team will contact you shortly.',
      ticket
    });
  } catch (err) {
    next(err);
  }
});

export default router;
