import { withRetry } from "@/lib/server/db-utils";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Validation schemas for updates
const updateLeagueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  logo_url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Invalid URL format"),
  banner_url: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === "") return true;
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    }, "Invalid URL format"),
});

const updateSchoolSchema = z.object({
  id: z.string().uuid(),
  bio: z.string().max(2000).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
});

const updatePlayerSchema = z.object({
  id: z.string().uuid(),
  main_game_id: z.string().uuid().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  gpa: z.number().min(0).max(4.0).optional().nullable(),
  class_year: z.string().max(20).optional().nullable(),
  graduation_date: z.string().max(50).optional().nullable(),
  intended_major: z.string().max(200).optional().nullable(),
  guardian_email: z.string().email().optional().nullable().or(z.literal("")),
  scholastic_contact: z.string().max(200).optional().nullable(),
  scholastic_contact_email: z
    .string()
    .email()
    .optional()
    .nullable()
    .or(z.literal("")),
  extra_curriculars: z.string().max(2000).optional().nullable(),
  academic_bio: z.string().max(2000).optional().nullable(),
});

// League-School management schemas
const addSchoolToLeagueSchema = z.object({
  league_id: z.string().uuid(),
  school_id: z.string().uuid(),
  season: z.string().optional(),
});

const removeSchoolFromLeagueSchema = z.object({
  league_school_id: z.string().uuid(),
});

const createSchoolSchema = z.object({
  name: z.string().min(1).max(300),
  type: z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]),
  location: z.string().min(1).max(200),
  state: z.string().max(100).optional().nullable(),
  region: z.string().max(50).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  country_iso2: z.string().length(2).optional().nullable().default("US"),
  website: z.string().url().optional().nullable().or(z.literal("")),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
  esports_titles: z.array(z.string()).optional().default([]),
  scholarships_available: z.boolean().optional().default(false),
  in_state_tuition: z.string().max(50).optional().nullable(),
  out_of_state_tuition: z.string().max(50).optional().nullable(),
  minimum_gpa: z.number().min(0).max(4).optional().nullable(),
  minimum_sat: z.number().int().min(400).max(1600).optional().nullable(),
  minimum_act: z.number().int().min(1).max(36).optional().nullable(),
});

const fullUpdateSchoolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300).optional(),
  type: z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]).optional(),
  location: z.string().min(1).max(200).optional(),
  state: z.string().max(100).optional().nullable(),
  region: z.string().max(50).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  country_iso2: z.string().length(2).optional().nullable(),
  website: z.string().url().optional().nullable().or(z.literal("")),
  email: z.string().email().optional().nullable().or(z.literal("")),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
  esports_titles: z.array(z.string()).optional(),
  scholarships_available: z.boolean().optional(),
  in_state_tuition: z.string().max(50).optional().nullable(),
  out_of_state_tuition: z.string().max(50).optional().nullable(),
  minimum_gpa: z.number().min(0).max(4).optional().nullable(),
  minimum_sat: z.number().int().min(400).max(1600).optional().nullable(),
  minimum_act: z.number().int().min(1).max(36).optional().nullable(),
});

