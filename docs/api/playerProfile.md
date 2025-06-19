# Player Profile API Documentation

## Overview

The Player Profile router provides comprehensive endpoints for managing player profiles, connections, and game preferences. All player-specific endpoints use `playerProcedure` which automatically verifies the user is authenticated as a player and provides `playerId` in the context.

## Authentication & Authorization

- **Player Endpoints**: Use `playerProcedure` - automatically verifies user is logged in and has a player profile
- **Public Endpoints**: Use `publicProcedure` - accessible to all users
- **Coach-Only Endpoints**: Use `onboardedCoachProcedure` - restricted to verified coaches

## Endpoints

### Player Profile Management

#### `getProfile`

**Type**: Query  
**Auth**: Player required  
**Description**: Get complete player profile with all related data

**Response**:

```typescript
{
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  image_url?: string;
  location?: string;
  bio?: string;
  school?: string;
  class_year?: string;
  gpa?: number;
  graduation_date?: string;
  main_game_id?: string;
  created_at: Date;
  updated_at: Date;
  school_ref?: {
    id: string;
    name: string;
    type: string;
    location: string;
    state: string;
  };
  main_game?: {
    id: string;
    name: string;
    short_name: string;
    icon?: string;
    color?: string;
  };
  platform_connections: Array<{
    platform: string;
    username: string;
    connected: boolean;
    updated_at: Date;
  }>;
  social_connections: Array<{
    platform: string;
    username: string;
    connected: boolean;
    updated_at: Date;
  }>;
}
```

#### `getBasicProfile`

**Type**: Query  
**Auth**: Player required  
**Description**: Get basic profile information only (optimized for faster loading)

**Response**:

```typescript
{
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username?: string;
  location?: string;
  bio?: string;
  school?: string;
  class_year?: string;
  gpa?: number;
  graduation_date?: string;
  main_game_id?: string;
  created_at: Date;
  updated_at: Date;
}
```

#### `getConnections`

**Type**: Query  
**Auth**: Player required  
**Description**: Get platform and social connections only (optimized for connection management)

**Response**:

```typescript
{
  platform_connections: Array<{
    platform: string;
    username: string;
    connected: boolean;
    updated_at: Date;
  }>;
  social_connections: Array<{
    platform: string;
    username: string;
    connected: boolean;
    updated_at: Date;
  }>;
}
```

#### `getRecruitingInfo`

**Type**: Query  
**Auth**: Player required  
**Description**: Get recruiting-specific information (academic details, contact info)

**Response**:

```typescript
{
  school?: string;
  school_id?: string;
  gpa?: number;
  class_year?: string;
  graduation_date?: string;
  intended_major?: string;
  guardian_email?: string;
  scholastic_contact?: string;
  scholastic_contact_email?: string;
  extra_curriculars?: string;
  academic_bio?: string;
  main_game_id?: string;
  school_ref?: {
    id: string;
    name: string;
    type: string;
    location: string;
    state: string;
  };
  main_game?: {
    id: string;
    name: string;
    short_name: string;
    icon?: string;
    color?: string;
  };
}
```

#### `updateProfile`

**Type**: Mutation  
**Auth**: Player required  
**Description**: Update player profile information

**Input**:

```typescript
{
  // Basic profile information
  first_name?: string;
  last_name?: string;
  username?: string;
  location?: string;
  bio?: string;

  // Academic/School information
  school?: string;
  gpa?: number; // 0.0 to 4.0
  class_year?: string;
  graduation_date?: string;
  intended_major?: string;

  // Contact information
  guardian_email?: string; // Valid email format
  scholastic_contact?: string;
  scholastic_contact_email?: string; // Valid email format
  extra_curriculars?: string;
  academic_bio?: string;

  // Main game selection
  main_game_id?: string; // UUID
}
```

**Response**: Updated player profile with school_ref and main_game relations

### Platform & Social Connections

#### `updatePlatformConnection`

**Type**: Mutation  
**Auth**: Player required  
**Description**: Add or update a gaming platform connection

**Input**:

```typescript
{
  platform: "steam" | "valorant" | "battlenet" | "epicgames" | "startgg";
  username: string; // Minimum 3 characters
}
```

