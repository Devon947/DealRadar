import { useState } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/login-form";
import SignupForm from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useUser } from "@/contexts/user-context";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [, setLocation] = useLocation();
  const { refreshUser } = useUser();

  const handleSuccess = async () => {
    // Refresh user data and redirect immediately
    await refreshUser();
    
    // Get fresh user data and redirect based on ZIP code status
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const userData = await response.json();
      if (userData.zipCode) {
        // Has ZIP code - go to home
        setLocation("/");
      } else {
        // No ZIP code - go to ZIP onboarding
        setLocation("/zip-onboarding");
      }
    }
  };


  const handleSwitchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <Search className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DealRadar
              </h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="flex justify-center items-center min-h-[60vh]">
          {mode === "login" ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={handleSwitchMode}
            />
          ) : (
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchMode}
            />
          )}
        </div>
      </main>
    </div>
  );
}