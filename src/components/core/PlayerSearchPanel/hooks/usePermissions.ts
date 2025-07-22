import type { PlayerSearchFeature } from "../types";
import { PERMISSION_FEATURES } from "../utils/constants";

export interface UsePermissionsProps {
  permissionLevel?: "coach" | "admin" | "scout" | "public";
  allowedFeatures?: PlayerSearchFeature[];
}

export interface UsePermissionsReturn {
  canUseFeature: (feature: PlayerSearchFeature) => boolean;
  canViewContactInfo: boolean;
  canManageFavorites: boolean;
  canExportData: boolean;
  canBulkActions: boolean;
  canSendMessages: boolean;
  hasFullAccess: boolean;
}

/**
 * Hook for checking user permissions and feature access
 */
export function usePermissions({
  permissionLevel = "public",
  allowedFeatures,
}: UsePermissionsProps): UsePermissionsReturn {
  // Get default features based on permission level
  const defaultFeatures = PERMISSION_FEATURES[permissionLevel];

  // Use provided features or fall back to permission-based defaults
  const availableFeatures = allowedFeatures ?? defaultFeatures;

  const canUseFeature = (feature: PlayerSearchFeature): boolean => {
    return (availableFeatures as PlayerSearchFeature[]).includes(feature);
  };

  const canViewContactInfo =
    permissionLevel === "admin" || permissionLevel === "coach";
  const canManageFavorites = canUseFeature("favorites");
  const canExportData = canUseFeature("export");
  const canBulkActions = canUseFeature("bulk-actions");
  const canSendMessages = canUseFeature("messaging");
  const hasFullAccess = permissionLevel === "admin";

  return {
    canUseFeature,
    canViewContactInfo,
    canManageFavorites,
    canExportData,
    canBulkActions,
    canSendMessages,
    hasFullAccess,
  };
}
