"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { api } from "@/trpc/react";

interface ValorantAnalyticsProps {
  playerId: string;
}

export function ValorantAnalytics({ playerId }: ValorantAnalyticsProps) {
  const valorantStatsQuery =
    api.valorantStats.getPlayerStatsByPlayerId.useQuery(
      { playerId },
      {
        enabled: !!playerId,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    );

  // Loading state
  if (valorantStatsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-700 bg-gray-900 p-3"
            >
              <div className="animate-pulse">
                <div className="mb-2 h-4 rounded bg-gray-700"></div>
                <div className="h-6 rounded bg-gray-600"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-cyan-500"></div>
          <p className="font-rajdhani mt-2 text-gray-400">
            Loading Valorant statistics...
          </p>
        </div>
      </div>
    );
  }

  // Error state or no data
  if (
    valorantStatsQuery.isError ||
    !valorantStatsQuery.data?.success ||
    !valorantStatsQuery.data.data
  ) {
    const errorMessage =
      valorantStatsQuery.data?.message ??
      valorantStatsQuery.error?.message ??
      "Failed to load Valorant statistics";

    return (
      <div className="py-8 text-center">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
          <div className="mb-2 text-gray-400">
            <InfoIcon className="mx-auto mb-2 h-8 w-8" />
          </div>
          <h3 className="font-orbitron mb-2 text-lg font-semibold text-gray-300">
            Valorant Stats Unavailable
          </h3>
          <p className="font-rajdhani mx-auto max-w-md text-sm text-gray-400">
            {errorMessage}
          </p>
          {errorMessage.includes("hasn't connected") && (
            <p className="font-rajdhani mt-2 text-xs text-gray-500">
              Player needs to connect their Valorant account to display
              statistics.
            </p>
          )}
        </div>
      </div>
    );
  }

  const stats = valorantStatsQuery.data.data;

  return (
    <div className="space-y-4">
      {/* Information Panel */}
      <div className="rounded-lg border border-blue-700/30 bg-blue-900/20 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <InfoIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-orbitron mb-2 text-sm font-semibold text-blue-300">
              About These Statistics
            </h3>
            <div className="font-rajdhani space-y-1 text-xs text-blue-200">
              <p>
                • <strong>Competitive matches only:</strong> All statistics are
                based exclusively on ranked competitive gameplay.
              </p>
              <p>
                • <strong>Rank-standardized scoring:</strong> Our algorithm
                adjusts performance expectations based on your rank tier. A
                Diamond player with the same win rate as a Silver player will
                have a higher EVAL score due to the increased skill level of
                opponents.
              </p>
              <p>
                • <strong>EVAL Score:</strong> A comprehensive metric (0-100)
                that measures standardized performance across multiple factors
                including aim accuracy, game impact, and strategic
                decision-making relative to your rank.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Valorant Account Info */}
      {(stats.gameName ?? stats.tagLine) && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            VALORANT ACCOUNT
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>Connected Valorant account username and tag line.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="font-orbitron text-lg font-bold text-red-400">
            {stats.gameName && stats.tagLine
              ? `${stats.gameName}#${stats.tagLine}`
              : (stats.gameName ?? stats.tagLine ?? "Connected")}
          </div>
        </div>
      )}

      {/* Top Row: Role, Agent, Gun */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            MAIN ROLE
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Primary role played in competitive matches. Duelists are entry
                  fraggers who create space for the team.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="font-orbitron text-lg font-bold text-cyan-400">
            {stats.role}
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            MAIN AGENT
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Most frequently played agent based on match history and
                  performance statistics.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
              {stats.mainAgent.image ? (
                <img
                  src={stats.mainAgent.image}
                  alt={stats.mainAgent.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = "none";
                    if (span) span.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="text-xs text-gray-500"
                style={{ display: stats.mainAgent.image ? "none" : "flex" }}
              >
                IMG
              </span>
            </div>
            <div className="font-orbitron text-lg font-bold text-white">
              {stats.mainAgent.name}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            MAIN GUN
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Primary weapon with highest kill count and best performance
                  metrics.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
              {stats.mainGun.image ? (
                <img
                  src={stats.mainGun.image}
                  alt={stats.mainGun.name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = "none";
                    if (span) span.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="text-xs text-gray-500"
                style={{ display: stats.mainGun.image ? "none" : "flex" }}
              >
                IMG
              </span>
            </div>
            <div className="font-orbitron text-lg font-bold text-white">
              {stats.mainGun.name}
            </div>
          </div>
        </div>
      </div>

      {/* Maps Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            BEST MAP
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Highest win rate and performance map. Shows where the player
                  excels most consistently.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
              {stats.bestMap.image ? (
                <img
                  src={stats.bestMap.image}
                  alt={stats.bestMap.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = "none";
                    if (span) span.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="text-xs text-gray-500"
                style={{ display: stats.bestMap.image ? "none" : "flex" }}
              >
                IMG
              </span>
            </div>
            <div className="font-orbitron text-lg font-bold text-green-400">
              {stats.bestMap.name}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
          <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
            WORST MAP
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Lowest win rate and performance map. Indicates areas for
                  improvement.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
              {stats.worstMap.image ? (
                <img
                  src={stats.worstMap.image}
                  alt={stats.worstMap.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = "none";
                    if (span) span.style.display = "flex";
                  }}
                />
              ) : null}
              <span
                className="text-xs text-gray-500"
                style={{ display: stats.worstMap.image ? "none" : "flex" }}
              >
                IMG
              </span>
            </div>
            <div className="font-orbitron text-lg font-bold text-red-400">
              {stats.worstMap.name}
            </div>
          </div>
        </div>
      </div>

      {/* Core Metrics Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-purple-700/30 bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-3 text-center">
          <div className="font-orbitron text-2xl font-bold text-purple-300">
            {stats.stats.evalScore}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-purple-400">
            EVAL SCORE
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-purple-500 hover:text-purple-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  EVAL&apos;s proprietary ranking score (0-100) based on
                  performance across multiple metrics including aim, game sense,
                  and impact.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-red-700/30 bg-gradient-to-r from-red-900/50 to-red-800/50 p-3 text-center">
          <div className="font-orbitron text-lg font-bold text-red-300">
            {stats.stats.rank}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-red-400">
            RANK
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-red-500 hover:text-red-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  Current competitive rank in Valorant&apos;s ranked system.
                  Higher ranks indicate better skill level.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron text-lg font-bold text-green-400">
            {stats.stats.gameWinRate}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            GAME WIN %
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  Percentage of games won out of total games played. Measures
                  overall team success rate.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron text-lg font-bold text-blue-400">
            {stats.stats.roundWinRate}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            ROUND WIN %
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  Percentage of individual rounds won. More granular than game
                  win rate and shows consistent performance.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron text-lg font-bold text-red-400">
            {stats.stats.kda}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            K/D/A
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  Kills/Deaths/Assists ratio. Shows average performance per game
                  in eliminations and team support.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron text-lg font-bold text-orange-400">
            {stats.stats.acs}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            ACS
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  Average Combat Score - comprehensive metric measuring overall
                  impact per round including damage, kills, and utility usage.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron text-lg font-bold text-yellow-400">
            {stats.stats.kastPercent}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            KAST%
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  Percentage of rounds where the player got a Kill, Assist,
                  Survived, or was Traded. Measures consistent round
                  contribution.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
          <div className="font-orbitron text-lg font-bold text-cyan-400">
            {stats.stats.clutchFactor}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
            CLUTCH FACTOR
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="max-w-40 border-gray-600 bg-black whitespace-normal text-white md:max-w-48"
              >
                <p>
                  Win rate in 1vX clutch situations. Measures performance under
                  pressure when outnumbered.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
