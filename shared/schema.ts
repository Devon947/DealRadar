import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp, jsonb, real, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Separate secure authentication table
export const userAuth = pgTable("user_auth", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [index("idx_user_auth_email").on(table.email)]);

// Session storage table for database sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User profile and business data (separate from auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authId: varchar("auth_id").notNull().references(() => userAuth.id, { onDelete: "cascade" }),
  zipCode: varchar("zip_code", { length: 5 }),
  stripeCustomerId: text("stripe_customer_id"), // Reused for Square customer ID
  stripeSubscriptionId: text("stripe_subscription_id"),
  squareCustomerId: text("square_customer_id"),
  subscriptionPlan: text("subscription_plan").default("free"), // 'free', 'pro', 'business', 'pro_annual', 'business_annual'
  // Affiliate/Referral fields
  referralCode: text("referral_code").unique(), // User's own referral code
  referredBy: text("referred_by"), // Who referred this user
  isAffiliate: boolean("is_affiliate").notNull().default(false),
  affiliateStatus: text("affiliate_status").default("bronze"), // bronze, silver, gold, platinum
  totalReferrals: text("total_referrals").default("0"),
  totalCommissions: decimal("total_commissions", { precision: 10, scale: 2 }).default("0.00"),
  pendingCommissions: decimal("pending_commissions", { precision: 10, scale: 2 }).default("0.00"),
  weaveAccountId: text("weave_account_id"), // External weave account connection
  emailPreferences: jsonb("email_preferences").default({
    dealAlerts: true,
    marketingEmails: true,
    weeklyUpdates: false
  }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
}, (table) => [index("idx_users_auth_id").on(table.authId)]);

export const stores = pgTable("stores", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  storeId: varchar("store_id").notNull(),
  zipCode: varchar("zip_code", { length: 5 }),
  plan: text("plan").default("free"), // 'free', 'pro', 'business', 'pro_annual', 'business_annual'
  productSelection: text("product_selection").notNull(), // 'all' or 'specific'
  specificSkus: text("specific_skus").array(),
  clearanceOnly: boolean("clearance_only").notNull().default(false),
  category: text("category"),
  priceRange: text("price_range"),
  minimumDiscountPercent: text("minimum_discount_percent"),
  minimumDollarsOff: text("minimum_dollars_off"),
  sortBy: text("sort_by").default("discount-percent"),
  storeCount: text("store_count").default("1"), // Number of stores to scan based on subscription
  status: text("status").notNull().default("pending"), // 'pending', 'running', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  resultCount: text("result_count").default("0"),
  clearanceCount: text("clearance_count").default("0"),
});

export const scanResults = pgTable("scan_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").notNull(),
  storeId: varchar("store_id").notNull(),
  productName: text("product_name").notNull(),
  sku: text("sku"),
  productUrl: text("product_url").notNull(),
  clearancePrice: decimal("clearance_price", { precision: 10, scale: 2 }),
  wasPrice: decimal("was_price", { precision: 10, scale: 2 }),
  savePercent: text("save_percent"),
  inStock: text("in_stock"),
  deliveryAvailable: boolean("delivery_available"),
  isOnClearance: boolean("is_on_clearance").notNull().default(false),
  observedAt: timestamp("observed_at").notNull().default(sql`now()`),
  source: text("source").notNull().default("mock"), // 'mock', 'alt', 'api'
  // In-store purchase fields
  purchaseInStore: boolean("purchase_in_store").notNull().default(false),
  storeName: text("store_name"),
  // Legacy fields for backward compatibility
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  savingsPercent: text("savings_percent"),
  isPriceSuppressed: boolean("is_price_suppressed").notNull().default(false),
  category: text("category"),
  storeLocation: text("store_location"),
});

// Observations table for storing verified clearance results
export const observations = pgTable("observations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku"),
  storeId: varchar("store_id").notNull(),
  productUrl: text("product_url").notNull(),
  clearancePrice: decimal("clearance_price", { precision: 10, scale: 2 }),
  wasPrice: decimal("was_price", { precision: 10, scale: 2 }),
  savePercent: text("save_percent"),
  inStock: text("in_stock"),
  deliveryAvailable: boolean("delivery_available"),
  isOnClearance: boolean("is_on_clearance").notNull().default(false),
  observedAt: timestamp("observed_at").notNull().default(sql`now()`),
  source: text("source").notNull().default("alt"), // 'mock', 'alt', 'api'
});

// Cached products table to avoid re-scraping
export const cachedProducts = pgTable("cached_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  productName: text("product_name").notNull(),
  category: text("category"),
  productUrl: text("product_url"),
  lastScraped: timestamp("last_scraped").notNull().default(sql`now()`),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  isDiscontinued: boolean("is_discontinued").notNull().default(false),
});

