import type {
  GameId,
  ValorantStats,
  RocketLeagueStats,
  SmashStats,
} from "../types";
import { EVAL_SCORE_THRESHOLDS, WIN_RATE_THRESHOLDS } from "./constants";

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals);
}

export function formatEvalScore(score: number): string {
  return Math.round(score).toString();
}

export function getEvalScoreColor(score: number): string {
  if (score >= EVAL_SCORE_THRESHOLDS.excellent) return "text-emerald-400";
  if (score >= EVAL_SCORE_THRESHOLDS.good) return "text-yellow-400";
  if (score >= EVAL_SCORE_THRESHOLDS.average) return "text-blue-400";
  return "text-red-400";
}

export function getWinRateColor(winRate: number): string {
  if (winRate >= WIN_RATE_THRESHOLDS.excellent) return "text-emerald-400";
  if (winRate >= WIN_RATE_THRESHOLDS.good) return "text-yellow-400";
  if (winRate >= WIN_RATE_THRESHOLDS.average) return "text-blue-400";
  return "text-red-400";
}

export function formatWinRate(winRate: number): string {
  return formatPercentage(winRate * 100);
}

export function formatWinRateFromString(winRateStr: string): string {
  const regex = /(\d+\.?\d*)%/;
  const match = regex.exec(winRateStr);
  if (match) {
    return `${match[1]}%`;
  }
  return winRateStr;
}

export function getPerformanceLevel(
  score: number,
): "excellent" | "good" | "average" | "poor" {
  if (score >= EVAL_SCORE_THRESHOLDS.excellent) return "excellent";
  if (score >= EVAL_SCORE_THRESHOLDS.good) return "good";
  if (score >= EVAL_SCORE_THRESHOLDS.average) return "average";
  return "poor";
}

export function formatKDA(kda: string): string {
  // Already formatted as string in the original data
  return kda;
}

export function formatSmashPlacement(placement: number): string {
  if (placement === 1) return "1st";
  if (placement === 2) return "2nd";
  if (placement === 3) return "3rd";
  return `${placement}th`;
}

export function isTopPlacement(placement: number): boolean {
  return placement <= 8;
}

export function formatSmashRecord(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function formatSmashWinRate(winRate: number): string {
  return formatPercentage(winRate * 100);
}

export function formatBoostPercentage(percentage: number): string {
  return formatPercentage(percentage, 1);
}

export function getBoostRangeColor(range: string): string {
  switch (range) {
    case "0-25%":
      return "bg-red-600";
    case "25-50%":
      return "bg-orange-600";
    case "50-75%":
      return "bg-yellow-600";
    case "75-100%":
      return "bg-green-600";
    default:
      return "bg-gray-600";
  }
}

export function sanitizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // Basic URL validation
  try {
    new URL(url, window.location.origin);
    return url;
  } catch {
    return undefined;
  }
}

export function formatAccountName(gameName?: string, tagLine?: string): string {
  if (gameName && tagLine) {
    return `${gameName}#${tagLine}`;
  }
  return gameName ?? tagLine ?? "Connected";
}

export function formatRocketLeagueUsername(username?: string): string {
  return username ?? "Connected";
}

export function formatSmashPlayerName(
  gamerTag: string,
  prefix: string,
): string {
  if (prefix && prefix !== "Unknown") {
    return `${prefix} ${gamerTag}`;
  }
  return gamerTag;
}

export function validateStatsData(data: unknown, gameId: GameId): boolean {
  if (!data || typeof data !== "object") return false;

  switch (gameId) {
    case "valorant":
      return validateValorantStats(data as ValorantStats);
    case "rocket-league":
      return validateRocketLeagueStats(data as RocketLeagueStats);
    case "smash":
      return validateSmashStats(data as SmashStats);
    default:
      return false;
  }
}

function validateValorantStats(stats: ValorantStats): boolean {
  return !!(
    stats.stats &&
    typeof stats.stats.evalScore === "number" &&
    typeof stats.stats.rank === "string" &&
    stats.role &&
    stats.mainAgent &&
    stats.mainGun &&
    stats.bestMap &&
    stats.worstMap
  );
}

function validateRocketLeagueStats(stats: RocketLeagueStats): boolean {
  return !!(stats && (stats.duels ?? stats.doubles ?? stats.standard));
}

function validateSmashStats(stats: SmashStats): boolean {
  return !!(
    stats.playerInfo &&
    stats.stats &&
    stats.recentPlacements &&
    typeof stats.playerInfo.gamerTag === "string" &&
    typeof stats.playerInfo.evalScore === "number" &&
    Array.isArray(stats.recentPlacements)
  );
}

export function createGameAnalyticsError(
  gameId: GameId,
  type: "connection" | "fetch" | "parse" | "permission",
  message: string,
  details?: unknown,
) {
  return {
    gameId,
    type,
    message,
    details,
  };
}

export function isErrorRetryable(error: Error): boolean {
  const retryableErrors = [
    "Network error",
    "Request timeout",
    "Server error",
    "Connection failed",
  ];

  return retryableErrors.some((retryable) =>
    error.message.toLowerCase().includes(retryable.toLowerCase()),
  );
}

export function getErrorMessage(
  error: Error | null,
  fallback = "An error occurred",
): string {
  if (!error) return fallback;
  return error.message ?? fallback;
}

export function formatLoadingMessage(gameId: GameId): string {
  const messages: Record<GameId, string> = {
    valorant: "Loading VALORANT Statistics",
    "rocket-league": "Loading Rocket League Statistics",
    smash: "Loading Smash Ultimate Analytics",
    overwatch: "Loading Overwatch 2 Statistics",
  };

  return messages[gameId];
}

export function formatLoadingSubMessage(gameId: GameId): string {
  const messages: Record<GameId, string> = {
    valorant: "Please wait while we fetch your competitive performance data...",
    "rocket-league":
      "Please wait while we fetch your Rocket League performance data...",
    smash: "Please wait while we fetch your competitive performance data...",
    overwatch: "Please wait while we fetch your Overwatch 2 statistics...",
  };

  return messages[gameId];
}
