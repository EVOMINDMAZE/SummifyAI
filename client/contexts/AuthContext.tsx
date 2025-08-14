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
  planType: "free" | "scholar" | "professional" | "institution";
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
  defaultSummaryLength?: "short" | "medium" | "long";
  profilePhotoUrl?: string;
  settings?: {
    language?: string;
    timezone?: string;
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
    security?: {
      twoFactorEnabled?: boolean;
      loginAlerts?: boolean;
    };
  };
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

// Create a default context value to prevent undefined errors
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: true,
  signIn: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signInWithGoogle: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signUp: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signUpWithGoogle: async () => {
    throw new Error("AuthProvider not initialized");
  },
  signOut: async () => {
    throw new Error("AuthProvider not initialized");
  },
  updateUser: async () => {
    throw new Error("AuthProvider not initialized");
  },
  updateUserSettings: async () => {
    throw new Error("AuthProvider not initialized");
  },
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Check if we're getting the default uninitialized context
  // by checking if the signIn function throws the "not initialized" error
  if (context.signIn === defaultContextValue.signIn) {
    console.warn("⚠️ useAuth called before AuthProvider is fully initialized");
    // Don't throw an error, just log a warning and return the context
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Recovery mechanism for stuck loading states
  useEffect(() => {
    const recoveryTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("⚠️ Auth loading timeout, forcing completion");
        setIsLoading(false);
      }
    }, 30000); // 30 second timeout

    return () => clearTimeout(recoveryTimer);
  }, [isLoading]);

  // Helper function to fetch and create user profile
  const fetchUserProfile = async (
    supabaseUser: SupabaseUser,
  ): Promise<User | null> => {
    try {
      console.log("📋 Fetching profile for user:", supabaseUser.email);
      const startTime = Date.now();

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .single();

      console.log(`⏱️ Profile fetch completed in ${Date.now() - startTime}ms`);

      if (profileError) {
        console.log("Profile error:", profileError);

        // If profile doesn't exist, create one
        if (profileError.code === "PGRST116") {
          console.log("📝 Creating new profile for user...");

          const fullName =
            supabaseUser.user_metadata?.full_name || supabaseUser.email || "";
          const [firstName, ...lastNameParts] = fullName.split(" ");
          const lastName = lastNameParts.join(" ");

          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              user_id: supabaseUser.id,
              first_name: firstName,
              last_name: lastName,
              search_count: 0,
              monthly_search_limit: 3,
              search_count_reset_date: new Date().toISOString().split("T")[0],
              plan_type: "free",
              notification_search_results: true,
              notification_usage_alerts: true,
              notification_product_updates: false,
              default_summary_length: "medium",
            });

          if (createError) {
            console.error("❌ Profile creation failed:", createError);
            return null;
          }

          // Fetch the newly created profile
          const { data: newProfileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", supabaseUser.id)
            .single();

          profileData = newProfileData;
        }
      }

      if (profileData) {
        // Load user settings from database or localStorage fallback
        let userSettings = null;
        try {
          if (profileData.user_settings) {
            userSettings = typeof profileData.user_settings === 'string'
              ? JSON.parse(profileData.user_settings)
              : profileData.user_settings;
          } else {
            // Fallback to localStorage
            const savedSettings = localStorage.getItem("userSettings");
            if (savedSettings) {
              userSettings = JSON.parse(savedSettings);
            }
          }
        } catch (error) {
          console.error("Error parsing user settings:", error);
        }

        const userData: User = {
          id: profileData.user_id,
          email: supabaseUser.email || "",
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          searchCount: profileData.search_count || 0,
          monthlySearchLimit: profileData.monthly_search_limit || 10,
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
          defaultSummaryLength: profileData.default_summary_length || "medium",
          profilePhotoUrl: profileData.profile_photo_url,
          settings: userSettings || {
            language: "en",
            timezone: "UTC-8",
            autoSave: true,
            notifications: {
              emailWeeklyReport: true,
              emailCreditUpdates: true,
              emailFeatureUpdates: false,
              emailMarketing: false,
              browserSummaryComplete: true,
            },
            privacy: {
              allowAnalytics: true,
              saveSearchHistory: true,
            },
            security: {
              twoFactorEnabled: false,
              loginAlerts: true,
            },
          },
        };

        console.log("✅ User profile loaded:", userData.email);
        return userData;
      }

      return null;
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("🔍 Initializing authentication...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session check failed:", error);
          return;
        }

        if (session?.user) {
          console.log("👤 Existing session found for:", session.user.email);
          const userData = await fetchUserProfile(session.user);
          setUser(userData);
        } else {
          console.log("📭 No existing session found");
        }
      } catch (error) {
        console.error("❌ Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
        console.log("🏁 Auth initialization completed");
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        `🔄 Auth state changed: ${event}`,
        session?.user?.email || "no session",
      );

      try {
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          console.log("🔓 User signed out");
        } else if (event === "SIGNED_IN" && session) {
          console.log("🔐 User signed in:", session.user.email);
          console.log("Session details:", {
            expires_at: new Date(session.expires_at * 1000).toLocaleString(),
            access_token_length: session.access_token?.length || 0,
          });

          // Add timeout for profile fetching
          const profilePromise = fetchUserProfile(session.user);
          const timeoutPromise = new Promise((resolve) =>
            setTimeout(() => {
              console.warn("⚠️ Profile fetch timeout, setting basic user");
              return resolve(null);
            }, 10000),
          );

          const userData = await Promise.race([profilePromise, timeoutPromise]);

          if (userData) {
            setUser(userData);
            console.log("✅ User profile set successfully");
          } else {
            // Set basic user data even if profile fetch fails
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || "",
              firstName: "",
              lastName: "",
              searchCount: 0,
              monthlySearchLimit: 3,
              searchCountResetDate: new Date().toISOString().split("T")[0],
              planType: "free",
              notificationSearchResults: false,
              notificationUsageAlerts: false,
              notificationProductUpdates: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setUser(basicUser);
            console.log("⚠️ Set basic user data due to profile fetch issues");
          }
        }
      } catch (error) {
        console.error("❌ Error in auth state change handler:", error);
        // Ensure loading state is cleared even on error
      } finally {
        setIsLoading(false);
        console.log("🏁 Auth state change processing completed");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("🔐 Starting sign in for:", email);
    console.log("🔗 Supabase client status:", !!supabase);

    try {
      // Add timeout to prevent hanging
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Sign in timeout after 15 seconds")),
          15000,
        ),
      );

      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise,
      ]);

      if (error) {
        console.error("❌ Sign in failed:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          code: error.code || "unknown",
        });
        throw error;
      }

      console.log("✅ Sign in API call successful");
      console.log("User data:", {
        id: data.user?.id,
        email: data.user?.email,
        email_confirmed_at: data.user?.email_confirmed_at,
        last_sign_in_at: data.user?.last_sign_in_at,
      });

      // User state will be updated by onAuthStateChange listener
      console.log("⏳ Waiting for auth state change to complete...");
    } catch (error) {
      console.error("❌ Sign in process failed:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    console.log("🔐 Starting Google OAuth sign in...");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("❌ Google OAuth failed:", error);
      throw error;
    }

    console.log("✅ Google OAuth initiated");
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log("📝 Starting sign up for:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      console.error("��� Sign up failed:", error);
      throw error;
    }

    console.log("✅ Sign up successful");
    // Profile will be created by onAuthStateChange listener when email is confirmed
  };

  const signUpWithGoogle = async () => {
    console.log("📝 Starting Google OAuth sign up...");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("❌ Google OAuth sign up failed:", error);
      throw error;
    }

    console.log("✅ Google OAuth sign up initiated");
  };

  const signOut = async () => {
    console.log("🔓 Signing out...");

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("❌ Sign out failed:", error);
      throw error;
    }

    console.log("✅ Sign out successful");
    // User state will be cleared by onAuthStateChange listener
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    console.log("📝 Updating user profile...");

    // Prepare update object with only defined values
    const updateData: any = {};

    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.searchCount !== undefined) updateData.search_count = updates.searchCount;
    if (updates.monthlySearchLimit !== undefined) updateData.monthly_search_limit = updates.monthlySearchLimit;
    if (updates.searchCountResetDate !== undefined) updateData.search_count_reset_date = updates.searchCountResetDate;
    if (updates.planType !== undefined) updateData.plan_type = updates.planType;
    if (updates.notificationSearchResults !== undefined) updateData.notification_search_results = updates.notificationSearchResults;
    if (updates.notificationUsageAlerts !== undefined) updateData.notification_usage_alerts = updates.notificationUsageAlerts;
    if (updates.notificationProductUpdates !== undefined) updateData.notification_product_updates = updates.notificationProductUpdates;
    if (updates.stripeCustomerId !== undefined) updateData.stripe_customer_id = updates.stripeCustomerId;
    if (updates.stripeSubscriptionId !== undefined) updateData.stripe_subscription_id = updates.stripeSubscriptionId;
    if (updates.subscriptionStatus !== undefined) updateData.subscription_status = updates.subscriptionStatus;
    if (updates.subscriptionEndDate !== undefined) updateData.subscription_end_date = updates.subscriptionEndDate;
    if (updates.adPreferences !== undefined) updateData.ad_preferences = updates.adPreferences;
    if (updates.adFreeUntil !== undefined) updateData.ad_free_until = updates.adFreeUntil;
    if (updates.defaultSummaryLength !== undefined) updateData.default_summary_length = updates.defaultSummaryLength;
    if (updates.profilePhotoUrl !== undefined) updateData.profile_photo_url = updates.profilePhotoUrl;
    if (updates.settings !== undefined) updateData.user_settings = JSON.stringify(updates.settings);

    // Always update the timestamp
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("user_id", user.id);

    if (error) {
      console.error("❌ User update failed:", error);
      const errorMessage =
        error.message || error.details || JSON.stringify(error);
      throw new Error(`User update failed: ${errorMessage}`);
    }

    // Update local state
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    console.log("✅ User profile updated");
  };

  const updateUserSettings = async (settings: any) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    await updateUser({
      notificationSearchResults: settings.notificationSearchResults,
      notificationUsageAlerts: settings.notificationUsageAlerts,
      notificationProductUpdates: settings.notificationProductUpdates,
      adPreferences: settings.adPreferences,
    });
  };

  // Add debug functions to window in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      (window as any).debugAuth = {
        resetAuthState: () => {
          console.log("🔧 Manually resetting auth state");
          setIsLoading(false);
          setUser(null);
        },
        getCurrentState: () => ({
          user: user?.email || null,
          isLoading,
          hasSupabase: !!supabase,
        }),
        forceSignOut: async () => {
          console.log("🔧 Force sign out");
          await supabase.auth.signOut();
          setUser(null);
          setIsLoading(false);
        },
      };
    }
  }, [user, isLoading]);

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
