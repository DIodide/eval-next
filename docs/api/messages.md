# Messages API Documentation

## Overview

The Messages API provides comprehensive messaging functionality between coaches and players in the EVAL Gaming platform. This system enables coaches to communicate with prospective players, manage conversations, and facilitate the recruiting process. Players can view and respond to messages from coaches, as well as initiate conversations with coaches.

## Database Schema

### Conversation Model

```prisma
model Conversation {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  coach_id   String   @db.Uuid
  player_id  String   @db.Uuid
  is_starred Boolean  @default(false)
  is_archived Boolean @default(false)
  created_at DateTime @default(now()) @db.Timestamp(6)
  updated_at DateTime @updatedAt

  coach    Coach     @relation(fields: [coach_id], references: [id], onDelete: Cascade)
  player   Player    @relation(fields: [player_id], references: [id], onDelete: Cascade)
  messages Message[]

  @@unique([coach_id, player_id], name: "coach_id_player_id")
  @@map("conversations")
}
```

### Message Model

```prisma
model Message {
  id              String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  conversation_id String     @db.Uuid
  sender_id       String     @db.Uuid
  sender_type     SenderType
  content         String     @db.Text
  is_read         Boolean    @default(false)
  created_at      DateTime   @default(now()) @db.Timestamp(6)

  conversation Conversation @relation(fields: [conversation_id], references: [id], onDelete: Cascade)

  @@map("messages")
}

enum SenderType {
  COACH
  PLAYER
}
```

## API Endpoints

## Coach Endpoints

### 1. Get Conversations

**Endpoint:** `messages.getConversations`  
**Method:** Query  
**Authentication:** Required (Coach only)

Retrieves a list of conversations for the authenticated coach with filtering and search capabilities.

#### Input Parameters

```typescript
{
  search?: string;           // Search by player name or school
  filter: "all" | "unread" | "starred" | "archived"; // Filter conversations
  limit: number;            // Max 100, default 50
}
```

#### Response

```typescript
{
  conversations: Array<{
    id: string;
    player: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      school?: string | null;
      classYear?: string | null;
      location?: string | null;
      gpa?: number | null;
      mainGame?: string;
      gameProfiles: Array<{
        game: string;
        rank?: string | null;
        role?: string | null;
        username: string;
      }>;
    };
    lastMessage: {
      id: string;
      content: string;
      senderType: "COACH" | "PLAYER";
      timestamp: Date;
      isRead: boolean;
    } | null;
    unreadCount: number;
    isStarred: boolean;
    isArchived: boolean;
    updatedAt: Date;
  }>;
  nextCursor: string | null;
}
```

### 2. Get Conversation Details

**Endpoint:** `messages.getConversation`  
**Method:** Query  
**Authentication:** Required (Coach only)

Retrieves detailed conversation information including full message history.

#### Input Parameters

```typescript
{
  conversationId: string; // UUID of the conversation
}
```

#### Response

```typescript
{
  id: string;
  player: {
    // Same as above
  }
  messages: Array<{
    id: string;
    senderId: string;
    senderType: "COACH" | "PLAYER";
    content: string;
    timestamp: Date;
    isRead: boolean;
  }>;
  isStarred: boolean;
  isArchived: boolean;
}
```

### 3. Send Message

**Endpoint:** `messages.sendMessage`  
**Method:** Mutation  
**Authentication:** Required (Coach only)

Sends a message to a player. Creates a new conversation if one doesn't exist.

#### Input Parameters

```typescript
{
  conversationId?: string; // Optional: existing conversation ID
  playerId?: string;       // Optional: player ID for new conversation
  content: string;         // Message content (1-2000 characters)
}
```

**Note:** Either `conversationId` or `playerId` must be provided.

#### Response

```typescript
{
  id: string;
  conversationId: string;
  content: string;
  timestamp: Date;
}
```

### 4. Send Bulk Messages

**Endpoint:** `messages.sendBulkMessage`  
**Method:** Mutation  
**Authentication:** Required (Coach only)

Sends the same message to multiple players simultaneously.

#### Input Parameters

```typescript
{
  playerIds: string[];     // Array of player UUIDs (1-50 players)
  content: string;         // Message content (1-2000 characters)
}
```

#### Response

```typescript
{
  success: boolean;
  messagesSent: number;
  results: Array<{
    playerId: string;
    conversationId: string;
    messageId: string;
  }>;
}
```

### 5. Mark Messages as Read

**Endpoint:** `messages.markAsRead`  
**Method:** Mutation  
**Authentication:** Required (Coach only)

Marks messages in a conversation as read.

#### Input Parameters

```typescript
{
  conversationId: string;
  messageIds?: string[];   // Optional: specific message IDs, otherwise all unread
}
```

#### Response

```typescript
{
  success: boolean;
  messagesMarked: number;
}
```

### 6. Toggle Star Conversation

