// This router is used to get the school profile, tryouts, games, and stats for a school

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const schoolProfileRouter = createTRPCRouter({
  /*
  Params: id
  Returns: school profile
  */
  getById: publicProcedure
    .input(z.object({
      id: z.string().uuid("Invalid school ID format"),
    }))
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          type: true,
          location: true,
          state: true,
          region: true,
          website: true,
          created_at: true,
          coaches: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              image_url: true,
              email: true,
              created_at: true,
            },
            orderBy: {
              created_at: 'asc',
            },
          },
          tryouts: {
            where: {
              status: 'PUBLISHED',
            },
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
              organizer: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
              _count: {
                select: {
                  registrations: true,
                },
              },
            },
            orderBy: {
              date: 'asc',
            },
          },
          teams: {
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
              coach: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
          _count: {
            select: {
              players: true,
              coaches: true,
              teams: true,
              tryouts: true,
            },
          },
        },
      });

      if (!school) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "School not found",
        });
      }

      return school;
    }),

  /*
  Params: schoolId, filter, gameId, limit, offset
  Returns: list of tryouts for the school
  */
  getTryouts: publicProcedure
    .input(z.object({
      schoolId: z.string().uuid("Invalid school ID format"),
      filter: z.enum(["all", "upcoming", "past"]).optional().default("all"),
      gameId: z.string().optional(),
      limit: z.number().min(1).max(100).optional().default(10),
      offset: z.number().min(0).optional().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      
      // Build where clause based on filters
      const where: {
        school_id: string;
        status: 'PUBLISHED';
        date?: { gt: Date } | { lte: Date };
        game_id?: string;
      } = {
        school_id: input.schoolId,
        status: 'PUBLISHED',
      };

      // Date filter
      if (input.filter === "upcoming") {
        where.date = { gt: now };
      } else if (input.filter === "past") {
        where.date = { lte: now };
      }

      // Game filter
      if (input.gameId) {
        where.game_id = input.gameId;
      }

      const [tryouts, total] = await Promise.all([
        ctx.db.tryout.findMany({
          where,
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
            school: {
              select: {
                id: true,
                name: true,
                location: true,
                state: true,
                type: true,
              },
            },
            organizer: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
              },
            },
            _count: {
              select: {
                registrations: true,
              },
            },
          },
          orderBy: {
            date: input.filter === "past" ? 'desc' : 'asc',
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.tryout.count({ where }),
      ]);

      return {
        tryouts,
        total,
        hasMore: total > input.offset + input.limit,
      };
    }),

  /*
  Params: schoolId
  Returns: list of games that have tryouts at the school
  */
  getAvailableGames: publicProcedure
    .input(z.object({
      schoolId: z.string().uuid("Invalid school ID format"),
    }))
    .query(async ({ ctx, input }) => {
      const games = await ctx.db.game.findMany({
        where: {
          tryouts: {
            some: {
              school_id: input.schoolId,
              status: 'PUBLISHED',
            },
          },
        },
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
      });

      return games;
    }),

  /*
  Params: schoolId
  Returns: stats for the school
  */
  getStats: publicProcedure
    .input(z.object({
      schoolId: z.string().uuid("Invalid school ID format"),
    }))
    .query(async ({ ctx, input }) => {
      const stats = await ctx.db.school.findUnique({
        where: { id: input.schoolId },
        select: {
          _count: {
            select: {
              players: true,
              coaches: true,
              teams: true,
              tryouts: {
                where: {
                  status: 'PUBLISHED',
                },
              },
            },
          },
        },
      });

      if (!stats) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "School not found",
        });
      }

      // Get additional stats
      const [activeTeams, upcomingTryouts] = await Promise.all([
        ctx.db.team.count({
          where: {
            school_id: input.schoolId,
            active: true,
          },
        }),
        ctx.db.tryout.count({
          where: {
            school_id: input.schoolId,
            status: 'PUBLISHED',
            date: {
              gt: new Date(),
            },
          },
        }),
      ]);

      return {
        totalPlayers: stats._count.players,
        totalCoaches: stats._count.coaches,
        totalTeams: stats._count.teams,
        activeTeams,
        totalTryouts: stats._count.tryouts,
        upcomingTryouts,
      };
    }),
}); 