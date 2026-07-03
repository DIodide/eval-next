# Email System

This document describes every email template in the platform, organized by audience. Each entry lists the email's purpose, category, trigger condition, and template file location.

## Infrastructure

- **Service**: [Resend](https://resend.com) via `resend` SDK
- **Templates**: React Email (`@react-email/components`)
- **Sending logic**: `src/lib/server/email-bridge.ts`
- **Client config**: `src/lib/email.ts`

### From addresses

| Variable | Default | Used for |
|---|---|---|
| `RESEND_FROM_RECRUITING` | `EVAL Gaming Recruiting <recruiting@evalgaming.com>` | Coach intro / recruiting emails |
| `RESEND_FROM_MESSAGES` | `EVAL Gaming <messages@evalgaming.com>` | Message notifications |
| `RESEND_FROM_REMINDERS` | `EVAL Gaming <reminders@evalgaming.com>` | Reminders and follow-ups |

---

## Coach Emails (`src/emails/coaches/`)

### Coach Intro

| | |
|---|---|
| **File** | `coaches/coach-intro.tsx` |
| **Category** | Welcome |
| **Trigger** | Admin sends invite to a preprovisioned coach (single or bulk) |
| **Purpose** | First-touch recruitment email. Informs the coach their esports program has been added to EVAL Gaming and invites them to claim their profile. |
| **CTA** | "Claim Your Coach Profile" → sign-up page |
| **Status** | Active — sent via `sendCoachIntroEmail()` in `email-bridge.ts` |

### Player Message

| | |
|---|---|
| **File** | `coaches/player-message.tsx` |
| **Category** | Notification |
| **Trigger** | A student player sends a message to a coach |
| **Purpose** | Notifies preprovisioned coaches that a player reached out. Includes a player card (name, game, rank, GPA) and a truncated message preview. |
| **CTA** | "View Message on EVAL" → sign-up page with redirect to messages |
| **Rate limit** | Max 3 forwarded emails per preprovisioned coach |
| **Status** | Active — sent via `sendPlayerMessageEmail()` in `email-bridge.ts` |

### Reminder

| | |
|---|---|
| **File** | `coaches/reminder.tsx` |
| **Category** | Reminder |
| **Trigger** | A player message to a coach goes unread for X days |
| **Purpose** | Follow-up nudge encouraging the coach to sign up and respond to a waiting player. |
| **CTA** | "View Message on EVAL" → sign-up page |
| **Status** | Template defined; sending function not yet implemented |

### Profile Claimed

| | |
|---|---|
| **File** | `coaches/profile-claimed.tsx` |
| **Category** | Confirmation |
| **Trigger** | Coach successfully claims their preprovisioned profile |
| **Purpose** | Welcomes the coach and highlights next steps: complete profile, view player messages, browse recruits. |
| **CTA** | "Go to Your Dashboard" → coach dashboard |
| **Status** | Template defined; sending function not yet implemented |

### Weekly Digest

| | |
|---|---|
| **File** | `coaches/weekly-digest.tsx` |
| **Category** | Digest |
| **Trigger** | Cron job — sent once per week to active coaches |
| **Purpose** | Summarizes the past week's activity: profile views, new messages, and interested players. Keeps coaches engaged. |
| **CTA** | "View Full Dashboard" → coach dashboard |
| **Status** | Template defined; sending function and cron not yet implemented |

---

## Student / Player Emails (`src/emails/students/`)

### Welcome

| | |
|---|---|
| **File** | `students/welcome.tsx` |
| **Category** | Welcome |
| **Trigger** | Student completes sign-up |
| **Purpose** | Onboarding email encouraging the student to complete their profile, browse programs, and message coaches. |
| **CTA** | "Complete Your Profile" → player profile editor |
| **Status** | Template defined; sending function not yet implemented |

### Coach Reply

| | |
|---|---|
| **File** | `students/coach-reply.tsx` |
| **Category** | Notification |
| **Trigger** | A coach replies to a student's message |
| **Purpose** | Alerts the student that a coach responded and includes a truncated message preview. |
| **CTA** | "View Full Message" → player messages |
| **Status** | Template defined; sending function not yet implemented |

### Profile Viewed

| | |
|---|---|
| **File** | `students/profile-viewed.tsx` |
| **Category** | Notification |
| **Trigger** | A coach views a student's player profile |
| **Purpose** | Lets the player know a specific coach checked out their profile, encouraging them to explore the program and reach out. |
| **CTA** | "View [School]'s Program" → school profile page |
| **Status** | Template defined; sending function not yet implemented |

### Recruitment Interest

| | |
|---|---|
| **File** | `students/recruitment-interest.tsx` |
| **Category** | Notification |
| **Trigger** | A coach bookmarks/favorites a student's profile |
| **Purpose** | High-signal notification that a coach saved the player's profile, indicating active recruitment interest. |
| **CTA** | "View [School]'s Program" → school profile page |
| **Status** | Template defined; sending function not yet implemented |

### Inactivity Nudge

| | |
|---|---|
| **File** | `students/inactivity-nudge.tsx` |
| **Category** | Reminder |
| **Trigger** | Student hasn't logged in for X days (e.g., 14 days) |
| **Purpose** | Re-engagement email reminding the player that coaches are actively browsing and encouraging them to update their profile. |
| **CTA** | "Update Your Profile" → player profile editor |
| **Status** | Template defined; sending function and cron not yet implemented |

---

## General Emails (`src/emails/general/`)

These are transactional emails sent to any user regardless of role.

### Email Verification

| | |
|---|---|
| **File** | `general/email-verification.tsx` |
| **Category** | Transactional |
| **Trigger** | User signs up or changes their email address |
| **Purpose** | Sends a time-limited verification link (24h expiry) to confirm the user owns the email address. |
| **CTA** | "Verify Email Address" → verification endpoint |
| **Status** | Template defined; sending function not yet implemented |

### Password Reset

| | |
|---|---|
| **File** | `general/password-reset.tsx` |
| **Category** | Transactional |
| **Trigger** | User requests a password reset |
| **Purpose** | Sends a time-limited reset link (1h expiry) to allow the user to set a new password. |
| **CTA** | "Reset Password" → password reset page |
| **Status** | Template defined; sending function not yet implemented |

### Account Deactivation

| | |
|---|---|
| **File** | `general/account-deactivation.tsx` |
| **Category** | Transactional |
| **Trigger** | Admin or user deactivates an account |
| **Purpose** | Confirms the account has been deactivated and provides a way to contact support. Optionally includes a reason. |
| **CTA** | "Contact Support" → support page |
| **Status** | Template defined; sending function not yet implemented |

---

## Email Categories Summary

| Category | Description | Examples |
|---|---|---|
| **Welcome** | Sent once when a user first joins or claims their account | Coach Intro, Profile Claimed, Student Welcome |
| **Notification** | Event-driven alerts about activity relevant to the user | Player Message, Coach Reply, Profile Viewed, Recruitment Interest |
| **Reminder** | Follow-up nudges for unread messages or inactivity | Reminder, Inactivity Nudge |
| **Digest** | Periodic summaries of platform activity | Weekly Digest |
| **Transactional** | Account management and security | Email Verification, Password Reset, Account Deactivation |
| **Confirmation** | Acknowledges a completed action | Profile Claimed |
