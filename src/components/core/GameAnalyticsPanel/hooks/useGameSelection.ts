import { useState, useCallback, useEffect } from "react";
import type { GameId } from "../types";
import { GAME_CONFIGS } from "../utils/constants";

export function useGameSelection(
  defaultGame: GameId = 'valorant',
  allowedGames?: GameId[]
) {
  const [selectedGame, setSelectedGame] = useState<GameId>(defaultGame);

  const availableGames = GAME_CONFIGS.filter(game => 
    !allowedGames || allowedGames.includes(game.id)
  );

  const selectGame = useCallback((gameId: GameId) => {
    // Ensure the game is available
    if (availableGames.some(game => game.id === gameId)) {
      setSelectedGame(gameId);
    }
  }, [availableGames]);

  const currentGame = availableGames.find(game => game.id === selectedGame);

  // If selected game is not available, select the first available game
  useEffect(() => {
    if (!currentGame && availableGames.length > 0) {
      const firstGame = availableGames[0];
      if (firstGame) {
        setSelectedGame(firstGame.id);
      }
    }
  }, [currentGame, availableGames]);

  const handleKeyboardNavigation = useCallback((event: React.KeyboardEvent) => {
    const currentIndex = availableGames.findIndex(game => game.id === selectedGame);
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : availableGames.length - 1;
        const prevGame = availableGames[prevIndex];
        if (prevGame) {
          setSelectedGame(prevGame.id);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = currentIndex < availableGames.length - 1 ? currentIndex + 1 : 0;
        const nextGame = availableGames[nextIndex];
        if (nextGame) {
          setSelectedGame(nextGame.id);
        }
        break;
      case 'Home':
        event.preventDefault();
        const firstGame = availableGames[0];
        if (firstGame) {
          setSelectedGame(firstGame.id);
        }
        break;
      case 'End':
        event.preventDefault();
        const lastGame = availableGames[availableGames.length - 1];
        if (lastGame) {
          setSelectedGame(lastGame.id);
        }
        break;
    }
  }, [selectedGame, availableGames]);

  return {
    selectedGame,
    selectGame,
    availableGames,
    currentGame,
    handleKeyboardNavigation,
  };
}

export function useGameRotation(
  games: GameId[],
  interval = 5000,
  autoRotate = false
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(autoRotate);

  const currentGame = games[currentIndex];

  const nextGame = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % games.length);
  }, [games.length]);

  const prevGame = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + games.length) % games.length);
  }, [games.length]);

  const goToGame = useCallback((gameId: GameId) => {
    const index = games.findIndex(game => game === gameId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [games]);

  const toggleRotation = useCallback(() => {
    setIsRotating(!isRotating);
  }, [isRotating]);

  useEffect(() => {
    if (!isRotating) return;

    const timer = setInterval(nextGame, interval);
    return () => clearInterval(timer);
  }, [isRotating, interval, nextGame]);

  return {
    currentGame,
    currentIndex,
    nextGame,
    prevGame,
    goToGame,
    isRotating,
    toggleRotation,
  };
}

export function useGameFilters(
  games: GameId[],
  initialFilters: {
    connected?: boolean;
    enabled?: boolean;
    supported?: boolean;
  } = {}
) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key: keyof typeof filters, value: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const filterGames = useCallback((
    allGames: GameId[],
    connections: Record<GameId, boolean>
  ) => {
    return allGames.filter(gameId => {
      const gameConfig = GAME_CONFIGS.find(g => g.id === gameId);
      if (!gameConfig) return false;

      if (filters.connected !== undefined && connections[gameId] !== filters.connected) {
        return false;
      }

      if (filters.enabled !== undefined && gameConfig.enabled !== filters.enabled) {
        return false;
      }

      if (filters.supported !== undefined) {
        const isSupported = ['valorant', 'rocket-league', 'smash'].includes(gameId);
        if (isSupported !== filters.supported) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filterGames,
  };
} 