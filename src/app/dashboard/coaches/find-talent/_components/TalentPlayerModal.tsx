"use client";

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
  Bookmark,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { TalentAnalysisSection } from "./TalentAnalysisSection";
import type { TalentSearchResult } from "@/types/talent-search";
import Link from "next/link";

interface TalentPlayerModalProps {
  player: TalentSearchResult | null;
  isOpen: boolean;
  onClose: () => void;
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

export function TalentPlayerModal({
  player,
  isOpen,
  onClose,
  onFavoriteToggle,
}: TalentPlayerModalProps) {
  // Fetch AI analysis when modal opens
  const {
    data: analysis,
    isLoading: isLoadingAnalysis,
    error: analysisError,
  } = api.talentSearch.getAnalysis.useQuery(
    { playerId: player?.id ?? "" },
    {
      enabled: isOpen && !!player?.id,
      staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
      retry: 1,
    }
  );

  if (!player) return null;

  const similarityPercent = Math.round(player.similarityScore * 100);
  const gpaNumber = player.academicInfo.gpa;

  // Get best combine and league scores
  const bestCombineScore = Math.max(
    ...player.gameProfiles.map((p) => p.combineScore ?? 0)
  );
  const bestLeagueScore = Math.max(
    ...player.gameProfiles.map((p) => p.leagueScore ?? 0)
  );

  const handleCopyEmail = async () => {
    // Note: We'd need to add email to the TalentSearchResult type
    // For now, this is a placeholder
    toast.info("Contact info available via full profile");
  };

  const handleFavoriteToggle = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(player);
      toast.success(
        player.isFavorited ? "Removed from prospects" : "Added to prospects"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-gray-700 bg-gray-900 text-white">
        <DialogHeader className="pb-0">
          <DialogTitle className="sr-only">Player Profile</DialogTitle>
        </DialogHeader>

        {/* Header Section */}
        <div className="relative border-b border-gray-800 pb-6">
          {/* Similarity Score Badge */}
          <div className="absolute top-0 right-0">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full bg-gradient-to-r px-4 py-2 text-sm font-semibold text-white shadow-lg",
                getSimilarityColor(player.similarityScore)
              )}
            >
              <Sparkles className="h-4 w-4" />
              <span>{similarityPercent}% Match</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Player Avatar */}
            <div className="col-span-3 flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24 border-2 border-gray-700">
                <AvatarImage
                  src={player.imageUrl ?? undefined}
                  alt={`${player.firstName} ${player.lastName}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-gray-700 to-gray-800 text-2xl font-semibold text-white">
                  {player.firstName.charAt(0)}
                  {player.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* Main Game Badge */}
              {player.mainGame && (
                <Badge
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

              {/* Favorite Badge */}
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
                {player.username && (
                  <p className="text-lg text-gray-400">@{player.username}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {getSimilarityLabel(player.similarityScore)}
                </p>
              </div>

              {/* Academic & School Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-medium text-white">
                        {player.school.name ?? "No school listed"}
                      </div>
                      {player.school.type && (
                        <div className="text-sm text-gray-400">
                          {player.school.type.replace("_", " ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {player.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-white">{player.location}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-400">Class Year:</span>
                      <div className="font-medium text-white">
                        {player.academicInfo.classYear
                          ? `Class of ${player.academicInfo.classYear}`
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
                            : "text-gray-400"
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
                  <span className="text-sm text-gray-400">Intended Major:</span>
                  <span className="font-medium text-white">
                    {player.academicInfo.intendedMajor}
                  </span>
                </div>
              )}
            </div>

            {/* EVAL Scores */}
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
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="space-y-4 py-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="font-orbitron text-lg font-semibold text-white">
              AI Analysis
            </h3>
            {analysis?.isCached && (
              <Badge variant="outline" className="border-gray-700 text-gray-500">
                Cached
              </Badge>
            )}
          </div>

          {analysisError ? (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <p className="text-sm text-red-400">
                Unable to generate analysis. Please try again later.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <TalentAnalysisSection
                title="Overview"
                icon="overview"
                content={analysis?.overview}
                isLoading={isLoadingAnalysis}
              />
              <TalentAnalysisSection
                title="Strengths"
                icon="pros"
                content={analysis?.pros}
                isLoading={isLoadingAnalysis}
              />
              <TalentAnalysisSection
                title="Areas to Develop"
                icon="cons"
                content={analysis?.cons}
                isLoading={isLoadingAnalysis}
              />
            </div>
          )}
        </div>

        {/* Game Profiles */}
        {player.gameProfiles.length > 0 && (
          <div className="space-y-4 border-t border-gray-800 py-6">
            <h3 className="font-orbitron text-lg font-semibold text-white">
              Game Profiles
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {player.gameProfiles.map((profile, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      {profile.gameName}
                    </h4>
                    <Badge variant="outline" className="border-gray-700">
                      @{profile.username}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.rank && (
                      <Badge className="bg-purple-500/20 text-purple-300">
                        {profile.rank}
                      </Badge>
                    )}
                    {profile.role && (
                      <Badge className="bg-blue-500/20 text-blue-300">
                        {profile.role}
                      </Badge>
                    )}
                    {profile.playStyle && (
                      <Badge className="bg-gray-700 text-gray-300">
                        {profile.playStyle}
                      </Badge>
                    )}
                  </div>
                  {profile.agents.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Agents: {profile.agents.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {player.bio && (
          <div className="space-y-2 border-t border-gray-800 py-6">
            <h3 className="font-orbitron text-lg font-semibold text-white">
              About
            </h3>
            <p className="leading-relaxed text-gray-300">{player.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-6">
          <div className="flex items-center gap-3">
            {onFavoriteToggle && (
              <Button
                variant={player.isFavorited ? "default" : "outline"}
                onClick={handleFavoriteToggle}
                className={cn(
                  "cursor-pointer",
                  player.isFavorited
                    ? "bg-cyan-600 text-white hover:bg-cyan-700"
                    : "border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
                )}
              >
                <Bookmark
                  className={cn(
                    "mr-2 h-4 w-4",
                    player.isFavorited && "fill-current"
                  )}
                />
                {player.isFavorited ? "In Prospects" : "Add to Prospects"}
              </Button>
            )}
            <Button
              variant="outline"
              className="cursor-pointer border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
              disabled
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/profiles/player/${player.id}`} target="_blank">
              <Button
                variant="outline"
                className="cursor-pointer border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Full Profile
              </Button>
            </Link>
            <Button
              onClick={onClose}
              className="cursor-pointer bg-cyan-600 text-white hover:bg-cyan-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
