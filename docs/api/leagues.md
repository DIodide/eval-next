# Leagues Router Documentation

The Leagues Router handles all league-related operations in the API. This router provides public access to league information, team standings, player rankings, and league management functionality.

## Overview

The router provides functionality for:

- Retrieving league information with flexible filtering
- Getting detailed league data including teams, schools, and participants
- Accessing team leaderboards and standings
- Viewing player rankings within leagues
- Managing league participation and performance data

## Authentication & Authorization

All endpoints in this router use `publicProcedure`, making them accessible without authentication:

- No authentication required for any endpoint
- All league data is publicly viewable
- Supports both authenticated and anonymous access
- Ideal for public league browsing and statistics

## Database Reliability

All database operations use the `withRetry()` wrapper to handle connection issues and improve reliability.

## Input Schemas

### League Filters Schema

```typescript
{
  game_id?: string;    // UUID - Filter by specific game
  state?: string;      // Filter by state (e.g., "California", "New Jersey")
  tier?: LeagueTier;   // Filter by league tier
  status?: LeagueStatus; // Filter by current status
}
```

### League Detail Request Schema

```typescript
{
  id: string; // UUID - Required league identifier
}
```

### Leaderboard Request Schema

```typescript
{
  id: string;     // UUID - Required league identifier
  limit?: number; // Range: 1-100, Default: 10
}
```

### Top Players Request Schema

```typescript
{
  id: string;     // UUID - Required league identifier
  limit?: number; // Range: 1-100, Default: 10
}
```

## Enums

### League Tier

```typescript
enum LeagueTier {
  ELITE = "ELITE",
  PROFESSIONAL = "PROFESSIONAL",
  COMPETITIVE = "COMPETITIVE",
  DEVELOPMENTAL = "DEVELOPMENTAL",
}
```

### League Status

```typescript
enum LeagueStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  UPCOMING = "UPCOMING",
  CANCELLED = "CANCELLED",
}
```

## Endpoints

### Query Endpoints

#### `getAll`

- **Method**: Query
- **Input**: League Filters Schema (optional)
- **Description**: Retrieves all leagues with optional filtering by game, state, tier, and status
- **Returns**: Array of league objects with basic information and participant counts
- **Performance**: Optimized for league listing pages with efficient counting
- **Includes**:
  - Basic league information (name, description, season, etc.)
  - Associated game details (name, short_name, color, icon)
  - Participating schools with basic details
  - Team information with school references
  - Player participant count
- **Sorting**:
  - Primary: Status (ascending) - Active leagues first
  - Secondary: Tier (ascending) - Elite leagues first
  - Tertiary: Name (ascending) - Alphabetical
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch leagues

**Example Response**:

```typescript
[
  {
    id: "uuid",
    name: "Garden State Esports League",
    short_name: "GSE",
    description: "New Jersey's premier high school esports league",
    region: "Northeast",
    state: "New Jersey",
    season: "2024-2025",
    status: "ACTIVE",
    tier: "ELITE",
    format: "Round Robin + Playoffs",
    prize_pool: "$25,000",
    founded_year: 2020,
    game: {
      id: "uuid",
      name: "VALORANT",
      short_name: "VAL",
      color: "#FF4654",
      icon: "valorant-icon.png"
    },
    schools: [...],
    teams: [...],
    player_participants: [...]
  }
]
```

#### `getById`

- **Method**: Query
- **Input**: League Detail Request Schema
- **Description**: Retrieves comprehensive league information including all participants, teams, and recent matches
- **Returns**: Complete league object with all relations
- **Performance**: Full data load - use for league detail pages
- **Includes**:
  - Complete league information
  - Associated game details
  - All participating schools with detailed information
  - All teams with member information and current standings
  - All player participants with performance data and game profiles
  - Recent matches (last 10) with team information and scores
- **Error Codes**:
  - `NOT_FOUND`: League not found
  - `INTERNAL_SERVER_ERROR`: Failed to fetch league details

**Example Response**:

