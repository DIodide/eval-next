"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  GamepadIcon,
  LinkIcon,
  XIcon,
  LoaderIcon,
  SaveIcon,
  CheckIcon,
  PlusIcon,
  ShieldIcon,
  LogInIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Types for connections
interface GameConnection {
  platform: string;
  username: string;
  connected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  displayName: string;
  color: string;
  requiresOAuth?: boolean;
  featured?: boolean;
}

export default function GameConnectionsPanel() {
  const { user } = useUser();

  // Check if user is a player
  const userType = user?.unsafeMetadata?.userType;
  const isPlayer = userType === "player";

  // tRPC hooks - only run if user is signed in AND is a player
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = api.playerProfile.getProfile.useQuery(undefined, {
    enabled: !!user && isPlayer,
  });

  // Connection mutations
  const updatePlatformMutation =
    api.playerProfile.updatePlatformConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
        setConnectionUsername("");
        setSelectedPlatform("");
        setConnectionError("");
        setIsEditingGameConnections(false);
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  const updateOAuthMutation =
    api.playerProfile.updateOAuthConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
        setSelectedPlatform("");
        setConnectionError("");
        setIsEditingGameConnections(false);
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  const removePlatformMutation =
    api.playerProfile.removePlatformConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  // State management
  const [isEditingGameConnections, setIsEditingGameConnections] =
    useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [connectionUsername, setConnectionUsername] = useState("");
  const [connectionError, setConnectionError] = useState("");

  // Game connections configuration
  const gameConnectionsConfig: GameConnection[] = [
    {
      platform: "valorant",
      username: "",
      connected: false,
      icon: ShieldIcon,
      displayName: "VALORANT",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      requiresOAuth: true,
      featured: true,
    },
    {
      platform: "epicgames",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Rocket League",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      requiresOAuth: true,
      featured: true,
    },
    {
      platform: "battlenet",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Overwatch 2",
      color: "bg-gradient-to-r from-orange-400 to-blue-500",
      requiresOAuth: false,
      featured: true,
    },
    {
      platform: "startgg",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Smash Ultimate",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      requiresOAuth: true,
      featured: true,
    },
  ];

  // Create connection arrays from database data, config, and OAuth external accounts
  const gameConnections = gameConnectionsConfig.map((config) => {
    const dbConnection = profileData?.platform_connections?.find(
      (conn) => conn.platform === config.platform,
    );

    // Check for OAuth connections from Clerk external accounts
    let isOAuthConnected = false;
    let oauthUsername = "";

    if (config.requiresOAuth && config.platform === "valorant") {
      const externalAccount = user?.externalAccounts?.find(
        (account) =>
          account.provider.includes("valorant") ||
          account.provider === "custom_valorant",
      );

      if (
        externalAccount &&
        externalAccount.verification?.status === "verified"
      ) {
        isOAuthConnected = true;
        oauthUsername =
          externalAccount.username ??
          externalAccount.emailAddress ??
          "Connected Account";
      }
    }

    if (config.requiresOAuth && config.platform === "epicgames") {
      const externalAccount = user?.externalAccounts?.find(
        (account) =>
          account.provider.includes("epic_games") ||
          account.provider === "custom_epic_games",
      );

      if (
        externalAccount &&
        externalAccount.verification?.status === "verified"
      ) {
        isOAuthConnected = true;
        oauthUsername =
          externalAccount.username ??
          externalAccount.emailAddress ??
          "Connected Account";
      }
    }

    if (config.requiresOAuth && config.platform === "startgg") {
      const externalAccount = user?.externalAccounts?.find(
        (account) =>
          account.provider.includes("start_gg") ||
          account.provider === "custom_start_gg",
      );

      if (
        externalAccount &&
        externalAccount.verification?.status === "verified"
      ) {
        isOAuthConnected = true;
        oauthUsername =
          externalAccount.username ??
          externalAccount.emailAddress ??
          "Connected Account";
      }
    }

    return {
      ...config,
      username: dbConnection?.username ?? oauthUsername,
      connected: dbConnection?.connected ?? isOAuthConnected,
    };
  });

  // Validation function
  const validateConnection = (): boolean => {
    if (!selectedPlatform) {
      setConnectionError("Please select a platform");
      return false;
    }

    if (!connectionUsername.trim()) {
      setConnectionError("Please enter a username");
      return false;
    }

    if (connectionUsername.trim().length < 3) {
      setConnectionError("Username must be at least 3 characters");
      return false;
    }

    setConnectionError("");
    return true;
  };

  // Handle game connection save
  const handleGameConnectionSave = () => {
    const platformConfig = gameConnectionsConfig.find(
      (p) => p.platform === selectedPlatform,
    );

    if (platformConfig?.requiresOAuth) {
      void handleOAuthConnection();
    } else {
      if (!validateConnection()) return;

      updatePlatformMutation.mutate({
        platform: selectedPlatform as
          | "steam"
          | "valorant"
          | "battlenet"
          | "epicgames"
          | "startgg",
        username: connectionUsername.trim(),
      });
    }
  };

  // Handle OAuth connection
  const handleOAuthConnection = async () => {
    if (selectedPlatform === "valorant") {
      const hasValorantAccount = user?.externalAccounts?.some(
        (account) =>
          account.provider.includes("valorant") ||
          account.provider === "custom_valorant",
      );

      if (!hasValorantAccount) {
        setConnectionError(
          "Please connect your Valorant account first through your account settings.",
        );
        return;
      }

      updateOAuthMutation.mutate({
        platform: "valorant",
        provider: "custom_valorant",
      });
    }
  };

  // Handle disconnect
  const disconnectAccount = (platform: string) => {
    const platformConfig = gameConnectionsConfig.find(
      (config) => config.platform === platform,
    );
    const isOAuthConnection =
      platformConfig?.requiresOAuth &&
      user?.externalAccounts?.some((account) => {
        const isValorant =
          (account.provider.includes("valorant") ||
            account.provider === "custom_valorant") &&
          account.verification?.status === "verified";
        const isEpicGames =
          (account.provider.includes("epic_games") ||
            account.provider === "custom_epic_games") &&
          account.verification?.status === "verified";
        const isStartGG =
          (account.provider.includes("start_gg") ||
            account.provider === "custom_start_gg") &&
          account.verification?.status === "verified";
        return isValorant || isEpicGames || isStartGG;
      });

    if (isOAuthConnection) {
      window.open("/dashboard/player/profile", "_blank");
      return;
    }

    removePlatformMutation.mutate({
      platform: platform as
        | "steam"
        | "valorant"
        | "battlenet"
        | "epicgames"
        | "startgg",
    });
  };

  // If user is not signed in, show sign in prompt
  if (!user) {
    return (
      <div className="my-8 rounded-lg border border-gray-700/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
            <LogInIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="font-orbitron mb-2 text-xl font-bold text-white">
            Sign In to Connect Your Games
          </h3>
          <p className="font-rajdhani mb-6 text-gray-300">
            Sign in to your EVAL account to connect your game accounts and
            unlock detailed analytics
          </p>
          <Link href="/sign-in">
            <Button className="font-rajdhani rounded-lg bg-blue-500 px-6 py-3 font-bold text-white hover:bg-blue-600">
              <LogInIcon className="mr-2 h-4 w-4" />
              Sign In to Connect Games
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show different message for non-player users
  if (!isPlayer) {
    return (
      <div className="my-8 rounded-lg border border-gray-700/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
            <GamepadIcon className="h-8 w-8 text-blue-400" />
          </div>
          <h3 className="font-orbitron mb-2 text-xl font-bold text-white">
            Game Connections
          </h3>
          <p className="font-rajdhani mb-6 text-gray-300">
            This feature is available for players to connect their game accounts
            and unlock detailed analytics.
            {userType === "coach"
              ? " As a coach, you can view player profiles to see their connected games and statistics."
              : ""}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gameConnectionsConfig.map((game) => (
              <div
                key={game.platform}
                className="rounded-xl border-2 border-gray-600/50 bg-gray-800/30 p-4"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center">
                    {game.platform === "valorant" ? (
                      <Image
                        src="/valorant/logos/Valorant Logo Red Border.jpg"
                        alt="VALORANT Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : game.platform === "epicgames" ? (
                      <Image
                        src="/rocket-league/logos/Rocket League Emblem.png"
                        alt="Rocket League Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : game.platform === "battlenet" ? (
                      <Image
                        src="/overwatch/logos/Overwatch 2 Primary Logo.png"
                        alt="Overwatch 2 Logo"
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    ) : (
                      <div className={`rounded p-2 ${game.color}`}>
                        <game.icon className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">
                    {game.displayName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-lg border border-gray-700/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-orbitron mb-2 text-xl font-bold text-white">
            Connect Your Games
          </h3>
          <p className="font-rajdhani text-sm text-gray-400">
            Connect your accounts from our 4 supported games
          </p>
        </div>
        {!isEditingGameConnections && (
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-orange-600 font-medium text-white hover:from-orange-600 hover:to-orange-700"
            onClick={() => setIsEditingGameConnections(true)}
            disabled={
              updatePlatformMutation.isPending ||
              updateOAuthMutation.isPending ||
              removePlatformMutation.isPending
            }
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Connect Game
          </Button>
        )}
      </div>

      {/* Featured Games Grid */}
      {!isEditingGameConnections && (
        <div className="mb-6">
          <h4 className="font-rajdhani mb-3 text-sm font-semibold tracking-wide text-gray-300 uppercase">
            Supported Games
          </h4>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gameConnectionsConfig.map((game) => {
              const connection = gameConnections.find(
                (conn) => conn.platform === game.platform,
              );
              const isConnected = connection?.connected ?? false;

              return (
                <div
                  key={game.platform}
                  className={cn(
                    "group relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                    isConnected
                      ? "border-green-500/50 bg-green-500/10 hover:border-green-400/70"
                      : "border-gray-600/50 bg-gray-800/30 hover:border-gray-500/70",
                  )}
                  onClick={() =>
                    !isConnected && setIsEditingGameConnections(true)
                  }
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Game Logo */}
                    <div className="mb-3 flex h-12 w-12 items-center justify-center">
                      {game.platform === "valorant" ? (
                        <Image
                          src="/valorant/logos/Valorant Logo Red Border.jpg"
                          alt="VALORANT Logo"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      ) : game.platform === "epicgames" ? (
                        <Image
                          src="/rocket-league/logos/Rocket League Emblem.png"
                          alt="Rocket League Logo"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      ) : game.platform === "battlenet" ? (
                        <Image
                          src="/overwatch/logos/Overwatch 2 Primary Logo.png"
                          alt="Overwatch 2 Logo"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      ) : game.platform === "startgg" ? (
                        <Image
                          src="/smash/logos/Smash Ball White Logo.png"
                          alt="Smash Bros Logo"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      ) : (
                        <div className={cn("rounded-lg p-3", game.color)}>
                          <game.icon className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Game Name */}
                    <h5 className="font-rajdhani mb-1 text-sm font-semibold text-white">
                      {game.displayName}
                    </h5>

                    {/* Connection Status */}
                    {isConnected ? (
                      <div className="flex items-center gap-1">
                        <CheckIcon className="h-3 w-3 text-green-400" />
                        <span className="text-xs font-medium text-green-400">
                          Connected
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Not Connected
                      </span>
                    )}

                    {/* OAuth Badge */}
                    {game.requiresOAuth && (
                      <Badge
                        variant="outline"
                        className="mt-2 border-blue-400/50 text-xs text-blue-400"
                      >
                        OAuth
                      </Badge>
                    )}
                  </div>

                  {/* Connect Overlay */}
                  {!isConnected && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <Button
                        size="sm"
                        className="bg-white text-black hover:bg-gray-200"
                      >
                        <PlusIcon className="mr-1 h-3 w-3" />
                        Connect
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connection Form */}
      {isEditingGameConnections && (
        <div className="mb-6 space-y-6 rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2">
              <GamepadIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h4 className="font-orbitron text-lg font-semibold text-white">
                Connect Game Account
              </h4>
              <p className="font-rajdhani text-sm text-gray-400">
                Choose a game platform to connect your account
              </p>
            </div>
          </div>

          {connectionError && (
            <div className="rounded-lg border border-red-600/30 bg-red-900/20 p-4">
              <div className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-red-400" />
                <p className="text-sm font-medium text-red-400">
                  {connectionError}
                </p>
              </div>
            </div>
          )}

          <div>
            <Label className="font-rajdhani mb-3 block font-medium text-white">
              Select Game Platform
            </Label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {gameConnectionsConfig
                .filter((config) => {
                  const isConnected = gameConnections.find(
                    (conn) => conn.platform === config.platform,
                  )?.connected;
                  return !isConnected;
                })
                .map((platform) => (
                  <Button
                    key={platform.platform}
                    variant={
                      selectedPlatform === platform.platform
                        ? "default"
                        : "outline"
                    }
                    className={cn(
                      "h-auto justify-start p-4 text-left transition-all duration-200",
                      selectedPlatform === platform.platform
                        ? "border-orange-400 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                        : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50 hover:text-white",
                    )}
                    onClick={() => setSelectedPlatform(platform.platform)}
                    disabled={
                      updatePlatformMutation.isPending ||
                      updateOAuthMutation.isPending
                    }
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                        {platform.platform === "valorant" ? (
                          <Image
                            src="/valorant/logos/Valorant Logo Red Border.jpg"
                            alt="VALORANT Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : platform.platform === "epicgames" ? (
                          <Image
                            src="/rocket-league/logos/Rocket League Emblem.png"
                            alt="Rocket League Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : platform.platform === "battlenet" ? (
                          <Image
                            src="/overwatch/logos/Overwatch 2 Primary Logo.png"
                            alt="Overwatch 2 Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : platform.platform === "startgg" ? (
                          <Image
                            src="/smash/logos/Smash Ball White Logo.png"
                            alt="Smash Bros Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        ) : (
                          <platform.icon className="h-6 w-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-rajdhani font-semibold">
                          {platform.displayName}
                        </p>
                        <p className="text-xs opacity-70">
                          {platform.requiresOAuth
                            ? "OAuth Authentication"
                            : "Manual Username"}
                        </p>
                      </div>
                      {platform.requiresOAuth && (
                        <Badge
                          variant="outline"
                          className="border-blue-400/50 text-xs text-blue-400"
                        >
                          OAuth
                        </Badge>
                      )}
                    </div>
                  </Button>
                ))}
            </div>
          </div>

          {selectedPlatform && (
            <div>
              {gameConnectionsConfig.find(
                (p) => p.platform === selectedPlatform,
              )?.requiresOAuth ? (
                <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <ShieldIcon className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-white">
                        Secure Connection Required
                      </h4>
                      <p className="text-sm text-blue-300">
                        This platform uses OAuth for secure authentication
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const hasRequiredOAuth = user?.externalAccounts?.some(
                      (account) => {
                        if (selectedPlatform === "valorant") {
                          return (
                            account.provider.includes("valorant") ||
                            account.provider === "custom_valorant"
                          );
                        } else if (selectedPlatform === "epicgames") {
                          return (
                            account.provider.includes("epic_games") ||
                            account.provider === "custom_epic_games"
                          );
                        }
                        return false;
                      },
                    );

                    const getAccountTypeName = () => {
                      if (selectedPlatform === "valorant") return "Valorant";
                      if (selectedPlatform === "epicgames") return "Epic Games";
                      return "OAuth";
                    };

                    return !hasRequiredOAuth ? (
                      <div className="text-center">
                        <p className="mb-3 text-sm text-gray-300">
                          You need to connect your {getAccountTypeName()}{" "}
                          account first
                        </p>
                        <Button
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                          onClick={() =>
                            window.open("/dashboard/player/profile", "_blank")
                          }
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Connect {getAccountTypeName()} Account
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mb-2 flex items-center justify-center gap-2 text-green-400">
                          <CheckIcon className="h-4 w-4" />
                          <span className="text-sm">
                            {getAccountTypeName()} account connected
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">
                          Click &quot;Connect Account&quot; to link your{" "}
                          {selectedPlatform === "valorant"
                            ? "Valorant"
                            : "Rocket League"}{" "}
                          profile
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <Label
                    htmlFor="gameUsername"
                    className="font-rajdhani text-white"
                  >
                    Username
                  </Label>
                  <Input
                    id="gameUsername"
                    value={connectionUsername}
                    onChange={(e) => setConnectionUsername(e.target.value)}
                    className="mt-1 border-gray-700 bg-gray-800 text-white"
                    placeholder="Enter your username"
                    disabled={updatePlatformMutation.isPending}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingGameConnections(false);
                setSelectedPlatform("");
                setConnectionUsername("");
                setConnectionError("");
              }}
              className="border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-700 hover:text-white"
              disabled={
                updatePlatformMutation.isPending ||
                updateOAuthMutation.isPending
              }
            >
              <XIcon className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleGameConnectionSave}
              disabled={
                updatePlatformMutation.isPending ||
                updateOAuthMutation.isPending ||
                !selectedPlatform ||
                (gameConnectionsConfig.find(
                  (p) => p.platform === selectedPlatform,
                )?.requiresOAuth
                  ? !user?.externalAccounts?.some((account) => {
                      const isValorant =
                        account.provider.includes("valorant") ||
                        account.provider === "custom_valorant";
                      const isEpicGames =
                        account.provider.includes("epic_games") ||
                        account.provider === "custom_epic_games";
                      const isStartGG =
                        account.provider.includes("start_gg") ||
                        account.provider === "custom_start_gg";
                      return isValorant || isEpicGames || isStartGG;
                    })
                  : !connectionUsername.trim())
              }
              className="bg-cyan-600 text-white hover:bg-cyan-700"
            >
              {updatePlatformMutation.isPending ||
              updateOAuthMutation.isPending ? (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon className="mr-2 h-4 w-4" />
              )}
              Connect Account
            </Button>
          </div>
        </div>
      )}

      {/* Connected Games List */}
      {gameConnections.some((conn) => conn.connected) && (
        <div className="space-y-3">
          <h4 className="font-rajdhani mb-3 text-sm font-semibold tracking-wide text-gray-300 uppercase">
            Connected Games
          </h4>
          {gameConnections
            .filter((conn) => conn.connected)
            .map((connection) => {
              const isOAuthConnection =
                connection.requiresOAuth &&
                user?.externalAccounts?.some((account) => {
                  const isValorant =
                    (account.provider.includes("valorant") ||
                      account.provider === "custom_valorant") &&
                    account.verification?.status === "verified";
                  const isEpicGames =
                    (account.provider.includes("epic_games") ||
                      account.provider === "custom_epic_games") &&
                    account.verification?.status === "verified";
                  const isStartGG =
                    (account.provider.includes("start_gg") ||
                      account.provider === "custom_start_gg") &&
                    account.verification?.status === "verified";
                  return isValorant || isEpicGames || isStartGG;
                });

              return (
                <div
                  key={connection.platform}
                  className="flex items-center justify-between rounded-lg bg-gray-800 p-3"
                >
                  <div className="flex items-center gap-3">
                    {connection.platform === "valorant" ? (
                      <div className="flex h-10 w-10 items-center justify-center">
                        <Image
                          src="/valorant/logos/Valorant Logo Red Border.jpg"
                          alt="VALORANT Logo"
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                    ) : connection.platform === "epicgames" ? (
                      <div className="flex h-10 w-10 items-center justify-center">
                        <Image
                          src="/rocket-league/logos/Rocket League Emblem.png"
                          alt="Rocket League Logo"
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className={`rounded p-2 ${connection.color}`}>
                        <connection.icon className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">
                          {connection.displayName}
                        </p>
                        {isOAuthConnection && (
                          <Badge
                            variant="outline"
                            className="border-blue-400 text-xs text-blue-400"
                          >
                            OAuth
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {connection.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-600 text-white"
                    >
                      Connected
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-red-400"
                      onClick={() => disconnectAccount(connection.platform)}
                      disabled={removePlatformMutation.isPending}
                    >
                      {removePlatformMutation.isPending ? (
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <XIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Loading state */}
      {isLoadingProfile && (
        <div className="flex items-center justify-center py-8">
          <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
          <span className="ml-2 text-gray-400">
            Loading your connections...
          </span>
        </div>
      )}
    </div>
  );
}
