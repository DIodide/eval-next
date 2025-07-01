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

// Extend Clerk's publicMetadata type
declare global {
  interface UserPublicMetadata {
    valorant?: ValorantMetadata | null;
  }
} 