"use client";

import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { api } from "@/trpc/react";

interface ValorantAnalyticsProps {
  playerId: string;
}

export function ValorantAnalytics({ playerId }: ValorantAnalyticsProps) {
  const [lastFetchedPlayerId, setLastFetchedPlayerId] = useState<string | null>(null);
  const valorantStatsMutation = api.valorantStats.getPlayerStatsByPlayerId.useMutation();

  useEffect(() => {
    if (playerId && playerId !== lastFetchedPlayerId) {
      valorantStatsMutation.mutate({ playerId });
      setLastFetchedPlayerId(playerId);
    }
  }, [playerId, lastFetchedPlayerId]);

  // Loading state
  if (valorantStatsMutation.isPending) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-2 font-rajdhani">Loading Valorant statistics...</p>
        </div>
      </div>
    );
  }

  // Error state or no data
  if (valorantStatsMutation.isError || !valorantStatsMutation.data?.success || !valorantStatsMutation.data.data) {
    const errorMessage = valorantStatsMutation.data?.message ?? valorantStatsMutation.error?.message ?? "Failed to load Valorant statistics";
    
    return (
      <div className="text-center py-8">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="text-gray-400 mb-2">
            <InfoIcon className="w-8 h-8 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-orbitron font-semibold text-gray-300 mb-2">
            Valorant Stats Unavailable
          </h3>
          <p className="text-gray-400 font-rajdhani text-sm max-w-md mx-auto">
            {errorMessage}
          </p>
          {errorMessage.includes("hasn't connected") && (
            <p className="text-gray-500 font-rajdhani text-xs mt-2">
              Player needs to connect their Valorant account to display statistics.
            </p>
          )}
        </div>
      </div>
    );
  }

  const stats = valorantStatsMutation.data.data;

  return (
    <div className="space-y-4">
      {/* Information Panel */}
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <InfoIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-orbitron font-semibold text-blue-300 mb-2">About These Statistics</h3>
            <div className="text-xs text-blue-200 font-rajdhani space-y-1">
              <p>• <strong>Competitive matches only:</strong> All statistics are based exclusively on ranked competitive gameplay.</p>
              <p>• <strong>Rank-standardized scoring:</strong> Our algorithm adjusts performance expectations based on your rank tier. A Diamond player with the same win rate as a Silver player will have a higher EVAL score due to the increased skill level of opponents.</p>
              <p>• <strong>EVAL Score:</strong> A comprehensive metric (0-100) that measures standardized performance across multiple factors including aim accuracy, game impact, and strategic decision-making relative to your rank.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Valorant Account Info */}
      {(stats.gameName ?? stats.tagLine) && (
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
            {stats.gameName && stats.tagLine 
              ? `${stats.gameName}#${stats.tagLine}` 
              : stats.gameName ?? stats.tagLine ?? "Connected"}
          </div>
        </div>
      )}

      {/* Top Row: Role, Agent, Gun */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
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
          <div className="text-lg font-orbitron font-bold text-cyan-400">{stats.role}</div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
              {stats.mainAgent.image ? (
                <img 
                  src={stats.mainAgent.image} 
                  alt={stats.mainAgent.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = 'none';
                    if (span) span.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-xs text-gray-500" style={{ display: stats.mainAgent.image ? 'none' : 'flex' }}>
                IMG
              </span>
            </div>
            <div className="text-lg font-orbitron font-bold text-white">{stats.mainAgent.name}</div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
            MAIN GUN
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
              {stats.mainGun.image ? (
                <img 
                  src={stats.mainGun.image} 
                  alt={stats.mainGun.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = 'none';
                    if (span) span.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-xs text-gray-500" style={{ display: stats.mainGun.image ? 'none' : 'flex' }}>
                IMG
              </span>
            </div>
            <div className="text-lg font-orbitron font-bold text-white">{stats.mainGun.name}</div>
          </div>
        </div>
      </div>

      {/* Maps Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
              {stats.bestMap.image ? (
                <img 
                  src={stats.bestMap.image} 
                  alt={stats.bestMap.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = 'none';
                    if (span) span.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-xs text-gray-500" style={{ display: stats.bestMap.image ? 'none' : 'flex' }}>
                IMG
              </span>
            </div>
            <div className="text-lg font-orbitron font-bold text-green-400">{stats.bestMap.name}</div>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
          <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center overflow-hidden">
              {stats.worstMap.image ? (
                <img 
                  src={stats.worstMap.image} 
                  alt={stats.worstMap.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    const span = img.nextElementSibling as HTMLSpanElement;
                    img.style.display = 'none';
                    if (span) span.style.display = 'flex';
                  }}
                />
              ) : null}
              <span className="text-xs text-gray-500" style={{ display: stats.worstMap.image ? 'none' : 'flex' }}>
                IMG
              </span>
            </div>
            <div className="text-lg font-orbitron font-bold text-red-400">{stats.worstMap.name}</div>
          </div>
        </div>
      </div>

      {/* Core Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-orbitron font-bold text-purple-300">{stats.stats.evalScore}</div>
          <div className="text-xs text-purple-400 font-rajdhani flex items-center justify-center gap-1">
            EVAL SCORE
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-purple-500 hover:text-purple-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>EVAL&apos;s proprietary ranking score (0-100) based on performance across multiple metrics including aim, game sense, and impact.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/30 rounded-lg p-3 text-center">
          <div className="text-lg font-orbitron font-bold text-red-300">{stats.stats.rank}</div>
          <div className="text-xs text-red-400 font-rajdhani flex items-center justify-center gap-1">
            RANK
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-red-500 hover:text-red-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>Current competitive rank in Valorant&apos;s ranked system. Higher ranks indicate better skill level.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-orbitron font-bold text-green-400">{stats.stats.gameWinRate}</div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            GAME WIN %
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>Percentage of games won out of total games played. Measures overall team success rate.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-orbitron font-bold text-blue-400">{stats.stats.roundWinRate}</div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            ROUND WIN %
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>Percentage of individual rounds won. More granular than game win rate and shows consistent performance.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-orbitron font-bold text-red-400">{stats.stats.kda}</div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            K/D/A
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>Kills/Deaths/Assists ratio. Shows average performance per game in eliminations and team support.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-orbitron font-bold text-orange-400">{stats.stats.acs}</div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            ACS
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>Average Combat Score - comprehensive metric measuring overall impact per round including damage, kills, and utility usage.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-orbitron font-bold text-yellow-400">{stats.stats.kastPercent}</div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            KAST%
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>Percentage of rounds where the player got a Kill, Assist, Survived, or was Traded. Measures consistent round contribution.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
          <div className="text-lg font-orbitron font-bold text-cyan-400">{stats.stats.clutchFactor}</div>
          <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
            CLUTCH FACTOR
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                <p>Win rate in 1vX clutch situations. Measures performance under pressure when outnumbered.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
} 