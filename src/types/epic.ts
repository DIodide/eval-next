export interface EpicGamesMetadata {
  accountId: string;
  displayName: string;
  lastUpdated: string;
}

export interface EpicAccountResponse {
  sub: string;
  preferred_username: string;
}

// Extend Clerk's publicMetadata type
declare global {
  interface UserPublicMetadata {
    valorant?: ValorantMetadata | null;
    epicGames?: EpicGamesMetadata | null;
  }
}

// Re-export ValorantMetadata type for consistency
export interface ValorantMetadata {
  puuid: string;
  gameName: string;
  tagLine: string;
  lastUpdated: string;
}
