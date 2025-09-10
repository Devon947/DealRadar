import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MapPin, Play, Store, Filter,
  ChevronRight, Target, Package, ShoppingCart
} from "lucide-react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { StoreSelector } from "@/components/store-selector";
import { useQuery } from "@tanstack/react-query";
import { useTitle } from "@/hooks/use-title";

interface StepperStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

export default function ScanPage() {
  useTitle("Start New Deal Scan - Find Discounts Near You | DealRadar");
  
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [selectedRetailer, setSelectedRetailer] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedStoreName, setSelectedStoreName] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState(20);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Load saved retailer selection
    const savedRetailer = localStorage.getItem("deal-radar-retailer");
    if (savedRetailer) {
      setSelectedRetailer(savedRetailer);
    }
  }, []);

  const steps: StepperStep[] = [
    { id: "select", title: "Select", description: "Choose stores", status: "completed" },
    { id: "configure", title: "Configure", description: "Setup scan options", status: "current" },
    { id: "scan", title: "Scan", description: "Find deals", status: "pending" },
    { id: "results", title: "Results", description: "View & organize", status: "pending" }
  ];

  const retailerLogos = {
    "home-depot": (
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-black" 
           style={{ backgroundColor: '#f96302' }}>
        <div className="text-center">
          <div className="text-[6px] font-bold">THE</div>
          <div className="text-[6px] font-black -mt-0.5">HOME</div>
          <div className="text-[6px] font-black -mt-0.5">DEPOT</div>
        </div>
      </div>
    ),
    "lowes": (
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-bold" 
           style={{ backgroundColor: '#004990' }}>
        L
      </div>
    ),
    "ace-hardware": (
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold" 
           style={{ backgroundColor: '#e31e24' }}>
        ACE
      </div>
    ),
    "walmart": (
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-bold" 
           style={{ backgroundColor: '#004c91' }}>
        W
      </div>
    ),
    "amazon": (
      <div className="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-bold" 
           style={{ backgroundColor: '#ff9900' }}>
        a
      </div>
    )
  };

  const retailerNames = {
    "home-depot": "Home Depot",
    "lowes": "Lowe's",
    "ace-hardware": "Ace Hardware",
    "walmart": "Walmart",
    "amazon": "Amazon"
  };



  const handleStartScan = () => {
    setIsScanning(true);
    // Simulate scan process
    setTimeout(() => {
      setIsScanning(false);
      setLocation("/results");
    }, 3000);
  };


  const availableCategories = [
    "Tools", "Garden", "Hardware", "Appliances", "Paint", 
    "Plumbing", "Electrical", "Lumber", "Home Decor", "Outdoor"
  ];

  const selectedStoreCount = selectedStoreId ? 1 : 0;
  const activeFiltersCount = (inStockOnly ? 1 : 0) + (categories.length > 0 ? 1 : 0);

  if (!selectedRetailer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Retailer Selected</CardTitle>
            <p className="text-muted-foreground">Please select a retailer from the home page first.</p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Stepper */}
      <div className="sticky top-16 z-40 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.status === 'completed' ? 'bg-blue-600 text-white' :
                    step.status === 'current' ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm font-medium ${
                      step.status === 'current' ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Utility Bar */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Retailer Chip */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border">
                {retailerLogos[selectedRetailer as keyof typeof retailerLogos]}
                <span className="font-medium text-sm">
                  {retailerNames[selectedRetailer as keyof typeof retailerNames]}
                </span>
              </div>

              {/* ZIP Pill */}
              <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{user?.zipCode}</span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Setup Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Locations Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  Store Locations
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select stores near {user?.zipCode}
                </p>
              </CardHeader>
              <CardContent>
                <StoreSelector
                  selectedStoreId={selectedStoreId}
                  onStoreSelect={(storeId, storeName) => {
                    setSelectedStoreId(storeId);
                    setSelectedStoreName(storeName);
                  }}
                  allowManualLocation={true}
                  subscriptionPlan={user?.subscriptionPlan || undefined}
                  userZipCode={user?.zipCode || undefined}
                  retailer={selectedRetailer || undefined}
                />
              </CardContent>
            </Card>

            {/* Filters Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Search Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center gap-2">
                        <Checkbox
                          checked={categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCategories([...categories, category]);
                            } else {
                              setCategories(categories.filter(c => c !== category));
                            }
                          }}
                          data-testid={`checkbox-category-${category}`}
                        />
                        <label className="text-sm">{category}</label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimum Discount */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Minimum Discount: {minDiscount}%
                  </Label>
                  <Slider
                    value={[minDiscount]}
                    onValueChange={(value) => setMinDiscount(value[0])}
                    max={90}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* In Stock Only Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">In Stock Only</Label>
                    <p className="text-xs text-muted-foreground">Show only available items</p>
                  </div>
                  <Switch
                    checked={inStockOnly}
                    onCheckedChange={setInStockOnly}
                    data-testid="switch-in-stock"
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Live Preview */}
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="sticky top-40">
              <CardHeader>
                <CardTitle className="text-lg">Scan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary Chips */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{selectedStoreCount} stores selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{activeFiltersCount} filters active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Min {minDiscount}% discount</span>
                  </div>
                </div>

                {/* Mock Preview Grid */}
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="text-xs text-muted-foreground mb-2">Preview Results</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white dark:bg-gray-700 rounded p-2 text-xs">
                        <div className="w-full h-8 bg-gray-200 dark:bg-gray-600 rounded mb-1"></div>
                        <div className="text-green-600 font-medium">{25 + i * 5}% off</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start Scan Button */}
                <Button 
                  onClick={handleStartScan}
                  disabled={!selectedStoreId || isScanning}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="button-start-scan"
                >
                  {isScanning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Scanning Now
                    </>
                  )}
                </Button>

                {/* Continue Button */}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}