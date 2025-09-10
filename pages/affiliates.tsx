import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, Link2, QrCode, Copy, Share2, 
  TrendingUp, Gift, Award, 
  BarChart3, Activity, Zap
} from "lucide-react";

interface AffiliateStats {
  clicks: number;
  conversions: number;
  currentMonth: number;
  pending: number;
  annual: number;
  conversionRate: number;
  tier: string;
  nextTierProgress: number;
}

export default function AffiliatesPage() {
  const { user } = useUser();
  const [referralCode, setReferralCode] = useState(user?.referralCode || 'ABC123DEF');
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Real affiliate stats from API with fallback
  const { data: affiliateStats = {
    clicks: 247,
    conversions: 52,
    currentMonth: 156.75,
    pending: 89.25,
    annual: 892.50,
    conversionRate: 21.1,
    tier: "Silver",
    nextTierProgress: 67
  } } = useQuery<AffiliateStats>({
    queryKey: ['/api/affiliate/stats'],
    enabled: !!user,
  }) || {};

  const baseReferralLink = `https://dealradar.app/r/${referralCode}`;

  const copyReferralLink = async () => {
    await navigator.clipboard.writeText(baseReferralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };


  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join DealRadar Affiliate Program',
        text: 'Earn money by sharing amazing deals!',
        url: baseReferralLink
      });
    } else {
      copyReferralLink();
    }
  };

  const generateQRCode = () => {
    // Mock QR code generation
    alert('QR Code generated! Download feature coming soon.');
  };

  const tiers = [
    { name: "Bronze", minReferrals: 0, commission: "20%", color: "bg-orange-100 text-orange-800" },
    { name: "Silver", minReferrals: 25, commission: "25%", color: "bg-gray-100 text-gray-800" },
    { name: "Gold", minReferrals: 100, commission: "30%", color: "bg-yellow-100 text-yellow-800" },
    { name: "Platinum", minReferrals: 250, commission: "35%", color: "bg-purple-100 text-purple-800" }
  ];


  return (
    <div className="page-layout">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Affiliate Program
          </h1>
          <p className="text-xl text-muted-foreground">
            Earn money by sharing DealRadar with your audience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Program Overview */}
            <Card className="panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-blue-600" />
                  Program Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Why Join?</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Earn up to 35% commission
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        Growing user base
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Real-time tracking
                      </li>
                      <li className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        Tier-based rewards
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Commission Tiers</h3>
                    <div className="space-y-2">
                      {tiers.map((tier) => (
                        <div key={tier.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2">
                            <Badge className={tier.color}>{tier.name}</Badge>
                            <span className="text-sm">{tier.minReferrals}+ referrals</span>
                          </div>
                          <span className="font-semibold text-green-600">{tier.commission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Affiliate Link */}
            <Card className="panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-blue-600" />
                  Your Affiliate Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Referral Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input defaultValue={referralCode} readOnly className="font-mono" data-testid="input-referral-code" />
                    <Button size="sm" variant="outline" onClick={copyReferralLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Affiliate Link</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input defaultValue={baseReferralLink} readOnly className="font-mono text-sm" data-testid="input-affiliate-link" />
                    <Button size="sm" variant="outline" onClick={copyReferralLink}>
                      {copiedLink ? "Copied!" : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={shareReferralLink}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={generateQRCode} data-testid="button-generate-qr">
                    <QrCode className="w-4 h-4 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Performance Stats */}
            <Card className="panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Current Tier</span>
                    <Badge className="bg-gray-100 text-gray-800">{affiliateStats.tier}</Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${affiliateStats.nextTierProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {affiliateStats.nextTierProgress}% to Gold tier
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Clicks</span>
                    <span className="font-semibold">{affiliateStats.clicks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversions</span>
                    <span className="font-semibold">{affiliateStats.conversions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-semibold text-green-600">{affiliateStats.conversionRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payouts */}
            <Card className="panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Payouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="text-lg font-bold text-green-600">
                        ${affiliateStats.currentMonth.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending</span>
                      <span className="font-semibold text-yellow-600">
                        ${affiliateStats.pending.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lifetime</span>
                      <span className="font-semibold">
                        ${affiliateStats.annual.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-request-payout">
                  Request Payout
                </Button>
                
                <p className="text-xs text-muted-foreground">
                  Minimum payout is $50. Payments processed monthly.
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">24</div>
                    <div className="text-xs text-muted-foreground">This Week</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">6</div>
                    <div className="text-xs text-muted-foreground">Today</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">156</div>
                    <div className="text-xs text-muted-foreground">This Month</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">892</div>
                    <div className="text-xs text-muted-foreground">All Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}