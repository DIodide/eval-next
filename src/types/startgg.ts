export interface StartGGMetadata {
  userId: string;
  slug?: string;
  lastUpdated: string;
}

export interface StartGGUserResponse {
  data: {
    currentUser: {
      id: string;
      slug?: string;
    };
  };
}

// Extend Clerk's publicMetadata type
declare global {
  interface UserPublicMetadata {
    valorant?: ValorantMetadata | null;
    epicGames?: EpicGamesMetadata | null;
    start_gg?: StartGGMetadata | null;
  }
}

// Re-export other metadata types for consistency
export interface ValorantMetadata {
  puuid: string;
  gameName: string;
  tagLine: string;
  lastUpdated: string;
}

export interface EpicGamesMetadata {
  accountId: string;
  displayName: string;
  lastUpdated: string;
}
