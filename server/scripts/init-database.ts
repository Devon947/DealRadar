#!/usr/bin/env tsx

// Database initialization script to set up all tables and load store data
import { db } from '../db';
import { 
  userAuth, users, stores, storeLocations, scans, scanResults,
  emailHistory, contactSubmissions, observations, cachedProducts,
  priceHistory, affiliateClicks, affiliateConversions, affiliatePayouts,
  shoppingListItems, sessions
} from '../../shared/schema';
import { sql } from 'drizzle-orm';

// Import store location data
interface StoreLocationData {
  id: string;
  storeNumber: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  latitude: number;
  longitude: number;
  storeHours: string;
  isActive: boolean;
}

// Home Depot store locations
const HOME_DEPOT_STORES: StoreLocationData[] = [
  // Los Angeles Area
  { id: "HD-0206", storeNumber: "0206", name: "HD Southland", address: "600 Citadel Dr", city: "Los Angeles", state: "CA", zipCode: "90040", phone: "(323) 721-7020", latitude: 34.0522, longitude: -118.2437, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  { id: "HD-0208", storeNumber: "0208", name: "HD Hollywood", address: "5600 Sunset Blvd", city: "Hollywood", state: "CA", zipCode: "90028", phone: "(323) 461-3303", latitude: 34.0983, longitude: -118.3267, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  { id: "HD-0210", storeNumber: "0210", name: "HD West LA", address: "11240 Santa Monica Blvd", city: "West Los Angeles", state: "CA", zipCode: "90025", phone: "(310) 966-7550", latitude: 34.0407, longitude: -118.4612, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  
  // New York Area  
  { id: "HD-1234", storeNumber: "1234", name: "HD Manhattan", address: "40 W 23rd St", city: "New York", state: "NY", zipCode: "10010", phone: "(212) 929-9571", latitude: 40.7411, longitude: -73.9897, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
  { id: "HD-1235", storeNumber: "1235", name: "HD Brooklyn", address: "23 3rd Ave", city: "Brooklyn", state: "NY", zipCode: "11217", phone: "(718) 832-8553", latitude: 40.6781, longitude: -73.9441, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  { id: "HD-1236", storeNumber: "1236", name: "HD Queens", address: "124-04 31st Ave", city: "Flushing", state: "NY", zipCode: "11354", phone: "(718) 661-4608", latitude: 40.7769, longitude: -73.8370, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  
  // Chicago Area
  { id: "HD-0456", storeNumber: "0456", name: "HD Lincoln Park", address: "2665 N Elston Ave", city: "Chicago", state: "IL", zipCode: "60647", phone: "(773) 342-9200", latitude: 41.9282, longitude: -87.6870, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  { id: "HD-0457", storeNumber: "0457", name: "HD South Loop", address: "1232 S Canal St", city: "Chicago", state: "IL", zipCode: "60607", phone: "(312) 733-1050", latitude: 41.8661, longitude: -87.6398, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  
  // Houston Area
  { id: "HD-0789", storeNumber: "0789", name: "HD Midtown", address: "4400 N Freeway", city: "Houston", state: "TX", zipCode: "77022", phone: "(713) 691-0123", latitude: 29.8095, longitude: -95.3635, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
  { id: "HD-0790", storeNumber: "0790", name: "HD Galleria", address: "4201 Westheimer Rd", city: "Houston", state: "TX", zipCode: "77027", phone: "(713) 961-9725", latitude: 29.7370, longitude: -95.4638, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
];

// Ace Hardware store locations
const ACE_HARDWARE_STORES: StoreLocationData[] = [
  // Los Angeles Area
  { id: "ACE-001", storeNumber: "001", name: "Ace Hardware Downtown LA", address: "825 S Flower St", city: "Los Angeles", state: "CA", zipCode: "90017", phone: "(213) 629-3434", latitude: 34.0489, longitude: -118.2618, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
  { id: "ACE-002", storeNumber: "002", name: "Ace Hardware Hollywood", address: "5969 Melrose Ave", city: "Hollywood", state: "CA", zipCode: "90038", phone: "(323) 466-7191", latitude: 34.0836, longitude: -118.3089, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
  { id: "ACE-003", storeNumber: "003", name: "Ace Hardware Santa Monica", address: "1533 Lincoln Blvd", city: "Santa Monica", state: "CA", zipCode: "90401", phone: "(310) 458-6262", latitude: 34.0194, longitude: -118.4912, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
  
  // New York Area
  { id: "ACE-101", storeNumber: "101", name: "Ace Hardware Manhattan", address: "442 W 14th St", city: "New York", state: "NY", zipCode: "10014", phone: "(212) 924-3544", latitude: 40.7409, longitude: -74.0030, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
  { id: "ACE-102", storeNumber: "102", name: "Ace Hardware Brooklyn Heights", address: "147 Court St", city: "Brooklyn", state: "NY", zipCode: "11201", phone: "(718) 875-5890", latitude: 40.6890, longitude: -73.9924, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
  
  // Chicago Area  
  { id: "ACE-201", storeNumber: "201", name: "Ace Hardware Lincoln Park", address: "2468 N Lincoln Ave", city: "Chicago", state: "IL", zipCode: "60614", phone: "(773) 348-8090", latitude: 41.9276, longitude: -87.6369, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
];

async function initializeDatabase() {
  console.log('🚀 Starting database initialization...');

  try {
    // Test database connection first
    console.log('🔌 Testing database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✅ Database connection successful');

    // Create extensions
    console.log('📦 Creating PostgreSQL extensions...');
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    console.log('✅ UUID extension created');

    // Insert stores data
    console.log('🏪 Setting up store data...');
    await db.insert(stores).values([
      { id: 'home_depot', name: 'The Home Depot', baseUrl: 'https://www.homedepot.com', isActive: true },
      { id: 'ace_hardware', name: 'Ace Hardware', baseUrl: 'https://www.acehardware.com', isActive: true },
      { id: 'lowes', name: 'Lowes', baseUrl: 'https://www.lowes.com', isActive: true }
    ]).onConflictDoNothing();
    console.log('✅ Store data inserted');

    // Insert Home Depot store locations
    console.log('🏠 Loading Home Depot store locations...');
    for (const store of HOME_DEPOT_STORES) {
      await db.insert(storeLocations).values(store).onConflictDoNothing();
    }
    console.log(`✅ Loaded ${HOME_DEPOT_STORES.length} Home Depot locations`);

    // Insert Ace Hardware store locations
    console.log('🔨 Loading Ace Hardware store locations...');
    for (const store of ACE_HARDWARE_STORES) {
      await db.insert(storeLocations).values(store).onConflictDoNothing();
    }
    console.log(`✅ Loaded ${ACE_HARDWARE_STORES.length} Ace Hardware locations`);

    console.log('🎉 Database initialization completed successfully!');
    console.log(`📊 Total store locations: ${HOME_DEPOT_STORES.length + ACE_HARDWARE_STORES.length}`);

    // Verify data
    const storeCount = await db.select().from(stores);
    const locationCount = await db.select().from(storeLocations);
    console.log(`✨ Verification: ${storeCount.length} stores, ${locationCount.length} locations`);

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase().then(() => {
  console.log('🏁 Initialization script completed');
  process.exit(0);
});