import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Lock, Shield, Check, AlertTriangle } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import { useToast } from "@/hooks/use-toast";

export default function ZipOnboardingPage() {
  const [, setLocation] = useLocation();
  const [zipCode, setZipCodeInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const { updateZipCode } = useUser();
  const { toast } = useToast();

  const validateZipCode = (zip: string): boolean => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Prevent multiple submissions
    if (isValidating) return;

    if (!validateZipCode(zipCode)) {
      setError("Please enter a valid ZIP code (e.g., 12345 or 12345-6789)");
      return;
    }

    setIsValidating(true);
    
    try {
      await updateZipCode(zipCode.slice(0, 5)); // Use only 5-digit ZIP
      toast({
        title: "ZIP Code Saved!",
        description: "Welcome to DealRadar! Start finding deals near you.",
      });
      setLocation("/");
    } catch (err) {
      setError("Failed to save ZIP code. Please try again.");
      console.error("ZIP code update failed:", err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md panel">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="text-white w-6 h-6" />
          </div>
          <CardTitle className="text-2xl">Welcome to DealRadar</CardTitle>
          <p className="text-muted-foreground">
            Now we need your ZIP code to find deals near you
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="zipCode" className="text-sm font-medium">
                ZIP Code
              </Label>
              <Input
                id="zipCode"
                type="text"
                placeholder="Enter your ZIP code"
                value={zipCode}
                onChange={(e) => setZipCodeInput(e.target.value)}
                className="text-center text-lg font-mono"
                maxLength={10}
                data-testid="input-zip-code"
                disabled={isValidating}
              />
              {error && (
                <p className="text-sm text-destructive mt-1" data-testid="text-zip-error">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!zipCode.trim() || isValidating}
              data-testid="button-save-zip"
            >
              {isValidating ? (
                <>
                  <div className="loading-spinner mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save ZIP Code
                </>
              )}
            </Button>
          </form>

          <div className="space-y-3">
            {/* CONFIRMATION WARNING */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    ⚠️ Are you sure about this ZIP code?
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Once set, you'll need to message support through chat to change your ZIP code later for security reasons.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                    Your ZIP Code is Secure
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    We only use your ZIP code to find stores near you. Your ZIP code cannot be changed after setting for security reasons.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    Privacy Protected
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Your location data is never shared with third parties and is only used to show you relevant deals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}