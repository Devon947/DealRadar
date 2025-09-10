import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/app-header";
import ScanProgress from "@/components/scan-progress";
import ScanResults from "@/components/scan-results";
import ExportResults from "@/components/export-results";
import { ArrowLeft, Home } from "lucide-react";
import { type Scan } from "@shared/schema";

export default function ScanResultsPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const scanId = params?.scanId as string;

  const { data: scan, isLoading } = useQuery<Scan>({
    queryKey: ["/api/scans", scanId],
    refetchInterval: (query) => {
      const scanData = query.state.data;
      return (scanData?.status === "pending" || scanData?.status === "running") ? 2000 : false;
    },
    enabled: !!scanId,
  });

  const handleBackToStores = () => {
    setLocation("/");
  };

  const handleNewScan = () => {
    if (scan?.storeId) {
      setLocation(`/scan-setup/${scan.storeId}`);
    } else {
      setLocation("/");
    }
  };

  if (isLoading || !scan) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-foreground">Loading scan details...</h2>
          </div>
        </main>
      </div>
    );
  }

  const isComplete = scan.status === "completed";
  const isFailed = scan.status === "failed";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBackToStores} className="mb-4" data-testid="button-back-stores">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store Selection
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isComplete && "Scan Complete!"}
                {isFailed && "Scan Failed"}
                {!isComplete && !isFailed && "Scanning in Progress"}
              </h1>
              <p className="text-muted-foreground">
                Scan ID: <span className="font-mono text-sm">{scan.id}</span>
              </p>
              <p className="text-muted-foreground">
                Store: {scan.storeId} • Coverage: {scan.storeCount} store{scan.storeCount !== "1" ? "s" : ""}
              </p>
            </div>
            
            {isComplete && (
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleNewScan} data-testid="button-new-scan">
                  New Scan
                </Button>
                <Button onClick={handleBackToStores} data-testid="button-home">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Show progress if scan is still running */}
        {(scan.status === "pending" || scan.status === "running") && (
          <ScanProgress 
            scan={scan} 
            onScanCompleted={() => {
              // The scan data will be automatically updated via the query refetch
              // No additional action needed here
            }} 
          />
        )}

        {/* Show failure message */}
        {isFailed && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 text-destructive">❌</div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Scan Failed</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We encountered an issue while scanning for clearance items. This could be due to network connectivity or store website changes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleNewScan} data-testid="button-retry-scan">
                Try Again
              </Button>
              <Button variant="outline" onClick={handleBackToStores}>
                Choose Different Store
              </Button>
            </div>
          </div>
        )}

        {/* Show results if scan is complete */}
        {isComplete && (
          <div>
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-foreground" data-testid="text-total-results">
                    {scan.resultCount || "0"}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Products</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent" data-testid="text-clearance-results">
                    {scan.clearanceCount || "0"}
                  </div>
                  <div className="text-sm text-muted-foreground">On Clearance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {scan.storeCount || "1"}
                  </div>
                  <div className="text-sm text-muted-foreground">Stores Scanned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {scan.storeId}
                  </div>
                  <div className="text-sm text-muted-foreground">Store Type</div>
                </div>
              </div>
            </div>

            <ScanResults scanId={scan.id} />
          </div>
        )}

        {/* Show empty state for very new scans */}
        {!isComplete && !isFailed && scan.status !== "pending" && scan.status !== "running" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 text-muted-foreground">⏳</div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Preparing Scan</h3>
            <p className="text-muted-foreground">
              Your scan is being prepared. This should only take a moment.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}