```typescript
{
  id: "uuid",
  name: "Garden State Esports League",
  short_name: "GSE",
  description: "New Jersey's premier high school esports league",
  region: "Northeast",
  state: "New Jersey",
  season: "2024-2025",
  status: "ACTIVE",
  tier: "ELITE",
  format: "Round Robin + Playoffs",
  prize_pool: "$25,000",
  founded_year: 2020,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  game: {
    id: "uuid",
    name: "VALORANT",
    short_name: "VAL",
    color: "#FF4654",
    icon: "valorant-icon.png"
  },
  schools: [
    {
      school: {
        id: "uuid",
        name: "West Essex Regional High School",
        location: "North Caldwell, NJ",
        state: "New Jersey",
        region: "Northeast",
        type: "PUBLIC",
        website: "https://westessex.org"
      },
      joined_at: "2024-01-01T00:00:00Z"
    }
  ],
  teams: [
    {
      team: {
        id: "uuid",
        name: "West Essex Valorant Team",
        school: {
          id: "uuid",
          name: "West Essex Regional High School",
          location: "North Caldwell, NJ",
          state: "New Jersey"
        },
        members: [
          {
            player: {
              id: "uuid",
              username: "ValorantPro",
              first_name: "Unknown",
              last_name: "Unknown"
            },
            role: "DUELIST",
            active: true
          }
        ]
      },
      wins: 15,
      losses: 3,
      points: 1800
    }
  ],
  player_participants: [
    {
      player: {
        id: "uuid",
        username: "ValorantPro",
        first_name: "Unknown",
        last_name: "Unknown",
        school: "West Essex Regional High School",
        class_year: "2025",
        game_profiles: [
          {
            username: "ValorantPro#123",
            rank: "Immortal 2",
            rating: 2450.5,
            role: "Duelist",
            agents: ["Jett", "Reyna", "Phoenix"],
            combine_score: 1875.0,
            league_score: 1950.0
          }
        ]
      },
      eval_score: 1875.0,
      main_agent: "Jett",
      role: "Duelist",
      rank: "Immortal 2",
      wins: 15,
      losses: 3,
      games_played: 18
    }
  ],
  matches: [
    {
      id: "uuid",
      scheduled_at: "2024-03-15T19:00:00Z",
      played_at: "2024-03-15T19:30:00Z",
      status: "COMPLETED",
      team_a_score: 13,
      team_b_score: 8,
      team_a: {
        name: "West Essex Valorant Team",
        school: {
          name: "West Essex Regional High School"
        }
      },
      team_b: {
        name: "Haddon Heights Esports",
        school: {
          name: "Haddon Heights High School"
        }
      }
    }
  ]
}
```

#### `getLeaderboard`

- **Method**: Query
- **Input**: Leaderboard Request Schema
- **Description**: Retrieves team rankings and standings for a specific league
- **Returns**: Array of team standings with performance metrics
- **Performance**: Optimized for leaderboard display with team member information
- **Sorting**:
  - Primary: Points (descending) - Highest points first
  - Secondary: Wins (descending) - Most wins first
  - Tertiary: Losses (ascending) - Fewest losses first
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch league leaderboard

**Example Response**:

```typescript
[
  {
    rank: 1,
    team_id: "uuid",
    team_name: "West Essex Valorant Team",
    school_name: "West Essex Regional High School",
    school_location: "North Caldwell, NJ",
    wins: 15,
    losses: 3,
    points: 1800,
    members: [
      {
        player: {
          id: "uuid",
          username: "ValorantPro",
          first_name: "Unknown",
          last_name: "Unknown",
        },
        role: "DUELIST",
      },
    ],
  },
];
```

#### `getTopPlayers`

- **Method**: Query
- **Input**: Top Players Request Schema
- **Description**: Retrieves player rankings within a specific league based on EVAL scores
- **Returns**: Array of player rankings with performance data
- **Performance**: Optimized for player leaderboard display with game profile information
- **Sorting**: EVAL score (descending) - Highest performing players first
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch top players

**Example Response**:

```typescript
[
  {
    rank: 1,
    player_id: "uuid",
    username: "ValorantPro",
    first_name: "Unknown",
    last_name: "Unknown",
    school: "West Essex Regional High School",
    class_year: "2025",
    eval_score: 1875.0,
    main_agent: "Jett",
    role: "Duelist",
    wins: 15,
    losses: 3,
    games_played: 18,
    game_profile: {
      username: "ValorantPro#123",
      rank: "Immortal 2",
      rating: 2450.5,
      role: "Duelist",
      agents: ["Jett", "Reyna", "Phoenix"],
      combine_score: 1875.0,
      league_score: 1950.0,
    },
  },
];
```

## Data Models

### League Model Relations

The leagues router leverages the following Prisma model relationships:

- **League** -> **Game**: Each league is associated with one game
- **League** -> **LeagueSchool[]**: Many-to-many relationship with schools
- **League** -> **LeagueTeam[]**: Many-to-many relationship with teams
- **League** -> **PlayerLeague[]**: Many-to-many relationship with players
- **League** -> **Match[]**: One-to-many relationship with matches

### Performance Considerations

#### Optimized Queries

1. **getAll**: Uses selective includes to minimize data transfer while providing essential information
2. **getById**: Comprehensive but limited recent matches to last 10 for performance
3. **getLeaderboard**: Includes only active team members (max 5 per team) to reduce payload
4. **getTopPlayers**: Includes only the first game profile per player for display

#### Database Indexing

The router benefits from these database indexes:

- League status, tier, and name for efficient filtering and sorting
- League participants by EVAL score for player rankings
- Team standings by points, wins, and losses for leaderboards
- Match scheduling and completion dates for recent matches

## Use Cases

### Public League Discovery

