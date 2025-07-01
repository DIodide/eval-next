export interface ValorantMetadata {
  puuid: string;
  gameName: string;
  tagLine: string;
  lastUpdated: string;
}

export interface RiotAccountResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
}

// Analytics data structure for the frontend
export interface ValorantAnalyticsData {
  role: string;
  mainAgent: {
    name: string;
    image: string;
  };
  mainGun: {
    name: string;
    image: string;
  };
  bestMap: {
    name: string;
    image: string;
  };
  worstMap: {
    name: string;
    image: string;
  };
  stats: {
    evalScore: number;
    rank: string;
    kda: string;
    gameWinRate: string;
    roundWinRate: string;
    acs: number;
    kastPercent: string;
    clutchFactor: string;
  };
}

// Extend Clerk's publicMetadata type
declare global {
  interface UserPublicMetadata {
    valorant?: ValorantMetadata | null;
  }
} 