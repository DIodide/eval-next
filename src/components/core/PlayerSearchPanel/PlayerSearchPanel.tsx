"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PlayerSearchPanelProps, PlayerSearchResult } from "./types";
import { DEFAULT_FILTERS, PERFORMANCE_CONFIG } from "./utils/constants";
import { usePlayerSearch } from "./hooks/usePlayerSearch";
import { usePlayerFavorites } from "./hooks/usePlayerFavorites";
import { SearchBar } from "./components/SearchBar";
import { FilterPanel } from "./components/FilterPanel";
import { PlayerTable } from "./components/PlayerTable";
import { Pagination } from "./components/Pagination";
import { PlayerProfilePreview } from "./components/PlayerProfilePreview";
import { api } from "@/trpc/react";
import { OnboardingGuard } from "@/components/ui/OnboardingGuard";

/**
 * PlayerSearchPanel - A comprehensive player search and management component
 *
 * Enhanced with real UI components and working infinite scroll
 */
export function PlayerSearchPanel({
  // Permission & Access Control
  permissionLevel = "coach",
  viewMode: _viewMode = "full",
  allowedFeatures,

  // Initial State
  initialFilters = {},
  initialGame,
  defaultPageSize: _defaultPageSize = PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE,

  // Display Configuration
  showFilters = true,
  showGameTabs = true,
  showExport: _showExport = false,
  showBulkActions: _showBulkActions = false,
  mobileBreakpoint: _mobileBreakpoint = 768,

  // Styling
  className,
  theme: _theme = "dark",

  // Callbacks
  onPlayerSelect,
  onFavoriteToggle,
  onFilterChange,
  onError,
}: PlayerSearchPanelProps) {
  const [currentGameId, setCurrentGameId] = useState<string>(initialGame ?? "");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState<PlayerSearchResult | null>(
    null,
  );

  // Initialize hooks
  const combinedFilters = {
    ...DEFAULT_FILTERS,
    ...initialFilters,
    gameId: currentGameId || initialFilters.gameId,
  };

  const {
    players,
    filters,
    setFilters,
    currentPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    pagination,
    isLoading,
    isFiltering,
    error,
  } = usePlayerSearch(combinedFilters, _defaultPageSize);

  const { favoritePlayer, unfavoritePlayer, pendingFavorites } =
    usePlayerFavorites();

  // Fetch available games
  const { data: games = [] } = api.playerProfile.getAvailableGames.useQuery();
  const utils = api.useUtils();

  // Prefetch first page for all game filters to improve tab switching performance
  React.useEffect(() => {
    if (games.length === 0) return; // Wait for games to load

    // Use base filters from initial state for prefetching (no search term to avoid wasted requests)
    const basePrefetchFilters = {
      ...DEFAULT_FILTERS,
      ...initialFilters,
      // Remove search term for initial prefetching to get more useful base data
      search: "",
    };

    // Prefetch "All Games" (empty gameId)
    void utils.playerSearch.searchPlayersPaginated.prefetch(
      {
        ...basePrefetchFilters,
        gameId: undefined,
        page: 1,
        limit: _defaultPageSize,
      },
      {
        staleTime: PERFORMANCE_CONFIG.STALE_TIME,
      },
    );

    // Prefetch each individual game
    games.forEach((game) => {
      void utils.playerSearch.searchPlayersPaginated.prefetch(
        {
          ...basePrefetchFilters,
          gameId: game.id,
          page: 1,
          limit: _defaultPageSize,
        },
        {
          staleTime: PERFORMANCE_CONFIG.STALE_TIME,
        },
      );
    });
  }, [games, utils, _defaultPageSize, initialFilters]); // Dependencies for prefetching

  // Handle errors
  React.useEffect(() => {
    if (error && onError) {
      onError({
        type: "search",
        message: error.message || "Failed to search players",
        details: error,
        retryable: true,
      });
    }
  }, [error, onError]);

  // Handle filter changes
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  // Handle favorite toggle
  const handleFavoriteToggle = async (player: PlayerSearchResult) => {
    if (pendingFavorites.has(player.id)) {
      return; // Prevent duplicate requests
    }

    try {
      if (player.isFavorited) {
        await unfavoritePlayer(player.id);
      } else {
        await favoritePlayer(player.id, { tags: ["prospect"] });
      }
      onFavoriteToggle?.(player.id, !player.isFavorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Handle player selection - show preview modal instead of navigating
  const handlePlayerSelect = (player: PlayerSearchResult) => {
    setPreviewPlayer(player);
  };

  // Handle viewing full profile from preview modal
  const handleViewFullProfile = (player: PlayerSearchResult) => {
    onPlayerSelect?.(player);
  };

  // Handle prefetching for smoother navigation (hover-based)
  const handlePrefetchPage = (page: number) => {
    if (page < 1 || (pagination && page > pagination.totalPages)) return;

    // Only prefetch if it's not already auto-prefetched (beyond current + 4 pages or before current)
    const isAlreadyPrefetched =
      page > currentPage &&
      page <= currentPage + PERFORMANCE_CONFIG.PREFETCH_PAGES;

    if (!isAlreadyPrefetched) {
      void utils.playerSearch.searchPlayersPaginated.prefetch(
        {
          ...combinedFilters,
          page,
          limit: _defaultPageSize,
        },
        {
          staleTime: PERFORMANCE_CONFIG.STALE_TIME,
        },
      );
    }
  };

  return (
    <OnboardingGuard>
      <div className={cn("relative min-h-screen bg-gray-900", className)}>
        {/* Header */}
        <div className="border-b border-gray-700 p-6">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-white">
              Player Search
            </h1>
            <p className="font-rajdhani text-gray-400">
              Search and recruit players across all supported games
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={cn(
            "relative flex-1 p-6 transition-all duration-300",
            filterPanelOpen && "lg:mr-80",
          )}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar
              value={filters.search}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, search: value }))
              }
              // Only show loading for actual API requests, not during debounce
              loading={isLoading}
              onFilterToggle={
                showFilters
                  ? () => setFilterPanelOpen(!filterPanelOpen)
                  : undefined
              }
              showFilterButton={showFilters}
              filterPanelOpen={filterPanelOpen}
            />
          </div>

          {/* Game Tabs */}
          {showGameTabs && (
            <Tabs
              value={currentGameId}
              onValueChange={(value) => {
                setCurrentGameId(value);
                setFilters((prev) => ({ ...prev, gameId: value || undefined }));
              }}
              className="mb-6 w-full"
            >
              <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                <TabsTrigger
                  value=""
                  className="text-gray-300 data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                >
                  All Games
                </TabsTrigger>
                {games.map((game) => (
                  <TabsTrigger
                    key={game.id}
                    value={game.id}
                    className="text-gray-300 data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                  >
                    {game.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Tab Content */}
              <TabsContent value={currentGameId} className="space-y-4">
                <Card className="overflow-hidden border-gray-800 bg-gray-900">
                  <CardContent className="-my-6 p-0">
                    {/* Status indicators - only show when needed */}
                    {(isFiltering ||
                      (filters.search &&
                        filters.search.trim() !== "" &&
                        filters.search.trim().length <
                          PERFORMANCE_CONFIG.MIN_SEARCH_LENGTH)) && (
                      <div className="border-b border-gray-700 bg-gray-900 px-6 py-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          {isFiltering ? (
                            <>
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-cyan-400"></div>
                              Filtering results...
                            </>
                          ) : (
                            <span>
                              Type at least{" "}
                              {PERFORMANCE_CONFIG.MIN_SEARCH_LENGTH} characters
                              to search...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <PlayerTable
                      players={players}
                      // Only show skeleton loading for initial load, not for filtering
                      loading={isLoading && !isFiltering}
                      onPlayerSelect={handlePlayerSelect}
                      onFavoriteToggle={handleFavoriteToggle}
                    />

                    {/* Pagination Controls */}
                    {pagination && pagination.totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={goToPage}
                        onPreviousPage={goToPreviousPage}
                        onNextPage={goToNextPage}
                        hasNextPage={pagination.hasNextPage}
                        hasPreviousPage={pagination.hasPreviousPage}
                        totalCount={pagination.totalCount}
                        pageSize={pagination.limit}
                        onPrefetchPage={handlePrefetchPage}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={(newFilters) =>
              setFilters((prev) => ({ ...prev, ...newFilters }))
            }
            gameId={currentGameId}
            isOpen={filterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
          />
        )}

        {/* Player Profile Preview Modal */}
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
