import { useEffect, useCallback } from "react";
import { api } from "@/trpc/react";
import type { GameId, GameStatsResult, CacheStrategy, GameStats } from "../types";
import { DEFAULT_CACHE_STRATEGY } from "../utils/constants";

export function useGameStats(
  gameId: GameId,
  playerId: string,
  options?: CacheStrategy
): GameStatsResult {
  const cacheOptions = {
    ...DEFAULT_CACHE_STRATEGY,
    ...options,
  };

  // VALORANT stats (mutation)
  const valorantStatsMutation = api.valorantStats.getPlayerStatsByPlayerId.useMutation();

  // Rocket League stats (query with caching)
  const rocketLeagueStatsQuery = api.rocketLeagueStats.getAllPlayerStats.useQuery(
    { playerId },
    {
      enabled: gameId === "rocket-league" && !!playerId,
      ...cacheOptions,
    }
  );

  // Smash Ultimate stats (mutation)
  const smashStatsMutation = api.smashStats.getPlayerStatsByPlayerId.useMutation();

  // Trigger mutations when needed
  useEffect(() => {
    if (playerId && gameId === 'valorant') {
      valorantStatsMutation.mutate({ playerId });
    }
    if (playerId && gameId === 'smash') {
      smashStatsMutation.mutate({ playerId });
    }
  }, [playerId, gameId]); // Removed mutation objects from dependencies

  // Create unified interface
  const getStatsForGame = useCallback((): GameStatsResult => {
    switch (gameId) {
      case 'valorant': {
        const error = valorantStatsMutation.error ? 
          new Error(valorantStatsMutation.error.message) : 
          (!valorantStatsMutation.data?.success ? 
            new Error(valorantStatsMutation.data?.message) : null);
        
        return {
          data: valorantStatsMutation.data?.data as GameStats | null,
          isLoading: valorantStatsMutation.isPending,
          error,
          refetch: () => valorantStatsMutation.mutate({ playerId }),
        };
      }
      case 'rocket-league': {
        const error = rocketLeagueStatsQuery.error ? 
          new Error(rocketLeagueStatsQuery.error.message) : 
          (!rocketLeagueStatsQuery.data?.success ? 
            new Error(rocketLeagueStatsQuery.data?.message) : null);
        
        return {
          data: rocketLeagueStatsQuery.data?.data as GameStats | null,
          isLoading: rocketLeagueStatsQuery.isLoading,
          error,
          refetch: () => void rocketLeagueStatsQuery.refetch(),
        };
      }
      case 'smash': {
        const error = smashStatsMutation.error ? 
          new Error(smashStatsMutation.error.message) : 
          (!smashStatsMutation.data?.success ? 
            new Error(smashStatsMutation.data?.message) : null);
        
        return {
          data: smashStatsMutation.data?.data as GameStats | null,
          isLoading: smashStatsMutation.isPending,
          error,
          refetch: () => smashStatsMutation.mutate({ playerId }),
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
    playerId,
    valorantStatsMutation,
    rocketLeagueStatsQuery,
    smashStatsMutation,
  ]);

  return getStatsForGame();
}

export function useValorantStats(playerId: string, enabled = true) {
  const mutation = api.valorantStats.getPlayerStatsByPlayerId.useMutation();

  useEffect(() => {
    if (enabled && playerId) {
      mutation.mutate({ playerId });
    }
  }, [playerId, enabled]); // Removed mutation object from dependencies

  return {
    data: mutation.data?.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error ?? (!mutation.data?.success ? new Error(mutation.data?.message) : null),
    refetch: () => mutation.mutate({ playerId }),
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
    error: query.error ?? (!query.data?.success ? new Error(query.data?.message) : null),
    refetch: () => query.refetch(),
  };
}

export function useSmashStats(playerId: string, enabled = true) {
  const mutation = api.smashStats.getPlayerStatsByPlayerId.useMutation();

  useEffect(() => {
    if (enabled && playerId) {
      mutation.mutate({ playerId });
    }
  }, [playerId, enabled]); // Removed mutation object from dependencies

  return {
    data: mutation.data?.data ?? null,
    isLoading: mutation.isPending,
    error: mutation.error ?? (!mutation.data?.success ? new Error(mutation.data?.message) : null),
    refetch: () => mutation.mutate({ playerId }),
  };
} 