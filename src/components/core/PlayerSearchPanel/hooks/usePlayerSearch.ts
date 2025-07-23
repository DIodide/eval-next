import { useState, useMemo } from "react";
import { useDebounce } from "./useDebounce";
import { usePlayerQuery } from "./usePlayerQuery";
import type {
  PlayerSearchFilters,
  UsePlayerSearchReturn,
  PlayerSearchResult,
} from "../types";
import { PERFORMANCE_CONFIG, DEFAULT_FILTERS } from "../utils/constants";

/**
 * Main hook for player search functionality
 * Combines filters, debouncing, and paginated query logic
 */
export function usePlayerSearch(
  initialFilters: PlayerSearchFilters = DEFAULT_FILTERS,
  pageSize: number = PERFORMANCE_CONFIG.DEFAULT_PAGE_SIZE,
): UsePlayerSearchReturn {
  const [filters, setFilters] = useState<PlayerSearchFilters>(initialFilters);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const debouncedFilters = useDebounce(
    filters,
    PERFORMANCE_CONFIG.DEBOUNCE_DELAY,
  );

  // Only trigger search if search term is empty or meets minimum length
  const shouldSearch =
    !debouncedFilters.search ||
    debouncedFilters.search.trim() === "" ||
    debouncedFilters.search.trim().length >=
      PERFORMANCE_CONFIG.MIN_SEARCH_LENGTH;

  const queryResult = usePlayerQuery(debouncedFilters, currentPage, pageSize, {
    enabled: shouldSearch,
  });

  // Get players from current page
  const players = useMemo<PlayerSearchResult[]>(() => {
    return queryResult.data?.items ?? [];
  }, [queryResult.data]);

  // Check if filters are being applied (when immediate filters don't match debounced ones)
  const isFiltering = useMemo(() => {
    return JSON.stringify(filters) !== JSON.stringify(debouncedFilters);
  }, [filters, debouncedFilters]);

  // Custom setter that handles both object and function updates and resets page
  const handleSetFilters = (
    newFilters:
      | PlayerSearchFilters
      | ((prev: PlayerSearchFilters) => PlayerSearchFilters),
  ) => {
    if (typeof newFilters === "function") {
      setFilters(newFilters);
    } else {
      setFilters(newFilters);
    }
    // Reset to page 1 when filters change
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToNextPage = () => {
    if (queryResult.data?.pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (queryResult.data?.pagination.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return {
    players,
    filters,
    setFilters: handleSetFilters,
    currentPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    pagination: queryResult.data?.pagination ?? null,
    isLoading: queryResult.isLoading,
    isFiltering,
    error: queryResult.error as Error | null,
  };
}

/**
 * Hook for getting available filter options based on current search results
 */
export function usePlayerSearchOptions(
  players: PlayerSearchResult[],
  currentGameId?: string,
) {
  const availableRanks = useMemo(() => {
    if (!currentGameId || !players.length) return [];

    const rankSet = new Set<string>();
    players.forEach((player) => {
      const gameProfile = player.gameProfiles.find(
        (p) => p.game.name === currentGameId,
      );
      if (gameProfile?.rank) {
        rankSet.add(gameProfile.rank);
      }
    });

    return Array.from(rankSet).sort();
  }, [players, currentGameId]);

  const availableRoles = useMemo(() => {
    if (!currentGameId || !players.length) return [];

    const roleSet = new Set<string>();
    players.forEach((player) => {
      const gameProfile = player.gameProfiles.find(
        (p) => p.game.name === currentGameId,
      );
      if (gameProfile?.role) {
        roleSet.add(gameProfile.role);
      }
    });

    return Array.from(roleSet).sort();
  }, [players, currentGameId]);

  const availableAgents = useMemo(() => {
    if (!currentGameId || !players.length) return [];

    const agentSet = new Set<string>();
    players.forEach((player) => {
      const gameProfile = player.gameProfiles.find(
        (p) => p.game.name === currentGameId,
      );
      if (gameProfile?.agents) {
        gameProfile.agents.forEach((agent) => agentSet.add(agent));
      }
    });

    return Array.from(agentSet).sort();
  }, [players, currentGameId]);

  const availablePlayStyles = useMemo(() => {
    if (!currentGameId || !players.length) return [];

    const styleSet = new Set<string>();
    players.forEach((player) => {
      const gameProfile = player.gameProfiles.find(
        (p) => p.game.name === currentGameId,
      );
      if (gameProfile?.play_style) {
        styleSet.add(gameProfile.play_style);
      }
    });

    return Array.from(styleSet).sort();
  }, [players, currentGameId]);

  return {
    availableRanks,
    availableRoles,
    availableAgents,
    availablePlayStyles,
  };
}
