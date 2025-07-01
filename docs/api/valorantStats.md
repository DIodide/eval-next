# Valorant Stats API Documentation

The Valorant Stats router provides endpoints to fetch comprehensive player statistics from the EVAL Valorant API. This router connects to an external API service to retrieve real-time player data for analytics and performance tracking.

## Router: `valorantStats`

### Base Configuration

- **External API**: `EVAL_API_BASE`
- **Authentication**: Uses public and player procedures
- **Rate Limiting**: Depends on external API limits

---

## Endpoints

### 1. `getPlayerStats` (Mutation)

**Purpose**: Get comprehensive Valorant player statistics for the analytics panel

**Type**: `publicProcedure.mutation`

**Input**:

```typescript
{
  puuid: string; // Player's Valorant PUUID (required, min length 1)
}
```

**Output**:

```typescript
{
  success: boolean;
  data: ValorantAnalyticsData | null;
  message: string;
}
```

**ValorantAnalyticsData Structure**:

```typescript
{
  role: string;
  mainAgent: {
    name: string;
    image: string; // Path to agent icon
  }
  mainGun: {
    name: string;
    image: string; // Path to weapon image
  }
  bestMap: {
    name: string;
    image: string; // Path to map image
  }
  worstMap: {
    name: string;
    image: string; // Path to map image
  }
  stats: {
    evalScore: number; // 0-100 EVAL score
    rank: string; // Current rank name
    kda: string; // "kills/deaths/assists" format
    gameWinRate: string; // Percentage string (e.g., "68%")
    roundWinRate: string; // Percentage string (e.g., "55%")
    acs: number; // Average Combat Score (rounded)
    kastPercent: string; // KAST percentage (e.g., "76%")
    clutchFactor: string; // Clutch success rate (e.g., "24%")
  }
}
```

**Usage Example**:

```typescript
const { data, isLoading, error } =
  api.valorantStats.getPlayerStats.useMutation();

// Call the mutation
data.mutate({ puuid: "player-puuid-here" });
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "role": "Duelist",
    "mainAgent": {
      "name": "Jett",
      "image": "/ValAssets/Characters/jett.png"
    },
    "mainGun": {
      "name": "Vandal",
      "image": "/ValAssets/Weapons/vandal.png"
    },
    "bestMap": {
      "name": "Ascent",
      "image": "/ValAssets/Maps/ascent.png"
    },
    "worstMap": {
      "name": "Breeze",
      "image": "/ValAssets/Maps/breeze.png"
    },
    "stats": {
      "evalScore": 87,
      "rank": "Immortal 2",
      "kda": "1.4/0.8/2.1",
      "gameWinRate": "68%",
      "roundWinRate": "55%",
      "acs": 245,
      "kastPercent": "76%",
      "clutchFactor": "24%"
    }
  },
  "message": "Player stats retrieved successfully"
}
```

---

### 2. `getEvalScore` (Mutation)

**Purpose**: Get only the EVAL score for faster queries

**Type**: `publicProcedure.mutation`

**Input**:

```typescript
{
  puuid: string; // Player's Valorant PUUID (required, min length 1)
}
```

**Output**:

```typescript
{
  success: boolean;
  evalScore: number | null;
  matchesAnalyzed: number | null;
  message: string;
}
```

**Usage Example**:

```typescript
const evalScoreMutation = api.valorantStats.getEvalScore.useMutation();

evalScoreMutation.mutate({ puuid: "player-puuid-here" });
```

---

### 3. `getRankInfo` (Query)

**Purpose**: Convert rank tier number to rank name

**Type**: `publicProcedure.query`

**Input**:

```typescript
{
  tier: number; // Rank tier (0-27)
}
```

**Output**:

```typescript
{
  success: boolean;
  tier: number | null;
  rankName: string | null;
  message: string;
}
```

**Usage Example**:

```typescript
const { data } = api.valorantStats.getRankInfo.useQuery({ tier: 15 });
// Returns: { success: true, tier: 15, rankName: "Immortal 1", message: "..." }
```

---

### 4. `getMyStats` (Mutation)

