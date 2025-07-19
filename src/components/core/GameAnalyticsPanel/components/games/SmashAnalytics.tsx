import React from "react";
import { InfoIcon, TrophyIcon, GamepadIcon, ZapIcon, TargetIcon, TrendingUpIcon, TrendingDownIcon, ArrowRightIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h4 className="text-lg font-orbitron font-semibold text-green-300 mb-2">Loading Smash Ultimate Statistics</h4>
          <p className="text-sm text-green-200 font-rajdhani">Please wait while we fetch your competitive performance data...</p>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    const errorMessage = error?.message ?? "Failed to load Smash Ultimate statistics";
    
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-red-300 mb-2">Smash Ultimate Stats Unavailable</h4>
              <p className="text-xs text-red-200 font-rajdhani mb-3">
                {errorMessage.includes("hasn't connected") 
                  ? (viewMode === "other" 
                      ? "This player hasn't connected their start.gg account yet."
                      : "You haven't connected your start.gg account yet.")
                  : errorMessage}
              </p>
              {errorMessage.includes("hasn't connected") && viewMode === "self" && (
                onConnect ? (
                  <Button
                    onClick={onConnect}
                    variant="outline"
                    size="sm"
                    className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                  >
                    Connect start.gg Account
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Link href="/dashboard/player/profile/external-accounts">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                    >
                      Connect start.gg Account
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )
              )}
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
        <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h4 className="text-lg font-orbitron font-semibold text-green-300 mb-2">Preparing Smash Ultimate Statistics</h4>
          <p className="text-sm text-green-200 font-rajdhani">Initializing data connection...</p>
        </div>
      </div>
    );
  }

  const smashStats = stats as SmashStats;

  // Early return if no stats data
  if (!smashStats) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900/20 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-gray-300 mb-2">No Smash Ultimate Data Available</h4>
              <p className="text-xs text-gray-400 font-rajdhani">
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
      <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-orbitron font-semibold text-green-300 mb-2">About These Statistics</h4>
            <div className="text-xs text-green-200 font-rajdhani space-y-1">
              <p>• <strong>Tournament matches only:</strong> All statistics are based exclusively on competitive tournament gameplay.</p>
              <p>• <strong>Skill-adjusted scoring:</strong> Performance expectations are adjusted based on your skill level and tournament caliber.</p>
              <p>• <strong>EVAL Score:</strong> Comprehensive metric (0-100) measuring performance across technical skill, adaptability, and tournament success.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Player Account Info */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
          SMASH ULTIMATE ACCOUNT
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
              <p>Connected start.gg account information and main character.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-lg font-orbitron font-bold text-green-400">
            {playerInfo.prefix !== "Unknown" ? `${playerInfo.prefix} ` : ""}{playerInfo.gamerTag}
          </div>
          <div className="text-sm text-gray-400">
            Main: <span className="text-green-400 font-semibold">{playerInfo.mainCharacter}</span>
          </div>
        </div>
      </div>

      {/* Core Performance Metrics - Top Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-tl-lg md:rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-none p-4 text-center">
          <div className="text-3xl font-orbitron font-bold text-purple-300 mb-1">
            {((playerInfo.evalScore / 100) * 100).toFixed(1)}
          </div>
          <div className="text-xs text-purple-400 font-rajdhani flex items-center justify-center gap-1">
            EVAL SCORE
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-purple-500 hover:text-purple-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Comprehensive performance metric based on tournament results, character mastery, and competitive analysis.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="border border-gray-700 rounded-none p-4 text-center md:rounded-none">
          <div className="text-xl font-orbitron font-bold text-yellow-400 mb-1">
            {(playerStats.set_win_rate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            SET WIN RATE
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Percentage of tournament sets won across all competitive matches.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="border border-gray-700 rounded-none p-4 text-center md:rounded-none">
          <div className="text-xl font-orbitron font-bold text-blue-400 mb-1">
            {(playerStats.game_win_rate * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            GAME WIN RATE
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Percentage of individual games won within tournament sets.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="border border-gray-700 rounded-tr-lg md:rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-none p-4 text-center">
          <div className="text-xl font-orbitron font-bold text-purple-400 mb-1">
            {(playerStats.clutch_factor * 100).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            CLUTCH FACTOR
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Ability to perform in high-pressure situations and close matches.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
            EVENTS ATTENDED
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Total number of competitive tournaments attended.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-orbitron font-bold text-white">{playerStats.events}</div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
            MAIN CHARACTERS
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Characters you play most frequently in competitive matches.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-orbitron font-bold text-white">{Object.keys(playerStats.mains).length}</div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
            RECENT PLACEMENTS
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Your most recent tournament placement results.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-2xl font-orbitron font-bold text-white">{recentPlacements.length}</div>
        </div>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Characters */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-lg font-orbitron font-bold text-white mb-4 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-green-400" />
            Main Characters
          </h3>
          <div className="space-y-3">
            {Object.entries(playerStats.mains).map(([character, characterStats]) => (
              <div key={character} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-rajdhani font-medium text-gray-200">{character}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-rajdhani">{characterStats.games} games</span>
                  <div className="bg-green-500/10 border border-green-500/30 px-2 py-1 rounded text-green-400 text-sm font-orbitron">
                    {(characterStats.winrate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Placements */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-lg font-orbitron font-bold text-white mb-4 flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-400" />
            Recent Placements
          </h3>
          <div className="space-y-3">
            {recentPlacements.slice(0, 4).map((result, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${result.placement <= 8 ? "bg-yellow-500" : "bg-gray-500"}`}
                  ></div>
                  <span className="text-gray-200 font-rajdhani font-medium">{result.event}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 font-rajdhani">{result.entrants} entrants</span>
                  <div
                    className={`px-2 py-1 rounded text-sm font-orbitron ${
                      result.placement <= 8
                        ? "bg-yellow-600/20 border border-yellow-600/30 text-yellow-400"
                        : "bg-gray-700/50 border border-gray-600/30 text-gray-300"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Matchups */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Best Matchups
          </h3>
          <p className="text-gray-400 text-sm font-rajdhani mb-4">Your strongest character matchups</p>
          <div className="space-y-3">
            {Object.entries(playerStats.best_matchups).flatMap(([character, opponents]) =>
              Object.entries(opponents).map(([opponent, data]) => (
                <div key={`${character}-${opponent}`} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="font-rajdhani font-medium text-gray-200 text-sm">{character} vs {opponent}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm font-rajdhani">
                      {data.wins}-{data.games - data.wins}
                    </span>
                    <span className={`text-sm font-orbitron ${getWinRateColor(data.winrate)}`}>
                      {(data.winrate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Worst Matchups */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-red-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5" />
            Worst Matchups
          </h3>
          <p className="text-gray-400 text-sm font-rajdhani mb-4">Matchups that need improvement</p>
          <div className="space-y-3">
            {Object.entries(playerStats.worst_matchups).flatMap(([character, opponents]) =>
              Object.entries(opponents).map(([opponent, data]) => (
                <div key={`${character}-${opponent}`} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                  <span className="font-rajdhani font-medium text-gray-200 text-sm">{character} vs {opponent}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm font-rajdhani">
                      {data.wins}-{data.games - data.wins}
                    </span>
                    <span className={`text-sm font-orbitron ${getWinRateColor(data.winrate)}`}>
                      {(data.winrate * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stage Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Stages */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5" />
            Best Stages
          </h3>
          <p className="text-gray-400 text-sm font-rajdhani mb-4">Stages where you perform best</p>
          <div className="space-y-3">
            {Object.entries(playerStats.best_stages).map(([stage, stageStats]) => (
              <div key={stage} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-200 font-rajdhani font-medium">{stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm font-rajdhani">
                    {stageStats.wins}-{stageStats.losses}
                  </span>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded text-emerald-400 text-sm font-orbitron">
                    {(stageStats.winrate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Stages */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-red-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5" />
            Worst Stages
          </h3>
          <p className="text-gray-400 text-sm font-rajdhani mb-4">Stages that need more practice</p>
          <div className="space-y-3">
            {Object.entries(playerStats.worst_stages).map(([stage, stageStats]) => (
              <div key={stage} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-200 font-rajdhani font-medium">{stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm font-rajdhani">
                    {stageStats.wins}-{stageStats.losses}
                  </span>
                  <div className="bg-red-500/10 border border-red-500/30 px-2 py-1 rounded text-red-400 text-sm font-orbitron">
                    {(stageStats.winrate * 100).toFixed(1)}%
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