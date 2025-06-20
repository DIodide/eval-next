# Discord Logging Integration Guide

## Overview

The Discord logging system provides automated notifications for key events happening on the EVAL Gaming Platform. It supports multiple webhook configurations and standardized message formats for different types of events.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Discord webhook URLs (all optional)
DISCORD_WEBHOOK_GENERAL=https://discord.com/api/webhooks/your-general-webhook-url
DISCORD_WEBHOOK_ADMIN=https://discord.com/api/webhooks/your-admin-webhook-url
DISCORD_WEBHOOK_SECURITY=https://discord.com/api/webhooks/your-security-webhook-url
DISCORD_WEBHOOK_ERRORS=https://discord.com/api/webhooks/your-errors-webhook-url
```

### 2. Discord Webhook Setup

1. Create Discord webhooks in your desired channels:

   - Go to Discord Server Settings → Integrations → Webhooks
   - Create a new webhook for each channel you want notifications in
   - Copy the webhook URLs to your environment variables

2. Recommended channel structure:
   - `#general-activity` - General platform activity (registrations, tryout creation)
   - `#admin-alerts` - Administrative actions and school association requests
   - `#security-alerts` - Security-related notifications
   - `#error-logs` - Application errors and issues

## Usage

### Basic Integration

```typescript
import {
  logSchoolAssociationRequest,
  logSchoolAssociationApproved,
  logTryoutCreated,
  LogEventType,
} from "@/lib/discord-logger";

// Example: Log school association request
await logSchoolAssociationRequest({
  requestId: request.id,
  coachName: `${coach.first_name} ${coach.last_name}`,
  coachEmail: coach.email,
  schoolName: school.name,
  schoolType: school.type,
  schoolLocation: `${school.location}, ${school.state}`,
  requestMessage: request.message,
  userEmail: coach.email,
  timestamp: new Date(),
});
```

### Custom Webhook URLs

You can override the default webhook URL for specific events:

```typescript
// Send to a specific webhook instead of default
await logSchoolAssociationRequest(
  data,
  "https://discord.com/api/webhooks/custom-url",
);
```

### Available Event Types

#### School Association Events

- `SCHOOL_ASSOCIATION_REQUEST` - New coach school association request
- `SCHOOL_ASSOCIATION_APPROVED` - Request approved by admin
- `SCHOOL_ASSOCIATION_REJECTED` - Request rejected by admin

#### Platform Activity

- `TRYOUT_CREATED` - New tryout created
- `COMBINE_CREATED` - New combine created
- `USER_REGISTRATION` - New user registration

#### Administrative

- `ADMIN_ACTION` - Administrative actions performed
- `ERROR` - Application errors
- `SECURITY_ALERT` - Security-related alerts

## Integration Examples

### School Association Requests

```typescript
// In coachProfile.ts router - when request is submitted
await logSchoolAssociationRequest({
  requestId: newRequest.id,
  coachName: `${coach.first_name} ${coach.last_name}`,
  coachEmail: coach.email,
  schoolName: school.name,
  schoolType: school.type.replace("_", " "),
  schoolLocation: `${school.location}, ${school.state}`,
  requestMessage: input.request_message,
  userId: ctx.auth.userId,
  userEmail: coach.email,
  timestamp: new Date(),
});
```

### Admin Actions

```typescript
// In schoolAssociationRequests.ts router - when request is approved
await logSchoolAssociationApproved({
  requestId: input.requestId,
  coachName: `${request.coach.first_name} ${request.coach.last_name}`,
  coachEmail: request.coach.email,
  schoolName: request.school.name,
  adminName: adminUser.name,
  adminNotes: input.adminNotes,
  decision: "approved",
  userId: ctx.auth.userId,
  userEmail: adminUser.email,
  timestamp: new Date(),
});
```

### Error Logging

```typescript
import { logError } from "@/lib/discord-logger";

try {
  // Some operation that might fail
} catch (error) {
  await logError({
    error: error.message,
    errorCode: "TRPC_ERROR",
    stack: error.stack,
    endpoint: "coachProfile.updateProfile",
    severity: "medium",
    userId: ctx.auth.userId,
    userEmail: ctx.user?.email,
    timestamp: new Date(),
  });

  throw error; // Re-throw after logging
}
```

### Security Alerts

```typescript
import { logSecurityAlert } from "@/lib/discord-logger";

// Example: Suspicious admin access attempt
await logSecurityAlert({
  alertType: "Unauthorized Admin Access Attempt",
  severity: "high",
  details: `User ${userEmail} attempted to access admin panel without proper permissions`,
  blockedAction: "Admin panel access",
  userId: ctx.auth.userId,
  userEmail: userEmail,
  ip: requestIp,
  timestamp: new Date(),
});
```

## Message Formats

All Discord messages use rich embeds with:

- Color-coded based on event type
- Structured fields for consistent information display
- Timestamps and footer branding
- Appropriate emojis for visual clarity

### Example Message Structure

```
🏫 New School Association Request
A coach has requested association with a school and requires admin review.

👤 Coach Details              🏫 School Details
Name: John Smith              Name: University of Gaming
Email: john@example.com       Type: University
                             Location: Los Angeles, CA

📄 Request ID
abc123-def456-ghi789

💬 Message
I have been coaching esports at this university for 2 years...

🕒 2024-01-15 10:30:00 UTC
EVAL Gaming Platform
```

## Best Practices

1. **Webhook Organization**: Use different webhooks for different types of events to avoid channel spam
2. **Error Handling**: Always wrap Discord logging in try-catch to prevent it from breaking your main application flow
3. **Rate Limiting**: Discord has rate limits, so avoid sending too many messages in rapid succession
4. **Sensitive Data**: Be careful not to log sensitive information like passwords or API keys
5. **Performance**: Discord logging is async and fire-and-forget - don't wait for responses in critical paths

## Troubleshooting

### Common Issues

1. **Messages not appearing**: Check webhook URLs and Discord channel permissions
2. **Rate limiting**: Discord may temporarily block messages if you send too many too quickly
3. **Formatting issues**: Ensure message content doesn't exceed Discord's character limits (2000 characters for content, 6000 for embeds)

### Testing

You can test the Discord integration by creating a test webhook and using it in development:

```typescript
// Test in development
if (env.NODE_ENV === "development") {
  await logSchoolAssociationRequest(
    testData,
    "https://discord.com/api/webhooks/test-webhook",
  );
}
```
