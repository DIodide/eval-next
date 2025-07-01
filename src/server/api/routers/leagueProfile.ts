// src/server/api/routers/leagueProfile.ts
// League organization profile management

import { z } from "zod";
import { createTRPCRouter, leagueProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logLeagueAssociationRequest } from "@/lib/discord-logger";

// Input validation schemas
const leagueAssociationRequestSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  organizationType: z.enum([
    "PROFESSIONAL_LEAGUE",
    "COLLEGIATE_LEAGUE", 
    "HIGH_SCHOOL_LEAGUE",
    "AMATEUR_LEAGUE",
    "TOURNAMENT_ORGANIZER",
    "ESPORTS_COMPANY",
    "GAMING_ORGANIZATION"
  ]),
  organizationWebsite: z.string().url().optional(),
  organizationLocation: z.string().optional(),
  organizationState: z.string().optional(),
  organizationRegion: z.string().optional(),
  description: z.string().optional(),
  foundedYear: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
  leaguesOperated: z.array(z.string()),
  gamesSupported: z.array(z.string()),
  verificationDocuments: z.array(z.string().url()),
  references: z.string().optional(),
  requestMessage: z.string().optional(),
});

export const leagueProfileRouter = createTRPCRouter({
  // Get league organization profile
  getProfile: leagueProcedure.query(async ({ ctx }) => {
    try {
      const leagueOrganization = await ctx.db.leagueOrganization.findUnique({
        where: { clerk_id: ctx.auth.userId },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          username: true,
          image_url: true,
          organization_name: true,
          organization_website: true,
          organization_location: true,
          organization_state: true,
          organization_region: true,
          organization_type: true,
          description: true,
          founded_year: true,
          leagues_operated: true,
          games_supported: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!leagueOrganization) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "League organization profile not found",
        });
      }

      return leagueOrganization;
    } catch (error) {
      console.error("Error fetching league organization profile:", error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch league organization profile",
      });
    }
  }),

  // Get league organization info including association requests
  getLeagueInfo: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.auth?.userId) {
      return null;
    }

    try {
      const leagueOrganization = await ctx.db.leagueOrganization.findUnique({
        where: { clerk_id: ctx.auth.userId },
        select: {
          id: true,
          organization_name: true,
          organization_type: true,
          association_requests: {
            orderBy: { requested_at: 'desc' },
            take: 1,
            select: {
              id: true,
              status: true,
              organization_name: true,
              organization_type: true,
              organization_location: true,
              organization_state: true,
              organization_region: true,
              requested_at: true,
              admin_notes: true,
            },
          },
        },
      });

      return leagueOrganization;
    } catch (error) {
      console.error("Error fetching league organization info:", error);
      return null;
    }
  }),

  // Submit league association request
  submitAssociationRequest: publicProcedure
    .input(leagueAssociationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth?.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to submit a request",
        });
      }

      try {
        // Get league organization
        const leagueOrganization = await ctx.db.leagueOrganization.findUnique({
          where: { clerk_id: ctx.auth.userId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        });

        if (!leagueOrganization) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League organization profile not found",
          });
        }

        // Check if there's already a pending request
        const existingRequest = await ctx.db.leagueAssociationRequest.findFirst({
          where: {
            league_organization_id: leagueOrganization.id,
            status: 'PENDING',
          },
        });

        if (existingRequest) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "You already have a pending verification request",
          });
        }

        // Create the association request
        const request = await ctx.db.leagueAssociationRequest.create({
          data: {
            league_organization_id: leagueOrganization.id,
            organization_name: input.organizationName,
            organization_type: input.organizationType,
            organization_website: input.organizationWebsite,
            organization_location: input.organizationLocation,
            organization_state: input.organizationState,
            organization_region: input.organizationRegion,
            description: input.description,
            founded_year: input.foundedYear,
            leagues_operated: input.leaguesOperated,
            games_supported: input.gamesSupported,
            verification_documents: input.verificationDocuments,
            references: input.references,
            request_message: input.requestMessage,
          },
        });

        // Log to Discord (if logging is set up for league requests)
        try {
          await logLeagueAssociationRequest({
            requestId: request.id,
            organizationName: input.organizationName,
            organizationType: input.organizationType,
            contactName: `${leagueOrganization.first_name} ${leagueOrganization.last_name}`,
            contactEmail: leagueOrganization.email,
            leaguesOperated: input.leaguesOperated,
            gamesSupported: input.gamesSupported,
            userId: ctx.auth.userId,
            userEmail: leagueOrganization.email,
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
        console.error("Error submitting league association request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit verification request",
        });
      }
    }),

  // Update league organization profile
  updateProfile: leagueProcedure
    .input(z.object({
      organization_name: z.string().min(1).optional(),
      organization_website: z.string().url().optional(),
      organization_location: z.string().optional(),
      organization_state: z.string().optional(),
      organization_region: z.string().optional(),
      description: z.string().optional(),
      founded_year: z.number().int().min(1900).max(new Date().getFullYear()).optional(),
      leagues_operated: z.array(z.string()).optional(),
      games_supported: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedLeagueOrganization = await ctx.db.leagueOrganization.update({
          where: { clerk_id: ctx.auth.userId },
          data: {
            ...input,
            updated_at: new Date(),
          },
        });

        return updatedLeagueOrganization;
      } catch (error) {
        console.error("Error updating league organization profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),
});