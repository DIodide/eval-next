# Preprovisioned Coach Infrastructure & Email Bridge (Phases 1 + 2)

Implementation guide for preprovisioned coaches and the email bridge system.

---

## Phase 1: Preprovisioned Coach Infrastructure

### 1.1 Schema Migration (`prisma/schema.prisma`)

**New enums:**

- `CoachStatus`: `SCRAPED`, `INVITED`, `ACTIVE`
- `CoachSource`: `SCRAPED`, `MANUAL`, `SIGNUP`

**Coach model changes:**

- `clerk_id` — now nullable (preprovisioned coaches don't have Clerk accounts)
- `username` — now nullable
- `status` — defaults to `ACTIVE` (existing coaches unaffected)
- `source` — defaults to `SIGNUP` (existing coaches unaffected)
- `title` — optional, e.g. "Head Coach", "Director of Esports", "Esports Program"
- `forwarded_emails_count` — default 0, tracks email bridge usage
- `intro_email_sent` — default false
- Added index on `status`

### 1.2 CSV Import Script (`scripts/import-preprovisioned-coaches.ts`)

Bulk-creates preprovisioned coach records from a CSV file.

**Usage:**

```bash
# Dry run (no writes)
tsx scripts/import-preprovisioned-coaches.ts path/to/coaches.csv --dry-run

# Actually import
tsx scripts/import-preprovisioned-coaches.ts path/to/coaches.csv
```

**Or via npm script (add to package.json):**

```json
"db:import-coaches": "tsx scripts/import-preprovisioned-coaches.ts"
```

**CSV format** (see `scripts/templates/preprovisioned-coaches-example.csv`):

| Column        | Required | Description                                                        |
| ------------- | -------- | ------------------------------------------------------------------ |
| `first_name`  | No       | Coach first name                                                   |
| `last_name`   | No       | Coach last name                                                    |
| `email`       | Yes      | Coach email address                                                |
| `school_name` | Yes      | Must match an existing School record (exact, case-insensitive)     |
| `title`       | No       | Role title. Auto-set to "Esports Program" if name fields are empty |

**Behavior:**

- Matches school_name against existing `School` records (case-insensitive exact match)
- Skips rows with missing email, unmatched school, or duplicate email
- Creates coaches with `status: INVITED`, `source: SCRAPED`, `clerk_id: null`
- Outputs summary: created/skipped/error counts

### 1.3 Clerk Webhook — Preprovisioned Coach Merge on Signup

**File:** `src/app/api/auth/webhooks/route.ts`

When a coach signs up via Clerk, the webhook checks for an existing preprovisioned coach with the same email and no `clerk_id`. If found, it **merges** (updates the existing record) instead of creating a new one.

**Merge logic (both `user.created` and `user.updated` handlers):**

1. Check `db.coach.findFirst({ where: { email, clerk_id: null } })`
2. If match → update existing record: set `clerk_id`, `status: ACTIVE`, `username`, `image_url`, `first_name`, `last_name`
3. If no match → create new coach as before
4. Merge events are logged to Discord with a dedicated `COACH_MERGE` log type

**Edge case:** Coach signs up with a different email than scraped → no merge, creates new record (correct behavior).

### Discord Logging

**New log type:** `COACH_MERGE` added to `src/lib/discord-logger.ts`

- Routes to the registrations + admin webhooks
- Includes preprovisioned coach ID, email, and school info in the embed
- Helper: `logCoachMerge()`

---

## Phase 2: Email Bridge (Resend + React Email)

### 2.1 Resend Setup

**Environment variables** (added to `src/env.js`, both optional):

- `RESEND_API_KEY` — Resend API key
- `RESEND_FROM_EMAIL` — sender address, defaults to `EVAL Gaming <recruiting@evalgaming.com>`

**Email client singleton:** `src/lib/email.ts`

- `getResendClient()` — lazy-initialized Resend instance
- `getFromEmail()` — returns configured from address
- `isEmailConfigured()` — boolean check for feature gating

**Packages installed:** `resend`, `@react-email/components`

### 2.2 React Email Templates (`src/emails/`)

Three templates built with `@react-email/components`:

| Template               | File                            | When sent                                                                                                                                              |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **CoachIntroEmail**    | `src/emails/coach-intro.tsx`    | One-time warm intro after scraping (before any player messages). CTA: "Claim Your Coach Profile"                                                       |
| **PlayerMessageEmail** | `src/emails/player-message.tsx` | When a player messages a preprovisioned coach. Includes player card (name, game, rank, GPA) and truncated message preview. CTA: "View Message on EVAL" |
| **ReminderEmail**      | `src/emails/reminder.tsx`       | Follow-up if coach hasn't responded after 24h. Subject: "A player tried to contact your esports program"                                               |

All templates use EVAL purple (`#7c3aed`) branding and link to the coach signup flow.

### 2.3 Email Bridge Logic

**Core file:** `src/lib/server/email-bridge.ts`

- `sendPlayerMessageEmail()` — sends player message notification, respects the 3-email cap
- `sendCoachIntroEmail()` — sends one-time intro email

**Changes to `src/server/services/messaging.ts`:**

**`sendPlayerMessage` updates:**

1. Expanded coach select to include `clerk_id`, `email`, `first_name`, `last_name`, `school`, `forwarded_emails_count`
2. **Spam prevention:** If coach is preprovisioned (`clerk_id: null`), player can only send 1 unreplied message. Additional messages blocked with: "This coach hasn't joined EVAL yet. You can send another message once they respond."
3. **Email bridge trigger:** After the transaction, if the coach is preprovisioned:
   - Fetches player details (name, game, rank, GPA) for the email
   - Calls `sendPlayerMessageEmail()` (respects 3-email forwarding cap)
   - Increments `coach.forwarded_emails_count` on success
4. If `forwarded_emails_count >= 3`, email forwarding stops

**`getAvailableCoachesForMessaging` updates:**

- Now returns `title` and `isPreprovisioned` boolean in the response
- Preprovisioned coaches (with `school_id` set) are already included by the existing query

---

---

## Phase 3: Reminder Emails (Not Yet Implemented)

### Overview

When a player messages a coach and the coach hasn't responded after 24–48 hours, a reminder email should be sent to the coach. This applies to **all coaches** — both preprovisioned (no Clerk account) and active (signed-up). The `ReminderEmail` template already exists at `src/emails/reminder.tsx`.

This requires background job / scheduled task infrastructure, which does not currently exist in the codebase. The recommended approach is **Vercel Cron Jobs** since the app is already deployed on Vercel.

### Recommended Implementation: Vercel Cron

**1. Schema change** — add a `reminder_sent_at` field to `Conversation`:

```prisma
reminder_sent_at DateTime? @db.Timestamp(6)
```

**2. Cron route** — create `src/app/api/cron/send-reminders/route.ts`:

- Secured with a `CRON_SECRET` header check
- Queries for conversations where:
  - No message with `sender_type = "COACH"` exists (coach hasn't replied)
  - Last player message `created_at < now - 24h`
  - `reminder_sent_at IS NULL` (reminder not already sent)
- For preprovisioned coaches (`clerk_id IS NULL`): send to `coach.email` directly
- For active coaches: send to `coach.email` (or trigger an in-app notification — TBD)
- Sets `reminder_sent_at = now` on success

**3. Vercel config** — add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour. The route's query window handles the actual 24h threshold.

**4. New env vars** needed:

- `CRON_SECRET` — shared secret to authenticate Vercel cron requests

### Alternative: QStash (Upstash)

Instead of polling, enqueue a delayed job at message-send time with a 24hr delay. QStash POSTs to your API route after the delay — no polling, no missed windows. Requires `@upstash/qstash` package and a QStash account. Better fit if more async workflows are added later.

### Files already in place

| File                                       | Status                                     |
| ------------------------------------------ | ------------------------------------------ |
| `src/emails/reminder.tsx`                  | Done — template with PreviewProps          |
| `src/lib/server/email-bridge.ts`           | Needs `sendReminderEmail()` added          |
| `prisma/schema.prisma`                     | Needs `reminder_sent_at` on `Conversation` |
| `src/app/api/cron/send-reminders/route.ts` | Not created                                |
| `vercel.json`                              | Not created                                |

---

## Manual Steps Required

### Testing with Resend test addresses

A test CSV is provided at `scripts/templates/test-coaches.csv` with 3 rows:

- 2 coaches at **Princeton University** using `delivered+` Resend test addresses
- 1 coach at **Fake University** (will be skipped — school not in DB) using `bounced@resend.dev`

```bash
# Dry run first to verify
tsx scripts/import-preprovisioned-coaches.ts scripts/templates/test-coaches.csv --dry-run

# Import (Princeton rows only — Fake University row will be skipped)
tsx scripts/import-preprovisioned-coaches.ts scripts/templates/test-coaches.csv
```

> **Note:** `Fake University` will always be skipped since it doesn't exist in the schools table. This is intentional — it tests the skip/error path of the import script.

---

### Before deploying

- [ ] Run `npx prisma migrate dev --name add_shadow_coach_support`
- [ ] Run `npx prisma generate` (removes `as unknown` type casts in webhook + messaging code)
- [ ] Verify existing coaches auto-default to `status: ACTIVE, source: SIGNUP`
- [ ] Add `"db:import-coaches": "tsx scripts/import-preprovisioned-coaches.ts"` to package.json scripts

### After deploying

- [ ] Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in environment
- [ ] Verify domain DNS: SPF, DKIM, DMARC for `@evalgaming.com`
- [ ] Test email sending with a preprovisioned coach record

### Code cleanup after prisma generate

- [ ] Remove `as unknown as undefined` cast in webhook `clerk_id: null` queries
- [ ] Remove `as Record<string, unknown>` spread for `status` and `forwarded_emails_count` fields
- [ ] Remove `as Record<string, boolean>` spread for `forwarded_emails_count: true` select
- [ ] Remove `coachAny` cast in `getAvailableCoachesForMessaging`

---

## File Summary

| File                                                   | Change                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------- |
| `prisma/schema.prisma`                                 | Added `CoachStatus`, `CoachSource` enums; updated Coach model |
| `src/env.js`                                           | Added `RESEND_API_KEY`, `RESEND_FROM_EMAIL`                   |
| `src/lib/email.ts`                                     | **New** — Resend client singleton                             |
| `src/lib/server/email-bridge.ts`                       | **New** — Email bridge send functions                         |
| `src/emails/coach-intro.tsx`                           | **New** — Coach intro email template                          |
| `src/emails/player-message.tsx`                        | **New** — Player message notification template                |
| `src/emails/reminder.tsx`                              | **New** — Reminder email template                             |
| `src/lib/discord-logger.ts`                            | Added `COACH_MERGE` log type + formatter                      |
| `src/app/api/auth/webhooks/route.ts`                   | Preprovisioned coach merge logic in both handlers             |
| `src/server/services/messaging.ts`                     | Email bridge trigger + spam prevention                        |
| `scripts/import-preprovisioned-coaches.ts`             | **New** — CSV import script                                   |
| `scripts/templates/preprovisioned-coaches-example.csv` | **New** — Example CSV                                         |

======Notes========

1. Could send coach intro email upon onboarding of preprovisioned coaches
2. Adress coaches as coach ...
3. Reminder: distinction bw on platform or no
4. Track metrics:
   Background tasks
