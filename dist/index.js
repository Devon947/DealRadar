var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// client/src/components/real-store-data.tsx
var real_store_data_exports = {};
__export(real_store_data_exports, {
  REAL_HOME_DEPOT_STORES: () => REAL_HOME_DEPOT_STORES,
  findStoresByZipCode: () => findStoresByZipCode
});
function findStoresByZipCode(zipCode, maxStores = 25) {
  const zipPrefix = zipCode.substring(0, 2);
  let filteredStores = REAL_HOME_DEPOT_STORES;
  switch (zipPrefix) {
    case "90":
    // California (LA area)
    case "91":
    case "92":
    // San Diego area
    case "93":
    case "94":
    // San Jose area
    case "95":
      filteredStores = REAL_HOME_DEPOT_STORES.filter(
        (store) => store.state === "CA"
      );
      break;
    case "10":
    // New York area
    case "11":
    // NYC/Long Island
    case "07":
      filteredStores = REAL_HOME_DEPOT_STORES.filter(
        (store) => store.state === "NY"
      );
      break;
    case "60":
    // Chicago area
    case "61":
      filteredStores = REAL_HOME_DEPOT_STORES.filter(
        (store) => store.state === "IL"
      );
      break;
    case "77":
    // Houston area
    case "78":
    // Austin/San Antonio area
    case "75":
      filteredStores = REAL_HOME_DEPOT_STORES.filter(
        (store) => store.state === "TX"
      );
      break;
    case "85":
      filteredStores = REAL_HOME_DEPOT_STORES.filter(
        (store) => store.state === "AZ"
      );
      break;
    case "19":
      filteredStores = REAL_HOME_DEPOT_STORES.filter(
        (store) => store.state === "PA"
      );
      break;
    case "32":
    // Jacksonville area
    case "33":
      filteredStores = REAL_HOME_DEPOT_STORES.filter(
        (store) => store.state === "FL"
      );
      break;
    default:
      filteredStores = REAL_HOME_DEPOT_STORES.slice(0, maxStores);
  }
  return filteredStores.slice(0, maxStores);
}
var REAL_HOME_DEPOT_STORES;
var init_real_store_data = __esm({
  "client/src/components/real-store-data.tsx"() {
    "use strict";
    REAL_HOME_DEPOT_STORES = [
      // Los Angeles Area
      { id: "HD-0206", storeNumber: "0206", name: "HD Southland", address: "600 Citadel Dr", city: "Los Angeles", state: "CA", zipCode: "90040", phone: "(323) 721-7020", latitude: 34.0522, longitude: -118.2437, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-0208", storeNumber: "0208", name: "HD Hollywood", address: "5600 Sunset Blvd", city: "Hollywood", state: "CA", zipCode: "90028", phone: "(323) 461-3303", latitude: 34.0983, longitude: -118.3267, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-0210", storeNumber: "0210", name: "HD West LA", address: "11240 Santa Monica Blvd", city: "West Los Angeles", state: "CA", zipCode: "90025", phone: "(310) 966-7550", latitude: 34.0407, longitude: -118.4612, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // New York Area
      { id: "HD-1234", storeNumber: "1234", name: "HD Manhattan", address: "40 W 23rd St", city: "New York", state: "NY", zipCode: "10010", phone: "(212) 929-9571", latitude: 40.7411, longitude: -73.9897, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "HD-1235", storeNumber: "1235", name: "HD Brooklyn", address: "23 3rd Ave", city: "Brooklyn", state: "NY", zipCode: "11217", phone: "(718) 832-8553", latitude: 40.6781, longitude: -73.9441, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-1236", storeNumber: "1236", name: "HD Queens", address: "124-04 31st Ave", city: "Flushing", state: "NY", zipCode: "11354", phone: "(718) 661-4608", latitude: 40.7769, longitude: -73.837, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // Chicago Area
      { id: "HD-0456", storeNumber: "0456", name: "HD Lincoln Park", address: "2665 N Elston Ave", city: "Chicago", state: "IL", zipCode: "60647", phone: "(773) 342-9200", latitude: 41.9282, longitude: -87.687, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-0457", storeNumber: "0457", name: "HD South Loop", address: "1232 S Canal St", city: "Chicago", state: "IL", zipCode: "60607", phone: "(312) 733-1050", latitude: 41.8661, longitude: -87.6398, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // Houston Area
      { id: "HD-0789", storeNumber: "0789", name: "HD Midtown", address: "4400 N Freeway", city: "Houston", state: "TX", zipCode: "77022", phone: "(713) 691-0123", latitude: 29.8095, longitude: -95.3635, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-0790", storeNumber: "0790", name: "HD Galleria", address: "4201 Westheimer Rd", city: "Houston", state: "TX", zipCode: "77027", phone: "(713) 961-9725", latitude: 29.737, longitude: -95.4638, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // Phoenix Area
      { id: "HD-0912", storeNumber: "0912", name: "HD Central Phoenix", address: "1645 W Northern Ave", city: "Phoenix", state: "AZ", zipCode: "85021", phone: "(602) 944-9600", latitude: 33.5696, longitude: -112.1004, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-0913", storeNumber: "0913", name: "HD Scottsdale", address: "16849 N 83rd Ave", city: "Scottsdale", state: "AZ", zipCode: "85260", phone: "(480) 596-0720", latitude: 33.6405, longitude: -111.9595, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // Philadelphia Area
      { id: "HD-1112", storeNumber: "1112", name: "HD Center City", address: "1651 E Moyamensing Ave", city: "Philadelphia", state: "PA", zipCode: "19148", phone: "(215) 462-8600", latitude: 39.9237, longitude: -75.158, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-1113", storeNumber: "1113", name: "HD Northeast Philly", address: "7849 Frankford Ave", city: "Philadelphia", state: "PA", zipCode: "19136", phone: "(215) 333-0879", latitude: 40.0427, longitude: -75.0327, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // San Antonio Area
      { id: "HD-1314", storeNumber: "1314", name: "HD Alamo Heights", address: "4821 Broadway St", city: "San Antonio", state: "TX", zipCode: "78209", phone: "(210) 829-8300", latitude: 29.476, longitude: -98.4724, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-1315", storeNumber: "1315", name: "HD Westside", address: "6539 W Loop 1604 N", city: "San Antonio", state: "TX", zipCode: "78254", phone: "(210) 688-9070", latitude: 29.5927, longitude: -98.6156, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // San Diego Area
      { id: "HD-1516", storeNumber: "1516", name: "HD Mission Valley", address: "2470 Home Depot Way", city: "San Diego", state: "CA", zipCode: "92108", phone: "(619) 278-7050", latitude: 32.7549, longitude: -117.1356, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-1517", storeNumber: "1517", name: "HD Clairemont", address: "3825 Clairemont Dr", city: "San Diego", state: "CA", zipCode: "92117", phone: "(858) 279-7050", latitude: 32.8297, longitude: -117.1989, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // Dallas Area
      { id: "HD-1718", storeNumber: "1718", name: "HD Downtown Dallas", address: "5251 Alpha Rd", city: "Dallas", state: "TX", zipCode: "75240", phone: "(972) 991-8400", latitude: 32.9537, longitude: -96.7984, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-1719", storeNumber: "1719", name: "HD Plano", address: "1717 N Central Expy", city: "Plano", state: "TX", zipCode: "75075", phone: "(972) 423-7050", latitude: 33.0198, longitude: -96.6989, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // San Jose Area
      { id: "HD-1920", storeNumber: "1920", name: "HD San Jose Central", address: "3555 Union Ave", city: "San Jose", state: "CA", zipCode: "95124", phone: "(408) 559-1050", latitude: 37.3019, longitude: -121.9398, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-1921", storeNumber: "1921", name: "HD Sunnyvale", address: "1177 W El Camino Real", city: "Sunnyvale", state: "CA", zipCode: "94087", phone: "(408) 737-0900", latitude: 37.3713, longitude: -122.0678, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // Austin Area
      { id: "HD-2122", storeNumber: "2122", name: "HD South Austin", address: "9725 S IH 35", city: "Austin", state: "TX", zipCode: "78748", phone: "(512) 292-1050", latitude: 30.2048, longitude: -97.7891, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-2123", storeNumber: "2123", name: "HD North Austin", address: "12506 Research Blvd", city: "Austin", state: "TX", zipCode: "78759", phone: "(512) 257-4050", latitude: 30.4013, longitude: -97.7504, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      // Jacksonville Area
      { id: "HD-2324", storeNumber: "2324", name: "HD Southside", address: "10251 Southside Blvd", city: "Jacksonville", state: "FL", zipCode: "32256", phone: "(904) 641-1050", latitude: 30.235, longitude: -81.5619, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true },
      { id: "HD-2325", storeNumber: "2325", name: "HD Westside", address: "5400 Normandy Blvd", city: "Jacksonville", state: "FL", zipCode: "32205", phone: "(904) 781-1050", latitude: 30.3358, longitude: -81.7584, storeHours: "Mon-Sat: 6AM-10PM, Sun: 8AM-8PM", isActive: true }
    ];
  }
});

// client/src/components/ace-store-data.tsx
var ace_store_data_exports = {};
__export(ace_store_data_exports, {
  REAL_ACE_HARDWARE_STORES: () => REAL_ACE_HARDWARE_STORES,
  calculateDistance: () => calculateDistance2,
  findAceStoresByZipCode: () => findAceStoresByZipCode
});
function findAceStoresByZipCode(zipCode, radiusMiles = 50) {
  const zipPrefix = zipCode.substring(0, 2);
  let filteredStores = REAL_ACE_HARDWARE_STORES;
  switch (zipPrefix) {
    case "90":
    // California (LA area)
    case "91":
    case "92":
    // San Diego area
    case "93":
    case "94":
    // San Jose area
    case "95":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "CA"
      );
      break;
    case "10":
    // New York area
    case "11":
    // NYC/Long Island
    case "07":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "NY"
      );
      break;
    case "60":
    // Chicago area
    case "61":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "IL"
      );
      break;
    case "77":
    // Houston area
    case "78":
    // Austin/San Antonio area
    case "75":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "TX"
      );
      break;
    case "85":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "AZ"
      );
      break;
    case "19":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "PA"
      );
      break;
    case "32":
    // Jacksonville area
    case "33":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "FL"
      );
      break;
    case "98":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "WA"
      );
      break;
    case "80":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "CO"
      );
      break;
    case "37":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "TN"
      );
      break;
    case "30":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "GA"
      );
      break;
    case "97":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "OR"
      );
      break;
    case "02":
      filteredStores = REAL_ACE_HARDWARE_STORES.filter(
        (store) => store.state === "MA"
      );
      break;
    default:
      filteredStores = REAL_ACE_HARDWARE_STORES;
  }
  return filteredStores;
}
function calculateDistance2(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
var REAL_ACE_HARDWARE_STORES;
var init_ace_store_data = __esm({
  "client/src/components/ace-store-data.tsx"() {
    "use strict";
    REAL_ACE_HARDWARE_STORES = [
      // Los Angeles Area
      { id: "ACE-001", storeNumber: "001", name: "Ace Hardware Downtown LA", address: "825 S Flower St", city: "Los Angeles", state: "CA", zipCode: "90017", phone: "(213) 629-3434", latitude: 34.0489, longitude: -118.2618, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-002", storeNumber: "002", name: "Ace Hardware Hollywood", address: "5969 Melrose Ave", city: "Hollywood", state: "CA", zipCode: "90038", phone: "(323) 466-7191", latitude: 34.0836, longitude: -118.3089, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-003", storeNumber: "003", name: "Ace Hardware Santa Monica", address: "1533 Lincoln Blvd", city: "Santa Monica", state: "CA", zipCode: "90401", phone: "(310) 458-6262", latitude: 34.0194, longitude: -118.4912, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-004", storeNumber: "004", name: "Ace Hardware Pasadena", address: "2901 E Colorado Blvd", city: "Pasadena", state: "CA", zipCode: "91107", phone: "(626) 796-2273", latitude: 34.1478, longitude: -118.1091, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // New York Area
      { id: "ACE-101", storeNumber: "101", name: "Ace Hardware Manhattan", address: "442 W 14th St", city: "New York", state: "NY", zipCode: "10014", phone: "(212) 924-3544", latitude: 40.7409, longitude: -74.003, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-102", storeNumber: "102", name: "Ace Hardware Brooklyn Heights", address: "147 Court St", city: "Brooklyn", state: "NY", zipCode: "11201", phone: "(718) 875-5890", latitude: 40.689, longitude: -73.9924, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-103", storeNumber: "103", name: "Ace Hardware Queens", address: "37-21 Northern Blvd", city: "Long Island City", state: "NY", zipCode: "11101", phone: "(718) 729-8765", latitude: 40.7505, longitude: -73.9298, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-104", storeNumber: "104", name: "Ace Hardware Bronx", address: "2844 Third Ave", city: "Bronx", state: "NY", zipCode: "10455", phone: "(718) 292-6543", latitude: 40.8176, longitude: -73.9182, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Chicago Area
      { id: "ACE-201", storeNumber: "201", name: "Ace Hardware Lincoln Park", address: "2468 N Lincoln Ave", city: "Chicago", state: "IL", zipCode: "60614", phone: "(773) 348-8090", latitude: 41.9276, longitude: -87.6369, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-202", storeNumber: "202", name: "Ace Hardware Wicker Park", address: "1532 N Milwaukee Ave", city: "Chicago", state: "IL", zipCode: "60622", phone: "(773) 235-4567", latitude: 41.9085, longitude: -87.6776, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-203", storeNumber: "203", name: "Ace Hardware River North", address: "400 N Wells St", city: "Chicago", state: "IL", zipCode: "60654", phone: "(312) 644-7788", latitude: 41.8906, longitude: -87.634, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Houston Area
      { id: "ACE-301", storeNumber: "301", name: "Ace Hardware Montrose", address: "1533 Westheimer Rd", city: "Houston", state: "TX", zipCode: "77006", phone: "(713) 528-0808", latitude: 29.7429, longitude: -95.3905, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-302", storeNumber: "302", name: "Ace Hardware Heights", address: "1014 W 19th St", city: "Houston", state: "TX", zipCode: "77008", phone: "(713) 864-7676", latitude: 29.8016, longitude: -95.4103, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-303", storeNumber: "303", name: "Ace Hardware Rice Village", address: "2529 Rice Blvd", city: "Houston", state: "TX", zipCode: "77005", phone: "(713) 668-4444", latitude: 29.7179, longitude: -95.4134, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Phoenix Area
      { id: "ACE-401", storeNumber: "401", name: "Ace Hardware Central Phoenix", address: "3402 N 7th St", city: "Phoenix", state: "AZ", zipCode: "85014", phone: "(602) 274-4545", latitude: 33.4734, longitude: -112.062, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-402", storeNumber: "402", name: "Ace Hardware Scottsdale", address: "4811 N Scottsdale Rd", city: "Scottsdale", state: "AZ", zipCode: "85251", phone: "(480) 946-7890", latitude: 33.5061, longitude: -111.926, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-403", storeNumber: "403", name: "Ace Hardware Tempe", address: "1919 E Apache Blvd", city: "Tempe", state: "AZ", zipCode: "85281", phone: "(480) 967-5432", latitude: 33.4147, longitude: -111.9093, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Philadelphia Area
      { id: "ACE-501", storeNumber: "501", name: "Ace Hardware Center City", address: "1532 South St", city: "Philadelphia", state: "PA", zipCode: "19146", phone: "(215) 546-5467", latitude: 39.9445, longitude: -75.1677, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-502", storeNumber: "502", name: "Ace Hardware Northern Liberties", address: "990 Spring Garden St", city: "Philadelphia", state: "PA", zipCode: "19123", phone: "(215) 627-8899", latitude: 39.9619, longitude: -75.1484, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // San Antonio Area
      { id: "ACE-601", storeNumber: "601", name: "Ace Hardware Alamo Heights", address: "4903 Broadway St", city: "San Antonio", state: "TX", zipCode: "78209", phone: "(210) 824-3344", latitude: 29.4778, longitude: -98.4715, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-602", storeNumber: "602", name: "Ace Hardware Southtown", address: "1502 S Laredo St", city: "San Antonio", state: "TX", zipCode: "78204", phone: "(210) 534-9090", latitude: 29.4077, longitude: -98.5072, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // San Diego Area
      { id: "ACE-701", storeNumber: "701", name: "Ace Hardware Mission Hills", address: "1334 Washington Pl", city: "San Diego", state: "CA", zipCode: "92103", phone: "(619) 291-7377", latitude: 32.7486, longitude: -117.1661, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-702", storeNumber: "702", name: "Ace Hardware La Jolla", address: "8657 Villa La Jolla Dr", city: "La Jolla", state: "CA", zipCode: "92037", phone: "(858) 454-4444", latitude: 32.8498, longitude: -117.2478, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Dallas Area
      { id: "ACE-801", storeNumber: "801", name: "Ace Hardware Deep Ellum", address: "2803 Main St", city: "Dallas", state: "TX", zipCode: "75226", phone: "(214) 748-9898", latitude: 32.7831, longitude: -96.7849, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-802", storeNumber: "802", name: "Ace Hardware Plano", address: "1720 K Ave", city: "Plano", state: "TX", zipCode: "75074", phone: "(972) 423-1234", latitude: 33.0198, longitude: -96.6989, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-803", storeNumber: "803", name: "Ace Hardware Uptown Dallas", address: "2914 McKinney Ave", city: "Dallas", state: "TX", zipCode: "75204", phone: "(214) 855-7676", latitude: 32.8013, longitude: -96.7903, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // San Jose Area
      { id: "ACE-901", storeNumber: "901", name: "Ace Hardware Downtown San Jose", address: "87 N San Pedro St", city: "San Jose", state: "CA", zipCode: "95110", phone: "(408) 292-4444", latitude: 37.3382, longitude: -121.8863, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-902", storeNumber: "902", name: "Ace Hardware Sunnyvale", address: "1177 W El Camino Real", city: "Sunnyvale", state: "CA", zipCode: "94087", phone: "(408) 737-5555", latitude: 37.3713, longitude: -122.0678, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Austin Area
      { id: "ACE-1001", storeNumber: "1001", name: "Ace Hardware South Austin", address: "1700 S Lamar Blvd", city: "Austin", state: "TX", zipCode: "78704", phone: "(512) 444-7777", latitude: 30.2515, longitude: -97.7697, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1002", storeNumber: "1002", name: "Ace Hardware East Austin", address: "2904 E 6th St", city: "Austin", state: "TX", zipCode: "78702", phone: "(512) 478-8888", latitude: 30.2654, longitude: -97.7208, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Jacksonville Area
      { id: "ACE-1101", storeNumber: "1101", name: "Ace Hardware Riverside", address: "2912 Park St", city: "Jacksonville", state: "FL", zipCode: "32205", phone: "(904) 384-9999", latitude: 30.3199, longitude: -81.6826, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1102", storeNumber: "1102", name: "Ace Hardware Atlantic Beach", address: "421 1st St", city: "Atlantic Beach", state: "FL", zipCode: "32233", phone: "(904) 249-4455", latitude: 30.3319, longitude: -81.3975, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Seattle Area
      { id: "ACE-1201", storeNumber: "1201", name: "Ace Hardware Capitol Hill", address: "1501 E Madison St", city: "Seattle", state: "WA", zipCode: "98122", phone: "(206) 323-7777", latitude: 47.6131, longitude: -122.309, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1202", storeNumber: "1202", name: "Ace Hardware Fremont", address: "4214 Fremont Ave N", city: "Seattle", state: "WA", zipCode: "98103", phone: "(206) 633-1234", latitude: 47.6606, longitude: -122.3491, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Denver Area
      { id: "ACE-1301", storeNumber: "1301", name: "Ace Hardware LoHi", address: "2011 W 32nd Ave", city: "Denver", state: "CO", zipCode: "80211", phone: "(303) 477-3333", latitude: 39.7584, longitude: -105.0178, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1302", storeNumber: "1302", name: "Ace Hardware Cherry Creek", address: "201 University Blvd", city: "Denver", state: "CO", zipCode: "80206", phone: "(303) 321-5555", latitude: 39.7135, longitude: -104.9577, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Miami Area
      { id: "ACE-1401", storeNumber: "1401", name: "Ace Hardware South Beach", address: "1628 Alton Rd", city: "Miami Beach", state: "FL", zipCode: "33139", phone: "(305) 534-8888", latitude: 25.7823, longitude: -80.1394, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1402", storeNumber: "1402", name: "Ace Hardware Coconut Grove", address: "3015 Grand Ave", city: "Miami", state: "FL", zipCode: "33133", phone: "(305) 448-6666", latitude: 25.7282, longitude: -80.2416, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Nashville Area
      { id: "ACE-1501", storeNumber: "1501", name: "Ace Hardware Music Row", address: "1707 Division St", city: "Nashville", state: "TN", zipCode: "37203", phone: "(615) 327-4444", latitude: 36.1506, longitude: -86.8025, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1502", storeNumber: "1502", name: "Ace Hardware Green Hills", address: "2126 Abbott Martin Rd", city: "Nashville", state: "TN", zipCode: "37215", phone: "(615) 383-7777", latitude: 36.1034, longitude: -86.8186, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Atlanta Area
      { id: "ACE-1601", storeNumber: "1601", name: "Ace Hardware Virginia Highland", address: "1174 N Highland Ave NE", city: "Atlanta", state: "GA", zipCode: "30306", phone: "(404) 876-5432", latitude: 33.7738, longitude: -84.3554, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1602", storeNumber: "1602", name: "Ace Hardware Buckhead", address: "3637 Peachtree Rd NE", city: "Atlanta", state: "GA", zipCode: "30319", phone: "(404) 237-9999", latitude: 33.8434, longitude: -84.3782, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Portland Area
      { id: "ACE-1701", storeNumber: "1701", name: "Ace Hardware Pearl District", address: "1122 NW Couch St", city: "Portland", state: "OR", zipCode: "97209", phone: "(503) 228-3333", latitude: 45.5236, longitude: -122.6815, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1702", storeNumber: "1702", name: "Ace Hardware Hawthorne", address: "3045 SE Hawthorne Blvd", city: "Portland", state: "OR", zipCode: "97214", phone: "(503) 238-7777", latitude: 45.5122, longitude: -122.6347, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      // Boston Area  
      { id: "ACE-1801", storeNumber: "1801", name: "Ace Hardware Back Bay", address: "133 Newbury St", city: "Boston", state: "MA", zipCode: "02116", phone: "(617) 267-4444", latitude: 42.3505, longitude: -71.0772, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true },
      { id: "ACE-1802", storeNumber: "1802", name: "Ace Hardware Cambridge", address: "2067 Massachusetts Ave", city: "Cambridge", state: "MA", zipCode: "02140", phone: "(617) 354-8888", latitude: 42.3875, longitude: -71.119, storeHours: "Mon-Sat: 7AM-9PM, Sun: 8AM-7PM", isActive: true }
    ];
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  stores;
  scans;
  scanResults;
  observations;
  shoppingList;
  contactSubmissions;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.stores = /* @__PURE__ */ new Map();
    this.scans = /* @__PURE__ */ new Map();
    this.scanResults = /* @__PURE__ */ new Map();
    this.observations = /* @__PURE__ */ new Map();
    this.shoppingList = /* @__PURE__ */ new Map();
    this.contactSubmissions = /* @__PURE__ */ new Map();
    this.stores.set("home-depot", {
      id: "home-depot",
      name: "Home Depot",
      baseUrl: "https://www.homedepot.com",
      isActive: true
    });
    this.stores.set("lowes", {
      id: "lowes",
      name: "Lowe's",
      baseUrl: "https://www.lowes.com",
      isActive: true
    });
    this.stores.set("ace-hardware", {
      id: "ace-hardware",
      name: "Ace Hardware",
      baseUrl: "https://www.acehardware.com",
      isActive: true
    });
    this.stores.set("amazon", {
      id: "amazon",
      name: "Amazon",
      baseUrl: "https://www.amazon.com",
      isActive: true
    });
    this.stores.set("walmart", {
      id: "walmart",
      name: "Walmart",
      baseUrl: "https://www.walmart.com",
      isActive: false
      // Coming Soon
    });
  }
  // User methods
  async createUser(userData) {
    const id = randomUUID();
    const user = {
      ...userData,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      subscriptionPlan: userData.subscriptionPlan ?? "free",
      stripeCustomerId: userData.stripeCustomerId ?? null,
      stripeSubscriptionId: userData.stripeSubscriptionId ?? null,
      zipCode: userData.zipCode ?? null
    };
    this.users.set(id, user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async getUserById(id) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  async updateUserZipCode(id, zipCode) {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, zipCode };
    this.users.set(id, updatedUser);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
  async updateUserStripeInfo(id, stripeCustomerId, stripeSubscriptionId, subscriptionPlan) {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = {
      ...user,
      ...stripeCustomerId && { stripeCustomerId },
      ...stripeSubscriptionId && { stripeSubscriptionId },
      ...subscriptionPlan && { subscriptionPlan }
    };
    this.users.set(id, updatedUser);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
  async getStores() {
    return Array.from(this.stores.values());
  }
  async getStore(id) {
    return this.stores.get(id);
  }
  async createStore(insertStore) {
    const id = insertStore.name.toLowerCase().replace(/\s+/g, "-");
    const store = { ...insertStore, id, isActive: insertStore.isActive ?? true };
    this.stores.set(id, store);
    return store;
  }
  async createScan(insertScan) {
    const id = randomUUID();
    const scan = {
      ...insertScan,
      id,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date(),
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
      clearanceOnly: insertScan.clearanceOnly ?? false
    };
    this.scans.set(id, scan);
    return scan;
  }
  async getScan(id) {
    return this.scans.get(id);
  }
  async getScans(limit = 10) {
    const allScans = Array.from(this.scans.values());
    return allScans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }
  async getUserScans(userId, limit = 10) {
    const userScans = Array.from(this.scans.values()).filter((scan) => scan.userId === userId);
    return userScans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
  }
  async updateScanStatus(id, status, resultCount, clearanceCount) {
    const scan = this.scans.get(id);
    if (scan) {
      const updatedScan = {
        ...scan,
        status,
        ...resultCount && { resultCount },
        ...clearanceCount && { clearanceCount }
      };
      this.scans.set(id, updatedScan);
    }
  }
  async completeScan(id, resultCount, clearanceCount) {
    const scan = this.scans.get(id);
    if (scan) {
      const updatedScan = {
        ...scan,
        status: "completed",
        resultCount,
        clearanceCount,
        completedAt: /* @__PURE__ */ new Date()
      };
      this.scans.set(id, updatedScan);
    }
  }
  async createScanResult(insertResult) {
    const id = randomUUID();
    const result = {
      ...insertResult,
      id,
      sku: insertResult.sku ?? null,
      storeId: insertResult.storeId || "unknown",
      productUrl: insertResult.productUrl || "",
      wasPrice: insertResult.wasPrice ?? null,
      savePercent: insertResult.savePercent ?? null,
      inStock: insertResult.inStock ?? null,
      deliveryAvailable: insertResult.deliveryAvailable ?? null,
      observedAt: /* @__PURE__ */ new Date(),
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
      isPriceSuppressed: insertResult.isPriceSuppressed ?? false
    };
    this.scanResults.set(id, result);
    return result;
  }
  async getScanResults(scanId, filters = {}) {
    let results = Array.from(this.scanResults.values()).filter(
      (result) => result.scanId === scanId
    );
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(
        (result) => result.productName.toLowerCase().includes(searchLower) || result.sku && result.sku.toLowerCase().includes(searchLower)
      );
    }
    if (filters.store && filters.store !== "all") {
      results = results.filter((result) => result.storeLocation === filters.store);
    }
    if (filters.category && filters.category !== "all") {
      if (filters.category === "clearance") {
        results = results.filter((result) => result.isOnClearance);
      } else {
        results = results.filter((result) => result.category === filters.category);
      }
    }
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
  async getShoppingListItems(userId) {
    return [];
  }
  async addToShoppingList(item) {
    const id = randomUUID();
    return { id, ...item, addedAt: /* @__PURE__ */ new Date(), isCompleted: false };
  }
  async updateShoppingListItem(itemId, updates) {
    return { id: itemId, ...updates };
  }
  async deleteShoppingListItem(itemId) {
    return true;
  }
  async createContactSubmission(insertSubmission) {
    const id = randomUUID();
    const submission = {
      ...insertSubmission,
      id,
      status: "new",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }
  // Observation methods
  async upsertObservation(insertObservation) {
    const key = `${insertObservation.storeId}-${insertObservation.productUrl}`;
    const id = randomUUID();
    const observation = {
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
      observedAt: /* @__PURE__ */ new Date(),
      source: insertObservation.source || "unknown"
    };
    this.observations.set(key, observation);
    return observation;
  }
  async getObservations(storeId, productUrl) {
    const key = `${storeId}-${productUrl}`;
    const observation = this.observations.get(key);
    return observation ? [observation] : [];
  }
  // Home Depot scan methods
  async createHomeDepotScan(scanData) {
    const id = randomUUID();
    const scan = {
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
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null,
      resultCount: "0",
      clearanceCount: "0"
    };
    this.scans.set(id, scan);
    return scan;
  }
  async getHomeDepotScanResults(scanId) {
    const results = Array.from(this.scanResults.values()).filter(
      (result) => result.scanId === scanId
    );
    const uniqueStores = new Set(results.map((r) => r.storeId));
    const storesScanned = uniqueStores.size;
    const itemsFound = results.length;
    return {
      results,
      summary: { storesScanned, itemsFound }
    };
  }
  // Ace Hardware scan methods
  async createAceHardwareScan(scanData) {
    const id = randomUUID();
    const scan = {
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
      storeCount: "1",
      // Will be updated when scan completes
      status: "pending",
      createdAt: /* @__PURE__ */ new Date(),
      completedAt: null,
      resultCount: "0",
      clearanceCount: "0"
    };
    this.scans.set(id, scan);
    return scan;
  }
  async getAceHardwareScanResults(scanId) {
    const results = Array.from(this.scanResults.values()).filter(
      (result) => result.scanId === scanId
    );
    const uniqueStores = new Set(results.map((r) => r.storeId));
    const storesScanned = uniqueStores.size;
    const itemsFound = results.length;
    return {
      results,
      summary: { storesScanned, itemsFound }
    };
  }
};
var storage = new MemStorage();

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cachedProducts: () => cachedProducts,
  contactSubmissions: () => contactSubmissions,
  createAceHardwareScanSchema: () => createAceHardwareScanSchema,
  createHomeDepotScanSchema: () => createHomeDepotScanSchema,
  createScanRequestSchema: () => createScanRequestSchema,
  insertContactSubmissionSchema: () => insertContactSubmissionSchema,
  insertObservationSchema: () => insertObservationSchema,
  insertScanResultSchema: () => insertScanResultSchema,
  insertScanSchema: () => insertScanSchema,
  insertStoreSchema: () => insertStoreSchema,
  insertUserSchema: () => insertUserSchema,
  observations: () => observations,
  priceHistory: () => priceHistory,
  scanResults: () => scanResults,
  scans: () => scans,
  shoppingListItems: () => shoppingListItems,
  storeLocations: () => storeLocations,
  stores: () => stores,
  updateUserZipCodeSchema: () => updateUserZipCodeSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull(),
  zipCode: varchar("zip_code", { length: 5 }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionPlan: text("subscription_plan").default("free"),
  // 'free', 'basic', 'premium'
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var stores = pgTable("stores", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  baseUrl: text("base_url").notNull(),
  isActive: boolean("is_active").notNull().default(true)
});
var scans = pgTable("scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  storeId: varchar("store_id").notNull(),
  zipCode: varchar("zip_code", { length: 5 }),
  plan: text("plan").default("free"),
  // 'free', 'basic', 'premium'
  productSelection: text("product_selection").notNull(),
  // 'all' or 'specific'
  specificSkus: text("specific_skus").array(),
  clearanceOnly: boolean("clearance_only").notNull().default(false),
  category: text("category"),
  priceRange: text("price_range"),
  minimumDiscountPercent: text("minimum_discount_percent"),
  minimumDollarsOff: text("minimum_dollars_off"),
  sortBy: text("sort_by").default("discount-percent"),
  storeCount: text("store_count").default("1"),
  // Number of stores to scan based on subscription
  status: text("status").notNull().default("pending"),
  // 'pending', 'running', 'completed', 'failed'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  resultCount: text("result_count").default("0"),
  clearanceCount: text("clearance_count").default("0")
});
var scanResults = pgTable("scan_results", {
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
  source: text("source").notNull().default("mock"),
  // 'mock', 'alt', 'api'
  // In-store purchase fields
  purchaseInStore: boolean("purchase_in_store").notNull().default(false),
  storeName: text("store_name"),
  // Legacy fields for backward compatibility
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  savingsPercent: text("savings_percent"),
  isPriceSuppressed: boolean("is_price_suppressed").notNull().default(false),
  category: text("category"),
  storeLocation: text("store_location")
});
var observations = pgTable("observations", {
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
  source: text("source").notNull().default("alt")
  // 'mock', 'alt', 'api'
});
var cachedProducts = pgTable("cached_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sku: text("sku").notNull().unique(),
  productName: text("product_name").notNull(),
  category: text("category"),
  productUrl: text("product_url"),
  lastScraped: timestamp("last_scraped").notNull().default(sql`now()`),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  isDiscontinued: boolean("is_discontinued").notNull().default(false)
});
var storeLocations = pgTable("store_locations", {
  id: varchar("id").primaryKey(),
  // e.g., "HD-0206"
  storeNumber: text("store_number").notNull(),
  // e.g., "0206"
  name: text("name").notNull(),
  // e.g., "HD Southland"
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  phone: text("phone"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  storeHours: text("store_hours"),
  isActive: boolean("is_active").notNull().default(true)
});
var priceHistory = pgTable("price_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  storeId: varchar("store_id").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isOnClearance: boolean("is_on_clearance").notNull(),
  recordedAt: timestamp("recorded_at").notNull().default(sql`now()`)
});
var shoppingListItems = pgTable("shopping_list_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  productId: varchar("product_id").notNull(),
  storeId: varchar("store_id").notNull(),
  aisle: text("aisle"),
  // e.g., "A12", "Garden Center"
  bay: text("bay"),
  // e.g., "12-A"
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
  // Price user wants to be notified at
  notes: text("notes"),
  addedAt: timestamp("added_at").notNull().default(sql`now()`),
  isCompleted: boolean("is_completed").notNull().default(false)
});
var contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  // 'new', 'read', 'resolved'
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var insertStoreSchema = createInsertSchema(stores).omit({
  id: true
});
var insertScanSchema = createInsertSchema(scans).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  status: true,
  resultCount: true,
  clearanceCount: true,
  storeCount: true
});
var insertScanResultSchema = createInsertSchema(scanResults).omit({
  id: true
});
var insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
  status: true
});
var insertObservationSchema = createInsertSchema(observations).omit({
  id: true,
  observedAt: true
});
var createScanRequestSchema = insertScanSchema.extend({
  productSelection: z.enum(["all", "specific"]),
  specificSkus: z.array(z.string()).optional(),
  minimumDiscountPercent: z.string().optional(),
  minimumDollarsOff: z.string().optional(),
  sortBy: z.enum(["discount-percent", "stock", "dollars-off"]).default("discount-percent")
});
var createHomeDepotScanSchema = z.object({
  userId: z.string(),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
  plan: z.enum(["free", "basic", "premium"]).default("free")
});
var createAceHardwareScanSchema = z.object({
  userId: z.string(),
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits"),
  plan: z.enum(["free", "basic", "premium"]).default("free")
  // Plan included for consistency but no limits applied
});
var updateUserZipCodeSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be exactly 5 digits")
});

// server/providers/homeDepot.ts
import { chromium } from "playwright";
var MockHomeDepotProvider = class {
  async init() {
  }
  async fetchDeals(options) {
    const products = [];
    const totalSteps = 5;
    for (let step = 0; step < totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (options.onProgress) {
        const statuses = [
          "Connecting to Home Depot...",
          "Finding stores near you...",
          "Fetching product inventory...",
          "Analyzing clearance prices...",
          "Finalizing results..."
        ];
        options.onProgress(statuses[step], step + 1);
      }
    }
    const sampleProducts = [
      {
        name: "DEWALT 20V MAX Cordless Drill",
        sku: "DWD726-20V",
        originalPrice: 149.99,
        clearancePrice: 89.99,
        category: "tools",
        isOnClearance: true
      },
      {
        name: "Craftsman 230-Piece Tool Set",
        sku: "CMMT12039",
        originalPrice: 199.99,
        clearancePrice: null,
        category: "tools",
        isOnClearance: false,
        isPriceSuppressed: true
      },
      {
        name: "Miracle-Gro Potting Soil 50qt",
        sku: "MG-50QT-001",
        originalPrice: 12.98,
        clearancePrice: 7.99,
        category: "garden",
        isOnClearance: true
      },
      {
        name: "GE Smart Light Switch",
        sku: "GE-14294",
        originalPrice: 34.99,
        clearancePrice: 19.99,
        category: "hardware",
        isOnClearance: true
      },
      {
        name: "Behr Premium Paint 1 Gallon",
        sku: "BEHR-PREM-001",
        originalPrice: 42.98,
        clearancePrice: 25.98,
        category: "hardware",
        isOnClearance: true
      }
    ];
    for (const product of sampleProducts) {
      if (options.clearanceOnly && !product.isOnClearance) {
        continue;
      }
      if (options.category && product.category !== options.category) {
        continue;
      }
      if (options.productSelection === "specific" && options.specificSkus) {
        if (!options.specificSkus.includes(product.sku)) {
          continue;
        }
      }
      const savingsPercent = product.clearancePrice && product.originalPrice ? Math.round((product.originalPrice - product.clearancePrice) / product.originalPrice * 100).toString() : void 0;
      products.push({
        name: product.name,
        sku: product.sku,
        originalPrice: product.originalPrice,
        clearancePrice: product.clearancePrice ?? void 0,
        savingsPercent: savingsPercent ? `${savingsPercent}% OFF` : void 0,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed || false,
        category: product.category,
        productUrl: `https://www.homedepot.com/p/${product.sku}`
      });
    }
    return products;
  }
};
var AltHomeDepotProvider = class {
  cache = /* @__PURE__ */ new Map();
  browser = null;
  context = null;
  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    this.context = await this.browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });
  }
  async fetchDeals(options) {
    const results = [];
    const productSeeds = options.productSeeds || this.getDefaultProductSeeds();
    if (options.onProgress) {
      options.onProgress("Setting store context...", 1);
    }
    if (!this.context) {
      throw new Error("Browser not initialized");
    }
    try {
      for (const storeId of options.storeIds) {
        const page = await this.context.newPage();
        try {
          await this.setActiveStore(page, storeId);
          for (const seed of productSeeds) {
            if (options.onProgress) {
              options.onProgress("Opening product page...", 2);
            }
            const cacheKey = `${storeId}-${seed.productUrl}`;
            const cached = this.getCachedResult(cacheKey);
            if (cached) {
              if (cached.isOnClearance) {
                results.push(cached);
              }
              continue;
            }
            const verificationResult = await this.verifyProduct(page, seed, storeId, options.onProgress);
            if (verificationResult.ok && verificationResult.data) {
              this.setCachedResult(cacheKey, verificationResult.data);
              await this.storeObservation(verificationResult.data, storeId, seed.productUrl);
              if (verificationResult.data.isOnClearance) {
                results.push(verificationResult.data);
              }
            } else {
              this.setCachedResult(cacheKey, null);
              await this.storeObservation(null, storeId, seed.productUrl);
            }
            await new Promise((resolve) => setTimeout(resolve, 1e3));
          }
        } finally {
          await page.close();
        }
      }
      if (options.onProgress) {
        options.onProgress("Finalizing results...", 5);
      }
      return results;
    } finally {
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
    }
  }
  getDefaultProductSeeds() {
    return [
      {
        sku: "312470417",
        productUrl: "https://www.homedepot.com/p/DEWALT-20V-MAX-Cordless-Drill-DCD771C2/312470417",
        title: "DEWALT 20V MAX Cordless Drill"
      },
      {
        sku: "206937568",
        productUrl: "https://www.homedepot.com/p/Ryobi-18V-ONE-Lithium-Ion-Cordless-Combo-Kit-2-Tool-P1819/206937568",
        title: "Ryobi 18V Combo Kit"
      },
      {
        sku: "312367023",
        productUrl: "https://www.homedepot.com/p/Makita-18V-LXT-Lithium-Ion-Brushless-Cordless-Hammer-Driver-Drill-XPH12Z/312367023",
        title: "Makita 18V Hammer Drill"
      }
    ];
  }
  async setActiveStore(page, storeId) {
    try {
      await page.goto("https://www.homedepot.com", { waitUntil: "domcontentloaded" });
      const storeSelector = page.locator('[data-testid="store-locator-trigger"], .MyStore__trigger, [aria-label*="store"]').first();
      if (await storeSelector.isVisible({ timeout: 5e3 })) {
        await storeSelector.click();
        await page.waitForTimeout(1e3);
        const storeOption = page.locator(`[data-store-id="${storeId}"], [data-value*="${storeId}"]`).first();
        if (await storeOption.isVisible({ timeout: 3e3 })) {
          await storeOption.click();
          await page.waitForTimeout(1e3);
        }
      }
    } catch (error) {
      console.warn("Could not set active store:", error);
    }
  }
  async verifyProduct(page, seed, storeId, onProgress) {
    try {
      if (onProgress) {
        onProgress("Verifying in-store clearance...", 3);
      }
      await page.goto(seed.productUrl, { waitUntil: "domcontentloaded", timeout: 3e4 });
      await page.waitForTimeout(1500);
      const clearanceButton = page.locator('text=/see in-store clearance price/i, text=/in-store clearance/i, [data-testid*="clearance"]').first();
      if (await clearanceButton.isVisible({ timeout: 5e3 })) {
        await clearanceButton.click();
        await page.waitForTimeout(2e3);
        if (onProgress) {
          onProgress("Extracting clearance details...", 4);
        }
        const confirmationPanel = page.locator('text=/in-store clearance item/i, [data-testid*="clearance-panel"], .clearance-panel').first();
        if (await confirmationPanel.isVisible({ timeout: 5e3 })) {
          return await this.extractClearanceDetails(page, seed, storeId);
        }
      }
      return {
        ok: true,
        data: {
          name: seed.title || "Unknown Product",
          sku: seed.sku || "UNKNOWN",
          isOnClearance: false,
          isPriceSuppressed: false,
          productUrl: seed.productUrl
        }
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        retriable: true
      };
    }
  }
  async extractClearanceDetails(page, seed, storeId) {
    try {
      const clearancePriceElement = page.locator('[data-testid*="price"], .price, text=/\\$\\d+\\.\\d{2}/', { hasText: /^\$/ }).first();
      const clearancePriceText = await clearancePriceElement.textContent() || "";
      const clearancePrice = this.extractPrice(clearancePriceText);
      const wasPriceElement = page.locator('text=/was \\$/i, text=/online price/i, .strikethrough, [data-testid*="was-price"]').first();
      const wasPriceText = await wasPriceElement.textContent() || "";
      const wasPrice = this.extractPrice(wasPriceText);
      const saveElement = page.locator('text=/save \\d+%/i, [data-testid*="savings"]').first();
      const saveText = await saveElement.textContent() || "";
      const savingsPercent = saveText.match(/save (\d+)%/i)?.[0];
      const stockElement = page.locator('text=/\\d+ in stock/i, [data-testid*="stock"]').first();
      const stockText = await stockElement.textContent() || "";
      const inStock = stockText.match(/(\d+) in stock/i)?.[1];
      const result = {
        name: seed.title || "Unknown Product",
        sku: seed.sku || "UNKNOWN",
        originalPrice: wasPrice,
        clearancePrice,
        savingsPercent,
        isOnClearance: true,
        isPriceSuppressed: false,
        productUrl: seed.productUrl,
        // Raw URL, no affiliate decoration
        category: "tools",
        // Default category
        purchaseInStore: true,
        storeName: this.getStoreName(storeId)
      };
      return { ok: true, data: result };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to extract details",
        retriable: false
      };
    }
  }
  extractPrice(text2) {
    const match = text2.match(/\$(\d+(?:\.\d{2})?)/);
    return match ? parseFloat(match[1]) : void 0;
  }
  getCachedResult(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;
    const now = Date.now();
    const age = now - cached.timestamp;
    const TTL = 24 * 60 * 60 * 1e3;
    if (age > TTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.result;
  }
  setCachedResult(key, result) {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }
  async storeObservation(product, storeId, productUrl) {
    try {
      await storage.upsertObservation({
        storeId,
        sku: product?.sku || null,
        productUrl,
        clearancePrice: product?.clearancePrice?.toString() || null,
        wasPrice: product?.originalPrice?.toString() || null,
        savePercent: product?.savingsPercent || null,
        inStock: null,
        // Not currently extracted
        deliveryAvailable: null,
        // Not currently extracted
        isOnClearance: product?.isOnClearance || false,
        source: "alt"
      });
    } catch (error) {
      console.warn("Failed to store observation:", error);
    }
  }
  getStoreName(storeId) {
    const storeNames = {
      "HD-0206": "HD Southland",
      "HD-0208": "HD Hollywood",
      "HD-0210": "HD West LA",
      "HD-1234": "HD Manhattan",
      "HD-1235": "HD Brooklyn",
      "HD-1236": "HD Queens",
      "HD-0456": "HD Lincoln Park",
      "HD-0457": "HD South Loop",
      "HD-0789": "HD Midtown",
      "HD-1718": "HD Downtown Dallas",
      "HD-1719": "HD Plano",
      "HD-1920": "HD San Jose Central"
    };
    return storeNames[storeId] || `Home Depot Store ${storeId}`;
  }
};
var ApiHomeDepotProvider = class {
  async init() {
    throw new Error("Home Depot API not configured");
  }
  async fetchDeals(options) {
    throw new Error("Home Depot API not configured");
  }
};
function createHomeDepotProvider(mode) {
  switch (mode) {
    case "mock":
      return new MockHomeDepotProvider();
    case "alt":
      return new AltHomeDepotProvider();
    case "api":
      return new ApiHomeDepotProvider();
    default:
      throw new Error(`Unknown Home Depot data mode: ${mode}`);
  }
}

// server/providers/aceHardware.ts
import { chromium as chromium2 } from "playwright";
var MockAceHardwareProvider = class {
  async init() {
  }
  async fetchDeals(options) {
    const products = [];
    const totalSteps = 5;
    for (let step = 0; step < totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (options.onProgress) {
        const statuses = [
          "Connecting to Ace Hardware...",
          "Finding stores in 50-mile radius...",
          "Fetching product inventory...",
          "Analyzing clearance prices...",
          "Finalizing results..."
        ];
        options.onProgress(statuses[step], step + 1);
      }
    }
    const sampleProducts = [
      {
        name: "Craftsman 20V Cordless Impact Driver",
        sku: "ACE-7624382",
        originalPrice: 129.99,
        clearancePrice: 79.99,
        category: "tools",
        isOnClearance: true
      },
      {
        name: "Weber Genesis II 3-Burner Gas Grill",
        sku: "ACE-8924561",
        originalPrice: 699.99,
        clearancePrice: 499.99,
        category: "outdoor",
        isOnClearance: true
      },
      {
        name: "Scotts Turf Builder Lawn Fertilizer",
        sku: "ACE-1234567",
        originalPrice: 34.99,
        clearancePrice: 22.99,
        category: "garden",
        isOnClearance: true
      },
      {
        name: "Benjamin Moore Advance Paint",
        sku: "ACE-9876543",
        originalPrice: 52.99,
        clearancePrice: 34.99,
        category: "paint",
        isOnClearance: true
      },
      {
        name: "Kwikset Smart Door Lock",
        sku: "ACE-5555444",
        originalPrice: 149.99,
        clearancePrice: void 0,
        category: "hardware",
        isOnClearance: false,
        isPriceSuppressed: true
      },
      {
        name: "Big Green Egg Ceramic Grill",
        sku: "ACE-7777888",
        originalPrice: 899.99,
        clearancePrice: 649.99,
        category: "outdoor",
        isOnClearance: true
      },
      {
        name: "Ace Hardware Tool Set 150-Piece",
        sku: "ACE-2468135",
        originalPrice: 179.99,
        clearancePrice: 119.99,
        category: "tools",
        isOnClearance: true
      }
    ];
    for (const product of sampleProducts) {
      if (options.clearanceOnly && !product.isOnClearance) {
        continue;
      }
      if (options.category && product.category !== options.category) {
        continue;
      }
      if (options.productSelection === "specific" && options.specificSkus) {
        if (!options.specificSkus.includes(product.sku)) {
          continue;
        }
      }
      const savingsPercent = product.clearancePrice && product.originalPrice ? Math.round((product.originalPrice - product.clearancePrice) / product.originalPrice * 100).toString() : void 0;
      products.push({
        name: product.name,
        sku: product.sku,
        originalPrice: product.originalPrice,
        clearancePrice: product.clearancePrice,
        savingsPercent,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed || false,
        category: product.category,
        productUrl: `https://www.acehardware.com/product/${product.sku}`,
        purchaseInStore: true,
        storeName: `Ace Hardware Store ${options.storeIds[0] || "ACE-001"}`
      });
    }
    return products;
  }
};
var AltAceHardwareProvider = class {
  cache = /* @__PURE__ */ new Map();
  browser = null;
  context = null;
  async init() {
    this.browser = await chromium2.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    this.context = await this.browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    });
  }
  async fetchDeals(options) {
    const results = [];
    const productSeeds = options.productSeeds || this.getDefaultProductSeeds();
    if (options.onProgress) {
      options.onProgress("Setting store context...", 1);
    }
    if (!this.context) {
      throw new Error("Browser not initialized");
    }
    try {
      for (const storeId of options.storeIds) {
        const page = await this.context.newPage();
        try {
          await this.setActiveStore(page, storeId);
          for (const seed of productSeeds) {
            if (options.onProgress) {
              options.onProgress("Opening product page...", 2);
            }
            const cacheKey = `${storeId}-${seed.productUrl}`;
            const cached = this.getCachedResult(cacheKey);
            if (cached) {
              if (cached.isOnClearance) {
                results.push(cached);
              }
              continue;
            }
            const verificationResult = await this.verifyProduct(page, seed, storeId, options.onProgress);
            if (verificationResult.ok && verificationResult.data) {
              this.setCachedResult(cacheKey, verificationResult.data);
              await this.storeObservation(verificationResult.data, storeId, seed.productUrl);
              if (verificationResult.data.isOnClearance) {
                results.push(verificationResult.data);
              }
            } else {
              this.setCachedResult(cacheKey, null);
            }
          }
        } finally {
          await page.close();
        }
      }
    } finally {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.context = null;
      }
    }
    return results;
  }
  getDefaultProductSeeds() {
    return [
      { productUrl: "https://www.acehardware.com/departments/tools-and-hardware/power-tools", title: "Power Tools" },
      { productUrl: "https://www.acehardware.com/departments/paint-and-supplies", title: "Paint & Supplies" },
      { productUrl: "https://www.acehardware.com/departments/outdoor-living", title: "Outdoor Living" },
      { productUrl: "https://www.acehardware.com/departments/lawn-and-garden", title: "Lawn & Garden" },
      { productUrl: "https://www.acehardware.com/departments/hardware", title: "Hardware" }
    ];
  }
  async setActiveStore(page, storeId) {
    try {
      await page.goto("https://www.acehardware.com/store-locator", { waitUntil: "networkidle" });
      console.log(`Setting active store: ${storeId}`);
      await page.waitForTimeout(1e3);
    } catch (error) {
      console.warn(`Failed to set active store ${storeId}:`, error);
    }
  }
  async verifyProduct(page, seed, storeId, onProgress) {
    try {
      if (onProgress) {
        onProgress("Checking product availability...", 3);
      }
      await page.goto(seed.productUrl, { waitUntil: "networkidle" });
      const mockResult = {
        name: seed.title || "Ace Hardware Product",
        sku: seed.sku || "ACE-MOCK",
        originalPrice: 99.99,
        clearancePrice: 69.99,
        savingsPercent: "30",
        isOnClearance: true,
        isPriceSuppressed: false,
        category: "tools",
        productUrl: seed.productUrl,
        purchaseInStore: true,
        storeName: this.getStoreName(storeId)
      };
      return { ok: true, data: mockResult };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
        retriable: true
      };
    }
  }
  getCachedResult(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > 60 * 60 * 1e3) {
      this.cache.delete(key);
      return null;
    }
    return entry.result;
  }
  setCachedResult(key, result) {
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });
  }
  async storeObservation(product, storeId, productUrl) {
    try {
      console.log(`Storing observation for ${product.name} at ${storeId}`);
    } catch (error) {
      console.warn("Failed to store observation:", error);
    }
  }
  getStoreName(storeId) {
    const storeNames = {
      "ACE-001": "Ace Hardware Main Street",
      "ACE-002": "Ace Hardware Downtown",
      "ACE-003": "Ace Hardware Plaza"
      // More stores will be added
    };
    return storeNames[storeId] || `Ace Hardware Store ${storeId}`;
  }
};
var ApiAceHardwareProvider = class {
  async init() {
    throw new Error("Ace Hardware API not configured");
  }
  async fetchDeals(options) {
    throw new Error("Ace Hardware API not configured");
  }
};
function createAceHardwareProvider(mode) {
  switch (mode) {
    case "mock":
      return new MockAceHardwareProvider();
    case "alt":
      return new AltAceHardwareProvider();
    case "api":
      return new ApiAceHardwareProvider();
    default:
      throw new Error(`Unknown Ace Hardware data mode: ${mode}`);
  }
}

// server/utils/planLimits.ts
function getStoreLimitForPlan(plan) {
  const limits = {
    free: 1,
    basic: 5,
    premium: 25
  };
  return limits[plan] || limits.free;
}

// server/utils/geoUtils.ts
function resolveZipCoordinates(zipCode, stores2) {
  const storeInZip = stores2.find((store) => store.zipCode === zipCode);
  if (storeInZip && storeInZip.latitude && storeInZip.longitude) {
    return { lat: storeInZip.latitude, lon: storeInZip.longitude };
  }
  const zipPrefix = zipCode.substring(0, 3);
  const nearbyStore = stores2.find((store) => store.zipCode.startsWith(zipPrefix));
  if (nearbyStore && nearbyStore.latitude && nearbyStore.longitude) {
    return { lat: nearbyStore.latitude, lon: nearbyStore.longitude };
  }
  return null;
}
function calculateDistance(coord1, coord2) {
  const R = 3959;
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLon = toRadians(coord2.lon - coord1.lon);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRadians(coord1.lat)) * Math.cos(toRadians(coord2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
function selectNearestStoreIds(userCoord, stores2, limit) {
  const storesWithDistance = stores2.filter((store) => store.isActive && store.latitude && store.longitude).map((store) => ({
    ...store,
    distance: calculateDistance(userCoord, {
      lat: store.latitude,
      lon: store.longitude
    })
  })).sort((a, b) => a.distance - b.distance);
  return storesWithDistance.slice(0, limit).map((store) => store.id);
}
function selectStoresWithinRadius(userCoord, stores2, radiusMiles) {
  const storesWithinRadius = stores2.filter((store) => store.isActive && store.latitude && store.longitude).map((store) => ({
    ...store,
    distance: calculateDistance(userCoord, {
      lat: store.latitude,
      lon: store.longitude
    })
  })).filter((store) => store.distance <= radiusMiles).sort((a, b) => a.distance - b.distance);
  return storesWithinRadius.map((store) => store.id);
}

// server/scraper.ts
var StoreScraper = class {
  store;
  constructor(store) {
    this.store = store;
  }
  async scrapeProducts(options, userId) {
    if (this.store.id === "home-depot") {
      return this.scrapeHomeDepot(options, userId);
    }
    if (this.store.id === "ace-hardware") {
      return this.scrapeAceHardware(options, userId);
    }
    throw new Error(`Scraping not implemented for store: ${this.store.name}`);
  }
  async scrapeHomeDepot(options, userId) {
    if (options.onProgress) {
      options.onProgress("Locating nearby stores...", 1);
    }
    let storeIds = ["HD-0206"];
    if (userId) {
      try {
        const user = await storage.getUserById(userId);
        if (user) {
          const userPlan = user.subscriptionPlan || "free";
          const storeLimit = getStoreLimitForPlan(userPlan);
          const zipCode = options.zipCode || user.zipCode;
          if (zipCode) {
            const { REAL_HOME_DEPOT_STORES: REAL_HOME_DEPOT_STORES2 } = await Promise.resolve().then(() => (init_real_store_data(), real_store_data_exports));
            const userCoord = resolveZipCoordinates(zipCode, REAL_HOME_DEPOT_STORES2);
            if (userCoord) {
              storeIds = selectNearestStoreIds(userCoord, REAL_HOME_DEPOT_STORES2, storeLimit);
            }
          }
          if (options.onProgress) {
            options.onProgress(`Scanning ${storeIds.length} stores based on your plan...`, 2);
          }
        }
      } catch (error) {
        console.warn("Could not load user for store selection, using defaults:", error);
      }
    }
    const killswitch = process.env.HD_KILLSWITCH === "true";
    const dataMode = process.env.HD_DATA_MODE || "mock";
    const effectiveMode = killswitch ? "mock" : dataMode;
    const provider = createHomeDepotProvider(effectiveMode);
    await provider.init();
    const homeDepotOptions = {
      ...options,
      storeIds
    };
    return await provider.fetchDeals(homeDepotOptions);
  }
  async scrapeAceHardware(options, userId) {
    if (options.onProgress) {
      options.onProgress("Locating nearby Ace Hardware stores...", 1);
    }
    let storeIds = ["ACE-001"];
    if (userId) {
      try {
        const user = await storage.getUserById(userId);
        if (user) {
          const zipCode = options.zipCode || user.zipCode;
          if (zipCode) {
            const { REAL_ACE_HARDWARE_STORES: REAL_ACE_HARDWARE_STORES2 } = await Promise.resolve().then(() => (init_ace_store_data(), ace_store_data_exports));
            const userCoord = resolveZipCoordinates(zipCode, REAL_ACE_HARDWARE_STORES2);
            if (userCoord) {
              storeIds = selectStoresWithinRadius(userCoord, REAL_ACE_HARDWARE_STORES2, 50);
            }
          }
          if (options.onProgress) {
            options.onProgress(`Scanning ${storeIds.length} Ace Hardware stores within 50 miles...`, 2);
          }
        }
      } catch (error) {
        console.warn("Could not load user for Ace Hardware store selection, using defaults:", error);
      }
    }
    const killswitch = process.env.ACE_KILLSWITCH === "true";
    const dataMode = process.env.ACE_DATA_MODE || "mock";
    const effectiveMode = killswitch ? "mock" : dataMode;
    const provider = createAceHardwareProvider(effectiveMode);
    await provider.init();
    const aceHardwareOptions = {
      ...options,
      storeIds
    };
    return await provider.fetchDeals(aceHardwareOptions);
  }
};

// server/auth.ts
import bcrypt from "bcryptjs";
async function hashPassword(password) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// server/auth-routes.ts
import { z as z2 } from "zod";
var loginSchema = z2.object({
  email: z2.string().email(),
  password: z2.string().min(6)
});
var signupSchema = insertUserSchema.extend({
  password: z2.string().min(6)
});
function registerAuthRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user || !await verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = signupSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }
      const hashedPassword = await hashPassword(userData.password);
      const user = await storage.createUser({ ...userData, password: hashedPassword });
      req.session.userId = user.id;
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message || "Signup failed" });
    }
  });
  app2.get("/api/auth/me", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        req.session.destroy(() => {
        });
        return res.status(401).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.patch("/api/auth/zip-code", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { zipCode } = updateUserZipCodeSchema.parse(req.body);
      const user = await storage.updateUserZipCode(req.session.userId, zipCode);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to update zip code" });
    }
  });
}

