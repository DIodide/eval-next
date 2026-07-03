# Organization Accounts Design

## Overview

Organization accounts introduce a formal multi-tenancy layer where **Schools** and **Leagues** function as organizations. Coaches belonging to a school automatically inherit that school association through org membership, eliminating manual association requests. The same pattern applies to leagues and their administrators.

## Current State

- Coaches have a direct `school_id` FK to `School`
- Coach onboarding requires a `SchoolAssociationRequest` (admin-approved: PENDING → APPROVED)
- Leagues use `LeagueAdministrator` and `LeagueSchool` join tables
- Auth is Clerk-based with webhook sync — no Clerk Organizations used
- Shadow/preprovisioned coaches exist without Clerk accounts (`clerk_id: null`)

## Proposed Approach: Clerk Organizations + DB Mirror

Use Clerk's built-in Organizations feature for identity and access management, mirrored to a database layer for querying and application logic.

---

## Data Model

### New Models

```prisma
model Organization {
  id              String           @id @default(cuid())
  clerk_org_id    String           @unique    // Clerk organization ID
  name            String
  type            OrgType                     // SCHOOL or LEAGUE
  school_id       String?          @unique    // Links to School if type=SCHOOL
  league_id       String?          @unique    // Links to League if type=LEAGUE
  slug            String           @unique    // URL-friendly identifier
  logo_url        String?
  domain          String?                     // e.g. "university.edu" for auto-join
  created_at      DateTime         @default(now())

  school          School?          @relation(fields: [school_id], references: [id])
  league          League?          @relation(fields: [league_id], references: [id])
  members         OrganizationMember[]
  invites         OrganizationInvite[]
}

model OrganizationMember {
  id              String           @id @default(cuid())
  org_id          String
  clerk_user_id   String           // Clerk user ID
  role            OrgRole          // OWNER, ADMIN, COACH, ASSISTANT
  coach_id        String?          // If this member is a Coach
  league_admin_id String?          // If this member is a LeagueAdmin
  joined_at       DateTime         @default(now())

  organization    Organization     @relation(fields: [org_id], references: [id])
  coach           Coach?           @relation(fields: [coach_id], references: [id])
  league_admin    LeagueAdministrator? @relation(fields: [league_admin_id], references: [id])

  @@unique([org_id, clerk_user_id])
}

model OrganizationInvite {
  id              String           @id @default(cuid())
  org_id          String
  email           String
  role            OrgRole          @default(COACH)
  status          InviteStatus     @default(PENDING)
  invited_by      String           // clerk_user_id of inviter
  created_at      DateTime         @default(now())
  expires_at      DateTime

  organization    Organization     @relation(fields: [org_id], references: [id])

  @@unique([org_id, email])
}
```

### New Enums

```prisma
enum OrgType {
  SCHOOL
  LEAGUE
}

enum OrgRole {
  OWNER       // Head coach / league founder — can delete org, manage billing
  ADMIN       // Can invite/remove members, manage settings
  COACH       // Standard coach access
  ASSISTANT   // Limited access (view-only for some features)
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}
```

### Relationship Additions to Existing Models

- `School` gets an optional `Organization` back-relation
- `League` gets an optional `Organization` back-relation
- `Coach` gets an optional `OrganizationMember[]` relation
- `LeagueAdministrator` gets an optional `OrganizationMember[]` relation

---

## How It Works

### School Organizations

1. When a school is created (or migrated), a Clerk Organization and a DB `Organization` record are created together.
2. The first coach approved for that school becomes the `OWNER`.
3. The owner can **invite other coaches by email**, replacing the manual `SchoolAssociationRequest` flow for subsequent coaches.
4. Optional: **domain-based auto-join** — any `@school.edu` email auto-joins the org.
5. All coaches in the org automatically get their `school_id` set. No association request needed.

### League Organizations

Same pattern as schools:
- League gets an org, league admins are members.
- League can have multiple admins with different roles (`OWNER`, `ADMIN`).
- Member schools can be managed through the org interface.

### Shadow Coach Compatibility

The preprovisioned/shadow coach system continues to work:

1. Org owner invites `coach@school.edu` → `OrganizationInvite` is created.
2. If that email matches a preprovisioned coach (no `clerk_id`), the invite links to them.
3. When the coach signs up via Clerk, the `organization.membership.created` webhook fires.
4. Webhook handler auto-sets `school_id`, creates the `OrganizationMember` record, and merges with the shadow coach (existing behavior in `user.created` webhook).

---

