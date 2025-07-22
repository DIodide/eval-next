import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterPanelProps } from "../types";
import { DEFAULT_FILTERS, UI_CONFIG, CLASS_YEARS } from "../utils/constants";

/**
 * FilterPanel component with responsive design
 * Simplified version without external dependencies
 */
export function FilterPanel({
  filters,
  onFilterChange,
  gameId,
  isOpen,
  onClose,
  availableRanks = [],
}: FilterPanelProps) {
  const handleResetFilters = () => {
    onFilterChange(DEFAULT_FILTERS);
  };

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | boolean | number | string[] | undefined,
  ) => {
    onFilterChange({ [key]: value } as Partial<typeof filters>);
  };

  const content = (
    <div className="space-y-6 p-6">
      {/* Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-gray-300">
          Location
        </Label>
        <Input
          id="location"
          placeholder="State or city..."
          value={filters.location}
          onChange={(e) => handleFilterChange("location", e.target.value)}
          className="border-gray-600 bg-gray-900 text-white"
        />
      </div>

      {/* Class Year Filter */}
      <div className="space-y-2">
        <Label className="text-gray-300">
          Class Year{" "}
          {filters.classYear.length > 0 &&
            `(${filters.classYear.length} selected)`}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {CLASS_YEARS.map((year) => (
            <Button
              key={year}
              variant={filters.classYear.includes(year) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newClassYears = filters.classYear.includes(year)
                  ? filters.classYear.filter((y) => y !== year)
                  : [...filters.classYear, year];
                handleFilterChange("classYear", newClassYears);
              }}
              className={
                filters.classYear.includes(year)
                  ? "border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700"
                  : "border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
              }
            >
              {year}
            </Button>
          ))}
        </div>
      </div>

      {/* GPA Range */}
      <div className="space-y-2">
        <Label className="text-gray-300">
          GPA Range: {filters.minGpa?.toFixed(1) ?? "Any"} -{" "}
          {filters.maxGpa?.toFixed(1) ?? "Any"}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-400">Min GPA</Label>
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
              className="border-gray-600 bg-gray-900 text-white"
              placeholder="Min GPA"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-400">Max GPA</Label>
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
              className="border-gray-600 bg-gray-900 text-white"
              placeholder="Max GPA"
            />
          </div>
        </div>
      </div>

      {/* Favorites Only Toggle */}
      <div className="space-y-2">
        <Label className="text-gray-300">Favorites</Label>
        <Button
          variant={filters.favoritedOnly ? "default" : "outline"}
          onClick={() =>
            handleFilterChange("favoritedOnly", !filters.favoritedOnly)
          }
          className={
            filters.favoritedOnly
              ? "w-full bg-cyan-600 text-white hover:bg-cyan-700"
              : "w-full border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
          }
        >
          {filters.favoritedOnly
            ? "Showing Bookmarks Only"
            : "Show All Players"}
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="flex-1 border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
        >
          Reset Filters
        </Button>
        <Button
          onClick={onClose}
          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  // Desktop sidebar implementation
  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full border-l border-gray-700 bg-gray-900",
        "z-40 transform overflow-y-auto transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
      style={{ width: UI_CONFIG.FILTER_PANEL_WIDTH }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h3 className="font-semibold text-white">Filters</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close filters"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="h-[calc(100vh-65px)] overflow-y-auto">{content}</div>
    </div>
  );
}
