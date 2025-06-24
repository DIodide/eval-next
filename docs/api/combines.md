# Combines Router Documentation

The Combines Router handles all combine-related operations in the API. This router provides both public and protected endpoints, with database retry logic for improved reliability. It supports combine browsing, registration management, and coach administration features.

## Overview

The router provides functionality for:

- **Public Access**: Browsing combines, viewing details, filtering by game/criteria
- **Player Operations**: Registration management, dashboard views, status checking
- **Coach Operations**: Creating combines, managing registrations, updating statuses
- **Qualification Management**: Tracking and updating player qualification status
- **Event Management**: Full combine lifecycle from creation to completion

## Authentication & Authorization

The router uses a structured procedure-based authorization system:

- **Public Procedures**: No authentication required (`publicProcedure`)
- **Player Procedures**: Authenticated player access (`playerProcedure`)
  - Automatic authentication and player profile verification
  - Context automatically includes `playerId`
- **Onboarded Coach Procedures**: Advanced coach access (`onboardedCoachProcedure`)
  - Requires authentication + onboarded coach verification
  - Checks Clerk `sessionClaims.publicMetadata.onboarded === true` and `userType === "coach"`
  - Context automatically includes `coachId` and `schoolId`
- **Ownership Verification**: Coaches can only manage combines they organize

## Database Reliability

All database operations use the `withRetry()` wrapper to handle connection issues and improve reliability.

## Schemas

### Combine Filters Schema

```typescript
{
  game_id?: string;                 // UUID - filter by specific game
  type?: "ONLINE" | "IN_PERSON" | "HYBRID";
  status?: "UPCOMING" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "IN_PROGRESS" | "COMPLETED";
  year?: string;                    // Filter by combine year
  invite_only?: boolean;            // Filter by invitation status
  upcoming_only?: boolean;          // Only show future combines
  search?: string;                  // Search in title and description
  limit?: number;                   // Max 100, default 20
  offset?: number;                  // Pagination offset, default 0
}
```

### Combine Registration Schema

```typescript
{
  combine_id: string; // UUID - required
}
```

### Registration Status Update Schema (Coaches)

```typescript
{
  registration_id: string;          // UUID - required
  status: "PENDING" | "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED";
  qualified?: boolean;              // Optional qualification flag
}
```

### Combine Creation Schema (Coaches)

```typescript
{
  title: string;                    // Min 5, max 200 characters
  description: string;              // Min 10, max 500 characters
  long_description?: string;        // Optional extended description
  game_id: string;                  // UUID - required
  date: Date;                       // Combine date/time
  location: string;                 // Min 5, max 200 characters
  type: "ONLINE" | "IN_PERSON" | "HYBRID";
  year: string;                     // Exactly 4 characters
  max_spots: number;                // Min 1, max 1000
  prize_pool: string;               // Min 1, max 100 characters
  format?: string;                  // Optional tournament format
  requirements: string;             // Min 10, max 500 characters
  invite_only?: boolean;            // Default false
  status?: "UPCOMING" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED"; // Default "UPCOMING"
}
```

## Public Endpoints

### Query Endpoints

#### `browse`

- **Method**: Query
- **Input**: Combine Filters Schema
- **Description**: Browse and filter available combines with pagination
- **Authentication**: None required (public)
- **Returns**:
  ```typescript
  {
    combines: CombineWithRelations[];
    total: number;
    hasMore: boolean;
  }
  ```
- **Features**:
  - Advanced filtering by game, type, status, year, invite status
  - Text search in title and description
  - Pagination support
  - Ordered by date (ascending) then creation date (descending)
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch combines

#### `getByGame`

- **Method**: Query
- **Input**: `{ game_id: string; limit?: number }`
- **Description**: Get upcoming combines for a specific game
- **Authentication**: None required (public)
- **Returns**: Array of combine objects with game and organizer info
- **Features**:
  - Only returns upcoming combines (date >= now)
  - Ordered by date (ascending)
  - Includes registration count
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch combines by game

#### `getById`

- **Method**: Query
- **Input**: `{ id: string }`
- **Description**: Get detailed combine information
- **Authentication**: Optional (enhanced data for authenticated users)
- **Returns**: Complete combine object with game and organizer details
- **Features**:
  - Public: Basic combine info, game details, organizer name
  - Authenticated: Includes registration list with player details
  - Registration data ordered by registration date
- **Error Codes**:
  - `NOT_FOUND`: Combine not found
  - `INTERNAL_SERVER_ERROR`: Failed to fetch combine details

## Player Protected Endpoints

### Query Endpoints

#### `getPlayerRegistrations`

- **Method**: Query
- **Input**: `{ status?: "upcoming" | "past" | "all"; limit?: number }`
- **Description**: Get player's combine registrations for dashboard
- **Authentication**: Player required
- **Returns**: Array of registration objects with combine and game details
- **Features**:
  - Filter by upcoming, past, or all registrations
  - Includes qualification status
  - Ordered by combine date (past = descending, others = ascending)
