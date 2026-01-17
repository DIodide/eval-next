"use client";

import React from "react";
import { PlayerSearchPanel } from "@/components/core/PlayerSearchPanel";
import type { PlayerSearchResult } from "@/components/core/PlayerSearchPanel";
import { toast } from "sonner";

/**
 * Coach Player Search Page
 *
 * Uses the redesigned PlayerSearchPanel component with cleaner architecture
 * and improved performance.
 */
export default function CoachPlayerSearchPage() {
  const handlePlayerSelect = (player: PlayerSearchResult) => {
    // Open player profile in new tab
    if (player.username) {
      window.open(`/profiles/player/${player.username}`, "_blank");
    } else {
      toast.info("Player profile not available");
    }
  };

  const handleFavoriteToggle = (playerId: string, favorited: boolean) => {
    // Analytics tracking could go here
    console.log(`Player ${playerId} ${favorited ? "favorited" : "unfavorited"}`);
  };

  return (
    <PlayerSearchPanel
      onPlayerSelect={handlePlayerSelect}
      onFavoriteToggle={handleFavoriteToggle}
      className="min-h-screen"
    />
  );
}
