import { type User } from "@clerk/nextjs/server";

export type UserRole = "player" | "coach" | null;

/**
 * Permissions utility functions for role-based access control.
 * Uses publicMetadata (server-controlled) when available, with fallback to unsafeMetadata for compatibility.
 */

export function getUserRole(user: User | null): UserRole {
  if (!user) return null;
  
  // Fallback to public metadata for backward compatibility
  const publicRole = user.publicMetadata?.role as string | undefined;
  if (publicRole === "player" || publicRole === "coach") {
    return publicRole;
  }
  
  return null;
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
export type CoachOnboardingStatus = {
  isOnboarded: boolean;
  hasSchoolAssociation: boolean;
  hasPendingRequest: boolean;
  canRequestAssociation: boolean;
};

// Function to determine if coach functionality should be enabled
export function canAccessCoachFeatures(onboardingStatus: CoachOnboardingStatus): boolean {
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

export function isSignedIn(user: User | null): boolean {
  return !!user;
}

export function hasPermission(
  currentUser: User | null,
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