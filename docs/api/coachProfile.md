# Coach Profile Router Documentation

The Coach Profile Router handles all coach profile-related operations in the API. This router is protected and requires authentication for all endpoints, with database retry logic for improved reliability.

## Overview

The router provides functionality for:

- Managing coach profiles (get/update with optimized queries)
- Managing school associations (associate/remove)
- Retrieving available schools for selection
- Optimized data fetching for specific use cases

## Authentication & Authorization

All endpoints in this router use the new `coachProcedure` with automatic coach verification:

- Users must be authenticated via Clerk
- Users must have a valid coach profile in the database
- Access is restricted to coach-type users only
- Automatic context enhancement with `coachId` and `schoolId`
- Eliminates the need for manual coach verification in each endpoint

### Router Structure

This router has been completely refactored from manual verification functions to structured procedure-based architecture, consistent with the platform's new authentication patterns.

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

- **Method**: Query (Coach Only)
- **Input**: None
- **Description**: Get complete coach profile with school association
- **Returns**: Coach profile with school reference
- **Includes**: School details if associated
- **Authorization**: Coach access required (automatic via `coachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `NOT_FOUND`: Coach profile not found
  - `INTERNAL_SERVER_ERROR`: Failed to fetch coach profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `getBasicProfile`

- **Method**: Query (Coach Only)
- **Input**: None
- **Description**: Get basic coach profile information (optimized for faster loading)
- **Returns**: Basic coach profile fields only
- **Performance**: Optimized query with selective field inclusion
- **Authorization**: Coach access required (automatic via `coachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch basic profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `getSchoolInfo`

- **Method**: Query (Coach Only)
- **Input**: None
- **Description**: Get school association information only
- **Returns**: School association details
- **Includes**: Complete school reference if associated
- **Authorization**: Coach access required (automatic via `coachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch school info
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `getOnboardingStatus`

- **Method**: Query (Coach Only)
- **Input**: None
- **Description**: Get coach onboarding status and school association eligibility
- **Returns**: Onboarding status object with flags for association state
- **Data Sources**:
  - Onboarding status from Clerk `sessionClaims.publicMetadata.onboarded`
  - School association and pending requests from database
- **Authorization**: Coach access required (automatic via `coachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to fetch onboarding status
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

- **Method**: Mutation (Coach Only)
- **Input**: Profile Update Schema
- **Description**: Update coach profile information
- **Returns**: Updated coach profile with school reference
- **Validation**: Input validation for all fields
- **Authorization**: Coach access required (automatic via `coachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to update coach profile
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `submitSchoolAssociationRequest`

- **Method**: Mutation (Coach Only)
- **Input**: School Association Request Schema
- **Description**: Submit a request to be associated with a school
- **Returns**: Created school association request with school details
- **Validation**:
  - School must exist in database
  - Coach must not already have school association
  - No pending request for the same school
- **Authorization**: Coach access required (automatic via `coachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `BAD_REQUEST`: Coach already has school or pending request exists
  - `NOT_FOUND`: School not found
  - `INTERNAL_SERVER_ERROR`: Failed to submit request
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `associateWithSchool` (Deprecated)

- **Method**: Mutation (Coach Only)
- **Input**: School Association Schema
- **Description**: **[DEPRECATED]** Direct school association (bypasses admin approval)
- **Status**: Still in use but marked for removal
- **Returns**: Updated coach profile with school reference
- **Validation**:
  - School must exist in database
  - School ID must be valid UUID
- **Authorization**: Coach access required (automatic via `coachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `NOT_FOUND`: School not found
  - `INTERNAL_SERVER_ERROR`: Failed to associate with school
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not a coach

#### `removeSchoolAssociation`

- **Method**: Mutation (Onboarded Coach Only)
- **Input**: None
- **Description**: Remove school association from coach profile and revoke onboarded status
- **Returns**: Updated coach profile without school association
- **Behavior**:
  - Sets school_id to null and school to empty string in database
  - Updates Clerk `publicMetadata.onboarded` to `false`
  - Maintains `userType: "coach"` in Clerk metadata
- **Clerk Integration**: Automatically updates `sessionClaims.publicMetadata.onboarded = false`
- **Authorization**: Onboarded coach access required (automatic via `onboardedCoachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Error Codes**:
  - `INTERNAL_SERVER_ERROR`: Failed to remove school association
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an onboarded coach

## Usage Examples

### Frontend Integration

```typescript
// Get coach profile (automatic coach verification)
const { data: profile } = api.coachProfile.getProfile.useQuery();

// Get onboarding status (hybrid Clerk + database data)
const { data: status } = api.coachProfile.getOnboardingStatus.useQuery();
// Returns: { isOnboarded, hasSchoolAssociation, hasPendingRequest, canRequestAssociation }

// Update profile
const updateMutation = api.coachProfile.updateProfile.useMutation({
  onSuccess: () => {
    // Handle success
  },
});

// Submit school association request (recommended)
const requestMutation =
  api.coachProfile.submitSchoolAssociationRequest.useMutation({
    onSuccess: () => {
      // Request submitted for admin review
    },
  });

// Legacy direct association (deprecated)
const associateMutation = api.coachProfile.associateWithSchool.useMutation({
  onSuccess: () => {
    // Immediate association (bypasses admin approval)
  },
});

// Remove school association (also revokes onboarded status)
const removeAssociationMutation =
  api.coachProfile.removeSchoolAssociation.useMutation({
    onSuccess: () => {
      // School association removed, coach is no longer onboarded
      // Coach will need to re-request association for onboarded access
    },
  });

// Get available schools (public access)
const { data: schools } = api.coachProfile.getAvailableSchools.useQuery();
```

### School Association Workflow

The new school association workflow uses the admin approval system:

1. **Request Submission**: Coach visits profile page and submits school association request
2. **Admin Review**: Request appears in admin dashboard for review
3. **Approval Process**: Admin approves/rejects with optional notes
4. **Automatic Onboarding**: Upon approval, coach gains onboarded status
5. **Full Access**: Coach can now create tryouts and manage recruitment

#### Removing School Association

When a coach removes their school association:

1. **Database Update**: School association is removed from coach profile
2. **Clerk Metadata Update**: `publicMetadata.onboarded` is set to `false`
3. **Access Revocation**: Coach loses access to onboarded-only features
4. **Re-onboarding Required**: Coach must submit new association request to regain access

#### Legacy Direct Association (Deprecated)

The old direct association method (`associateWithSchool`) bypasses admin approval and is marked for removal:

1. Coach selects school from dropdown (grouped by state)
2. Association is created immediately with school validation
3. Coach gains immediate access (no admin oversight)

## Error Handling

The router implements comprehensive error handling with specific error codes and messages:

- **Authentication Errors**: `UNAUTHORIZED` for unauthenticated requests
- **Authorization Errors**: `FORBIDDEN` for non-coach users
- **Validation Errors**: `BAD_REQUEST` for invalid input
- **Not Found Errors**: `NOT_FOUND` for missing resources
- **Server Errors**: `INTERNAL_SERVER_ERROR` for unexpected failures

All errors include descriptive messages to help with debugging and user feedback.

## Architecture Improvements

This router showcases the evolution to structured procedure-based architecture:

### Before (Manual Verification)

```typescript
// Old pattern with duplicate verification logic
getProfile: protectedProcedure.query(async ({ ctx }) => {
  const { userId, coachId } = await verifyCoachUser(ctx); // Manual verification
  // ... endpoint logic using userId/coachId
});
```

### After (Structured Procedures)

```typescript
// New pattern with automatic verification and context enhancement
getProfile: coachProcedure.query(async ({ ctx }) => {
  const userId = ctx.auth.userId!; // Safe access
  const coachId = ctx.coachId; // Automatically provided
  // ... clean endpoint logic
});
```

### Key Benefits

1. **Code Reduction**: Eliminated ~50 lines of duplicate verification logic
2. **Type Safety**: Automatic context enhancement with coach-specific data
3. **Consistency**: Uniform authorization patterns across all coach endpoints
4. **Maintainability**: Centralized authorization logic reduces code drift
5. **Performance**: Single database query for verification vs. repeated queries
6. **Hybrid Data Sources**: `getOnboardingStatus` now uses Clerk for onboarding status and database for association details

### Security Enhancements

- **Automatic Verification**: `coachProcedure` ensures only authenticated coaches access endpoints
- **Context Enhancement**: Coach-specific data automatically available in context
- **Error Handling**: Consistent error responses for authorization failures
- **Resource Protection**: Automatic verification of coach profile existence

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
