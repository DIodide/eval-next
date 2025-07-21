// Main component export
export { default as GameAnalyticsPanel } from "./GameAnalyticsPanel";

// Component exports
export { GameSelector } from "./components/GameSelector";
export { LoadingState } from "./components/LoadingState";
export { ErrorState } from "./components/ErrorState";

// Hook exports
export {
  useGameConnection,
  useAllGameConnections,
} from "./hooks/useGameConnection";
export { useGameStats } from "./hooks/useGameStats";
export { useGameSelection } from "./hooks/useGameSelection";

// Type exports
export type {
  GameId,
  GameConfig,
  GameAnalyticsPanelProps,
  GameConnectionResult,
  GameStatsResult,
  ValorantStats,
  RocketLeagueStats,
  SmashStats,
  GameStats,
} from "./types";

// Utility exports
export { GAME_CONFIGS } from "./utils/constants";
export * from "./utils/connectionDetection";
export * from "./utils/statsFormatters";
