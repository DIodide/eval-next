"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Heart, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const RECRUITING_FACTORS = [
  "Academics",
  "Location",
  "Level of Esports",
  "Level of Scholarship",
];

interface StepOneCollegeListProps {
  initialData?: {
    game_played?: string;
    gpa?: string;
    college_rankings?: string[];
    recruiting_factors?: string[];
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
  isSaving: boolean;
}

export function StepOneCollegeList({
  initialData,
  onSave,
  isSaving,
}: StepOneCollegeListProps) {
  const [phase, setPhase] = useState<"questions" | "search" | "complete">(
    initialData?.college_rankings && initialData.college_rankings.length >= 5
      ? "complete"
      : initialData?.game_played
        ? "search"
        : "questions",
  );
  const [gamePlayed, setGamePlayed] = useState(initialData?.game_played ?? "");
  const [gpa, setGpa] = useState(initialData?.gpa ?? "");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<
    { id: string; name: string; location?: string | null; state?: string | null }[]
  >(
    initialData?.college_rankings?.map((id) => ({ id, name: "" })) ?? [],
  );
  const [selectedFactors, setSelectedFactors] = useState<string[]>(
    initialData?.recruiting_factors ?? [],
  );

  const { data: colleges } = api.bootcamp.searchColleges.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: phase === "search" && searchQuery.length > 0 },
  );

  const toggleFavorite = (school: {
    id: string;
    name: string;
    location?: string | null;
    state?: string | null;
  }) => {
    setFavorites((prev) => {
      if (prev.find((f) => f.id === school.id)) {
        return prev.filter((f) => f.id !== school.id);
      }
      return [...prev, school];
    });
  };

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor)
        ? prev.filter((f) => f !== factor)
        : [...prev, factor],
    );
  };

  if (phase === "complete") {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-3 font-orbitron text-base font-bold text-white">College List Complete!</h3>
          <p className="mt-1 font-rajdhani text-sm text-white/40">{favorites.length} schools in your list</p>
        </CardContent>
      </Card>
    );
  }

  if (phase === "questions") {
    return (
      <div className="space-y-6">
        <Card className="border-white/10 bg-white/5">
          <CardContent>
            <h3 className="font-orbitron text-lg font-bold text-white">
              Find Esport Scholarships
            </h3>
            <p className="mt-2 font-rajdhani text-sm text-white/40">
              Help us find you the best scholarship fit.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/50">
                  What game do you play?
                </label>
                <Input
                  type="text"
                  value={gamePlayed}
                  onChange={(e) => setGamePlayed(e.target.value)}
                  placeholder="e.g., Valorant, Rocket League..."
                  className="mt-1 border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/50">
                  What is your GPA?
                </label>
                <Input
                  type="text"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="e.g., 3.5"
                  className="mt-1 border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Recruiting Factors */}
            <div className="mt-6">
              <label className="block font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/50">
                What factors matter most for recruiting?
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {RECRUITING_FACTORS.map((factor) => (
                  <Badge
                    key={factor}
                    variant="outline"
                    onClick={() => toggleFactor(factor)}
                    className={cn(
                      "cursor-pointer rounded-full px-4 py-2 font-rajdhani text-xs font-medium transition-all",
                      selectedFactors.includes(factor)
                        ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                        : "border-white/10 text-white/50 hover:border-white/20",
                    )}
                  >
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setPhase("search")}
              disabled={!gamePlayed.trim() || !gpa.trim()}
              className={cn(
                "mt-5 w-full font-rajdhani text-sm font-bold uppercase tracking-wider",
                gamePlayed.trim() && gpa.trim()
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "opacity-50 cursor-not-allowed",
              )}
            >
              Next: Find Schools
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Phase: search
  return (
    <div className="space-y-4">
      {/* Top 5 Schools */}
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <h3 className="font-orbitron text-base font-bold text-white">
            Top 5 Schools
          </h3>
          <p className="mt-1 font-rajdhani text-xs text-white/40">
            Heart at least 5 colleges to continue ({favorites.length}/5)
          </p>

          {favorites.length > 0 && (
            <div className="mt-3 space-y-2">
              {favorites.map((school, i) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between rounded border border-white/10 bg-white/[0.03] px-3 py-2"
                >
                  <span className="font-rajdhani text-sm text-white">
                    {i + 1}. {school.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite(school)}
                    className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-transparent"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search colleges..."
              className="border-white/10 bg-white/[0.03] pl-10 text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
            />
          </div>

          {colleges && colleges.length > 0 && (
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {colleges.map((school) => {
                const isFav = favorites.some((f) => f.id === school.id);
                return (
                  <div
                    key={school.id}
                    className="flex items-center justify-between rounded px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-rajdhani text-sm font-medium text-white">
                        {school.name}
                      </div>
                      <div className="text-xs text-white/30">
                        {[school.location, school.state].filter(Boolean).join(", ")}
                        {school.scholarships_available && " · Scholarships"}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        toggleFavorite({
                          id: school.id,
                          name: school.name,
                          location: school.location,
                          state: school.state,
                        })
                      }
                      className="ml-3 shrink-0"
                    >
                      <Heart
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isFav
                            ? "fill-red-500 text-red-500"
                            : "text-white/20 hover:text-red-400",
                        )}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery && colleges?.length === 0 && (
            <p className="mt-3 text-center font-rajdhani text-xs text-white/30">
              No colleges found
            </p>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={async () => {
          await onSave({
            game_played: gamePlayed,
            gpa,
            college_rankings: favorites.map((f) => f.id),
            college_names: favorites.map((f) => f.name),
            recruiting_factors: selectedFactors,
          });
          setPhase("complete");
        }}
        disabled={favorites.length < 5 || isSaving}
        className={cn(
          "w-full font-rajdhani text-sm font-bold uppercase tracking-wider",
          favorites.length >= 5
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            : "opacity-50 cursor-not-allowed",
        )}
      >
        {isSaving
          ? "Saving..."
          : favorites.length >= 5
            ? "Save College List"
            : `Select ${5 - favorites.length} more schools`}
      </Button>
    </div>
  );
}
