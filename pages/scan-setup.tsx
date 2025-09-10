import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Search, Zap, Target, TrendingDown, Play, Clock } from "lucide-react";
import AppHeader from "@/components/app-header";
import StoreLocator from "@/components/store-locator";
import StepIndicator from "@/components/step-indicator";
import TooltipHelper from "@/components/tooltip-helper";
import { z } from "zod";

// Simplified scan request schema - only full product scan
const simplifiedScanSchema = z.object({
  userId: z.string(),
  storeId: z.string(),
  clearanceOnly: z.boolean().default(true),
  productSelection: z.literal("all"),
});

type SimplifiedScanRequest = z.infer<typeof simplifiedScanSchema>;

export default function ScanSetup() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const storeId = params?.storeId as string;

  const form = useForm<SimplifiedScanRequest>({
    resolver: zodResolver(simplifiedScanSchema),
    defaultValues: {
      userId: user?.id || "",
      storeId: storeId || "",
      clearanceOnly: true,
      productSelection: "all",
    },
  });

  const createScanMutation = useMutation({
    mutationFn: (data: SimplifiedScanRequest) => 
      apiRequest("POST", "/api/scans", data),
    onSuccess: async (response) => {
      const scan = await response.json();
      toast({
        title: "Scan Started!",
        description: "Your clearance scan is now running. You'll see results as they come in.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      setLocation(`/scan-results/${scan.id}`);
    },
    onError: (error: any) => {
      console.error("Failed to create scan:", error);
      toast({
        title: "Scan Failed",
        description: "Failed to start your clearance scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SimplifiedScanRequest) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start a scan.",
        variant: "destructive",
      });
      return;
    }

    const scanData = { ...data, userId: user.id };
    createScanMutation.mutate(scanData);
  };

  const handleBack = () => {
    setLocation("/");
  };

  const storeName = storeId === "home-depot" ? "Home Depot" : "Store";

  const steps = [
    { id: "select", title: "Select Stores", description: "Choose locations" },
    { id: "configure", title: "Configure", description: "Setup scan options" },
    { id: "scan", title: "Scan", description: "Find deals" },
    { id: "results", title: "Results", description: "View & organize" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step Indicator */}
        <StepIndicator 
          steps={steps} 
          currentStep="configure" 
          completedSteps={["select"]} 
        />

        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store Selection
          </Button>
          
          <StoreLocator storeId={storeId} storeName={storeName} />
          
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Configure Your Scan</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Set up your preferences before we scan all selected {storeName} locations for deals.
              You can filter and sort results after the scan completes.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-2 border-blue-200 dark:border-blue-800">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  Scan Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Scan Type - Fixed to Full Scan */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Full Store Scan</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Scanning all available products across all departments for the best deals.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Tools & Hardware</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Garden Center</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Appliances</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>Paint & Lumber</span>
                      </div>
                    </div>
                  </div>

                  {/* Clearance Only Toggle */}
                  <FormField
                    control={form.control}
                    name="clearanceOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-clearance-only"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            Clearance Items Only
                            <TooltipHelper content="When enabled, we'll only show items that are currently marked down with clearance pricing. This helps you find the best deals faster." />
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Focus on items with marked-down clearance prices (recommended for best deals)
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Information Box */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        What happens next?
                      </h4>
                      <TooltipHelper content="The scanning process typically takes 2-5 minutes depending on store size and network speed." />
                    </div>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• We'll scan all selected store locations simultaneously</li>
                      <li>• Results will appear in real-time as we find them</li>
                      <li>• You can filter by category, price, and discount after scanning</li>
                      <li>• Add items to your shopping list for easy store navigation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                type="submit" 
                size="lg"
                disabled={createScanMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-3 text-lg font-semibold shadow-lg"
                data-testid="button-start-scan"
              >
                {createScanMutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Starting Scan...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start Scanning Now
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}