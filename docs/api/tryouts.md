# Tryouts Router Documentation

The Tryouts Router handles all tryout-related operations in the API. This router provides functionality for both players and coaches, with protected endpoints requiring authentication and database retry logic for improved reliability.

## Overview

The router provides functionality for:

- **Players**: Browse tryouts, register/cancel registrations, view registration status and history
- **Coaches**: Create tryouts with draft mode, manage registrations, update registration status
- **Dashboard**: Optimized queries for player and coach dashboard views
- **Browse & Search**: Advanced filtering and search capabilities with status-based visibility
- **Event Management**: Complete tryout lifecycle from draft creation to completion

## Key Features

### Draft Mode Support

- Coaches can create tryouts in DRAFT status for internal planning
- Draft tryouts are not visible to players on public pages
- Coaches can edit and refine tryouts before publishing
- Two-action creation: "Save as Draft" and "Publish Tryout"

### Status-Based Visibility

- **PUBLISHED**: Visible to all users on public tryout pages
- **DRAFT**: Only visible to the creating coach in their dashboard
- **CANCELLED**: Marked as cancelled but retained for historical purposes

### School Association Requirement

- Coaches must be associated with a school to create tryouts
- API returns clear error messages when school association is missing
- Ensures proper institutional affiliation for all tryouts

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
- **Access Controls**: Users can only access appropriate resources
- **Ownership Verification**: Automatic verification for resource access

## Database Reliability

All database operations use the `withRetry()` wrapper to handle connection issues and improve reliability.

## Schemas

### Tryout Filters Schema

```typescript
{
  game_id?: string;                 // UUID - filter by specific game
  school_id?: string;               // UUID - filter by specific school
  type?: "ONLINE" | "IN_PERSON" | "HYBRID"; // Event type filter
  state?: string;                   // Filter by school state
  free_only?: boolean;              // Show only free tryouts
  upcoming_only?: boolean;          // Show only future tryouts
  search?: string;                  // Search in title, description, school name
  limit?: number;                   // Min: 1, Max: 100, Default: 20
  offset?: number;                  // Min: 0, Default: 0
}
```

### Registration Schema

```typescript
{
  tryout_id: string;                // UUID - required
  notes?: string;                   // Optional registration notes
}
```

### Tryout Creation Schema (Coaches Only)

```typescript
{
  title: string;                    // Min: 5, Max: 200 characters
  description: string;              // Min: 10, Max: 500 characters
  long_description?: string;        // Optional detailed description
  game_id: string;                  // UUID - required
  date: Date;                       // Tryout date/time
  time_start?: string;              // Start time (HH:MM format)
  time_end?: string;                // End time (HH:MM format)
  location: string;                 // Min: 5, Max: 200 characters
  type: "ONLINE" | "IN_PERSON" | "HYBRID";
  status?: "DRAFT" | "PUBLISHED";   // Default: "DRAFT"
  price: string;                    // Min: 1, Max: 50 characters
  max_spots: number;                // Min: 1, Max: 1000
  registration_deadline?: Date;     // Optional deadline
  min_gpa?: number;                 // Min: 0, Max: 4.0
  class_years?: string[];           // Array of allowed class years
  required_roles?: string[];        // Array of required game roles
}
```

### Registration Status Update Schema (Coaches Only)

```typescript
{
  registration_id: string; // UUID - required
  status: "PENDING" | "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED";
}
```

### Coach Tryouts Query Schema

```typescript
{
  status?: "all" | "active" | "upcoming" | "past" | "draft" | "published"; // Default: "all"
  limit?: number;                   // Min: 1, Max: 100, Default: 50
  offset?: number;                  // Min: 0, Default: 0
}
```

## Endpoints

### Public Query Endpoints

#### `browse`

- **Method**: Query (Public)
- **Input**: Tryout Filters Schema
- **Description**: Browse all available PUBLISHED tryouts with advanced filtering and search capabilities
- **Returns**: Object with `tryouts` array, `total` count, and `hasMore` boolean
- **Includes**: Game, school, organizer details, and registration count
- **Visibility**: Only shows PUBLISHED tryouts to public users
- **Performance**: Paginated results, optimized queries with proper indexing
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch tryouts

#### `getByGame`

- **Method**: Query (Public)
- **Input**: `{ game_id: string (UUID), limit?: number (1-50, default: 20) }`
- **Description**: Get upcoming PUBLISHED tryouts for a specific game
- **Returns**: Array of tryouts with game, school, and organizer details
- **Visibility**: Only shows PUBLISHED tryouts
- **Performance**: Only returns future tryouts, sorted by date
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch tryouts by game

