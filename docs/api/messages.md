# Messages Router Documentation

The Messages Router handles messaging functionality between coaches and players on the platform.

## Overview

This router provides a comprehensive messaging system that enables:

- **Coach-to-Player Communication**: Onboarded coaches can message players for recruitment
- **Player-to-Coach Communication**: Players can respond to coaches and initiate conversations
- **Conversation Management**: Both parties can manage conversation states (starred, archived)
- **Real-time Messaging**: Support for conversation threading and message status tracking

## Architecture

### Authorization Levels

- **Coach Endpoints**: Require `onboardedCoachProcedure` access
  - Ensures coaches have completed onboarding and school association
  - Provides automatic `coachId` and `schoolId` in context
- **Player Endpoints**: Require `playerProcedure` access
  - Ensures authenticated player access
  - Provides automatic `playerId` in context

### Refactoring Benefits

The router has been refactored from manual verification to structured procedures:

#### Before (Manual Verification)

```typescript
// Old pattern with duplicate verification logic
getConversations: protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.auth.userId;
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

  const coach = await ctx.db.coach.findUnique({ where: { clerk_id: userId } });
  if (!coach) throw new TRPCError({ code: "FORBIDDEN" });

  // ... endpoint logic using coach.id
});
```

#### After (Structured Procedures)

```typescript
// New pattern with automatic verification and context enhancement
getConversations: onboardedCoachProcedure.query(async ({ ctx }) => {
  const coachId = ctx.coachId; // Automatically provided
  // ... clean endpoint logic
});
```

## Coach Endpoints

### `getConversations`

- **Method**: Query (Onboarded Coach Only)
- **Input**: Conversation Filter Schema
- **Description**: Get all conversations for the authenticated coach
- **Returns**: List of conversations with player details and last messages
- **Authorization**: Onboarded coach access required (automatic via `onboardedCoachProcedure`)
- **Context**: Automatic `coachId` and `schoolId` available
- **Features**:
  - Search by player name or school
  - Filter by status (all, unread, starred, archived)
  - Pagination support with limit
  - Unread message counting

### `getConversation`

- **Method**: Query (Onboarded Coach Only)
- **Input**: Conversation ID Schema
- **Description**: Get detailed conversation with full message history
- **Returns**: Complete conversation data with all messages
- **Authorization**: Onboarded coach access required

### `sendMessage`

- **Method**: Mutation (Onboarded Coach Only)
- **Input**: Message Creation Schema
- **Description**: Send a message to a player
- **Returns**: Created message details
- **Behavior**:
  - Can use existing conversation ID or create new conversation with player ID
  - Automatically creates conversation if none exists
  - Updates conversation timestamp
- **Authorization**: Onboarded coach access required

### `sendBulkMessage`

- **Method**: Mutation (Onboarded Coach Only)
- **Input**: Bulk Message Schema
- **Description**: Send the same message to multiple players simultaneously
- **Returns**: Bulk operation results
- **Features**:
  - Maximum 50 recipients per bulk operation
  - Creates individual conversations for each player
- **Authorization**: Onboarded coach access required

### `markAsRead`

- **Method**: Mutation (Onboarded Coach Only)
- **Input**: Mark Read Schema
- **Description**: Mark messages as read in a conversation
- **Returns**: Operation success status
- **Authorization**: Onboarded coach access required

### `toggleStar`

- **Method**: Mutation (Onboarded Coach Only)
- **Input**: Conversation ID Schema
- **Description**: Star or unstar a conversation
- **Returns**: Updated star status
- **Authorization**: Onboarded coach access required

### `getAvailablePlayers`

- **Method**: Query (Onboarded Coach Only)
- **Input**: Player Search Schema
- **Description**: Get list of players available for messaging
- **Returns**: List of players with profile information
- **Features**:
  - Search by player name
  - Filter by game (optional)
  - Includes player stats and game profiles
- **Authorization**: Onboarded coach access required

## Player Endpoints

### `getPlayerConversations`

- **Method**: Query (Player Only)
- **Input**: Conversation Filter Schema
- **Description**: Get all conversations for the authenticated player
- **Returns**: List of conversations with coach details and last messages
- **Authorization**: Player access required (automatic via `playerProcedure`)
- **Context**: Automatic `playerId` available
- **Features**:
  - Search by coach name or school
  - Filter by status (all, unread, starred, archived)
  - Unread message counting from coaches

### `getPlayerConversation`

- **Method**: Query (Player Only)
- **Input**: Conversation ID Schema
- **Description**: Get detailed conversation with full message history
- **Returns**: Complete conversation data with all messages
- **Authorization**: Player access required
- **Verification**: Player can only access their own conversations

### `sendPlayerMessage`

- **Method**: Mutation (Player Only)
- **Input**: Player Message Schema
- **Description**: Send a message from player to coach
- **Returns**: Created message details
- **Behavior**:
  - Can use existing conversation ID or create new conversation with coach ID
  - Automatically creates conversation if none exists
  - Updates conversation timestamp
