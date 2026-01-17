"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  GraduationCap,
  Bookmark,
  Sparkles,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TalentSearchResult } from "@/types/talent-search";

interface TalentPlayerCardProps {
  player: TalentSearchResult;
  onSelect: (player: TalentSearchResult) => void;
  onFavoriteToggle?: (player: TalentSearchResult) => void;
}

function getSimilarityColor(score: number): string {
  if (score >= 0.8) return "from-emerald-500 to-green-600";
  if (score >= 0.6) return "from-cyan-500 to-blue-600";
  if (score >= 0.4) return "from-yellow-500 to-orange-600";
  return "from-gray-500 to-gray-600";
}

function getSimilarityLabel(score: number): string {
  if (score >= 0.8) return "Excellent Match";
  if (score >= 0.6) return "Strong Match";
  if (score >= 0.4) return "Good Match";
  return "Potential Match";
}

export function TalentPlayerCard({
  player,
  onSelect,
  onFavoriteToggle,
}: TalentPlayerCardProps) {
  const similarityPercent = Math.round(player.similarityScore * 100);
  const gpaNumber = player.academicInfo.gpa;

  // Get best rank from game profiles
  const primaryProfile = player.gameProfiles[0];

  return (
    <Card
      onClick={() => onSelect(player)}
      className="group relative cursor-pointer overflow-hidden border-gray-800 bg-gray-900/80 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      {/* Similarity Score Badge */}
      <div className="absolute top-3 right-3 z-10">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1.5 text-sm font-semibold text-white shadow-lg",
            getSimilarityColor(player.similarityScore)
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{similarityPercent}%</span>
        </div>
      </div>

      {/* Favorite Button */}
      {onFavoriteToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(player);
          }}
          className={cn(
            "absolute top-3 left-3 z-10 cursor-pointer rounded-full p-2 transition-all",
            player.isFavorited
              ? "bg-cyan-500/20 text-cyan-400"
              : "bg-gray-800/80 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-cyan-400"
          )}
        >
          <Bookmark
            className={cn("h-4 w-4", player.isFavorited && "fill-current")}
          />
        </button>
      )}

      <div className="p-5">
        {/* Header with Avatar and Name */}
        <div className="mb-4 flex items-start gap-4">
          <Avatar className="h-16 w-16 border-2 border-gray-700">
            <AvatarImage
              src={player.imageUrl ?? undefined}
              alt={`${player.firstName} ${player.lastName}`}
            />
            <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-lg font-semibold text-white">
              {player.firstName.charAt(0)}
              {player.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="font-orbitron truncate text-lg font-bold text-white">
              {player.firstName} {player.lastName}
            </h3>
            {player.username && (
              <p className="truncate text-sm text-gray-400">@{player.username}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {getSimilarityLabel(player.similarityScore)}
            </p>
          </div>
        </div>

        {/* Main Game Badge */}
        {player.mainGame && (
          <Badge
            className="mb-3"
            style={{
              backgroundColor: player.mainGame.color
                ? `${player.mainGame.color}20`
                : undefined,
              borderColor: player.mainGame.color ?? undefined,
              color: player.mainGame.color ?? undefined,
            }}
          >
            {player.mainGame.name}
          </Badge>
        )}

        {/* Player Details */}
        <div className="space-y-2">
          {/* School */}
          <div className="flex items-center gap-2 text-sm">
            <GraduationCap className="h-4 w-4 flex-shrink-0 text-gray-500" />
            <span className="truncate text-gray-300">
              {player.school.name ?? "No school listed"}
            </span>
          </div>

          {/* Location */}
          {player.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
              <span className="truncate text-gray-300">{player.location}</span>
            </div>
          )}

          {/* Class Year & GPA */}
          <div className="flex items-center gap-4 text-sm">
            {player.academicInfo.classYear && (
              <span className="text-gray-400">
                Class of{" "}
                <span className="text-white">
                  {player.academicInfo.classYear}
                </span>
              </span>
            )}
            {gpaNumber && (
              <span className="text-gray-400">
                GPA:{" "}
                <span
                  className={cn(
                    "font-medium",
                    gpaNumber >= 3.5
                      ? "text-green-400"
                      : gpaNumber >= 3.0
                        ? "text-yellow-400"
                        : "text-white"
                  )}
                >
                  {gpaNumber.toFixed(2)}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Game Stats */}
        {primaryProfile && (
          <div className="mt-4 border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {primaryProfile.rank && (
                  <Badge variant="outline" className="border-gray-700 text-gray-300">
                    {primaryProfile.rank}
                  </Badge>
                )}
                {primaryProfile.role && (
                  <Badge variant="outline" className="border-gray-700 text-gray-300">
                    {primaryProfile.role}
                  </Badge>
                )}
              </div>
              {(primaryProfile.combineScore || primaryProfile.leagueScore) && (
                <div className="flex items-center gap-2 text-xs">
                  {primaryProfile.combineScore && (
                    <span className="text-cyan-400">
                      <Star className="mr-1 inline h-3 w-3" />
                      {primaryProfile.combineScore.toFixed(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Profile Button - appears on hover */}
        <div className="mt-4 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="outline"
            className="w-full cursor-pointer border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
