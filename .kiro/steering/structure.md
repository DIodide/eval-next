# Project Structure & Architecture

## Directory Organization

### Source Code (`src/`)

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard and management
│   ├── api/               # API routes and webhooks
│   ├── dashboard/         # User dashboards (player/coach)
│   ├── profiles/          # Public profile pages
│   ├── rankings/          # League rankings and statistics
│   ├── tryouts/           # Tryout browsing and registration
│   └── _components/       # Shared page components
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── core/             # Custom business logic components
│   └── valorant/         # Game-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
│   ├── client/           # Client-side utilities
│   └── server/           # Server-side utilities
├── server/                # Backend logic
│   ├── api/              # tRPC routers and procedures
│   └── db.ts             # Database connection
├── trpc/                  # tRPC client configuration
└── types/                 # TypeScript type definitions
```

### Database (`prisma/`)

- `schema.prisma` - Database schema with comprehensive models
- `migrations/` - Database migration files
- `seed.ts` - Database seeding scripts

### Static Assets (`public/`)

- Game-specific assets organized by title (ValAssets/, SSBUAssets/, etc.)
- Platform branding and logos (`eval/`)
- Partner and team assets

## Architecture Patterns

### API Layer

- **tRPC routers** organized by domain (playerProfile, coachProfile, tryouts, etc.)
- Type-safe procedures with Zod validation
- Server-side context with authentication

### Database Design

- **UUID primary keys** with PostgreSQL `gen_random_uuid()`
- **Clerk integration** for user management
- **Multi-game support** with polymorphic relationships
- **Performance tracking** with detailed analytics models

### Component Structure

- **shadcn/ui** for base components in `components/ui/`
- **Business components** in `components/core/`
- **Game-specific components** in dedicated folders
- **Shared utilities** in `lib/utils.ts` with `cn()` helper

### Styling Conventions

- **Tailwind CSS** with utility-first approach
- **CSS variables** for theming support
- **Custom backgrounds** for different sections
- **Responsive design** with mobile-first approach

### File Naming

- **kebab-case** for files and directories
- **PascalCase** for React components
- **camelCase** for functions and variables
- **SCREAMING_SNAKE_CASE** for constants

## Key Conventions

### Import Aliases

- `@/*` maps to `src/*`
- Consistent import ordering: external packages, internal modules, relative imports

### Database Models

- All models use UUID primary keys
- Timestamps with `created_at` and `updated_at`
- Foreign key relationships with proper indexing
- Clerk integration for user authentication

### API Routes

- tRPC procedures organized by feature domain
- Input validation with Zod schemas
- Proper error handling and type safety