// Store locations table with real Home Depot data
export const storeLocations = pgTable("store_locations", {
  id: varchar("id").primaryKey(), // e.g., "HD-0206"
  storeNumber: text("store_number").notNull(), // e.g., "0206"
  name: text("name").notNull(), // e.g., "HD Southland"
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  storeHours: text("store_hours"),
  isActive: boolean("is_active").notNull().default(true),
});

// Price history for tracking changes
export const priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  storeId: varchar("store_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isOnClearance: boolean("is_on_clearance").notNull(),
  recordedAt: timestamp("recorded_at").notNull().default(sql`now()`),
});

// Affiliate tracking tables
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateUserId: varchar("affiliate_user_id").notNull(),
  referralCode: text("referral_code").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  clickedAt: timestamp("clicked_at").notNull().default(sql`now()`),
});

export const affiliateConversions = pgTable("affiliate_conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateUserId: varchar("affiliate_user_id").notNull(),
  convertedUserId: varchar("converted_user_id").notNull(),
  referralCode: text("referral_code").notNull(),
  subscriptionPlan: text("subscription_plan").notNull(),
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 4 }).notNull(), // e.g., 0.2500 for 25%
  status: text("status").notNull().default("pending"), // pending, paid, cancelled
  convertedAt: timestamp("converted_at").notNull().default(sql`now()`),
  paidAt: timestamp("paid_at"),
});

export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateUserId: varchar("affiliate_user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // paypal, stripe, weave, bank_transfer
  externalId: text("external_id"), // ID from payment processor
  weaveTransactionId: text("weave_transaction_id"), // Weave-specific transaction ID
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  requestedAt: timestamp("requested_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

// Shopping list (favorites) organized by store and aisle
export const shoppingListItems = pgTable("shopping_list_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  storeId: varchar("store_id").notNull(),
  aisle: text("aisle"), // e.g., "A12", "Garden Center"
  bay: text("bay"), // e.g., "12-A"
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }), // Price user wants to be notified at
  notes: text("notes"),
  addedAt: timestamp("added_at").notNull().default(sql`now()`),
  isCompleted: boolean("is_completed").notNull().default(false),
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"), // 'new', 'read', 'resolved'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Email history for tracking sent emails
export const emailHistory = pgTable("email_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  emailType: text("email_type").notNull(), // 'welcome', 'deal_alert', 'subscription_confirmation', 'marketing', 'custom'
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  success: boolean("success").notNull().default(false),
  error: text("error"),
  sentAt: timestamp("sent_at").notNull().default(sql`now()`),
});

export const insertUserAuthSchema = createInsertSchema(userAuth).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
});

export const insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  status: true,
  resultCount: true,
  clearanceCount: true,
  storeCount: true,
});

export const insertScanResultSchema = createInsertSchema(scanResults).omit({
  id: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertObservationSchema = createInsertSchema(observations).omit({
  id: true,
  observedAt: true,
});

export type UserAuth = typeof userAuth.$inferSelect;
export type InsertUserAuth = z.infer<typeof insertUserAuthSchema>;
// Extended User type that includes joined fields from userAuth
export type User = typeof users.$inferSelect & {
  username: string;
  email: string;
};
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Scan = typeof scans.$inferSelect;
export type InsertScan = z.infer<typeof insertScanSchema>;
export type ScanResult = typeof scanResults.$inferSelect;
export type InsertScanResult = z.infer<typeof insertScanResultSchema>;
export type Observation = typeof observations.$inferSelect;
export type InsertObservation = z.infer<typeof insertObservationSchema>;
export type CachedProduct = typeof cachedProducts.$inferSelect;
export type StoreLocation = typeof storeLocations.$inferSelect;
export type PriceHistory = typeof priceHistory.$inferSelect;
export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type EmailHistory = typeof emailHistory.$inferSelect;

// Additional schemas for API validation
export const createScanRequestSchema = insertScanSchema.extend({
  productSelection: z.enum(["all", "specific"]),
  specificSkus: z.array(z.string()).optional(),
  minimumDiscountPercent: z.string().optional(),
  minimumDollarsOff: z.string().optional(),
  sortBy: z.enum(["discount-percent", "stock", "dollars-off"]).default("discount-percent"),
});

export const createHomeDepotScanSchema = z.object({
  userId: z.string(),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
  plan: z.enum(["free", "basic", "premium"]).default("free"),
});

export const createAceHardwareScanSchema = z.object({
  userId: z.string(),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
  plan: z.enum(["free", "basic", "premium"]).default("free"), // Plan included for consistency but no limits applied
});

export const updateUserZipCodeSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
});

export type CreateScanRequest = z.infer<typeof createScanRequestSchema>;
export type CreateHomeDepotScan = z.infer<typeof createHomeDepotScanSchema>;
export type CreateAceHardwareScan = z.infer<typeof createAceHardwareScanSchema>;
