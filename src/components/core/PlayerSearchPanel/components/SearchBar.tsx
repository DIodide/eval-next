"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick: () => void;
  isLoading?: boolean;
  isDebouncing?: boolean;
  activeFilterCount?: number;
}

export function SearchBar({
  value,
  onChange,
  onFilterClick,
  isLoading = false,
  isDebouncing = false,
  activeFilterCount = 0,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          {isLoading || isDebouncing ? (
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>

        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name, school, or username..."
          className={cn(
            "h-12 rounded-xl border-white/10 bg-white/5 pl-12 pr-12",
            "text-white placeholder:text-gray-500",
            "transition-all duration-200",
            "focus:border-cyan-500/50 focus:bg-white/10 focus:ring-2 focus:ring-cyan-500/20",
            "hover:border-white/20 hover:bg-white/[0.07]"
          )}
        />

        {/* Clear button */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-2 my-auto h-8 w-8 cursor-pointer rounded-lg p-0 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Button */}
      <Button
        variant="outline"
        onClick={onFilterClick}
        className={cn(
          "h-12 gap-2 rounded-xl border-white/10 bg-white/5 px-4 cursor-pointer",
          "text-gray-300 transition-all duration-200",
          "hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-white",
          activeFilterCount > 0 && "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
        )}
      >
        <SlidersHorizontal className="h-5 w-5" />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-500 px-1.5 text-xs font-semibold text-black">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
}
