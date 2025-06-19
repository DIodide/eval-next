# School Association Requests Router Documentation

The School Association Requests Router handles the administrative workflow for coaches requesting to be associated with educational institutions. This router provides comprehensive management tools for administrators to review and process coach applications.

## Overview

The router provides functionality for:

- Retrieving and filtering school association requests
- Approving or rejecting coach applications
- Managing the coach onboarding workflow
- Administrative oversight of school-coach relationships

## Authentication & Authorization

All endpoints in this router use the new `adminProcedure` with automatic admin verification:

- Users must be authenticated via Clerk
- Users must have `publicMetadata.role === "admin"`
- Provides comprehensive admin access to manage platform operations
- Eliminates the need for manual admin verification in each endpoint

## Router Structure

This router represents a complete refactoring from manual verification functions to structured procedure-based architecture, similar to the recent updates in tryouts and combines routers.

## Schemas

### Request Search Schema

```typescript
{
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';  // Filter by request status
  search?: string;                                // Search coaches/schools by name
  page?: number;                                  // Pagination (default: 1)
  limit?: number;                                 // Results per page (default: 20, max: 100)
}
```

### Approve Request Schema

```typescript
{
  requestId: string;      // UUID of the request to approve
  adminNotes?: string;    // Optional administrative notes
}
```

### Reject Request Schema

```typescript
{
  requestId: string; // UUID of the request to reject
  adminNotes: string; // Required administrative notes for rejection
}
```

## Endpoints

### Admin Query Endpoints

#### `getRequests`

- **Method**: Query (Admin Only)
- **Input**: Request Search Schema
- **Description**: Retrieve school association requests with filtering and pagination
- **Returns**: Paginated list of requests with coach and school details
- **Features**:
  - Advanced filtering by status and search terms
  - Comprehensive coach and school information
  - Ordered by status (PENDING first) then by date
- **Authorization**: Admin access required
- **Error Codes**:
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an admin
  - `INTERNAL_SERVER_ERROR`: Failed to fetch requests

#### `getPendingCount`

- **Method**: Query (Admin Only)
- **Input**: None
- **Description**: Get count of pending school association requests
- **Returns**: Number of pending requests
- **Use Case**: Dashboard badges and notifications
- **Authorization**: Admin access required
- **Error Codes**:
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an admin
  - `INTERNAL_SERVER_ERROR`: Failed to fetch count

#### `getRequestById`

- **Method**: Query (Admin Only)
- **Input**: `{ requestId: string }`
- **Description**: Get detailed information about a specific request
- **Returns**: Complete request details with coach and school information
- **Authorization**: Admin access required
- **Error Codes**:
  - `NOT_FOUND`: Request not found
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an admin
  - `INTERNAL_SERVER_ERROR`: Failed to fetch request

### Admin Mutation Endpoints

#### `approveRequest`

- **Method**: Mutation (Admin Only)
- **Input**: Approve Request Schema
- **Description**: Approve a coach's school association request
- **Process**:
  1. Validates request exists and is pending
  2. Updates request status to APPROVED
  3. Associates coach with school in database
  4. Updates Clerk metadata to mark coach as onboarded
  5. Returns updated request and coach information
- **Clerk Integration**: Automatically updates `sessionClaims.publicMetadata.onboarded = true`
- **Authorization**: Admin access required
- **Error Codes**:
  - `NOT_FOUND`: Request not found
  - `BAD_REQUEST`: Request already processed or coach already has school
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an admin
  - `INTERNAL_SERVER_ERROR`: Failed to approve request

#### `rejectRequest`

- **Method**: Mutation (Admin Only)
- **Input**: Reject Request Schema
- **Description**: Reject a coach's school association request
- **Process**:
  1. Validates request exists and is pending
  2. Updates request status to REJECTED
  3. Records admin notes (required for rejections)
  4. Returns updated request information
