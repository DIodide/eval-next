import React from "react";
import {
  InfoIcon,
  TrophyIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRightIcon,
  UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import type { GameComponentProps, SmashStats } from "../../types";

// Helper functions for colors
const getWinRateColor = (winrate: number) => {
  if (winrate >= 0.7) return "text-emerald-400";
  if (winrate >= 0.6) return "text-yellow-400";
  return "text-red-400";
};

const _getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 70) return "text-yellow-400";
  return "text-red-400";
};

export function SmashAnalytics({
  stats,
  isConnected: _isConnected,
  isLoading,
  error,
  viewMode = "self",
  showInfoPanel = true, // Default to true to maintain current behavior
  size = "default",
  onRetry,
  onConnect,
}: GameComponentProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-700/30 bg-green-900/20 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-400 border-t-transparent"></div>
          </div>
          <h4 className="font-orbitron mb-2 text-lg font-semibold text-green-300">
            Loading Smash Ultimate Statistics
          </h4>
          <p className="font-rajdhani text-sm text-green-200">
            Please wait while we fetch your competitive performance data...
          </p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    const errorMessage =
      error?.message ?? "Failed to load Smash Ultimate statistics";

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-700/30 bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-red-300">
                Smash Ultimate Stats Unavailable
              </h4>
              <p className="font-rajdhani mb-3 text-xs text-red-200">
                {errorMessage.includes("hasn't connected")
                  ? viewMode === "other"
                    ? "This player hasn't connected their start.gg account yet."
                    : "You haven't connected your start.gg account yet."
                  : errorMessage}
              </p>
              {errorMessage.includes("hasn't connected") &&
                viewMode === "self" &&
                (onConnect ? (
                  <Button
                    onClick={onConnect}
                    variant="outline"
                    size="sm"
                    className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                  >
                    Connect start.gg Account
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Link href="/dashboard/player/profile/external-accounts">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                    >
                      Connect start.gg Account
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ))}
              {onRetry && !errorMessage.includes("hasn't connected") && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  size="sm"
                  className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no error but no stats yet, show loading state
  if (!stats && !isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-green-700/30 bg-green-900/20 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-green-400 border-t-transparent"></div>
          </div>
          <h4 className="font-orbitron mb-2 text-lg font-semibold text-green-300">
            Preparing Smash Ultimate Statistics
          </h4>
          <p className="font-rajdhani text-sm text-green-200">
            Initializing data connection...
          </p>
        </div>
      </div>
    );
  }

  const smashStats = stats as SmashStats;

  // Early return if no stats data
  if (!smashStats) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-700/30 bg-gray-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-gray-300">
                No Smash Ultimate Data Available
              </h4>
              <p className="font-rajdhani text-xs text-gray-400">
                {viewMode === "other"
                  ? "This player hasn't connected their start.gg account yet."
                  : "Connect your start.gg account to view detailed statistics."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { playerInfo, stats: playerStats, recentPlacements } = smashStats;

  // Compact mode for embedding in smaller spaces (like player previews)
  if (size === "compact") {
    return (
      <div className="space-y-3">
        {/* Compact Core Metrics */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-purple-700/30 bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-3 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-purple-300">
              {((playerInfo.evalScore / 100) * 100).toFixed(1)}
            </div>
            <div className="font-rajdhani text-xs text-purple-400">
              EVAL SCORE
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
            <div className="font-orbitron mb-1 text-lg font-bold text-yellow-400">
              {(playerStats.set_win_rate * 100).toFixed(1)}%
            </div>
            <div className="font-rajdhani text-xs text-gray-400">SET WIN</div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
            <div className="font-orbitron mb-1 text-lg font-bold text-blue-400">
              {(playerStats.game_win_rate * 100).toFixed(1)}%
            </div>
            <div className="font-rajdhani text-xs text-gray-400">GAME WIN</div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
            <div className="font-orbitron mb-1 text-lg font-bold text-purple-400">
              {playerStats.events}
            </div>
            <div className="font-rajdhani text-xs text-gray-400">EVENTS</div>
          </div>
        </div>

        {/* Compact Player & Main Info */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="font-rajdhani mb-1 text-xs text-gray-400">
              PLAYER TAG
            </div>
            <div className="font-orbitron text-sm font-bold text-green-400">
              {playerInfo.prefix !== "Unknown" ? `${playerInfo.prefix} ` : ""}
              {playerInfo.gamerTag}
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="font-rajdhani mb-1 text-xs text-gray-400">
              MAIN CHARACTER
            </div>
            <div className="font-orbitron text-sm font-bold text-white">
              {playerInfo.mainCharacter}
            </div>
          </div>
        </div>

        {/* Compact Recent Placements */}
        {recentPlacements.length > 0 && (
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="font-rajdhani mb-2 text-xs text-gray-400">
              RECENT PLACEMENTS
            </div>
            <div className="space-y-1">
              {recentPlacements.slice(0, 2).map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-rajdhani truncate text-gray-300">
                    {result.event}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-rajdhani text-xs text-gray-400">
                      {result.entrants}
                    </span>
                    <span
                      className={`font-orbitron rounded px-2 py-1 text-xs ${
                        result.placement <= 8
                          ? "bg-yellow-600/20 text-yellow-400"
                          : "bg-gray-700/50 text-gray-300"
                      }`}
                    >
                      #{result.placement}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Information Panel */}
      {showInfoPanel && (
        <div className="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-4 w-4 text-green-400" />
            <div>
              <h4 className="font-orbitron mb-1 text-sm font-semibold text-green-300">
                About These Statistics
              </h4>
              <div className="font-rajdhani space-y-1 text-xs text-green-200">
                <p>
                  • <strong>Tournament matches only:</strong> All statistics are
                  based exclusively on competitive tournament gameplay.
                </p>
                <p>
                  • <strong>Skill-adjusted scoring:</strong> Performance
                  expectations are adjusted based on your skill level and
                  tournament caliber.
                </p>
                <p>
                  • <strong>EVAL Score:</strong> Comprehensive metric (0-100)
                  measuring performance across technical skill, adaptability,
                  and tournament success.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combined Player Account Info and Main Character Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Player Account Info */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="font-rajdhani mb-2 flex items-center gap-1 text-xs text-gray-400">
            SMASH ULTIMATE ACCOUNT
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Connected start.gg account information and main character.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="font-orbitron text-lg font-bold text-green-400">
            {playerInfo.prefix !== "Unknown" ? `${playerInfo.prefix} ` : ""}
            {playerInfo.gamerTag}
          </div>
        </div>

        {/* Main Character Details */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="font-orbitron mb-3 text-sm font-bold text-white">
            Main Character Stats
          </h3>
          <div className="space-y-2">
            {Object.entries(playerStats.mains).map(
              ([character, characterStats]) => (
                <div
                  key={character}
                  className="flex items-center justify-between rounded-md bg-gray-800/50 p-2"
                >
                  <div className="flex items-center gap-2">
                    {characterStats.image_path ? (
                      <div className="relative h-6 w-6 cursor-pointer overflow-hidden rounded transition-transform hover:scale-105">
                        <Image
                          src={characterStats.image_path}
                          alt={character}
                          fill
                          className="object-cover"
                          sizes="24px"
                        />
                      </div>
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    )}
                    <span className="font-rajdhani text-sm font-medium text-gray-200">
                      {character}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-rajdhani text-xs text-gray-400">
                      {characterStats.games}g
                    </span>
                    <div className="font-orbitron rounded border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                      {(characterStats.winrate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Core Performance Metrics */}
      <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
        <div className="rounded-tl-lg border border-purple-700/30 bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-3 text-center">
          <div className="font-orbitron mb-1 text-2xl font-bold text-purple-300">
            {((playerInfo.evalScore / 100) * 100).toFixed(1)}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-purple-400">
            EVAL SCORE
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-purple-500 hover:text-purple-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Comprehensive performance metric based on tournament results,
                  character mastery, and competitive analysis.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron mb-1 text-xl font-bold text-yellow-400">
            {(playerStats.set_win_rate * 100).toFixed(1)}%
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            SET WIN
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Percentage of tournament sets won across all competitive
                  matches.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron mb-1 text-xl font-bold text-blue-400">
            {(playerStats.game_win_rate * 100).toFixed(1)}%
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            GAME WIN
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Percentage of individual games won within tournament sets.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-tr-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron mb-1 text-xl font-bold text-purple-400">
            {(playerStats.clutch_factor * 100).toFixed(1)}%
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            CLUTCH
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Ability to perform in high-pressure situations and close
                  matches.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Recent Placements - Compact */}
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
        <h3 className="font-orbitron mb-3 text-sm font-bold text-white">
          Recent Tournament Placements
        </h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {recentPlacements.slice(0, 4).map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md bg-gray-800/50 p-2"
            >
              <span className="font-rajdhani mr-2 flex-1 truncate text-sm font-medium text-gray-200">
                {result.event}
              </span>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="font-rajdhani text-xs text-gray-400">
                  {result.entrants}
                </span>
                <div
                  className={`font-orbitron rounded px-2 py-0.5 text-xs ${
                    result.placement === 1
                      ? "bg-yellow-400/20 text-yellow-300"
                      : result.placement === 2
                        ? "bg-gray-300/20 text-gray-200"
                        : result.placement === 3
                          ? "bg-orange-600/20 text-orange-400"
                          : result.placement <= 8
                            ? "bg-yellow-600/20 text-yellow-400"
                            : "bg-gray-700/50 text-gray-300"
                  }`}
                >
                  #{result.placement}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matchup Analysis - Compact Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Best & Worst Matchups Combined */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="font-orbitron mb-3 flex items-center gap-2 text-sm font-bold text-emerald-400">
            <TrendingUpIcon className="h-4 w-4" />
            Best Matchups
          </h3>
          <div className="space-y-2">
            {Object.entries(playerStats.best_matchups).flatMap(
              ([character, opponents]) =>
                Object.entries(opponents)
                  .slice(0, 3)
                  .map(([opponent, data]) => (
                    <div
                      key={`${character}-${opponent}`}
                      className="flex items-center justify-between rounded-md bg-gray-800/50 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {data.player_character_image ? (
                            <div className="relative h-5 w-5 cursor-pointer overflow-hidden rounded transition-transform hover:scale-105">
                              <Image
                                src={data.player_character_image}
                                alt={character}
                                fill
                                className="object-cover"
                                sizes="20px"
                              />
                            </div>
                          ) : null}
                          <span className="font-rajdhani text-xs text-gray-200">
                            {character.slice(0, 8)}
                          </span>
                        </div>
                        <span className="font-rajdhani text-xs text-gray-400">
                          vs
                        </span>
                        <div className="flex items-center gap-1">
                          {data.opponent_character_image ? (
                            <div className="relative h-5 w-5 cursor-pointer overflow-hidden rounded transition-transform hover:scale-105">
                              <Image
                                src={data.opponent_character_image}
                                alt={opponent}
                                fill
                                className="object-cover"
                                sizes="20px"
                              />
                            </div>
                          ) : null}
                          <span className="font-rajdhani text-xs text-gray-200">
                            {opponent.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-rajdhani text-xs text-gray-300">
                          {data.wins}-{data.games - data.wins}
                        </span>
                        <span
                          className={`font-orbitron text-xs ${getWinRateColor(data.winrate)}`}
                        >
                          {(data.winrate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )),
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="font-orbitron mb-3 flex items-center gap-2 text-sm font-bold text-red-400">
            <TrendingDownIcon className="h-4 w-4" />
            Worst Matchups
          </h3>
          <div className="space-y-2">
            {Object.entries(playerStats.worst_matchups).flatMap(
              ([character, opponents]) =>
                Object.entries(opponents)
                  .slice(0, 3)
                  .map(([opponent, data]) => (
                    <div
                      key={`${character}-${opponent}`}
                      className="flex items-center justify-between rounded-md bg-gray-800/50 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {data.player_character_image ? (
                            <div className="relative h-5 w-5 cursor-pointer overflow-hidden rounded transition-transform hover:scale-105">
                              <Image
                                src={data.player_character_image}
                                alt={character}
                                fill
                                className="object-cover"
                                sizes="20px"
                              />
                            </div>
                          ) : null}
                          <span className="font-rajdhani text-xs text-gray-200">
                            {character.slice(0, 8)}
                          </span>
                        </div>
                        <span className="font-rajdhani text-xs text-gray-400">
                          vs
                        </span>
                        <div className="flex items-center gap-1">
                          {data.opponent_character_image ? (
                            <div className="relative h-5 w-5 cursor-pointer overflow-hidden rounded transition-transform hover:scale-105">
                              <Image
                                src={data.opponent_character_image}
                                alt={opponent}
                                fill
                                className="object-cover"
                                sizes="20px"
                              />
                            </div>
                          ) : null}
                          <span className="font-rajdhani text-xs text-gray-200">
                            {opponent.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-rajdhani text-xs text-gray-300">
                          {data.wins}-{data.games - data.wins}
                        </span>
                        <span
                          className={`font-orbitron text-xs ${getWinRateColor(data.winrate)}`}
                        >
                          {(data.winrate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )),
            )}
          </div>
        </div>
      </div>

      {/* Stage Performance - Compact */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="font-orbitron mb-3 flex items-center gap-2 text-sm font-bold text-emerald-400">
            <TrendingUpIcon className="h-4 w-4" />
            Best Stages
          </h3>
          <div className="space-y-2">
            {Object.entries(playerStats.best_stages)
              .slice(0, 4)
              .map(([stage, stageStats]) => (
                <div
                  key={stage}
                  className="flex items-center justify-between rounded-md bg-gray-800/50 p-2"
                >
                  <span className="font-rajdhani mr-2 flex-1 truncate text-sm font-medium text-gray-200">
                    {stage}
                  </span>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="font-rajdhani text-xs text-gray-300">
                      {stageStats.wins}-{stageStats.losses}
                    </span>
                    <div className="font-orbitron rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                      {(stageStats.winrate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <h3 className="font-orbitron mb-3 flex items-center gap-2 text-sm font-bold text-red-400">
            <TrendingDownIcon className="h-4 w-4" />
            Worst Stages
          </h3>
          <div className="space-y-2">
            {Object.entries(playerStats.worst_stages)
              .slice(0, 4)
              .map(([stage, stageStats]) => (
                <div
                  key={stage}
                  className="flex items-center justify-between rounded-md bg-gray-800/50 p-2"
                >
                  <span className="font-rajdhani mr-2 flex-1 truncate text-sm font-medium text-gray-200">
                    {stage}
                  </span>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="font-rajdhani text-xs text-gray-300">
                      {stageStats.wins}-{stageStats.losses}
                    </span>
                    <div className="font-orbitron rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
                      {(stageStats.winrate * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmashAnalytics;
