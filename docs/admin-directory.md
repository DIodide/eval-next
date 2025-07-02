# Admin Directory Feature

## Overview

The Admin Directory feature provides administrators with a comprehensive view of all schools, players, and leagues in the platform, with easy access to their public profiles. This feature is accessible through the admin dashboard at `/admin/directory`.

## Features

### 1. Overview Dashboard

- **Statistics Cards**: Shows total counts for schools, players, leagues, and active leagues
- **Breakdown Charts**: Visual representation of data distribution by type, class year, and tier
- **Quick Insights**: At-a-glance view of platform engagement

### 2. Schools Directory

- **Comprehensive Listing**: All schools with filtering and pagination
- **Search & Filter**: Search by name, location, state; filter by school type
- **Quick Stats**: Shows number of coaches, players, and teams per school
- **Direct Profile Links**: One-click access to public school profiles

### 3. Players Directory

- **Player Database**: Complete player listing with detailed information
- **Advanced Filtering**: Search by name, username, email; filter by class year, location
- **Game Integration**: Shows main game and profile statistics
- **Profile Access**: Direct links to public player profiles (username required)

### 4. Leagues Directory

- **League Management**: Browse all leagues with comprehensive details
- **Multi-Game Support**: Shows associated games for each league
- **Status Tracking**: Filter by league status (Active, Upcoming, Completed, Cancelled)
- **Tier Classification**: Filter by league tier (Elite, Professional, Competitive, Developmental)

## API Endpoints

### Admin Directory Router (`/api/trpc/adminDirectory`)

#### `getSchools`

- **Purpose**: Fetch schools with filtering and pagination
- **Filters**: Search, type, state, region
- **Returns**: Schools with coach/player/team counts

#### `getPlayers`

- **Purpose**: Fetch players with filtering and pagination
- **Filters**: Search, class year, school, main game, location
- **Returns**: Players with school, game, and activity data

#### `getLeagues`

- **Purpose**: Fetch leagues with filtering and pagination
- **Filters**: Search, tier, status, region, state
- **Returns**: Leagues with participation counts and associated games

#### `getStats`

- **Purpose**: Platform-wide statistics for overview dashboard
- **Returns**: Total counts and breakdown data for charts

## Navigation

The directory is accessible through:

1. **Admin Navigation**: "Directory" link in the admin navigation bar
2. **URL**: `/admin/directory`
3. **Icon**: Folder Open icon in navigation

## Technical Implementation

### Frontend Components

- **Tabs Interface**: Organized view with Overview, Schools, Players, and Leagues tabs
- **Search & Filters**: Real-time filtering with form controls
- **Pagination**: Efficient data loading with 20 items per page
- **Responsive Design**: Mobile-friendly interface with adaptive layouts

### Backend Architecture

- **TRPC Router**: Type-safe API endpoints with Zod validation
- **Database Queries**: Optimized Prisma queries with counting and relationships
- **Admin Protection**: All endpoints require admin privileges
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Data Security

- **Admin Only**: All directory endpoints require admin authentication
- **Safe Queries**: Read-only operations with no modification capabilities
- **Rate Limiting**: Built-in TRPC rate limiting and caching

## Usage Guidelines

### For Administrators

1. **Overview First**: Start with the Overview tab to understand platform metrics
2. **Targeted Search**: Use filters to find specific entities quickly
3. **Profile Verification**: Click profile links to verify public profile quality
4. **Data Monitoring**: Regular checks for data consistency and completeness

### Profile Quality Checks

- **Schools**: Verify logo, bio, and contact information completeness
- **Players**: Check for complete profiles with appropriate game data
- **Leagues**: Ensure proper game associations and status accuracy

## Future Enhancements

### Planned Features

- **Bulk Operations**: Mass profile updates and moderation actions
- **Export Functionality**: CSV/Excel export of directory data
- **Advanced Analytics**: Engagement metrics and growth tracking
- **Integration Tools**: Direct profile editing from directory view

### Performance Optimizations

- **Virtual Scrolling**: For large datasets
- **Caching Strategy**: Enhanced caching for frequently accessed data
- **Search Indexing**: Full-text search improvements

## Related Documentation

- [Admin Dashboard](./admin-dashboard.md)
- [School Profiles](./schema-documentation.md#schools)
- [Player Profiles](./schema-documentation.md#players)
- [League Management](./schema-documentation.md#leagues)
