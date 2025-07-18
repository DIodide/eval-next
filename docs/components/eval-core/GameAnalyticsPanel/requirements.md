# Game Analytics Panel - Requirements Document

## Overview

The Game Analytics Panel is a comprehensive React component that displays competitive gaming statistics across multiple esports titles. It provides a unified interface for viewing performance metrics, rankings, and detailed analytics for connected gaming accounts.

## Functional Requirements

### 1. Multi-Game Support

- **FR-1.1**: Support for multiple esports titles:
  - VALORANT
  - Rocket League
  - Smash Ultimate
  - Overwatch 2 (placeholder for future implementation)
- **FR-1.2**: Ability to switch between games via tab selection
- **FR-1.3**: Visual indicators for connected vs unconnected games

### 2. Authentication & Authorization

#### Connection Detection

- **FR-2.1**: Detect OAuth connections via external account providers:
  - VALORANT: `custom_valorant` provider
  - Epic Games: `custom_epic_games` provider
  - start.gg: `custom_start_gg` provider
- **FR-2.2**: Fallback to platform_connections table for legacy connections
- **FR-2.3**: Real-time connection status updates

#### Access Control

- **FR-2.4**: Require authenticated user session (via Clerk)
- **FR-2.5**: Verify player profile ownership before displaying stats
- **FR-2.6**: **[Missing]** Role-based access control for viewing others' stats

### 3. Data Fetching & State Management

#### Data Sources

- **FR-3.1**: Fetch player profile data to obtain player ID
- **FR-3.2**: Fetch game-specific statistics using player ID:
  - VALORANT: Via TRPC mutation
  - Rocket League: Via TRPC query with caching
  - Smash Ultimate: Via TRPC mutation
- **FR-3.3**: Handle asynchronous data loading states
- **FR-3.4**: Implement error handling with user-friendly messages

#### Caching Strategy

- **FR-3.5**: Rocket League: 5-minute stale time, 10-minute garbage collection
- **FR-3.6**: **[Missing]** Caching for VALORANT and Smash data
- **FR-3.7**: **[Missing]** Manual refresh capability

### 4. User Interface Requirements

#### Layout & Responsiveness

- **FR-4.1**: Responsive grid layouts for different screen sizes
- **FR-4.2**: Collapsible/expandable sections for detailed stats
- **FR-4.3**: Consistent styling with EVAL design system (Orbitron/Rajdhani fonts)

#### Game-Specific Displays

##### VALORANT Analytics

- **FR-4.4**: Display core metrics:
  - EVAL Score (0-100)
  - Current rank
  - Win rates (game & round)
  - K/D/A ratio
  - ACS (Average Combat Score)
  - KAST percentage
  - Clutch factor
- **FR-4.5**: Show player preferences:
  - Main role
  - Main agent with image
  - Main weapon with image
  - Best/worst maps with images
- **FR-4.6**: Information panel explaining metrics

##### Rocket League Analytics

- **FR-4.7**: Playlist selector (1v1, 2v2, 3v3)
- **FR-4.8**: Core performance metrics per playlist:
  - EVAL Score
  - Rank
  - Win rate
  - Games analyzed count
- **FR-4.9**: Gameplay statistics:
  - Goals/saves/assists/shots per game
  - MVP rate
  - Shooting percentage
  - Average speed
  - Clutch rate
- **FR-4.10**: Boost management visualization

##### Smash Ultimate Analytics

- **FR-4.11**: Player information header:
  - Gamer tag with prefix
  - Main character
  - EVAL Score with progress bar
- **FR-4.12**: Performance statistics:
  - Set/game win rates
  - Clutch factor
  - Event count
- **FR-4.13**: Character-specific data:
  - Main characters with win rates
  - Best/worst matchups
  - Stage performance

#### Interactive Elements

- **FR-4.14**: Tooltips for all metrics explaining their meaning
- **FR-4.15**: Clickable "Manage Connections" button
- **FR-4.16**: Connection prompts for unconnected games
- **FR-4.17**: Error retry functionality
- **FR-4.18**: **[Missing]** Data refresh button

### 5. Error Handling & Fallbacks

#### Connection Errors

- **FR-5.1**: Display specific error messages for:
  - Account not connected
  - Failed API requests
  - Invalid data responses
