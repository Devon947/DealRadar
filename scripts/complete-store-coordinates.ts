#!/usr/bin/env tsx

import { db } from "../server/db";
import { storeLocations } from "../shared/schema";
import { eq, isNull, or } from "drizzle-orm";
import * as fs from 'fs';
import * as csv from 'csv-parse/sync';

interface ZipCodeData {
  zip: string;
  lat: number;
  lng: number;
  city: string;
  state_id: string;
  state_name: string;
}

interface CoordinateLookup {
  lat: number;
  lng: number;
  source: 'zip' | 'city_state' | 'state_center';
}

class ComprehensiveCoordinateService {
  private zipLookup = new Map<string, CoordinateLookup>();
  private cityStateLookup = new Map<string, CoordinateLookup>();
  private stateCenterLookup = new Map<string, CoordinateLookup>();

  constructor(zipCodes: ZipCodeData[]) {
    console.log("🏗️  Building comprehensive coordinate lookup tables...");
    this.buildLookupTables(zipCodes);
  }

  private buildLookupTables(zipCodes: ZipCodeData[]) {
    // State center calculations for fallback
    const stateCenters = new Map<string, {latSum: number, lngSum: number, count: number}>();
    
    for (const row of zipCodes) {
      const zipCode = row.zip.padStart(5, '0');
      const lat = parseFloat(row.lat);
      const lng = parseFloat(row.lng);
      const state = row.state_id.toUpperCase();
      const city = row.city.toLowerCase().trim();
      
      if (!isNaN(lat) && !isNaN(lng)) {
        // 1. Exact ZIP code lookup (highest priority)
        this.zipLookup.set(zipCode, { lat, lng, source: 'zip' });
        
        // 2. City/State lookup (for fuzzy matching)
        const cityStateKey = `${city}_${state}`;
        if (!this.cityStateLookup.has(cityStateKey)) {
          this.cityStateLookup.set(cityStateKey, { lat, lng, source: 'city_state' });
        }
        
        // 3. Calculate state centers for ultimate fallback
        if (!stateCenters.has(state)) {
          stateCenters.set(state, { latSum: 0, lngSum: 0, count: 0 });
        }
        const stateData = stateCenters.get(state)!;
        stateData.latSum += lat;
        stateData.lngSum += lng;
        stateData.count += 1;
      }
    }
    
    // Calculate state center coordinates
    for (const [state, data] of stateCenters) {
      if (data.count > 0) {
        this.stateCenterLookup.set(state, {
          lat: data.latSum / data.count,
          lng: data.lngSum / data.count,
          source: 'state_center'
        });
      }
    }
    
    console.log(`   📍 ZIP lookups: ${this.zipLookup.size}`);
    console.log(`   🏙️  City/State lookups: ${this.cityStateLookup.size}`);
    console.log(`   🗺️  State centers: ${this.stateCenterLookup.size}`);
  }

  // State abbreviation mapping for data normalization
  private readonly stateMapping: {[key: string]: string} = {
    'texas': 'TX', 'california': 'CA', 'florida': 'FL', 'new york': 'NY',
    'illinois': 'IL', 'pennsylvania': 'PA', 'ohio': 'OH', 'georgia': 'GA',
    'north carolina': 'NC', 'michigan': 'MI', 'new jersey': 'NJ', 'virginia': 'VA',
    'washington': 'WA', 'arizona': 'AZ', 'massachusetts': 'MA', 'tennessee': 'TN',
    'indiana': 'IN', 'missouri': 'MO', 'maryland': 'MD', 'wisconsin': 'WI',
    'colorado': 'CO', 'minnesota': 'MN', 'south carolina': 'SC', 'alabama': 'AL',
    'louisiana': 'LA', 'kentucky': 'KY', 'oregon': 'OR', 'oklahoma': 'OK',
    'connecticut': 'CT', 'utah': 'UT', 'iowa': 'IA', 'nevada': 'NV',
    'arkansas': 'AR', 'mississippi': 'MS', 'kansas': 'KS', 'new mexico': 'NM',
    'nebraska': 'NE', 'west virginia': 'WV', 'idaho': 'ID', 'hawaii': 'HI',
    'new hampshire': 'NH', 'maine': 'ME', 'montana': 'MT', 'rhode island': 'RI',
    'delaware': 'DE', 'south dakota': 'SD', 'north dakota': 'ND', 'alaska': 'AK',
    'vermont': 'VT', 'wyoming': 'WY', 'district of columbia': 'DC'
  };

  // Comprehensive coordinate lookup with multiple fallback strategies
  findCoordinates(zipCode: string | null, city: string | null, state: string | null): CoordinateLookup | null {
    // Normalize inputs
    const normalizedZip = zipCode ? zipCode.padStart(5, '0') : '';
    const normalizedCity = city ? city.toLowerCase().trim() : '';
    let normalizedState = state ? state.trim() : '';
    
    // Handle full state names
    if (normalizedState.length > 2) {
      normalizedState = this.stateMapping[normalizedState.toLowerCase()] || normalizedState;
    }
    normalizedState = normalizedState.toUpperCase();

    // Strategy 1: Exact ZIP code match (highest confidence)
    if (normalizedZip && this.zipLookup.has(normalizedZip)) {
      return this.zipLookup.get(normalizedZip)!;
    }

    // Strategy 2: City + State match
    if (normalizedCity && normalizedState) {
      const cityStateKey = `${normalizedCity}_${normalizedState}`;
      if (this.cityStateLookup.has(cityStateKey)) {
        return this.cityStateLookup.get(cityStateKey)!;
      }

      // Strategy 2b: Try partial city matches (for cities with suffixes)
      for (const [key, coords] of this.cityStateLookup) {
        if (key.includes(`${normalizedCity}_${normalizedState}`) || key.includes(normalizedCity)) {
          return coords;
        }
      }
    }

    // Strategy 3: ZIP code prefix match (same region)
    if (normalizedZip.length >= 3) {
      const zipPrefix = normalizedZip.substring(0, 3);
      for (const [zip, coords] of this.zipLookup) {
        if (zip.startsWith(zipPrefix)) {
          return { ...coords, source: 'city_state' }; // Mark as less precise
        }
      }
    }

    // Strategy 4: State center fallback
    if (normalizedState && this.stateCenterLookup.has(normalizedState)) {
      return this.stateCenterLookup.get(normalizedState)!;
    }

    return null;
  }
}

