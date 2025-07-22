import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2, X } from "lucide-react";
import type { SearchBarProps } from "../types";
import { UI_CONFIG } from "../utils/constants";

/**
 * SearchBar component with debounced search input and filter controls
 */
export function SearchBar({
  value,
  onChange,
  placeholder = UI_CONFIG.SEARCH_PLACEHOLDER,
  loading = false,
  onFilterToggle,
  showFilterButton = true,
}: SearchBarProps) {
  const handleClearSearch = () => {
    onChange("");
  };

  return (
    <div className="flex items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />

        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-gray-600 bg-gray-900 pr-10 pl-10 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
          // Never disable the input - let users keep typing while search processes
          disabled={false}
        />

        {/* Loading spinner or clear button */}
        {loading ? (
          <Loader2 className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        ) : value ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 p-0 text-gray-400 hover:text-white"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        ) : null}
      </div>

      {/* Filter Toggle Button */}
      {showFilterButton && onFilterToggle && (
        <Button
          variant="outline"
          size="icon"
          onClick={onFilterToggle}
          className="border-gray-600 bg-gray-900 text-gray-300 hover:bg-gray-800 hover:text-white"
          aria-label="Toggle filters"
        >
          <Filter className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
