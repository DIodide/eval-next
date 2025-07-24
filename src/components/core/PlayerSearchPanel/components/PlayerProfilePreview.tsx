import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  MapPin,
  Mail,
  BookOpen,
  Trophy,
  Star,
  Copy,
  ExternalLink,
  Bookmark,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { PlayerSearchResult } from "../types";
import { cn } from "@/lib/utils";
import { GameAnalyticsPanel } from "@/components/core/GameAnalyticsPanel";
import type { GameId } from "@/components/core/GameAnalyticsPanel";

/**
 * Helper function to map game names to GameId
 */
function getGameIdFromName(gameName?: string | null): GameId {
  if (!gameName) return "valorant";

  const normalized = gameName.toLowerCase().trim();

  if (normalized.includes("valorant")) return "valorant";
  if (normalized.includes("rocket") && normalized.includes("league"))
    return "rocket-league";
  if (normalized.includes("smash") || normalized.includes("ultimate"))
    return "smash";
  if (normalized.includes("overwatch")) return "overwatch";

  return "valorant"; // Default fallback
}

interface PlayerProfilePreviewProps {
  player: PlayerSearchResult | null;
  isOpen: boolean;
  onClose: () => void;
  onViewFullProfile?: (player: PlayerSearchResult) => void;
  onFavoriteToggle?: (player: PlayerSearchResult) => void;
}

/**
 * Compact player profile preview modal for recruiting purposes
 * Shows essential information without navigating away from search
 */
