# Messages Router Documentation

## Overview

The messaging router powers direct coach/player conversations with:

- Coach inbox and player inbox list/detail views
- Per-participant conversation state
  - `starred` is private to each side
  - `archived` is private to each side
- Polling-based message refresh with read tracking
- Coach bulk outbound messaging
- Player outbound quota enforcement

## Product Rules

- Coaches:
  - Must be onboarded
  - Can start conversations with players
  - Can send bulk messages to players
- Players:
  - Can always reply inside existing conversations
  - Can start up to `3` new coach conversations per month for free
  - Can start unlimited new coach conversations with premium messaging access
- Premium messaging access is granted by either:
  - `direct_messaging`
  - `unlimited_messages`

## Key Endpoints

### Coach

- `getConversations`
- `getConversation`
- `getUnreadCount`
- `sendMessage`
- `sendBulkMessage`
- `markAsRead`
- `toggleStar`
- `toggleArchive`
- `getAvailablePlayers`

### Player

- `getPlayerMessagingStatus`
- `getPlayerConversations`
- `getPlayerConversation`
- `sendPlayerMessage`
- `markPlayerMessagesAsRead`
- `togglePlayerStar`
- `togglePlayerArchive`
- `getAvailableCoaches`

## Input Contracts

### Conversation List

```ts
{
  search?: string;
  filter: "all" | "unread" | "starred" | "archived";
  limit: number;
  cursor?: string;
}
```

Notes:

- `all`, `unread`, and `starred` exclude archived conversations for that participant
- `archived` returns only archived conversations for that participant
- `nextCursor` is returned when more rows are available

### Send Message

Coach:

```ts
{
  conversationId?: string;
  playerId?: string;
  content: string;
}
```

Player:

```ts
{
  conversationId?: string;
  coachId?: string;
  content: string;
}
```

Behavior:

- Existing `conversationId` continues a thread
- New `playerId` / `coachId` starts a thread if one does not already exist
- Starting a new player-to-coach thread consumes free quota unless the player has premium messaging access

### Mark Read

```ts
{
  conversationId: string;
  messageIds?: string[];
}
```

### Toggle Conversation State

```ts
{
  conversationId: string;
}
```

Supported mutations:

- `toggleStar`
- `toggleArchive`
- `togglePlayerStar`
- `togglePlayerArchive`

### Contact Discovery

Coach:

```ts
{
  search?: string;
  gameId?: string;
  limit: number;
}
```

Player:

```ts
{
  search?: string;
  limit: number;
}
```

## Messaging Status

`getPlayerMessagingStatus` returns:

```ts
{
  hasUnlimitedAccess: boolean;
  monthlyConversationStartLimit: number | null;
  monthlyConversationStartsUsed: number;
  monthlyConversationStartsRemaining: number | null;
  canStartConversation: boolean;
  canReplyToExistingConversation: boolean;
  resetsAt: Date | null;
}
```

## Observability

The messaging service emits structured events for:

- `conversation_created`
- `message_sent`
- `bulk_message_sent`
- `messages_marked_read`
- `conversation_star_toggled`
- `conversation_archive_toggled`
- `player_quota_checked`
- `player_quota_denied`
