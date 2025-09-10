import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { type User } from "@shared/schema";

export interface AuthenticatedRequest extends Request {
  user?: User;
  session: {
    userId?: string;
    destroy: (callback: (err?: any) => void) => void;
  } & any;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  next();
}

export function getAuthenticatedUser(req: AuthenticatedRequest): User | null {
  return req.user || null;
}

// Secure password hashing using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}