import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Scan } from "@shared/schema";
import { ChevronRight, Store, Calendar } from "lucide-react";
import { Link } from "wouter";

interface RecentScansProps {
  onScanSelected: (scan: Scan) => void;
}

export default function RecentScans({ onScanSelected }: RecentScansProps) {
  const { data: scans = [], isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const scanDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const getStoreName = (storeId: string) => {
    return storeId.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Recent Scans</h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 border border-border rounded-md">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Recent Scans</h3>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No previous scans found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Recent Scans</h3>
        <div className="space-y-3">
          {scans.slice(0, 5).map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => scan.status === "completed" && onScanSelected(scan)}
              data-testid={`card-recent-scan-${scan.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Store className="w-4 h-4" />
                  {getStoreName(scan.storeId)} - {scan.zipCode} Area
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-4 mt-1">
                  <span data-testid={`text-scan-time-${scan.id}`}>
                    {formatTimeAgo(scan.createdAt)}
                  </span>
                  {scan.status === "completed" && (
                    <span data-testid={`text-scan-clearance-count-${scan.id}`}>
                      {scan.clearanceCount} clearance items
                    </span>
                  )}
                  <span className={`capitalize ${scan.status === "completed" ? "text-accent" : scan.status === "failed" ? "text-destructive" : "text-primary"}`}>
                    {scan.status}
                  </span>
                </div>
              </div>
              {scan.status === "completed" && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
        
        {scans.length > 5 && (
          <Link href="/history">
            <Button variant="ghost" className="w-full mt-4" data-testid="button-view-all-scans">
              View all scan history <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
