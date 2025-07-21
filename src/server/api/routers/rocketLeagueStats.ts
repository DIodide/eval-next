import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { clerkClient } from "@clerk/nextjs/server";
import { env } from "@/env";

// API Base URL
const EVAL_API_BASE = env.EVAL_API_BASE;

// Playlist enum for frontend selection
const RocketLeaguePlaylistSchema = z.enum([
  "duels", // 1v1 ranked
  "doubles", // 2v2 ranked
  "standard", // 3v3 ranked
]);

// Rocket League stats schema based on the actual API response
const RocketLeagueStatsSchema = z.object({
  mvp: z.number().describe("Number of MVPs"),
  "ot count": z.number().describe("Number of overtime games"),
  "ot wins": z.number().describe("Number of overtime wins"),
  wins: z.number().describe("Number of wins"),
  count: z.number().describe("Number of games"),
  car: z.record(z.number()).describe("Car usage by car name"),
  goals: z.number().describe("Goals per game"),
  assists: z.number().describe("Assists per game"),
  saves: z.number().describe("Saves per game"),
  shots: z.number().describe("Shots per game"),
  shooting_percentage: z.number().describe("Shooting percentage (0-100)"),
  demos: z.number().describe("Demos per game"),
  speed: z.number().describe("Average speed percentage (0-100)"),
  clutch: z.number().describe("Clutch success rate (0-1)"),
  win_percentage: z.number().describe("Win rate (0-1)"),
  mvps_per_game: z.number().describe("MVPs per game"),
  rank: z.string().describe("Current rank"),
  momentum: z.number().describe("Momentum score"),
  demo_ratio: z.number().describe("Demo inflicted to taken ratio"),
  percent_offense: z
    .number()
    .describe("Percent of time in offensive third (0-100)"),
  percent_defense: z
    .number()
    .describe("Percent of time in defensive third (0-100)"),
  percent_neutral: z
    .number()
    .describe("Percent of time in neutral third (0-100)"),
  first_man_percent: z
    .number()
    .nullable()
    .describe("Percent of time as first man (0-100)"),
  second_man_percent: z
    .number()
    .nullable()
    .describe("Percent of time as second man (0-100, 3v3 only)"),
  last_man_percent: z
    .number()
    .nullable()
    .describe("Percent of time as last man (0-100)"),
  boost_empty: z.number().describe("Percent of time with zero boost (0-100)"),
  boost_full: z.number().describe("Percent of time with full boost (0-100)"),
  boost_0_25: z.number().describe("Percent of time with 0-25% boost (0-100)"),
  boost_25_50: z.number().describe("Percent of time with 25-50% boost (0-100)"),
  boost_50_75: z.number().describe("Percent of time with 50-75% boost (0-100)"),
  boost_75_100: z
    .number()
    .describe("Percent of time with 75-100% boost (0-100)"),
  percent_ground: z.number().describe("Percent of time on ground (0-100)"),
  percent_low_air: z.number().describe("Percent of time in low air (0-100)"),
  percent_high_air: z.number().describe("Percent of time in high air (0-100)"),
  small_to_big_ratio: z
    .number()
    .describe("Small boost to big boost collection ratio"),
  stolen_to_collected_ratio: z
    .number()
    .describe("Boost stolen to collected ratio"),
  eval_score: z.number().describe("EVAL score (70-100)"),
  main_car: z.string().describe("Player's most used car"),
});

// All playlists response schema based on the actual API response
const RocketLeagueAllPlaylistsResponseSchema = z.object({
  platform: z.string().describe("Player's platform"),
  player_id: z.string().describe("Player's platform-specific ID"),
  username: z.string().describe("Player's username"),
  duels: RocketLeagueStatsSchema.nullable().describe(
    "Statistics for ranked duels playlist",
  ),
  doubles: RocketLeagueStatsSchema.nullable().describe(
    "Statistics for ranked doubles playlist",
  ),
  standard: RocketLeagueStatsSchema.nullable().describe(
    "Statistics for ranked standard playlist",
  ),
  weighted_eval_score: z
    .number()
    .describe("Weighted average eval score across all playlists"),
  playlist_scores: z
    .record(z.number())
    .describe("Individual eval scores by playlist"),
  success: z.boolean().default(true),
  message: z.string().default("Stats retrieved successfully"),
});

// Export types for frontend use
export type RocketLeagueStats = z.infer<typeof RocketLeagueStatsSchema>;
export type RocketLeagueAllPlaylistsResponse = z.infer<
  typeof RocketLeagueAllPlaylistsResponseSchema
>;

export const rocketLeagueStatsRouter = createTRPCRouter({
  /**
   * Get Rocket League player statistics for all playlists
   */
  getAllPlayerStats: publicProcedure
    .input(
      z.object({
        playerId: z.string().min(1, "Player ID is required"),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        data: RocketLeagueAllPlaylistsResponseSchema.nullable(),
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

        // Get Epic Games metadata from Clerk user
        const clerk = await clerkClient();
        const clerkUser = await clerk.users.getUser(player.clerk_id);

        const epicGames = clerkUser.publicMetadata?.epicGames as
          | {
              accountId?: string;
              displayName?: string;
              lastUpdated?: string;
            }
          | undefined;

        if (!epicGames?.accountId) {
          return {
            success: false,
            data: null,
            message: "Player hasn't connected their Epic Games account",
          };
        }

        // Build the API URL with query parameters
        const apiUrl = new URL(
          `${EVAL_API_BASE}/rocket-league/player/all-stats`,
        );
        apiUrl.searchParams.append("platform", "epic");
        apiUrl.searchParams.append("player_id", epicGames.accountId);

        console.log(`[RL Stats] Fetching all-stats from: ${apiUrl.toString()}`);

        const response = await fetch(apiUrl.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(`[RL Stats] Response Status:`, response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[RL Stats] API request failed:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to fetch Rocket League stats: ${response.status} ${response.statusText}`,
          });
        }
        console.log(`[RL Stats] Awaiting response.json()`);
        const apiResponse: unknown = await response.json();
        console.log(`[RL Stats] Raw API response:`, apiResponse);

        // Validate the response against our schema
        const validatedResponse =
          RocketLeagueAllPlaylistsResponseSchema.parse(apiResponse);
        console.log(
          `[RL Stats] Validated response status:`,
          validatedResponse.success,
        );
        if (!validatedResponse.success) {
          return {
            success: false,
            data: null,
            message: validatedResponse.message || "Failed to retrieve stats",
          };
        }

        console.log(
          `[RL Stats] Successfully validated response for player:`,
          validatedResponse.username,
        );

        return {
          success: true,
          data: validatedResponse,
          message: "All playlist stats retrieved successfully",
        };
      } catch (error) {
        console.error(`[RL Stats] Error in getAllPlayerStats:`, error);

        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle Zod validation errors
        if (error && typeof error === "object" && "issues" in error) {
          console.error(`[RL Stats] Validation error:`, error);
          return {
            success: false,
            data: null,
            message: "Invalid response format from Rocket League API",
          };
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "An unexpected error occurred while fetching Rocket League stats",
        });
      }
    }),
});