- **Required Notes**: Administrative notes are mandatory for rejections
- **Authorization**: Admin access required
- **Error Codes**:
  - `NOT_FOUND`: Request not found
  - `BAD_REQUEST`: Request already processed
  - `UNAUTHORIZED`: User not authenticated
  - `FORBIDDEN`: User is not an admin
  - `INTERNAL_SERVER_ERROR`: Failed to reject request

## Request Lifecycle

### 1. Request Submission (Coach Side)

Coaches submit requests via the `coachProfile.submitSchoolAssociationRequest` endpoint:

```typescript
// Coach submits request (uses coachProcedure)
const request = await api.coachProfile.submitSchoolAssociationRequest.mutate({
  school_id: "uuid-of-school",
  request_message: "I am applying to coach at this institution...",
});
```

### 2. Admin Review Process

Administrators review requests through the admin interface:

```typescript
// Get pending requests
const { data: requests } = api.schoolAssociationRequests.getRequests.useQuery({
  status: "PENDING",
  page: 1,
  limit: 20,
});

// Review and approve
const approveMutation =
  api.schoolAssociationRequests.approveRequest.useMutation({
    onSuccess: () => {
      // Coach is now onboarded and can create tryouts
    },
  });
```

### 3. Completion (Automatic Onboarding)

Upon approval:

- Coach gains `school_id` association
- Clerk metadata updated with `onboarded: true`
- Coach can now use `onboardedCoachProcedure` endpoints
- Full access to tryout creation, player recruitment, etc.

## Architecture Integration

This router showcases the new structured procedure architecture:

### Before (Manual Verification)

```typescript
// Old pattern with duplicate verification
someEndpoint: protectedProcedure.mutation(async ({ ctx }) => {
  await verifyAdminAccess(ctx); // Manual verification
  // ... endpoint logic
});
```

### After (Structured Procedures)

```typescript
// New pattern with automatic verification
someEndpoint: adminProcedure.mutation(async ({ ctx }) => {
  // Admin access automatically verified
  // Clean, reusable, type-safe
});
```

## Security Features

- **Automatic Admin Verification**: `adminProcedure` ensures only authorized administrators can access endpoints
- **Request Validation**: Comprehensive input validation using Zod schemas
- **Transaction Safety**: Database operations use transactions for data consistency
- **Audit Trail**: All actions are logged with admin IDs and timestamps
- **Clerk Integration**: Seamless integration with authentication provider

## Error Handling

The router implements comprehensive error handling with specific error codes:

- **Authentication Errors**: `UNAUTHORIZED` for unauthenticated requests
- **Authorization Errors**: `FORBIDDEN` for non-admin users
- **Validation Errors**: `BAD_REQUEST` for invalid input or business logic violations
- **Not Found Errors**: `NOT_FOUND` for missing resources
- **Server Errors**: `INTERNAL_SERVER_ERROR` for unexpected failures

All errors include descriptive messages to help with debugging and user feedback.

## Usage Examples

### Frontend Integration

```typescript
// Admin dashboard - get pending requests
const { data: pendingRequests } =
  api.schoolAssociationRequests.getRequests.useQuery({
    status: "PENDING",
  });

// Approve request
const approveMutation =
  api.schoolAssociationRequests.approveRequest.useMutation({
    onSuccess: () => {
      // Refetch requests to update UI
      refetch();
    },
  });

// Handle approval
const handleApprove = (requestId: string, notes?: string) => {
  approveMutation.mutate({ requestId, adminNotes: notes });
};

// Reject request with required notes
const rejectMutation =
  api.schoolAssociationRequests.rejectRequest.useMutation();

const handleReject = (requestId: string, adminNotes: string) => {
  rejectMutation.mutate({ requestId, adminNotes });
};
```

## Performance Considerations

- Optimized database queries with proper indexing
- Pagination support for large datasets
- Selective field inclusion for efficient data transfer
- Transaction-based operations for data consistency
- Retry logic for improved reliability (inherited from base procedures)

This router represents the evolution of the platform's architecture toward structured, reusable, and maintainable code patterns while providing comprehensive administrative capabilities for managing the coach onboarding process.