**Endpoint:** `messages.toggleStar`  
**Method:** Mutation  
**Authentication:** Required (Coach only)

Stars or unstars a conversation for easy access.

#### Input Parameters

```typescript
{
  conversationId: string;
}
```

#### Response

```typescript
{
  success: boolean;
  isStarred: boolean;
}
```

### 7. Get Available Players

**Endpoint:** `messages.getAvailablePlayers`  
**Method:** Query  
**Authentication:** Required (Coach only)

Retrieves a list of players available for messaging.

#### Input Parameters

```typescript
{
  search?: string;         // Search by name or school
  gameId?: string;         // Filter by specific game
  limit: number;          // Max 100, default 50
}
```

#### Response

```typescript
Array<{
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  school?: string | null;
  classYear?: string | null;
  location?: string | null;
  gpa?: number | null;
  mainGame?: string;
  gameProfiles: Array<{
    game: string;
    rank?: string | null;
    role?: string | null;
    username: string;
  }>;
}>;
```

## Player Endpoints

### 8. Get Player Conversations

**Endpoint:** `messages.getPlayerConversations`  
**Method:** Query  
**Authentication:** Required (Player only)

Retrieves a list of conversations for the authenticated player with filtering and search capabilities.

#### Input Parameters

```typescript
{
  search?: string;           // Search by coach name or school
  filter: "all" | "unread" | "starred" | "archived"; // Filter conversations
  limit: number;            // Max 100, default 50
}
```

#### Response

```typescript
{
  conversations: Array<{
    id: string;
    coach: {
      id: string;
      name: string;
      email: string;
      avatar?: string | null;
      school?: string | null;
      schoolId?: string | null;
    };
    lastMessage: {
      id: string;
      content: string;
      senderType: "COACH" | "PLAYER";
      timestamp: Date;
      isRead: boolean;
    } | null;
    unreadCount: number;
    isStarred: boolean;
    isArchived: boolean;
    updatedAt: Date;
  }>;
  nextCursor: string | null;
}
```

### 9. Get Player Conversation Details

**Endpoint:** `messages.getPlayerConversation`  
**Method:** Query  
**Authentication:** Required (Player only)

Retrieves detailed conversation information including full message history for a player.

#### Input Parameters

```typescript
{
  conversationId: string; // UUID of the conversation
}
```

#### Response

```typescript
{
  id: string;
  coach: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    school?: string | null;
    schoolId?: string | null;
  };
  messages: Array<{
    id: string;
    senderId: string;
    senderType: "COACH" | "PLAYER";
    content: string;
    timestamp: Date;
    isRead: boolean;
  }>;
  isStarred: boolean;
  isArchived: boolean;
}
```

### 10. Send Player Message

**Endpoint:** `messages.sendPlayerMessage`  
**Method:** Mutation  
**Authentication:** Required (Player only)

Sends a message from player to coach. Can be used to reply to existing conversations or initiate new conversations.

#### Input Parameters

```typescript
{
  conversationId?: string; // Optional: existing conversation ID
  coachId?: string;        // Optional: coach ID for new conversation
  content: string;         // Message content (1-2000 characters)
}
```

**Note:** Either `conversationId` or `coachId` must be provided.

#### Response

```typescript
{
  id: string;
  conversationId: string;
  content: string;
  timestamp: Date;
}
```

### 11. Mark Player Messages as Read

**Endpoint:** `messages.markPlayerMessagesAsRead`  
**Method:** Mutation  
**Authentication:** Required (Player only)

Marks messages as read for a player.

#### Input Parameters

```typescript
{
  conversationId: string;
  messageIds?: string[];   // Optional: specific message IDs, otherwise all unread
}
```

#### Response

```typescript
{
  success: boolean;
  messagesMarked: number;
}
```

### 12. Toggle Player Star

**Endpoint:** `messages.togglePlayerStar`  
**Method:** Mutation  
**Authentication:** Required (Player only)

Stars or unstars a conversation for a player.

#### Input Parameters

```typescript
{
  conversationId: string;
}
```

#### Response

```typescript
{
  success: boolean;
  isStarred: boolean;
}
```

### 13. Get Available Coaches

**Endpoint:** `messages.getAvailableCoaches`  
**Method:** Query  
**Authentication:** Required (Player only)

Retrieves a list of coaches available for messaging by players.

#### Input Parameters

```typescript
{
  search?: string;         // Search by coach name or school
  limit: number;          // Max 100, default 50
}
```

#### Response

```typescript
Array<{
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  school?: string | null;
  schoolName?: string | null;
  username?: string;
}>;
```

## Security & Authorization

### Authentication

- All endpoints require user authentication via Clerk
- Coach endpoints: Only coaches can access coach-specific functionality
- Player endpoints: Only players can access player-specific functionality
- Conversations are isolated by user type and ownership

### Data Access

