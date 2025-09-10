import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, Filter, Grid, List, Heart, Bell, Download, 
  Star, MapPin, Store, ShoppingCart, ExternalLink,
  SortAsc, SortDesc, TrendingDown, AlertCircle
} from "lucide-react";
import { useUser } from "@/contexts/user-context";

interface Deal {
  id: string;
  productName: string;
  sku: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  savings: number;
  store: string;
  storeLocation: string;
  category: string;
  inStock: boolean;
  clearance: boolean;
  image?: string;
  productUrl?: string;
}

export default function ResultsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("discount-desc");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStore, setFilterStore] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);

  // Real deals data will come from API
  const deals: Deal[] = [
    {
      id: "1",
      productName: "DeWalt 20V MAX Cordless Drill",
      sku: "DCD771C2",
      originalPrice: 199.00,
      salePrice: 119.40,
      discountPercent: 40,
      savings: 79.60,
      store: "Home Depot",
      storeLocation: "Main Street",
      category: "Tools",
      inStock: true,
      clearance: true,
      productUrl: "#"
    },
    {
      id: "2", 
      productName: "Ryobi 18V Circular Saw",
      sku: "P507",
      originalPrice: 89.97,
      salePrice: 53.98,
      discountPercent: 40,
      savings: 35.99,
      store: "Home Depot",
      storeLocation: "Downtown", 
      category: "Tools",
      inStock: true,
      clearance: true,
      productUrl: "#"
    },
    {
      id: "3",
      productName: "Weber Genesis II Gas Grill",
      sku: "E-335",
      originalPrice: 899.00,
      salePrice: 629.30,
      discountPercent: 30,
      savings: 269.70,
      store: "Home Depot",
      storeLocation: "Westside",
      category: "Outdoor",
      inStock: false,
      clearance: true,
      productUrl: "#"
    },
    {
      id: "4",
      productName: "Behr Premium Paint 1-Gallon",
      sku: "P38030",
      originalPrice: 54.98,
      salePrice: 38.49,
      discountPercent: 30,
      savings: 16.49,
      store: "Home Depot",
      storeLocation: "Main Street",
      category: "Paint",
      inStock: true,
      clearance: true,
      productUrl: "#"
    },
    {
      id: "5",
      productName: "Milwaukee M18 Impact Driver",
      sku: "2853-20",
      originalPrice: 149.00,
      salePrice: 104.30,
      discountPercent: 30,
      savings: 44.70,
      store: "Home Depot",
      storeLocation: "Northgate",
      category: "Tools",
      inStock: true,
      clearance: true,
      productUrl: "#"
    },
    {
      id: "6",
      productName: "Scott's Turf Builder Fertilizer",
      sku: "22305",
      originalPrice: 47.98,
      salePrice: 28.79,
      discountPercent: 40,
      savings: 19.19,
      store: "Home Depot",
      storeLocation: "Southpark",
      category: "Garden",
      inStock: true,
      clearance: false,
      productUrl: "#"
    }
  ];

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         deal.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || deal.category === filterCategory;
    const matchesStore = filterStore === "all" || deal.storeLocation === filterStore;
    return matchesSearch && matchesCategory && matchesStore;
  });

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    switch (sortBy) {
      case "discount-desc":
        return b.discountPercent - a.discountPercent;
      case "discount-asc":
        return a.discountPercent - b.discountPercent;
      case "savings-desc":
        return b.savings - a.savings;
      case "savings-asc":
        return a.savings - b.savings;
      case "price-asc":
        return a.salePrice - b.salePrice;
      case "price-desc":
        return b.salePrice - a.salePrice;
      case "name-asc":
        return a.productName.localeCompare(b.productName);
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(deals.map(deal => deal.category)));
  const stores = Array.from(new Set(deals.map(deal => deal.storeLocation)));

  const totalSavings = sortedDeals.reduce((sum, deal) => sum + deal.savings, 0);
  const clearanceCount = sortedDeals.filter(deal => deal.clearance).length;
  const inStockCount = sortedDeals.filter(deal => deal.inStock).length;

  const toggleDealSelection = (dealId: string) => {
    setSelectedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const DealCard = ({ deal }: { deal: Deal }) => (
    <Card className={`relative hover:shadow-lg transition-all duration-300 ${
      selectedDeals.includes(deal.id) ? 'ring-2 ring-blue-600' : ''
    }`}>
      {/* Clearance Badge */}
      {deal.clearance && (
        <div className="absolute top-3 left-3 z-10">
          <Badge className="bg-red-600 text-white">
            <TrendingDown className="w-3 h-3 mr-1" />
            Clearance
          </Badge>
        </div>
      )}

      {/* Discount Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className="bg-green-600 text-white font-bold">
          {deal.discountPercent}% OFF
        </Badge>
      </div>

      <CardHeader className="pb-4">
        {/* Product Image Placeholder */}
        <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
          <Store className="w-8 h-8 text-gray-400" />
        </div>

        <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem]">
          {deal.productName}
        </CardTitle>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span>{deal.store} - {deal.storeLocation}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Pricing */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Was</span>
              <span className="text-sm line-through text-muted-foreground">
                ${deal.originalPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Now</span>
              <span className="text-lg font-bold text-blue-600">
                ${deal.salePrice.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Save</span>
              <span className="text-sm font-semibold text-green-600">
                ${deal.savings.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${deal.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-xs ${deal.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {deal.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Category */}
          <Badge variant="outline" className="text-xs">
            {deal.category}
          </Badge>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleDealSelection(deal.id)}
              className="flex-1"
              data-testid={`button-select-deal-${deal.id}`}
            >
              <Heart className={`w-3 h-3 mr-1 ${selectedDeals.includes(deal.id) ? 'fill-red-500 text-red-500' : ''}`} />
              {selectedDeals.includes(deal.id) ? 'Added' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-testid={`button-alert-deal-${deal.id}`}
            >
              <Bell className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              data-testid={`button-view-deal-${deal.id}`}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DealRow = ({ deal }: { deal: Deal }) => (
    <Card className={`hover:shadow-md transition-all duration-200 ${
      selectedDeals.includes(deal.id) ? 'ring-2 ring-blue-600' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
            <Store className="w-6 h-6 text-gray-400" />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{deal.productName}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span>{deal.store} - {deal.storeLocation}</span>
              {deal.clearance && (
                <Badge className="bg-red-600 text-white text-xs">Clearance</Badge>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="text-right flex-shrink-0">
            <div className="text-sm line-through text-muted-foreground">
              ${deal.originalPrice.toFixed(2)}
            </div>
            <div className="text-lg font-bold text-blue-600">
              ${deal.salePrice.toFixed(2)}
            </div>
            <div className="text-xs text-green-600">
              Save ${deal.savings.toFixed(2)}
            </div>
          </div>

          {/* Discount */}
          <div className="flex-shrink-0">
            <Badge className="bg-green-600 text-white font-bold">
              {deal.discountPercent}% OFF
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleDealSelection(deal.id)}
            >
              <Heart className={`w-3 h-3 ${selectedDeals.includes(deal.id) ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="sm" variant="outline">
              <Bell className="w-3 h-3" />
            </Button>
            <Button size="sm" variant="outline">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scan Results</h1>
              <p className="text-muted-foreground">
                Found {sortedDeals.length} deals from your scan
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-grid-view"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-list-view"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{sortedDeals.length}</div>
                    <div className="text-xs text-muted-foreground">Total Deals</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{clearanceCount}</div>
                    <div className="text-xs text-muted-foreground">Clearance Items</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{inStockCount}</div>
                    <div className="text-xs text-muted-foreground">In Stock</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-600">${totalSavings.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Total Savings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-deals"
                />
              </div>

              {/* Category Filter */}
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Store Filter */}
              <Select value={filterStore} onValueChange={setFilterStore}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {stores.map(store => (
                    <SelectItem key={store} value={store}>{store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount-desc">Highest Discount</SelectItem>
                  <SelectItem value="discount-asc">Lowest Discount</SelectItem>
                  <SelectItem value="savings-desc">Highest Savings</SelectItem>
                  <SelectItem value="savings-asc">Lowest Savings</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </div>
        </div>

        {/* Results */}
        {sortedDeals.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No deals found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {sortedDeals.map(deal => 
              viewMode === "grid" ? (
                <DealCard key={deal.id} deal={deal} />
              ) : (
                <DealRow key={deal.id} deal={deal} />
              )
            )}
          </div>
        )}

        {/* Selected Deals Actions */}
        {selectedDeals.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border p-4 min-w-80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedDeals.length} deals selected
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Add to List
                </Button>
                <Button size="sm" variant="outline">
                  Set Alerts
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Save All
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}