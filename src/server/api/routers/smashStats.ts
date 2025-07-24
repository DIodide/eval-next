import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { clerkClient } from "@clerk/nextjs/server";
import { env } from "@/env";

// Types based on the new OpenAPI schema
export interface SSBUCharacterStats {
  games: number;
  wins: number;
  winrate: number;
  image_path: string; // New field for character images
}

export interface SSBUMatchupData {
  wins: number;
  games: number;
  winrate: number;
  player_character_image: string; // New field for player character image
  opponent_character_image: string; // New field for opponent character image
}

export interface SSBUStageStats {
  wins: number;
  losses: number;
  winrate: number;
}

export interface SSBUTournamentResult {
  event: string;
  placement: number;
  num_entrants: number;
  competition_tier: number;
  tier_name: string;
  start_at?: number | null;
}

export interface SSBUSetData {
  display_score: string;
  games_won: number;
  games_lost: number;
  won: boolean;
  opponent: string;
  vod_url?: string | null;
}

export interface SSBUPlayerStats {
  characters: Record<string, SSBUCharacterStats>;
  mains: Record<string, SSBUCharacterStats>;
  matchups: Record<string, Record<string, SSBUMatchupData>>;
  best_matchups: Record<string, Record<string, SSBUMatchupData>>;
  worst_matchups: Record<string, Record<string, SSBUMatchupData>>;
  stages: Record<string, SSBUStageStats>;
  best_stages: Record<string, SSBUStageStats>;
  worst_stages: Record<string, SSBUStageStats>;
  game_wins: number;
  game_losses: number;
  game_win_rate: number;
  set_wins: number;
  set_losses: number;
  set_draws: number;
  set_win_rate: number;
  events: number;
  events_by_tier: Record<string, number>;
  clutch_wins: number;
  clutch_opportunities: number;
  clutch_factor: number;
  consistency_score: number;
  placement_score: number;
  performance_score: number;
  clutch_score: number;
  prestige_score: number;
  eval_score: number;
}

export interface SSBUPlayerStatsResponse {
  player_id?: string | null;
  prefix: string;
  gamerTag: string;
  eval_score: number;
  stats: SSBUPlayerStats;
  recent_standings: SSBUTournamentResult[];
  success: boolean;
  message: string;
}

export interface SSBUResultsResponse {
  player_id?: string | null;
  gamerTag: string;
  results: Record<string, SSBUTournamentResult>;
  sets: Record<string, SSBUSetData>;
  rankings: Record<string, number>;
  tier_distribution: Record<string, number>;
  success: boolean;
  message: string;
}

// Transform API response to analytics data format
export interface SmashAnalyticsData {
  playerInfo: {
    gamerTag: string;
    prefix: string;
    mainCharacter: string;
    evalScore: number;
  };
  stats: SSBUPlayerStats;
  recentPlacements: Array<{
    event: string;
    placement: number;
    entrants: number;
    tier: string;
  }>;
}

function transformToAnalyticsData(
  apiResponse: SSBUPlayerStatsResponse,
): SmashAnalyticsData {
  // Get the main character (first entry in mains)
  const mainCharacter = Object.keys(apiResponse.stats.mains)[0] ?? "Unknown";

  // Transform recent placements from the new response structure
  const recentPlacements = apiResponse.recent_standings
    .slice(0, 5)
    .map((result) => ({
      event: result.event,
      placement: result.placement,
      entrants: result.num_entrants,
      tier: result.tier_name,
    }));

  return {
    playerInfo: {
      gamerTag: apiResponse.gamerTag,
      prefix: apiResponse.prefix,
      mainCharacter,
      evalScore: apiResponse.eval_score,
    },
    stats: apiResponse.stats,
    recentPlacements,
  };
}

export const smashStatsRouter = createTRPCRouter({
  getPlayerStatsByPlayerId: publicProcedure
    .input(z.object({ playerId: z.string().min(1, "Player ID is required") }))
    .output(
      z.object({
        success: z.boolean(),
        data: z.custom<SmashAnalyticsData>().nullable(),
        message: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
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

        // Get start.gg user ID from Clerk user publicMetadata
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(player.clerk_id);

          // Get start.gg userId from publicMetadata
          const startggData = clerkUser.publicMetadata?.start_gg as
            | {
                slug?: string;
                userId?: string;
                lastUpdated?: string;
              }
            | undefined;

          if (!startggData?.userId) {
            return {
              success: false,
              data: null,
              message: "Player hasn't connected their start.gg account",
            };
          }

          const startggUserId = startggData.userId;

          // Call the EVAL Gaming API for stats
          const statsResponse = await fetch(
            `${env.EVAL_API_BASE}/ssbu/stats?user_id=${startggUserId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!statsResponse.ok) {
            const errorText = await statsResponse.text();
            console.error("EVAL API Error:", statsResponse.status, errorText);
            throw new Error(
              `Failed to fetch SSBU stats: ${statsResponse.status} ${errorText}`,
            );
          }

          const statsData =
            (await statsResponse.json()) as SSBUPlayerStatsResponse;

          if (!statsData.success) {
            throw new Error(
              statsData.message || "Failed to retrieve SSBU stats",
            );
          }

          const analyticsData = transformToAnalyticsData(statsData);

          return {
            success: true,
            data: analyticsData,
            message: "Stats retrieved successfully",
          };
        } catch (clerkError) {
          console.error("Error fetching Clerk user data:", clerkError);
          return {
            success: false,
            data: null,
            message: "Failed to fetch user connection data",
          };
        }
      } catch (error) {
        console.error("Error fetching SSBU stats:", error);

        return {
          success: false,
          data: null,
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch SSBU stats",
        };
      }
    }),
});
