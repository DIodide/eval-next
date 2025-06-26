# Admin Combines Enhancement

## Overview

This document describes the comprehensive enhancements made to the admin combines functionality for better registration management. The enhancements address issues with cancelled registration counting and provide powerful admin tools for registration oversight.

## Key Issues Addressed

### 1. Registration Counting Problems

- **Issue**: Cancelled registrations were still being counted in total registration counts via `_count.registrations`
- **Solution**: Enhanced count displays to distinguish between active registrations (`registered_spots`) and total registrations (`_count.registrations`)

### 2. Limited Admin Control

- **Issue**: No admin functionality existed to permanently remove registrations
- **Solution**: Added comprehensive registration removal and management capabilities

### 3. Poor Registration Visibility

- **Issue**: Limited visibility into registration status breakdown and statistics
- **Solution**: Added registration statistics, status breakdown, and enhanced filtering

## New API Endpoints

### 1. Remove Registration (`removeRegistration`)

```typescript
removeRegistration: adminProcedure
  .input(z.object({
    registration_id: z.string().uuid(),
  }))
  .mutation(async ({ ctx, input }) => { ... })
```

**Features:**

- Admin-only access with proper authorization
- Permanent deletion of registrations with database transaction safety
- Automatically adjusts spot counts only if registration wasn't already cancelled
- Returns success confirmation with registration details

**Usage:**

```typescript
const removeRegistrationMutation = api.combines.removeRegistration.useMutation({
  onSuccess: (data) => {
    toast({
      title: "Success",
      description: "Registration removed successfully!",
    });
    // Auto-refresh data
  },
});
```

### 2. Get Registration Statistics (`getRegistrationStats`)

```typescript
getRegistrationStats: adminProcedure
  .input(z.object({ combine_id: z.string().uuid() }))
  .query(async ({ ctx, input }) => { ... })
```

**Returns:**

```typescript
{
  PENDING?: number;
  CONFIRMED?: number;
  WAITLISTED?: number;
  DECLINED?: number;
  CANCELLED?: number;
  activeRegistrations: number;
  totalRegistrations: number;
}
```

### 3. Enhanced Admin Combines Query (`getAllForAdmin`)

- Extended existing endpoint with better registration data
- Includes both `_count.registrations` (total) and `registered_spots` (active)
- Enhanced filtering and search capabilities

## Frontend Enhancements

### 1. Registration Status Badges

Enhanced visual indicators for registration statuses:

```typescript
const getStatusColor = (status: RegistrationStatus) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-600 text-white";
    case "PENDING":
      return "bg-yellow-600 text-white";
    case "DECLINED":
      return "bg-red-600 text-white";
    case "CANCELLED":
      return "bg-gray-600 text-gray-200 line-through";
    case "WAITLISTED":
      return "bg-orange-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};
```

**Visual Features:**

- Color-coded status badges (green, yellow, red, gray, orange)
- Cancelled registrations shown with strikethrough styling
- Consistent visual language across the interface

### 2. Enhanced Registration Count Display

```typescript
{
  (() => {
    const activeCount = combine.registered_spots ?? 0;
    const totalCount = combine._count.registrations;
    if (activeCount !== totalCount) {
      return `${activeCount}/${combine.max_spots} active (${totalCount} total)`;
    }
    return `${activeCount}/${combine.max_spots} registered`;
  })();
}
```

**Format Examples:**

- When counts match: "24/32 registered"
- When counts differ: "20/32 active (24 total)"

### 3. Registration Overview Dashboard

Enhanced statistics panel with 6 key metrics:

1. **Total Combines**: Total number of combines in system
2. **Registration Open**: Combines currently accepting registrations
3. **Upcoming**: Combines scheduled but not yet open
4. **Active Registrations**: Sum of all `registered_spots` across combines
5. **Total Registrations**: Sum of all registrations (including cancelled)
6. **Filtered Results**: Number of combines matching current filters

### 4. Advanced Filtering

Extended filter options include:

- Search (title, description, location)
- Game type
- Combine status
- Event type (Online, In-Person, Hybrid)
- Year
- **New**: Registration Status Filter
  - 🟡 Pending
  - 🟢 Confirmed
  - 🟠 Waitlisted
  - 🔴 Declined
  - ⚫ Cancelled

### 5. Registration Management Actions

Enhanced dropdown menu for each registration:

**Status Change Actions:**

