import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer: MongoMemoryServer | null = null;

export async function connectDatabase(): Promise<string> {
  const uri = process.env.MONGODB_URI;
  const useInMemory = process.env.USE_IN_MEMORY_DB === 'true';

  if (!useInMemory && uri && uri !== 'mongodb://localhost:27017/vflow') {
    try {
      console.log(`[DB] Attempting connection to MongoDB Atlas / Remote...`);
      await mongoose.connect(uri);
      console.log(`[DB] Successfully connected to MongoDB at ${uri.split('@')[1] || uri}`);
      return uri;
    } catch (err: any) {
      console.warn(`[DB] Remote MongoDB connection failed: ${err.message}. Falling back to In-Memory instance.`);
    }
  }

  // Try local or spin up in-memory MongoDB
  try {
    if (uri && !useInMemory) {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
      console.log(`[DB] Connected to local MongoDB: ${uri}`);
      return uri;
    }
  } catch (err) {
    console.log(`[DB] Local MongoDB not detected, starting embedded MongoMemoryServer...`);
  }

  console.log(`[DB] Starting high-performance embedded MongoMemoryServer...`);
  memoryServer = await MongoMemoryServer.create();
  const memoryUri = memoryServer.getUri();
  await mongoose.connect(memoryUri);
  console.log(`[DB] Connected to embedded MongoMemoryServer: ${memoryUri}`);
  return memoryUri;
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
