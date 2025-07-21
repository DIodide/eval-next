# EVAL Gaming - React Components Documentation

## Table of Contents

1. [UI Components (shadcn/ui)](#ui-components-shadcnui)
2. [Form Components](#form-components)
3. [Layout Components](#layout-components)
4. [Data Display Components](#data-display-components)
5. [Navigation Components](#navigation-components)
6. [Feedback Components](#feedback-components)
7. [Game-Specific Components](#game-specific-components)
8. [Custom Components](#custom-components)
9. [Component Patterns](#component-patterns)
10. [Styling Guidelines](#styling-guidelines)

---

## UI Components (shadcn/ui)

### Button

A versatile button component with multiple variants and sizes.

**Location:** `@/components/ui/button`

#### Props

```typescript
interface ButtonProps extends React.ComponentProps<"button"> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  className?: string;
}
```

#### Variants

- **default** - Primary blue button with white text
- **destructive** - Red button for dangerous actions
- **outline** - Outlined button with transparent background
- **secondary** - Gray button for secondary actions
- **ghost** - Transparent button with hover effects
- **link** - Text-only button with underline

#### Examples

```tsx
import { Button } from "@/components/ui/button";

// Primary action
<Button>Save Changes</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Dangerous action
<Button variant="destructive">Delete Account</Button>

// Icon button
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>

// Link-style button
<Button variant="link" asChild>
  <Link href="/profile">View Profile</Link>
</Button>
```

### Card

Container component for grouping related content.

**Location:** `@/components/ui/card`

#### Components

- `Card` - Main container
- `CardHeader` - Header section with padding
- `CardTitle` - Title with proper typography
- `CardDescription` - Subtitle/description text
- `CardContent` - Main content area
- `CardFooter` - Footer section for actions

#### Example

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Player Profile</CardTitle>
    <CardDescription>Update your gaming profile information</CardDescription>
  </CardHeader>
  <CardContent>
    <form>
      <div className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="Enter your username" />
        </div>
      </div>
    </form>
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>;
```

### Dialog

Modal dialog component for overlays and confirmations.

**Location:** `@/components/ui/dialog`

#### Components

- `Dialog` - Root component with state management
- `DialogTrigger` - Element that opens the dialog
- `DialogContent` - Modal content container
- `DialogHeader` - Header section
- `DialogTitle` - Required title for accessibility
- `DialogDescription` - Optional description
- `DialogFooter` - Footer for action buttons
- `DialogClose` - Element that closes the dialog

#### Example

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input id="name" value="Pedro Duarte" className="col-span-3" />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

### Toast

Non-blocking notification system.

**Location:** `@/components/ui/toast`

#### Components

- `Toast` - Individual toast notification
- `ToastAction` - Action button within toast
- `ToastClose` - Close button
- `ToastDescription` - Description text
- `ToastProvider` - Context provider
- `ToastTitle` - Toast title
- `ToastViewport` - Container for all toasts
- `Toaster` - Root toaster component

#### Usage with Hook

```tsx
import { useToast } from "@/hooks/use-toast";

function Component() {
  const { toast } = useToast();

  return (
    <Button
      onClick={() => {
        toast({
          title: "Success!",
          description: "Your profile has been updated.",
        });
      }}
    >
      Update Profile
    </Button>
  );
}
```

#### Toast Variants

```tsx
// Success toast
toast({
  title: "Success",
  description: "Operation completed successfully",
});

// Error toast
toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive",
});

// Toast with action
toast({
  title: "Scheduled: Catch up",
  description: "Friday, February 10, 2023 at 5:30 PM",
  action: <ToastAction altText="Goto schedule to undo">Undo</ToastAction>,
});
```

---

## Form Components

### Input

Text input component with validation support.

**Location:** `@/components/ui/input`

#### Props

```typescript
interface InputProps extends React.ComponentProps<"input"> {
  className?: string;
}
```

#### Examples

```tsx
import { Input } from "@/components/ui/input";

// Basic input
<Input placeholder="Enter your email" />

// With label
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>

// With error state
<Input
  type="email"
  placeholder="Email"
  className="border-red-500"
  aria-invalid="true"
/>
```

### Select

Dropdown selection component.

**Location:** `@/components/ui/select`

#### Components

- `Select` - Root component
- `SelectContent` - Dropdown content container
- `SelectItem` - Individual option
- `SelectTrigger` - Button that opens dropdown
- `SelectValue` - Displays selected value

#### Example

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a game" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="valorant">VALORANT</SelectItem>
    <SelectItem value="overwatch">Overwatch 2</SelectItem>
    <SelectItem value="rocket-league">Rocket League</SelectItem>
  </SelectContent>
</Select>;
```

### Checkbox

Checkbox input with label support.

**Location:** `@/components/ui/checkbox`

#### Example

```tsx
import { Checkbox } from "@/components/ui/checkbox";

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label
    htmlFor="terms"
    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Accept terms and conditions
  </label>
</div>;
```

### Label

Form label component.

**Location:** `@/components/ui/label`

#### Example

```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Your email address</Label>;
```

### Textarea

Multi-line text input.

**Location:** `@/components/ui/textarea`

#### Example

```tsx
import { Textarea } from "@/components/ui/textarea";

<div className="grid w-full gap-1.5">
  <Label htmlFor="message">Your message</Label>
  <Textarea placeholder="Type your message here." id="message" />
</div>;
```

---

## Layout Components

### Separator

Visual divider between content sections.

**Location:** `@/components/ui/separator`

#### Example

```tsx
import { Separator } from "@/components/ui/separator";

<div>
  <div className="space-y-1">
    <h4 className="text-sm leading-none font-medium">Profile Settings</h4>
    <p className="text-muted-foreground text-sm">
      Manage your profile information
    </p>
  </div>
  <Separator className="my-4" />
  <div className="flex h-5 items-center space-x-4 text-sm">
    <div>Basic Info</div>
    <Separator orientation="vertical" />
    <div>Gaming Profiles</div>
    <Separator orientation="vertical" />
    <div>Social Links</div>
  </div>
</div>;
```

### Tabs

Tab navigation component.

**Location:** `@/components/ui/tabs`

#### Components

- `Tabs` - Root component
- `TabsList` - Container for tab triggers
- `TabsTrigger` - Individual tab button
- `TabsContent` - Content for each tab

#### Example

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <p>Make changes to your account here.</p>
  </TabsContent>
  <TabsContent value="password">
    <p>Change your password here.</p>
  </TabsContent>
</Tabs>;
```

### Collapsible

Expandable content container.

**Location:** `@/components/ui/collapsible`

#### Example

```tsx
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

<Collapsible>
  <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
  <CollapsibleContent>
    Yes. Free to use for personal and commercial projects.
  </CollapsibleContent>
</Collapsible>;
```

---

## Data Display Components

### DataTable

Advanced table with sorting, filtering, and pagination.

**Location:** `@/components/ui/data-table`

#### Props

```typescript
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pagination?: boolean;
  className?: string;
}
```

#### Example

```tsx
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface Player {
  id: string;
  name: string;
  email: string;
  game: string;
  rank: string;
}

const columns: ColumnDef<Player>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "game",
    header: "Main Game",
  },
  {
    accessorKey: "rank",
    header: "Rank",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem>Message player</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

<DataTable
  columns={columns}
  data={players}
  searchKey="name"
  searchPlaceholder="Search players..."
/>;
```

### Table

Basic table components.

**Location:** `@/components/ui/table`

#### Components

- `Table` - Root table element
- `TableHeader` - Table header
- `TableBody` - Table body
- `TableFooter` - Table footer
- `TableHead` - Header cell
- `TableRow` - Table row
- `TableCell` - Table cell
- `TableCaption` - Table caption

#### Example

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableCaption>A list of your recent tryouts.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Game</TableHead>
      <TableHead>School</TableHead>
      <TableHead>Date</TableHead>
      <TableHead className="text-right">Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">VALORANT</TableCell>
      <TableCell>UCLA</TableCell>
      <TableCell>Dec 15, 2023</TableCell>
      <TableCell className="text-right">Registered</TableCell>
    </TableRow>
  </TableBody>
</Table>;
```

### Badge

Small status or category indicator.

**Location:** `@/components/ui/badge`

#### Variants

- **default** - Standard badge
- **secondary** - Muted badge
- **destructive** - Error/warning badge
- **outline** - Outlined badge

#### Example

```tsx
import { Badge } from "@/components/ui/badge";

<div className="flex gap-2">
  <Badge>Active</Badge>
  <Badge variant="secondary">Pending</Badge>
  <Badge variant="destructive">Rejected</Badge>
  <Badge variant="outline">Draft</Badge>
</div>;
```

### Avatar

User profile image component.

**Location:** `@/components/ui/avatar`

#### Components

- `Avatar` - Container
- `AvatarImage` - Profile image
- `AvatarFallback` - Fallback content when image fails

#### Example

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

<Avatar>
  <AvatarImage src="https://github.com/username.png" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>;
```

---

## Navigation Components

### NavigationMenu

Complex navigation component for headers.

**Location:** `@/components/ui/navigation-menu`

#### Example

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Features</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <a
                className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none select-none focus:shadow-md"
                href="/"
              >
                <div className="mt-4 mb-2 text-lg font-medium">EVAL Gaming</div>
                <p className="text-muted-foreground text-sm leading-tight">
                  Connect with college esports programs
                </p>
              </a>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>;
```

### DropdownMenu

Context menu component.

**Location:** `@/components/ui/dropdown-menu`

#### Example

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Profile</DropdownMenuItem>
    <DropdownMenuItem>Settings</DropdownMenuItem>
    <DropdownMenuItem>Logout</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>;
```

---

## Feedback Components

### Progress

Progress indicator component.

**Location:** `@/components/ui/progress`

#### Example

```tsx
import { Progress } from "@/components/ui/progress";

<div className="w-full">
  <Progress value={33} className="w-[60%]" />
</div>;
```

### Skeleton

Loading placeholder component.

**Location:** `@/components/ui/skeleton`

#### Example

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>;
```

---

## Custom Components

### OnboardingGuard

Route protection based on user onboarding status.

**Location:** `@/components/ui/OnboardingGuard`

#### Props

```typescript
interface OnboardingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOnboarded?: boolean;
}
```

#### Example

```tsx
import { OnboardingGuard } from "@/components/ui/OnboardingGuard";

<OnboardingGuard requireOnboarded>
  <CoachDashboard />
</OnboardingGuard>

// With custom fallback
<OnboardingGuard
  requireOnboarded
  fallback={<div>Please complete onboarding first</div>}
>
  <CoachFeatures />
</OnboardingGuard>
```

### FlipWords

Animated text component that cycles through words.

**Location:** `@/components/ui/flip-words`

#### Props

```typescript
interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}
```

#### Example

```tsx
import { FlipWords } from "@/components/ui/flip-words";

const words = ["recruiting", "competing", "improving", "connecting"];

<div className="mx-auto text-4xl font-normal text-neutral-600 dark:text-neutral-400">
  Build
  <FlipWords words={words} /> <br />
  your esports career
</div>;
```

---

## Game-Specific Components

### VALORANT Components

Located in `@/components/valorant/`

#### Agent Selection Component

```tsx
// Example VALORANT agent selector
interface AgentSelectorProps {
  selectedAgents: string[];
  onAgentsChange: (agents: string[]) => void;
  maxSelection?: number;
}

function AgentSelector({
  selectedAgents,
  onAgentsChange,
  maxSelection = 3,
}: AgentSelectorProps) {
  const agents = [
    { id: "jett", name: "Jett", role: "Duelist" },
    { id: "sage", name: "Sage", role: "Sentinel" },
    // ... more agents
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => {
            if (selectedAgents.includes(agent.id)) {
              onAgentsChange(selectedAgents.filter((id) => id !== agent.id));
            } else if (selectedAgents.length < maxSelection) {
              onAgentsChange([...selectedAgents, agent.id]);
            }
          }}
          className={cn(
            "rounded-md border p-2 text-center",
            selectedAgents.includes(agent.id)
              ? "border-primary bg-primary/10"
              : "border-border",
          )}
        >
          <div className="font-medium">{agent.name}</div>
          <div className="text-muted-foreground text-xs">{agent.role}</div>
        </button>
      ))}
    </div>
  );
}
```

---

## Component Patterns

### Compound Components

Many UI components follow the compound component pattern:

```tsx
// Good: Compound components provide clear structure
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
  <CardFooter>
    Actions
  </CardFooter>
</Card>

// Avoid: Monolithic props
<Card
  title="Title"
  description="Description"
  content="Content"
  actions={<Button>Action</Button>}
/>
```

### Forwarding Refs

Components properly forward refs for accessibility:

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants(), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
```

### Polymorphic Components

Some components accept an `asChild` prop for composition:

```tsx
// Renders as a button
<Button>Click me</Button>

// Renders as a Link component
<Button asChild>
  <Link href="/profile">View Profile</Link>
</Button>
```

### Controlled vs Uncontrolled

Components support both controlled and uncontrolled usage:

```tsx
// Controlled
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>

// Uncontrolled
<Select defaultValue="option1">
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
  </SelectContent>
</Select>
```

---

## Styling Guidelines

### Class Name Conventions

Use the `cn` utility for combining classes:

```tsx
import { cn } from "@/lib/utils";

function Component({ className, variant }: Props) {
  return (
    <div
      className={cn(
        "base-styles",
        variant === "large" && "large-styles",
        className,
      )}
    >
      Content
    </div>
  );
}
```

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive grid */}
</div>
```

### Dark Mode Support

Components automatically support dark mode through CSS variables:

```tsx
<div className="bg-background text-foreground border-border">
  {/* Colors adapt to theme */}
</div>
```

### Focus States

Ensure proper focus indicators for accessibility:

```tsx
<button className="focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none">
  Accessible Button
</button>
```

### Animation Guidelines

Use consistent animation durations and easings:

```tsx
<div className="transition-all duration-200 ease-in-out hover:scale-105">
  Animated element
</div>
```

---

This documentation covers all the major UI components and patterns used in the EVAL Gaming platform. Each component is designed to be accessible, composable, and consistent with the overall design system.
