// src/server/api/routers/tryouts.ts
// This file contains the tryouts router for the API.
// It provides endpoints for browsing tryouts, managing registrations, and dashboard views.
// It uses the protectedProcedure from the trpc router to ensure that the user is authenticated.

import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  playerProcedure,
  onboardedCoachProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";
import type { Prisma } from "@prisma/client";

// Helper function to extract time from UTC ISO string
// This is needed because frontend sends UTC ISO strings but we store times as strings
const extractTimeFromISO = (isoString?: string) => {
  if (!isoString) return undefined;
  try {
    const date = new Date(isoString);
    return date.toISOString().split("T")[1]?.split(".")[0]; // Extract HH:MM:SS
  } catch {
    // If it's not an ISO string, assume it's already a time string
    return isoString;
  }
};

// Input validation schemas
const tryoutFiltersSchema = z.object({
  game_id: z.string().uuid().optional(),
  school_id: z.string().uuid().optional(),
  type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
  state: z.string().optional(),
  free_only: z.boolean().optional(),
  upcoming_only: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

const registrationSchema = z.object({
  tryout_id: z.string().uuid(),
  notes: z.string().optional(),
});

const registrationStatusSchema = z.object({
  registration_id: z.string().uuid(),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "WAITLISTED",
    "DECLINED",
    "CANCELLED",
  ]),
});

