import React from "react";
import { InfoIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import type { GameComponentProps, ValorantStats } from "../../types";

export function ValorantAnalytics({
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
        <div className="rounded-lg border border-blue-700/30 bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-5 w-5 animate-pulse rounded-full bg-blue-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-blue-300">
                Loading VALORANT Statistics
              </h4>
              <p className="font-rajdhani text-xs text-blue-200">
                Please wait while we fetch your competitive performance data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isLoading) {
    const errorMessage = error?.message ?? "Failed to load Valorant statistics";

    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-red-700/30 bg-red-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-red-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-red-300">
                VALORANT Stats Unavailable
              </h4>
              <p className="font-rajdhani mb-3 text-xs text-red-200">
                {errorMessage.includes("hasn't connected")
                  ? viewMode === "other"
                    ? "This player hasn't connected their VALORANT account yet."
                    : "You haven't connected your VALORANT account yet."
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
                    Connect VALORANT Account
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Link href="/dashboard/player/profile">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                    >
                      Connect VALORANT Account
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

  const valorantStats = stats as ValorantStats;

  // Early return if no stats data
  if (!valorantStats) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-gray-700/30 bg-gray-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-gray-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-gray-300">
                No VALORANT Data Available
              </h4>
              <p className="font-rajdhani text-xs text-gray-400">
                {viewMode === "other"
                  ? "This player hasn't connected their VALORANT account yet."
                  : "Connect your VALORANT account to view detailed statistics."}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact mode for embedding in smaller spaces (like player previews)
  if (size === "compact") {
    return (
      <div className="space-y-3">
        {/* Compact Core Metrics */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-lg border border-purple-700/30 bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-3 text-center">
            <div className="font-orbitron mb-1 text-xl font-bold text-purple-300">
              {valorantStats.stats.evalScore}
            </div>
            <div className="font-rajdhani text-xs text-purple-400">
              EVAL SCORE
            </div>
          </div>

          <div className="rounded-lg border border-red-700/30 bg-gradient-to-r from-red-900/50 to-red-800/50 p-3 text-center">
            <div className="font-orbitron mb-1 text-lg font-bold text-red-300">
              {valorantStats.stats.rank}
            </div>
            <div className="font-rajdhani text-xs text-red-400">RANK</div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
            <div className="font-orbitron mb-1 text-lg font-bold text-green-400">
              {valorantStats.stats.gameWinRate}
            </div>
            <div className="font-rajdhani text-xs text-gray-400">WIN RATE</div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 text-center">
            <div className="font-orbitron mb-1 text-lg font-bold text-orange-400">
              {valorantStats.stats.kda}
            </div>
            <div className="font-rajdhani text-xs text-gray-400">K/D/A</div>
          </div>
        </div>

        {/* Compact Agent & Map Info */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="font-rajdhani mb-1 text-xs text-gray-400">
              MAIN AGENT
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
                {valorantStats.mainAgent.image ? (
                  <Image
                    src={valorantStats.mainAgent.image}
                    alt={valorantStats.mainAgent.name}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-500">IMG</span>
                )}
              </div>
              <div className="font-orbitron text-sm font-bold text-white">
                {valorantStats.mainAgent.name}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="font-rajdhani mb-1 text-xs text-gray-400">
              BEST MAP
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
                {valorantStats.bestMap.image ? (
                  <Image
                    src={valorantStats.bestMap.image}
                    alt={valorantStats.bestMap.name}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-500">IMG</span>
                )}
              </div>
              <div className="font-orbitron text-sm font-bold text-green-400">
                {valorantStats.bestMap.name}
              </div>
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
        <div className="rounded-lg border border-blue-700/30 bg-blue-900/20 p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="mt-0.5 h-5 w-5 text-blue-400" />
            <div>
              <h4 className="font-orbitron mb-2 text-sm font-semibold text-blue-300">
                About These Statistics
              </h4>
              <div className="font-rajdhani space-y-1 text-xs text-blue-200">
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
                  measuring performance across aim, game impact, and strategic
                  decision-making.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Valorant Account Info */}
      {(valorantStats.gameName ?? valorantStats.tagLine) && (
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
            {valorantStats.gameName && valorantStats.tagLine
              ? `${valorantStats.gameName}#${valorantStats.tagLine}`
              : (valorantStats.gameName ??
                valorantStats.tagLine ??
                "Connected")}
          </div>
        </div>
      )}

      {/* Connected Stats Sections */}
      {/* Hero Section - EVAL Score & Rank */}
      <div className="border-gradient-to-r rounded-xl border bg-gradient-to-r from-purple-500/20 from-purple-900/30 to-red-500/20 to-red-900/30 p-6 shadow-2xl">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <div className="font-orbitron text-5xl font-bold text-purple-300">
              {valorantStats.stats.evalScore}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-lg text-purple-400 md:justify-start">
              EVAL SCORE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 cursor-help text-purple-500 hover:text-purple-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    EVAL&apos;s proprietary ranking score (0-100) based on
                    performance across multiple metrics including aim, game
                    sense, and impact.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="hidden h-16 w-px bg-gradient-to-b from-transparent via-gray-500 to-transparent md:block"></div>

          <div className="text-center md:text-right">
            <div className="font-orbitron text-4xl font-bold text-red-300">
              {valorantStats.stats.rank}
            </div>
            <div className="font-rajdhani flex items-center justify-center gap-1 text-lg text-red-400 md:justify-end">
              CURRENT RANK
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 cursor-help text-red-500 hover:text-red-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Current competitive rank in Valorant&apos;s ranked system.
                    Higher ranks indicate better skill level.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Player Profile Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main Agent - Large Card */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
            <div className="font-rajdhani mb-3 flex items-center gap-1 text-sm text-gray-400">
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
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
                {valorantStats.mainAgent.image ? (
                  <Image
                    src={valorantStats.mainAgent.image}
                    alt={valorantStats.mainAgent.name}
                    width={64}
                    height={64}
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
                  className="text-sm text-gray-500"
                  style={{
                    display: valorantStats.mainAgent.image ? "none" : "flex",
                  }}
                >
                  IMG
                </span>
              </div>
              <div>
                <div className="font-orbitron text-2xl font-bold text-white">
                  {valorantStats.mainAgent.name}
                </div>
                <div className="font-rajdhani text-sm text-gray-400">
                  Primary Agent
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Role & Weapon Stack */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div className="font-rajdhani mb-1 flex items-center gap-1 text-xs text-gray-400">
              MAIN ROLE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                  <p>
                    Primary role played in competitive matches. Duelists are
                    entry fraggers who create space for the team.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="font-orbitron text-lg font-bold text-cyan-400">
              {valorantStats.role}
            </div>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div className="font-rajdhani mb-2 flex items-center gap-1 text-xs text-gray-400">
              MAIN WEAPON
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
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-12 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
                {valorantStats.mainGun.image ? (
                  <Image
                    src={valorantStats.mainGun.image}
                    alt={valorantStats.mainGun.name}
                    width={48}
                    height={32}
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
                  style={{
                    display: valorantStats.mainGun.image ? "none" : "flex",
                  }}
                >
                  IMG
                </span>
              </div>
              <div className="font-orbitron text-sm font-bold text-white">
                {valorantStats.mainGun.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-green-700/30 bg-green-900/20 p-4 text-center">
          <div className="font-orbitron text-2xl font-bold text-green-400">
            {valorantStats.stats.gameWinRate}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-green-300">
            GAME WIN %
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-green-500 hover:text-green-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Percentage of games won out of total games played. Measures
                  overall team success rate.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-blue-700/30 bg-blue-900/20 p-4 text-center">
          <div className="font-orbitron text-2xl font-bold text-blue-400">
            {valorantStats.stats.roundWinRate}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-blue-300">
            ROUND WIN %
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-blue-500 hover:text-blue-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Percentage of individual rounds won. More granular than game
                  win rate and shows consistent performance.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-orange-700/30 bg-orange-900/20 p-4 text-center">
          <div className="font-orbitron text-2xl font-bold text-orange-400">
            {valorantStats.stats.acs}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-orange-300">
            ACS
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-orange-500 hover:text-orange-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Average Combat Score - comprehensive metric measuring overall
                  impact per round including damage, kills, and utility usage.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="rounded-lg border border-cyan-700/30 bg-cyan-900/20 p-4 text-center">
          <div className="font-orbitron text-2xl font-bold text-cyan-400">
            {valorantStats.stats.clutchFactor}
          </div>
          <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-cyan-300">
            CLUTCH FACTOR
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3 w-3 cursor-help text-cyan-500 hover:text-cyan-300" />
              </TooltipTrigger>
              <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                <p>
                  Win rate in 1vX clutch situations. Measures performance under
                  pressure when outnumbered.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Bottom Section: Maps & Combat Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Map Performance */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-5">
          <h3 className="font-orbitron mb-4 text-lg font-semibold text-white">
            Map Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-green-700/30 bg-green-900/20 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
                  {valorantStats.bestMap.image ? (
                    <Image
                      src={valorantStats.bestMap.image}
                      alt={valorantStats.bestMap.name}
                      width={40}
                      height={40}
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
                    style={{
                      display: valorantStats.bestMap.image ? "none" : "flex",
                    }}
                  >
                    IMG
                  </span>
                </div>
                <div>
                  <div className="font-orbitron text-sm font-bold text-green-400">
                    {valorantStats.bestMap.name}
                  </div>
                  <div className="font-rajdhani text-xs text-green-300">
                    Best Map
                  </div>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 cursor-help text-green-500 hover:text-green-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white">
                  <p>
                    Highest win rate and performance map. Shows where the player
                    excels most consistently.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-red-700/30 bg-red-900/20 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded border border-gray-600 bg-gray-800">
                  {valorantStats.worstMap.image ? (
                    <Image
                      src={valorantStats.worstMap.image}
                      alt={valorantStats.worstMap.name}
                      width={40}
                      height={40}
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
                    style={{
                      display: valorantStats.worstMap.image ? "none" : "flex",
                    }}
                  >
                    IMG
                  </span>
                </div>
                <div>
                  <div className="font-orbitron text-sm font-bold text-red-400">
                    {valorantStats.worstMap.name}
                  </div>
                  <div className="font-rajdhani text-xs text-red-300">
                    Needs Improvement
                  </div>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 cursor-help text-red-500 hover:text-red-300" />
                </TooltipTrigger>
                <TooltipContent className="max-w-48 border-gray-600 bg-black text-white">
                  <p>
                    Lowest win rate and performance map. Indicates areas for
                    improvement.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Combat Statistics */}
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-5">
          <h3 className="font-orbitron mb-4 text-lg font-semibold text-white">
            Combat Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="font-orbitron text-xl font-bold text-red-400">
                {valorantStats.stats.kda}
              </div>
              <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
                K/D/A RATIO
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                    <p>
                      Kills/Deaths/Assists ratio. Shows average performance per
                      game in eliminations and team support.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="text-center">
              <div className="font-orbitron text-xl font-bold text-yellow-400">
                {valorantStats.stats.kastPercent}
              </div>
              <div className="font-rajdhani flex items-center justify-center gap-1 text-xs text-gray-400">
                KAST %
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-3 w-3 cursor-help text-gray-500 hover:text-gray-300" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-48 border-gray-600 bg-black text-white md:max-w-56">
                    <p>
                      Percentage of rounds where the player got a Kill, Assist,
                      Survived, or was Traded. Measures consistent round
                      contribution.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValorantAnalytics;