```typescript
// Get all active VALORANT leagues
const activeValorantLeagues = await trpc.leagues.getAll.query({
  status: "ACTIVE",
  game_id: "valorant-game-uuid",
});

// Get leagues in a specific state
const newJerseyLeagues = await trpc.leagues.getAll.query({
  state: "New Jersey",
});

// Get elite tier leagues only
const eliteLeagues = await trpc.leagues.getAll.query({
  tier: "ELITE",
});
```

### League Detail Pages

```typescript
// Get complete league information
const leagueDetails = await trpc.leagues.getById.query({
  id: "league-uuid",
});

// Display schools, teams, players, and recent matches
console.log(leagueDetails.schools.length, "participating schools");
console.log(leagueDetails.teams.length, "competing teams");
console.log(leagueDetails.player_participants.length, "registered players");
console.log(leagueDetails.matches.length, "recent matches");
```

### Team Standings

```typescript
// Get top 20 teams in league
const teamStandings = await trpc.leagues.getLeaderboard.query({
  id: "league-uuid",
  limit: 20,
});

// Display current season standings
teamStandings.forEach((team) => {
  console.log(
    `${team.rank}. ${team.team_name} - ${team.wins}W-${team.losses}L (${team.points} pts)`,
  );
});
```

### Player Rankings

```typescript
// Get top 50 players in league
const topPlayers = await trpc.leagues.getTopPlayers.query({
  id: "league-uuid",
  limit: 50,
});

// Display player leaderboard
topPlayers.forEach((player) => {
  console.log(
    `${player.rank}. ${player.username} - EVAL: ${player.eval_score} (${player.wins}W-${player.losses}L)`,
  );
});
```

## Error Handling

### Common Error Patterns

```typescript
try {
  const league = await trpc.leagues.getById.query({ id: "invalid-uuid" });
} catch (error) {
  if (error.code === "NOT_FOUND") {
    // Handle league not found
    console.log("League does not exist");
  } else if (error.code === "INTERNAL_SERVER_ERROR") {
    // Handle database/server errors
    console.log("Server error occurred");
  }
}
```

### Retry Logic

All database operations use the `withRetry()` wrapper that automatically retries failed operations, making the API more resilient to temporary database connection issues.

## Integration Examples

### React Components

```typescript
// League listing component
function LeaguesList() {
  const { data: leagues, isLoading, error } = api.leagues.getAll.useQuery({
    status: "ACTIVE"
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {leagues.map(league => (
        <LeagueCard key={league.id} league={league} />
      ))}
    </div>
  );
}

// League detail component
function LeagueDetail({ leagueId }: { leagueId: string }) {
  const { data: league } = api.leagues.getById.useQuery({ id: leagueId });
  const { data: leaderboard } = api.leagues.getLeaderboard.useQuery({
    id: leagueId,
    limit: 10
  });
  const { data: topPlayers } = api.leagues.getTopPlayers.useQuery({
    id: leagueId,
    limit: 10
  });

  return (
    <div>
      <h1>{league?.name}</h1>
      <TeamStandings teams={leaderboard} />
      <PlayerRankings players={topPlayers} />
    </div>
  );
}
```

### Next.js Server Components

```typescript
// Server-side rendering
async function LeagueSSR({ params }: { params: { id: string } }) {
  const league = await api.leagues.getById.query({ id: params.id });

  return (
    <div>
      <h1>{league.name}</h1>
      <p>{league.description}</p>
      {/* Render league details */}
    </div>
  );
}
```

## Security & Privacy

### Public Data Policy

- All league information is considered public data
- Player usernames and basic game statistics are publicly viewable
- Personal information (emails, real names) is filtered out for privacy
- School information is limited to public details (name, location, type)

### Rate Limiting

While no authentication is required, consider implementing rate limiting for:

- Frequent league listing requests
- Bulk leaderboard requests
- Rapid-fire player ranking queries

## Performance Monitoring

### Key Metrics to Monitor

1. **Response Times**: Track query performance for each endpoint
2. **Database Load**: Monitor database query complexity and execution time
3. **Cache Hit Rates**: Consider implementing caching for frequently accessed leagues
4. **Error Rates**: Track `NOT_FOUND` vs `INTERNAL_SERVER_ERROR` rates

### Recommended Optimizations

1. **Caching**: Implement Redis caching for popular leagues and leaderboards
2. **Pagination**: Consider adding pagination to `getAll` for large datasets
3. **CDN**: Use CDN for league images and static assets
4. **Database**: Ensure proper indexing on frequently queried fields

## Future Enhancements

### Planned Features

1. **League Statistics**: Aggregate statistics across all leagues
2. **Historical Data**: Access to past seasons and archived leagues
3. **League Search**: Full-text search across league names and descriptions
4. **League Comparison**: Compare multiple leagues side-by-side
5. **Export Functionality**: Export league data in various formats (CSV, JSON)

### API Versioning

Future breaking changes will be handled through API versioning:

- Current version: `v1` (implicit)
- Future versions: `v2`, `v3`, etc.
- Backward compatibility maintained for at least one major version
