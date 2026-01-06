// This router is used to get the school profile, tryouts, games, and stats for a school

import { withRetry } from "@/lib/server/db-utils";
import {
  createTRPCRouter,
  onboardedCoachProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Social links validation schema
const socialLinksSchema = z
  .object({
    facebook: z.string().url().optional().or(z.literal("")).nullable(),
    twitter: z.string().url().optional().or(z.literal("")).nullable(),
    instagram: z.string().url().optional().or(z.literal("")).nullable(),
    youtube: z.string().url().optional().or(z.literal("")).nullable(),
    twitch: z.string().url().optional().or(z.literal("")).nullable(),
  })
  .optional()
  .nullable();

// Input validation schema for school information updates
const schoolInfoUpdateSchema = z.object({
  bio: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  logo_url: z.string().url().optional().or(z.literal("")),
  banner_url: z.string().url().optional().or(z.literal("")),
  // Social media
  discord_handle: z.string().max(100).optional().or(z.literal("")),
  social_links: socialLinksSchema,
  // Tuition information
  in_state_tuition: z.string().max(50).optional().or(z.literal("")),
  out_of_state_tuition: z.string().max(50).optional().or(z.literal("")),
  // Academic requirements
  minimum_gpa: z.number().min(0).max(4).optional().nullable(),
  minimum_sat: z.number().int().min(400).max(1600).optional().nullable(),
  minimum_act: z.number().int().min(1).max(36).optional().nullable(),
  // Scholarships
  scholarships_available: z.boolean().optional(),
  // Esports titles (game names)
  esports_titles: z.array(z.string()).optional(),
});

// Input validation schema for announcements
const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(2000),
  type: z
    .enum([
      "GENERAL",
      "TRYOUT",
      "ACHIEVEMENT",
      "FACILITY",
      "SCHOLARSHIP",
      "ALUMNI",
      "EVENT",
      "SEASON_REVIEW",
    ])
    .default("GENERAL"),
  is_pinned: z.boolean().default(false),
});

const updateAnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(2000).optional(),
  type: z
    .enum([
      "GENERAL",
      "TRYOUT",
      "ACHIEVEMENT",
      "FACILITY",
      "SCHOLARSHIP",
      "ALUMNI",
      "EVENT",
      "SEASON_REVIEW",
    ])
    .optional(),
  is_pinned: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

