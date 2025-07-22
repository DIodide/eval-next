import React from "react";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bookmark, Eye, MoreHorizontal } from "lucide-react";
import type { PlayerSearchResult } from "../../types";
import { GAME_ICONS } from "../../utils/constants";

interface PlayerColumnsProps {
  onPlayerSelect: (player: PlayerSearchResult) => void;
  onFavoriteToggle: (player: PlayerSearchResult) => void;
  pendingFavorites: Set<string>;
  currentGameId?: string;
}

/**
 * Get game icon for display (no emojis)
 */
const getGameIcon = (gameShortName: string) => {
  return GAME_ICONS[gameShortName] ?? "";
};

/**
 * Get current game profile for player based on selected game
 */
const getGameProfile = (player: PlayerSearchResult, currentGameId?: string) => {
  if (!currentGameId) return null;
  return player.gameProfiles.find(
    (profile) => profile.game.short_name === currentGameId,
  );
};

/**
 * Generate column definitions for the player table
 */
export function usePlayerColumns({
  onPlayerSelect,
  onFavoriteToggle,
  pendingFavorites,
  currentGameId,
}: PlayerColumnsProps): ColumnDef<PlayerSearchResult>[] {
  return React.useMemo(
    () => [
      // Avatar Column
      {
        id: "avatar",
        header: "",
        size: 60,
        cell: ({ row }) => {
          const player = row.original;
          return (
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={player.imageUrl ?? undefined}
                alt={`${player.firstName} ${player.lastName}`}
              />
              <AvatarFallback className="bg-gray-700 text-white">
                {player.firstName.charAt(0)}
                {player.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          );
        },
      },

      // Name Column
      {
        id: "name",
        header: "Player",
        accessorFn: (player) => `${player.firstName} ${player.lastName}`,
        cell: ({ row }) => {
          const player = row.original;
          const gameProfile = getGameProfile(player, currentGameId);

          return (
            <div className="space-y-1">
              <div className="font-medium text-white">
                {player.firstName} {player.lastName}
              </div>
              <div className="text-sm text-gray-400">
                @{gameProfile?.username ?? player.username ?? "No username"}
              </div>
            </div>
          );
        },
      },

      // School Column
      {
        id: "school",
        header: "School",
        accessorFn: (player) => player.schoolRef?.name ?? player.school,
        cell: ({ row }) => {
          const player = row.original;
          return (
            <div className="font-medium text-white">
              {player.schoolRef?.name ?? player.school ?? "No school"}
            </div>
          );
        },
      },

      // Academics Column
      {
        id: "academics",
        header: "Academics",
        cell: ({ row }) => {
          const player = row.original;
          const gpaNumber = player.academicInfo.gpa
            ? parseFloat(String(player.academicInfo.gpa))
            : null;

          return (
            <div className="space-y-1">
              <div className="font-medium text-white">
                {player.academicInfo.classYear
                  ? isNaN(Number(player.academicInfo.classYear))
                    ? player.academicInfo.classYear // Show text as-is for non-numeric values
                    : `Class of ${player.academicInfo.classYear}` // Add "Class of" only for years
                  : "No class year"}
              </div>
              <div className="text-sm text-gray-400">
                GPA: {gpaNumber?.toFixed(2) ?? "N/A"}
              </div>
            </div>
          );
        },
      },

      // Rank Column (only show for games that have meaningful ranks)
      ...(currentGameId && currentGameId !== "Super Smash Bros. Ultimate"
        ? [
            {
              id: "rank",
              header: "Rank",
              cell: ({ row }: { row: Row<PlayerSearchResult> }) => {
                const player = row.original;
                const gameProfile = getGameProfile(player, currentGameId);

                return (
                  <div className="font-medium text-white">
                    {gameProfile?.rank ?? "Unranked"}
                  </div>
                );
              },
            },
          ]
        : []),

      // Game Profile Column
      {
        id: "game_profile",
        header: "Game Profile",
        cell: ({ row }) => {
          const player = row.original;
          const gameProfile = getGameProfile(player, currentGameId);

          if (!gameProfile) {
            return (
              <div className="text-sm text-gray-500">
                No profile for selected game
              </div>
            );
          }

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  {gameProfile.role ?? "No role"}
                </span>
              </div>
              {gameProfile.agents.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {gameProfile.agents.slice(0, 2).map((agent, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-700 text-xs text-gray-300"
                    >
                      {agent}
                    </Badge>
                  ))}
                  {gameProfile.agents.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{gameProfile.agents.length - 2} more
                    </span>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-400">
                {gameProfile.play_style ?? ""}
              </div>
            </div>
          );
        },
      },

      // EVAL Scores Column
      {
        id: "eval_scores",
        header: "EVAL Scores",
        cell: ({ row }) => {
          const player = row.original;
          const gameProfile = getGameProfile(player, currentGameId);

          return (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium text-gray-300">Combine:</span>{" "}
                <span
                  className={
                    gameProfile?.combine_score
                      ? "text-cyan-400"
                      : "text-gray-500"
                  }
                >
                  {gameProfile?.combine_score?.toFixed(1) ?? "N/A"}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-300">League:</span>{" "}
                <span
                  className={
                    gameProfile?.league_score
                      ? "text-green-400"
                      : "text-gray-500"
                  }
                >
                  {gameProfile?.league_score?.toFixed(1) ?? "N/A"}
                </span>
              </div>
            </div>
          );
        },
      },

      // Actions Column
      {
        id: "actions",
        header: "",
        size: 120,
        cell: ({ row }) => {
          const player = row.original;
          const isPending = pendingFavorites.has(player.id);

          return (
            <div className="flex items-center gap-2">
              {/* Favorite Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle(player);
                }}
                disabled={isPending}
                className={`${
                  player.isFavorited
                    ? "text-cyan-400 hover:bg-gray-700 hover:text-cyan-300"
                    : "text-gray-500 hover:bg-gray-700 hover:text-white"
                } ${isPending ? "cursor-wait opacity-70" : ""}`}
                aria-label={
                  player.isFavorited ? "Remove bookmark" : "Add bookmark"
                }
              >
                <Bookmark
                  className={`h-4 w-4 ${player.isFavorited ? "fill-current" : ""} ${
                    isPending ? "animate-pulse" : ""
                  }`}
                />
              </Button>

              {/* View Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayerSelect(player);
                }}
                className="hover:bg-gray-700 hover:text-white"
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
                    className="text-gray-400 hover:bg-gray-700 hover:text-white"
                    aria-label="More actions"
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
                    onClick={() => navigator.clipboard.writeText(player.email)}
                    className="text-gray-300 focus:bg-gray-700 focus:text-white"
                  >
                    Copy email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onPlayerSelect(player)}
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
          );
        },
      },
    ],
    [onPlayerSelect, onFavoriteToggle, pendingFavorites, currentGameId],
  );
}
