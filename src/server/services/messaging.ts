import { type Prisma, type PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { addMonths, startOfMonth } from "date-fns";

import { sendPlayerMessageEmail } from "@/lib/server/email-bridge";
import {
  FEATURE_KEYS,
  hasAnyFeatureAccessWithDb,
} from "@/lib/server/entitlements";
import {
  observeMessagingEvent,
  recordMessagingEvent,
} from "@/lib/server/messaging-observability";

type MessagingDbClient = Pick<
  PrismaClient,
  | "coach"
  | "conversation"
  | "message"
  | "player"
  | "stripeCustomer"
  | "$transaction"
>;

type MessagingTransactionClient = Prisma.TransactionClient;

export type MessagingRole = "coach" | "player";
export type FilterStatus = "all" | "unread" | "starred" | "archived";

export interface ConversationListInput {
  search?: string;
  filter: FilterStatus;
  limit: number;
  cursor?: string;
}

export interface ContactsListInput {
  search?: string;
  limit: number;
}

export interface PlayerContactsListInput extends ContactsListInput {
  gameId?: string;
}

export interface MessagingQuotaStatus {
  hasUnlimitedAccess: boolean;
  monthlyConversationStartLimit: number | null;
  monthlyConversationStartsUsed: number;
  monthlyConversationStartsRemaining: number | null;
  canStartConversation: boolean;
  canReplyToExistingConversation: boolean;
  resetsAt: Date | null;
}

export interface ConversationMessage {
  id: string;
  senderId: string;
  senderType: "COACH" | "PLAYER";
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface CoachConversationSummary {
  id: string;
  player: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    school: string | null;
    classYear: string | null;
    location: string | null;
    gpa: number | null;
    mainGame?: string;
    gameProfiles: Array<{
      game: string;
      rank: string | null;
      role: string | null;
      username: string;
    }>;
  };
  lastMessage: {
    id: string;
    content: string;
    senderType: "COACH" | "PLAYER";
    timestamp: Date;
    isRead: boolean;
  } | null;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  updatedAt: Date;
  initiatedBy: "COACH" | "PLAYER";
}

export interface PlayerConversationSummary {
  id: string;
  coach: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    school: string | null;
    schoolId: string | null;
    schoolName: string | null;
  };
  lastMessage: {
    id: string;
    content: string;
    senderType: "COACH" | "PLAYER";
    timestamp: Date;
    isRead: boolean;
  } | null;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  updatedAt: Date;
  initiatedBy: "COACH" | "PLAYER";
}

export interface CoachConversationDetail {
  id: string;
  player: CoachConversationSummary["player"];
  messages: ConversationMessage[];
  isStarred: boolean;
  isArchived: boolean;
  initiatedBy: "COACH" | "PLAYER";
}

export interface PlayerConversationDetail {
  id: string;
  coach: PlayerConversationSummary["coach"];
  messages: ConversationMessage[];
  isStarred: boolean;
  isArchived: boolean;
  initiatedBy: "COACH" | "PLAYER";
}

export const PLAYER_FREE_CONVERSATION_STARTS_PER_MONTH = 3;

const PREMIUM_MESSAGING_FEATURES = [
  FEATURE_KEYS.DIRECT_MESSAGING,
  FEATURE_KEYS.UNLIMITED_MESSAGES,
] as const;

function normalizeSearch(search?: string) {
  const trimmed = search?.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed;
}

function getActorArchiveField(role: MessagingRole) {
  return role === "coach" ? "coach_is_archived" : "player_is_archived";
}

function getActorStarField(role: MessagingRole) {
  return role === "coach" ? "coach_is_starred" : "player_is_starred";
}

function getConversationFilterWhere(
  role: MessagingRole,
  filter: FilterStatus,
): Prisma.ConversationWhereInput {
  const archivedField = getActorArchiveField(role);
  const starredField = getActorStarField(role);

  return {
    ...(filter === "archived"
      ? { [archivedField]: true }
      : { [archivedField]: false }),
    ...(filter === "starred" ? { [starredField]: true } : {}),
  };
}

function toNumberOrNull(value: Prisma.Decimal | null | undefined) {
  return value ? parseFloat(value.toString()) : null;
}

