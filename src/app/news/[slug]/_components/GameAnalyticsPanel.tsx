"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";
import Image from "next/image";
import {
  TrophyIcon,
  GamepadIcon,
  UserIcon,
  CalendarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowRightIcon,
  TargetIcon,
  ShieldIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  LoaderIcon,
  XIcon,
  RefreshCwIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";

export default function GameAnalyticsPanel() {
  const { user } = useUser();
  const [selectedGame, setSelectedGame] = useState<'valorant' | 'rocket-league' | 'smash' | 'overwatch'>('valorant');

  // Check if user is a player
  const userType = user?.unsafeMetadata?.userType;
  const isPlayer = userType === "player";

  // Get user profile data to get player ID - only enable if user is a player
  const { data: profileData } = api.playerProfile.getProfile.useQuery(
    undefined,
    { enabled: !!user?.id && isPlayer }
  );
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

  // Add Smash Ultimate stats mutation
  const smashStatsMutation = api.smashStats.getPlayerStatsByPlayerId.useMutation();

  useEffect(() => {
    if (playerId && selectedGame === 'valorant') {
      valorantStatsMutation.mutate({ playerId });
    }
    if (playerId && selectedGame === 'smash') {
      smashStatsMutation.mutate({ playerId });
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
    // For demo mode (non-player users), always show as connected
    if (!isPlayer) {
      return true;
    }
    
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
    
    // Check start.gg connection for Smash Ultimate
    if (currentGame.platform === 'startgg') {
      const externalAccount = user?.externalAccounts?.find(account => 
        account.provider.includes("start_gg") || account.provider === "custom_start_gg"
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
    // Demo mode - show mock data immediately
    if (!isPlayer) {
      const mockStats = {
        gameName: "couldbeyou",
        tagLine: "DEMO",
        stats: {
          evalScore: 80.5,
          rank: "Diamond 2",
          kda: "1.24",
          acs: "245",
          kastPercent: "72%",
          clutchFactor: "34%"
        },
        bestMap: { name: "Ascent" },
        worstMap: { name: "Breeze" }
      };

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
                  <p>• <strong>EVAL Score:</strong> Comprehensive metric (0-100) measuring performance across mechanics, positioning, and game impact.</p>
                </div>
              </div>
            </div>
          </div>

          {/* VALORANT Account Info */}
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
              {mockStats.gameName}#{mockStats.tagLine}
            </div>
          </div>

          {/* Connected Stats Sections */}
          <div className="space-y-0">
            {/* Core Performance Metrics - Top Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-tl-lg md:rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-none p-4 text-center">
                <div className="text-3xl font-orbitron font-bold text-purple-300 mb-1">{mockStats.stats.evalScore}</div>
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
                <div className="text-xl font-orbitron font-bold text-red-300 mb-1">{mockStats.stats.rank}</div>
                <div className="text-xs text-red-400 font-rajdhani flex items-center justify-center gap-1">
                  RANK
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-red-500 hover:text-red-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>Current competitive rank in VALORANT&apos;s ranked system. Higher ranks indicate better skill level.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-bl-lg md:rounded-bl-none rounded-tl-none rounded-tr-none rounded-br-none p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-green-400 mb-1">{mockStats.bestMap.name}</div>
                <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                  BEST MAP
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>The map where you perform best based on win rate and individual performance metrics.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-br-lg md:rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-red-400 mb-1">{mockStats.worstMap.name}</div>
                <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                  WORST MAP
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>The map where you need the most improvement based on win rate and performance metrics.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Detailed Performance Metrics - Bottom Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              <div className="bg-gray-900 border border-gray-700 rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none md:rounded-bl-lg p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-red-400 mb-1">{mockStats.stats.kda}</div>
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
                <div className="text-xl font-orbitron font-bold text-orange-400 mb-1">{mockStats.stats.acs}</div>
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
                <div className="text-xl font-orbitron font-bold text-yellow-400 mb-1">{mockStats.stats.kastPercent}</div>
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
                <div className="text-xl font-orbitron font-bold text-cyan-400 mb-1">{mockStats.stats.clutchFactor}</div>
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

    // Loading state (only for real players)
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
                <p>• <strong>EVAL Score:</strong> Comprehensive metric (0-100) measuring performance across mechanics, positioning, and game impact.</p>
              </div>
            </div>
          </div>
        </div>

        {/* VALORANT Account Info */}
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

        {/* Connected Stats Sections */}
        <div className="space-y-0">
          {/* Core Performance Metrics - Top Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-tl-lg md:rounded-tl-lg rounded-tr-none rounded-bl-none rounded-br-none p-4 text-center">
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
            
            <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/30 rounded-tr-lg md:rounded-tr-none rounded-tl-none rounded-bl-none rounded-br-none p-4 text-center">
              <div className="text-xl font-orbitron font-bold text-red-300 mb-1">{stats.stats.rank}</div>
              <div className="text-xs text-red-400 font-rajdhani flex items-center justify-center gap-1">
                RANK
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-3 h-3 text-red-500 hover:text-red-300 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                    <p>Current competitive rank in VALORANT&apos;s ranked system. Higher ranks indicate better skill level.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-bl-lg md:rounded-bl-none rounded-tl-none rounded-tr-none rounded-br-none p-4 text-center">
              <div className="text-xl font-orbitron font-bold text-green-400 mb-1">{stats.bestMap.name}</div>
              <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                BEST MAP
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                    <p>The map where you perform best based on win rate and individual performance metrics.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-700 rounded-br-lg md:rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none p-4 text-center">
              <div className="text-xl font-orbitron font-bold text-red-400 mb-1">{stats.worstMap.name}</div>
              <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                WORST MAP
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                    <p>The map where you need the most improvement based on win rate and performance metrics.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Detailed Performance Metrics - Bottom Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            <div className="bg-gray-900 border border-gray-700 rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none md:rounded-bl-lg p-4 text-center">
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
            
            <div className="bg-gray-900 border border-gray-700 rounded-tl-none rounded-tr-none rounded-bl-none rounded-br-none md:rounded-br-none p-4 text-center">
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
            
            <div className="bg-gray-900 border border-gray-700 rounded-bl-lg md:rounded-bl-none rounded-tl-none rounded-tr-none rounded-br-none p-4 text-center">
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
            
            <div className="bg-gray-900 border border-gray-700 rounded-br-lg md:rounded-br-lg rounded-tl-none rounded-tr-none rounded-bl-none p-4 text-center">
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
      </div>
    );
  };

  const renderRocketLeagueAnalytics = () => {
    // Demo mode - show mock data immediately
    if (!isPlayer) {
      const mockAllRocketLeagueStats = {
        username: "DemoPlayer",
        standard: {
          eval_score: 78.5,
          rank: "Champion 1",
          win_percentage: 0.67,
          count: 234,
          goals: 1.8,
          saves: 2.1,
          assists: 1.2,
          shots: 3.4,
          mvp: 0.28,
          shooting_percentage: 0.53,
          clutch: 0.31,
          boost_0_25: 0.15,
          boost_25_50: 0.25,
          boost_50_75: 0.35,
          boost_75_100: 0.25
        },
        doubles: {
          eval_score: 82.3,
          rank: "Champion 2",
          win_percentage: 0.71,
          count: 187,
          goals: 2.2,
          saves: 1.8,
          assists: 1.5,
          shots: 4.1,
          mvp: 0.35,
          shooting_percentage: 0.54,
          clutch: 0.29,
          boost_0_25: 0.12,
          boost_25_50: 0.22,
          boost_50_75: 0.38,
          boost_75_100: 0.28
        },
        duels: {
          eval_score: 75.2,
          rank: "Diamond 3",
          win_percentage: 0.63,
          count: 156,
          goals: 3.5,
          saves: 2.8,
          assists: 0.3,
          shots: 6.2,
          mvp: 0.45,
          shooting_percentage: 0.56,
          clutch: 0.41,
          boost_0_25: 0.18,
          boost_25_50: 0.28,
          boost_50_75: 0.32,
          boost_75_100: 0.22
        }
      };

      const currentPlaylistStats = mockAllRocketLeagueStats[rocketLeaguePlaylist];

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
              {(['duels', 'doubles', 'standard'] as const).map((playlist) => (
                <button
                  key={playlist}
                  onClick={() => setRocketLeaguePlaylist(playlist)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-rajdhani font-medium transition-all duration-200",
                    rocketLeaguePlaylist === playlist 
                      ? "bg-orange-600 text-white border border-orange-500"
                      : "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                  )}
                >
                  {playlist.charAt(0).toUpperCase() + playlist.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Rocket League Account Info */}
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
              {mockAllRocketLeagueStats.username}
            </div>
          </div>

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
                      <p>Average number of goals scored per game. Measures offensive contribution and finishing ability.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-blue-400 mb-1">{currentPlaylistStats.saves.toFixed(2)}</div>
                <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                  SAVES/GAME
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>Average number of saves per game. Measures defensive contribution and goal-line clearances.</p>
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
                      <p>Average number of assists per game. Measures playmaking ability and team contribution.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-purple-400 mb-1">{currentPlaylistStats.shots.toFixed(2)}</div>
                <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                  SHOTS/GAME
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>Average number of shots taken per game. Measures offensive pressure and shooting opportunities.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Advanced Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
              <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-yellow-400 mb-1">{(currentPlaylistStats.mvp * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                  MVP RATE
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>Percentage of games where you were the MVP (highest scorer). Measures individual dominance.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-pink-400 mb-1">{currentPlaylistStats.eval_score?.toFixed(2) ?? 'N/A'}</div>
                <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                  AVG SCORE
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>Average score per game. Comprehensive metric including goals, assists, saves, and other contributions.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
                <div className="text-xl font-orbitron font-bold text-cyan-400 mb-1">{(currentPlaylistStats.shooting_percentage * 100).toFixed(1)}%</div>
                <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                  SHOT ACCURACY
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                      <p>Percentage of shots that result in goals. Measures shooting precision and decision-making.</p>
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
                    <p>Shows how efficiently you manage boost across different ranges. Higher percentages indicate better boost control.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="space-y-3">
                {[
                  { label: "0-25%", value: (currentPlaylistStats.boost_0_25 ?? 0) * 100, color: "bg-red-500" },
                  { label: "25-50%", value: (currentPlaylistStats.boost_25_50 ?? 0) * 100, color: "bg-yellow-500" },
                  { label: "50-75%", value: (currentPlaylistStats.boost_50_75 ?? 0) * 100, color: "bg-green-500" },
                  { label: "75-100%", value: (currentPlaylistStats.boost_75_100 ?? 0) * 100, color: "bg-blue-500" },
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

    // Loading state (only for real players)
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
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-rajdhani font-medium transition-all duration-200",
                    rocketLeaguePlaylist === playlist 
                      ? "bg-orange-600 text-white border border-orange-500"
                      : hasStats 
                        ? "bg-gray-800 text-gray-300 border border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                        : "bg-gray-800/50 text-gray-500 border border-gray-700 cursor-not-allowed"
                  )}
                >
                  {playlist.charAt(0).toUpperCase() + playlist.slice(1)}
                  {!hasStats && " (No Data)"}
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
                  <p>Average number of goals scored per game. Measures offensive contribution and finishing ability.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-blue-400 mb-1">{currentPlaylistStats.saves.toFixed(2)}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              SAVES/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average number of saves per game. Measures defensive contribution and goal-line clearances.</p>
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
                  <p>Average number of assists per game. Measures playmaking ability and team contribution.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-purple-400 mb-1">{currentPlaylistStats.shots.toFixed(2)}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              SHOTS/GAME
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average number of shots taken per game. Measures offensive pressure and shooting opportunities.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Advanced Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-yellow-400 mb-1">{(currentPlaylistStats.mvp * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              MVP RATE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of games where you were the MVP (highest scorer). Measures individual dominance.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-pink-400 mb-1">{currentPlaylistStats.eval_score?.toFixed(2) ?? 'N/A'}</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              AVG SCORE
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Average score per game. Comprehensive metric including goals, assists, saves, and other contributions.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-none p-4 text-center">
            <div className="text-xl font-orbitron font-bold text-cyan-400 mb-1">{(currentPlaylistStats.shooting_percentage * 100).toFixed(1)}%</div>
            <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
              SHOT ACCURACY
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                  <p>Percentage of shots that result in goals. Measures shooting precision and decision-making.</p>
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
                <p>Shows how efficiently you manage boost across different ranges. Higher percentages indicate better boost control.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-3">
            {[
              { label: "0-25%", value: (currentPlaylistStats.boost_0_25 ?? 0) * 100, color: "bg-red-500" },
              { label: "25-50%", value: (currentPlaylistStats.boost_25_50 ?? 0) * 100, color: "bg-yellow-500" },
              { label: "50-75%", value: (currentPlaylistStats.boost_50_75 ?? 0) * 100, color: "bg-green-500" },
              { label: "75-100%", value: (currentPlaylistStats.boost_75_100 ?? 0) * 100, color: "bg-blue-500" },
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

  const renderSmashAnalytics = () => {
    // Helper functions for colors
    const getWinRateColor = (winrate: number) => {
      if (winrate >= 0.7) return "text-emerald-400";
      if (winrate >= 0.6) return "text-yellow-400";
      return "text-red-400";
    };

    // Demo mode - show mock data immediately
    if (!isPlayer) {
      const mockData = {
        playerInfo: {
          prefix: "DEMO",
          gamerTag: "Player",
          mainCharacter: "Joker",
          evalScore: 85
        },
        stats: {
          events: 15,
          set_wins: 87,
          set_losses: 23,
          characters: {
            "Joker": { games: 45, wins: 32, winrate: 0.71 },
            "Palutena": { games: 28, wins: 18, winrate: 0.64 },
            "Mario": { games: 18, wins: 11, winrate: 0.61 },
            "Pikachu": { games: 12, wins: 7, winrate: 0.58 },
            "Cloud": { games: 8, wins: 4, winrate: 0.50 }
          },
          best_matchups: {
            "Joker": {
              "Bowser": { games: 8, wins: 7, winrate: 0.875 },
              "Ganondorf": { games: 6, wins: 5, winrate: 0.83 },
              "King K. Rool": { games: 4, wins: 3, winrate: 0.75 }
            }
          },
          worst_matchups: {
            "Joker": {
              "Pikachu": { games: 6, wins: 2, winrate: 0.33 },
              "Fox": { games: 8, wins: 3, winrate: 0.375 },
              "Sheik": { games: 5, wins: 2, winrate: 0.40 }
            }
          },
          best_stages: {
            "Battlefield": { wins: 12, losses: 3, winrate: 0.80 },
            "Pokemon Stadium 2": { wins: 8, losses: 2, winrate: 0.80 },
            "Town & City": { wins: 6, losses: 2, winrate: 0.75 }
          },
          worst_stages: {
            "Final Destination": { wins: 4, losses: 8, winrate: 0.33 },
            "Smashville": { wins: 6, losses: 9, winrate: 0.40 },
            "Kalos Pokemon League": { wins: 3, losses: 5, winrate: 0.375 }
          }
        },
        recentPlacements: [
          { placement: 1, event: "Weekly Local #47", tier: "C-Tier", entrants: 32 },
          { placement: 3, event: "Regional Championship", tier: "B-Tier", entrants: 128 },
          { placement: 5, event: "Major Tournament", tier: "A-Tier", entrants: 256 },
          { placement: 2, event: "Monthly Local", tier: "C-Tier", entrants: 24 },
          { placement: 7, event: "State Championship", tier: "B-Tier", entrants: 96 }
        ]
      };

      return (
        <div className="space-y-6">
          {/* Player Info Header */}
          <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div>
                  <h2 className="text-2xl font-orbitron font-bold text-white">{mockData.playerInfo.prefix} {mockData.playerInfo.gamerTag}</h2>
                  <p className="text-gray-400 font-rajdhani">Competitive Player</p>
                </div>
                <div className="h-12 w-px bg-gray-700"></div>
                <div>
                  <p className="text-sm text-gray-400 font-rajdhani">Main Character</p>
                  <p className="text-lg font-orbitron font-semibold text-purple-400">{mockData.playerInfo.mainCharacter}</p>
                </div>
                <div className="h-12 w-px bg-gray-700"></div>
                <div>
                  <p className="text-sm text-gray-400 font-rajdhani">EVAL Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-orbitron font-semibold text-emerald-400">
                      {Math.round((mockData.playerInfo.evalScore / 100) * 100)}/100
                    </p>
                    <div className="w-24 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(mockData.playerInfo.evalScore / 100) * 100}%` }}
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
                    <span className="text-sm text-gray-300 font-rajdhani">Events</span>
                  </div>
                  <span className="font-orbitron font-bold text-white">{mockData.stats.events}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GamepadIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-300 font-rajdhani">Tournaments</span>
                  </div>
                  <span className="font-orbitron font-bold text-white">{mockData.stats.events}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-300 font-rajdhani">Total Sets</span>
                  </div>
                  <span className="font-orbitron font-bold text-white">{mockData.stats.set_wins + mockData.stats.set_losses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-300 font-rajdhani">Tournaments</span>
                  </div>
                  <span className="font-orbitron font-bold text-white">{mockData.stats.events}</span>
                </div>
              </div>
            </div>

            {/* Main Characters */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-orbitron font-bold text-white mb-4">Main Characters</h3>
              <div className="space-y-3">
                {Object.entries(mockData.stats.characters).slice(0, 5).map(([character, usage]) => {
                  const characterStats = usage as { games: number; wins: number; winrate: number };
                  return (
                  <div key={character} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                      <span className="font-rajdhani font-medium text-gray-200">{character}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${characterStats.winrate * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{(characterStats.winrate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Placements */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
              <h3 className="text-lg font-orbitron font-bold text-white mb-4">Recent Placements</h3>
              <div className="space-y-3">
                {mockData.recentPlacements.length > 0 ? (
                  mockData.recentPlacements.slice(0, 5).map((placement, index) => (
                    <div key={index} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {placement.placement}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-rajdhani text-gray-200 leading-tight break-words">{placement.event}</p>
                              <p className="text-xs text-gray-400 mt-1">{placement.tier}</p>
                            </div>
                            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{placement.entrants} entrants</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No recent tournament data</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Matchups */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Best Matchups */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
              <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5" />
                Best Matchups
              </h3>
              <p className="text-emerald-300 text-sm font-rajdhani mb-4">Your strongest character-opponent combinations</p>
              <div className="space-y-3">
                {Object.entries(mockData.stats.best_matchups).flatMap(([character, opponents]) =>
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
                <TrendingDownIcon className="h-5 w-5" />
                Worst Matchups
              </h3>
              <p className="text-red-300 text-sm font-rajdhani mb-4">Matchups that need improvement</p>
              <div className="space-y-3">
                {Object.entries(mockData.stats.worst_matchups).flatMap(([character, opponents]) =>
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
                <TrendingUpIcon className="h-5 w-5" />
                Best Stages
              </h3>
              <p className="text-emerald-300 text-sm font-rajdhani mb-4">Your strongest stage performance</p>
              <div className="space-y-3">
                {Object.entries(mockData.stats.best_stages).map(([stage, data]) => {
                  const stageStats = data as { wins: number; losses: number; winrate: number };
                  return (
                    <div key={stage} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                      <span className="font-rajdhani font-medium text-gray-200 text-sm">{stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300 text-sm font-rajdhani">
                          {stageStats.wins}-{stageStats.losses}
                        </span>
                        <span className={`text-sm font-orbitron ${getWinRateColor(stageStats.winrate)}`}>
                          {(stageStats.winrate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Worst Stages */}
            <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
              <h3 className="text-red-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingDownIcon className="h-5 w-5" />
                Worst Stages
              </h3>
              <p className="text-red-300 text-sm font-rajdhani mb-4">Stages that need improvement</p>
              <div className="space-y-3">
                {Object.entries(mockData.stats.worst_stages).map(([stage, data]) => {
                  const stageStats = data as { wins: number; losses: number; winrate: number };
                  return (
                    <div key={stage} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                      <span className="font-rajdhani font-medium text-gray-200 text-sm">{stage}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300 text-sm font-rajdhani">
                          {stageStats.wins}-{stageStats.losses}
                        </span>
                        <span className={`text-sm font-orbitron ${getWinRateColor(stageStats.winrate)}`}>
                          {(stageStats.winrate * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Loading state (only for real players)
    if (smashStatsMutation.isPending) {
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

    // Error state or no data
    if (smashStatsMutation.isError || !smashStatsMutation.data?.success || !smashStatsMutation.data.data) {
      const errorMessage = smashStatsMutation.data?.message ?? smashStatsMutation.error?.message ?? "Failed to load Smash Ultimate statistics";
      
      return (
        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <InfoIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-orbitron font-semibold text-red-300 mb-2">Smash Ultimate Stats Unavailable</h4>
                <p className="text-xs text-red-200 font-rajdhani mb-3">{errorMessage}</p>
                {errorMessage.includes("hasn't connected") && (
                  <Link href="/dashboard/player/profile/external-accounts">
                    <Button variant="outline" size="sm" className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10">
                      Connect start.gg Account
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

    const data = smashStatsMutation.data.data;
    const { playerInfo, stats, recentPlacements } = data;

    return (
      <div className="space-y-6">
        {/* Player Info Header */}
        <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white">{playerInfo.prefix !== "Unknown" ? playerInfo.prefix : ""} {playerInfo.gamerTag}</h2>
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
                  <span className="text-sm text-gray-300 font-rajdhani">Events</span>
                </div>
                <span className="font-orbitron font-bold text-white">{stats.events}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GamepadIcon className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-300 font-rajdhani">Tournaments</span>
                </div>
                <span className="font-orbitron font-bold text-white">{stats.events}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-300 font-rajdhani">Total Sets</span>
                </div>
                <span className="font-orbitron font-bold text-white">{stats.set_wins + stats.set_losses}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-300 font-rajdhani">Tournaments</span>
                </div>
                <span className="font-orbitron font-bold text-white">{stats.events}</span>
              </div>
            </div>
          </div>

          {/* Main Characters */}
          <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-orbitron font-bold text-white mb-4">Main Characters</h3>
            <div className="space-y-3">
              {Object.entries(stats.characters).slice(0, 5).map(([character, usage]) => {
                const characterStats = usage as { games: number; wins: number; winrate: number };
                return (
                <div key={character} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="font-rajdhani font-medium text-gray-200">{character}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-700 rounded-full h-2 max-w-[100px]">
                                             <div 
                         className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                         style={{ width: `${characterStats.winrate * 100}%` }}
                       />
                     </div>
                     <span className="text-xs text-gray-400 w-8 text-right">{(characterStats.winrate * 100).toFixed(0)}%</span>
                   </div>
                 </div>
                 );
               })}
             </div>
          </div>

          {/* Recent Placements */}
          <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-orbitron font-bold text-white mb-4">Recent Placements</h3>
            <div className="space-y-3">
              {recentPlacements.length > 0 ? (
                recentPlacements.slice(0, 5).map((placement, index) => (
                  <div key={index} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {placement.placement}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-rajdhani text-gray-200 leading-tight break-words">{placement.event}</p>
                            <p className="text-xs text-gray-400 mt-1">{placement.tier}</p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">{placement.entrants} entrants</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No recent tournament data</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Matchups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Matchups */}
          <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
            <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5" />
              Best Matchups
            </h3>
            <p className="text-emerald-300 text-sm font-rajdhani mb-4">Your strongest character-opponent combinations</p>
            <div className="space-y-3">
              {Object.entries(stats.best_matchups).flatMap(([character, opponents]) =>
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
              <TrendingDownIcon className="h-5 w-5" />
              Worst Matchups
            </h3>
            <p className="text-red-300 text-sm font-rajdhani mb-4">Matchups that need improvement</p>
            <div className="space-y-3">
              {Object.entries(stats.worst_matchups).flatMap(([character, opponents]) =>
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
              <TrendingUpIcon className="h-5 w-5" />
              Best Stages
            </h3>
            <p className="text-emerald-300 text-sm font-rajdhani mb-4">Your strongest stage performance</p>
            <div className="space-y-3">
              {Object.entries(stats.best_stages).map(([stage, data]) => {
                const stageStats = data as { wins: number; losses: number; winrate: number };
                return (
                  <div key={stage} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <span className="font-rajdhani font-medium text-gray-200 text-sm">{stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 text-sm font-rajdhani">
                        {stageStats.wins}-{stageStats.losses}
                      </span>
                      <span className={`text-sm font-orbitron ${getWinRateColor(stageStats.winrate)}`}>
                        {(stageStats.winrate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Worst Stages */}
          <div className="bg-[#1a1a2e]/80 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 shadow-xl">
            <h3 className="text-red-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingDownIcon className="h-5 w-5" />
              Worst Stages
            </h3>
            <p className="text-red-300 text-sm font-rajdhani mb-4">Stages that need improvement</p>
            <div className="space-y-3">
              {Object.entries(stats.worst_stages).map(([stage, data]) => {
                const stageStats = data as { wins: number; losses: number; winrate: number };
                return (
                  <div key={stage} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <span className="font-rajdhani font-medium text-gray-200 text-sm">{stage}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 text-sm font-rajdhani">
                        {stageStats.wins}-{stageStats.losses}
                      </span>
                      <span className={`text-sm font-orbitron ${getWinRateColor(stageStats.winrate)}`}>
                        {(stageStats.winrate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
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
                Connect your {gameName === 'Smash Ultimate' ? 'start.gg' : gameName} account now to be ready when analytics launch!
              </p>
              <Link href="/dashboard/player/profile/external-accounts">
                <Button variant="outline" className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10">
                  Connect {gameName === 'Smash Ultimate' ? 'start.gg' : gameName} Account
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
    <Card className="bg-[#1a1a2e]/80 backdrop-blur-sm border-gray-700/50 hover:border-gray-600/30 transition-all duration-300 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <GamepadIcon className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-orbitron font-bold text-white">Game Analytics</h3>
        </div>
        <div className="flex items-center gap-2">
          {!isPlayer && (
            <div className="text-xs text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 rounded px-2 py-1">
              Demo Mode
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="border-gray-600 text-gray-300 hover:border-gray-500"
            onClick={() => window.location.reload()}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Game Selector */}
        <div className="flex flex-wrap gap-2">
          {games.map((game) => {
            const isConnected = (() => {
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
              
              // Check start.gg connection for Smash Ultimate
              if (game.platform === 'startgg') {
                const externalAccount = user?.externalAccounts?.find(account => 
                  account.provider.includes("start_gg") || account.provider === "custom_start_gg"
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
        {selectedGame === 'smash' && isGameConnected && renderSmashAnalytics()}
        {selectedGame === 'smash' && !isGameConnected && renderComingSoon('Smash Ultimate')}
        {selectedGame === 'overwatch' && renderComingSoon('Overwatch 2')}
      </div>
    </Card>
  );
}
