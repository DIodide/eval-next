import type { PlayerSearchFilters } from "../types";

// Default filter values
export const DEFAULT_FILTERS: PlayerSearchFilters = {
  search: "",
  gameId: undefined,
  classYear: [],
  minGpa: undefined,
  maxGpa: undefined,
  schoolType: [],
  location: "",
  role: "",
  playStyle: "",
  favoritedOnly: false,
  sortBy: "name",
  sortOrder: "asc",
};

// Class year options
const currentYear = new Date().getFullYear();
export const CLASS_YEARS = Array.from(
  { length: 8 },
  (_, i) => (currentYear + i).toString(),
);

// School type options
export const SCHOOL_TYPES = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "COLLEGE", label: "College" },
  { value: "UNIVERSITY", label: "University" },
] as const;

// Performance config
export const CONFIG = {
  DEBOUNCE_MS: 400,
  MIN_SEARCH_LENGTH: 2,
  PAGE_SIZE: 20,
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
} as const;