## Webhook Changes

New Clerk webhook events to handle in `src/app/api/auth/webhooks/route.ts`:

| Event | Action |
|-------|--------|
| `organization.created` | Create DB `Organization` record |
| `organization.updated` | Sync name, slug, logo changes |
| `organization.deleted` | Soft-delete or archive org and unlink members |
| `organizationMembership.created` | Create `OrganizationMember`, auto-set coach's `school_id` |
| `organizationMembership.updated` | Update member role |
| `organizationMembership.deleted` | Remove member, optionally unlink `school_id` |
| `organizationInvitation.created` | Create `OrganizationInvite`, optionally link to shadow coach |
| `organizationInvitation.accepted` | Update invite status to `ACCEPTED` |
| `organizationInvitation.revoked` | Update invite status to `REVOKED` |

---

## Role Permissions

| Capability | OWNER | ADMIN | COACH | ASSISTANT |
|------------|-------|-------|-------|-----------|
| Manage org settings | Yes | Yes | No | No |
| Invite/remove members | Yes | Yes | No | No |
| Change member roles | Yes | No | No | No |
| Manage billing | Yes | No | No | No |
| Delete organization | Yes | No | No | No |
| Create teams/tryouts | Yes | Yes | Yes | No |
| Manage teams/tryouts | Yes | Yes | Own only | No |
| View teams/tryouts | Yes | Yes | Yes | Yes |
| Send messages | Yes | Yes | Yes | No |
| View school announcements | Yes | Yes | Yes | Yes |
| Create school announcements | Yes | Yes | Yes | No |

---

## What This Unlocks

- **Automatic school association**: Join org → linked to school with no admin approval step.
- **Org-level billing**: School pays for Eval+ for all coaches via a single Stripe subscription per org.
- **Role-based access**: Head coach manages tryouts/teams, assistants get view-only access.
- **Invite flow**: Head coach sends invite link or email → new coach lands directly in the school.
- **Shared visibility**: All org members see the same teams, conversations, tryouts.
- **League orgs work identically**: League admins manage their org the same way schools do.

---

## Migration Plan

### Phase 1: Schema & Infrastructure
1. Add new models (`Organization`, `OrganizationMember`, `OrganizationInvite`) and enums to Prisma schema.
2. Run migration.
3. Add Clerk Organization webhook handlers.

### Phase 2: Data Migration
1. For every `School` that has at least one coach, create a Clerk Organization via the Clerk Admin API.
2. Create corresponding DB `Organization` records linked to each school.
3. Migrate existing coach-school relationships into `OrganizationMember` records.
4. Designate the earliest coach per school as `OWNER` (or flag for manual assignment).

### Phase 3: Application Integration
1. Add org management UI for owners/admins (invite members, manage roles, settings).
2. Update coach onboarding to check for org invites before falling back to `SchoolAssociationRequest`.
3. Update coach dashboard to show org context (other coaches, shared resources).
4. Add org switcher if a coach belongs to multiple orgs (e.g., school + league).

### Phase 4: League Orgs
1. Repeat Phase 2 for leagues.
2. Extend league admin UI with org management.

### Phase 5: Deprecation
1. Keep `SchoolAssociationRequest` working as a fallback for coaches who sign up without an invite.
2. Gradually migrate remaining manual associations to org-based flow.
3. Deprecate `SchoolAssociationRequest` once org adoption is complete.

---

## Trade-offs

| Consideration | Detail |
|---------------|--------|
| **Clerk Organizations is a paid feature** | Verify Clerk plan supports it before starting |
| **Added complexity** | New DB layer, but replaces the manual association request flow |
| **Alternative: DB-only orgs** | Skip Clerk orgs, build custom invite/membership in DB only. Simpler to start but loses Clerk's org switcher UI, SSO per org, and domain verification |
| **Shadow coach edge cases** | Need careful handling when a shadow coach is invited to an org before they have a Clerk account |
| **Multi-org membership** | A coach could belong to multiple orgs (e.g., school + league). UI needs an org switcher |

---

## Key Files to Modify

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add Organization, OrganizationMember, OrganizationInvite models and enums |
| `src/app/api/auth/webhooks/route.ts` | Handle new Clerk organization webhook events |
| `src/server/api/routers/` | New `organizations.ts` router for TRPC endpoints |
| `src/app/dashboard/coach/` | Org management UI, member list, invite flow |
| `src/app/dashboard/admin/` | Admin tools for org oversight |
| `src/server/services/` | New `organizations.ts` service for business logic |
