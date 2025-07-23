import { api } from "@/trpc/react";
import type {
  PlayerSearchFilters,
  UseInfinitePlayerQueryOptions,
  PlayerSearchResponse,
} from "../types";
import { PERFORMANCE_CONFIG } from "../utils/constants";

/**
 * Hook for infinite player query with cursor-based pagination
 * Implements tRPC's useInfiniteQuery pattern
 *
 * TODO: This requires the searchPlayersInfinite tRPC procedure to be implemented
 */
export function useInfinitePlayerQuery(
  filters: PlayerSearchFilters,
  pageSize: number = PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE,
  options?: UseInfinitePlayerQueryOptions,
) {
  const queryOptions = {
    staleTime: options?.staleTime ?? PERFORMANCE_CONFIG.STALE_TIME,
    gcTime: options?.gcTime ?? PERFORMANCE_CONFIG.GC_TIME,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    enabled: options?.enabled ?? true,
  };

  return api.playerSearch.searchPlayersInfinite.useInfiniteQuery(
    {
      ...filters,
      limit: Math.min(pageSize, PERFORMANCE_CONFIG.MAX_PAGE_SIZE),
    },
    {
      getNextPageParam: (lastPage: PlayerSearchResponse) => lastPage.nextCursor,
      ...queryOptions,
    },
  );
}
