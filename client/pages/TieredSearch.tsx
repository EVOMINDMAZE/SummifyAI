import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import TieredSearchInterface from "@/components/TieredSearchInterface";

export default function TieredSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUpgrade = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="py-6">
        <TieredSearchInterface onUpgrade={handleUpgrade} />
      </div>
    </div>
  );
}
