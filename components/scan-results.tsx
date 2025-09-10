import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type ScanResult } from "@shared/schema";
import { Download, Bookmark, ChevronLeft, ChevronRight, Hammer, Wrench, Sprout, Zap, Paintbrush, TrendingDown } from "lucide-react";
import TooltipHelper from "./tooltip-helper";

interface ScanResultsProps {
  scanId: string;
}

export default function ScanResults({ scanId }: ScanResultsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("savings-desc");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery<{ results: ScanResult[]; total: number }>({
    queryKey: ["/api/scans", scanId, "results", {
      search: searchQuery,
      store: storeFilter,
      category: categoryFilter,
      sortBy,
      page: currentPage,
      limit: 10,
    }],
  });

  const results = data?.results || [];
  const total = data?.total || 0;
  const clearanceCount = results.filter(r => r.isOnClearance).length;

  const totalPages = Math.ceil(total / 10);
  const startIndex = (currentPage - 1) * 10 + 1;
  const endIndex = Math.min(currentPage * 10, total);

  const getProductIcon = (category?: string) => {
    switch (category) {
      case "tools":
        return <Hammer className="w-4 h-4 text-muted-foreground" />;
      case "hardware":
        return <Wrench className="w-4 h-4 text-muted-foreground" />;
      case "garden":
        return <Sprout className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Zap className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="results-fade-in">
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                Scan Results
                <TooltipHelper content="Results are sorted by discount percentage by default. Use the filters below to find specific items or categories." />
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <p className="text-muted-foreground">
                  <span data-testid="text-total-results" className="font-semibold text-blue-600">{total}</span> products found • 
                  <span data-testid="text-clearance-count" className="text-accent font-semibold">{clearanceCount} on clearance</span>
                </p>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Live pricing
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" data-testid="button-export-results">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" data-testid="button-save-scan">
                <Bookmark className="w-4 h-4 mr-2" />
                Save Scan
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="resultsSearch" className="text-sm font-medium">Search:</Label>
              <Input
                id="resultsSearch"
                placeholder="Product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
                data-testid="input-search-results"
              />
            </div>
            
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-40" data-testid="select-store-filter">
                <SelectValue placeholder="All stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stores</SelectItem>
                <SelectItem value="Store #0001">Store #0001</SelectItem>
                <SelectItem value="Store #0002">Store #0002</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40" data-testid="select-category-filter">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="clearance">Clearance only</SelectItem>
                <SelectItem value="tools">Tools</SelectItem>
                <SelectItem value="hardware">Hardware</SelectItem>
                <SelectItem value="garden">Garden</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40" data-testid="select-sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="savings-desc">Highest Savings</SelectItem>
                <SelectItem value="price-asc">Lowest Price</SelectItem>
                <SelectItem value="name-asc">Product Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Original
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Clearance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {results.map((result) => (
                <tr key={result.id} className="hover:bg-muted/50 transition-colors" data-testid={`row-product-${result.id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                        {getProductIcon(result.category || undefined)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground" data-testid={`text-product-name-${result.id}`}>
                          {result.productName}
                        </div>
                        <div className="text-xs text-muted-foreground md:hidden" data-testid={`text-mobile-sku-${result.id}`}>
                          SKU: {result.sku}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell" data-testid={`text-sku-${result.id}`}>
                    {result.sku}
                  </td>
                  <td className="px-6 py-4">
                    {result.originalPrice ? (
                      <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${result.id}`}>
                        ${parseFloat(result.originalPrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {result.isPriceSuppressed ? (
                      <span className="text-sm font-medium text-destructive" data-testid={`text-price-suppressed-${result.id}`}>
                        PRICE_SUPPRESSED
                      </span>
                    ) : result.clearancePrice ? (
                      <span className="text-sm font-medium text-accent" data-testid={`text-clearance-price-${result.id}`}>
                        ${parseFloat(result.clearancePrice).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {result.savingsPercent ? (
                      <Badge variant="secondary" className="bg-accent/10 text-accent" data-testid={`badge-savings-${result.id}`}>
                        {result.savingsPercent}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Unknown
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell" data-testid={`text-store-location-${result.id}`}>
                    {result.storeLocation}
                    {/* In-store badge for Home Depot items */}
                    {result.purchaseInStore && result.storeName && (
                      <div className="mt-1">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                          In-store clearance — available at {result.storeName}
                        </Badge>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {result.productUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(result.productUrl, '_blank')}
                          data-testid={`button-view-product-${result.id}`}
                        >
                          {result.purchaseInStore ? "Check Item Details" : "View Deal"}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" data-testid={`button-save-product-${result.id}`}>
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-muted-foreground text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No clearance items found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or expanding your search radius.
            </p>
          </div>
        )}

        {total > 10 && (
          <div className="px-6 py-4 bg-muted border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
                Showing {startIndex} to {endIndex} of {total} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-previous-page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      data-testid={`button-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
