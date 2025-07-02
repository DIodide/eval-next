// src/server/api/routers/leagueAdminProfile.ts
// This file contains the league administrator profile router for the API.
// It provides endpoints for managing league administrator profiles, league associations, and onboarding.

import { z } from "zod";
import { createTRPCRouter, publicProcedure, leagueAdminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/db-utils";
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
                region: true,
                state: true,
                tier: true,
                season: true,
                status: true,
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
              proposed_game_ids: input.proposed_game_ids || null,
              proposed_custom_games: input.proposed_custom_games || null,
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
}); 