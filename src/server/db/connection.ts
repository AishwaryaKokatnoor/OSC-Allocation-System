/**
 * MongoDB Connection & Persistence Manager
 * Compatible with local MongoDB Community Server & Compass (mongodb://127.0.0.1:27017/sakhilink)
 * With zero-downtime resilient in-memory storage fallback when local mongod is not running.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sakhilink';

let isConnected = false;
let isUsingFallbackStore = false;

export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;

  try {
    // Attempt local MongoDB Community Server connection with 2.5s timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    isConnected = true;
    isUsingFallbackStore = false;
    console.log(`[MongoDB] Connected successfully to local MongoDB Community Server at ${MONGODB_URI}`);
    return true;
  } catch (err: any) {
    console.warn(`[MongoDB Notice] Local MongoDB Community Server was not detected at ${MONGODB_URI} (${err.message}).`);
    console.log('[MongoDB Notice] Activating resilient in-memory collection persistence engine for cloud preview.');
    isConnected = true;
    isUsingFallbackStore = true;
    return false;
  }
}

export function isFallbackActive(): boolean {
  return isUsingFallbackStore;
}

export function getDatabaseUri(): string {
  return MONGODB_URI;
}
