# Player Profile Router Documentation

The Player Profile Router handles all player profile-related operations in the API. This router is protected and requires authentication for all endpoints.

## Overview

The router provides functionality for:

- Managing player profiles (get/update)
- Managing platform connections (add/update/remove)
- Managing social connections (add/update/remove)
- Retrieving available games for main game selection

## Authentication

All endpoints in this router use `protectedProcedure`, meaning:

- Users must be authenticated
- Users must have a valid player profile in the database
- Access is restricted to player-type users only

## Schemas

### Profile Update Schema

```typescript
{
  first_name?: string;              // Min length: 1
  last_name?: string;               // Min length: 1
  location?: string;
  bio?: string;

  // Academic Information
  school?: string;
  gpa?: number;                     // Range: 0-4.0
  class_year?: string;
  graduation_date?: string;
  intended_major?: string;

  // Recruiting Contact Information
  guardian_email?: string;          // Must be valid email or empty string
  scholastic_contact?: string;
  scholastic_contact_email?: string; // Must be valid email or empty string

  // Additional Information
  extra_curriculars?: string;
  academic_bio?: string;

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

### `getProfile`

- **Method**: Query
- **Description**: Retrieves the complete player profile including school reference, main game, platform connections, and social connections
- **Returns**: Complete player profile object
- **Error Codes**:
  - `NOT_FOUND`: Player profile doesn't exist
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### `updateProfile`

- **Method**: Mutation
- **Input**: Profile Update Schema
- **Description**: Updates player profile information
- **Returns**: Updated player profile object
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### `updatePlatformConnection`

- **Method**: Mutation
- **Input**: Platform Connection Schema
- **Description**: Adds or updates a platform connection
- **Returns**: Created/Updated platform connection
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### `updateSocialConnection`

- **Method**: Mutation
- **Input**: Social Connection Schema
- **Description**: Adds or updates a social connection
- **Returns**: Created/Updated social connection
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### `removePlatformConnection`

- **Method**: Mutation
- **Input**: `{ platform: PlatformType }`
- **Description**: Removes a platform connection
- **Returns**: `{ success: true }`
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to remove connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### `removeSocialConnection`

- **Method**: Mutation
- **Input**: `{ platform: SocialPlatformType }`
- **Description**: Removes a social connection
- **Returns**: `{ success: true }`
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to remove connection
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### `getAvailableGames`

- **Method**: Query
- **Description**: Retrieves all available games for main game selection
- **Returns**: Array of game objects containing id, name, short_name, icon, and color
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch games
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

## Usage Example

```typescript
// Get player profile
const profile = await trpc.playerProfile.getProfile.query();

// Update profile
const updatedProfile = await trpc.playerProfile.updateProfile.mutate({
  first_name: "John",
  last_name: "Doe",
  school: "University of Gaming",
});

// Add platform connection
const platformConnection =
  await trpc.playerProfile.updatePlatformConnection.mutate({
    platform: "steam",
    username: "gamername",
  });

// Remove social connection
const result = await trpc.playerProfile.removeSocialConnection.mutate({
  platform: "twitter",
});

// Get available games
const games = await trpc.playerProfile.getAvailableGames.query();
```
