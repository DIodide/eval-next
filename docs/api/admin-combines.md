# Admin Combines Management API Documentation

## Overview

The Admin Combines Management system provides a comprehensive interface for administrators to create, manage, and monitor EVAL combines. This documentation covers the API endpoints and UI features available exclusively to administrators.

## Features

### Core Functionality

- **Create Combines**: Set up new competitive assessment events
- **Manage Combines**: Update combine details, status, and settings
- **Monitor Registrations**: View and manage player registrations
- **Statistics Dashboard**: Real-time metrics and insights
- **Advanced Filtering**: Search and filter combines by multiple criteria

### Admin-Only Capabilities

- Create combines for any game
- Modify combine status and settings
- Delete combines (with safety checks)
- View detailed registration analytics
- Access player contact information
- Manage qualification status

## API Endpoints

### Admin Procedures

All admin procedures require `adminProcedure` authentication which verifies:

- User is authenticated via Clerk
- User has `privateMetadata.role === "admin"`

#### `getAllForAdmin`

```typescript
api.combines.getAllForAdmin.useQuery({
  search?: string;
  game_id?: string;
  type?: "ONLINE" | "IN_PERSON" | "HYBRID";
  year?: string;
  page?: number;
  limit?: number;
})
```

**Returns**: Paginated list of combines with extended admin data

- Full combine details
- Registration counts and player information
- Game details
- Organizer information

#### `create`

```typescript
api.combines.create.useMutation({
  title: string;
  description: string;
  long_description?: string;
  game_id: string;
  date: Date;
  time_start?: string;
  time_end?: string;
  location: string;
  type: "ONLINE" | "IN_PERSON" | "HYBRID";
  year: string;
  max_participants?: number;
  registration_deadline?: Date;
})
```

**Features**:

- Validates game existence
- Checks registration deadline vs combine date
- Returns created combine with relations

#### `update`

```typescript
api.combines.update.useMutation({
  id: string;
  title?: string;
  description?: string;
  // ... other optional fields
})
```

**Features**:

- Partial updates supported
- Validation for date/deadline consistency
- Preserves existing registrations

#### `delete`

```typescript
api.combines.delete.useMutation({
  id: string;
})
```

**Safety Features**:

- Prevents deletion if registrations exist
- Requires confirmation in UI
- Returns success confirmation

#### `getByIdForAdmin`

```typescript
api.combines.getByIdForAdmin.useQuery({
  id: string;
})
```

**Returns**: Complete combine data including:

- All combine details
- Full registration list with player details
- Game information
- Statistics

#### `getStatistics`

```typescript
api.combines.getStatistics.useQuery();
```

**Returns**: Dashboard metrics:

- Total combines count
- Active combines count
- Upcoming combines count
- Total registrations
- Recent registrations (7 days)

#### `toggleActive`

```typescript
api.combines.toggleActive.useMutation({
  id: string;
  is_active: boolean;
})
```

**Note**: This endpoint references a field that may need to be added to the schema.

## UI Components

### Admin Dashboard Features

#### Statistics Overview

- Real-time metrics cards
- Registration trends
- Combine status breakdown
- Quick action summaries

#### Advanced Filtering

- Text search across titles and descriptions
- Game-specific filtering
- Status-based filtering (upcoming, active, completed)
- Event type filtering (online, in-person, hybrid)
- Year-based filtering

#### Combine Management

- Create new combines with comprehensive form
- Inline editing capabilities
- Bulk status updates
- Registration management

#### Registration Details

- Player contact information
- Registration timestamps
- Qualification status tracking
- Registration status management

### Create Combine Form

The admin interface includes a comprehensive form with:

**Basic Information**:

- Title and description
- Game selection
- Event type (Online/In-Person/Hybrid)
- Date and time scheduling

**Advanced Options**:

- Location details
- Participant limits
- Prize pool information
- Tournament format
- Entry requirements
- Year classification

**Status Management**:

- Initial status setting
- Invitation-only options
- Registration deadline setting

### Security Features

#### Access Control

- Admin-only route protection
- Server-side permission verification
- Secure API endpoint access

#### Data Protection

- Player PII access controls
- Audit logging for admin actions
- Secure data transmission

#### Safety Measures

- Confirmation dialogs for destructive actions
- Validation for critical operations
- Rollback capabilities where appropriate

## Implementation Status

### Current Status

- ✅ Admin navigation integration
- ✅ UI components and layouts
- ✅ Mock data for testing
- ⚠️ API endpoints (in development)
- ⚠️ Database schema updates needed

### Pending Work

1. **API Implementation**: Complete the admin combine procedures
2. **Schema Updates**: Add any missing fields (e.g., `is_active`)
3. **Integration Testing**: Connect UI to live API endpoints
4. **Performance Optimization**: Add caching and pagination
5. **Audit Logging**: Track admin actions for compliance

### Technical Considerations

#### Database Schema

Some endpoints reference fields that may need schema updates:

- `is_active` field on Combine model
- `image_url` field on Game model (if needed)
- Proper indexing for admin queries

#### API Performance

- Implement pagination for large datasets
- Add caching for frequently accessed data
- Optimize complex queries with proper indexes

#### Error Handling

- Comprehensive validation messages
- User-friendly error displays
- Proper HTTP status codes

## Usage Examples

### Creating a Combine

```typescript
const { mutate: createCombine } = api.combines.create.useMutation({
  onSuccess: () => {
    toast({ title: "Success", description: "Combine created successfully" });
    refetchCombines();
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  },
});

createCombine({
  title: "VALORANT Spring Regional Combine",
  description: "Elite competitive assessment event",
  game_id: "valorant-uuid",
  date: new Date("2024-04-15T09:00:00"),
  location: "Online - Custom Servers",
  type: "ONLINE",
  year: "2024",
  max_participants: 64,
});
```

### Filtering Combines

```typescript
const { data: combines } = api.combines.getAllForAdmin.useQuery({
  search: "VALORANT",
  type: "ONLINE",
  year: "2024",
  page: 1,
  limit: 20,
});
```

### Managing Registrations

```typescript
const { data: combineDetails } = api.combines.getByIdForAdmin.useQuery({
  id: combineId,
});

// Access full registration data including player contact info
combineDetails?.registrations.forEach((registration) => {
  console.log(registration.player.email); // Available for admin
});
```

## Best Practices

### Performance

- Use pagination for large lists
- Implement search debouncing
- Cache frequently accessed data

### User Experience

- Provide clear feedback for all actions
- Show loading states during operations
- Implement optimistic updates where appropriate

### Security

- Validate all inputs server-side
- Log admin actions for audit trails
- Implement proper error boundaries

### Maintenance

- Monitor API performance metrics
- Track user engagement with features
- Maintain comprehensive documentation