- Coaches can only access their own conversations
- Players can only access conversations where they are participants
- Conversation access is verified by coach_id or player_id
- All database queries include ownership checks

### Input Validation

- Message content: 1-2000 characters, trimmed
- Player IDs: Valid UUIDs only
- Bulk messaging: Limited to 50 players maximum (coach only)
- Search queries: Sanitized for SQL injection prevention

## Error Handling

### Common Error Codes

- `UNAUTHORIZED`: User not authenticated
- `FORBIDDEN`: User is not authorized for the specific endpoint or accessing unauthorized data
- `NOT_FOUND`: Conversation, player, coach, or message not found
- `BAD_REQUEST`: Invalid input parameters
- `INTERNAL_SERVER_ERROR`: Database or server errors

### Error Response Format

```typescript
{
  error: {
    code: string;
    message: string;
  }
}
```

## Usage Examples

### Frontend Integration (React + tRPC)

#### Coach Usage

```typescript
// Get conversations
const { data: conversations, isLoading } =
  api.messages.getConversations.useQuery({
    filter: "unread",
    limit: 20,
  });

// Send a message
const sendMessage = api.messages.sendMessage.useMutation({
  onSuccess: () => {
    toast.success("Message sent!");
    // Refetch conversations
  },
});

// Send bulk messages
const sendBulkMessage = api.messages.sendBulkMessage.useMutation({
  onSuccess: (data) => {
    toast.success(`Sent ${data.messagesSent} messages`);
  },
});
```

#### Player Usage

```typescript
// Get player conversations
const { data: conversations, isLoading } =
  api.messages.getPlayerConversations.useQuery({
    filter: "all",
    limit: 20,
  });

// Get available coaches to message
const { data: coaches, isLoading: coachesLoading } =
  api.messages.getAvailableCoaches.useQuery({
    search: searchQuery,
    limit: 50,
  });

// Send a response to existing conversation
const sendMessage = api.messages.sendPlayerMessage.useMutation({
  onSuccess: () => {
    toast.success("Message sent!");
  },
});

// Start new conversation with a coach
const startConversation = api.messages.sendPlayerMessage.useMutation({
  onSuccess: () => {
    toast.success("Conversation started!");
  },
});

// Usage examples:
// Reply to existing conversation
sendMessage.mutate({
  conversationId: "conversation-uuid",
  content: "Thank you for reaching out!",
});

// Start new conversation
startConversation.mutate({
  coachId: "coach-uuid",
  content: "Hi, I'm interested in your esports program...",
});

// Mark messages as read
const markAsRead = api.messages.markPlayerMessagesAsRead.useMutation({
  onSuccess: () => {
    toast.success("Messages marked as read");
  },
});
```

### Backend Usage (Server-side)

```typescript
// Create tRPC caller
const trpc = createCaller(createContext);

// Send message programmatically
const result = await trpc.messages.sendMessage({
  playerId: "player-uuid",
  content: "Welcome to our program!",
});
```

## Performance Considerations

### Database Optimization

- Indexed fields: `coach_id`, `player_id`, `conversation_id`, `created_at`
- Composite unique constraint on `coach_id + player_id`
- Pagination support for large conversation lists

### Caching Strategy

- Conversation lists cached for 30 seconds
- Message history cached per conversation
- Player lists cached for 5 minutes

### Rate Limiting

- Bulk messaging: 50 players maximum per request (coach only)
- Message sending: 100 messages per minute per user
- API calls: 1000 requests per hour per user

## Best Practices

### For Coaches

1. **Professional Communication**: Maintain respectful, professional tone
2. **Timely Responses**: Respond promptly to maintain engagement
3. **Clear Information**: Provide specific details about opportunities
4. **Organized Conversations**: Use starring and archiving features

### For Players

1. **Authentic Communication**: Show genuine personality and passion
2. **Prompt Responses**: Quick responses show interest and professionalism
3. **Ask Questions**: Show interest in program, team culture, and opportunities
4. **Share Goals**: Communicate academic and esports aspirations clearly

### For Developers

1. **Error Handling**: Always handle API errors gracefully
2. **Loading States**: Show loading indicators for better UX
3. **Real-time Updates**: Consider implementing WebSocket for live messaging
4. **Data Validation**: Validate input on both client and server

## Future Enhancements

### Planned Features

- Real-time messaging with WebSocket support
- Message attachments (images, documents)
- Message templates for common recruiting scenarios
- Conversation analytics and metrics
- Message scheduling and automation
- Group conversations for team recruiting
- Advanced coach discovery and filtering

### Technical Improvements

- Message encryption for sensitive information
- Advanced search with full-text indexing
- Message export functionality
- Integration with external recruiting platforms
- Mobile push notifications

## Support

For technical support or questions about the Messages API:

- Documentation: `/docs/api/messages.md`
- API Reference: Generated from tRPC schema
- Support: Contact development team

---

_Last updated: December 2024_
_Version: 1.2.0_