- Accept Registration (PENDING → CONFIRMED)
- Move to Waitlist (PENDING/CONFIRMED → WAITLISTED)
- Decline Registration
- Promote from Waitlist (WAITLISTED → CONFIRMED)

**Administrative Actions:**

- Copy player email
- View full player profile
- **New**: Remove registration (with confirmation dialog)

**Confirmation Dialog:**

```typescript
const handleRemoveRegistration = (
  registrationId: string,
  playerName?: string,
) => {
  if (
    confirm(
      `Are you sure you want to remove ${playerName ? `${playerName}'s` : "this"} registration? This action cannot be undone.`,
    )
  ) {
    removeRegistrationMutation.mutate({ registration_id: registrationId });
  }
};
```

## Enhanced User Experience

### 1. Real-time Feedback

- Toast notifications for all actions
- Loading states during operations
- Auto-refresh after mutations
- Output panel with operation details

### 2. Error Handling

- Comprehensive error messages
- Graceful degradation for failed operations
- User-friendly error display in output panel

### 3. Data Integrity

- Transaction-based operations
- Proper authorization checks
- Validation at both frontend and backend levels

## Security Considerations

### 1. Authorization

- All admin endpoints require `adminProcedure`
- User authorization verified at API level
- Frontend guards against unauthorized access

### 2. Data Validation

- UUID validation for all IDs
- Status enum validation
- Input sanitization and validation

### 3. Audit Trail

- Operation logging in output panel
- Success/failure tracking
- Timestamp recording for all operations

## TypeScript Types

### Registration Status Enum

```typescript
type RegistrationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "WAITLISTED"
  | "DECLINED"
  | "CANCELLED";
```

### Registration Statistics

```typescript
type RegistrationStats = {
  PENDING?: number;
  CONFIRMED?: number;
  WAITLISTED?: number;
  DECLINED?: number;
  CANCELLED?: number;
  activeRegistrations: number;
  totalRegistrations: number;
};
```

### Enhanced Registration Type

```typescript
type Registration = {
  id: string;
  status: RegistrationStatus;
  qualified: boolean | null;
  registered_at: Date;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    username: string | null;
    email: string;
    image_url: string | null;
  };
};
```

## Testing Recommendations

### 1. Admin Access Testing

- Verify admin-only access to new endpoints
- Test unauthorized access rejection
- Validate proper role-based permissions

### 2. Registration Management Testing

- Test registration removal with various statuses
- Verify spot count updates correctly
- Test transaction rollback on errors

### 3. UI/UX Testing

- Test all filter combinations
- Verify status badge styling
- Test confirmation dialogs
- Validate responsive design

### 4. Data Integrity Testing

- Test concurrent registration modifications
- Verify database consistency after operations
- Test edge cases (combine deletion, etc.)

## Performance Considerations

### 1. Query Optimization

- Efficient filtering at database level
- Pagination for large datasets
- Selective field loading where appropriate

### 2. Frontend Performance

- Optimistic updates for better UX
- Efficient re-rendering with React.useMemo
- Debounced search inputs

### 3. Caching Strategy

- TRPC query caching for frequently accessed data
- Strategic cache invalidation after mutations
- Background refresh for real-time updates

## Future Enhancement Opportunities

### 1. Bulk Operations

- Bulk status updates for multiple registrations
- Bulk registration removal
- Mass email notifications

### 2. Advanced Analytics

- Registration trend analysis
- Performance metrics dashboard
- Automated reporting features

### 3. Integration Enhancements

- Discord notifications for registration changes
- Email automation for status updates
- Calendar integration for combine schedules

### 4. Enhanced Filtering

- Date range filters
- Advanced search with multiple criteria
- Saved filter presets

## Implementation Summary

This enhancement successfully addresses the core issues of cancelled registration counting while providing comprehensive admin tools for registration management. The implementation follows established patterns in the codebase, maintains data integrity, and provides an intuitive user experience for administrators.

**Key Achievements:**

- ✅ Fixed cancelled registration counting issues
- ✅ Added comprehensive registration removal functionality
- ✅ Enhanced UI with better status visualization
- ✅ Implemented advanced filtering capabilities
- ✅ Added registration statistics and analytics
- ✅ Maintained backward compatibility
- ✅ Ensured proper security and authorization
- ✅ Provided comprehensive error handling and user feedback

The enhancement provides a solid foundation for future administrative features and significantly improves the combine management experience for administrators.
