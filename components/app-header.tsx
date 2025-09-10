import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Settings, HelpCircle, User, LogOut, Crown, LogIn, Home, Star, Zap } from "lucide-react";
import { useUser } from "@/contexts/user-context";

export default function AppHeader() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Search className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DealRadar
              </h1>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-4">
            <Link href="/">
              <Button 
                variant={location === "/" ? "default" : "ghost"} 
                size="sm"
                data-testid="link-home"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" data-testid="button-user-menu">
                    <User className="w-4 h-4 mr-2" />
                    {user?.username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link href="/subscription">
                    <DropdownMenuItem>
                      <Crown className="w-4 h-4 mr-2" />
                      <span>Subscription</span>
                      {user?.subscriptionPlan && (
                        <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 ${
                          user.subscriptionPlan === "premium" 
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white" 
                            : user.subscriptionPlan === "basic" 
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white" 
                            : "bg-gradient-to-r from-gray-600 to-gray-700 text-white"
                        }`}>
                          {user.subscriptionPlan === "premium" && <Crown className="w-3 h-3" />}
                          {user.subscriptionPlan === "basic" && <Star className="w-3 h-3" />}
                          {user.subscriptionPlan === "free" && <Zap className="w-3 h-3" />}
                          {user.subscriptionPlan === "premium" ? "Elite" : 
                           user.subscriptionPlan === "basic" ? "Pro" : "Free"}
                        </span>
                      )}
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link href="/settings">
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  
                  <Link href="/help">
                    <DropdownMenuItem>
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Help
                    </DropdownMenuItem>
                  </Link>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem onClick={logout} data-testid="button-logout">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button size="sm" data-testid="button-login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
