"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import type { PlayerSearchFilters, PlayerSearchResult, PaginationInfo } from "../types";
import { DEFAULT_FILTERS, CONFIG } from "../utils/constants";

/**
 * Simplified player search hook with cleaner state management
 */
export function usePlayerSearch(initialFilters: Partial<PlayerSearchFilters> = {}) {
  // Merge initial filters with defaults
  const [filters, setFilters] = useState<PlayerSearchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const utils = api.useUtils();

  // Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Immediate update for empty search
    if (filters.search.trim() === "") {
      setDebouncedSearch("");
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, CONFIG.DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters.search]);

  // Check if we should run the query
  const shouldQuery = useMemo(() => {
    const searchTerm = debouncedSearch.trim();
    return searchTerm === "" || searchTerm.length >= CONFIG.MIN_SEARCH_LENGTH;
  }, [debouncedSearch]);

  // Build query input
  const queryInput = useMemo(() => ({
    search: debouncedSearch || undefined,
    gameId: filters.gameId || undefined,
    classYear: filters.classYear.length > 0 ? filters.classYear : undefined,
    minGpa: filters.minGpa,
    maxGpa: filters.maxGpa,
    schoolType: filters.schoolType.length > 0 ? filters.schoolType : undefined,
    location: filters.location || undefined,
    role: filters.role || undefined,
    playStyle: filters.playStyle || undefined,
    favoritedOnly: filters.favoritedOnly || undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page: currentPage,
    limit: CONFIG.PAGE_SIZE,
  }), [debouncedSearch, filters, currentPage]);

  // Main query
  const query = api.playerSearch.searchPlayersPaginated.useQuery(queryInput, {
    enabled: shouldQuery,
    staleTime: CONFIG.STALE_TIME,
    gcTime: CONFIG.GC_TIME,
    refetchOnWindowFocus: false,
  });

  // Prefetch next page
  useEffect(() => {
    if (query.data?.pagination.hasNextPage) {
      void utils.playerSearch.searchPlayersPaginated.prefetch({
        ...queryInput,
        page: currentPage + 1,
      });
    }
  }, [query.data, currentPage, queryInput, utils]);

  // Filter update handlers
  const updateFilter = useCallback(<K extends keyof PlayerSearchFilters>(
    key: K,
    value: PlayerSearchFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to page 1 when filters change
  }, []);

  const updateFilters = useCallback((newFilters: Partial<PlayerSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setDebouncedSearch("");
    setCurrentPage(1);
  }, []);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    if (query.data?.pagination.hasNextPage) {
      setCurrentPage((p) => p + 1);
    }
  }, [query.data?.pagination.hasNextPage]);

  const prevPage = useCallback(() => {
    if (query.data?.pagination.hasPreviousPage) {
      setCurrentPage((p) => p - 1);
    }
  }, [query.data?.pagination.hasPreviousPage]);

  // Check if filters are being typed (search debounce in progress)
  const isDebouncing = filters.search !== debouncedSearch;

  // Extract data
  const players: PlayerSearchResult[] = query.data?.items ?? [];
  const pagination: PaginationInfo | null = query.data?.pagination ?? null;

  return {
    // Data
    players,
    pagination,
    
    // State
    filters,
    currentPage,
    isLoading: query.isLoading,
    isDebouncing,
    error: query.error,
    
    // Filter actions
    updateFilter,
    updateFilters,
    resetFilters,
    
    // Pagination actions
    goToPage,
    nextPage,
    prevPage,
  };
}

/**
 * Hook for favorite/unfavorite mutations with optimistic updates
 */
export function usePlayerFavorites() {
  const utils = api.useUtils();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const addPending = (id: string) => {
    setPendingIds((prev) => new Set(prev).add(id));
  };

  const removePending = (id: string) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const favoriteMutation = api.playerSearch.favoritePlayer.useMutation({
    onMutate: ({ player_id }) => {
      addPending(player_id);
    },
    onSuccess: () => {
      void utils.playerSearch.searchPlayersPaginated.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to bookmark player", {
        description: error.message,
      });
    },
    onSettled: (_, __, { player_id }) => {
      removePending(player_id);
    },
  });

  const unfavoriteMutation = api.playerSearch.unfavoritePlayer.useMutation({
    onMutate: ({ player_id }) => {
      addPending(player_id);
    },
    onSuccess: () => {
      void utils.playerSearch.searchPlayersPaginated.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to remove bookmark", {
        description: error.message,
      });
    },
    onSettled: (_, __, { player_id }) => {
      removePending(player_id);
    },
  });

  const toggleFavorite = useCallback((player: PlayerSearchResult) => {
    if (pendingIds.has(player.id)) return;

    if (player.isFavorited) {
      unfavoriteMutation.mutate({ player_id: player.id });
      toast.info("Removed from prospects");
    } else {
      favoriteMutation.mutate({ player_id: player.id, tags: ["prospect"] });
      toast.success("Added to prospects");
    }
  }, [pendingIds, favoriteMutation, unfavoriteMutation]);

  return {
    toggleFavorite,
    isPending: (id: string) => pendingIds.has(id),
    pendingIds,
  };
}
