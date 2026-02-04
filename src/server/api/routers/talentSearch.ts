/**
 * tRPC router for AI-powered talent search
 * Provides semantic search and AI analysis endpoints for coaches
 */

import { z } from "zod";
import {
  createTRPCRouter,
  onboardedCoachProcedure,
  adminProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  searchPlayersBySimilarity,
  upsertPlayerEmbedding,
  refreshAllEmbeddings,
  getEmbeddingCount,
  getMissingEmbeddingCount,
} from "@/lib/server/embeddings";
import {
  generateCompleteAnalysis,
  isGeminiConfigured,
} from "@/lib/server/gemini";
import type {
  TalentSearchResult,
  TalentGameProfile,
  PlayerAnalysis,
  PlayerEmbeddingData,
  CoachContext,
} from "@/types/talent-search";

// Input schemas
const searchInputSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  gameId: z.string().uuid().optional(),
  classYears: z.array(z.string()).optional(),
  schoolTypes: z
    .array(z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]))
    .optional(),
  locations: z.array(z.string()).optional(),
  minGpa: z.number().min(0).max(4.0).optional(),
  maxGpa: z.number().min(0).max(4.0).optional(),
  roles: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).default(50),
  minSimilarity: z.number().min(0).max(1).default(0.3),
});

const analysisInputSchema = z.object({
  playerId: z.string().uuid(),
});

const refreshEmbeddingsInputSchema = z.object({
  onlyMissing: z.boolean().default(true),
  batchSize: z.number().min(1).max(50).default(10),
  batchDelay: z.number().min(100).max(10000).default(1000),
});

