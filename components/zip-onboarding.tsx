import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, TrendingDown } from "lucide-react";

interface ZipOnboardingProps {
  onZipSubmit: (zipCode: string) => void;
}

export default function ZipOnboarding({ onZipSubmit }: ZipOnboardingProps) {
  const [zipCode, setZipCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (zipCode.length !== 5 || !/^\d{5}$/.test(zipCode)) {
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    onZipSubmit(zipCode);
    setIsSubmitting(false);
  };

  const isValidZip = zipCode.length === 5 && /^\d{5}$/.test(zipCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              DealRadar
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Find the best deals at stores near you
          </p>
        </div>

        {/* ZIP Code Form */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900 dark:text-white">
              Enter Your ZIP Code
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
              We need your location to find stores and deals in your area
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="zipCode" className="text-sm font-medium">
                  ZIP Code
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="12345"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="pl-10 text-center text-lg font-mono"
                    maxLength={5}
                    data-testid="input-zip-code"
                  />
                </div>
                {zipCode && !isValidZip && (
                  <p className="text-red-500 text-xs">Please enter a valid 5-digit ZIP code</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={!isValidZip || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold shadow-lg"
                data-testid="button-submit-zip"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Getting Started...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Start Finding Deals
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your ZIP code will be saved securely and used only to find stores in your area.
                This setting can only be changed by an administrator.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}