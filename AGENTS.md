# AGENTS.md

## Cursor Cloud specific instructions

### Overview

EVAL Gaming is a Next.js 15 (T3 Stack) college esports recruiting platform. Single app (not a monorepo) using npm as the package manager.

### Running the dev server

```bash
npm run dev:next
```

This starts Next.js with Turbopack on `http://localhost:3000`. Do **not** use `npm run dev` (which also launches ngrok for webhook tunneling and is not needed in cloud).

### Lint, typecheck, and format

Standard commands from `package.json`:

- `npm run lint` — ESLint (warnings only in current codebase, no errors)
- `npm run typecheck` — TypeScript strict mode
- `npm run format:check` / `npm run format:write` — Prettier
- `npm run check` — lint + typecheck combined

### Database

The app uses a remote Supabase-hosted PostgreSQL database. Connection is configured via `DATABASE_URL` and `DIRECT_URL` environment variables (injected as secrets). Prisma is the ORM.

- `npx prisma generate` — regenerate Prisma client after schema changes
- `npx prisma migrate deploy` — apply pending migrations
- `npx prisma studio` — GUI database browser (opens on port 5555)

### Environment variables

All required secrets are injected as environment variables. The env schema is defined in `src/env.js` using `@t3-oss/env-nextjs`. If you need to skip validation (e.g. for builds without full secrets), set `SKIP_ENV_VALIDATION=true`.

Note: the `import "./src/env.js"` line in `next.config.js` is commented out, so env validation does not block the dev server or build.

### Postinstall script

`npm install` triggers: `prisma generate && prisma migrate deploy && tsx prisma/seed_production.ts`. If running `npm install` without database access, use `npm install --ignore-scripts` and then run `npx prisma generate` manually.

### No test framework

This codebase does not currently have automated test infrastructure (no Jest, Vitest, Playwright, or Cypress). Testing is manual via the browser.

### Key external services

- **Clerk** — authentication (sign-in/sign-up, webhooks)
- **Supabase** — PostgreSQL hosting + file storage
- **Stripe** — payment processing (subscriptions)
- **PostHog** — analytics (optional, app works without it)
