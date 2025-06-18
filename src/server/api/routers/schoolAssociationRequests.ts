// src/server/api/routers/schoolAssociationRequests.ts
// Admin router for managing coach school association requests

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "@/server/api/trpc";
import { isCurrentUserAdmin } from "@/lib/admin-utils";
import { clerkClient } from "@clerk/nextjs/server";
import { type Prisma } from "@prisma/client";

// Type for the tRPC context
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

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

// Helper function to verify admin access
async function verifyAdminAccess(ctx: Context) {
  const userId = ctx.auth.userId;
  
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not authenticated',
    });
  }

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  return { userId };
}

export const schoolAssociationRequestsRouter = createTRPCRouter({
  // Get all school association requests with filtering and pagination
  getRequests: protectedProcedure
    .input(searchRequestsSchema)
    .query(async ({ ctx, input }) => {
      await verifyAdminAccess(ctx);

      try {
        const { status, search, page, limit } = input;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Prisma.SchoolAssociationRequestWhereInput = {};
        
        if (status) {
          where.status = status;
        }

        if (search) {
          where.OR = [
            {
              coach: {
                OR: [
                  { first_name: { contains: search, mode: 'insensitive' } },
                  { last_name: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { username: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
            {
              school: {
                name: { contains: search, mode: 'insensitive' },
              },
            },
          ];
        }

        const [requests, total] = await Promise.all([
          ctx.db.schoolAssociationRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: [
              { status: 'asc' }, // PENDING first
              { requested_at: 'desc' },
            ],
            include: {
              coach: {
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
              school: {
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
          ctx.db.schoolAssociationRequest.count({ where }),
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
        console.error('Error fetching school association requests:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch school association requests',
        });
      }
    }),

  // Get pending requests count for dashboard
  getPendingCount: protectedProcedure.query(async ({ ctx }) => {
    await verifyAdminAccess(ctx);

    try {
      const count = await ctx.db.schoolAssociationRequest.count({
        where: { status: 'PENDING' },
      });

      return count;
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch pending requests count',
      });
    }
  }),

  // Approve a school association request
  approveRequest: protectedProcedure
    .input(approveRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await verifyAdminAccess(ctx);

      try {
        // Get the request details
        const request = await ctx.db.schoolAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            coach: {
              select: { id: true, clerk_id: true, school_id: true },
            },
            school: {
              select: { id: true, name: true },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'School association request not found',
          });
        }

        if (request.status !== 'PENDING') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Request has already been processed',
          });
        }

        if (request.coach.school_id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Coach already has a school association',
          });
        }

        // Perform the approval in a transaction
        const result = await ctx.db.$transaction(async (tx) => {
          // Update the request status
          const updatedRequest = await tx.schoolAssociationRequest.update({
            where: { id: input.requestId },
            data: {
              status: 'APPROVED',
              reviewed_at: new Date(),
              reviewed_by: userId,
              admin_notes: input.adminNotes,
            },
          });

          // Associate the coach with the school
          const updatedCoach = await tx.coach.update({
            where: { id: request.coach.id },
            data: {
              school_id: request.school.id,
              school: request.school.name,
              updated_at: new Date(),
            },
          });

          return { request: updatedRequest, coach: updatedCoach };
        });

        // Update Clerk publicMetadata to mark coach as onboarded
        try {
          const client = await clerkClient();
          await client.users.updateUser(request.coach.clerk_id, {
            publicMetadata: {
              onboarded: true,
              userType: 'coach',
              schoolId: request.school.id,
              schoolName: request.school.name,
            },
          });
        } catch (clerkError) {
          console.error('Failed to update Clerk metadata:', clerkError);
          // Don't throw error here as the database transaction was successful
          // The coach can still function, they just might need to refresh
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error approving school association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to approve school association request',
        });
      }
    }),

  // Reject a school association request
  rejectRequest: protectedProcedure
    .input(rejectRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId } = await verifyAdminAccess(ctx);

      try {
        const request = await ctx.db.schoolAssociationRequest.findUnique({
          where: { id: input.requestId },
          select: { id: true, status: true },
        });

        if (!request) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'School association request not found',
          });
        }

        if (request.status !== 'PENDING') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Request has already been processed',
          });
        }

        const updatedRequest = await ctx.db.schoolAssociationRequest.update({
          where: { id: input.requestId },
          data: {
            status: 'REJECTED',
            reviewed_at: new Date(),
            reviewed_by: userId,
            admin_notes: input.adminNotes,
          },
          include: {
            coach: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            school: {
              select: {
                name: true,
              },
            },
          },
        });

        return updatedRequest;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error rejecting school association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reject school association request',
        });
      }
    }),

  // Get request details by ID
  getRequestById: protectedProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      await verifyAdminAccess(ctx);

      try {
        const request = await ctx.db.schoolAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            coach: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                username: true,
                image_url: true,
                created_at: true,
                school_id: true,
              },
            },
            school: {
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
            code: 'NOT_FOUND',
            message: 'School association request not found',
          });
        }

        return request;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error fetching school association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch school association request',
        });
      }
    }),
}); 