import { type StoreLocation } from "@shared/schema";

export interface Coordinates {
  lat: number;
  lon: number;
}

export interface StoreWithDistance extends StoreLocation {
  distance: number;
}

// Simple ZIP to coordinates mapping (using existing store data for resolution)
// In a real implementation, this could use a proper ZIP code database
export function resolveZipCoordinates(zipCode: string, stores: StoreLocation[]): Coordinates | null {
  // Find a store in the same ZIP code to get approximate coordinates
  const storeInZip = stores.find(store => store.zipCode === zipCode);
  if (storeInZip && storeInZip.latitude && storeInZip.longitude) {
    return { lat: storeInZip.latitude, lon: storeInZip.longitude };
  }
  
  // Fallback: use ZIP prefix matching for approximate coordinates
  const zipPrefix = zipCode.substring(0, 3);
  const nearbyStore = stores.find(store => store.zipCode.startsWith(zipPrefix));
  if (nearbyStore && nearbyStore.latitude && nearbyStore.longitude) {
    return { lat: nearbyStore.latitude, lon: nearbyStore.longitude };
  }
  
  // If no match found, return null
  return null;
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Select nearest stores based on coordinates and limit
export function selectNearestStoreIds(
  userCoord: Coordinates,
  stores: StoreLocation[],
  limit: number
): string[] {
  // Calculate distances and sort by nearest
  const storesWithDistance: StoreWithDistance[] = stores
    .filter(store => store.isActive && store.latitude && store.longitude)
    .map(store => ({
      ...store,
      distance: calculateDistance(userCoord, { 
        lat: store.latitude!, 
        lon: store.longitude! 
      })
    }))
    .sort((a, b) => a.distance - b.distance);
  
  // Return the IDs of the nearest stores up to the limit
  return storesWithDistance.slice(0, limit).map(store => store.id);
}

// Select stores within a specific radius (for Ace Hardware 50-mile radius)
export function selectStoresWithinRadius(
  userCoord: Coordinates,
  stores: StoreLocation[],
  radiusMiles: number
): string[] {
  // Calculate distances and filter by radius
  const storesWithinRadius: StoreWithDistance[] = stores
    .filter(store => store.isActive && store.latitude && store.longitude)
    .map(store => ({
      ...store,
      distance: calculateDistance(userCoord, { 
        lat: store.latitude!, 
        lon: store.longitude! 
      })
    }))
    .filter(store => store.distance <= radiusMiles)
    .sort((a, b) => a.distance - b.distance);
  
  // Return all store IDs within the radius (no limit)
  return storesWithinRadius.map(store => store.id);
}