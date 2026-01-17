// Core types for PlayerSearchPanel

export type SortField =
  | "name"
  | "gpa"
  | "combineScore"
  | "leagueScore"
  | "createdAt";

export type SchoolType = "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";

export interface PlayerSearchFilters {
  search: string;
  gameId?: string;
  classYear: string[];
  minGpa?: number;
  maxGpa?: number;
  schoolType: SchoolType[];
  location: string;
  role: string;
  playStyle: string;
  favoritedOnly: boolean;
  sortBy: SortField;
  sortOrder: "asc" | "desc";
}

export interface SchoolInfo {
  name: string;
  type: string;
  location: string;
  state: string | null;
}

export interface AcademicInfo {
  classYear: string | null;
  gpa: number | null;
  graduationDate: string | null;
  intendedMajor: string | null;
}

export interface GameInfo {
  name: string;
  short_name: string;
  icon: string | null;
  color: string | null;
}

export interface GameProfile {
  username: string;
  rank: string | null;
  rating: number | null;
  role: string | null;
  agents: string[];
  preferred_maps: string[];
  play_style: string | null;
  combine_score: number | null;
  league_score: number | null;
  game: GameInfo;
}

export interface PlatformConnection {
  platform: string;
  username: string;
}

export interface FavoriteInfo {
  id: string;
  notes: string | null;
  tags: string[];
  created_at: Date;
}

export interface PlayerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  email: string;
  imageUrl: string | null;
  location: string | null;
  bio: string | null;
  school: string | null;
  schoolRef: SchoolInfo | null;
  academicInfo: AcademicInfo;
  mainGame: GameInfo | null;
  gameProfiles: GameProfile[];
  platformConnections: PlatformConnection[];
  isFavorited: boolean;
  favoriteInfo: FavoriteInfo | null;
  metadata: {
    createdAt: Date;
    updatedAt?: Date;
  };
}

export interface PlayerSearchPanelProps {
  onPlayerSelect?: (player: PlayerSearchResult) => void;
  onFavoriteToggle?: (playerId: string, favorited: boolean) => void;
  className?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
