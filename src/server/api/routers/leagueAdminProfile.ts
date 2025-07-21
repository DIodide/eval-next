// src/server/api/routers/leagueAdminProfile.ts
// This file contains the league administrator profile router for the API.
// It provides endpoints for managing league administrator profiles, league associations, and onboarding.

import { z } from "zod";
import { createTRPCRouter, publicProcedure, leagueAdminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";
import { clerkClient } from "@clerk/nextjs/server";
import { logLeagueAssociationRequest } from "@/lib/discord-logger";
import type { LeagueAssociationRequestData } from "@/lib/discord-logger";

// Define custom game schema
const customGameSchema = z.object({
  name: z.string().min(1, "Game name is required"),
  short_name: z.string().min(1, "Short name is required"),
  icon: z.string().optional().refine((val) => {
    // If no value provided, it's valid (optional)
    if (!val || val.trim() === '') return true;
    // If value provided, validate it's a URL
    try {
      new URL(val);
      return true;
    } catch {
      return false;
    }
  }, "Must be a valid URL if provided"),
  color: z.string().optional(),
});

const leagueAdminProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  title: z.string().optional(),
  
  // League association
  league: z.string().optional(),
  league_id: z.string().uuid().optional(),
});

const leagueProfileSchema = z.object({
  name: z.string().min(1, "League name is required"),
  short_name: z.string().min(1, "Short name is required").max(10, "Short name must be 10 characters or less"),
  description: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  state: z.string().optional(),
  tier: z.enum(["ELITE", "PROFESSIONAL", "COMPETITIVE", "DEVELOPMENTAL"]),
  season: z.string().min(1, "Season is required"),
  format: z.string().optional(),
  prize_pool: z.string().optional(),
  founded_year: z.number().int().min(1900).max(new Date().getFullYear() + 10).optional(),
  status: z.enum(["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"]),
});

const leagueAssociationRequestSchema = z.object({
  // Required fields
  request_message: z.string().min(10, "Request message must be at least 10 characters"),
  
  // For existing league association
  league_id: z.string().uuid().nullish(),
  
  // For new league request
  is_new_league_request: z.boolean().default(false),
  
  // New league proposal fields (required if is_new_league_request is true)
  proposed_league_name: z.string().nullish(),
  proposed_league_short_name: z.string().nullish(),
  proposed_league_description: z.string().nullish(),
  
  // Multi-game support
  proposed_game_ids: z.array(z.string().uuid()).nullish(),
  proposed_custom_games: z.array(customGameSchema).nullish(),
  
  proposed_region: z.string().nullish(),
  proposed_state: z.string().nullish(),
  proposed_tier: z.enum(["ELITE", "PROFESSIONAL", "COMPETITIVE", "DEVELOPMENTAL"]).nullish(),
  proposed_season: z.string().nullish(),
  proposed_format: z.string().nullish(),
  proposed_founded_year: z.number().int().min(1900).max(new Date().getFullYear()).nullish(),
}).refine((data) => {
  // If it's a new league request, require the new league fields
  if (data.is_new_league_request) {
    const hasGames = (data.proposed_game_ids && data.proposed_game_ids.length > 0) ?? 
                     (data.proposed_custom_games && data.proposed_custom_games.length > 0);
    
    return !!(data.proposed_league_name && data.proposed_league_short_name && 
             data.proposed_league_description && hasGames && 
             data.proposed_region && data.proposed_tier);
  }
  // If it's an existing league request, require league_id
  return !!data.league_id;
}, {
  message: "Either league_id (for existing league) or all required new league fields must be provided",
});

