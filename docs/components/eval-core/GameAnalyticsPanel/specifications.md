# Game Analytics Panel - Technical Specifications

## Component Overview

The Game Analytics Panel (`GameAnalyticsPanel`) is a reusable React component that provides a unified interface for displaying competitive gaming statistics across multiple esports titles. This document outlines the technical implementation details for componentizing the existing functionality.

## Component Architecture

### File Structure

```
src/components/core/GameAnalyticsPanel/
├── index.tsx                    # Main component export
├── GameAnalyticsPanel.tsx       # Core component implementation
├── types.ts                     # TypeScript interfaces and types
├── hooks/
│   ├── useGameConnection.ts     # Connection detection logic
│   ├── useGameStats.ts          # Stats fetching abstraction
│   └── useGameSelection.ts      # Game tab management
├── components/
│   ├── GameSelector.tsx         # Tab selection UI
│   ├── ConnectionStatus.tsx     # Connection indicator
│   ├── LoadingState.tsx         # Loading animations
│   ├── ErrorState.tsx           # Error display
│   └── games/
│       ├── ValorantAnalytics.tsx
│       ├── RocketLeagueAnalytics.tsx
│       ├── SmashAnalytics.tsx
│       └── ComingSoon.tsx
├── utils/
│   ├── connectionDetection.ts   # OAuth & platform connection logic
│   ├── statsFormatters.ts       # Data formatting utilities
│   └── constants.ts             # Game configurations
```

## Component Interface

### Props Definition

```typescript
interface GameAnalyticsPanelProps {
  // Player identification
  playerId?: string; // Optional player ID (defaults to current user)
  viewMode?: "self" | "other"; // View mode for permissions

  // Display configuration
  defaultGame?: GameId; // Initial game selection
  allowedGames?: GameId[]; // Filter available games
  showHeader?: boolean; // Show/hide header section
  showConnectionPrompts?: boolean; // Show/hide connection CTAs

  // Styling
  className?: string; // Additional CSS classes
  headerClassName?: string; // Header section styling
  contentClassName?: string; // Content section styling

  // Callbacks
  onGameChange?: (gameId: GameId) => void;
  onConnectionClick?: (gameId: GameId) => void;
  onDataRefresh?: (gameId: GameId) => void;
  onError?: (error: GameAnalyticsError) => void;

  // Advanced options
  cacheStrategy?: CacheStrategy; // Override default caching
  errorBoundary?: boolean; // Enable error boundary
  analyticsTracking?: boolean; // Enable analytics events
}
```

### Type Definitions

```typescript
type GameId = "valorant" | "rocket-league" | "smash" | "overwatch";

interface GameConfig {
  id: GameId;
  name: string;
  icon: React.ComponentType;
  image: string;
  color: string;
  borderColor: string;
  platform: PlatformType;
  enabled: boolean;
}

type PlatformType = "valorant" | "epicgames" | "startgg" | "battlenet";

interface CacheStrategy {
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
}

interface GameAnalyticsError {
  gameId: GameId;
  type: "connection" | "fetch" | "parse" | "permission";
  message: string;
  details?: unknown;
}
```

## Authentication & Authorization

### Connection Detection Flow

```typescript
// useGameConnection.ts
function useGameConnection(gameId: GameId, userId?: string) {
  const { user } = useUser();
  const { data: profileData } = api.playerProfile.getProfile.useQuery({
    userId: userId ?? user?.id,
  });

  const checkOAuthConnection = () => {
    const providerMap = {
      valorant: ["custom_valorant", "valorant"],
      epicgames: ["custom_epic_games", "epic_games"],
      startgg: ["custom_start_gg", "start_gg"],
      battlenet: ["custom_battlenet", "battlenet"],
    };

    const providers = providerMap[platform];
    return user?.externalAccounts?.some(
      (account) =>
        providers.some((p) => account.provider.includes(p)) &&
        account.verification?.status === "verified",
    );
  };

  const checkPlatformConnection = () => {
    return profileData?.platform_connections?.some(
      (conn) => conn.platform === gameConfig.platform && conn.connected,
    );
  };

  return {
    isConnected: checkOAuthConnection() || checkPlatformConnection(),
    connectionType: checkOAuthConnection() ? "oauth" : "platform",
    profileData,
  };
}
```

### Permission Validation

