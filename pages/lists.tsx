import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Heart, Trash2, ShoppingCart, ExternalLink, Target, MapPin, SortAsc, Filter, Share2 } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/contexts/user-context";

interface SavedItem {
  id: string;
  userId: string;
  productId: string;
  storeId: string;
  aisle?: string;
  bay?: string;
  targetPrice?: string;
  notes?: string;
  addedAt: string;
  isCompleted: boolean;
  // Extended fields that would come from API joins
  productName?: string;
  currentPrice?: string;
  storeName?: string;
}

export default function Lists() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const [sortBy, setSortBy] = useState<string>(() => {
    return localStorage.getItem('lists-sort-preference') || 'most-recent';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Fetch real shopping list data from API
  const { data: savedItems = [], isLoading, error } = useQuery<SavedItem[]>({
    queryKey: ['/api/shopping-list', user?.id],
    enabled: !!user?.id,
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-muted-foreground mt-4">Loading your shopping lists...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading shopping lists. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if user not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Please sign in to view your shopping lists.</p>
            <Button onClick={() => setLocation('/auth')} className="mt-4">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Persist sort preference
  useEffect(() => {
    localStorage.setItem('lists-sort-preference', sortBy);
  }, [sortBy]);

  // Sort items based on preference
  const sortedItems = [...savedItems].sort((a, b) => {
    switch (sortBy) {
      case 'most-recent':
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case 'target-price-low':
        const priceA = parseFloat(a.targetPrice || '0');
        const priceB = parseFloat(b.targetPrice || '0');
        return priceA - priceB;
      case 'store-az':
        return (a.storeName || a.storeId).localeCompare(b.storeName || b.storeId);
      case 'completed':
        return b.isCompleted ? 1 : a.isCompleted ? -1 : 0;
      default:
        return 0;
    }
  });

  // Filter by category if needed (for future expansion)
  const filteredItems = sortedItems;

  // Show empty state if no items
  if (savedItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Lists</h1>
              <p className="text-muted-foreground mt-1">
                Save items to track prices and organize your shopping
              </p>
            </div>
            <Button onClick={() => setLocation('/scan')}>
              <Plus className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          </div>

          {/* Empty State */}
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items in your shopping lists yet</h3>
              <p className="text-muted-foreground mb-6">
                Start scanning stores to find deals and save items to your list
              </p>
              <Button onClick={() => setLocation('/scan')}>
                <Target className="w-4 h-4 mr-2" />
                Find Deals Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Lists</h1>
            <p className="text-muted-foreground mt-1">
              {savedItems.length} saved item{savedItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setLocation('/scan')} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Items
            </Button>
            <Button onClick={() => setLocation('/scan')}>
              <Target className="w-4 h-4 mr-2" />
              Find More Deals
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most-recent">Most Recent</SelectItem>
                <SelectItem value="target-price-low">Target Price (Low)</SelectItem>
                <SelectItem value="store-az">Store A-Z</SelectItem>
                <SelectItem value="completed">Completed First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {item.productName || `Product ${item.productId}`}
                      </h3>
                      {item.isCompleted && (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Store className="w-4 h-4" />
                        {item.storeName || item.storeId}
                      </div>
                      {item.aisle && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          Aisle {item.aisle}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(item.addedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      {item.targetPrice && (
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Target: ${parseFloat(item.targetPrice).toFixed(2)}</span>
                        </div>
                      )}
                      {item.currentPrice && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>Current: ${parseFloat(item.currentPrice).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Import missing icons
import { Clock, Store, CheckCircle, DollarSign } from "lucide-react";