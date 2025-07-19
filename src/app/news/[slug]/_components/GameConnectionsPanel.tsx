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
  LogInIcon
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
    refetch: refetchProfile 
  } = api.playerProfile.getProfile.useQuery(undefined, {
    enabled: !!user && isPlayer
  });
  
  // Connection mutations
  const updatePlatformMutation = api.playerProfile.updatePlatformConnection.useMutation({
    onSuccess: () => {
      void refetchProfile();
      setConnectionUsername("");
      setSelectedPlatform("");
      setConnectionError("");
      setIsEditingGameConnections(false);
    },
    onError: (error) => {
      setConnectionError(error.message);
    }
  });

  const updateOAuthMutation = api.playerProfile.updateOAuthConnection.useMutation({
    onSuccess: () => {
      void refetchProfile();
      setSelectedPlatform("");
      setConnectionError("");
      setIsEditingGameConnections(false);
    },
    onError: (error) => {
      setConnectionError(error.message);
    }
  });

  const removePlatformMutation = api.playerProfile.removePlatformConnection.useMutation({
    onSuccess: () => {
      void refetchProfile();
    },
    onError: (error) => {
      setConnectionError(error.message);
    }
  });

  // State management
  const [isEditingGameConnections, setIsEditingGameConnections] = useState(false);
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
      featured: true
    },
    {
      platform: "epicgames",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Rocket League",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      requiresOAuth: true,
      featured: true
    },
    {
      platform: "battlenet",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Overwatch 2",
      color: "bg-gradient-to-r from-orange-400 to-blue-500",
      requiresOAuth: false,
      featured: true
    },
    {
      platform: "startgg",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Smash Ultimate",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      requiresOAuth: true,
      featured: true
    }
  ];

  // Create connection arrays from database data, config, and OAuth external accounts
  const gameConnections = gameConnectionsConfig.map(config => {
    const dbConnection = profileData?.platform_connections?.find(conn => conn.platform === config.platform);
    
    // Check for OAuth connections from Clerk external accounts
    let isOAuthConnected = false;
    let oauthUsername = "";
    
    if (config.requiresOAuth && config.platform === "valorant") {
      const externalAccount = user?.externalAccounts?.find(account => 
        account.provider.includes("valorant") || account.provider === "custom_valorant"
      );
      
      if (externalAccount && externalAccount.verification?.status === "verified") {
        isOAuthConnected = true;
        oauthUsername = externalAccount.username ?? externalAccount.emailAddress ?? "Connected Account";
      }
    }
    
    if (config.requiresOAuth && config.platform === "epicgames") {
      const externalAccount = user?.externalAccounts?.find(account => 
        account.provider.includes("epic_games") || account.provider === "custom_epic_games"
      );
      
      if (externalAccount && externalAccount.verification?.status === "verified") {
        isOAuthConnected = true;
        oauthUsername = externalAccount.username ?? externalAccount.emailAddress ?? "Connected Account";
      }
    }
    
    if (config.requiresOAuth && config.platform === "startgg") {
      const externalAccount = user?.externalAccounts?.find(account => 
        account.provider.includes("start_gg") || account.provider === "custom_start_gg"
      );
      
      if (externalAccount && externalAccount.verification?.status === "verified") {
        isOAuthConnected = true;
        oauthUsername = externalAccount.username ?? externalAccount.emailAddress ?? "Connected Account";
      }
    }
    
    return {
      ...config,
      username: dbConnection?.username ?? oauthUsername,
      connected: dbConnection?.connected ?? isOAuthConnected
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
    const platformConfig = gameConnectionsConfig.find(p => p.platform === selectedPlatform);
    
    if (platformConfig?.requiresOAuth) {
      void handleOAuthConnection();
    } else {
      if (!validateConnection()) return;
      
      updatePlatformMutation.mutate({
        platform: selectedPlatform as "steam" | "valorant" | "battlenet" | "epicgames" | "startgg",
        username: connectionUsername.trim()
      });
    }
  };

  // Handle OAuth connection
  const handleOAuthConnection = async () => {
    if (selectedPlatform === "valorant") {
      const hasValorantAccount = user?.externalAccounts?.some(account => 
        account.provider.includes("valorant") || account.provider === "custom_valorant"
      );
      
      if (!hasValorantAccount) {
        setConnectionError("Please connect your Valorant account first through your account settings.");
        return;
      }
      
      updateOAuthMutation.mutate({
        platform: "valorant",
        provider: "custom_valorant"
      });
    }
  };

  // Handle disconnect
  const disconnectAccount = (platform: string) => {
    const platformConfig = gameConnectionsConfig.find(config => config.platform === platform);
    const isOAuthConnection = platformConfig?.requiresOAuth && user?.externalAccounts?.some(account => {
      const isValorant = (account.provider.includes("valorant") || account.provider === "custom_valorant") && 
                        account.verification?.status === "verified";
      const isEpicGames = (account.provider.includes("epic_games") || account.provider === "custom_epic_games") && 
                        account.verification?.status === "verified";
      const isStartGG = (account.provider.includes("start_gg") || account.provider === "custom_start_gg") && 
                       account.verification?.status === "verified";
      return isValorant || isEpicGames || isStartGG;
    });

    if (isOAuthConnection) {
      window.open('/dashboard/player/profile', '_blank');
      return;
    }

    removePlatformMutation.mutate({
      platform: platform as "steam" | "valorant" | "battlenet" | "epicgames" | "startgg"
    });
  };

  // If user is not signed in, show sign in prompt
  if (!user) {
    return (
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-lg p-8 my-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogInIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white font-orbitron font-bold text-xl mb-2">Sign In to Connect Your Games</h3>
          <p className="text-gray-300 font-rajdhani mb-6">
            Sign in to your EVAL account to connect your game accounts and unlock detailed analytics
          </p>
          <Link href="/sign-in">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-rajdhani font-bold px-6 py-3 rounded-lg">
              <LogInIcon className="w-4 h-4 mr-2" />
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
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-lg p-6 my-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <GamepadIcon className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-white font-orbitron font-bold text-xl mb-2">Game Connections</h3>
          <p className="text-gray-300 font-rajdhani mb-6">
            This feature is available for players to connect their game accounts and unlock detailed analytics. 
            {userType === "coach" ? " As a coach, you can view player profiles to see their connected games and statistics." : ""}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gameConnectionsConfig.map((game) => (
              <div
                key={game.platform}
                className="p-4 rounded-xl border-2 border-gray-600/50 bg-gray-800/30"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 mb-3 flex items-center justify-center">
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
                      <div className={`p-2 rounded ${game.color}`}>
                        <game.icon className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-white font-medium text-sm">{game.displayName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-lg p-6 my-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-orbitron font-bold text-white mb-2">Connect Your Games</h3>
          <p className="text-sm text-gray-400 font-rajdhani">Connect your accounts from our 4 supported games</p>
        </div>
        {!isEditingGameConnections && (
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium"
            onClick={() => setIsEditingGameConnections(true)}
            disabled={updatePlatformMutation.isPending || updateOAuthMutation.isPending || removePlatformMutation.isPending}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Connect Game
          </Button>
        )}
      </div>

      {/* Featured Games Grid */}
      {!isEditingGameConnections && (
        <div className="mb-6">
          <h4 className="text-sm font-rajdhani font-semibold text-gray-300 mb-3 uppercase tracking-wide">Supported Games</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {gameConnectionsConfig.map((game) => {
              const connection = gameConnections.find(conn => conn.platform === game.platform);
              const isConnected = connection?.connected ?? false;
              
              return (
                <div
                  key={game.platform}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group",
                    isConnected 
                      ? "border-green-500/50 bg-green-500/10 hover:border-green-400/70" 
                      : "border-gray-600/50 bg-gray-800/30 hover:border-gray-500/70"
                  )}
                  onClick={() => !isConnected && setIsEditingGameConnections(true)}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Game Logo */}
                    <div className="w-12 h-12 mb-3 flex items-center justify-center">
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
                        <div className={cn("p-3 rounded-lg", game.color)}>
                          <game.icon className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Game Name */}
                    <h5 className="font-rajdhani font-semibold text-white text-sm mb-1">
                      {game.displayName}
                    </h5>
                    
                    {/* Connection Status */}
                    {isConnected ? (
                      <div className="flex items-center gap-1">
                        <CheckIcon className="h-3 w-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">Connected</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Not Connected</span>
                    )}
                    
                    {/* OAuth Badge */}
                    {game.requiresOAuth && (
                      <Badge variant="outline" className="mt-2 text-xs border-blue-400/50 text-blue-400">
                        OAuth
                      </Badge>
                    )}
                  </div>
                  
                  {/* Connect Overlay */}
                  {!isConnected && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Button size="sm" className="bg-white text-black hover:bg-gray-200">
                        <PlusIcon className="h-3 w-3 mr-1" />
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
        <div className="space-y-6 mb-6 p-6 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-xl border border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <GamepadIcon className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <h4 className="text-lg font-orbitron font-semibold text-white">Connect Game Account</h4>
              <p className="text-sm text-gray-400 font-rajdhani">Choose a game platform to connect your account</p>
            </div>
          </div>
          
          {connectionError && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <XIcon className="h-4 w-4 text-red-400" />
                <p className="text-red-400 text-sm font-medium">{connectionError}</p>
              </div>
            </div>
          )}
          
          <div>
            <Label className="text-white font-rajdhani font-medium mb-3 block">Select Game Platform</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {gameConnectionsConfig.filter(config => {
                const isConnected = gameConnections.find(conn => conn.platform === config.platform)?.connected;
                return !isConnected;
              }).map((platform) => (
                <Button
                  key={platform.platform}
                  variant={selectedPlatform === platform.platform ? "default" : "outline"}
                  className={cn(
                    "h-auto p-4 justify-start text-left transition-all duration-200",
                    selectedPlatform === platform.platform 
                      ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-400 text-white" 
                      : "bg-gray-800/50 border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-gray-700/50"
                  )}
                  onClick={() => setSelectedPlatform(platform.platform)}
                  disabled={updatePlatformMutation.isPending || updateOAuthMutation.isPending}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
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
                      <p className="font-rajdhani font-semibold">{platform.displayName}</p>
                      <p className="text-xs opacity-70">
                        {platform.requiresOAuth ? "OAuth Authentication" : "Manual Username"}
                      </p>
                    </div>
                    {platform.requiresOAuth && (
                      <Badge variant="outline" className="text-xs border-blue-400/50 text-blue-400">
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
              {gameConnectionsConfig.find(p => p.platform === selectedPlatform)?.requiresOAuth ? (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldIcon className="h-5 w-5 text-blue-400" />
                    <div>
                      <h4 className="text-white font-medium">Secure Connection Required</h4>
                      <p className="text-blue-300 text-sm">
                        This platform uses OAuth for secure authentication
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const hasRequiredOAuth = user?.externalAccounts?.some(account => {
                      if (selectedPlatform === "valorant") {
                        return account.provider.includes("valorant") || account.provider === "custom_valorant";
                      } else if (selectedPlatform === "epicgames") {
                        return account.provider.includes("epic_games") || account.provider === "custom_epic_games";
                      }
                      return false;
                    });
                    
                    const getAccountTypeName = () => {
                      if (selectedPlatform === "valorant") return "Valorant";
                      if (selectedPlatform === "epicgames") return "Epic Games";
                      return "OAuth";
                    };
                    
                    return !hasRequiredOAuth ? (
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-3">
                          You need to connect your {getAccountTypeName()} account first
                        </p>
                        <Button
                          variant="outline"
                          className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                          onClick={() => window.open('/dashboard/player/profile', '_blank')}
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Connect {getAccountTypeName()} Account
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                          <CheckIcon className="h-4 w-4" />
                          <span className="text-sm">{getAccountTypeName()} account connected</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Click &quot;Connect Account&quot; to link your {selectedPlatform === "valorant" ? "Valorant" : "Rocket League"} profile
                        </p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <Label htmlFor="gameUsername" className="text-white font-rajdhani">Username</Label>
                  <Input
                    id="gameUsername"
                    value={connectionUsername}
                    onChange={(e) => setConnectionUsername(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="Enter your username"
                    disabled={updatePlatformMutation.isPending}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingGameConnections(false);
                setSelectedPlatform("");
                setConnectionUsername("");
                setConnectionError("");
              }}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-500"
              disabled={updatePlatformMutation.isPending || updateOAuthMutation.isPending}
            >
              <XIcon className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleGameConnectionSave}
              disabled={
                updatePlatformMutation.isPending || 
                updateOAuthMutation.isPending ||
                !selectedPlatform || 
                (gameConnectionsConfig.find(p => p.platform === selectedPlatform)?.requiresOAuth 
                  ? !user?.externalAccounts?.some(account => {
                      const isValorant = account.provider.includes("valorant") || account.provider === "custom_valorant";
                      const isEpicGames = account.provider.includes("epic_games") || account.provider === "custom_epic_games";
                      const isStartGG = account.provider.includes("start_gg") || account.provider === "custom_start_gg";
                      return isValorant || isEpicGames || isStartGG;
                    })
                  : !connectionUsername.trim()
                )
              }
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {(updatePlatformMutation.isPending || updateOAuthMutation.isPending) ? (
                <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4 mr-2" />
              )}
              Connect Account
            </Button>
          </div>
        </div>
      )}
      
      {/* Connected Games List */}
      {gameConnections.some(conn => conn.connected) && (
        <div className="space-y-3">
          <h4 className="text-sm font-rajdhani font-semibold text-gray-300 mb-3 uppercase tracking-wide">Connected Games</h4>
          {gameConnections.filter(conn => conn.connected).map((connection) => {
            const isOAuthConnection = connection.requiresOAuth && user?.externalAccounts?.some(account => {
              const isValorant = (account.provider.includes("valorant") || account.provider === "custom_valorant") && 
                                account.verification?.status === "verified";
              const isEpicGames = (account.provider.includes("epic_games") || account.provider === "custom_epic_games") && 
                                 account.verification?.status === "verified";
              const isStartGG = (account.provider.includes("start_gg") || account.provider === "custom_start_gg") && 
                               account.verification?.status === "verified";
              return isValorant || isEpicGames || isStartGG;
            });

            return (
              <div key={connection.platform} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {connection.platform === "valorant" ? (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Image 
                        src="/valorant/logos/Valorant Logo Red Border.jpg"
                        alt="VALORANT Logo"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                  ) : connection.platform === "epicgames" ? (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <Image 
                        src="/rocket-league/logos/Rocket League Emblem.png"
                        alt="Rocket League Logo"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className={`p-2 rounded ${connection.color}`}>
                      <connection.icon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{connection.displayName}</p>
                      {isOAuthConnection && (
                        <Badge variant="outline" className="text-xs border-blue-400 text-blue-400">
                          OAuth
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">{connection.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-600 text-white">
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
          <span className="ml-2 text-gray-400">Loading your connections...</span>
        </div>
      )}
    </div>
  );
} 