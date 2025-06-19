// src/server/api/routers/combines.ts
// This file contains the combines router for the API.
// It provides endpoints for browsing combines, managing registrations, and dashboard views.
// Similar to tryouts but adapted for combine-specific features like qualification status and invite-only events.

import { z } from "zod";
import { createTRPCRouter, publicProcedure, playerProcedure, onboardedCoachProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/db-utils";
import type { Prisma } from "@prisma/client";

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
              claimed_spots: true,
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
        if (combine.claimed_spots >= combine.max_spots) {
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
                claimed_spots: {
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
                claimed_spots: {
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

  // Create a new combine (coaches only)
  create: onboardedCoachProcedure
    .input(z.object({
      title: z.string().min(5).max(200),
      description: z.string().min(10).max(500),
      long_description: z.string().optional(),
      game_id: z.string().uuid(),
      date: z.date(),
      location: z.string().min(5).max(200),
      type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]),
      year: z.string().min(4).max(4),
      max_spots: z.number().min(1).max(1000),
      prize_pool: z.string().min(1).max(100),
      format: z.string().optional(),
      requirements: z.string().min(10).max(500),
      invite_only: z.boolean().default(false),
      status: z.enum(["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED"]).default("UPCOMING"),
    }))
    .mutation(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        const combine = await withRetry(() =>
          ctx.db.combine.create({
            data: {
              ...input,
              coach_id: coachId,
              claimed_spots: 0,
            },
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

        return combine;
      } catch (error) {
        console.error('Error creating combine:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create combine',
        });
      }
    }),

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

  // Update registration status and qualification (coaches only)
  updateRegistrationStatus: onboardedCoachProcedure
    .input(combineRegistrationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        // Verify coach owns this combine
        const registration = await withRetry(() =>
          ctx.db.combineRegistration.findUnique({
            where: { id: input.registration_id },
            include: {
              combine: {
                select: {
                  coach_id: true,
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

        if (registration.combine.coach_id !== coachId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot update registration for combine you don\'t organize',
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
}); 