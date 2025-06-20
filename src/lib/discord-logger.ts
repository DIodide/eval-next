/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { env } from "@/env";

// Discord webhook configuration types
export interface DiscordWebhookConfig {
  url: string;
  name: string;
  enabled: boolean;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
  author?: {
    name: string;
    icon_url?: string;
  };
}

export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

// Event types for logging
export enum LogEventType {
  SCHOOL_ASSOCIATION_REQUEST = 'school_association_request',
  SCHOOL_ASSOCIATION_APPROVED = 'school_association_approved',
  SCHOOL_ASSOCIATION_REJECTED = 'school_association_rejected',
  TRYOUT_CREATED = 'tryout_created',
  COMBINE_CREATED = 'combine_created',
  USER_REGISTRATION = 'user_registration',
  ADMIN_ACTION = 'admin_action',
  ERROR = 'error',
  SECURITY_ALERT = 'security_alert',
}

// Color constants for different event types
export const DISCORD_COLORS = {
  [LogEventType.SCHOOL_ASSOCIATION_REQUEST]: 0x3498db, // Blue
  [LogEventType.SCHOOL_ASSOCIATION_APPROVED]: 0x2ecc71, // Green
  [LogEventType.SCHOOL_ASSOCIATION_REJECTED]: 0xe74c3c, // Red
  [LogEventType.TRYOUT_CREATED]: 0x9b59b6, // Purple
  [LogEventType.COMBINE_CREATED]: 0xf39c12, // Orange
  [LogEventType.USER_REGISTRATION]: 0x1abc9c, // Turquoise
  [LogEventType.ADMIN_ACTION]: 0xff6b35, // Orange-Red
  [LogEventType.ERROR]: 0xe74c3c, // Red
  [LogEventType.SECURITY_ALERT]: 0xc0392b, // Dark Red
} as const;

// Multiple webhook support - configure different channels for different events
export const WEBHOOK_URLS = {
  general: env.DISCORD_WEBHOOK_GENERAL ?? '',
  admin: env.DISCORD_WEBHOOK_ADMIN ?? '',
  security: env.DISCORD_WEBHOOK_SECURITY ?? '',
  errors: env.DISCORD_WEBHOOK_ERRORS ?? '',
  registrations: env.DISCORD_WEBHOOK_REGISTRATIONS ?? '',
} as const;

// Event routing - which events go to which webhooks
export const EVENT_WEBHOOK_ROUTING: Record<LogEventType, string[]> = {
  [LogEventType.SCHOOL_ASSOCIATION_REQUEST]: ['general', 'admin'],
  [LogEventType.SCHOOL_ASSOCIATION_APPROVED]: ['general', 'admin'],
  [LogEventType.SCHOOL_ASSOCIATION_REJECTED]: ['admin'],
  [LogEventType.TRYOUT_CREATED]: ['general'],
  [LogEventType.COMBINE_CREATED]: ['general'],
  [LogEventType.USER_REGISTRATION]: ['general'],
  [LogEventType.ADMIN_ACTION]: ['admin', 'security'],
  [LogEventType.ERROR]: ['errors', 'admin'],
  [LogEventType.SECURITY_ALERT]: ['security', 'admin'],
};

