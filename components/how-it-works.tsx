import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, Filter, ShoppingCart } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: MapPin,
      title: "Select Stores",
      description: "Choose Home Depot locations near you based on your subscription plan",
      color: "text-blue-600"
    },
    {
      icon: Search,
      title: "Start Scanning",
      description: "Our system checks real-time inventory and pricing across all selected stores",
      color: "text-green-600"
    },
    {
      icon: Filter,
      title: "Filter Results",
      description: "Sort and filter deals by category, savings, and price ranges",
      color: "text-purple-600"
    },
    {
      icon: ShoppingCart,
      title: "Shop Smart",
      description: "Add items to your organized shopping list with store and aisle information",
      color: "text-blue-600"
    }
  ];

  return (
    <div className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">How It Works</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find the best deals in just a few simple steps
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <Card key={step.title} className="relative overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="absolute top-4 right-4 w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-bold text-muted-foreground">
                {index + 1}
              </div>
              
              <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center ${step.color}`}>
                <step.icon className="w-6 h-6" />
              </div>
              
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}