- **FR-5.2**: Provide actionable CTAs (connect account, retry)

#### Loading States

- **FR-5.3**: Animated loading indicators per game
- **FR-5.4**: Skeleton loaders for better UX
- **FR-5.5**: **[Missing]** Timeout handling for long requests

#### Coming Soon States

- **FR-5.6**: Placeholder UI for games without analytics
- **FR-5.7**: Connection prompts even for unavailable games

## Non-Functional Requirements

### 1. Performance

- **NFR-1.1**: Initial render within 100ms
- **NFR-1.2**: Data fetch completion within 3 seconds
- **NFR-1.3**: Smooth tab switching (<50ms)
- **NFR-1.4**: Efficient re-renders (no unnecessary component updates)

### 2. Accessibility

- **NFR-2.1**: **[Missing]** ARIA labels for interactive elements
- **NFR-2.2**: **[Missing]** Keyboard navigation support
- **NFR-2.3**: **[Missing]** Screen reader compatibility
- **NFR-2.4**: Color contrast compliance (WCAG AA)

### 3. Security

- **NFR-3.1**: No sensitive data exposure in client
- **NFR-3.2**: Validate user permissions before data fetch
- **NFR-3.3**: **[Missing]** Rate limiting for API requests
- **NFR-3.4**: **[Missing]** Input sanitization for user-generated content

### 4. Maintainability

- **NFR-4.1**: Modular code structure with separate render functions
- **NFR-4.2**: TypeScript for type safety
- **NFR-4.3**: Consistent naming conventions
- **NFR-4.4**: **[Missing]** Comprehensive error logging

### 5. Scalability

- **NFR-5.1**: Support for adding new games without major refactoring
- **NFR-5.2**: Flexible data structure for different game metrics
- **NFR-5.3**: **[Missing]** Pagination for large datasets
- **NFR-5.4**: **[Missing]** Progressive data loading

### 6. Browser Compatibility

- **NFR-6.1**: Support modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-6.2**: Graceful degradation for missing features
- **NFR-6.3**: Mobile browser optimization

## Component Integration Requirements

### 1. Dependencies

- **IR-1.1**: Clerk authentication context
- **IR-1.2**: TRPC client for API calls
- **IR-1.3**: UI components from shadcn/ui
- **IR-1.4**: Next.js Image component for optimized images

### 2. Props Interface

- **IR-2.1**: **[Missing]** Accept optional player ID prop
- **IR-2.2**: **[Missing]** Accept view mode (self/other)
- **IR-2.3**: **[Missing]** Accept game filter prop
- **IR-2.4**: **[Missing]** Accept custom styling props

### 3. Events & Callbacks

- **IR-3.1**: **[Missing]** onGameChange callback
- **IR-3.2**: **[Missing]** onConnectionClick callback
- **IR-3.3**: **[Missing]** onDataRefresh callback
- **IR-3.4**: **[Missing]** onError callback

### 4. Context Requirements

- **IR-4.1**: Must be wrapped in Clerk provider
- **IR-4.2**: Must be wrapped in TRPC provider
- **IR-4.3**: Must be wrapped in Tooltip provider
- **IR-4.4**: **[Missing]** Theme context support

## Data Requirements

### 1. Player Profile Data

- **DR-1.1**: Player ID (required)
- **DR-1.2**: Platform connections array
- **DR-1.3**: Social connections array

### 2. Game-Specific Data Structures

- **DR-2.1**: VALORANT stats object with nested properties
- **DR-2.2**: Rocket League stats with playlist-specific data
- **DR-2.3**: Smash Ultimate stats with character/matchup data
- **DR-2.4**: Consistent error response format

### 3. Asset Requirements

- **DR-3.1**: Game logo images (32x32 and 16x16)
- **DR-3.2**: Agent/character images
- **DR-3.3**: Weapon/item images
- **DR-3.4**: Map/stage images
- **DR-3.5**: **[Missing]** Fallback images for failed loads

## Future Enhancements

1. Real-time stat updates via WebSocket
2. Historical data comparison
3. Export functionality for stats
4. Social sharing capabilities
5. Advanced filtering and sorting
6. Performance trends visualization
7. Team/squad analytics view
8. Tournament performance tracking
9. Custom metric calculations
10. AI-powered insights and recommendations
