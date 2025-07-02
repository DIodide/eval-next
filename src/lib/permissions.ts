import { type User } from "@clerk/nextjs/server";
import { type UserResource } from "@clerk/types";

export type UserRole = "player" | "coach" | "league" | null;

// Union type to handle both server and client Clerk user types
type ClerkUser = User | UserResource | null | undefined;

/**
 * Permissions utility functions for role-based access control.
 * Uses publicMetadata (server-controlled) when available, with fallback to unsafeMetadata for compatibility.
 */

export function getUserRole(user: ClerkUser): UserRole {
  if (!user) return null;
  
  // Check publicMetadata for userType (primary field used throughout the system)
  const publicUserType = user.publicMetadata?.userType as string | undefined;
  if (publicUserType === "player" || publicUserType === "coach" || publicUserType === "league") {
    return publicUserType;
  }
  
  // Fallback to unsafeMetadata for backward compatibility
  const unsafeUserType = user.unsafeMetadata?.userType as string | undefined;
  if (unsafeUserType === "player" || unsafeUserType === "coach" || unsafeUserType === "league") {
    return unsafeUserType;
  }
  
  return null;
}

/**
 * Check if user is a coach and has been onboarded (has school association and onboarded flag)
 */
export function isCoachOnboarded(user: ClerkUser): boolean {
  const role = getUserRole(user);
  if (role !== "coach") return false;
  
  // Check publicMetadata first (server-controlled)
  const publicOnboarded = user?.publicMetadata?.onboarded as boolean | undefined;
  if (publicOnboarded === true) return true;
  
  // Fallback to unsafeMetadata for compatibility
  const unsafeOnboarded = user?.unsafeMetadata?.onboarded as boolean | undefined;
  return unsafeOnboarded === true;
}

/**
 * Check if user is a league administrator and has been onboarded
 */
export function isLeagueAdminOnboarded(user: ClerkUser): boolean {
  const role = getUserRole(user);
  if (role !== "league") return false;
  
  // Check publicMetadata first (server-controlled)
  const publicOnboarded = user?.publicMetadata?.onboarded as boolean | undefined;
  if (publicOnboarded === true) return true;
  
  // Fallback to unsafeMetadata for compatibility
  const unsafeOnboarded = user?.unsafeMetadata?.onboarded as boolean | undefined;
  return unsafeOnboarded === true;
}

/**
 * Check if user can access coach-only features.
 * This combines role check and onboarding status.
 */
export function canAccessCoachFeatures(user: ClerkUser): boolean {
  return isCoachOnboarded(user);
}

export function canMessagePlayer(currentUserRole: UserRole): boolean {
  // Only coaches can message players
  return currentUserRole === "coach";
}

export function canMessageCoach(currentUserRole: UserRole): boolean {
  // Only players can message coaches
  return currentUserRole === "player";
}

export function canManageLeague(currentUserRole: UserRole): boolean {
  // Only league administrators can manage leagues
  return currentUserRole === "league";
}

export function canPerformAction(
  role: UserRole,
  action: "message_coach" | "message_player" | "view_profile" | "search_players" | "create_tryout" | "view_coach_dashboard" | "manage_league" | "view_league_dashboard"
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
    case "manage_league":
    case "view_league_dashboard":
      return role === "league"; // League administrator actions
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