export const tryoutsRouter = createTRPCRouter({
  // Browse all available tryouts with filtering
  browse: publicProcedure
    .input(tryoutFiltersSchema)
    .query(async ({ ctx, input }) => {
      try {
        const {
          game_id,
          school_id,
          type,
          state,
          free_only,
          upcoming_only,
          search,
          limit,
          offset,
        } = input;

        // Build filter conditions
        const where: Prisma.TryoutWhereInput = {
          status: "PUBLISHED", // Only show published tryouts to public
        };

        if (game_id) where.game_id = game_id;
        if (school_id) where.school_id = school_id;
        if (type) where.type = type;
        if (state) where.school = { state };
        if (free_only) where.price = "Free";
        if (upcoming_only) where.date = { gte: new Date() };

        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { school: { name: { contains: search, mode: "insensitive" } } },
          ];
        }

        const [tryouts, total] = await Promise.all([
          withRetry(() =>
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
              orderBy: [{ date: "asc" }, { created_at: "desc" }],
              skip: offset,
              take: limit,
            }),
          ),
          withRetry(() => ctx.db.tryout.count({ where })),
        ]);

        return {
          tryouts,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        console.error("Error browsing tryouts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tryouts",
        });
      }
    }),

  // Get tryouts by game
  getByGame: publicProcedure
    .input(
      z.object({
        game_id: z.string().uuid(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const tryouts = await withRetry(() =>
          ctx.db.tryout.findMany({
            where: {
              game_id: input.game_id,
              date: { gte: new Date() }, // Only upcoming tryouts
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
              school: {
                select: {
                  id: true,
                  name: true,
                  location: true,
                  state: true,
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
            orderBy: { date: "asc" },
            take: input.limit,
          }),
        );

        return tryouts;
      } catch (error) {
        console.error("Error fetching tryouts by game:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tryouts by game",
        });
      }
    }),

  // Get single tryout details
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const isAuthenticated = !!ctx.auth.userId;

        const tryout = await withRetry(() =>
          ctx.db.tryout.findUnique({
            where: { id: input.id },
            include: {
              game: true,
              school: true,
              organizer: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: isAuthenticated, // Only include email if authenticated
                },
              },
              // Only include registration details if authenticated
              ...(isAuthenticated && {
                registrations: {
                  select: {
                    id: true,
                    status: true,
                    registered_at: true,
                    player: {
                      select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                      },
                    },
                  },
                  orderBy: { registered_at: "asc" },
                },
              }),
            },
          }),
        );

        if (!tryout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tryout not found",
          });
        }

        return tryout;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching tryout:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tryout details",
        });
      }
    }),

  // Get player's tryout registrations (for dashboard)
  getPlayerRegistrations: playerProcedure
    .input(
      z.object({
        status: z.enum(["upcoming", "past", "all"]).default("all"),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
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
          ctx.db.tryoutRegistration.findMany({
            where: {
              player_id: playerId,
              tryout: dateFilter,
            },
            include: {
              tryout: {
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
              tryout: { date: input.status === "past" ? "desc" : "asc" },
            },
            take: input.limit,
          }),
        );

        return registrations;
      } catch (error) {
        console.error("Error fetching player registrations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch player registrations",
        });
      }
    }),

  // Register for a tryout
  register: playerProcedure
    .input(registrationSchema)
    .mutation(async ({ ctx, input }) => {
      const { playerId } = ctx;

      try {
        // Check if tryout exists and is still open
        const tryout = await withRetry(() =>
          ctx.db.tryout.findUnique({
            where: { id: input.tryout_id },
            select: {
              id: true,
              max_spots: true,
              registered_spots: true,
              registration_deadline: true,
              date: true,
            },
          }),
        );

        if (!tryout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tryout not found",
          });
        }

        const now = new Date();

        // Check registration deadline
        if (
          tryout.registration_deadline &&
          tryout.registration_deadline < now
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Registration deadline has passed",
          });
        }

        // Check if tryout has already occurred
        if (tryout.date < now) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This tryout has already occurred",
          });
        }

        // Check if spots available
        if (tryout.registered_spots >= tryout.max_spots) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tryout is full",
          });
        }

        // Check if already registered
        const existingRegistration = await withRetry(() =>
          ctx.db.tryoutRegistration.findUnique({
            where: {
              tryout_id_player_id: {
                tryout_id: input.tryout_id,
                player_id: playerId,
              },
            },
          }),
        );

        if (existingRegistration) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Already registered for this tryout",
          });
        }

        // Create registration and update tryout spot count
        const registration = await withRetry(() =>
          ctx.db.$transaction(async (tx) => {
            const newRegistration = await tx.tryoutRegistration.create({
              data: {
                tryout_id: input.tryout_id,
                player_id: playerId,
                notes: input.notes,
                status: "PENDING",
              },
              include: {
                tryout: {
                  include: {
                    game: true,
                    school: true,
                  },
                },
              },
            });

            // Update registered spots count
            await tx.tryout.update({
              where: { id: input.tryout_id },
              data: {
                registered_spots: {
                  increment: 1,
                },
              },
            });

            return newRegistration;
          }),
        );

        return registration;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error registering for tryout:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to register for tryout",
        });
      }
    }),

  // Cancel registration
  cancelRegistration: playerProcedure
    .input(z.object({ registration_id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { playerId } = ctx;

      try {
        // Get registration with tryout info
        const registration = await withRetry(() =>
          ctx.db.tryoutRegistration.findUnique({
            where: { id: input.registration_id },
            include: {
              tryout: {
                select: {
                  id: true,
                  date: true,
                },
              },
            },
          }),
        );

        if (!registration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Registration not found",
          });
        }

        // Verify ownership
        if (registration.player_id !== playerId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot cancel another player's registration",
          });
        }

        // Check if tryout has already occurred
        if (registration.tryout.date < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot cancel registration for past tryout",
          });
        }

        // Cancel registration and update spot count
        await withRetry(() =>
          ctx.db.$transaction(async (tx) => {
            await tx.tryoutRegistration.update({
              where: { id: input.registration_id },
              data: { status: "CANCELLED" },
            });

            // Decrement registered spots count
            await tx.tryout.update({
              where: { id: registration.tryout.id },
              data: {
                registered_spots: {
                  decrement: 1,
                },
              },
            });
          }),
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error cancelling registration:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel registration",
        });
      }
    }),

  // Get player's registration status for a specific tryout
  getRegistrationStatus: playerProcedure
    .input(z.object({ tryout_id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { playerId } = ctx;

      try {
        const registration = await withRetry(() =>
          ctx.db.tryoutRegistration.findUnique({
            where: {
              tryout_id_player_id: {
                tryout_id: input.tryout_id,
                player_id: playerId,
              },
            },
            select: {
              id: true,
              status: true,
              registered_at: true,
              notes: true,
            },
          }),
        );

        return registration;
      } catch (error) {
        console.error("Error fetching registration status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch registration status",
        });
      }
    }),

  // Coach-only endpoints for managing tryouts

  // Create a new tryout (coaches only)
  create: onboardedCoachProcedure
    .input(
      z.object({
        title: z.string().min(5).max(200),
        description: z.string().min(10).max(500),
        long_description: z.string().optional(),
        game_id: z.string().uuid(),
        date: z.date(),
        time_start: z.string().optional(),
        time_end: z.string().optional(),
        location: z.string().min(5).max(200),
        type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]),
        status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
        price: z.string().min(1).max(50),
        max_spots: z.number().min(1).max(1000),
        registration_deadline: z.date().optional(),
        min_gpa: z.number().min(0).max(4.0).optional(),
        class_years: z.array(z.string()).optional(),
        required_roles: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { coachId, schoolId } = ctx;

      if (!schoolId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coach must be associated with a school to create tryouts",
        });
      }

      try {
        const tryout = await withRetry(() =>
          ctx.db.tryout.create({
            data: {
              ...input,
              school_id: schoolId,
              coach_id: coachId,
              registered_spots: 0,
              time_start: extractTimeFromISO(input.time_start),
              time_end: extractTimeFromISO(input.time_end),
            },
            include: {
              game: true,
              school: true,
              organizer: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          }),
        );

        return tryout;
      } catch (error) {
        console.error("Error creating tryout:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create tryout",
        });
      }
    }),

  // Update registration status (coaches only)
  updateRegistrationStatus: onboardedCoachProcedure
    .input(registrationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        // Verify coach owns this tryout
        const registration = await withRetry(() =>
          ctx.db.tryoutRegistration.findUnique({
            where: { id: input.registration_id },
            include: {
              tryout: {
                select: {
                  coach_id: true,
                },
              },
            },
          }),
        );

        if (!registration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Registration not found",
          });
        }

        if (registration.tryout.coach_id !== coachId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot update registration for tryout you don't organize",
          });
        }

        const updatedRegistration = await withRetry(() =>
          ctx.db.tryoutRegistration.update({
            where: { id: input.registration_id },
            data: { status: input.status },
            include: {
              player: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  image_url: true,
                  location: true,
                },
              },
            },
          }),
        );

        return updatedRegistration;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating registration status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update registration status",
        });
      }
    }),

  // Get upcoming tryouts for homepage (lightweight)
  getUpcomingForHomepage: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(3),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const tryouts = await withRetry(() =>
          ctx.db.tryout.findMany({
            where: {
              status: "PUBLISHED",
              date: { gte: new Date() }, // Only upcoming
            },
            select: {
              id: true,
              title: true,
              date: true,
              time_start: true,
              time_end: true,
              max_spots: true,
              registered_spots: true,
              game: {
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                },
              },
              school: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { date: "asc" },
            take: input.limit,
          }),
        );

        return tryouts;
      } catch (error) {
        console.error("Error fetching upcoming tryouts for homepage:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch upcoming tryouts",
        });
      }
    }),

  // Get all games for form dropdowns
  getGames: publicProcedure.query(async ({ ctx }) => {
    try {
      const games = await withRetry(() =>
        ctx.db.game.findMany({
          select: {
            id: true,
            name: true,
            short_name: true,
            icon: true,
            color: true,
          },
          orderBy: { name: "asc" },
        }),
      );

      return games;
    } catch (error) {
      console.error("Error fetching games:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch games",
      });
    }
  }),

  // Get coach's tryouts (coaches only) - includes draft tryouts
  getCoachTryouts: onboardedCoachProcedure
    .input(
      z.object({
        status: z
          .enum(["all", "active", "upcoming", "past", "draft", "published"])
          .default("all"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        const now = new Date();
        let dateFilter = {};
        let statusFilter = {};

        if (input.status === "upcoming") {
          dateFilter = { date: { gte: now } };
        } else if (input.status === "past") {
          dateFilter = { date: { lt: now } };
        } else if (input.status === "active") {
          dateFilter = {
            date: { gte: now },
            registration_deadline: { gte: now },
          };
        } else if (input.status === "draft") {
          statusFilter = { status: "DRAFT" };
        } else if (input.status === "published") {
          statusFilter = { status: "PUBLISHED" };
        }

        const [tryouts, total] = await Promise.all([
          withRetry(() =>
            ctx.db.tryout.findMany({
              where: {
                coach_id: coachId,
                ...dateFilter,
                ...statusFilter,
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
                school: {
                  select: {
                    id: true,
                    name: true,
                    location: true,
                    state: true,
                  },
                },
                _count: {
                  select: {
                    registrations: true,
                  },
                },
                registrations: {
                  select: {
                    status: true,
                  },
                },
              },
              orderBy: [{ date: "asc" }, { created_at: "desc" }],
              skip: input.offset,
              take: input.limit,
            }),
          ),
          withRetry(() =>
            ctx.db.tryout.count({
              where: {
                coach_id: coachId,
                ...dateFilter,
                ...statusFilter,
              },
            }),
          ),
        ]);

        // Calculate status counts for each tryout
        const tryoutsWithCounts = tryouts.map((tryout) => {
          const statusCounts = tryout.registrations.reduce(
            (acc, reg) => {
              acc[reg.status] = (acc[reg.status] ?? 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );

          return {
            ...tryout,
            registrations: undefined, // Remove the registrations array
            pendingCount: statusCounts.PENDING ?? 0,
            acceptedCount: statusCounts.CONFIRMED ?? 0,
            rejectedCount: statusCounts.DECLINED ?? 0,
            waitlistedCount: statusCounts.WAITLISTED ?? 0,
            registeredCount: tryout._count.registrations,
          };
        });

        return {
          tryouts: tryoutsWithCounts,
          total,
          hasMore: input.offset + input.limit < total,
        };
      } catch (error) {
        console.error("Error fetching coach tryouts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch coach tryouts",
        });
      }
    }),

  // Get count of coach's active tryouts (for dashboard)
  getActiveTryoutsCount: onboardedCoachProcedure.query(async ({ ctx }) => {
    const { coachId } = ctx;

    try {
      const now = new Date();

      const count = await withRetry(() =>
        ctx.db.tryout.count({
          where: {
            coach_id: coachId,
            status: "PUBLISHED",
            date: { gte: now },
            OR: [
              { registration_deadline: null },
              { registration_deadline: { gte: now } },
            ],
          },
        }),
      );

      return count;
    } catch (error) {
      console.error("Error fetching active tryouts count:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch active tryouts count",
      });
    }
  }),

  // Get detailed tryout applications for coaches
  getTryoutApplications: onboardedCoachProcedure
    .input(
      z.object({
        tryout_id: z.string().uuid(),
        status: z
          .enum(["all", "pending", "confirmed", "declined", "waitlisted"])
          .default("all"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        // Verify coach owns this tryout
        const tryout = await withRetry(() =>
          ctx.db.tryout.findUnique({
            where: { id: input.tryout_id },
            select: {
              id: true,
              coach_id: true,
              title: true,
              game: {
                select: {
                  name: true,
                },
              },
            },
          }),
        );

        if (!tryout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tryout not found",
          });
        }

        if (tryout.coach_id !== coachId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot access applications for tryout you don't organize",
          });
        }

        const statusFilter =
          input.status === "all"
            ? {}
            : {
                status: input.status.toUpperCase() as
                  | "PENDING"
                  | "CONFIRMED"
                  | "DECLINED"
                  | "WAITLISTED",
              };

        const applications = await withRetry(() =>
          ctx.db.tryoutRegistration.findMany({
            where: {
              tryout_id: input.tryout_id,
              ...statusFilter,
            },
            include: {
              player: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  image_url: true,
                  location: true,
                  bio: true,
                  class_year: true,
                  school: true,
                  gpa: true,
                  game_profiles: {
                    where: {
                      game_id:
                        tryout.game.name === "VALORANT" ? undefined : undefined, // You might want to filter by game
                    },
                    select: {
                      username: true,
                      rank: true,
                      rating: true,
                      role: true,
                      game: {
                        select: {
                          name: true,
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
                },
              },
            },
            orderBy: {
              registered_at: "asc",
            },
          }),
        );

        return {
          tryout: {
            id: tryout.id,
            title: tryout.title,
            game: tryout.game.name,
          },
          applications: applications.map((app) => ({
            id: app.id,
            status: app.status,
            notes: app.notes,
            registered_at: app.registered_at,
            player: {
              id: app.player.id,
              name: `${app.player.first_name} ${app.player.last_name}`,
              email: app.player.email,
              avatar: app.player.image_url,
              location: app.player.location,
              bio: app.player.bio,
              class_year: app.player.class_year,
              school: app.player.school,
              gpa: app.player.gpa,
              game_profiles: app.player.game_profiles,
              platform_connections: app.player.platform_connections,
            },
          })),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching tryout applications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tryout applications",
        });
      }
    }),

  // Remove/delete a registration (coaches only)
  removeRegistration: onboardedCoachProcedure
    .input(
      z.object({
        registration_id: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        // Verify coach owns this tryout
        const registration = await withRetry(() =>
          ctx.db.tryoutRegistration.findUnique({
            where: { id: input.registration_id },
            include: {
              tryout: {
                select: {
                  id: true,
                  coach_id: true,
                },
              },
            },
          }),
        );

        if (!registration) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Registration not found",
          });
        }

        if (registration.tryout.coach_id !== coachId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot remove registration for tryout you don't organize",
          });
        }

        // Delete registration and update spot count
        await withRetry(() =>
          ctx.db.$transaction(async (tx) => {
            await tx.tryoutRegistration.delete({
              where: { id: input.registration_id },
            });

            // Decrement registered spots count
            await tx.tryout.update({
              where: { id: registration.tryout.id },
              data: {
                registered_spots: {
                  decrement: 1,
                },
              },
            });
          }),
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error removing registration:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove registration",
        });
      }
    }),

  // Update a tryout (coaches only) - only for draft tryouts
  update: onboardedCoachProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(5).max(200).optional(),
        description: z.string().min(10).max(500).optional(),
        long_description: z.string().optional(),
        game_id: z.string().uuid().optional(),
        date: z.date().optional(),
        time_start: z.string().optional(),
        time_end: z.string().optional(),
        location: z.string().min(5).max(200).optional(),
        type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]).optional(),
        status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
        price: z.string().min(1).max(50).optional(),
        max_spots: z.number().min(1).max(1000).optional(),
        registration_deadline: z.date().optional(),
        min_gpa: z.number().min(0).max(4.0).optional(),
        class_years: z.array(z.string()).optional(),
        required_roles: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { coachId } = ctx;

      try {
        // Verify coach owns this tryout and it's editable
        const existingTryout = await withRetry(() =>
          ctx.db.tryout.findUnique({
            where: { id: input.id },
            select: {
              id: true,
              coach_id: true,
              status: true,
              date: true,
            },
          }),
        );

        if (!existingTryout) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tryout not found",
          });
        }

        if (existingTryout.coach_id !== coachId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot update tryout you don't organize",
          });
        }

        // Only allow editing of draft tryouts or published tryouts that haven't occurred yet
        const now = new Date();
        if (
          existingTryout.status === "PUBLISHED" &&
          existingTryout.date < now
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot edit tryouts that have already occurred",
          });
        }

        const { id, ...updateData } = input;

        // Process time fields if they're being updated
        const processedUpdateData = { ...updateData };
        if (updateData.time_start) {
          processedUpdateData.time_start = extractTimeFromISO(
            updateData.time_start,
          );
        }
        if (updateData.time_end) {
          processedUpdateData.time_end = extractTimeFromISO(
            updateData.time_end,
          );
        }

        const updatedTryout = await withRetry(() =>
          ctx.db.tryout.update({
            where: { id: input.id },
            data: {
              ...processedUpdateData,
              updated_at: new Date(),
            },
            include: {
              game: true,
              school: true,
              organizer: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                },
              },
            },
          }),
        );

        return updatedTryout;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error updating tryout:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update tryout",
        });
      }
    }),
});