#### `getById`

- **Method**: Query (Public)
- **Input**: `{ id: string (UUID) }`
- **Description**: Get detailed view of a single tryout including all registrations
- **Returns**: Complete tryout object with game, school, organizer, and registrations
- **Includes**: Registration details with player information (if authenticated)
- **Error Codes**:
  - `NOT_FOUND`: Tryout not found
  - `INTERNAL_SERVER_ERROR`: Failed to fetch tryout details

#### `getGames`

- **Method**: Query (Public)
- **Input**: None
- **Description**: Get all available games for form dropdowns and filtering
- **Returns**: Array of games with id, name, short_name, icon, and color
- **Performance**: Cached and optimized for frequent access
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch games

### Player Query Endpoints

#### `getPlayerRegistrations`

- **Method**: Query (Protected - Players Only)
- **Input**: `{ status?: "upcoming" | "past" | "all" (default: "all"), limit?: number (1-100, default: 50) }`
- **Description**: Get player's tryout registrations for dashboard view
- **Returns**: Array of registrations with complete tryout, game, school, and organizer details
- **Performance**: Optimized for dashboard display, sorted by tryout date
- **Authorization**: Player-only access with automatic player verification
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch player registrations
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `getRegistrationStatus`

- **Method**: Query (Protected - Players Only)
- **Input**: `{ tryout_id: string (UUID) }`
- **Description**: Check player's registration status for a specific tryout
- **Returns**: Registration object with status, date, and notes, or null if not registered
- **Authorization**: Player-only access, returns only own registration
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch registration status
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

### Player Mutation Endpoints

#### `register`

- **Method**: Mutation (Protected - Players Only)
- **Input**: Registration Schema
- **Description**: Register for a tryout with comprehensive validation
- **Returns**: Created registration with complete tryout details
- **Validation**:
  - Tryout exists and is PUBLISHED
  - Registration deadline not passed
  - Tryout date is in the future
  - Available spots remaining
  - Player not already registered
- **Behavior**: Automatically increments `registered_spots` count
- **Authorization**: Player-only access with automatic player verification
- **Error Codes**:
  - `NOT_FOUND`: Tryout not found
  - `BAD_REQUEST`: Registration deadline passed, tryout full, already registered, or tryout occurred
  - `INTERNAL_SERVER_ERROR`: Failed to register for tryout
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a player

#### `cancelRegistration`

- **Method**: Mutation (Protected - Players Only)
- **Input**: `{ registration_id: string (UUID) }`
- **Description**: Cancel a player's tryout registration
- **Returns**: `{ success: true }`
- **Validation**:
  - Registration exists and belongs to player
  - Tryout has not already occurred
- **Behavior**: Updates status to 'CANCELLED' and decrements `registered_spots` count
- **Authorization**: Player-only access, can only cancel own registrations
- **Error Codes**:
  - `NOT_FOUND`: Registration not found
  - `BAD_REQUEST`: Cannot cancel registration for past tryout
  - `FORBIDDEN`: Cannot cancel another player's registration or user is not a player
  - `INTERNAL_SERVER_ERROR`: Failed to cancel registration
  - `UNAUTHORIZED`: User not authenticated

### Onboarded Coach Query Endpoints

#### `getCoachTryouts`

- **Method**: Query (Onboarded Coaches Only)
- **Input**: Coach Tryouts Query Schema
- **Description**: Get coach's tryouts with status filtering (includes DRAFT tryouts)
- **Returns**: Object with `tryouts` array, `total` count, and `hasMore` boolean
- **Includes**: Game, school details, registration counts, and status breakdowns
- **Status Filtering**:
  - `all`: All tryouts regardless of status or date
  - `active`: Published tryouts with future dates and open registration
  - `upcoming`: All tryouts with future dates
  - `past`: All tryouts with past dates
  - `draft`: Only DRAFT status tryouts
  - `published`: Only PUBLISHED status tryouts
- **Performance**: Optimized for coach dashboard, includes registration statistics
- **Authorization**: Onboarded coach only access, returns only own tryouts
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch coach tryouts
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an onboarded coach

#### `getTryoutApplications`

- **Method**: Query (Onboarded Coaches Only)
- **Input**: `{ tryout_id: string (UUID), status?: "all" | "pending" | "confirmed" | "declined" | "waitlisted" (default: "all") }`
- **Description**: Get detailed applications for a specific tryout
- **Returns**: Object with tryout details and applications array
- **Includes**: Complete player profiles, game profiles, platform connections
- **Authorization**: Onboarded coach only access, must own the tryout
- **Error Codes**:
  - `NOT_FOUND`: Tryout not found
  - `FORBIDDEN`: Cannot access applications for tryout you don't organize or user is not an onboarded coach
  - `INTERNAL_SERVER_ERROR`: Failed to fetch tryout applications
  - `UNAUTHORIZED`: User not authenticated