**Purpose**: Get authenticated player's own Valorant stats

**Type**: `playerProcedure.mutation` (requires authentication)

**Input**: None (uses authenticated user's PUUID from metadata)

**Output**:

```typescript
{
  success: boolean;
  data: ValorantAnalyticsData | null;
  message: string;
}
```

**Current Status**:
⚠️ **Not Implemented**: Currently throws `PRECONDITION_FAILED` error indicating that Valorant account connection is required.

**Future Implementation**: Will retrieve PUUID from user's Clerk metadata and fetch their stats automatically.

---

### 5. `healthCheck` (Query)

**Purpose**: Check if the external Valorant API is operational

**Type**: `publicProcedure.query`

**Input**: None

**Output**:

```typescript
{
  apiStatus: string; // "healthy" or "unhealthy"
  message: string;
  timestamp: string; // ISO datetime
}
```

**Usage Example**:

```typescript
const { data } = api.valorantStats.healthCheck.useQuery();
```

---

## Integration with Game Analytics Panel

### Replacing Mock Data

To integrate with the existing analytics panel, replace the mock data with real API calls:

```typescript
// Before (mock data)
const mockGameStats = {
  valorant: {
    role: "Duelist",
    mainAgent: { name: "Jett", image: "/valorant/agents/jett.png" },
    // ... other mock data
  },
};

// After (real API data)
const { data: valorantStats, isLoading } =
  api.valorantStats.getPlayerStats.useMutation();

// Trigger the API call
useEffect(() => {
  if (playerPuuid) {
    valorantStats.mutate({ puuid: playerPuuid });
  }
}, [playerPuuid]);

// Use the real data in your component
const gameStats = {
  valorant: valorantStats.data?.data || fallbackMockData,
};
```

### Image Path Mapping

The API returns image paths that correspond to assets in the `/ValAssets/` directory:

- **Agent Icons**: `/ValAssets/Characters/`
- **Weapon Images**: `/ValAssets/Weapons/`
- **Map Images**: `/ValAssets/Maps/`
- **Role Icons**: `/ValAssets/CharacterRoles/`

### Error Handling

```typescript
const handleValorantStats = async (puuid: string) => {
  try {
    const result = await valorantStats.mutateAsync({ puuid });

    if (!result.success) {
      console.error("API Error:", result.message);
      // Handle API-level errors
      return;
    }

    // Use result.data for analytics panel
    setAnalyticsData(result.data);
  } catch (error) {
    // Handle network/connection errors
    console.error("Network Error:", error);
  }
};
```

---

## Data Transformations

The router automatically transforms raw API data into a format optimized for the analytics panel:

1. **Percentage Formatting**: Converts decimal ratios to percentage strings
2. **K/D/A Formatting**: Combines individual stats into readable format
3. **Score Rounding**: Rounds ACS and other scores to integers
4. **KAST Calculation**: Computes KAST percentage from raw round data
5. **Image Path Mapping**: Maps API image URLs to local asset paths

---

## Environment Setup

Ensure your environment supports:

1. **Fetch API**: For making HTTP requests to external API
2. **Network Access**: Outbound connections to `EVAL_API_BASE`
3. **Asset Serving**: Static file serving for `/ValAssets/` directory

---

## Error Codes

| Error Code              | Description                    | Solution                      |
| ----------------------- | ------------------------------ | ----------------------------- |
| `INTERNAL_SERVER_ERROR` | External API unreachable       | Check network connectivity    |
| `NOT_FOUND`             | Player profile not found       | Verify user authentication    |
| `PRECONDITION_FAILED`   | Valorant account not connected | Implement Valorant OAuth flow |
| `UNAUTHORIZED`          | Authentication failed          | Check user session            |

---

## Future Enhancements

1. **Caching Layer**: Implement Redis caching for frequently requested stats
2. **Real-time Updates**: Add WebSocket support for live match data
3. **Historical Data**: Store and track player progression over time
4. **Team Analytics**: Expand to team-based statistics and comparisons
5. **Performance Metrics**: Add detailed aim analytics and heatmaps
