import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  users,
  userAuth,
  stores,
  storeLocations,
  scans,
  scanResults,
  observations,
  shoppingListItems,
  contactSubmissions,
  affiliateClicks,
  affiliateConversions,
  emailHistory,
  type User,
  type Store,
  type Scan,
  type ScanResult,
  type Observation,
  type ContactSubmission,
  type InsertStore,
  type InsertScan,
  type InsertScanResult,
  type InsertObservation,
  type InsertContactSubmission,
  type CreateHomeDepotScan,
  type CreateAceHardwareScan,
  type StoreLocation,
  type EmailHistory
} from "@shared/schema";

export interface IStorage {
  // User methods
  createUser(userData: { email: string; username: string; password: string; zipCode?: string; subscriptionPlan?: string }): Promise<User & { authId: string; email: string; username: string }>;
  getUserByEmail(email: string): Promise<(User & { password: string; authId: string; email: string; username: string }) | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserZipCode?(id: string, zipCode: string): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId?: string, stripeSubscriptionId?: string, subscriptionPlan?: string): Promise<User>;
  updateUser(id: string, updates: Partial<{ zipCode: string; subscriptionPlan: string; squareCustomerId: string; stripeCustomerId: string; stripeSubscriptionId: string }>): Promise<User>;

  // Store methods
  getStores(): Promise<Store[]>;
  getStore?(id: string): Promise<Store | undefined>;
  createStore?(insertStore: InsertStore): Promise<Store>;
  getActiveStoreLocations(storeId?: string, zipCode?: string, radius?: number, limit?: number): Promise<StoreLocation[]>;

  // Scan methods
  createScan?(insertScan: InsertScan): Promise<Scan>;
  getScan?(id: string): Promise<Scan | undefined>;
  getScans?(limit?: number): Promise<Scan[]>;
  getUserScans(userId: string, page?: number, limit?: number): Promise<{ scans: Scan[]; total: number }>;
  getUserScansThisMonth?(userId: string, month: string): Promise<Scan[]>;
  getScanById(id: string): Promise<Scan | undefined>;
  updateScanStatus(scanId: string, status: "pending" | "running" | "completed" | "failed", resultCount?: string | null, clearanceCount?: string | null): Promise<Scan | undefined>;
  checkAndIncrementScanLimit(userId: string, month: string, limit: number): Promise<{allowed: boolean, currentCount: number}>;
  getScanByIdAndUserId(id: string, userId: string): Promise<Scan | undefined>;

  // Scan result methods
  addScanResult(result: Omit<InsertScanResult, "id">): Promise<ScanResult>;
  getScanResults(scanId: string, filters?: any): Promise<{ results: ScanResult[]; total: number }>;

  // Observation methods
  upsertObservation(observation: InsertObservation): Promise<Observation>;
  getObservations(storeId: string, productUrl: string): Promise<Observation[]>;

  // Store-specific scan methods
  createHomeDepotScan(scanData: CreateHomeDepotScan): Promise<Scan>;
  getHomeDepotScanResults(scanId: string): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }>;
  createAceHardwareScan(scanData: CreateAceHardwareScan): Promise<Scan>;
  getAceHardwareScanResults(scanId: string): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }>;

  // Shopping list methods
  getShoppingListItems(userId: string): Promise<any[]>;
  addToShoppingList(item: any): Promise<any>;
  updateShoppingListItem(itemId: string, updates: any): Promise<any>;
  deleteShoppingListItem(itemId: string): Promise<boolean>;

  // Contact methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;

  // Affiliate methods
  createUserWithReferral(user: { email: string; username: string; password: string; zipCode?: string; subscriptionPlan?: string; referredBy?: string | null }): Promise<User>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  trackAffiliateClick(data: { affiliateUserId: string; referralCode: string; ipAddress?: string; userAgent?: string; referer?: string }): Promise<void>;
  trackAffiliateConversion(data: { affiliateUserId: string; convertedUserId: string; referralCode: string; subscriptionPlan: string }): Promise<void>;
  getAffiliateStats(userId: string): Promise<{ clicks: number; conversions: number; totalCommissions: number; pendingCommissions: number }>;
}

