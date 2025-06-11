// src/server/api/routers/playerProfile.ts
// This file contains the player profile router for the API.
// It is used to get, update, and delete player profiles.
// It also contains the logic for adding and removing platform and social connections.
// It also contains the logic for getting all available games for main game selection.

// It uses the protectedProcedure from the trpc router to ensure that the user is authenticated.


import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "@/server/api/trpc";
import { withRetry } from "@/lib/db-utils";

// Type for the tRPC context
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Input validation schemas
const profileUpdateSchema = z.object({
  // Basic profile information
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  
  // Academic/School information
  school: z.string().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  class_year: z.string().optional(),
  graduation_date: z.string().optional(),
  intended_major: z.string().optional(),
  
  // Recruiting contact information
  guardian_email: z.string().email().optional().or(z.literal("")),
  scholastic_contact: z.string().optional(),
  scholastic_contact_email: z.string().email().optional().or(z.literal("")),
  
  // Additional recruiting information
  extra_curriculars: z.string().optional(),
  academic_bio: z.string().optional(),
  
  // Main game preference
  main_game_id: z.string().uuid().optional(),
});

const platformConnectionSchema = z.object({
  platform: z.enum(["steam", "valorant", "battlenet", "epicgames", "startgg"]),
  username: z.string().min(3),
});

const socialConnectionSchema = z.object({
  platform: z.enum(["github", "discord", "instagram", "twitch", "x"]),
  username: z.string().min(3),
});

// Helper function to verify user is a player using the auth context
async function verifyPlayerUser(ctx: Context) {
  const userId = ctx.auth.userId;
  
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not authenticated',
    });
  }

  // Check if the player exists in our database using retry wrapper
  // The userType verification should happen during user creation via webhooks
  const player = await withRetry(() => 
    ctx.db.player.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    })
  );

  if (!player) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Player profile not found. Only players can access this resource.',
    });
  }

  return { userId, playerId: player.id };
}

export const playerProfileRouter = createTRPCRouter({
  // Get player profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Verify user is a player and get user info
    const { userId } = await verifyPlayerUser(ctx);
    
    try {
      const player = await withRetry(() =>
        ctx.db.player.findUnique({
          where: { clerk_id: userId },
          include: {
            school_ref: true,
            main_game: true,
            platform_connections: true,
            social_connections: true,
          },
        })
      );
      
      if (!player) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Player profile not found',
        });
      }
      
      return player;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch player profile',
      });
    }
  }),

  // Update player profile
  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user is a player and get user info
      const { userId } = await verifyPlayerUser(ctx);
      
      try {
        const updatedPlayer = await withRetry(() =>
          ctx.db.player.update({
            where: { clerk_id: userId },
            data: {
              ...input,
              updated_at: new Date(),
            },
            include: {
              school_ref: true,
              main_game: true,
              platform_connections: true,
              social_connections: true,
            },
          })
        );
        
        return updatedPlayer;
      } catch (error) {
        console.error('Error updating player profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update player profile',
        });
      }
    }),

  // Add or update platform connection
  updatePlatformConnection: protectedProcedure
    .input(platformConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user is a player and get user info
      const { playerId } = await verifyPlayerUser(ctx);
      
      try {
        // Upsert platform connection using the correct unique constraint
        const connection = await withRetry(() =>
          ctx.db.playerPlatformConnection.upsert({
            where: {
              // Use the compound unique constraint properly
              player_id_platform: {
                player_id: playerId,
                platform: input.platform,
              },
            },
            update: {
              username: input.username,
              connected: true,
              updated_at: new Date(),
            },
            create: {
              player_id: playerId,
              platform: input.platform,
              username: input.username,
              connected: true,
            },
          })
        );
        
        return connection;
      } catch (error) {
        console.error('Error updating platform connection:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update platform connection',
        });
      }
    }),

  // Add or update social connection
  updateSocialConnection: protectedProcedure
    .input(socialConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user is a player and get user info
      const { playerId } = await verifyPlayerUser(ctx);
      
      try {
        // Upsert social connection using the correct unique constraint
        const connection = await withRetry(() =>
          ctx.db.playerSocialConnection.upsert({
            where: {
              // Use the compound unique constraint properly
              player_id_platform: {
                player_id: playerId,
                platform: input.platform,
              },
            },
            update: {
              username: input.username,
              connected: true,
              updated_at: new Date(),
            },
            create: {
              player_id: playerId,
              platform: input.platform,
              username: input.username,
              connected: true,
            },
          })
        );
        
        return connection;
      } catch (error) {
        console.error('Error updating social connection:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update social connection',
        });
      }
    }),

  // Remove platform connection
  removePlatformConnection: protectedProcedure
    .input(z.object({ platform: z.enum(["steam", "valorant", "battlenet", "epicgames", "startgg"]) }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is a player and get user info
      const { playerId } = await verifyPlayerUser(ctx);
      
      try {
          // Delete platform connection using the correct unique constraint
          await withRetry(() =>
            ctx.db.playerPlatformConnection.delete({
              where: {
                player_id_platform: {
                  player_id: playerId,
                  platform: input.platform,
                },
              },
            })
          );
        
        return { success: true };
      } catch (error) {
        console.error('Error removing platform connection:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove platform connection',
        });
      }
    }),

  // Remove social connection
  removeSocialConnection: protectedProcedure
    .input(z.object({ platform: z.enum(["github", "discord", "instagram", "twitch", "x"]) }))
    .mutation(async ({ ctx, input }) => {
      // Verify user is a player and get user info
      const { playerId } = await verifyPlayerUser(ctx);
      
      try {
        // Delete social connection using the correct unique constraint
        await withRetry(() =>
          ctx.db.playerSocialConnection.delete({
            where: {
              player_id_platform: {
                player_id: playerId,
                platform: input.platform,
              },
            },
          })
        );
        
        return { success: true };
      } catch (error) {
        console.error('Error removing social connection:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove social connection',
        });
      }
    }),

  // Get all available games for main game selection
  getAvailableGames: protectedProcedure.query(async ({ ctx }) => {
    // Verify user is a player
    await verifyPlayerUser(ctx);
    
    try {
      const games = await withRetry(() =>
        ctx.db.game.findMany({
          select: {
            id: true,
            name: true,
            short_name: true,
            icon: true,
            color: true,
          },
          orderBy: {
            name: 'asc',
          },
        })
      );
      
      return games;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch available games',
      });
    }
  }),
}); 