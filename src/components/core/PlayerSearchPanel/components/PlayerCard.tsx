import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Eye, MapPin, GraduationCap } from "lucide-react";
import type { PlayerCardProps } from "../types";

/**
 * PlayerCard component for mobile/grid view display
 */
export function PlayerCard({
  player,
  onSelect,
  onFavoriteToggle,
  compact = false,
}: PlayerCardProps) {
  // Track optimistic favorite state for instant visual feedback
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(
    null,
  );

  // Handle favorite toggle with optimistic updates
  const handleFavoriteToggle = useCallback(() => {
    // Immediately update visual state for optimistic rendering
    const newFavoriteState = !player.isFavorited;
    setOptimisticFavorite(newFavoriteState);

    // Call the actual mutation
    onFavoriteToggle(player);

    // Fallback timeout cleanup (the useEffect above should handle this more reliably)
    setTimeout(() => {
      setOptimisticFavorite(null);
    }, 3000); // Fallback cleanup in case server response is very slow
  }, [player, onFavoriteToggle]);

  // Get the effective favorite state (optimistic override or actual)
  const effectiveFavoriteState = optimisticFavorite ?? player.isFavorited;

  // Clear optimistic state when server data updates (more reliable than timeout)
  useEffect(() => {
    if (
      optimisticFavorite !== null &&
      optimisticFavorite === player.isFavorited
    ) {
      // Server state now matches our optimistic state, so we can clear the override
      setOptimisticFavorite(null);
    }
  }, [player.isFavorited, optimisticFavorite]); // Runs when player favorite state changes

  const gpaNumber = player.academicInfo.gpa
    ? parseFloat(String(player.academicInfo.gpa))
    : null;

  return (
    <Card className="hover:bg-gray-750 border-gray-700 bg-gray-800 transition-colors">
      <CardContent className="p-4">
        {/* Player Header */}
        <div className="mb-3 flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={player.imageUrl ?? undefined}
              alt={`${player.firstName} ${player.lastName}`}
            />
            <AvatarFallback className="bg-gray-700 text-white">
              {player.firstName.charAt(0)}
              {player.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="truncate font-semibold text-white">
                {player.firstName} {player.lastName}
              </h3>
              <div className="flex gap-1">
                {/* Favorite Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle();
                  }}
                  className={`h-8 w-8 p-0 transition-colors ${
                    effectiveFavoriteState
                      ? "text-cyan-400 hover:text-cyan-300"
                      : "text-gray-500 hover:text-white"
                  }`}
                  aria-label={
                    effectiveFavoriteState ? "Remove bookmark" : "Add bookmark"
                  }
                >
                  <Bookmark
                    className={`h-4 w-4 transition-all ${effectiveFavoriteState ? "fill-current" : ""}`}
                  />
                </Button>

                {/* View Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(player);
                  }}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-white"
                  aria-label="View profile"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="truncate text-sm text-gray-400">
              @{player.username ?? "No username"}
            </p>

            {/* Main Game Badge */}
            {player.mainGame && (
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className="bg-gray-700 text-xs text-gray-300"
                >
                  {player.mainGame.name}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {!compact && (
          <div className="space-y-2 text-sm">
            {/* School Info */}
            {(player.schoolRef?.name ?? player.school) && (
              <div className="flex items-center gap-1 text-gray-300">
                <GraduationCap className="h-3 w-3 text-gray-400" />
                <span className="truncate">
                  {player.schoolRef?.name ?? player.school}
                </span>
              </div>
            )}

            {/* Location */}
            {player.location && (
              <div className="flex items-center gap-1 text-gray-300">
                <MapPin className="h-3 w-3 text-gray-400" />
                <span className="truncate">{player.location}</span>
              </div>
            )}

            {/* Academic Info */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{player.academicInfo.classYear ?? "No class year"}</span>
              <span>GPA: {gpaNumber?.toFixed(2) ?? "N/A"}</span>
            </div>

            {/* Game Profiles */}
            {player.gameProfiles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {player.gameProfiles.slice(0, 2).map((profile, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-gray-600 bg-gray-700 text-xs text-gray-300"
                  >
                    {profile.rank ?? profile.role ?? "Player"}
                  </Badge>
                ))}
                {player.gameProfiles.length > 2 && (
                  <span className="self-center text-xs text-gray-500">
                    +{player.gameProfiles.length - 2} more
                  </span>
                )}
              </div>
            )}

            {/* EVAL Scores */}
            {player.gameProfiles.some(
              (p) => p.combine_score ?? p.league_score,
            ) && (
              <div className="flex justify-between text-xs">
                <div>
                  <span className="text-gray-400">Combine:</span>{" "}
                  <span className="text-cyan-400">
                    {player.gameProfiles[0]?.combine_score?.toFixed(1) ?? "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">League:</span>{" "}
                  <span className="text-green-400">
                    {player.gameProfiles[0]?.league_score?.toFixed(1) ?? "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
