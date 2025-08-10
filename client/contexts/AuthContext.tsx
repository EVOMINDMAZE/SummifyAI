import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name: string;
  tier: "free" | "premium";
  queriesUsed: number;
  queriesLimit: number;
  credits: number;
  subscriptionId?: string;
  createdAt: string;
  referralCode: string;
  referralsCount: number;
  settings?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    timezone?: string;
    defaultSummaryLength?: "short" | "medium" | "long";
    autoSave?: boolean;
    notifications?: {
      emailWeeklyReport?: boolean;
      emailCreditUpdates?: boolean;
      emailFeatureUpdates?: boolean;
      emailMarketing?: boolean;
      browserSummaryComplete?: boolean;
    };
    privacy?: {
      allowAnalytics?: boolean;
      saveSearchHistory?: boolean;
    };
    advanced?: {
      developerMode?: boolean;
      betaFeatures?: boolean;
    };
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateUserSettings: (settings: any) => Promise<void>;
  addCredits: (amount: number, reason: string) => void;
  useCredits: (amount: number) => boolean;
  shareContent: (type: "summary" | "referral", contentId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (token) {
          // TODO: Validate token with backend
          // For now, use mock user data
          const mockUser: User = {
            id: "1",
            email: "user@example.com",
            name: "John Doe",
            tier: "free",
            queriesUsed: 1,
            queriesLimit: 3,
            credits: 5,
            referralCode: "JOHN123",
            referralsCount: 2,
            createdAt: new Date().toISOString(),
          };
          setUser(mockUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("auth_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sign in failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      setUser({
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.name,
        tier: data.user.tier,
        queriesUsed: data.user.queriesUsed,
        queriesLimit: data.user.queryLimit,
        credits: data.user.credits,
        referralCode: data.user.referralCode,
        referralsCount: data.user.referralsCount,
        createdAt: data.user.createdAt,
      });
    } catch (error) {
      // Fall back to demo user for development
      console.warn("Auth failed, using demo user:", error);
      const mockUser: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        tier: "free",
        queriesUsed: 0,
        queriesLimit: 3,
        credits: 3,
        referralCode: `${email.split("@")[0].toUpperCase()}123`,
        referralsCount: 0,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("auth_token", "demo_token");
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sign up failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      setUser({
        id: data.user.id.toString(),
        email: data.user.email,
        name: data.user.name,
        tier: data.user.tier,
        queriesUsed: data.user.queriesUsed,
        queriesLimit: data.user.queryLimit,
        credits: data.user.credits,
        referralCode: data.user.referralCode,
        referralsCount: data.user.referralsCount,
        createdAt: data.user.createdAt,
      });
    } catch (error) {
      // For demo purposes, create a mock user
      const mockUser: User = {
        id: "1",
        email,
        name,
        tier: "free",
        queriesUsed: 0,
        queriesLimit: 3,
        credits: 3,
        referralCode: `${name.replace(/\s+/g, "").toUpperCase()}123`,
        referralsCount: 0,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem("auth_token", "demo_token");
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // TODO: Call logout API
      localStorage.removeItem("auth_token");
      setUser(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const updateUserSettings = async (settings: any) => {
    if (!user) return;

    try {
      // Import SummifyAPI here to avoid circular dependencies
      const { SummifyAPI } = await import("../utils/api");
      await SummifyAPI.updateUserSettings(parseInt(user.id), settings);

      // Update local user state
      setUser({
        ...user,
        settings: { ...user.settings, ...settings },
      });
    } catch (error) {
      console.warn("Settings API failed, using local storage:", error);
      // Fallback to localStorage for demo
      const currentSettings = user.settings || {};
      const newSettings = { ...currentSettings, ...settings };
      localStorage.setItem(
        `user_settings_${user.id}`,
        JSON.stringify(newSettings),
      );

      setUser({
        ...user,
        settings: newSettings,
      });
    }
  };

  const addCredits = async (amount: number, reason: string) => {
    if (user) {
      try {
        const response = await fetch(`/api/users/${user.id}/credits`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, type: "earned", reason }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ ...user, credits: data.newBalance });
          console.log(
            `Added ${amount} credits: ${reason}. New balance: ${data.newBalance}`,
          );
        } else {
          throw new Error("Failed to add credits");
        }
      } catch (error) {
        // Fallback to local update for demo
        console.warn("Credit API failed, using local update:", error);
        const newCredits = user.credits + amount;
        setUser({ ...user, credits: newCredits });

        // Store the transaction for history
        const transaction = {
          type: "earned",
          amount,
          reason,
          timestamp: new Date().toISOString(),
          balance: newCredits,
        };

        const existingTransactions = JSON.parse(
          localStorage.getItem("credit_transactions") || "[]",
        );
        existingTransactions.push(transaction);
        localStorage.setItem(
          "credit_transactions",
          JSON.stringify(existingTransactions),
        );
      }
    }
  };

  const useCredits = (amount: number): boolean => {
    if (user && user.credits >= amount) {
      const newCredits = user.credits - amount;
      setUser({ ...user, credits: newCredits });

      // Store the transaction
      const transaction = {
        type: "spent",
        amount,
        reason: "Used for additional search",
        timestamp: new Date().toISOString(),
        balance: newCredits,
      };

      const existingTransactions = JSON.parse(
        localStorage.getItem("credit_transactions") || "[]",
      );
      existingTransactions.push(transaction);
      localStorage.setItem(
        "credit_transactions",
        JSON.stringify(existingTransactions),
      );

      return true;
    }
    return false;
  };

  const shareContent = async (
    type: "summary" | "referral",
    contentId?: string,
  ) => {
    if (!user) return;

    if (type === "summary" && contentId) {
      try {
        const response = await fetch("/api/shares", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            summaryId: contentId,
            shareType: "social_share",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ ...user, credits: data.newBalance });
          console.log(
            `Shared summary ${contentId}, earned ${data.creditsAwarded} credits`,
          );
        } else {
          throw new Error("Failed to record share");
        }
      } catch (error) {
        // Fallback to local update
        console.warn("Share API failed, using local update:", error);
        addCredits(1, "Shared a summary");
      }
    } else if (type === "referral") {
      // Award 3 credits for successful referral (would be called when friend signs up)
      addCredits(3, "Friend signed up with your referral code");

      // Update referral count
      setUser({ ...user, referralsCount: user.referralsCount + 1 });

      console.log(`Referral successful via code ${user.referralCode}`);
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
    updateUserSettings,
    addCredits,
    useCredits,
    shareContent,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
