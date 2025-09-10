export type SubscriptionPlan = "free" | "pro" | "business" | "pro_annual" | "business_annual";

// Monthly scan limits to prevent abuse and drive conversions
// PROFIT-OPTIMIZED: Tighter limits for maximum margins (200-500%)
export function getMonthlyScansForPlan(plan: SubscriptionPlan): number {
  const limits = {
    free: 1,           // Minimal loss leader - $0.02 cost
    pro: 10,           // $0.40 cost vs $9.99 revenue = 2400% margin
    business: 50,      // $5.00 cost vs $24.99 revenue = 400% margin  
    pro_annual: 10,    // Same monthly limits as pro
    business_annual: 50, // Same monthly limits as business
  };
  return limits[plan] || limits.free;
}

// Store limits per individual scan
// PROFIT-OPTIMIZED: Reduced store limits to control operational costs
export function getStoreLimitForPlan(plan: SubscriptionPlan): number {
  const limits = {
    free: 1,           // Single store only
    pro: 2,            // Reduced from 3 to control costs
    business: 5,       // Reduced from 10 to maintain margins
    pro_annual: 2,     // Same as monthly pro
    business_annual: 5, // Same as monthly business
  };
  return limits[plan] || limits.free;
}

// SECURITY: Hard cost limits per user per month (prevents going negative)
export function getMaxMonthlyCostForPlan(plan: SubscriptionPlan): number {
  const costLimits = {
    free: 0.10,        // Max $0.10/month loss
    pro: 2.00,         // Max $2/month cost (still 400% margin)
    business: 8.00,    // Max $8/month cost (still 200% margin)
    pro_annual: 2.00,  // Same monthly limits
    business_annual: 8.00, // Same monthly limits
  };
  return costLimits[plan] || costLimits.free;
}