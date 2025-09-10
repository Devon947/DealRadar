import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Crown, 
  DollarSign, 
  Users, 
  Share2, 
  Copy,
  Lock,
  TrendingUp
} from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useLocation } from "wouter";
import { useTitle } from "@/hooks/use-title";

export default function ProfilePage() {
  useTitle("Your Profile & Earnings - Manage Account Settings | DealRadar");
  
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState("");
  const [showZipLockModal, setShowZipLockModal] = useState(false);

  // Generate referral link based on user referral code
  const generateReferralLink = () => {
    const baseUrl = window.location.origin;
    const refCode = user?.referralCode || "demo123";
    const link = `${baseUrl}?ref=${refCode}`;
    setReferralLink(link);
    return link;
  };

  const copyReferralLink = () => {
    const link = generateReferralLink();
    navigator.clipboard.writeText(link);
    toast({
      title: "Referral Link Copied!",
      description: "Share this link to earn 30% commission on all referrals",
    });
  };

  const shareReferralLink = () => {
    const link = generateReferralLink();
    if (navigator.share) {
      navigator.share({
        title: "Join DealRadar",
        text: "Find amazing deals at your favorite stores!",
        url: link,
      });
    } else {
      copyReferralLink();
    }
  };

  // Mock referral data - in real app this would come from backend
  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 234.56,
    thisMonthEarnings: 67.80,
    pendingEarnings: 45.20
  };

  const planNames = {
    free: "Free Explorer",
    basic: "Pro Hunter", 
    premium: "Business Elite"
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Profile & Account
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage your account, view your referral earnings, and track your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Account Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Username</Label>
                    <p className="text-lg font-medium" data-testid="text-username">{user?.username || "User"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                    <p className="text-lg font-medium" data-testid="text-email">{user?.email || "Contact support for email info"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ZIP Code</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium" data-testid="text-zip-code">{user?.zipCode}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowZipLockModal(true)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                        data-testid="button-zip-lock"
                      >
                        <Lock className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                    <p className="text-lg font-medium" data-testid="text-member-since">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Current Plan</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Crown className="w-4 h-4 text-blue-600" />
                      <p className="text-lg font-medium">
                        {planNames[user?.subscriptionPlan as keyof typeof planNames] || "Free Explorer"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/subscription")}
                    data-testid="button-manage-subscription"
                  >
                    Manage Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Referral Program - Simplified */}
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Earn 30% Commission
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Share your link and earn commission on all paid referrals
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    defaultValue={referralLink || generateReferralLink()}
                    readOnly
                    className="flex-1 font-mono text-sm"
                    data-testid="input-referral-link"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyReferralLink}
                    data-testid="button-copy-referral"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Referrals: <strong>{referralStats.totalReferrals}</strong></span>
                  <span>Earned: <strong>${referralStats.totalEarnings.toFixed(2)}</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                    {planNames[user?.subscriptionPlan as keyof typeof planNames] || "Free Explorer"}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {user?.subscriptionPlan === "premium" ? "Unlimited scans" : 
                     user?.subscriptionPlan === "basic" ? "50 scans/month" : 
                     "3 scans/month"}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setLocation("/subscription")}
                    data-testid="button-upgrade-plan"
                  >
                    {user?.subscriptionPlan === "premium" ? "Manage Plan" : "Upgrade Plan"}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>

      {/* ZIP Code Lock Modal */}
      <Dialog open={showZipLockModal} onOpenChange={setShowZipLockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              ZIP Code Security
            </DialogTitle>
            <DialogDescription>
              For security purposes, ZIP code changes must be done through our support team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To protect your account and prevent unauthorized changes to your location settings, 
              please contact our support team to update your ZIP code.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => {
                  window.open('mailto:support@dealradar.com?subject=ZIP Code Change Request', '_blank');
                  setShowZipLockModal(false);
                }}
                className="w-full"
              >
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowZipLockModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}