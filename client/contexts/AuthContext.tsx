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
  signUp: (email: string, password: string, name: string) => Promise<void>;
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

  useEffect(() => {
    // Check for existing Supabase session
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check failed:", error);
          return;
        }

        if (session?.user) {
          // Fetch user profile from database
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch failed:", profileError);
            return;
          }

          if (profileData) {
            const userData: User = {
              id: profileData.user_id,
              email: session.user.email || '',
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              searchCount: profileData.search_count || 0,
              monthlySearchLimit: profileData.monthly_search_limit || 3,
              searchCountResetDate: profileData.search_count_reset_date || '',
              planType: profileData.plan_type || 'free',
              notificationSearchResults: profileData.notification_search_results || false,
              notificationUsageAlerts: profileData.notification_usage_alerts || false,
              notificationProductUpdates: profileData.notification_product_updates || false,
              createdAt: profileData.created_at || '',
              updatedAt: profileData.updated_at || '',
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
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          // Fetch user profile when signed in
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileData) {
            const userData: User = {
              id: profileData.user_id,
              email: session.user.email || '',
              firstName: profileData.first_name || '',
              lastName: profileData.last_name || '',
              searchCount: profileData.search_count || 0,
              monthlySearchLimit: profileData.monthly_search_limit || 3,
              searchCountResetDate: profileData.search_count_reset_date || '',
              planType: profileData.plan_type || 'free',
              notificationSearchResults: profileData.notification_search_results || false,
              notificationUsageAlerts: profileData.notification_usage_alerts || false,
              notificationProductUpdates: profileData.notification_product_updates || false,
              createdAt: profileData.created_at || '',
              updatedAt: profileData.updated_at || '',
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
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // User will be set via onAuthStateChange listener
      console.log("Sign in successful");
    } catch (error) {
      console.error("Sign in failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
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
        const [firstName, ...lastNameParts] = name.split(' ');
        const lastName = lastNameParts.join(' ');

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            search_count: 0,
            monthly_search_limit: 3,
            search_count_reset_date: new Date().toISOString().split('T')[0],
            plan_type: 'free',
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
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

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
