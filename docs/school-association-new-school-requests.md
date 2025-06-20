# New School Creation Request Feature

## Overview

The school association request form now supports requesting the creation of new schools that don't exist in the system. This feature allows coaches to submit requests for schools that aren't currently in the database, which can then be approved by administrators.

## Feature Components

### 1. Database Schema Changes

Added new fields to the `SchoolAssociationRequest` model:

- `is_new_school_request`: Boolean flag indicating if this is a new school request
- `proposed_school_name`: Name of the proposed school
- `proposed_school_type`: Type (HIGH_SCHOOL, COLLEGE, UNIVERSITY)
- `proposed_school_location`: City/location of the school
- `proposed_school_state`: State where the school is located
- `proposed_school_region`: Optional region information
- `proposed_school_website`: Optional website URL
- `created_school_id`: Reference to the school created upon approval
- `school_id`: Now nullable to support new school requests

### 2. Frontend Changes (SchoolAssociationRequestForm.tsx)

#### Unified Experience

- **Mode Toggle**: Toggle between "Existing School" and "Request New School"
- **Enhanced Search**: When no schools are found, users can easily switch to requesting a new school
- **Inline Suggestions**: "Don't see your school? Request a new one" option in dropdown

#### New School Form

- **Required Fields**: School name, type, location, state
- **Optional Fields**: Region, website
- **Validation**: Comprehensive client-side validation for all required fields
- **Dynamic Help Text**: Context-aware instructions based on request type

### 3. Backend Changes

#### CoachProfile Router Updates

- Updated `schoolAssociationRequestSchema` to support new school data
- Enhanced `submitSchoolAssociationRequest` mutation to handle both existing and new school requests
- Added validation logic to ensure either existing school ID or complete new school data is provided

#### SchoolAssociationRequests Router Updates

- Enhanced `approveRequest` mutation to create schools when approving new school requests
- Transaction-based approval process ensures data consistency
- Automatic school creation and coach association in a single operation

## User Flow

### Requesting a New School

1. **Access Form**: Coach navigates to school association request form
2. **Select Mode**: Click "Request New School" button
3. **Fill Details**: Complete all required school information:
   - School name
   - Type (High School, College, University)
   - City/location
   - State
   - Optional: Region and website
4. **Submit Request**: Add optional message explaining the request
5. **Wait for Review**: Admin reviews and either approves or rejects

### Admin Approval Process

1. **Review Request**: Admin sees new school request with all proposed details
2. **Approve**: When approved:
   - New school is automatically created in the database
   - Coach is immediately associated with the new school
   - Coach gains onboarded status
3. **Reject**: If rejected, coach can submit a new request

## API Changes

### Request Schema

```typescript
{
  school_id?: string; // Optional for new school requests
  request_message?: string;
  is_new_school_request: boolean;
  proposed_school_name?: string;
  proposed_school_type?: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
  proposed_school_location?: string;
  proposed_school_state?: string;
  proposed_school_region?: string;
  proposed_school_website?: string;
}
```

### Validation Rules

- For existing schools: `school_id` must be provided
- For new schools: `proposed_school_name`, `proposed_school_type`, `proposed_school_location`, and `proposed_school_state` are required
- URLs are validated for proper format
- State and location fields have length constraints

## Technical Implementation Details

### Database Transaction

The approval process uses a Prisma transaction to ensure atomicity:

1. Create new school (if new school request)
2. Update request status to APPROVED
3. Associate coach with school
4. Update coach's onboarded status

### Error Handling

- Comprehensive validation on both client and server
- Graceful fallbacks for Discord logging failures
- Clear error messages for users
- Transaction rollback on any failure

### Security

- Admin-only approval process
- Input sanitization and validation
- Proper authorization checks
- Audit trail through Discord logging

## Benefits

1. **Improved User Experience**: Unified interface for both existing and new schools
2. **Reduced Support Burden**: Self-service school creation requests
3. **Data Quality**: Structured collection of school information
4. **Administrative Control**: Manual review process ensures quality
5. **Scalability**: Easy addition of new schools without manual intervention

## Migration Notes

The database migration `20250620134901_add_new_school_request_fields` was successfully applied, adding all necessary fields while maintaining backward compatibility with existing requests.
