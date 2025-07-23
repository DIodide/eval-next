// This file is used to search for players based on the filters provided.

import { z } from "zod";
import { createTRPCRouter, onboardedCoachProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";
import type { Prisma } from "@prisma/client";

// Input validation schemas - using camelCase to match frontend
const playerSearchSchemaPaginated = z.object({
  gameId: z.string().optional(),
  search: z.string().optional(), // Name, username, or school
  location: z.string().optional(), // State or city
  classYear: z.array(z.string()).optional(),
  schoolType: z
    .array(z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]))
    .optional(),
  minGpa: z.number().min(0).max(4.0).optional(),
  maxGpa: z.number().min(0).max(4.0).optional(),
  role: z.string().optional(), // Game role filter
  minCombineScore: z.number().min(0).max(100).optional(),
  maxCombineScore: z.number().min(0).max(100).optional(),
  minLeagueScore: z.number().min(0).max(100).optional(),
  maxLeagueScore: z.number().min(0).max(100).optional(),
  playStyle: z.string().optional(),
  agents: z.array(z.string()).optional(), // For game-specific filtering
  favoritedOnly: z.boolean().optional(),
  favoriteTags: z.array(z.string()).optional(),
  favoriteNotes: z.string().optional(),
  intendedMajor: z.string().optional(),
  sortBy: z
    .enum([
      "name",
      "gpa",
      "combineScore",
      "leagueScore",
      "createdAt",
      "rank",
      "favoritedAt",
    ])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  limit: z.number().min(1).max(100).default(50),
  page: z.number().min(1).default(1), // Page number (1-based)
});

const playerSearchSchemaInfinite = z.object({
  gameId: z.string().optional(),
  search: z.string().optional(), // Name, username, or school
  location: z.string().optional(), // State or city
  classYear: z.array(z.string()).optional(),
  schoolType: z
    .array(z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]))
    .optional(),
  minGpa: z.number().min(0).max(4.0).optional(),
  maxGpa: z.number().min(0).max(4.0).optional(),
  role: z.string().optional(), // Game role filter
  minCombineScore: z.number().min(0).max(100).optional(),
  maxCombineScore: z.number().min(0).max(100).optional(),
  minLeagueScore: z.number().min(0).max(100).optional(),
  maxLeagueScore: z.number().min(0).max(100).optional(),
  playStyle: z.string().optional(),
  agents: z.array(z.string()).optional(), // For game-specific filtering
  favoritedOnly: z.boolean().optional(),
  favoriteTags: z.array(z.string()).optional(),
  favoriteNotes: z.string().optional(),
  intendedMajor: z.string().optional(),
  sortBy: z
    .enum([
      "name",
      "gpa",
      "combineScore",
      "leagueScore",
      "createdAt",
      "rank",
      "favoritedAt",
    ])
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  limit: z.number().min(1).max(100).default(50),
});