export const leagueAdminProfileRouter = createTRPCRouter({
  // Get league administrator profile
  getProfile: leagueAdminProcedure.query(async ({ ctx }) => {
    const leagueAdminId = ctx.leagueAdminId;

    try {
      const leagueAdmin = await withRetry(() =>
        ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          include: {
            league_ref: {
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
                league_games: {
                  include: {
                    game: {
                      select: {
                        id: true,
                        name: true,
                        short_name: true,
                        color: true,
                      },
                    },
                  },
                },
              },
            },
            association_requests: {
              select: {
                id: true,
                status: true,
                created_at: true,
                request_message: true,
                admin_notes: true,
                is_new_league_request: true,
                proposed_league_name: true,
              },
              orderBy: { created_at: 'desc' },
              take: 5,
            },
          },
        })
      );

      if (!leagueAdmin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League administrator profile not found',
        });
      }

      return leagueAdmin;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error fetching league administrator profile:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch league administrator profile',
      });
    }
  }),

  // Get basic league administrator profile (for public display)
  getBasicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const leagueAdmin = await withRetry(() =>
          ctx.db.leagueAdministrator.findUnique({
            where: { username: input.username },
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true,
              image_url: true,
              league: true,
              title: true,
              created_at: true,
              league_ref: {
                select: {
                  id: true,
                  name: true,
                  short_name: true,
                  description: true,
                  region: true,
                  state: true,
                  tier: true,
                  season: true,
                  status: true,
                  league_games: {
                    include: {
                      game: {
                        select: {
                          name: true,
                          short_name: true,
                          color: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          })
        );

        if (!leagueAdmin) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League administrator not found',
          });
        }

        return leagueAdmin;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching basic league administrator profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch league administrator profile',
        });
      }
    }),

  // Get league administrator onboarding status
  getOnboardingStatus: leagueAdminProcedure.query(async ({ ctx }) => {
    const leagueAdminId = ctx.leagueAdminId;

    try {
      const leagueAdmin = await withRetry(() =>
        ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: {
            league_id: true,
            league: true,
          },
        })
      );

      if (!leagueAdmin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'League administrator not found',
        });
      }

      // Check for pending association requests
      const pendingRequest = await ctx.db.leagueAssociationRequest.findFirst({
        where: {
          administrator_id: leagueAdminId,
          status: 'PENDING',
        },
        select: {
          id: true,
          created_at: true,
          is_new_league_request: true,
        },
      });

      const hasLeagueAssociation = !!leagueAdmin.league_id;
      const hasPendingRequest = !!pendingRequest;
      const canRequestAssociation = !hasLeagueAssociation && !hasPendingRequest;

      return {
        isOnboarded: hasLeagueAssociation,
        hasLeagueAssociation,
        hasPendingRequest,
        canRequestAssociation,
        pendingRequest,
        currentLeague: leagueAdmin.league,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      console.error('Error checking league administrator onboarding status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to check onboarding status',
      });
    }
  }),

  // Update league administrator profile
  updateProfile: leagueAdminProcedure
    .input(leagueAdminProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        const updatedLeagueAdmin = await withRetry(() =>
          ctx.db.leagueAdministrator.update({
            where: { id: leagueAdminId },
            data: {
              ...input,
              updated_at: new Date(),
            },
          })
        );

        return updatedLeagueAdmin;
      } catch (error) {
        console.error('Error updating league administrator profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }
    }),

  // Submit league association request
  submitLeagueAssociationRequest: leagueAdminProcedure
    .input(leagueAssociationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // Get the league administrator information
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            league_id: true,
          },
        });

        if (!leagueAdmin) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League administrator not found',
          });
        }

        // Check if league administrator already has a league association
        if (leagueAdmin.league_id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You already have a league association',
          });
        }

        // Check for existing pending requests
        const existingRequest = await ctx.db.leagueAssociationRequest.findFirst({
          where: {
            administrator_id: leagueAdminId,
            status: 'PENDING',
          },
        });

        if (existingRequest) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You already have a pending league association request',
          });
        }

        // Get league information for logging (if existing league)
        let leagueName = "New League Request";
        let leagueType = "";
        let leagueRegion = "";

        if (!input.is_new_league_request && input.league_id) {
          const league = await ctx.db.league.findUnique({
            where: { id: input.league_id },
            select: {
              name: true,
              tier: true,
              region: true,
            },
          });

          if (!league) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Selected league not found',
            });
          }

          leagueName = league.name;
          leagueType = league.tier.replace("_", " ");
          leagueRegion = league.region;
        } else if (input.is_new_league_request) {
          leagueName = `${input.proposed_league_name} (New League Request)`;
          leagueType = input.proposed_tier?.replace("_", " ") ?? "";
          leagueRegion = input.proposed_region ?? "";
        }

        // Create the association request
        const request = await withRetry(() =>
          ctx.db.leagueAssociationRequest.create({
            data: {
              administrator_id: leagueAdminId,
              league_id: input.is_new_league_request ? null : input.league_id,
              request_message: input.request_message,
              is_new_league_request: input.is_new_league_request,
              proposed_league_name: input.proposed_league_name,
              proposed_league_short_name: input.proposed_league_short_name,
              proposed_league_description: input.proposed_league_description,
              proposed_game_ids: input.proposed_game_ids ?? undefined,
              proposed_custom_games: input.proposed_custom_games ?? undefined,
              proposed_region: input.proposed_region,
              proposed_state: input.proposed_state,
              proposed_tier: input.proposed_tier,
              proposed_season: input.proposed_season,
              proposed_format: input.proposed_format,
              proposed_founded_year: input.proposed_founded_year,
            },
            include: {
              administrator: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              league: {
                select: {
                  name: true,
                  tier: true,
                  region: true,
                  state: true,
                },
              },
            },
          })
        );

        // Get league administrator information for logging
        const adminInfo = request.administrator;

        // Log the league association request to Discord
        try {
          await logLeagueAssociationRequest({
            requestId: request.id,
            adminName: `${adminInfo.first_name} ${adminInfo.last_name}`,
            adminEmail: adminInfo.email,
            leagueName,
            leagueType,
            leagueRegion,
            requestMessage: input.request_message,
            isNewLeagueRequest: input.is_new_league_request,
            userId: ctx.auth.userId,
            userEmail: adminInfo.email,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error("Discord notification failed:", discordError);
          // Don't fail the main operation if Discord logging fails
        }

        return request;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error submitting league association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit league association request',
        });
      }
    }),

  // Update league profile information
  updateLeagueProfile: leagueAdminProcedure
    .input(leagueProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // First, get the league administrator to verify they have a league association
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: {
            league_id: true,
          },
        });

        if (!leagueAdmin?.league_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be associated with a league to update league information',
          });
        }

        // Update the league information
        const updatedLeague = await withRetry(() =>
          ctx.db.league.update({
            where: { id: leagueAdmin.league_id! },
            data: {
              name: input.name,
              short_name: input.short_name,
              description: input.description,
              region: input.region,
              state: input.state,
              tier: input.tier,
              season: input.season,
              format: input.format,
              prize_pool: input.prize_pool,
              founded_year: input.founded_year,
              status: input.status,
              updated_at: new Date(),
            },
            include: {
              league_games: {
                include: {
                  game: {
                    select: {
                      id: true,
                      name: true,
                      short_name: true,
                      color: true,
                    },
                  },
                },
              },
            },
          })
        );

        return updatedLeague;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating league profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update league profile',
        });
      }
    }),

  // Update league logo
  updateLeagueLogo: leagueAdminProcedure
    .input(z.object({
      logo_url: z.string().url("Must be a valid URL").optional().or(z.literal(""))
    }))
    .mutation(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // Get the league administrator to verify they have a league association
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: { league_id: true },
        });

        if (!leagueAdmin?.league_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be associated with a league to update league assets',
          });
        }

        // Update the league logo
        const updatedLeague = await withRetry(() =>
          ctx.db.league.update({
            where: { id: leagueAdmin.league_id! },
            data: {
              logo_url: input.logo_url ?? null,
              updated_at: new Date(),
            },
            select: {
              id: true,
              name: true,
              logo_url: true,
            },
          })
        );

        return updatedLeague;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating league logo:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update league logo',
        });
      }
    }),

  // Update league banner
  updateLeagueBanner: leagueAdminProcedure
    .input(z.object({
      banner_url: z.string().url("Must be a valid URL").optional().or(z.literal(""))
    }))
    .mutation(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // Get the league administrator to verify they have a league association
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: { league_id: true },
        });

        if (!leagueAdmin?.league_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be associated with a league to update league assets',
          });
        }

        // Update the league banner
        const updatedLeague = await withRetry(() =>
          ctx.db.league.update({
            where: { id: leagueAdmin.league_id! },
            data: {
              banner_url: input.banner_url ?? null,
              updated_at: new Date(),
            },
            select: {
              id: true,
              name: true,
              banner_url: true,
            },
          })
        );

        return updatedLeague;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating league banner:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update league banner',
        });
      }
    }),

  // Get league by ID (public endpoint for league profiles)
  getLeagueById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const league = await withRetry(() =>
          ctx.db.league.findUnique({
            where: { id: input.id },
            include: {
              league_games: {
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
              schools: {
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
                },
              },
              teams: {
                include: {
                  team: {
                    select: {
                      id: true,
                      name: true,
                      created_at: true,
                    },
                  },
                },
              },
              administrators: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  username: true,
                  image_url: true,
                  title: true,
                  created_at: true,
                },
                orderBy: {
                  created_at: 'asc', // Show the founder/first admin first
                },
              },
            },
          })
        );

        return league;
      } catch (error) {
        console.error("Error fetching league by ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch league information",
        });
      }
    }),

  // School Management Endpoints

  // Search available schools that aren't already in the league
  searchAvailableSchools: leagueAdminProcedure
    .input(z.object({
      search: z.string().min(1).max(100),
      limit: z.number().min(1).max(50).default(10),
      type: z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]).optional(),
      state: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // Get the league administrator to verify they have a league association
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: { league_id: true },
        });

        if (!leagueAdmin?.league_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be associated with a league to search schools',
          });
        }

        // Get schools that are NOT already in this league
        const where = {
          AND: [
            // Text search conditions
            {
              OR: [
                { name: { contains: input.search, mode: 'insensitive' as const } },
                { location: { contains: input.search, mode: 'insensitive' as const } },
                { state: { contains: input.search, mode: 'insensitive' as const } },
              ],
            },
            // Filter conditions
            ...(input.type ? [{ type: input.type }] : []),
            ...(input.state ? [{ state: { contains: input.state, mode: 'insensitive' as const } }] : []),
            // Exclude schools already in the league
            {
              NOT: {
                league_memberships: {
                  some: {
                    league_id: leagueAdmin.league_id,
                  },
                },
              },
            },
          ],
        };

        const schools = await withRetry(() =>
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
              _count: {
                select: {
                  players: true,
                  coaches: true,
                  teams: true,
                },
              },
            },
            orderBy: [
              { name: 'asc' },
            ],
            take: input.limit,
          })
        );

        return schools;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error searching available schools:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to search schools',
        });
      }
    }),

  // Get schools already in the league
  getLeagueSchools: leagueAdminProcedure
    .query(async ({ ctx }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // Get the league administrator to verify they have a league association
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: { league_id: true },
        });

        if (!leagueAdmin?.league_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be associated with a league to view league schools',
          });
        }

        const leagueSchools = await withRetry(() =>
          ctx.db.leagueSchool.findMany({
            where: {
              league_id: leagueAdmin.league_id!,
            },
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
            orderBy: {
              joined_at: 'asc',
            },
          })
        );

        return leagueSchools;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching league schools:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch league schools',
        });
      }
    }),

  // Add an existing school to the league
  addSchoolToLeague: leagueAdminProcedure
    .input(z.object({
      school_id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // Get the league administrator to verify they have a league association
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: { 
            league_id: true,
            league_ref: {
              select: {
                season: true,
              },
            },
          },
        });

        if (!leagueAdmin?.league_id || !leagueAdmin.league_ref) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be associated with a league to add schools',
          });
        }

        // Verify the school exists
        const school = await ctx.db.school.findUnique({
          where: { id: input.school_id },
          select: { id: true, name: true },
        });

        if (!school) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'School not found',
          });
        }

        // Check if school is already in the league
        const existingLeagueSchool = await ctx.db.leagueSchool.findUnique({
          where: {
            league_id_school_id_season: {
              league_id: leagueAdmin.league_id,
              school_id: input.school_id,
              season: leagueAdmin.league_ref.season || "2024", // Default season if null
            },
          },
        });

        if (existingLeagueSchool) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'School is already part of this league',
          });
        }

        // Add the school to the league
        const leagueSchool = await withRetry(() =>
          ctx.db.leagueSchool.create({
            data: {
              league_id: leagueAdmin.league_id!,
              school_id: input.school_id,
              season: leagueAdmin.league_ref!.season || "2024", // Default season if null
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
            },
          })
        );

        return leagueSchool;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error adding school to league:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add school to league',
        });
      }
    }),

  // Remove a school from the league
  removeSchoolFromLeague: leagueAdminProcedure
    .input(z.object({
      league_school_id: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const leagueAdminId = ctx.leagueAdminId;

      try {
        // Get the league administrator to verify they have a league association
        const leagueAdmin = await ctx.db.leagueAdministrator.findUnique({
          where: { id: leagueAdminId },
          select: { league_id: true },
        });

        if (!leagueAdmin?.league_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You must be associated with a league to remove schools',
          });
        }

        // Verify the league school exists and belongs to this league
        const leagueSchool = await ctx.db.leagueSchool.findUnique({
          where: { id: input.league_school_id },
          select: { 
            id: true, 
            league_id: true,
            school: {
              select: {
                name: true,
              },
            },
          },
        });

        if (!leagueSchool) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League school relationship not found',
          });
        }

        if (leagueSchool.league_id !== leagueAdmin.league_id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only remove schools from your own league',
          });
        }

        // Remove the school from the league
        await withRetry(() =>
          ctx.db.leagueSchool.delete({
            where: { id: input.league_school_id },
          })
        );

        return { 
          success: true, 
          message: `${leagueSchool.school.name} has been removed from the league` 
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error removing school from league:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove school from league',
        });
      }
    }),


}); 