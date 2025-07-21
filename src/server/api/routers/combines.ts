// src/server/api/routers/combines.ts
// This file contains the combines router for the API.
// It provides endpoints for browsing combines, managing registrations, and dashboard views.
// Similar to tryouts but adapted for combine-specific features like qualification status and invite-only events.

import { z } from "zod";
import { createTRPCRouter, publicProcedure, playerProcedure, onboardedCoachProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";
import type { Prisma } from "@prisma/client";
import { type Combine, type EventType } from "@prisma/client";

// Helper function to extract time from UTC ISO string
// This is needed because frontend sends UTC ISO strings but we store times as strings
const extractTimeFromISO = (isoString?: string) => {
  if (!isoString) return undefined;
  try {
    const date = new Date(isoString);
    return date.toISOString().split('T')[1]?.split('.')[0]; // Extract HH:MM:SS
  } catch {
    // If it's not an ISO string, assume it's already a time string
    return isoString;
  }
};

// Input validation schemas
const combineFiltersSchema = z.object({
  game_id: z.string().uuid().optional(),
  type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
  status: z.enum(["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED"]).optional(),
  year: z.string().optional(),
  invite_only: z.boolean().optional(),
  upcoming_only: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const combineRegistrationSchema = z.object({
  combine_id: z.string().uuid(),
});

const combineRegistrationStatusSchema = z.object({
  registration_id: z.string().uuid(),
  status: z.enum(["PENDING", "CONFIRMED", "WAITLISTED", "DECLINED", "CANCELLED"]),
  qualified: z.boolean().optional(),
});

// Enhanced validation schemas for admin operations
const createCombineSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  long_description: z.string().optional(),
  game_id: z.string().uuid("Invalid game ID"),
  date: z.date(),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]),
  year: z.string().min(1, "Year is required"),
  max_spots: z.number().int().min(1),
  registration_deadline: z.date().optional(),
  min_gpa: z.number().min(0).max(4.0).optional(),
  class_years: z.array(z.string()).default([]),
  required_roles: z.array(z.string()).default([]),
  prize_pool: z.string().default("TBD"),
  status: z.enum(["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED"]).default("UPCOMING"),
  requirements: z.string().default("None specified"),
  invite_only: z.boolean().default(false),
});

const updateCombineSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  long_description: z.string().optional(),
  game_id: z.string().uuid().optional(),
  date: z.date().optional(),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
  year: z.string().optional(),
  max_spots: z.number().int().min(1).optional(),
  registration_deadline: z.date().optional(),
  min_gpa: z.number().min(0).max(4.0).optional(),
  class_years: z.array(z.string()).optional(),
  required_roles: z.array(z.string()).optional(),
  prize_pool: z.string().optional(),
  status: z.enum(["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED"]).optional(),
  requirements: z.string().optional(),
  invite_only: z.boolean().optional(),
});

