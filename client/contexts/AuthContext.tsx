import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
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
      // TODO: Replace with actual API call
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Sign in failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
    } catch (error) {
      // For demo purposes, create a mock user
      const mockUser: User = {
        id: "1",
        email,
        name: email.split("@")[0],
        tier: "free",
        queriesUsed: 0,
        queriesLimit: 3,
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
      // TODO: Replace with actual API call
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error("Sign up failed");
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
    } catch (error) {
      // For demo purposes, create a mock user
      const mockUser: User = {
        id: "1",
        email,
        name,
        tier: "free",
        queriesUsed: 0,
        queriesLimit: 3,
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

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