function mapMessage(message: {
  id: string;
  sender_id: string;
  sender_type: "COACH" | "PLAYER";
  content: string;
  created_at: Date;
  is_read: boolean;
}): ConversationMessage {
  return {
    id: message.id,
    senderId: message.sender_id,
    senderType: message.sender_type,
    content: message.content,
    timestamp: message.created_at,
    isRead: message.is_read,
  };
}

function withPagination<T extends { id: string }>(items: T[], limit: number) {
  const hasMore = items.length > limit;
  const paginatedItems = hasMore ? items.slice(0, limit) : items;
  return {
    items: paginatedItems,
    nextCursor: hasMore
      ? (paginatedItems[paginatedItems.length - 1]?.id ?? null)
      : null,
  };
}

export async function hasPremiumMessagingAccess(
  db: MessagingQuotaDbClient,
  clerkUserId: string,
) {
  return hasAnyFeatureAccessWithDb(db, clerkUserId, PREMIUM_MESSAGING_FEATURES);
}

export async function getPlayerMessagingQuotaStatus(
  db: MessagingQuotaDbClient,
  playerId: string,
  clerkUserId: string,
  now = new Date(),
): Promise<MessagingQuotaStatus> {
  const hasUnlimitedAccess = await hasPremiumMessagingAccess(db, clerkUserId);
  const periodStart = startOfMonth(now);
  const resetsAt = addMonths(periodStart, 1);

  const monthlyConversationStartsUsed = await db.conversation.count({
    where: {
      player_id: playerId,
      initiated_by: "PLAYER",
      created_at: {
        gte: periodStart,
        lt: resetsAt,
      },
    },
  });

  const monthlyConversationStartsRemaining = hasUnlimitedAccess
    ? null
    : Math.max(
        0,
        PLAYER_FREE_CONVERSATION_STARTS_PER_MONTH -
          monthlyConversationStartsUsed,
      );

  const status: MessagingQuotaStatus = {
    hasUnlimitedAccess,
    monthlyConversationStartLimit: hasUnlimitedAccess
      ? null
      : PLAYER_FREE_CONVERSATION_STARTS_PER_MONTH,
    monthlyConversationStartsUsed,
    monthlyConversationStartsRemaining,
    canStartConversation:
      hasUnlimitedAccess || (monthlyConversationStartsRemaining ?? 0) > 0,
    canReplyToExistingConversation: true,
    resetsAt,
  };

  recordMessagingEvent("player_quota_checked", {
    actorRole: "player",
    actorId: playerId,
    metadata: {
      hasUnlimitedAccess,
      monthlyConversationStartsUsed,
      monthlyConversationStartsRemaining,
    },
  });

  return status;
}

type MessagingQuotaDbClient = Pick<
  PrismaClient,
  "conversation" | "stripeCustomer"
>;

async function assertPlayerCanStartConversation(
  db: MessagingQuotaDbClient,
  playerId: string,
  clerkUserId: string,
) {
  const quota = await getPlayerMessagingQuotaStatus(db, playerId, clerkUserId);

  if (!quota.canStartConversation) {
    recordMessagingEvent("player_quota_denied", {
      actorRole: "player",
      actorId: playerId,
      metadata: {
        monthlyConversationStartsUsed: quota.monthlyConversationStartsUsed,
        monthlyConversationStartLimit: quota.monthlyConversationStartLimit,
      },
    });

    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "You have used your free monthly coach intro quota. Upgrade to continue starting new conversations.",
    });
  }

  return quota;
}

export async function getCoachUnreadCount(
  db: MessagingDbClient,
  coachId: string,
) {
  return db.message.count({
    where: {
      conversation: {
        coach_id: coachId,
        coach_is_archived: false,
      },
      sender_type: "PLAYER",
      is_read: false,
    },
  });
}

