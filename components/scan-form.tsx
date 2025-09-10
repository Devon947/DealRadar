import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createScanRequestSchema, type CreateScanRequest, type Store, type Scan } from "@shared/schema";
import { Search } from "lucide-react";

interface ScanFormProps {
  onScanStarted: (scan: Scan) => void;
}

export default function ScanForm({ onScanStarted }: ScanFormProps) {
  const { toast } = useToast();
  
  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  const form = useForm<CreateScanRequest>({
    resolver: zodResolver(createScanRequestSchema),
    defaultValues: {
      storeId: "",
      zipCode: "",
      radius: "10",
      productSelection: "all",
      specificSkus: [],
      clearanceOnly: true,
      category: "",
      priceRange: "",
    },
  });

  const createScanMutation = useMutation({
    mutationFn: async (data: CreateScanRequest) => {
      const response = await apiRequest("POST", "/api/scans", data);
      return response.json();
    },
    onSuccess: (scan: Scan) => {
      onScanStarted(scan);
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      toast({
        title: "Scan Started",
        description: "Your clearance scan has been initiated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scan Failed",
        description: error.message || "Failed to start scan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateScanRequest) => {
    createScanMutation.mutate(data);
  };

  const productSelection = form.watch("productSelection");

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <h2 className="text-2xl font-semibold text-foreground mb-6">Configure Your Clearance Scan</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Store</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-store">
                          <SelectValue placeholder="Choose a store..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="lowes" disabled>
                          Lowe's (Coming Soon)
                        </SelectItem>
                        <SelectItem value="ace" disabled>
                          Ace Hardware (Coming Soon)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Location</Label>
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="12345"
                            maxLength={5}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                              field.onChange(value);
                            }}
                            data-testid="input-zipcode"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="radius"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-24" data-testid="select-radius">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 mi</SelectItem>
                            <SelectItem value="10">10 mi</SelectItem>
                            <SelectItem value="25">25 mi</SelectItem>
                            <SelectItem value="50">50 mi</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="productSelection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Selection</FormLabel>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="all" data-testid="radio-all-products" />
                        <Label htmlFor="all">Scan all available products</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="specific" id="specific" data-testid="radio-specific-skus" />
                        <Label htmlFor="specific">Specific SKUs only</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {productSelection === "specific" && (
              <FormField
                control={form.control}
                name="specificSkus"
                render={({ field }) => (
                  <FormItem className="ml-6">
                    <FormControl>
                      <Textarea
                        placeholder="Enter SKU numbers, one per line..."
                        className="h-24 resize-none"
                        value={field.value?.join("\n") || ""}
                        onChange={(e) => {
                          const skus = e.target.value.split("\n").filter(sku => sku.trim());
                          field.onChange(skus);
                        }}
                        data-testid="textarea-specific-skus"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Card className="bg-muted">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium text-foreground mb-4">Filters</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="clearanceOnly"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-clearance-only"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium">
                            Clearance items only
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="tools">Tools</SelectItem>
                            <SelectItem value="hardware">Hardware</SelectItem>
                            <SelectItem value="garden">Garden & Outdoor</SelectItem>
                            <SelectItem value="appliances">Appliances</SelectItem>
                            <SelectItem value="lumber">Lumber & Building</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Range</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-price-range">
                              <SelectValue placeholder="Any price" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0-25">$0 - $25</SelectItem>
                            <SelectItem value="25-50">$25 - $50</SelectItem>
                            <SelectItem value="50-100">$50 - $100</SelectItem>
                            <SelectItem value="100+">$100+</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={createScanMutation.isPending}
                data-testid="button-start-scan"
                className="px-8"
              >
                {createScanMutation.isPending ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    <span>Start Clearance Scan</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
