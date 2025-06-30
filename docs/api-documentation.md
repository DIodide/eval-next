# EVAL Gaming - Comprehensive API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [tRPC API Reference](#trpc-api-reference)
4. [REST API Endpoints](#rest-api-endpoints)
5. [Database Schema](#database-schema)
6. [React Components](#react-components)
7. [Custom Hooks](#custom-hooks)
8. [Utility Functions](#utility-functions)
9. [Type Definitions](#type-definitions)
10. [Examples & Usage](#examples--usage)

## Overview

EVAL Gaming is a college esports recruiting platform built with Next.js 15, TypeScript, tRPC, and Prisma. The platform provides type-safe APIs for player profiles, coach management, tryout organization, and competitive leagues across multiple gaming titles.

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: tRPC, Prisma ORM, PostgreSQL
- **Authentication**: Clerk
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **State Management**: TanStack Query (React Query)

### Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`
- **tRPC Endpoint**: `/api/trpc`

---

## Authentication & Authorization

### User Roles

The platform supports two primary user types:

```typescript
type UserRole = "player" | "coach" | null;
```

### Permission System

#### `getUserRole(user: ClerkUser): UserRole`

Extracts the user role from Clerk user metadata.

**Parameters:**
- `user` - Clerk user object (server or client)

**Returns:** User role or null

**Example:**
```typescript
import { getUserRole } from "@/lib/permissions";

const role = getUserRole(user);
if (role === "coach") {
  // Show coach features
}
```

#### `isCoachOnboarded(user: ClerkUser): boolean`

Checks if a coach has completed onboarding.

**Parameters:**
- `user` - Clerk user object

**Returns:** Boolean indicating onboarding status

#### `canAccessCoachFeatures(user: ClerkUser): boolean`

Determines if user can access coach-only features.

**Example:**
```typescript
if (canAccessCoachFeatures(user)) {
  // Show coach dashboard
}
```

### tRPC Procedures

- `publicProcedure` - No authentication required
- `playerProcedure` - Requires player role
- `onboardedCoachProcedure` - Requires onboarded coach role

---

## tRPC API Reference

The API is organized into routers, each handling a specific domain:

### AppRouter Structure

```typescript
export const appRouter = createTRPCRouter({
  playerProfile: playerProfileRouter,
  coachProfile: coachProfileRouter,
  schoolProfile: schoolProfileRouter,
  tryouts: tryoutsRouter,
  combines: combinesRouter,
  messages: messagesRouter,
  playerSearch: playerSearchRouter,
  leagues: leaguesRouter,
  schoolAssociationRequests: schoolAssociationRequestsRouter,
});
```

### Client Usage

```typescript
import { api } from "@/trpc/react";

// Query example
const { data: profile } = api.playerProfile.getProfile.useQuery();

// Mutation example
const updateProfile = api.playerProfile.updateProfile.useMutation({
  onSuccess: () => {
    console.log("Profile updated successfully");
  },
});
```

### Player Profile Router

#### Queries

##### `getProfile`
Gets complete player profile with relationships.

**Authentication:** Player required
**Returns:** Complete player profile

**Example:**
```typescript
const { data: profile } = api.playerProfile.getProfile.useQuery();
```

##### `getBasicProfile`
Gets essential profile information for faster loading.

**Authentication:** Player required
**Returns:** Basic profile data

##### `getConnections`
Gets platform and social connections.

**Authentication:** Player required
**Returns:** Platform and social connections

##### `getRecruitingInfo`
Gets recruiting-specific information.

**Authentication:** Player required
**Returns:** Academic and recruiting data

##### `getPublicProfile`
Gets public profile by username.

**Authentication:** Public
**Input:** `{ username: string }`
**Returns:** Public profile data

**Example:**
```typescript
const { data: publicProfile } = api.playerProfile.getPublicProfile.useQuery({
  username: "player123"
});
```

##### `getAllGames`
Gets all available games for main game selection.

**Authentication:** Public
**Returns:** Array of games

#### Mutations

##### `updateProfile`
Updates player profile information.

**Authentication:** Player required
**Input:** Profile update schema
**Returns:** Updated profile

**Input Schema:**
```typescript
{
  first_name?: string;
  last_name?: string;
  username?: string;
  location?: string;
  bio?: string;
  school?: string;
  gpa?: number; // 0-4.0
  class_year?: string;
  graduation_date?: string;
  intended_major?: string;
  guardian_email?: string;
  scholastic_contact?: string;
  scholastic_contact_email?: string;
  extra_curriculars?: string;
  academic_bio?: string;
  main_game_id?: string;
}
```

**Example:**
```typescript
const updateProfile = api.playerProfile.updateProfile.useMutation();

await updateProfile.mutateAsync({
  bio: "Aspiring esports professional",
  gpa: 3.8,
  class_year: "2025"
});
```

##### `updatePlatformConnection`
Updates gaming platform connections.

**Authentication:** Player required
**Input:** Platform connection schema
**Returns:** Updated connection

**Input Schema:**
```typescript
{
  platform: "steam" | "valorant" | "battlenet" | "epicgames" | "startgg";
  username: string; // min 3 characters
}
```

##### `updateSocialConnection`
Updates social media connections.

**Authentication:** Player required
**Input:** Social connection schema
**Returns:** Updated connection

**Input Schema:**
```typescript
{
  platform: "github" | "discord" | "instagram" | "twitch" | "x";
  username: string; // min 3 characters
}
```

##### `removePlatformConnection`
Removes a platform connection.

**Authentication:** Player required
**Input:** `{ platform: string }`
**Returns:** Success status

##### `removeSocialConnection`
Removes a social media connection.

**Authentication:** Player required
**Input:** `{ platform: string }`
**Returns:** Success status

### Coach Profile Router

#### Queries

##### `getProfile`
Gets complete coach profile.

**Authentication:** Coach required
**Returns:** Complete coach profile

##### `getOnboardingStatus`
Gets coach onboarding status.

**Authentication:** Coach required
**Returns:** Onboarding status object

**Return Type:**
```typescript
{
  isOnboarded: boolean;
  hasSchoolAssociation: boolean;
  hasPendingRequest: boolean;
  canRequestAssociation: boolean;
}
```

##### `getPublicProfile`
Gets public coach profile by username.

**Authentication:** Public
**Input:** `{ username: string }`
**Returns:** Public coach profile

#### Mutations

##### `updateProfile`
Updates coach profile information.

**Authentication:** Coach required
**Input:** Coach update schema
**Returns:** Updated profile

### Tryouts Router

#### Queries

##### `getAll`
Gets all public tryouts with filtering.

**Authentication:** Public
**Input:** Filter options
**Returns:** Paginated tryouts

**Input Schema:**
```typescript
{
  page?: number; // default: 1
  limit?: number; // default: 10, max: 100
  game_id?: string;
  state?: string;
  school_type?: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
  class_years?: string[];
  date_range?: {
    start: Date;
    end: Date;
  };
}
```

**Example:**
```typescript
const { data: tryouts } = api.tryouts.getAll.useQuery({
  game_id: "valorant-uuid",
  state: "California",
  page: 1,
  limit: 20
});
```

##### `getById`
Gets specific tryout details.

**Authentication:** Public
**Input:** `{ id: string }`
**Returns:** Tryout details

##### `getRegistrations`
Gets tryout registrations (coach only).

**Authentication:** Onboarded coach required
**Input:** `{ tryout_id: string }`
**Returns:** Registration list

#### Mutations

##### `create`
Creates a new tryout.

**Authentication:** Onboarded coach required
**Input:** Tryout creation schema
**Returns:** Created tryout

**Input Schema:**
```typescript
{
  title: string;
  description: string;
  long_description?: string;
  game_id: string;
  date: Date;
  time_start?: string;
  time_end?: string;
  location: string;
  type: "IN_PERSON" | "ONLINE";
  price: string;
  max_spots: number;
  registration_deadline?: Date;
  min_gpa?: number; // 0-4.0
  class_years: string[];
  required_roles: string[];
}
```

##### `update`
Updates an existing tryout.

**Authentication:** Tryout owner required
**Input:** Update schema with tryout ID
**Returns:** Updated tryout

##### `register`
Registers for a tryout.

**Authentication:** Player required
**Input:** `{ tryout_id: string; notes?: string }`
**Returns:** Registration status

##### `unregister`
Unregisters from a tryout.

**Authentication:** Player required
**Input:** `{ tryout_id: string }`
**Returns:** Success status

### Combines Router

Similar structure to Tryouts Router with combine-specific fields:

#### Additional Fields
- `year: string`
- `prize_pool: string`
- `format?: string`
- `requirements: string`
- `invite_only: boolean`

### Messages Router

#### Queries

##### `getConversations`
Gets all conversations for the current user.

**Authentication:** Required
**Returns:** Conversation list

##### `getMessages`
Gets messages in a conversation.

**Authentication:** Conversation participant required
**Input:** `{ conversation_id: string; limit?: number }`
**Returns:** Paginated messages

#### Mutations

##### `send`
Sends a message in a conversation.

**Authentication:** Conversation participant required
**Input:** `{ conversation_id: string; content: string }`
**Returns:** Sent message

##### `createConversation`
Creates a new conversation.

**Authentication:** Required
**Input:** `{ participant_id: string; initial_message: string }`
**Returns:** Created conversation

### Player Search Router

#### Queries

##### `search`
Searches for players with advanced filtering.

**Authentication:** Coach required
**Input:** Search criteria
**Returns:** Paginated player results

**Input Schema:**
```typescript
{
  query?: string; // Name or username search
  game_id?: string;
  state?: string;
  class_years?: string[];
  min_gpa?: number;
  max_gpa?: number;
  roles?: string[];
  school_type?: SchoolType;
  page?: number;
  limit?: number;
  sort_by?: "name" | "gpa" | "created_at" | "eval_score";
  sort_order?: "asc" | "desc";
}
```

**Example:**
```typescript
const { data: searchResults } = api.playerSearch.search.useQuery({
  game_id: "valorant-uuid",
  state: "California",
  class_years: ["2024", "2025"],
  min_gpa: 3.0,
  roles: ["duelist", "controller"],
  sort_by: "eval_score",
  sort_order: "desc"
});
```

### School Profile Router

#### Queries

##### `getAll`
Gets all schools with filtering.

**Authentication:** Public
**Input:** Filter options
**Returns:** School list

##### `getById`
Gets specific school details.

**Authentication:** Public
**Input:** `{ id: string }`
**Returns:** School details

##### `getTeams`
Gets teams for a school.

**Authentication:** Public
**Input:** `{ school_id: string; game_id?: string }`
**Returns:** Team list

### Leagues Router

#### Queries

##### `getAll`
Gets all leagues with filtering.

**Authentication:** Public
**Input:** Filter options
**Returns:** League list

##### `getById`
Gets specific league details.

**Authentication:** Public
**Input:** `{ id: string }`
**Returns:** League details

##### `getStandings`
Gets league standings.

**Authentication:** Public
**Input:** `{ league_id: string; season?: string }`
**Returns:** Team standings

### School Association Requests Router

#### Queries

##### `getMyRequests`
Gets coach's association requests.

**Authentication:** Coach required
**Returns:** Request list

##### `getAllRequests`
Gets all requests (admin only).

**Authentication:** Admin required
**Returns:** All requests

#### Mutations

##### `create`
Creates a school association request.

**Authentication:** Coach required
**Input:** Request schema
**Returns:** Created request

##### `approve`
Approves a request (admin only).

**Authentication:** Admin required
**Input:** `{ request_id: string; admin_notes?: string }`
**Returns:** Updated request

##### `reject`
Rejects a request (admin only).

**Authentication:** Admin required
**Input:** `{ request_id: string; admin_notes?: string }`
**Returns:** Updated request

---

## REST API Endpoints

### Webhook Endpoints

#### `/api/webhooks/clerk`
Handles Clerk user events.

**Method:** POST
**Authentication:** Webhook signature verification
**Body:** Clerk webhook payload

**Supported Events:**
- `user.created` - Creates player/coach record
- `user.updated` - Updates user information
- `user.deleted` - Handles user deletion

#### `/api/webhooks/svix`
Handles general webhook events.

**Method:** POST
**Authentication:** Svix signature verification

### Admin Endpoints

#### `/api/admin/check-status`
Checks admin status for current user.

**Method:** GET
**Authentication:** Required
**Response:** `{ isAdmin: boolean }`

#### `/api/update-user-type`
Updates user type in Clerk metadata.

**Method:** POST
**Authentication:** Required
**Body:** `{ userType: "player" | "coach" }`

### Game Integration Endpoints

#### `/api/valorant/connect`
Connects Valorant account via Riot OAuth.

**Method:** POST
**Authentication:** Player required
**Body:** Riot OAuth credentials

#### `/api/riot/account`
Gets Riot account information.

**Method:** GET
**Authentication:** Player required
**Query:** `{ gameName: string; tagLine: string }`

---

## Database Schema

### Core Models

#### Player
```prisma
model Player {
  id                       String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clerk_id                 String                     @unique
  email                    String                     @unique
  first_name               String
  last_name                String
  username                 String?                    @unique
  image_url                String?
  location                 String?
  bio                      String?
  school                   String?
  school_id                String?                    @db.Uuid
  gpa                      Decimal?                   @db.Decimal(3, 2)
  class_year               String?
  graduation_date          String?
  intended_major           String?
  main_game_id             String?                    @db.Uuid
  created_at               DateTime                   @default(now()) @db.Timestamp(6)
  updated_at               DateTime                   @updatedAt
  
  // Relations
  game_profiles            PlayerGameProfile[]
  platform_connections     PlayerPlatformConnection[]
  social_connections       PlayerSocialConnection[]
  tryout_registrations     TryoutRegistration[]
  combine_registrations    CombineRegistration[]
  // ... other relations
}
```

#### Coach
```prisma
model Coach {
  id                 String                     @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clerk_id           String                     @unique
  email              String                     @unique
  first_name         String
  last_name          String
  username           String                     @unique
  image_url          String?
  school             String
  school_id          String?                    @db.Uuid
  created_at         DateTime                   @default(now()) @db.Timestamp(6)
  updated_at         DateTime                   @updatedAt
  
  // Relations
  tryouts_created    Tryout[]
  combines_created   Combine[]
  teams              Team[]
  // ... other relations
}
```

#### Game
```prisma
model Game {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name              String              @unique
  short_name        String              @unique
  icon              String?
  color             String?
  created_at        DateTime            @default(now()) @db.Timestamp(6)
  
  // Relations
  player_profiles   PlayerGameProfile[]
  tryouts           Tryout[]
  combines          Combine[]
  leagues           League[]
}
```

#### Tryout
```prisma
model Tryout {
  id                    String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title                 String
  description           String
  long_description      String?
  game_id               String               @db.Uuid
  school_id             String               @db.Uuid
  coach_id              String?              @db.Uuid
  date                  DateTime             @db.Timestamp(6)
  location              String
  type                  EventType
  status                TryoutStatus         @default(DRAFT)
  price                 String
  max_spots             Int
  registered_spots      Int                  @default(0)
  registration_deadline DateTime?            @db.Timestamp(6)
  min_gpa               Decimal?             @db.Decimal(3, 2)
  class_years           String[]
  required_roles        String[]
  created_at            DateTime             @default(now()) @db.Timestamp(6)
  updated_at            DateTime             @updatedAt
  
  // Relations
  registrations         TryoutRegistration[]
  game                  Game                 @relation(fields: [game_id], references: [id])
  school                School               @relation(fields: [school_id], references: [id])
}
```

### Enums

```prisma
enum SchoolType {
  HIGH_SCHOOL
  COLLEGE
  UNIVERSITY
}

enum EventType {
  IN_PERSON
  ONLINE
  HYBRID
}

enum TryoutStatus {
  DRAFT
  PUBLISHED
  REGISTRATION_OPEN
  REGISTRATION_CLOSED
  COMPLETED
  CANCELLED
}

enum RegistrationStatus {
  PENDING
  APPROVED
  REJECTED
  WAITLISTED
  CANCELLED
  ATTENDED
  NO_SHOW
}
```

---

## React Components

### UI Components (shadcn/ui)

#### Button
Customizable button component with variants and sizes.

**Props:**
```typescript
interface ButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**Example:**
```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline" size="lg">
  Click me
</Button>
```

#### Card
Container component for content sections.

**Components:**
- `Card` - Main container
- `CardHeader` - Header section
- `CardTitle` - Title element
- `CardDescription` - Description text
- `CardContent` - Main content area
- `CardFooter` - Footer section

**Example:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Profile Information</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here</p>
  </CardContent>
</Card>
```

#### Dialog
Modal dialog component.

**Components:**
- `Dialog` - Root component
- `DialogTrigger` - Trigger button
- `DialogContent` - Modal content
- `DialogHeader` - Header section
- `DialogTitle` - Title
- `DialogDescription` - Description
- `DialogFooter` - Footer with actions

**Example:**
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to proceed?</p>
  </DialogContent>
</Dialog>
```

#### Form Components

##### Input
Text input component with validation support.

**Props:**
```typescript
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}
```

##### Select
Dropdown selection component.

**Components:**
- `Select` - Root component
- `SelectTrigger` - Trigger button
- `SelectContent` - Dropdown content
- `SelectItem` - Individual option
- `SelectValue` - Selected value display

**Example:**
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### DataTable
Advanced table component with sorting, filtering, and pagination.

**Props:**
```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pagination?: boolean;
}
```

**Example:**
```tsx
import { DataTable } from "@/components/ui/data-table";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

<DataTable 
  columns={columns} 
  data={players} 
  searchKey="name"
  searchPlaceholder="Search players..."
/>
```

### Custom Components

#### OnboardingGuard
Protects routes based on user onboarding status.

**Props:**
```typescript
interface OnboardingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOnboarded?: boolean;
}
```

**Example:**
```tsx
import { OnboardingGuard } from "@/components/ui/OnboardingGuard";

<OnboardingGuard requireOnboarded>
  <CoachDashboard />
</OnboardingGuard>
```

---

## Custom Hooks

### useToast
Provides toast notification functionality.

**Returns:**
```typescript
{
  toast: (props: ToastProps) => void;
  dismiss: (toastId?: string) => void;
  toasts: ToasterToast[];
}
```

**Example:**
```tsx
import { useToast } from "@/hooks/use-toast";

const { toast } = useToast();

const handleSuccess = () => {
  toast({
    title: "Success",
    description: "Profile updated successfully",
    variant: "default"
  });
};

const handleError = () => {
  toast({
    title: "Error",
    description: "Failed to update profile",
    variant: "destructive"
  });
};
```

### useMobile
Detects mobile viewport.

**Returns:** `boolean`

**Example:**
```tsx
import { useMobile } from "@/hooks/use-mobile";

const isMobile = useMobile();

return (
  <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
    Content
  </div>
);
```

### useRouteBackground
Manages route-specific background colors.

**Parameters:** `route: string`
**Returns:** Background configuration

**Example:**
```tsx
import { useRouteBackground } from "@/hooks/use-route-background";

const backgroundConfig = useRouteBackground("/dashboard");
```

---

## Utility Functions

### Core Utilities

#### `cn(...inputs: ClassValue[]): string`
Combines and merges Tailwind CSS classes.

**Location:** `@/lib/utils`

**Example:**
```typescript
import { cn } from "@/lib/utils";

const className = cn(
  "base-class",
  isActive && "active-class",
  className
);
```

### Time Utilities

#### `formatDate(date: Date, format?: string): string`
Formats dates with various options.

**Location:** `@/lib/time-utils`

**Examples:**
```typescript
import { formatDate } from "@/lib/time-utils";

formatDate(new Date(), "short"); // "12/25/23"
formatDate(new Date(), "long");  // "December 25, 2023"
formatDate(new Date(), "time");  // "3:30 PM"
```

#### `getRelativeTime(date: Date): string`
Gets relative time description.

**Example:**
```typescript
getRelativeTime(yesterday); // "1 day ago"
getRelativeTime(tomorrow);  // "in 1 day"
```

#### `isEventPast(eventDate: Date): boolean`
Checks if event date has passed.

#### `getEventStatus(event: { date: Date; registration_deadline?: Date }): EventStatus`
Determines event status based on dates.

### Database Utilities

#### `withRetry<T>(operation: () => Promise<T>, maxRetries?: number): Promise<T>`
Executes database operations with retry logic.

**Location:** `@/lib/db-utils`

**Example:**
```typescript
import { withRetry } from "@/lib/db-utils";

const player = await withRetry(() =>
  db.player.findUnique({ where: { id: playerId } })
);
```

#### `handlePrismaError(error: unknown): TRPCError`
Converts Prisma errors to tRPC errors.

#### `validateUUID(id: string): boolean`
Validates UUID format.

### Admin Utilities

#### `isUserAdmin(clerkId: string): Promise<boolean>`
Checks if user has admin privileges.

**Location:** `@/lib/admin-utils`

**Example:**
```typescript
import { isUserAdmin } from "@/lib/admin-utils";

const isAdmin = await isUserAdmin(user.id);
if (isAdmin) {
  // Show admin features
}
```

#### `requireAdmin(clerkId: string): Promise<void>`
Throws error if user is not admin.

### Metadata Utilities

#### `generatePlayerMetadata(player: Player): Metadata`
Generates Next.js metadata for player profiles.

**Location:** `@/lib/metadata`

#### `generateTryoutMetadata(tryout: Tryout): Metadata`
Generates metadata for tryout pages.

#### `getGameMetadata(gameId: string): GameMetadata`
Gets game-specific metadata configuration.

### Discord Logging

#### `logToDiscord(message: string, level?: LogLevel): Promise<void>`
Sends log messages to Discord webhook.

**Location:** `@/lib/discord-logger`

**Log Levels:**
- `info` - General information
- `warn` - Warning messages
- `error` - Error messages
- `success` - Success messages

**Example:**
```typescript
import { logToDiscord } from "@/lib/discord-logger";

await logToDiscord("User registered for tryout", "info");
await logToDiscord("Database connection failed", "error");
```

---

## Type Definitions

### Core Types

#### User Types
```typescript
type UserRole = "player" | "coach" | null;

interface CoachOnboardingStatus {
  isOnboarded: boolean;
  hasSchoolAssociation: boolean;
  hasPendingRequest: boolean;
  canRequestAssociation: boolean;
}
```

#### Game Types
```typescript
interface ValorantMetadata {
  puuid: string;
  gameName: string;
  tagLine: string;
  lastUpdated: string;
}

interface RiotAccountResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
}
```

#### tRPC Types
```typescript
// Inference helpers for tRPC
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

// Example usage
type PlayerProfileInput = RouterInputs['playerProfile']['updateProfile'];
type PlayerProfileOutput = RouterOutputs['playerProfile']['getProfile'];
```

### Database Types

Generated by Prisma based on schema:

```typescript
// Auto-generated types
interface Player {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string | null;
  // ... other fields
}

interface Tryout {
  id: string;
  title: string;
  description: string;
  game_id: string;
  school_id: string;
  date: Date;
  type: EventType;
  status: TryoutStatus;
  // ... other fields
}
```

---

## Examples & Usage

### Complete Player Profile Update

```typescript
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

function ProfileForm() {
  const { toast } = useToast();
  const utils = api.useUtils();
  
  const updateProfile = api.playerProfile.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      // Invalidate and refetch profile data
      utils.playerProfile.getProfile.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (data: ProfileUpdateData) => {
    updateProfile.mutate({
      bio: data.bio,
      location: data.location,
      gpa: data.gpa,
      class_year: data.classYear
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Advanced Player Search

```typescript
import { api } from "@/trpc/react";
import { useState } from "react";

function PlayerSearch() {
  const [filters, setFilters] = useState({
    game_id: "",
    state: "",
    min_gpa: 0,
    class_years: [] as string[],
    roles: [] as string[]
  });

  const { data: searchResults, isLoading } = api.playerSearch.search.useQuery({
    ...filters,
    page: 1,
    limit: 20,
    sort_by: "eval_score",
    sort_order: "desc"
  }, {
    enabled: filters.game_id !== "", // Only search when game is selected
    keepPreviousData: true
  });

  return (
    <div>
      {/* Filter UI */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {searchResults?.players.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Tryout Registration

```typescript
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";

function TryoutCard({ tryout }: { tryout: Tryout }) {
  const utils = api.useUtils();
  
  const registerMutation = api.tryouts.register.useMutation({
    onSuccess: () => {
      // Refetch tryout data to update registration count
      utils.tryouts.getById.invalidate({ id: tryout.id });
      toast({ title: "Successfully registered for tryout!" });
    }
  });

  const unregisterMutation = api.tryouts.unregister.useMutation({
    onSuccess: () => {
      utils.tryouts.getById.invalidate({ id: tryout.id });
      toast({ title: "Successfully unregistered from tryout" });
    }
  });

  const isRegistered = tryout.user_registration_status === "APPROVED";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tryout.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{tryout.description}</p>
        <p>Date: {formatDate(tryout.date)}</p>
        <p>Spots: {tryout.registered_spots}/{tryout.max_spots}</p>
      </CardContent>
      <CardFooter>
        {isRegistered ? (
          <Button 
            variant="outline" 
            onClick={() => unregisterMutation.mutate({ tryout_id: tryout.id })}
            disabled={unregisterMutation.isLoading}
          >
            Unregister
          </Button>
        ) : (
          <Button 
            onClick={() => registerMutation.mutate({ tryout_id: tryout.id })}
            disabled={registerMutation.isLoading || tryout.registered_spots >= tryout.max_spots}
          >
            Register
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

### Creating a Tryout (Coach)

```typescript
import { api } from "@/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const tryoutSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  game_id: z.string().min(1, "Game is required"),
  date: z.date(),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["IN_PERSON", "ONLINE", "HYBRID"]),
  max_spots: z.number().min(1).max(100),
  class_years: z.array(z.string()).min(1, "Select at least one class year"),
  required_roles: z.array(z.string()).optional()
});

type TryoutFormData = z.infer<typeof tryoutSchema>;

function CreateTryoutForm() {
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<TryoutFormData>({
    resolver: zodResolver(tryoutSchema),
    defaultValues: {
      type: "IN_PERSON",
      max_spots: 20,
      class_years: [],
      required_roles: []
    }
  });

  const createTryout = api.tryouts.create.useMutation({
    onSuccess: (tryout) => {
      toast({ title: "Tryout created successfully!" });
      router.push(`/tryouts/${tryout.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating tryout",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: TryoutFormData) => {
    createTryout.mutate({
      ...data,
      price: "Free", // Could be made configurable
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields using react-hook-form */}
    </form>
  );
}
```

### Message System Usage

```typescript
import { api } from "@/trpc/react";

function ConversationView({ conversationId }: { conversationId: string }) {
  const [newMessage, setNewMessage] = useState("");
  
  const { data: messages } = api.messages.getMessages.useQuery({
    conversation_id: conversationId,
    limit: 50
  });

  const { data: conversations } = api.messages.getConversations.useQuery();

  const sendMessage = api.messages.send.useMutation({
    onSuccess: () => {
      setNewMessage("");
      // Invalidate messages to show new message
      utils.messages.getMessages.invalidate({ conversation_id: conversationId });
    }
  });

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage.mutate({
        conversation_id: conversationId,
        content: newMessage.trim()
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-1/3 border-r">
        {conversations?.map(conv => (
          <ConversationItem key={conv.id} conversation={conv} />
        ))}
      </div>
      
      {/* Message view */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages?.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
        
        {/* Send message */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={!newMessage.trim()}>
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Error Handling Best Practices

```typescript
import { TRPCError } from "@trpc/server";
import { useToast } from "@/hooks/use-toast";

// In tRPC router
export const someRouter = createTRPCRouter({
  riskyOperation: playerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await withRetry(() => 
          ctx.db.someModel.update({
            where: { id: input.id },
            data: { /* update data */ }
          })
        );
        
        return result;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Record not found'
            });
          }
        }
        
        // Log error for debugging
        await logToDiscord(`Database error: ${error.message}`, 'error');
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        });
      }
    })
});

// In React component
function Component() {
  const { toast } = useToast();
  
  const mutation = api.someRouter.riskyOperation.useMutation({
    onError: (error) => {
      // Handle specific error types
      if (error.data?.code === 'NOT_FOUND') {
        toast({
          title: "Not Found",
          description: "The requested item was not found",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    }
  });
}
```

---

## Rate Limiting & Performance

### Caching Strategy

The application implements multiple caching layers:

1. **tRPC Query Caching** - Automatic via TanStack Query
2. **Public Profile Caching** - In-memory cache for public profiles (5 minutes TTL)
3. **Database Connection Pooling** - Managed by Prisma

### Performance Optimizations

1. **Selective Field Loading** - Use specific query methods like `getBasicProfile`
2. **Pagination** - All list endpoints support pagination
3. **Database Indexing** - Strategic indexes on frequently queried fields
4. **Parallel Queries** - Use `Promise.all` for independent operations

### Error Recovery

1. **Retry Logic** - Database operations use `withRetry` wrapper
2. **Graceful Degradation** - Fallback UI states for failed loads
3. **Error Boundaries** - React error boundaries for component-level errors

---

This documentation provides comprehensive coverage of all public APIs, functions, and components in the EVAL Gaming platform. For additional support or questions about specific implementations, refer to the inline code comments or contact the development team.