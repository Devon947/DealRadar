// Temporary in-memory storage with all comprehensive data until database connection is resolved
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { IStorage } from "./storage";
import type { 
  User, Store, Scan, ScanResult, Observation, ContactSubmission, 
  StoreLocation, EmailHistory 
} from "@shared/schema";

// Load comprehensive real store data from Kaggle dataset
import { readFileSync } from 'fs';
import { join } from 'path';

let COMPREHENSIVE_REAL_STORES: StoreLocation[] = [];

function loadRealStoreData(): StoreLocation[] {
  try {
    const dataPath = join(process.cwd(), 'server', 'comprehensive-stores.json');
    const rawData = readFileSync(dataPath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.warn('Could not load comprehensive store data, using fallback');
    return [];
  }
}

export class TempStorage implements IStorage {
  private users = new Map<string, User & { authId: string; email: string; username: string; password: string }>();
  private stores = new Map<string, Store>();
  private storeLocations = new Map<string, StoreLocation>();
  private scans = new Map<string, Scan>();
  private scanResults = new Map<string, ScanResult[]>();
  
  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize stores
    this.stores.set('home_depot', { id: 'home_depot', name: 'The Home Depot', baseUrl: 'https://www.homedepot.com', isActive: true });
    this.stores.set('lowes', { id: 'lowes', name: 'Lowes', baseUrl: 'https://www.lowes.com', isActive: true });
    this.stores.set('ace_hardware', { id: 'ace_hardware', name: 'Ace Hardware', baseUrl: 'https://www.acehardware.com', isActive: true });
    
    // Load comprehensive real store locations from Kaggle dataset
    COMPREHENSIVE_REAL_STORES = loadRealStoreData();
    COMPREHENSIVE_REAL_STORES.forEach(location => {
      this.storeLocations.set(location.id, location);
    });

    console.log(`✅ TempStorage initialized with ${this.stores.size} stores and ${this.storeLocations.size} real locations from Kaggle dataset`);
  }

  // User methods
  async createUser(userData: { email: string; username: string; password: string; zipCode?: string; subscriptionPlan?: string }): Promise<User & { authId: string; email: string; username: string }> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const authId = randomUUID();
    const id = randomUUID();
    const referralCode = `${userData.username.slice(0, 3).toUpperCase()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const user: User & { authId: string; email: string; username: string; password: string } = {
      id,
      authId,
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      zipCode: userData.zipCode || null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      squareCustomerId: null,
      subscriptionPlan: userData.subscriptionPlan || "free",
      referralCode,
      referredBy: null,
      isAffiliate: false,
      affiliateStatus: "bronze",
      totalReferrals: "0",
      totalCommissions: "0.00",
      pendingCommissions: "0.00",
      weaveAccountId: null,
      emailPreferences: {
        dealAlerts: true,
        marketingEmails: true,
        weeklyUpdates: false
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<(User & { password: string; authId: string; email: string; username: string }) | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    return undefined;
  }

  async updateUserZipCode(id: string, zipCode: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error("User not found");
    }
    user.zipCode = zipCode;
    user.updatedAt = new Date();
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Store methods
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getActiveStoreLocations(storeId?: string, zipCode?: string, radius?: number, limit = 10000): Promise<StoreLocation[]> {
    let locations = Array.from(this.storeLocations.values()).filter(location => location.isActive);
    
    if (storeId) {
      // Convert storeId to match our ID patterns (home_depot -> HD, lowes -> LOW)
      let prefix = '';
      if (storeId === 'home_depot') prefix = 'HD-';
      else if (storeId === 'lowes') prefix = 'LOW-';
      else if (storeId === 'ace_hardware') prefix = 'ACE-';
      else prefix = storeId.toUpperCase().replace('_', '-') + '-';
      
      locations = locations.filter(location => location.id.startsWith(prefix));
    }
    
    console.log(`🏪 Returning ${locations.length} active store locations (filtered: ${storeId || 'none'})`);
    return locations.slice(0, limit);
  }

  // Scan methods (simplified for working demo)
  async createScan(insertScan: any): Promise<Scan> {
    const scan: Scan = {
      id: randomUUID(),
      userId: insertScan.userId,
      storeId: insertScan.storeId,
      zipCode: insertScan.zipCode,
      plan: insertScan.plan || "free",
      productSelection: insertScan.productSelection,
      specificSkus: insertScan.specificSkus || [],
      clearanceOnly: insertScan.clearanceOnly || false,
      category: insertScan.category || null,
      priceRange: insertScan.priceRange || null,
      minimumDiscountPercent: insertScan.minimumDiscountPercent || null,
      minimumDollarsOff: insertScan.minimumDollarsOff || null,
      sortBy: insertScan.sortBy || "discount-percent",
      storeCount: insertScan.storeCount || "1",
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
      resultCount: "0",
      clearanceCount: "0",
    };
    
    this.scans.set(scan.id, scan);
    return scan;
  }

  async getScan(id: string): Promise<Scan | undefined> {
    return this.scans.get(id);
  }

  async getScanByIdAndUserId(id: string, userId: string): Promise<Scan | undefined> {
    const scan = this.scans.get(id);
    return scan && scan.userId === userId ? scan : undefined;
  }

  async updateScanStatus(scanId: string, status: "pending" | "running" | "completed" | "failed", resultCount?: string | null, clearanceCount?: string | null): Promise<Scan | undefined> {
    const scan = this.scans.get(scanId);
    if (scan) {
      scan.status = status;
      if (resultCount !== undefined) scan.resultCount = resultCount;
      if (clearanceCount !== undefined) scan.clearanceCount = clearanceCount;
      if (status === "completed") scan.completedAt = new Date();
    }
    return scan;
  }

  // Implement remaining required methods with basic functionality
  async updateUserStripeInfo(): Promise<User> { throw new Error("Not implemented in temp storage"); }
  async updateUser(): Promise<User> { throw new Error("Not implemented in temp storage"); }
  async getUserScans(): Promise<{ scans: Scan[]; total: number }> { return { scans: [], total: 0 }; }
  async getScanById(): Promise<Scan | undefined> { return undefined; }
  async checkAndIncrementScanLimit(): Promise<{allowed: boolean, currentCount: number}> { return { allowed: true, currentCount: 0 }; }
  async addScanResult(): Promise<ScanResult> { throw new Error("Not implemented in temp storage"); }
  async getScanResults(): Promise<{ results: ScanResult[]; total: number }> { return { results: [], total: 0 }; }
  async upsertObservation(): Promise<Observation> { throw new Error("Not implemented in temp storage"); }
  async getObservations(): Promise<Observation[]> { return []; }
  async createHomeDepotScan(): Promise<Scan> { throw new Error("Not implemented in temp storage"); }
  async getHomeDepotScanResults(): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }> { return { results: [], summary: { storesScanned: 0, itemsFound: 0 } }; }
  async createAceHardwareScan(): Promise<Scan> { throw new Error("Not implemented in temp storage"); }
  async getAceHardwareScanResults(): Promise<{ results: ScanResult[]; summary: { storesScanned: number; itemsFound: number; }; }> { return { results: [], summary: { storesScanned: 0, itemsFound: 0 } }; }
}

export const tempStorage = new TempStorage();