export const talentSearchRouter = createTRPCRouter({
  /**
   * Semantic search for players using natural language queries
   * Returns players ranked by similarity to the query
   */
  search: onboardedCoachProcedure
    .input(searchInputSchema)
    .query(async ({ ctx, input }) => {
      // Check if Gemini is configured
      if (!isGeminiConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "AI search is not available. The GOOGLE_GEMINI_API_KEY environment variable is not configured.",
        });
      }

      const coachId = ctx.coachId;

      try {
        // Perform vector similarity search
        const searchResults = await searchPlayersBySimilarity(input.query, {
          gameId: input.gameId,
          classYears: input.classYears,
          schoolTypes: input.schoolTypes,
          locations: input.locations,
          minGpa: input.minGpa,
          maxGpa: input.maxGpa,
          roles: input.roles,
          limit: input.limit,
          minSimilarity: input.minSimilarity,
        });

        if (searchResults.length === 0) {
          return {
            results: [] as TalentSearchResult[],
            totalCount: 0,
            query: input.query,
          };
        }

        // Fetch full player data for the results
        const playerIds = searchResults.map((r) => r.player_id);
        const similarityMap = new Map(
          searchResults.map((r) => [r.player_id, r.similarity]),
        );

        const players = await ctx.db.player.findMany({
          where: {
            id: { in: playerIds },
          },
          include: {
            school_ref: {
              select: {
                id: true,
                name: true,
                type: true,
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
              include: {
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
            favorited_by: {
              where: { coach_id: coachId },
              select: { id: true },
            },
          },
        });

        // Transform and sort by similarity
        const results: TalentSearchResult[] = players
          .map((player) => {
            const similarity = similarityMap.get(player.id) ?? 0;

            const gameProfiles: TalentGameProfile[] = player.game_profiles.map(
              (profile) => ({
                gameId: profile.game.id,
                gameName: profile.game.name,
                gameShortName: profile.game.short_name,
                username: profile.username,
                rank: profile.rank,
                rating: profile.rating,
                role: profile.role,
                agents: profile.agents,
                playStyle: profile.play_style,
                combineScore: profile.combine_score,
                leagueScore: profile.league_score,
              }),
            );

            return {
              id: player.id,
              firstName: player.first_name,
              lastName: player.last_name,
              username: player.username,
              imageUrl: player.image_url,
              location: player.location,
              bio: player.bio,
              school: {
                id: player.school_ref?.id ?? null,
                name: player.school_ref?.name ?? player.school,
                type: player.school_ref?.type ?? null,
                state: player.school_ref?.state ?? null,
              },
              academicInfo: {
                classYear: player.class_year,
                gpa: player.gpa ? parseFloat(player.gpa.toString()) : null,
                graduationDate: player.graduation_date,
                intendedMajor: player.intended_major,
              },
              mainGame: player.main_game
                ? {
                    id: player.main_game.id,
                    name: player.main_game.name,
                    shortName: player.main_game.short_name,
                    icon: player.main_game.icon,
                    color: player.main_game.color,
                  }
                : null,
              gameProfiles,
              similarityScore: similarity,
              isFavorited: player.favorited_by.length > 0,
            };
          })
          .sort((a, b) => b.similarityScore - a.similarityScore);

        return {
          results,
          totalCount: results.length,
          query: input.query,
        };
      } catch (error) {
        console.error("Error in talent search:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to perform talent search",
        });
      }
    }),

  /**
   * Generate AI analysis for a specific player
   * Returns overview, pros, and cons
   */
  getAnalysis: onboardedCoachProcedure
    .input(analysisInputSchema)
    .query(async ({ ctx, input }) => {
      // Check if Gemini is configured
      if (!isGeminiConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "AI analysis is not available. The GOOGLE_GEMINI_API_KEY environment variable is not configured.",
        });
      }

      try {
        // Fetch player data for analysis
        const player = await ctx.db.player.findUnique({
          where: { id: input.playerId },
          include: {
            school_ref: {
              select: {
                name: true,
                type: true,
              },
            },
            main_game: {
              select: {
                name: true,
              },
            },
            game_profiles: {
              include: {
                game: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        if (!player) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Player not found",
          });
        }

        // Build player data for analysis
        const playerData: PlayerEmbeddingData = {
          id: player.id,
          firstName: player.first_name,
          lastName: player.last_name,
          username: player.username,
          location: player.location,
          bio: player.bio,
          school: player.school_ref?.name ?? player.school,
          schoolType: player.school_ref?.type ?? null,
          classYear: player.class_year,
          gpa: player.gpa ? parseFloat(player.gpa.toString()) : null,
          intendedMajor: player.intended_major,
          mainGame: player.main_game?.name ?? null,
          gameProfiles: player.game_profiles.map((profile) => ({
            game: profile.game.name,
            username: profile.username,
            rank: profile.rank,
            role: profile.role,
            agents: profile.agents,
            playStyle: profile.play_style,
          })),
        };

        // Get coach context for personalized analysis
        const coach = await ctx.db.coach.findUnique({
          where: { id: ctx.coachId },
          include: {
            school_ref: {
              select: {
                name: true,
                type: true,
              },
            },
            teams: {
              include: {
                game: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        });

        const coachContext: CoachContext = {
          schoolName: coach?.school_ref?.name ?? coach?.school ?? null,
          schoolType: coach?.school_ref?.type ?? null,
          games: coach?.teams?.map((t) => t.game.name) ?? [],
        };

        // Generate AI analysis
        const analysis = await generateCompleteAnalysis(playerData, coachContext);

        return analysis;
      } catch (error) {
        console.error("Error generating player analysis:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate player analysis",
        });
      }
    }),

  /**
   * Admin endpoint to refresh embeddings for all players
   */
  refreshEmbeddings: adminProcedure
    .input(refreshEmbeddingsInputSchema)
    .mutation(async ({ input }) => {
      // Check if Gemini is configured
      if (!isGeminiConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message:
            "Embedding generation is not available. The GOOGLE_GEMINI_API_KEY environment variable is not configured.",
        });
      }

      try {
        const result = await refreshAllEmbeddings({
          onlyMissing: input.onlyMissing,
          batchSize: input.batchSize,
          batchDelay: input.batchDelay,
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        console.error("Error refreshing embeddings:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to refresh embeddings",
        });
      }
    }),

  /**
   * Admin endpoint to get embedding statistics
   */
  getEmbeddingStats: adminProcedure.query(async () => {
    try {
      const [embeddingCount, missingCount] = await Promise.all([
        getEmbeddingCount(),
        getMissingEmbeddingCount(),
      ]);

      return {
        totalEmbeddings: embeddingCount,
        missingEmbeddings: missingCount,
        totalPlayers: embeddingCount + missingCount,
        coveragePercent:
          embeddingCount + missingCount > 0
            ? Math.round(
                (embeddingCount / (embeddingCount + missingCount)) * 100,
              )
            : 0,
        isConfigured: isGeminiConfigured(),
      };
    } catch (error) {
      console.error("Error getting embedding stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get embedding statistics",
      });
    }
  }),

  /**
   * Update a single player's embedding (triggered on profile update)
   */
  updatePlayerEmbedding: adminProcedure
    .input(z.object({ playerId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      if (!isGeminiConfigured()) {
        // Silently skip if not configured - don't block profile updates
        return { success: false, reason: "Gemini not configured" };
      }

      try {
        await upsertPlayerEmbedding(input.playerId);
        return { success: true };
      } catch (error) {
        console.error(
          `Error updating embedding for player ${input.playerId}:`,
          error,
        );
        // Don't throw - embedding updates should not block other operations
        return {
          success: false,
          reason: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Check if AI search feature is available
   */
  isAvailable: onboardedCoachProcedure.query(async () => {
    return {
      isAvailable: isGeminiConfigured(),
      message: isGeminiConfigured()
        ? "AI-powered talent search is available"
        : "AI search is not configured. Contact your administrator to enable this feature.",
    };
  }),
});
