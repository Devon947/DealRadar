import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Production-optimized connection pool configuration
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for production
  max: 20,                    // Maximum number of connections in the pool
  min: 2,                     // Minimum number of connections to maintain
  idleTimeoutMillis: 30000,   // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Wait up to 2 seconds for connection
  allowExitOnIdle: false,     // Keep pool alive for graceful shutdown
});

// Enhanced error handling with reconnection logic
let reconnectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;
const RECONNECTION_DELAY = 5000;

pool.on('error', async (err) => {
  console.error('Database pool error:', err);
  
  // Attempt reconnection for connection-related errors
  if (err.message.includes('connection') || err.message.includes('timeout')) {
    if (reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      reconnectionAttempts++;
      console.log(`Attempting database reconnection ${reconnectionAttempts}/${MAX_RECONNECTION_ATTEMPTS}...`);
      
      setTimeout(async () => {
        try {
          // Test connection with a simple query
          await pool.query('SELECT 1');
          console.log('Database reconnection successful');
          reconnectionAttempts = 0;
        } catch (reconnectErr) {
          console.error('Reconnection failed:', reconnectErr);
        }
      }, RECONNECTION_DELAY * reconnectionAttempts);
    } else {
      console.error('Max reconnection attempts reached. Database may be unavailable.');
    }
  }
});

// Connection health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
  process.exit(0);
});

export const db = drizzle({ client: pool, schema });
