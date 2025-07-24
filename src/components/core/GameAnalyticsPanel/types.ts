import type { LucideIcon } from "lucide-react";

export type GameId = "valorant" | "rocket-league" | "smash" | "overwatch";

export type PlatformType = "valorant" | "epicgames" | "startgg" | "battlenet";

export interface PlayerProfileData {
  id: string;
  platform_connections?: { platform: string; connected: boolean }[];
  social_connections?: unknown[];
}

export interface GameConfig {
  id: GameId;
  name: string;
  icon: LucideIcon;
  image: string;
  color: string;
  borderColor: string;
  platform: PlatformType;
  enabled: boolean;
}

export interface CacheStrategy {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

export interface GameAnalyticsError {
  gameId: GameId;
  type: "connection" | "fetch" | "parse" | "permission";
  message: string;
  details?: unknown;
}

export interface GameAnalyticsPanelProps {
  // Player identification
  playerId?: string;
  viewMode?: "self" | "other";
  targetPlayerProfile?: PlayerProfileData; // Target player's profile data for connection detection

  // Display configuration
  defaultGame?: GameId;
  allowedGames?: GameId[];
  showHeader?: boolean;
  publicHeader?: boolean;
  showConnectionPrompts?: boolean;
  openLinksInNewTab?: boolean; // For blog/news context where links should open in new tab

  // Styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;

  // Callbacks
  onGameChange?: (gameId: GameId) => void;
  onConnectionClick?: (gameId: GameId) => void;
  onDataRefresh?: (gameId: GameId) => void;
  onError?: (error: GameAnalyticsError) => void;

  // Advanced options
  cacheStrategy?: CacheStrategy;
  errorBoundary?: boolean;
  analyticsTracking?: boolean;
}

export interface GameConnectionResult {
  isConnected: boolean;
  connectionType: "oauth" | "platform" | "none";
  profileData?: unknown;
}

export interface GameStatsResult {
  data: GameStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface GameAnalyticsState {
  selectedGame: GameId;
  connections: Record<GameId, boolean>;
  stats: Record<GameId, GameStats | null>;
  errors: Record<GameId, Error | null>;
  loading: Record<GameId, boolean>;
}

export interface GameAnalyticsActions {
  selectGame: (gameId: GameId) => void;
  refreshStats: (gameId: GameId) => void;
  clearError: (gameId: GameId) => void;
}

// Game-specific stats interfaces
export interface ValorantStats {
  gameName?: string;
  tagLine?: string;
  stats: {
    evalScore: number;
    rank: string;
    gameWinRate: string;
    roundWinRate: string;
    kda: string;
    acs: string;
    kastPercent: string;
    clutchFactor: string;
  };
  role: string;
  mainAgent: {
    name: string;
    image?: string;
  };
  mainGun: {
    name: string;
    image?: string;
  };
  bestMap: {
    name: string;
    image?: string;
  };
  worstMap: {
    name: string;
    image?: string;
  };
}

export interface RocketLeagueStats {
  username?: string;
  duels: RocketLeaguePlaylistStats | null;
  doubles: RocketLeaguePlaylistStats | null;
  standard: RocketLeaguePlaylistStats | null;
}

export interface RocketLeaguePlaylistStats {
  rank: string;
  eval_score: number;
  win_percentage: number;
  count: number;
  goals: number;
  saves: number;
  assists: number;
  shots: number;
  mvps_per_game: number;
  shooting_percentage: number;
  speed: number;
  clutch: number;
  boost_empty: number;
  boost_full: number;
  boost_0_25: number;
  boost_25_50: number;
  boost_50_75: number;
  boost_75_100: number;
}

export interface SmashStats {
  playerInfo: {
    gamerTag: string;
    prefix: string;
    mainCharacter: string;
    evalScore: number;
  };
  stats: {
    set_win_rate: number;
    game_win_rate: number;
    clutch_factor: number;
    events: number;
    mains: Record<
      string,
      {
        games: number;
        winrate: number;
        image_path: string; // Character image path
      }
    >;
    best_matchups: Record<
      string,
      Record<
        string,
        {
          wins: number;
          games: number;
          winrate: number;
          player_character_image: string; // Player character image path
          opponent_character_image: string; // Opponent character image path
        }
      >
    >;
    worst_matchups: Record<
      string,
      Record<
        string,
        {
          wins: number;
          games: number;
          winrate: number;
          player_character_image: string; // Player character image path
          opponent_character_image: string; // Opponent character image path
        }
      >
    >;
    best_stages: Record<
      string,
      {
        wins: number;
        losses: number;
        winrate: number;
      }
    >;
    worst_stages: Record<
      string,
      {
        wins: number;
        losses: number;
        winrate: number;
      }
    >;
  };
  recentPlacements: Array<{
    event: string;
    placement: number;
    entrants: number;
  }>;
}

export type GameStats = ValorantStats | RocketLeagueStats | SmashStats;

export interface GameComponentProps {
  stats: GameStats | null;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
  viewMode?: "self" | "other";
  onRetry?: () => void;
  onConnect?: () => void;
}

export interface LoadingStateProps {
  game: GameId;
  message?: string;
}

export interface ErrorStateProps {
  game: GameId;
  error: Error | null;
  message?: string;
  onRetry?: () => void;
  onConnect?: () => void;
}

export interface ComingSoonProps {
  game: GameId;
  isConnected: boolean;
  onConnect?: () => void;
}

export interface GameSelectorProps {
  games: GameConfig[];
  selectedGame: GameId;
  connections: Record<GameId, boolean>;
  onSelect: (gameId: GameId) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export interface ConnectionStatusProps {
  game: GameConfig;
  isConnected: boolean;
  onClick?: () => void;
}