- **Authorization**: Player access required

### `markPlayerMessagesAsRead`

- **Method**: Mutation (Player Only)
- **Input**: Mark Read Schema
- **Description**: Mark messages as read in a conversation
- **Returns**: Operation success status
- **Authorization**: Player access required

### `togglePlayerStar`

- **Method**: Mutation (Player Only)
- **Input**: Conversation ID Schema
- **Description**: Star or unstar a conversation
- **Returns**: Updated star status
- **Authorization**: Player access required

### `getAvailableCoaches`

- **Method**: Query (Player Only)
- **Input**: Coach Search Schema
- **Description**: Get list of coaches available for messaging
- **Returns**: List of coaches with school information
- **Features**:
  - Search by coach name
  - Includes school association details
- **Authorization**: Player access required

## Input Schemas

### Conversation Filter Schema

```typescript
{
  search?: string;
  filter: "all" | "unread" | "starred" | "archived";
  limit: number; // 1-100, default 50
}
```

### Message Creation Schema

```typescript
{
  conversationId?: string; // UUID
  playerId?: string; // UUID (for new conversations)
  content: string; // 1-2000 characters, trimmed
}
```

### Player Message Schema

```typescript
{
  conversationId?: string; // UUID
  coachId?: string; // UUID (for new conversations)
  content: string; // 1-2000 characters, trimmed
}
```

### Bulk Message Schema

```typescript
{
  playerIds: string[]; // 1-50 UUIDs
  content: string; // 1-2000 characters, trimmed
}
```

### Mark Read Schema

```typescript
{
  conversationId: string; // UUID
  messageIds?: string[]; // Optional specific message UUIDs
}
```

## Error Handling

### Common Error Codes

- **`UNAUTHORIZED`**: User not authenticated
- **`FORBIDDEN`**: User not authorized for role (coach/player/onboarded)
- **`NOT_FOUND`**: Conversation, player, or coach not found
- **`BAD_REQUEST`**: Invalid input or missing required parameters
- **`INTERNAL_SERVER_ERROR`**: Database or system errors

### Authorization-Specific Errors

- **Coach Endpoints**: Require onboarded coach status
  - Automatic verification through `onboardedCoachProcedure`
  - No additional manual verification needed
- **Player Endpoints**: Require player authentication
  - Automatic verification through `playerProcedure`
  - No additional manual verification needed

## Usage Examples

### Frontend Integration (Coach)

```typescript
// Get conversations for coach
const { data: conversations } = api.messages.getConversations.useQuery({
  filter: "unread",
  search: "John",
  limit: 20,
});

// Send message to player
const sendMessage = api.messages.sendMessage.useMutation({
  onSuccess: (data) => {
    console.log(`Message sent: ${data.id}`);
  },
});

// Get available players
const { data: players } = api.messages.getAvailablePlayers.useQuery({
  search: "Basketball",
  limit: 30,
});
```

### Frontend Integration (Player)

```typescript
// Get conversations for player
const { data: conversations } = api.messages.getPlayerConversations.useQuery({
  filter: "all",
  limit: 20,
});

// Send message to coach
const sendMessage = api.messages.sendPlayerMessage.useMutation({
  onSuccess: (data) => {
    console.log(`Reply sent: ${data.id}`);
  },
});

// Get available coaches
const { data: coaches } = api.messages.getAvailableCoaches.useQuery({
  search: "University",
  limit: 25,
});
```

## Security Features

- **Role-based Access Control**: Strict separation of coach and player capabilities
- **Resource Ownership**: Users can only access their own conversations
- **Onboarding Requirements**: Coaches must be onboarded to access messaging
- **Input Validation**: Comprehensive validation with Zod schemas
- **Content Sanitization**: Message content trimmed and length-limited
- **Rate Limiting**: Bulk message limits to prevent spam

## Performance Considerations

- **Optimized Queries**: Selective field inclusion and proper joins
- **Pagination**: Configurable limits for conversation lists
- **Index Usage**: Efficient database queries with proper indexing
- **Conversation Threading**: Optimized message ordering and retrieval

## Integration with Other Systems

### Recruitment System

- Messaging integrated with player profiles and recruitment workflows
- Coach school associations verified for onboarded status
- Player game profiles included in messaging context

### Profile Systems

- Links to both coach and player profile data
- School association details included in conversations
- Game profile information for context

### Authentication System

- Full integration with Clerk authentication
- Role-based access through tRPC procedures
- Automatic context enhancement with user-specific data

## Related Documentation

- [Coach Profile Router](./coachProfile.md) - For onboarding requirements
- [Player Profile Router](./playerProfile.md) - For player profile integration
- [tRPC Procedures](../schema-documentation.md) - For procedure architecture details

---

_Last updated: December 2024_
_Version: 1.2.0_
