# Player Search Panel - Technical Specifications

## Component Overview

The Player Search Panel (`PlayerSearchPanel`) is a reusable React component that provides comprehensive player search, filtering, and management functionality. It enables coaches, administrators, and other authorized users to discover players across multiple esports titles with advanced filtering capabilities, favorite management, and responsive design optimized for performance at scale.

## Component Architecture

### File Structure

```
src/components/core/PlayerSearchPanel/
├── index.tsx                        # Main component export
├── PlayerSearchPanel.tsx            # Core component implementation
├── types.ts                         # TypeScript interfaces and types
├── hooks/
│   ├── usePlayerSearch.ts           # Search and filtering logic
│   ├── usePlayerFavorites.ts        # Favorite management
│   ├── useInfinitePlayerQuery.ts    # Infinite pagination
│   ├── useDebounce.ts               # Debouncing utility
│   └── usePermissions.ts            # Permission checking
├── components/
│   ├── SearchBar.tsx                # Search input component
│   ├── FilterPanel.tsx              # Filter sidebar/sheet
│   ├── PlayerTable.tsx              # Data table component
│   ├── PlayerCard.tsx               # Mobile card view
│   ├── PlayerProfileModal.tsx       # Detail view modal
│   ├── filters/
│   │   ├── AcademicFilters.tsx     # GPA, class year filters
│   │   ├── LocationFilters.tsx     # Location-based filters
│   │   ├── GameFilters.tsx         # Game-specific filters
│   │   └── FavoriteFilters.tsx     # Favorite-related filters
│   └── columns/
│       ├── PlayerColumns.tsx        # Column definitions
│       ├── GameColumns.tsx          # Game-specific columns
│       └── ActionColumns.tsx        # Action button columns
├── utils/
│   ├── rankOrdering.ts              # Game rank hierarchies
│   ├── filterBuilder.ts             # Filter query construction
│   ├── exportUtils.ts               # Data export utilities
│   └── constants.ts                 # Component constants
└── styles/
    └── PlayerSearchPanel.module.css # Component styles
```

## Component Interface

### Props Definition

```typescript
interface PlayerSearchPanelProps {
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
```

### Type Definitions

```typescript
type PlayerSearchFeature =
  | "search"
  | "filters"
  | "favorites"
  | "export"
  | "bulk-actions"
  | "messaging"
  | "profile-view";

interface PlayerSearchFilters {
  // Text Search
  search: string;

  // Academic Filters
  classYear: string[];
  minGpa: number;
  maxGpa: number;
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

interface PlayerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  email: string;
  imageUrl: string | null;
  location: string | null;
  bio: string | null;
  school: SchoolInfo | null;
  academicInfo: AcademicInfo;
  mainGame: GameInfo | null;
  gameProfiles: GameProfile[];
  platformConnections: PlatformConnection[];
  favoriteInfo: FavoriteInfo | null;
  metadata: PlayerMetadata;
}

interface SortConfig {
  field: SortField;
  order: "asc" | "desc";
}

type SortField =
  | "name"
  | "gpa"
  | "combineScore"
  | "leagueScore"
  | "rank"
  | "createdAt"
  | "favoritedAt";

type ExportFormat = "csv" | "xlsx" | "json" | "pdf";

interface PlayerSearchError {
  type: "search" | "filter" | "favorite" | "export" | "permission";
  message: string;
  details?: unknown;
  retryable: boolean;
}
```

## Data Management

### Infinite Query Implementation

#### Backend Procedure with Prisma Cursor-Based Pagination

