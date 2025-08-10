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
  firstName: string;
  lastName: string;
  searchCount: number;
  monthlySearchLimit: number;
  searchCountResetDate: string;
  planType: "free" | "pro" | "premium";
  notificationSearchResults: boolean;
  notificationUsageAlerts: boolean;
  notificationProductUpdates: boolean;
  createdAt: string;
  updatedAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  adPreferences?: any;
  adFreeUntil?: string;
}

export interface UserProfile {
  profiles: User;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateUserSettings: (settings: any) => Promise<void>;
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
  const [authPromiseResolver, setAuthPromiseResolver] = useState<((value: void) => void) | null>(null);

  useEffect(() => {
    // Check for existing Supabase session
    const checkAuth = async () => {
      try {
        console.log("🔍 Checking authentication status...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session check failed:", error);
          setIsLoading(false);
          return;
        }

        console.log("📊 Session check result:", session ? "Session found" : "No session");

        if (session?.user) {
          console.log("👤 User found, fetching profile...");
          // Fetch user profile from database
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single();

          if (profileError) {
            console.error("❌ Profile fetch failed:", profileError);
            if (profileError.code === 'PGRST116') {
              console.log("🔧 Profile not found, user may need to sign up again or profile creation failed");
            }
            setIsLoading(false);
            return;
          }

          if (profileData) {
            console.log("✅ Profile found, setting user data");
            const userData: User = {
              id: profileData.user_id,
              email: session.user.email || "",
              firstName: profileData.first_name || "",
              lastName: profileData.last_name || "",
              searchCount: profileData.search_count || 0,
              monthlySearchLimit: profileData.monthly_search_limit || 3,
              searchCountResetDate: profileData.search_count_reset_date || "",
              planType: profileData.plan_type || "free",
              notificationSearchResults:
                profileData.notification_search_results || false,
              notificationUsageAlerts:
                profileData.notification_usage_alerts || false,
              notificationProductUpdates:
                profileData.notification_product_updates || false,
              createdAt: profileData.created_at || "",
              updatedAt: profileData.updated_at || "",
              stripeCustomerId: profileData.stripe_customer_id,
              stripeSubscriptionId: profileData.stripe_subscription_id,
              subscriptionStatus: profileData.subscription_status,
              subscriptionEndDate: profileData.subscription_end_date,
              adPreferences: profileData.ad_preferences,
              adFreeUntil: profileData.ad_free_until,
            };
            setUser(userData);
          }
        }
      } catch (error) {
        console.error("❌ Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 Auth state changed: ${event}`, session?.user?.email);

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        console.log("🔓 User signed out");
      } else if (event === "SIGNED_IN" && session) {
        console.log("🔐 User signed in, fetching profile...");
        // Fetch user profile when signed in
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (profileData) {
          const userData: User = {
            id: profileData.user_id,
            email: session.user.email || "",
            firstName: profileData.first_name || "",
            lastName: profileData.last_name || "",
            searchCount: profileData.search_count || 0,
            monthlySearchLimit: profileData.monthly_search_limit || 3,
            searchCountResetDate: profileData.search_count_reset_date || "",
            planType: profileData.plan_type || "free",
            notificationSearchResults:
              profileData.notification_search_results || false,
            notificationUsageAlerts:
              profileData.notification_usage_alerts || false,
            notificationProductUpdates:
              profileData.notification_product_updates || false,
            createdAt: profileData.created_at || "",
            updatedAt: profileData.updated_at || "",
            stripeCustomerId: profileData.stripe_customer_id,
            stripeSubscriptionId: profileData.stripe_subscription_id,
            subscriptionStatus: profileData.subscription_status,
            subscriptionEndDate: profileData.subscription_end_date,
            adPreferences: profileData.ad_preferences,
            adFreeUntil: profileData.ad_free_until,
          };
          setUser(userData);

          // Resolve any pending sign-in promise
          if (authPromiseResolver) {
            authPromiseResolver();
            setAuthPromiseResolver(null);
          }
        } else {
          // Profile doesn't exist, create one for OAuth users
          const fullName =
            session.user.user_metadata?.full_name || session.user.email || "";
          const [firstName, ...lastNameParts] = fullName.split(" ");
          const lastName = lastNameParts.join(" ");

          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              user_id: session.user.id,
              first_name: firstName,
              last_name: lastName,
              search_count: 0,
              monthly_search_limit: 3,
              search_count_reset_date: new Date().toISOString().split("T")[0],
              plan_type: "free",
              notification_search_results: true,
              notification_usage_alerts: true,
              notification_product_updates: false,
            });

          if (profileError) {
            console.error("OAuth profile creation failed:", profileError);
          } else {
            // Fetch the newly created profile
            const { data: newProfileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", session.user.id)
              .single();

            if (newProfileData) {
              const userData: User = {
                id: newProfileData.user_id,
                email: session.user.email || "",
                firstName: newProfileData.first_name || "",
                lastName: newProfileData.last_name || "",
                searchCount: newProfileData.search_count || 0,
                monthlySearchLimit: newProfileData.monthly_search_limit || 3,
                searchCountResetDate:
                  newProfileData.search_count_reset_date || "",
                planType: newProfileData.plan_type || "free",
                notificationSearchResults:
                  newProfileData.notification_search_results || false,
                notificationUsageAlerts:
                  newProfileData.notification_usage_alerts || false,
                notificationProductUpdates:
                  newProfileData.notification_product_updates || false,
                createdAt: newProfileData.created_at || "",
                updatedAt: newProfileData.updated_at || "",
                stripeCustomerId: newProfileData.stripe_customer_id,
                stripeSubscriptionId: newProfileData.stripe_subscription_id,
                subscriptionStatus: newProfileData.subscription_status,
                subscriptionEndDate: newProfileData.subscription_end_date,
                adPreferences: newProfileData.ad_preferences,
                adFreeUntil: newProfileData.ad_free_until,
              };
              setUser(userData);

              // Resolve any pending sign-in promise
              if (authPromiseResolver) {
                authPromiseResolver();
                setAuthPromiseResolver(null);
              }
            }
          }
        }
      }

      // Always reset loading state after auth state change
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting sign in for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          statusText: error.name
        });
        throw error;
      }

      console.log("✅ Sign in successful for user:", data.user?.email);
      console.log("🔄 Waiting for auth state change to complete...");

      // Wait for user state to be updated by the auth state change listener
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          setAuthPromiseResolver(null);
          reject(new Error("Auth state update timeout - profile may not exist"));
        }, 8000); // 8 second timeout for state update

        setAuthPromiseResolver(() => {
          clearTimeout(timeout);
          console.log("🎉 Auth state updated successfully");
          resolve();
        });
      });
    } catch (error) {
      console.error("❌ Sign in failed:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log("🔐 Attempting Google OAuth sign in...");

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        console.error("❌ Google OAuth error:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          statusText: error.name
        });

        // Check for specific Google OAuth configuration issues
        if (error.message.includes('OAuth') || error.message.includes('provider')) {
          console.error("🔧 Google OAuth may not be properly configured in Supabase dashboard");
          console.error("Please check: Authentication > Providers > Google in Supabase dashboard");
        }

        throw error;
      }

      console.log("✅ Google OAuth initiated successfully");
      console.log("🔄 Redirecting to Google for authentication...");
    } catch (error) {
      console.error("❌ Google sign in failed:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create user profile
        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ");

        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          search_count: 0,
          monthly_search_limit: 3,
          search_count_reset_date: new Date().toISOString().split("T")[0],
          plan_type: "free",
          notification_search_results: true,
          notification_usage_alerts: true,
          notification_product_updates: false,
        });

        if (profileError) {
          console.error("Profile creation failed:", profileError);
          // Don't throw error here, user can be created manually
        }
      }

      console.log("Sign up successful");
    } catch (error) {
      console.error("Sign up failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw error;
      }

      console.log("Google sign up initiated");
    } catch (error) {
      console.error("Google sign up failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // User will be set to null via onAuthStateChange listener
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error("User update failed:", error);
      throw error;
    }
  };

  const updateUserSettings = async (settings: any) => {
    if (!user) return;

    try {
      const updates = {
        notification_search_results: settings.notificationSearchResults,
        notification_usage_alerts: settings.notificationUsageAlerts,
        notification_product_updates: settings.notificationProductUpdates,
        ad_preferences: settings.adPreferences,
      };

      await updateUser(updates);
    } catch (error) {
      console.error("Settings update failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    signIn,
    signInWithGoogle,
    signUp,
    signUpWithGoogle,
    signOut,
    updateUser,
    updateUserSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
