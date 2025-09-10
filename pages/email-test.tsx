import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useTitle } from "@/hooks/use-title";

export default function EmailTest() {
  useTitle("Email Test - DealRadar");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Test SendPulse connection
  const connectionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/email/test");
    },
    onSuccess: (data) => {
      setIsConnected(data.success);
      toast({
        title: data.success ? "✅ Connection Successful" : "❌ Connection Failed",
        description: data.success 
          ? "SendPulse integration is working correctly!" 
          : data.error || "Failed to connect to SendPulse",
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      setIsConnected(false);
      toast({
        title: "❌ Connection Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Send welcome email
  const welcomeEmailMutation = useMutation({
    mutationFn: async () => {
      if (!email || !name) {
        throw new Error("Email and name are required");
      }
      return await apiRequest("/api/email/welcome", {
        method: "POST",
        body: { email, name },
      });
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "📧 Welcome Email Sent!" : "❌ Email Failed",
        description: data.success 
          ? `Welcome email sent successfully to ${email}` 
          : data.error || "Failed to send welcome email",
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Email Error",
        description: error instanceof Error ? error.message : "Failed to send email",
        variant: "destructive",
      });
    },
  });

  // Send deal alert test
  const dealAlertMutation = useMutation({
    mutationFn: async () => {
      if (!email || !name) {
        throw new Error("Email and name are required");
      }
      
      // Sample deal data for testing
      const sampleDeals = [
        {
          title: "DEWALT 20V MAX Cordless Drill",
          originalPrice: 149.99,
          salePrice: 89.99,
          discountPercent: 40,
          savings: 60.00
        },
        {
          title: "Ryobi ONE+ 18V Circular Saw",
          originalPrice: 99.99,
          salePrice: 59.99,
          discountPercent: 40,
          savings: 40.00
        }
      ];

      return await apiRequest("/api/email/deal-alert", {
        method: "POST",
        body: { 
          email, 
          name, 
          deals: sampleDeals, 
          storeName: "Home Depot" 
        },
      });
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "🎯 Deal Alert Sent!" : "❌ Email Failed",
        description: data.success 
          ? `Deal alert email sent successfully to ${email}` 
          : data.error || "Failed to send deal alert",
        variant: data.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Email Error",
        description: error instanceof Error ? error.message : "Failed to send deal alert",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = () => {
    connectionMutation.mutate();
  };

  const handleSendWelcomeEmail = () => {
    welcomeEmailMutation.mutate();
  };

  const handleSendDealAlert = () => {
    dealAlertMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Email System Test</h1>
          <p className="text-gray-600">Test SendPulse email integration and send sample emails</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Connection Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔌 Connection Test
              </CardTitle>
              <CardDescription>
                Test the connection to SendPulse API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span>SendPulse Status:</span>
                <span className={`font-semibold ${
                  isConnected === true ? 'text-green-600' : 
                  isConnected === false ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {isConnected === true ? '✅ Connected' : 
                   isConnected === false ? '❌ Failed' : '⏳ Unknown'}
                </span>
              </div>
              
              <Button 
                onClick={handleTestConnection}
                disabled={connectionMutation.isPending}
                className="w-full"
                data-testid="button-test-connection"
              >
                {connectionMutation.isPending ? "Testing..." : "Test Connection"}
              </Button>
            </CardContent>
          </Card>

          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚙️ Email Configuration
              </CardTitle>
              <CardDescription>
                Set recipient details for test emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="input-email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="input-name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Tests */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📬 Email Templates Test
              </CardTitle>
              <CardDescription>
                Send test emails using different templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button 
                  onClick={handleSendWelcomeEmail}
                  disabled={welcomeEmailMutation.isPending || !email || !name}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  data-testid="button-send-welcome"
                >
                  <span className="text-2xl">👋</span>
                  <span>{welcomeEmailMutation.isPending ? "Sending..." : "Send Welcome Email"}</span>
                </Button>

                <Button 
                  onClick={handleSendDealAlert}
                  disabled={dealAlertMutation.isPending || !email || !name}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  data-testid="button-send-deal-alert"
                >
                  <span className="text-2xl">🎯</span>
                  <span>{dealAlertMutation.isPending ? "Sending..." : "Send Deal Alert"}</span>
                </Button>
              </div>
              
              {(!email || !name) && (
                <p className="text-sm text-gray-500 mt-4 text-center">
                  Please enter both email and name to send test emails
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            💡 This page helps you test the SendPulse email integration.<br/>
            Make sure to check your email inbox and spam folder for test emails.
          </p>
        </div>
      </div>
    </div>
  );
}