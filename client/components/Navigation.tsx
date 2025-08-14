import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import UserAvatar from "./UserAvatar";

interface NavigationProps {
  variant?: "marketing" | "app";
}

export default function Navigation({ variant = "app" }: NavigationProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = !!user;
  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setIsUserMenuOpen(false);
  };

  // Marketing navigation for logged-out users
  const marketingNav = (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-[#FFFD63] backdrop-blur supports-[backdrop-filter]:bg-[#FFFD63]/95">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold text-black">SummifyIO</span>
          </Link>

          {/* Desktop Marketing Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/#how-it-works"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              How it Works
            </Link>
            <Link
              to="/#features"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Pricing
            </Link>
          </div>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </Link>
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <UserAvatar user={user} size="medium" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link
                to="/signin"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`bg-black block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
            ></span>
            <span
              className={`bg-black block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
            ></span>
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#FFFD63] border-t border-gray-200">
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/#how-it-works"
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </Link>
            <Link
              to="/#features"
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="block text-gray-700 hover:text-gray-900 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <hr className="border-gray-300" />
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/settings"
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block text-left text-gray-700 hover:text-gray-900 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block bg-black text-white px-4 py-2 rounded-lg font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );

  // App navigation for logged-in users
  const appNav = (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/80 dark:border-gray-700">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFFD63] text-black font-bold">
              S
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              SummifyIO
            </span>
          </Link>

          {/* Desktop App Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/generate"
              className={`font-medium transition-colors ${
                isActive("/generate")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Generate
            </Link>
            <Link
              to="/results"
              className={`font-medium transition-colors ${
                isActive("/results")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Results
            </Link>
            <Link
              to="/help"
              className={`font-medium transition-colors ${
                isActive("/help")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              Support
            </Link>
          </div>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <Link
            to="/generate"
            className="bg-[#FFFD63] text-black px-4 py-2 rounded-lg font-medium hover:bg-[#FFFD63]/80 transition-colors"
          >
            New Search
          </Link>

          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <UserAvatar user={user} size="medium" showName={true} />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 break-words">
                    <UserAvatar user={user} size="small" showName={true} />
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {user.email}
                    </div>
                  </div>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`bg-gray-900 dark:bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"}`}
            ></span>
            <span
              className={`bg-gray-900 dark:bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isMenuOpen ? "opacity-0" : "opacity-100"}`}
            ></span>
            <span
              className={`bg-gray-900 dark:bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"}`}
            ></span>
          </div>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 py-6 space-y-4">
            <Link
              to="/dashboard"
              className={`block font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/generate"
              className={`block font-medium transition-colors ${
                isActive("/generate")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Generate
            </Link>
            <Link
              to="/results"
              className={`block font-medium transition-colors ${
                isActive("/results")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Results
            </Link>
            <Link
              to="/help"
              className={`block font-medium transition-colors ${
                isActive("/help")
                  ? "text-[#4361EE]"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Support
            </Link>
            <hr className="border-gray-300 dark:border-gray-600" />
            {isAuthenticated && (
              <>
                <Link
                  to="/settings"
                  className="block text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block text-left text-red-600 dark:text-red-400 font-medium"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );

  return variant === "marketing" ? marketingNav : appNav;
}
