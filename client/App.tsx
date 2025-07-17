import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CollaborationProvider } from "@/contexts/CollaborationContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";
import HowItWorks from "./pages/HowItWorks";
import InsightsDemo from "./pages/InsightsDemo";
import Results from "./pages/Results";
import AccountSettings from "./pages/AccountSettings";
import SummaryShowcase from "./pages/SummaryShowcase";
import LibraryShowcase from "./pages/LibraryShowcase";
import SearchDemo from "./pages/SearchDemo";
import AnalysisDemo from "./pages/AnalysisDemo";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <ThemeProvider>
      <AuthProvider>
        <CollaborationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/generate" element={<Generate />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/insights-demo" element={<InsightsDemo />} />
              <Route path="/results" element={<Results />} />
              <Route path="/results/:id" element={<Results />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/summary-showcase" element={<SummaryShowcase />} />
              <Route path="/library-showcase" element={<LibraryShowcase />} />
              <Route path="/search-demo" element={<SearchDemo />} />
              <Route path="/analysis-demo" element={<AnalysisDemo />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CollaborationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