// Base event data interface
export interface BaseEventData {
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  timestamp?: Date;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// Specific event data interfaces
export interface SchoolAssociationRequestData extends BaseEventData {
  requestId: string;
  coachName: string;
  coachEmail: string;
  schoolName: string;
  schoolType: string;
  schoolLocation: string;
  requestMessage?: string | null | undefined;
}

export interface SchoolAssociationDecisionData extends BaseEventData {
  requestId: string;
  coachName: string;
  coachEmail: string;
  schoolName: string;
  adminName?: string | null;
  adminNotes?: string | null;
  decision: 'approved' | 'rejected';
}

export interface TryoutCreatedData extends BaseEventData {
  tryoutId: string;
  tryoutTitle: string;
  game: string;
  schoolName: string;
  coachName: string;
  startDate: Date;
  endDate: Date;
}

export interface UserRegistrationData extends BaseEventData {
  userType: 'coach' | 'player';
  registrationMethod: string;
}

export interface AdminActionData extends BaseEventData {
  action: string;
  targetUserId?: string | null;
  targetUserEmail?: string | null;
  details: string;
}

export interface ErrorEventData extends BaseEventData {
  error: string;
  errorCode?: string;
  stack?: string;
  endpoint?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityAlertData extends BaseEventData {
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  blockedAction?: string;
}

// Union type for all event data
export type EventData =
  | SchoolAssociationRequestData
  | SchoolAssociationDecisionData
  | TryoutCreatedData
  | UserRegistrationData
  | AdminActionData
  | ErrorEventData
  | SecurityAlertData;

// Discord logging class
class DiscordLogger {
  private async sendToWebhook(url: string, message: DiscordMessage): Promise<boolean> {
    if (!url) {
      console.warn('Discord webhook URL not configured');
      return false;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error('Discord webhook error:', response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to send Discord message:', error);
      return false;
    }
  }

  private createBaseEmbed(eventType: LogEventType, title: string): DiscordEmbed {
    return {
      title,
      color: DISCORD_COLORS[eventType],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'EVAL Gaming Platform',
      },
    };
  }

  async logEvent(eventType: LogEventType, data: EventData, webhookUrl?: string): Promise<void> {
    const message = this.formatEventMessage(eventType, data);

    if (!message) {
      console.warn(`No message formatter found for event type: ${eventType}`);
      return;
    }

         // Use provided webhook URL or default to general webhook
     const url = webhookUrl ?? env.DISCORD_WEBHOOK_SCHOOL_ASSOCIATION;
    
    if (!url) {
      console.warn('No Discord webhook configured for event:', eventType);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.sendToWebhook(url, message);
    } catch (error) {
      console.error('Error sending Discord notification:', error);
    }
  }

  private formatEventMessage(eventType: LogEventType, data: EventData): DiscordMessage | null {
    switch (eventType) {
      case LogEventType.SCHOOL_ASSOCIATION_REQUEST:
        return this.formatSchoolAssociationRequest(data as SchoolAssociationRequestData);
      
      case LogEventType.SCHOOL_ASSOCIATION_APPROVED:
      case LogEventType.SCHOOL_ASSOCIATION_REJECTED:
        return this.formatSchoolAssociationDecision(eventType, data as SchoolAssociationDecisionData);
      
      case LogEventType.TRYOUT_CREATED:
        return this.formatTryoutCreated(data as TryoutCreatedData);
      
      case LogEventType.USER_REGISTRATION:
        return this.formatUserRegistration(data as UserRegistrationData);
      
      case LogEventType.ADMIN_ACTION:
        return this.formatAdminAction(data as AdminActionData);
      
      case LogEventType.ERROR:
        return this.formatError(data as ErrorEventData);
      
      case LogEventType.SECURITY_ALERT:
        return this.formatSecurityAlert(data as SecurityAlertData);
      
      default:
        return null;
    }
  }

  private formatSchoolAssociationRequest(data: SchoolAssociationRequestData): DiscordMessage {
    const embed = this.createBaseEmbed(
      LogEventType.SCHOOL_ASSOCIATION_REQUEST,
      '🏫 New School Association Request'
    );

    embed.description = `A coach has requested association with a school and requires admin review.`;
    embed.fields = [
      {
        name: '👤 Coach Details',
        value: `**Name:** ${data.coachName}\n**Email:** ${data.coachEmail}`,
        inline: true,
      },
      {
        name: '🏫 School Details',
        value: `**Name:** ${data.schoolName}\n**Type:** ${data.schoolType}\n**Location:** ${data.schoolLocation}`,
        inline: true,
      },
      {
        name: '📄 Request ID',
        value: `\`${data.requestId}\``,
        inline: false,
      },
    ];

    if (data.requestMessage) {
      embed.fields.push({
        name: '💬 Message',
        value: data.requestMessage.length > 1000 
          ? `${data.requestMessage.substring(0, 1000)}...`
          : data.requestMessage,
        inline: false,
      });
    }

    return { embeds: [embed] };
  }

