import type {
  PlayerSearchFilters,
  ColumnConfig,
  GameInfo,
  PlayerSearchFeature,
} from "../types";

// Default filter values
export const DEFAULT_FILTERS: PlayerSearchFilters = {
  search: "",
  classYear: [],
  minGpa: undefined, // ← Changed: Don't filter by GPA by default (include players with null GPA)
  maxGpa: undefined, // ← Changed: Don't filter by GPA by default (include players with null GPA)
  schoolType: [],
  intendedMajor: "",
  location: "",
  gameId: undefined,
  minRank: undefined,
  maxRank: undefined,
  role: "",
  agents: [],
  playStyle: "",
  minCombineScore: undefined, // ← Changed: Don't filter by combine scores by default
  maxCombineScore: undefined, // ← Changed: Don't filter by combine scores by default
  minLeagueScore: undefined, // ← Changed: Don't filter by league scores by default
  maxLeagueScore: undefined, // ← Changed: Don't filter by league scores by default
  favoritedOnly: false,
  favoriteTags: [],
  favoriteNotes: "",
  sortBy: "name",
  sortOrder: "asc",
};

// Default column configuration
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  {
    id: "avatar",
    header: "",
    width: 60,
    sortable: false,
  },
  {
    id: "name",
    header: "Player",
    sortable: true,
  },
  {
    id: "school",
    header: "School",
    sortable: true,
  },
  {
    id: "academics",
    header: "Academics",
    sortable: true,
  },
  {
    id: "rank",
    header: "Rank",
    sortable: true,
  },

  {
    id: "eval_scores",
    header: "EVAL Scores",
    sortable: true,
  },
  {
    id: "actions",
    header: "",
    width: 120,
    sortable: false,
  },
];

// Game configurations
export const GAME_CONFIGS: GameInfo[] = [
  {
    name: "VALORANT",
    short_name: "VAL",
    icon: "/valorant/logos/Lockup_Horizontal_Off_White.png",
    color: "from-red-500 to-pink-500",
  },
  {
    name: "Rocket League",
    short_name: "RL",
    icon: "/rocket-league/logos/Rocket League Black and White Logo.png",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Super Smash Bros. Ultimate",
    short_name: "SSBU",
    icon: "/smash/logos/SSBU Logo white_trans.png",
    color: "from-purple-500 to-indigo-500",
  },
  {
    name: "Overwatch 2",
    short_name: "OW2",
    icon: "/overwatch/logos/Overwatch 2 Primary Logo.png",
    color: "from-orange-500 to-yellow-500",
  },
];

// Game icon mapping (no emojis)
export const GAME_ICONS: Record<string, string> = {
  VAL: "",
  OW2: "",
  RL: "",
  SSBU: "",
};

// Class year options - Generate graduation years from current year to 6 years out
const currentYear = new Date().getFullYear();
export const CLASS_YEARS = Array.from(
  { length: 8 }, // 8 years: current year through 7 years out
  (_, i) => (currentYear + i).toString(),
);

// School type options
export const SCHOOL_TYPES = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "COLLEGE", label: "College" },
  { value: "UNIVERSITY", label: "University" },
] as const;

// Performance constants
export const PERFORMANCE_CONFIG = {
  DEBOUNCE_DELAY: 500, // ms - Increased for better UX, less frequent API calls
  MIN_SEARCH_LENGTH: 2, // Minimum characters before triggering search (except for empty string)
  DEFAULT_PAGE_SIZE: 20, // Reduced to 10 for faster loading and better UX
  MAX_PAGE_SIZE: 100,
  VIRTUAL_SCROLL_OVERSCAN: 5,
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  PREFETCH_PAGES: 4, // Number of pages to prefetch ahead for ultra-smooth navigation
} as const;

// UI constants
export const UI_CONFIG = {
  FILTER_PANEL_WIDTH: 320, // px
  PLAYER_ROW_HEIGHT: 64, // px
  SEARCH_PLACEHOLDER: "Search players by name, school, or username...",
  LOADING_SKELETON_COUNT: 10,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  SEARCH_FAILED: "Failed to search players. Please try again.",
  FAVORITE_FAILED: "Failed to bookmark player. Please try again.",
  UNFAVORITE_FAILED: "Failed to remove bookmark. Please try again.",
  EXPORT_FAILED: "Failed to export data. Please try again.",
  PERMISSION_DENIED: "You don't have permission to perform this action.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
} as const;

// Analytics event names
export const ANALYTICS_EVENTS = {
  SEARCH_PERFORMED: "player_search_performed",
  FILTER_APPLIED: "player_search_filter_applied",
  PLAYER_FAVORITED: "player_favorited",
  PLAYER_UNFAVORITED: "player_unfavorited",
  PLAYER_PROFILE_VIEWED: "player_profile_viewed",
  EXPORT_INITIATED: "player_export_initiated",
  BULK_ACTION_PERFORMED: "player_bulk_action_performed",
} as const;

// Feature flags mapping
export const FEATURE_FLAGS = {
  ADVANCED_FILTERS: "player-search-advanced-filters",
  BULK_OPERATIONS: "player-search-bulk-operations",
  EXPORT_FUNCTIONALITY: "player-search-export",
  REAL_TIME_UPDATES: "player-search-real-time",
  AI_RECOMMENDATIONS: "player-search-ai-recommendations",
} as const;

// Permission mappings
export const PERMISSION_FEATURES = {
  coach: ["search", "filters", "favorites", "profile-view"] as const,
  admin: [
    "search",
    "filters",
    "favorites",
    "export",
    "bulk-actions",
    "messaging",
    "profile-view",
  ] as const,
  scout: ["search", "filters", "favorites", "profile-view"] as const,
  public: ["search", "filters"] as const,
} as const;

// Mobile column configurations
export const MOBILE_COLUMNS = ["avatar", "name", "school", "actions"];
export const TABLET_COLUMNS = [
  "avatar",
  "name",
  "school",
  "academics",
  "game_profile",
  "actions",
];

// Export formats
export const EXPORT_FORMATS = [
  { value: "csv", label: "CSV", icon: "" },
  { value: "xlsx", label: "Excel", icon: "" },
  { value: "json", label: "JSON", icon: "" },
  { value: "pdf", label: "PDF", icon: "" },
] as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  TOGGLE_FILTERS: "f",
  CLEAR_SEARCH: "Escape",
  SELECT_ALL: "ctrl+a",
  EXPORT: "ctrl+e",
  REFRESH: "ctrl+r",
  NAVIGATE_UP: "ArrowUp",
  NAVIGATE_DOWN: "ArrowDown",
  ACTIVATE_SELECTED: "Enter",
  FAVORITE_SELECTED: "ctrl+f",
} as const;
