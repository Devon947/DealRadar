import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-0 bg-transparent shadow-none">
        <DialogTitle className="sr-only">
          {mode === "login" ? "Sign In" : "Sign Up"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {mode === "login" ? "Sign in to your account" : "Create a new account"}
        </DialogDescription>
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
      </DialogContent>
    </Dialog>
  );
}