- **Error Codes**:
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player
  - `INTERNAL_SERVER_ERROR`: Failed to fetch registrations

#### `getRegistrationStatus`

- **Method**: Query
- **Input**: `{ combine_id: string }`
- **Description**: Check player's registration status for specific combine
- **Authentication**: Player required
- **Returns**: Registration object with status, qualification, and timestamp
- **Error Codes**:
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player
  - `INTERNAL_SERVER_ERROR`: Failed to fetch registration status

### Mutation Endpoints

#### `register`

- **Method**: Mutation
- **Input**: Combine Registration Schema
- **Description**: Register player for a combine with comprehensive validation
- **Authentication**: Player required
- **Returns**: Created registration with combine and game details
- **Validation Checks**:
  - Combine exists and is valid
  - Combine hasn't occurred yet
  - Registration is open (`REGISTRATION_OPEN` status)
  - Not invitation-only (for public registration)
  - Spots available (`registered_spots < max_spots`)
  - Player not already registered
- **Features**:
  - Atomic transaction (registration + spot count update)
  - Automatic spot counting
  - Status set to `PENDING` by default
- **Error Codes**:
  - `NOT_FOUND`: Combine not found
  - `BAD_REQUEST`: Various validation failures (past event, closed registration, full, already registered, invite-only)
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player
  - `INTERNAL_SERVER_ERROR`: Failed to register

#### `cancelRegistration`

- **Method**: Mutation
- **Input**: `{ registration_id: string }`
- **Description**: Cancel player's combine registration
- **Authentication**: Player required (must own registration)
- **Returns**: `{ success: true }`
- **Validation Checks**:
  - Registration exists and belongs to player
  - Combine hasn't occurred yet
  - Combine not currently in progress
- **Features**:
  - Atomic transaction (status update + spot count adjustment)
  - Automatic spot reclamation
  - Ownership verification
- **Error Codes**:
  - `NOT_FOUND`: Registration not found
  - `FORBIDDEN`: Not your registration
  - `BAD_REQUEST`: Past combine or in progress
  - `UNAUTHORIZED`: User not authenticated
  - `INTERNAL_SERVER_ERROR`: Failed to cancel registration

## Onboarded Coach Endpoints

### Mutation Endpoints

#### `create`

- **Method**: Mutation
- **Input**: Combine Creation Schema
- **Description**: Create a new combine event
- **Authentication**: Onboarded coach required
- **Returns**: Created combine with game and organizer details
- **Features**:
  - Automatic assignment of organizing coach
  - Initializes `registered_spots` to 0
  - Comprehensive input validation
- **Error Codes**:
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an onboarded coach
  - `INTERNAL_SERVER_ERROR`: Failed to create combine

#### `updateStatus`

- **Method**: Mutation
- **Input**: `{ combine_id: string; status: CombineStatus }`
- **Description**: Update combine status (lifecycle management)
- **Authentication**: Onboarded coach required (must own combine)
- **Returns**: Updated combine with relations
- **Status Transitions**:
  - `UPCOMING` → `REGISTRATION_OPEN`
  - `REGISTRATION_OPEN` → `REGISTRATION_CLOSED`
  - `REGISTRATION_CLOSED` → `IN_PROGRESS`
  - `IN_PROGRESS` → `COMPLETED`
- **Features**:
  - Ownership verification
  - Status lifecycle management
- **Error Codes**:
  - `NOT_FOUND`: Combine not found
  - `FORBIDDEN`: Not your combine
  - `UNAUTHORIZED`: User not authenticated
  - `INTERNAL_SERVER_ERROR`: Failed to update status

#### `updateRegistrationStatus`

- **Method**: Mutation
- **Input**: Registration Status Update Schema
- **Description**: Manage player registration status and qualification
- **Authentication**: Onboarded coach required (must own combine)
- **Returns**: Updated registration with player details
- **Features**:
  - Update registration status (PENDING → CONFIRMED, etc.)
  - Manage qualification status
  - Ownership verification through combine relationship
  - Access to player contact information for confirmed registrations
- **Error Codes**:
  - `NOT_FOUND`: Registration not found
  - `FORBIDDEN`: Not your combine
  - `UNAUTHORIZED`: User not authenticated
  - `INTERNAL_SERVER_ERROR`: Failed to update registration

## Data Models

### Combine Object (Full)

```typescript
{
  id: string;
  title: string;
  description: string;
  long_description?: string;
  game_id: string;
  coach_id?: string;
  date: Date;
  location: string;
  type: "ONLINE" | "IN_PERSON" | "HYBRID";
  year: string;
  max_spots: number;
  registered_spots: number;
  prize_pool: string;
  format?: string;
  status: "UPCOMING" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "IN_PROGRESS" | "COMPLETED";
  requirements: string;
  invite_only: boolean;
  created_at: Date;
  updated_at: Date;

  // Relations
  game: {
    id: string;
    name: string;
    short_name: string;
    icon?: string;
    color?: string;
  };
  organizer?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  registrations?: CombineRegistration[]; // Only for authenticated users
  _count: {
    registrations: number;
  };
}
```

