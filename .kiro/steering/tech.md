# Technology Stack & Development Guide

## Core Technologies

### Frontend

- **Next.js 15** - React framework with App Router and server components
- **TypeScript** - Strict type checking with `noUncheckedIndexedAccess`
- **Tailwind CSS** - Utility-first styling with custom design system
- **shadcn/ui** - Component library built on Radix UI primitives
- **Framer Motion** - Animation library for smooth transitions

### Backend & Database

- **tRPC** - End-to-end typesafe APIs with React Query integration
- **Prisma ORM** - Type-safe database operations with PostgreSQL
- **PostgreSQL** - Primary database with UUID support
- **Supabase** - Database hosting and file storage

### Authentication & Services

- **Clerk** - Authentication with social providers and webhooks
- **Vercel Analytics** - Performance monitoring
- **PostHog** - User analytics and feature flags

## Development Commands

### Database Operations

```bash
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Deploy migrations to database
npm run db:push         # Push schema changes directly
npm run db:studio       # Open Prisma Studio
npm run db:seed         # Seed database with sample data
npm run db:reset:full   # Reset database and reseed
```

### Development

```bash
npm run dev             # Start dev server with ngrok tunnel
npm run dev:next        # Start Next.js dev server only
npm run dev:ngrok       # Start ngrok tunnel for webhooks
```

### Code Quality

```bash
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run typecheck       # Run TypeScript checking
npm run format:check    # Check code formatting
npm run format:write    # Apply Prettier formatting
```

### Build & Deploy

```bash
npm run build           # Build production application
npm run preview         # Build and preview locally
npm run start           # Start production server
```

## Environment Configuration

Uses `@t3-oss/env-nextjs` for type-safe environment variables. Key variables:

- `DATABASE_URL` / `DIRECT_URL` - PostgreSQL connections
- `CLERK_SECRET_KEY` / `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Authentication
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database/storage
- Discord webhook URLs for logging and notifications

## Package Manager

- Uses **npm** as package manager (`npm@10.9.2`)
- Install with `npm install --force` due to peer dependency conflicts