```typescript
// playerSearch.router.ts
export const playerSearchRouter = createTRPCRouter({
  searchPlayersInfinite: onboardedCoachProcedure
    .input(
      z.object({
        cursor: z.string().optional(), // Cursor for pagination
        limit: z.number().min(1).max(100).default(50),
        // Include all filter inputs
        search: z.string().optional(),
        gameId: z.string().optional(),
        classYear: z.array(z.string()).optional(),
        minGpa: z.number().optional(),
        maxGpa: z.number().optional(),
        location: z.string().optional(),
        minRank: z.string().optional(),
        maxRank: z.string().optional(),
        role: z.string().optional(),
        agents: z.array(z.string()).optional(),
        playStyle: z.string().optional(),
        minCombineScore: z.number().optional(),
        maxCombineScore: z.number().optional(),
        minLeagueScore: z.number().optional(),
        maxLeagueScore: z.number().optional(),
        favoritedOnly: z.boolean().optional(),
        sortBy: z
          .enum(["name", "gpa", "combineScore", "leagueScore", "createdAt"])
          .default("name"),
        sortOrder: z.enum(["asc", "desc"]).default("asc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, ...filters } = input;
      const coachId = ctx.coachId;

      // Build where clause based on filters
      const whereClause: Prisma.PlayerWhereInput = {
        // Add filter conditions here
        ...(filters.search && {
          OR: [
            { first_name: { contains: filters.search, mode: "insensitive" } },
            { last_name: { contains: filters.search, mode: "insensitive" } },
            { username: { contains: filters.search, mode: "insensitive" } },
            { school: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
        ...(filters.location && {
          location: { contains: filters.location, mode: "insensitive" },
        }),
        ...(filters.classYear?.length && {
          class_year: { in: filters.classYear },
        }),
        // Add other filter conditions...
      };

      // Fetch one extra item to determine if there's a next page
      const items = await ctx.db.player.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
          { [filters.sortBy]: filters.sortOrder },
          { id: "asc" }, // Secondary sort for stable cursor pagination
        ],
        include: {
          school_ref: true,
          main_game: true,
          game_profiles: {
            where: filters.gameId ? { game_id: filters.gameId } : undefined,
            include: { game: true },
          },
          platform_connections: true,
          favorited_by: {
            where: { coach_id: coachId },
            select: {
              id: true,
              notes: true,
              tags: true,
              created_at: true,
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      // Transform items to match expected format
      const players = items.map((player) => ({
        id: player.id,
        firstName: player.first_name,
        lastName: player.last_name,
        username: player.username,
        email: player.email,
        imageUrl: player.image_url,
        location: player.location,
        bio: player.bio,
        school: player.school_ref,
        academicInfo: {
          classYear: player.class_year,
          gpa: player.gpa,
          graduationDate: player.graduation_date,
          intendedMajor: player.intended_major,
        },
        mainGame: player.main_game,
        gameProfiles: player.game_profiles,
        platformConnections: player.platform_connections,
        isFavorited: player.favorited_by.length > 0,
        favoriteInfo: player.favorited_by[0] ?? null,
        createdAt: player.created_at,
      }));

      return {
        items: players,
        nextCursor,
      };
    }),
});
```

#### Frontend Hook Implementation

```typescript
// useInfinitePlayerQuery.ts
function useInfinitePlayerQuery(
  filters: PlayerSearchFilters,
  pageSize: number = 50,
) {
  return api.playerSearch.searchPlayersInfinite.useInfiniteQuery(
    {
      ...filters,
      limit: pageSize,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  );
}
```

### State Management Architecture

```typescript
// PlayerSearchPanel state reducer
interface PlayerSearchState {
  filters: PlayerSearchFilters;
  selectedPlayers: Set<string>;
  expandedRows: Set<string>;
  columnVisibility: Record<string, boolean>;
  viewMode: "table" | "grid" | "list";
  filterPanelOpen: boolean;
}

type PlayerSearchAction =
  | { type: "SET_FILTER"; payload: Partial<PlayerSearchFilters> }
  | { type: "RESET_FILTERS" }
  | { type: "TOGGLE_PLAYER_SELECTION"; payload: string }
  | { type: "SELECT_ALL_PLAYERS"; payload: string[] }
  | { type: "CLEAR_SELECTION" }
  | { type: "SET_VIEW_MODE"; payload: PlayerSearchState["viewMode"] }
  | { type: "TOGGLE_FILTER_PANEL" }
  | { type: "SET_COLUMN_VISIBILITY"; payload: Record<string, boolean> };

function playerSearchReducer(
  state: PlayerSearchState,
  action: PlayerSearchAction,
): PlayerSearchState {
  switch (action.type) {
    case "SET_FILTER":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case "RESET_FILTERS":
      return {
        ...state,
        filters: DEFAULT_FILTERS,
      };

    case "TOGGLE_PLAYER_SELECTION":
      const newSelection = new Set(state.selectedPlayers);
      if (newSelection.has(action.payload)) {
        newSelection.delete(action.payload);
      } else {
        newSelection.add(action.payload);
      }
      return { ...state, selectedPlayers: newSelection };

    // ... other cases
  }
}
```

### Debouncing Strategy

