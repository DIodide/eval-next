// src/server/api/routers/schoolAssociationRequests.ts
// Admin router for managing coach school association requests

import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { clerkClient } from "@clerk/nextjs/server";
import { type Prisma } from "@prisma/client";
import {
  logSchoolAssociationApproved,
  logSchoolAssociationRejected,
  logAdminAction,
} from "@/lib/discord-logger";

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

export const schoolAssociationRequestsRouter = createTRPCRouter({
  // Get all school association requests with filtering and pagination
  getRequests: adminProcedure
    .input(searchRequestsSchema)
    .query(async ({ ctx, input }) => {
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
                  { first_name: { contains: search, mode: "insensitive" } },
                  { last_name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                  { username: { contains: search, mode: "insensitive" } },
                ],
              },
            },
            {
              school: {
                name: { contains: search, mode: "insensitive" },
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
              is_new_school_request: true,
              proposed_school_name: true,
              proposed_school_type: true,
              proposed_school_location: true,
              proposed_school_state: true,
              proposed_school_region: true,
              proposed_school_website: true,
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
        console.error("Error fetching school association requests:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch school association requests",
        });
      }
    }),

  // Get pending requests count for dashboard
  getPendingCount: adminProcedure.query(async ({ ctx }) => {
    try {
      const count = await ctx.db.schoolAssociationRequest.count({
        where: { status: "PENDING" },
      });

      return count;
    } catch (error) {
      console.error("Error fetching pending requests count:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending requests count",
      });
    }
  }),

  // Approve a school association request
  approveRequest: adminProcedure
    .input(approveRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        // Get the request details
        const request = await ctx.db.schoolAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            coach: {
              select: {
                id: true,
                clerk_id: true,
                school_id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            school: {
              select: { id: true, name: true },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "School association request not found",
          });
        }

        if (request.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Request has already been processed",
          });
        }

        if (request.coach.school_id) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Coach already has a school association",
          });
        }

        // Perform the approval in a transaction
        const result = await ctx.db.$transaction(async (tx) => {
          let schoolId = request.school?.id;
          let schoolName = request.school?.name;

          // If this is a new school request, create the school first
          if (request.is_new_school_request && !schoolId) {
            if (
              !request.proposed_school_name ||
              !request.proposed_school_type ||
              !request.proposed_school_location ||
              !request.proposed_school_state
            ) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message:
                  "Missing required school information for new school creation",
              });
            }

            const newSchool = await tx.school.create({
              data: {
                name: request.proposed_school_name,
                type: request.proposed_school_type,
                location: request.proposed_school_location,
                state: request.proposed_school_state,
                region: request.proposed_school_region ?? null,
                website: request.proposed_school_website ?? null,
              },
            });

            schoolId = newSchool.id;
            schoolName = newSchool.name;

            // Update the request to reference the newly created school
            await tx.schoolAssociationRequest.update({
              where: { id: input.requestId },
              data: {
                created_school_id: newSchool.id,
              },
            });
          }

          if (!schoolId || !schoolName) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "No valid school found for association",
            });
          }

          // Update the request status
          const updatedRequest = await tx.schoolAssociationRequest.update({
            where: { id: input.requestId },
            data: {
              status: "APPROVED",
              reviewed_at: new Date(),
              reviewed_by: userId,
              admin_notes: input.adminNotes,
            },
          });

          // Associate the coach with the school
          const updatedCoach = await tx.coach.update({
            where: { id: request.coach.id },
            data: {
              school_id: schoolId,
              school: schoolName,
              updated_at: new Date(),
            },
          });

          return {
            request: updatedRequest,
            coach: updatedCoach,
            schoolName,
            schoolId,
          };
        });

        // Update Clerk publicMetadata to mark coach as onboarded
        try {
          const client = await clerkClient();
          await client.users.updateUser(request.coach.clerk_id, {
            publicMetadata: {
              onboarded: true,
              userType: "coach",
              schoolId: result.schoolId,
              schoolName: result.schoolName,
            },
          });
        } catch (clerkError) {
          console.error("Failed to update Clerk metadata:", clerkError);
          // Don't throw error here as the database transaction was successful
          // The coach can still function, they just might need to refresh
        }

        // Log the approval to Discord
        try {
          const adminName = ctx.adminName ?? "Unknown Admin";
          const adminEmail = ctx.adminEmail ?? "Unknown";

          await logSchoolAssociationApproved({
            requestId: input.requestId,
            coachName: `${request.coach.first_name} ${request.coach.last_name}`,
            coachEmail: request.coach.email,
            schoolName: result.schoolName || "New School",
            adminName,
            adminNotes: input.adminNotes,
            decision: "approved",
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            timestamp: new Date(),
          });

          // Also log the admin action
          await logAdminAction({
            action: "School Association Request Approved",
            details: `Approved school association for ${request.coach.email} with ${result.schoolName}`,
            targetUserEmail: request.coach.email,
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
        console.error("Error approving school association request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to approve school association request",
        });
      }
    }),

  // Reject a school association request
  rejectRequest: adminProcedure
    .input(rejectRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because adminProcedure ensures userId exists

      try {
        const request = await ctx.db.schoolAssociationRequest.findUnique({
          where: { id: input.requestId },
          include: {
            coach: {
              select: { first_name: true, last_name: true, email: true },
            },
            school: {
              select: { name: true },
            },
          },
        });

        if (!request) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "School association request not found",
          });
        }

        if (request.status !== "PENDING") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Request has already been processed",
          });
        }

        const updatedRequest = await ctx.db.schoolAssociationRequest.update({
          where: { id: input.requestId },
          data: {
            status: "REJECTED",
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

        // Log the rejection to Discord
        try {
          const adminName = ctx.adminName ?? "Unknown Admin";
          const adminEmail = ctx.adminEmail ?? "Unknown";

          // Get school name for logging
          const schoolName =
            updatedRequest.school?.name ??
            (updatedRequest.proposed_school_name
              ? `${updatedRequest.proposed_school_name} (New School Request)`
              : "Unknown School");

          await logSchoolAssociationRejected({
            requestId: input.requestId,
            coachName: `${updatedRequest.coach.first_name} ${updatedRequest.coach.last_name}`,
            coachEmail: updatedRequest.coach.email,
            schoolName,
            adminName,
            adminNotes: input.adminNotes,
            decision: "rejected",
            userId: ctx.auth.userId,
            userEmail: adminEmail,
            timestamp: new Date(),
          });

          // Also log the admin action
          await logAdminAction({
            action: "School Association Request Rejected",
            details: `Rejected school association for ${updatedRequest.coach.email} with ${schoolName}. Reason: ${input.adminNotes}`,
            targetUserEmail: updatedRequest.coach.email,
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
        console.error("Error rejecting school association request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject school association request",
        });
      }
    }),

  // Get request details by ID
  getRequestById: adminProcedure
    .input(z.object({ requestId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const request = await ctx.db.schoolAssociationRequest.findUnique({
          where: { id: input.requestId },
          select: {
            id: true,
            status: true,
            requested_at: true,
            request_message: true,
            admin_notes: true,
            reviewed_at: true,
            reviewed_by: true,
            is_new_school_request: true,
            proposed_school_name: true,
            proposed_school_type: true,
            proposed_school_location: true,
            proposed_school_state: true,
            proposed_school_region: true,
            proposed_school_website: true,
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
            code: "NOT_FOUND",
            message: "School association request not found",
          });
        }

        return request;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching school association request:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch school association request",
        });
      }
    }),
});
