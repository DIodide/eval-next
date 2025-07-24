import React, { useState } from "react";
import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { GameComponentProps, RocketLeagueStats } from "../../types";
import {
  ROCKET_LEAGUE_PLAYLISTS,
  PLAYLIST_DISPLAY_NAMES,
} from "../../utils/constants";

export function RocketLeagueAnalytics({
  stats,
  isConnected: _isConnected,
  isLoading,
  error,
  viewMode = "self",
  showInfoPanel = true, // Default to true to maintain current behavior
  onRetry,
  onConnect,
}: GameComponentProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<
    "duels" | "doubles" | "standard"
  >("standard");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent"></div>
          </div>
          <h4 className="font-orbitron mb-2 text-lg font-semibold text-orange-300">
            Loading Rocket League Statistics
          </h4>
          <p className="font-rajdhani text-sm text-orange-200">
            Please wait while we fetch your Rocket League performance data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-700/30 bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-red-300">
                Failed to Load Rocket League Statistics
              </h4>
              <p className="font-rajdhani mb-3 text-xs text-red-200">
                Error fetching Rocket League stats:{" "}
                {error.message ?? "Unknown error"}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="rounded-md bg-red-600 px-3 py-1 text-xs text-white transition-colors hover:bg-red-700"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-orange-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-orange-300">
                {viewMode === "other"
                  ? "Rocket League Account Not Connected"
                  : "Connect Your Epic Games Account"}
              </h4>
              <p className="font-rajdhani mb-3 text-xs text-orange-200">
                {viewMode === "other"
                  ? "This player hasn't connected their Epic Games account yet."
                  : "To view your Rocket League statistics, you need to connect your Epic Games account first."}
              </p>
              {viewMode === "self" &&
                (onConnect ? (
                  <button
                    onClick={onConnect}
                    className="rounded-md bg-orange-600 px-3 py-1 text-xs text-white transition-colors hover:bg-orange-700"
                  >
                    Connect Epic Games
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      window.open(
                        "/dashboard/player/profile/external-accounts",
                        "_blank",
                      )
                    }
                    className="rounded-md bg-orange-600 px-3 py-1 text-xs text-white transition-colors hover:bg-orange-700"
                  >
                    Connect Epic Games
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const rocketLeagueStats = stats as RocketLeagueStats;

  // Early return if no stats data
  if (!rocketLeagueStats) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-700/30 bg-gray-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-gray-300">
                No Rocket League Data Available
              </h4>
              <p className="font-rajdhani text-xs text-gray-400">
                {viewMode === "other"
                  ? "This player hasn't connected their Epic Games account yet."
                  : "Connect your Epic Games account to view detailed statistics."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlaylistStats = rocketLeagueStats[selectedPlaylist];

  if (!currentPlaylistStats) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-orange-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-orange-300">
                No Stats Available
              </h4>
              <p className="font-rajdhani text-xs text-orange-200">
                No statistics found for {selectedPlaylist}. You may not have
                played enough ranked games in this playlist.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Information Panel */}
      {showInfoPanel && (
        <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-orange-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-orange-300">
                About These Statistics
              </h4>
              <div className="font-rajdhani space-y-1 text-xs text-orange-200">
                <p>
                  • <strong>Competitive matches only:</strong> All statistics
                  are based exclusively on ranked competitive gameplay.
                </p>
                <p>
                  • <strong>Rank-standardized scoring:</strong> Performance
                  expectations are adjusted based on your rank tier.
                </p>
                <p>
                  • <strong>EVAL Score:</strong> Comprehensive metric (0-100)
                  measuring performance across mechanics, positioning, and game
                  impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Selector */}
      <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
        <div className="font-rajdhani mb-3 text-xs text-gray-400">
          ROCKET LEAGUE PLAYLIST
        </div>
        <div className="flex flex-wrap gap-2">
          {ROCKET_LEAGUE_PLAYLISTS.map((playlist) => {
            const hasStats = rocketLeagueStats[playlist] !== null;
            return (
              <button
                key={playlist}
                onClick={() => setSelectedPlaylist(playlist)}
                disabled={!hasStats}
                className={`font-rajdhani rounded-lg border px-4 py-2 font-medium capitalize transition-all duration-200 ${
                  selectedPlaylist === playlist
                    ? "border-transparent bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : hasStats
                      ? "border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50"
                      : "cursor-not-allowed border-gray-700 text-gray-500 opacity-50"
                }`}
              >
                {PLAYLIST_DISPLAY_NAMES[playlist]}
                {!hasStats && <span className="ml-1 text-xs">(No data)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rocket League Account Info */}
      {rocketLeagueStats.username && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            ROCKET LEAGUE ACCOUNT
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>Connected Rocket League account display name.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="font-orbitron text-lg font-bold text-orange-400">
            {rocketLeagueStats.username}
          </div>
        </div>
      )}

      {/* Connected Stats Sections */}
      <div className="space-y-0">
        {/* Core Performance Metrics - Top Row */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
          <div className="rounded-tl-lg rounded-tr-none rounded-br-none rounded-bl-none border border-purple-700/30 bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-4 text-center md:rounded-tl-lg">
            <div className="font-orbitron mb-1 text-3xl font-bold text-purple-300">
              {currentPlaylistStats.eval_score?.toFixed(1) ?? "N/A"}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-purple-400">
              EVAL SCORE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-purple-500 hover:text-purple-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Comprehensive performance metric based on mechanics,
                    positioning, and game impact in competitive matches.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-orange-700/30 bg-gradient-to-r from-orange-900/50 to-orange-800/50 p-4 text-center md:rounded-none">
            <div className="font-orbitron mb-1 text-3xl font-bold text-orange-300">
              {currentPlaylistStats.rank}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-orange-400">
              CURRENT RANK
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-orange-500 hover:text-orange-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>Your current competitive rank tier in this playlist.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-gray-700 p-4 text-center md:rounded-none">
            <div className="font-orbitron mb-1 text-xl font-bold text-green-400">
              {Math.round(currentPlaylistStats.win_percentage * 100)}%
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              WIN RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>Percentage of competitive matches won in this playlist.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-tl-none rounded-tr-lg rounded-br-none rounded-bl-none border border-gray-700 p-4 text-center md:rounded-tr-lg">
            <div className="font-orbitron mb-1 text-xl font-bold text-blue-400">
              {currentPlaylistStats.count}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              GAMES ANALYZED
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Total number of competitive games analyzed for this
                    playlist.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Core Rocket League Stats */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-orange-400">
              {currentPlaylistStats.goals.toFixed(2)}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              GOALS/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>Average goals scored per game in ranked matches.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-cyan-400">
              {currentPlaylistStats.saves.toFixed(2)}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              SAVES/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>Average saves made per game to prevent opponent goals.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-green-400">
              {currentPlaylistStats.assists.toFixed(2)}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              ASSISTS/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Average assists per game by helping teammates score goals.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-yellow-400">
              {currentPlaylistStats.shots.toFixed(2)}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              SHOTS/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>Average shots taken per game towards the opponent goal.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Secondary Performance Metrics */}
        <div className="grid grid-cols-2 gap-0 md:grid-cols-4">
          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-purple-400">
              {currentPlaylistStats.mvps_per_game.toFixed(3)}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              MVP RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Average MVP awards per game, indicating standout
                    performances.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-pink-400">
              {currentPlaylistStats.shooting_percentage.toFixed(1)}%
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              SHOOTING %
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Percentage of shots that result in goals. Higher values
                    indicate better accuracy.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-indigo-400">
              {currentPlaylistStats.speed.toFixed(1)}%
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              AVG SPEED
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Average speed as a percentage of maximum possible speed in
                    Rocket League.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="rounded-none border border-gray-700 bg-gray-900 p-4 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-teal-400">
              {(currentPlaylistStats.clutch * 100).toFixed(1)}%
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
              CLUTCH RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Success rate in clutch situations where you&apos;re the last
                    player able to make a play.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Boost Management Stats */}
        <div className="rounded-tl-none rounded-tr-none rounded-br-lg rounded-bl-lg border border-gray-700 bg-gray-900 p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="font-orbitron text-lg font-bold text-yellow-400">
              ⚡ Boost Management
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Shows how efficiently you manage boost throughout matches.
                  Good boost management is crucial for maintaining field
                  presence and making impactful plays.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Critical Boost Levels */}
          <div className="mb-6 grid grid-cols-2 gap-0">
            <div className="rounded-none border border-red-700/50 bg-red-900/30 p-3 text-center">
              <div className="font-orbitron mb-1 text-2xl font-bold text-red-400">
                {currentPlaylistStats.boost_empty.toFixed(1)}%
              </div>
              <div className="font-rajdhani text-xs text-red-300">
                Empty (0%)
              </div>
            </div>
            <div className="rounded-none border border-green-700/50 bg-green-900/30 p-3 text-center">
              <div className="font-orbitron mb-1 text-2xl font-bold text-green-400">
                {currentPlaylistStats.boost_full.toFixed(1)}%
              </div>
              <div className="font-rajdhani text-xs text-green-300">
                Full (100%)
              </div>
            </div>
          </div>

          {/* Boost Range Distribution */}
          <div className="space-y-3">
            {[
              {
                label: "0-25%",
                value: currentPlaylistStats.boost_0_25,
                color: "bg-red-600",
              },
              {
                label: "25-50%",
                value: currentPlaylistStats.boost_25_50,
                color: "bg-orange-600",
              },
              {
                label: "50-75%",
                value: currentPlaylistStats.boost_50_75,
                color: "bg-yellow-600",
              },
              {
                label: "75-100%",
                value: currentPlaylistStats.boost_75_100,
                color: "bg-green-600",
              },
            ].map((range) => (
              <div
                key={range.label}
                className="flex items-center justify-between"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="font-rajdhani w-16 text-sm text-gray-300">
                    {range.label}
                  </div>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className={`h-full ${range.color} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(range.value, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="font-orbitron ml-3 w-12 text-right text-sm font-bold text-white">
                  {range.value.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RocketLeagueAnalytics;
