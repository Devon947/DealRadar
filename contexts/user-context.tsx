import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type User } from "@shared/schema";

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasZipCode: boolean;
  updateZipCode: (zipCode: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Simple authentication check without suspense
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Auth check failed (expected if not authenticated):", error);
        setUser(null);
      } finally {
        setIsAuthChecked(true);
      }
    };
    
    checkAuth();
  }, []);

  const updateZipCode = async (zipCode: string) => {
    if (!user) {
      throw new Error("Must be authenticated to set ZIP code");
    }
    
    // Check if this is the user's first time setting a ZIP code
    const isFirstTimeSettingZipCode = !user.zipCode;
    
    try {
      const response = await fetch("/api/auth/zip-code", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ zipCode }),
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to update ZIP code");
      }
      
      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Redirect to home page on first ZIP code save
      if (isFirstTimeSettingZipCode) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Failed to update ZIP code:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include"
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
      setUser(null);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading: !isAuthChecked, // Loading until auth is checked
        isAuthenticated: !!user, // Authenticated if we have real user data
        hasZipCode: !!user?.zipCode, // Only check authenticated user's ZIP code
        updateZipCode,
        refreshUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}