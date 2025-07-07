import { createTRPCRouter, playerProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { env } from "@/env";

// API Base URL
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const EVAL_API_BASE = env.EVAL_API_BASE;

// Zod schemas for API responses
const ValorantImagePathsSchema = z.object({
  agent_icon_url: z.string(),
  best_map_url: z.string(),
  worst_map_url: z.string(),
  gun_url: z.string(),
  role_icon_url: z.string(),
});

const ValorantShotsStatsSchema = z.object({
  head: z.number(),
  body: z.number(),
  leg: z.number(),
});

const ValorantMultiKillStatsSchema = z.object({
  double_kills: z.number(),
  triple_kills: z.number(),
  quadra_kills: z.number(),
  penta_kills: z.number(),
  hexa_kills: z.number(),
});

const ValorantRoleStatsSchema = z.object({
  wins: z.number(),
  games: z.number(),
});

const ValorantRoleBreakdownSchema = z.object({
  Duelist: ValorantRoleStatsSchema,
  Initiator: ValorantRoleStatsSchema,
  Controller: ValorantRoleStatsSchema,
  Sentinel: ValorantRoleStatsSchema,
});

const ValorantWeaponStatsSchema = z.object({
  rounds: z.number(),
  wins: z.number(),
});

const ValorantAgentStatsSchema = z.object({
  games: z.number(),
  wins: z.number(),
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  ability1: z.number(),
  ability2: z.number(),
  ult: z.number(),
  grenade: z.number(),
});

const ValorantKillLocationSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const ValorantMapStatsSchema = z.object({
  games: z.number(),
  wins: z.number(),
  kills: z.array(ValorantKillLocationSchema).optional(),
});

const ValorantPlayerStatsSchema = z.object({
  // Basic round/game stats
  rounds: z.number(),
  rounds_won: z.number(),
  round_winrate: z.number(),
  games: z.number(),
  games_won: z.number(),
  game_winrate: z.number(),
  
  // Kill/Death/Assist stats
  kills: z.number(),
  deaths: z.number(),
  assists: z.number(),
  avg_kills: z.number(),
  avg_deaths: z.number(),
  avg_assists: z.number(),
  kd: z.number(),
  kda: z.number(),
  
  // Performance metrics
  pistol_rounds: z.number(),
  pistol_wins: z.number(),
  pistol_winrate: z.number(),
  combat_score: z.number(),
  acs: z.number(),
  shots: ValorantShotsStatsSchema,
  kast: z.number(),
  trades: z.number(),
  traded: z.number(),
  clutches: z.number(),
  clutch_chances: z.number(),
  clutch_factor: z.number(),
  first_bloods: z.number(),
  first_deaths: z.number(),
  multi_kills: ValorantMultiKillStatsSchema,
  top_frags: z.number(),
  top_frag_rate: z.number(),
  damage_given: z.number(),
  damage_received: z.number(),
  time_alive: z.number(),
  
  // Weapon and agent data
  guns: z.record(z.string(), ValorantWeaponStatsSchema).optional(),
  agents: z.record(z.string(), ValorantAgentStatsSchema).optional(),
  maps: z.record(z.string(), ValorantMapStatsSchema).optional(),
  roles: ValorantRoleBreakdownSchema,
  
  // Additional computed stats
  traded_ratio: z.number().nullable(),
  main_role: z.string().nullable(),
  main_agent: z.string().nullable(),
  main_gun: z.string().nullable(),
  best_map: z.string().nullable(),
  best_map_winrate: z.number().nullable(),
  worst_map: z.string().nullable(),
  worst_map_winrate: z.number().nullable(),
  main_agent_id: z.string().nullable(),
  main_gun_id: z.string().nullable(),
  best_map_id: z.string().nullable(),
  worst_map_id: z.string().nullable(),
  role_score: z.number().nullable(),
  agent_score: z.number().nullable(),
  eval_score: z.number().nullable(),
  rank: z.number().nullable(),
  rank_name: z.string().nullable(),
  image_paths: ValorantImagePathsSchema,
});

const ValorantPlayerStatsResponseSchema = z.object({
  puuid: z.string(),
  game_name: z.string(),
  tag_line: z.string(),
  eval_score: z.number(),
  rank_name: z.string(),
  stats: ValorantPlayerStatsSchema,
  success: z.boolean(),
  message: z.string(),
});

const EvalScoreResponseSchema = z.object({
  eval_score: z.number(),
  matches_analyzed: z.number(),
  success: z.boolean(),
});

// Output types for the frontend
export type ValorantAnalyticsData = {
  role: string;
  gameName?: string;
  tagLine?: string;
  mainAgent: {
    name: string;
    image: string;
  };
  mainGun: {
    name: string;
    image: string;
  };
  bestMap: {
    name: string;
    image: string;
  };
  worstMap: {
    name: string;
    image: string;
  };
  stats: {
    evalScore: number;
    rank: string;
    kda: string;
    gameWinRate: string;
    roundWinRate: string;
    acs: number;
    kastPercent: string;
    clutchFactor: string;
  };
};

// Helper function to make API requests
async function makeValorantAPIRequest(endpoint: string, data?: unknown): Promise<unknown> {
  const url = `${EVAL_API_BASE}${endpoint}`;
  
  try {
    const requestOptions: RequestInit = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      console.error(`Valorant API request failed for ${endpoint}:`, response);
      console.error(`url: ${url}`);
      console.error(`requestOptions: ${JSON.stringify(requestOptions)}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json() as unknown;
  } catch (error) {
    console.error(`Valorant API request failed for ${endpoint}:`, error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch data from Valorant API',
      cause: error,
    });
  }
}

// Helper function to convert API response to analytics format
function transformToAnalyticsData(
  apiResponse: z.infer<typeof ValorantPlayerStatsResponseSchema>
): ValorantAnalyticsData {
  const stats = apiResponse.stats;
  
  // Calculate KAST percentage
  const kastPercent = stats.rounds > 0 ? Math.round((stats.kast / stats.rounds) * 100) : 0;
  
  // Format K/D/A string
  const kda = `${stats.avg_kills.toFixed(1)}/${stats.avg_deaths.toFixed(1)}/${stats.avg_assists.toFixed(1)}`;
  
  return {
    role: stats.main_role ?? "Unknown",
    gameName: apiResponse.game_name ?? undefined,
    tagLine: apiResponse.tag_line ?? undefined,
    mainAgent: {
      name: stats.main_agent ?? "Unknown",
      image: stats.image_paths.agent_icon_url,
    },
    mainGun: {
      name: stats.main_gun ?? "Unknown", 
      image: stats.image_paths.gun_url,
    },
    bestMap: {
      name: stats.best_map ?? "Unknown",
      image: stats.image_paths.best_map_url,
    },
    worstMap: {
      name: stats.worst_map ?? "Unknown",
      image: stats.image_paths.worst_map_url,
    },
    stats: {
      evalScore: stats.eval_score ?? 0,
      rank: stats.rank_name ?? "Unranked",
      kda,
      gameWinRate: `${Math.round(stats.game_winrate * 100)}%`,
      roundWinRate: `${Math.round(stats.round_winrate * 100)}%`,
      acs: Math.round(stats.acs),
      kastPercent: `${kastPercent}%`,
      clutchFactor: `${Math.round(stats.clutch_factor * 100)}%`,
    },
  };
}

export const valorantStatsRouter = createTRPCRouter({
  /**
   * Get comprehensive Valorant player statistics
   * Requires a player's PUUID from their Valorant metadata
   */
  getPlayerStats: publicProcedure
    .input(
      z.object({
        puuid: z.string().min(1, "PUUID is required"),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        data: z.custom<ValorantAnalyticsData>().nullable(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const apiResponse = await makeValorantAPIRequest("/valorant/stats", {
          puuid: input.puuid,
        });

        const validatedResponse = ValorantPlayerStatsResponseSchema.parse(apiResponse);
        
        if (!validatedResponse.success) {
          return {
            success: false,
            data: null,
            message: validatedResponse.message || "Failed to retrieve player stats",
          };
        }

        const analyticsData = transformToAnalyticsData(validatedResponse);

        return {
          success: true,
          data: analyticsData,
          message: "Player stats retrieved successfully",
        };
      } catch (error) {
        console.error("Error fetching Valorant player stats:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        return {
          success: false,
          data: null,
          message: "An error occurred while fetching player statistics",
        };
      }
    }),

  /**
   * Get only the EVAL score for a player (faster endpoint)
   */
  getEvalScore: publicProcedure
    .input(
      z.object({
        puuid: z.string().min(1, "PUUID is required"),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        evalScore: z.number().nullable(),
        matchesAnalyzed: z.number().nullable(),
        message: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const apiResponse = await makeValorantAPIRequest("/valorant/eval-score", {
          puuid: input.puuid,
        });

        const validatedResponse = EvalScoreResponseSchema.parse(apiResponse);

        if (!validatedResponse.success) {
          return {
            success: false,
            evalScore: null,
            matchesAnalyzed: null,
            message: "Failed to retrieve EVAL score",
          };
        }

        return {
          success: true,
          evalScore: validatedResponse.eval_score,
          matchesAnalyzed: validatedResponse.matches_analyzed,
          message: "EVAL score retrieved successfully",
        };
      } catch (error) {
        console.error("Error fetching Valorant EVAL score:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        return {
          success: false,
          evalScore: null,
          matchesAnalyzed: null,
          message: "An error occurred while fetching EVAL score",
        };
      }
    }),

  /**
   * Get rank information from tier number
   */
  getRankInfo: publicProcedure
    .input(
      z.object({
        tier: z.number().min(0).max(27),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        tier: z.number().nullable(),
        rankName: z.string().nullable(),
        message: z.string(),
      })
    )
         .query(async ({ input }) => {
       try {
         const apiResponse = await makeValorantAPIRequest(`/valorant/rank-info/${input.tier}`);
         
         // Type assertion for the API response structure
         const rankResponse = apiResponse as { rank_name?: string };

         return {
           success: true,
           tier: input.tier,
           rankName: rankResponse.rank_name ?? null,
           message: "Rank information retrieved successfully",
         };
      } catch (error) {
        console.error("Error fetching Valorant rank info:", error);
        
        return {
          success: false,
          tier: null,
          rankName: null,
          message: "An error occurred while fetching rank information",
        };
      }
    }),

  /**
   * Get Valorant stats for a specific player by their player ID
   * Server-side lookup of PUUID from Clerk metadata
   */
  getPlayerStatsByPlayerId: publicProcedure
    .input(
      z.object({
        playerId: z.string().min(1, "Player ID is required"),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        data: z.custom<ValorantAnalyticsData>().nullable(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get the player from database to get their Clerk ID
        const player = await ctx.db.player.findUnique({
          where: { id: input.playerId },
          select: { clerk_id: true, first_name: true, last_name: true },
        });

        if (!player) {
          return {
            success: false,
            data: null,
            message: "Player not found",
          };
        }

                  // Get Valorant PUUID from Clerk user metadata
          try {
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.getUser(player.clerk_id);
            
            const valorantMetadata = clerkUser.publicMetadata?.valorant as { puuid?: string } | undefined;
            
            if (!valorantMetadata?.puuid) {
              return {
                success: false,
                data: null,
                message: "Player hasn't connected their Valorant account",
              };
            }

            // Use the existing getPlayerStats logic with the retrieved PUUID
            const apiResponse = await makeValorantAPIRequest("/valorant/stats", {
              puuid: valorantMetadata.puuid,
            });

            const validatedResponse = ValorantPlayerStatsResponseSchema.parse(apiResponse);
            
            if (!validatedResponse.success) {
              return {
                success: false,
                data: null,
                message: validatedResponse.message || "Failed to retrieve player stats from Valorant API",
              };
            }

            const analyticsData = transformToAnalyticsData(validatedResponse);

            return {
              success: true,
              data: analyticsData,
              message: "Player stats retrieved successfully",
            };

        } catch (clerkError) {
          console.error("Error fetching Clerk user metadata:", clerkError);
          return {
            success: false,
            data: null,
            message: "Unable to access player's Valorant connection",
          };
        }

      } catch (error) {
        console.error("Error fetching Valorant player stats by player ID:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        return {
          success: false,
          data: null,
          message: "An error occurred while fetching player statistics",
        };
      }
    }),

  /**
   * Get current player's Valorant stats (requires authentication)
   * Uses the player's stored Valorant PUUID from metadata
   */
  getMyStats: playerProcedure
    .output(
      z.object({
        success: z.boolean(),
        data: z.custom<ValorantAnalyticsData>().nullable(),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx }) => {
      try {
        // Get the current player's profile
        const player = await ctx.db.player.findUnique({
          where: { clerk_id: ctx.auth.userId! },
          select: { id: true },
        });

        if (!player) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Player profile not found',
          });
        }

                 // Use the getPlayerStatsByPlayerId logic for consistency
         try {
           const clerk = await clerkClient();
           const clerkUser = await clerk.users.getUser(ctx.auth.userId!);
           
           const valorantMetadata = clerkUser.publicMetadata?.valorant as { puuid?: string } | undefined;
          
          if (!valorantMetadata?.puuid) {
            return {
              success: false,
              data: null,
              message: "You haven't connected your Valorant account. Please connect it first.",
            };
          }

          const apiResponse = await makeValorantAPIRequest("/valorant/stats", {
            puuid: valorantMetadata.puuid,
          });

          const validatedResponse = ValorantPlayerStatsResponseSchema.parse(apiResponse);
          
          if (!validatedResponse.success) {
            return {
              success: false,
              data: null,
              message: validatedResponse.message || "Failed to retrieve your stats from Valorant API",
            };
          }

          const analyticsData = transformToAnalyticsData(validatedResponse);

          return {
            success: true,
            data: analyticsData,
            message: "Your stats retrieved successfully",
          };

        } catch (clerkError) {
          console.error("Error fetching user's Clerk metadata:", clerkError);
          return {
            success: false,
            data: null,
            message: "Unable to access your Valorant connection",
          };
        }

      } catch (error) {
        console.error("Error fetching player's Valorant stats:", error);
        
        if (error instanceof TRPCError) {
          throw error;
        }
        
        return {
          success: false,
          data: null,
          message: "An error occurred while fetching your Valorant statistics",
        };
      }
    }),

  /**
   * Health check for the Valorant API
   */
  healthCheck: publicProcedure
    .output(
      z.object({
        apiStatus: z.string(),
        message: z.string(),
        timestamp: z.string(),
      })
    )
    .query(async () => {
      try {
        await makeValorantAPIRequest("/health");
        
        return {
          apiStatus: "healthy",
          message: "Valorant API is operational",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Valorant API health check failed:", error);
        
        return {
          apiStatus: "unhealthy",
          message: "Valorant API is currently unavailable",
          timestamp: new Date().toISOString(),
        };
      }
    }),
}); 