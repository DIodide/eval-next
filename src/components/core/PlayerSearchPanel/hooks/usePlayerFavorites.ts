import { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { UsePlayerFavoritesReturn } from "../types";
import { ERROR_MESSAGES } from "../utils/constants";

/**
 * Hook for managing player favorites with optimistic updates
 * Enhanced with real tRPC API calls
 */
export function usePlayerFavorites(): UsePlayerFavoritesReturn {
  const [pendingFavorites, setPendingFavorites] = useState<Set<string>>(
    new Set(),
  );

  const utils = api.useUtils();

  const favoritePlayerMutation = api.playerSearch.favoritePlayer.useMutation({
    onMutate: async ({ player_id }) => {
      // Add to pending set to prevent duplicate requests
      setPendingFavorites((prev) => new Set(prev).add(player_id));

      // Show immediate success feedback
      toast.success("Player bookmarked successfully", {
        description: "Added to your recruiting prospects",
      });

      return { player_id };
    },
    onSuccess: () => {
      // Invalidate the correct queries to update data
      void utils.playerSearch.searchPlayersPaginated.invalidate();
      void utils.playerSearch.searchPlayersInfinite.invalidate(); // Keep for backward compatibility
      void utils.playerSearch.getFavorites.invalidate();
    },
    onError: (error) => {
      toast.error("Bookmark failed", {
        description: error.message || ERROR_MESSAGES.FAVORITE_FAILED,
      });
    },
    onSettled: (_, __, { player_id }) => {
      // Remove from pending set
      setPendingFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(player_id);
        return newSet;
      });
    },
  });

  const unfavoritePlayerMutation =
    api.playerSearch.unfavoritePlayer.useMutation({
      onMutate: async ({ player_id }) => {
        // Add to pending set to prevent duplicate requests
        setPendingFavorites((prev) => new Set(prev).add(player_id));

        // Show immediate success feedback
        toast.info("Player removed from bookmarks", {
          description: "Removed from your recruiting prospects",
        });

        return { player_id };
      },
      onSuccess: () => {
        // Invalidate the correct queries to update data
        void utils.playerSearch.searchPlayersPaginated.invalidate();
        void utils.playerSearch.searchPlayersInfinite.invalidate(); // Keep for backward compatibility
        void utils.playerSearch.getFavorites.invalidate();
      },
      onError: (error) => {
        toast.error("Remove bookmark failed", {
          description: error.message || ERROR_MESSAGES.UNFAVORITE_FAILED,
        });
      },
      onSettled: (_, __, { player_id }) => {
        // Remove from pending set
        setPendingFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(player_id);
          return newSet;
        });
      },
    });

  const updateFavoriteMutation = api.playerSearch.updateFavorite.useMutation({
    onError: (error) => {
      toast.error("Update failed", {
        description: error.message || "Failed to update bookmark",
      });
    },
    onSuccess: () => {
      toast.success("Bookmark updated successfully");
    },
  });

  const favoritePlayer = async (
    playerId: string,
    options?: { notes?: string; tags?: string[] },
  ): Promise<void> => {
    await favoritePlayerMutation.mutateAsync({
      player_id: playerId,
      notes: options?.notes,
      tags: options?.tags ?? ["prospect"],
    });
  };

  const unfavoritePlayer = async (playerId: string): Promise<void> => {
    await unfavoritePlayerMutation.mutateAsync({
      player_id: playerId,
    });
  };

  const updateFavorite = async (
    playerId: string,
    options: { notes?: string; tags?: string[] },
  ): Promise<void> => {
    await updateFavoriteMutation.mutateAsync({
      player_id: playerId,
      notes: options.notes,
      tags: options.tags,
    });
  };

  return {
    favoritePlayer,
    unfavoritePlayer,
    updateFavorite,
    isFavoriting: favoritePlayerMutation.isPending,
    isUnfavoriting: unfavoritePlayerMutation.isPending,
    pendingFavorites,
  };
}
