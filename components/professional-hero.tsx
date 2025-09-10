import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/contexts/user-context";
import { Search, TrendingDown, MapPin, Crown, Zap, Target } from "lucide-react";

export default function ProfessionalHero() {
  const { user } = useUser();

  const planBenefits = {
    free: { stores: 1, name: "Free", color: "bg-gray-500" },
    basic: { stores: 10, name: "Basic", color: "bg-blue-500" },
    premium: { stores: 25, name: "Premium", color: "bg-gradient-to-r from-blue-600 to-purple-600" },
  };

  const currentPlan = planBenefits[user?.subscriptionPlan as keyof typeof planBenefits] || planBenefits.free;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          {/* Main Heading */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DealRadar
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Discover hidden deals at Home Depot stores near you
          </p>
          
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Scan multiple store locations instantly and never miss a great deal again
          </p>

          {/* User Status */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className={`${currentPlan.color} text-white px-4 py-2 text-sm font-medium`}>
              <Crown className="w-4 h-4 mr-1" />
              {currentPlan.name} Plan
            </Badge>
            {user?.zipCode && (
              <Badge variant="outline" className="px-4 py-2 text-sm">
                <MapPin className="w-4 h-4 mr-1" />
                ZIP {user.zipCode}
              </Badge>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Smart Scanning
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Advanced algorithms scan {currentPlan.stores} store{currentPlan.stores > 1 ? 's' : ''} simultaneously for the best deals
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Real-Time Results
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Get live clearance prices and availability from stores in your area
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Instant Alerts
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Never miss a deal with smart notifications and shopping lists
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">500K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Products Scanned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">$2.3M</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">2,500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Store Locations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">48%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Avg. Discount</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}