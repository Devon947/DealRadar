import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { type ScanResult } from "@shared/schema";

interface ExportResultsProps {
  scanId: string;
  results: ScanResult[];
  scanTitle?: string;
}

export default function ExportResults({ scanId, results, scanTitle }: ExportResultsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToCsv = () => {
    setIsExporting(true);
    
    try {
      const headers = [
        "Product Name",
        "SKU", 
        "Original Price",
        "Clearance Price",
        "Savings %",
        "On Clearance",
        "Category",
        "Store Location",
        "Product URL"
      ];

      const csvData = results.map(result => [
        `"${result.productName.replace(/"/g, '""')}"`,
        result.sku,
        result.originalPrice || "",
        result.clearancePrice || "",
        result.savingsPercent || "",
        result.isOnClearance ? "Yes" : "No",
        result.category || "",
        result.storeLocation || "",
        result.productUrl || ""
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clearance-scan-${scanId}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${results.length} results to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results to CSV",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPdf = () => {
    setIsExporting(true);
    
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Popup blocked");
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Clearance Scan Results - ${scanTitle || scanId}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #f96302; padding-bottom: 10px; }
              .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f96302; color: white; }
              tr:nth-child(even) { background-color: #f2f2f2; }
              .clearance { background-color: #e8f5e8 !important; }
              .savings { font-weight: bold; color: #d32f2f; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Clearance Scan Results</h1>
            <div class="summary">
              <p><strong>Scan ID:</strong> ${scanId}</p>
              <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Total Results:</strong> ${results.length}</p>
              <p><strong>Clearance Items:</strong> ${results.filter(r => r.isOnClearance).length}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Original Price</th>
                  <th>Clearance Price</th>
                  <th>Savings</th>
                  <th>Category</th>
                  <th>Store</th>
                </tr>
              </thead>
              <tbody>
                ${results.map(result => `
                  <tr class="${result.isOnClearance ? 'clearance' : ''}">
                    <td>${result.productName}</td>
                    <td>${result.sku}</td>
                    <td>${result.originalPrice || 'N/A'}</td>
                    <td>${result.clearancePrice || 'N/A'}</td>
                    <td class="savings">${result.savingsPercent || 'N/A'}</td>
                    <td>${result.category || 'N/A'}</td>
                    <td>${result.storeLocation || 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast({
        title: "PDF Export Started",
        description: "Print dialog opened for PDF export",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results to PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} data-testid="button-export">
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Results"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCsv} data-testid="button-export-csv">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPdf} data-testid="button-export-pdf">
          <FileText className="w-4 h-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}