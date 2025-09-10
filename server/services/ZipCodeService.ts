import * as fs from 'fs';
import * as csv from 'csv-parse/sync';
import path from 'path';

interface ZipCodeData {
  zip: string;
  lat: number;
  lng: number;
  city: string;
  state_id: string;
  state_name: string;
}

interface LocationCoords {
  lat: number;
  lng: number;
  source: 'exact_zip' | 'zip_prefix' | 'state_center' | 'fallback';
  city?: string;
  state?: string;
}

class ZipCodeService {
  private zipLookup = new Map<string, LocationCoords>();
  private stateCenters = new Map<string, LocationCoords>();
  private isInitialized = false;
  private readonly zipDataPath = '/home/runner/.cache/kagglehub/datasets/sergejnuss/us-zip-codes/versions/1/uszips.csv';

  constructor() {
    this.initializeAsync();
  }

  private async initializeAsync() {
    try {
      await this.loadZipCodeData();
      console.log('✅ ZIP code service initialized with comprehensive dataset');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize ZIP code service:', error);
      console.log('⚠️  Falling back to limited ZIP code dataset');
      // Use fallback hardcoded data if ZIP file unavailable
      this.loadFallbackData();
      this.isInitialized = true;
    }
  }

  private async loadZipCodeData() {
    console.log('📍 Loading comprehensive ZIP code database...');
    
    if (!fs.existsSync(this.zipDataPath)) {
      throw new Error(`ZIP code data file not found at ${this.zipDataPath}`);
    }

    const csvData = fs.readFileSync(this.zipDataPath, 'utf8');
    const zipCodes: ZipCodeData[] = csv.parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });

    console.log(`✅ Loaded ${zipCodes.length} ZIP codes from dataset`);

    // Build lookup tables
    const stateCenters = new Map<string, {latSum: number, lngSum: number, count: number}>();

    for (const row of zipCodes) {
      const zipCode = row.zip.padStart(5, '0');
      const lat = parseFloat(row.lat);
      const lng = parseFloat(row.lng);
      const state = row.state_id.toUpperCase();

      if (!isNaN(lat) && !isNaN(lng)) {
        // Store ZIP code coordinates
        this.zipLookup.set(zipCode, {
          lat,
          lng,
          source: 'exact_zip',
          city: row.city,
          state: state
        });

        // Calculate state centers
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
        this.stateCenters.set(state, {
          lat: data.latSum / data.count,
          lng: data.lngSum / data.count,
          source: 'state_center',
          state: state
        });
      }
    }

    console.log(`📍 Built lookup tables: ${this.zipLookup.size} ZIP codes, ${this.stateCenters.size} state centers`);
  }

  private loadFallbackData() {
    console.log('⚠️  Loading fallback ZIP code data...');
    
    // Major metropolitan areas and their coordinates
    const fallbackZips: {[key: string]: LocationCoords} = {
      // Major cities - East Coast
      '10001': { lat: 40.7505, lng: -73.9934, source: 'fallback', city: 'New York', state: 'NY' }, // NYC
      '02101': { lat: 42.3554, lng: -71.0640, source: 'fallback', city: 'Boston', state: 'MA' },
      '19102': { lat: 39.9526, lng: -75.1652, source: 'fallback', city: 'Philadelphia', state: 'PA' },
      '20001': { lat: 38.9072, lng: -77.0369, source: 'fallback', city: 'Washington', state: 'DC' },
      '33101': { lat: 25.7743, lng: -80.1937, source: 'fallback', city: 'Miami', state: 'FL' },
      '30301': { lat: 33.7678, lng: -84.4906, source: 'fallback', city: 'Atlanta', state: 'GA' },
      '28202': { lat: 35.2271, lng: -80.8431, source: 'fallback', city: 'Charlotte', state: 'NC' },
      
      // Major cities - Central
      '60601': { lat: 41.8827, lng: -87.6233, source: 'fallback', city: 'Chicago', state: 'IL' },
      '77001': { lat: 29.7372, lng: -95.3651, source: 'fallback', city: 'Houston', state: 'TX' },
      '75201': { lat: 32.7767, lng: -96.7970, source: 'fallback', city: 'Dallas', state: 'TX' },
      '78701': { lat: 30.2672, lng: -97.7431, source: 'fallback', city: 'Austin', state: 'TX' },
      '32801': { lat: 28.5383, lng: -81.3792, source: 'fallback', city: 'Orlando', state: 'FL' },
      '37201': { lat: 36.1627, lng: -86.7816, source: 'fallback', city: 'Nashville', state: 'TN' },
      '63101': { lat: 38.6270, lng: -90.1994, source: 'fallback', city: 'St. Louis', state: 'MO' },
      '53202': { lat: 43.0389, lng: -87.9065, source: 'fallback', city: 'Milwaukee', state: 'WI' },
      '35203': { lat: 33.5186, lng: -86.8104, source: 'fallback', city: 'Birmingham', state: 'AL' },
      
      // Major cities - West Coast
      '90210': { lat: 34.0901, lng: -118.4065, source: 'fallback', city: 'Los Angeles', state: 'CA' },
      '94102': { lat: 37.7849, lng: -122.4194, source: 'fallback', city: 'San Francisco', state: 'CA' },
      '98101': { lat: 47.6097, lng: -122.3331, source: 'fallback', city: 'Seattle', state: 'WA' },
      '97201': { lat: 45.5152, lng: -122.6784, source: 'fallback', city: 'Portland', state: 'OR' },
      '85001': { lat: 33.4484, lng: -112.0740, source: 'fallback', city: 'Phoenix', state: 'AZ' },
      '80202': { lat: 39.7392, lng: -104.9903, source: 'fallback', city: 'Denver', state: 'CO' },
      '89101': { lat: 36.1699, lng: -115.1398, source: 'fallback', city: 'Las Vegas', state: 'NV' },
      '84101': { lat: 40.7608, lng: -111.8910, source: 'fallback', city: 'Salt Lake City', state: 'UT' },
    };

    // Load fallback data
    for (const [zip, coords] of Object.entries(fallbackZips)) {
      this.zipLookup.set(zip, coords);
    }

    // State centers fallback
    const fallbackStateCenters: {[key: string]: LocationCoords} = {
      'CA': { lat: 36.7783, lng: -119.4179, source: 'state_center', state: 'CA' },
      'TX': { lat: 31.9686, lng: -99.9018, source: 'state_center', state: 'TX' },
      'FL': { lat: 27.7663, lng: -81.6868, source: 'state_center', state: 'FL' },
      'NY': { lat: 42.1657, lng: -74.9481, source: 'state_center', state: 'NY' },
      'IL': { lat: 40.3363, lng: -89.0022, source: 'state_center', state: 'IL' },
      'PA': { lat: 41.2033, lng: -77.1945, source: 'state_center', state: 'PA' },
      'OH': { lat: 40.3888, lng: -82.7649, source: 'state_center', state: 'OH' },
    };

    for (const [state, coords] of Object.entries(fallbackStateCenters)) {
      this.stateCenters.set(state, coords);
    }

    console.log(`⚠️  Loaded ${Object.keys(fallbackZips).length} fallback ZIP codes`);
  }

  // Get coordinates for any ZIP code with comprehensive fallback strategies
  async getCoordinates(zipCode: string): Promise<LocationCoords> {
    // Ensure service is initialized with timeout protection
    let attempts = 0;
    while (!this.isInitialized && attempts < 100) { // 10 second timeout
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.isInitialized) {
      console.warn(`⚠️  ZIP service not ready after 10s, using fallback for ${zipCode}`);
      return {
        lat: 39.8283,
        lng: -98.5795,
        source: 'fallback',
        city: 'Geographic Center',
        state: 'US'
      };
    }

    const zip = zipCode.trim().padStart(5, '0');

    // Strategy 1: Exact ZIP code match
    if (this.zipLookup.has(zip)) {
      return this.zipLookup.get(zip)!;
    }

    // Strategy 2: ZIP prefix match (same region)
    if (zip.length >= 3) {
      const prefix = zip.substring(0, 3);
      for (const [zipKey, coords] of this.zipLookup) {
        if (zipKey.startsWith(prefix)) {
          return {
            ...coords,
            source: 'zip_prefix'
          };
        }
      }
    }

    // Strategy 3: State-based fallback using ZIP prefix
    const stateFromZip = this.getStateFromZipPrefix(zip);
    if (stateFromZip && this.stateCenters.has(stateFromZip)) {
      return this.stateCenters.get(stateFromZip)!;
    }

    // Strategy 4: Ultimate fallback - geographic center of US
    return {
      lat: 39.8283,
      lng: -98.5795,
      source: 'fallback',
      city: 'Geographic Center',
      state: 'US'
    };
  }

  // Get state abbreviation from ZIP code prefix
  private getStateFromZipPrefix(zipCode: string): string | null {
    const zipPrefix = parseInt(zipCode.substring(0, 3));
    
    const zipToStateMap: {[key: string]: string} = {
      // Northeast
      '010-027': 'MA', '028-029': 'RI', '030-038': 'NH', '039-049': 'ME',
      '050-059': 'VT', '060-069': 'CT', '070-089': 'NJ', '100-149': 'NY',
      '150-196': 'PA', '197-199': 'DE', '200-212': 'DC', '206-219': 'MD',
      // Southeast  
      '220-246': 'VA', '247-251': 'WV', '270-289': 'NC', '290-299': 'SC',
      '300-319': 'GA', '320-349': 'FL', '350-369': 'AL', '370-385': 'TN',
      '386-397': 'MS', '398-427': 'KY', '430-458': 'OH', '459-479': 'IN',
      // Midwest
      '480-499': 'MI', '500-528': 'IA', '530-549': 'WI', '550-567': 'MN',
      '570-577': 'SD', '580-588': 'ND', '590-599': 'MT', '600-629': 'IL',
      '630-658': 'MO', '660-679': 'KS', '680-693': 'NE', '700-729': 'LA',
      // South Central
      '730-749': 'AR', '750-799': 'TX', '800-816': 'CO', '820-831': 'WY',
      '832-838': 'ID', '840-847': 'UT', '850-860': 'AZ', '870-884': 'NM',
      '889-899': 'NV', '900-966': 'CA', '970-979': 'OR', '980-994': 'WA',
      '995-999': 'AK', '967-968': 'HI'
    };

    for (const [range, state] of Object.entries(zipToStateMap)) {
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(n => parseInt(n));
        if (zipPrefix >= start && zipPrefix <= end) {
          return state;
        }
      } else {
        if (zipPrefix === parseInt(range)) {
          return state;
        }
      }
    }

    return null;
  }

  // Get all ZIP codes for a state (useful for debugging)
  async getZipCodesForState(state: string): Promise<LocationCoords[]> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const results: LocationCoords[] = [];
    for (const [zip, coords] of this.zipLookup) {
      if (coords.state === state.toUpperCase()) {
        results.push({ ...coords });
      }
    }
    return results;
  }

  // Check if service is ready
  isReady(): boolean {
    return this.isInitialized;
  }

  // Get statistics about loaded data
  getStats() {
    return {
      totalZipCodes: this.zipLookup.size,
      totalStateCenters: this.stateCenters.size,
      isInitialized: this.isInitialized
    };
  }
}

// Create singleton instance
export const zipCodeService = new ZipCodeService();
export { ZipCodeService, type LocationCoords };