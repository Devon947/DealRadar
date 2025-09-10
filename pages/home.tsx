import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, MapPin, ChevronRight, Star, Users, DollarSign, 
  ShoppingCart, Target, TrendingUp, CheckCircle,
  Store, Package, Zap, Award, ArrowRight, Play, Crown
} from "lucide-react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { useTitle } from "@/hooks/use-title";

interface Retailer {
  id: string;
  name: string;
  description: string;
  logo: React.ReactNode;
  gradient: string;
  hoverColor: string;
  categories: string[];
  isActive: boolean;
  comingSoon?: boolean;
}

export default function HomePage() {
  useTitle("DealRadar - Find Amazing Deals at Home Depot, Lowe's & More");
  
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [selectedRetailer, setSelectedRetailer] = useState<string | null>(null);
  const retailerGridRef = useRef<HTMLDivElement>(null);

  const scrollToRetailers = () => {
    retailerGridRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const retailers: Retailer[] = [
    {
      id: "home-depot",
      name: "Home Depot",
      description: "",
      logo: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm font-black" 
             style={{ backgroundColor: '#f96302' }}>
          <div className="text-center">
            <div className="text-xs font-bold">THE</div>
            <div className="text-xs font-black -mt-1">HOME</div>
            <div className="text-xs font-black -mt-1">DEPOT</div>
          </div>
        </div>
      ),
      gradient: "from-blue-600 to-blue-700",
      hoverColor: "hover:border-blue-500",
      categories: ["Tools", "Garden", "Hardware", "Appliances"],
      isActive: true
    },
    {
      id: "lowes",
      name: "Lowe's",
      description: "",
      logo: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold" 
             style={{ backgroundColor: '#004990' }}>
          <div className="text-center leading-tight">
            <div>LOWE'S</div>
          </div>
        </div>
      ),
      gradient: "from-blue-600 to-blue-700",
      hoverColor: "hover:border-blue-500",
      categories: ["Home Improvement", "Garden", "Appliances"],
      isActive: true
    },
    {
      id: "ace-hardware",
      name: "Ace Hardware",
      description: "",
      logo: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold" 
             style={{ backgroundColor: '#e31e24' }}>
          <div className="text-center leading-tight">
            <div className="font-black text-xs">ACE</div>
            <div className="text-xs font-semibold -mt-0.5">HDWR</div>
          </div>
        </div>
      ),
      gradient: "from-blue-600 to-blue-700",
      hoverColor: "hover:border-blue-500",
      categories: ["Hardware", "Paint", "Tools", "Garden"],
      isActive: false,
      comingSoon: true
    },
    {
      id: "walmart",
      name: "Walmart",
      description: "Everything Store",
      logo: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center relative overflow-hidden" 
             style={{ backgroundColor: '#004c91' }}>
          <div className="text-white text-lg font-bold z-10">W</div>
          <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" 
               style={{ backgroundColor: '#ffc220' }}></div>
        </div>
      ),
      gradient: "from-blue-600 to-blue-700",
      hoverColor: "hover:border-blue-500",
      categories: ["Electronics", "Home", "Clothing", "Grocery"],
      isActive: false,
      comingSoon: true
    },
    {
      id: "amazon",
      name: "Amazon",
      description: "Online Everything",
      logo: (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xs font-bold" 
             style={{ backgroundColor: '#ff9900' }}>
          <div className="text-center">
            <div style={{ fontFamily: 'Arial, sans-serif' }}>amazon</div>
          </div>
        </div>
      ),
      gradient: "from-blue-600 to-blue-700",
      hoverColor: "hover:border-blue-500",
      categories: ["Electronics", "Books", "Home", "Everything"],
      isActive: true
    }
  ];

  const handleRetailerSelect = (retailerId: string) => {
    const retailer = retailers.find(r => r.id === retailerId);
    if (!retailer?.isActive) return; // Prevent selecting inactive retailers
    
    // Special handling for Amazon - navigate to Amazon deals page
    if (retailerId === "amazon") {
      setLocation("/amazon-deals");
      return;
    }
    
    setSelectedRetailer(retailerId);
    // Save selected retailer to localStorage
    localStorage.setItem("deal-radar-retailer", retailerId);
    
    // Auto-redirect to scan setup page
    setLocation("/scan");
  };

  const handleContinue = () => {
    if (selectedRetailer) {
      setLocation(`/scan`);
    }
  };

  const features = [
    {
      icon: Search,
      title: "Smart Scanning",
      description: "Advanced algorithms scan multiple stores simultaneously for the best deals",
      color: "text-blue-600"
    },
    {
      icon: Target,
      title: "Real-Time Results",
      description: "Get live prices and availability from stores in your area",
      color: "text-green-600"
    },
    {
      icon: Zap,
      title: "Instant Alerts",
      description: "Never miss a deal with smart notifications and shopping lists",
      color: "text-purple-600"
    }
  ];

  const stats = [
    { value: "500K+", label: "Products Scanned", color: "text-blue-600" },
    { value: "$2.3M", label: "Total Savings", color: "text-green-600" },
    { value: "2,500+", label: "Store Locations", color: "text-purple-600" },
    { value: "48%", label: "Avg. Discount", color: "text-orange-600" }
  ];

  const steps = [
    { number: 1, title: "Select Stores", description: "Choose your preferred retailers" },
    { number: 2, title: "Configure", description: "Set your search preferences" },
    { number: 3, title: "Scan", description: "Find deals instantly" },
    { number: 4, title: "Results", description: "View and organize your finds" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Main Heading */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DealRadar
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed">
              Discover hidden deals at top retailers near you
            </p>
            
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              Scan multiple store locations instantly and never miss a great deal again
            </p>

            {/* User Status */}
            {user?.zipCode && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <Badge 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all"
                  onClick={() => setLocation('/profile')}
                  data-testid="badge-zip-code"
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  ZIP {user.zipCode}
                </Badge>
                <Badge 
                  className={`px-4 py-2 text-sm font-medium border-0 cursor-pointer transition-all hover:opacity-80 ${
                    user.subscriptionPlan === "premium" 
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg" 
                      : user.subscriptionPlan === "basic" 
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg" 
                      : "bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg"
                  }`}
                  onClick={() => setLocation('/subscription')}
                  data-testid="badge-subscription-plan"
                >
                  {user.subscriptionPlan === "premium" && <Crown className="w-4 h-4 mr-1" />}
                  {user.subscriptionPlan === "basic" && <Star className="w-4 h-4 mr-1" />}
                  {user.subscriptionPlan === "free" && <Zap className="w-4 h-4 mr-1" />}
                  {user.subscriptionPlan === "premium" ? "Business Elite" : 
                   user.subscriptionPlan === "basic" ? "Pro Hunter" : "Free Explorer"}
                </Badge>
              </div>
            )}

            {/* CTA Button */}
            <Button 
              onClick={scrollToRetailers}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-start-finding-deals"
            >
              <Play className="w-6 h-6 mr-3" />
              Start Finding Deals
            </Button>
          </div>
        </div>
      </div>

      {/* Retailer Grid Section */}
      <div ref={retailerGridRef} className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Retailer
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select a store to start scanning for deals in your area
            </p>
          </div>

          {/* Retailer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
            {retailers.map((retailer) => (
              <Card 
                key={retailer.id}
                className={`transition-all duration-300 ${
                  !retailer.isActive 
                    ? 'opacity-50 cursor-not-allowed filter blur-sm' 
                    : `cursor-pointer hover:shadow-xl ${retailer.hoverColor} ${
                        selectedRetailer === retailer.id 
                          ? 'border-2 border-blue-600 shadow-lg scale-105' 
                          : 'border hover:scale-105'
                      }`
                }`}
                onClick={() => handleRetailerSelect(retailer.id)}
                data-testid={`card-retailer-${retailer.id}`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    {retailer.logo}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-lg">{retailer.name}</CardTitle>
                    {retailer.comingSoon && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{retailer.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {retailer.categories.slice(0, 3).map((category, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  {selectedRetailer === retailer.id && (
                    <div className="mt-4 flex justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          {selectedRetailer && (
            <div className="text-center">
              <Button 
                onClick={handleContinue}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg"
                data-testid="button-continue-to-scan"
              >
                Continue to Scan Setup
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Feature Cards */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose DealRadar?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card hover:shadow-xl transition-all duration-300 hover:scale-105 floating-element" style={{animationDelay: `${index * 0.2}s`}}>
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-gradient-to-r ${index === 0 ? 'from-blue-500 to-purple-600' : index === 1 ? 'from-teal-500 to-blue-600' : 'from-purple-500 to-pink-600'} pulse-glow`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}