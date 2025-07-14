"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import {
  TrophyIcon,
  EyeIcon,
  MessageCircleIcon,
  GamepadIcon,
  UserIcon,
  CalendarIcon,
  TrendingUpIcon,
  StarIcon,
  ArrowRightIcon,
  PlusIcon,
  TargetIcon,
  ZapIcon,
  ShieldIcon,
  PlayIcon,
  AwardIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  LoaderIcon,
  XIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import type { ValorantAnalyticsData } from "@/server/api/routers/valorantStats";



// Comprehensive Game Analytics Component for Dashboard
function GameAnalyticsDashboard() {
  const { user } = useUser();
  const [selectedGame, setSelectedGame] = useState<'valorant' | 'rocket-league' | 'smash' | 'overwatch'>('valorant');

  // Get user profile data to get player ID
  const { data: profileData } = api.playerProfile.getProfile.useQuery();
  const playerId = profileData?.id;

  // Fetch Valorant stats using player ID
  const valorantStatsMutation = api.valorantStats.getPlayerStatsByPlayerId.useMutation();

  // Add Rocket League stats state and query - now gets all playlists at once
  const [rocketLeaguePlaylist, setRocketLeaguePlaylist] = useState<'duels' | 'doubles' | 'standard'>('standard');
  const rocketLeagueStatsQuery = api.rocketLeagueStats.getAllPlayerStats.useQuery(
    { playerId: playerId ?? "" },
    { 
      enabled: selectedGame === "rocket-league" && !!playerId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  useEffect(() => {
    if (playerId && selectedGame === 'valorant') {
      valorantStatsMutation.mutate({ playerId });
    }
  }, [playerId, selectedGame]);



  // Game configuration
  const games = [
    {
      id: 'valorant' as const,
      name: 'VALORANT',
      icon: ShieldIcon,
      image: '/valorant/logos/Valorant Logo Red Border.jpg',
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-500/30',
      platform: 'valorant'
    },
    {
      id: 'rocket-league' as const,
      name: 'Rocket League',
      icon: GamepadIcon,
      image: '/rocket-league/logos/Rocket League Emblem.png',
      color: 'from-orange-500 to-orange-600',
      borderColor: 'border-orange-500/30',
      platform: 'epicgames'
    },
    {
      id: 'smash' as const,
      name: 'Smash Ultimate',
      icon: TrophyIcon,
      image: '/smash/logos/Smash Ball White Logo.png',
      color: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-500/30',
      platform: 'startgg'
    },
    {
      id: 'overwatch' as const,
      name: 'Overwatch 2',
      icon: TargetIcon,
      image: '/overwatch/logos/Overwatch 2 Primary Logo.png',
      color: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-500/30',
      platform: 'battlenet'
    }
  ];

  const currentGame = games.find(g => g.id === selectedGame)!;

  // Enhanced connection detection for OAuth and platform connections
  const isGameConnected = (() => {
    // Check OAuth connections first (VALORANT and Epic Games)
    if (currentGame.platform === 'valorant') {
      const externalAccount = user?.externalAccounts?.find(account => 
        account.provider.includes("valorant") || account.provider === "custom_valorant"
      );
      if (externalAccount && externalAccount.verification?.status === "verified") {
        return true;
      }
    }
    
    if (currentGame.platform === 'epicgames') {
      const externalAccount = user?.externalAccounts?.find(account => 
        account.provider.includes("epic_games") || account.provider === "custom_epic_games"
      );
      if (externalAccount && externalAccount.verification?.status === "verified") {
        return true;
      }
    }
    
    // Check platform_connections for other games
    return profileData?.platform_connections?.some(
      conn => conn.platform === currentGame.platform && conn.connected
    ) ?? false;
  })();

  const renderValorantAnalytics = () => {
    // Loading state
    if (valorantStatsMutation.isPending || !playerId) {
      return (
        <div className="space-y-6">
          {/* Information Panel */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LoaderIcon className="w-5 h-5 text-blue-400 animate-spin mt-0.5" />
              <div>
                <h4 className="text-sm font-orbitron font-semibold text-blue-300 mb-2">Loading VALORANT Statistics</h4>
                <p className="text-xs text-blue-200 font-rajdhani">Please wait while we fetch your competitive performance data...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Error state or no data
    if (valorantStatsMutation.isError || !valorantStatsMutation.data?.success || !valorantStatsMutation.data.data) {
      const errorMessage = valorantStatsMutation.data?.message ?? valorantStatsMutation.error?.message ?? "Failed to load Valorant statistics";
      
      return (
        <div className="space-y-6">
          {/* Error Panel */}
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-orbitron font-semibold text-red-300 mb-2">VALORANT Stats Unavailable</h4>
                <p className="text-xs text-red-200 font-rajdhani mb-3">{errorMessage}</p>
                {errorMessage.includes("hasn't connected") && (
                  <Link href="/dashboard/player/profile">
                    <Button variant="outline" size="sm" className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10">
                      Connect VALORANT Account
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const stats = valorantStatsMutation.data.data;

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

        {/* Core Performance Metrics - Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-tl-lg rounded-bl-none rounded-tr-none rounded-br-none md:rounded-l-lg md:rounded-r-none p-4 text-center">
            <div className="text-3xl font-orbitron font-bold text-purple-300 mb-1">{stats.stats.evalScore}</div>
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
          
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/30 rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-none md:rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-red-300 mb-1">{stats.stats.rank}</div>
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
          
          <div className="bg-gray-900 border border-gray-700 rounded-bl-lg rounded-tl-none rounded-tr-none rounded-br-none md:rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-green-400 mb-1">{stats.stats.gameWinRate}</div>
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
          
          <div className="bg-gray-900 border border-gray-700 rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none md:rounded-r-lg md:rounded-l-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-blue-400 mb-1">{stats.stats.roundWinRate}</div>
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
          <div className="bg-gray-900 border border-gray-700 rounded-t-lg rounded-b-none md:rounded-l-lg md:rounded-r-none p-4">
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
            <div className="text-xl font-orbitron font-bold text-cyan-400">{stats.role}</div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none md:rounded-none p-4">
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
          
          <div className="bg-gray-900 border border-gray-700 rounded-b-lg rounded-t-none md:rounded-r-lg md:rounded-l-none p-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-t-lg rounded-b-none md:rounded-l-lg md:rounded-r-none p-4">
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
          
          <div className="bg-gray-900 border border-gray-700 rounded-b-lg rounded-t-none md:rounded-r-lg md:rounded-l-none p-4">
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

        {/* Detailed Performance Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-tl-lg rounded-bl-none rounded-tr-none rounded-br-none md:rounded-l-lg md:rounded-r-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-red-400 mb-1">{stats.stats.kda}</div>
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
          
          <div className="bg-gray-900 border border-gray-700 rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-none md:rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-orange-400 mb-1">{stats.stats.acs}</div>
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
          
          <div className="bg-gray-900 border border-gray-700 rounded-bl-lg rounded-tl-none rounded-tr-none rounded-br-none md:rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-yellow-400 mb-1">{stats.stats.kastPercent}</div>
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
          
          <div className="bg-gray-900 border border-gray-700 rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none md:rounded-r-lg md:rounded-l-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-cyan-400 mb-1">{stats.stats.clutchFactor}</div>
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
    );
  };

  const renderRocketLeagueAnalytics = () => {
    if (rocketLeagueStatsQuery.isPending) {
      return (
        <div className="space-y-6">
          <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LoaderIcon className="w-5 h-5 text-orange-400 animate-spin mt-0.5" />
              <div>
                <h4 className="text-sm font-orbitron font-semibold text-orange-300 mb-2">Loading Rocket League Statistics</h4>
                <p className="text-xs text-orange-200 font-rajdhani">Please wait while we fetch your Rocket League performance data...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (rocketLeagueStatsQuery.isError) {
      return (
        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <XIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-orbitron font-semibold text-red-300 mb-2">Failed to Load Rocket League Statistics</h4>
                <p className="text-xs text-red-200 font-rajdhani mb-3">
                  Error fetching Rocket League stats: {rocketLeagueStatsQuery.error?.message ?? 'Unknown error'}
                </p>
                <button
                  onClick={() => rocketLeagueStatsQuery.refetch()}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!rocketLeagueStatsQuery.data?.success || !rocketLeagueStatsQuery.data.data) {
      return (
        <div className="space-y-6">
          <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-orbitron font-semibold text-orange-300 mb-2">Connect Your Epic Games Account</h4>
                <p className="text-xs text-orange-200 font-rajdhani mb-3">
                  {rocketLeagueStatsQuery.data?.message ?? 'To view your Rocket League statistics, you need to connect your Epic Games account first.'}
                </p>
                <button
                  onClick={() => window.open('/dashboard/player/profile/external-accounts', '_blank')}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded-md transition-colors"
                >
                  Connect Epic Games
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const allRocketLeagueStats = rocketLeagueStatsQuery.data.data;
    
    // Get the stats for the currently selected playlist
    const currentPlaylistStats = allRocketLeagueStats[rocketLeaguePlaylist];
    
    if (!currentPlaylistStats) {
      return (
        <div className="space-y-6">
          <div className="bg-orange-900/20 border border-orange-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-orbitron font-semibold text-orange-300 mb-2">No Stats Available</h4>
                <p className="text-xs text-orange-200 font-rajdhani">
                  No statistics found for {rocketLeaguePlaylist}. You may not have played enough ranked games in this playlist.
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

        {/* Playlist Selector - now instant switching */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
          <div className="text-xs text-gray-400 font-rajdhani mb-3">ROCKET LEAGUE PLAYLIST</div>
          <div className="flex flex-wrap gap-2">
            {(['duels', 'doubles', 'standard'] as const).map((playlist) => {
              const hasStats = allRocketLeagueStats[playlist] !== null;
              return (
                <button
                  key={playlist}
                  onClick={() => setRocketLeaguePlaylist(playlist)}
                  disabled={!hasStats}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 font-rajdhani font-medium capitalize ${
                    rocketLeaguePlaylist === playlist
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-transparent text-white shadow-lg'
                      : hasStats 
                        ? 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
                        : 'border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  {playlist === 'duels' ? '1v1 Duels' : playlist === 'doubles' ? '2v2 Doubles' : '3v3 Standard'}
                  {!hasStats && <span className="ml-1 text-xs">(No data)</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rocket League Account Info */}
        {allRocketLeagueStats.username && (
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
              {allRocketLeagueStats.username}
            </div>
          </div>
        )}

        {/* Connected Stats Sections */}
        <div className="space-y-0">
          {/* Core Performance Metrics - Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-tl-lg rounded-bl-none rounded-tr-none rounded-br-none md:rounded-tl-lg md:rounded-tr-none md:rounded-bl-none md:rounded-br-none p-4 text-center">
            <div className="text-3xl font-orbitron font-bold text-purple-300 mb-1">
              {currentPlaylistStats.eval_score?.toFixed(2) ?? 'N/A'}
            </div>
            <div className="text-xs text-purple-400 font-rajdhani flex items-center justify-center gap-1">
              EVAL SCORE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-purple-500 hover:text-purple-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>EVAL&apos;s proprietary ranking score (0-100) based on performance across multiple metrics including mechanics, positioning, and game impact.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/30 rounded-tr-lg rounded-tl-none rounded-bl-none rounded-br-none md:rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-red-300 mb-1">{currentPlaylistStats.rank}</div>
            <div className="text-xs text-red-400 font-rajdhani flex items-center justify-center gap-1">
              RANK
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-red-500 hover:text-red-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Current competitive rank in Rocket League&apos;s ranked system. Higher ranks indicate better skill level.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-bl-lg rounded-tl-none rounded-tr-none rounded-br-none md:rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-green-400 mb-1">{Math.round(currentPlaylistStats.win_percentage * 100)}%</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              WIN RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of games won out of total games played. Measures overall success rate in ranked matches.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none md:rounded-tr-lg md:rounded-tl-none md:rounded-bl-none md:rounded-br-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-blue-400 mb-1">{currentPlaylistStats.count}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              GAMES ANALYZED
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Total number of ranked games played in this playlist found on ballchasing.com replays.</p>
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
  };

  const renderComingSoon = (gameName: string) => (
    <div className="space-y-6">
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-6 text-center">
        <div className="mb-4">
          <ClockIcon className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
          <h4 className="text-lg font-orbitron font-semibold text-yellow-300 mb-2">
            {gameName} Analytics Coming Soon
          </h4>
          <p className="text-yellow-200 font-rajdhani text-sm max-w-md mx-auto mb-4">
            We&apos;re working hard to bring you comprehensive statistics and performance analytics for {gameName}.
          </p>
          {!isGameConnected && (
            <>
              <p className="text-yellow-300 font-rajdhani text-xs mb-4">
                Connect your {gameName} account now to be ready when analytics launch!
              </p>
              <Link href="/dashboard/player/profile">
                <Button variant="outline" className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10">
                  Connect {gameName} Account
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-[#1a1a2e]/80 backdrop-blur-sm border-gray-700/50 p-6 shadow-xl">
      {/* Header with Game Tabs */}
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center`}>
              <Image 
                src={currentGame.image}
                alt={`${currentGame.name} Logo`}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-xl font-orbitron font-bold text-white">Game Analytics</h3>
              <p className="text-xs text-gray-400 font-rajdhani">Comprehensive performance insights</p>
            </div>
          </div>
          <Link href="/dashboard/player/profile">
            <Button variant="default" size="sm" className="bg-gradient-to-r hover:from-blue-500 hover:to-purple-500  from-blue-600 to-purple-600 border-gray-600 text-white hover:border-gray-500">
              Manage Connections
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

                 {/* Game Selection Tabs */}
         <div className="flex flex-wrap gap-2">
           {games.map((game) => {
             // Enhanced connection detection for each game
             const isConnected = (() => {
               // Check OAuth connections first (VALORANT and Epic Games)
               if (game.platform === 'valorant') {
                 const externalAccount = user?.externalAccounts?.find(account => 
                   account.provider.includes("valorant") || account.provider === "custom_valorant"
                 );
                 if (externalAccount && externalAccount.verification?.status === "verified") {
                   return true;
                 }
               }
               
               if (game.platform === 'epicgames') {
                 const externalAccount = user?.externalAccounts?.find(account => 
                   account.provider.includes("epic_games") || account.provider === "custom_epic_games"
                 );
                 if (externalAccount && externalAccount.verification?.status === "verified") {
                   return true;
                 }
               }
               
               // Check platform_connections for other games
               return profileData?.platform_connections?.some(
                 conn => conn.platform === game.platform && conn.connected
               ) ?? false;
             })();
            
            return (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 font-rajdhani font-medium ${
                  selectedGame === game.id
                    ? `bg-gradient-to-r ${game.color} border-transparent text-white shadow-lg`
                    : `border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50`
                }`}
              >
                <Image 
                  src={game.image}
                  alt={`${game.name} Logo`}
                  width={16}
                  height={16}
                  className="object-contain"
                />
                <span className="text-sm">{game.name}</span>
                {isConnected && <CheckCircleIcon className="h-3 w-3" />}
              </button>
            );
          })}
        </div>

                 {/* Connection Status - Only show when NOT connected */}
         {!isGameConnected && (
           <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-orange-900/20 border-orange-700/30">
             <AlertTriangleIcon className="h-4 w-4 text-orange-400" />
             <span className="text-orange-300 font-rajdhani text-sm">
               {currentGame.name} account not connected
             </span>
           </div>
         )}
      </div>

      {/* Game Content */}
      <div className="space-y-6">
        {selectedGame === 'valorant' && isGameConnected && renderValorantAnalytics()}
        {selectedGame === 'valorant' && !isGameConnected && renderComingSoon('VALORANT')}
        {selectedGame === 'rocket-league' && isGameConnected && renderRocketLeagueAnalytics()}
        {selectedGame === 'rocket-league' && !isGameConnected && renderComingSoon('Rocket League')}
        {selectedGame === 'smash' && renderComingSoon('Smash Ultimate')}
        {selectedGame === 'overwatch' && renderComingSoon('Overwatch 2')}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  // Get profile data for stats
  const { data: profileData } = api.playerProfile.getProfile.useQuery();

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!profileData) return 0;
    
    let completion = 0;
    const weights = {
      basicInfo: 20,
      recruitingInfo: 50,
      gameConnections: 20,
      socialConnections: 10
    };
    
    // Basic info
    if (profileData.location || profileData.bio) {
      completion += weights.basicInfo;
    }
    
    // Recruiting info
    if (profileData.school || profileData.main_game_id || profileData.gpa || profileData.extra_curriculars || profileData.academic_bio) {
      completion += weights.recruitingInfo;
    }
    
    // Game connections (cap at 2 connections)
    const gameConnections = profileData.platform_connections?.filter(conn => conn.connected).length || 0;
    completion += Math.min(gameConnections, 2) * (weights.gameConnections / 2);
    
    // Social connections (cap at 1 connection)
    const socialConnections = profileData.social_connections?.filter(conn => conn.connected).length || 0;
    completion += Math.min(socialConnections, 1) * weights.socialConnections;
    
    return Math.min(completion, 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const quickActions = [
    {
      title: 'Complete Profile',
      description: 'Boost your visibility',
      href: '/dashboard/player/profile',
      icon: UserIcon,
      color: 'from-blue-500 to-blue-600',
      progress: profileCompletion
    },
    {
      title: 'Browse Tryouts',
      description: 'Find opportunities',
      href: '/dashboard/player/tryouts',
      icon: TargetIcon,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Join Combines',
      description: 'Showcase skills',
      href: '/dashboard/player/combines',
      icon: TrophyIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Check Messages',
      description: 'Stay connected',
      href: '/dashboard/player/messages',
      icon: MessageCircleIcon,
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Hero Header */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        
        <div className="relative z-10 p-8 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-500/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <ZapIcon className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="text-4xl font-orbitron font-bold text-white">
                  EVAL Home
                </h1>
              </div>
              <p className="text-gray-300 text-lg font-rajdhani mb-4">
                Welcome back! Ready to dominate the esports scene?
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline" className="border-blue-400/50 text-blue-400">
                  Player Dashboard
                </Badge>
                {/* <div className="flex items-center gap-1 text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  <span>Last active: Today</span>
                </div> */}
              </div>
            </div>
            
            {/* Quick Profile Status */}
                         <div className="bg-black/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 min-w-[250px]">
               <div className="flex items-center justify-between mb-3">
                 <span className="text-sm font-rajdhani text-gray-300">Profile Strength</span>
                 <span className="text-lg font-orbitron font-bold text-white">{profileCompletion}%</span>
               </div>
               <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden mb-2">
                 <div 
                   className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                   style={{ width: `${profileCompletion}%` }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
               </div>
               <p className="text-xs text-gray-400 font-rajdhani">
                 {profileCompletion < 50 ? "Keep building your profile!" : 
                  profileCompletion < 80 ? "Almost there!" : 
                  "Profile looking strong!"}
               </p>
             </div>
          </div>
        </div>
      </div>

      {/* Game Analytics - Moved to Top */}
      <GameAnalyticsDashboard />

             {/* Enhanced Stats Grid */}
       <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
         {/* Active Tryouts */}
         <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 p-6 shadow-xl">
           <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-blue-500/20 rounded-xl">
               <TargetIcon className="h-6 w-6 text-blue-400" />
             </div>
             <Badge variant="outline" className="border-blue-400/50 text-blue-400">
               Active
             </Badge>
           </div>
           <div className="space-y-2">
             <h3 className="text-lg font-rajdhani font-semibold text-white">Tryouts</h3>
             <p className="text-3xl font-orbitron font-bold text-blue-400">-</p>
             <p className="text-sm text-gray-400">Coming soon</p>
           </div>
         </Card>

         {/* Profile Views */}
         <Card className="bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/20 hover:border-green-400/40 transition-all duration-300 p-6 shadow-xl">
           <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-green-500/20 rounded-xl">
               <EyeIcon className="h-6 w-6 text-green-400" />
             </div>
             <TrendingUpIcon className="h-4 w-4 text-green-400" />
           </div>
           <div className="space-y-2">
             <h3 className="text-lg font-rajdhani font-semibold text-white">Profile Views</h3>
             <p className="text-3xl font-orbitron font-bold text-green-400">-</p>
             <p className="text-sm text-gray-400">Coming soon</p>
           </div>
         </Card>

         {/* Messages */}
         <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 p-6 shadow-xl">
           <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-purple-500/20 rounded-xl">
               <MessageCircleIcon className="h-6 w-6 text-purple-400" />
             </div>
           </div>
           <div className="space-y-2">
             <h3 className="text-lg font-rajdhani font-semibold text-white">Messages</h3>
             <p className="text-3xl font-orbitron font-bold text-purple-400">-</p>
             <p className="text-sm text-gray-400">Coming soon</p>
           </div>
         </Card>


       </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ZapIcon className="h-5 w-5 text-blue-400" />
          <h2 className="text-2xl font-orbitron font-bold text-white">Quick Actions</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0">
          {quickActions.map((action, index) => {
            let roundedClasses = "";
            
            // Mobile (single column): 
            // First card: rounded top, Last card: rounded bottom
            if (index === 0) roundedClasses += " rounded-t-lg rounded-b-none";
            if (index === 1) roundedClasses += " rounded-t-none rounded-b-none";
            if (index === 2) roundedClasses += " rounded-t-none rounded-b-none";
            if (index === quickActions.length - 1) roundedClasses += " rounded-b-lg rounded-t-none";
            
            // Medium screens (2 columns): 2x2 grid
            // [0] [1]
            // [2] [3]
            if (index === 0) roundedClasses += " md:rounded-tl-lg md:rounded-bl-none md:rounded-tr-none md:rounded-br-none"; // top-left only
            if (index === 1) roundedClasses += " md:rounded-tr-lg md:rounded-tl-none md:rounded-bl-none md:rounded-br-none"; // top-right only
            if (index === 2) roundedClasses += " md:rounded-bl-lg md:rounded-tl-none md:rounded-tr-none md:rounded-br-none"; // bottom-left only
            if (index === 3) roundedClasses += " md:rounded-br-lg md:rounded-tl-none md:rounded-tr-none md:rounded-bl-none"; // bottom-right only
            
            // Large screens (4 columns): single row
            // [0] [1] [2] [3]
            if (index === 0) roundedClasses += " lg:rounded-l-lg lg:rounded-r-none"; // left side only
            if (index === 1 || index === 2) roundedClasses += " lg:rounded-none"; // middle cards: no rounding
            if (index === 3) roundedClasses += " lg:rounded-r-lg lg:rounded-l-none"; // right side only

            
            return (
              <Link key={index} href={action.href}>
                <Card className={`quick-actions bg-[#1a1a2e]/80 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 p-4 h-full cursor-pointer group shadow-lg hover:shadow-xl ${roundedClasses}`}>
                  <div className="flex items-center gap-2 mb-3">
                    {/* <action.icon className="h-5 w-5 text-white" /> */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-rajdhani font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </h3>
                        
                      </div>
                      <p className="text-xs text-gray-400">{action.description}</p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                  {action.progress && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-blue-400">{action.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${action.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

       {/* Activity and Events Grid */}
       <div className="grid gap-8 lg:grid-cols-2">
         {/* Recent Activity */}
        <Card className="bg-[#1a1a2e]/80 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/30 transition-all duration-300 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <PlayIcon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-orbitron font-bold text-white">Recent Activity</h3>
            </div>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:border-gray-500">
              View All
            </Button>
          </div>
                     <div className="space-y-4">
             <div className="text-center py-8">
               <AwardIcon className="h-12 w-12 mx-auto text-gray-500 mb-3" />
               <p className="text-gray-400 mb-4">No recent activity to display</p>
               <Button variant="outline" className="border-gray-600 text-gray-300 hover:border-gray-500">
                 <PlusIcon className="h-4 w-4 mr-2" />
                 Take Action
               </Button>
             </div>
           </div>
        </Card>

        {/* Upcoming Events & Deadlines */}
        <Card className="bg-[#1a1a2e]/80 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/30 transition-all duration-300 p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-xl font-orbitron font-bold text-white">Upcoming Events</h3>
            </div>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:border-gray-500">
              View Calendar
            </Button>
          </div>
                     <div className="space-y-4">
             <div className="text-center py-8">
               <CheckCircleIcon className="h-12 w-12 mx-auto text-gray-500 mb-3" />
               <p className="text-gray-400 mb-4">No upcoming deadlines</p>
               <p className="text-gray-500 text-sm">You&apos;re all caught up!</p>
             </div>
           </div>
        </Card>
      </div>

      {/* Achievement Highlights */}
      <Card className="bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 border-purple-500/20 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <AwardIcon className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-orbitron font-bold text-white">Achievement Highlights</h3>
          </div>
          <Link href="/dashboard/player/highlights">
            <Button variant="outline" size="sm" className="border-purple-400/50 text-purple-400 hover:border-purple-400 hover:bg-purple-500/10">
              View All
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-black/20 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <TrophyIcon className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-rajdhani font-semibold">Latest Achievement</span>
            </div>
            <p className="text-sm text-gray-300">Reached Diamond rank</p>
            <p className="text-xs text-gray-400">VALORANT • 1 day ago</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <StarIcon className="h-5 w-5 text-blue-400" />
              <span className="text-white font-rajdhani font-semibold">Performance</span>
            </div>
            <p className="text-sm text-gray-300">68% win rate this season</p>
            <p className="text-xs text-gray-400">Competitive • Ranked</p>
          </div>
          <div className="p-4 bg-black/20 rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-3 mb-2">
              <EyeIcon className="h-5 w-5 text-green-400" />
              <span className="text-white font-rajdhani font-semibold">Visibility</span>
            </div>
            <p className="text-sm text-gray-300">156 profile views</p>
            <p className="text-xs text-gray-400">This month • +23%</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 