import { useEffect } from "react";
import { api } from "@/trpc/react";
import type {
  PlayerSearchFilters,
  UseInfinitePlayerQueryOptions,
  PaginatedPlayerSearchResponse,
} from "../types";
import { PERFORMANCE_CONFIG } from "../utils/constants";

/**
 * Hook for paginated player query with aggressive prefetching
 * Prefetches the next 4 pages automatically for ultra-smooth navigation
 * (traditional pagination instead of infinite scroll)
 */
export function usePlayerQuery(
  filters: PlayerSearchFilters,
  page = 1,
  pageSize: number = PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE,
  options?: UseInfinitePlayerQueryOptions,
) {
  const utils = api.useUtils();

  const queryOptions = {
    staleTime: options?.staleTime ?? PERFORMANCE_CONFIG.STALE_TIME,
    gcTime: options?.gcTime ?? PERFORMANCE_CONFIG.GC_TIME,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    enabled: options?.enabled ?? true,
  };

  const query = api.playerSearch.searchPlayersPaginated.useQuery(
    {
      ...filters,
      page,
      limit: Math.min(pageSize, PERFORMANCE_CONFIG.MAX_PAGE_SIZE),
    },
    queryOptions,
  );

  // Prefetch next 4 pages and previous page for ultra-smooth navigation
  useEffect(() => {
    if (!query.data?.pagination) return;

    const { hasPreviousPage, totalPages } = query.data.pagination;

    // Prefetch next 4 pages for forward navigation
    for (let i = 1; i <= PERFORMANCE_CONFIG.PREFETCH_PAGES; i++) {
      const prefetchPage = page + i;
      if (prefetchPage <= totalPages) {
        void utils.playerSearch.searchPlayersPaginated.prefetch(
          {
            ...filters,
            page: prefetchPage,
            limit: Math.min(pageSize, PERFORMANCE_CONFIG.MAX_PAGE_SIZE),
          },
          {
            staleTime: PERFORMANCE_CONFIG.STALE_TIME,
          },
        );
      }
    }

    // Prefetch previous page if it exists (for back navigation)
    if (hasPreviousPage && page > 1) {
      void utils.playerSearch.searchPlayersPaginated.prefetch(
        {
          ...filters,
          page: page - 1,
          limit: Math.min(pageSize, PERFORMANCE_CONFIG.MAX_PAGE_SIZE),
        },
        {
          staleTime: PERFORMANCE_CONFIG.STALE_TIME,
        },
      );
    }
  }, [filters, page, pageSize, query.data?.pagination, utils]);

  return query;
}
