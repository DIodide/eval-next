# League Association Requests Router Documentation

The League Association Requests Router handles the administrative workflow for league administrators requesting to be associated with esports leagues. This router provides comprehensive management tools for administrators to review and process league administrator applications.

## Overview

The router provides functionality for:

- Retrieving and filtering league association requests
- Approving or rejecting league administrator applications
- Managing the league administrator onboarding workflow
- Creating new leagues during the approval process
- Administrative oversight of league-administrator relationships

## Authentication & Authorization

All endpoints in this router use the `adminProcedure` with automatic admin verification:

- Users must be authenticated via Clerk
- Users must have `publicMetadata.role === "admin"`
- Provides comprehensive admin access to manage platform operations
- Eliminates the need for manual admin verification in each endpoint

## Router Structure

This router follows the established pattern used in school association requests and other administrative routers, providing a consistent API interface for managing association workflows.

## Schemas

### Request Search Schema

```typescript
{
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';  // Filter by request status
  search?: string;                                // Search admins/leagues by name
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
- **Output**: Paginated list of league association requests with full details
- **Description**: Retrieves all league association requests with filtering, search, and pagination capabilities

**Features:**

- Filter by request status (PENDING, APPROVED, REJECTED)
- Search across league administrator names, emails, and league information
- Comprehensive request details including proposed league information for new league requests
- Includes league administrator profile information
- Supports pagination with configurable limits

**Response includes:**

- Request metadata (ID, status, creation date, admin notes)
- League administrator information (name, email, username, join date)
- League information (existing league details or proposed new league data)
- Game information for both existing and proposed leagues
- Full proposed league details for new league creation requests

#### `getPendingCount`

- **Method**: Query (Admin Only)
- **Input**: None
- **Output**: Number of pending requests
- **Description**: Returns the count of pending league association requests for dashboard display

**Use Cases:**

- Dashboard notification badges
- Admin workload monitoring
- Quick status overview

#### `getRequestById`

- **Method**: Query (Admin Only)
- **Input**: `{ requestId: string }`
- **Output**: Detailed request information
- **Description**: Retrieves complete details for a specific league association request

**Response includes:**

- Full request details with all metadata
- Complete league administrator profile
- League information (existing or proposed)
- Request and admin notes
- Review history and timestamps

### Admin Mutation Endpoints

#### `approveRequest`

- **Method**: Mutation (Admin Only)
- **Input**: Approve Request Schema
- **Output**: Updated request with approval details
- **Description**: Approves a league association request and handles onboarding

**Process Flow:**

1. **Validation**: Verifies request exists and is in PENDING status
2. **Administrator Verification**: Ensures administrator doesn't already have league association
3. **League Handling**:
   - For existing league requests: Associates administrator with existing league
   - For new league requests: Creates the new league and associates administrator
4. **Database Updates**: Updates request status and administrator association
5. **Clerk Metadata**: Updates administrator's onboarded status to `true`
6. **Discord Logging**: Logs approval action with details
7. **Transaction Safety**: Uses database transactions for data consistency

**New League Creation:**
For new league requests, the approval process automatically creates the league with:

- Proposed league details (name, description, region, tier, etc.)
- Game association
- Administrator as the primary contact
- All metadata from the request

**Error Handling:**

- Validates request existence and status
- Prevents duplicate associations
- Handles new league creation failures
- Provides detailed error messages

#### `rejectRequest`

- **Method**: Mutation (Admin Only)
- **Input**: Reject Request Schema
- **Output**: Updated request with rejection details
- **Description**: Rejects a league association request with required admin notes

**Process Flow:**

1. **Validation**: Verifies request exists and is in PENDING status
2. **Admin Notes**: Requires administrative notes for rejection reasoning
3. **Database Update**: Updates request status to REJECTED with notes and timestamp
4. **Discord Logging**: Logs rejection with admin notes and details
5. **Notification**: System can notify administrator of rejection (future enhancement)

**Required Information:**

- Admin notes explaining rejection reason
- Administrator context for transparency

## Discord Integration

The router includes comprehensive Discord logging for audit trails and team communication:

### Event Types

- **League Association Request Approved**: When administrators approve requests
- **League Association Request Rejected**: When administrators reject requests
- **New League Created**: When approval process creates new leagues

### Logged Information

- Administrator details (name, email)
- League information (existing or newly created)
- Admin decision notes
- Request metadata
- Timestamp and admin user information

### Webhook Configuration

Uses the same Discord webhook URLs as other admin operations for consistent logging.

## Database Operations

### Transaction Safety

Critical operations use database transactions to ensure data consistency:

- League creation and administrator association
- Request status updates with metadata changes
- Clerk synchronization operations

### Data Relationships

- `LeagueAssociationRequest` → `LeagueAdministrator` (requester)
- `LeagueAssociationRequest` → `League` (existing league, optional)
- `LeagueAssociationRequest` → `Game` (proposed game for new leagues)
- Generated relationships during approval for new leagues

## Error Handling

### Validation Errors

- Request not found (404)
- Request already processed (400)
- Administrator already associated (400)
- Missing required fields (400)

### System Errors

- Database operation failures (500)
- Clerk API communication issues (500)
- Discord logging failures (logged but don't block operations)

## Usage Examples

### Fetching Pending Requests

```typescript
const { data: requests } = api.leagueAssociationRequests.getRequests.useQuery({
  status: "PENDING",
  page: 1,
  limit: 20,
});
```

### Approving a Request

```typescript
const approve = api.leagueAssociationRequests.approveRequest.useMutation({
  onSuccess: () => {
    toast.success("League association approved!");
    refetch();
  },
});

await approve.mutateAsync({
  requestId: "request-uuid",
  adminNotes:
    "Administrator credentials verified, league association approved.",
});
```

### Rejecting a Request

```typescript
const reject = api.leagueAssociationRequests.rejectRequest.useMutation({
  onSuccess: () => {
    toast.success("Request rejected");
    refetch();
  },
});

await reject.mutateAsync({
  requestId: "request-uuid",
  adminNotes:
    "Insufficient credentials provided for league administration role.",
});
```

## Security Considerations

### Admin-Only Access

All endpoints require administrator privileges and cannot be accessed by regular users.

### Data Validation

- UUID validation for all ID fields
- Required field validation for critical operations
- Status validation to prevent invalid state transitions

### Audit Trail

Complete Discord logging ensures all administrative actions are tracked and reviewable.

## Related Documentation

- [League Administrator Profile Router](./leagueAdminProfile.md) - End-user request submission
- [School Association Requests](./schoolAssociationRequests.md) - Similar workflow for schools
- [Discord Logging Integration](../discord-logging-integration.md) - Logging implementation details
- [Metadata Implementation](../metadata-implementation.md) - Clerk metadata management

## Future Enhancements

### Potential Improvements

- Email notifications for request status changes
- Bulk approval/rejection operations
- Request templates for common scenarios
- Enhanced search with more filter options
- Request analytics and reporting
- Automated verification workflows
