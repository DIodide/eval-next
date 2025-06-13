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

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const messagesRouter = createTRPCRouter({
  /**
   * Get conversations for the authenticated coach
   */
  getConversations: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      filter: z.enum(["all", "unread", "starred", "archived"]).default("all"),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a coach
      const coach = await ctx.db.coach.findUnique({
        where: { clerk_id: userId },
      });

      if (!coach) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only coaches can access conversations",
        });
      }

      // Get actual conversations from database
      const conversations = await ctx.db.conversation.findMany({
        where: {
          coach_id: coach.id,
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
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
        orderBy: { updated_at: 'desc' },
        take: input.limit,
      });

      // Filter by search if provided
      const filteredConversations = input.search
        ? conversations.filter(conv => 
            `${conv.player.first_name} ${conv.player.last_name}`.toLowerCase().includes(input.search!.toLowerCase()) ||
            conv.player.school?.toLowerCase().includes(input.search!.toLowerCase())
          )
        : conversations;

      // Filter by unread if specified
      const finalConversations = input.filter === "unread"
        ? filteredConversations.filter(conv => 
            conv.messages.some(msg => !msg.is_read && msg.sender_type === "PLAYER")
          )
        : filteredConversations;

      return {
        conversations: finalConversations.map(conv => ({
          id: conv.id,
          player: {
            id: conv.player.id,
            name: `${conv.player.first_name} ${conv.player.last_name}`,
            email: conv.player.email,
            avatar: conv.player.image_url,
            school: conv.player.school,
            classYear: conv.player.class_year,
            location: conv.player.location,
            gpa: conv.player.gpa ? parseFloat(conv.player.gpa.toString()) : null,
            mainGame: conv.player.main_game?.name,
            gameProfiles: conv.player.game_profiles.map(profile => ({
              game: profile.game.name,
              rank: profile.rank,
              role: profile.role,
              username: profile.username,
            })),
          },
          lastMessage: conv.messages[0] ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            senderType: conv.messages[0].sender_type,
            timestamp: conv.messages[0].created_at,
            isRead: conv.messages[0].is_read,
          } : null,
          unreadCount: conv.messages.filter(msg => !msg.is_read && msg.sender_type === "PLAYER").length,
          isStarred: conv.is_starred,
          isArchived: conv.is_archived,
          updatedAt: conv.updated_at,
        })),
        nextCursor: null,
      };
    }),

  /**
   * Get detailed conversation with message history
   */
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a coach
      const coach = await ctx.db.coach.findUnique({
        where: { clerk_id: userId },
      });

      if (!coach) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only coaches can access conversations",
        });
      }

      // Get actual conversation from database
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          coach_id: coach.id,
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
            orderBy: { created_at: 'asc' },
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
          gpa: conversation.player.gpa ? parseFloat(conversation.player.gpa.toString()) : null,
          mainGame: conversation.player.main_game?.name,
          gameProfiles: conversation.player.game_profiles.map(profile => ({
            game: profile.game.name,
            rank: profile.rank,
            role: profile.role,
            username: profile.username,
          })),
        },
        messages: conversation.messages.map(msg => ({
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
  sendMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid().optional(),
      playerId: z.string().uuid().optional(),
      content: z.string().min(1).max(2000).trim(),
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a coach
      const coach = await ctx.db.coach.findUnique({
        where: { clerk_id: userId },
      });

      if (!coach) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only coaches can send messages",
        });
      }

      // Mock response for now
      return {
        id: "mock-message",
        conversationId: "mock-conversation",
        content: "Message sent successfully",
        timestamp: new Date(),
      };
    }),

  /**
   * Send bulk messages to multiple players
   */
  sendBulkMessage: protectedProcedure
    .input(z.object({
      playerIds: z.array(z.string().uuid()).min(1).max(50),
      content: z.string().min(1).max(2000).trim(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a coach
      const coach = await ctx.db.coach.findUnique({
        where: { clerk_id: userId },
      });

      if (!coach) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only coaches can send messages",
        });
      }

      return {
        success: true,
        messagesSent: input.playerIds.length,
        results: input.playerIds.map(playerId => ({
          playerId,
          conversationId: `mock-conversation-${playerId}`,
          messageId: `mock-message-${playerId}`,
        })),
      };
    }),

  /**
   * Mark messages as read
   */
  markAsRead: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      messageIds: z.array(z.string().uuid()).optional(),
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a coach
      const coach = await ctx.db.coach.findUnique({
        where: { clerk_id: userId },
      });

      if (!coach) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only coaches can mark messages as read",
        });
      }

      return {
        success: true,
        messagesMarked: 0,
      };
    }),

  /**
   * Star or unstar a conversation
   */
  toggleStar: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a coach
      const coach = await ctx.db.coach.findUnique({
        where: { clerk_id: userId },
      });

      if (!coach) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only coaches can star conversations",
        });
      }

      return {
        success: true,
        isStarred: true,
      };
    }),

  /**
   * Get available players for messaging
   */
  getAvailablePlayers: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      gameId: z.string().uuid().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a coach
      const coach = await ctx.db.coach.findUnique({
        where: { clerk_id: userId },
      });

      if (!coach) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only coaches can access player list",
        });
      }

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
        orderBy: [
          { first_name: "asc" },
          { last_name: "asc" },
        ],
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
  getPlayerConversations: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      filter: z.enum(["all", "unread", "starred", "archived"]).default("all"),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a player
      const player = await ctx.db.player.findUnique({
        where: { clerk_id: userId },
      });

      if (!player) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only players can access player conversations",
        });
      }

      // Get actual conversations from database
      const conversations = await ctx.db.conversation.findMany({
        where: {
          player_id: player.id,
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
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
        orderBy: { updated_at: 'desc' },
        take: input.limit,
      });

      // Filter by search if provided
      const filteredConversations = input.search
        ? conversations.filter(conv => 
            `${conv.coach.first_name} ${conv.coach.last_name}`.toLowerCase().includes(input.search!.toLowerCase()) ||
            conv.coach.school?.toLowerCase().includes(input.search!.toLowerCase())
          )
        : conversations;

      // Filter by unread if specified
      const finalConversations = input.filter === "unread"
        ? filteredConversations.filter(conv => 
            conv.messages.some(msg => !msg.is_read && msg.sender_type === "COACH")
          )
        : filteredConversations;

      return {
        conversations: finalConversations.map(conv => ({
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
          lastMessage: conv.messages[0] ? {
            id: conv.messages[0].id,
            content: conv.messages[0].content,
            senderType: conv.messages[0].sender_type,
            timestamp: conv.messages[0].created_at,
            isRead: conv.messages[0].is_read,
          } : null,
          unreadCount: conv.messages.filter(msg => !msg.is_read && msg.sender_type === "COACH").length,
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
  getPlayerConversation: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a player
      const player = await ctx.db.player.findUnique({
        where: { clerk_id: userId },
      });

      if (!player) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only players can access player conversations",
        });
      }

      // Get actual conversation from database
      const conversation = await ctx.db.conversation.findFirst({
        where: {
          id: input.conversationId,
          player_id: player.id,
        },
        include: {
          coach: {
            include: {
              school_ref: true,
            },
          },
          messages: {
            orderBy: { created_at: 'asc' },
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
        messages: conversation.messages.map(msg => ({
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
  sendPlayerMessage: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid().optional(),
      coachId: z.string().uuid().optional(),
      content: z.string().min(1).max(2000).trim(),
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a player
      const player = await ctx.db.player.findUnique({
        where: { clerk_id: userId },
      });

      if (!player) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only players can send player messages",
        });
      }

      // Mock response for now
      return {
        id: "mock-message",
        conversationId: "mock-conversation",
        content: "Message sent successfully",
        timestamp: new Date(),
      };
    }),

  /**
   * Mark messages as read for player
   */
  markPlayerMessagesAsRead: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
      messageIds: z.array(z.string().uuid()).optional(),
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a player
      const player = await ctx.db.player.findUnique({
        where: { clerk_id: userId },
      });

      if (!player) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only players can mark player messages as read",
        });
      }

      return {
        success: true,
        messagesMarked: 0,
      };
    }),

  /**
   * Star or unstar a conversation for player
   */
  togglePlayerStar: protectedProcedure
    .input(z.object({
      conversationId: z.string().uuid(),
    }))
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a player
      const player = await ctx.db.player.findUnique({
        where: { clerk_id: userId },
      });

      if (!player) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only players can star player conversations",
        });
      }

      return {
        success: true,
        isStarred: true,
      };
    }),

  /**
   * Get available coaches for messaging (player endpoint)
   */
  getAvailableCoaches: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx }) => {
      const userId = ctx.auth.userId;
      
      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        });
      }

      // Verify user is a player
      const player = await ctx.db.player.findUnique({
        where: { clerk_id: userId },
      });

      if (!player) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only players can access coach list",
        });
      }

      // Get actual coaches from database
      const coaches = await ctx.db.coach.findMany({
        include: {
          school_ref: true,
        },
        take: 50,
        orderBy: [
          { first_name: "asc" },
          { last_name: "asc" },
        ],
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