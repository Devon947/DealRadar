import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { type Scan } from "@shared/schema";

interface ScanProgressProps {
  scan: Scan;
  onScanCompleted: (scan: Scan) => void;
}

export default function ScanProgress({ scan, onScanCompleted }: ScanProgressProps) {
  const { data: updatedScan } = useQuery<Scan>({
    queryKey: ["/api/scans", scan.id],
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: scan.status === "pending" || scan.status === "running",
  });

  useEffect(() => {
    if (updatedScan && (updatedScan.status === "completed" || updatedScan.status === "failed")) {
      onScanCompleted(updatedScan);
    }
  }, [updatedScan, onScanCompleted]);

  const currentScan = updatedScan || scan;
  const progressMessages = {
    pending: "Initializing scan...",
    running: "Scanning for clearance items...",
    completed: "Scan completed!",
    failed: "Scan failed",
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {progressMessages[currentScan.status as keyof typeof progressMessages]}
          </h3>
          <p className="text-muted-foreground mb-4">
            This may take a few minutes depending on the number of products.
          </p>
          <div className="w-full bg-muted rounded-full h-2 mb-2">
            <div className="scan-progress rounded-full h-2"></div>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-progress-status">
            {currentScan.status === "running" ? "Checking store inventory..." : progressMessages[currentScan.status as keyof typeof progressMessages]}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
