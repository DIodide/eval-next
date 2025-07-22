"use client";

import React from "react";
import { PlayerSearchPanel } from "@/components/core/PlayerSearchPanel";
import type {
  PlayerSearchResult,
  PlayerSearchFilters,
  PlayerSearchError,
} from "@/components/core/PlayerSearchPanel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Coach Player Search Page
 *
 * Now uses the new modular PlayerSearchPanel component
 * which provides all the same functionality with better performance,
 * infinite scroll, optimistic updates, and cleaner architecture.
 */
export default function CoachPlayerSearchPage() {
  const router = useRouter();

  const handlePlayerSelect = (player: PlayerSearchResult) => {
    // Open player profile in new tab
    if (player.username) {
      window.open(`/profiles/player/${player.username}`, "_blank");
    } else {
      toast.info("Player profile not available");
    }
  };

  const handleFavoriteToggle = (playerId: string, favorited: boolean) => {
    // Optional: Add additional analytics or tracking here
    console.log(
      `Player ${playerId} ${favorited ? "favorited" : "unfavorited"}`,
    );
  };

  const handleFilterChange = (filters: PlayerSearchFilters) => {
    // Optional: Add analytics tracking for filter usage
    console.log("Filters changed:", filters);
  };

  const handleError = (error: PlayerSearchError) => {
    console.error("Player search error:", error);
    toast.error("Search Error", {
      description: error.message ?? "An error occurred while searching players",
    });
  };

  return (
    <PlayerSearchPanel
      permissionLevel="coach"
      showFilters={true}
      showGameTabs={true}
      showExport={false}
      showBulkActions={false}
      onPlayerSelect={handlePlayerSelect}
      onFavoriteToggle={handleFavoriteToggle}
      onFilterChange={handleFilterChange}
      onError={handleError}
      initialFilters={{
        // Start with no restrictive defaults to show all players
        favoritedOnly: false,
      }}
      className="min-h-screen"
    />
  );
}
