# Coach Profile Router Documentation

The Coach Profile Router handles all coach profile-related operations in the API. This router is protected and requires authentication for all endpoints, with database retry logic for improved reliability.

## Overview

The router provides functionality for:

- Managing coach profiles (get/update with optimized queries)
- Managing school associations (associate/remove)
- Retrieving available schools for selection
- Optimized data fetching for specific use cases

## Authentication & Authorization

All endpoints in this router use `protectedProcedure` with additional coach verification:

- Users must be authenticated via Clerk
- Users must have a valid coach profile in the database
- Access is restricted to coach-type users only
- Each request verifies the user is a coach and retrieves their coach ID

## Database Reliability

All database operations use the `withRetry()` wrapper to handle connection issues and improve reliability.

## Schemas

### Profile Update Schema

```typescript
{
  // Basic profile information
  first_name?: string;              // Min length: 1
  last_name?: string;               // Min length: 1
  username?: string;                // Min length: 3

  // School association
  school?: string;
  school_id?: string;               // Must be valid UUID
}
```

### School Association Schema

```typescript
{
  school_id: string; // Must be valid UUID
  school_name: string; // Min length: 1
}
```

## Endpoints

### Query Endpoints

#### `getProfile`

- **Method**: Query (Protected - Coaches Only)
- **Input**: None
- **Description**: Get complete coach profile with school association
- **Returns**: Coach profile with school reference
- **Includes**: School details if associated
- **Authorization**: Coach-only access, returns own profile only
- **Error Codes**:
  - `NOT_FOUND`: Coach profile not found
  - `INTERNAL_SERVER_ERROR`: Failed to fetch coach profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `getBasicProfile`

- **Method**: Query (Protected - Coaches Only)
- **Input**: None
- **Description**: Get basic coach profile information (optimized for faster loading)
- **Returns**: Basic coach profile fields only
- **Performance**: Optimized query with selective field inclusion
- **Authorization**: Coach-only access
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch basic profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `getSchoolInfo`

- **Method**: Query (Protected - Coaches Only)
- **Input**: None
- **Description**: Get school association information only
- **Returns**: School association details
- **Includes**: Complete school reference if associated
- **Authorization**: Coach-only access
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch school info
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `getAvailableSchools`

- **Method**: Query (Public)
- **Input**: None
- **Description**: Get all available schools for selection
- **Returns**: Array of schools with basic information
- **Ordering**: Sorted by state, then by name
- **Performance**: Optimized query with selective fields
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch available schools

### Mutation Endpoints

#### `updateProfile`

- **Method**: Mutation (Protected - Coaches Only)
- **Input**: Profile Update Schema
- **Description**: Update coach profile information
- **Returns**: Updated coach profile with school reference
- **Validation**: Input validation for all fields
- **Authorization**: Coach-only access, can only update own profile
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update coach profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `associateWithSchool`

- **Method**: Mutation (Protected - Coaches Only)
- **Input**: School Association Schema
- **Description**: Associate coach with a school
- **Returns**: Updated coach profile with school reference
- **Validation**:
  - School must exist in database
  - School ID must be valid UUID
- **Authorization**: Coach-only access
- **Error Codes**:
  - `NOT_FOUND`: School not found
  - `INTERNAL_SERVER_ERROR`: Failed to associate with school
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `removeSchoolAssociation`

- **Method**: Mutation (Protected - Coaches Only)
- **Input**: None
- **Description**: Remove school association from coach profile
- **Returns**: Updated coach profile without school association
- **Behavior**: Sets school_id to null and school to empty string
- **Authorization**: Coach-only access
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to remove school association
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

## Usage Examples

### Frontend Integration

```typescript
// Get coach profile
const { data: profile } = api.coachProfile.getProfile.useQuery();

// Update profile
const updateMutation = api.coachProfile.updateProfile.useMutation({
  onSuccess: () => {
    // Handle success
  },
});

// Associate with school
const associateMutation = api.coachProfile.associateWithSchool.useMutation({
  onSuccess: () => {
    // Handle success
  },
});

// Get available schools
const { data: schools } = api.coachProfile.getAvailableSchools.useQuery();
```

### School Association Workflow

1. Coach visits profile page
2. If not associated, shows school selection dialog
3. Coach selects school from dropdown (grouped by state)
4. Association is created with school validation
5. Coach can now create tryouts and manage recruitment

## Error Handling

The router implements comprehensive error handling with specific error codes and messages:

- **Authentication Errors**: `UNAUTHORIZED` for unauthenticated requests
- **Authorization Errors**: `FORBIDDEN` for non-coach users
- **Validation Errors**: `BAD_REQUEST` for invalid input
- **Not Found Errors**: `NOT_FOUND` for missing resources
- **Server Errors**: `INTERNAL_SERVER_ERROR` for unexpected failures

All errors include descriptive messages to help with debugging and user feedback.

## Performance Considerations

- Database queries use proper indexing for optimal performance
- Optimized queries with selective field inclusion
- Retry logic for database reliability
- Cached school data for frequent access
- Separate endpoints for different data needs (basic vs complete profile)

## Security Features

- Role-based access control (coach-only)
- Input validation and sanitization
- SQL injection prevention through Prisma
- Resource ownership verification
- School existence validation before association

## Integration with Other Systems

### Tryouts System

- School association is required for creating tryouts
- Tryouts router validates coach school association
- Profile changes automatically affect tryout creation permissions

### Authentication System

- Integrates with Clerk authentication
- Uses Clerk user ID for profile identification
- Syncs with webhook updates from Clerk

## Related Documentation

- [Tryouts Router](./tryouts.md) - For tryout creation requirements
- [Authentication](./auth.md) - For user authentication flow
- [Database Schema](../database/schema.md) - For data structure details