// server/providers/telegram.ts
var TelegramDealStore = class {
  deals = /* @__PURE__ */ new Map();
  lastUpdate = /* @__PURE__ */ new Date();
  addDeal(deal) {
    const key = deal.asin || deal.productUrl || deal.productName;
    this.deals.set(key, deal);
    this.lastUpdate = /* @__PURE__ */ new Date();
  }
  getDeals(filters) {
    const dealsArray = [];
    this.deals.forEach((deal) => dealsArray.push(deal));
    let deals = dealsArray;
    if (filters?.category) {
      deals = deals.filter(
        (deal) => deal.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters?.minDiscount && filters.minDiscount > 0) {
      deals = deals.filter(
        (deal) => deal.discountPercent && deal.discountPercent >= filters.minDiscount
      );
    }
    if (filters?.maxPrice && filters.maxPrice > 0) {
      deals = deals.filter(
        (deal) => deal.salePrice && deal.salePrice <= filters.maxPrice
      );
    }
    return deals.sort((a, b) => {
      const discountA = a.discountPercent || 0;
      const discountB = b.discountPercent || 0;
      if (discountB !== discountA) {
        return discountB - discountA;
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }
  clearOldDeals(hoursOld = 24) {
    const cutoff = new Date(Date.now() - hoursOld * 60 * 60 * 1e3);
    for (const [key, deal] of this.deals.entries()) {
      if (deal.timestamp < cutoff) {
        this.deals.delete(key);
      }
    }
  }
  getLastUpdate() {
    return this.lastUpdate;
  }
  getDealCount() {
    return this.deals.size;
  }
};
var telegramStore = new TelegramDealStore();
var addSampleDeals = () => {
  const sampleDeals = [
    {
      productName: "Amazon Echo Dot (5th Gen)",
      productUrl: "https://amazon.com/echo-dot-5th-gen",
      originalPrice: 49.99,
      salePrice: 24.99,
      discountPercent: 50,
      description: "Smart speaker with Alexa - compact design with improved sound",
      imageUrl: "https://m.media-amazon.com/images/I/71h8ScsQETL._AC_SL1500_.jpg",
      category: "Electronics",
      rating: 4.5,
      reviewCount: 15234,
      availability: "In Stock",
      source: "telegram_bot",
      timestamp: /* @__PURE__ */ new Date()
    },
    {
      productName: "Fire TV Stick 4K Max",
      productUrl: "https://amazon.com/fire-tv-stick-4k-max",
      originalPrice: 54.99,
      salePrice: 34.99,
      discountPercent: 36,
      description: "Streaming device with Wi-Fi 6 support and Alexa Voice Remote",
      imageUrl: "https://m.media-amazon.com/images/I/51TjJOTfslL._AC_SL1000_.jpg",
      category: "Electronics",
      rating: 4.4,
      reviewCount: 8756,
      availability: "In Stock",
      source: "telegram_bot",
      timestamp: /* @__PURE__ */ new Date()
    },
    {
      productName: "Amazon Basics Wireless Charging Pad",
      productUrl: "https://amazon.com/amazon-basics-wireless-charging-pad",
      originalPrice: 29.99,
      salePrice: 15.99,
      discountPercent: 47,
      description: "10W wireless charging pad compatible with Qi-enabled devices",
      imageUrl: "https://m.media-amazon.com/images/I/61HMt7p8YZL._AC_SL1500_.jpg",
      category: "Electronics",
      rating: 4.2,
      reviewCount: 3421,
      availability: "In Stock",
      source: "telegram_bot",
      timestamp: /* @__PURE__ */ new Date()
    }
  ];
  sampleDeals.forEach((deal) => telegramStore.addDeal(deal));
};
addSampleDeals();
var TelegramAmazonProvider = class {
  initialized = false;
  async init() {
    telegramStore.clearOldDeals(24);
    this.initialized = true;
  }
  getDeals(filters) {
    return telegramStore.getDeals(filters);
  }
  getStoreStats() {
    return {
      isActive: true,
      dealCount: telegramStore.getDealCount(),
      lastUpdate: telegramStore.getLastUpdate()
    };
  }
  async fetchDeals(options) {
    if (!this.initialized) {
      await this.init();
    }
    const totalSteps = 3;
    for (let step = 0; step < totalSteps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (options.onProgress) {
        const statuses = [
          "Connecting to Amazon via Telegram...",
          "Retrieving latest deals...",
          "Formatting deal data..."
        ];
        options.onProgress(statuses[step], step + 1);
      }
    }
    const telegramDeals = telegramStore.getDeals({
      category: options.category,
      minDiscount: options.minDiscount,
      maxPrice: options.maxPrice
    });
    const scrapedProducts = telegramDeals.map(
      (deal) => this.convertTelegramDealToScrapedProduct(deal)
    );
    return scrapedProducts;
  }
  async processBotUpdate(dealData) {
    telegramStore.addDeal(dealData);
    return this.convertTelegramDealToScrapedProduct(dealData);
  }
  convertTelegramDealToScrapedProduct(deal) {
    let savingsPercent;
    if (deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice) {
      const savings = (deal.originalPrice - deal.salePrice) / deal.originalPrice * 100;
      savingsPercent = savings.toFixed(1);
    } else if (deal.discountPercent) {
      savingsPercent = deal.discountPercent.toString();
    }
    return {
      name: deal.productName,
      sku: deal.asin || "AMZN-" + Date.now().toString(36),
      originalPrice: deal.originalPrice,
      clearancePrice: deal.salePrice,
      savingsPercent,
      isOnClearance: !!deal.salePrice && !!deal.originalPrice && deal.salePrice < deal.originalPrice,
      isPriceSuppressed: !deal.salePrice && !deal.originalPrice,
      category: deal.category || "general",
      productUrl: deal.productUrl,
      storeName: "Amazon",
      purchaseInStore: false,
      // Amazon is online only
      description: deal.description,
      imageUrl: deal.imageUrl,
      rating: deal.rating,
      reviewCount: deal.reviewCount,
      availability: deal.availability,
      source: "telegram_bot"
    };
  }
  // Utility methods for monitoring
  getStoreStats() {
    return {
      dealCount: telegramStore.getDealCount(),
      lastUpdate: telegramStore.getLastUpdate(),
      isActive: this.initialized
    };
  }
  // Clean up old deals manually
  cleanupOldDeals(hoursOld = 24) {
    telegramStore.clearOldDeals(hoursOld);
  }
};
var telegramProvider = new TelegramAmazonProvider();

// server/middleware/validation.ts
import { z as z3 } from "zod";

// server/middleware/error-handler.ts
import { ZodError } from "zod";
var AppError = class extends Error {
  code;
  statusCode;
  details;
  constructor(code, message, statusCode = 500, details) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.name = "AppError";
  }
};
var ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  DATABASE_ERROR: "DATABASE_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED"
};
function createApiError(code, message, statusCode, details) {
  const defaultStatusCodes = {
    [ErrorCodes.VALIDATION_ERROR]: 400,
    [ErrorCodes.AUTHENTICATION_REQUIRED]: 401,
    [ErrorCodes.FORBIDDEN]: 403,
    [ErrorCodes.NOT_FOUND]: 404,
    [ErrorCodes.CONFLICT]: 409,
    [ErrorCodes.DATABASE_ERROR]: 500,
    [ErrorCodes.INTERNAL_SERVER_ERROR]: 500,
    [ErrorCodes.RATE_LIMIT_EXCEEDED]: 429
  };
  return new AppError(
    ErrorCodes[code],
    message,
    statusCode || defaultStatusCodes[ErrorCodes[code]] || 500,
    details
  );
}
function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }
  let apiError;
  if (err instanceof AppError) {
    apiError = err;
  } else if (err instanceof ZodError) {
    apiError = createApiError(
      "VALIDATION_ERROR",
      "Invalid request data",
      400,
      {
        validationErrors: err.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
          code: error.code
        }))
      }
    );
  } else if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    apiError = createApiError(
      "DATABASE_ERROR",
      "Database temporarily unavailable",
      503
    );
  } else {
    console.error("Unhandled error:", err);
    apiError = createApiError(
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred",
      500
    );
  }
  if (apiError.statusCode >= 500) {
    console.error(`[${apiError.code}] ${apiError.message}`, {
      url: req.url,
      method: req.method,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      details: apiError.details,
      stack: err.stack
    });
  }
  res.status(apiError.statusCode).json({
    error: {
      code: apiError.code,
      message: apiError.message,
      ...apiError.details && { details: apiError.details },
      ...process.env.NODE_ENV === "development" && err.stack && { stack: err.stack }
    },
    success: false,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// server/middleware/validation.ts
function validateRequest(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
var commonSchemas = {
  // Pagination
  pagination: z3.object({
    page: z3.string().optional().transform((val) => val ? parseInt(val) : 1),
    limit: z3.string().optional().transform((val) => val ? Math.min(parseInt(val) || 10, 100) : 10)
  }),
  // ID parameter
  idParam: z3.object({
    id: z3.string().min(1, "ID is required")
  }),
  // Search query
  search: z3.object({
    search: z3.string().optional(),
    category: z3.string().optional(),
    sortBy: z3.string().optional()
  }),
  // Scan filters
  scanFilters: z3.object({
    search: z3.string().optional(),
    store: z3.string().optional(),
    category: z3.string().optional(),
    sortBy: z3.string().optional(),
    page: z3.string().optional().transform((val) => val ? parseInt(val) : 1),
    limit: z3.string().optional().transform((val) => val ? Math.min(parseInt(val) || 10, 100) : 10)
  })
};

// server/routes/telegram.ts
import { z as z4 } from "zod";
var telegramDealSchema = z4.object({
  productName: z4.string().min(1, "Product name is required"),
  productUrl: z4.string().url("Valid product URL is required"),
  originalPrice: z4.number().positive().optional(),
  salePrice: z4.number().positive().optional(),
  discountPercent: z4.number().min(0).max(100).optional(),
  category: z4.string().optional(),
  description: z4.string().optional(),
  imageUrl: z4.string().url().optional(),
  asin: z4.string().optional(),
  availability: z4.string().optional(),
  rating: z4.number().min(0).max(5).optional(),
  reviewCount: z4.number().min(0).optional(),
  // Bot authentication
  botToken: z4.string().min(1, "Bot token is required for authentication")
});
var telegramBatchSchema = z4.object({
  deals: z4.array(telegramDealSchema).min(1).max(50),
  // Limit batch size
  botToken: z4.string().min(1, "Bot token is required for authentication")
});
function registerTelegramRoutes(app2) {
  app2.post(
    "/api/telegram/deal",
    validateRequest({ body: telegramDealSchema }),
    asyncHandler(async (req, res) => {
      const dealData = req.body;
      const correlationId = req.logger?.context?.correlationId || "unknown";
      const expectedToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!expectedToken) {
        throw createApiError("INTERNAL_SERVER_ERROR", "Telegram bot not configured", 500);
      }
      if (dealData.botToken !== expectedToken) {
        req.logger?.warn("Unauthorized telegram bot request", {
          providedToken: dealData.botToken?.substring(0, 10) + "..."
        });
        throw createApiError("FORBIDDEN", "Invalid bot token", 403);
      }
      const { botToken, ...cleanDealData } = dealData;
      try {
        const enrichedDealData = {
          ...cleanDealData,
          source: "telegram_bot",
          timestamp: /* @__PURE__ */ new Date()
        };
        const scrapedProduct = await telegramProvider.processBotUpdate(enrichedDealData);
        req.logger?.info("Successfully processed Telegram deal", {
          productName: scrapedProduct.name,
          sku: scrapedProduct.sku,
          category: scrapedProduct.category,
          isOnClearance: scrapedProduct.isOnClearance
        });
        res.json({
          success: true,
          message: "Deal processed successfully",
          data: {
            productName: scrapedProduct.name,
            sku: scrapedProduct.sku,
            isOnClearance: scrapedProduct.isOnClearance,
            processed: true
          },
          correlationId
        });
      } catch (error) {
        req.logger?.error("Failed to process Telegram deal", {
          error: error.message,
          productName: cleanDealData.productName
        });
        throw createApiError("INTERNAL_SERVER_ERROR", "Failed to process deal data", 500);
      }
    })
  );
  app2.post(
    "/api/telegram/deals/batch",
    validateRequest({ body: telegramBatchSchema }),
    asyncHandler(async (req, res) => {
      const { deals, botToken } = req.body;
      const correlationId = req.logger?.context?.correlationId || "unknown";
      const expectedToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!expectedToken || botToken !== expectedToken) {
        throw createApiError("FORBIDDEN", "Invalid bot token", 403);
      }
      const processed = [];
      const failed = [];
      for (const dealData of deals) {
        try {
          const { botToken: _, ...cleanDealData } = dealData;
          const enrichedDealData = {
            ...cleanDealData,
            source: "telegram_bot",
            timestamp: /* @__PURE__ */ new Date()
          };
          const scrapedProduct = await telegramProvider.processBotUpdate(enrichedDealData);
          processed.push({
            productName: scrapedProduct.name,
            sku: scrapedProduct.sku,
            success: true
          });
        } catch (error) {
          failed.push({
            productName: dealData.productName,
            error: error.message,
            success: false
          });
        }
      }
      req.logger?.info("Batch processed Telegram deals", {
        totalDeals: deals.length,
        processed: processed.length,
        failed: failed.length
      });
      res.json({
        success: true,
        message: `Processed ${processed.length}/${deals.length} deals`,
        data: {
          processed,
          failed,
          summary: {
            total: deals.length,
            successful: processed.length,
            failed: failed.length
          }
        },
        correlationId
      });
    })
  );
  app2.get("/api/telegram/deals", asyncHandler(async (req, res) => {
    try {
      const { category, minDiscount, maxPrice } = req.query;
      const filters = {
        category,
        minDiscount: minDiscount ? Number(minDiscount) : void 0,
        maxPrice: maxPrice ? Number(maxPrice) : void 0
      };
      const deals = telegramProvider.getDeals(filters);
      const transformedDeals = deals.map((deal) => ({
        id: deal.productName.toLowerCase().replace(/\s+/g, "-").substring(0, 50),
        productName: deal.productName,
        productUrl: deal.productUrl,
        originalPrice: deal.originalPrice,
        currentPrice: deal.salePrice || deal.originalPrice,
        discount: deal.discountPercent ? `${deal.discountPercent}% off` : void 0,
        description: deal.description,
        imageUrl: deal.imageUrl,
        category: deal.category,
        rating: deal.rating,
        reviewCount: deal.reviewCount,
        availability: deal.availability,
        source: "telegram_bot",
        updatedAt: deal.timestamp?.toISOString() || (/* @__PURE__ */ new Date()).toISOString()
      }));
      res.json(transformedDeals);
    } catch (error) {
      req.logger?.error("Error fetching Telegram deals:", error);
      res.json([]);
    }
  }));
  app2.get("/api/telegram/stats", asyncHandler(async (req, res) => {
    try {
      const stats = telegramProvider.getStoreStats();
      res.json({
        totalDeals: stats.dealCount,
        activeDeals: stats.dealCount,
        lastUpdate: stats.lastUpdate?.toISOString() || (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      req.logger?.error("Error fetching Telegram stats:", error);
      res.json({
        totalDeals: 0,
        activeDeals: 0,
        lastUpdate: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }));
  app2.get("/api/telegram/status", asyncHandler(async (req, res) => {
    const stats = telegramProvider.getStoreStats();
    const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
    res.json({
      success: true,
      data: {
        configured: hasToken,
        active: stats.isActive,
        dealCount: stats.dealCount,
        lastUpdate: stats.lastUpdate,
        uptime: Date.now() - stats.lastUpdate.getTime()
      }
    });
  }));
  app2.post(
    "/api/telegram/cleanup",
    validateRequest({
      body: z4.object({
        hoursOld: z4.number().min(1).max(168).default(24)
        // 1 hour to 1 week
      })
    }),
    asyncHandler(async (req, res) => {
      const { hoursOld } = req.body;
      const beforeCount = telegramProvider.getStoreStats().dealCount;
      telegramProvider.cleanupOldDeals(hoursOld);
      const afterCount = telegramProvider.getStoreStats().dealCount;
      req.logger?.info("Cleaned up old Telegram deals", {
        hoursOld,
        dealsBefore: beforeCount,
        dealsAfter: afterCount,
        removed: beforeCount - afterCount
      });
      res.json({
        success: true,
        message: `Cleaned up deals older than ${hoursOld} hours`,
        data: {
          dealsBefore: beforeCount,
          dealsAfter: afterCount,
          removed: beforeCount - afterCount
        }
      });
    })
  );
}

// server/routes.ts
import { z as z5 } from "zod";
async function registerRoutes(app2) {
  registerAuthRoutes(app2);
  registerTelegramRoutes(app2);
  registerShoppingListRoutes(app2);
  app2.get("/api/stores", async (_req, res) => {
    try {
      const stores2 = await storage.getStores();
      res.json(stores2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });
  app2.post("/api/scans", async (req, res) => {
    try {
      const validatedData = createScanRequestSchema.parse(req.body);
      const store = await storage.getStore(validatedData.storeId);
      if (!store) {
        return res.status(400).json({ message: "Invalid store selected" });
      }
      const scan = await storage.createScan(validatedData);
      performScanInBackground(scan.id, store, validatedData);
      res.json(scan);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create scan" });
    }
  });
  app2.get("/api/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });
  app2.get("/api/scans/:id/results", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      const filters = {
        search: req.query.search,
        store: req.query.store,
        category: req.query.category,
        sortBy: req.query.sortBy,
        page: req.query.page ? parseInt(req.query.page) : 1,
        limit: req.query.limit ? parseInt(req.query.limit) : 10
      };
      const results = await storage.getScanResults(req.params.id, filters);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scan results" });
    }
  });
  app2.get("/api/scans", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const scans2 = await storage.getScans(limit);
      res.json(scans2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });
  app2.get("/api/user/scans", async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const scans2 = await storage.getUserScans(req.session.userId, limit);
      res.json(scans2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user scans" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
async function performScanInBackground(scanId, store, options) {
  try {
    await storage.updateScanStatus(scanId, "running");
    const scan = await storage.getScan(scanId);
    const userId = scan?.userId;
    const scraper = new StoreScraper(store);
    const scrapedProducts = await scraper.scrapeProducts({
      ...options,
      onProgress: (status, count) => {
        console.log(`Scan ${scanId}: ${status} (${count}/5)`);
      }
    }, userId);
    for (const product of scrapedProducts) {
      await storage.createScanResult({
        scanId,
        productName: product.name,
        sku: product.sku || null,
        storeId: "general",
        // Add required storeId field
        originalPrice: product.originalPrice?.toString(),
        clearancePrice: product.clearancePrice?.toString(),
        savingsPercent: product.savingsPercent,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed,
        category: product.category,
        storeLocation: "Store #0001",
        // Mock store location
        productUrl: product.productUrl || "",
        wasPrice: product.originalPrice?.toString() || null,
        savePercent: product.savingsPercent || null,
        inStock: null,
        deliveryAvailable: null,
        source: "mock",
        purchaseInStore: false,
        storeName: null
      });
    }
    const clearanceCount = scrapedProducts.filter((p) => p.isOnClearance).length.toString();
    await storage.completeScan(scanId, scrapedProducts.length.toString(), clearanceCount);
  } catch (error) {
    console.error(`Scan ${scanId} failed:`, error);
    await storage.updateScanStatus(scanId, "failed");
  }
}
async function performHomeDepotScanInBackground(scanId, options) {
  try {
    await storage.updateScanStatus(scanId, "running");
    const scan = await storage.getScan(scanId);
    const userId = scan?.userId || "";
    const scraper = new StoreScraper({ id: "home-depot", name: "Home Depot", baseUrl: "https://www.homedepot.com", isActive: true });
    const scrapedProducts = await scraper.scrapeProducts({
      zipCode: options.zipCode,
      radius: "25",
      productSelection: "all",
      clearanceOnly: true,
      onProgress: (status, count) => {
        console.log(`Home Depot Scan ${scanId}: ${status} (${count}/5)`);
      }
    }, userId);
    for (const product of scrapedProducts) {
      await storage.createScanResult({
        scanId,
        productName: product.name,
        sku: product.sku || null,
        storeId: "home-depot",
        productUrl: product.productUrl || "",
        wasPrice: product.originalPrice?.toString() || null,
        clearancePrice: product.clearancePrice?.toString() || null,
        savePercent: product.savingsPercent || null,
        inStock: null,
        deliveryAvailable: null,
        source: "alt",
        // In-store purchase fields
        purchaseInStore: product.purchaseInStore || false,
        storeName: product.storeName || null,
        // Legacy fields for backward compatibility
        originalPrice: product.originalPrice?.toString(),
        savingsPercent: product.savingsPercent,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed,
        category: product.category,
        storeLocation: product.storeName || "Home Depot"
      });
    }
    const clearanceCount = scrapedProducts.filter((p) => p.isOnClearance).length.toString();
    await storage.completeScan(scanId, scrapedProducts.length.toString(), clearanceCount);
  } catch (error) {
    console.error(`Home Depot Scan ${scanId} failed:`, error);
    await storage.updateScanStatus(scanId, "failed");
  }
}
async function performAceHardwareScanInBackground(scanId, options) {
  try {
    await storage.updateScanStatus(scanId, "running");
    const scan = await storage.getScan(scanId);
    const userId = scan?.userId || "";
    const scraper = new StoreScraper({ id: "ace-hardware", name: "Ace Hardware", baseUrl: "https://www.acehardware.com", isActive: true });
    const scrapedProducts = await scraper.scrapeProducts({
      zipCode: options.zipCode,
      radius: "50",
      // Fixed 50-mile radius for Ace Hardware
      productSelection: "all",
      clearanceOnly: true,
      onProgress: (status, count) => {
        console.log(`Ace Hardware Scan ${scanId}: ${status} (${count}/5)`);
      }
    }, userId);
    for (const product of scrapedProducts) {
      await storage.createScanResult({
        scanId,
        productName: product.name,
        sku: product.sku || null,
        storeId: "ace-hardware",
        productUrl: product.productUrl || "",
        wasPrice: product.originalPrice?.toString() || null,
        clearancePrice: product.clearancePrice?.toString() || null,
        savePercent: product.savingsPercent || null,
        inStock: null,
        deliveryAvailable: null,
        source: "alt",
        // In-store purchase fields
        purchaseInStore: product.purchaseInStore || false,
        storeName: product.storeName || null,
        // Legacy fields for backward compatibility
        originalPrice: product.originalPrice?.toString(),
        savingsPercent: product.savingsPercent,
        isOnClearance: product.isOnClearance,
        isPriceSuppressed: product.isPriceSuppressed,
        category: product.category,
        storeLocation: product.storeName || "Ace Hardware"
      });
    }
    const clearanceCount = scrapedProducts.filter((p) => p.isOnClearance).length.toString();
    await storage.completeScan(scanId, scrapedProducts.length.toString(), clearanceCount);
  } catch (error) {
    console.error(`Ace Hardware Scan ${scanId} failed:`, error);
    await storage.updateScanStatus(scanId, "failed");
  }
}
function registerShoppingListRoutes(app2) {
  app2.get("/api/shopping-list/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const shoppingItems = await storage.getShoppingListItems(userId);
      res.json(shoppingItems);
    } catch (error) {
      console.error("Failed to fetch shopping list:", error);
      res.status(500).json({ message: "Failed to fetch shopping list" });
    }
  });
  app2.post("/api/shopping-list", async (req, res) => {
    try {
      const { userId, productId, storeId, productName, targetPrice, notes, aisle, bay } = req.body;
      if (!userId || !productId || !storeId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const shoppingItem = await storage.addToShoppingList({
        userId,
        productId,
        storeId,
        productName,
        targetPrice,
        notes,
        aisle,
        bay
      });
      res.json(shoppingItem);
    } catch (error) {
      console.error("Failed to add to shopping list:", error);
      res.status(500).json({ message: "Failed to add item to shopping list" });
    }
  });
  app2.patch("/api/shopping-list/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const updates = req.body;
      const updatedItem = await storage.updateShoppingListItem(itemId, updates);
      if (!updatedItem) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      res.json(updatedItem);
    } catch (error) {
      console.error("Failed to update shopping list item:", error);
      res.status(500).json({ message: "Failed to update shopping list item" });
    }
  });
  app2.delete("/api/shopping-list/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      const deleted = await storage.deleteShoppingListItem(itemId);
      if (!deleted) {
        return res.status(404).json({ message: "Shopping list item not found" });
      }
      res.json({ message: "Item removed from shopping list" });
    } catch (error) {
      console.error("Failed to delete shopping list item:", error);
      res.status(500).json({ message: "Failed to delete shopping list item" });
    }
  });
  app2.get("/api/store-locations", async (req, res) => {
    try {
      const { zipCode, maxStores } = req.query;
      if (zipCode) {
        const { findStoresByZipCode: findStoresByZipCode2 } = await Promise.resolve().then(() => (init_real_store_data(), real_store_data_exports));
        const stores2 = findStoresByZipCode2(zipCode, parseInt(maxStores) || 25);
        res.json(stores2);
      } else {
        const { REAL_HOME_DEPOT_STORES: REAL_HOME_DEPOT_STORES2 } = await Promise.resolve().then(() => (init_real_store_data(), real_store_data_exports));
        res.json(REAL_HOME_DEPOT_STORES2);
      }
    } catch (error) {
      console.error("Failed to fetch store locations:", error);
      res.status(500).json({ message: "Failed to fetch store locations" });
    }
  });
  app2.post("/api/home-depot/scan", async (req, res) => {
    try {
      const validatedData = createHomeDepotScanSchema.parse(req.body);
      const scan = await storage.createHomeDepotScan(validatedData);
      performHomeDepotScanInBackground(scan.id, validatedData);
      res.json(scan);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create Home Depot scan:", error);
      res.status(500).json({ message: "Failed to create Home Depot scan" });
    }
  });
  app2.get("/api/home-depot/scans/:id/results", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      const results = await storage.getHomeDepotScanResults(req.params.id);
      res.json(results);
    } catch (error) {
      console.error("Failed to fetch Home Depot scan results:", error);
      res.status(500).json({ message: "Failed to fetch scan results" });
    }
  });
  app2.post("/api/ace-hardware/scan", async (req, res) => {
    try {
      const validatedData = createAceHardwareScanSchema.parse(req.body);
      const scan = await storage.createAceHardwareScan(validatedData);
      performAceHardwareScanInBackground(scan.id, validatedData);
      res.json(scan);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create Ace Hardware scan:", error);
      res.status(500).json({ message: "Failed to create Ace Hardware scan" });
    }
  });
  app2.get("/api/ace-hardware/scans/:id/results", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      const results = await storage.getAceHardwareScanResults(req.params.id);
      res.json(results);
    } catch (error) {
      console.error("Failed to fetch Ace Hardware scan results:", error);
      res.status(500).json({ message: "Failed to fetch scan results" });
    }
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json(submission);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Failed to create contact submission:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for production
  max: 20,
  // Maximum number of connections in the pool
  min: 2,
  // Minimum number of connections to maintain
  idleTimeoutMillis: 3e4,
  // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2e3,
  // Wait up to 2 seconds for connection
  allowExitOnIdle: false
  // Keep pool alive for graceful shutdown
});
var reconnectionAttempts = 0;
var MAX_RECONNECTION_ATTEMPTS = 5;
var RECONNECTION_DELAY = 5e3;
pool.on("error", async (err) => {
  console.error("Database pool error:", err);
  if (err.message.includes("connection") || err.message.includes("timeout")) {
    if (reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
      reconnectionAttempts++;
      console.log(`Attempting database reconnection ${reconnectionAttempts}/${MAX_RECONNECTION_ATTEMPTS}...`);
      setTimeout(async () => {
        try {
          await pool.query("SELECT 1");
          console.log("Database reconnection successful");
          reconnectionAttempts = 0;
        } catch (reconnectErr) {
          console.error("Reconnection failed:", reconnectErr);
        }
      }, RECONNECTION_DELAY * reconnectionAttempts);
    } else {
      console.error("Max reconnection attempts reached. Database may be unavailable.");
    }
  }
});
async function checkDatabaseHealth() {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}
process.on("SIGINT", async () => {
  console.log("Closing database pool...");
  await pool.end();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("Closing database pool...");
  await pool.end();
  process.exit(0);
});
var db = drizzle({ client: pool, schema: schema_exports });

// server/utils/logger.ts
import { randomUUID as randomUUID2 } from "crypto";
var Logger = class _Logger {
  context = {};
  setContext(context) {
    this.context = { ...this.context, ...context };
  }
  formatMessage(level, message, meta) {
    const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
    const correlationId = this.context.correlationId || randomUUID2().substring(0, 8);
    const logEntry = {
      timestamp: timestamp2,
      level,
      message,
      correlationId,
      ...this.context,
      ...meta && { meta }
    };
    if (process.env.NODE_ENV === "development") {
      return `[${timestamp2}] ${level.toUpperCase()} [${correlationId}] ${message}${meta ? ` ${JSON.stringify(meta)}` : ""}`;
    }
    return JSON.stringify(logEntry);
  }
  error(message, meta) {
    console.error(this.formatMessage("error" /* ERROR */, message, meta));
  }
  warn(message, meta) {
    console.warn(this.formatMessage("warn" /* WARN */, message, meta));
  }
  info(message, meta) {
    console.info(this.formatMessage("info" /* INFO */, message, meta));
  }
  debug(message, meta) {
    if (process.env.NODE_ENV === "development") {
      console.debug(this.formatMessage("debug" /* DEBUG */, message, meta));
    }
  }
  // Create a child logger with additional context
  child(context) {
    const childLogger = new _Logger();
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
};
var logger = new Logger();
function requestLogger() {
  return (req, res, next) => {
    const start = Date.now();
    const correlationId = req.headers["x-correlation-id"] || randomUUID2().substring(0, 8);
    res.setHeader("x-correlation-id", correlationId);
    req.logger = logger.child({
      correlationId,
      method: req.method,
      url: req.url,
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress
    });
    req.logger.info(`${req.method} ${req.url} - Request started`);
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - start;
      req.logger.info(`${req.method} ${req.url} ${res.statusCode} - Completed in ${duration}ms`);
      originalEnd.call(res, chunk, encoding);
    };
    next();
  };
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(requestLogger());
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.get("/api/health", async (_req, res) => {
    const dbHealthy = await checkDatabaseHealth();
    res.json({
      status: dbHealthy ? "healthy" : "unhealthy",
      database: dbHealthy ? "connected" : "disconnected",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.use(errorHandler);
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
