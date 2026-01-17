"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, RotateCcw, MapPin, GraduationCap, Bookmark, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerSearchFilters, SchoolType } from "../types";
import { DEFAULT_FILTERS, CLASS_YEARS, SCHOOL_TYPES } from "../utils/constants";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: PlayerSearchFilters;
  onFilterChange: <K extends keyof PlayerSearchFilters>(
    key: K,
    value: PlayerSearchFilters[K],
  ) => void;
  onReset: () => void;
  currentGameId?: string;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  currentGameId,
}: FilterDrawerProps) {
  // Count active filters
  const activeCount = React.useMemo(() => {
    let count = 0;
    if (filters.location) count++;
    if (filters.classYear.length > 0) count++;
    if (filters.minGpa !== undefined || filters.maxGpa !== undefined) count++;
    if (filters.schoolType.length > 0) count++;
    if (filters.role) count++;
    if (filters.playStyle) count++;
    if (filters.favoritedOnly) count++;
    return count;
  }, [filters]);

  const handleClassYearToggle = (year: string) => {
    const newYears = filters.classYear.includes(year)
      ? filters.classYear.filter((y) => y !== year)
      : [...filters.classYear, year];
    onFilterChange("classYear", newYears);
  };

  const handleSchoolTypeToggle = (type: SchoolType) => {
    const newTypes = filters.schoolType.includes(type)
      ? filters.schoolType.filter((t) => t !== type)
      : [...filters.schoolType, type];
    onFilterChange("schoolType", newTypes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-hidden border-white/10 bg-[#0f0f1a] p-0">
        <DialogHeader className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-xl font-semibold text-white">
                Filters
              </DialogTitle>
              {activeCount > 0 && (
                <Badge className="bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30">
                  {activeCount} active
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-6">
          <div className="space-y-8">
            {/* Location */}
            <FilterSection icon={MapPin} title="Location">
              <Input
                placeholder="State, city, or region..."
                value={filters.location}
                onChange={(e) => onFilterChange("location", e.target.value)}
                className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </FilterSection>

            {/* Graduation Year */}
            <FilterSection 
              icon={GraduationCap} 
              title="Graduation Year"
              badge={filters.classYear.length > 0 ? `${filters.classYear.length}` : undefined}
            >
              <div className="grid grid-cols-4 gap-2">
                {CLASS_YEARS.map((year) => {
                  const isSelected = filters.classYear.includes(year);
                  return (
                    <Button
                      key={year}
                      variant="outline"
                      size="sm"
                      onClick={() => handleClassYearToggle(year)}
                      className={cn(
                        "h-9 cursor-pointer rounded-lg border-white/10 font-medium transition-all",
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {year}
                    </Button>
                  );
                })}
              </div>
            </FilterSection>

            {/* GPA Range */}
            <FilterSection 
              icon={GraduationCap} 
              title="GPA Range"
              badge={
                (filters.minGpa !== undefined || filters.maxGpa !== undefined)
                  ? `${filters.minGpa?.toFixed(1) ?? "0"} - ${filters.maxGpa?.toFixed(1) ?? "4.0"}`
                  : undefined
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Minimum</Label>
                  <Input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={filters.minGpa ?? ""}
                    onChange={(e) =>
                      onFilterChange(
                        "minGpa",
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    placeholder="0.0"
                    className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Maximum</Label>
                  <Input
                    type="number"
                    min="0"
                    max="4"
                    step="0.1"
                    value={filters.maxGpa ?? ""}
                    onChange={(e) =>
                      onFilterChange(
                        "maxGpa",
                        e.target.value ? parseFloat(e.target.value) : undefined,
                      )
                    }
                    placeholder="4.0"
                    className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </div>
              </div>
            </FilterSection>

            {/* School Type */}
            <FilterSection 
              icon={GraduationCap} 
              title="School Type"
              badge={filters.schoolType.length > 0 ? `${filters.schoolType.length}` : undefined}
            >
              <div className="flex flex-wrap gap-2">
                {SCHOOL_TYPES.map((type) => {
                  const isSelected = filters.schoolType.includes(type.value);
                  return (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSchoolTypeToggle(type.value)}
                      className={cn(
                        "h-9 cursor-pointer rounded-lg border-white/10 font-medium transition-all",
                        isSelected
                          ? "border-cyan-500 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </FilterSection>

            {/* Game-specific filters */}
            {currentGameId && (
              <>
                <FilterSection icon={Gamepad2} title="Role">
                  <Input
                    placeholder="e.g. Duelist, Support..."
                    value={filters.role}
                    onChange={(e) => onFilterChange("role", e.target.value)}
                    className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </FilterSection>

                <FilterSection icon={Gamepad2} title="Play Style">
                  <Input
                    placeholder="e.g. Aggressive, Support..."
                    value={filters.playStyle}
                    onChange={(e) => onFilterChange("playStyle", e.target.value)}
                    className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
                  />
                </FilterSection>
              </>
            )}

            {/* Bookmarks Only */}
            <FilterSection icon={Bookmark} title="Bookmarks">
              <Button
                variant="outline"
                onClick={() => onFilterChange("favoritedOnly", !filters.favoritedOnly)}
                className={cn(
                  "h-11 w-full cursor-pointer justify-start rounded-lg border-white/10 font-medium transition-all",
                  filters.favoritedOnly
                    ? "border-cyan-500 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Bookmark className={cn("mr-2 h-4 w-4", filters.favoritedOnly && "fill-current")} />
                {filters.favoritedOnly ? "Showing Bookmarked Only" : "Show All Players"}
              </Button>
            </FilterSection>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-4">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onReset}
              disabled={activeCount === 0}
              className="flex-1 cursor-pointer rounded-lg border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-40"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-lg bg-cyan-500 font-semibold text-black hover:bg-cyan-400"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for filter sections
function FilterSection({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <Label className="text-sm font-medium text-gray-300">{title}</Label>
        {badge && (
          <Badge variant="secondary" className="ml-auto bg-cyan-500/10 text-xs text-cyan-400">
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}
