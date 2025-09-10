import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, 
  SlidersHorizontal, 
  TrendingDown, 
  DollarSign, 
  Percent,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { type ScanResult } from "@shared/schema";

export interface FilterOptions {
  searchTerm: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  minDiscount: string;
  clearanceOnly: boolean;
  sortBy: string;
  priceRange: string;
}

interface EnhancedFiltersProps {
  results: ScanResult[];
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  className?: string;
}

export default function EnhancedFilters({ 
  results, 
  filters, 
  onFiltersChange, 
  className 
}: EnhancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get unique categories from results
  const categories = Array.from(new Set(results.map(r => r.category).filter(Boolean)));
  
  // Calculate price ranges
  const prices = results.map(r => parseFloat(r.clearancePrice?.toString() || "0")).filter(p => p > 0);
  const minPriceAvailable = Math.min(...prices) || 0;
  const maxPriceAvailable = Math.max(...prices) || 1000;

  const handleFilterChange = (key: keyof FilterOptions, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      searchTerm: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      minDiscount: "",
      clearanceOnly: true,
      sortBy: "discount-percent",
      priceRange: "",
    });
  };

  const activeFilterCount = Object.values(filters).filter(value => 
    value !== "" && value !== false && value !== "discount-percent"
  ).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Sorting
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Always visible: Search and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="search">Search Products</Label>
            <Input
              id="search"
              placeholder="Search by product name or SKU..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="sort">Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount-percent">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Highest Discount %
                  </div>
                </SelectItem>
                <SelectItem value="discount-amount">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Highest $ Savings
                  </div>
                </SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Product Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Expandable advanced filters */}
        {isExpanded && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category || ""}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label htmlFor="price-range">Quick Price Range</Label>
                  <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Price</SelectItem>
                      <SelectItem value="0-25">Under $25</SelectItem>
                      <SelectItem value="25-50">$25 - $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-250">$100 - $250</SelectItem>
                      <SelectItem value="250-500">$250 - $500</SelectItem>
                      <SelectItem value="500+">$500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum Discount */}
                <div>
                  <Label htmlFor="min-discount">Min Discount %</Label>
                  <Select value={filters.minDiscount} onValueChange={(value) => handleFilterChange("minDiscount", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Any Discount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any Discount</SelectItem>
                      <SelectItem value="10">10%+ Off</SelectItem>
                      <SelectItem value="25">25%+ Off</SelectItem>
                      <SelectItem value="50">50%+ Off</SelectItem>
                      <SelectItem value="75">75%+ Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Price Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-price">Custom Min Price</Label>
                  <Input
                    id="min-price"
                    type="number"
                    placeholder={`Min $${minPriceAvailable.toFixed(0)}`}
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-price">Custom Max Price</Label>
                  <Input
                    id="max-price"
                    type="number"
                    placeholder={`Max $${maxPriceAvailable.toFixed(0)}`}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Clearance Only Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="clearance-only"
                  checked={filters.clearanceOnly}
                  onCheckedChange={(checked) => handleFilterChange("clearanceOnly", !!checked)}
                />
                <Label htmlFor="clearance-only" className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  Show clearance items only
                </Label>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}