```typescript
// Debounced search implementation
function usePlayerSearch(initialFilters: PlayerSearchFilters) {
  const [filters, setFilters] = useState(initialFilters);
  const debouncedFilters = useDebounce(filters, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfinitePlayerQuery(debouncedFilters);

  // Flatten pages for easy consumption
  const players = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  // Check if filters are being applied
  const isFiltering = filters !== debouncedFilters;

  return {
    players,
    filters,
    setFilters,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isFiltering,
    error,
  };
}

// Usage with optimistic updates for favorites
function useOptimisticFavorites() {
  const utils = api.useUtils();

  const favoritePlayerMutation = api.playerSearch.favoritePlayer.useMutation({
    onMutate: async ({ playerId }) => {
      // Cancel outgoing refetches
      await utils.playerSearch.searchPlayersInfinite.cancel();

      // Snapshot previous value
      const previousData =
        utils.playerSearch.searchPlayersInfinite.getInfiniteData();

      // Optimistically update the cache
      utils.playerSearch.searchPlayersInfinite.setInfiniteData(
        undefined, // Update all queries
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map((player) =>
                player.id === playerId
                  ? { ...player, isFavorited: true }
                  : player,
              ),
            })),
          };
        },
      );

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.playerSearch.searchPlayersInfinite.setData(
          undefined,
          context.previousData,
        );
      }
    },
    onSettled: () => {
      // Refetch after mutation
      void utils.playerSearch.searchPlayersInfinite.invalidate();
    },
  });

  return favoritePlayerMutation;
}
```

## UI Components

### Filter Panel Implementation

```typescript
function FilterPanel({
  filters,
  onFilterChange,
  gameId,
  isOpen,
  onClose,
}: FilterPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const content = (
    <div className="space-y-6 p-6">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Players</Label>
        <Input
          id="search"
          placeholder="Name, username, or school..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full"
        />
      </div>

      {/* Academic Filters */}
      <AcademicFilters
        filters={filters}
        onChange={onFilterChange}
      />

      {/* Location Filters */}
      <LocationFilters
        filters={filters}
        onChange={onFilterChange}
      />

      {/* Game-Specific Filters */}
      {gameId && (
        <GameFilters
          gameId={gameId}
          filters={filters}
          onChange={onFilterChange}
        />
      )}

      {/* Favorite Filters */}
      <FavoriteFilters
        filters={filters}
        onChange={onFilterChange}
      />

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onFilterChange(DEFAULT_FILTERS)}
          className="flex-1"
        >
          Reset Filters
        </Button>
        {isMobile && (
          <Button onClick={onClose} className="flex-1">
            Apply Filters
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>Filter Players</SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            {content}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-80 border-l bg-background",
        "transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between border-b p-4">
        <h3 className="font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-65px)]">
        {content}
      </ScrollArea>
    </div>
  );
}
```

### Virtual Scrolling Implementation

```typescript
// PlayerTable with virtual scrolling for performance
import { useVirtualizer } from "@tanstack/react-virtual";

function VirtualPlayerTable({
  players,
  columns,
  onPlayerSelect,
}: VirtualPlayerTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: players.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64, // Estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const player = players[virtualItem.index];
          return (
            <div
              key={player.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <PlayerRow
                player={player}
                columns={columns}
                onClick={() => onPlayerSelect(player)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Responsive Design Strategy

```typescript
function PlayerSearchPanel(props: PlayerSearchPanelProps) {
  const isMobile = useMediaQuery(`(max-width: ${props.mobileBreakpoint ?? 768}px)`);
  const isTablet = useMediaQuery("(max-width: 1024px)");

  // Responsive column configuration
  const visibleColumns = useMemo(() => {
    if (isMobile) {
      return ["avatar", "name", "school", "actions"];
    }
    if (isTablet) {
      return ["avatar", "name", "school", "academics", "game_profile", "actions"];
    }
    return props.columns ?? DEFAULT_COLUMNS;
  }, [isMobile, isTablet, props.columns]);

  // Switch between table and card view on mobile
  if (isMobile && viewMode === "table") {
    return (
      <div className="space-y-4">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onSelect={() => props.onPlayerSelect?.(player)}
            onFavoriteToggle={() => handleFavoriteToggle(player)}
          />
        ))}
      </div>
    );
  }

  return <PlayerTable columns={visibleColumns} {...otherProps} />;
}
```

## Performance Optimizations

### Memoization Strategy

```typescript
// Memoize expensive computations
const MemoizedPlayerTable = memo(PlayerTable, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.players === nextProps.players &&
    prevProps.columns === nextProps.columns &&
    prevProps.selectedPlayers === nextProps.selectedPlayers
  );
});