```typescript
function usePermissions(playerId?: string, viewMode?: "self" | "other") {
  const { user } = useUser();
  const isOwnProfile = !playerId || playerId === user?.publicMetadata?.playerId;

  return {
    canView: isOwnProfile || viewMode === "other",
    canRefresh: isOwnProfile,
    canManageConnections: isOwnProfile,
    isAuthenticated: !!user,
  };
}
```

## Data Management

### Stats Fetching Abstraction

```typescript
// useGameStats.ts
function useGameStats(
  gameId: GameId,
  playerId: string,
  options?: CacheStrategy,
) {
  const defaultCache = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  };

  // Game-specific fetching logic
  const fetchers = {
    valorant: () => api.valorantStats.getPlayerStatsByPlayerId.useMutation(),
    "rocket-league": () =>
      api.rocketLeagueStats.getAllPlayerStats.useQuery(
        { playerId },
        defaultCache,
      ),
    smash: () => api.smashStats.getPlayerStatsByPlayerId.useMutation(),
    overwatch: () => null, // Coming soon
  };

  const fetcher = fetchers[gameId]();

  // Unified error handling
  const error =
    fetcher?.error ||
    (!fetcher?.data?.success ? new Error(fetcher?.data?.message) : null);

  return {
    data: fetcher?.data?.data,
    isLoading: fetcher?.isPending || fetcher?.isLoading,
    error,
    refetch: fetcher?.refetch || fetcher?.mutate,
  };
}
```

### State Management Architecture

```typescript
interface GameAnalyticsState {
  selectedGame: GameId;
  connections: Record<GameId, boolean>;
  stats: Record<GameId, GameStats | null>;
  errors: Record<GameId, Error | null>;
  loading: Record<GameId, boolean>;
}

// Using React Context for state management
const GameAnalyticsContext = React.createContext<{
  state: GameAnalyticsState;
  actions: {
    selectGame: (gameId: GameId) => void;
    refreshStats: (gameId: GameId) => void;
    clearError: (gameId: GameId) => void;
  };
} | null>(null);
```

## UI Components

### Game Selector Implementation

```typescript
function GameSelector({
  games,
  selectedGame,
  connections,
  onSelect
}: GameSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelect(game.id)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg border',
            'transition-all duration-200 font-rajdhani font-medium',
            selectedGame === game.id
              ? `bg-gradient-to-r ${game.color} border-transparent text-white shadow-lg`
              : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
          )}
          aria-pressed={selectedGame === game.id}
          aria-label={`View ${game.name} analytics`}
        >
          <Image
            src={game.image}
            alt=""
            width={16}
            height={16}
            className="object-contain"
            aria-hidden="true"
          />
          <span className="text-sm">{game.name}</span>
          {connections[game.id] && (
            <CheckCircleIcon
              className="h-3 w-3"
              aria-label="Connected"
            />
          )}
        </button>
      ))}
    </div>
  );
}
```

### Error Boundary Implementation

```typescript
class GameAnalyticsErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GameAnalyticsPanel Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="Analytics Error"
          message="Failed to load game analytics"
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
```

## Performance Optimizations

### Memoization Strategy

```typescript
// Memoize expensive computations
const MemoizedValorantStats = React.memo(ValorantAnalytics, (prev, next) => {
  return (
    prev.stats?.stats.evalScore === next.stats?.stats.evalScore &&
    prev.stats?.stats.rank === next.stats?.stats.rank
  );
});

// Memoize game configurations
const gameConfigs = useMemo(
  () =>
    GAME_CONFIGS.filter((g) => !allowedGames || allowedGames.includes(g.id)),
  [allowedGames],
);
```

### Lazy Loading Implementation

```typescript
// Lazy load game-specific components
const GameComponents = {
  'valorant': lazy(() => import('./games/ValorantAnalytics')),
  'rocket-league': lazy(() => import('./games/RocketLeagueAnalytics')),
  'smash': lazy(() => import('./games/SmashAnalytics')),
  'overwatch': lazy(() => import('./games/ComingSoon'))
};

// Usage with Suspense
<Suspense fallback={<LoadingState game={selectedGame} />}>
  <GameComponent stats={stats} isConnected={isConnected} />
</Suspense>
```

### Virtual Scrolling for Large Datasets

```typescript
// For future implementation with large stat lists
import { VariableSizeList } from 'react-window';

function VirtualizedStatsList({ items, itemHeight }) {
  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={(index) => itemHeight[index] || 50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <StatItem stat={items[index]} />
        </div>
      )}
    </VariableSizeList>
  );
}
```

