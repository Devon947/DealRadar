import { useUser } from "@/contexts/user-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Crown, MapPin, History, TrendingUp, Target, Calendar } from "lucide-react";
import { type Scan } from "@shared/schema";

export default function UserDashboard() {
  const { user } = useUser();

  const { data: recentScans = [] } = useQuery<Scan[]>({
    queryKey: ["/api/user/scans"],
    enabled: !!user,
  });

  const planFeatures = {
    free: { stores: 1, name: "Free", color: "bg-gray-500" },
    basic: { stores: 10, name: "Basic", color: "bg-blue-500" },
    premium: { stores: 25, name: "Premium", color: "bg-purple-500" },
  };

  const currentPlan = planFeatures[user?.subscriptionPlan as keyof typeof planFeatures] || planFeatures.free;

  const stats = {
    totalScans: recentScans.length,
    clearanceFound: recentScans.reduce((acc, scan) => acc + parseInt(scan.clearanceCount || "0"), 0),
    avgSavings: recentScans.length > 0 ? "24%" : "0%", // Mock average
    thisMonth: recentScans.filter(scan => 
      new Date(scan.createdAt).getMonth() === new Date().getMonth()
    ).length
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Welcome back, {user?.username}!
            <Badge className={`${currentPlan.color} text-white`}>
              {currentPlan.name}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your ZIP Code</p>
                <p className="font-semibold">{user?.zipCode || "Not set"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Store Coverage</p>
                <p className="font-semibold">{currentPlan.stores} stores</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalScans}</div>
              <p className="text-sm text-muted-foreground">Total Scans</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.clearanceFound}</div>
              <p className="text-sm text-muted-foreground">Clearance Items Found</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.avgSavings}</div>
              <p className="text-sm text-muted-foreground">Avg. Savings</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.thisMonth}</div>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/">
              <Button className="w-full h-20 flex flex-col gap-2" data-testid="button-quick-scan">
                <Target className="w-6 h-6" />
                Start New Scan
              </Button>
            </Link>
            
            <Link href="/subscription">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2" data-testid="button-upgrade">
                <Crown className="w-6 h-6" />
                Manage Subscription
              </Button>
            </Link>
            
            <Link href="/history">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-2" data-testid="button-view-history">
                <History className="w-6 h-6" />
                View Scan History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.slice(0, 5).map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{scan.storeId.replace("-", " ")}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(scan.createdAt).toLocaleDateString()} • {scan.resultCount} items • {scan.clearanceCount} on clearance
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={scan.status === "completed" ? "default" : "secondary"}>
                      {scan.status}
                    </Badge>
                    {scan.status === "completed" && (
                      <Link href={`/scan-results/${scan.id}`}>
                        <Button size="sm" variant="outline" data-testid={`button-view-results-${scan.id}`}>
                          View Results
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No scans yet. Start your first scan to find deals!</p>
              <Link href="/">
                <Button className="mt-4" data-testid="button-start-first-scan">
                  Start Your First Scan
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}