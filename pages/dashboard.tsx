import AppHeader from "@/components/app-header";
import UserDashboard from "@/components/user-dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserDashboard />
      </main>
    </div>
  );
}