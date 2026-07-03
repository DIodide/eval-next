# Trigger.dev Background Tasks

This app uses Trigger.dev for durable background work that should not run inside
Next.js request handlers. Vercel continues to host the web app. Trigger.dev runs
the task workers.

## Why Trigger.dev

The existing app already has request-time side effects, especially in messaging:

- A player sends a message through `src/server/services/messaging.ts`.
- The app writes `Conversation` and `Message` rows with Prisma.
- The previous implementation sent Resend email inline after the DB transaction.

That makes user-facing requests depend on email rendering, Resend latency, and
retry behavior. Trigger.dev moves those side effects into a durable worker with
retries, logs, idempotency, and long waits.

## Runtime Model

```txt
Vercel / Next.js
  handles routes, tRPC, Clerk, Stripe, dashboard UI
  writes the primary DB transaction
  triggers a Trigger.dev task

Trigger.dev
  receives the task run
  executes code from the /trigger folder
  retries failures
  handles long waits without tying up Vercel functions
  writes task results back to Postgres

Postgres / Prisma
  remains the source of truth for app state
```

## Files

```txt
trigger.config.ts
  Trigger.dev project config. Points Trigger.dev at the ./trigger directory.

trigger/db.ts
  Task-safe Prisma client. It avoids importing src/server/db.ts because that
  module depends on the full Next.js env schema.

trigger/messaging.ts
  Background workflow for player-message side effects.

src/lib/server/background-tasks.ts
  Small server-side wrapper used by app code to trigger task runs.

src/server/services/messaging.ts
  Creates the message and enqueues the Trigger.dev workflow after commit.
```

## Current Workflow

The first integrated workflow is `player-message-workflow`.

```txt
1. Player sends a message.
2. sendPlayerMessage() writes the conversation/message in Prisma.
3. After the transaction succeeds, the app triggers player-message-workflow.
4. Trigger.dev loads fresh coach/player/message state from Postgres.
5. If the coach is preprovisioned and below the forwarding cap, Trigger.dev
   sends the existing Resend player-message email.
6. On success, Trigger.dev increments coach.forwarded_emails_count.
7. Trigger.dev waits 24 hours.
8. Trigger.dev checks whether the coach has replied.
9. Reminder email delivery is logged as eligible but intentionally left as the
   next implementation step because the schema still needs reminder state.
```

The task is idempotent at the trigger boundary:

```txt
player-message-workflow:<messageId>
```

That prevents duplicate task runs for the same message when the app retries a
trigger call.

## Environment Variables

### Vercel

Vercel needs the runtime secret used by the Next.js app to trigger tasks:

```txt
TRIGGER_SECRET_KEY=tr_...
TRIGGER_PROJECT_ID=proj_...
```

### Trigger.dev

Trigger.dev workers need the env vars required by the task code:

```txt
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
RESEND_FROM_MESSAGES="EVAL Gaming <messages@evalgaming.com>"
RESEND_FROM_REMINDERS="EVAL Gaming <reminders@evalgaming.com>"
SKIP_ENV_VALIDATION=1
```

`SKIP_ENV_VALIDATION=1` is recommended for Trigger.dev workers because some
shared email modules import `src/env.js`, which validates the full Next.js app
environment. The task runtime should not need unrelated public Vercel, Clerk, or
PostHog variables just to send an email.

## Local Development

Run the app and Trigger.dev worker side by side:

```bash
npm run dev
npm run trigger:dev
```

The Trigger.dev dev process receives runs from the local app and executes the
task code locally.

## Deployment

If Vercel deploys directly from GitHub, use the Trigger.dev Vercel integration.
It deploys task code alongside the Vercel deployment and can sync environment
variables.

If deployments are managed by GitHub Actions, deploy Trigger.dev tasks before
the Vercel app:

```yaml
- run: npm ci
- run: npm run typecheck
- run: npm run trigger:deploy
  env:
    TRIGGER_ACCESS_TOKEN: ${{ secrets.TRIGGER_ACCESS_TOKEN }}
- run: npx vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
```

