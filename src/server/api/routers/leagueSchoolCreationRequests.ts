// src/server/api/routers/leagueSchoolCreationRequests.ts
// Admin router for managing league school creation requests

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

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
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const leagueSchoolCreationRequestsRouter = createTRPCRouter({
  // Get all league school creation requests with filtering and pagination
  getRequests: adminProcedure
    .input(searchRequestsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const { status, search, page, limit } = input;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.LeagueSchoolCreationRequestWhereInput = {};

        if (status) {
          where.status = status;
        }

        if (search) {
          where.OR = [
            {
              administrator: {
                OR: [
                  { first_name: { contains: search, mode: "insensitive" } },
                  { last_name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                  { league: { contains: search, mode: "insensitive" } },
                ],
              },
            },
            {
              proposed_school_name: { contains: search, mode: "insensitive" },
            },
            {
              proposed_school_location: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              proposed_school_state: { contains: search, mode: "insensitive" },
            },
          ];
        }

        const [requests, total] = await Promise.all([
          ctx.db.leagueSchoolCreationRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
              { status: "asc" }, // PENDING first
              { requested_at: "desc" },
            ],
            select: {
              id: true,
              status: true,
              requested_at: true,
              request_message: true,
              admin_notes: true,
              reviewed_at: true,
              reviewed_by: true,
              proposed_school_name: true,
              proposed_school_type: true,
              proposed_school_location: true,
              proposed_school_state: true,
              proposed_school_region: true,
              proposed_school_website: true,
              administrator: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  username: true,
                  league: true,
                  image_url: true,
                  created_at: true,
                },
              },
              created_school: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                  region: true,
                },
              },
            },
          }),
          ctx.db.leagueSchoolCreationRequest.count({ where }),
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
        console.error("Error fetching league school creation requests:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch league school creation requests",
        });
      }
    }),

  // Get pending requests count for dashboard
  getPendingCount: adminProcedure.query(async ({ ctx }) => {
    try {
      const count = await ctx.db.leagueSchoolCreationRequest.count({
        where: { status: "PENDING" },
      });

      return count;
    } catch (error) {
      console.error(
        "Error fetching pending league school creation requests count:",
        error,
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending requests count",
      });
    }
  }),

  // Approve a league school creation request
  approveRequest: adminProcedure
    .input(approveRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        // Get the request details
        const request = await ctx.db.leagueSchoolCreationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            administrator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                league: true,
                league_id: true,
              },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League school creation request not found",
          });
        }

        if (request.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Request has already been processed",
          });
        }

        // Perform the approval in a transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Create the new school
          const newSchool = await tx.school.create({
            data: {
              name: request.proposed_school_name,
              type: request.proposed_school_type,
              location: request.proposed_school_location,
              state: request.proposed_school_state,
              region: request.proposed_school_region,
              website: request.proposed_school_website,
            },
          });

          // Automatically associate the school with the league
          if (request.administrator.league_id) {
            // Get the league's season information
            const league = await tx.league.findUnique({
              where: { id: request.administrator.league_id },
              select: { season: true },
            });

            await tx.leagueSchool.create({
              data: {
                league_id: request.administrator.league_id,
                school_id: newSchool.id,
                season: league?.season ?? "TBD",
              },
            });
          }

          // Update the request
          const updatedRequest = await tx.leagueSchoolCreationRequest.update({
            where: { id: input.requestId },
            data: {
              status: "APPROVED",
              admin_notes: input.adminNotes,
              reviewed_at: new Date(),
              reviewed_by: userId,
              created_school_id: newSchool.id,
            },
            include: {
              administrator: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                  league: true,
                },
              },
              created_school: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                },
              },
            },
          });

          return { updatedRequest, newSchool };
        });

        // TODO: Add Discord/notification logging here if needed
        // Following the pattern from schoolAssociationRequests.ts

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error approving league school creation request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve league school creation request",
        });
      }
    }),

  // Reject a league school creation request
  rejectRequest: adminProcedure
    .input(rejectRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        const request = await ctx.db.leagueSchoolCreationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            administrator: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                league: true,
              },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League school creation request not found",
          });
        }

        if (request.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Request has already been processed",
          });
        }

        const updatedRequest = await ctx.db.leagueSchoolCreationRequest.update({
          where: { id: input.requestId },
          data: {
            status: "REJECTED",
            admin_notes: input.adminNotes,
            reviewed_at: new Date(),
            reviewed_by: userId,
          },
          include: {
            administrator: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
                league: true,
              },
            },
          },
        });

        // TODO: Add Discord/notification logging here if needed
        // Following the pattern from schoolAssociationRequests.ts

        return updatedRequest;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error rejecting league school creation request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject league school creation request",
        });
      }
    }),

  // Get request details by ID
  getRequestById: adminProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const request = await ctx.db.leagueSchoolCreationRequest.findUnique({
          where: { id: input.requestId },
          select: {
            id: true,
            status: true,
            requested_at: true,
            request_message: true,
            admin_notes: true,
            reviewed_at: true,
            reviewed_by: true,
            proposed_school_name: true,
            proposed_school_type: true,
            proposed_school_location: true,
            proposed_school_state: true,
            proposed_school_region: true,
            proposed_school_website: true,
            administrator: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                username: true,
                league: true,
                image_url: true,
                created_at: true,
              },
            },
            created_school: {
              select: {
                id: true,
                name: true,
                type: true,
                location: true,
                state: true,
                region: true,
                website: true,
              },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "League school creation request not found",
          });
        }

        return request;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching league school creation request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch league school creation request",
        });
      }
    }),
});
