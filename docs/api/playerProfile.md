# Player Profile Router Documentation

The Player Profile Router handles all player profile-related operations in the API. This router is protected and requires authentication for all endpoints, with database retry logic for improved reliability.

## Overview

The router provides functionality for:

- Managing player profiles (get/update with optimized queries)
- Managing platform connections (add/update/remove)
- Managing social connections (add/update/remove)
- Retrieving available games for main game selection
- Optimized data fetching for specific use cases

## Authentication & Authorization

All endpoints in this router use `protectedProcedure` with additional player verification:

- Users must be authenticated via Clerk
- Users must have a valid player profile in the database
- Access is restricted to player-type users only
- Each request verifies the user is a player and retrieves their player ID

## Database Reliability

All database operations use the `withRetry()` wrapper to handle connection issues and improve reliability.

## Schemas

### Profile Update Schema

```typescript
{
  // Basic profile information
  first_name?: string;              // Min length: 1
  last_name?: string;               // Min length: 1
  location?: string;
  bio?: string;

  // Academic/School information
  school?: string;
  gpa?: number;                     // Range: 0-4.0
  class_year?: string;
  graduation_date?: string;
  intended_major?: string;

  // Recruiting contact information
  guardian_email?: string;          // Must be valid email or empty string
  scholastic_contact?: string;
  scholastic_contact_email?: string; // Must be valid email or empty string

  // Additional recruiting information
  extra_curriculars?: string;
  academic_bio?: string;

  // Main game preference
  main_game_id?: string;           // Must be valid UUID
}
```

### Platform Connection Schema

```typescript
{
  platform: "steam" | "valorant" | "battlenet" | "epicgames" | "startgg";
  username: string; // Min length: 3
}
```

### Social Connection Schema

```typescript
{
  platform: "github" | "discord" | "instagram" | "twitch" | "x";
  username: string; // Min length: 3
}
```

## Endpoints

### Query Endpoints

#### `getProfile`

- **Method**: Query
- **Description**: Retrieves the complete player profile including school reference, main game, platform connections, and social connections
- **Returns**: Complete player profile object with all relations
- **Performance**: Full profile load - use for initial profile page load
- **Error Codes**:
  - `NOT_FOUND`: Player profile doesn't exist
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player
  - `INTERNAL_SERVER_ERROR`: Database error

#### `getBasicProfile` ✨ _New Optimized Endpoint_

- **Method**: Query
- **Description**: Retrieves only basic player information without relations
- **Returns**: Basic player data (id, names, email, username, location, bio, school info, etc.)
- **Performance**: Fast loading for basic profile information
- **Use Case**: When you only need core profile data without connections
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Database error
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `getConnections` ✨ _New Optimized Endpoint_

- **Method**: Query
- **Description**: Retrieves only platform and social connections
- **Returns**: Object with `platform_connections` and `social_connections` arrays
- **Performance**: Optimized for connection management interfaces
- **Use Case**: When you only need to display/manage connections
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Database error
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `getRecruitingInfo` ✨ _New Optimized Endpoint_

- **Method**: Query
- **Description**: Retrieves recruiting-specific information including school and game references
- **Returns**: Recruiting data with school_ref and main_game relations
- **Performance**: Optimized for recruiting/academic information display
- **Use Case**: For recruiting forms and college scout interfaces
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Database error
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `getAvailableGames`

- **Method**: Query
- **Description**: Retrieves all available games for main game selection
- **Returns**: Array of game objects containing id, name, short_name, icon, and color
- **Performance**: Sorted alphabetically by name
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch games
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### Mutation Endpoints

#### `updateProfile`

- **Method**: Mutation
- **Input**: Profile Update Schema
- **Description**: Updates player profile information with automatic timestamp update
- **Returns**: Updated player profile object with all relations
- **Validation**: Email validation for contact fields, GPA range validation
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `updatePlatformConnection`

- **Method**: Mutation
- **Input**: Platform Connection Schema
- **Description**: Adds or updates a platform connection using upsert operation
- **Returns**: Created/Updated platform connection
- **Behavior**: Uses compound unique constraint (player_id + platform)
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `updateSocialConnection`

- **Method**: Mutation
- **Input**: Social Connection Schema
- **Description**: Adds or updates a social connection using upsert operation
- **Returns**: Created/Updated social connection
- **Behavior**: Uses compound unique constraint (player_id + platform)
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `removePlatformConnection`

- **Method**: Mutation
- **Input**: `{ platform: PlatformType }`
- **Description**: Removes a platform connection completely
- **Returns**: `{ success: true }`
- **Behavior**: Uses compound unique constraint for deletion
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to remove connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `removeSocialConnection`

- **Method**: Mutation
- **Input**: `{ platform: SocialPlatformType }`
- **Description**: Removes a social connection completely
- **Returns**: `{ success: true }`
- **Behavior**: Uses compound unique constraint for deletion
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to remove connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

## Performance Optimizations

### Query Optimization Strategies

1. **Selective Data Loading**: Use specific endpoints for different use cases

   - `getBasicProfile` for basic info
   - `getConnections` for connection management
   - `getRecruitingInfo` for recruiting data
   - `getProfile` for complete profile

2. **Database Retry Logic**: All operations wrapped with `withRetry()` for reliability

3. **Proper Indexing**: Compound unique constraints optimize connection queries

4. **Minimal Data Transfer**: Each optimized endpoint only returns necessary fields

## Usage Examples

```typescript
// Get complete profile (use sparingly)
const fullProfile = await trpc.playerProfile.getProfile.query();

// Get only basic info (faster)
const basicInfo = await trpc.playerProfile.getBasicProfile.query();

// Get only connections for management interface
const connections = await trpc.playerProfile.getConnections.query();

// Get recruiting info for forms
const recruitingData = await trpc.playerProfile.getRecruitingInfo.query();

// Update profile
const updatedProfile = await trpc.playerProfile.updateProfile.mutate({
  first_name: "John",
  last_name: "Doe",
  school: "University of Gaming",
  gpa: 3.8,
  guardian_email: "parent@example.com",
});

// Add platform connection
const platformConnection =
  await trpc.playerProfile.updatePlatformConnection.mutate({
    platform: "steam",
    username: "gamername123",
  });

// Add social connection
const socialConnection = await trpc.playerProfile.updateSocialConnection.mutate(
  {
    platform: "discord",
    username: "username#1234",
  },
);

// Remove connections
await trpc.playerProfile.removePlatformConnection.mutate({
  platform: "steam",
});

await trpc.playerProfile.removeSocialConnection.mutate({
  platform: "x",
});

// Get available games for selection
const games = await trpc.playerProfile.getAvailableGames.query();
```

## Implementation Notes

### Database Constraints

- Platform connections use compound unique key: `(player_id, platform)`
- Social connections use compound unique key: `(player_id, platform)`
- All timestamps are automatically managed

### Error Handling

- All database operations include comprehensive error handling
- Errors are logged on the server side
- Client receives appropriate HTTP status codes and messages
- Uses `TRPCError` for consistent error responses

### Security

- Player verification happens on every request
- User authorization checked against player database record
- No access to other players' data
- All mutations require valid player authentication