// Memoize filter options
const availableRanks = useMemo(() => {
  if (!gameId || !players.length) return [];

  const rankSet = new Set<string>();
  players.forEach((player) => {
    const gameProfile = player.gameProfiles.find((p) => p.gameId === gameId);
    if (gameProfile?.rank) {
      rankSet.add(gameProfile.rank);
    }
  });

  return getRankOrder(gameId).filter((rank) => rankSet.has(rank));
}, [gameId, players]);
```

### Query Optimization

```typescript
// Backend query optimization with Prisma
// 1. Use database indexes
await ctx.db.$executeRaw`
  CREATE INDEX IF NOT EXISTS idx_players_search
  ON players USING GIN (
    to_tsvector('english',
      COALESCE(first_name, '') || ' ' ||
      COALESCE(last_name, '') || ' ' ||
      COALESCE(username, '') || ' ' ||
      COALESCE(school, '')
    )
  );

  CREATE INDEX IF NOT EXISTS idx_players_class_year ON players(class_year);
  CREATE INDEX IF NOT EXISTS idx_players_gpa ON players(gpa);
  CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);
`;

// 2. Optimize the Prisma query with selective includes
const optimizedQuery = async (cursor?: string, limit: number = 50) => {
  // Only include relations that are needed for the current view
  const players = await ctx.db.player.findMany({
    where: whereClause,
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: [
      { [sortBy]: sortOrder },
      { id: "asc" }, // Stable secondary sort
    ],
    select: {
      // Select only required fields
      id: true,
      first_name: true,
      last_name: true,
      username: true,
      email: true,
      image_url: true,
      location: true,
      class_year: true,
      gpa: true,
      created_at: true,
      // Conditionally include relations
      school_ref: gameId ? false : { select: { name: true, type: true } },
      main_game: gameId ? false : { select: { name: true, short_name: true } },
      game_profiles: gameId
        ? {
            where: { game_id: gameId },
            select: {
              username: true,
              rank: true,
              role: true,
              combine_score: true,
              league_score: true,
            },
          }
        : false,
      // Check favorite status efficiently
      _count: {
        select: {
          favorited_by: {
            where: { coach_id: coachId },
          },
        },
      },
    },
  });

  return players;
};
```

### Intersection Observer for Infinite Scroll

```typescript
function useInfiniteScroll(
  fetchNextPage: () => void,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
) {
  const observerRef = useRef<IntersectionObserver>();
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { threshold: 0.1, rootMargin: "100px" },
      );

      if (node) observerRef.current.observe(node);
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  return loadMoreRef;
}

