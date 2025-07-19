import React, { useState } from "react";
import { InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { GameComponentProps, RocketLeagueStats } from "../../types";
import { ROCKET_LEAGUE_PLAYLISTS, PLAYLIST_DISPLAY_NAMES } from "../../utils/constants";

export function RocketLeagueAnalytics({
  stats,
  isConnected: _isConnected,
  isLoading,
  error,
  viewMode = "self",
  onRetry,
  onConnect,
}: GameComponentProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<'duels' | 'doubles' | 'standard'>('standard');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h4 className="text-lg font-orbitron font-semibold text-orange-300 mb-2">Loading Rocket League Statistics</h4>
          <p className="text-sm text-orange-200 font-rajdhani">Please wait while we fetch your Rocket League performance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-red-300 mb-2">Failed to Load Rocket League Statistics</h4>
              <p className="text-xs text-red-200 font-rajdhani mb-3">
                Error fetching Rocket League stats: {error.message ?? 'Unknown error'}
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
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
        <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-orange-300 mb-2">
                {viewMode === "other" ? "Rocket League Account Not Connected" : "Connect Your Epic Games Account"}
              </h4>
              <p className="text-xs text-orange-200 font-rajdhani mb-3">
                {viewMode === "other" 
                  ? "This player hasn't connected their Epic Games account yet."
                  : "To view your Rocket League statistics, you need to connect your Epic Games account first."}
              </p>
              {viewMode === "self" && (
                onConnect ? (
                  <button
                    onClick={onConnect}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-md transition-colors"
                  >
                    Connect Epic Games
                  </button>
                ) : (
                  <button
                    onClick={() => window.open('/dashboard/player/profile/external-accounts', '_blank')}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-md transition-colors"
                  >
                    Connect Epic Games
                  </button>
                )
              )}
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
        <div className="bg-gray-900/20 border border-gray-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-gray-300 mb-2">No Rocket League Data Available</h4>
              <p className="text-xs text-gray-400 font-rajdhani">
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
        <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-orange-300 mb-2">No Stats Available</h4>
              <p className="text-xs text-orange-200 font-rajdhani">
                No statistics found for {selectedPlaylist}. You may not have played enough ranked games in this playlist.
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
      <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-orange-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-orbitron font-semibold text-orange-300 mb-2">About These Statistics</h4>
            <div className="text-xs text-orange-200 font-rajdhani space-y-1">
              <p>• <strong>Competitive matches only:</strong> All statistics are based exclusively on ranked competitive gameplay.</p>
              <p>• <strong>Rank-standardized scoring:</strong> Performance expectations are adjusted based on your rank tier.</p>
              <p>• <strong>EVAL Score:</strong> Comprehensive metric (0-100) measuring performance across mechanics, positioning, and game impact.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Selector */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="text-xs text-gray-400 font-rajdhani mb-3">ROCKET LEAGUE PLAYLIST</div>
        <div className="flex flex-wrap gap-2">
          {ROCKET_LEAGUE_PLAYLISTS.map((playlist) => {
            const hasStats = rocketLeagueStats[playlist] !== null;
            return (
              <button
                key={playlist}
                onClick={() => setSelectedPlaylist(playlist)}
                disabled={!hasStats}
                className={`px-4 py-2 rounded-lg border transition-all duration-200 font-rajdhani font-medium capitalize ${
                  selectedPlaylist === playlist
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-transparent text-white shadow-lg'
                    : hasStats 
                      ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
                      : 'border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
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
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
            ROCKET LEAGUE ACCOUNT
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Connected Rocket League account display name.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-lg font-orbitron font-bold text-orange-400">
            {rocketLeagueStats.username}
          </div>
        </div>
      )}

      {/* Connected Stats Sections */}
      <div className="space-y-0">
        {/* Core Performance Metrics - Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-tl-lg md:rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-none p-4 text-center">
            <div className="text-3xl font-orbitron font-bold text-purple-300 mb-1">{currentPlaylistStats.eval_score?.toFixed(1) ?? 'N/A'}</div>
            <div className="text-xs text-purple-400 font-rajdhani flex items-center justify-center gap-1">
              EVAL SCORE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-purple-500 hover:text-purple-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Comprehensive performance metric based on mechanics, positioning, and game impact in competitive matches.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-900/50 to-orange-800/50 border border-orange-700/30 rounded-none p-4 text-center md:rounded-none">
            <div className="text-3xl font-orbitron font-bold text-orange-300 mb-1">{currentPlaylistStats.rank}</div>
            <div className="text-xs text-orange-400 font-rajdhani flex items-center justify-center gap-1">
              CURRENT RANK
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-orange-500 hover:text-orange-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Your current competitive rank tier in this playlist.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="border border-gray-700 rounded-none p-4 text-center md:rounded-none">
            <div className="text-xl font-orbitron font-bold text-green-400 mb-1">{Math.round(currentPlaylistStats.win_percentage * 100)}%</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              WIN RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of competitive matches won in this playlist.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="border border-gray-700 rounded-tr-lg md:rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-blue-400 mb-1">{currentPlaylistStats.count}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              GAMES ANALYZED
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Total number of competitive games analyzed for this playlist.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Core Rocket League Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-orange-400 mb-1">{currentPlaylistStats.goals.toFixed(2)}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              GOALS/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average goals scored per game in ranked matches.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-cyan-400 mb-1">{currentPlaylistStats.saves.toFixed(2)}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              SAVES/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average saves made per game to prevent opponent goals.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-green-400 mb-1">{currentPlaylistStats.assists.toFixed(2)}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              ASSISTS/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average assists per game by helping teammates score goals.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-yellow-400 mb-1">{currentPlaylistStats.shots.toFixed(2)}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              SHOTS/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average shots taken per game towards the opponent goal.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Secondary Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-purple-400 mb-1">{currentPlaylistStats.mvps_per_game.toFixed(3)}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              MVP RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average MVP awards per game, indicating standout performances.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-pink-400 mb-1">{currentPlaylistStats.shooting_percentage.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              SHOOTING %
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of shots that result in goals. Higher values indicate better accuracy.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-indigo-400 mb-1">{currentPlaylistStats.speed.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              AVG SPEED
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average speed as a percentage of maximum possible speed in Rocket League.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-teal-400 mb-1">{(currentPlaylistStats.clutch * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              CLUTCH RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Success rate in clutch situations where you&apos;re the last player able to make a play.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Boost Management Stats */}
        <div className="bg-gray-900 border border-gray-700 rounded-bl-lg rounded-br-lg rounded-tl-none rounded-tr-none p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-lg font-orbitron font-bold text-yellow-400">⚡ Boost Management</div>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-4 h-4 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Shows how efficiently you manage boost throughout matches. Good boost management is crucial for maintaining field presence and making impactful plays.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Critical Boost Levels */}
          <div className="grid grid-cols-2 gap-0 mb-6">
            <div className="bg-red-900/30 border border-red-700/50 rounded-none p-3 text-center">
              <div className="text-2xl font-orbitron font-bold text-red-400 mb-1">
                {currentPlaylistStats.boost_empty.toFixed(1)}%
              </div>
              <div className="text-xs text-red-300 font-rajdhani">Empty (0%)</div>
            </div>
            <div className="bg-green-900/30 border border-green-700/50 rounded-none p-3 text-center">
              <div className="text-2xl font-orbitron font-bold text-green-400 mb-1">
                {currentPlaylistStats.boost_full.toFixed(1)}%
              </div>
              <div className="text-xs text-green-300 font-rajdhani">Full (100%)</div>
            </div>
          </div>

          {/* Boost Range Distribution */}
          <div className="space-y-3">
            {[
              { label: '0-25%', value: currentPlaylistStats.boost_0_25, color: 'bg-red-600' },
              { label: '25-50%', value: currentPlaylistStats.boost_25_50, color: 'bg-orange-600' },
              { label: '50-75%', value: currentPlaylistStats.boost_50_75, color: 'bg-yellow-600' },
              { label: '75-100%', value: currentPlaylistStats.boost_75_100, color: 'bg-green-600' }
            ].map((range) => (
              <div key={range.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="text-sm font-rajdhani text-gray-300 w-16">{range.label}</div>
                  <div className="flex-1 bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full ${range.color} transition-all duration-500 ease-out`}
                      style={{ width: `${Math.min(range.value, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm font-orbitron font-bold text-white ml-3 w-12 text-right">
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