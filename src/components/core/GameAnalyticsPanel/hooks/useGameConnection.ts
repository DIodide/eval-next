import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { api } from "@/trpc/react";
import { useMemo } from "react";
import type { GameId, GameConnectionResult } from "../types";
import { 
  getGameConnectionStatus, 
  getAllConnectionStatuses,
  type PlayerProfileData 
} from "../utils/connectionDetection";

export function useGameConnection(gameId: GameId, _playerId?: string): GameConnectionResult {
  const { user } = useUser();
  const { data: profileData } = api.playerProfile.getProfile.useQuery(
    undefined,
    {
      enabled: !!user,
    }
  );

  const connectionStatus = useMemo(() => {
    return getGameConnectionStatus(user, profileData as PlayerProfileData, gameId);
  }, [user, profileData, gameId]);

  return {
    isConnected: connectionStatus.isConnected,
    connectionType: connectionStatus.connectionType,
    profileData,
  };
}

export function useAllGameConnections(_playerId?: string): Record<GameId, boolean> {
  const { user } = useUser();
  const { data: profileData } = api.playerProfile.getProfile.useQuery(
    undefined,
    {
      enabled: !!user,
    }
  );

  const connectionStatuses = useMemo(() => {
    return getAllConnectionStatuses(user, profileData as PlayerProfileData);
  }, [user, profileData]);

  return connectionStatuses;
}

export function useConnectionCheck(gameId: GameId, _playerId?: string) {
  const { user } = useUser();
  const { data: profileData, isLoading, error } = api.playerProfile.getProfile.useQuery(
    undefined,
    {
      enabled: !!user,
    }
  );

  const connectionStatus = useMemo(() => {
    if (isLoading || !profileData) {
      return {
        isConnected: false,
        connectionType: 'none' as const,
        isLoading: true,
      };
    }

    const status = getGameConnectionStatus(user, profileData as PlayerProfileData, gameId);
    return {
      ...status,
      isLoading: false,
    };
  }, [user, profileData, gameId, isLoading]);

  return {
    ...connectionStatus,
    profileData,
    error,
  };
} 