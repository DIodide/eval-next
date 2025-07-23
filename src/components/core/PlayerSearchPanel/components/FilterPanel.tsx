import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterPanelProps } from "../types";
import { DEFAULT_FILTERS, UI_CONFIG, CLASS_YEARS } from "../utils/constants";

/**
 * Completely reconstructed FilterPanel component
 * Designed to work harmoniously with the existing UI design system
 */
export function FilterPanel({
  filters,
  onFilterChange,
  gameId,
  isOpen,
  onClose,
  availableRanks = [],
}: FilterPanelProps) {
  const hasActiveFilters = React.useMemo(() => {
    const defaultFilters = DEFAULT_FILTERS;
    return Object.keys(filters).some((key) => {
      const filterKey = key as keyof typeof filters;
      const currentValue = filters[filterKey];
      const defaultValue = defaultFilters[filterKey];

      if (Array.isArray(currentValue) && Array.isArray(defaultValue)) {
        return (
          currentValue.length !== defaultValue.length ||
          currentValue.some((val, idx) => val !== defaultValue[idx])
        );
      }

      return currentValue !== defaultValue;
    });
  }, [filters]);

  const handleResetFilters = () => {
    onFilterChange(DEFAULT_FILTERS);
  };

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | boolean | number | string[] | undefined,
  ) => {
    onFilterChange({ [key]: value } as Partial<typeof filters>);
  };

  const filterContent = (
    <div className="flex h-full flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <h2 className="font-orbitron text-lg font-semibold text-white">
            Filters
          </h2>
          {hasActiveFilters && (
            <Badge className="bg-cyan-600 text-xs text-white">Active</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {/* Location Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Location
            </Label>
            <Input
              placeholder="State, city, or region..."
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
              className="border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
            />
          </div>

          {/* Class Year Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Graduation Year
              {filters.classYear.length > 0 && (
                <span className="ml-2 text-xs text-cyan-400">
                  ({filters.classYear.length} selected)
                </span>
              )}
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {CLASS_YEARS.map((year) => {
                const isSelected = filters.classYear.includes(year);
                return (
                  <Button
                    key={year}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newClassYears = isSelected
                        ? filters.classYear.filter((y) => y !== year)
                        : [...filters.classYear, year];
                      handleFilterChange("classYear", newClassYears);
                    }}
                    className={cn(
                      "justify-center transition-colors",
                      isSelected
                        ? "border-cyan-500 bg-cyan-600 text-white hover:bg-cyan-700"
                        : "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white",
                    )}
                  >
                    {year}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* GPA Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              GPA Range
              {(filters.minGpa !== undefined ||
                filters.maxGpa !== undefined) && (
                <span className="ml-2 text-xs text-cyan-400">
                  ({filters.minGpa?.toFixed(1) ?? "Any"} -{" "}
                  {filters.maxGpa?.toFixed(1) ?? "Any"})
                </span>
              )}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Minimum</Label>
                <Input
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={filters.minGpa ?? ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "minGpa",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder="0.0"
                  className="border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Maximum</Label>
                <Input
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  value={filters.maxGpa ?? ""}
                  onChange={(e) =>
                    handleFilterChange(
                      "maxGpa",
                      e.target.value ? parseFloat(e.target.value) : undefined,
                    )
                  }
                  placeholder="4.0"
                  className="border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Game-Specific Filters */}
          {gameId && (
            <>
              {/* Role Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">
                  Role
                </Label>
                <Input
                  placeholder="Player role..."
                  value={filters.role}
                  onChange={(e) => handleFilterChange("role", e.target.value)}
                  className="border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>

              {/* Play Style Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-300">
                  Play Style
                </Label>
                <Input
                  placeholder="Aggressive, support, etc..."
                  value={filters.playStyle}
                  onChange={(e) =>
                    handleFilterChange("playStyle", e.target.value)
                  }
                  className="border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>
            </>
          )}

          {/* Favorites Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">
              Bookmarks
            </Label>
            <Button
              variant="outline"
              onClick={() =>
                handleFilterChange("favoritedOnly", !filters.favoritedOnly)
              }
              className={cn(
                "w-full justify-start transition-colors",
                filters.favoritedOnly
                  ? "border-cyan-500 bg-cyan-600 text-white hover:bg-cyan-700"
                  : "border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white",
              )}
            >
              {filters.favoritedOnly && <Check className="mr-2 h-4 w-4" />}
              {filters.favoritedOnly
                ? "Showing Bookmarks Only"
                : "Show All Players"}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-700 px-6 py-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            disabled={!hasActiveFilters}
            className="flex-1 border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-50"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-cyan-600 text-white hover:bg-cyan-700"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "absolute top-0 right-0 z-20 h-full transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{
          width: UI_CONFIG.FILTER_PANEL_WIDTH,
        }}
      >
        {filterContent}
      </div>
    </>
  );
}