const searchCombinesSchema = z.object({
  search: z.string().optional(),
  game_id: z.string().uuid().optional(),
  type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
  status: z.enum(["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED"]).optional(),
  year: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const combinesRouter = createTRPCRouter({
  // Browse all available combines with filtering
  browse: publicProcedure
    .input(combineFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          game_id,
          type,
          status,
          year,
          invite_only,
          upcoming_only,
          search,
          limit,
          offset,
        } = input;

        // Build filter conditions
        const where: Prisma.CombineWhereInput = {};

        if (game_id) where.game_id = game_id;
        if (type) where.type = type;
        if (status) where.status = status;
        if (year) where.year = year;
        if (invite_only !== undefined) where.invite_only = invite_only;
        if (upcoming_only) where.date = { gte: new Date() };
        
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ];
        }

        const [combines, total] = await Promise.all([
          withRetry(() =>
            ctx.db.combine.findMany({
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
              orderBy: [
                { date: 'asc' },
                { created_at: 'desc' },
              ],
              skip: offset,
              take: limit,
            })
          ),
          withRetry(() =>
            ctx.db.combine.count({ where })
          ),
        ]);

        return {
          combines,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        console.error('Error browsing combines:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch combines',
        });
      }
    }),

  // Get combines by game
  getByGame: publicProcedure
    .input(z.object({
      game_id: z.string().uuid(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const combines = await withRetry(() =>
          ctx.db.combine.findMany({
            where: {
              game_id: input.game_id,
              date: { gte: new Date() }, // Only upcoming combines
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
            orderBy: { date: 'asc' },
            take: input.limit,
          })
        );

        return combines;
      } catch (error) {
        console.error('Error fetching combines by game:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch combines by game',
        });
      }
    }),

  // Get single combine details
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const isAuthenticated = !!ctx.auth.userId;
        
        const combine = await withRetry(() =>
          ctx.db.combine.findUnique({
            where: { id: input.id },
            include: {
              game: true,
              organizer: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
              // Only include registration details if authenticated
              ...(isAuthenticated && {
                registrations: {
                  select: {
                    id: true,
                    status: true,
                    qualified: true,
                    registered_at: true,
                    player: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                      },
                    },
                  },
                  orderBy: { registered_at: 'asc' },
                },
              }),
            },
          })
        );

        if (!combine) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Combine not found',
          });
        }

        return combine;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error fetching combine:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch combine details',
        });
      }
    }),

  // Get player's combine registrations (for dashboard)
  getPlayerRegistrations: playerProcedure
    .input(z.object({
      status: z.enum(["upcoming", "past", "all"]).default("all"),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { playerId } = ctx;

      try {
        const now = new Date();
        let dateFilter = {};
        
        if (input.status === "upcoming") {
          dateFilter = { date: { gte: now } };
        } else if (input.status === "past") {
          dateFilter = { date: { lt: now } };
        }

        const registrations = await withRetry(() =>
          ctx.db.combineRegistration.findMany({
            where: {
              player_id: playerId,
              combine: dateFilter,
            },
            include: {
              combine: {
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
                },
              },
            },
            orderBy: {
              combine: { date: input.status === "past" ? 'desc' : 'asc' },
            },
            take: input.limit,
          })
        );

        return registrations;
      } catch (error) {
        console.error('Error fetching player combine registrations:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch player combine registrations',
        });
      }
    }),

  // Register for a combine
  register: playerProcedure
    .input(combineRegistrationSchema)
    .mutation(async ({ ctx, input }) => {
      const { playerId } = ctx;

      try {
        // Check if combine exists and is open for registration
        const combine = await withRetry(() =>
          ctx.db.combine.findUnique({
            where: { id: input.combine_id },
            select: {
              id: true,
              max_spots: true,
              registered_spots: true,
              date: true,
              status: true,
              invite_only: true,
            },
          })
        );

        if (!combine) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Combine not found',
          });
        }

        const now = new Date();
        
        // Check if combine has already occurred
        if (combine.date < now) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This combine has already occurred',
          });
        }

        // Check if registration is open
        if (combine.status !== 'REGISTRATION_OPEN') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Registration is not currently open for this combine',
          });
        }

        // Check if invite-only
        if (combine.invite_only) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'This is an invitation-only combine',
          });
        }

        // Check if spots available
        if (combine.registered_spots >= combine.max_spots) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Combine is full',
          });
        }

        // Check if already registered
        const existingRegistration = await withRetry(() =>
          ctx.db.combineRegistration.findUnique({
            where: {
              combine_id_player_id: {
                combine_id: input.combine_id,
                player_id: playerId,
              },
            },
          })
        );

        if (existingRegistration) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Already registered for this combine',
          });
        }

        // Create registration and update claimed spots count
        const registration = await withRetry(() =>
          ctx.db.$transaction(async (tx) => {
            const newRegistration = await tx.combineRegistration.create({
              data: {
                combine_id: input.combine_id,
                player_id: playerId,
                status: 'PENDING',
                qualified: false,
              },
              include: {
                combine: {
                  include: {
                    game: true,
                  },
                },
              },
            });

            // Update claimed spots count
            await tx.combine.update({
              where: { id: input.combine_id },
              data: {
                registered_spots: {
                  increment: 1,
                },
              },
            });

            return newRegistration;
          })
        );

        return registration;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error registering for combine:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register for combine',
        });
      }
    }),

  // Cancel registration
  cancelRegistration: playerProcedure
    .input(z.object({ registration_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { playerId } = ctx;

      try {
        // Get registration with combine info
        const registration = await withRetry(() =>
          ctx.db.combineRegistration.findUnique({
            where: { id: input.registration_id },
            include: {
              combine: {
                select: {
                  id: true,
                  date: true,
                  status: true,
                },
              },
            },
          })
        );

        if (!registration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Registration not found',
          });
        }

        // Verify ownership
        if (registration.player_id !== playerId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot cancel another player\'s registration',
          });
        }

        // Check if combine has already occurred
        if (registration.combine.date < new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel registration for past combine',
          });
        }

        // Check if combine is in progress
        if (registration.combine.status === 'IN_PROGRESS') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot cancel registration for combine in progress',
          });
        }

        // Cancel registration and update spot count
        await withRetry(() =>
          ctx.db.$transaction(async (tx) => {
            await tx.combineRegistration.update({
              where: { id: input.registration_id },
              data: { status: 'CANCELLED' },
            });

            // Decrement claimed spots count
            await tx.combine.update({
              where: { id: registration.combine.id },
              data: {
                registered_spots: {
                  decrement: 1,
                },
              },
            });
          })
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error cancelling combine registration:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to cancel combine registration',
        });
      }
    }),

  // Get player's registration status for a specific combine
  getRegistrationStatus: playerProcedure
    .input(z.object({ combine_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { playerId } = ctx;

      try {
        const registration = await withRetry(() =>
          ctx.db.combineRegistration.findUnique({
            where: {
              combine_id_player_id: {
                combine_id: input.combine_id,
                player_id: playerId,
              },
            },
            select: {
              id: true,
              status: true,
              qualified: true,
              registered_at: true,
            },
          })
        );

        return registration;
      } catch (error) {
        console.error('Error fetching combine registration status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch combine registration status',
        });
      }
    }),

  // Coach-only endpoints for managing combines

  // Update combine status (coaches only)
  updateStatus: onboardedCoachProcedure
    .input(z.object({
      combine_id: z.string().uuid(),
      status: z.enum(["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        // Verify coach owns this combine
        const combine = await withRetry(() =>
          ctx.db.combine.findUnique({
            where: { id: input.combine_id },
            select: { coach_id: true },
          })
        );

        if (!combine) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Combine not found',
          });
        }

        if (combine.coach_id !== coachId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot update combine you don\'t organize',
          });
        }

        const updatedCombine = await withRetry(() =>
          ctx.db.combine.update({
            where: { id: input.combine_id },
            data: { status: input.status },
            include: {
              game: true,
              organizer: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          })
        );

        return updatedCombine;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error updating combine status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update combine status',
        });
      }
    }),

  // Update registration status and qualification (admin only)
  updateRegistrationStatus: adminProcedure
    .input(combineRegistrationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get registration to verify it exists
        const registration = await withRetry(() =>
          ctx.db.combineRegistration.findUnique({
            where: { id: input.registration_id },
            include: {
              combine: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          })
        );

        if (!registration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Registration not found',
          });
        }

        const updateData: { status: typeof input.status; qualified?: boolean } = {
          status: input.status,
        };

        if (input.qualified !== undefined) {
          updateData.qualified = input.qualified;
        }

        const updatedRegistration = await withRetry(() =>
          ctx.db.combineRegistration.update({
            where: { id: input.registration_id },
            data: updateData,
            include: {
              player: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          })
        );

        return updatedRegistration;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error updating combine registration status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update combine registration status',
        });
      }
    }),

  // Remove/delete a registration (admin only)
  removeRegistration: adminProcedure
    .input(z.object({
      registration_id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get registration to verify it exists
        const registration = await withRetry(() =>
          ctx.db.combineRegistration.findUnique({
            where: { id: input.registration_id },
            include: {
              combine: {
                select: {
                  id: true,
                  title: true,
                  registered_spots: true,
                },
              },
            },
          })
        );

        if (!registration) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Registration not found',
          });
        }

        // Delete registration and update spot count if necessary
        await withRetry(() =>
          ctx.db.$transaction(async (tx) => {
            // Delete the registration
            await tx.combineRegistration.delete({
              where: { id: input.registration_id },
            });

            // Only decrement spots if the registration was not already cancelled
            if (registration.status !== 'CANCELLED') {
              await tx.combine.update({
                where: { id: registration.combine.id },
                data: {
                  registered_spots: {
                    decrement: 1,
                  },
                },
              });
            }
          })
        );

        return { success: true, registration };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('Error removing registration:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove registration',
        });
      }
    }),

  // Get registration statistics for a combine (admin only)
  getRegistrationStats: adminProcedure
    .input(z.object({ combine_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const stats = await withRetry(() =>
          ctx.db.combineRegistration.groupBy({
            by: ['status'],
            where: {
              combine_id: input.combine_id,
            },
            _count: {
              status: true,
            },
          })
        );

        const statusCounts = stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {} as Record<string, number>);

        const activeRegistrations = (statusCounts.PENDING ?? 0) + 
          (statusCounts.CONFIRMED ?? 0) + 
          (statusCounts.WAITLISTED ?? 0);

        return {
          ...statusCounts,
          activeRegistrations,
          totalRegistrations: stats.reduce((sum, stat) => sum + stat._count.status, 0),
        };
      } catch (error) {
        console.error('Error fetching registration statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch registration statistics',
        });
      }
    }),

  // ===== ADMIN PROCEDURES =====

  // Get all combines with filtering for admin dashboard
  getAllForAdmin: adminProcedure
    .input(searchCombinesSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          search,
          game_id,
          type,
          status,
          year,
          page,
          limit
        } = input;

        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.CombineWhereInput = {};
        
        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { location: { contains: search, mode: 'insensitive' } },
          ];
        }
        
        if (game_id) where.game_id = game_id;
        if (type) where.type = type;
        if (status) where.status = status;
        if (year) where.year = year;

        const [combines, total] = await Promise.all([
          ctx.db.combine.findMany({
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
              registrations: {
                select: {
                  id: true,
                  player: {
                    select: {
                      id: true,
                      first_name: true,
                      last_name: true,
                      username: true,
                    },
                  },
                },
              },
              _count: {
                select: {
                  registrations: true,
                },
              },
            },
            orderBy: {
              date: 'desc',
            },
            skip,
            take: limit,
          }),
          ctx.db.combine.count({ where }),
        ]);

        return {
          combines,
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
        };
      } catch (error) {
        console.error('Error fetching combines for admin:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch combines',
        });
      }
    }),

  // Helper function to extract time from UTC ISO string
  // This is needed because frontend sends UTC ISO strings but we store times as strings
  

  // Create a new combine (admin only)
  create: adminProcedure
    .input(createCombineSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the game exists
        const game = await ctx.db.game.findUnique({
          where: { id: input.game_id },
          select: { id: true, name: true },
        });

        if (!game) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Game not found',
          });
        }

        // Validate registration deadline is before combine date
        if (input.registration_deadline && input.registration_deadline >= input.date) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Registration deadline must be before the combine date',
          });
        }



        const combine = await ctx.db.combine.create({
          data: {
            title: input.title,
            description: input.description,
            long_description: input.long_description,
            game_id: input.game_id,
            coach_id: null,
            date: input.date,
            time_start: extractTimeFromISO(input.time_start),
            time_end: extractTimeFromISO(input.time_end),
            location: input.location,
            type: input.type as EventType,
            year: input.year,
            max_spots: input.max_spots,
            registered_spots: 0,
            registration_deadline: input.registration_deadline,
            min_gpa: input.min_gpa,
            class_years: input.class_years,
            required_roles: input.required_roles,
            prize_pool: input.prize_pool,
            status: input.status,
            requirements: input.requirements,
            invite_only: input.invite_only,
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
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        });

        return combine;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error creating combine:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create combine',
        });
      }
    }),

  // Update an existing combine (admin only)
  update: adminProcedure
    .input(updateCombineSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Check if combine exists
        const existingCombine = await ctx.db.combine.findUnique({
          where: { id },
          select: { id: true, date: true },
        });

        if (!existingCombine) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Combine not found',
          });
        }

        // If game_id is being updated, verify the new game exists
        if (updateData.game_id) {
          const game = await ctx.db.game.findUnique({
            where: { id: updateData.game_id },
            select: { id: true },
          });

          if (!game) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Game not found',
            });
          }
        }

        // Validate registration deadline vs combine date
        const combineDate = updateData.date ?? existingCombine.date;
        if (updateData.registration_deadline && updateData.registration_deadline >= combineDate) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Registration deadline must be before the combine date',
          });
        }

        // Process time fields if they're being updated
        const processedUpdateData = { ...updateData };
        if (updateData.time_start) {
          processedUpdateData.time_start = extractTimeFromISO(updateData.time_start);
        }
        if (updateData.time_end) {
          processedUpdateData.time_end = extractTimeFromISO(updateData.time_end);
        }

        const combine = await ctx.db.combine.update({
          where: { id },
          data: processedUpdateData,
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
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        });

        return combine;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating combine:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update combine',
        });
      }
    }),

  // Delete a combine (admin only)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if combine exists and get registration count
        const combine = await ctx.db.combine.findUnique({
          where: { id: input.id },
          include: {
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        });

        if (!combine) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Combine not found',
          });
        }

        // Check if there are any registrations
        if (combine._count.registrations > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Cannot delete combine with ${combine._count.registrations} existing registrations. Please remove registrations first.`,
          });
        }

        await ctx.db.combine.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting combine:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete combine',
        });
      }
    }),

  // Get upcoming combines for homepage (lightweight)
  getUpcomingForHomepage: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(10).default(3),
    }))
    .query(async ({ ctx, input }) => {
      try {
        const combines = await withRetry(() =>
          ctx.db.combine.findMany({
            where: {
              date: { gte: new Date() }, // Only upcoming
              status: { in: ['REGISTRATION_OPEN', 'UPCOMING'] }, // Only open or upcoming combines
            },
            select: {
              id: true,
              title: true,
              date: true,
              time_start: true,
              time_end: true,
              max_spots: true,
              registered_spots: true,
              prize_pool: true,
              status: true,
              game: {
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                },
              },
            },
            orderBy: { date: 'asc' },
            take: input.limit,
          })
        );

        return combines;
      } catch (error) {
        console.error('Error fetching upcoming combines for homepage:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch upcoming combines',
        });
      }
    }),

  // Get combine details for admin (includes registration details)
  getByIdForAdmin: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const combine = await ctx.db.combine.findUnique({
          where: { id: input.id },
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
            registrations: {
              include: {
                player: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    username: true,
                    email: true,
                    image_url: true,
                    created_at: true,
                  },
                },
              },
              orderBy: {
                registered_at: 'desc',
              },
            },
            _count: {
              select: {
                registrations: true,
              },
            },
          },
        });

        if (!combine) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Combine not found',
          });
        }

        return combine;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching combine details:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch combine details',
        });
      }
    }),

  // Get combines statistics for admin dashboard
  getStatistics: adminProcedure
    .query(async ({ ctx }) => {
      try {
        const [
          totalCombines,
          upcomingCombines,
          totalRegistrations,
          recentRegistrations,
        ] = await Promise.all([
          ctx.db.combine.count(),
          ctx.db.combine.count({ 
            where: { 
              date: { gte: new Date() }
            } 
          }),
          ctx.db.combineRegistration.count(),
          ctx.db.combineRegistration.count({
            where: {
              registered_at: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          }),
        ]);

        return {
          totalCombines,
          upcomingCombines,
          totalRegistrations,
          recentRegistrations,
        };
      } catch (error) {
        console.error('Error fetching combine statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch combine statistics',
        });
      }
    }),
}); 