### Onboarded Coach Mutation Endpoints

#### `create`

- **Method**: Mutation (Onboarded Coaches Only)
- **Input**: Tryout Creation Schema
- **Description**: Create a new tryout with draft mode support
- **Returns**: Created tryout with complete game, school, and organizer details
- **Draft Mode**:
  - Default status is DRAFT
  - Can be created as PUBLISHED immediately
  - DRAFT tryouts not visible to players
- **Validation**:
  - Coach must be associated with a school
  - All required fields must be provided for PUBLISHED status
  - Minimal validation for DRAFT status (title only)
- **Behavior**: Automatically associates with coach's school
- **Authorization**: Onboarded coach only access with automatic school association
- **Error Codes**:
  - `BAD_REQUEST`: Coach must be associated with a school to create tryouts
  - `INTERNAL_SERVER_ERROR`: Failed to create tryout
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an onboarded coach

#### `updateRegistrationStatus`

- **Method**: Mutation (Onboarded Coaches Only)
- **Input**: Registration Status Update Schema
- **Description**: Update a player's registration status
- **Returns**: Updated registration with player details
- **Authorization**: Onboarded coach only access, must own the tryout
- **Error Codes**:
  - `NOT_FOUND`: Registration not found
  - `FORBIDDEN`: Cannot update registration for tryout you don't organize or user is not an onboarded coach
  - `INTERNAL_SERVER_ERROR`: Failed to update registration status
  - `UNAUTHORIZED`: User not authenticated

#### `removeRegistration`

- **Method**: Mutation (Onboarded Coaches Only)
- **Input**: `{ registration_id: string (UUID) }`
- **Description**: Remove a player's registration completely
- **Returns**: `{ success: true }`
- **Behavior**: Deletes registration and decrements `registered_spots` count
- **Authorization**: Onboarded coach only access, must own the tryout
- **Error Codes**:
  - `NOT_FOUND`: Registration not found
  - `FORBIDDEN`: Cannot remove registration for tryout you don't organize or user is not an onboarded coach
  - `INTERNAL_SERVER_ERROR`: Failed to remove registration
  - `UNAUTHORIZED`: User not authenticated

## Status Workflow

### Tryout Status Lifecycle

1. **DRAFT**: Initial creation state

   - Visible only to creating coach
   - Can be edited and refined
   - Not visible to players
   - Minimal validation requirements

2. **PUBLISHED**: Active state

   - Visible to all users on public pages
   - Players can register
   - Full validation requirements met
   - Cannot be reverted to DRAFT

3. **CANCELLED**: Terminated state
   - Marked as cancelled
   - Retained for historical purposes
   - No new registrations accepted

### Registration Status Lifecycle

1. **PENDING**: Initial registration state
2. **CONFIRMED**: Accepted by coach
3. **WAITLISTED**: On waiting list
4. **DECLINED**: Rejected by coach
5. **CANCELLED**: Cancelled by player or coach

## Error Handling

The router implements comprehensive error handling with specific error codes and messages:

- **Authentication Errors**: `UNAUTHORIZED` for unauthenticated requests
- **Authorization Errors**: `FORBIDDEN` for insufficient permissions
- **Validation Errors**: `BAD_REQUEST` for invalid input or business logic violations
- **Not Found Errors**: `NOT_FOUND` for missing resources
- **Server Errors**: `INTERNAL_SERVER_ERROR` for unexpected failures

All errors include descriptive messages to help with debugging and user feedback.

## Performance Considerations

- Database queries use proper indexing for optimal performance
- Pagination implemented for large result sets
- Retry logic for database reliability
- Optimized queries with selective field inclusion
- Cached game data for frequent access

## Security Features

- Role-based access control
- Resource ownership verification
- Input validation and sanitization
- SQL injection prevention through Prisma
- Rate limiting through tRPC middleware

## Testing

A comprehensive test page is available at `/test-tryouts` that includes:

- All endpoint testing with form inputs
- Real-time error display
- Mock data integration
- Authentication flow testing
- Edge case validation

The test page works with seeded mock data including:

- 5 schools across different states
- 5 mock coaches with proper school associations
- 6 diverse tryouts across all supported games
- Various event types, pricing, and requirements
