import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, X, Calendar, TrendingUp, Building } from "lucide-react";

export interface SearchFilters {
  publicationYearRange: [number, number];
  difficultyLevel: "any" | "beginner" | "intermediate" | "advanced";
  industryFocus: string[];
  bookCategories: string[];
  minRating: number;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Startup",
  "Non-profit",
  "Government",
];

const BOOK_CATEGORIES = [
  "Business",
  "Leadership",
  "Management",
  "Psychology",
  "Self-Help",
  "Communication",
  "Productivity",
  "Innovation",
  "Strategy",
  "Marketing",
  "Sales",
  "Finance",
  "Entrepreneurship",
  "Team Building",
  "Negotiation",
];

export default function SearchFilters({
  filters,
  onFiltersChange,
  isVisible,
  onToggleVisibility,
}: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>({
    publicationYearRange: [1990, 2024],
    difficultyLevel: "any",
    industryFocus: [],
    bookCategories: [],
    minRating: 0,
    ...filters,
  });

  // Sync localFilters with props when they change
  useEffect(() => {
    setLocalFilters({
      publicationYearRange: [1990, 2024],
      difficultyLevel: "any",
      industryFocus: [],
      bookCategories: [],
      minRating: 0,
      ...filters,
    });
  }, [filters]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K],
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (array: string[] | undefined, item: string) => {
    const safeArray = array || [];
    return safeArray.includes(item)
      ? safeArray.filter((i) => i !== item)
      : [...safeArray, item];
  };

  const resetFilters = () => {
    const defaultFilters: SearchFilters = {
      publicationYearRange: [1990, new Date().getFullYear()],
      difficultyLevel: "any",
      industryFocus: [],
      bookCategories: [],
      minRating: 0,
    };
    setLocalFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.difficultyLevel !== "any" ||
      (localFilters.industryFocus || []).length > 0 ||
      (localFilters.bookCategories || []).length > 0 ||
      localFilters.minRating > 0 ||
      localFilters.publicationYearRange[0] > 1990 ||
      localFilters.publicationYearRange[1] < new Date().getFullYear()
    );
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        onClick={onToggleVisibility}
        className={`border-2 transition-all ${
          isVisible
            ? "border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-200 dark:border-gray-600"
        }`}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters() && (
          <Badge
            variant="secondary"
            className="ml-2 bg-blue-600 text-white px-2 py-0.5 text-xs"
          >
            Active
          </Badge>
        )}
      </Button>

      {/* Filters Panel */}
      {isVisible && (
        <Card className="absolute top-12 right-0 z-50 w-96 max-w-[calc(100vw-2rem)] shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl transform translate-x-0 sm:translate-x-0 lg:-translate-x-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Filters
              </h3>
              <div className="flex items-center space-x-2">
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Reset
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleVisibility}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Difficulty Level
                </label>
                <Select
                  value={localFilters.difficultyLevel}
                  onValueChange={(value) =>
                    updateFilter(
                      "difficultyLevel",
                      value as SearchFilters["difficultyLevel"],
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Level</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Book Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Book Categories
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {BOOK_CATEGORIES.map((category) => {
                    const isSelected = (
                      localFilters.bookCategories || []
                    ).includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() =>
                          updateFilter(
                            "bookCategories",
                            toggleArrayFilter(
                              localFilters.bookCategories,
                              category,
                            ),
                          )
                        }
                        className={`text-left px-2 py-1 rounded text-xs border transition-colors ${
                          isSelected
                            ? "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
                            : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
                {localFilters.bookCategories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {localFilters.bookCategories.map((category) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs"
                      >
                        {category}
                        <button
                          onClick={() =>
                            updateFilter(
                              "bookCategories",
                              localFilters.bookCategories.filter(
                                (c) => c !== category,
                              ),
                            )
                          }
                          className="ml-1 hover:text-purple-900 dark:hover:text-purple-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating:{" "}
                  {localFilters.minRating > 0
                    ? `${localFilters.minRating}+ stars`
                    : "Any"}
                </label>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={localFilters.minRating}
                    onChange={(e) =>
                      updateFilter("minRating", parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