export const schoolProfileRouter = createTRPCRouter({
  /*
  Params: id
  Returns: school profile
  */
  getById: publicProcedure
    .input(
      z.object({
        id: z.string().uuid("Invalid school ID format"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const school = await ctx.db.school.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          slug: true,
          name: true,
          type: true,
          location: true,
          state: true,
          region: true,
          country: true,
          country_iso2: true,
          website: true,
          email: true,
          phone: true,
          bio: true,
          logo_url: true,
          banner_url: true,
          esports_titles: true,
          social_links: true,
          discord_handle: true,
          in_state_tuition: true,
          out_of_state_tuition: true,
          minimum_gpa: true,
          minimum_sat: true,
          minimum_act: true,
          scholarships_available: true,
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
                  date_achieved: "desc",
                },
              },
            },
            orderBy: {
              created_at: "asc",
            },
          },
          tryouts: {
            where: {
              status: "PUBLISHED",
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
              date: "asc",
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
  getDetailsForEdit: onboardedCoachProcedure.query(async ({ ctx }) => {
    const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context

    try {
      const school = await withRetry(() =>
        ctx.db.school.findUnique({
          where: { id: schoolId },
          select: {
            id: true,
            slug: true,
            name: true,
            type: true,
            location: true,
            state: true,
            region: true,
            country: true,
            country_iso2: true,
            website: true,
            email: true,
            phone: true,
            bio: true,
            logo_url: true,
            banner_url: true,
            esports_titles: true,
            social_links: true,
            discord_handle: true,
            in_state_tuition: true,
            out_of_state_tuition: true,
            minimum_gpa: true,
            minimum_sat: true,
            minimum_act: true,
            scholarships_available: true,
            created_at: true,
            updated_at: true,
          },
        }),
      );

      if (!school) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "School not found",
        });
      }

      return school;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch school details",
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
          }),
        );

        if (!coach || coach.school_id !== schoolId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to edit this school",
          });
        }

        // Build update data
        const updateData: Prisma.SchoolUpdateInput = {
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
        if (input.banner_url !== undefined) {
          updateData.banner_url =
            input.banner_url === "" ? null : input.banner_url;
        }
        // Social media fields
        if (input.discord_handle !== undefined) {
          updateData.discord_handle =
            input.discord_handle === "" ? null : input.discord_handle;
        }
        if (input.social_links !== undefined) {
          updateData.social_links = input.social_links ?? Prisma.DbNull;
        }
        // Tuition fields
        if (input.in_state_tuition !== undefined) {
          updateData.in_state_tuition =
            input.in_state_tuition === "" ? null : input.in_state_tuition;
        }
        if (input.out_of_state_tuition !== undefined) {
          updateData.out_of_state_tuition =
            input.out_of_state_tuition === ""
              ? null
              : input.out_of_state_tuition;
        }
        // Academic requirements
        if (input.minimum_gpa !== undefined) {
          updateData.minimum_gpa = input.minimum_gpa;
        }
        if (input.minimum_sat !== undefined) {
          updateData.minimum_sat = input.minimum_sat;
        }
        if (input.minimum_act !== undefined) {
          updateData.minimum_act = input.minimum_act;
        }
        // Scholarships
        if (input.scholarships_available !== undefined) {
          updateData.scholarships_available = input.scholarships_available;
        }
        // Esports titles
        if (input.esports_titles !== undefined) {
          updateData.esports_titles = input.esports_titles;
        }

        const updatedSchool = await withRetry(() =>
          ctx.db.school.update({
            where: { id: schoolId },
            data: updateData,
          }),
        );

        return updatedSchool;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error updating school information:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update school information",
        });
      }
    }),

  // Update school logo
  updateSchoolLogo: onboardedCoachProcedure
    .input(
      z.object({
        logo_url: z
          .string()
          .url("Must be a valid URL")
          .optional()
          .or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context
      const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context

      try {
        // Verify coach has permission to edit this school
        const coach = await withRetry(() =>
          ctx.db.coach.findUnique({
            where: { id: coachId },
            select: { school_id: true },
          }),
        );

        if (!coach || coach.school_id !== schoolId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You do not have permission to update this school's assets",
          });
        }

        // Update the school logo
        const updatedSchool = await withRetry(() =>
          ctx.db.school.update({
            where: { id: schoolId },
            data: {
              logo_url: input.logo_url ?? null,
              updated_at: new Date(),
            },
            select: {
              id: true,
              name: true,
              logo_url: true,
            },
          }),
        );

        return updatedSchool;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error updating school logo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update school logo",
        });
      }
    }),

  // Update school banner
  updateSchoolBanner: onboardedCoachProcedure
    .input(
      z.object({
        banner_url: z
          .string()
          .url("Must be a valid URL")
          .optional()
          .or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context
      const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context

      try {
        // Verify coach has permission to edit this school
        const coach = await withRetry(() =>
          ctx.db.coach.findUnique({
            where: { id: coachId },
            select: { school_id: true },
          }),
        );

        if (!coach || coach.school_id !== schoolId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message:
              "You do not have permission to update this school's assets",
          });
        }

        // Update the school banner
        const updatedSchool = await withRetry(() =>
          ctx.db.school.update({
            where: { id: schoolId },
            data: {
              banner_url: input.banner_url ?? null,
              updated_at: new Date(),
            },
            select: {
              id: true,
              name: true,
              banner_url: true,
            },
          }),
        );

        return updatedSchool;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error updating school banner:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update school banner",
        });
      }
    }),

  /*
  Params: schoolId, filter, gameId, limit, offset
  Returns: list of tryouts for the school
  */
  getTryouts: publicProcedure
    .input(
      z.object({
        schoolId: z.string().uuid("Invalid school ID format"),
        filter: z.enum(["all", "upcoming", "past"]).optional().default("all"),
        gameId: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(10),
        offset: z.number().min(0).optional().default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();

      // Build where clause based on filters
      const where: {
        school_id: string;
        status: "PUBLISHED";
        date?: { gt: Date } | { lte: Date };
        game_id?: string;
      } = {
        school_id: input.schoolId,
        status: "PUBLISHED",
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
            date: input.filter === "past" ? "desc" : "asc",
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
    .input(
      z.object({
        schoolId: z.string().uuid("Invalid school ID format"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const games = await ctx.db.game.findMany({
        where: {
          tryouts: {
            some: {
              school_id: input.schoolId,
              status: "PUBLISHED",
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
          name: "asc",
        },
      });

      return games;
    }),

  /*
  Params: schoolId
  Returns: stats for the school
  */
  getStats: publicProcedure
    .input(
      z.object({
        schoolId: z.string().uuid("Invalid school ID format"),
      }),
    )
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
                  status: "PUBLISHED",
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
            status: "PUBLISHED",
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

  /*
  Params: schoolId, limit, offset, type
  Returns: list of announcements for the school
  */
  getAnnouncements: publicProcedure
    .input(
      z.object({
        schoolId: z.string().uuid("Invalid school ID format"),
        limit: z.number().min(1).max(50).optional().default(10),
        offset: z.number().min(0).optional().default(0),
        type: z
          .enum([
            "GENERAL",
            "TRYOUT",
            "ACHIEVEMENT",
            "FACILITY",
            "SCHOLARSHIP",
            "ALUMNI",
            "EVENT",
            "SEASON_REVIEW",
          ])
          .optional(),
        include_archived: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Build where clause
        const where: Prisma.SchoolAnnouncementWhereInput = {
          school_id: input.schoolId,
          ...(input.include_archived ? {} : { is_archived: false }),
          ...(input.type ? { type: input.type } : {}),
        };

        const [announcements, total] = await Promise.all([
          withRetry(() =>
            ctx.db.schoolAnnouncement.findMany({
              where,
              include: {
                author: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    image_url: true,
                  },
                },
              },
              orderBy: [
                { is_pinned: "desc" }, // Pinned items first
                { created_at: "desc" }, // Then by newest
              ],
              take: input.limit,
              skip: input.offset,
            }),
          ),
          withRetry(() => ctx.db.schoolAnnouncement.count({ where })),
        ]);

        return {
          announcements,
          total,
          hasMore: total > input.offset + input.limit,
        };
      } catch (error) {
        console.error("Error fetching school announcements:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch school announcements",
        });
      }
    }),

  /*
  Params: announcement data
  Returns: created announcement
  */
  createAnnouncement: onboardedCoachProcedure
    .input(createAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context
      const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context

      try {
        const announcement = await withRetry(() =>
          ctx.db.schoolAnnouncement.create({
            data: {
              school_id: schoolId,
              author_id: coachId,
              title: input.title,
              content: input.content,
              type: input.type,
              is_pinned: input.is_pinned,
            },
            include: {
              author: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  image_url: true,
                },
              },
            },
          }),
        );

        return announcement;
      } catch (error) {
        console.error("Error creating school announcement:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create school announcement",
        });
      }
    }),

  /*
  Params: announcement update data
  Returns: updated announcement
  */
  updateAnnouncement: onboardedCoachProcedure
    .input(updateAnnouncementSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context
      const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context

      try {
        // Verify the announcement exists and belongs to this school
        const existingAnnouncement = await withRetry(() =>
          ctx.db.schoolAnnouncement.findUnique({
            where: { id: input.id },
            select: {
              school_id: true,
              author_id: true,
            },
          }),
        );

        if (!existingAnnouncement) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Announcement not found",
          });
        }

        if (existingAnnouncement.school_id !== schoolId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot update announcement from another school",
          });
        }

        // Only the author or another coach from the same school can update
        if (existingAnnouncement.author_id !== coachId) {
          // Allow other coaches from the same school to update
          const coach = await withRetry(() =>
            ctx.db.coach.findUnique({
              where: { id: coachId },
              select: { school_id: true },
            }),
          );

          if (!coach || coach.school_id !== schoolId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cannot update another coach's announcement",
            });
          }
        }

        const { id, ...updateData } = input;
        const announcement = await withRetry(() =>
          ctx.db.schoolAnnouncement.update({
            where: { id },
            data: {
              ...updateData,
              updated_at: new Date(),
            },
            include: {
              author: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  image_url: true,
                },
              },
            },
          }),
        );

        return announcement;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error updating school announcement:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update school announcement",
        });
      }
    }),

  /*
  Params: announcement ID
  Returns: success confirmation
  */
  deleteAnnouncement: onboardedCoachProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context
      const schoolId = ctx.schoolId!; // Available from onboardedCoachProcedure context

      try {
        // Verify the announcement exists and belongs to this school
        const existingAnnouncement = await withRetry(() =>
          ctx.db.schoolAnnouncement.findUnique({
            where: { id: input.id },
            select: {
              school_id: true,
              author_id: true,
            },
          }),
        );

        if (!existingAnnouncement) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Announcement not found",
          });
        }

        if (existingAnnouncement.school_id !== schoolId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot delete announcement from another school",
          });
        }

        // Only the author or another coach from the same school can delete
        if (existingAnnouncement.author_id !== coachId) {
          const coach = await withRetry(() =>
            ctx.db.coach.findUnique({
              where: { id: coachId },
              select: { school_id: true },
            }),
          );

          if (!coach || coach.school_id !== schoolId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Cannot delete another coach's announcement",
            });
          }
        }

        await withRetry(() =>
          ctx.db.schoolAnnouncement.delete({
            where: { id: input.id },
          }),
        );

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error deleting school announcement:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete school announcement",
        });
      }
    }),

  // Public endpoint to search and filter colleges
  searchColleges: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        gameNames: z.array(z.string().min(1)).optional(),
        hasScholarships: z.boolean().optional(),
        inUS: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { search, gameNames, hasScholarships, inUS, limit, offset } =
          input;

        const where: Prisma.SchoolWhereInput = {
          // Only return colleges/universities
          type: {
            in: ["COLLEGE", "UNIVERSITY"],
          },
        };

        // Search filter
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
          ];
        }

        // Game filter - check against provided game names (UI hardcoded list)
        if (gameNames && gameNames.length > 0) {
          where.esports_titles = {
            hasSome: gameNames,
          };
        }

        // Scholarships filter
        if (hasScholarships !== undefined) {
          where.scholarships_available = hasScholarships;
        }

        // In/Out of US filter
        if (inUS !== undefined) {
          if (inUS) {
            where.country_iso2 = "US";
          } else {
            where.country_iso2 = { not: "US" };
          }
        }

        const [schools, total] = await Promise.all([
          withRetry(() =>
            ctx.db.school.findMany({
              where,
              select: {
                id: true,
                slug: true,
                name: true,
                type: true,
                location: true,
                state: true,
                region: true,
                country: true,
                country_iso2: true,
                logo_url: true,
                esports_titles: true,
                scholarships_available: true,
                bio: true,
              },
              orderBy: [{ name: "asc" }],
              skip: offset,
              take: limit,
            }),
          ),
          withRetry(() => ctx.db.school.count({ where })),
        ]);

        return {
          schools,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        console.error("Error searching colleges:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to search colleges",
        });
      }
    }),
});
