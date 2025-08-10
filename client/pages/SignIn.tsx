import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, Mail, Lock, Chrome, Github, Twitter } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn, signInWithGoogle, isLoading } = useAuth();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !isLoading) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, location]);

  // Form validation
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  // Handle email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      setError("Please fill in all fields");
      return;
    }

    setIsSigningIn(true);
    setError("");
    setSuccess("");

    try {
      await signIn(email.trim(), password);
      setSuccess("Sign in successful! Redirecting...");
      
      // Navigation will happen automatically via useEffect when user state updates
    } catch (err: any) {
      console.error("Sign in error:", err);
      
      // Provide specific error messages
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please verify your email address before signing in.");
      } else if (err.message?.includes("Too many requests")) {
        setError("Too many sign-in attempts. Please wait a moment before trying again.");
      } else if (err.message?.includes("network") || err.message?.includes("fetch")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Google OAuth sign in
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError("");
    setSuccess("");

    try {
      await signInWithGoogle();
      setSuccess("Redirecting to Google...");
    } catch (err: any) {
      console.error("Google sign in error:", err);
      
      if (err.message?.includes("OAuth")) {
        setError("Google sign-in is not available. Please use email/password or contact support.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
      setIsSigningIn(false);
    }
  };

  // Handle social sign in (placeholder for other providers)
  const handleSocialSignIn = (provider: string) => {
    setError(`${provider} sign-in is coming soon! Please use email/password for now.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFFD63] to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-[#0A0B1E] font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                SummifyIO
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/signup"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-2 rounded-lg font-semibold transition-colors shadow-md"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to your SummifyIO account to discover exact chapters from business books
            </p>
          </div>

          {/* Sign In Card */}
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-semibold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 h-11"
                      disabled={isSigningIn}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-11"
                      disabled={isSigningIn}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      disabled={isSigningIn}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 rounded"
                      disabled={isSigningIn}
                    />
                    <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] font-semibold text-base shadow-lg"
                  disabled={!isFormValid || isSigningIn}
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-white dark:bg-gray-800 px-3 text-sm text-gray-500 dark:text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Sign In Options */}
              <div className="space-y-3">
                {/* Google */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={handleGoogleSignIn}
                  disabled={isSigningIn}
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Continue with Google
                </Button>

                {/* GitHub */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleSocialSignIn("GitHub")}
                  disabled={isSigningIn}
                >
                  <Github className="w-4 h-4 mr-2" />
                  Continue with GitHub
                </Button>

                {/* Twitter */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => handleSocialSignIn("Twitter")}
                  disabled={isSigningIn}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Continue with Twitter
                </Button>
              </div>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold text-[#0A0B1E] dark:text-[#FFFD63] hover:underline"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>

              {/* Help Text */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  By signing in, you agree to our{" "}
                  <Link to="/terms" className="hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-[#FFFD63]/10 to-yellow-200/10 dark:from-[#FFFD63]/5 dark:to-yellow-200/5 rounded-lg p-4 border border-[#FFFD63]/20">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🎯 Discover Exact Chapters
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Skip entire books and find exactly what you need from 15,000+ business books.
                Save hours of reading time with AI-powered chapter discovery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
