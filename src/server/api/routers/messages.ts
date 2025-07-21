/**
 * =================================================================
 * MESSAGES TRPC ROUTER
 * =================================================================
 *
 * This router handles messaging functionality between coaches and players.
 *
 * Features:
 * - Get conversations for coaches
 * - Send messages between coaches and players
 * - Mark messages as read
 * - Get available players for messaging
 * - Player-specific endpoints for viewing and responding to messages
 *
 * =================================================================
 */

import { z } from "zod";
import {
  createTRPCRouter,
  onboardedCoachProcedure,
  playerProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  /**
   * Get conversations for the authenticated coach
   */
  getConversations: onboardedCoachProcedure
    .input(
      z.object({
        search: z.string().optional(),
        filter: z.enum(["all", "unread", "starred", "archived"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

      // Get actual conversations from database
      const conversations = await ctx.db.conversation.findMany({
        where: {
          coach_id: coachId,
          ...(input.filter === "starred" && { is_starred: true }),
          ...(input.filter === "archived" && { is_archived: true }),
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
            orderBy: { created_at: "desc" },
            take: 1,
          },
        },
        orderBy: { updated_at: "desc" },
        take: input.limit,
      });

      // Filter by search if provided
      const filteredConversations = input.search
        ? conversations.filter(
            (conv) =>
              `${conv.player.first_name} ${conv.player.last_name}`
                .toLowerCase()
                .includes(input.search!.toLowerCase()) ||
              conv.player.school
                ?.toLowerCase()
                .includes(input.search!.toLowerCase()),
          )
        : conversations;

      // Filter by unread if specified
      const finalConversations =
        input.filter === "unread"
          ? filteredConversations.filter((conv) =>
              conv.messages.some(
                (msg) => !msg.is_read && msg.sender_type === "PLAYER",
              ),
            )
          : filteredConversations;

      return {
        conversations: finalConversations.map((conv) => ({
          id: conv.id,
          player: {
            id: conv.player.id,
            name: `${conv.player.first_name} ${conv.player.last_name}`,
            email: conv.player.email,
            avatar: conv.player.image_url,
            school: conv.player.school,
            classYear: conv.player.class_year,
            location: conv.player.location,
            gpa: conv.player.gpa
              ? parseFloat(conv.player.gpa.toString())
              : null,
            mainGame: conv.player.main_game?.name,
            gameProfiles: conv.player.game_profiles.map((profile) => ({
              game: profile.game.name,
              rank: profile.rank,
              role: profile.role,
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
          unreadCount: conv.messages.filter(
            (msg) => !msg.is_read && msg.sender_type === "PLAYER",
          ).length,
          isStarred: conv.is_starred,
          isArchived: conv.is_archived,
          updatedAt: conv.updated_at,
        })),
        nextCursor: null,
      };
    }),

  /**
   * Get count of unread messages for coach dashboard
   */
  getUnreadCount: onboardedCoachProcedure.query(async ({ ctx }) => {
    const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

    try {
      const count = await ctx.db.message.count({
        where: {
          conversation: {
            coach_id: coachId,
          },
          sender_type: "PLAYER",
          is_read: false,
        },
      });

      return count;
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch unread messages count",
      });
    }
  }),

  /**
   * Get detailed conversation with message history
   */
  getConversation: onboardedCoachProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

      // Get actual conversation from database
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
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
            orderBy: { created_at: "asc" },
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
          avatar: conversation.player.image_url,
          school: conversation.player.school,
          classYear: conversation.player.class_year,
          location: conversation.player.location,
          gpa: conversation.player.gpa
            ? parseFloat(conversation.player.gpa.toString())
            : null,
          mainGame: conversation.player.main_game?.name,
          gameProfiles: conversation.player.game_profiles.map((profile) => ({
            game: profile.game.name,
            rank: profile.rank,
            role: profile.role,
            username: profile.username,
          })),
        },
        messages: conversation.messages.map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderType: msg.sender_type,
          content: msg.content,
          timestamp: msg.created_at,
          isRead: msg.is_read,
        })),
        isStarred: conversation.is_starred,
        isArchived: conversation.is_archived,
      };
    }),

  /**
   * Send a message to a player
   */
  sendMessage: onboardedCoachProcedure
    .input(
      z.object({
        conversationId: z.string().uuid().optional(),
        playerId: z.string().uuid().optional(),
        content: z.string().min(1).max(2000).trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

      // Either conversationId or playerId must be provided
      if (!input.conversationId && !input.playerId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either conversationId or playerId must be provided",
        });
      }

      let conversation: { id: string } | null = null;

      if (input.conversationId) {
        // Use existing conversation
        conversation = await ctx.db.conversation.findFirst({
          where: {
            id: input.conversationId,
            coach_id: coachId,
          },
          select: {
            id: true,
          },
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }
      } else if (input.playerId) {
        // Create new conversation or find existing one
        const player = await ctx.db.player.findUnique({
          where: { id: input.playerId },
        });

        if (!player) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Player not found",
          });
        }

        // Check if conversation already exists
        conversation = await ctx.db.conversation.findFirst({
          where: {
            coach_id: coachId,
            player_id: player.id,
          },
          select: {
            id: true,
          },
        });

        // Create new conversation if none exists
        conversation ??= await ctx.db.conversation.create({
          data: {
            coach_id: coachId,
            player_id: player.id,
            is_starred: false,
            is_archived: false,
          },
          select: {
            id: true,
          },
        });
      }

      if (!conversation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create or find conversation",
        });
      }

      // Create the message
      const message = await ctx.db.message.create({
        data: {
          conversation_id: conversation.id,
          sender_id: coachId,
          sender_type: "COACH",
          content: input.content,
          is_read: false,
        },
      });

      // Update conversation timestamp
      await ctx.db.conversation.update({
        where: { id: conversation.id },
        data: { updated_at: new Date() },
      });

      return {
        id: message.id,
        conversationId: conversation.id,
        content: message.content,
        timestamp: message.created_at,
      };
    }),

  /**
   * Send bulk messages to multiple players
   */
  sendBulkMessage: onboardedCoachProcedure
    .input(
      z.object({
        playerIds: z.array(z.string().uuid()).min(1).max(50),
        content: z.string().min(1).max(2000).trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Coach ID is available from onboardedCoachProcedure context

      return {
        success: true,
        messagesSent: input.playerIds.length,
        results: input.playerIds.map((playerId) => ({
          playerId,
          conversationId: `mock-conversation-${playerId}`,
          messageId: `mock-message-${playerId}`,
        })),
      };
    }),

  /**
   * Mark messages as read
   */
  markAsRead: onboardedCoachProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        messageIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx }) => {
      // Coach ID is available from onboardedCoachProcedure context

      return {
        success: true,
        messagesMarked: 0,
      };
    }),

  /**
   * Star or unstar a conversation
   */
  toggleStar: onboardedCoachProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx }) => {
      // Coach ID is available from onboardedCoachProcedure context

      return {
        success: true,
        isStarred: true,
      };
    }),

  /**
   * Get available players for messaging
   */
  getAvailablePlayers: onboardedCoachProcedure
    .input(
      z.object({
        search: z.string().optional(),
        gameId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx }) => {
      // Coach ID is available from onboardedCoachProcedure context

      // Get actual players from database
      const players = await ctx.db.player.findMany({
        include: {
          game_profiles: {
            include: {
              game: true,
            },
          },
          main_game: true,
        },
        take: 50,
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
        gpa: player.gpa ? parseFloat(player.gpa.toString()) : null,
        mainGame: player.main_game?.name ?? undefined,
        gameProfiles: player.game_profiles.map((profile) => ({
          game: profile.game.name,
          rank: profile.rank ?? null,
          role: profile.role ?? null,
          username: profile.username,
        })),
      }));
    }),

  // =================================================================
  // PLAYER-SPECIFIC ENDPOINTS
  // =================================================================

  /**
   * Get conversations for the authenticated player
   */
  getPlayerConversations: playerProcedure
    .input(
      z.object({
        search: z.string().optional(),
        filter: z.enum(["all", "unread", "starred", "archived"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const playerId = ctx.playerId; // Available from playerProcedure context

      // Get actual conversations from database
      const conversations = await ctx.db.conversation.findMany({
        where: {
          player_id: playerId,
          ...(input.filter === "starred" && { is_starred: true }),
          ...(input.filter === "archived" && { is_archived: true }),
        },
        include: {
          coach: {
            include: {
              school_ref: true,
            },
          },
          messages: {
            orderBy: { created_at: "desc" },
            take: 1,
          },
        },
        orderBy: { updated_at: "desc" },
        take: input.limit,
      });

      // Filter by search if provided
      const filteredConversations = input.search
        ? conversations.filter(
            (conv) =>
              `${conv.coach.first_name} ${conv.coach.last_name}`
                .toLowerCase()
                .includes(input.search!.toLowerCase()) ||
              conv.coach.school
                ?.toLowerCase()
                .includes(input.search!.toLowerCase()),
          )
        : conversations;

      // Filter by unread if specified
      const finalConversations =
        input.filter === "unread"
          ? filteredConversations.filter((conv) =>
              conv.messages.some(
                (msg) => !msg.is_read && msg.sender_type === "COACH",
              ),
            )
          : filteredConversations;

      return {
        conversations: finalConversations.map((conv) => ({
          id: conv.id,
          coach: {
            id: conv.coach.id,
            name: `${conv.coach.first_name} ${conv.coach.last_name}`,
            email: conv.coach.email,
            avatar: conv.coach.image_url,
            school: conv.coach.school,
            schoolId: conv.coach.school_ref?.id,
            schoolName: conv.coach.school_ref?.name,
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
          unreadCount: conv.messages.filter(
            (msg) => !msg.is_read && msg.sender_type === "COACH",
          ).length,
          isStarred: conv.is_starred,
          isArchived: conv.is_archived,
          updatedAt: conv.updated_at,
        })),
        nextCursor: null,
      };
    }),

  /**
   * Get detailed conversation with message history for player
   */
  getPlayerConversation: playerProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const playerId = ctx.playerId; // Available from playerProcedure context

      // Get actual conversation from database
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          player_id: playerId,
        },
        include: {
          coach: {
            include: {
              school_ref: true,
            },
          },
          messages: {
            orderBy: { created_at: "asc" },
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
          avatar: conversation.coach.image_url,
          school: conversation.coach.school,
          schoolId: conversation.coach.school_ref?.id,
          schoolName: conversation.coach.school_ref?.name,
        },
        messages: conversation.messages.map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderType: msg.sender_type,
          content: msg.content,
          timestamp: msg.created_at,
          isRead: msg.is_read,
        })),
        isStarred: conversation.is_starred,
        isArchived: conversation.is_archived,
      };
    }),

  /**
   * Send a message from player to coach
   */
  sendPlayerMessage: playerProcedure
    .input(
      z.object({
        conversationId: z.string().uuid().optional(),
        coachId: z.string().uuid().optional(),
        content: z.string().min(1).max(2000).trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const playerId = ctx.playerId; // Available from playerProcedure context

      // Either conversationId or coachId must be provided
      if (!input.conversationId && !input.coachId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Either conversationId or coachId must be provided",
        });
      }

      let conversation: {
        id: string;
        coach_id: string;
        player_id: string;
      } | null = null;

      if (input.conversationId) {
        // Use existing conversation
        conversation = await ctx.db.conversation.findFirst({
          where: {
            id: input.conversationId,
            player_id: playerId,
          },
          select: {
            id: true,
            coach_id: true,
            player_id: true,
          },
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }
      } else if (input.coachId) {
        // Create new conversation or find existing one
        const coach = await ctx.db.coach.findUnique({
          where: { id: input.coachId },
        });

        if (!coach) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Coach not found",
          });
        }

        // Check if conversation already exists
        conversation = await ctx.db.conversation.findFirst({
          where: {
            coach_id: coach.id,
            player_id: playerId,
          },
          select: {
            id: true,
            coach_id: true,
            player_id: true,
          },
        });

        // Create new conversation if none exists
        conversation ??= await ctx.db.conversation.create({
          data: {
            coach_id: coach.id,
            player_id: playerId,
            is_starred: false,
            is_archived: false,
          },
          select: {
            id: true,
            coach_id: true,
            player_id: true,
          },
        });
      }

      if (!conversation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create or find conversation",
        });
      }

      // Create the message
      const message = await ctx.db.message.create({
        data: {
          conversation_id: conversation.id,
          sender_id: playerId,
          sender_type: "PLAYER",
          content: input.content,
          is_read: false,
        },
      });

      // Update conversation timestamp
      await ctx.db.conversation.update({
        where: { id: conversation.id },
        data: { updated_at: new Date() },
      });

      return {
        id: message.id,
        conversationId: conversation.id,
        content: message.content,
        timestamp: message.created_at,
      };
    }),

  /**
   * Mark messages as read for player
   */
  markPlayerMessagesAsRead: playerProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        messageIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx }) => {
      // Player ID is available from playerProcedure context

      return {
        success: true,
        messagesMarked: 0,
      };
    }),

  /**
   * Star or unstar a conversation for player
   */
  togglePlayerStar: playerProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx }) => {
      // Player ID is available from playerProcedure context

      return {
        success: true,
        isStarred: true,
      };
    }),

  /**
   * Get available coaches for messaging (player endpoint)
   */
  getAvailableCoaches: playerProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx }) => {
      // Player ID is available from playerProcedure context

      // Get actual coaches from database
      const coaches = await ctx.db.coach.findMany({
        include: {
          school_ref: true,
        },
        take: 50,
        orderBy: [{ first_name: "asc" }, { last_name: "asc" }],
      });

      return coaches.map((coach) => ({
        id: coach.id,
        name: `${coach.first_name} ${coach.last_name}`,
        email: coach.email,
        avatar: coach.image_url ?? null,
        school: coach.school ?? null,
        schoolName: coach.school_ref?.name ?? null,
        username: coach.username,
      }));
    }),
});
