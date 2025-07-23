export type PlayerSearchFeature =
  | "search"
  | "filters"
  | "favorites"
  | "export"
  | "bulk-actions"
  | "messaging"
  | "profile-view";

export type SortField =
  | "name"
  | "gpa"
  | "combineScore"
  | "leagueScore"
  | "rank"
  | "createdAt"
  | "favoritedAt";

export type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

export type SchoolType = "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";

export type GameId = "valorant" | "rocket-league" | "smash" | "overwatch";

export interface PlayerSearchFilters {
  // Text Search
  search: string;

  // Academic Filters
  classYear: string[];
  minGpa: number | undefined;
  maxGpa: number | undefined;
  schoolType: SchoolType[];
  intendedMajor: string;

  // Location Filters
  location: string;
  distance?: number;
  distanceUnit?: "miles" | "km";
  countries?: string[];
  states?: string[];

  // Game Filters
  gameId?: string;
  minRank?: string;
  maxRank?: string;
  role?: string;
  agents?: string[];
  playStyle?: string;
  minCombineScore?: number;
  maxCombineScore?: number;
  minLeagueScore?: number;
  maxLeagueScore?: number;

  // Favorite Filters
  favoritedOnly: boolean;
  favoriteTags?: string[];
  favoriteNotes?: string;

  // Metadata
  sortBy: SortField;
  sortOrder: "asc" | "desc";
}

export interface SortConfig {
  field: SortField;
  order: "asc" | "desc";
}

export interface SchoolInfo {
  name: string;
  type: string;
  location: string;
  state: string;
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

export interface PlayerMetadata {
  createdAt: Date;
  updatedAt?: Date;
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
  metadata: PlayerMetadata;
}

export interface PlayerSearchError {
  type: "search" | "filter" | "favorite" | "export" | "permission";
  message: string;
  details?: unknown;
  retryable: boolean;
}

export interface ColumnConfig {
  id: string;
  header: string;
  accessor?: string;
  sortable?: boolean;
  width?: number;
  hidden?: boolean;
}

export interface AnalyticsConfig {
  trackSearch?: boolean;
  trackFilters?: boolean;
  trackExports?: boolean;
  trackFavorites?: boolean;
}

export interface PlayerSearchPanelProps {
  // Permission & Access Control
  permissionLevel?: "coach" | "admin" | "scout" | "public";
  viewMode?: "full" | "compact" | "minimal";
  allowedFeatures?: PlayerSearchFeature[];

  // Initial State
  initialFilters?: Partial<PlayerSearchFilters>;
  initialGame?: GameId;
  defaultPageSize?: number;
  defaultSort?: SortConfig;

  // Display Configuration
  showFilters?: boolean;
  showGameTabs?: boolean;
  showExport?: boolean;
  showBulkActions?: boolean;
  mobileBreakpoint?: number;

  // Column Configuration
  columns?: ColumnConfig[];
  hiddenColumns?: string[];
  columnOrder?: string[];

  // Styling
  className?: string;
  headerClassName?: string;
  tableClassName?: string;
  filterClassName?: string;
  theme?: "light" | "dark" | "auto";

  // Callbacks
  onPlayerSelect?: (player: PlayerSearchResult) => void;
  onFavoriteToggle?: (playerId: string, favorited: boolean) => void;
  onFilterChange?: (filters: PlayerSearchFilters) => void;
  onExport?: (data: PlayerSearchResult[], format: ExportFormat) => void;
  onError?: (error: PlayerSearchError) => void;
  onPageChange?: (page: number, pageSize: number) => void;

  // Advanced Options
  queryOptions?: {
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number;
    retry?: number;
  };
  enableUrlSync?: boolean;
  enablePersistence?: boolean;
  analyticsConfig?: AnalyticsConfig;
}

// Internal Component Props
export interface FilterPanelProps {
  filters: PlayerSearchFilters;
  onFilterChange: (filters: Partial<PlayerSearchFilters>) => void;
  gameId?: string;
  isOpen: boolean;
  onClose: () => void;
  availableRanks?: string[];
}

export interface PlayerTableProps {
  players: PlayerSearchResult[];
  columns?: ColumnConfig[];
  loading?: boolean;
  onPlayerSelect?: (player: PlayerSearchResult) => void;
  onFavoriteToggle?: (player: PlayerSearchResult) => void;
  selectedPlayers?: Set<string>;
  onSelectionChange?: (selectedPlayers: Set<string>) => void;
}

export interface PlayerCardProps {
  player: PlayerSearchResult;
  onSelect: (player: PlayerSearchResult) => void;
  onFavoriteToggle: (player: PlayerSearchResult) => void;
  compact?: boolean;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  onFilterToggle?: () => void;
  showFilterButton?: boolean;
  filterPanelOpen?: boolean;
}

// State Management Types
export interface PlayerSearchState {
  filters: PlayerSearchFilters;
  selectedPlayers: Set<string>;
  expandedRows: Set<string>;
  columnVisibility: Record<string, boolean>;
  viewMode: "table" | "grid" | "list";
  filterPanelOpen: boolean;
}

export type PlayerSearchAction =
  | { type: "SET_FILTER"; payload: Partial<PlayerSearchFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "TOGGLE_PLAYER_SELECTION"; payload: string }
  | { type: "SELECT_ALL_PLAYERS"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_VIEW_MODE"; payload: PlayerSearchState["viewMode"] }
  | { type: "TOGGLE_FILTER_PANEL" }
  | { type: "SET_COLUMN_VISIBILITY"; payload: Record<string, boolean> };

// Hook return types
export interface UsePlayerSearchReturn {
  players: PlayerSearchResult[];
  filters: PlayerSearchFilters;
  setFilters: (
    filters:
      | PlayerSearchFilters
      | ((prev: PlayerSearchFilters) => PlayerSearchFilters),
  ) => void;
  currentPage: number;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  isLoading: boolean;
  isFiltering: boolean;
  error: Error | null;
}

export interface UseInfinitePlayerQueryOptions {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  enabled?: boolean;
}

export interface UsePlayerFavoritesReturn {
  favoritePlayer: (
    playerId: string,
    options?: { notes?: string; tags?: string[] },
  ) => Promise<void>;
  unfavoritePlayer: (playerId: string) => Promise<void>;
  updateFavorite: (
    playerId: string,
    options: { notes?: string; tags?: string[] },
  ) => Promise<void>;
  isFavoriting: boolean;
  isUnfavoriting: boolean;
  pendingFavorites: Set<string>;
}

export interface KeyboardNavigationProps {
  players: PlayerSearchResult[];
  selectedIndex: number;
  onSelect: (player: PlayerSearchResult) => void;
  onToggleFavorite: (player: PlayerSearchResult) => void;
}

// API Types (matching tRPC router expectations)
export interface PlayerSearchInput {
  cursor?: string;
  limit: number;
  search?: string;
  gameId?: string;
  classYear?: string[];
  minGpa?: number;
  maxGpa?: number;
  location?: string;
  minRank?: string;
  maxRank?: string;
  role?: string;
  agents?: string[];
  playStyle?: string;
  minCombineScore?: number;
  maxCombineScore?: number;
  minLeagueScore?: number;
  maxLeagueScore?: number;
  favoritedOnly?: boolean;
  sortBy?: SortField;
  sortOrder?: "asc" | "desc";
}

export interface PlayerSearchResponse {
  items: PlayerSearchResult[];
  nextCursor?: string;
}

export interface PaginatedPlayerSearchResponse {
  items: PlayerSearchResult[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
