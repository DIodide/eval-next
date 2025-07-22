import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PlayerTableProps, PlayerSearchResult } from "../types";

/**
 * PlayerTable component with proper table structure and headers
 */
export function PlayerTable({
  players,
  loading = false,
  onPlayerSelect,
  onFavoriteToggle,
}: PlayerTableProps) {
  // Track optimistic favorite states for instant visual feedback
  const [optimisticFavorites, setOptimisticFavorites] = useState<
    Map<string, boolean>
  >(new Map());

  // Handle favorite toggle with optimistic updates
  const handleFavoriteToggle = useCallback(
    (player: PlayerSearchResult) => {
      // Immediately update visual state for optimistic rendering
      const newFavoriteState = !player.isFavorited;
      setOptimisticFavorites((prev) =>
        new Map(prev).set(player.id, newFavoriteState),
      );

      // Call the actual mutation
      onFavoriteToggle?.(player);

      // Fallback timeout cleanup (the useEffect above should handle this more reliably)
      setTimeout(() => {
        setOptimisticFavorites((prev) => {
          const newMap = new Map(prev);
          newMap.delete(player.id);
          return newMap;
        });
      }, 3000); // Fallback cleanup in case server response is very slow
    },
    [onFavoriteToggle],
  );

  // Get the effective favorite state (optimistic override or actual)
  const getEffectiveFavoriteState = useCallback(
    (player: PlayerSearchResult): boolean => {
      return optimisticFavorites.get(player.id) ?? player.isFavorited;
    },
    [optimisticFavorites],
  );

  // Clear optimistic state when server data updates (more reliable than timeout)
  React.useEffect(() => {
    // Clear optimistic overrides for players whose server state has actually changed
    setOptimisticFavorites((prevOptimistic) => {
      const newOptimistic = new Map(prevOptimistic);
      let hasChanges = false;

      for (const player of players) {
        const optimisticState = newOptimistic.get(player.id);
        if (
          optimisticState !== undefined &&
          optimisticState === player.isFavorited
        ) {
          // Server state now matches our optimistic state, so we can clear the override
          newOptimistic.delete(player.id);
          hasChanges = true;
        }
      }

      return hasChanges ? newOptimistic : prevOptimistic;
    });
  }, [players]); // Runs when players data changes (i.e., after server sync)
  if (loading) {
    return (
      <div className="bg-gray-800">
        {/* Table Header */}
        <div className="border-b border-gray-700 bg-gray-900 px-6 py-2">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-300">
            <div className="col-span-2">Player</div>
            <div>School</div>
            <div>Academics</div>
            <div>EVAL Scores</div>
            <div>Actions</div>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="divide-y divide-gray-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse px-6 py-4">
              <div className="grid grid-cols-6 items-center gap-4">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-700" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-gray-700" />
                    <div className="h-3 w-20 rounded bg-gray-700" />
                  </div>
                </div>
                <div className="h-4 w-20 rounded bg-gray-700" />
                <div className="space-y-2">
                  <div className="h-4 w-16 rounded bg-gray-700" />
                  <div className="h-3 w-12 rounded bg-gray-700" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-20 rounded bg-gray-700" />
                  <div className="h-3 w-20 rounded bg-gray-700" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 rounded bg-gray-700" />
                  <div className="h-8 w-8 rounded bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="bg-gray-800">
        {/* Table Header */}
        <div className="border-b border-gray-700 bg-gray-900 px-6 py-2">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-300">
            <div className="col-span-2">Player</div>
            <div>School</div>
            <div>Academics</div>
            <div>EVAL Scores</div>
            <div className="text-center">Actions</div>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
            <Eye className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            No players found
          </h3>
          <p className="text-gray-400">
            Try adjusting your search criteria or filters to find players.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800">
      {/* Table Header */}
      <div className="border-b border-gray-700 bg-gray-900 px-6 py-2">
        <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-300">
          <div className="col-span-2">Player</div>
          <div>School</div>
          <div>Academics</div>
          <div>EVAL Scores</div>
          <div className="text-center">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-700">
        {players.map((player: PlayerSearchResult) => {
          const gpaNumber = player.academicInfo?.gpa
            ? parseFloat(String(player.academicInfo.gpa))
            : null;

          return (
            <div
              key={player.id}
              className="hover:bg-gray-750 cursor-pointer px-6 py-4 transition-colors"
              onClick={() => onPlayerSelect?.(player)}
            >
              <div className="grid grid-cols-6 items-center gap-4">
                {/* Player Column (Avatar + Name) */}
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={player.imageUrl ?? undefined}
                      alt={`${player.firstName} ${player.lastName}`}
                    />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {player.firstName?.charAt(0)}
                      {player.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-white">
                      {player.firstName} {player.lastName}
                    </div>
                    <div className="truncate text-sm text-gray-400">
                      @{player.username ?? "No username"}
                    </div>
                  </div>
                </div>

                {/* School Column */}
                <div className="truncate font-medium text-white">
                  {player.schoolRef?.name ?? player.school ?? "No school"}
                </div>

                {/* Academics Column */}
                <div className="space-y-1">
                  <div className="font-medium text-white">
                    {player.academicInfo?.classYear ?? "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">
                    GPA: {gpaNumber?.toFixed(2) ?? "N/A"}
                  </div>
                </div>

                {/* EVAL Scores Column */}
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium text-gray-300">C:</span>{" "}
                    <span className="text-cyan-400">
                      {player.gameProfiles[0]?.combine_score?.toFixed(1) ??
                        "N/A"}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-300">L:</span>{" "}
                    <span className="text-green-400">
                      {player.gameProfiles[0]?.league_score?.toFixed(1) ??
                        "N/A"}
                    </span>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex items-center justify-center gap-1">
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteToggle(player);
                    }}
                    className={`h-8 w-8 p-0 transition-colors ${
                      getEffectiveFavoriteState(player)
                        ? "text-cyan-400 hover:bg-gray-700 hover:text-cyan-300"
                        : "text-gray-500 hover:bg-gray-700 hover:text-white"
                    }`}
                    aria-label={
                      getEffectiveFavoriteState(player)
                        ? "Remove bookmark"
                        : "Add bookmark"
                    }
                  >
                    <Bookmark
                      className={`h-4 w-4 transition-all ${getEffectiveFavoriteState(player) ? "fill-current" : ""}`}
                    />
                  </Button>

                  {/* View Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayerSelect?.(player);
                    }}
                    className="h-8 w-8 p-0 hover:bg-gray-700 hover:text-white"
                    aria-label="View profile"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-700 hover:text-white"
                        aria-label="More actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-gray-700 bg-gray-800"
                    >
                      <DropdownMenuLabel className="text-gray-300">
                        Actions
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          void navigator.clipboard.writeText(player.email);
                        }}
                        className="text-gray-300 focus:bg-gray-700 focus:text-white"
                      >
                        Copy email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayerSelect?.(player);
                        }}
                        className="text-gray-300 focus:bg-gray-700 focus:text-white"
                      >
                        View full profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white">
                        Send message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
