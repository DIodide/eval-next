import { useUser } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import { useMemo } from "react";
import type { GameId, GameConnectionResult } from "../types";
import {
  getGameConnectionStatus,
  getAllConnectionStatuses,
  type PlayerProfileData,
} from "../utils/connectionDetection";

export function useGameConnection(
  gameId: GameId,
  playerId?: string,
  targetPlayerProfile?: PlayerProfileData,
): GameConnectionResult {
  const { user } = useUser();
  const { data: profileData } = api.playerProfile.getProfile.useQuery(
    undefined,
    {
      enabled: !!user && !playerId,
    },
  );

  const connectionStatus = useMemo(() => {
    // If viewing someone else's profile, use their profile data
    const profileToCheck = playerId ? targetPlayerProfile : profileData;
    const viewMode = playerId ? "other" : "self";
    return getGameConnectionStatus(user, profileToCheck, gameId, viewMode);
  }, [user, profileData, targetPlayerProfile, gameId, playerId]);

  return {
    isConnected: connectionStatus.isConnected,
    connectionType: connectionStatus.connectionType,
    profileData: playerId ? targetPlayerProfile : profileData,
  };
}

export function useAllGameConnections(
  playerId?: string,
  targetPlayerProfile?: PlayerProfileData,
): Record<GameId, boolean> {
  const { user } = useUser();
  const { data: profileData } = api.playerProfile.getProfile.useQuery(
    undefined,
    {
      enabled: !!user && !playerId,
    },
  );

  const connectionStatuses = useMemo(() => {
    // If viewing someone else's profile, use their profile data
    const profileToCheck = playerId ? targetPlayerProfile : profileData;
    const viewMode = playerId ? "other" : "self";
    return getAllConnectionStatuses(user, profileToCheck, viewMode);
  }, [user, profileData, targetPlayerProfile, playerId]);

  return connectionStatuses;
}

export function useConnectionCheck(gameId: GameId, playerId?: string) {
  const { user } = useUser();
  const {
    data: profileData,
    isLoading,
    error,
  } = api.playerProfile.getProfile.useQuery(undefined, {
    enabled: !!user && !playerId,
  });

  const connectionStatus = useMemo(() => {
    if (isLoading || !profileData) {
      return {
        isConnected: false,
        connectionType: "none" as const,
        isLoading: true,
      };
    }

    const viewMode = playerId ? "other" : "self";
    const status = getGameConnectionStatus(
      user,
      profileData as PlayerProfileData,
      gameId,
      viewMode,
    );
    return {
      ...status,
      isLoading: false,
    };
  }, [user, profileData, gameId, isLoading, playerId]);

  return {
    ...connectionStatus,
    profileData,
    error,
  };
}
