// src/server/api/routers/coachProfile.ts
// This file contains the coach profile router for the API.
// It provides endpoints for managing coach profiles, school associations, and basic information.

import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import type { createTRPCContext } from "@/server/api/trpc";
import { withRetry } from "@/lib/db-utils";

// Type for the tRPC context
type Context = Awaited<ReturnType<typeof createTRPCContext>>;

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

// Helper function to verify user is a coach using the auth context
async function verifyCoachUser(ctx: Context) {
  const userId = ctx.auth.userId;
  
  if (!userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not authenticated',
    });
  }

  // Check if the coach exists in our database using retry wrapper
  const coach = await withRetry(() => 
    ctx.db.coach.findUnique({
      where: { clerk_id: userId },
      select: { id: true },
    })
  );

  if (!coach) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Coach profile not found. Only coaches can access this resource.',
    });
  }

  return { userId, coachId: coach.id };
}

export const coachProfileRouter = createTRPCRouter({
  // Get coach profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Verify user is a coach and get user info
    const { userId } = await verifyCoachUser(ctx);
    
    try {
      const coach = await withRetry(() =>
        ctx.db.coach.findUnique({
          where: { clerk_id: userId },
          include: {
            school_ref: true,
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
  getBasicProfile: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = await verifyCoachUser(ctx);
    
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
  getSchoolInfo: protectedProcedure.query(async ({ ctx }) => {
    const { userId } = await verifyCoachUser(ctx);
    
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

  // Update coach profile
  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user is a coach and get user info
      const { userId } = await verifyCoachUser(ctx);
      
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

  // Associate coach with a school
  associateWithSchool: protectedProcedure
    .input(z.object({
      school_id: z.string().uuid(),
      school_name: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = await verifyCoachUser(ctx);
      
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
  removeSchoolAssociation: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { userId } = await verifyCoachUser(ctx);
      
      try {
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