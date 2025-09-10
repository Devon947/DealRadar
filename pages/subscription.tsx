import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AppHeader from "@/components/app-header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { StoreSelector } from "@/components/store-selector";
import { SquarePaymentForm } from "@/components/payment/SquarePaymentForm";
import { ArrowLeft, Check, Crown, Star, Zap, TrendingUp, BarChart3, UserIcon, Settings, Award, CreditCard } from "lucide-react";
import { type User } from "@shared/schema";
import { useUser } from "@/contexts/user-context";
import { useTitle } from "@/hooks/use-title";

interface SubscriptionStatus {
  plan: string;
  usage: {
    scansUsed: number;
    scansLimit: number;
    scansRemaining: number;
    storesPerScan: number;
    resetDate: string;
  };
  status: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  scanLimit: number;
  storeLimit: number;
  icon: React.ReactNode;
  popular: boolean;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free Starter",
    price: "$0",
    period: "/month",
    description: "Try DealRadar with minimal access",
    features: [
      "1 scan per month",
      "1 store only",
      "Basic search",
      "3-day scan history",
      "Email support"
    ],
    scanLimit: 1,
    storeLimit: 1,
    icon: <Zap className="w-6 h-6" />,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro Hunter",
    price: "$9.99", 
    period: "/month",
    description: "Perfect for regular deal hunters",
    features: [
      "10 scans per month",
      "2 stores per scan",
      "Advanced filtering & sorting",
      "Save unlimited items",
      "30-day scan history",
      "Email alerts",
      "CSV export",
      "Priority support"
    ],
    scanLimit: 10,
    storeLimit: 2,
    icon: <Star className="w-6 h-6" />,
    popular: true,
  },
  {
    id: "business",
    name: "Business Pro",
    price: "$24.99",
    period: "/month",
    description: "For businesses and power users",
    features: [
      "50 scans per month",
      "5 stores per scan",
      "All advanced features",
      "Save unlimited items",
      "1-year scan history",
      "Real-time notifications",
      "API access",
      "All export formats",
      "Priority phone support"
    ],
    scanLimit: 50,
    storeLimit: 5,
    icon: <Crown className="w-6 h-6" />,
    popular: false,
  },
  {
    id: "pro_annual",
    name: "Pro Annual", 
    price: "$99.99",
    period: "/year",
    description: "Save 17% with annual billing",
    features: [
      "10 scans per month",
      "2 stores per scan",
      "All Pro features",
      "Annual billing",
      "Priority support",
      "Save $40/year",
      "Advanced filters",
      "30-day history"
    ],
    scanLimit: 10,
    storeLimit: 2,
    icon: <Award className="w-6 h-6 text-blue-600" />,
    popular: false,
  },
  {
    id: "business_annual", 
    name: "Business Annual",
    price: "$249.99",
    period: "/year",
    description: "Save 17% with annual billing",
    features: [
      "50 scans per month",
      "5 stores per scan",
      "All Business features",
      "Annual billing",
      "Priority phone support",
      "Save $100/year",
      "API access",
      "All export formats"
    ],
    scanLimit: 50,
    storeLimit: 5,
    icon: <Crown className="w-6 h-6 text-purple-600" />,
    popular: false,
  },
];

