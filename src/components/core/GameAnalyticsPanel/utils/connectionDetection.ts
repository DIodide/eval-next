import type { UserResource } from "@clerk/types";
import type { GameId, PlatformType } from "../types";
import { PLATFORM_PROVIDER_MAP } from "./constants";

export interface PlatformConnection {
  platform: string;
  connected: boolean;
}

export interface PlayerProfileData {
  id: string;
  platform_connections?: PlatformConnection[];
  social_connections?: unknown[];
}

export function checkOAuthConnection(
  user: UserResource | null | undefined,
  platform: PlatformType,
): boolean {
  if (!user?.externalAccounts) return false;

  const providers = PLATFORM_PROVIDER_MAP[platform];
  return user.externalAccounts.some(
    (account) =>
      providers.some((p) => account.provider.includes(p)) &&
      account.verification?.status === "verified",
  );
}

export function checkPlatformConnection(
  profileData: PlayerProfileData | null | undefined,
  platform: PlatformType,
): boolean {
  if (!profileData?.platform_connections) return false;

  return profileData.platform_connections.some(
    (conn) => conn.platform === platform && conn.connected,
  );
}

export function getConnectionStatus(
  user: UserResource | null | undefined,
  profileData: PlayerProfileData | null | undefined,
  platform: PlatformType,
): {
  isConnected: boolean;
  connectionType: "oauth" | "platform" | "none";
} {
  const hasOAuth = checkOAuthConnection(user, platform);
  const hasPlatform = checkPlatformConnection(profileData, platform);

  if (hasOAuth) {
    return {
      isConnected: true,
      connectionType: "oauth",
    };
  }

  if (hasPlatform) {
    return {
      isConnected: true,
      connectionType: "platform",
    };
  }

  return {
    isConnected: false,
    connectionType: "none",
  };
}

export function getGameConnectionStatus(
  user: UserResource | null | undefined,
  profileData: PlayerProfileData | null | undefined,
  gameId: GameId,
  viewMode: "self" | "other" = "self",
): {
  isConnected: boolean;
  connectionType: "oauth" | "platform" | "none";
} {
  const platformMap: Record<GameId, PlatformType> = {
    valorant: "valorant",
    "rocket-league": "epicgames",
    smash: "startgg",
    overwatch: "battlenet",
  };

  const platform = platformMap[gameId];

  // When viewing someone else's profile, only check platform connections
  if (viewMode === "other") {
    return getConnectionStatus(null, profileData, platform);
  }

  // When viewing own profile, check both OAuth and platform connections
  return getConnectionStatus(user, profileData, platform);
}

export function getAllConnectionStatuses(
  user: UserResource | null | undefined,
  profileData: PlayerProfileData | null | undefined,
  viewMode: "self" | "other" = "self",
): Record<GameId, boolean> {
  const games: GameId[] = ["valorant", "rocket-league", "smash", "overwatch"];

  return games.reduce(
    (acc, gameId) => {
      const status = getGameConnectionStatus(
        user,
        profileData,
        gameId,
        viewMode,
      );
      acc[gameId] = status.isConnected;
      return acc;
    },
    {} as Record<GameId, boolean>,
  );
}

export function getConnectionUrl(gameId: GameId): string {
  const urlMap: Record<GameId, string> = {
    valorant: "/dashboard/player/profile",
    "rocket-league": "/dashboard/player/profile/external-accounts",
    smash: "/dashboard/player/profile/external-accounts",
    overwatch: "/dashboard/player/profile/external-accounts",
  };

  return urlMap[gameId];
}

export function isGameFullySupported(gameId: GameId): boolean {
  const supportedGames: GameId[] = ["valorant", "rocket-league", "smash"];
  return supportedGames.includes(gameId);
}

export function getGameDisplayName(gameId: GameId): string {
  const displayNames: Record<GameId, string> = {
    valorant: "VALORANT",
    "rocket-league": "Rocket League",
    smash: "Smash Ultimate",
    overwatch: "Overwatch 2",
  };

  return displayNames[gameId];
}

export function getConnectAccountText(gameId: GameId): string {
  const textMap: Record<GameId, string> = {
    valorant: "Connect VALORANT Account",
    "rocket-league": "Connect Epic Games",
    smash: "Connect start.gg Account",
    overwatch: "Connect Battle.net Account",
  };

  return textMap[gameId];
}
