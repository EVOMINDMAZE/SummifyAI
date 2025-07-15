import { useTheme } from "../contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, actualTheme, setTheme } = useTheme();

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setTheme(actualTheme === "light" ? "dark" : "light")}
        className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {actualTheme === "light" ? (
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-700 dark:text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

// Theme selector component for settings
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: "Light", icon: "☀️" },
    { value: "dark", label: "Dark", icon: "🌙" },
    { value: "system", label: "System", icon: "💻" },
  ] as const;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Theme Preference
      </label>
      <div className="grid grid-cols-3 gap-3">
        {themes.map((themeOption) => (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
              theme === themeOption.value
                ? "border-[#FFFD63] bg-yellow-50 dark:bg-yellow-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <span className="text-2xl mb-1">{themeOption.icon}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {themeOption.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