### Combine Registration Object

```typescript
{
  id: string;
  combine_id: string;
  player_id: string;
  status: "PENDING" | "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED";
  qualified: boolean;
  registered_at: Date;

  // Relations
  combine: CombineObject;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string; // Only for coach operations
  };
}
```

## Performance Features

### Query Optimization

1. **Selective Data Loading**: Public vs authenticated data loading
2. **Efficient Filtering**: Database-level filtering with proper indexing
3. **Pagination Support**: Offset-based pagination for large datasets
4. **Relation Management**: Minimal relation loading based on use case
5. **Spot Counting**: Efficient aggregation queries for availability

### Caching Recommendations

- **Public Browse**: Cache for 5-10 minutes (data changes infrequently)
- **Game-specific**: Cache for 5 minutes (moderate change frequency)
- **Individual Combines**: Cache for 2-5 minutes (registration affects availability)
- **Player Registrations**: Cache for 1-2 minutes (user-specific, changes frequently)

## Usage Examples

### Public Usage

```typescript
// Browse all combines with filtering
const combinesData = await trpc.combines.browse.query({
  game_id: "uuid-here",
  upcoming_only: true,
  invite_only: false,
  limit: 20,
  offset: 0,
});

// Get combines for specific game
const valorantCombines = await trpc.combines.getByGame.query({
  game_id: "valorant-uuid",
  limit: 10,
});

// Get combine details
const combineDetails = await trpc.combines.getById.query({
  id: "combine-uuid",
});
```

### Player Usage

```typescript
// Check if already registered
const registrationStatus = await trpc.combines.getRegistrationStatus.query({
  combine_id: "combine-uuid",
});

// Register for combine
const registration = await trpc.combines.register.mutate({
  combine_id: "combine-uuid",
});

// View dashboard registrations
const myRegistrations = await trpc.combines.getPlayerRegistrations.query({
  status: "upcoming",
  limit: 50,
});

// Cancel registration
const result = await trpc.combines.cancelRegistration.mutate({
  registration_id: "registration-uuid",
});
```

### Coach Usage

```typescript
// Create new combine
const newCombine = await trpc.combines.create.mutate({
  title: "EVAL Spring VALORANT Combine",
  description: "Spring season combine for aspiring collegiate players",
  game_id: "valorant-uuid",
  date: new Date("2025-04-15T14:00:00Z"),
  location: "Online",
  type: "ONLINE",
  year: "2025",
  max_spots: 32,
  prize_pool: "Scholarship Opportunities",
  requirements: "All ranks welcome",
  invite_only: false,
  status: "UPCOMING",
});

// Update combine status
const updatedCombine = await trpc.combines.updateStatus.mutate({
  combine_id: "combine-uuid",
  status: "REGISTRATION_OPEN",
});

// Manage player registration
const updatedRegistration = await trpc.combines.updateRegistrationStatus.mutate(
  {
    registration_id: "registration-uuid",
    status: "CONFIRMED",
    qualified: true,
  },
);
```

## Business Logic & Rules

### Registration Rules

1. **Timing**: Can only register for future combines
2. **Status**: Registration must be open (`REGISTRATION_OPEN`)
3. **Capacity**: Must have available spots (`registered_spots < max_spots`)
4. **Access**: Public combines allow open registration, invite-only requires invitation
5. **Uniqueness**: One registration per player per combine

### Combine Lifecycle

1. **UPCOMING**: Created but registration not yet open
2. **REGISTRATION_OPEN**: Players can register
3. **REGISTRATION_CLOSED**: No new registrations accepted
4. **IN_PROGRESS**: Event is currently happening
5. **COMPLETED**: Event finished

### Qualification System

- **Default**: All registrations start as unqualified (`qualified: false`)
- **Coach Control**: Coaches can mark players as qualified based on performance
- **Status Independent**: Qualification status separate from registration status
- **Persistence**: Qualification status maintained throughout registration lifecycle

## Implementation Notes

### Database Constraints

- **Unique Registration**: Compound unique key `(combine_id, player_id)`
- **Spot Tracking**: `registered_spots` automatically managed via transactions
- **Referential Integrity**: Proper foreign key relationships maintained

### Error Handling

- **Comprehensive Validation**: All business rules enforced at API level
- **Detailed Error Messages**: Specific error messages for different failure scenarios
- **Atomic Operations**: Database transactions ensure data consistency
- **Ownership Verification**: Strict ownership checks for coach operations

### Security

- **Public Safety**: Public endpoints don't expose sensitive registration data
- **Player Privacy**: Player details only visible to organizing coaches
- **Coach Authorization**: Coaches can only manage their own combines
- **Data Segregation**: Proper data access based on user role and ownership
