// src/server/api/routers/playerProfile.ts
// This file contains the player profile router for the API.
// It is used to get, update, and delete player profiles.
// It also contains the logic for adding and removing platform and social connections.
// It also contains the logic for getting all available games for main game selection.

// It uses the playerProcedure from the trpc router to ensure that the user is authenticated as a player.


import { z } from "zod";
import { createTRPCRouter, publicProcedure, onboardedCoachProcedure, playerProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "@/server/api/trpc";
import { withRetry } from "@/lib/db-utils";

// Type for the tRPC context
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Cache configuration
const CACHE_CONFIG = {
  PUBLIC_PROFILE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_CACHE_SIZE: 1000, // Maximum number of cached profiles
  CLEANUP_INTERVAL: 10 * 60 * 1000, // Cleanup interval: 10 minutes
};

// Cache entry type
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Generic in-memory cache implementation
class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(maxSize = 1000, cleanupIntervalMs = 600000) {
    this.maxSize = maxSize;
    
    // Set up periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  set(key: string, data: T, ttlMs: number): void {
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Remove expired entries
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  // Cleanup resources
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Define the public profile data type
type PublicProfileData = {
  id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  image_url: string | null;
  location: string | null;
  bio: string | null;
  class_year: string | null;
  school: string | null;
  created_at: Date;
  main_game_id: string | null;
  school_ref: {
    id: string;
    name: string;
    type: string;
    location: string;
    state: string;
  } | null;
  main_game: {
    id: string;
    name: string;
    short_name: string;
    icon: string | null;
    color: string | null;
  } | null;
  game_profiles: Array<{
    id: string;
    game_id: string;
    username: string;
    rank: string | null;
    role: string | null;
    play_style: string | null;
    agents: string[];
    combine_score: number | null;
    league_score: number | null;
    updated_at: Date;
    game: {
      id: string;
      name: string;
      short_name: string;
      icon: string | null;
      color: string | null;
    };
  }>;
  platform_connections: Array<{
    platform: string;
    username: string;
    connected: boolean;
  }>;
  social_connections: Array<{
    platform: string;
    username: string;
    connected: boolean;
  }>;
};

// Create cache instance for public profiles
const publicProfileCache = new MemoryCache<PublicProfileData>(
  CACHE_CONFIG.MAX_CACHE_SIZE,
  CACHE_CONFIG.CLEANUP_INTERVAL
);

// Cache invalidation helpers
const invalidateProfileCache = (username: string) => {
  publicProfileCache.delete(`profile:${username}`);
};

// Input validation schemas
const profileUpdateSchema = z.object({
  // Basic profile information
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  
  // Academic/School information
  school: z.string().optional(),
  gpa: z.number().min(0).max(4.0).optional(),
  class_year: z.string().optional(),
  graduation_date: z.string().optional(),
  intended_major: z.string().optional(),
  
  // Contact information
  guardian_email: z.string().email().optional().or(z.literal("")),
  scholastic_contact: z.string().optional(),
  scholastic_contact_email: z.string().email().optional().or(z.literal("")),
  extra_curriculars: z.string().optional(),
  academic_bio: z.string().optional(),
  
  // Main game selection
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

// Verification is now handled automatically by playerProcedure


export const playerProfileRouter = createTRPCRouter({
  // Get player profile
  getProfile: playerProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId!; // Safe to use ! because playerProcedure ensures userId exists
    
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

  // Optimized: Get basic profile info only (faster loading)
  getBasicProfile: playerProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId!; // Safe to use ! because playerProcedure ensures userId exists
    
    try {
      const player = await withRetry(() =>
        ctx.db.player.findUnique({
          where: { clerk_id: userId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            username: true,
            location: true,
            bio: true,
            school: true,
            class_year: true,
            gpa: true,
            graduation_date: true,
            main_game_id: true,
            created_at: true,
            updated_at: true,
          },
        })
      );
      
      return player;
    } catch (error) {
      console.error('Error fetching basic profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch basic profile',
      });
    }
  }),

  // Optimized: Get connections only (for connection management)
  getConnections: playerProcedure.query(async ({ ctx }) => {
    const playerId = ctx.playerId; // Available from playerProcedure context
    
    try {
      const [platformConnections, socialConnections] = await Promise.all([
        withRetry(() =>
          ctx.db.playerPlatformConnection.findMany({
            where: { player_id: playerId },
            select: {
              platform: true,
              username: true,
              connected: true,
              updated_at: true,
            },
            orderBy: { platform: 'asc' },
          })
        ),
        withRetry(() =>
          ctx.db.playerSocialConnection.findMany({
            where: { player_id: playerId },
            select: {
              platform: true,
              username: true,
              connected: true,
              updated_at: true,
            },
            orderBy: { platform: 'asc' },
          })
        ),
      ]);
      
      return {
        platform_connections: platformConnections,
        social_connections: socialConnections,
      };
    } catch (error) {
      console.error('Error fetching connections:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch connections',
      });
    }
  }),

  // Optimized: Get recruiting info only
  getRecruitingInfo: playerProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId!; // Safe to use ! because playerProcedure ensures userId exists
    
    try {
      const player = await withRetry(() =>
        ctx.db.player.findUnique({
          where: { clerk_id: userId },
          select: {
            school: true,
            school_id: true,
            gpa: true,
            class_year: true,
            graduation_date: true,
            intended_major: true,
            guardian_email: true,
            scholastic_contact: true,
            scholastic_contact_email: true,
            extra_curriculars: true,
            academic_bio: true,
            main_game_id: true,
            school_ref: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true,
                state: true,
              },
            },
            main_game: {
              select: {
                id: true,
                name: true,
                short_name: true,
                icon: true,
                color: true,
              },
            },
          },
        })
      );
      
      return player;
    } catch (error) {
      console.error('Error fetching recruiting info:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch recruiting info',
      });
    }
  }),

  // Update player profile
  updateProfile: playerProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because playerProcedure ensures userId exists
      
      try {
        // Get current player data to access username before update
        const currentPlayer = await withRetry(() =>
          ctx.db.player.findUnique({
            where: { clerk_id: userId },
            select: { username: true },
          })
        );

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
        
        // Invalidate cache for the player's public profile
        if (currentPlayer?.username) {
          invalidateProfileCache(currentPlayer.username);
        }
        
        // If username was updated, also invalidate new username
        if (input.username && input.username !== currentPlayer?.username) {
          invalidateProfileCache(input.username);
        }
        
        return updatedPlayer;
      } catch (error) {
        console.error('Error updating player profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update player profile',
        });
      }
    }),

  // Update platform connection
  updatePlatformConnection: playerProcedure
    .input(platformConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      const playerId = ctx.playerId; // Available from playerProcedure context
      
      try {
        const connection = await withRetry(() =>
          ctx.db.playerPlatformConnection.upsert({
            where: {
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

  // Update social connection
  updateSocialConnection: playerProcedure
    .input(socialConnectionSchema)
    .mutation(async ({ ctx, input }) => {
      const playerId = ctx.playerId; // Available from playerProcedure context
      
      try {
        const connection = await withRetry(() =>
          ctx.db.playerSocialConnection.upsert({
            where: {
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
  removePlatformConnection: playerProcedure
    .input(z.object({ platform: z.enum(["steam", "valorant", "battlenet", "epicgames", "startgg"]) }))
    .mutation(async ({ ctx, input }) => {
      const playerId = ctx.playerId; // Available from playerProcedure context
      
      try {
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
  removeSocialConnection: playerProcedure
    .input(z.object({ platform: z.enum(["github", "discord", "instagram", "twitch", "x"]) }))
    .mutation(async ({ ctx, input }) => {
      const playerId = ctx.playerId; // Available from playerProcedure context
      
      try {
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
  getAvailableGames: publicProcedure.query(async ({ ctx }) => {
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
          orderBy: { name: 'asc' },
        })
      );
      
      return games;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch available games',
      });
    }
  }),

  // Get public profile by username (for public viewing)
  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      // Check cache first
      const cacheKey = `profile:${input.username}`;
      const cachedData = publicProfileCache.get(cacheKey);
      
      if (cachedData) {
        return cachedData;
      }

      try {
        const player = await withRetry(() =>
          ctx.db.player.findUnique({
            where: { username: input.username },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              image_url: true,
              location: true,
              bio: true,
              class_year: true,
              school: true,
              created_at: true,
              main_game_id: true,
              school_ref: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                },
              },
              main_game: {
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                  icon: true,
                  color: true,
                },
              },
              game_profiles: {
                select: {
                  id: true,
                  game_id: true,
                  username: true,
                  rank: true,
                  role: true,
                  play_style: true,
                  agents: true,
                  combine_score: true,
                  league_score: true,
                  updated_at: true,
                  game: {
                    select: {
                      id: true,
                      name: true,
                      short_name: true,
                      icon: true,
                      color: true,
                    },
                  },
                },
              },
              platform_connections: {
                where: { connected: true },
                select: {
                  platform: true,
                  username: true,
                  connected: true,
                },
              },
              social_connections: {
                where: { connected: true },
                select: {
                  platform: true,
                  username: true,
                  connected: true,
                },
              },
            },
          })
        );
        
        if (!player) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player profile not found',
          });
        }

        // Cache the result
        publicProfileCache.set(cacheKey, player, CACHE_CONFIG.PUBLIC_PROFILE_TTL);
        
        return player;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching public profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch public profile',
        });
      }
    }),

  // Get public recruiting info (only accessible by onboarded coaches)
  getPublicRecruitingInfo: onboardedCoachProcedure
    .input(z.object({ username: z.string().min(3) }))
    .query(async ({ ctx, input }) => {
      try {
        const player = await withRetry(() =>
          ctx.db.player.findUnique({
            where: { username: input.username },
            select: {
              gpa: true,
              graduation_date: true,
              intended_major: true,
              guardian_email: true,
              scholastic_contact: true,
              scholastic_contact_email: true,
              extra_curriculars: true,
              academic_bio: true,
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
        console.error('Error fetching public recruiting info:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recruiting info',
        });
      }
    }),
}); 