const getLeagueSchoolsSchema = z.object({
  league_id: z.string().uuid(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

const getAvailableSchoolsForLeagueSchema = z.object({
  league_id: z.string().uuid(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const adminManagementRouter = createTRPCRouter({
  // Update league information
  updateLeague: adminProcedure
    .input(updateLeagueSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        console.log("Update League Input:", { id, updateData });

        // Remove empty strings and convert to null for optional fields
        const cleanedData: Record<string, string | null> = {};

        for (const [key, value] of Object.entries(updateData)) {
          if (value === "") {
            cleanedData[key] = null;
          } else if (value !== undefined) {
            cleanedData[key] = value;
          }
        }

        console.log("Cleaned Data for League Update:", cleanedData);

        const updatedLeague = await withRetry(() =>
          ctx.db.league.update({
            where: { id },
            data: cleanedData,
            select: {
              id: true,
              name: true,
              description: true,
              logo_url: true,
              banner_url: true,
              updated_at: true,
            },
          }),
        );

        console.log("Updated League Result:", updatedLeague);

        return updatedLeague;
      } catch (error) {
        console.error("Error updating league:", error);

        // Check if it's a not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update league",
        });
      }
    }),

  // Update school information
  updateSchool: adminProcedure
    .input(updateSchoolSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Remove empty strings and convert to null for optional fields
        const cleanedData: Record<string, string | null> = {};

        for (const [key, value] of Object.entries(updateData)) {
          if (value === "") {
            cleanedData[key] = null;
          } else if (value !== undefined) {
            cleanedData[key] = value;
          }
        }

        const updatedSchool = await withRetry(() =>
          ctx.db.school.update({
            where: { id },
            data: cleanedData,
            select: {
              id: true,
              name: true,
              bio: true,
              website: true,
              email: true,
              phone: true,
              logo_url: true,
              banner_url: true,
              updated_at: true,
            },
          }),
        );

        return updatedSchool;
      } catch (error) {
        console.error("Error updating school:", error);

        // Check if it's a not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "School not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update school",
        });
      }
    }),

  // Update player information
  updatePlayer: adminProcedure
    .input(updatePlayerSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, main_game_id, ...updateData } = input;

        // If main_game_id is provided, validate that the game exists
        if (main_game_id) {
          const game = await withRetry(() =>
            ctx.db.game.findUnique({
              where: { id: main_game_id },
              select: { id: true },
            }),
          );

          if (!game) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Game not found",
            });
          }
        }

        // Remove empty strings and convert to null for optional fields
        const cleanedData = { main_game_id, ...updateData };

        // Convert empty strings to null
        for (const [key, value] of Object.entries(cleanedData)) {
          if (value === "") {
            (cleanedData as Record<string, unknown>)[key] = null;
          }
        }

        const updatedPlayer = await withRetry(() =>
          ctx.db.player.update({
            where: { id },
            data: cleanedData,
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              email: true,
              location: true,
              bio: true,
              gpa: true,
              class_year: true,
              graduation_date: true,
              intended_major: true,
              guardian_email: true,
              scholastic_contact: true,
              scholastic_contact_email: true,
              extra_curriculars: true,
              academic_bio: true,
              main_game_id: true,
              main_game: {
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                  icon: true,
                  color: true,
                },
              },
              updated_at: true,
            },
          }),
        );

        return updatedPlayer;
      } catch (error) {
        console.error("Error updating player:", error);

        // Check if it's a not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Player not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update player",
        });
      }
    }),

  // Get all games for main game selection
  getGames: adminProcedure.query(async ({ ctx }) => {
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

  // Get schools in a specific league
  getLeagueSchools: adminProcedure
    .input(getLeagueSchoolsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { league_id, limit, offset } = input;

        // Verify the league exists
        const league = await withRetry(() =>
          ctx.db.league.findUnique({
            where: { id: league_id },
            select: { id: true, name: true, season: true },
          }),
        );

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        const [leagueSchools, total] = await Promise.all([
          withRetry(() =>
            ctx.db.leagueSchool.findMany({
              where: { league_id },
              include: {
                school: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    location: true,
                    state: true,
                    region: true,
                    logo_url: true,
                    banner_url: true,
                    _count: {
                      select: {
                        players: true,
                        coaches: true,
                        teams: true,
                      },
                    },
                  },
                },
              },
              orderBy: { joined_at: "desc" },
              skip: offset,
              take: limit,
            }),
          ),
          withRetry(() => ctx.db.leagueSchool.count({ where: { league_id } })),
        ]);

        return {
          schools: leagueSchools,
          total,
          hasMore: offset + limit < total,
          league,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching league schools:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch league schools",
        });
      }
    }),

  // Get available schools that can be added to a league
  getAvailableSchoolsForLeague: adminProcedure
    .input(getAvailableSchoolsForLeagueSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { league_id, search, limit, offset } = input;

        // Verify the league exists and get season
        const league = await withRetry(() =>
          ctx.db.league.findUnique({
            where: { id: league_id },
            select: { id: true, season: true },
          }),
        );

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        // Get schools that are NOT already in this league for this season
        const schoolsInLeague = await withRetry(() =>
          ctx.db.leagueSchool.findMany({
            where: {
              league_id,
              season: league.season,
            },
            select: { school_id: true },
          }),
        );

        const excludedSchoolIds = schoolsInLeague.map((ls) => ls.school_id);

        // Build where clause for available schools
        const where: Prisma.SchoolWhereInput = {
          id: {
            notIn: excludedSchoolIds,
          },
        };

        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { state: { contains: search, mode: "insensitive" } },
          ];
        }

        const [availableSchools, total] = await Promise.all([
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
                logo_url: true,
                banner_url: true,
                _count: {
                  select: {
                    players: true,
                    coaches: true,
                    teams: true,
                  },
                },
              },
              orderBy: [{ state: "asc" }, { name: "asc" }],
              skip: offset,
              take: limit,
            }),
          ),
          withRetry(() => ctx.db.school.count({ where })),
        ]);

        return {
          schools: availableSchools,
          total,
          hasMore: offset + limit < total,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching available schools:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch available schools",
        });
      }
    }),

  // Add a school to a league
  addSchoolToLeague: adminProcedure
    .input(addSchoolToLeagueSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { league_id, school_id, season } = input;

        // Verify the league exists and get default season
        const league = await withRetry(() =>
          ctx.db.league.findUnique({
            where: { id: league_id },
            select: { id: true, name: true, season: true },
          }),
        );

        if (!league) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League not found",
          });
        }

        // Verify the school exists
        const school = await withRetry(() =>
          ctx.db.school.findUnique({
            where: { id: school_id },
            select: { id: true, name: true },
          }),
        );

        if (!school) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "School not found",
          });
        }

        const leagueSeason = season ?? league.season;

        // Check if school is already in the league for this season
        const existingLeagueSchool = await withRetry(() =>
          ctx.db.leagueSchool.findUnique({
            where: {
              league_id_school_id_season: {
                league_id,
                school_id,
                season: leagueSeason,
              },
            },
          }),
        );

        if (existingLeagueSchool) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${school.name} is already part of ${league.name} for the ${leagueSeason} season`,
          });
        }

        // Add the school to the league
        const leagueSchool = await withRetry(() =>
          ctx.db.leagueSchool.create({
            data: {
              league_id,
              school_id,
              season: leagueSeason,
            },
            include: {
              school: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                  logo_url: true,
                },
              },
              league: {
                select: {
                  id: true,
                  name: true,
                  season: true,
                },
              },
            },
          }),
        );

        return {
          success: true,
          message: `${school.name} has been added to ${league.name}`,
          leagueSchool,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error adding school to league:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add school to league",
        });
      }
    }),

  // Remove a school from a league
  removeSchoolFromLeague: adminProcedure
    .input(removeSchoolFromLeagueSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { league_school_id } = input;

        // Verify the league school relationship exists
        const leagueSchool = await withRetry(() =>
          ctx.db.leagueSchool.findUnique({
            where: { id: league_school_id },
            include: {
              school: {
                select: { name: true },
              },
              league: {
                select: { name: true },
              },
            },
          }),
        );

        if (!leagueSchool) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League school relationship not found",
          });
        }

        // Remove the school from the league
        await withRetry(() =>
          ctx.db.leagueSchool.delete({
            where: { id: league_school_id },
          }),
        );

        return {
          success: true,
          message: `${leagueSchool.school.name} has been removed from ${leagueSchool.league.name}`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error removing school from league:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove school from league",
        });
      }
    }),

  // Create a new school
  createSchool: adminProcedure
    .input(createSchoolSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Generate slug from name
        const baseSlug = input.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        // Check for existing slug and make unique if needed
        let slug = baseSlug;
        let counter = 1;
        while (true) {
          const existingSchool = await withRetry(() =>
            ctx.db.school.findUnique({
              where: { slug },
              select: { id: true },
            }),
          );
          if (!existingSchool) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        // Clean empty strings to null
        const cleanedData = {
          name: input.name,
          type: input.type,
          location: input.location,
          slug,
          state: input.state ?? null,
          region: input.region ?? null,
          country: input.country ?? null,
          country_iso2: input.country_iso2 ?? "US",
          website: input.website === "" ? null : (input.website ?? null),
          email: input.email === "" ? null : (input.email ?? null),
          phone: input.phone ?? null,
          bio: input.bio ?? null,
          logo_url: input.logo_url === "" ? null : (input.logo_url ?? null),
          banner_url:
            input.banner_url === "" ? null : (input.banner_url ?? null),
          esports_titles: input.esports_titles ?? [],
          scholarships_available: input.scholarships_available ?? false,
          in_state_tuition: input.in_state_tuition ?? null,
          out_of_state_tuition: input.out_of_state_tuition ?? null,
          minimum_gpa: input.minimum_gpa ?? null,
          minimum_sat: input.minimum_sat ?? null,
          minimum_act: input.minimum_act ?? null,
        };

        const school = await withRetry(() =>
          ctx.db.school.create({
            data: cleanedData,
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
              scholarships_available: true,
              in_state_tuition: true,
              out_of_state_tuition: true,
              minimum_gpa: true,
              minimum_sat: true,
              minimum_act: true,
              created_at: true,
            },
          }),
        );

        return {
          success: true,
          message: `School "${input.name}" has been created successfully`,
          school,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error creating school:", error);

        // Check for unique constraint violation
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "A school with this name, type, and state combination already exists",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create school",
        });
      }
    }),

  // Full update school information (more fields than the basic update)
  fullUpdateSchool: adminProcedure
    .input(fullUpdateSchoolSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        // Clean empty strings to null
        const cleanedData: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(updateData)) {
          if (value === "") {
            cleanedData[key] = null;
          } else if (value !== undefined) {
            cleanedData[key] = value;
          }
        }

        const updatedSchool = await withRetry(() =>
          ctx.db.school.update({
            where: { id },
            data: cleanedData,
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
              scholarships_available: true,
              in_state_tuition: true,
              out_of_state_tuition: true,
              minimum_gpa: true,
              minimum_sat: true,
              minimum_act: true,
              updated_at: true,
            },
          }),
        );

        return {
          success: true,
          message: `School "${updatedSchool.name}" has been updated successfully`,
          school: updatedSchool,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error updating school:", error);

        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "School not found",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update school",
        });
      }
    }),

  // Get a single school by ID with full details
  getSchoolById: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const school = await withRetry(() =>
          ctx.db.school.findUnique({
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
              scholarships_available: true,
              in_state_tuition: true,
              out_of_state_tuition: true,
              minimum_gpa: true,
              minimum_sat: true,
              minimum_act: true,
              created_at: true,
              updated_at: true,
              _count: {
                select: {
                  players: true,
                  coaches: true,
                  teams: true,
                  tryouts: true,
                },
              },
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
        console.error("Error fetching school:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch school",
        });
      }
    }),
});
