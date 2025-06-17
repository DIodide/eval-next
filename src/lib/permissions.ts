import type { UserResource } from "@clerk/types";

export type UserRole = "player" | "coach" | null;

export function getUserRole(user: UserResource | null | undefined): UserRole {
  if (!user) return null;
  return user.unsafeMetadata?.userType as UserRole ?? null;
}

export function canMessageCoach(currentUserRole: UserRole): boolean {
  return currentUserRole === "player";
}

export function canMessagePlayer(currentUserRole: UserRole): boolean {
  return currentUserRole === "coach";
}

export function isSignedIn(user: UserResource | null | undefined): boolean {
  return !!user;
}

export function hasPermission(
  currentUser: UserResource | null | undefined,
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