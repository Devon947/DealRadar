import { type User, type InsertUser, type UserAuth, type InsertUserAuth, type Store, type InsertStore, type Scan, type InsertScan, type ScanResult, type InsertScanResult, type Observation, type InsertObservation, type ContactSubmission, type InsertContactSubmission, type CreateHomeDepotScan, type CreateAceHardwareScan, users, userAuth, stores, scans, scanResults, observations, contactSubmissions, shoppingListItems, affiliateClicks, affiliateConversions, affiliatePayouts, storeLocations } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, sql, and, ilike, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User authentication methods
  createUser(user: InsertUserAuth & { password: string }): Promise<UserAuth>;
  getUserByEmail(email: string): Promise<(UserAuth & { password: string }) | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserAuthById(id: string): Promise<UserAuth | undefined>;
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
  createUserWithReferral(user: InsertUserAuth & { password: string; referredBy?: string | null }): Promise<UserAuth>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  trackAffiliateClick(data: { affiliateUserId: string; referralCode: string; ipAddress?: string; userAgent?: string; referer?: string }): Promise<void>;
  trackAffiliateConversion(data: { affiliateUserId: string; convertedUserId: string; referralCode: string; subscriptionPlan: string }): Promise<void>;
  getAffiliateStats(userId: string): Promise<{ clicks: number; conversions: number; totalCommissions: number; pendingCommissions: number }>;
}

export class DatabaseStorage implements IStorage {
  // User authentication methods
  async createUser(userData: InsertUserAuth & { password: string }): Promise<UserAuth> {
    const [authUser] = await db.insert(userAuth).values({
      email: userData.email,
      username: userData.username,
      password: userData.password,
    }).returning();
    
    // Create user profile
    const referralCode = `${userData.username.slice(0, 3).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await db.insert(users).values({
      authId: authUser.id,
      subscriptionPlan: "free",
      referralCode,
      isAffiliate: false,
      affiliateStatus: "bronze",
      totalReferrals: "0",
      totalCommissions: "0.00",
      pendingCommissions: "0.00",
    });
    
    // Return auth user without password
    const { password: _, ...userWithoutPassword } = authUser;
    return userWithoutPassword as UserAuth;
  }
  
  async createUserWithReferral(userData: InsertUserAuth & { password: string; referredBy?: string | null }): Promise<UserAuth> {
    const [authUser] = await db.insert(userAuth).values({
      email: userData.email,
      username: userData.username,
      password: userData.password,
    }).returning();
    
    // Create user profile
    const referralCode = `${userData.username.slice(0, 3).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await db.insert(users).values({
      authId: authUser.id,
      subscriptionPlan: "free",
      referralCode,
      referredBy: userData.referredBy || null,
      isAffiliate: false,
      affiliateStatus: "bronze",
      totalReferrals: "0",
      totalCommissions: "0.00",
      pendingCommissions: "0.00",
    });
    
    // Return auth user without password
    const { password: _, ...userWithoutPassword } = authUser;
    return userWithoutPassword as UserAuth;
  }
  
  async getUserByEmail(email: string): Promise<(UserAuth & { password: string }) | undefined> {
    const [user] = await db.select().from(userAuth).where(eq(userAuth.email, email));
    return user;
  }
  
  async getUserAuthById(id: string): Promise<UserAuth | undefined> {
    const [user] = await db.select({
      id: userAuth.id,
      email: userAuth.email,
      username: userAuth.username,
      isActive: userAuth.isActive,
      lastLogin: userAuth.lastLogin,
      createdAt: userAuth.createdAt,
      updatedAt: userAuth.updatedAt
    }).from(userAuth).where(eq(userAuth.id, id));
    return user as UserAuth;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.authId, id));
    return user;
  }

  async updateUserZipCode(id: string, zipCode: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ zipCode })
      .where(eq(users.authId, id))
      .returning();
    return user as User;
  }

  async updateUserStripeInfo(id: string, stripeCustomerId?: string, stripeSubscriptionId?: string, subscriptionPlan?: string): Promise<User> {
    const [user] = await db.update(users)
      .set({ 
        stripeCustomerId: stripeCustomerId || null,
        stripeSubscriptionId: stripeSubscriptionId || null,
        subscriptionPlan: subscriptionPlan || "free"
      })
      .where(eq(users.authId, id))
      .returning();
    return user as User;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(eq(users.referralCode, referralCode))
      .limit(1);
    return user;
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
      .where(eq(users.authId, data.affiliateUserId));
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

  // Store methods
  async getStores(): Promise<Store[]> {
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

  // Scan methods (keeping the same as before but using authId for userId lookups)
  async createScan(scan: InsertScan): Promise<Scan> {
    const [newScan] = await db.insert(scans).values(scan).returning();
    return newScan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.id, id));
    return scan;
  }

  async getScanByIdAndUserId(id: string, userId: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans)
      .where(and(eq(scans.id, id), eq(scans.userId, userId)))
      .limit(1);
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

  // Scan result methods
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

  // Other methods (keeping same as before)
  async upsertObservation(observation: InsertObservation): Promise<Observation> {
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

export const storage = new DatabaseStorage();