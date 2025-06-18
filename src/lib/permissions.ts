import { type User } from "@clerk/nextjs/server";
import { type UserResource } from "@clerk/types";

export type UserRole = "player" | "coach" | null;

// Union type to handle both server and client Clerk user types
type ClerkUser = User | UserResource | null;

/**
 * Permissions utility functions for role-based access control.
 * Uses publicMetadata (server-controlled) when available, with fallback to unsafeMetadata for compatibility.
 */

export function getUserRole(user: ClerkUser): UserRole {
  if (!user) return null;
  
  // Check publicMetadata for userType (primary field used throughout the system)
  const publicUserType = user.publicMetadata?.userType as string | undefined;
  if (publicUserType === "player" || publicUserType === "coach") {
    return publicUserType;
  }
  
  // Fallback to unsafeMetadata for backward compatibility
  const unsafeUserType = user.unsafeMetadata?.userType as string | undefined;
  if (unsafeUserType === "player" || unsafeUserType === "coach") {
    return unsafeUserType;
  }
  
  return null;
}

/**
 * Check if a coach is onboarded using Clerk's publicMetadata.
 * This function does not make any Prisma calls to avoid client context issues.
 */
export function isCoachOnboarded(user: ClerkUser): boolean {
  if (!user) return false;
  
  const userRole = getUserRole(user);
  if (userRole !== "coach") return false;
  
  // Check if onboarded flag is set in publicMetadata
  const onboarded = user.publicMetadata?.onboarded as boolean | undefined;
  return onboarded === true;
}

/**
 * Check if user can access coach-only features.
 * This combines role check and onboarding status.
 */
export function canAccessCoachFeatures(user: ClerkUser): boolean {
  return isCoachOnboarded(user);
}

export function canMessageCoach(currentUserRole: UserRole): boolean {
  // Only players can message coaches
  return currentUserRole === "player";
}

export function canMessagePlayer(currentUserRole: UserRole): boolean {
  // Only coaches can message players
  return currentUserRole === "coach";
}

export function canPerformAction(
  role: UserRole,
  action: "message_coach" | "message_player" | "view_profile" | "search_players" | "create_tryout" | "view_coach_dashboard"
): boolean {
  switch (action) {
    case "message_coach":
      return canMessageCoach(role);
    case "message_player":
      return canMessagePlayer(role);
    case "view_profile":
      return role !== null; // Any authenticated user can view profiles
    case "search_players":
    case "create_tryout":
    case "view_coach_dashboard":
      return role === "coach"; // Coach-specific actions (will need onboarding check too)
    default:
      return false;
  }
}

// Coach onboarding status type
export interface CoachOnboardingStatus {
  isOnboarded: boolean;
  hasSchoolAssociation: boolean;
  hasPendingRequest: boolean;
  canRequestAssociation: boolean;
}

// Function to determine if coach functionality should be enabled
export function canAccessCoachFeaturesFromStatus(onboardingStatus: CoachOnboardingStatus): boolean {
  return onboardingStatus.isOnboarded && onboardingStatus.hasSchoolAssociation;
}

// Function to get onboarding status message for coaches
export function getOnboardingMessage(onboardingStatus: CoachOnboardingStatus): string {
  if (onboardingStatus.isOnboarded) {
    return "Your coach account is fully activated and ready to use.";
  }
  
  if (onboardingStatus.hasPendingRequest) {
    return "Your school association request is pending review by our administrators. You'll receive access once approved.";
  }
  
  if (!onboardingStatus.hasSchoolAssociation && onboardingStatus.canRequestAssociation) {
    return "To access coach features, you need to associate with a school. Please submit a school association request.";
  }
  
  return "Please contact support for assistance with your coach account.";
}

export function isSignedIn(user: ClerkUser): boolean {
  return !!user;
}

export function hasPermission(
  currentUser: ClerkUser,
  action: "message_coach" | "message_player" | "view_profile"
): boolean {
  if (!currentUser) return false;
  
  const role = getUserRole(currentUser);
  
  switch (action) {
    case "message_coach":
      return canMessageCoach(role);
    case "message_player":
      return canMessagePlayer(role);
    case "view_profile":
      return true; // Public profiles are viewable by all
    default:
      return false;
  }
}

