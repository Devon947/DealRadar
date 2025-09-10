import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const subscriptionSchema = z.object({
  plan: z.enum(['pro', 'pro_annual', 'business', 'business_annual']),
  customerInfo: z.object({
    givenName: z.string().min(1, "First name is required"),
    familyName: z.string().min(1, "Last name is required"),
    emailAddress: z.string().email("Valid email is required").optional(),
    phoneNumber: z.string().optional()
  })
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

const SUBSCRIPTION_PLANS = {
  pro: { name: 'Pro Monthly', price: 9.99, description: '500 scans/month, 10 stores, email alerts' },
  pro_annual: { name: 'Pro Annual', price: 79.99, description: '500 scans/month, 10 stores, email alerts (33% savings)' },
  business: { name: 'Business Monthly', price: 24.99, description: 'Unlimited scans, all stores, phone support' },
  business_annual: { name: 'Business Annual', price: 199.99, description: 'Unlimited scans, all stores, phone support (33% savings)' }
};

interface SquarePaymentFormProps {
  onClose?: () => void;
  preSelectedPlan?: string;
}

export function SquarePaymentForm({ onClose, preSelectedPlan }: SquarePaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [mockPaymentToken] = useState(`tok_${Math.random().toString(36).substr(2, 9)}`);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      plan: (preSelectedPlan as any) || 'pro',
      customerInfo: {
        givenName: '',
        familyName: '',
        emailAddress: '',
        phoneNumber: ''
      }
    }
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData & { sourceId: string }) => {
      return await apiRequest(`/api/payments/subscription`, 'POST', data);
    },
    onSuccess: (result) => {
      toast({
        title: "Payment Successful!",
        description: `Your ${SUBSCRIPTION_PLANS[form.getValues('plan')].name} subscription is now active.`,
        variant: "default",
      });
      
      // Refresh user data to show new subscription
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      onClose?.();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "There was an issue processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: SubscriptionFormData) => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, you would use Square's Web Payments SDK
      // to tokenize the payment method and get a sourceId
      // For this demo, we're using a mock token
      await paymentMutation.mutateAsync({
        ...data,
        sourceId: mockPaymentToken
      });
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlan = form.watch('plan');
  const planDetails = SUBSCRIPTION_PLANS[selectedPlan];

  return (
    <Card className="w-full max-w-md mx-auto" data-testid="card-payment-form">
      <CardHeader>
        <CardTitle data-testid="text-payment-title">Subscribe to DealRadar</CardTitle>
        <CardDescription data-testid="text-payment-description">
          Unlock premium features with secure Square payment processing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subscription Plan</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-subscription-plan">
                        <SelectValue placeholder="Choose a plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                        <SelectItem key={key} value={key} data-testid={`option-plan-${key}`}>
                          {plan.name} - ${plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {planDetails && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg" data-testid="card-plan-details">
                <h4 className="font-medium text-blue-900 dark:text-blue-100" data-testid="text-plan-name">
                  {planDetails.name} - ${planDetails.price}/month
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300" data-testid="text-plan-description">
                  {planDetails.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerInfo.givenName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-first-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerInfo.familyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-last-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerInfo.emailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} data-testid="input-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerInfo.phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} data-testid="input-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mock Payment Method Section */}
            <div className="space-y-3">
              <h4 className="font-medium">Payment Method</h4>
              <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center" data-testid="text-mock-payment">
                  🔒 Mock Payment Integration
                  <br />
                  <span className="text-xs">Using simulated Square payment token for development</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isProcessing || paymentMutation.isPending}
                className="flex-1"
                data-testid="button-process-payment"
              >
                {isProcessing ? 'Processing...' : `Pay $${planDetails?.price}`}
              </Button>
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-payment"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}