# Admin Dashboard System

## Overview

The admin dashboard provides secure access to developer tools and system management features. All admin routes are protected by server-side authentication checks using Clerk's `privateMetadata`. Admin roles are managed manually through the Clerk dashboard.

## Access Control

### How Admin Access Works

1. **Server-Side Validation**: Admin status is stored in Clerk's `privateMetadata.role = "admin"`
2. **Middleware Protection**: All admin routes are protected by Next.js middleware
3. **API Security**: Admin API endpoints verify admin status before processing requests
4. **Manual Role Management**: Admin roles are set manually in the Clerk dashboard

### Protected Routes

- `/admin/*` - All admin dashboard pages
- `/test-*` - Legacy test routes (redirected to admin)
- `/api/admin/*` - Admin-only API endpoints

## Admin Dashboard Features

### Main Dashboard (`/admin`)

- Overview of all admin tools
- Quick access to test functionality
- System health monitoring
- Database management links

### Test Tools

- `/admin/test-messages` - Test messaging system
- `/admin/test-player-profile` - Test player profile functionality
- `/admin/test-player-search` - Test player search features
- `/admin/test-combines` - Test combine management
- `/admin/test-tryouts` - Test tryout system

### Admin Settings (`/admin/settings`)

- View current admin information
- System status and configuration
- Security information
- Link to Clerk dashboard for role management

## Security Architecture

### Multi-Layer Protection

1. **Middleware Layer**: `src/middleware.ts`

   - Route-level protection
   - Redirects non-admins to dashboard
   - Covers both pages and API routes

2. **Server Components**: `src/app/admin/layout.tsx`

   - Server-side authentication check
   - Automatic redirects for unauthorized users

3. **API Routes**: Individual admin endpoints

   - Admin verification on each request
   - Server-side privilege checking

4. **Utility Functions**: `src/lib/admin-utils.ts`
   - Centralized admin checking logic
   - Server-side Clerk client usage

### Metadata Structure

```typescript
// Clerk privateMetadata (server-controlled)
{
  role: "admin"; // Only this grants admin access
}

// Clerk publicMetadata (server-controlled, readable by client)
{
  userType: "player" | "coach"; // For general role-based access
  role: "admin"; // Synced from privateMetadata for client UI
}
```

## Setup Instructions

### 1. Grant Admin Access

Admin privileges are granted manually through the Clerk dashboard:

1. Open the [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users
3. Select the user to grant admin access
4. Go to the "Metadata" tab
5. Add to `privateMetadata`:
   ```json
   {
     "role": "admin"
   }
   ```
6. Optionally add to `publicMetadata` for client-side UI control:
   ```json
   {
     "role": "admin"
   }
   ```

### 2. Environment Setup

Ensure your Clerk configuration includes:

- Webhook endpoint for user creation
- Proper API keys for server-side operations
- Middleware configuration in `next.config.js`

### 3. Development vs Production

**Development:**

- Use test routes freely
- Debug with detailed error messages
- Access admin tools as needed

**Production:**

- Remove or secure test routes
- Implement proper logging
- Add rate limiting to admin APIs

## Usage Examples

### Accessing Admin Dashboard

1. Sign in with an admin account
2. Navigate to `/admin`
3. Use the navigation to access different tools

### Testing API Endpoints

1. Go to `/admin/test-messages`
2. Select test scenarios
3. View results and debug information

### Managing Admin Users

Admin user management is done through the Clerk dashboard:

1. Log into [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to Users section
3. Select user to modify
4. Update `privateMetadata` with `{"role": "admin"}` to grant access
5. Remove the role field from `privateMetadata` to revoke access

## Security Considerations

- Admin access uses `privateMetadata` (server-only)
- All routes protected by middleware
- API endpoints double-check admin status
- Test routes moved behind admin protection
- Original test routes completely removed
- Role management centralized in Clerk dashboard

## Troubleshooting

### Access Denied Issues

1. Check user's `privateMetadata.role` in Clerk dashboard
2. Verify middleware is running on the route
3. Check console for auth-related errors
4. Ensure `privateMetadata` contains `{"role": "admin"}`

### Test Tool Issues

1. Ensure proper tRPC setup
2. Check API endpoint accessibility
3. Verify database connections

### Permission Problems

1. Verify admin status in Clerk dashboard
2. Check server-side auth context
3. Confirm middleware configuration

## Admin Utilities

The following server-side utilities are available for checking admin status:

- `isUserAdmin(userId: string)` - Check if specific user is admin
- `isCurrentUserAdmin()` - Check if current user is admin
- `checkAdminAccess(userId?: string)` - Middleware helper for admin verification

These functions can only be used in server components, API routes, or middleware.
