// src/server/api/routers/coachProfile.ts
// This file contains the coach profile router for the API.
// It provides endpoints for managing coach profiles, school associations, and onboarding.

import { z } from "zod";
import { createTRPCRouter, publicProcedure, coachProcedure, onboardedCoachProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/db-utils";
import { clerkClient } from "@clerk/nextjs/server";

// Input validation schemas
const profileUpdateSchema = z.object({
  // Basic profile information
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  username: z.string().min(3).optional(),
  
  // School association
  school: z.string().optional(),
  school_id: z.string().uuid().optional(),
});

const schoolAssociationRequestSchema = z.object({
  school_id: z.string().uuid(),
  request_message: z.string().min(10).max(500).optional(),
});

export const coachProfileRouter = createTRPCRouter({
  // Get coach onboarding status
  getOnboardingStatus: coachProcedure
    .query(async ({ ctx }) => {
    const coachId = ctx.coachId; // Available from coachProcedure context
    
    // Get onboarding status from Clerk publicMetadata
    const publicMetadata = ctx.auth.sessionClaims?.publicMetadata as Record<string, unknown> | undefined;
    const isOnboarded = publicMetadata?.onboarded === true && publicMetadata?.userType === "coach";
    
    // Get coach's current school association and pending requests from database
    try {
      const coach = await withRetry(() =>
        ctx.db.coach.findUnique({
          where: { id: coachId },
          select: {
            school_id: true,
            school_requests: {
              where: {
                status: 'PENDING'
              },
              select: { id: true }
            }
          },
        })
      );

      if (!coach) {
        return {
          isOnboarded: false,
          hasSchoolAssociation: false,
          hasPendingRequest: false,
          canRequestAssociation: false,
        };
      }

      const hasSchoolAssociation = !!coach.school_id;
      const hasPendingRequest = coach.school_requests.length > 0;
      const canRequestAssociation = !hasSchoolAssociation && !hasPendingRequest;

      return {
        isOnboarded,
        hasSchoolAssociation,
        hasPendingRequest,
        canRequestAssociation,
      };
    } catch (error) {
      console.error('Error fetching coach onboarding status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch onboarding status',
      });
    }
  }),

  // Get coach profile
  getProfile: coachProcedure
    .query(async ({ ctx }) => {
    const userId = ctx.auth.userId!; // Safe to use ! because coachProcedure ensures userId exists
    
    try {
      const coach = await withRetry(() =>
        ctx.db.coach.findUnique({
          where: { clerk_id: userId },
          include: {
            school_ref: true,
            school_requests: {
              orderBy: { requested_at: 'desc' },
              take: 1,
            },
          },
        })
      );
      
      if (!coach) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Coach profile not found',
        });
      }
      
      return coach;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch coach profile',
      });
    }
  }),

  // Optimized: Get basic profile info only (faster loading)
  getBasicProfile: coachProcedure
    .query(async ({ ctx }) => {
    const userId = ctx.auth.userId!; // Safe to use ! because coachProcedure ensures userId exists
    
    try {
      const coach = await withRetry(() =>
        ctx.db.coach.findUnique({
          where: { clerk_id: userId },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            username: true,
            image_url: true,
            school: true,
            school_id: true,
            created_at: true,
            updated_at: true,
          },
        })
      );
      
      return coach;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch basic profile',
      });
    }
  }),

  // Get school association info
  getSchoolInfo: onboardedCoachProcedure
    .query(async ({ ctx }) => {
    const userId = ctx.auth.userId!; // Safe to use ! because coachProcedure ensures userId exists
    
    try {
      const coach = await withRetry(() =>
        ctx.db.coach.findUnique({
          where: { clerk_id: userId },
          select: {
            school: true,
            school_id: true,
            school_ref: {
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
            school_requests: {
              orderBy: { requested_at: 'desc' },
              include: {
                school: {
                  select: {
                    name: true,
                    type: true,
                    location: true,
                    state: true,
                  },
                },
              },
            },
          },
        })
      );
      
      return coach;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch school info',
      });
    }
  }),

  // Submit school association request
  submitSchoolAssociationRequest: coachProcedure
    .input(schoolAssociationRequestSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from coachProcedure context
      
      try {
        // Check if coach already has school association
        const coach = await withRetry(() =>
          ctx.db.coach.findUnique({
            where: { id: coachId },
            select: { school_id: true },
          })
        );

        if (coach?.school_id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Coach already has a school association',
          });
        }

        // Check if there's already a pending request for this school
        const existingRequest = await withRetry(() =>
          ctx.db.schoolAssociationRequest.findUnique({
            where: {
              coach_id_school_id: {
                coach_id: coachId,
                school_id: input.school_id,
              },
            },
          })
        );

        if (existingRequest) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A request for this school is already pending',
          });
        }

        // Verify the school exists
        const school = await withRetry(() =>
          ctx.db.school.findUnique({
            where: { id: input.school_id },
            select: { id: true, name: true },
          })
        );

        if (!school) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'School not found',
          });
        }

        // Create the association request
        const request = await withRetry(() =>
          ctx.db.schoolAssociationRequest.create({
            data: {
              coach_id: coachId,
              school_id: input.school_id,
              request_message: input.request_message,
            },
            include: {
              school: {
                select: {
                  name: true,
                  type: true,
                  location: true,
                  state: true,
                },
              },
            },
          })
        );

        return request;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error submitting school association request:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit school association request',
        });
      }
    }),

  // Update coach profile
  updateProfile: coachProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because coachProcedure ensures userId exists
      
      try {
        const updatedCoach = await withRetry(() =>
          ctx.db.coach.update({
            where: { clerk_id: userId },
            data: {
              ...input,
              updated_at: new Date(),
            },
            include: {
              school_ref: true,
            },
          })
        );
        
        return updatedCoach;
      } catch (error) {
        console.error('Error updating coach profile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update coach profile',
        });
      }
    }),

  // Get all available schools for selection
  getAvailableSchools: publicProcedure.query(async ({ ctx }) => {
    try {
      const schools = await withRetry(() =>
        ctx.db.school.findMany({
          select: {
            id: true,
            name: true,
            type: true,
            location: true,
            state: true,
            region: true,
          },
          orderBy: [
            { state: 'asc' },
            { name: 'asc' },
          ],
        })
      );
      
      return schools;
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch available schools',
      });
    }
  }),

  // Associate coach with a school (deprecated - use submitSchoolAssociationRequest) (still in use need to remove)
  associateWithSchool: coachProcedure
    .input(z.object({
      school_id: z.string().uuid(),
      school_name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because coachProcedure ensures userId exists
      
      try {
        // Verify the school exists
        const school = await withRetry(() =>
          ctx.db.school.findUnique({
            where: { id: input.school_id },
            select: { id: true, name: true },
          })
        );

        if (!school) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'School not found',
          });
        }

        const updatedCoach = await withRetry(() =>
          ctx.db.coach.update({
            where: { clerk_id: userId },
            data: {
              school_id: input.school_id,
              school: input.school_name,
              updated_at: new Date(),
            },
            include: {
              school_ref: true,
            },
          })
        );
        
        return updatedCoach;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error associating coach with school:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to associate with school',
        });
      }
    }),

  // Remove school association
  removeSchoolAssociation: onboardedCoachProcedure
    .mutation(async ({ ctx }) => {
      const userId = ctx.auth.userId!; // Safe to use ! because coachProcedure ensures userId exists
      
      try {
        // Update database first
        const updatedCoach = await withRetry(() =>
          ctx.db.coach.update({
            where: { clerk_id: userId },
            data: {
              school_id: null,
              school: '',
              updated_at: new Date(),
            },
          })
        );

        // Update Clerk publicMetadata to mark coach as no longer onboarded
        try {
          const client = await clerkClient();
          await client.users.updateUserMetadata(userId, {
            publicMetadata: {
              userType: "coach", // Keep userType as coach
              onboarded: false,  // Set onboarded to false since they lost school association
            },
          });
          console.log(`Coach ${userId} onboarded status set to false after removing school association`);
        } catch (clerkError) {
          console.error('Error updating Clerk metadata for coach:', clerkError);
          // Don't throw here - database update was successful, metadata update is supplementary
          // The middleware will still work based on database state
        }
        
        return updatedCoach;
      } catch (error) {
        console.error('Error removing school association:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove school association',
        });
      }
    }),
}); 