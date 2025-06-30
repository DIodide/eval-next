# EVAL Gaming - Utilities and Hooks Documentation

## Table of Contents

1. [Custom Hooks](#custom-hooks)
2. [Utility Functions](#utility-functions)
3. [Database Utilities](#database-utilities)
4. [Time Utilities](#time-utilities)
5. [Permission Utilities](#permission-utilities)
6. [Metadata Utilities](#metadata-utilities)
7. [Admin Utilities](#admin-utilities)
8. [Discord Logging](#discord-logging)
9. [Validation Utilities](#validation-utilities)
10. [Error Handling](#error-handling)

---

## Custom Hooks

### useToast

Provides a toast notification system for user feedback.

**Location:** `@/hooks/use-toast`

#### Return Type

```typescript
interface UseToastReturn {
  toast: (props: Toast) => { id: string; dismiss: () => void; update: (props: ToasterToast) => void };
  dismiss: (toastId?: string) => void;
  toasts: ToasterToast[];
}

interface Toast {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  duration?: number;
}
```

#### Examples

```tsx
import { useToast } from "@/hooks/use-toast";

function ProfileForm() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Profile updated successfully",
      duration: 5000,
    });
  };

  const handleError = (error: string) => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    });
  };

  const handleWithAction = () => {
    toast({
      title: "Message sent",
      description: "Your message has been delivered",
      action: (
        <ToastAction altText="View message">
          View
        </ToastAction>
      ),
    });
  };

  return (
    <div>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={() => handleError("Something went wrong")}>
        Show Error
      </Button>
      <Button onClick={handleWithAction}>Show with Action</Button>
    </div>
  );
}
```

#### Advanced Usage

```tsx
// Programmatic dismiss
const { toast, dismiss } = useToast();

const showPersistentToast = () => {
  const { id, dismiss: dismissSingle } = toast({
    title: "Processing...",
    description: "Please wait while we process your request",
    duration: Infinity, // Won't auto-dismiss
  });

  // Later, dismiss specific toast
  setTimeout(() => {
    dismissSingle();
  }, 3000);
};

// Dismiss all toasts
const dismissAll = () => {
  dismiss();
};
```

### useMobile

Detects mobile viewport using a media query.

**Location:** `@/hooks/use-mobile`

#### Return Type

```typescript
function useMobile(): boolean
```

#### Example

```tsx
import { useMobile } from "@/hooks/use-mobile";

function ResponsiveComponent() {
  const isMobile = useMobile();

  return (
    <div className={isMobile ? "mobile-layout" : "desktop-layout"}>
      {isMobile ? (
        <MobileNavigation />
      ) : (
        <DesktopNavigation />
      )}
      
      <main className={isMobile ? "p-4" : "p-8"}>
        Content
      </main>
    </div>
  );
}
```

#### Implementation Details

Uses `window.matchMedia` to detect screen width changes:

```typescript
const MOBILE_BREAKPOINT = 768; // matches Tailwind's md breakpoint

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
```

### useRouteBackground

Manages route-specific background styling.

**Location:** `@/hooks/use-route-background`

#### Parameters

```typescript
function useRouteBackground(route: string): {
  backgroundClass: string;
  isDark: boolean;
  accentColor: string;
}
```

#### Example

```tsx
import { useRouteBackground } from "@/hooks/use-route-background";

function Layout({ children }: { children: React.ReactNode }) {
  const { backgroundClass, isDark, accentColor } = useRouteBackground("/dashboard");

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <nav style={{ borderColor: accentColor }}>
        Navigation
      </nav>
      <main className={isDark ? "text-white" : "text-black"}>
        {children}
      </main>
    </div>
  );
}
```

#### Route Configurations

```typescript
const routeConfigs = {
  "/dashboard": {
    backgroundClass: "bg-gradient-to-br from-blue-50 to-indigo-100",
    isDark: false,
    accentColor: "#3b82f6"
  },
  "/tryouts": {
    backgroundClass: "bg-gradient-to-br from-green-50 to-emerald-100",
    isDark: false,
    accentColor: "#10b981"
  },
  "/admin": {
    backgroundClass: "bg-gradient-to-br from-gray-900 to-black",
    isDark: true,
    accentColor: "#f59e0b"
  }
};
```

---

## Utility Functions

### cn (Class Names)

Utility for merging Tailwind CSS classes with conflict resolution.

**Location:** `@/lib/utils`

#### Function Signature

```typescript
function cn(...inputs: ClassValue[]): string
```

#### Examples

```tsx
import { cn } from "@/lib/utils";

// Basic usage
const buttonClass = cn("px-4 py-2 rounded", "bg-blue-500 text-white");

// Conditional classes
const alertClass = cn(
  "p-4 rounded border",
  isError && "bg-red-100 border-red-500",
  isSuccess && "bg-green-100 border-green-500",
  className
);

// Override classes (twMerge handles conflicts)
const overrideClass = cn(
  "bg-red-500 p-4", // base
  "bg-blue-500"     // this will override bg-red-500
);

// Component usage
function Button({ className, variant, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "destructive" && "bg-destructive text-destructive-foreground",
        className
      )}
      {...props}
    />
  );
}
```

#### Implementation

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Database Utilities

### withRetry

Executes database operations with automatic retry logic.

**Location:** `@/lib/db-utils`

#### Function Signature

```typescript
function withRetry<T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T>
```

#### Parameters

- `operation` - Async function to retry
- `maxRetries` - Maximum number of retry attempts (default: 3)
- `baseDelay` - Base delay between retries in ms (default: 1000)

#### Examples

```tsx
import { withRetry } from "@/lib/db-utils";

// Basic usage
const player = await withRetry(() =>
  db.player.findUnique({ where: { id: playerId } })
);

// Custom retry configuration
const result = await withRetry(
  () => db.player.update({ where: { id }, data: updateData }),
  5,    // max retries
  2000  // 2 second base delay
);

// In tRPC router
export const playerRouter = createTRPCRouter({
  updateProfile: playerProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await withRetry(() =>
          ctx.db.player.update({
            where: { clerk_id: ctx.auth.userId },
            data: input
          })
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile after retries'
        });
      }
    })
});
```

#### Implementation Details

Uses exponential backoff with jitter:

```typescript
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}
```

### handlePrismaError

Converts Prisma errors to user-friendly tRPC errors.

**Location:** `@/lib/db-utils`

#### Function Signature

```typescript
function handlePrismaError(error: unknown): TRPCError
```

#### Examples

```tsx
import { handlePrismaError } from "@/lib/db-utils";

// In tRPC mutation
.mutation(async ({ ctx, input }) => {
  try {
    return await ctx.db.player.create({ data: input });
  } catch (error) {
    throw handlePrismaError(error);
  }
})
```

#### Error Mappings

```typescript
export function handlePrismaError(error: unknown): TRPCError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return new TRPCError({
          code: 'CONFLICT',
          message: 'A record with this information already exists'
        });
      case 'P2025':
        return new TRPCError({
          code: 'NOT_FOUND',
          message: 'Record not found'
        });
      case 'P2003':
        return new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Foreign key constraint failed'
        });
      default:
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database error occurred'
        });
    }
  }
  
  return new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
}
```

### validateUUID

Validates UUID format.

**Location:** `@/lib/db-utils`

#### Function Signature

```typescript
function validateUUID(id: string): boolean
```

#### Example

```tsx
import { validateUUID } from "@/lib/db-utils";

// In API route
if (!validateUUID(playerId)) {
  throw new TRPCError({
    code: 'BAD_REQUEST',
    message: 'Invalid player ID format'
  });
}
```

---

## Time Utilities

### formatDate

Formats dates with various display options.

**Location:** `@/lib/time-utils`

#### Function Signature

```typescript
function formatDate(
  date: Date | string, 
  format?: "short" | "long" | "time" | "datetime" | "relative"
): string
```

#### Examples

```tsx
import { formatDate } from "@/lib/time-utils";

const now = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

// Different formats
formatDate(now, "short");    // "12/25/23"
formatDate(now, "long");     // "December 25, 2023"
formatDate(now, "time");     // "3:30 PM"
formatDate(now, "datetime"); // "Dec 25, 2023 at 3:30 PM"
formatDate(yesterday, "relative"); // "1 day ago"

// Component usage
function TryoutCard({ tryout }: { tryout: Tryout }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tryout.title}</CardTitle>
        <CardDescription>
          Date: {formatDate(tryout.date, "long")}
          {tryout.time_start && ` at ${formatDate(`${tryout.date}T${tryout.time_start}`, "time")}`}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
```

### getRelativeTime

Gets human-readable relative time descriptions.

**Location:** `@/lib/time-utils`

#### Function Signature

```typescript
function getRelativeTime(date: Date | string): string
```

#### Examples

```tsx
import { getRelativeTime } from "@/lib/time-utils";

const now = new Date();
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

getRelativeTime(fiveMinutesAgo); // "5 minutes ago"
getRelativeTime(tomorrow);       // "in 1 day"
getRelativeTime(now);           // "just now"

// Component usage
function MessageItem({ message }: { message: Message }) {
  return (
    <div className="message">
      <p>{message.content}</p>
      <span className="text-xs text-muted-foreground">
        {getRelativeTime(message.created_at)}
      </span>
    </div>
  );
}
```

### isEventPast

Checks if an event date has passed.

**Location:** `@/lib/time-utils`

#### Function Signature

```typescript
function isEventPast(eventDate: Date | string): boolean
```

#### Example

```tsx
import { isEventPast } from "@/lib/time-utils";

function TryoutRegistration({ tryout }: { tryout: Tryout }) {
  const registrationClosed = isEventPast(tryout.registration_deadline);
  const eventPassed = isEventPast(tryout.date);

  return (
    <div>
      {eventPassed ? (
        <Badge variant="secondary">Event Completed</Badge>
      ) : registrationClosed ? (
        <Badge variant="destructive">Registration Closed</Badge>
      ) : (
        <Button>Register Now</Button>
      )}
    </div>
  );
}
```

### getEventStatus

Determines comprehensive event status based on dates.

**Location:** `@/lib/time-utils`

#### Function Signature

```typescript
type EventStatus = "upcoming" | "registration_open" | "registration_closed" | "in_progress" | "completed";

function getEventStatus(event: {
  date: Date | string;
  registration_deadline?: Date | string;
  end_date?: Date | string;
}): EventStatus
```

#### Example

```tsx
import { getEventStatus } from "@/lib/time-utils";

function EventStatusBadge({ event }: { event: Tryout }) {
  const status = getEventStatus({
    date: event.date,
    registration_deadline: event.registration_deadline,
  });

  const statusConfig = {
    upcoming: { label: "Upcoming", variant: "secondary" as const },
    registration_open: { label: "Registration Open", variant: "default" as const },
    registration_closed: { label: "Registration Closed", variant: "destructive" as const },
    in_progress: { label: "In Progress", variant: "warning" as const },
    completed: { label: "Completed", variant: "secondary" as const },
  };

  const config = statusConfig[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
```

### getTimeUntilEvent

Gets countdown time until an event.

**Location:** `@/lib/time-utils`

#### Function Signature

```typescript
function getTimeUntilEvent(eventDate: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}
```

#### Example

```tsx
import { getTimeUntilEvent } from "@/lib/time-utils";

function CountdownTimer({ eventDate }: { eventDate: Date }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilEvent(eventDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilEvent(eventDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [eventDate]);

  if (timeLeft.isPast) {
    return <span>Event has started!</span>;
  }

  return (
    <div className="flex gap-2 text-center">
      <div className="bg-gray-100 p-2 rounded">
        <div className="font-bold">{timeLeft.days}</div>
        <div className="text-xs">days</div>
      </div>
      <div className="bg-gray-100 p-2 rounded">
        <div className="font-bold">{timeLeft.hours}</div>
        <div className="text-xs">hours</div>
      </div>
      <div className="bg-gray-100 p-2 rounded">
        <div className="font-bold">{timeLeft.minutes}</div>
        <div className="text-xs">min</div>
      </div>
    </div>
  );
}
```

---

## Permission Utilities

### getUserRole

Extracts user role from Clerk user metadata.

**Location:** `@/lib/permissions`

#### Function Signature

```typescript
type UserRole = "player" | "coach" | null;
type ClerkUser = User | UserResource | null;

function getUserRole(user: ClerkUser): UserRole
```

#### Examples

```tsx
import { getUserRole } from "@/lib/permissions";

// In server component
function Dashboard({ user }: { user: User }) {
  const role = getUserRole(user);

  if (role === "coach") {
    return <CoachDashboard />;
  } else if (role === "player") {
    return <PlayerDashboard />;
  } else {
    return <OnboardingFlow />;
  }
}

// In client component with Clerk
function Navigation() {
  const { user } = useUser();
  const role = getUserRole(user);

  return (
    <nav>
      <Link href="/">Home</Link>
      {role === "coach" && <Link href="/coach-dashboard">Coach Dashboard</Link>}
      {role === "player" && <Link href="/player-dashboard">Player Dashboard</Link>}
    </nav>
  );
}
```

### isCoachOnboarded

Checks if a coach has completed onboarding.

**Location:** `@/lib/permissions`

#### Function Signature

```typescript
function isCoachOnboarded(user: ClerkUser): boolean
```

#### Example

```tsx
import { isCoachOnboarded, getUserRole } from "@/lib/permissions";

function CoachFeatures({ user }: { user: User }) {
  const role = getUserRole(user);
  const isOnboarded = isCoachOnboarded(user);

  if (role !== "coach") {
    return <div>Access denied</div>;
  }

  if (!isOnboarded) {
    return <OnboardingPrompt />;
  }

  return <CoachDashboard />;
}
```

### canAccessCoachFeatures

Combines role and onboarding checks.

**Location:** `@/lib/permissions`

#### Function Signature

```typescript
function canAccessCoachFeatures(user: ClerkUser): boolean
```

#### Example

```tsx
import { canAccessCoachFeatures } from "@/lib/permissions";

function ProtectedCoachRoute({ user, children }: { user: User; children: React.ReactNode }) {
  if (!canAccessCoachFeatures(user)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```

### hasPermission

Checks specific permission for an action.

**Location:** `@/lib/permissions`

#### Function Signature

```typescript
type PermissionAction = "message_coach" | "message_player" | "view_profile";

function hasPermission(
  currentUser: ClerkUser,
  action: PermissionAction
): boolean
```

#### Example

```tsx
import { hasPermission } from "@/lib/permissions";

function PlayerProfileActions({ user, targetPlayer }: Props) {
  const canMessage = hasPermission(user, "message_player");

  return (
    <div>
      <Button>View Full Profile</Button>
      {canMessage && (
        <Button onClick={() => startConversation(targetPlayer.id)}>
          Send Message
        </Button>
      )}
    </div>
  );
}
```

---

## Metadata Utilities

### generatePlayerMetadata

Generates Next.js metadata for player profile pages.

**Location:** `@/lib/metadata`

#### Function Signature

```typescript
function generatePlayerMetadata(player: {
  first_name: string;
  last_name: string;
  username: string | null;
  bio?: string | null;
  school?: string | null;
  main_game?: { name: string } | null;
}): Metadata
```

#### Example

```tsx
import { generatePlayerMetadata } from "@/lib/metadata";

// In page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const player = await getPlayerByUsername(params.username);
  
  if (!player) {
    return {
      title: "Player not found",
      description: "The requested player profile could not be found.",
    };
  }

  return generatePlayerMetadata(player);
}

// Generates metadata like:
// {
//   title: "John Doe (@johndoe) - EVAL Gaming",
//   description: "Aspiring VALORANT player from UCLA. View John's esports profile...",
//   openGraph: {
//     title: "John Doe - Esports Player Profile",
//     description: "...",
//     images: ["/og-images/player-profile.png"]
//   }
// }
```

### generateTryoutMetadata

Generates metadata for tryout pages.

**Location:** `@/lib/metadata`

#### Function Signature

```typescript
function generateTryoutMetadata(tryout: {
  title: string;
  description: string;
  school: { name: string };
  game: { name: string };
  date: Date;
}): Metadata
```

#### Example

```tsx
import { generateTryoutMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tryout = await getTryoutById(params.id);
  
  if (!tryout) {
    return { title: "Tryout not found" };
  }

  return generateTryoutMetadata(tryout);
}
```

### getGameMetadata

Gets game-specific metadata and configuration.

**Location:** `@/lib/metadata`

#### Function Signature

```typescript
interface GameMetadata {
  name: string;
  shortName: string;
  color: string;
  icon: string;
  description: string;
  keywords: string[];
}

function getGameMetadata(gameId: string): GameMetadata | null
```

#### Example

```tsx
import { getGameMetadata } from "@/lib/metadata";

function GameHeader({ gameId }: { gameId: string }) {
  const gameData = getGameMetadata(gameId);

  if (!gameData) return null;

  return (
    <div 
      className="p-6 rounded-lg"
      style={{ backgroundColor: gameData.color }}
    >
      <img src={gameData.icon} alt={gameData.name} className="w-8 h-8" />
      <h1 className="text-2xl font-bold text-white">{gameData.name}</h1>
      <p className="text-white/80">{gameData.description}</p>
    </div>
  );
}
```

---

## Admin Utilities

### isUserAdmin

Checks if a user has admin privileges.

**Location:** `@/lib/admin-utils`

#### Function Signature

```typescript
function isUserAdmin(clerkId: string): Promise<boolean>
```

#### Example

```tsx
import { isUserAdmin } from "@/lib/admin-utils";

// In API route or server action
export async function adminOnlyAction(clerkId: string) {
  const isAdmin = await isUserAdmin(clerkId);
  
  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }
  
  // Perform admin action
}

// In tRPC router
export const adminRouter = createTRPCRouter({
  getAllUsers: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }
      
      const isAdmin = await isUserAdmin(ctx.auth.userId);
      if (!isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      
      return await ctx.db.player.findMany();
    })
});
```

### requireAdmin

Throws error if user is not admin (assertion function).

**Location:** `@/lib/admin-utils`

#### Function Signature

```typescript
function requireAdmin(clerkId: string): Promise<void>
```

#### Example

```tsx
import { requireAdmin } from "@/lib/admin-utils";

// Cleaner admin check
export async function deleteUser(clerkId: string, targetUserId: string) {
  await requireAdmin(clerkId); // Throws if not admin
  
  // Proceed with admin action
  await db.player.delete({ where: { id: targetUserId } });
}
```

---

## Discord Logging

### logToDiscord

Sends log messages to Discord webhook for monitoring.

**Location:** `@/lib/discord-logger`

#### Function Signature

```typescript
type LogLevel = "info" | "warn" | "error" | "success";

function logToDiscord(
  message: string, 
  level: LogLevel = "info",
  context?: Record<string, any>
): Promise<void>
```

#### Examples

```tsx
import { logToDiscord } from "@/lib/discord-logger";

// Basic logging
await logToDiscord("User registered for tryout", "info");
await logToDiscord("Database connection failed", "error");
await logToDiscord("Payment processed successfully", "success");

// With context
await logToDiscord("Player profile updated", "info", {
  playerId: "uuid-123",
  changes: ["bio", "location"],
  timestamp: new Date().toISOString()
});

// In error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logToDiscord(`React error: ${error.message}`, "error", {
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
}

// In API routes
export async function POST(request: Request) {
  try {
    // API logic
    await logToDiscord("API request processed", "info");
  } catch (error) {
    await logToDiscord(`API error: ${error.message}`, "error", {
      endpoint: request.url,
      method: request.method
    });
    throw error;
  }
}
```

#### Configuration

Set up environment variables:

```env
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_LOGGING_ENABLED=true
NEXT_PUBLIC_APP_ENV=production
```

#### Log Format

Messages are formatted with rich embeds:

```typescript
interface DiscordEmbed {
  title: string;
  description: string;
  color: number; // Based on log level
  timestamp: string;
  fields: Array<{
    name: string;
    value: string;
    inline: boolean;
  }>;
}
```

---

## Validation Utilities

### Email Validation

```typescript
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### Username Validation

```typescript
function isValidUsername(username: string): boolean {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}
```

### GPA Validation

```typescript
function isValidGPA(gpa: number): boolean {
  return gpa >= 0 && gpa <= 4.0;
}
```

### Phone Number Validation

```typescript
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}
```

---

## Error Handling

### Error Boundary Hook

```tsx
function useErrorBoundary() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    logToDiscord(`Error boundary caught: ${error.message}`, "error", {
      stack: error.stack,
      componentStack: errorInfo?.componentStack
    });
  };
}
```

### API Error Handler

```typescript
function handleAPIError(error: unknown): { message: string; code: string } {
  if (error instanceof TRPCError) {
    return {
      message: error.message,
      code: error.code
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR"
    };
  }
  
  return {
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR"
  };
}
```

### Async Error Wrapper

```typescript
function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      await logToDiscord(`Function error: ${error.message}`, "error", {
        function: fn.name,
        args: JSON.stringify(args)
      });
      throw error;
    }
  };
}

// Usage
const safeUpdateProfile = withErrorHandling(updatePlayerProfile);
```

---

This documentation covers all the utility functions and custom hooks used throughout the EVAL Gaming platform. These utilities provide consistent functionality for common operations like date formatting, permission checking, error handling, and user feedback.