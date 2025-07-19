import { useCallback } from "react";
import { api } from "@/trpc/react";
import type { GameId, GameStatsResult, CacheStrategy, GameStats } from "../types";
import { DEFAULT_CACHE_STRATEGY } from "../utils/constants";
import { isDemoUser, getMockStatsForGame } from "../utils/mockData";

export function useGameStats(
  gameId: GameId,
  playerId: string,
  options?: CacheStrategy
): GameStatsResult {
  const cacheOptions = {
    ...DEFAULT_CACHE_STRATEGY,
    ...options,
  };

  // Check if this is a demo user
  const isDemo = isDemoUser(playerId);

  // VALORANT stats (query with caching) - disabled for demo users
  const valorantStatsQuery = api.valorantStats.getPlayerStatsByPlayerId.useQuery(
    { playerId },
    {
      enabled: gameId === "valorant" && !!playerId && !isDemo,
      ...cacheOptions,
    }
  );

  // Rocket League stats (query with caching) - disabled for demo users
  const rocketLeagueStatsQuery = api.rocketLeagueStats.getAllPlayerStats.useQuery(
    { playerId },
    {
      enabled: gameId === "rocket-league" && !!playerId && !isDemo,
      ...cacheOptions,
    }
  );

  // Smash Ultimate stats (query with caching) - disabled for demo users
  const smashStatsQuery = api.smashStats.getPlayerStatsByPlayerId.useQuery(
    { playerId },
    {
      enabled: gameId === "smash" && !!playerId && !isDemo,
      ...cacheOptions,
    }
  );

  // Create unified interface
  const getStatsForGame = useCallback((): GameStatsResult => {
    // Handle demo mode
    if (isDemo) {
      const mockStats = getMockStatsForGame(gameId);
      return {
        data: mockStats,
        isLoading: false,
        error: null,
        refetch: () => {
          // No-op for demo mode
        },
      };
    }

    switch (gameId) {
      case 'valorant': {
        const error = valorantStatsQuery.error ? 
          new Error(valorantStatsQuery.error.message) : 
          (valorantStatsQuery.data && !valorantStatsQuery.data.success ? 
            new Error(valorantStatsQuery.data.message) : null);
        
        return {
          data: valorantStatsQuery.data?.data as GameStats | null,
          isLoading: valorantStatsQuery.isLoading,
          error,
          refetch: () => void valorantStatsQuery.refetch(),
        };
      }
      case 'rocket-league': {
        const error = rocketLeagueStatsQuery.error ? 
          new Error(rocketLeagueStatsQuery.error.message) : 
          (rocketLeagueStatsQuery.data && !rocketLeagueStatsQuery.data.success ? 
            new Error(rocketLeagueStatsQuery.data.message) : null);
        
        return {
          data: rocketLeagueStatsQuery.data?.data as GameStats | null,
          isLoading: rocketLeagueStatsQuery.isLoading,
          error,
          refetch: () => void rocketLeagueStatsQuery.refetch(),
        };
      }
      case 'smash': {
        const error = smashStatsQuery.error ? 
          new Error(smashStatsQuery.error.message) : 
          (smashStatsQuery.data && !smashStatsQuery.data.success ? 
            new Error(smashStatsQuery.data.message) : null);
        
        return {
          data: smashStatsQuery.data?.data as GameStats | null,
          isLoading: smashStatsQuery.isLoading,
          error,
          refetch: () => void smashStatsQuery.refetch(),
        };
      }
      case 'overwatch':
      default:
        return {
          data: null,
          isLoading: false,
          error: new Error('Game not yet supported'),
          refetch: () => {
            console.log('Refetch not implemented for', gameId);
          },
        };
    }
  }, [
    gameId,
    isDemo,
    valorantStatsQuery,
    rocketLeagueStatsQuery,
    smashStatsQuery,
  ]);

  return getStatsForGame();
}

export function useValorantStats(playerId: string, enabled = true, options?: CacheStrategy) {
  const cacheOptions = {
    ...DEFAULT_CACHE_STRATEGY,
    ...options,
  };

  const query = api.valorantStats.getPlayerStatsByPlayerId.useQuery(
    { playerId },
    {
      enabled: enabled && !!playerId,
      ...cacheOptions,
    }
  );

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? (query.data && !query.data.success ? new Error(query.data.message) : null),
    refetch: () => query.refetch(),
  };
}

export function useRocketLeagueStats(playerId: string, enabled = true, options?: CacheStrategy) {
  const cacheOptions = {
    ...DEFAULT_CACHE_STRATEGY,
    ...options,
  };

  const query = api.rocketLeagueStats.getAllPlayerStats.useQuery(
    { playerId },
    {
      enabled: enabled && !!playerId,
      ...cacheOptions,
    }
  );

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? (query.data && !query.data.success ? new Error(query.data.message) : null),
    refetch: () => query.refetch(),
  };
}

export function useSmashStats(playerId: string, enabled = true, options?: CacheStrategy) {
  const cacheOptions = {
    ...DEFAULT_CACHE_STRATEGY,
    ...options,
  };

  const query = api.smashStats.getPlayerStatsByPlayerId.useQuery(
    { playerId },
    {
      enabled: enabled && !!playerId,
      ...cacheOptions,
    }
  );

  return {
    data: query.data?.data ?? null,
    isLoading: query.isLoading,
    error: query.error ?? (query.data && !query.data.success ? new Error(query.data.message) : null),
    refetch: () => query.refetch(),
  };
} 