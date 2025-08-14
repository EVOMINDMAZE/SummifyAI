import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import AIChatDemo from "@/components/AIChatDemo";
import Shepherd from "shepherd.js";
import "../styles/shepherd-custom.css";

export default function Index() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Load Shepherd CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/shepherd.js@11.2.0/dist/css/shepherd.css";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const startGuidedTour = () => {
    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: "custom-shepherd-theme",
        scrollTo: false,
        modalOverlayOpeningPadding: 10,
        cancelIcon: {
          enabled: true,
        },
      },
    });

    tour.addStep({
      title: "Welcome to SummifyIO!",
      text: "Let me show you how to find exact chapters from any book in seconds. This quick tour takes just 2 minutes.",
      buttons: [
        {
          text: "Skip Tour",
          classes: "shepherd-button-secondary",
          action: tour.cancel,
        },
        {
          text: "Start Tour",
          classes: "shepherd-button-primary",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      title: "Chapter Discovery",
      text: "Instead of reading entire books, search any topic and find the exact chapters and page numbers that address your question.",
      attachTo: {
        element: "#features .group:first-child",
        on: "bottom",
      },
      buttons: [
        {
          text: "Back",
          classes: "shepherd-button-secondary",
          action: tour.back,
        },
        {
          text: "Next",
          classes: "shepherd-button-primary",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      title: "AI-Powered Analysis",
      text: "Our AI explains why each chapter is relevant to your query and what unique insights it provides.",
      attachTo: {
        element: "#features .group:nth-child(2)",
        on: "bottom",
      },
      buttons: [
        {
          text: "Back",
          classes: "shepherd-button-secondary",
          action: tour.back,
        },
        {
          text: "Next",
          classes: "shepherd-button-primary",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      title: "Chapter Insights",
      text: "Get comprehensive insights with context, quotes, and direct purchase links to the books.",
      attachTo: {
        element: "#features .group:nth-child(3)",
        on: "bottom",
      },
      buttons: [
        {
          text: "Back",
          classes: "shepherd-button-secondary",
          action: tour.back,
        },
        {
          text: "Next",
          classes: "shepherd-button-primary",
          action: tour.next,
        },
      ],
    });

    tour.addStep({
      title: "Personal Library",
      text: "Save your discoveries, organize them by topics, and share insights with friends.",
      attachTo: {
        element: "#features .group:nth-child(4)",
        on: "bottom",
      },
      buttons: [
        {
          text: "Back",
          classes: "shepherd-button-secondary",
          action: tour.back,
        },
        {
          text: "Next",
          classes: "shepherd-button-primary",
          action: tour.next,
        },
      ],
    });

    if (user) {
      tour.addStep({
        title: "Start Discovering!",
        text: 'You\'re all set! Click "Find Chapters" to start discovering targeted insights from thousands of books.',
        attachTo: {
          element: 'nav a[href="/generate"]',
          on: "bottom",
        },
        buttons: [
          {
            text: "Back",
            classes: "shepherd-button-secondary",
            action: tour.back,
          },
          {
            text: "Start Discovering!",
            classes: "shepherd-button-primary",
            action: () => {
              tour.complete();
              navigate("/generate");
            },
          },
        ],
      });
    } else {
      tour.addStep({
        title: "Ready to Start?",
        text: "Sign up now to start your free trial and discover exact chapters from thousands of books!",
        attachTo: {
          element: 'nav a[href="/signup"]:last-of-type',
          on: "bottom",
        },
        buttons: [
          {
            text: "Back",
            classes: "shepherd-button-secondary",
            action: tour.back,
          },
          {
            text: "Sign Up Free!",
            classes: "shepherd-button-primary",
            action: () => {
              tour.complete();
              navigate("/signup");
            },
          },
        ],
      });
    }

    tour.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!user) {
      navigate("/signup");
      return;
    }

    navigate(`/generate?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-[#FFFD63] dark:bg-gray-900 relative z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#FFFD63] dark:text-[#0A0B1E] font-bold text-lg">
                  S
                </span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                SummifyIO
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/generate"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                  >
                    Generate
                  </Link>
                  <Link
                    to="/results"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                  >
                    Results
                  </Link>
                  <Link
                    to="/support"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                  >
                    Support
                  </Link>
                  <ThemeToggle />
                  <Link
                    to="/generate"
                    className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    New Search
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/how-it-works"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                  >
                    How it Works
                  </Link>
                  <Link
                    to="#features"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById("features")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Features
                  </Link>
                  <Link
                    to="/pricing"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/signin"
                    className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                  >
                    Sign In
                  </Link>
                  <ThemeToggle />
                  <Link
                    to="/signup"
                    className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#FFFD63] dark:bg-gray-800 relative z-10">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-[#0A0B1E] dark:text-white leading-tight mb-8">
              <span className="inline-block">
                Find exact chapters instantly.
              </span>
              <br />
              <span className="text-[#0A0B1E] dark:text-white">
                Discover targeted insights.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-[#0A0B1E]/80 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Search any topic and discover the exact chapters and pages from
              top books that address your question, complete with AI chapter
              analysis and insights on why each chapter is relevant—all powered
              by intelligent book indexing.
            </p>

            {/* Premium Features Highlight */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm">
              <div className="flex items-center gap-2 text-[#0A0B1E]/70 dark:text-gray-400">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Exact Chapter Locations</span>
              </div>
              <div className="flex items-center gap-2 text-[#0A0B1E]/70 dark:text-gray-400">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Page Numbers & Context</span>
              </div>
              <div className="flex items-center gap-2 text-[#0A0B1E]/70 dark:text-gray-400">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>AI Chapter Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-[#0A0B1E]/70 dark:text-gray-400">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Book Purchase Links</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <>
                  <Link
                    to="/generate"
                    className="flex items-center gap-3 bg-[#0A0B1E] text-white px-8 py-4 rounded-2xl font-medium hover:bg-[#0A0B1E]/90 transition-colors shadow-lg"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    🚀 Discover Exact Chapters Now
                  </Link>
                  <Link
                    to="/dashboard"
                    className="bg-white text-[#0A0B1E] px-8 py-4 rounded-2xl font-medium hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
                  >
                    📊 View My Research Hub
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="flex items-center gap-3 bg-gradient-to-r from-[#0A0B1E] to-gray-800 text-white px-8 py-4 rounded-2xl font-bold hover:from-gray-800 hover:to-[#0A0B1E] transition-all shadow-xl transform hover:scale-105 border-2 border-transparent hover:border-[#FFFD63]"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Start Free — Unlock Premium Features
                  </Link>
                  <div className="text-center">
                    <Link
                      to="/signup"
                      className="bg-white text-[#0A0B1E] px-8 py-4 rounded-2xl font-medium hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
                    >
                      Get Started Now
                    </Link>
                    <p className="text-xs text-[#0A0B1E]/60 dark:text-gray-500 mt-2">
                      No credit card required • 5 free chapter discoveries •
                      Instant access
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="relative -mb-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl shadow-2xl border border-yellow-200 p-8">
              <div className="flex items-center justify-center">
                <button
                  onClick={startGuidedTour}
                  className="flex items-center gap-4 bg-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-[#0A0B1E] font-bold text-xl">
                    Take a 2 min. tour
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="bg-white dark:bg-gray-900"
        style={{ padding: "118px 0 100px" }}
      >
        {/* Trust Signals Section */}
        <div className="py-16 overflow-hidden">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Powered by Enterprise-Grade Technology
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                MILLION+ BOOK RECORDS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                VERIFIED PUBLISHERS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                REAL-TIME SEARCH
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                AI-POWERED ANALYSIS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                GLOBAL COVERAGE
              </span>
            </div>
          </div>
        </div>

        {/* Large Quote */}
        <div
          className="max-w-6xl mx-auto px-6 text-center"
          style={{ padding: "15px 30px 80px" }}
        >
          <div className="relative">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-[#FFFD63] dark:bg-yellow-500 rounded-full"></div>
            <h2
              className="text-4xl md:text-5xl font-normal text-[#0A0B1E] dark:text-white leading-tight relative z-10 mb-12"
              style={{ paddingTop: "23px" }}
            >
              Find exactly what you need from any book. Stop searching through
              entire books. Start locating precise chapters instantly.
            </h2>

            {/* Enhanced Social Proof & Trust Signals */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 shadow-lg">
              {/* Trusted by Companies */}
              <div className="text-center mb-8">
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-6">
                  Trusted by learners at
                </p>
                <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">G</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Google
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Apple
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">M</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Microsoft
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">A</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Amazon
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Spotify
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Ratings */}
              <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div>
                    <div className="font-bold text-[#0A0B1E] dark:text-white">
                      4.9/5
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      G2 Reviews
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div>
                    <div className="font-bold text-[#0A0B1E] dark:text-white">
                      4.8/5
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Capterra
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                    50K+
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Chapter discoveries
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                    95%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Time saved vs traditional research
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                    2.5M+
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Books indexed
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                    99.9%
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Uptime guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A0B1E] dark:text-white mb-6">
              Powerful Features for Smart Learning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Discover why thousands of learners choose SummifyIO for targeted
              chapter discovery
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <div className="group">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A0B1E] dark:text-white mb-3">
                  Chapter Discovery
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Find exact chapters and page numbers from thousands of books
                  in seconds
                </p>
                <Link
                  to="/search-demo"
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  Try Demo →
                </Link>
              </div>
            </div>

            <div className="group">
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-2xl h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A0B1E] dark:text-white mb-3">
                  AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Understand why each chapter matters and what insights it
                  provides
                </p>
                <Link
                  to="/analysis-demo"
                  className="text-green-600 dark:text-green-400 font-medium hover:underline"
                >
                  Try Demo →
                </Link>
              </div>
            </div>

            <div className="group">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A0B1E] dark:text-white mb-3">
                  Chapter Insights
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Get comprehensive insights with quotes, context, and purchase
                  links
                </p>
                <Link
                  to="/summary-showcase"
                  className="text-orange-600 dark:text-orange-400 font-medium hover:underline"
                >
                  See Examples →
                </Link>
              </div>
            </div>

            <div className="group">
              <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-2xl h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A0B1E] dark:text-white mb-3">
                  Personal Library
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Save, organize, and share your chapter discoveries with others
                </p>
                <Link
                  to="/library-showcase"
                  className="text-pink-600 dark:text-pink-400 font-medium hover:underline"
                >
                  View Demo →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo Sections */}
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {/* Search Section */}
          <div className="relative">
            <div className="absolute -top-12 left-0 transform -rotate-12 z-30">
              <h3 className="text-8xl font-black text-[#0A0B1E] dark:text-white opacity-35">
                Search.
              </h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-3xl p-12 relative overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h4 className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-6">
                    Discover exact chapters and pages instantly
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 dark:text-gray-300 mb-8 leading-relaxed">
                    Precision search leads to targeted learning. Enter any topic
                    and our AI searches through thousands of books to find the
                    exact chapters and page numbers that address your specific
                    question.
                  </p>
                  <div className="space-y-4">
                    <Link
                      to={user ? "/generate" : "/signup"}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block mr-4"
                    >
                      {user ? "Try Search Now" : "Start Free Trial"}
                    </Link>
                    <Link
                      to="/search-demo"
                      className="bg-blue-200 dark:bg-blue-700 hover:bg-blue-300 dark:hover:bg-blue-600 text-[#0A0B1E] dark:text-white px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] dark:border-white inline-block"
                    >
                      Try Live Demo
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center">
                  <AIChatDemo
                    title="Chapter Discovery"
                    subtitle="Try asking about any topic to see how our AI finds exact chapters and pages"
                    demoType="search"
                    disableAutoScroll={true}
                    initialMessages={[
                      {
                        id: "1",
                        type: "ai",
                        content:
                          "Hi! I'm your book discovery assistant. What topic would you like to explore today?",
                        timestamp: "12:30",
                        status: "read",
                      },
                    ]}
                    suggestedPrompts={[
                      "Leadership",
                      "Productivity",
                      "AI & Technology",
                      "Personal Finance",
                    ]}
                    ctaText={user ? "Try Search Now" : "Start Free Trial"}
                    ctaLink={user ? "/generate" : "/signup"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Analyze Section */}
          <div className="relative">
            <div className="absolute -top-12 right-0 transform rotate-12">
              <h3 className="text-8xl font-black text-[#0A0B1E] dark:text-white opacity-20">
                Analyze.
              </h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-3xl p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 flex justify-center">
                  <AIChatDemo
                    title="Chapter Analysis"
                    subtitle="See how our AI explains why each chapter is relevant to your query"
                    demoType="analyze"
                    disableAutoScroll={true}
                    initialMessages={[
                      {
                        id: "1",
                        type: "ai",
                        content:
                          "Ready to dive deep? I can analyze multiple books on any topic and show you different perspectives. What interests you?",
                        timestamp: "12:30",
                        status: "read",
                      },
                    ]}
                    suggestedPrompts={[
                      "Innovation strategies",
                      "Building habits",
                      "Team management",
                      "Entrepreneurship",
                    ]}
                    ctaText={user ? "Analyze Now" : "Start Free Trial"}
                    ctaLink={user ? "/generate" : "/signup"}
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <h4 className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-6">
                    Analyze why each chapter matters
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 dark:text-gray-300 mb-8 leading-relaxed">
                    Go beyond just finding chapters. Our AI explains why each
                    chapter is relevant to your query, what unique insights it
                    provides, and how it addresses your specific needs without
                    revealing copyrighted content.
                  </p>
                  <div className="space-y-4">
                    <Link
                      to={user ? "/generate" : "/signup"}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block mr-4"
                    >
                      {user ? "Try Analysis Now" : "Start Free Trial"}
                    </Link>
                    <Link
                      to="/analysis-demo"
                      className="bg-green-200 dark:bg-green-700 hover:bg-green-300 dark:hover:bg-green-600 text-[#0A0B1E] dark:text-white px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] dark:border-white inline-block"
                    >
                      Try Live Demo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Section */}
          <div className="relative">
            <div className="absolute -top-12 left-0 transform -rotate-12">
              <h3 className="text-8xl font-black text-[#0A0B1E] dark:text-white opacity-20">
                Generate.
              </h3>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-3xl p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h4 className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-6">
                    Get precise chapter insights
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 dark:text-gray-300 mb-8 leading-relaxed">
                    Access targeted insights from each relevant chapter in
                    seconds. Get AI analysis of why each chapter matters, page
                    number references, affiliate purchase links, and actionable
                    next steps—all organized in a beautiful interface.
                  </p>
                  <div className="space-y-4">
                    <Link
                      to={user ? "/generate" : "/signup"}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block mr-4"
                    >
                      {user ? "Find Chapters" : "Start Free Trial"}
                    </Link>
                    <Link
                      to="/summary-showcase"
                      className="bg-orange-200 dark:bg-orange-700 hover:bg-orange-300 dark:hover:bg-orange-600 text-[#0A0B1E] dark:text-white px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] dark:border-white inline-block"
                    >
                      See Examples
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center">
                  <AIChatDemo
                    title="Chapter Insights"
                    subtitle="See how precise chapter analysis and insights are generated instantly"
                    demoType="generate"
                    disableAutoScroll={true}
                    initialMessages={[
                      {
                        id: "1",
                        type: "ai",
                        content:
                          "I create beautiful, comprehensive summaries with quotes and purchase links. What would you like me to summarize?",
                        timestamp: "12:30",
                        status: "read",
                      },
                    ]}
                    suggestedPrompts={[
                      "Effective leadership",
                      "Digital marketing",
                      "Mindfulness",
                      "Investment basics",
                    ]}
                    ctaText={user ? "Find Chapters" : "Start Free Trial"}
                    ctaLink={user ? "/generate" : "/signup"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="relative">
            <div className="absolute -top-12 right-0 transform rotate-12">
              <h3 className="text-8xl font-black text-[#0A0B1E] dark:text-white opacity-20">
                Share.
              </h3>
            </div>
            <div className="bg-pink-100 dark:bg-pink-900/30 rounded-3xl p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 flex justify-center">
                  <AIChatDemo
                    title="Share & Earn"
                    subtitle="Discover how to share insights and earn affiliate commissions"
                    demoType="share"
                    disableAutoScroll={true}
                    initialMessages={[
                      {
                        id: "1",
                        type: "ai",
                        content:
                          "Turn your insights into income! Share summaries and earn when friends buy books. What would you like to share first?",
                        timestamp: "12:30",
                        status: "read",
                      },
                    ]}
                    suggestedPrompts={[
                      "Leadership insights",
                      "Business strategy",
                      "Self-improvement",
                      "Career growth",
                    ]}
                    ctaText={user ? "Start Sharing" : "Join & Start Earning"}
                    ctaLink={user ? "/dashboard" : "/signup"}
                  />
                </div>
                <div className="order-1 lg:order-2">
                  <h4 className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-6">
                    Your personal chapter discovery library
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 dark:text-gray-300 mb-8 leading-relaxed">
                    Your SummifyIO account gives you one place to save chapter
                    discoveries, share targeted insights, and track your
                    learning journey. Build your personal library of chapter
                    locations and help friends discover exactly what they need.
                  </p>
                  <div className="space-y-4">
                    <Link
                      to={user ? "/dashboard" : "/signup"}
                      className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-colors inline-block mr-4"
                    >
                      {user ? "View Library" : "Start Free"}
                    </Link>
                    <Link
                      to="/library-showcase"
                      className="bg-pink-200 dark:bg-pink-700 hover:bg-pink-300 dark:hover:bg-pink-600 text-[#0A0B1E] dark:text-white px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] dark:border-white inline-block"
                    >
                      See Library Demo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Testimonials */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A0B1E] dark:text-white mb-4">
              Loved by smart learners worldwide
            </h2>
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-6 h-6 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-lg font-semibold text-[#0A0B1E] dark:text-white">
                4.9/5
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                from 500+ reviews
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager at Google",
                company: "Google",
                image: "SC",
                rating: 5,
                text: "SummifyIO transformed how I research leadership strategies. Instead of reading 10 full books, I found exactly what I needed in specific chapters. Saved me 30+ hours last month alone.",
                verified: true,
              },
              {
                name: "Marcus Rodriguez",
                role: "Startup Founder",
                company: "TechFlow",
                image: "MR",
                rating: 5,
                text: "The chapter discovery feature is incredible. I was researching venture capital and found the exact pages I needed across 7 different books in minutes. Game changer for entrepreneurs.",
                verified: true,
              },
              {
                name: "Dr. Emily Watson",
                role: "Learning & Development Director",
                company: "Microsoft",
                image: "EW",
                rating: 5,
                text: "Our L&D team uses SummifyIO to create targeted reading lists. The AI analysis helps us understand which chapters address specific skill gaps. ROI has been phenomenal.",
                verified: true,
              },
              {
                name: "James Kim",
                role: "Investment Analyst",
                company: "Goldman Sachs",
                image: "JK",
                rating: 5,
                text: "Research is everything in my field. SummifyIO helps me find relevant chapters on market analysis and investment strategies across hundreds of finance books instantly.",
                verified: true,
              },
              {
                name: "Priya Patel",
                role: "UX Design Lead",
                company: "Airbnb",
                image: "PP",
                rating: 5,
                text: "I needed insights on behavioral psychology for user research. Found exact chapters from 12 books that were perfectly relevant. The AI explanations saved hours of evaluation.",
                verified: true,
              },
              {
                name: "Alex Thompson",
                role: "MBA Student",
                company: "Harvard Business School",
                image: "AT",
                rating: 5,
                text: "Writing my thesis on organizational behavior. SummifyIO helped me locate specific chapters and pages from academic and business books. My advisor was impressed with the targeted research.",
                verified: true,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FFFD63] to-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-[#0A0B1E] font-bold text-sm">
                        {testimonial.image}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-[#0A0B1E] dark:text-white flex items-center gap-2">
                        {testimonial.name}
                        {testimonial.verified && (
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        {testimonial.role}
                      </div>
                      <div className="text-gray-500 dark:text-gray-500 text-xs">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>

          {/* View More Reviews CTA */}
          <div className="text-center mt-12">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[#0A0B1E] dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium"
            >
              Read all 500+ reviews
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#0A0B1E] via-gray-900 to-[#0A0B1E] text-white py-20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#FFFD63] rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full translate-x-48 translate-y-48"></div>
          </div>

          <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="mb-8">
              <span className="bg-[#FFFD63] text-[#0A0B1E] px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wide">
                Limited Time Offer
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Transform Your Learning Today
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Join thousands of smart learners who use SummifyIO to discover
              exact chapters, understand precise insights, and earn through
              affiliate links. Start finding exactly what you need.
            </p>

            {/* Value Proposition */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-[#FFFD63] text-2xl mb-2">💰</div>
                <h3 className="font-bold mb-2">Earn While You Learn</h3>
                <p className="text-gray-300 text-sm">
                  Get affiliate commissions from every book purchase
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-[#FFFD63] text-2xl mb-2">⚡</div>
                <h3 className="font-bold mb-2">10x Faster Discovery</h3>
                <p className="text-gray-300 text-sm">
                  Find exact chapters instead of reading entire books
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-[#FFFD63] text-2xl mb-2">📚</div>
                <h3 className="font-bold mb-2">Precise Chapter Locations</h3>
                <p className="text-gray-300 text-sm">
                  Get exact page numbers and why each chapter matters
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                to="/signup"
                className="inline-block bg-gradient-to-r from-[#FFFD63] to-yellow-400 text-[#0A0B1E] px-12 py-5 rounded-2xl font-bold text-xl hover:from-yellow-400 hover:to-[#FFFD63] transition-all shadow-2xl transform hover:scale-105 border-2 border-transparent hover:border-white"
              >
                🚀 Start Your Free Trial — Unlock Premium
              </Link>
              <p className="text-gray-400 text-sm">
                ✅ No credit card required • ✅ 5 free summaries • ✅ Cancel
                anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