async function completeStoreCoordinates() {
  console.log("🏪 Starting comprehensive store coordinate completion...");
  
  try {
    // Load US ZIP codes dataset
    console.log("📍 Loading comprehensive US ZIP codes dataset...");
    const csvData = fs.readFileSync('/home/runner/.cache/kagglehub/datasets/sergejnuss/us-zip-codes/versions/1/uszips.csv', 'utf8');
    const zipCodes: ZipCodeData[] = csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`✅ Loaded ${zipCodes.length} US ZIP codes with coordinates`);
    
    // Initialize comprehensive coordinate service
    const coordinateService = new ComprehensiveCoordinateService(zipCodes);
    
    // Get all stores that need coordinates
    const storesNeedingCoords = await db
      .select()
      .from(storeLocations)
      .where(or(isNull(storeLocations.latitude), isNull(storeLocations.longitude)));
    
    console.log(`🔍 Found ${storesNeedingCoords.length} stores needing coordinates`);
    
    let updatedCount = 0;
    let exactMatches = 0;
    let cityStateMatches = 0;
    let stateFallbacks = 0;
    let noMatches = 0;
    
    // Process stores in batches for better performance
    const batchSize = 50;
    for (let i = 0; i < storesNeedingCoords.length; i += batchSize) {
      const batch = storesNeedingCoords.slice(i, i + batchSize);
      const updates: Array<{id: string, lat: number, lng: number, source: string}> = [];
      
      for (const store of batch) {
        const coords = coordinateService.findCoordinates(
          store.zipCode,
          store.city,
          store.state
        );
        
        if (coords) {
          updates.push({
            id: store.id,
            lat: coords.lat,
            lng: coords.lng,
            source: coords.source
          });
          
          // Track match types
          switch (coords.source) {
            case 'zip': exactMatches++; break;
            case 'city_state': cityStateMatches++; break;
            case 'state_center': stateFallbacks++; break;
          }
          
          updatedCount++;
        } else {
          noMatches++;
          if (noMatches <= 5) {
            console.log(`  ❌ No coordinates found for: ${store.name} - ${store.city}, ${store.state} ${store.zipCode}`);
          }
        }
      }
      
      // Batch update coordinates
      for (const update of updates) {
        await db
          .update(storeLocations)
          .set({ latitude: update.lat, longitude: update.lng })
          .where(eq(storeLocations.id, update.id));
      }
      
      console.log(`   ✅ Updated batch ${i + 1}-${Math.min(i + batchSize, storesNeedingCoords.length)} (${updatedCount} total)`);
    }
    
    // Final verification
    const finalStats = await db
      .select()
      .from(storeLocations);
    
    const totalStores = finalStats.length;
    const withCoords = finalStats.filter(s => s.latitude && s.longitude).length;
    const coverage = ((withCoords / totalStores) * 100);
    
    console.log(`\n🎉 Coordinate completion finished!`);
    console.log(`   ✅ Updated: ${updatedCount} stores`);
    console.log(`   📍 Exact ZIP matches: ${exactMatches}`);
    console.log(`   🏙️  City/State matches: ${cityStateMatches}`);
    console.log(`   🗺️  State fallbacks: ${stateFallbacks}`);
    console.log(`   ❌ No matches: ${noMatches}`);
    console.log(`\n📊 Final Coverage:`);
    console.log(`   🏪 Total stores: ${totalStores}`);
    console.log(`   📍 With coordinates: ${withCoords}`);
    console.log(`   📈 Coverage: ${coverage.toFixed(1)}%`);
    
    if (coverage >= 99.0) {
      console.log(`\n🌟 EXCELLENT! Achieved ${coverage.toFixed(1)}% coverage!`);
    } else if (coverage >= 95.0) {
      console.log(`\n✨ GREAT! Achieved ${coverage.toFixed(1)}% coverage!`);
    } else {
      console.log(`\n⚠️  Coverage at ${coverage.toFixed(1)}% - consider additional data sources`);
    }
    
    // Show sample results
    const sampleUpdated = finalStats.filter(s => s.latitude && s.longitude).slice(-5);
    console.log(`\n📋 Recently updated stores:`);
    sampleUpdated.forEach(store => {
      console.log(`   ${store.id} - ${store.name} - ${store.city}, ${store.state} (${store.latitude!.toFixed(4)}, ${store.longitude!.toFixed(4)})`);
    });
    
  } catch (error) {
    console.error("❌ Error completing store coordinates:", error);
    process.exit(1);
  }
}

// Export for future use
export { ComprehensiveCoordinateService };

// Run the completion
completeStoreCoordinates()
  .then(() => {
    console.log("\n✨ Store coordinate completion successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });