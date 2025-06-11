# Tryouts Router Documentation

The Tryouts Router handles all tryout-related operations in the API. This router provides functionality for both players and coaches, with protected endpoints requiring authentication and database retry logic for improved reliability.

## Overview

The router provides functionality for:

- **Players**: Browse tryouts, register/cancel registrations, view registration status and history
- **Coaches**: Create tryouts, manage registrations, update registration status
- **Dashboard**: Optimized queries for player dashboard views
- **Browse & Search**: Advanced filtering and search capabilities
- **Event Management**: Complete tryout lifecycle from creation to completion

## Authentication & Authorization

All endpoints in this router use `protectedProcedure` with role-specific verification:

- Users must be authenticated via Clerk
- **Player endpoints** require valid player profile verification
- **Coach endpoints** require valid coach profile verification
- Access controls ensure users can only access appropriate resources
- Registration ownership verification for mutations

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

## Endpoints

### Player Query Endpoints

#### `browse`

- **Method**: Query
- **Input**: Tryout Filters Schema
- **Description**: Browse all available tryouts with advanced filtering and search capabilities
- **Returns**: Object with `tryouts` array, `total` count, and `hasMore` boolean
- **Includes**: Game, school, organizer details, and registration count
- **Performance**: Paginated results, optimized queries with proper indexing
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch tryouts
  - `UNAUTHORIZED`: User not authenticated

#### `getByGame`

- **Method**: Query
- **Input**: `{ game_id: string (UUID), limit?: number (1-50, default: 20) }`
- **Description**: Get upcoming tryouts for a specific game
- **Returns**: Array of tryouts with game, school, and organizer details
- **Performance**: Only returns future tryouts, sorted by date
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch tryouts by game
  - `UNAUTHORIZED`: User not authenticated

#### `getById`

- **Method**: Query
- **Input**: `{ id: string (UUID) }`
- **Description**: Get detailed view of a single tryout including all registrations
- **Returns**: Complete tryout object with game, school, organizer, and registrations
- **Includes**: Registration details with player information
- **Error Codes**:
  - `NOT_FOUND`: Tryout not found
  - `INTERNAL_SERVER_ERROR`: Failed to fetch tryout details
  - `UNAUTHORIZED`: User not authenticated

#### `getPlayerRegistrations`

- **Method**: Query
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

- **Method**: Query
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

- **Method**: Mutation
- **Input**: Registration Schema
- **Description**: Register for a tryout with comprehensive validation
- **Returns**: Created registration with complete tryout details
- **Validation**:
  - Tryout exists and is open for registration
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

- **Method**: Mutation
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

### Coach Query Endpoints

All player query endpoints are also available to coaches for managing their tryouts.

### Coach Mutation Endpoints

#### `create`

- **Method**: Mutation
- **Input**: Tryout Creation Schema
- **Description**: Create a new tryout (coaches only)
- **Returns**: Created tryout with game, school, and organizer details
- **Validation**:
  - Coach must be associated with a school
  - All required fields validated
- **Behavior**: Automatically sets `registered_spots` to 0 and assigns school/coach
- **Authorization**: Coach-only access with automatic coach and school verification
- **Error Codes**:
  - `BAD_REQUEST`: Coach must be associated with a school
  - `INTERNAL_SERVER_ERROR`: Failed to create tryout
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `updateRegistrationStatus`

- **Method**: Mutation
- **Input**: Registration Status Update Schema
- **Description**: Update a player's registration status (coaches only)
- **Returns**: Updated registration with player details
- **Validation**:
  - Registration exists
  - Coach owns the tryout
- **Authorization**: Coach-only access, can only update registrations for own tryouts
- **Error Codes**:
  - `NOT_FOUND`: Registration not found
  - `FORBIDDEN`: Cannot update registration for tryout you don't organize or user is not a coach
  - `INTERNAL_SERVER_ERROR`: Failed to update registration status
  - `UNAUTHORIZED`: User not authenticated

## Performance Optimizations

### Query Optimization Strategies

1. **Efficient Filtering**: Optimized database queries with proper indexing

   - Game, school, and date filters use indexed columns
   - Search functionality uses efficient text search
   - Pagination reduces data transfer

2. **Selective Data Loading**: Each endpoint returns only necessary data

   - Browse includes summary information
   - GetById includes complete details when needed
   - Player registrations optimized for dashboard display

3. **Database Retry Logic**: All operations wrapped with `withRetry()` for reliability

4. **Proper Relationships**: Optimized joins reduce N+1 query problems

5. **Smart Defaults**: Reasonable defaults for limits and filters

## Usage Examples

### Player Operations

```typescript
// Browse tryouts with filters
const tryouts = await trpc.tryouts.browse.query({
  game_id: "valorant-game-uuid",
  type: "ONLINE",
  free_only: true,
  upcoming_only: true,
  search: "university",
  limit: 20,
  offset: 0,
});

// Get tryouts for specific game
const valorantTryouts = await trpc.tryouts.getByGame.query({
  game_id: "valorant-game-uuid",
  limit: 10,
});

// Get detailed tryout information
const tryoutDetails = await trpc.tryouts.getById.query({
  id: "tryout-uuid",
});

// Get player's registrations for dashboard
const myRegistrations = await trpc.tryouts.getPlayerRegistrations.query({
  status: "upcoming",
  limit: 20,
});

// Check registration status for specific tryout
const registrationStatus = await trpc.tryouts.getRegistrationStatus.query({
  tryout_id: "tryout-uuid",
});

// Register for a tryout
const registration = await trpc.tryouts.register.mutate({
  tryout_id: "tryout-uuid",
  notes: "Excited to try out! Main role is Duelist.",
});

// Cancel registration
const cancelResult = await trpc.tryouts.cancelRegistration.mutate({
  registration_id: "registration-uuid",
});
```

### Coach Operations

```typescript
// Create a new tryout
const newTryout = await trpc.tryouts.create.mutate({
  title: "VALORANT Spring Tryouts",
  description: "Looking for skilled players to join our varsity team",
  long_description:
    "Comprehensive tryouts including aim tests, strategy sessions, and scrimmages",
  game_id: "valorant-game-uuid",
  date: new Date("2024-03-15T14:00:00Z"),
  time_start: "14:00",
  time_end: "17:00",
  location: "Gaming Center Room A",
  type: "IN_PERSON",
  price: "Free",
  max_spots: 24,
  registration_deadline: new Date("2024-03-10T23:59:59Z"),
  min_gpa: 3.0,
  class_years: ["Freshman", "Sophomore", "Junior", "Senior"],
  required_roles: ["Duelist", "Controller", "Initiator", "Sentinel"],
});

// Update registration status
const updatedRegistration = await trpc.tryouts.updateRegistrationStatus.mutate({
  registration_id: "registration-uuid",
  status: "CONFIRMED",
});

// Browse all tryouts (same as players)
const allTryouts = await trpc.tryouts.browse.query({
  school_id: "my-school-uuid",
});
```

## Implementation Notes

### Database Constraints

- Registrations use compound unique key: `(tryout_id, player_id)`
- Registration status automatically updates `registered_spots` count
- Tryout dates and registration deadlines are validated
- All timestamps are automatically managed

### Event Types

- **ONLINE**: Virtual tryouts (Discord, etc.)
- **IN_PERSON**: Physical location required
- **HYBRID**: Combination of online and in-person components

### Registration Status Flow

1. **PENDING**: Initial registration state
2. **CONFIRMED**: Coach approved the registration
3. **WAITLISTED**: Tryout is full, player is on waiting list
4. **DECLINED**: Coach declined the registration
5. **CANCELLED**: Player or coach cancelled the registration

### Error Handling

- All database operations include comprehensive error handling
- Errors are logged on the server side for debugging
- Client receives appropriate HTTP status codes and messages
- Uses `TRPCError` for consistent error responses
- Business logic validation with helpful error messages

### Security

- Player verification happens on every player endpoint
- Coach verification happens on every coach endpoint
- Registration ownership verified before mutations
- No access to other users' private data
- School association required for coach tryout creation

### Business Logic

- Automatic spot count management
- Registration deadline enforcement
- Past tryout protection (no new registrations)
- Duplicate registration prevention
- Coach-tryout ownership validation

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
