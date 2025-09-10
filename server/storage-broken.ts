import { type User, type InsertUser, type Store, type InsertStore, type Scan, type InsertScan, type ScanResult, type InsertScanResult, type Observation, type InsertObservation, type ContactSubmission, type InsertContactSubmission, type CreateHomeDepotScan, type CreateAceHardwareScan, users, userAuth, stores, scans, scanResults, observations, contactSubmissions, shoppingListItems, affiliateClicks, affiliateConversions, affiliatePayouts, storeLocations } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq, sql, and, ilike, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  createUser(user: { email: string; username: string; password: string; zipCode?: string; subscriptionPlan?: string }): Promise<User & { authId: string; email: string; username: string }>;
  getUserByEmail(email: string): Promise<(User & { password: string; authId: string; email: string; username: string }) | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  updateUserZipCode(id: string, zipCode: string): Promise<User>;
  updateUserStripeInfo(id: string, stripeCustomerId?: string, stripeSubscriptionId?: string, subscriptionPlan?: string): Promise<User>;
  
  // Store methods
  getStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  getActiveStoreLocations(): Promise<any[]>;
  
  // Scan methods
  createScan(scan: InsertScan): Promise<Scan>;
  getScan(id: string): Promise<Scan | undefined>;
  getScanByIdAndUserId(id: string, userId: string): Promise<Scan | undefined>;
  getScans(limit?: number): Promise<Scan[]>;
  getUserScans(userId: string, limit?: number): Promise<Scan[]>;
  getUserScansThisMonth(userId: string, month: string): Promise<Scan[]>;
  checkAndIncrementScanLimit(userId: string, month: string, limit: number): Promise<{allowed: boolean, currentCount: number}>;
  updateScanStatus(id: string, status: string, resultCount?: string, clearanceCount?: string): Promise<void>;
  completeScan(id: string, resultCount: string, clearanceCount: string): Promise<void>;
  
  // Scan result methods
  createScanResult(result: InsertScanResult): Promise<ScanResult>;
  getScanResults(scanId: string, filters?: {
    search?: string;
    store?: string;
    category?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }): Promise<{ results: ScanResult[]; total: number; }>;
  
  // Observation methods
  upsertObservation(observation: InsertObservation): Promise<Observation>;
  getObservations(storeId: string, productUrl: string): Promise<Observation[]>;
  
  // Home Depot scan methods
  createHomeDepotScan(scanData: CreateHomeDepotScan): Promise<Scan>;
  getHomeDepotScanResults(scanId: string): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }>;
  
  // Ace Hardware scan methods
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
    }).returning();
    
    // Return combined user data
    return {
      ...user,
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
    }).returning();
    
    // Return combined user data
    return {
      ...user,
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
    // Calculate commission based on plan - 25% of plan value
    const commissionRates = { free: 0, pro: 2.50, business: 6.25, pro_annual: 20.00, business_annual: 50.00 };
    const commissionAmount = commissionRates[data.subscriptionPlan as keyof typeof commissionRates] || 0;
    const commissionRate = data.subscriptionPlan === 'free' ? 0 : 0.25; // 25% commission rate
    
    // Insert conversion record
    await db.insert(affiliateConversions).values({
      affiliateUserId: data.affiliateUserId,
      convertedUserId: data.convertedUserId,
      referralCode: data.referralCode,
      subscriptionPlan: data.subscriptionPlan,
      commissionAmount: commissionAmount.toString(),
      commissionRate: commissionRate.toString(),
    });
    
    // Update affiliate user stats
    await db.update(users)
      .set({
        totalReferrals: sql`(CAST(${users.totalReferrals} AS INTEGER) + 1)::TEXT`,
        pendingCommissions: sql`CAST(CAST(${users.pendingCommissions} AS DECIMAL) + ${commissionAmount} AS TEXT)`,
        isAffiliate: true, // Enable affiliate status on first conversion
      })
      .where(eq(users.id, data.affiliateUserId));
  }
  
  async getAffiliateStats(userId: string): Promise<{ clicks: number; conversions: number; totalCommissions: number; pendingCommissions: number }> {
    const user = await this.getUserById(userId);
    if (!user) return { clicks: 0, conversions: 0, totalCommissions: 0, pendingCommissions: 0 };
    
    // Get click count
    const clickCount = await db.select({ count: sql<number>`count(*)` })
      .from(affiliateClicks)
      .where(eq(affiliateClicks.affiliateUserId, userId));
    
    // Get conversion count  
    const conversionCount = await db.select({ count: sql<number>`count(*)` })
      .from(affiliateConversions)
      .where(eq(affiliateConversions.affiliateUserId, userId));
    
    return {
      clicks: clickCount[0]?.count || 0,
      conversions: conversionCount[0]?.count || 0,
      totalCommissions: parseFloat(user.totalCommissions || '0'),
      pendingCommissions: parseFloat(user.pendingCommissions || '0'),
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
    const [updatedUser] = await db.update(users)
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
      authId: authInfo[0].id
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

  // Store methods (keep simple for now)
  async getStores(): Promise<Store[]> {
    // Try to get from database first, fall back to hardcoded
    try {
      const dbStores = await db.select().from(stores).where(eq(stores.isActive, true));
      if (dbStores.length > 0) {
        return dbStores;
      }
    } catch (error) {
      console.warn("Failed to fetch stores from database, using fallback", error);
    }
    
    // Fallback to hardcoded stores
    return [
      { id: "home-depot", name: "Home Depot", baseUrl: "https://www.homedepot.com", isActive: true },
      { id: "lowes", name: "Lowe's", baseUrl: "https://www.lowes.com", isActive: true },
      { id: "ace-hardware", name: "Ace Hardware", baseUrl: "https://www.acehardware.com", isActive: true },
    ];
  }

  async getStore(id: string): Promise<Store | undefined> {
    const allStores = await this.getStores();
    return allStores.find(store => store.id === id);
  }

  async createStore(store: InsertStore & { id: string }): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  async getActiveStoreLocations(): Promise<any[]> {
    try {
      return await db.select().from(storeLocations).where(eq(storeLocations.isActive, true));
    } catch (error) {
      console.error("Failed to fetch store locations from database:", error);
      return [];
    }
  }

  async createScan(scan: InsertScan): Promise<Scan> {
    const [newScan] = await db.insert(scans).values(scan).returning();
    return newScan;
  }
  async getScan(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }
  async getScans(limit = 10): Promise<Scan[]> {
    return await db.select().from(scans).limit(limit).orderBy(sql`${scans.createdAt} DESC`);
  }
  async getUserScans(userId: string, limit = 10): Promise<Scan[]> {
    return await db.select().from(scans)
      .where(eq(scans.userId, userId))
      .limit(limit)
      .orderBy(sql`${scans.createdAt} DESC`);
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
      .orderBy(sql`${scans.createdAt} DESC`);
  }

  // PROFIT-SECURE: Truly atomic scan creation with hard cost limits
  async createScanWithLimits(scanData: InsertScan, userId: string): Promise<{scan?: Scan, allowed: boolean, currentCount: number, reason?: string}> {
    return await db.transaction(async (tx) => {
      const user = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return { allowed: false, currentCount: 0, reason: "User not found" };
      }
      
      const userPlan = (user[0].subscriptionPlan as any) || "free";
      const { getMonthlyScansForPlan, getMaxMonthlyCostForPlan } = await import("./utils/planLimits");
      
      const monthlyLimit = getMonthlyScansForPlan(userPlan);
      const costLimit = getMaxMonthlyCostForPlan(userPlan);
      
      const currentMonth = new Date().toISOString().slice(0, 7);
      const startDate = new Date(currentMonth + "-01");
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
      const estimatedCost = (currentCount + 1) * 0.05; // Conservative $0.05 per scan estimate
      
      if (currentCount >= monthlyLimit) {
        return { allowed: false, currentCount, reason: "Monthly scan limit reached" };
      }
      
      if (estimatedCost > costLimit) {
        return { allowed: false, currentCount, reason: "Monthly cost limit reached" };
      }
      
      const [scan] = await tx.insert(scans).values(scanData).returning();
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
      .where(and(eq(scans.id, id), eq(scans.userId, userId)))
      .limit(1);
    return scan;
  }
  async updateScanStatus(id: string, status: string, resultCount?: string, clearanceCount?: string): Promise<void> {
    const updateData: any = { status };
    if (resultCount !== undefined) updateData.resultCount = resultCount;
    if (clearanceCount !== undefined) updateData.clearanceCount = clearanceCount;
    await db.update(scans).set(updateData).where(eq(scans.id, id));
  }
  async completeScan(id: string, resultCount: string, clearanceCount: string): Promise<void> {
    await db.update(scans)
      .set({ 
        status: "completed",
        resultCount,
        clearanceCount,
        completedAt: sql`now()`
      })
      .where(eq(scans.id, id));
  }
  async createScanResult(result: InsertScanResult): Promise<ScanResult> {
    const [newResult] = await db.insert(scanResults).values(result).returning();
    return newResult;
  }
  async getScanResults(
    scanId: string,
    filters: {
      search?: string;
      store?: string;
      category?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ results: ScanResult[]; total: number; }> {
    let query = db.select().from(scanResults).where(eq(scanResults.scanId, scanId));
    
    // Apply filters
    const conditions = [eq(scanResults.scanId, scanId)];
    
    if (filters.search) {
      conditions.push(ilike(scanResults.productName, `%${filters.search}%`));
    }
    
    if (filters.store && filters.store !== "all") {
      conditions.push(eq(scanResults.storeLocation, filters.store));
    }
    
    if (filters.category && filters.category !== "all") {
      if (filters.category === "clearance") {
        conditions.push(eq(scanResults.isOnClearance, true));
      } else {
        conditions.push(eq(scanResults.category, filters.category));
      }
    }
    
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
    // Build final query with sorting
    let orderByClause;
    switch (filters.sortBy) {
      case "price-asc":
        orderByClause = asc(scanResults.clearancePrice);
        break;
      case "name-asc":
        orderByClause = asc(scanResults.productName);
        break;
      default:
        orderByClause = desc(scanResults.savePercent);
    }
    
    let finalQuery = db.select().from(scanResults).where(whereClause).orderBy(orderByClause);
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;
    
    const results = await finalQuery.limit(limit).offset(offset);
    
    // Get total count for pagination
    const totalQuery = await db.select({ count: sql<number>`count(*)` }).from(scanResults).where(whereClause);
    const total = totalQuery[0]?.count || 0;
    
    return { results, total };
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

// MemStorage class removed for production deployment - using DbStorage only

// Export storage instance (for production use DbStorage)
export const storage = new DbStorage();
    this.users = new Map();
    this.stores = new Map();
    this.scans = new Map();
    this.scanResults = new Map();
    this.observations = new Map();
    this.shoppingList = new Map();
    this.contactSubmissions = new Map();
    
    // Initialize with all supported stores
    this.stores.set("home-depot", {
      id: "home-depot",
      name: "Home Depot",
      baseUrl: "https://www.homedepot.com",
      isActive: true,
    });
    
    this.stores.set("lowes", {
      id: "lowes", 
      name: "Lowe's",
      baseUrl: "https://www.lowes.com",
      isActive: true,
    });
    
    this.stores.set("ace-hardware", {
      id: "ace-hardware",
      name: "Ace Hardware", 
      baseUrl: "https://www.acehardware.com",
      isActive: true,
    });
    
    this.stores.set("amazon", {
      id: "amazon",
      name: "Amazon", 
      baseUrl: "https://www.amazon.com",
      isActive: true,
    });
    
    this.stores.set("walmart", {
      id: "walmart",
      name: "Walmart", 
      baseUrl: "https://www.walmart.com",
      isActive: false, // Coming Soon
    });
  }

  // User methods
  async createUser(userData: InsertUser & { password: string }): Promise<User> {
    const id = randomUUID();
    const referralCode = `${userData.username.slice(0, 3).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const user: User & { password: string } = {
      ...userData,
      id,
      createdAt: new Date(),
      subscriptionPlan: userData.subscriptionPlan ?? "free",
      stripeCustomerId: userData.stripeCustomerId ?? null,
      stripeSubscriptionId: userData.stripeSubscriptionId ?? null,
      zipCode: userData.zipCode ?? null,
      referralCode,
      referredBy: null,
      isAffiliate: false,
      affiliateStatus: "bronze",
      totalReferrals: "0",
      totalCommissions: "0.00",
      pendingCommissions: "0.00",
      weaveAccountId: null,
    };
    this.users.set(id, user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  
  async createUserWithReferral(userData: InsertUser & { password: string; referredBy?: string | null }): Promise<User> {
    const id = randomUUID();
    const referralCode = `${userData.username.slice(0, 3).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const user: User & { password: string } = {
      ...userData,
      id,
      createdAt: new Date(),
      subscriptionPlan: userData.subscriptionPlan ?? "free",
      stripeCustomerId: userData.stripeCustomerId ?? null,
      stripeSubscriptionId: userData.stripeSubscriptionId ?? null,
      zipCode: userData.zipCode ?? null,
      referralCode,
      referredBy: userData.referredBy || null,
      isAffiliate: false,
      affiliateStatus: "bronze",
      totalReferrals: "0",
      totalCommissions: "0.00",
      pendingCommissions: "0.00",
      weaveAccountId: null,
    };
    this.users.set(id, user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  
  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.referralCode === referralCode) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
      }
    }
    return undefined;
  }
  
  async trackAffiliateClick(data: { affiliateUserId: string; referralCode: string; ipAddress?: string; userAgent?: string; referer?: string }): Promise<void> {
    // For MemStorage, we just log the click (in production would store to database)
    console.log('Affiliate click tracked:', data);
  }
  
  async trackAffiliateConversion(data: { affiliateUserId: string; convertedUserId: string; referralCode: string; subscriptionPlan: string }): Promise<void> {
    const commissionRates = { free: 0, pro: 2.50, business: 6.25, pro_annual: 20.00, business_annual: 50.00 };
    const commissionAmount = commissionRates[data.subscriptionPlan as keyof typeof commissionRates] || 0;
    
    // Update user stats
    const user = this.users.get(data.affiliateUserId);
    if (user) {
      user.totalReferrals = (parseInt(user.totalReferrals || '0') + 1).toString();
      user.pendingCommissions = (parseFloat(user.pendingCommissions || '0') + commissionAmount).toFixed(2);
      user.isAffiliate = true;
    }
  }
  
  async getAffiliateStats(userId: string): Promise<{ clicks: number; conversions: number; totalCommissions: number; pendingCommissions: number }> {
    const user = this.users.get(userId);
    if (!user) return { clicks: 0, conversions: 0, totalCommissions: 0, pendingCommissions: 0 };
    
    return {
      clicks: 247, // Mock data for MemStorage
      conversions: 52,
      totalCommissions: parseFloat(user.totalCommissions || '0'),
      pendingCommissions: parseFloat(user.pendingCommissions || '0'),
    };
  }

  async getUserByEmail(email: string): Promise<(User & { password: string }) | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async updateUserZipCode(id: string, zipCode: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, zipCode };
    this.users.set(id, updatedUser);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async updateUserStripeInfo(
    id: string, 
    stripeCustomerId?: string, 
    stripeSubscriptionId?: string, 
    subscriptionPlan?: string
  ): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user,
      ...(stripeCustomerId && { stripeCustomerId }),
      ...(stripeSubscriptionId && { stripeSubscriptionId }),
      ...(subscriptionPlan && { subscriptionPlan }),
    };
    this.users.set(id, updatedUser);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = insertStore.name.toLowerCase().replace(/\s+/g, "-");
    const store: Store = { ...insertStore, id, isActive: insertStore.isActive ?? true };
    this.stores.set(id, store);
    return store;
  }

  async getActiveStoreLocations(): Promise<any[]> {
    // For MemStorage, return sample store locations to demonstrate the integration
    return [
      {
        id: "HD-1001",
        storeNumber: "1001", 
        name: "Home Depot Downtown",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        phone: "(555) 123-4567",
        latitude: 40.7505,
        longitude: -73.9934,
        storeHours: "Mon-Sat: 6am-10pm, Sun: 8am-8pm",
        isActive: true
      },
      {
        id: "HD-1002",
        storeNumber: "1002",
        name: "Home Depot Midtown", 
        address: "456 Broadway",
        city: "New York", 
        state: "NY",
        zipCode: "10018",
        phone: "(555) 234-5678",
        latitude: 40.7549,
        longitude: -73.9840,
        storeHours: "Mon-Sat: 6am-10pm, Sun: 8am-8pm",
        isActive: true
      },
      {
        id: "LW-2001",
        storeNumber: "2001",
        name: "Lowe's Home Improvement",
        address: "789 5th Ave", 
        city: "New York",
        state: "NY",
        zipCode: "10022",
        phone: "(555) 345-6789",
        latitude: 40.7614,
        longitude: -73.9776,
        storeHours: "Mon-Sat: 6am-10pm, Sun: 8am-8pm", 
        isActive: true
      },
      {
        id: "LW-2002",
        storeNumber: "2002",
        name: "Lowe's Brooklyn",
        address: "321 Atlantic Ave",
        city: "Brooklyn",
        state: "NY", 
        zipCode: "11201",
        phone: "(555) 456-7890",
        latitude: 40.6892,
        longitude: -73.9942,
        storeHours: "Mon-Sat: 6am-10pm, Sun: 8am-8pm",
        isActive: true
      }
    ];
  }

  async createScan(insertScan: InsertScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = {
      ...insertScan,
      id,
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
      resultCount: "0",
      clearanceCount: "0",
      storeCount: "1",
      zipCode: insertScan.zipCode ?? null,
      plan: insertScan.plan ?? "free",
      category: insertScan.category ?? null,
      priceRange: insertScan.priceRange ?? null,
      specificSkus: insertScan.specificSkus ?? null,
      minimumDiscountPercent: insertScan.minimumDiscountPercent ?? null,
      minimumDollarsOff: insertScan.minimumDollarsOff ?? null,
      sortBy: insertScan.sortBy ?? null,
      clearanceOnly: insertScan.clearanceOnly ?? false,
    };
    this.scans.set(id, scan);
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async getScans(limit = 10): Promise<Scan[]> {
    const allScans = Array.from(this.scans.values());
    return allScans
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getUserScans(userId: string, limit = 10): Promise<Scan[]> {
    const userScans = Array.from(this.scans.values()).filter(scan => scan.userId === userId);
    return userScans
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getUserScansThisMonth(userId: string, month: string): Promise<Scan[]> {
    const startDate = new Date(month + "-01");
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const userScans = Array.from(this.scans.values()).filter(scan => 
      scan.userId === userId && 
      new Date(scan.createdAt) >= startDate && 
      new Date(scan.createdAt) <= endDate
    );
    
    return userScans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // SECURITY FIX: Atomic scan limit checking for in-memory storage
  async checkAndIncrementScanLimit(userId: string, month: string, limit: number): Promise<{allowed: boolean, currentCount: number}> {
    const startDate = new Date(month + "-01");
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const userScans = Array.from(this.scans.values()).filter(scan => 
      scan.userId === userId && 
      new Date(scan.createdAt) >= startDate && 
      new Date(scan.createdAt) <= endDate
    );
    
    const currentCount = userScans.length;
    
    if (currentCount >= limit) {
      return { allowed: false, currentCount };
    }
    
    return { allowed: true, currentCount };
  }

  // SECURITY FIX: Ownership verification for scans
  async getScanByIdAndUserId(id: string, userId: string): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    if (scan && scan.userId === userId) {
      return scan;
    }
    return undefined;
  }

  async updateScanStatus(id: string, status: string, resultCount?: string, clearanceCount?: string): Promise<void> {
    const scan = this.scans.get(id);
    if (scan) {
      const updatedScan = {
        ...scan,
        status,
        ...(resultCount && { resultCount }),
        ...(clearanceCount && { clearanceCount }),
      };
      this.scans.set(id, updatedScan);
    }
  }

  async completeScan(id: string, resultCount: string, clearanceCount: string): Promise<void> {
    const scan = this.scans.get(id);
    if (scan) {
      const updatedScan = {
        ...scan,
        status: "completed",
        resultCount,
        clearanceCount,
        completedAt: new Date(),
      };
      this.scans.set(id, updatedScan);
    }
  }

  async createScanResult(insertResult: InsertScanResult): Promise<ScanResult> {
    const id = randomUUID();
    const result: ScanResult = {
      ...insertResult,
      id,
      sku: insertResult.sku ?? null,
      storeId: insertResult.storeId || "unknown",
      productUrl: insertResult.productUrl || "",
      wasPrice: insertResult.wasPrice ?? null,
      savePercent: insertResult.savePercent ?? null,
      inStock: insertResult.inStock ?? null,
      deliveryAvailable: insertResult.deliveryAvailable ?? null,
      observedAt: new Date(),
      source: insertResult.source ?? "mock",
      purchaseInStore: insertResult.purchaseInStore ?? false,
      storeName: insertResult.storeName ?? null,
      // Legacy fields for backward compatibility
      originalPrice: insertResult.originalPrice ?? null,
      clearancePrice: insertResult.clearancePrice ?? null,
      savingsPercent: insertResult.savingsPercent ?? null,
      category: insertResult.category ?? null,
      storeLocation: insertResult.storeLocation ?? null,
      isOnClearance: insertResult.isOnClearance ?? false,
      isPriceSuppressed: insertResult.isPriceSuppressed ?? false,
    };
    this.scanResults.set(id, result);
    return result;
  }

  async getScanResults(
    scanId: string,
    filters: {
      search?: string;
      store?: string;
      category?: string;
      sortBy?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ results: ScanResult[]; total: number; }> {
    let results = Array.from(this.scanResults.values()).filter(
      result => result.scanId === scanId
    );

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(result => 
        result.productName.toLowerCase().includes(searchLower) ||
        (result.sku && result.sku.toLowerCase().includes(searchLower))
      );
    }

    if (filters.store && filters.store !== "all") {
      results = results.filter(result => result.storeLocation === filters.store);
    }

    if (filters.category && filters.category !== "all") {
      if (filters.category === "clearance") {
        results = results.filter(result => result.isOnClearance);
      } else {
        results = results.filter(result => result.category === filters.category);
      }
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "savings-desc":
        results.sort((a, b) => {
          const aPercent = parseFloat(a.savingsPercent || "0");
          const bPercent = parseFloat(b.savingsPercent || "0");
          return bPercent - aPercent;
        });
        break;
      case "price-asc":
        results.sort((a, b) => {
          const aPrice = parseFloat(a.clearancePrice || a.originalPrice || "0");
          const bPrice = parseFloat(b.clearancePrice || b.originalPrice || "0");
          return aPrice - bPrice;
        });
        break;
      case "name-asc":
        results.sort((a, b) => a.productName.localeCompare(b.productName));
        break;
      default:
        // Default to highest savings
        results.sort((a, b) => {
          const aPercent = parseFloat(a.savingsPercent || "0");
          const bPercent = parseFloat(b.savingsPercent || "0");
          return bPercent - aPercent;
        });
    }

    const total = results.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    const paginatedResults = results.slice(start, start + limit);

    return { results: paginatedResults, total };
  }

  // Shopping list methods
  async getShoppingListItems(userId: string): Promise<any[]> {
    // Mock implementation - in real app this would query the database
    return [];
  }

  async addToShoppingList(item: any): Promise<any> {
    // Mock implementation - in real app this would insert into database
    const id = randomUUID();
    return { id, ...item, addedAt: new Date(), isCompleted: false };
  }

  async updateShoppingListItem(itemId: string, updates: any): Promise<any> {
    // Mock implementation - in real app this would update database
    return { id: itemId, ...updates };
  }

  async deleteShoppingListItem(itemId: string): Promise<boolean> {
    // Mock implementation - in real app this would delete from database
    return true;
  }
  
  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      status: "new",
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  // Observation methods
  async upsertObservation(insertObservation: InsertObservation): Promise<Observation> {
    // Create a key for upsert based on storeId + productUrl
    const key = `${insertObservation.storeId}-${insertObservation.productUrl}`;
    
    const id = randomUUID();
    const observation: Observation = {
      id,
      storeId: insertObservation.storeId,
      sku: insertObservation.sku || null,
      productUrl: insertObservation.productUrl,
      clearancePrice: insertObservation.clearancePrice || null,
      wasPrice: insertObservation.wasPrice || null,
      savePercent: insertObservation.savePercent || null,
      inStock: insertObservation.inStock || null,
      deliveryAvailable: insertObservation.deliveryAvailable ?? null,
      isOnClearance: insertObservation.isOnClearance ?? false,
      observedAt: new Date(),
      source: insertObservation.source || "unknown",
    };
    
    this.observations.set(key, observation);
    return observation;
  }

  async getObservations(storeId: string, productUrl: string): Promise<Observation[]> {
    const key = `${storeId}-${productUrl}`;
    const observation = this.observations.get(key);
    return observation ? [observation] : [];
  }

  // Home Depot scan methods
  async createHomeDepotScan(scanData: CreateHomeDepotScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = {
      id,
      userId: scanData.userId,
      storeId: "home-depot",
      zipCode: scanData.zipCode,
      plan: scanData.plan,
      productSelection: "all",
      specificSkus: null,
      clearanceOnly: true,
      category: null,
      priceRange: null,
      minimumDiscountPercent: null,
      minimumDollarsOff: null,
      sortBy: "discount-percent",
      storeCount: "1",
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
      resultCount: "0",
      clearanceCount: "0",
    };
    
    this.scans.set(id, scan);
    return scan;
  }

  async getHomeDepotScanResults(scanId: string): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }> {
    const results = Array.from(this.scanResults.values()).filter(
      result => result.scanId === scanId
    );

    // Count unique stores
    const uniqueStores = new Set(results.map(r => r.storeId));
    const storesScanned = uniqueStores.size;
    const itemsFound = results.length;

    return {
      results,
      summary: { storesScanned, itemsFound }
    };
  }

  // Ace Hardware scan methods
  async createAceHardwareScan(scanData: CreateAceHardwareScan): Promise<Scan> {
    const id = randomUUID();
    const scan: Scan = {
      id,
      userId: scanData.userId,
      storeId: "ace-hardware",
      zipCode: scanData.zipCode,
      plan: scanData.plan,
      productSelection: "all",
      specificSkus: null,
      clearanceOnly: true,
      category: null,
      priceRange: null,
      minimumDiscountPercent: null,
      minimumDollarsOff: null,
      sortBy: "discount-percent",
      storeCount: "1", // Will be updated when scan completes
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
      resultCount: "0",
      clearanceCount: "0",
    };
    
    this.scans.set(id, scan);
    return scan;
  }

  async getAceHardwareScanResults(scanId: string): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }> {
    const results = Array.from(this.scanResults.values()).filter(
      result => result.scanId === scanId
    );

    // Count unique stores
    const uniqueStores = new Set(results.map(r => r.storeId));
    const storesScanned = uniqueStores.size;
    const itemsFound = results.length;

    return {
      results,
      summary: { storesScanned, itemsFound }
    };
  }
}

// Use database storage for persistent data
export const storage = new DbStorage();
