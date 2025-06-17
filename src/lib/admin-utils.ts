import { clerkClient, auth } from '@clerk/nextjs/server';
import { db } from "@/server/db";
import type { CoachOnboardingStatus } from "@/lib/permissions";

/**
 * Server-side admin utilities for checking admin privileges
 * These functions can only be used in server components, API routes, or middleware
 */

/**
 * Check if a user has admin role using server-side Clerk client
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.privateMetadata?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Check if the current authenticated user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    if (!userId) return false;
    return await isUserAdmin(userId);
  } catch (error) {
    console.error('Error checking current user admin status:', error);
    return false;
  }
}

/**
 * Middleware helper to check admin access
 */
export async function checkAdminAccess(userId: string | null): Promise<boolean> {
  if (!userId) return false;
  return await isUserAdmin(userId);
}

/**
 * Check coach onboarding status utility function
 */
export async function checkCoachOnboardingStatus(userId: string | null): Promise<{
  isOnboarded: boolean;
  isCoach: boolean;
  coachId?: string;
}> {
  if (!userId) return { isOnboarded: false, isCoach: false };

  try {
    const coach = await db.coach.findUnique({
      where: { clerk_id: userId },
      select: {
        id: true,
        school_id: true,
        school_requests: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    if (!coach) {
      return { isOnboarded: false, isCoach: false };
    }

    const hasSchoolAssociation = !!coach.school_id;
    return { 
      isOnboarded: hasSchoolAssociation, 
      isCoach: true,
      coachId: coach.id
    };
  } catch (error) {
    console.error('Error checking coach onboarding status:', error);
    return { isOnboarded: false, isCoach: false };
  }
}

/**
 * Get detailed coach onboarding status for API use
 */
export async function getCoachOnboardingStatus(userId: string | null): Promise<CoachOnboardingStatus | null> {
  if (!userId) return null;

  try {
    const coach = await db.coach.findUnique({
      where: { clerk_id: userId },
      select: {
        id: true,
        school_id: true,
        school_requests: {
          select: {
            id: true,
            status: true,
          }
        }
      }
    });

    if (!coach) return null;

    const hasSchoolAssociation = !!coach.school_id;
    const hasPendingRequest = coach.school_requests?.some(
      (req) => req.status === 'PENDING'
    ) ?? false;
    const canRequestAssociation = !hasSchoolAssociation && !hasPendingRequest;

    return {
      isOnboarded: hasSchoolAssociation,
      hasSchoolAssociation,
      hasPendingRequest,
      canRequestAssociation,
    };
  } catch (error) {
    console.error('Error getting coach onboarding status:', error);
    return null;
  }
} 