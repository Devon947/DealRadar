import { useEffect, useState } from "react";
import AppHeader from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Users, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TelegramDeal {
  id: string;
  productName: string;
  productUrl: string;
  originalPrice?: number;
  currentPrice?: number;
  discount?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  source: string;
  updatedAt: string;
}

export default function AmazonDealsPage() {
  const [deals, setDeals] = useState<TelegramDeal[]>([]);
  const [stats, setStats] = useState<any>({ totalDeals: 0, activeDeals: 0, lastUpdate: new Date().toISOString() });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const dealsResponse = await fetch('/api/telegram/deals');
        const statsResponse = await fetch('/api/telegram/stats');
        
        if (dealsResponse.ok && statsResponse.ok) {
          const dealsData = await dealsResponse.json();
          const statsData = await statsResponse.json();
          
          setDeals(dealsData || []);
          setStats(statsData || { totalDeals: 0, activeDeals: 0, lastUpdate: new Date().toISOString() });
          setError(null);
        } else {
          setError('Failed to load deals');
        }
      } catch (err) {
        setError('Failed to load deals');
        setDeals([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up periodic updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Deals</h2>
            <p className="text-muted-foreground">Unable to fetch Amazon deals. Please try again later.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Amazon Deals
              </h1>
              <p className="text-muted-foreground">
                Real-time deals from our Telegram bot
              </p>
            </div>
            {stats && (
              <div className="text-right">
                <Badge variant="secondary" className="mb-2">
                  {stats.totalDeals} Total Deals
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(stats.lastUpdate).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-80">
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : deals && deals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <Card key={deal.id} className="hover:shadow-lg transition-shadow" data-testid={`card-deal-${deal.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2 leading-tight" data-testid={`text-product-name-${deal.id}`}>
                      {deal.productName}
                    </CardTitle>
                    {deal.discount && (
                      <Badge variant="destructive" className="shrink-0">
                        {deal.discount}
                      </Badge>
                    )}
                  </div>
                  {deal.category && (
                    <Badge variant="outline" className="w-fit">
                      <Package className="w-3 h-3 mr-1" />
                      {deal.category}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {deal.imageUrl && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={deal.imageUrl} 
                        alt={deal.productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  {deal.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {deal.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      {deal.originalPrice && deal.currentPrice && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground" data-testid={`text-current-price-${deal.id}`}>
                            ${deal.currentPrice.toFixed(2)}
                          </span>
                          <span className="text-sm line-through text-muted-foreground">
                            ${deal.originalPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        {deal.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span>{deal.rating}</span>
                          </div>
                        )}
                        {deal.reviewCount && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{deal.reviewCount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {deal.availability && (
                    <Badge variant={deal.availability.toLowerCase().includes('stock') ? 'default' : 'secondary'}>
                      {deal.availability}
                    </Badge>
                  )}
                  
                  <Button 
                    asChild 
                    className="w-full" 
                    data-testid={`button-view-deal-${deal.id}`}
                  >
                    <a href={deal.productUrl} target="_blank" rel="noopener noreferrer">
                      View Deal <ExternalLink className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Deals Available</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Our Telegram bot hasn't found any deals yet. Check back soon for the latest Amazon deals!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}