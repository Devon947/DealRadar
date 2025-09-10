#!/usr/bin/env tsx

import { db } from '../server/db.js';
import { storeLocations } from '../shared/schema.js';
import fs from 'fs';
import { parse } from 'csv-parse/sync';

interface WalmartStore {
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

// State coordinates for approximate positioning
const stateCoords: Record<string, [number, number]> = {
  'AL': [32.318230, -86.902298], 'AK': [66.160507, -153.369141],
  'AZ': [34.168218, -111.930907], 'AR': [34.736009, -92.331122],
  'CA': [36.778261, -119.417932], 'CO': [39.550051, -105.782067],
  'CT': [41.767, -72.677], 'DE': [39.161921, -75.526755],
  'FL': [27.766279, -81.686783], 'GA': [33.76, -84.39],
  'HI': [21.30895, -157.826182], 'ID': [44.240459, -114.478828],
  'IL': [40.349457, -88.986137], 'IN': [39.790942, -86.147685],
  'IA': [42.032974, -93.581543], 'KS': [38.572954, -98.580480],
  'KY': [37.839333, -84.270018], 'LA': [30.45809, -91.140229],
  'ME': [45.367584, -68.972168], 'MD': [39.045755, -76.641271],
  'MA': [42.2352, -71.0275], 'MI': [44.182205, -84.506836],
  'MN': [46.39241, -94.636230], 'MS': [32.354668, -89.398528],
  'MO': [38.572954, -92.60376], 'MT': [47.042418, -109.633835],
  'NE': [41.590939, -99.675285], 'NV': [39.161921, -117.327728],
  'NH': [43.220093, -71.549896], 'NJ': [40.221741, -74.756138],
  'NM': [34.307144, -106.018066], 'NY': [42.659829, -75.615369],
  'NC': [35.771, -78.638], 'ND': [47.650589, -100.437012],
  'OH': [40.367474, -82.996216], 'OK': [35.482309, -97.534994],
  'OR': [43.804133, -120.554201], 'PA': [41.203322, -77.194525],
  'RI': [41.82355, -71.422132], 'SC': [33.836081, -81.163725],
  'SD': [44.367966, -100.336378], 'TN': [35.860119, -86.660156],
  'TX': [31.106, -97.6475], 'UT': [39.320980, -111.093731],
  'VT': [44.26639, -72.580536], 'VA': [37.54, -78.86],
  'WA': [47.042418, -120.681077], 'WV': [38.349497, -80.892951],
  'WI': [44.500000, -89.500000], 'WY': [43.07424, -107.290284]
};

function parseCityState(cityAndState: string): { city: string; state: string } {
  // Expected format: "City Name, ST" 
  const parts = cityAndState.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const state = parts[parts.length - 1];
    const city = parts.slice(0, -1).join(', ');
    return { city, state };
  }
  // Fallback if parsing fails
  return { city: cityAndState, state: 'XX' };
}

function extractStoreNumber(storeName: string): string {
  // Extract store number from name like "Supercenter #1158"
  const match = storeName.match(/#(\d+)/);
  return match ? match[1] : '0000';
}

async function loadAndInsertWalmartStores() {
  console.log('🏪 Loading Walmart store data...');
  
  const csvPath = '/home/runner/.cache/kagglehub/datasets/jackogozaly/us-walmart-store-locations/versions/1/Walmart_Locations.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`📊 Processing ${records.length} Walmart stores`);
  
  const walmartStores: WalmartStore[] = [];
  let skippedCount = 0;
  
  records.forEach((record, idx) => {
    try {
      const cityState = parseCityState(record.City_and_State);
      const storeNumber = extractStoreNumber(record.Store_Name);
      
      // Skip if we can't parse state properly
      if (!stateCoords[cityState.state] && cityState.state.length !== 2) {
        skippedCount++;
        return;
      }
      
      const coords = stateCoords[cityState.state] || [39.8283, -98.5795];
      
      // Add randomization for realistic spread within state
      const latOffset = (Math.random() - 0.5) * 1.5;
      const lonOffset = (Math.random() - 0.5) * 1.5;
      
      const walmartStore: WalmartStore = {
        id: `WMT-${String(3000 + idx).padStart(4, '0')}`,
        storeNumber: String(3000 + idx).padStart(4, '0'),
        name: record.Store_Name,
        address: record.Address,
        city: cityState.city,
        state: cityState.state,
        zipCode: String(record.Zipcode).padStart(5, '0'),
        phone: record.Phone_Number || `(555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        latitude: coords[0] + latOffset,
        longitude: coords[1] + lonOffset,
        storeHours: 'Daily: 6am-11pm',
        isActive: Math.random() > 0.01 // 99% active (Walmart has very few closed stores)
      };
      
      walmartStores.push(walmartStore);
    } catch (error) {
      console.warn(`⚠️  Skipped record ${idx}: ${error}`);
      skippedCount++;
    }
  });
  
  console.log(`✅ Processed ${walmartStores.length} stores (skipped ${skippedCount})`);
  
  // Batch insert for performance
  const BATCH_SIZE = 100;
  const batches: WalmartStore[][] = [];
  
  for (let i = 0; i < walmartStores.length; i += BATCH_SIZE) {
    batches.push(walmartStores.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`🚀 Inserting ${batches.length} batches...`);
  const startTime = Date.now();
  
  let totalInserted = 0;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    try {
      await db.insert(storeLocations).values(batch);
      totalInserted += batch.length;
      console.log(`✅ Batch ${i + 1}/${batches.length}: ${batch.length} stores (${totalInserted}/${walmartStores.length})`);
    } catch (error) {
      console.error(`❌ Batch ${i + 1} failed:`, error);
    }
  }
  
  const duration = (Date.now() - startTime) / 1000;
  const storesPerSecond = Math.round(totalInserted / duration);
  
  console.log(`🎉 Walmart store insertion complete!`);
  console.log(`📊 Stats: ${totalInserted} stores in ${duration}s (${storesPerSecond} stores/sec)`);
  
  // Show state distribution
  const stateCounts: Record<string, number> = {};
  walmartStores.forEach(store => {
    stateCounts[store.state] = (stateCounts[store.state] || 0) + 1;
  });
  
  const sortedStates = Object.entries(stateCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  console.log('\nTop 10 states by Walmart count:');
  sortedStates.forEach(([state, count]) => {
    console.log(`  ${state}: ${count}`);
  });
  
  return totalInserted;
}

// Execute the insertion
loadAndInsertWalmartStores()
  .then((count) => {
    console.log(`✅ Successfully inserted ${count} Walmart stores!`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Insertion failed:', error);
    process.exit(1);
  });