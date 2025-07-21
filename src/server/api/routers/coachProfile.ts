// src/server/api/routers/coachProfile.ts
// This file contains the coach profile router for the API.
// It provides endpoints for managing coach profiles, school associations, and onboarding.

import { z } from "zod";
import { createTRPCRouter, publicProcedure, coachProcedure, onboardedCoachProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { withRetry } from "@/lib/server/db-utils";
import { clerkClient } from "@clerk/nextjs/server";
import { logSchoolAssociationRequest } from "@/lib/discord-logger";

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

const achievementCreateSchema = z.object({
  title: z.string().min(1).max(200),
  date_achieved: z.date(),
});

const achievementUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  date_achieved: z.date(),
});

const achievementDeleteSchema = z.object({
  id: z.string().uuid(),
});

const schoolAssociationRequestSchema = z.object({
  school_id: z.string().uuid().optional(),
  request_message: z.string().min(10).max(500).optional(),
  // New school creation fields
  is_new_school_request: z.boolean().default(false),
  proposed_school_name: z.string().min(1).max(100).optional(),
  proposed_school_type: z.enum(["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"]).optional(),
  proposed_school_location: z.string().min(1).max(100).optional(),
  proposed_school_state: z.string().min(2).max(50).optional(),
  proposed_school_region: z.string().max(50).optional(),
  proposed_school_website: z.string().url().optional(),
}).refine((data) => {
  // Either existing school or new school, but not both
  if (data.is_new_school_request) {
    return data.proposed_school_name && data.proposed_school_type && 
           data.proposed_school_location && data.proposed_school_state;
  } else {
    return data.school_id;
  }
}, {
  message: "Either provide school_id for existing school or complete new school information",
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
  getSchoolInfo: coachProcedure
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
              select: {
                id: true,
                status: true,
                request_message: true,
                requested_at: true,
                is_new_school_request: true,
                proposed_school_name: true,
                proposed_school_type: true,
                proposed_school_location: true,
                proposed_school_state: true,
                proposed_school_region: true,
                proposed_school_website: true,
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

        let school = null;
        let schoolName = '';
        let schoolType = '';
        let schoolLocation = '';

        if (input.is_new_school_request) {
          // For new school requests, we'll use the proposed values
          schoolName = input.proposed_school_name!;
          schoolType = input.proposed_school_type!.replace("_", " ");
          schoolLocation = `${input.proposed_school_location!}, ${input.proposed_school_state!}`;
        } else {
          // Verify the existing school exists
          school = await withRetry(() =>
            ctx.db.school.findUnique({
              where: { id: input.school_id! },
              select: { id: true, name: true, type: true, location: true, state: true },
            })
          );

          if (!school) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'School not found',
            });
          }

          schoolName = school.name;
          schoolType = school.type.replace("_", " ");
          schoolLocation = `${school.location}, ${school.state}`;

          // Check if there's already a pending request for this school
          const existingRequest = await withRetry(() =>
            ctx.db.schoolAssociationRequest.findFirst({
              where: {
                coach_id: coachId,
                school_id: input.school_id,
                status: 'PENDING',
              },
            })
          );

          if (existingRequest) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'A request for this school is already pending',
            });
          }
        }

        // Create the association request
        const request = await withRetry(() =>
          ctx.db.schoolAssociationRequest.create({
            data: {
              coach_id: coachId,
              school_id: input.is_new_school_request ? null : input.school_id,
              request_message: input.request_message,
              is_new_school_request: input.is_new_school_request,
              proposed_school_name: input.proposed_school_name,
              proposed_school_type: input.proposed_school_type,
              proposed_school_location: input.proposed_school_location,
              proposed_school_state: input.proposed_school_state,
              proposed_school_region: input.proposed_school_region,
              proposed_school_website: input.proposed_school_website,
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
                  type: true,
                  location: true,
                  state: true,
                },
              },
            },
          })
        );

        // Get coach information for logging
        const coachInfo = request.coach;

        // Log the school association request to Discord
        try {
          await logSchoolAssociationRequest({
            requestId: request.id,
            coachName: `${coachInfo.first_name} ${coachInfo.last_name}`,
            coachEmail: coachInfo.email,
            schoolName,
            schoolType,
            schoolLocation,
            requestMessage: input.request_message,
            userId: ctx.auth.userId,
            userEmail: coachInfo.email,
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

  // Get recent dashboard activity
  getRecentActivity: onboardedCoachProcedure
    .query(async ({ ctx }) => {
      const coachId = ctx.coachId; // Available from onboardedCoachProcedure context
      
      try {
        // Get recent activities in parallel
        const [recentRegistrations, recentMessages, recentFavorites] = await Promise.all([
          // Recent tryout registrations for coach's tryouts
          withRetry(() =>
            ctx.db.tryoutRegistration.findMany({
              where: {
                tryout: {
                  coach_id: coachId,
                },
                registered_at: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
              },
              include: {
                player: {
                  select: {
                    first_name: true,
                    last_name: true,
                  },
                },
                tryout: {
                  select: {
                    title: true,
                    game: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: { registered_at: 'desc' },
              take: 3,
            })
          ),
          
          // Recent messages to coach
          withRetry(() =>
            ctx.db.message.findMany({
              where: {
                conversation: {
                  coach_id: coachId,
                },
                sender_type: "PLAYER",
                created_at: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
              },
              include: {
                conversation: {
                  include: {
                    player: {
                      select: {
                        first_name: true,
                        last_name: true,
                      },
                    },
                  },
                },
              },
              orderBy: { created_at: 'desc' },
              take: 2,
            })
          ),
          
          // Recent favorites added
          withRetry(() =>
            ctx.db.coachFavorite.findMany({
              where: {
                coach_id: coachId,
                created_at: {
                  gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
              },
              include: {
                player: {
                  select: {
                    first_name: true,
                    last_name: true,
                  },
                },
              },
              orderBy: { created_at: 'desc' },
              take: 2,
            })
          ),
        ]);

        // Combine and sort activities by timestamp
        const activities: Array<{
          id: string;
          type: 'registration' | 'message' | 'favorite';
          title: string;
          timestamp: Date;
          color: string;
        }> = [];

        // Add registration activities
        recentRegistrations.forEach(reg => {
          activities.push({
            id: `reg-${reg.id}`,
            type: 'registration',
            title: `New application from ${reg.player.first_name} ${reg.player.last_name} for ${reg.tryout.game.name} tryout`,
            timestamp: reg.registered_at,
            color: 'bg-green-400',
          });
        });

        // Add message activities
        recentMessages.forEach(msg => {
          activities.push({
            id: `msg-${msg.id}`,
            type: 'message',
            title: `New message from ${msg.conversation.player.first_name} ${msg.conversation.player.last_name}`,
            timestamp: msg.created_at,
            color: 'bg-blue-400',
          });
        });

        // Add favorite activities
        recentFavorites.forEach(fav => {
          activities.push({
            id: `fav-${fav.id}`,
            type: 'favorite',
            title: `Added ${fav.player.first_name} ${fav.player.last_name} to prospects`,
            timestamp: fav.created_at,
            color: 'bg-yellow-400',
          });
        });

        // Sort by timestamp and take the most recent 5
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        return activities.slice(0, 5);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch recent activity',
        });
      }
    }),

  // Get coach achievements
  getAchievements: coachProcedure
    .query(async ({ ctx }) => {
      const coachId = ctx.coachId; // Available from coachProcedure context
      
      try {
        const achievements = await withRetry(() =>
          ctx.db.coachAchievement.findMany({
            where: { coach_id: coachId },
            orderBy: { date_achieved: 'desc' },
          })
        );
        
        return achievements;
      } catch (error) {
        console.error('Error fetching coach achievements:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch achievements',
        });
      }
    }),

  // Create a new achievement
  createAchievement: coachProcedure
    .input(achievementCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from coachProcedure context
      
      try {
        const achievement = await withRetry(() =>
          ctx.db.coachAchievement.create({
            data: {
              coach_id: coachId,
              title: input.title,
              date_achieved: input.date_achieved,
            },
          })
        );
        
        return achievement;
      } catch (error) {
        console.error('Error creating achievement:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create achievement',
        });
      }
    }),

  // Update an existing achievement
  updateAchievement: coachProcedure
    .input(achievementUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from coachProcedure context
      
      try {
        // Verify the achievement belongs to this coach
        const existingAchievement = await withRetry(() =>
          ctx.db.coachAchievement.findUnique({
            where: { id: input.id },
            select: { coach_id: true },
          })
        );

        if (!existingAchievement) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Achievement not found',
          });
        }

        if (existingAchievement.coach_id !== coachId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot update another coach\'s achievement',
          });
        }

        const achievement = await withRetry(() =>
          ctx.db.coachAchievement.update({
            where: { id: input.id },
            data: {
              title: input.title,
              date_achieved: input.date_achieved,
              updated_at: new Date(),
            },
          })
        );
        
        return achievement;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating achievement:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update achievement',
        });
      }
    }),

  // Delete an achievement
  deleteAchievement: coachProcedure
    .input(achievementDeleteSchema)
    .mutation(async ({ ctx, input }) => {
      const coachId = ctx.coachId; // Available from coachProcedure context
      
      try {
        // Verify the achievement belongs to this coach
        const existingAchievement = await withRetry(() =>
          ctx.db.coachAchievement.findUnique({
            where: { id: input.id },
            select: { coach_id: true },
          })
        );

        if (!existingAchievement) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Achievement not found',
          });
        }

        if (existingAchievement.coach_id !== coachId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot delete another coach\'s achievement',
          });
        }

        await withRetry(() =>
          ctx.db.coachAchievement.delete({
            where: { id: input.id },
          })
        );
        
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting achievement:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete achievement',
        });
      }
    }),

}); 