export async function listCoachConversations(
  db: MessagingDbClient,
  coachId: string,
  input: ConversationListInput,
) {
  const search = normalizeSearch(input.search);
  const conversations = await db.conversation.findMany({
    where: {
      coach_id: coachId,
      ...getConversationFilterWhere("coach", input.filter),
      ...(input.filter === "unread" && {
        messages: {
          some: { is_read: false, sender_type: "PLAYER" },
        },
      }),
      ...(search && {
        player: {
          is: {
            OR: [
              { first_name: { contains: search, mode: "insensitive" } },
              { last_name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { school: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      }),
    },
    include: {
      player: {
        include: {
          main_game: true,
          game_profiles: {
            include: {
              game: true,
            },
          },
        },
      },
      messages: {
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { is_read: false, sender_type: "PLAYER" },
          },
        },
      },
    },
    orderBy: [{ updated_at: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });

  const { items, nextCursor } = withPagination(conversations, input.limit);

  return {
    conversations: items.map((conv) => ({
      id: conv.id,
      player: {
        id: conv.player.id,
        name: `${conv.player.first_name} ${conv.player.last_name}`,
        email: conv.player.email,
        avatar: conv.player.image_url ?? null,
        school: conv.player.school ?? null,
        classYear: conv.player.class_year ?? null,
        location: conv.player.location ?? null,
        gpa: toNumberOrNull(conv.player.gpa),
        mainGame: conv.player.main_game?.name ?? undefined,
        gameProfiles: conv.player.game_profiles.map((profile) => ({
          game: profile.game.name,
          rank: profile.rank ?? null,
          role: profile.role ?? null,
          username: profile.username,
        })),
      },
      lastMessage: conv.messages[0]
        ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            senderType: conv.messages[0].sender_type,
            timestamp: conv.messages[0].created_at,
            isRead: conv.messages[0].is_read,
          }
        : null,
      unreadCount: conv._count.messages,
      isStarred: conv.coach_is_starred,
      isArchived: conv.coach_is_archived,
      updatedAt: conv.updated_at,
      initiatedBy: conv.initiated_by,
    })),
    nextCursor,
  };
}

export async function listPlayerConversations(
  db: MessagingDbClient,
  playerId: string,
  input: ConversationListInput,
) {
  const search = normalizeSearch(input.search);
  const conversations = await db.conversation.findMany({
    where: {
      player_id: playerId,
      ...getConversationFilterWhere("player", input.filter),
      ...(input.filter === "unread" && {
        messages: {
          some: { is_read: false, sender_type: "COACH" },
        },
      }),
      ...(search && {
        coach: {
          is: {
            OR: [
              { first_name: { contains: search, mode: "insensitive" } },
              { last_name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { school: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      }),
    },
    include: {
      coach: {
        include: {
          school_ref: true,
        },
      },
      messages: {
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        take: 1,
      },
      _count: {
        select: {
          messages: {
            where: { is_read: false, sender_type: "COACH" },
          },
        },
      },
    },
    orderBy: [{ updated_at: "desc" }, { id: "desc" }],
    take: input.limit + 1,
    ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
  });

  const { items, nextCursor } = withPagination(conversations, input.limit);

  return {
    conversations: items.map((conv) => ({
      id: conv.id,
      coach: {
        id: conv.coach.id,
        name: `${conv.coach.first_name} ${conv.coach.last_name}`,
        email: conv.coach.email,
        avatar: conv.coach.image_url ?? null,
        school: conv.coach.school ?? null,
        schoolId: conv.coach.school_ref?.id ?? null,
        schoolName: conv.coach.school_ref?.name ?? null,
      },
      lastMessage: conv.messages[0]
        ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            senderType: conv.messages[0].sender_type,
            timestamp: conv.messages[0].created_at,
            isRead: conv.messages[0].is_read,
          }
        : null,
      unreadCount: conv._count.messages,
      isStarred: conv.player_is_starred,
      isArchived: conv.player_is_archived,
      updatedAt: conv.updated_at,
      initiatedBy: conv.initiated_by,
    })),
    nextCursor,
  };
}

export async function getCoachConversationDetail(
  db: MessagingDbClient,
  coachId: string,
  conversationId: string,
): Promise<CoachConversationDetail> {
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      coach_id: coachId,
    },
    include: {
      player: {
        include: {
          main_game: true,
          game_profiles: {
            include: {
              game: true,
            },
          },
        },
      },
      messages: {
        orderBy: [{ created_at: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!conversation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Conversation not found",
    });
  }

  return {
    id: conversation.id,
    player: {
      id: conversation.player.id,
      name: `${conversation.player.first_name} ${conversation.player.last_name}`,
      email: conversation.player.email,
      avatar: conversation.player.image_url ?? null,
      school: conversation.player.school ?? null,
      classYear: conversation.player.class_year ?? null,
      location: conversation.player.location ?? null,
      gpa: toNumberOrNull(conversation.player.gpa),
      mainGame: conversation.player.main_game?.name ?? undefined,
      gameProfiles: conversation.player.game_profiles.map((profile) => ({
        game: profile.game.name,
        rank: profile.rank ?? null,
        role: profile.role ?? null,
        username: profile.username,
      })),
    },
    messages: conversation.messages.map(mapMessage),
    isStarred: conversation.coach_is_starred,
    isArchived: conversation.coach_is_archived,
    initiatedBy: conversation.initiated_by,
  };
}

export async function getPlayerConversationDetail(
  db: MessagingDbClient,
  playerId: string,
  conversationId: string,
): Promise<PlayerConversationDetail> {
  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      player_id: playerId,
    },
    include: {
      coach: {
        include: {
          school_ref: true,
        },
      },
      messages: {
        orderBy: [{ created_at: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!conversation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Conversation not found",
    });
  }

  return {
    id: conversation.id,
    coach: {
      id: conversation.coach.id,
      name: `${conversation.coach.first_name} ${conversation.coach.last_name}`,
      email: conversation.coach.email,
      avatar: conversation.coach.image_url ?? null,
      school: conversation.coach.school ?? null,
      schoolId: conversation.coach.school_ref?.id ?? null,
      schoolName: conversation.coach.school_ref?.name ?? null,
    },
    messages: conversation.messages.map(mapMessage),
    isStarred: conversation.player_is_starred,
    isArchived: conversation.player_is_archived,
    initiatedBy: conversation.initiated_by,
  };
}

async function createMessageInConversation(
  tx: MessagingTransactionClient,
  args: {
    conversationId: string;
    senderId: string;
    senderType: "COACH" | "PLAYER";
    content: string;
    senderRole: MessagingRole;
  },
) {
  const message = await tx.message.create({
    data: {
      conversation_id: args.conversationId,
      sender_id: args.senderId,
      sender_type: args.senderType,
      content: args.content,
      is_read: false,
    },
  });

  const archivedField = getActorArchiveField(args.senderRole);
  await tx.conversation.update({
    where: { id: args.conversationId },
    data: {
      updated_at: new Date(),
      [archivedField]: false,
    },
  });

  return message;
}

export async function sendCoachMessage(
  db: MessagingDbClient,
  args: {
    coachId: string;
    playerId?: string;
    conversationId?: string;
    content: string;
  },
) {
  if (!args.conversationId && !args.playerId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Either conversationId or playerId must be provided",
    });
  }

  return observeMessagingEvent(
    "message_sent",
    {
      actorRole: "coach",
      actorId: args.coachId,
      metadata: {
        hasConversationId: Boolean(args.conversationId),
        hasPlayerId: Boolean(args.playerId),
      },
    },
    async () => {
      const result = await db.$transaction(async (tx) => {
        let conversation = args.conversationId
          ? await tx.conversation.findFirst({
              where: {
                id: args.conversationId,
                coach_id: args.coachId,
              },
              select: {
                id: true,
              },
            })
          : null;

        let createdConversation = false;

        if (!conversation && args.playerId) {
          const player = await tx.player.findUnique({
            where: { id: args.playerId },
            select: { id: true },
          });

          if (!player) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Player not found",
            });
          }

          conversation = await tx.conversation.findFirst({
            where: {
              coach_id: args.coachId,
              player_id: player.id,
            },
            select: {
              id: true,
            },
          });

          if (!conversation) {
            conversation = await tx.conversation.create({
              data: {
                coach_id: args.coachId,
                player_id: player.id,
                initiated_by: "COACH",
                coach_is_starred: false,
                coach_is_archived: false,
                player_is_starred: false,
                player_is_archived: false,
                is_starred: false,
                is_archived: false,
              },
              select: {
                id: true,
              },
            });
            createdConversation = true;
          }
        }

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        const message = await createMessageInConversation(tx, {
          conversationId: conversation.id,
          senderId: args.coachId,
          senderType: "COACH",
          content: args.content,
          senderRole: "coach",
        });

        return {
          id: message.id,
          conversationId: conversation.id,
          content: message.content,
          timestamp: message.created_at,
          createdConversation,
        };
      });

      if (result.createdConversation) {
        recordMessagingEvent("conversation_created", {
          actorRole: "coach",
          actorId: args.coachId,
          conversationId: result.conversationId,
        });
      }

      return result;
    },
  );
}

export async function sendBulkCoachMessage(
  db: MessagingDbClient,
  args: {
    coachId: string;
    playerIds: string[];
    content: string;
  },
) {
  return observeMessagingEvent(
    "bulk_message_sent",
    {
      actorRole: "coach",
      actorId: args.coachId,
      metadata: {
        recipientCount: args.playerIds.length,
      },
    },
    async () => {
      const players = await db.player.findMany({
        where: { id: { in: args.playerIds } },
        select: { id: true },
      });

      if (players.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No valid players found",
        });
      }

      const validPlayerIds = players.map((player) => player.id);
      return db.$transaction(async (tx) => {
        const results: Array<{
          playerId: string;
          conversationId: string;
          messageId: string;
        }> = [];

        for (const playerId of validPlayerIds) {
          let conversation = await tx.conversation.findFirst({
            where: {
              coach_id: args.coachId,
              player_id: playerId,
            },
            select: { id: true },
          });

          conversation ??= await tx.conversation.create({
              data: {
                coach_id: args.coachId,
                player_id: playerId,
                initiated_by: "COACH",
                coach_is_starred: false,
                coach_is_archived: false,
                player_is_starred: false,
                player_is_archived: false,
                is_starred: false,
                is_archived: false,
              },
              select: { id: true },
            });

          const message = await createMessageInConversation(tx, {
            conversationId: conversation.id,
            senderId: args.coachId,
            senderType: "COACH",
            content: args.content,
            senderRole: "coach",
          });

          results.push({
            playerId,
            conversationId: conversation.id,
            messageId: message.id,
          });
        }

        return {
          success: true,
          messagesSent: results.length,
          results,
        };
      });
    },
  );
}

export async function sendPlayerMessage(
  db: MessagingDbClient,
  args: {
    playerId: string;
    clerkUserId: string;
    coachId?: string;
    conversationId?: string;
    content: string;
  },
) {
  if (!args.conversationId && !args.coachId) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Either conversationId or coachId must be provided",
    });
  }

  return observeMessagingEvent(
    "message_sent",
    {
      actorRole: "player",
      actorId: args.playerId,
      metadata: {
        hasConversationId: Boolean(args.conversationId),
        hasCoachId: Boolean(args.coachId),
      },
    },
    async () => {
      const result = await db.$transaction(async (tx) => {
        let conversation = args.conversationId
          ? await tx.conversation.findFirst({
              where: {
                id: args.conversationId,
                player_id: args.playerId,
              },
              select: {
                id: true,
              },
            })
          : null;

        let createdConversation = false;

        // Track coach info for post-transaction email bridge
        let coachForEmail: {
          id: string;
          clerk_id: string | null;
          email: string;
          first_name: string;
          last_name: string;
          school: string;
          forwarded_emails_count: number;
        } | null = null;

        if (!conversation && args.coachId) {
          const coach = await tx.coach.findUnique({
            where: { id: args.coachId },
            select: {
              id: true,
              school_id: true,
              clerk_id: true,
              email: true,
              first_name: true,
              last_name: true,
              school: true,
              // NOTE: forwarded_emails_count available after prisma generate
              ...({ forwarded_emails_count: true } as Record<string, boolean>),
            },
          });

          if (!coach?.school_id) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Coach not found",
            });
          }

          // If preprovisioned coach, enforce max 1 unreplied message from this player
          if (!coach.clerk_id) {
            const existingUnreplied = await tx.message.findFirst({
              where: {
                conversation: {
                  coach_id: coach.id,
                  player_id: args.playerId,
                },
                sender_type: "PLAYER",
                is_read: false,
              },
            });

            if (existingUnreplied) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message:
                  "This coach hasn't joined EVAL yet. You can send another message once they respond.",
              });
            }
          }

          coachForEmail = coach as unknown as typeof coachForEmail;

          conversation = await tx.conversation.findFirst({
            where: {
              coach_id: coach.id,
              player_id: args.playerId,
            },
            select: {
              id: true,
            },
          });

          if (!conversation) {
            await assertPlayerCanStartConversation(
              tx,
              args.playerId,
              args.clerkUserId,
            );

            conversation = await tx.conversation.create({
              data: {
                coach_id: coach.id,
                player_id: args.playerId,
                initiated_by: "PLAYER",
                coach_is_starred: false,
                coach_is_archived: false,
                player_is_starred: false,
                player_is_archived: false,
                is_starred: false,
                is_archived: false,
              },
              select: {
                id: true,
              },
            });
            createdConversation = true;
          }
        }

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        const message = await createMessageInConversation(tx, {
          conversationId: conversation.id,
          senderId: args.playerId,
          senderType: "PLAYER",
          content: args.content,
          senderRole: "player",
        });

        return {
          id: message.id,
          conversationId: conversation.id,
          content: message.content,
          timestamp: message.created_at,
          createdConversation,
          coachForEmail,
        };
      });

      if (result.createdConversation) {
        recordMessagingEvent("conversation_created", {
          actorRole: "player",
          actorId: args.playerId,
          conversationId: result.conversationId,
        });
      }

      // Email bridge: if coach is a preprovisioned coach (no clerk_id), send email notification
      const emailCoach = result.coachForEmail as {
        id: string;
        clerk_id: string | null;
        email: string;
        first_name: string;
        last_name: string;
        school: string;
        forwarded_emails_count: number;
      } | null;
      if (emailCoach && !emailCoach.clerk_id && emailCoach.forwarded_emails_count < 3) {
        const coach = emailCoach;
        const player = await db.player.findUnique({
          where: { id: args.playerId },
          select: {
            first_name: true,
            last_name: true,
            gpa: true,
            main_game: { select: { name: true } },
            game_profiles: {
              take: 1,
              select: { rank: true },
              orderBy: { updated_at: "desc" },
            },
          },
        });

        if (player) {
          const playerName = `${player.first_name} ${player.last_name}`.trim();
          const sent = await sendPlayerMessageEmail({
            coachEmail: coach.email,
            coachName: `${coach.first_name} ${coach.last_name}`.trim(),
            playerName: playerName || "A player",
            playerGame: player.main_game?.name,
            playerRank: player.game_profiles[0]?.rank,
            playerGpa: player.gpa?.toString(),
            messagePreview: args.content,
            forwardedEmailsCount: coach.forwarded_emails_count ?? 0,
          });

          // Increment forwarded_emails_count if email was sent
          if (sent) {
            await db.coach.update({
              where: { id: coach.id },
              data: {
                ...({ forwarded_emails_count: { increment: 1 } } as Record<string, unknown>),
              },
            });
          }
        }
      }

      return {
        id: result.id,
        conversationId: result.conversationId,
        content: result.content,
        timestamp: result.timestamp,
        createdConversation: result.createdConversation,
      };
    },
  );
}