// Usage in component
function PlayerList() {
  const { players, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePlayerSearch(initialFilters);

  const loadMoreRef = useInfiniteScroll(
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  );

  return (
    <div>
      {players.map((player) => (
        <PlayerRow key={player.id} player={player} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-10">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </div>
  );
}
```

## Accessibility Implementation

### ARIA Attributes and Roles

```typescript
<div
  role="search"
  aria-label="Player search panel"
  className={cn("player-search-panel", className)}
>
  {/* Search Bar */}
  <div role="searchbox" aria-label="Search players">
    <Input
      id="player-search"
      aria-label="Search by name, username, or school"
      aria-describedby="search-help"
      aria-invalid={!!searchError}
      aria-errormessage={searchError ? "search-error" : undefined}
    />
    <span id="search-help" className="sr-only">
      Enter player name, username, or school name to search
    </span>
  </div>

  {/* Filter Region */}
  <div
    role="region"
    aria-label="Search filters"
    aria-expanded={filterPanelOpen}
  >
    {/* Filter content */}
  </div>

  {/* Results Table */}
  <div
    role="region"
    aria-label="Search results"
    aria-live="polite"
    aria-busy={isLoading}
  >
    <span className="sr-only">
      {isLoading
        ? "Loading search results"
        : `Showing ${players.length} players${hasNextPage ? ", more available" : ""}`}
    </span>

    <table role="table" aria-label="Player search results">
      {/* Table content with proper ARIA */}
    </table>
  </div>
</div>
```

### Keyboard Navigation

```typescript
function useKeyboardNavigation({
  players,
  selectedIndex,
  onSelect,
  onToggleFavorite,
}: KeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, players.length - 1));
          break;

        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case "Enter":
          if (selectedIndex >= 0) {
            onSelect(players[selectedIndex]);
          }
          break;

        case "f":
          if (e.ctrlKey && selectedIndex >= 0) {
            e.preventDefault();
            onToggleFavorite(players[selectedIndex]);
          }
          break;

        case "Escape":
          setFilterPanelOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [players, selectedIndex, onSelect, onToggleFavorite]);
}
```

## Error Handling

### Error Boundary Implementation

```typescript
class PlayerSearchErrorBoundary extends Component<
  PlayerSearchErrorBoundaryProps,
  PlayerSearchErrorBoundaryState
> {
  state = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("PlayerSearchPanel Error:", error, errorInfo);

    // Log to error tracking service
    trackError("player_search_error", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.props.onError?.({
      type: "search",
      message: "An unexpected error occurred",
      details: error,
      retryable: true,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

### Retry Logic

```typescript
function useRetryableQuery<T>(
  queryFn: () => Promise<T>,
  options?: RetryOptions,
) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelay = options?.retryDelay ?? 1000;

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["player-search", retryCount],
    queryFn,
    retry: false,
    onError: (error) => {
      if (retryCount < maxRetries && isRetryableError(error)) {
        setTimeout(
          () => {
            setRetryCount((prev) => prev + 1);
          },
          retryDelay * Math.pow(2, retryCount),
        );
      }
    },
  });

  return {
    data,
    error,
    isLoading,
    retry: () => setRetryCount(0),
    retryCount,
  };
}
```

## Testing Strategy

### Unit Tests

```typescript
describe("PlayerSearchPanel", () => {
  it("renders without crashing", () => {
    render(<PlayerSearchPanel />);
    expect(screen.getByRole("search")).toBeInTheDocument();
  });

  it("applies filters correctly", async () => {
    const onFilterChange = jest.fn();
    const { getByLabelText } = render(
      <PlayerSearchPanel onFilterChange={onFilterChange} />
    );

    const searchInput = getByLabelText(/search players/i);
    await userEvent.type(searchInput, "John Doe");

    await waitFor(() => {
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ search: "John Doe" })
      );
    });
  });

  it("handles favorite toggling with optimistic updates", async () => {
    const mockPlayers = createMockPlayers(5);
    mockTRPC.playerSearch.searchPlayersInfinite.mockResolvedValue({
      pages: [{ items: mockPlayers, nextCursor: null }],
    });

    const { getByTestId } = render(<PlayerSearchPanel />);

    const favoriteButton = await screen.findByTestId(
      `favorite-${mockPlayers[0].id}`
    );
    await userEvent.click(favoriteButton);

    // Check optimistic update
    expect(favoriteButton).toHaveAttribute("aria-pressed", "true");

    // Verify mutation was called
    expect(
      mockTRPC.playerSearch.favoritePlayer
    ).toHaveBeenCalledWith({
      player_id: mockPlayers[0].id,
    });
  });

  it("implements infinite scroll correctly", async () => {
    const mockPages = [
      { items: createMockPlayers(50), nextCursor: "cursor1" },
      { items: createMockPlayers(50), nextCursor: "cursor2" },
      { items: createMockPlayers(50), nextCursor: null },
    ];

    let pageIndex = 0;
    mockTRPC.playerSearch.searchPlayersInfinite.mockImplementation(() => ({
      pages: mockPages.slice(0, pageIndex + 1),
      fetchNextPage: () => pageIndex++,
      hasNextPage: pageIndex < mockPages.length - 1,
      isFetchingNextPage: false,
    }));

    const { container } = render(<PlayerSearchPanel />);

    // Scroll to bottom
    const scrollContainer = container.querySelector(".scroll-container");
    fireEvent.scroll(scrollContainer, {
      target: { scrollTop: 1000 },
    });

    await waitFor(() => {
      expect(screen.getAllByRole("row")).toHaveLength(100); // 2 pages
    });
  });
});
```

### Integration Tests

```typescript
describe("PlayerSearchPanel Integration", () => {
  it("integrates with URL state correctly", async () => {
    const { rerender } = render(
      <PlayerSearchPanel enableUrlSync />
    );

    // Change filters
    const searchInput = screen.getByLabelText(/search players/i);
    await userEvent.type(searchInput, "valorant");

    // Check URL updated
    await waitFor(() => {
      expect(window.location.search).toContain("search=valorant");
    });

    // Simulate browser back
    window.history.back();
    rerender(<PlayerSearchPanel enableUrlSync />);

    // Check filters restored
    expect(searchInput).toHaveValue("");
  });

  it("handles permission levels correctly", async () => {
    const { rerender } = render(
      <PlayerSearchPanel permissionLevel="scout" />
    );

    // Scout shouldn't see contact info
    expect(screen.queryByText(/email/i)).not.toBeInTheDocument();

    // Admin should see everything
    rerender(<PlayerSearchPanel permissionLevel="admin" />);
    expect(screen.getByText(/email/i)).toBeInTheDocument();
  });
});
```

## Migration Plan

### Phase 1: Component Creation (Week 1-2)

1. Create component directory structure
2. Extract and refactor existing logic
3. Implement TypeScript interfaces
4. Create base component with props support
5. Add unit tests for core functionality

### Phase 2: Feature Enhancement (Week 3-4)

1. Implement infinite scroll pagination
2. Add virtual scrolling for performance
3. Create responsive design system
4. Add accessibility features
5. Implement advanced filtering UI

### Phase 3: Integration & Testing (Week 5-6)

1. Replace existing implementation
2. Add integration tests
3. Performance testing and optimization
4. Accessibility audit and fixes
5. Documentation and examples

### Phase 4: Advanced Features (Week 7-8)

1. Add bulk operations
2. Implement export functionality
3. Create saved searches
4. Add analytics tracking
5. Deploy and monitor

## Usage Examples

### Basic Usage

```tsx
import { PlayerSearchPanel } from "@/components/core/PlayerSearchPanel";

function CoachDashboard() {
  return (
    <PlayerSearchPanel
      permissionLevel="coach"
      onPlayerSelect={(player) => {
        router.push(`/players/${player.id}`);
      }}
    />
  );
}
```

### Advanced Configuration

```tsx
function AdminPlayerManagement() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  return (
    <PlayerSearchPanel
      permissionLevel="admin"
      viewMode="full"
      allowedFeatures={[
        "search",
        "filters",
        "favorites",
        "export",
        "bulk-actions",
        "messaging",
      ]}
      initialFilters={{
        gameId: "valorant",
        minGpa: 3.0,
        classYear: ["Junior", "Senior"],
      }}
      columns={[
        "avatar",
        "name",
        "email", // Admin only
        "school",
        "academics",
        "rank",
        "evalScores",
        "lastActive", // Admin only
        "actions",
      ]}
      showBulkActions
      onBulkAction={(action, playerIds) => {
        handleBulkAction(action, playerIds);
      }}
      onExport={(data, format) => {
        exportPlayers(data, format);
      }}
      queryOptions={{
        staleTime: 2 * 60 * 1000, // 2 minutes for admin
        refetchInterval: 30 * 1000, // 30 seconds
      }}
      enableUrlSync
      enablePersistence
      analyticsConfig={{
        trackSearch: true,
        trackFilters: true,
        trackExports: true,
      }}
    />
  );
}
```

### Mobile-Optimized Implementation

```tsx
function MobilePlayerSearch() {
  return (
    <PlayerSearchPanel
      permissionLevel="coach"
      viewMode="compact"
      mobileBreakpoint={768}
      defaultPageSize={20} // Smaller for mobile
      columns={["avatar", "name", "school", "mainGame"]}
      showFilters={false} // Use bottom sheet on mobile
      theme="dark"
      className="h-screen"
    />
  );
}
```

### Public Search Implementation

```tsx
function PublicPlayerDirectory() {
  return (
    <PlayerSearchPanel
      permissionLevel="public"
      allowedFeatures={["search", "filters"]} // No favorites or messaging
      initialFilters={{
        favoritedOnly: false,
      }}
      hiddenColumns={["email", "actions"]} // Hide sensitive data
      onPlayerSelect={(player) => {
        // Show limited public profile
        openPublicProfile(player.username);
      }}
      onError={(error) => {
        if (error.type === "permission") {
          showLoginPrompt();
        }
      }}
    />
  );
}
```

## Performance Benchmarks

### Target Metrics

- **Initial Load**: < 200ms for first render
- **Search Response**: < 500ms for results
- **Filter Application**: < 100ms for UI update
- **Scroll Performance**: 60fps with 1000+ rows
- **Memory Usage**: < 50MB for 1000 players
- **Bundle Size**: < 100KB gzipped

### Optimization Techniques

1. **Code Splitting**: Lazy load game-specific components
2. **Virtual Scrolling**: Render only visible rows
3. **Debouncing**: Prevent excessive API calls
4. **Memoization**: Cache expensive computations
5. **Image Optimization**: Lazy load avatars
6. **Query Deduplication**: Prevent duplicate requests