export default function SubscriptionPage() {
  useTitle("Subscription Plans - DealRadar");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedStoreName, setSelectedStoreName] = useState<string>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  // Get real usage data from API
  const { data: subscriptionStatus } = useQuery<SubscriptionStatus>({
    queryKey: ["/api/subscriptions/status"],
    enabled: !!user,
  });

  const currentUsage = useMemo(() => {
    if (subscriptionStatus && subscriptionStatus.usage) {
      return {
        scansUsed: subscriptionStatus.usage.scansUsed,
        scansLimit: subscriptionStatus.usage.scansLimit,
        storesPerScan: subscriptionStatus.usage.storesPerScan,
        resetDate: new Date(subscriptionStatus.usage.resetDate)
      };
    }
    
    // Fallback for when API is loading
    const currentPlan = plans.find(p => p.id === (user?.subscriptionPlan || "free"));
    return {
      scansUsed: 0,
      scansLimit: currentPlan?.scanLimit || 2,
      storesPerScan: currentPlan?.storeLimit || 1,
      resetDate: new Date(2025, 2, 15)
    };
  }, [subscriptionStatus, user?.subscriptionPlan]);

  // Get Square pricing information
  const { data: squarePricing } = useQuery({
    queryKey: ["/api/payments/pricing"]
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest("/api/subscriptions/create", "POST", { planId });
      return response;
    },
    onSuccess: (data: any) => {
      if (data?.clientSecret) {
        // Redirect to Stripe checkout for existing functionality
        window.location.href = data.checkoutUrl;
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been updated successfully.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Subscription Error", 
        description: error.message || "Failed to update subscription.",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation("/");
  };

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    
    if (planId === "free") {
      // Handle downgrade to free
      subscribeMutation.mutate(planId);
    } else {
      // For paid plans, open Square payment dialog
      setSelectedPlan(planId);
      setPaymentDialogOpen(true);
    }
  };

  const currentPlan = user?.subscriptionPlan || "free";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={handleBack} data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setLocation("/profile")} 
            className="flex items-center gap-2"
            data-testid="button-view-profile"
          >
            <UserIcon className="w-4 h-4" />
            View Profile
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg floating-element">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">Manage Your Subscription</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock more stores and advanced features with our subscription plans
          </p>
        </div>

        {/* Current Usage Dashboard */}
        {user && (
          <Card className="mb-8 max-w-4xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Current Usage - {plans.find(p => p.id === user.subscriptionPlan)?.name || "Free Explorer"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Monthly Scans</span>
                    <span className="text-sm text-muted-foreground">
                      {currentUsage.scansUsed} / {currentUsage.scansLimit === 999 ? "∞" : currentUsage.scansLimit}
                    </span>
                  </div>
                  <Progress 
                    value={(currentUsage.scansUsed / currentUsage.scansLimit) * 100}
                    className="h-2"
                    data-testid="progress-scans-used"
                  />
                  <p className="text-xs text-muted-foreground">
                    Resets {currentUsage.resetDate.toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Stores Per Scan</span>
                    <span className="text-sm text-muted-foreground">
                      Up to {currentUsage.storesPerScan}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-full bg-green-500 rounded-full w-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on distance from your ZIP
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Plan Status</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      Active
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-full bg-blue-500 rounded-full w-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Next billing: {currentUsage.resetDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Store Selection Section */}
        <div className="bg-card rounded-lg p-6 border mb-8 max-w-4xl mx-auto">
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreSelect={(storeId, storeName) => {
              setSelectedStoreId(storeId);
              setSelectedStoreName(storeName);
            }}
            className="max-w-full"
            subscriptionPlan={user?.subscriptionPlan || undefined}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-8xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all hover:shadow-xl ${
                plan.id === 'lifetime' 
                  ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 shadow-lg' 
                  : plan.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : ''
              } ${currentPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.id === 'lifetime' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-semibold">
                  🔥 LIMITED TIME
                </Badge>
              )}
              
              {plan.popular && plan.id !== 'lifetime' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}
              
              {currentPlan === plan.id && (
                <Badge className="absolute -top-3 right-4 bg-green-500">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2 text-primary">
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={subscribeMutation.isPending || currentPlan === plan.id}
                  className={`w-full ${
                    plan.id === 'lifetime' 
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold shadow-lg'
                      : ''
                  }`}
                  variant={plan.id === 'lifetime' ? "default" : plan.popular ? "default" : "outline"}
                  data-testid={`button-select-${plan.id}`}
                >
                  {subscribeMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : currentPlan === plan.id ? (
                    "Current Plan"
                  ) : currentPlan !== "free" && plan.id === "free" ? (
                    "Downgrade"
                  ) : plan.id === "lifetime" ? (
                    "Get Lifetime Access"
                  ) : plan.id === "free" ? (
                    "Get Started" 
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade with Square
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4 text-left">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Can I change my plan anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">What happens if I downgrade?</h3>
              <p className="text-muted-foreground text-sm">
                Your scan coverage will be reduced to match your new plan, but your scan history will be preserved.
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground text-sm">
                Yes, you can cancel your subscription at any time. You'll keep access until the end of your billing period.
              </p>
            </div>
          </div>
        </div>

        {/* Square Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="max-w-md" data-testid="dialog-square-payment">
            <DialogHeader>
              <DialogTitle data-testid="text-dialog-title">
                Complete Your Subscription
              </DialogTitle>
            </DialogHeader>
            <SquarePaymentForm 
              preSelectedPlan={selectedPlan}
              onClose={() => setPaymentDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}