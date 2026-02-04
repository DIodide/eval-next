"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { TalentPlayerCard } from "./TalentPlayerCard";
import { Users, SearchX, Sparkles } from "lucide-react";
import type { TalentSearchResult } from "@/types/talent-search";

interface TalentResultsGridProps {
  results: TalentSearchResult[];
  isLoading?: boolean;
  query?: string;
  onSelectPlayer: (player: TalentSearchResult) => void;
  onFavoriteToggle?: (player: TalentSearchResult) => void;
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-gray-800 bg-gray-900/80 p-5"
        >
          <div className="mb-4 flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32 bg-gray-700" />
              <Skeleton className="h-4 w-24 bg-gray-700" />
            </div>
          </div>
          <Skeleton className="mb-3 h-6 w-20 rounded-full bg-gray-700" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-gray-700" />
            <Skeleton className="h-4 w-3/4 bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasSearched }: { hasSearched: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-6 rounded-full bg-gray-800 p-6">
        {hasSearched ? (
          <SearchX className="h-12 w-12 text-gray-500" />
        ) : (
          <Sparkles className="h-12 w-12 text-cyan-500" />
        )}
      </div>
      <h3 className="font-orbitron mb-2 text-xl font-semibold text-white">
        {hasSearched ? "No players found" : "Discover talent with AI"}
      </h3>
      <p className="max-w-md text-center text-gray-400">
        {hasSearched
          ? "Try adjusting your search query or filters to find more players."
          : "Use natural language to describe the type of player you're looking for. Our AI will find the best matches."}
      </p>
    </div>
  );
}

export function TalentResultsGrid({
  results,
  isLoading = false,
  query,
  onSelectPlayer,
  onFavoriteToggle,
}: TalentResultsGridProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (results.length === 0) {
    return <EmptyState hasSearched={!!query} />;
  }

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="h-4 w-4" />
          <span>
            <span className="font-semibold text-white">{results.length}</span>{" "}
            player{results.length !== 1 ? "s" : ""} found
          </span>
        </div>
        {query && (
          <p className="text-sm text-gray-500">
            Sorted by AI relevance to your search
          </p>
        )}
      </div>

      {/* Results grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {results.map((player) => (
          <TalentPlayerCard
            key={player.id}
            player={player}
            onSelect={onSelectPlayer}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>
    </div>
  );
}
