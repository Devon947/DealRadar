import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/user-context";
import ErrorBoundary from "@/components/error-boundary";
import { HeaderSkeleton } from "@/components/ui/skeleton";
// Dynamic imports for code splitting
const HomePage = lazy(() => import("@/pages/home"));
const ScanPage = lazy(() => import("@/pages/scan"));
const ScanSetup = lazy(() => import("@/pages/scan-setup"));
const ResultsPage = lazy(() => import("@/pages/results"));
const ScanHistory = lazy(() => import("@/pages/scan-history"));
const Lists = lazy(() => import("@/pages/lists"));
const Alerts = lazy(() => import("@/pages/alerts"));
const Pricing = lazy(() => import("@/pages/pricing"));
const Settings = lazy(() => import("@/pages/settings"));
const Help = lazy(() => import("@/pages/help"));
const ProfilePage = lazy(() => import("@/pages/profile"));
const AuthPage = lazy(() => import("@/pages/auth"));
const SubscriptionPage = lazy(() => import("@/pages/subscription"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const ContactPage = lazy(() => import("@/pages/contact"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AdminPage = lazy(() => import("@/pages/admin"));
const AffiliatesPage = lazy(() => import("@/pages/affiliates"));
const ZipOnboardingPage = lazy(() => import("@/pages/zip-onboarding"));
const AmazonDealsPage = lazy(() => import("@/pages/amazon-deals"));
const EmailTestPage = lazy(() => import("@/pages/email-test"));

// Eagerly load core components
import AppHeader from "@/components/app-header";
import RouteGuard from "@/components/route-guard";

function PageWithHeader({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      <AppHeader />
      <div className="pt-16">
        {children}
      </div>
    </RouteGuard>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        {/* ZIP Onboarding - must come before route guard */}
        <Route path="/zip-onboarding">
          <Suspense fallback={<LoadingFallback />}>
            <ZipOnboardingPage />
          </Suspense>
        </Route>
        
        {/* Auth page without header */}
        <Route path="/auth">
          <Suspense fallback={<LoadingFallback />}>
            <AuthPage />
          </Suspense>
        </Route>
        
        {/* Main app pages with unified header navigation */}
        <Route path="/" component={() => <PageWithHeader><HomePage /></PageWithHeader>} />
        <Route path="/scan" component={() => <PageWithHeader><ScanPage /></PageWithHeader>} />
        <Route path="/scan-setup/:storeId" component={() => <PageWithHeader><ScanSetup /></PageWithHeader>} />
        <Route path="/amazon-deals" component={() => <PageWithHeader><AmazonDealsPage /></PageWithHeader>} />
        <Route path="/results" component={() => <PageWithHeader><ResultsPage /></PageWithHeader>} />
        <Route path="/results/:scanId" component={() => <PageWithHeader><ResultsPage /></PageWithHeader>} />
        <Route path="/history" component={() => <PageWithHeader><ScanHistory /></PageWithHeader>} />
        <Route path="/lists" component={() => <PageWithHeader><Lists /></PageWithHeader>} />
        <Route path="/alerts" component={() => <PageWithHeader><Alerts /></PageWithHeader>} />
        <Route path="/pricing" component={() => <PageWithHeader><Pricing /></PageWithHeader>} />
        <Route path="/profile" component={() => <PageWithHeader><ProfilePage /></PageWithHeader>} />
        <Route path="/settings" component={() => <PageWithHeader><Settings /></PageWithHeader>} />
        <Route path="/help" component={() => <PageWithHeader><Help /></PageWithHeader>} />
        <Route path="/affiliates" component={() => <PageWithHeader><AffiliatesPage /></PageWithHeader>} />
        
        {/* Email Test page for development */}
        <Route path="/email-test" component={() => <PageWithHeader><EmailTestPage /></PageWithHeader>} />
        
        {/* Admin page with password protection */}
        <Route path="/admin" component={() => <PageWithHeader><AdminPage /></PageWithHeader>} />
        
        {/* Legacy routes */}
        <Route path="/dashboard" component={() => <PageWithHeader><DashboardPage /></PageWithHeader>} />
        <Route path="/subscription" component={() => <PageWithHeader><SubscriptionPage /></PageWithHeader>} />
        <Route path="/contact" component={() => <PageWithHeader><ContactPage /></PageWithHeader>} />
        
        {/* 404 page */}
        <Route component={() => <PageWithHeader><NotFound /></PageWithHeader>} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