export function PlayerProfilePreview({
  player,
  isOpen,
  onClose,
  onViewFullProfile,
  onFavoriteToggle,
}: PlayerProfilePreviewProps) {
  // Optimistic favorite state for instant visual feedback
  const [optimisticFavorite, setOptimisticFavorite] = React.useState<
    boolean | null
  >(null);

  // Get the effective favorite state (optimistic override or actual)
  const getEffectiveFavoriteState = (): boolean => {
    return optimisticFavorite ?? player?.isFavorited ?? false;
  };

  // Clear optimistic state when server data updates
  React.useEffect(() => {
    if (
      player &&
      optimisticFavorite !== null &&
      optimisticFavorite === player.isFavorited
    ) {
      // Server state now matches our optimistic state, so we can clear the override
      setOptimisticFavorite(null);
    }
  }, [player?.isFavorited, optimisticFavorite]);

  if (!player) return null;

  const gpaNumber = player.academicInfo.gpa
    ? parseFloat(String(player.academicInfo.gpa))
    : null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(player.email);
      toast.success("Email copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy email");
    }
  };

  const handleViewFullProfile = () => {
    onViewFullProfile?.(player);
    onClose();
  };

  const handleFavoriteToggle = () => {
    // Immediately update visual state for optimistic rendering
    const newFavoriteState = !getEffectiveFavoriteState();
    setOptimisticFavorite(newFavoriteState);

    // Call the actual mutation
    onFavoriteToggle?.(player);

    // Show immediate toast feedback
    if (newFavoriteState) {
      toast.success("Added to prospects", {
        description: "Player has been bookmarked for recruiting",
      });
    } else {
      toast.info("Removed from prospects", {
        description: "Player bookmark has been removed",
      });
    }

    // Fallback timeout cleanup in case server response is delayed
    setTimeout(() => {
      setOptimisticFavorite(null);
    }, 3000);
  };

  // Get best combine and league scores from all game profiles
  const bestCombineScore = Math.max(
    ...player.gameProfiles.map((p) => p.combine_score ?? 0),
  );
  const bestLeagueScore = Math.max(
    ...player.gameProfiles.map((p) => p.league_score ?? 0),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto border-gray-700 bg-gray-900 text-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="sr-only">Player Profile Preview</DialogTitle>
        </DialogHeader>

        {/* Enhanced Header Section */}
        <div className="relative pb-6">
          {/* Add to Prospects Button - Top Right */}
          {onFavoriteToggle && (
            <div className="absolute top-0 right-0">
              <Button
                variant={getEffectiveFavoriteState() ? "default" : "outline"}
                onClick={handleFavoriteToggle}
                className={cn(
                  "cursor-pointer",
                  getEffectiveFavoriteState()
                    ? "bg-cyan-600 text-white hover:bg-cyan-700"
                    : "border-gray-600 bg-gray-800 text-white hover:bg-gray-700",
                )}
              >
                <Bookmark
                  className={cn(
                    "mr-2 h-4 w-4",
                    getEffectiveFavoriteState() ? "fill-current" : "",
                  )}
                />
                {getEffectiveFavoriteState()
                  ? "Added to Prospects"
                  : "Add to Prospects"}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-12 gap-6">
            {/* Player Avatar and Basic Info */}
            <div className="col-span-3 flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={player.imageUrl ?? undefined}
                  alt={`${player.firstName} ${player.lastName}`}
                />
                <AvatarFallback className="bg-gray-700 text-2xl font-semibold text-white">
                  {player.firstName.charAt(0)}
                  {player.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Main Game Badge */}
              {player.mainGame && (
                <Badge
                  variant="secondary"
                  className="bg-gray-700 text-gray-300"
                >
                  {player.mainGame.name}
                </Badge>
              )}

              {/* Bookmark Status */}
              {player.isFavorited && (
                <Badge className="bg-cyan-600 text-white">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Bookmarked
                </Badge>
              )}
            </div>

            {/* Player Details */}
            <div className="col-span-6 space-y-4">
              <div>
                <h2 className="font-orbitron text-2xl font-bold text-white">
                  {player.firstName} {player.lastName}
                </h2>
                <p className="text-lg text-gray-300">
                  @{player.username ?? "No username"}
                </p>
              </div>

              {/* Academic & School Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-white">
                        {player.schoolRef?.name ?? player.school ?? "N/A"}
                      </div>
                      {player.schoolRef?.type && (
                        <div className="text-sm text-gray-400">
                          {player.schoolRef.type.replace("_", " ")}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div className="font-medium text-white">
                      {player.location ?? "N/A"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-400">Graduation:</span>
                      <div className="font-medium text-white">
                        {player.academicInfo.classYear
                          ? isNaN(Number(player.academicInfo.classYear))
                            ? player.academicInfo.classYear
                            : `Class of ${player.academicInfo.classYear}`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-400">GPA:</span>
                      <div
                        className={cn(
                          "font-medium",
                          gpaNumber
                            ? gpaNumber >= 3.5
                              ? "text-green-400"
                              : gpaNumber >= 3.0
                                ? "text-yellow-400"
                                : "text-white"
                            : "text-gray-400",
                        )}
                      >
                        {gpaNumber ? gpaNumber.toFixed(2) : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Major */}
              {player.academicInfo.intendedMajor && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <div>
                    <span className="text-sm text-gray-400">
                      Intended Major:
                    </span>
                    <div className="font-medium text-white">
                      {player.academicInfo.intendedMajor}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* EVAL Scores Highlight */}
            <div className="col-span-3 space-y-4">
              <h3 className="font-orbitron text-lg font-semibold text-white">
                EVAL Scores
              </h3>
              <div className="space-y-3 rounded-lg bg-gray-800 p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">
                    {bestCombineScore > 0 ? bestCombineScore.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">Combine Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {bestLeagueScore > 0 ? bestLeagueScore.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-sm text-gray-400">League Score</div>
                </div>
                {/* Individual Game Scores */}
                {player.gameProfiles.length > 0 && (
                  <div className="space-y-1 border-t border-gray-700 pt-3">
                    {player.gameProfiles.slice(0, 2).map((profile, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {profile.game.name}:
                        </span>
                        <span className="text-white">
                          C: {profile.combine_score?.toFixed(1) ?? "N/A"} | L:{" "}
                          {profile.league_score?.toFixed(1) ?? "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Recruiting Information */}
        <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Student Contact */}
          <div className="space-y-3 rounded-lg bg-gray-800 p-4">
            <h4 className="border-b border-gray-700 pb-2 text-sm font-semibold text-gray-300">
              Student Contact
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="flex-1 text-white">{player.email}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyEmail}
                  className="h-6 w-6 cursor-pointer p-0 text-gray-400 hover:text-white"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {/* Placeholder for phone - would need to be added to data model */}
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Phone: Contact for details</span>
              </div>
            </div>
          </div>

          {/* Parent/Guardian Contact */}
          <div className="space-y-3 rounded-lg bg-gray-800 p-4">
            <h4 className="border-b border-gray-700 pb-2 text-sm font-semibold text-gray-300">
              Parent/Guardian
            </h4>
            <div className="space-y-2 text-sm text-gray-400">
              {/* Placeholder content - would need to be added to data model */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Contact info via school</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Available upon request</span>
              </div>
            </div>
          </div>

          {/* School Contact */}
          <div className="space-y-3 rounded-lg bg-gray-800 p-4">
            <h4 className="border-b border-gray-700 pb-2 text-sm font-semibold text-gray-300">
              School Contact
            </h4>
            <div className="space-y-2 text-sm text-gray-400">
              {/* Placeholder content - would need to be added to data model */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Guidance Counselor</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Contact via school office</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gaming Analytics - Full Width */}
        <div className="space-y-4">
          <h3 className="font-orbitron border-b border-gray-700 pb-2 text-lg font-semibold text-white">
            Game Analytics
          </h3>

          <div className="rounded-lg bg-gray-800">
            <GameAnalyticsPanel
              playerId={player.id}
              viewMode="other"
              showInfoPanel={false}
              targetPlayerProfile={{
                id: player.id,
                platform_connections: player.platformConnections.map((pc) => ({
                  platform: pc.platform,
                  connected: true,
                })),
              }}
              defaultGame={getGameIdFromName(player.mainGame?.name)}
              showHeader={false}
              showConnectionPrompts={false}
              openLinksInNewTab={true}
              size="compact"
              className=""
              contentClassName="bg-transparent"
            />
          </div>
        </div>

        {/* Bio Section */}
        {player.bio && (
          <div className="space-y-2">
            <h3 className="font-orbitron border-b border-gray-700 pb-2 text-lg font-semibold text-white">
              About
            </h3>
            <p className="leading-relaxed text-gray-300">{player.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-700 pt-4">
          <Button
            variant="outline"
            onClick={handleViewFullProfile}
            className="cursor-pointer border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Profile
          </Button>
          <Button
            onClick={onClose}
            className="cursor-pointer bg-cyan-600 text-white hover:bg-cyan-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
