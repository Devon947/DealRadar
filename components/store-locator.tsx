import { useMemo } from "react";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Store, Crown } from "lucide-react";

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  distance: number;
  zipCode: string;
}

interface StoreLocatorProps {
  storeId: string;
  storeName: string;
}

// Mock store locations - in production, this would come from a real store locator API
const MOCK_STORE_LOCATIONS: Record<string, StoreLocation[]> = {
  "home-depot": [
    { id: "hd-001", name: "Home Depot - Downtown", address: "123 Main St", distance: 0.8, zipCode: "10001" },
    { id: "hd-002", name: "Home Depot - Westside", address: "456 West Ave", distance: 1.2, zipCode: "10002" },
    { id: "hd-003", name: "Home Depot - Mall Plaza", address: "789 Mall Dr", distance: 2.1, zipCode: "10003" },
    { id: "hd-004", name: "Home Depot - North Hills", address: "321 North Rd", distance: 3.4, zipCode: "10004" },
    { id: "hd-005", name: "Home Depot - South Gate", address: "654 South Blvd", distance: 4.2, zipCode: "10005" },
    { id: "hd-006", name: "Home Depot - East Valley", address: "987 East St", distance: 5.1, zipCode: "10006" },
    { id: "hd-007", name: "Home Depot - Riverside", address: "147 River Rd", distance: 6.3, zipCode: "10007" },
    { id: "hd-008", name: "Home Depot - Airport", address: "258 Airport Way", distance: 7.8, zipCode: "10008" },
    { id: "hd-009", name: "Home Depot - Suburbia", address: "369 Suburb Ave", distance: 8.9, zipCode: "10009" },
    { id: "hd-010", name: "Home Depot - Industrial", address: "741 Industrial Pkwy", distance: 9.7, zipCode: "10010" },
    { id: "hd-011", name: "Home Depot - Metro Center", address: "852 Metro Blvd", distance: 10.8, zipCode: "10011" },
    { id: "hd-012", name: "Home Depot - Crossroads", address: "963 Cross St", distance: 12.1, zipCode: "10012" },
    { id: "hd-013", name: "Home Depot - Lakeside", address: "159 Lake Dr", distance: 13.5, zipCode: "10013" },
    { id: "hd-014", name: "Home Depot - Mountain View", address: "357 Mountain Rd", distance: 14.7, zipCode: "10014" },
    { id: "hd-015", name: "Home Depot - Valley Ridge", address: "468 Valley St", distance: 15.9, zipCode: "10015" },
    { id: "hd-016", name: "Home Depot - Sunset", address: "579 Sunset Ave", distance: 17.2, zipCode: "10016" },
    { id: "hd-017", name: "Home Depot - Harbor Point", address: "680 Harbor Dr", distance: 18.4, zipCode: "10017" },
    { id: "hd-018", name: "Home Depot - Tech Center", address: "791 Tech Blvd", distance: 19.6, zipCode: "10018" },
    { id: "hd-019", name: "Home Depot - Green Valley", address: "802 Green Way", distance: 20.8, zipCode: "10019" },
    { id: "hd-020", name: "Home Depot - Heritage", address: "913 Heritage Rd", distance: 22.1, zipCode: "10020" },
    { id: "hd-021", name: "Home Depot - Meadowbrook", address: "024 Meadow Ln", distance: 23.5, zipCode: "10021" },
    { id: "hd-022", name: "Home Depot - Oakwood", address: "135 Oak St", distance: 24.7, zipCode: "10022" },
    { id: "hd-023", name: "Home Depot - Hillcrest", address: "246 Hill Ave", distance: 25.9, zipCode: "10023" },
    { id: "hd-024", name: "Home Depot - Parkway", address: "357 Park Dr", distance: 27.2, zipCode: "10024" },
    { id: "hd-025", name: "Home Depot - Fairfield", address: "468 Fair Rd", distance: 28.4, zipCode: "10025" },
  ]
};

export default function StoreLocator({ storeId, storeName }: StoreLocatorProps) {
  const { user } = useUser();
  
  const storeCount = useMemo(() => {
    if (!user?.subscriptionPlan) return 1;
    
    switch (user.subscriptionPlan) {
      case "basic": return 5;
      case "premium": return 25;
      default: return 1; // free plan
    }
  }, [user?.subscriptionPlan]);

  const storeLocations = useMemo(() => {
    const locations = MOCK_STORE_LOCATIONS[storeId] || [];
    return locations.slice(0, storeCount).sort((a, b) => a.distance - b.distance);
  }, [storeId, storeCount]);

  const planName = user?.subscriptionPlan === "basic" ? "Pro Hunter" : 
                   user?.subscriptionPlan === "premium" ? "Business Elite" : "Free Explorer";

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Store Coverage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Crown className="w-3 h-3" />
              {planName} Plan
            </Badge>
            <span className="text-sm text-muted-foreground">
              Scanning {storeCount} closest {storeId.replace("-", " ")} store{storeCount > 1 ? "s" : ""}
            </span>
          </div>
          {user?.zipCode && (
            <Badge variant="secondary">
              ZIP: {user.zipCode}
            </Badge>
          )}
        </div>

        <div className="grid gap-2 max-h-60 overflow-y-auto">
          {storeLocations.map((location, index) => (
            <div
              key={location.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{location.name}</p>
                  <p className="text-xs text-muted-foreground">{location.address}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{location.distance} mi</p>
                <p className="text-xs text-muted-foreground">{location.zipCode}</p>
              </div>
            </div>
          ))}
        </div>

        {storeLocations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Store className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No stores found in your area</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}