  private formatSchoolAssociationDecision(eventType: LogEventType, data: SchoolAssociationDecisionData): DiscordMessage {
    const isApproved = data.decision === 'approved';
    const embed = this.createBaseEmbed(
      eventType,
      isApproved ? '✅ School Association Approved' : '❌ School Association Rejected'
    );

    embed.description = isApproved 
      ? `A coach's school association request has been approved. The coach is now onboarded and can create tryouts.`
      : `A coach's school association request has been rejected.`;

    embed.fields = [
      {
        name: '👤 Coach',
        value: `**Name:** ${data.coachName}\n**Email:** ${data.coachEmail}`,
        inline: true,
      },
      {
        name: '🏫 School',
        value: data.schoolName,
        inline: true,
      },
      {
        name: '📄 Request ID',
        value: `\`${data.requestId}\``,
        inline: false,
      },
    ];

    if (data.adminName) {
      embed.fields.push({
        name: '👨‍💼 Reviewed By',
        value: data.adminName,
        inline: true,
      });
    }

    if (data.adminNotes) {
      embed.fields.push({
        name: '📝 Admin Notes',
        value: data.adminNotes.length > 1000 
          ? `${data.adminNotes.substring(0, 1000)}...`
          : data.adminNotes,
        inline: false,
      });
    }

    return { embeds: [embed] };
  }

  private formatTryoutCreated(data: TryoutCreatedData): DiscordMessage {
    const embed = this.createBaseEmbed(LogEventType.TRYOUT_CREATED, '🎮 New Tryout Created');
    
    embed.description = `A new tryout has been created and is now available for players to join.`;
    embed.fields = [
      {
        name: '🎯 Tryout Details',
        value: `**Title:** ${data.tryoutTitle}\n**Game:** ${data.game}`,
        inline: true,
      },
      {
        name: '🏫 School & Coach',
        value: `**School:** ${data.schoolName}\n**Coach:** ${data.coachName}`,
        inline: true,
      },
      {
        name: '📅 Schedule',
        value: `**Start:** ${data.startDate.toLocaleDateString()}\n**End:** ${data.endDate.toLocaleDateString()}`,
        inline: false,
      },
      {
        name: '🔗 Tryout ID',
        value: `\`${data.tryoutId}\``,
        inline: false,
      },
    ];

    return { embeds: [embed] };
  }

  private formatUserRegistration(data: UserRegistrationData): DiscordMessage {
    const embed = this.createBaseEmbed(LogEventType.USER_REGISTRATION, '👋 New User Registration');
    
    embed.description = `A new ${data.userType} has registered on the platform.`;
    embed.fields = [
      {
        name: '👤 User Details',
        value: `**Name:** ${data.userName ?? 'Not provided'}\n**Email:** ${data.userEmail ?? 'Not provided'}\n**Type:** ${data.userType}`,
        inline: true,
      },
      {
        name: '📱 Registration Method',
        value: data.registrationMethod,
        inline: true,
      },
    ];

    if (data.userId) {
      embed.fields.push({
        name: '🆔 User ID',
        value: `\`${data.userId}\``,
        inline: false,
      });
    }

    return { embeds: [embed] };
  }

  private formatAdminAction(data: AdminActionData): DiscordMessage {
    const embed = this.createBaseEmbed(LogEventType.ADMIN_ACTION, '⚡ Admin Action Performed');
    
    embed.description = `An administrative action has been performed on the platform.`;
    embed.fields = [
      {
        name: '👨‍💼 Admin',
        value: `**Name:** ${data.userName ?? 'Unknown'}\n**Email:** ${data.userEmail ?? 'Unknown'}`,
        inline: true,
      },
      {
        name: '🎯 Action',
        value: data.action,
        inline: true,
      },
      {
        name: '📝 Details',
        value: data.details.length > 1000 
          ? `${data.details.substring(0, 1000)}...`
          : data.details,
        inline: false,
      },
    ];

    if (data.targetUserEmail) {
      embed.fields.push({
        name: '🎯 Target User',
        value: data.targetUserEmail,
        inline: true,
      });
    }

    return { embeds: [embed] };
  }

  private formatError(data: ErrorEventData): DiscordMessage {
    const embed = this.createBaseEmbed(LogEventType.ERROR, '🚨 Application Error');
    
    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '💥',
    };

