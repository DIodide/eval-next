// This router is used to get the school profile, tryouts, games, and stats for a school

import { z } from "zod";
import { createTRPCRouter, publicProcedure, onboardedCoachProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/db-utils";

// Input validation schema for school information updates
const schoolInfoUpdateSchema = z.object({
  bio: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
});

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
          email: true,
          phone: true,
          bio: true,
          logo_url: true,
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
              achievements: {
                select: {
                  id: true,
                  title: true,
                  date_achieved: true,
                },
                orderBy: {
                  date_achieved: 'desc',
                },
              },
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

  // Get detailed school information for editing (only for onboarded coaches)
  getDetailsForEdit: onboardedCoachProcedure
    .query(async ({ ctx }) => {
      const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context
      
      try {
        const school = await withRetry(() =>
          ctx.db.school.findUnique({
            where: { id: schoolId },
            select: {
              id: true,
              name: true,
              type: true,
              location: true,
              state: true,
              region: true,
              website: true,
              email: true,
              phone: true,
              bio: true,
              logo_url: true,
              created_at: true,
              updated_at: true,
            },
          })
        );
        
        if (!school) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'School not found',
          });
        }
        
        return school;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch school details',
        });
      }
    }),

  // Update school information (only for onboarded coaches)
  updateInfo: onboardedCoachProcedure
    .input(schoolInfoUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context
      const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context
      
      try {
        // Verify coach has permission to edit this school
        const coach = await withRetry(() =>
          ctx.db.coach.findUnique({
            where: { id: coachId },
            select: { school_id: true },
          })
        );

        if (!coach || coach.school_id !== schoolId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You do not have permission to edit this school',
          });
        }

        // Build update data
        const updateData: {
          bio?: string | null;
          website?: string | null;
          email?: string | null;
          phone?: string | null;
          logo_url?: string | null;
          updated_at: Date;
        } = {
          updated_at: new Date(),
        };
        
        if (input.bio !== undefined) {
          updateData.bio = input.bio === "" ? null : input.bio;
        }
        if (input.website !== undefined) {
          updateData.website = input.website === "" ? null : input.website;
        }
        if (input.email !== undefined) {
          updateData.email = input.email === "" ? null : input.email;
        }
        if (input.phone !== undefined) {
          updateData.phone = input.phone === "" ? null : input.phone;
        }
        if (input.logo_url !== undefined) {
          updateData.logo_url = input.logo_url === "" ? null : input.logo_url;
        }

        const updatedSchool = await withRetry(() =>
          ctx.db.school.update({
            where: { id: schoolId },
            data: updateData,
          })
        );
        
        return updatedSchool;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating school information:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update school information',
        });
      }
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