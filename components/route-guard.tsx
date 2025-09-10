import { useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useLocation } from "wouter";

interface RouteGuardProps {
  children: React.ReactNode;
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, hasZipCode, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Only redirect after initial auth check is complete
    if (!isLoading) {
      if (!isAuthenticated && location !== "/auth") {
        // Redirect to auth if not authenticated
        setLocation("/auth");
      } else if (isAuthenticated && !hasZipCode && location !== "/zip-onboarding") {
        // Redirect to ZIP onboarding if authenticated but no ZIP
        setLocation("/zip-onboarding");
      } else if (isAuthenticated && hasZipCode && (location === "/auth" || location === "/zip-onboarding")) {
        // Redirect to home if authenticated and has ZIP but on auth/onboarding pages
        setLocation("/");
      }
    }
  }, [isAuthenticated, hasZipCode, isLoading, location, setLocation]);

  // Always render children to avoid suspension
  return <>{children}</>;
}