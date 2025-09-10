import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { MapPin, Store, Clock } from 'lucide-react';
import { useUser } from '../contexts/user-context';

interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  distance?: number;
  storeHours?: string;
  isActive: boolean;
}

interface StoreSelectorProps {
  selectedStoreId?: string;
  onStoreSelect: (storeId: string, storeName: string) => void;
  allowManualLocation?: boolean;
  className?: string;
  subscriptionPlan?: string;
  userZipCode?: string;
  retailer?: string;
}

export function StoreSelector({ 
  selectedStoreId, 
  onStoreSelect, 
  allowManualLocation = true,
  className = "",
  subscriptionPlan,
  userZipCode,
  retailer
}: StoreSelectorProps) {
  const { user } = useUser();
  const userSubscriptionPlan = subscriptionPlan || user?.subscriptionPlan || 'free';
  const hasSubscription = userSubscriptionPlan !== 'free';
  const [zipCode, setZipCode] = useState(userZipCode || user?.zipCode || '');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize ZIP code from user data on component mount
  useEffect(() => {
    if (userZipCode || user?.zipCode) {
      setZipCode(userZipCode || user?.zipCode || '');
    }
  }, [userZipCode, user?.zipCode]);

  // Get user's location on component mount
  useEffect(() => {
    if (navigator.geolocation && allowManualLocation && !zipCode) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied or failed:', error.message);
          setLocationError('Location access denied. Please enter your ZIP code.');
        }
      );
    }
  }, [allowManualLocation, zipCode]);

  // Build query params based on available location info and subscription status
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    // Set store limits based on subscription plan
    const getStoreLimitForPlan = (plan: string): number => {
      const limits = {
        free: 1,
        pro: 2,
        pro_annual: 2,
        business: 5,
        business_annual: 5,
      };
      return limits[plan as keyof typeof limits] || 1;
    };
    
    const storeLimit = getStoreLimitForPlan(userSubscriptionPlan);
    
    if (hasSubscription) {
      params.append('limit', storeLimit.toString());
      params.append('radius', '50'); // 50-mile radius for subscribers
      params.append('hasSubscription', 'true');
    } else {
      params.append('limit', '1'); // Only 1 store for free users
      params.append('radius', '25'); // 25-mile radius for free users
      params.append('hasSubscription', 'false');
    }
    
    if (userLocation) {
      params.append('lat', userLocation.lat.toString());
      params.append('lng', userLocation.lng.toString());
    } else if (zipCode.length >= 5) {
      params.append('zipCode', zipCode);
    }
    
    // Add retailer filter if specified
    if (retailer) {
      params.append('retailer', retailer);
    }
    
    return params.toString();
  };

  const { data: stores = [], isLoading, error } = useQuery({
    queryKey: ['/api/store-locations', userLocation, zipCode, hasSubscription, userSubscriptionPlan, retailer],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/store-locations?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      return response.json();
    },
    enabled: !!(userLocation || zipCode.length >= 5)
  });

  const handleZipCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically re-run due to dependency on zipCode
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? '< 1 mile' : `${distance.toFixed(1)} miles`;
  };

  const selectedStore = stores.find((store: StoreLocation) => store.id === selectedStoreId);

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Your Store</h3>
        <Badge variant="secondary" className="mb-2">
          {hasSubscription 
            ? `${userSubscriptionPlan.charAt(0).toUpperCase() + userSubscriptionPlan.slice(1)} Plan: Up to ${hasSubscription ? (userSubscriptionPlan.includes('business') ? '5' : '2') : '1'} stores within 50 miles`
            : 'Free Plan: 1 store within 25 miles'}
        </Badge>
        
        {/* Location Input */}
        {(!userLocation || locationError) && allowManualLocation && (
          <form onSubmit={handleZipCodeSubmit} className="mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="zipcode" className="sr-only">ZIP Code</Label>
                <Input
                  id="zipcode"
                  placeholder="Enter ZIP code (e.g., 90210)"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  maxLength={5}
                  pattern="[0-9]{5}"
                  data-testid="input-zipcode"
                />
              </div>
              <Button 
                type="submit" 
                disabled={zipCode.length < 5}
                data-testid="button-find-stores"
              >
                Find Stores
              </Button>
            </div>
            {locationError && (
              <p className="text-sm text-muted-foreground mt-1">{locationError}</p>
            )}
          </form>
        )}

        {/* Location Status */}
        {userLocation && (
          <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Using your current location</span>
          </div>
        )}
      </div>

      {/* Selected Store Display */}
      {selectedStore && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="w-4 h-4" />
              Selected Store
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{selectedStore.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedStore.address}, {selectedStore.city}, {selectedStore.state} {selectedStore.zipCode}
              </p>
              {selectedStore.distance && (
                <Badge variant="secondary" className="text-xs">
                  {formatDistance(selectedStore.distance)}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Store List */}
      <div className="space-y-2">
        {isLoading && (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Finding nearby stores...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-destructive">Failed to load stores. Please try again.</p>
          </div>
        )}

        {stores.length > 0 && !isLoading && (
          <>
            <h4 className="text-sm font-medium text-muted-foreground">
              {hasSubscription 
                ? (userLocation ? 'Stores within 50 miles of you:' : 'Stores within 50 miles of ZIP code:') 
                : (userLocation ? 'Closest stores to you:' : 'Stores near ZIP code:')}
            </h4>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {stores.map((store: StoreLocation) => (
                <Card 
                  key={store.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    store.id === selectedStoreId ? 'border-primary bg-primary/5' : ''
                  }`}
                  onClick={() => onStoreSelect(store.id, store.name)}
                  data-testid={`card-store-${store.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{store.name}</h5>
                        <p className="text-xs text-muted-foreground truncate">
                          {store.address}, {store.city}, {store.state} {store.zipCode}
                        </p>
                        {store.storeHours && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <p className="text-xs text-muted-foreground">{store.storeHours}</p>
                          </div>
                        )}
                        {store.phone && (
                          <p className="text-xs text-muted-foreground mt-1">{store.phone}</p>
                        )}
                      </div>
                      {store.distance && (
                        <Badge variant="outline" className="text-xs ml-2">
                          {formatDistance(store.distance)}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {!userLocation && !zipCode && allowManualLocation && (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              Enable location access or enter your ZIP code to find nearby stores
            </p>
          </div>
        )}
      </div>
    </div>
  );
}