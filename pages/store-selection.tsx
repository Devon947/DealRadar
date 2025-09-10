import { useMemo } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppHeader from "@/components/app-header";
import ProfessionalHero from "@/components/professional-hero";
import StepIndicator from "@/components/step-indicator";
import { useUser } from "@/contexts/user-context";
import { findStoresByZipCode } from "@/components/real-store-data";
import { Store as StoreIcon, MapPin, Phone, Clock, ExternalLink, ArrowRight, Info } from "lucide-react";

export default function StoreSelection() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  
  const storeLocations = useMemo(() => {
    if (!user?.zipCode) return [];
    
    const maxStores = user.subscriptionPlan === "premium" ? 25 : 
                     user.subscriptionPlan === "basic" ? 10 : 1;
    
    return findStoresByZipCode(user.zipCode, maxStores);
  }, [user?.zipCode, user?.subscriptionPlan]);

  const steps = [
    { id: "select", title: "Select Stores", description: "Choose locations" },
    { id: "configure", title: "Configure", description: "Setup scan options" },
    { id: "scan", title: "Scan", description: "Find deals" },
    { id: "results", title: "Results", description: "View & organize" }
  ];

  const handleStoreSelect = () => {
    setLocation("/scan-setup/home-depot");
  };

  const getHomeDepotIcon = () => {
    return (
      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-black" 
           style={{ backgroundColor: '#f96302' }}>
        <div className="text-center">
          <div className="text-xs font-bold">THE</div>
          <div className="text-xs font-black -mt-1">HOME</div>
          <div className="text-xs font-black -mt-1">DEPOT</div>
        </div>
      </div>
    );
  };

  if (!user?.zipCode) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-4">ZIP Code Required</h2>
          <p className="text-muted-foreground mb-6">
            Please set your ZIP code in your account settings to find nearby Home Depot stores.
          </p>
          <Button onClick={() => setLocation("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      {/* Professional Hero Section */}
      <ProfessionalHero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicator */}
        <StepIndicator 
          steps={steps} 
          currentStep="select" 
          completedSteps={[]} 
        />

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Home Depot Stores Near {user.zipCode}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ready to scan <span className="font-semibold text-blue-600">{storeLocations.length} store{storeLocations.length > 1 ? 's' : ''}</span> for deals based on your {user.subscriptionPlan} plan
          </p>

          {/* Subscription Info */}
          <Card className="max-w-md mx-auto mb-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 justify-center">
                <Info className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Your {user.subscriptionPlan} plan includes up to {
                    user.subscriptionPlan === "premium" ? "25" : 
                    user.subscriptionPlan === "basic" ? "10" : "1"
                  } store{user.subscriptionPlan === "free" ? "" : "s"}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center mb-8">
            <Button 
              size="lg" 
              onClick={handleStoreSelect}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
              data-testid="button-start-scan"
            >
              Continue to Setup
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Store Locations */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
            Scanning These Store Locations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {storeLocations.map((store, index) => (
              <Card key={store.id} className="hover:shadow-md transition-shadow" data-testid={`card-store-${store.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getHomeDepotIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-foreground truncate">
                          {store.name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          #{store.storeNumber}
                        </Badge>
                      </div>
                      
                      <div className="flex items-start gap-1 mb-2">
                        <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {store.address}<br />
                          {store.city}, {store.state} {store.zipCode}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {store.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{store.phone}</span>
                          </div>
                        )}
                        {store.storeHours && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="truncate">Open today</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Why Choose DealRadar?
              </h3>
              <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                Our advanced scanning technology checks real-time inventory and pricing across multiple stores simultaneously, 
                ensuring you never miss the best deals in your area.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Badge variant="secondary">Real-time pricing</Badge>
                <Badge variant="secondary">Multiple store coverage</Badge>
                <Badge variant="secondary">Smart notifications</Badge>
                <Badge variant="secondary">Shopping list organization</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}