export class DbStorage implements IStorage {
  // User methods
  async createUser(userData: { email: string; username: string; password: string; zipCode?: string; subscriptionPlan?: string }): Promise<User & { authId: string; email: string; username: string }> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create auth record first
    const [auth] = await db.insert(userAuth).values({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
    }).returning();
    
    // Generate unique referral code for this user
    const referralCode = `${userData.username.slice(0, 3).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create user profile record
    const [user] = await db.insert(users).values({
      authId: auth.id,
      zipCode: userData.zipCode || null,
      subscriptionPlan: userData.subscriptionPlan || "free",
      referralCode,
      referredBy: null,
      isAffiliate: false,
      affiliateStatus: "bronze",
      totalReferrals: "0",
      totalCommissions: "0.00",
      pendingCommissions: "0.00",
      weaveAccountId: null,
      squareCustomerId: null,
      emailPreferences: {
        dealAlerts: true,
        marketingEmails: true,
        weeklyUpdates: false
      }
    }).returning();
    
    // Return combined user data
    return {
      ...user,
      authId: auth.id,
      email: auth.email,
      username: auth.username,
    } as User & { authId: string; email: string; username: string };
  }
  
  async createUserWithReferral(userData: { email: string; username: string; password: string; zipCode?: string; subscriptionPlan?: string; referredBy?: string | null }): Promise<User> {
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create auth record first
    const [auth] = await db.insert(userAuth).values({
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
    }).returning();
    
    // Generate unique referral code for this user
    const referralCode = `${userData.username.slice(0, 3).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // Create user profile record
    const [user] = await db.insert(users).values({
      authId: auth.id,
      zipCode: userData.zipCode || null,
      subscriptionPlan: userData.subscriptionPlan || "free",
      referralCode,
      referredBy: userData.referredBy || null,
      isAffiliate: false,
      affiliateStatus: "bronze",
      totalReferrals: "0",
      totalCommissions: "0.00",
      pendingCommissions: "0.00",
      weaveAccountId: null,
      squareCustomerId: null,
      emailPreferences: {
        dealAlerts: true,
        marketingEmails: true,
        weeklyUpdates: false
      }
    }).returning();
    
    // Return combined user data
    return {
      ...user,
      authId: auth.id,
      email: auth.email,
      username: auth.username,
    } as User;
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const result = await db
      .select({
        // Auth fields
        authId: userAuth.id,
        email: userAuth.email,
        username: userAuth.username,
        // User profile fields
        id: users.id,
        zipCode: users.zipCode,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        subscriptionPlan: users.subscriptionPlan,
        referralCode: users.referralCode,
        referredBy: users.referredBy,
        isAffiliate: users.isAffiliate,
        affiliateStatus: users.affiliateStatus,
        totalReferrals: users.totalReferrals,
        totalCommissions: users.totalCommissions,
        pendingCommissions: users.pendingCommissions,
        weaveAccountId: users.weaveAccountId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(userAuth, eq(users.authId, userAuth.id))
      .where(eq(users.referralCode, referralCode))
      .limit(1);
    
    return result[0] || undefined;
  }
  
  async trackAffiliateClick(data: { affiliateUserId: string; referralCode: string; ipAddress?: string; userAgent?: string; referer?: string }): Promise<void> {
    await db.insert(affiliateClicks).values({
      affiliateUserId: data.affiliateUserId,
      referralCode: data.referralCode,
      ipAddress: data.ipAddress || null,
      userAgent: data.userAgent || null,
      referer: data.referer || null,
    });
  }
  
  async trackAffiliateConversion(data: { affiliateUserId: string; convertedUserId: string; referralCode: string; subscriptionPlan: string }): Promise<void> {
    const commissionRates = { free: 0, pro: 2.50, business: 6.25, pro_annual: 20.00, business_annual: 50.00 };
    const commissionAmount = commissionRates[data.subscriptionPlan as keyof typeof commissionRates] || 0;
    
    // Record conversion
    await db.insert(affiliateConversions).values({
      affiliateUserId: data.affiliateUserId,
      convertedUserId: data.convertedUserId,
      referralCode: data.referralCode,
      subscriptionPlan: data.subscriptionPlan,
      commissionAmount: commissionAmount.toString(),
      commissionRate: "0.1000"
    });
    
    // Update affiliate stats
    await db.update(users)
      .set({
        totalReferrals: sql`(${users.totalReferrals}::int + 1)::text`,
        pendingCommissions: sql`(${users.pendingCommissions}::decimal + ${commissionAmount})::text`,
        isAffiliate: true,
      })
      .where(eq(users.id, data.affiliateUserId));
  }
  
  async getAffiliateStats(userId: string): Promise<{ clicks: number; conversions: number; totalCommissions: number; pendingCommissions: number }> {
    const [clickCount] = await db.select({ count: sql<number>`count(*)` }).from(affiliateClicks).where(eq(affiliateClicks.affiliateUserId, userId));
    const [conversionCount] = await db.select({ count: sql<number>`count(*)` }).from(affiliateConversions).where(eq(affiliateConversions.affiliateUserId, userId));
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    return {
      clicks: clickCount?.count || 0,
      conversions: conversionCount?.count || 0,
      totalCommissions: parseFloat(user[0]?.totalCommissions || '0'),
      pendingCommissions: parseFloat(user[0]?.pendingCommissions || '0'),
    };
  }

  async getUserByEmail(email: string): Promise<(User & { password: string; authId: string; email: string; username: string }) | undefined> {
    const result = await db
      .select({
        // Auth fields
        authId: userAuth.id,
        email: userAuth.email,
        username: userAuth.username,
        password: userAuth.password,
        // User profile fields
        id: users.id,
        zipCode: users.zipCode,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        subscriptionPlan: users.subscriptionPlan,
        referralCode: users.referralCode,
        referredBy: users.referredBy,
        isAffiliate: users.isAffiliate,
        affiliateStatus: users.affiliateStatus,
        totalReferrals: users.totalReferrals,
        totalCommissions: users.totalCommissions,
        pendingCommissions: users.pendingCommissions,
        weaveAccountId: users.weaveAccountId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(userAuth)
      .innerJoin(users, eq(userAuth.id, users.authId))
      .where(eq(userAuth.email, email))
      .limit(1);
    
    return result[0] || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await db
      .select({
        // Auth fields
        authId: userAuth.id,
        email: userAuth.email,
        username: userAuth.username,
        // User profile fields
        id: users.id,
        zipCode: users.zipCode,
        stripeCustomerId: users.stripeCustomerId,
        stripeSubscriptionId: users.stripeSubscriptionId,
        subscriptionPlan: users.subscriptionPlan,
        referralCode: users.referralCode,
        referredBy: users.referredBy,
        isAffiliate: users.isAffiliate,
        affiliateStatus: users.affiliateStatus,
        totalReferrals: users.totalReferrals,
        totalCommissions: users.totalCommissions,
        pendingCommissions: users.pendingCommissions,
        weaveAccountId: users.weaveAccountId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .innerJoin(userAuth, eq(users.authId, userAuth.id))
      .where(eq(users.id, id))
      .limit(1);
    
    return result[0] || undefined;
  }

  async updateUserZipCode(id: string, zipCode: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ zipCode })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    // Get auth info to complete the user object
    const authInfo = await db.select()
      .from(userAuth)
      .where(eq(userAuth.id, updatedUser.authId))
      .limit(1);
    
    if (!authInfo[0]) {
      throw new Error("Auth info not found");
    }
    
    return {
      ...updatedUser,
      email: authInfo[0].email,
      username: authInfo[0].username,
    } as User;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId?: string, stripeSubscriptionId?: string, subscriptionPlan?: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ 
        stripeCustomerId: stripeCustomerId || null,
        stripeSubscriptionId: stripeSubscriptionId || null,
        subscriptionPlan: subscriptionPlan || "free"
      })
      .where(eq(users.id, id))
      .returning();
      
    // Get auth info to complete the user object
    const authInfo = await db.select()
      .from(userAuth)
      .where(eq(userAuth.id, updatedUser.authId))
      .limit(1);
    
    if (!authInfo[0]) {
      throw new Error("Auth info not found");
    }
    
    return {
      ...updatedUser,
      email: authInfo[0].email,
      username: authInfo[0].username,
    } as User;
  }

  async updateUser(id: string, updates: Partial<{ zipCode: string; subscriptionPlan: string; squareCustomerId: string; stripeCustomerId: string; stripeSubscriptionId: string }>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...(updates.zipCode !== undefined && { zipCode: updates.zipCode }),
        ...(updates.subscriptionPlan !== undefined && { subscriptionPlan: updates.subscriptionPlan }),
        ...(updates.squareCustomerId !== undefined && { squareCustomerId: updates.squareCustomerId }),
        ...(updates.stripeCustomerId !== undefined && { stripeCustomerId: updates.stripeCustomerId }),
        ...(updates.stripeSubscriptionId !== undefined && { stripeSubscriptionId: updates.stripeSubscriptionId }),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Get auth info to complete the user object
    const authInfo = await db.select()
      .from(userAuth)
      .where(eq(userAuth.id, updatedUser.authId))
      .limit(1);

    if (!authInfo[0]) {
      throw new Error("Auth info not found");
    }

    return {
      ...updatedUser,
      email: authInfo[0].email,
      username: authInfo[0].username,
    } as User;
  }

  // Email preferences and history methods
  async updateUserEmailPreferences(userId: string, emailPreferences: { dealAlerts?: boolean; marketingEmails?: boolean; weeklyUpdates?: boolean }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        emailPreferences: emailPreferences as any,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    // Get auth info to complete the user object
    const authInfo = await db.select()
      .from(userAuth)
      .where(eq(userAuth.id, updatedUser.authId))
      .limit(1);

    if (!authInfo[0]) {
      throw new Error("Auth info not found");
    }

    return {
      ...updatedUser,
      email: authInfo[0].email,
      username: authInfo[0].username,
    } as User;
  }

  async logEmailSent(userId: string, emailType: string, recipient: string, subject: string, success: boolean, error?: string): Promise<void> {
    await db.insert(emailHistory).values({
      userId,
      emailType,
      recipient,
      subject,
      success,
      error,
      sentAt: new Date(),
    });
  }

  async getEmailHistory(userId: string, limit = 50): Promise<any[]> {
    return await db.select()
      .from(emailHistory)
      .where(eq(emailHistory.userId, userId))
      .orderBy(desc(emailHistory.sentAt))
      .limit(limit);
  }

  // Store methods (keep simple for now)
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores);
  }

