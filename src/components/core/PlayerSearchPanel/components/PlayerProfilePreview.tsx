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
}: PlayerProfilePreviewProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto border-gray-700 bg-gray-900 text-white">
        <DialogHeader className="pb-4">
          <DialogTitle className="sr-only">Player Profile Preview</DialogTitle>
        </DialogHeader>

        {/* Header Section */}
        <div className="flex items-start gap-4 pb-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={player.imageUrl ?? undefined}
              alt={`${player.firstName} ${player.lastName}`}
            />
            <AvatarFallback className="bg-gray-700 text-xl font-semibold text-white">
              {player.firstName.charAt(0)}
              {player.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-orbitron text-2xl font-bold text-white">
                {player.firstName} {player.lastName}
              </h2>
              {player.isFavorited && (
                <Badge className="bg-cyan-600 text-white">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Bookmarked
                </Badge>
              )}
            </div>

            <p className="text-lg text-gray-300">
              @{player.username ?? "No username"}
            </p>

            {/* Main Game Badge */}
            {player.mainGame && (
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                {player.mainGame.name}
              </Badge>
            )}
          </div>
        </div>

        {/* Essential Information Grid */}
        <div className="space-y-6">
          {/* Academic Information Row */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* School & Location */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">
                School & Location
              </h4>
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
            </div>

            {/* Academic Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">
                Academic Info
              </h4>
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
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Major</h4>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <div className="font-medium text-white">
                  {player.academicInfo.intendedMajor ?? "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Gaming Analytics - Full Width */}
          <div className="space-y-4">
            <h3 className="font-orbitron border-b border-gray-700 pb-2 text-lg font-semibold text-white">
              Game Analytics
            </h3>

            <div className="rounded-lg bg-gray-800 p-1">
              <GameAnalyticsPanel
                playerId={player.id}
                viewMode="other"
                targetPlayerProfile={{
                  id: player.id,
                  platform_connections: player.platformConnections.map(
                    (pc) => ({
                      platform: pc.platform,
                      connected: true,
                    }),
                  ),
                }}
                defaultGame={getGameIdFromName(player.mainGame?.name)}
                showHeader={false}
                showConnectionPrompts={false}
                openLinksInNewTab={true}
                className="min-h-[400px]"
                contentClassName="bg-transparent"
              />
            </div>
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

        {/* Contact & Actions */}
        <div className="flex items-center justify-between border-t border-gray-700 pt-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Contact:</span>
            <span className="text-white">{player.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyEmail}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleViewFullProfile}
              className="border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Profile
            </Button>
            <Button
              onClick={onClose}
              className="bg-cyan-600 text-white hover:bg-cyan-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
