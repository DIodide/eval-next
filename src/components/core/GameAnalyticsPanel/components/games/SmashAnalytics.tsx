import React from "react";
import { InfoIcon, TrophyIcon, GamepadIcon, ZapIcon, TargetIcon, TrendingUpIcon, TrendingDownIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  onRetry,
  onConnect,
}: GameComponentProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h4 className="text-lg font-orbitron font-semibold text-blue-300 mb-2">Loading Smash Ultimate Analytics</h4>
            <p className="text-xs text-blue-200 font-rajdhani">Please wait while we fetch your competitive performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    const errorMessage = error?.message ?? "Failed to load Smash Ultimate statistics";
    
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-red-300 mb-2">Smash Ultimate Stats Unavailable</h4>
              <p className="text-xs text-red-200 font-rajdhani mb-3">{errorMessage}</p>
              {errorMessage.includes("hasn't connected") && (
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

  const smashStats = stats as SmashStats;
  const { playerInfo, stats: playerStats, recentPlacements } = smashStats;

  return (
    <div className="space-y-6">
      {/* Player Info Header */}
      <div className="bg-gradient-to-r from-[#1a1a2e]/90 to-[#16213e]/90 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div>
              <h2 className="text-2xl font-orbitron font-bold text-white">
                {playerInfo.prefix !== "Unknown" ? playerInfo.prefix : ""} {playerInfo.gamerTag}
              </h2>
              <p className="text-gray-400 font-rajdhani">Competitive Player</p>
            </div>
            <div className="h-12 w-px bg-gray-700"></div>
            <div>
              <p className="text-sm text-gray-400 font-rajdhani">Main Character</p>
              <p className="text-lg font-orbitron font-semibold text-purple-400">{playerInfo.mainCharacter}</p>
            </div>
            <div className="h-12 w-px bg-gray-700"></div>
            <div>
              <p className="text-sm text-gray-400 font-rajdhani">EVAL Score</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-orbitron font-semibold text-emerald-400">
                  {Math.round((playerInfo.evalScore / 100) * 100)}/100
                </p>
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(playerInfo.evalScore / 100) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Row: Stats, Mains and Recent Placements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Stats */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-lg font-orbitron font-bold text-white mb-4">Performance Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-300 font-rajdhani">Set Win Rate</span>
              </div>
              <span className="font-orbitron font-bold text-white">{(playerStats.set_win_rate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GamepadIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-300 font-rajdhani">Game Win Rate</span>
              </div>
              <span className="font-orbitron font-bold text-white">{(playerStats.game_win_rate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ZapIcon className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-300 font-rajdhani">Clutch Factor</span>
              </div>
              <span className="font-orbitron font-bold text-white">{(playerStats.clutch_factor * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TargetIcon className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-300 font-rajdhani">Events</span>
              </div>
              <span className="font-orbitron font-bold text-white">{playerStats.events}</span>
            </div>
          </div>
        </div>

        {/* Main Characters */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-lg font-orbitron font-bold text-white mb-4">Main Characters</h3>
          <div className="space-y-3">
            {Object.entries(playerStats.mains).map(([character, characterStats]) => (
              <div key={character} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="font-rajdhani font-medium text-gray-200">{character}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-rajdhani">{characterStats.games} games</span>
                  <div className="bg-purple-500/10 border border-purple-500/30 px-2 py-1 rounded text-purple-400 text-xs font-orbitron">
                    {(characterStats.winrate * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Placements */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-lg font-orbitron font-bold text-white mb-4">Recent Placements</h3>
          <div className="space-y-3">
            {recentPlacements.slice(0, 3).map((result, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${result.placement <= 8 ? "bg-yellow-500" : "bg-gray-500"}`}
                  ></div>
                  <span className="text-gray-200 text-sm font-rajdhani">{result.event}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-rajdhani">{result.entrants} entrants</span>
                  <div
                    className={`px-2 py-1 rounded text-xs font-orbitron ${
                      result.placement <= 8
                        ? "bg-yellow-600/80 text-black"
                        : "bg-gray-700/80 text-gray-300"
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

      {/* Middle Row: Matchups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Matchups */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Best Matchups
          </h3>
          <p className="text-gray-400 text-sm font-rajdhani mb-4">Your strongest character matchups</p>
          <div className="space-y-3">
            {Object.entries(playerStats.best_matchups).flatMap(([character, opponents]) =>
              Object.entries(opponents).map(([opponent, data]) => (
                <div key={`${character}-${opponent}`} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
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
            <TrendingDownIcon className="h-4 w-4" />
            Worst Matchups
          </h3>
          <p className="text-gray-400 text-sm font-rajdhani mb-4">Matchups that need improvement</p>
          <div className="space-y-3">
            {Object.entries(playerStats.worst_matchups).flatMap(([character, opponents]) =>
              Object.entries(opponents).map(([opponent, data]) => (
                <div key={`${character}-${opponent}`} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
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

      {/* Bottom Row: Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Stages */}
        <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
          <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Best Stages
          </h3>
          <div className="space-y-3">
            {Object.entries(playerStats.best_stages).map(([stage, stageStats]) => (
              <div key={stage} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <span className="text-gray-200 text-sm font-rajdhani">{stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm font-rajdhani">
                    {stageStats.wins}-{stageStats.losses}
                  </span>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded text-emerald-400 text-xs font-orbitron">
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
            <TrendingDownIcon className="h-4 w-4" />
            Worst Stages
          </h3>
          <div className="space-y-3">
            {Object.entries(playerStats.worst_stages).map(([stage, stageStats]) => (
              <div key={stage} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                <span className="text-gray-200 text-sm font-rajdhani">{stage}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm font-rajdhani">
                    {stageStats.wins}-{stageStats.losses}
                  </span>
                  <div className="bg-red-500/10 border border-red-500/30 px-2 py-1 rounded text-red-400 text-xs font-orbitron">
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