Distinguish these secrets:

```txt
TRIGGER_ACCESS_TOKEN
  CI-only token used to deploy task code.

TRIGGER_SECRET_KEY
  Runtime secret used by the app to trigger task runs.
```

## Background Task Candidates

### Currently wired synchronously — should be moved to Trigger.dev

#### Emails

| Task | Location | Risk |
|---|---|---|
| Bulk intro emails to all coaches | `src/server/api/routers/adminCoaches.ts` `sendBulkIntroEmails` | Sequential loop, no rate limiting, will timeout at scale |
| Single coach intro email | `src/server/api/routers/adminCoaches.ts` `sendIntroEmail` | Synchronous inside a tRPC mutation |
| Profile claimed email | `src/emails/coaches/profile-claimed.tsx` | Template exists, send logic unclear |

#### Notifications

| Task | Location | Risk |
|---|---|---|
| Discord webhook logging (registrations, errors, security, coach merges) | `src/lib/discord-logger.ts` | Fire-and-forget, no retry — silent failures on every event |

#### Webhooks / External sync

| Task | Location | Risk |
|---|---|---|
| Clerk webhook → DB upsert + coach merge + Discord log | `src/app/api/auth/webhooks/route.ts` | Multi-step with no recovery if it fails mid-way |
| Stripe webhook → subscription/purchase sync | `src/app/api/webhooks/stripe/route.ts` | Has TODO comments for provisioning — fragile |

#### Bulk operations

| Task | Location | Risk |
|---|---|---|
| `sendBulkCoachMessage()` — message up to 50 players | `src/server/services/messaging.ts` | Large transaction + loop in a single tRPC call, timeout risk |

---

### Email templates that exist but have no send logic yet

These templates in `src/emails/` are unconnected — good candidates for new Trigger.dev workflows:

- `students/welcome.tsx` — send on signup (triggered from Clerk webhook)
- `students/profile-viewed.tsx` — notify player when a coach views their profile
- `students/recruitment-interest.tsx` — coach expresses interest in a player
- `students/coach-reply.tsx` — coach replies to a message thread
- `students/inactivity-nudge.tsx` — re-engagement after N days of inactivity
- `coaches/weekly-digest.tsx` — weekly summary for coaches (scheduled)
- `coaches/reminder.tsx` — reminder (trigger TBD)
- `general/account-deactivation.tsx` — send on account deletion

---

### Future tasks to add

| Task | Type | Notes |
|---|---|---|
| Certificate generation | On-demand | PDF generation is slow and should never block a request |
| Profile view tracking | Event-driven | Debounce coach views → send `profile-viewed` email |
| Coach weekly digest | Scheduled | Template exists; needs a cron every Monday morning |
| Inactivity nudge | Scheduled | Scan for players inactive 7/14/30 days → nudge email |
| Recruitment interest notification | Event-driven | Player notified async when a coach stars their profile |
| Starring debounce | Event-driven | Optimistic UI + background DB write to avoid blocking |
| Onboarding drip sequence | Scheduled | Multi-step emails over day 1, 3, 7 post-signup |
| Admin CSV export | On-demand | Generate and email a report rather than blocking the request |

---

## Next Steps

To finish the 24-hour reminder feature, add reminder state to the database:

```prisma
model Conversation {
  reminder_sent_at         DateTime? @db.Timestamp(6)
  reminder_last_attempt_at DateTime? @db.Timestamp(6)
  reminder_attempt_count   Int       @default(0)
}
```

Then add `sendReminderEmail()` to `src/lib/server/email-bridge.ts` and update
`trigger/messaging.ts` to send the reminder and mark `reminder_sent_at`.

## References

- Trigger.dev Next.js guide: https://trigger.dev/docs/guides/frameworks/nextjs
- Trigger.dev triggering docs: https://trigger.dev/docs/triggering
- Trigger.dev idempotency docs: https://trigger.dev/docs/idempotency
- Trigger.dev waits: https://trigger.dev/docs/wait-for
- Trigger.dev Vercel integration: https://trigger.dev/docs/vercel-integration
