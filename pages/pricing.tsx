import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Users, Infinity } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useLocation } from "wouter";
import { useTitle } from "@/hooks/use-title";

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: PlanFeature[];
  popular?: boolean;
  current?: boolean;
}

export default function Pricing() {
  useTitle("Pricing Plans - Affordable Deal Scanning for Everyone | DealRadar");
  
  const { user } = useUser();
  const [, setLocation] = useLocation();

  const plans: Plan[] = [
    {
      id: "free",
      name: "Free Starter",
      price: 0,
      period: "forever",
      description: "Try DealRadar with minimal access",
      features: [
        { name: "1 scan per month", included: true },
        { name: "1 store only", included: true },
        { name: "Basic search", included: true },
        { name: "3-day scan history", included: true },
        { name: "Advanced filters", included: false },
        { name: "Multiple stores", included: false },
        { name: "Export results", included: false },
        { name: "Email alerts", included: false }
      ],
      current: user?.subscriptionPlan === "free"
    },
    {
      id: "pro",
      name: "Pro Hunter", 
      price: 9.99,
      period: "month",
      description: "Perfect for regular deal hunters",
      features: [
        { name: "10 scans per month", included: true },
        { name: "2 stores per scan", included: true },
        { name: "Advanced filters & sorting", included: true },
        { name: "30-day scan history", included: true },
        { name: "Email alerts", included: true },
        { name: "CSV export", included: true },
        { name: "Priority support", included: true },
        { name: "Save unlimited items", included: true }
      ],
      popular: true,
      current: user?.subscriptionPlan === "pro"
    },
    {
      id: "business",
      name: "Business Pro",
      price: 24.99,
      period: "month",
      description: "For businesses and power users", 
      features: [
        { name: "50 scans per month", included: true },
        { name: "5 stores per scan", included: true },
        { name: "Real-time notifications", included: true },
        { name: "1-year scan history", included: true },
        { name: "All advanced features", included: true },
        { name: "API access", included: true },
        { name: "All export formats", included: true },
        { name: "Priority phone support", included: true }
      ],
      current: user?.subscriptionPlan === "business"
    },
    {
      id: "pro_annual",
      name: "Pro Annual",
      price: 79.99,
      period: "year", 
      description: "Save 33% - Best value for individuals",
      features: [
        { name: "10 scans per month", included: true },
        { name: "2 stores per scan", included: true },
        { name: "All Pro features", included: true },
        { name: "Annual billing", included: true },
        { name: "Priority support", included: true },
        { name: "Save $40/year vs monthly", included: true },
        { name: "Advanced filters & sorting", included: true },
        { name: "30-day scan history", included: true }
      ],
      popular: false,
      current: user?.subscriptionPlan === "pro_annual"
    },
    {
      id: "business_annual",
      name: "Business Annual",
      price: 199.99,
      period: "year",
      description: "Save 33% - Best for businesses", 
      features: [
        { name: "50 scans per month", included: true },
        { name: "5 stores per scan", included: true },
        { name: "All Business features", included: true },
        { name: "Annual billing", included: true },
        { name: "Priority phone support", included: true },
        { name: "Save $100/year vs monthly", included: true },
        { name: "API access included", included: true },
        { name: "All export formats", included: true }
      ],
      current: user?.subscriptionPlan === "business_annual"
    }
  ];

  const stats = [
    { label: "Active Users", value: "50K+", icon: Users },
    { label: "Deals Found", value: "2M+", icon: Star },
    { label: "Money Saved", value: "$15M+", icon: Zap },
    { label: "Stores Covered", value: "500+", icon: Infinity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Unlock the full power of deal hunting with plans designed for every type of deal seeker
          </p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all hover:shadow-xl ${
                plan.popular 
                  ? 'border-2 border-blue-600 scale-105' 
                  : plan.current 
                    ? 'border-2 border-green-500' 
                    : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                  Most Popular
                </div>
              )}
              
              {plan.current && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center py-2 text-sm font-semibold">
                  Current Plan
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular || plan.current ? 'pt-12' : 'pt-6'}`}>
                <div className="flex justify-center mb-4">
                  {plan.id === 'free' && <Zap className="w-8 h-8 text-blue-500" />}
                  {plan.id === 'pro' && <Star className="w-8 h-8 text-blue-600" />}
                  {plan.id === 'enterprise' && <Crown className="w-8 h-8 text-purple-500" />}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="flex items-baseline justify-center space-x-1 mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-300">/{plan.period}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-4">{plan.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check 
                        className={`w-5 h-5 ${
                          feature.included ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                        }`} 
                      />
                      <span className={feature.included ? '' : 'text-gray-400 line-through'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.current 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  } text-white`}
                  disabled={plan.current}
                  onClick={() => setLocation('/subscription')}
                  data-testid={`button-select-${plan.id}`}
                >
                  {plan.current ? 'Current Plan' : `Choose ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately 
                  and we'll prorate any billing differences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What stores do you cover?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  We cover major retailers including Home Depot, Lowe's, Walmart, Target, and many more. 
                  Pro and Enterprise plans include access to all stores.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How accurate are the prices?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Our prices are updated in real-time and are typically accurate within minutes. 
                  However, clearance prices can change quickly, so we recommend checking with the store directly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}