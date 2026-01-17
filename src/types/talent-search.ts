/**
 * TypeScript types for the AI-powered talent search feature
 */

import type { SchoolType } from "@prisma/client";

/**
 * Filter options for talent search queries
 */
export interface TalentSearchFilters {
  /** Natural language search query */
  query?: string;
  /** Filter by specific game ID */
  gameId?: string;
  /** Filter by graduation years */
  classYears?: string[];
  /** Filter by school types */
  schoolTypes?: SchoolType[];
  /** Filter by locations (states/regions) */
  locations?: string[];
  /** Minimum GPA filter */
  minGpa?: number;
  /** Maximum GPA filter */
  maxGpa?: number;
  /** Filter by game roles */
  roles?: string[];
  /** Filter by rank tiers */
  rankTiers?: string[];
  /** Maximum number of results */
  limit?: number;
  /** Minimum similarity score threshold (0-1) */
  minSimilarity?: number;
}

/**
 * A player result from semantic search with similarity score
 */
export interface TalentSearchResult {
  /** Player's database ID */
  id: string;
  /** First name */
  firstName: string;
  /** Last name */
  lastName: string;
  /** Username/gamertag */
  username: string | null;
  /** Profile image URL */
  imageUrl: string | null;
  /** Player's location */
  location: string | null;
  /** Player's bio */
  bio: string | null;
  /** School information */
  school: {
    id: string | null;
    name: string | null;
    type: SchoolType | null;
    state: string | null;
  };
  /** Academic information */
  academicInfo: {
    classYear: string | null;
    gpa: number | null;
    graduationDate: string | null;
    intendedMajor: string | null;
  };
  /** Main game information */
  mainGame: {
    id: string;
    name: string;
    shortName: string;
    icon: string | null;
    color: string | null;
  } | null;
  /** Game profiles with ranks and roles */
  gameProfiles: TalentGameProfile[];
  /** Similarity score from vector search (0-1) */
  similarityScore: number;
  /** Whether the coach has favorited this player */
  isFavorited: boolean;
}

/**
 * Game profile for talent search results
 */
export interface TalentGameProfile {
  /** Game ID */
  gameId: string;
  /** Game name */
  gameName: string;
  /** Game short name */
  gameShortName: string;
  /** In-game username */
  username: string;
  /** Current rank */
  rank: string | null;
  /** Rating/MMR */
  rating: number | null;
  /** Primary role */
  role: string | null;
  /** Agents/characters played */
  agents: string[];
  /** Play style */
  playStyle: string | null;
  /** Combine score (if applicable) */
  combineScore: number | null;
  /** League score (if applicable) */
  leagueScore: number | null;
}

/**
 * AI-generated analysis of a player
 */
export interface PlayerAnalysis {
  /** AI-generated overview paragraph */
  overview: string;
  /** List of player strengths/pros */
  pros: string[];
  /** List of areas for development/cons */
  cons: string[];
  /** When the analysis was generated */
  generatedAt: Date;
  /** Whether analysis is cached or fresh */
  isCached: boolean;
}

/**
 * Player data structure used for generating embeddings
 */
export interface PlayerEmbeddingData {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  location: string | null;
  bio: string | null;
  school: string | null;
  schoolType: SchoolType | null;
  classYear: string | null;
  gpa: number | null;
  intendedMajor: string | null;
  mainGame: string | null;
  gameProfiles: {
    game: string;
    username: string;
    rank: string | null;
    role: string | null;
    agents: string[];
    playStyle: string | null;
  }[];
}

/**
 * Coach context for generating personalized analysis
 */
export interface CoachContext {
  schoolName: string | null;
  schoolType: SchoolType | null;
  games: string[];
}

/**
 * Options for embedding refresh operations
 */
export interface EmbeddingRefreshOptions {
  /** Only process players without embeddings */
  onlyMissing?: boolean;
  /** Batch size for processing */
  batchSize?: number;
  /** Delay between batches in ms */
  batchDelay?: number;
}

/**
 * Result of a batch embedding operation
 */
export interface EmbeddingBatchResult {
  /** Total players processed */
  processed: number;
  /** Successfully embedded */
  succeeded: number;
  /** Failed to embed */
  failed: number;
  /** Player IDs that failed */
  failedIds: string[];
}

/**
 * Raw vector search result from database
 */
export interface VectorSearchRow {
  player_id: string;
  similarity: number;
}
