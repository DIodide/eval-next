// src/server/api/routers/leagueAssociationRequests.ts
// Admin router for managing league organization verification requests

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { type Prisma } from "@prisma/client";
import { logLeagueAssociationApproved, logLeagueAssociationRejected, logAdminAction } from "@/lib/discord-logger";

// Input validation schemas
const approveRequestSchema = z.object({
  requestId: z.string().uuid(),
  adminNotes: z.string().optional(),
});

const rejectRequestSchema = z.object({
  requestId: z.string().uuid(),
  adminNotes: z.string().min(1, "Admin notes are required for rejection"),
});

const searchRequestsSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const leagueAssociationRequestsRouter = createTRPCRouter({
  // Get all league association requests with filtering and pagination
  getRequests: adminProcedure
    .input(searchRequestsSchema)
    .query(async ({ ctx, input }) => {

      try {
        const { status, search, page, limit } = input;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.LeagueAssociationRequestWhereInput = {};
        
        if (status) {
          where.status = status;
        }

        if (search) {
          where.OR = [
            {
              league_organization: {
                OR: [
                  { first_name: { contains: search, mode: 'insensitive' } },
                  { last_name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { username: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
            {
              organization_name: { contains: search, mode: 'insensitive' },
            },
          ];
        }

        const [requests, total] = await Promise.all([
          ctx.db.leagueAssociationRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
              { status: 'asc' }, // PENDING first
              { requested_at: 'desc' },
            ],
            select: {
              id: true,
              status: true,
              requested_at: true,
              request_message: true,
              admin_notes: true,
              reviewed_at: true,
              reviewed_by: true,
              organization_name: true,
              organization_type: true,
              organization_location: true,
              organization_state: true,
              organization_region: true,
              organization_website: true,
              description: true,
              founded_year: true,
              leagues_operated: true,
              games_supported: true,
              verification_documents: true,
              references: true,
              league_organization: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  username: true,
                  image_url: true,
                  created_at: true,
                },
              },
            },
          }),
          ctx.db.leagueAssociationRequest.count({ where }),
        ]);

        return {
          requests,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error('Error fetching league association requests:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch league association requests',
        });
      }
    }),

  // Get pending requests count for dashboard
  getPendingCount: adminProcedure.query(async ({ ctx }) => {

    try {
      const count = await ctx.db.leagueAssociationRequest.count({
        where: { status: 'PENDING' },
      });

      return count;
    } catch (error) {
      console.error('Error fetching pending league requests count:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch pending requests count',
      });
    }
  }),

  // Approve a league association request
  approveRequest: adminProcedure
    .input(approveRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        // Get the request details
        const request = await ctx.db.leagueAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            league_organization: {
              select: { 
                id: true, 
                clerk_id: true, 
                first_name: true, 
                last_name: true, 
                email: true 
              },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League association request not found',
          });
        }

        if (request.status !== 'PENDING') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Request has already been processed',
          });
        }

        // Perform the approval in a transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Update the request status
          const updatedRequest = await tx.leagueAssociationRequest.update({
            where: { id: input.requestId },
            data: {
              status: 'APPROVED',
              reviewed_at: new Date(),
              reviewed_by: userId,
              admin_notes: input.adminNotes,
            },
          });

          // Update the league organization with the request data
          const updatedLeagueOrganization = await tx.leagueOrganization.update({
            where: { id: request.league_organization.id },
            data: {
              organization_name: request.organization_name,
              organization_type: request.organization_type,
              organization_website: request.organization_website,
              organization_location: request.organization_location,
              organization_state: request.organization_state,
              organization_region: request.organization_region,
              description: request.description,
              founded_year: request.founded_year,
              leagues_operated: request.leagues_operated,
              games_supported: request.games_supported,
              updated_at: new Date(),
            },
          });

          return { request: updatedRequest, leagueOrganization: updatedLeagueOrganization };
        });

        // Update Clerk publicMetadata to mark league organization as onboarded
        try {
          const client = await clerkClient();
          await client.users.updateUser(request.league_organization.clerk_id, {
            publicMetadata: {
              onboarded: true,
              userType: 'league',
              organizationId: result.leagueOrganization.id,
              organizationName: result.leagueOrganization.organization_name,
            },
          });
        } catch (clerkError) {
          console.error('Failed to update Clerk metadata:', clerkError);
          // Don't throw error here as the database transaction was successful
        }

        // Log the approval to Discord
        try {
          const adminName = ctx.adminName ?? "Unknown Admin";
          const adminEmail = ctx.adminEmail ?? "Unknown";

          await logLeagueAssociationApproved({
            requestId: input.requestId,
            organizationName: request.organization_name,
            contactName: `${request.league_organization.first_name} ${request.league_organization.last_name}`,
            contactEmail: request.league_organization.email,
            adminName,
            adminNotes: input.adminNotes,
            decision: "approved",
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            timestamp: new Date(),
          });

          // Also log the admin action
          await logAdminAction({
            action: "League Association Request Approved",
            details: `Approved league verification for ${request.league_organization.email} with ${request.organization_name}`,
            targetUserEmail: request.league_organization.email,
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            userName: adminName,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error("Discord notifications failed:", discordError);
          // Don't fail the main operation if Discord logging fails
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error approving league association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve league association request',
        });
      }
    }),

  // Reject a league association request
  rejectRequest: adminProcedure
    .input(rejectRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        const request = await ctx.db.leagueAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            league_organization: {
              select: { first_name: true, last_name: true, email: true },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League association request not found',
          });
        }

        if (request.status !== 'PENDING') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Request has already been processed',
          });
        }

        const updatedRequest = await ctx.db.leagueAssociationRequest.update({
          where: { id: input.requestId },
          data: {
            status: 'REJECTED',
            reviewed_at: new Date(),
            reviewed_by: userId,
            admin_notes: input.adminNotes,
          },
          include: {
            league_organization: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        });

        // Log the rejection to Discord
        try {
          const adminName = ctx.adminName ?? "Unknown Admin";
          const adminEmail = ctx.adminEmail ?? "Unknown";

          await logLeagueAssociationRejected({
            requestId: input.requestId,
            organizationName: request.organization_name,
            contactName: `${updatedRequest.league_organization.first_name} ${updatedRequest.league_organization.last_name}`,
            contactEmail: updatedRequest.league_organization.email,
            adminName,
            adminNotes: input.adminNotes,
            decision: "rejected",
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            timestamp: new Date(),
          });

          // Also log the admin action
          await logAdminAction({
            action: "League Association Request Rejected",
            details: `Rejected league verification for ${updatedRequest.league_organization.email} with ${request.organization_name}. Reason: ${input.adminNotes}`,
            targetUserEmail: updatedRequest.league_organization.email,
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            userName: adminName,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error("Discord notifications failed:", discordError);
          // Don't fail the main operation if Discord logging fails
        }

        return updatedRequest;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error rejecting league association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject league association request',
        });
      }
    }),

  // Get request details by ID
  getRequestById: adminProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {

      try {
        const request = await ctx.db.leagueAssociationRequest.findUnique({
          where: { id: input.requestId },
          select: {
            id: true,
            status: true,
            requested_at: true,
            request_message: true,
            admin_notes: true,
            reviewed_at: true,
            reviewed_by: true,
            organization_name: true,
            organization_type: true,
            organization_location: true,
            organization_state: true,
            organization_region: true,
            organization_website: true,
            description: true,
            founded_year: true,
            leagues_operated: true,
            games_supported: true,
            verification_documents: true,
            references: true,
            league_organization: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                username: true,
                image_url: true,
                created_at: true,
              },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'League association request not found',
          });
        }

        return request;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching league association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch league association request',
        });
      }
    }),
});