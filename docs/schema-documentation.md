# EVAL Gaming Platform - Database Schema Documentation

This document provides comprehensive documentation for the EVAL Gaming Platform database schema. The schema is designed to support a competitive esports platform that connects players, coaches, schools, and organizes tournaments, tryouts, and combines.

## Table of Contents

1. [Overview](#overview)
2. [API Architecture](#api-architecture)
3. [Database Configuration](#database-configuration)
4. [Core Models](#core-models)
5. [Model Relationships](#model-relationships)
6. [Enums](#enums)
7. [Indexes and Performance](#indexes-and-performance)
8. [Data Flow Examples](#data-flow-examples)

## Overview

The EVAL Gaming Platform database is organized into several key functional areas:

- **User Management**: Player and Coach profiles with Clerk authentication
- **Educational Institutions**: School management and associations
- **Gaming Profiles**: Game-specific player profiles and statistics
- **Competition**: Teams, tournaments, leagues, and rankings
- **Events**: Tryouts and combines for recruitment
- **Communication**: Messaging system between coaches and players
- **Performance**: Statistics and ranking systems

## API Architecture

The EVAL Gaming Platform uses a structured tRPC-based API with role-based access control through custom procedures.

### Procedure Types

#### `publicProcedure`

- **Access**: No authentication required
- **Use Cases**: Browsing public content, viewing tryouts/combines, general information
- **Context**: Basic request context only

#### `protectedProcedure`

- **Access**: Authenticated users only
- **Verification**: Clerk authentication
- **Context**: Includes `auth` object with user information

#### `playerProcedure`

- **Access**: Authenticated players only
- **Verification**:
  - Clerk authentication
  - Valid player profile in database
- **Context**: Includes `playerId` automatically
- **Use Cases**: Player registrations, dashboard views, profile management

```typescript
// Example usage
getPlayerRegistrations: playerProcedure
  .input(z.object({ status: z.enum(["upcoming", "past", "all"]) }))
  .query(async ({ ctx, input }) => {
    const { playerId } = ctx; // Automatically available
    // Query player's data
  });
```

#### `onboardedCoachProcedure`

- **Access**: Fully onboarded coaches only
- **Verification**:
  - Clerk authentication
  - `publicMetadata.onboarded === true`
  - `publicMetadata.userType === "coach"`
  - Valid coach profile in database
- **Context**: Includes `coachId` and `schoolId` automatically
- **Use Cases**: Managing tryouts/combines, player applications, administrative functions

```typescript
// Example usage
createTryout: onboardedCoachProcedure
  .input(tryoutCreationSchema)
  .mutation(async ({ ctx, input }) => {
    const { coachId, schoolId } = ctx; // Automatically available
    // Create tryout with proper associations
  });
```

#### `coachProcedure` (Available but Limited Use)

- **Access**: Any authenticated coach
- **Verification**: Clerk authentication + coach profile
- **Context**: Includes `coachId` and `schoolId`
- **Use Cases**: Basic coach operations that don't require full onboarding

### Authorization Levels

1. **Public Access**: General browsing, viewing published content
2. **Player Access**: Registration management, personal dashboard
3. **Regular Coach Access**: Basic profile management only
4. **Onboarded Coach Access**: Full administrative capabilities
   - Creating and managing events
   - Player recruitment and communication
   - Application review and status updates
   - School-associated operations

### Middleware Architecture

```typescript
// Authentication flow
protectedProcedure // Base authentication
  .use(isPlayer) // Player verification middleware
  // OR
  .use(isOnboardedCoach); // Onboarded coach verification middleware
```

The middleware system provides:

- **Automatic context enhancement**: Role-specific data available in context
- **Database verification**: Ensures profiles exist and are valid
- **Error handling**: Consistent error responses for authorization failures
- **Type safety**: TypeScript ensures correct context usage

### Security Features

- **Role-based Access Control**: Strict separation of player and coach capabilities
- **Resource Ownership**: Automatic verification of resource ownership
- **Onboarding Requirements**: Critical operations require completed onboarding
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **Rate Limiting**: Built-in tRPC middleware support

## Database Configuration

```prisma
generator client {
    provider      = "prisma-client-js"
    binaryTargets = ["native", "debian-openssl-3.0.x"]
}

datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
}
```

- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk integration
- **UUID Generation**: PostgreSQL native `gen_random_uuid()`

## Core Models

### User Management

#### Player Model

The central model for student athletes on the platform.

```prisma
model Player {
    id                String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    clerk_id          String  @unique
    email             String  @unique
    first_name        String
    last_name         String
    username          String? @unique
    image_url         String?
    // ... additional fields
}
```

**Key Features:**

- Clerk authentication integration
- Academic information (GPA, class year, intended major)
- School associations
- Gaming profiles across multiple games
- Performance statistics and rankings
- Communication with coaches

**Academic Fields:**

- `gpa`: Academic performance (0.00-4.00 scale)
- `class_year`: "Freshman", "Sophomore", etc.
- `graduation_date`: Expected graduation
- `intended_major`: Academic focus
- `transcript`: File upload for academic records

**Contact Information:**

- `guardian_email`: Parent/guardian contact
- `scholastic_contact`: School counselor/teacher
- `extra_curriculars`: Additional activities

#### Coach Model

Represents coaching staff at educational institutions.

```prisma
model Coach {
    id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    clerk_id          String   @unique
    email             String   @unique
    first_name        String
    last_name         String
    username          String   @unique
    school_id         String?  @db.Uuid
    // ... additional fields
}
```

**Key Features:**

- School association management
- Team and tryout creation
- Player recruitment and messaging
- Performance tracking

### Educational Institutions

#### School Model

Represents educational institutions (high schools, colleges, universities).

```prisma
model School {
    id         String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    name       String
    type       SchoolType
    location   String
    state      String
    region     String?
    website    String?
    logo_url   String?
    bio        String?
    email      String?
    phone      String?
    // ... relationships
}
```

**School Types:**

- `HIGH_SCHOOL`: Secondary education
- `COLLEGE`: Two-year institutions
- `UNIVERSITY`: Four-year institutions

**Enhanced Features:**

- Public profile pages
- Contact information
- Program descriptions
- Coach associations

#### SchoolAssociationRequest Model

Manages the onboarding process for coaches joining schools.

```prisma
model SchoolAssociationRequest {
    id              String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    coach_id        String                  @db.Uuid
    school_id       String                  @db.Uuid
    status          SchoolAssociationStatus @default(PENDING)
    request_message String?
    admin_notes     String?
    // ... additional fields
}
```

**Workflow:**

1. Coach requests association with school
2. Admin reviews request
3. Request approved/rejected with notes
4. Coach gains access to school resources

### Gaming System

#### Game Model

Represents supported esports titles.

```prisma
model Game {
    id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    name       String   @unique
    short_name String   @unique
    icon       String?
    color      String?
    // ... relationships
}
```

**Supported Games:**

- VALORANT (VAL)
- Overwatch 2 (OW2)
- Rocket League (RL)
- Super Smash Bros. Ultimate (SSBU)
- League of Legends (LoL)

#### PlayerGameProfile Model

Game-specific player statistics and information.

```prisma
model PlayerGameProfile {
    id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    player_id String @db.Uuid
    game_id   String @db.Uuid
    username  String
    rank      String?
    rating    Float?
    role      String?
    agents         String[]
    preferred_maps String[]
    play_style     String?
    combine_score  Float?
    league_score   Float?
    // ... additional fields
}
```

**EVAL Composite Scores:**

- `combine_score`: Performance in EVAL combines (0-100)
- `league_score`: Performance in EVAL leagues (0-100)

**Game-Specific Data:**

- **VALORANT**: Agents, maps, rank (Iron → Radiant)
- **Overwatch**: Heroes, role, SR rating
- **Rocket League**: Rank, playstyle
- **Smash Ultimate**: Characters, tournament results

### Competition System

#### Team Model

Represents school esports teams for specific games.

```prisma
model Team {
    id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    name       String
    school_id  String   @db.Uuid
    game_id    String   @db.Uuid
    coach_id   String?  @db.Uuid
    tier       TeamTier @default(COMPETITIVE)
    active     Boolean  @default(true)
    // ... relationships
}
```

**Team Tiers:**

- `ELITE`: Top-level competitive teams
- `PROFESSIONAL`: Semi-professional level
- `COMPETITIVE`: Standard competitive teams
- `DEVELOPMENTAL`: Training/junior teams

#### League System

Organized competitive leagues with rankings.

```prisma
model League {
    id          String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    name        String
    short_name  String
    game_id     String       @db.Uuid
    tier        LeagueTier   @default(COLLEGIATE)
    status      LeagueStatus @default(UPCOMING)
    season      String
    region      String
    // ... additional fields
}
```

**League Features:**

- Seasonal competition structure
- Regional organization
- Multiple tier levels
- Team and player participation tracking

### Events System

#### Tryout Model

School-hosted recruitment events.

```prisma
model Tryout {
    id               String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    title            String
    description      String
    long_description String?
    game_id    String       @db.Uuid
    school_id  String       @db.Uuid
    coach_id   String?      @db.Uuid
    date       DateTime     @db.Timestamp(6)
    location   String
    type       EventType
    status     TryoutStatus @default(DRAFT)
    // ... additional fields
}
```

**Event Types:**

- `ONLINE`: Virtual events
- `IN_PERSON`: Physical location events
- `HYBRID`: Combined online/offline

**Tryout Features:**

- Registration management
- Spot limitations
- Academic requirements (GPA, class year)
- Role-specific requirements

#### Combine Model

Competitive evaluation events for player assessment.

```prisma
model Combine {
    id               String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    title            String
    description      String
    game_id    String    @db.Uuid
    date       DateTime  @db.Timestamp(6)
    location   String
    type       EventType
    status     CombineStatus
    max_spots     Int
    prize_pool    String
    invite_only   Boolean @default(false)
    // ... additional fields
}
```

**Combine Features:**

- Standardized player evaluation
- Prize pools and competitive structure
- Invite-only or open registration
- Performance scoring system

### Communication System

#### Conversation Model

Manages messaging between coaches and players.

```prisma
model Conversation {
    id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    coach_id   String   @db.Uuid
    player_id  String   @db.Uuid
    created_at DateTime @default(now()) @db.Timestamp(6)
    updated_at DateTime @updatedAt
    // ... relationships
}
```

#### Message Model

Individual messages within conversations.

```prisma
model Message {
    id              String     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    conversation_id String     @db.Uuid
    sender_id       String     @db.Uuid
    sender_type     SenderType
    content         String
    sent_at         DateTime   @default(now()) @db.Timestamp(6)
    read_at         DateTime?  @db.Timestamp(6)
    // ... relationships
}
```

### Performance & Analytics

#### PlayerRanking Model

Comprehensive ranking system across multiple categories.

```prisma
model PlayerRanking {
    id               String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    player_id        String          @db.Uuid
    game_id          String          @db.Uuid
    category         RankingCategory
    current_rank     Int
    previous_rank    Int?
    peak_rank        Int
    rating           Float
    // ... additional fields
}
```

**Ranking Categories:**

- `COMBINE`: Based on combine performance
- `LEAGUE`: Based on league performance
- `OVERALL`: Combined ranking
- `SEASONAL`: Season-specific rankings

#### CoachFavorite Model

Tracks coach interest in specific players for recruitment.

```prisma
model CoachFavorite {
    id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
    coach_id  String   @db.Uuid
    player_id String   @db.Uuid
    notes     String?
    tags      String[]
    created_at DateTime @default(now()) @db.Timestamp(6)
    // ... relationships
}
```

## Model Relationships

### One-to-Many Relationships

- **School → Players**: A school can have many students
- **School → Coaches**: A school can have multiple coaches
- **School → Teams**: A school can field multiple teams
- **School → Tryouts**: A school can host multiple tryouts
- **Game → PlayerGameProfiles**: A game can have many player profiles
- **Player → GameProfiles**: A player can have profiles for multiple games
- **Coach → Teams**: A coach can manage multiple teams
- **Coach → Tryouts**: A coach can organize multiple tryouts

### Many-to-Many Relationships

- **Teams ↔ Players**: Through TeamMember junction table
- **Leagues ↔ Teams**: Through LeagueTeam junction table
- **Leagues ↔ Schools**: Through LeagueSchool junction table
- **Tryouts ↔ Players**: Through TryoutRegistration junction table
- **Combines ↔ Players**: Through CombineRegistration junction table

## Enums

### SchoolType

```prisma
enum SchoolType {
    HIGH_SCHOOL
    COLLEGE
    UNIVERSITY
}
```

### EventType

```prisma
enum EventType {
    ONLINE
    IN_PERSON
    HYBRID
}
```

### RegistrationStatus

```prisma
enum RegistrationStatus {
    PENDING
    CONFIRMED
    WAITLISTED
    DECLINED
    CANCELLED
}
```

### TryoutStatus

```prisma
enum TryoutStatus {
    DRAFT
    PUBLISHED
    CANCELLED
    COMPLETED
}
```

### LeagueStatus

```prisma
enum LeagueStatus {
    UPCOMING
    ACTIVE
    COMPLETED
    CANCELLED
}
```

### SenderType

```prisma
enum SenderType {
    COACH
    PLAYER
}
```

## Indexes and Performance

### Primary Indexes

- All models use UUID primary keys with database-generated values
- Foreign key relationships are automatically indexed

### Performance Indexes

```prisma
// Player model indexes
@@index([school_id])
@@index([main_game_id])
@@index([class_year])
@@index([created_at])
@@index([location])

// Tryout model indexes
@@index([date])
@@index([status])
@@index([game_id])

// Message model indexes
@@index([conversation_id])
@@index([sent_at])
@@index([sender_id])
```

### Unique Constraints

- Player: `clerk_id`, `email`, `username`
- Coach: `clerk_id`, `email`, `username`
- School: Composite unique on `[name, type, state]`
- Game: `name`, `short_name`

## Data Flow Examples

### Player Registration Flow

1. Player signs up through Clerk authentication
2. Player model created with `clerk_id` reference
3. Player completes profile with academic information
4. Player creates game-specific profiles
5. Player can register for tryouts and combines

### Coach Onboarding Flow

1. Coach signs up through Clerk authentication
2. Coach model created with basic information
3. Coach submits `SchoolAssociationRequest`
4. Admin reviews and approves/rejects request
5. Approved coach gains access to school resources
6. Coach can create teams, tryouts, and message players

### Tryout Management Flow

1. Coach creates tryout event (DRAFT status)
2. Coach configures requirements and details
3. Tryout published (PUBLISHED status)
4. Players register through `TryoutRegistration`
5. Coach manages registrations and selections
6. Event completed with results tracking

### Messaging Flow

1. Coach discovers player through search
2. Coach favorites player for tracking
3. Coach initiates conversation
4. Messages exchanged through `Conversation` and `Message` models
5. Read/unread status tracked for both parties

### Performance Tracking Flow

1. Player participates in combines/leagues
2. Performance data recorded in game profiles
3. EVAL composite scores calculated and updated
4. Rankings updated across multiple categories
5. Historical performance preserved for analysis

## Security and Privacy Considerations

### Data Protection

- All sensitive data encrypted at rest
- PII fields properly managed according to privacy regulations
- Academic transcripts stored as secure file references

### Access Control

- School associations verified through admin approval
- Coaches can only access players within their scope
- Player data visibility controlled by privacy settings

### Authentication

- Clerk integration provides secure authentication
- External account connections managed through Clerk
- Session management handled by Clerk infrastructure

## Migration and Maintenance

### Schema Evolution

- Use Prisma migrations for schema changes
- Maintain backward compatibility when possible
- Test migrations thoroughly in staging environment

### Data Integrity

- Foreign key constraints enforce referential integrity
- Enum values provide data consistency
- Required fields prevent incomplete records

### Performance Monitoring

- Regular index analysis and optimization
- Query performance monitoring
- Database connection pooling optimization

## Future Considerations

### Planned Enhancements

- Additional game support
- Enhanced analytics and reporting
- Mobile application support
- Real-time features (live scoring, chat)

### Scalability

- Database sharding strategies for growth
- Read replica configuration for performance
- Caching layer implementation
- API rate limiting and optimization

This schema provides a robust foundation for the EVAL Gaming Platform, supporting comprehensive esports recruitment, competition management, and performance tracking while maintaining flexibility for future growth and enhancement.
