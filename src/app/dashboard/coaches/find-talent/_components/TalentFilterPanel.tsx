"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { api } from "@/trpc/react";

const CLASS_YEARS = [
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
];

const SCHOOL_TYPES = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "COLLEGE", label: "College" },
  { value: "UNIVERSITY", label: "University" },
] as const;

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
  "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
  "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
  "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
  "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
  "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
  "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming"
];

export interface TalentFilters {
  gameId?: string;
  classYears?: string[];
  schoolTypes?: ("HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY")[];
  locations?: string[];
  minGpa?: number;
  maxGpa?: number;
  roles?: string[];
}

interface TalentFilterPanelProps {
  filters: TalentFilters;
  onChange: (filters: TalentFilters) => void;
  onClear: () => void;
}

export function TalentFilterPanel({
  filters,
  onChange,
  onClear,
}: TalentFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch available games
  const { data: availableGames } = api.playerProfile.getAvailableGames.useQuery(
    undefined,
    {
      staleTime: 15 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  );

  const hasActiveFilters =
    filters.gameId ||
    (filters.classYears && filters.classYears.length > 0) ||
    (filters.schoolTypes && filters.schoolTypes.length > 0) ||
    (filters.locations && filters.locations.length > 0) ||
    filters.minGpa !== undefined ||
    filters.maxGpa !== undefined;

  const activeFilterCount = [
    filters.gameId,
    filters.classYears?.length,
    filters.schoolTypes?.length,
    filters.locations?.length,
    filters.minGpa !== undefined || filters.maxGpa !== undefined,
  ].filter(Boolean).length;

  const handleGameChange = (value: string) => {
    onChange({
      ...filters,
      gameId: value === "all" ? undefined : value,
    });
  };

  const handleClassYearToggle = (year: string) => {
    const current = filters.classYears ?? [];
    const updated = current.includes(year)
      ? current.filter((y) => y !== year)
      : [...current, year];
    onChange({
      ...filters,
      classYears: updated.length > 0 ? updated : undefined,
    });
  };

  const handleSchoolTypeToggle = (type: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY") => {
    const current = filters.schoolTypes ?? [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({
      ...filters,
      schoolTypes: updated.length > 0 ? updated : undefined,
    });
  };

  const handleLocationChange = (value: string) => {
    if (value === "all") {
      onChange({ ...filters, locations: undefined });
    } else {
      const current = filters.locations ?? [];
      if (!current.includes(value)) {
        onChange({ ...filters, locations: [...current, value] });
      }
    }
  };

  const handleRemoveLocation = (location: string) => {
    const updated = (filters.locations ?? []).filter((l) => l !== location);
    onChange({
      ...filters,
      locations: updated.length > 0 ? updated : undefined,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex cursor-pointer items-center gap-2 text-gray-300 transition-colors hover:text-white"
        >
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="bg-cyan-500/20 text-cyan-400">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="cursor-pointer text-gray-400 hover:text-white"
          >
            <X className="mr-1 h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>

      {/* Quick filters - always visible */}
      <div className="flex flex-wrap gap-3">
        {/* Game Filter */}
        <Select
          value={filters.gameId ?? "all"}
          onValueChange={handleGameChange}
        >
          <SelectTrigger className="w-[180px] border-gray-700 bg-gray-800 text-white">
            <SelectValue placeholder="All Games" />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-800">
            <SelectItem value="all" className="text-gray-300">
              All Games
            </SelectItem>
            {availableGames?.map((game) => (
              <SelectItem key={game.id} value={game.id} className="text-white">
                {game.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Class Year Quick Filters */}
        <div className="flex flex-wrap gap-1.5">
          {CLASS_YEARS.slice(0, 4).map((year) => (
            <button
              key={year}
              onClick={() => handleClassYearToggle(year)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-sm transition-all ${
                filters.classYears?.includes(year)
                  ? "bg-cyan-500 text-white"
                  : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-800 pt-4">
          {/* Class Year - All Options */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Class Year
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CLASS_YEARS.map((year) => (
                <button
                  key={year}
                  onClick={() => handleClassYearToggle(year)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm transition-all ${
                    filters.classYears?.includes(year)
                      ? "bg-cyan-500 text-white"
                      : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* School Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              School Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SCHOOL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSchoolTypeToggle(type.value)}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-sm transition-all ${
                    filters.schoolTypes?.includes(type.value)
                      ? "bg-cyan-500 text-white"
                      : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Location (State)
            </label>
            <div className="space-y-2">
              <Select onValueChange={handleLocationChange}>
                <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-white">
                  <SelectValue placeholder="Add a state..." />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] border-gray-700 bg-gray-800">
                  {US_STATES.filter(
                    (state) => !filters.locations?.includes(state)
                  ).map((state) => (
                    <SelectItem key={state} value={state} className="text-white">
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filters.locations && filters.locations.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filters.locations.map((location) => (
                    <Badge
                      key={location}
                      variant="secondary"
                      className="cursor-pointer bg-gray-700 text-white hover:bg-gray-600"
                      onClick={() => handleRemoveLocation(location)}
                    >
                      {location}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* GPA Range */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-400">
              GPA Range
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={0}
                max={4}
                step={0.1}
                value={filters.minGpa ?? ""}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minGpa: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-24 border-gray-700 bg-gray-800 text-white"
              />
              <span className="text-gray-500">to</span>
              <Input
                type="number"
                placeholder="Max"
                min={0}
                max={4}
                step={0.1}
                value={filters.maxGpa ?? ""}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    maxGpa: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                className="w-24 border-gray-700 bg-gray-800 text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