    embed.description = `${severityEmoji[data.severity]} **${data.severity.toUpperCase()}** severity error detected.`;
    embed.fields = [
      {
        name: '❌ Error',
        value: data.error.length > 1000 
          ? `${data.error.substring(0, 1000)}...`
          : data.error,
        inline: false,
      },
    ];

    if (data.errorCode) {
      embed.fields.push({
        name: '🔢 Error Code',
        value: data.errorCode,
        inline: true,
      });
    }

    if (data.endpoint) {
      embed.fields.push({
        name: '🌐 Endpoint',
        value: data.endpoint,
        inline: true,
      });
    }

    if (data.userEmail) {
      embed.fields.push({
        name: '👤 User',
        value: data.userEmail,
        inline: true,
      });
    }

    if (data.stack && env.NODE_ENV === 'development') {
      embed.fields.push({
        name: '📋 Stack Trace',
        value: `\`\`\`\n${data.stack.substring(0, 800)}${data.stack.length > 800 ? '...' : ''}\n\`\`\``,
        inline: false,
      });
    }

    return { embeds: [embed] };
  }

  private formatSecurityAlert(data: SecurityAlertData): DiscordMessage {
    const embed = this.createBaseEmbed(LogEventType.SECURITY_ALERT, '🛡️ Security Alert');
    
    const severityEmoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '💥',
    };

    embed.description = `${severityEmoji[data.severity]} **${data.severity.toUpperCase()}** security alert detected.`;
    embed.fields = [
      {
        name: '🚨 Alert Type',
        value: data.alertType,
        inline: true,
      },
      {
        name: '📝 Details',
        value: data.details.length > 1000 
          ? `${data.details.substring(0, 1000)}...`
          : data.details,
        inline: false,
      },
    ];

    if (data.userEmail) {
      embed.fields.push({
        name: '👤 User',
        value: data.userEmail,
        inline: true,
      });
    }

    if (data.ip) {
      embed.fields.push({
        name: '🌐 IP Address',
        value: data.ip,
        inline: true,
      });
    }

    if (data.blockedAction) {
      embed.fields.push({
        name: '🚫 Blocked Action',
        value: data.blockedAction,
        inline: false,
      });
    }

    return { embeds: [embed] };
  }
}

// Export singleton instance
export const discordLogger = new DiscordLogger();

// Helper functions for common use cases
export const logSchoolAssociationRequest = (data: SchoolAssociationRequestData, webhookUrl?: string) => {
  return discordLogger.logEvent(LogEventType.SCHOOL_ASSOCIATION_REQUEST, data, webhookUrl);
};

export const logSchoolAssociationApproved = (data: SchoolAssociationDecisionData, webhookUrl?: string) => {
  return discordLogger.logEvent(LogEventType.SCHOOL_ASSOCIATION_APPROVED, data, webhookUrl);
};

export const logSchoolAssociationRejected = (data: SchoolAssociationDecisionData, webhookUrl?: string) => {
  return discordLogger.logEvent(LogEventType.SCHOOL_ASSOCIATION_REJECTED, data, webhookUrl);
};

export const logTryoutCreated = (data: TryoutCreatedData, webhookUrl?: string) => {
  return discordLogger.logEvent(LogEventType.TRYOUT_CREATED, data, webhookUrl);
};

export const logUserRegistration = (data: UserRegistrationData, webhookUrl?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return discordLogger.logEvent(LogEventType.USER_REGISTRATION, data, WEBHOOK_URLS.registrations);
};

export const logAdminAction = (data: AdminActionData, webhookUrl?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return discordLogger.logEvent(LogEventType.ADMIN_ACTION, data, WEBHOOK_URLS.admin);
};

export const logError = (data: ErrorEventData, webhookUrl?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return discordLogger.logEvent(LogEventType.ERROR, data, WEBHOOK_URLS.errors);
};

export const logSecurityAlert = (data: SecurityAlertData, webhookUrl?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return discordLogger.logEvent(LogEventType.SECURITY_ALERT, data, WEBHOOK_URLS.errors);
}; 