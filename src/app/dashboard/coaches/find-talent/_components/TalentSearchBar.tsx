"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, X } from "lucide-react";
import { useState, useEffect } from "react";

interface TalentSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function TalentSearchBar({
  value,
  onChange,
  onSearch,
  isLoading = false,
  placeholder = "Describe the player you're looking for...",
}: TalentSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localValue);
    onSearch();
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  const exampleQueries = [
    "Aggressive duelist with high first-blood rate",
    "IGL with strong communication skills",
    "College-bound players from California",
    "Support players with high assist stats",
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400" />
            <Input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder={placeholder}
              className="h-14 rounded-xl border-gray-700 bg-gray-800/80 pl-12 pr-10 text-lg text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-cyan-500/20"
              disabled={isLoading}
            />
            {localValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            disabled={!localValue.trim() || isLoading}
            className="h-14 cursor-pointer rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 text-lg font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/40 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                <span>Search</span>
              </div>
            )}
          </Button>
        </div>
      </form>

      {/* Example queries */}
      {!value && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Try:</span>
          {exampleQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => {
                setLocalValue(query);
                onChange(query);
              }}
              className="cursor-pointer rounded-full border border-gray-700 bg-gray-800/50 px-3 py-1 text-sm text-gray-400 transition-all hover:border-cyan-500/50 hover:bg-gray-700/50 hover:text-cyan-400"
            >
              {query}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
