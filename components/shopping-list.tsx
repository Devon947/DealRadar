import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  MapPin, 
  Heart, 
  Plus, 
  Trash2, 
  Check, 
  DollarSign,
  Store,
  Navigation
} from "lucide-react";
import { type ShoppingListItem, type StoreLocation } from "@shared/schema";

interface ShoppingListProps {
  className?: string;
}

export default function ShoppingList({ className }: ShoppingListProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>("");

  const { data: shoppingItems = [] } = useQuery<ShoppingListItem[]>({
    queryKey: ["/api/shopping-list", user?.id],
    enabled: !!user?.id,
  });

  const { data: stores = [] } = useQuery<StoreLocation[]>({
    queryKey: ["/api/store-locations"],
  });

  // Group items by store and then by aisle
  const groupedItems = useMemo(() => {
    const groups: Record<string, Record<string, ShoppingListItem[]>> = {};
    
    shoppingItems.forEach(item => {
      if (!groups[item.storeId]) {
        groups[item.storeId] = {};
      }
      
      const aisle = item.aisle || "Unassigned";
      if (!groups[item.storeId][aisle]) {
        groups[item.storeId][aisle] = [];
      }
      
      groups[item.storeId][aisle].push(item);
    });

    // Sort aisles within each store
    Object.keys(groups).forEach(storeId => {
      const aisles = Object.keys(groups[storeId]);
      const sortedAisles = aisles.sort((a, b) => {
        // Put "Unassigned" last
        if (a === "Unassigned") return 1;
        if (b === "Unassigned") return -1;
        
        // Try to sort numerically for aisles like "A12", "B5"
        const aMatch = a.match(/([A-Z])(\d+)/);
        const bMatch = b.match(/([A-Z])(\d+)/);
        
        if (aMatch && bMatch) {
          const aLetter = aMatch[1];
          const bLetter = bMatch[1];
          if (aLetter !== bLetter) {
            return aLetter.localeCompare(bLetter);
          }
          return parseInt(aMatch[2]) - parseInt(bMatch[2]);
        }
        
        return a.localeCompare(b);
      });

      const newGroup: Record<string, ShoppingListItem[]> = {};
      sortedAisles.forEach(aisle => {
        newGroup[aisle] = groups[storeId][aisle];
      });
      groups[storeId] = newGroup;
    });

    return groups;
  }, [shoppingItems]);

  const toggleCompleted = useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      apiRequest("PATCH", `/api/shopping-list/${itemId}`, { isCompleted: completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: (itemId: string) =>
      apiRequest("DELETE", `/api/shopping-list/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-list"] });
      toast({
        title: "Item Removed",
        description: "Item removed from your shopping list",
      });
    },
  });

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : storeId;
  };

  const getCompletedCount = (storeId: string) => {
    const storeItems = shoppingItems.filter(item => item.storeId === storeId);
    const completed = storeItems.filter(item => item.isCompleted).length;
    return { completed, total: storeItems.length };
  };

  if (shoppingItems.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-4">Your shopping list is empty</p>
            <p className="text-sm">Add items from scan results to start building your list</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Shopping List
        </h2>
        <Badge variant="secondary">
          {shoppingItems.filter(item => !item.isCompleted).length} items remaining
        </Badge>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedItems).map(([storeId, aisleGroups]) => {
          const { completed, total } = getCompletedCount(storeId);
          const store = stores.find(s => s.id === storeId);
          
          return (
            <Card key={storeId} className="border-l-4 border-l-blue-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    {getStoreName(storeId)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={completed === total ? "default" : "secondary"}>
                      {completed}/{total} complete
                    </Badge>
                    {store && (
                      <Badge variant="outline" className="text-xs">
                        #{store.storeNumber}
                      </Badge>
                    )}
                  </div>
                </div>
                {store && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{store.address}, {store.city}, {store.state}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(aisleGroups).map(([aisle, items]) => (
                    <div key={aisle} className="space-y-2">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        <span>Aisle {aisle}</span>
                        <Badge variant="outline" className="text-xs">
                          {items.length} item{items.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 ml-6">
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className={`flex items-center gap-3 p-3 rounded-lg border ${
                              item.isCompleted 
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                : 'bg-white dark:bg-gray-800'
                            }`}
                          >
                            <button
                              onClick={() => toggleCompleted.mutate({ 
                                itemId: item.id, 
                                completed: !item.isCompleted 
                              })}
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                item.isCompleted
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {item.isCompleted && <Check className="w-3 h-3" />}
                            </button>
                            
                            <div className="flex-1">
                              <p className={`font-medium ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                Product Name Placeholder
                              </p>
                              {item.targetPrice && (
                                <div className="flex items-center gap-1 text-sm text-green-600">
                                  <DollarSign className="w-3 h-3" />
                                  Target: ${item.targetPrice}
                                </div>
                              )}
                              {item.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {item.bay && (
                                <Badge variant="outline" className="text-xs">
                                  Bay {item.bay}
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteItem.mutate(item.id)}
                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}