import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes';
import providerRoutes from './routes/providerRoutes';
import listingRoutes from './routes/listingRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import webhookRoutes from './routes/webhookRoutes';
import payoutRoutes from './routes/payoutRoutes';
import nearbyRoutes from './routes/nearbyRoutes';
import waitlistRoutes from './routes/waitlistRoutes';
import reviewRoutes from './routes/reviewRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import notificationRoutes from './routes/notificationRoutes';
import supportRoutes from './routes/supportRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import adminRoutes from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  // Security & Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: true, // Allow frontend origin
      credentials: true
    })
  );

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'VFlow API',
      timestamp: new Date().toISOString(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  });

  // Versioned API routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/users', authRoutes);
  app.use('/api/v1/providers', providerRoutes);
  app.use('/api/v1/listings', listingRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/payments', paymentRoutes);
  app.use('/api/v1/webhooks', webhookRoutes);
  app.use('/api/v1/payouts', payoutRoutes);
  app.use('/api/v1/nearby', nearbyRoutes);
  app.use('/api/v1/waitlist', waitlistRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/favorites', favoriteRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/support', supportRoutes);
  app.use('/api/v1/vehicles', vehicleRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
}