## Accessibility Implementation

### ARIA Attributes

```typescript
<div
  role="region"
  aria-label="Game Analytics Panel"
  aria-busy={isLoading}
>
  <div role="tablist" aria-label="Select game">
    {games.map(game => (
      <button
        role="tab"
        aria-selected={selectedGame === game.id}
        aria-controls={`panel-${game.id}`}
        id={`tab-${game.id}`}
      >
        {game.name}
      </button>
    ))}
  </div>

  <div
    role="tabpanel"
    id={`panel-${selectedGame}`}
    aria-labelledby={`tab-${selectedGame}`}
  >
    {/* Game content */}
  </div>
</div>
```

### Keyboard Navigation

```typescript
function useKeyboardNavigation(
  games: GameConfig[],
  onSelect: (id: GameId) => void,
) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = games.findIndex((g) => g.id === selectedGame);

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : games.length - 1;
        onSelect(games[prevIndex].id);
        break;
      case "ArrowRight":
        e.preventDefault();
        const nextIndex =
          currentIndex < games.length - 1 ? currentIndex + 1 : 0;
        onSelect(games[nextIndex].id);
        break;
    }
  };

  return { handleKeyDown };
}
```

## Testing Strategy

### Unit Tests

```typescript
// GameAnalyticsPanel.test.tsx
describe('GameAnalyticsPanel', () => {
  it('renders without crashing', () => {
    render(<GameAnalyticsPanel />);
  });

  it('shows loading state initially', () => {
    const { getByText } = render(<GameAnalyticsPanel />);
    expect(getByText(/loading/i)).toBeInTheDocument();
  });

  it('switches games on tab click', async () => {
    const onGameChange = jest.fn();
    const { getByText } = render(
      <GameAnalyticsPanel onGameChange={onGameChange} />
    );

    fireEvent.click(getByText('Rocket League'));
    expect(onGameChange).toHaveBeenCalledWith('rocket-league');
  });

  it('displays error state on fetch failure', async () => {
    // Mock API failure
    mockTRPC.valorantStats.getPlayerStatsByPlayerId.mockRejectedValue(
      new Error('API Error')
    );

    const { findByText } = render(<GameAnalyticsPanel />);
    expect(await findByText(/failed to load/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// GameAnalyticsPanel.integration.test.tsx
describe('GameAnalyticsPanel Integration', () => {
  it('fetches and displays valorant stats', async () => {
    const mockStats = createMockValorantStats();
    mockTRPC.valorantStats.getPlayerStatsByPlayerId.mockResolvedValue({
      success: true,
      data: mockStats
    });

    const { findByText } = render(
      <TestProviders>
        <GameAnalyticsPanel />
      </TestProviders>
    );

    expect(await findByText(mockStats.stats.rank)).toBeInTheDocument();
  });
});
```

## Migration Plan

### Phase 1: Component Extraction

1. Create component directory structure
2. Extract existing logic into modular components
3. Implement TypeScript interfaces
4. Add basic props support

### Phase 2: Enhancement

1. Add missing authorization checks
2. Implement error boundaries
3. Add accessibility features
4. Create comprehensive test suite

### Phase 3: Integration

1. Replace existing implementation in dashboard
2. Add to component library documentation
3. Create usage examples
4. Deploy and monitor

## Usage Examples

### Basic Usage

```tsx
import { GameAnalyticsPanel } from "@/components/core/GameAnalyticsPanel";

function PlayerDashboard() {
  return <GameAnalyticsPanel />;
}
```

### Advanced Usage

```tsx
function CoachView({ playerId }: { playerId: string }) {
  return (
    <GameAnalyticsPanel
      playerId={playerId}
      viewMode="other"
      allowedGames={["valorant", "rocket-league"]}
      showConnectionPrompts={false}
      onError={(error) => {
        trackEvent("game_analytics_error", error);
      }}
      cacheStrategy={{
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
      }}
    />
  );
}
```

### Custom Styling

```tsx
function ThemedAnalytics() {
  return (
    <GameAnalyticsPanel
      className="custom-analytics-panel"
      headerClassName="bg-gradient-to-r from-purple-600 to-pink-600"
      contentClassName="bg-gray-900/95"
    />
  );
}
```