export async function markConversationAsRead(
  db: MessagingDbClient,
  args: {
    role: MessagingRole;
    actorId: string;
    conversationId: string;
    messageIds?: string[];
  },
) {
  const where =
    args.role === "coach"
      ? { id: args.conversationId, coach_id: args.actorId }
      : { id: args.conversationId, player_id: args.actorId };

  const conversation = await db.conversation.findFirst({
    where,
    select: { id: true },
  });

  if (!conversation) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Conversation not found",
    });
  }

  return observeMessagingEvent(
    "messages_marked_read",
    {
      actorRole: args.role,
      actorId: args.actorId,
      conversationId: args.conversationId,
      metadata: {
        explicitMessageIds: args.messageIds?.length ?? 0,
      },
    },
    async () => {
      const result = await db.message.updateMany({
        where: {
          conversation_id: args.conversationId,
          sender_type: args.role === "coach" ? "PLAYER" : "COACH",
          is_read: false,
          ...(args.messageIds ? { id: { in: args.messageIds } } : {}),
        },
        data: { is_read: true },
      });

      return {
        success: true,
        messagesMarked: result.count,
      };
    },
  );
}

export async function toggleConversationStar(
  db: MessagingDbClient,
  args: {
    role: MessagingRole;
    actorId: string;
    conversationId: string;
  },
) {
  const where =
    args.role === "coach"
      ? { id: args.conversationId, coach_id: args.actorId }
      : { id: args.conversationId, player_id: args.actorId };

  return observeMessagingEvent(
    "conversation_star_toggled",
    {
      actorRole: args.role,
      actorId: args.actorId,
      conversationId: args.conversationId,
    },
    async () => {
      if (args.role === "coach") {
        const conversation = await db.conversation.findFirst({
          where,
          select: { coach_is_starred: true },
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        const updated = await db.conversation.update({
          where: { id: args.conversationId },
          data: { coach_is_starred: !conversation.coach_is_starred },
          select: { coach_is_starred: true },
        });

        return {
          success: true,
          isStarred: updated.coach_is_starred,
        };
      }

      const conversation = await db.conversation.findFirst({
        where,
        select: { player_is_starred: true },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const updated = await db.conversation.update({
        where: { id: args.conversationId },
        data: { player_is_starred: !conversation.player_is_starred },
        select: { player_is_starred: true },
      });

      return {
        success: true,
        isStarred: updated.player_is_starred,
      };
    },
  );
}

export async function toggleConversationArchive(
  db: MessagingDbClient,
  args: {
    role: MessagingRole;
    actorId: string;
    conversationId: string;
  },
) {
  const where =
    args.role === "coach"
      ? { id: args.conversationId, coach_id: args.actorId }
      : { id: args.conversationId, player_id: args.actorId };

  return observeMessagingEvent(
    "conversation_archive_toggled",
    {
      actorRole: args.role,
      actorId: args.actorId,
      conversationId: args.conversationId,
    },
    async () => {
      if (args.role === "coach") {
        const conversation = await db.conversation.findFirst({
          where,
          select: { coach_is_archived: true },
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        const updated = await db.conversation.update({
          where: { id: args.conversationId },
          data: { coach_is_archived: !conversation.coach_is_archived },
          select: { coach_is_archived: true },
        });

        return {
          success: true,
          isArchived: updated.coach_is_archived,
        };
      }

      const conversation = await db.conversation.findFirst({
        where,
        select: { player_is_archived: true },
      });

      if (!conversation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversation not found",
        });
      }

      const updated = await db.conversation.update({
        where: { id: args.conversationId },
        data: { player_is_archived: !conversation.player_is_archived },
        select: { player_is_archived: true },
      });

      return {
        success: true,
        isArchived: updated.player_is_archived,
      };
    },
  );
}

export async function getAvailablePlayersForMessaging(
  db: MessagingDbClient,
  input: PlayerContactsListInput,
) {
  const search = normalizeSearch(input.search);
  const players = await db.player.findMany({
    where: {
      ...(search && {
        OR: [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { school: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(input.gameId && {
        OR: [
          { main_game_id: input.gameId },
          {
            game_profiles: {
              some: {
                game_id: input.gameId,
              },
            },
          },
        ],
      }),
    },
    include: {
      game_profiles: {
        include: {
          game: true,
        },
      },
      main_game: true,
    },
    take: input.limit,
    orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
  });

  return players.map((player) => ({
    id: player.id,
    name: `${player.first_name} ${player.last_name}`,
    email: player.email,
    avatar: player.image_url ?? null,
    school: player.school ?? null,
    classYear: player.class_year ?? null,
    location: player.location ?? null,
    gpa: toNumberOrNull(player.gpa),
    mainGame: player.main_game?.name ?? undefined,
    gameProfiles: player.game_profiles.map((profile) => ({
      game: profile.game.name,
      rank: profile.rank ?? null,
      role: profile.role ?? null,
      username: profile.username,
    })),
  }));
}

export async function getAvailableCoachesForMessaging(
  db: MessagingDbClient,
  input: ContactsListInput,
) {
  const search = normalizeSearch(input.search);
  const coaches = await db.coach.findMany({
    where: {
      school_id: { not: null },
      ...(search && {
        OR: [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { school: { contains: search, mode: "insensitive" } },
          {
            school_ref: {
              is: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        ],
      }),
    },
    include: {
      school_ref: true,
    },
    take: input.limit,
    orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
  });

  return coaches.map((coach) => {
    // NOTE: title and isPreprovisioned available after prisma generate for new fields
    const coachAny = coach as Record<string, unknown>;
    return {
      id: coach.id,
      name: `${coach.first_name} ${coach.last_name}`,
      email: coach.email,
      avatar: coach.image_url ?? null,
      school: coach.school ?? null,
      schoolName: coach.school_ref?.name ?? null,
      username: coach.username,
      title: (coachAny.title as string) ?? null,
      isPreprovisioned: !coach.clerk_id,
    };
  });
}
