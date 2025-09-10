import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Bell, BellOff, Settings, Target, MapPin, CheckCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";

interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  store: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string | null;
  status: "monitoring" | "triggered" | "paused";
}

export default function Alerts() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Price alerts feature coming soon - using empty array for now
  const alerts: PriceAlert[] = [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please sign in to view your price alerts.</p>
            <Button onClick={() => setLocation('/auth')} className="mt-4">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Price Alerts</h1>
            <p className="text-muted-foreground mt-1">
              Get notified when items drop to your target price
            </p>
          </div>
          <Button onClick={() => setLocation('/scan')}>
            <Plus className="w-4 h-4 mr-2" />
            Find Items to Track
          </Button>
        </div>

        {/* Coming Soon Notice */}
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Price Alerts Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              We're working on this feature to help you track price drops on your favorite items
            </p>
            <Button onClick={() => setLocation('/scan')}>
              <Target className="w-4 h-4 mr-2" />
              Start Scanning for Deals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}