**Response**: Updated platform connection object

#### `updateSocialConnection`

**Type**: Mutation  
**Auth**: Player required  
**Description**: Add or update a social media connection

**Input**:

```typescript
{
  platform: "github" | "discord" | "instagram" | "twitch" | "x";
  username: string; // Minimum 3 characters
}
```

**Response**: Updated social connection object

#### `removePlatformConnection`

**Type**: Mutation  
**Auth**: Player required  
**Description**: Remove a gaming platform connection

**Input**:

```typescript
{
  platform: "steam" | "valorant" | "battlenet" | "epicgames" | "startgg";
}
```

**Response**: `{ success: true }`

#### `removeSocialConnection`

**Type**: Mutation  
**Auth**: Player required  
**Description**: Remove a social media connection

**Input**:

```typescript
{
  platform: "github" | "discord" | "instagram" | "twitch" | "x";
}
```

**Response**: `{ success: true }`

### Public Endpoints

#### `getAvailableGames`

**Type**: Query  
**Auth**: Public  
**Description**: Get list of all available games for main game selection

**Response**:

```typescript
Array<{
  id: string;
  name: string;
  short_name: string;
  icon?: string;
  color?: string;
}>;
```

#### `getPublicProfile`

**Type**: Query  
**Auth**: Public  
**Description**: Get public player profile by username (cached for 5 minutes)

**Input**:

```typescript
{
  username: string;
}
```

**Response**: Public profile data (excludes sensitive information like GPA, contact details)

#### `getPublicRecruitingInfo`

**Type**: Query  
**Auth**: Onboarded Coach only  
**Description**: Get recruiting information for a player (coaches only)

**Input**:

```typescript
{
  username: string;
}
```

**Response**:

```typescript
{
  gpa?: number;
  graduation_date?: string;
  intended_major?: string;
  guardian_email?: string;
  scholastic_contact?: string;
  scholastic_contact_email?: string;
  extra_curriculars?: string;
  academic_bio?: string;
}
```

## Architecture Notes

### Context Enhancement

- **playerProcedure**: Automatically provides `playerId` and verified `userId` in context
- No manual verification needed - `ctx.playerId` and `ctx.auth.userId!` are safe to use
- Automatic error handling for invalid/missing player profiles

### Performance Optimizations

- **Caching**: Public profiles cached for 5 minutes with automatic invalidation
- **Selective Queries**: Separate endpoints for different data subsets (basic, connections, recruiting)
- **Database Retries**: All queries wrapped with retry logic for reliability

### Cache Management

- Public profiles automatically cached and invalidated on username changes
- Memory-based LRU cache with TTL support
- Automatic cleanup of expired entries

### Error Handling

- Consistent error responses with appropriate HTTP status codes
- Automatic retry logic for database operations
- Input validation with detailed error messages

## Migration Notes

### Changes from Previous Version

- ✅ Removed ~50 lines of duplicate `verifyPlayerUser` function
- ✅ All player endpoints now use `playerProcedure` instead of `protectedProcedure`
- ✅ Automatic context enhancement with `playerId`
- ✅ Simplified error handling and verification logic
- ✅ Maintained all existing functionality and API contracts

### Benefits

- **Reduced Code Duplication**: Eliminated manual verification across 9 endpoints
- **Type Safety**: Enhanced context types with guaranteed `playerId`
- **Consistency**: Standardized authorization pattern across all player endpoints
- **Maintainability**: Centralized player verification logic in middleware

## Usage Examples

### Frontend Integration

```typescript
// Get player profile
const profile = await api.playerProfile.getProfile.query();

// Update profile
await api.playerProfile.updateProfile.mutate({
  first_name: "John",
  bio: "Aspiring esports professional",
});

// Add platform connection
await api.playerProfile.updatePlatformConnection.mutate({
  platform: "steam",
  username: "player123",
});

// Get public profile (no auth required)
const publicProfile = await api.playerProfile.getPublicProfile.query({
  username: "player123",
});
```

### Error Handling

All endpoints follow consistent error patterns:

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User not a player (handled by playerProcedure)
- `NOT_FOUND`: Profile/resource not found
- `BAD_REQUEST`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Database or system errors