  async getStore(id: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(eq(stores.id, id));
    return store || undefined;
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const [store] = await db.insert(stores).values(insertStore).returning();
    return store;
  }

  async getActiveStoreLocations(storeId?: string, zipCode?: string, radius?: number, limit?: number): Promise<StoreLocation[]> {
    try {
      let query = db.select().from(storeLocations).where(eq(storeLocations.isActive, true));
      
      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }
      
      const locations = await query;
      return locations;
    } catch (error) {
      console.error("Failed to fetch store locations from database:", error);
      return [];
    }
  }

  // Scan methods
  async createScan(insertScan: InsertScan): Promise<Scan> {
    const [scan] = await db.insert(scans).values(insertScan).returning();
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan || undefined;
  }

  async getScans(limit = 10): Promise<Scan[]> {
    return await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(limit);
  }

  async getUserScans(userId: string, page = 1, limit = 10): Promise<{ scans: Scan[]; total: number }> {
    const offset = (page - 1) * limit;
    
    const scans = await db.select().from(scans)
      .where(eq(scans.userId, userId))
      .orderBy(desc(scans.createdAt))
      .limit(limit)
      .offset(offset);
    
    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(scans)
      .where(eq(scans.userId, userId));
    
    return { scans, total: totalResult?.count || 0 };
  }

  async getUserScansThisMonth(userId: string, month: string): Promise<Scan[]> {
    const startDate = new Date(month + "-01");
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    return await db.select().from(scans)
      .where(
        and(
          eq(scans.userId, userId),
          sql`${scans.createdAt} >= ${startDate}`,
          sql`${scans.createdAt} <= ${endDate}`
        )
      )
      .orderBy(desc(scans.createdAt));
  }

  async getScanById(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan || undefined;
  }

  async updateScanStatus(
    scanId: string,
    status: "pending" | "running" | "completed" | "failed",
    resultCount?: string | null,
    clearanceCount?: string | null
  ): Promise<Scan | undefined> {
    const updateData: any = { 
      status,
      updatedAt: new Date()
    };
    
    if (resultCount !== undefined) updateData.resultCount = resultCount;
    if (clearanceCount !== undefined) updateData.clearanceCount = clearanceCount;
    
    if (status === "completed" || status === "failed") {
      updateData.completedAt = new Date();
    }

    const [scan] = await db.update(scans)
      .set(updateData)
      .where(eq(scans.id, scanId))
      .returning();
    
    return scan || undefined;
  }

  async createScanWithLimitCheck(userId: string, scanData: Omit<InsertScan, "userId">, month: string, limit: number): Promise<{scan?: Scan, allowed: boolean, currentCount: number}> {
    return await db.transaction(async (tx) => {
      const startDate = new Date(month + "-01");
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      const currentScans = await tx.select().from(scans)
        .where(
          and(
            eq(scans.userId, userId),
            sql`${scans.createdAt} >= ${startDate}`,
            sql`${scans.createdAt} <= ${endDate}`
          )
        );
      
      const currentCount = currentScans.length;
      
      if (currentCount >= limit) {
        return { allowed: false, currentCount };
      }
      
      const [scan] = await tx.insert(scans).values({
        ...scanData,
        userId,
      }).returning();
      
      return { scan, allowed: true, currentCount: currentCount + 1 };
    });
  }
  
    // LEGACY: Keep for compatibility but mark deprecated
  async checkAndIncrementScanLimit(userId: string, month: string, limit: number): Promise<{allowed: boolean, currentCount: number}> {
    return await db.transaction(async (tx) => {
      const startDate = new Date(month + "-01");
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      
      const currentScans = await tx.select().from(scans)
        .where(
          and(
            eq(scans.userId, userId),
            sql`${scans.createdAt} >= ${startDate}`,
            sql`${scans.createdAt} <= ${endDate}`
          )
        );
      
      const currentCount = currentScans.length;
      
      if (currentCount >= limit) {
        return { allowed: false, currentCount };
      }
      
      return { allowed: true, currentCount };
    });
  }

  // SECURITY FIX: Ownership verification for scans
  async getScanByIdAndUserId(id: string, userId: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans)
      .where(and(eq(scans.id, id), eq(scans.userId, userId)));
    return scan || undefined;
  }

  // Scan result methods
  async addScanResult(result: Omit<InsertScanResult, "id">): Promise<ScanResult> {
    const [scanResult] = await db.insert(scanResults).values(result).returning();
    return scanResult;
  }

  async getScanResults(scanId: string, filters?: {
    category?: string;
    clearanceOnly?: boolean;
    minDiscount?: number;
    sortBy?: "discount-percent" | "dollars-off" | "newest";
    page?: number;
    limit?: number;
  }): Promise<{ results: ScanResult[]; total: number }> {
    let query = db.select().from(scanResults).where(eq(scanResults.scanId, scanId));
    
    // Apply filters (simplified for now)
    if (filters?.clearanceOnly) {
      query = query.where(eq(scanResults.isOnClearance, true));
    }
    
    const results = await query
      .orderBy(desc(scanResults.observedAt))
      .limit(filters?.limit || 50)
      .offset(((filters?.page || 1) - 1) * (filters?.limit || 50));
    
    // Get total count
    const [totalResult] = await db.select({ count: sql<number>`count(*)` })
      .from(scanResults)
      .where(eq(scanResults.scanId, scanId));
    
    return { results, total: totalResult?.count || 0 };
  }
  async upsertObservation(observation: InsertObservation): Promise<Observation> {
    // For PostgreSQL, we'll use a simpler insert approach
    const [result] = await db.insert(observations).values(observation).returning();
    return result;
  }
  async getObservations(storeId: string, productUrl: string): Promise<Observation[]> {
    return await db.select().from(observations)
      .where(and(
        eq(observations.storeId, storeId),
        eq(observations.productUrl, productUrl)
      ));
  }
  async createHomeDepotScan(scanData: CreateHomeDepotScan): Promise<Scan> {
    const scanRecord = {
      userId: scanData.userId,
      storeId: "home-depot" as const,
      zipCode: scanData.zipCode,
      plan: scanData.plan,
      productSelection: "all" as const,
      clearanceOnly: true,
      sortBy: "discount-percent" as const,
      storeCount: "1"
    };
    const [scan] = await db.insert(scans).values(scanRecord).returning();
    return scan;
  }
  async getHomeDepotScanResults(scanId: string): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }> {
    const results = await db.select().from(scanResults).where(eq(scanResults.scanId, scanId));
    
    // Count unique stores
    const uniqueStores = new Set(results.map(r => r.storeId));
    const storesScanned = uniqueStores.size;
    const itemsFound = results.length;
    
    return {
      results,
      summary: { storesScanned, itemsFound }
    };
  }
  async createAceHardwareScan(scanData: CreateAceHardwareScan): Promise<Scan> {
    const scanRecord = {
      userId: scanData.userId,
      storeId: "ace-hardware" as const,
      zipCode: scanData.zipCode,
      plan: scanData.plan,
      productSelection: "all" as const,
      clearanceOnly: true,
      sortBy: "discount-percent" as const,
      storeCount: "1"
    };
    const [scan] = await db.insert(scans).values(scanRecord).returning();
    return scan;
  }
  async getAceHardwareScanResults(scanId: string): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }> {
    const results = await db.select().from(scanResults).where(eq(scanResults.scanId, scanId));
    
    // Count unique stores
    const uniqueStores = new Set(results.map(r => r.storeId));
    const storesScanned = uniqueStores.size;
    const itemsFound = results.length;
    
    return {
      results,
      summary: { storesScanned, itemsFound }
    };
  }
  async getShoppingListItems(userId: string): Promise<any[]> {
    return await db.select().from(shoppingListItems)
      .where(eq(shoppingListItems.userId, userId))
      .orderBy(desc(shoppingListItems.addedAt));
  }
  async addToShoppingList(item: any): Promise<any> {
    const [newItem] = await db.insert(shoppingListItems).values(item).returning();
    return newItem;
  }
  async updateShoppingListItem(itemId: string, updates: any): Promise<any> {
    const [updatedItem] = await db.update(shoppingListItems)
      .set(updates)
      .where(eq(shoppingListItems.id, itemId))
      .returning();
    return updatedItem;
  }
  async deleteShoppingListItem(itemId: string): Promise<boolean> {
    const result = await db.delete(shoppingListItems)
      .where(eq(shoppingListItems.id, itemId));
    return (result.rowCount ?? 0) > 0;
  }
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }
}

// Export storage instance - using corrected TempStorage with accurate Orlando coordinates
import { tempStorage } from './temp-storage';
export const storage = tempStorage;