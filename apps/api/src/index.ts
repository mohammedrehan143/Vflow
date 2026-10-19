import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { connectDatabase } from './config/database';
import { seedDatabaseIfEmpty } from './scripts/seed';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDatabase();

    // Auto-seed if running fresh
    await seedDatabaseIfEmpty();

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 VFlow API Server running at http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ Health check: http://localhost:${PORT}/health`);
      console.log(`=======================================================`);
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start VFlow API server:', error);
    process.exit(1);
  }
}

bootstrap();
