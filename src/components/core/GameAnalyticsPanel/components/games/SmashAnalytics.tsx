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

  return (
    <div className="space-y-6">
      {/* Information Panel */}
      <div className="rounded-lg border border-green-700/30 bg-green-900/20 p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="mt-0.5 h-5 w-5 text-green-400" />
          <div>
            <h4 className="font-orbitron mb-2 text-sm font-semibold text-green-300">
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
                measuring performance across technical skill, adaptability, and
                tournament success.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Player Account Info */}
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
        <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
          SMASH ULTIMATE ACCOUNT
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
            </TooltipTrigger>
            <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
              <p>Connected start.gg account information and main character.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-orbitron text-lg font-bold text-green-400">
            {playerInfo.prefix !== "Unknown" ? `${playerInfo.prefix} ` : ""}
            {playerInfo.gamerTag}
          </div>
          <div className="text-sm text-gray-400">
            Main:{" "}
            <span className="font-semibold text-green-400">
              {playerInfo.mainCharacter}
            </span>
          </div>
        </div>
      </div>

      {/* Core Performance Metrics - Top Row */}
      <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
        <div className="rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-none border border-purple-700/30 bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-4 text-center md:rounded-tl-lg">
          <div className="font-orbitron mb-1 text-3xl font-bold text-purple-300">
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

        <div className="rounded-none border border-gray-700 p-4 text-center md:rounded-none">
          <div className="font-orbitron mb-1 text-xl font-bold text-yellow-400">
            {(playerStats.set_win_rate * 100).toFixed(1)}%
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            SET WIN RATE
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

        <div className="rounded-none border border-gray-700 p-4 text-center md:rounded-none">
          <div className="font-orbitron mb-1 text-xl font-bold text-blue-400">
            {(playerStats.game_win_rate * 100).toFixed(1)}%
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            GAME WIN RATE
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

        <div className="rounded-tl-none rounded-tr-lg rounded-br-none rounded-bl-none border border-gray-700 p-4 text-center md:rounded-tr-lg">
          <div className="font-orbitron mb-1 text-xl font-bold text-purple-400">
            {(playerStats.clutch_factor * 100).toFixed(1)}%
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            CLUTCH FACTOR
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

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            EVENTS ATTENDED
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>Total number of competitive tournaments attended.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="font-orbitron text-2xl font-bold text-white">
            {playerStats.events}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            MAIN CHARACTERS
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Characters you play most frequently in competitive matches.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="font-orbitron text-2xl font-bold text-white">
            {Object.keys(playerStats.mains).length}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            RECENT PLACEMENTS
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>Your most recent tournament placement results.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="font-orbitron text-2xl font-bold text-white">
            {recentPlacements.length}
          </div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main Characters */}
        <div className="rounded-lg border border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <UserIcon className="h-5 w-5 text-green-400" />
            Main Characters
          </h3>
          <div className="space-y-3">
            {Object.entries(playerStats.mains).map(
              ([character, characterStats]) => (
                <div
                  key={character}
                  className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="font-rajdhani font-medium text-gray-200">
                      {character}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-rajdhani text-sm text-gray-400">
                      {characterStats.games} games
                    </span>
                    <div className="font-orbitron rounded border border-green-500/30 bg-green-500/10 px-2 py-1 text-sm text-green-400">
                      {(characterStats.winrate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Recent Placements */}
        <div className="rounded-lg border border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <TrophyIcon className="h-5 w-5 text-yellow-400" />
            Recent Placements
          </h3>
          <div className="space-y-3">
            {recentPlacements.slice(0, 4).map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${result.placement <= 8 ? "bg-yellow-500" : "bg-gray-500"}`}
                  ></div>
                  <span className="font-rajdhani font-medium text-gray-200">
                    {result.event}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-rajdhani text-sm text-gray-400">
                    {result.entrants} entrants
                  </span>
                  <div
                    className={`font-orbitron rounded px-2 py-1 text-sm ${
                      result.placement <= 8
                        ? "border border-yellow-600/30 bg-yellow-600/20 text-yellow-400"
                        : "border border-gray-600/30 bg-gray-700/50 text-gray-300"
                    }`}
                  >
                    #{result.placement}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Matchup Analysis */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best Matchups */}
        <div className="rounded-lg border border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg font-bold text-emerald-400">
            <TrendingUpIcon className="h-5 w-5" />
            Best Matchups
          </h3>
          <p className="font-rajdhani mb-4 text-sm text-gray-400">
            Your strongest character matchups
          </p>
          <div className="space-y-3">
            {Object.entries(playerStats.best_matchups).flatMap(
              ([character, opponents]) =>
                Object.entries(opponents).map(([opponent, data]) => (
                  <div
                    key={`${character}-${opponent}`}
                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                  >
                    <span className="font-rajdhani text-sm font-medium text-gray-200">
                      {character} vs {opponent}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-rajdhani text-sm text-gray-300">
                        {data.wins}-{data.games - data.wins}
                      </span>
                      <span
                        className={`font-orbitron text-sm ${getWinRateColor(data.winrate)}`}
                      >
                        {(data.winrate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )),
            )}
          </div>
        </div>

        {/* Worst Matchups */}
        <div className="rounded-lg border border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg font-bold text-red-400">
            <TrendingDownIcon className="h-5 w-5" />
            Worst Matchups
          </h3>
          <p className="font-rajdhani mb-4 text-sm text-gray-400">
            Matchups that need improvement
          </p>
          <div className="space-y-3">
            {Object.entries(playerStats.worst_matchups).flatMap(
              ([character, opponents]) =>
                Object.entries(opponents).map(([opponent, data]) => (
                  <div
                    key={`${character}-${opponent}`}
                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                  >
                    <span className="font-rajdhani text-sm font-medium text-gray-200">
                      {character} vs {opponent}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-rajdhani text-sm text-gray-300">
                        {data.wins}-{data.games - data.wins}
                      </span>
                      <span
                        className={`font-orbitron text-sm ${getWinRateColor(data.winrate)}`}
                      >
                        {(data.winrate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )),
            )}
          </div>
        </div>
      </div>

      {/* Stage Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Best Stages */}
        <div className="rounded-lg border border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg font-bold text-emerald-400">
            <TrendingUpIcon className="h-5 w-5" />
            Best Stages
          </h3>
          <p className="font-rajdhani mb-4 text-sm text-gray-400">
            Stages where you perform best
          </p>
          <div className="space-y-3">
            {Object.entries(playerStats.best_stages).map(
              ([stage, stageStats]) => (
                <div
                  key={stage}
                  className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                >
                  <span className="font-rajdhani font-medium text-gray-200">
                    {stage}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-rajdhani text-sm text-gray-300">
                      {stageStats.wins}-{stageStats.losses}
                    </span>
                    <div className="font-orbitron rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-sm text-emerald-400">
                      {(stageStats.winrate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Worst Stages */}
        <div className="rounded-lg border border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg font-bold text-red-400">
            <TrendingDownIcon className="h-5 w-5" />
            Worst Stages
          </h3>
          <p className="font-rajdhani mb-4 text-sm text-gray-400">
            Stages that need more practice
          </p>
          <div className="space-y-3">
            {Object.entries(playerStats.worst_stages).map(
              ([stage, stageStats]) => (
                <div
                  key={stage}
                  className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                >
                  <span className="font-rajdhani font-medium text-gray-200">
                    {stage}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-rajdhani text-sm text-gray-300">
                      {stageStats.wins}-{stageStats.losses}
                    </span>
                    <div className="font-orbitron rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-sm text-red-400">
                      {(stageStats.winrate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmashAnalytics;
