"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { OnboardingGuard } from "@/components/ui/OnboardingGuard";
import { Gamepad2 } from "lucide-react";

import type { PlayerSearchPanelProps, PlayerSearchResult } from "./types";
import { usePlayerSearch, usePlayerFavorites } from "./hooks/usePlayerSearch";
import { SearchBar } from "./components/SearchBar";
import { FilterDrawer } from "./components/FilterDrawer";
import { PlayerTable } from "./components/PlayerTable";
import { Pagination } from "./components/Pagination";
import { PlayerProfilePreview } from "./components/PlayerProfilePreview";

/**
 * PlayerSearchPanel - Complete redesign with cleaner architecture
 */
export function PlayerSearchPanel({
  onPlayerSelect,
  onFavoriteToggle,
  className,
}: PlayerSearchPanelProps) {
  // UI state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState<PlayerSearchResult | null>(null);
  const [activeGameId, setActiveGameId] = useState<string>("");

  // Data hooks
  const {
    players,
    pagination,
    filters,
    currentPage,
    isLoading,
    isDebouncing,
    updateFilter,
    updateFilters,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
  } = usePlayerSearch({ gameId: activeGameId || undefined });

  const { toggleFavorite, isPending } = usePlayerFavorites();

  // Fetch available games
  const { data: games = [] } = api.playerProfile.getAvailableGames.useQuery(undefined, {
    staleTime: 15 * 60 * 1000,
  });

  // Count active filters (excluding search and gameId)
  const activeFilterCount = useMemo(() => {
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

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    updateFilter("search", value);
  }, [updateFilter]);

  const handleGameChange = useCallback((gameId: string) => {
    setActiveGameId(gameId);
    updateFilter("gameId", gameId || undefined);
  }, [updateFilter]);

  const handlePlayerClick = useCallback((player: PlayerSearchResult) => {
    setPreviewPlayer(player);
  }, []);

  const handleViewFullProfile = useCallback((player: PlayerSearchResult) => {
    onPlayerSelect?.(player);
    setPreviewPlayer(null);
  }, [onPlayerSelect]);

  const handleFavoriteToggle = useCallback((player: PlayerSearchResult) => {
    toggleFavorite(player);
    onFavoriteToggle?.(player.id, !player.isFavorited);
  }, [toggleFavorite, onFavoriteToggle]);

  return (
    <OnboardingGuard>
      <div className={cn("min-h-screen bg-[#0a0a0f]", className)}>
        {/* Header */}
        <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <h1 className="bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
              Player Search
            </h1>
            <p className="mt-2 text-gray-400">
              Discover and recruit talented players across all supported games
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <SearchBar
              value={filters.search}
              onChange={handleSearchChange}
              onFilterClick={() => setFilterDrawerOpen(true)}
              isLoading={isLoading}
              isDebouncing={isDebouncing}
              activeFilterCount={activeFilterCount}
            />

            {/* Game Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <GameTab
                label="All Games"
                isActive={activeGameId === ""}
                onClick={() => handleGameChange("")}
              />
              {games.map((game) => (
                <GameTab
                  key={game.id}
                  label={game.short_name}
                  fullLabel={game.name}
                  isActive={activeGameId === game.id}
                  onClick={() => handleGameChange(game.id)}
                />
              ))}
            </div>

            {/* Search Status */}
            {isDebouncing && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
                Searching...
              </div>
            )}

            {/* Results */}
            <PlayerTable
              players={players}
              isLoading={isLoading && !isDebouncing}
              onPlayerClick={handlePlayerClick}
              onFavoriteToggle={handleFavoriteToggle}
              isPending={isPending}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <Pagination
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={goToPage}
                onPrevPage={prevPage}
                onNextPage={nextPage}
              />
            )}
          </div>
        </main>

        {/* Filter Drawer */}
        <FilterDrawer
          isOpen={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          filters={filters}
          onFilterChange={updateFilter}
          onReset={resetFilters}
          currentGameId={activeGameId}
        />

        {/* Player Preview Modal */}
        <PlayerProfilePreview
          player={previewPlayer}
          isOpen={previewPlayer !== null}
          onClose={() => setPreviewPlayer(null)}
          onViewFullProfile={handleViewFullProfile}
          onFavoriteToggle={handleFavoriteToggle}
        />
      </div>
    </OnboardingGuard>
  );
}

// Game tab component
function GameTab({
  label,
  fullLabel,
  isActive,
  onClick,
}: {
  label: string;
  fullLabel?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      title={fullLabel}
      className={cn(
        "h-10 cursor-pointer rounded-lg px-4 font-medium transition-all",
        isActive
          ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
          : "text-gray-400 hover:bg-white/10 hover:text-white"
      )}
    >
      {label === "All Games" ? (
        <>
          <Gamepad2 className="mr-2 h-4 w-4" />
          {label}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
