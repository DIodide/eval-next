import { z } from "zod";

import {
  createTRPCRouter,
  onboardedCoachProcedure,
  playerProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import {
  getAvailableCoachesForMessaging,
  getAvailablePlayersForMessaging,
  getCoachConversationDetail,
  getCoachUnreadCount,
  getPlayerConversationDetail,
  getPlayerMessagingQuotaStatus,
  hasPremiumMessagingAccess,
  listCoachConversations,
  listPlayerConversations,
  markConversationAsRead,
  sendBulkCoachMessage,
  sendCoachMessage,
  sendPlayerMessage,
  toggleConversationArchive,
  toggleConversationStar,
} from "@/server/services/messaging";

const conversationListInput = z.object({
  search: z.string().optional(),
  filter: z.enum(["all", "unread", "starred", "archived"]).default("all"),
  limit: z.number().min(1).max(100).default(50),
  cursor: z.string().uuid().optional(),
});

const messageInput = z.object({
  content: z.string().min(1).max(2000).trim(),
});

const conversationIdInput = z.object({
  conversationId: z.string().uuid(),
});

const markReadInput = z.object({
  conversationId: z.string().uuid(),
  messageIds: z.array(z.string().uuid()).optional(),
});

export const messagesRouter = createTRPCRouter({
  checkAccess: protectedProcedure.query(async ({ ctx }) => {
    const hasAccess = await hasPremiumMessagingAccess(ctx.db, ctx.auth.userId);

    return { hasAccess };
  }),

  getConversations: onboardedCoachProcedure
    .input(conversationListInput)
    .query(async ({ ctx, input }) => {
      return listCoachConversations(ctx.db, ctx.coachId, input);
    }),

  getUnreadCount: onboardedCoachProcedure.query(async ({ ctx }) => {
    return getCoachUnreadCount(ctx.db, ctx.coachId);
  }),

  getConversation: onboardedCoachProcedure
    .input(conversationIdInput)
    .query(async ({ ctx, input }) => {
      return getCoachConversationDetail(
        ctx.db,
        ctx.coachId,
        input.conversationId,
      );
    }),

  sendMessage: onboardedCoachProcedure
    .input(
      messageInput.extend({
        conversationId: z.string().uuid().optional(),
        playerId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return sendCoachMessage(ctx.db, {
        coachId: ctx.coachId,
        conversationId: input.conversationId,
        playerId: input.playerId,
        content: input.content,
      });
    }),

  sendBulkMessage: onboardedCoachProcedure
    .input(
      messageInput.extend({
        playerIds: z.array(z.string().uuid()).min(1).max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return sendBulkCoachMessage(ctx.db, {
        coachId: ctx.coachId,
        playerIds: input.playerIds,
        content: input.content,
      });
    }),

  markAsRead: onboardedCoachProcedure
    .input(markReadInput)
    .mutation(async ({ ctx, input }) => {
      return markConversationAsRead(ctx.db, {
        role: "coach",
        actorId: ctx.coachId,
        conversationId: input.conversationId,
        messageIds: input.messageIds,
      });
    }),

  toggleStar: onboardedCoachProcedure
    .input(conversationIdInput)
    .mutation(async ({ ctx, input }) => {
      return toggleConversationStar(ctx.db, {
        role: "coach",
        actorId: ctx.coachId,
        conversationId: input.conversationId,
      });
    }),

  toggleArchive: onboardedCoachProcedure
    .input(conversationIdInput)
    .mutation(async ({ ctx, input }) => {
      return toggleConversationArchive(ctx.db, {
        role: "coach",
        actorId: ctx.coachId,
        conversationId: input.conversationId,
      });
    }),

  getAvailablePlayers: onboardedCoachProcedure
    .input(
      z.object({
        search: z.string().optional(),
        gameId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getAvailablePlayersForMessaging(ctx.db, input);
    }),

  getPlayerMessagingStatus: playerProcedure.query(async ({ ctx }) => {
    return getPlayerMessagingQuotaStatus(
      ctx.db,
      ctx.playerId,
      ctx.auth.userId!,
    );
  }),

  getPlayerConversations: playerProcedure
    .input(conversationListInput)
    .query(async ({ ctx, input }) => {
      return listPlayerConversations(ctx.db, ctx.playerId, input);
    }),

  getPlayerConversation: playerProcedure
    .input(conversationIdInput)
    .query(async ({ ctx, input }) => {
      return getPlayerConversationDetail(
        ctx.db,
        ctx.playerId,
        input.conversationId,
      );
    }),

  sendPlayerMessage: playerProcedure
    .input(
      messageInput.extend({
        conversationId: z.string().uuid().optional(),
        coachId: z.string().uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return sendPlayerMessage(ctx.db, {
        playerId: ctx.playerId,
        clerkUserId: ctx.auth.userId!,
        conversationId: input.conversationId,
        coachId: input.coachId,
        content: input.content,
      });
    }),

  markPlayerMessagesAsRead: playerProcedure
    .input(markReadInput)
    .mutation(async ({ ctx, input }) => {
      return markConversationAsRead(ctx.db, {
        role: "player",
        actorId: ctx.playerId,
        conversationId: input.conversationId,
        messageIds: input.messageIds,
      });
    }),

  togglePlayerStar: playerProcedure
    .input(conversationIdInput)
    .mutation(async ({ ctx, input }) => {
      return toggleConversationStar(ctx.db, {
        role: "player",
        actorId: ctx.playerId,
        conversationId: input.conversationId,
      });
    }),

  togglePlayerArchive: playerProcedure
    .input(conversationIdInput)
    .mutation(async ({ ctx, input }) => {
      return toggleConversationArchive(ctx.db, {
        role: "player",
        actorId: ctx.playerId,
        conversationId: input.conversationId,
      });
    }),

  getAvailableCoaches: playerProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getAvailableCoachesForMessaging(ctx.db, input);
    }),
});
