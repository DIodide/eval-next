import React from "react";
import { InfoIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import type { GameComponentProps, ValorantStats } from "../../types";

export function ValorantAnalytics({
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
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-400 rounded-full animate-pulse mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-blue-300 mb-2">Loading VALORANT Statistics</h4>
              <p className="text-xs text-blue-200 font-rajdhani">Please wait while we fetch your competitive performance data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    const errorMessage = error?.message ?? "Failed to load Valorant statistics";
    
    return (
      <div className="space-y-6">
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InfoIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-orbitron font-semibold text-red-300 mb-2">VALORANT Stats Unavailable</h4>
              <p className="text-xs text-red-200 font-rajdhani mb-3">{errorMessage}</p>
              {errorMessage.includes("hasn't connected") && (
                onConnect ? (
                  <Button 
                    onClick={onConnect}
                    variant="outline" 
                    size="sm" 
                    className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                  >
                    Connect VALORANT Account
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Link href="/dashboard/player/profile">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                    >
                      Connect VALORANT Account
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

  const valorantStats = stats as ValorantStats;

  return (
    <div className="space-y-6">
      {/* Information Panel */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <InfoIcon className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-orbitron font-semibold text-blue-300 mb-2">About These Statistics</h4>
            <div className="text-xs text-blue-200 font-rajdhani space-y-1">
              <p>• <strong>Competitive matches only:</strong> All statistics are based exclusively on ranked competitive gameplay.</p>
              <p>• <strong>Rank-standardized scoring:</strong> Performance expectations are adjusted based on your rank tier.</p>
              <p>• <strong>EVAL Score:</strong> Comprehensive metric (0-100) measuring performance across aim, game impact, and strategic decision-making.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Valorant Account Info */}
      {(valorantStats.gameName ?? valorantStats.tagLine) && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
            VALORANT ACCOUNT
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                <p>Connected Valorant account username and tag line.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-lg font-orbitron font-bold text-red-400">
            {valorantStats.gameName && valorantStats.tagLine 
              ? `${valorantStats.gameName}#${valorantStats.tagLine}` 
              : valorantStats.gameName ?? valorantStats.tagLine ?? "Connected"}
          </div>
        </div>
      )}

      {/* Connected Stats Sections */}
      <div className="space-y-0">
        {/* Core Performance Metrics - Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-tl-lg md:rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-none p-4 text-center">
            <div className="text-3xl font-orbitron font-bold text-purple-300 mb-1">{valorantStats.stats.evalScore}</div>
            <div className="text-xs text-purple-400 font-rajdhani flex items-center justify-center gap-1">
              EVAL SCORE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-purple-500 hover:text-purple-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>EVAL&apos;s proprietary ranking score (0-100) based on performance across multiple metrics including aim, game sense, and impact.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/30 rounded-tr-lg md:rounded-tr-none rounded-tl-none rounded-bl-none rounded-br-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-red-300 mb-1">{valorantStats.stats.rank}</div>
            <div className="text-xs text-red-400 font-rajdhani flex items-center justify-center gap-1">
              RANK
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-red-500 hover:text-red-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Current competitive rank in Valorant&apos;s ranked system. Higher ranks indicate better skill level.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none md:rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-green-400 mb-1">{valorantStats.stats.gameWinRate}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              GAME WIN %
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of games won out of total games played. Measures overall team success rate.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none md:rounded-tr-lg p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-blue-400 mb-1">{valorantStats.stats.roundWinRate}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              ROUND WIN %
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of individual rounds won. More granular than game win rate and shows consistent performance.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Role, Agent, and Weapon Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4">
            <div className="text-xs text-gray-400 font-rajdhani mb-2 flex items-center gap-1">
              MAIN ROLE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Primary role played in competitive matches. Duelists are entry fraggers who create space for the team.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-xl font-orbitron font-bold text-cyan-400">{valorantStats.role}</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4">
            <div className="text-xs text-gray-400 font-rajdhani mb-2 flex items-center gap-1">
              MAIN AGENT
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Most frequently played agent based on match history and performance statistics.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
                {valorantStats.mainAgent.image ? (
                  <Image 
                    src={valorantStats.mainAgent.image} 
                    alt={valorantStats.mainAgent.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const span = img.nextElementSibling as HTMLSpanElement;
                      img.style.display = 'none';
                      if (span) span.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="text-xs text-gray-500" style={{ display: valorantStats.mainAgent.image ? 'none' : 'flex' }}>
                  IMG
                </span>
              </div>
              <div className="text-lg font-orbitron font-bold text-white">{valorantStats.mainAgent.name}</div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4">
            <div className="text-xs text-gray-400 font-rajdhani mb-2 flex items-center gap-1">
              MAIN WEAPON
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Primary weapon with highest kill count and best performance metrics.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-16 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
                {valorantStats.mainGun.image ? (
                  <Image 
                    src={valorantStats.mainGun.image} 
                    alt={valorantStats.mainGun.name}
                    width={64}
                    height={40}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const span = img.nextElementSibling as HTMLSpanElement;
                      img.style.display = 'none';
                      if (span) span.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="text-xs text-gray-500" style={{ display: valorantStats.mainGun.image ? 'none' : 'flex' }}>
                  IMG
                </span>
              </div>
              <div className="text-lg font-orbitron font-bold text-white">{valorantStats.mainGun.name}</div>
            </div>
          </div>
        </div>

        {/* Maps Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4">
            <div className="text-xs text-gray-400 font-rajdhani mb-2 flex items-center gap-1">
              BEST MAP
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Highest win rate and performance map. Shows where the player excels most consistently.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
                {valorantStats.bestMap.image ? (
                  <Image 
                    src={valorantStats.bestMap.image} 
                    alt={valorantStats.bestMap.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const span = img.nextElementSibling as HTMLSpanElement;
                      img.style.display = 'none';
                      if (span) span.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="text-xs text-gray-500" style={{ display: valorantStats.bestMap.image ? 'none' : 'flex' }}>
                  IMG
                </span>
              </div>
              <div className="text-lg font-orbitron font-bold text-green-400">{valorantStats.bestMap.name}</div>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4">
            <div className="text-xs text-gray-400 font-rajdhani mb-2 flex items-center gap-1">
              WORST MAP
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Lowest win rate and performance map. Indicates areas for improvement.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
                {valorantStats.worstMap.image ? (
                  <Image 
                    src={valorantStats.worstMap.image} 
                    alt={valorantStats.worstMap.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      const span = img.nextElementSibling as HTMLSpanElement;
                      img.style.display = 'none';
                      if (span) span.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className="text-xs text-gray-500" style={{ display: valorantStats.worstMap.image ? 'none' : 'flex' }}>
                  IMG
                </span>
              </div>
              <div className="text-lg font-orbitron font-bold text-red-400">{valorantStats.worstMap.name}</div>
            </div>
          </div>
        </div>

        {/* Detailed Performance Metrics - Bottom Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none md:rounded-bl-lg p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-red-400 mb-1">{valorantStats.stats.kda}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              K/D/A
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Kills/Deaths/Assists ratio. Shows average performance per game in eliminations and team support.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none md:rounded-br-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-orange-400 mb-1">{valorantStats.stats.acs}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              ACS
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average Combat Score - comprehensive metric measuring overall impact per round including damage, kills, and utility usage.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-bl-lg md:rounded-bl-none rounded-tl-none rounded-tr-none rounded-br-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-yellow-400 mb-1">{valorantStats.stats.kastPercent}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              KAST%
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of rounds where the player got a Kill, Assist, Survived, or was Traded. Measures consistent round contribution.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-br-lg md:rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-cyan-400 mb-1">{valorantStats.stats.clutchFactor}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              CLUTCH FACTOR
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Win rate in 1vX clutch situations. Measures performance under pressure when outnumbered.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ValorantAnalytics; 