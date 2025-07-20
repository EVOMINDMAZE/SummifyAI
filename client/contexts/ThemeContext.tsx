import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  actualTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("summifyio-theme") as Theme;
    return savedTheme || "light";
  });

  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

  // Function to get system theme preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  // Update actual theme based on current theme setting
  useEffect(() => {
    const updateActualTheme = () => {
      let newActualTheme: "light" | "dark";

      if (theme === "system") {
        newActualTheme = getSystemTheme();
      } else {
        newActualTheme = theme;
      }

      setActualTheme(newActualTheme);

      // Apply theme to document
      const root = document.documentElement;
      if (newActualTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateActualTheme();

    // Listen for system theme changes when theme is set to 'system'
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateActualTheme();

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("summifyai-theme", newTheme);
  };

  const toggleTheme = () => {
    if (actualTheme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const value = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
