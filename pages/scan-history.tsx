import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Calendar, Store, BarChart3, TrendingUp, Activity } from "lucide-react";
import { type Scan } from "@shared/schema";

export default function ScanHistory() {
  const { data: scans = [], isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-accent";
      case "running":
        return "text-primary";
      case "failed":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "fas fa-check-circle";
      case "running":
        return "fas fa-spinner fa-spin";
      case "failed":
        return "fas fa-exclamation-circle";
      default:
        return "fas fa-clock";
    }
  };

  // Mock analytics data
  const analytics = {
    totalScans: 24,
    successRate: 91.7,
    avgSavings: 127.50,
    topStore: "Home Depot"
  };

  return (
    <div className="page-layout">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Dashboard Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">Scan History & Analytics</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="panel">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{analytics.totalScans}</div>
                    <div className="text-sm text-muted-foreground">Total Scans</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="panel">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{analytics.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="panel">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">${analytics.avgSavings}</div>
                    <div className="text-sm text-muted-foreground">Avg. Savings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="panel">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{analytics.topStore}</div>
                    <div className="text-sm text-muted-foreground">Top Store</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scanner
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-foreground">Scan History</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your previous clearance scans
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : scans.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No scans yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first clearance scan to see results here.
              </p>
              <Link href="/">
                <Button data-testid="button-start-first-scan">
                  Start Your First Scan
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scans.map((scan) => (
              <Card key={scan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      {scan.storeId.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </CardTitle>
                    <div className={`flex items-center gap-2 ${getStatusColor(scan.status)}`}>
                      <i className={getStatusIcon(scan.status)}></i>
                      <span className="text-sm font-medium capitalize">{scan.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Scan Date</div>
                      <div className="font-medium flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(scan.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Results Found</div>
                      <div className="font-medium">{scan.resultCount} products</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Clearance Items</div>
                      <div className="font-medium text-accent">{scan.clearanceCount} on sale</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span>Store Coverage: {scan.storeCount} store{scan.storeCount !== "1" ? "s" : ""}</span>
                    <span>•</span>
                    <span>
                      {scan.productSelection === "all" ? "All products" : `${scan.specificSkus?.length || 0} specific SKUs`}
                    </span>
                    {scan.clearanceOnly && (
                      <>
                        <span>•</span>
                        <span className="text-accent">Clearance only</span>
                      </>
                    )}
                  </div>

                  {scan.status === "completed" && (
                    <Link href={`/?scan=${scan.id}`}>
                      <Button variant="outline" size="sm" data-testid={`button-view-results-${scan.id}`}>
                        View Results
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
