/**
 * Game-specific rank hierarchies for proper competitive ordering
 * Extracted from the existing implementation
 */

export type RankOrder = string[];

// Define proper rank orders for different games
export const RANK_ORDERS: Record<string, RankOrder> = {
  VALORANT: [
    "Iron 1",
    "Iron 2",
    "Iron 3",
    "Bronze 1",
    "Bronze 2",
    "Bronze 3",
    "Silver 1",
    "Silver 2",
    "Silver 3",
    "Gold 1",
    "Gold 2",
    "Gold 3",
    "Platinum 1",
    "Platinum 2",
    "Platinum 3",
    "Diamond 1",
    "Diamond 2",
    "Diamond 3",
    "Ascendant 1",
    "Ascendant 2",
    "Ascendant 3",
    "Immortal 1",
    "Immortal 2",
    "Immortal 3",
    "Radiant",
  ],
  "Overwatch 2": [
    "Bronze 5",
    "Bronze 4",
    "Bronze 3",
    "Bronze 2",
    "Bronze 1",
    "Silver 5",
    "Silver 4",
    "Silver 3",
    "Silver 2",
    "Silver 1",
    "Gold 5",
    "Gold 4",
    "Gold 3",
    "Gold 2",
    "Gold 1",
    "Platinum 5",
    "Platinum 4",
    "Platinum 3",
    "Platinum 2",
    "Platinum 1",
    "Diamond 5",
    "Diamond 4",
    "Diamond 3",
    "Diamond 2",
    "Diamond 1",
    "Master 5",
    "Master 4",
    "Master 3",
    "Master 2",
    "Master 1",
    "Grandmaster 5",
    "Grandmaster 4",
    "Grandmaster 3",
    "Grandmaster 2",
    "Grandmaster 1",
    "Champion",
    "Top 500",
  ],
  "Rocket League": [
    "Bronze I",
    "Bronze II",
    "Bronze III",
    "Silver I",
    "Silver II",
    "Silver III",
    "Gold I",
    "Gold II",
    "Gold III",
    "Platinum I",
    "Platinum II",
    "Platinum III",
    "Diamond I",
    "Diamond II",
    "Diamond III",
    "Champion I",
    "Champion II",
    "Champion III",
    "Grand Champion I",
    "Grand Champion II",
    "Grand Champion III",
    "Supersonic Legend",
  ],
  // Super Smash Bros. Ultimate doesn't have meaningful ranks
  "Super Smash Bros. Ultimate": [],
};

/**
 * Get the rank order for a specific game
 */
export function getGameRankOrder(gameName: string): RankOrder {
  return RANK_ORDERS[gameName] ?? [];
}

/**
 * Get available ranks for a game filtered by what exists in the data
 */
export function getAvailableRanks(
  gameName: string,
  availableRanks: Set<string>,
): RankOrder {
  const rankOrder = getGameRankOrder(gameName);

  if (rankOrder.length === 0) {
    // For games without defined rank order, return alphabetical sort
    return Array.from(availableRanks).sort();
  }

  // Filter rank order to only include ranks that exist in the data
  return rankOrder.filter((rank) => availableRanks.has(rank));
}

/**
 * Compare two ranks for sorting purposes
 * Returns negative number if rank1 < rank2, positive if rank1 > rank2, 0 if equal
 */
export function compareRanks(
  rank1: string,
  rank2: string,
  gameName: string,
): number {
  const rankOrder = getGameRankOrder(gameName);

  if (rankOrder.length === 0) {
    // Fallback to string comparison for games without rank order
    return rank1.localeCompare(rank2);
  }

  const index1 = rankOrder.indexOf(rank1);
  const index2 = rankOrder.indexOf(rank2);

  // If rank not found, put it at the end
  const normalizedIndex1 = index1 === -1 ? rankOrder.length : index1;
  const normalizedIndex2 = index2 === -1 ? rankOrder.length : index2;

  return normalizedIndex1 - normalizedIndex2;
}

/**
 * Check if a rank is valid for a given game
 */
export function isValidRank(rank: string, gameName: string): boolean {
  const rankOrder = getGameRankOrder(gameName);

  if (rankOrder.length === 0) {
    // For games without defined ranks, any rank is considered valid
    return true;
  }

  return rankOrder.includes(rank);
}

/**
 * Get the next higher rank for a given rank and game
 */
export function getNextHigherRank(
  currentRank: string,
  gameName: string,
): string | null {
  const rankOrder = getGameRankOrder(gameName);
  const currentIndex = rankOrder.indexOf(currentRank);

  if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
    return null;
  }

  return rankOrder[currentIndex + 1] ?? null;
}

/**
 * Get the next lower rank for a given rank and game
 */
export function getNextLowerRank(
  currentRank: string,
  gameName: string,
): string | null {
  const rankOrder = getGameRankOrder(gameName);
  const currentIndex = rankOrder.indexOf(currentRank);

  if (currentIndex <= 0) {
    return null;
  }

  return rankOrder[currentIndex - 1] ?? null;
}

/**
 * Check if game supports meaningful rank filtering
 */
export function gameSupportsRanks(gameName: string): boolean {
  return getGameRankOrder(gameName).length > 0;
}

/**
 * Get rank tier (e.g., "Diamond" from "Diamond 1")
 */
export function getRankTier(rank: string): string {
  // Extract tier by removing numbers and roman numerals
  return rank.replace(/\s+[IVX\d]+$/, "").trim();
}

/**
 * Get rank level within tier (e.g., "1" from "Diamond 1")
 */
export function getRankLevel(rank: string): string {
  const regex = /([IVX\d]+)$/;
  const match = regex.exec(rank);
  return match?.[1] ?? "";
}

/**
 * Format rank display name with proper styling
 */
export function formatRankDisplay(rank: string): string {
  if (!rank) return "Unranked";

  const tier = getRankTier(rank);
  const level = getRankLevel(rank);

  if (!level) return tier;

  return `${tier} ${level}`;
}
