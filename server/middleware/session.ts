import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const PgSession = connectPgSimple(session);

// SECURITY FIX: Secure session configuration
export const sessionConfig = {
  // For production, use PgSession store. For development, use MemoryStore
  // store: new PgSession({
  //   pool: db, 
  //   tableName: "sessions",
  //   createTableIfMissing: true,
  // }),
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  name: "dealradar.sid", // Don't use default session name
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "strict" as const, // CSRF protection
  },
  rolling: true, // Reset expiry on activity
};