// Keep the original schema for backward compatibility
const playerSearchSchema = z.object({
  game_id: z.string().uuid().optional(),
  search: z.string().optional(), // Name, username, or school
  location: z.string().optional(), // State or city
  class_year: z.array(z.string()).optional(),
  school_type: z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]).optional(),
  min_gpa: z.number().min(0).max(4.0).optional(),
  max_gpa: z.number().min(0).max(4.0).optional(),
  role: z.string().optional(), // Game role filter
  min_combine_score: z.number().min(0).max(100).optional(),
  max_combine_score: z.number().min(0).max(100).optional(),
  min_league_score: z.number().min(0).max(100).optional(),
  max_league_score: z.number().min(0).max(100).optional(),
  play_style: z.string().optional(),
  agents: z.array(z.string()).optional(), // For game-specific filtering
  favorited_only: z.boolean().optional(),
  sort_by: z
    .enum(["name", "gpa", "combine_score", "league_score", "created_at"])
    .default("name"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const favoritePlayerSchema = z.object({
  player_id: z.string().uuid(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const unfavoritePlayerSchema = z.object({
  player_id: z.string().uuid(),
});

const updateFavoriteSchema = z.object({
  player_id: z.string().uuid(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// Verification is now handled automatically by onboardedCoachProcedure

export const playerSearchRouter = createTRPCRouter({
  // Search players with filters
  searchPlayers: onboardedCoachProcedure
    .input(playerSearchSchema)
    .query(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

      try {
        // Build where clause for filtering
        const whereClause: Prisma.PlayerWhereInput = {};

        // Text search across name, username, school
        if (input.search) {
          whereClause.OR = [
            { first_name: { contains: input.search, mode: "insensitive" } },
            { last_name: { contains: input.search, mode: "insensitive" } },
            { username: { contains: input.search, mode: "insensitive" } },
            { school: { contains: input.search, mode: "insensitive" } },
          ];
        }

        // Location filter
        if (input.location) {
          whereClause.location = {
            contains: input.location,
            mode: "insensitive",
          };
        }

        // Academic filters
        if (input.class_year && input.class_year.length > 0) {
          whereClause.class_year = { in: input.class_year };
        }

        if (input.min_gpa !== undefined || input.max_gpa !== undefined) {
          whereClause.gpa = {};
          if (input.min_gpa !== undefined) whereClause.gpa.gte = input.min_gpa;
          if (input.max_gpa !== undefined) whereClause.gpa.lte = input.max_gpa;
        }

        // School type filter
        if (input.school_type) {
          whereClause.school_ref = {
            type: input.school_type,
          };
        }

        // Game-specific filters
        if (
          input.game_id ||
          input.role ||
          input.play_style ||
          input.agents ||
          input.min_combine_score !== undefined ||
          input.max_combine_score !== undefined ||
          input.min_league_score !== undefined ||
          input.max_league_score !== undefined
        ) {
          const gameProfileWhere: Prisma.PlayerGameProfileWhereInput = {};

          if (input.game_id) gameProfileWhere.game_id = input.game_id;
          if (input.role)
            gameProfileWhere.role = {
              contains: input.role,
              mode: "insensitive",
            };
          if (input.play_style)
            gameProfileWhere.play_style = {
              contains: input.play_style,
              mode: "insensitive",
            };
          if (input.agents && input.agents.length > 0)
            gameProfileWhere.agents = { hasSome: input.agents };

          // Handle combine score filters
          if (
            input.min_combine_score !== undefined ||
            input.max_combine_score !== undefined
          ) {
            const combineScoreFilter: Prisma.FloatNullableFilter = {};
            if (input.min_combine_score !== undefined)
              combineScoreFilter.gte = input.min_combine_score;
            if (input.max_combine_score !== undefined)
              combineScoreFilter.lte = input.max_combine_score;
            gameProfileWhere.combine_score = combineScoreFilter;
          }

          // Handle league score filters
          if (
            input.min_league_score !== undefined ||
            input.max_league_score !== undefined
          ) {
            const leagueScoreFilter: Prisma.FloatNullableFilter = {};
            if (input.min_league_score !== undefined)
              leagueScoreFilter.gte = input.min_league_score;
            if (input.max_league_score !== undefined)
              leagueScoreFilter.lte = input.max_league_score;
            gameProfileWhere.league_score = leagueScoreFilter;
          }

          whereClause.game_profiles = { some: gameProfileWhere };
        }

        // Favorited only filter
        if (input.favorited_only) {
          whereClause.favorited_by = {
            some: {
              coach_id: coachId,
            },
          };
        }

        // Build order by clause
        let orderBy: Prisma.PlayerOrderByWithRelationInput = {};
        switch (input.sort_by) {
          case "name":
            orderBy = { first_name: input.sort_order };
            break;
          case "gpa":
            orderBy = { gpa: input.sort_order };
            break;
          case "created_at":
            orderBy = { created_at: input.sort_order };
            break;
          case "combine_score":
          case "league_score":
            // For score sorting, we'll handle this differently since it's in related table
            orderBy = { created_at: input.sort_order };
            break;
          default:
            orderBy = { first_name: "asc" };
        }

        const players = await withRetry(() =>
          ctx.db.player.findMany({
            where: whereClause,
            include: {
              school_ref: {
                select: {
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                },
              },
              main_game: {
                select: {
                  name: true,
                  short_name: true,
                  icon: true,
                  color: true,
                },
              },
              game_profiles: {
                where: input.game_id ? { game_id: input.game_id } : undefined,
                include: {
                  game: {
                    select: {
                      name: true,
                      short_name: true,
                      icon: true,
                      color: true,
                    },
                  },
                },
              },
              platform_connections: {
                select: {
                  platform: true,
                  username: true,
                },
              },
              favorited_by: {
                where: {
                  coach_id: coachId,
                },
                select: {
                  id: true,
                  notes: true,
                  tags: true,
                  created_at: true,
                },
              },
            },
            orderBy,
            take: input.limit,
            skip: input.offset,
          }),
        );

        // Get total count for pagination
        const totalCount = await withRetry(() =>
          ctx.db.player.count({
            where: whereClause,
          }),
        );

        return {
          players: players.map((player) => ({
            id: player.id,
            first_name: player.first_name,
            last_name: player.last_name,
            username: player.username,
            email: player.email,
            image_url: player.image_url,
            location: player.location,
            bio: player.bio,
            school: player.school,
            school_ref: player.school_ref,
            class_year: player.class_year,
            graduation_date: player.graduation_date,
            intended_major: player.intended_major,
            gpa: player.gpa,
            main_game: player.main_game,
            game_profiles: player.game_profiles,
            platform_connections: player.platform_connections,
            is_favorited: player.favorited_by.length > 0,
            favorite_info: player.favorited_by[0] ?? null,
            created_at: player.created_at,
          })),
          totalCount,
          hasMore: input.offset + input.limit < totalCount,
        };
      } catch (error) {
        console.error("Error searching players:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search players",
        });
      }
    }),

  // Search players with traditional pagination
  searchPlayersPaginated: onboardedCoachProcedure
    .input(playerSearchSchemaPaginated)
    .query(async ({ ctx, input }) => {
      const coachId = ctx.coachId;
      const { page, limit, ...filters } = input;

      try {
        // Calculate offset for traditional pagination
        const offset = (page - 1) * limit;

        // Build the same where clause as searchPlayersInfinite
        const whereClause: Prisma.PlayerWhereInput = {};

        // Text search
        if (filters.search) {
          whereClause.OR = [
            { first_name: { contains: filters.search, mode: "insensitive" } },
            { last_name: { contains: filters.search, mode: "insensitive" } },
            { username: { contains: filters.search, mode: "insensitive" } },
            { school: { contains: filters.search, mode: "insensitive" } },
          ];
        }

        // Location filter
        if (filters.location) {
          whereClause.location = {
            contains: filters.location,
            mode: "insensitive",
          };
        }

        // Academic filters
        if (filters.classYear && filters.classYear.length > 0) {
          whereClause.class_year = { in: filters.classYear };
        }

        if (filters.minGpa !== undefined || filters.maxGpa !== undefined) {
          whereClause.gpa = {};
          if (filters.minGpa !== undefined)
            whereClause.gpa.gte = filters.minGpa;
          if (filters.maxGpa !== undefined)
            whereClause.gpa.lte = filters.maxGpa;
        }

        // Game-specific filters - combine all into a single condition
        const hasGameFilters =
          Boolean(filters.gameId) ||
          Boolean(filters.role) ||
          Boolean(filters.agents && filters.agents.length > 0) ||
          Boolean(filters.playStyle) ||
          filters.minCombineScore !== undefined ||
          filters.maxCombineScore !== undefined ||
          filters.minLeagueScore !== undefined ||
          filters.maxLeagueScore !== undefined;

        if (hasGameFilters) {
          const gameProfileWhere: Prisma.PlayerGameProfileWhereInput = {};

          // Game ID filter
          if (filters.gameId) {
            gameProfileWhere.game_id = filters.gameId;
          }

          // Role filter
          if (filters.role) {
            gameProfileWhere.role = {
              contains: filters.role,
              mode: "insensitive",
            };
          }

          // Agents filter
          if (filters.agents && filters.agents.length > 0) {
            gameProfileWhere.agents = { hasSome: filters.agents };
          }

          // Play style filter
          if (filters.playStyle) {
            gameProfileWhere.play_style = {
              contains: filters.playStyle,
              mode: "insensitive",
            };
          }

          // Combine score filters
          if (
            filters.minCombineScore !== undefined ||
            filters.maxCombineScore !== undefined
          ) {
            const combineScoreFilter: Prisma.FloatNullableFilter = {};
            if (filters.minCombineScore !== undefined) {
              combineScoreFilter.gte = filters.minCombineScore;
            }
            if (filters.maxCombineScore !== undefined) {
              combineScoreFilter.lte = filters.maxCombineScore;
            }
            gameProfileWhere.combine_score = combineScoreFilter;
          }

          // League score filters
          if (
            filters.minLeagueScore !== undefined ||
            filters.maxLeagueScore !== undefined
          ) {
            const leagueScoreFilter: Prisma.FloatNullableFilter = {};
            if (filters.minLeagueScore !== undefined) {
              leagueScoreFilter.gte = filters.minLeagueScore;
            }
            if (filters.maxLeagueScore !== undefined) {
              leagueScoreFilter.lte = filters.maxLeagueScore;
            }
            gameProfileWhere.league_score = leagueScoreFilter;
          }

          whereClause.game_profiles = {
            some: gameProfileWhere,
          };
        }

        // School type filter
        if (filters.schoolType && filters.schoolType.length > 0) {
          whereClause.school_ref = {
            type: { in: filters.schoolType },
          };
        }

        // Intended major filter
        if (filters.intendedMajor) {
          whereClause.intended_major = {
            contains: filters.intendedMajor,
            mode: "insensitive",
          };
        }

        // Favorited only filter
        if (filters.favoritedOnly) {
          whereClause.favorited_by = {
            some: { coach_id: coachId },
          };
        }

        // Get total count for pagination
        const totalCount = await ctx.db.player.count({
          where: whereClause,
        });

        const totalPages = Math.ceil(totalCount / limit);

        // Map sortBy field to database field
        const getSortField = (sortBy: string) => {
          switch (sortBy) {
            case "name":
              return "first_name";
            case "gpa":
              return "gpa";
            case "createdAt":
              return "created_at";
            case "combineScore":
              return "created_at"; // Fallback since combine_score is in game_profiles
            case "leagueScore":
              return "created_at"; // Fallback since league_score is in game_profiles
            case "rank":
              return "first_name"; // Fallback since rank is in game_profiles and complex to sort
            case "favoritedAt":
              return "created_at"; // Fallback since favorited_at would need join
            default:
              return "first_name";
          }
        };

        // Fetch players for current page
        const items = await withRetry(() =>
          ctx.db.player.findMany({
            where: whereClause,
            skip: offset,
            take: limit,
            orderBy: [
              { [getSortField(filters.sortBy)]: filters.sortOrder },
              { id: "asc" }, // Secondary sort for consistent ordering
            ],
            include: {
              school_ref: {
                select: {
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                },
              },
              main_game: {
                select: {
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
                      name: true,
                      short_name: true,
                      icon: true,
                      color: true,
                    },
                  },
                },
              },
              platform_connections: true,
              favorited_by: {
                where: { coach_id: coachId },
                select: {
                  id: true,
                  notes: true,
                  tags: true,
                  created_at: true,
                },
              },
            },
          }),
        );

        // Transform items to match expected format
        const players = items.map((player) => ({
          id: player.id,
          firstName: player.first_name,
          lastName: player.last_name,
          username: player.username,
          email: player.email,
          imageUrl: player.image_url,
          location: player.location,
          bio: player.bio,
          school: player.school,
          schoolRef: player.school_ref,
          academicInfo: {
            classYear: player.class_year,
            gpa: player.gpa ? parseFloat(player.gpa.toString()) : null,
            graduationDate: player.graduation_date,
            intendedMajor: player.intended_major,
          },
          mainGame: player.main_game,
          gameProfiles: player.game_profiles,
          platformConnections: player.platform_connections,
          isFavorited: player.favorited_by.length > 0,
          favoriteInfo: player.favorited_by[0] ?? null,
          metadata: {
            createdAt: player.created_at,
            updatedAt: player.updated_at,
          },
        }));

        return {
          items: players,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        };
      } catch (error) {
        console.error("Error searching players:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search players",
        });
      }
    }),

  // Search players with infinite scrolling support
  searchPlayersInfinite: onboardedCoachProcedure
    .input(
      playerSearchSchemaInfinite.extend({
        cursor: z.string().optional(), // Cursor for pagination
      }),
    )
    .query(async ({ ctx, input }) => {
      const coachId = ctx.coachId;
      const { cursor, limit, ...filters } = input;

      try {
        // Build the same where clause as searchPlayers
        const whereClause: Prisma.PlayerWhereInput = {};

        // Text search
        if (filters.search) {
          whereClause.OR = [
            { first_name: { contains: filters.search, mode: "insensitive" } },
            { last_name: { contains: filters.search, mode: "insensitive" } },
            { username: { contains: filters.search, mode: "insensitive" } },
            { school: { contains: filters.search, mode: "insensitive" } },
          ];
        }

        // Location filter
        if (filters.location) {
          whereClause.location = {
            contains: filters.location,
            mode: "insensitive",
          };
        }

        // Academic filters
        if (filters.classYear && filters.classYear.length > 0) {
          whereClause.class_year = { in: filters.classYear };
        }

        if (filters.minGpa !== undefined || filters.maxGpa !== undefined) {
          whereClause.gpa = {};
          if (filters.minGpa !== undefined)
            whereClause.gpa.gte = filters.minGpa;
          if (filters.maxGpa !== undefined)
            whereClause.gpa.lte = filters.maxGpa;
        }

        // Game-specific filters (simplified for now)
        if (filters.favoritedOnly) {
          whereClause.favorited_by = {
            some: { coach_id: coachId },
          };
        }

        // Map sortBy field to database field
        const getSortField = (sortBy: string) => {
          switch (sortBy) {
            case "name":
              return "first_name"; // Use first_name for name sorting
            case "gpa":
              return "gpa";
            case "createdAt":
              return "created_at";
            case "combineScore":
              return "created_at"; // Fallback since combine_score is in game_profiles
            case "leagueScore":
              return "created_at"; // Fallback since league_score is in game_profiles
            case "rank":
              return "first_name"; // Fallback since rank is in game_profiles and complex to sort
            case "favoritedAt":
              return "created_at"; // Fallback since favorited_at would need join
            default:
              return "first_name"; // Default fallback
          }
        };

        // Fetch one extra item to determine if there's a next page
        const items = await withRetry(() =>
          ctx.db.player.findMany({
            where: whereClause,
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: [
              { [getSortField(filters.sortBy)]: filters.sortOrder },
              { id: "asc" }, // Secondary sort for stable pagination
            ],
            include: {
              school_ref: {
                select: {
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                },
              },
              main_game: {
                select: {
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
                      name: true,
                      short_name: true,
                      icon: true,
                      color: true,
                    },
                  },
                },
              },
              platform_connections: true,
              favorited_by: {
                where: { coach_id: coachId },
                select: {
                  id: true,
                  notes: true,
                  tags: true,
                  created_at: true,
                },
              },
            },
          }),
        );

        let nextCursor: string | undefined = undefined;
        if (items.length > limit) {
          const nextItem = items.pop();
          nextCursor = nextItem!.id;
        }

        // Transform the data to match expected format
        const players = items.map((player) => ({
          id: player.id,
          firstName: player.first_name,
          lastName: player.last_name,
          username: player.username,
          email: player.email,
          imageUrl: player.image_url,
          location: player.location,
          bio: player.bio,
          school: player.school,
          schoolRef: player.school_ref,
          academicInfo: {
            classYear: player.class_year,
            gpa: player.gpa ? parseFloat(player.gpa.toString()) : null,
            graduationDate: player.graduation_date,
            intendedMajor: player.intended_major,
          },
          mainGame: player.main_game,
          gameProfiles: player.game_profiles.map((profile) => ({
            username: profile.username,
            rank: profile.rank,
            rating: profile.rating,
            role: profile.role,
            agents: profile.agents,
            preferred_maps: profile.preferred_maps,
            play_style: profile.play_style,
            combine_score: profile.combine_score,
            league_score: profile.league_score,
            game: profile.game,
          })),
          platformConnections: player.platform_connections,
          isFavorited: player.favorited_by.length > 0,
          favoriteInfo: player.favorited_by[0] ?? null,
          metadata: {
            createdAt: player.created_at,
            updatedAt: player.updated_at,
          },
        }));

        return {
          items: players,
          nextCursor,
        };
      } catch (error) {
        console.error("Error searching players (infinite):", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search players",
        });
      }
    }),

  // Add player to favorites
  favoritePlayer: onboardedCoachProcedure
    .input(favoritePlayerSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

      try {
        const favorite = await withRetry(() =>
          ctx.db.coachFavorite.upsert({
            where: {
              coach_id_player_id: {
                coach_id: coachId,
                player_id: input.player_id,
              },
            },
            update: {
              notes: input.notes,
              tags: input.tags ?? [],
              updated_at: new Date(),
            },
            create: {
              coach_id: coachId,
              player_id: input.player_id,
              notes: input.notes,
              tags: input.tags ?? [],
            },
            include: {
              player: {
                select: {
                  first_name: true,
                  last_name: true,
                  image_url: true,
                },
              },
            },
          }),
        );

        return { success: true, favorite };
      } catch (error) {
        console.error("Error favoriting player:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to favorite player",
        });
      }
    }),

  // Remove player from favorites
  unfavoritePlayer: onboardedCoachProcedure
    .input(unfavoritePlayerSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

      try {
        await withRetry(() =>
          ctx.db.coachFavorite.delete({
            where: {
              coach_id_player_id: {
                coach_id: coachId,
                player_id: input.player_id,
              },
            },
          }),
        );

        return { success: true };
      } catch (error) {
        console.error("Error unfavoriting player:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unfavorite player",
        });
      }
    }),

  // Update favorite notes/tags
  updateFavorite: onboardedCoachProcedure
    .input(updateFavoriteSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

      try {
        const favorite = await withRetry(() =>
          ctx.db.coachFavorite.update({
            where: {
              coach_id_player_id: {
                coach_id: coachId,
                player_id: input.player_id,
              },
            },
            data: {
              notes: input.notes,
              tags: input.tags,
              updated_at: new Date(),
            },
          }),
        );

        return { success: true, favorite };
      } catch (error) {
        console.error("Error updating favorite:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update favorite",
        });
      }
    }),

  // Get coach's favorites
  getFavorites: onboardedCoachProcedure.query(async ({ ctx }) => {
    const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

    try {
      const favorites = await withRetry(() =>
        ctx.db.coachFavorite.findMany({
          where: {
            coach_id: coachId,
          },
          include: {
            player: {
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
                    short_name: true,
                    icon: true,
                  },
                },
                game_profiles: {
                  include: {
                    game: {
                      select: {
                        name: true,
                        short_name: true,
                        icon: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            updated_at: "desc",
          },
        }),
      );

      return favorites;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch favorites",
      });
    }
  }),

  // Get count of coach's favorited players (for dashboard)
  getFavoritesCount: onboardedCoachProcedure.query(async ({ ctx }) => {
    const coachId = ctx.coachId; // Available from onboardedCoachProcedure context

    try {
      const count = await withRetry(() =>
        ctx.db.coachFavorite.count({
          where: {
            coach_id: coachId,
          },
        }),
      );

      return count;
    } catch (error) {
      console.error("Error fetching favorites count:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch favorites count",
      });
    }
  }),
});
