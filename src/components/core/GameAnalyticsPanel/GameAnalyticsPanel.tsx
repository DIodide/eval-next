import React, { useEffect, Suspense, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, AlertTriangleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Hooks
import { useGameSelection } from "./hooks/useGameSelection";
import { useGameConnection, useAllGameConnections } from "./hooks/useGameConnection";
import { useGameStats } from "./hooks/useGameStats";

// Components
import { GameSelector } from "./components/GameSelector";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";

// Game-specific components
import { ValorantAnalytics } from "./components/games/ValorantAnalytics";
import { RocketLeagueAnalytics } from "./components/games/RocketLeagueAnalytics";
import { SmashAnalytics } from "./components/games/SmashAnalytics";
import { ComingSoon } from "./components/games/ComingSoon";

// Types and constants
import type { GameAnalyticsPanelProps, GameId } from "./types";
import { GAME_CONFIGS } from "./utils/constants";
import { isDemoUser } from "./utils/mockData";
import { api } from "@/trpc/react";

export function GameAnalyticsPanel({
  playerId,
  viewMode: _viewMode = "self",
  targetPlayerProfile,
  defaultGame = "valorant",
  allowedGames,
  showHeader = true,
  publicHeader = false,
  showConnectionPrompts = true,
  openLinksInNewTab = false,
  className = "",
  headerClassName = "",
  contentClassName = "",
  onGameChange,
  onConnectionClick,
  onDataRefresh,
  onError,
  cacheStrategy,
  errorBoundary = true,
  analyticsTracking = true,
}: GameAnalyticsPanelProps) {
  const { user } = useUser();
  
  // Only get player profile data if no playerId is provided (meaning it's the user's own profile)
  const { data: profileData } = api.playerProfile.getProfile.useQuery(
    undefined,
    { enabled: !!user && !playerId }
  );

  // Determine effective player ID
  const effectivePlayerId = playerId ?? profileData?.id;

  // Filter games based on allowed games
  const availableGames = allowedGames 
    ? GAME_CONFIGS.filter(game => allowedGames.includes(game.id))
    : GAME_CONFIGS;

  // Game selection
  const { selectedGame, selectGame, handleKeyboardNavigation } = useGameSelection(
    defaultGame
  );

  // Get current game config
  const currentGame = availableGames.find(g => g.id === selectedGame);

  // Stats fetching
  const { data: stats, isLoading, error, refetch } = useGameStats(
    selectedGame,
    effectivePlayerId ?? "",
    cacheStrategy
  );

  // Connection detection
  const { isConnected: platformConnected, connectionType: _connectionType } = useGameConnection(selectedGame, playerId, targetPlayerProfile);
  
  // Check if this is a demo user
  const isDemo = isDemoUser(effectivePlayerId ?? "");
  
  // Smart connection detection: if we have stats data, the account is connected
  // Also treat demo users as connected
  const isConnected = isDemo || platformConnected || (stats !== null && stats !== undefined);
  
  // Get all game connections for the GameSelector
  const basePlatformConnections = useAllGameConnections(playerId, targetPlayerProfile);
  
  // Create smart connections that also check if we have stats data
  const allConnections = useMemo(() => {
    const smartConnections = { ...basePlatformConnections };
    
    // If this is a demo user, mark all games as connected
    if (isDemo) {
      GAME_CONFIGS.forEach((game) => {
        smartConnections[game.id] = true;
      });
    }
    
    // If we have stats for the current game, mark it as connected
    if (stats !== null && stats !== undefined) {
      smartConnections[selectedGame] = true;
    }
    
    return smartConnections;
  }, [basePlatformConnections, stats, selectedGame, isDemo]);

  // Handle game selection changes
  const handleGameSelect = (gameId: string) => {
    selectGame(gameId as GameId);
    onGameChange?.(gameId as GameId);
    
    if (analyticsTracking) {
      // Track game selection
      console.log(`Game selected: ${gameId}`);
    }
  };

  // Handle connection click
  const handleConnectionClick = () => {
    if (onConnectionClick) {
      onConnectionClick(selectedGame);
    } else {
      // Default behavior - open profile page
      window.open('/dashboard/player/profile/external-accounts', '_blank');
    }
  };

  // Handle data refresh
  const handleDataRefresh = () => {
    refetch?.();
    onDataRefresh?.(selectedGame);
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.({
        gameId: selectedGame,
        type: "fetch",
        message: error.message,
        details: error,
      });
    }
  }, [error, selectedGame, onError]);

  // Render game content
  const renderGameContent = () => {
    if (!currentGame) return null;

    const gameComponentProps = {
      stats,
      isConnected,
      isLoading,
      error,
      viewMode: _viewMode,
      onRetry: handleDataRefresh,
      onConnect: showConnectionPrompts ? handleConnectionClick : undefined,
    };

    switch (selectedGame) {
      case "valorant":
        return <ValorantAnalytics {...gameComponentProps} />;
      case "rocket-league":
        return <RocketLeagueAnalytics {...gameComponentProps} />;
      case "smash":
        return <SmashAnalytics {...gameComponentProps} />;
      case "overwatch":
        return (
          <ComingSoon
            {...gameComponentProps}
            gameName={currentGame.name}
            gameId={currentGame.id}
            platform={currentGame.platform}
          />
        );
      default:
        return (
          <ComingSoon
            {...gameComponentProps}
            gameName={currentGame.name}
            gameId={currentGame.id}
            platform={currentGame.platform}
          />
        );
    }
  };

  const content = (
    <Card className={`bg-[#1a1a2e]/80 backdrop-blur-sm border-gray-700/50 p-6 shadow-xl ${className}`}>
      {/* Header */}
      {(showHeader || publicHeader) && (
        <div className={`flex flex-col gap-6 mb-6 ${headerClassName}`}>
          {/* Regular Header - Full header with manage connections */}
          {showHeader && !publicHeader && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center">
                  <Image
                    src={currentGame?.image ?? "/eval/logos/emblem.png"}
                    alt={`${currentGame?.name ?? "Game"} Logo`}
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
              <Link 
                href="/dashboard/player/profile"
                target={openLinksInNewTab ? "_blank" : undefined}
                rel={openLinksInNewTab ? "noopener noreferrer" : undefined}
              >
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 from-blue-600 to-purple-600 border-gray-600 text-white hover:border-gray-500"
                >
                  Manage Connections
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}

          {/* Public Header - Just the title, no manage connections */}
          {publicHeader && (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <Image
                  src={currentGame?.image ?? "/eval/logos/emblem.png"}
                  alt={`${currentGame?.name ?? "Game"} Logo`}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-orbitron font-bold text-white">Game Analytics</h3>
                <p className="text-xs text-gray-400 font-rajdhani">Performance insights across all games</p>
              </div>
            </div>
          )}

          {/* Game Selection - Show for both regular and public headers */}
          <div onKeyDown={handleKeyboardNavigation}>
            <GameSelector
              games={availableGames}
              selectedGame={selectedGame}
              connections={allConnections}
              onSelect={handleGameSelect}
            />
          </div>

          {/* Connection Status */}
          {showConnectionPrompts && !isConnected && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-orange-900/20 border-orange-700/30">
              <AlertTriangleIcon className="h-4 w-4 text-orange-400" />
              <span className="text-orange-300 font-rajdhani text-sm">
                {currentGame?.name} account not connected
              </span>
            </div>
          )}
        </div>
      )}

      {/* Game Content */}
      <div className={`space-y-6 ${contentClassName}`}>
        <Suspense fallback={<LoadingState game={selectedGame} />}>
          {renderGameContent()}
        </Suspense>
      </div>
    </Card>
  );

  // Wrap in error boundary if enabled
  if (errorBoundary) {
    return (
      <ErrorBoundary onError={onError ? (error: Error) => onError({
        gameId: selectedGame,
        type: "fetch",
        message: error.message,
        details: error,
      }) : undefined}>
        {content}
      </ErrorBoundary>
    );
  }

  return content;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GameAnalyticsPanel Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          game="valorant"
          message="Failed to load game analytics"
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default GameAnalyticsPanel; 