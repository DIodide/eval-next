import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";
import type { Prisma } from "@prisma/client";

// Input validation schemas
const directoryFiltersSchema = z.object({
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const schoolFiltersSchema = directoryFiltersSchema.extend({
  type: z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]).optional(),
  state: z.string().optional(),
  region: z.string().optional(),
});

const playerFiltersSchema = directoryFiltersSchema.extend({
  class_year: z.string().optional(),
  school_id: z.string().uuid().optional(),
  main_game_id: z.string().uuid().optional(),
  location: z.string().optional(),
});

const leagueFiltersSchema = directoryFiltersSchema.extend({
  tier: z.enum(["ELITE", "PROFESSIONAL", "COMPETITIVE", "DEVELOPMENTAL"]).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "UPCOMING", "CANCELLED"]).optional(),
  region: z.string().optional(),
  state: z.string().optional(),
});

export const adminDirectoryRouter = createTRPCRouter({
  // Get all schools with filtering and pagination
  getSchools: adminProcedure
    .input(schoolFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { search, type, state, region, limit, offset } = input;

        // Build filter conditions
        const where: Prisma.SchoolWhereInput = {};

        if (type) where.type = type;
        if (state) where.state = { contains: state, mode: 'insensitive' };
        if (region) where.region = { contains: region, mode: 'insensitive' };
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
            { state: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [schools, total] = await Promise.all([
          withRetry(() =>
            ctx.db.school.findMany({
              where,
              select: {
                id: true,
                name: true,
                type: true,
                location: true,
                state: true,
                region: true,
                website: true,
                logo_url: true,
                bio: true,
                created_at: true,
                _count: {
                  select: {
                    coaches: true,
                    players: true,
                    teams: true,
                  },
                },
              },
              orderBy: [
                { name: 'asc' },
              ],
              skip: offset,
              take: limit,
            })
          ),
          withRetry(() =>
            ctx.db.school.count({ where })
          ),
        ]);

        return {
          schools,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        console.error('Error fetching schools:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch schools',
        });
      }
    }),

  // Get all players with filtering and pagination
  getPlayers: adminProcedure
    .input(playerFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { search, class_year, school_id, main_game_id, location, limit, offset } = input;

        // Build filter conditions
        const where: Prisma.PlayerWhereInput = {};

        if (class_year) where.class_year = class_year;
        if (school_id) where.school_id = school_id;
        if (main_game_id) where.main_game_id = main_game_id;
        if (location) where.location = { contains: location, mode: 'insensitive' };
        
        if (search) {
          where.OR = [
            { first_name: { contains: search, mode: 'insensitive' } },
            { last_name: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { school: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [players, total] = await Promise.all([
          withRetry(() =>
            ctx.db.player.findMany({
              where,
              select: {
                id: true,
                first_name: true,
                last_name: true,
                username: true,
                email: true,
                image_url: true,
                location: true,
                school: true,
                class_year: true,
                graduation_date: true,
                bio: true,
                gpa: true,
                intended_major: true,
                guardian_email: true,
                scholastic_contact: true,
                scholastic_contact_email: true,
                extra_curriculars: true,
                academic_bio: true,
                created_at: true,
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
                _count: {
                  select: {
                    game_profiles: true,
                    tryout_registrations: true,
                    combine_registrations: true,
                  },
                },
              },
              orderBy: [
                { created_at: 'desc' },
              ],
              skip: offset,
              take: limit,
            })
          ),
          withRetry(() =>
            ctx.db.player.count({ where })
          ),
        ]);

        return {
          players,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        console.error('Error fetching players:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch players',
        });
      }
    }),

  // Get all leagues with filtering and pagination
  getLeagues: adminProcedure
    .input(leagueFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { search, tier, status, region, state, limit, offset } = input;

        // Build filter conditions
        const where: Prisma.LeagueWhereInput = {};

        if (tier) where.tier = tier;
        if (status) where.status = status;
        if (region) where.region = { contains: region, mode: 'insensitive' };
        if (state) where.state = { contains: state, mode: 'insensitive' };
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { short_name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { region: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [leagues, total] = await Promise.all([
          withRetry(() =>
            ctx.db.league.findMany({
              where,
              select: {
                id: true,
                name: true,
                short_name: true,
                description: true,
                logo_url: true,
                banner_url: true,
                region: true,
                state: true,
                tier: true,
                season: true,
                status: true,
                format: true,
                prize_pool: true,
                founded_year: true,
                created_at: true,
                _count: {
                  select: {
                    schools: true,
                    teams: true,
                    player_participants: true,
                    administrators: true,
                  },
                },
                league_games: {
                  select: {
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
              },
              orderBy: [
                { created_at: 'desc' },
              ],
              skip: offset,
              take: limit,
            })
          ),
          withRetry(() =>
            ctx.db.league.count({ where })
          ),
        ]);

        return {
          leagues,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        console.error('Error fetching leagues:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch leagues',
        });
      }
    }),

  // Get summary statistics for the directory
  getStats: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const [
          totalSchools,
          totalPlayers,
          totalLeagues,
          totalActiveLeagues,
          schoolsByType,
          playersByClassYear,
          leaguesByTier,
        ] = await Promise.all([
          withRetry(() => ctx.db.school.count()),
          withRetry(() => ctx.db.player.count()),
          withRetry(() => ctx.db.league.count()),
          withRetry(() => ctx.db.league.count({ where: { status: 'ACTIVE' } })),
          withRetry(() => 
            ctx.db.school.groupBy({
              by: ['type'],
              _count: { _all: true },
            })
          ),
          withRetry(() => 
            ctx.db.player.groupBy({
              by: ['class_year'],
              _count: { _all: true },
              where: { class_year: { not: null } },
            })
          ),
          withRetry(() => 
            ctx.db.league.groupBy({
              by: ['tier'],
              _count: { _all: true },
            })
          ),
        ]);

        return {
          totals: {
            schools: totalSchools,
            players: totalPlayers,
            leagues: totalLeagues,
            activeLeagues: totalActiveLeagues,
          },
          breakdowns: {
            schoolsByType,
            playersByClassYear,
            leaguesByTier,
          },
        };
      } catch (error) {
        console.error('Error fetching directory stats:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch directory statistics',
        });
      }
    }),
}); 