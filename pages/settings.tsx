import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Trash2, Moon, Sun } from "lucide-react";
import { useUser } from "@/contexts/user-context";

export default function Settings() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    priceAlerts: true,
    weeklyDigest: true
  });


  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your deal hunting experience
          </p>
        </div>

        <div className="space-y-8">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Account Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    defaultValue={user?.username || ""} 
                    placeholder="Enter username"
                    data-testid="input-username"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ""} 
                    placeholder="Enter email address"
                    data-testid="input-email"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Subscription Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Current plan: {user?.subscriptionPlan || "Free"}
                  </p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {user?.subscriptionPlan || "free"}
                </Badge>
              </div>

              <Button data-testid="button-save-account">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch 
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                  data-testid="switch-email-notifications"
                />
              </div>

              <Separator />


              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Price Drop Alerts</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get notified when prices reach your targets
                  </p>
                </div>
                <Switch 
                  checked={notifications.priceAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, priceAlerts: checked})}
                  data-testid="switch-price-alerts"
                />
              </div>

              <Separator />

            </CardContent>
          </Card>



          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start" data-testid="button-change-password">
                Change Password
              </Button>
              
              <Separator />

              <Button variant="destructive" className="w-full justify-start" data-testid="button-delete-account">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>

          {/* Save All Changes */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" data-testid="button-reset-settings">
              Reset to Defaults
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              data-testid="button-save-all-settings"
            >
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}