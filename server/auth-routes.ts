import type { Express } from "express";
import { hashPassword, verifyPassword, type AuthenticatedRequest } from "./auth";
import { storage } from "./storage";
import { insertUserAuthSchema, updateUserZipCodeSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
});

export function registerAuthRoutes(app: Express) {
  // Login endpoint
  app.post("/api/auth/login", async (req: AuthenticatedRequest, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !(await verifyPassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Set session with auth user ID
      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Signup endpoint
  app.post("/api/auth/signup", async (req: AuthenticatedRequest, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      // Create user (password will be hashed in storage)
      const user = await storage.createUser({
        email: userData.email,
        username: userData.username,
        password: userData.password,
      });

      // Set session with user ID
      req.session.userId = user.id;
      
      res.status(201).json({ message: "User created successfully", user });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req: AuthenticatedRequest, res: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: AuthenticatedRequest, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Update user zip code
  app.patch("/api/auth/zip-code", async (req: AuthenticatedRequest, res: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { zipCode } = updateUserZipCodeSchema.parse(req.body);
      const user = await storage.updateUserZipCode(req.session.userId, zipCode);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update zip code" });
    }
  });
}