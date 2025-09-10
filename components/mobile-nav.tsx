import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUser } from "@/contexts/user-context";
import { Badge } from "@/components/ui/badge";
import { Menu, Search, Crown, History, User, Settings, LogOut, Mail, DollarSign } from "lucide-react";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useUser();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  const planName = user?.subscriptionPlan === "basic" ? "Basic" : 
                   user?.subscriptionPlan === "premium" ? "Premium" : "Free";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {/* User Info */}
          {user && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <Badge variant="secondary" className="text-xs">
                    {planName} Plan
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">ZIP: {user.zipCode}</p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-2">
            <Link href="/dashboard">
              <Button 
                variant={location === "/dashboard" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={handleLinkClick}
                data-testid="link-mobile-dashboard"
              >
                <User className="w-4 h-4 mr-3" />
                Dashboard
              </Button>
            </Link>
            
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={handleLinkClick}
                data-testid="link-mobile-home"
              >
                <Search className="w-4 h-4 mr-3" />
                Find Clearance
              </Button>
            </Link>
            
            <Link href="/subscription">
              <Button 
                variant={location === "/subscription" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={handleLinkClick}
                data-testid="link-mobile-subscription"
              >
                <Crown className="w-4 h-4 mr-3" />
                Subscription
              </Button>
            </Link>
            
            <Link href="/history">
              <Button 
                variant={location === "/history" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={handleLinkClick}
                data-testid="link-mobile-history"
              >
                <History className="w-4 h-4 mr-3" />
                Scan History
              </Button>
            </Link>
            
            <Link href="/affiliates">
              <Button 
                variant={location === "/affiliates" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={handleLinkClick}
                data-testid="link-mobile-affiliates"
              >
                <DollarSign className="w-4 h-4 mr-3" />
                Affiliate Program
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button 
                variant={location === "/contact" ? "default" : "ghost"} 
                className="w-full justify-start"
                onClick={handleLinkClick}
                data-testid="link-mobile-contact"
              >
                <Mail className="w-4 h-4 mr-3" />
                Contact
              </Button>
            </Link>
          </nav>

          {/* Account Actions */}
          <div className="border-t pt-4 space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground"
              onClick={handleLinkClick}
              data-testid="button-mobile-settings"
            >
              <Settings className="w-4 h-4 mr-3" />
              Account Settings
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLogout}
              data-testid="button-mobile-logout"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}