"use client";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Star,
  Filter,
  Bookmark,
  Eye,
  MessageCircle,
  Mail,
  School,
  Calendar,
  MapPin,
  GraduationCap,
  GamepadIcon,
  BookOpen,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { OnboardingGuard } from "@/components/ui/OnboardingGuard";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Player type based on the API response
type SearchPlayer = {
  id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  email: string;
  image_url: string | null;
  location: string | null;
  bio: string | null;
  school: string | null;
  school_ref: {
    name: string;
    type: string;
    location: string;
    state: string;
  } | null;
  class_year: string | null;
  graduation_date: string | null;
  intended_major: string | null;
  gpa: any;
  main_game: {
    name: string;
    short_name: string;
    icon: string | null;
    color: string | null;
  } | null;
  game_profiles: Array<{
    username: string;
    rank: string | null;
    rating: number | null;
    role: string | null;
    agents: string[];
    preferred_maps: string[];
    play_style: string | null;
    combine_score: number | null;
    league_score: number | null;
    game: {
      name: string;
      short_name: string;
      icon: string | null;
      color: string | null;
    };
  }>;
  platform_connections: Array<{
    platform: string;
    username: string;
  }>;
  is_favorited: boolean;
  favorite_info: {
    id: string;
    notes: string | null;
    tags: string[];
    created_at: Date;
  } | null;
  created_at: Date;
};

// Search filters state
interface SearchFilters {
  search: string;
  location: string;
  class_year: string[];
  min_gpa: number;
  max_gpa: number;
  min_rank: string;
  max_rank: string;
  role: string;
  min_combine_score: number;
  max_combine_score: number;
  min_league_score: number;
  max_league_score: number;
  play_style: string;
  agents: string[];
  favorited_only: boolean;
}

export default function CoachPlayerSearchPage() {
  const [currentGameId, setCurrentGameId] = useState<string>("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: "",
    location: "",
    class_year: [],
    min_gpa: 0,
    max_gpa: 4,
    min_rank: "",
    max_rank: "",
    role: "",
    min_combine_score: 0,
    max_combine_score: 100,
    min_league_score: 0,
    max_league_score: 100,
    play_style: "",
    agents: [],
    favorited_only: false,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<SearchPlayer | null>(
    null,
  );
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);

  // Track per-player pending states to prevent duplicate requests
  const [pendingFavorites, setPendingFavorites] = useState<Set<string>>(
    new Set(),
  );
  // Track if optimistic updates have been made
  const [hasOptimisticUpdates, setHasOptimisticUpdates] = useState(false);

  // Fetch available games
  const { data: games = [] } = api.playerProfile.getAvailableGames.useQuery();

  // Debounce the search filters to prevent spam requests
  const debouncedSearchFilters = useDebounce(searchFilters, 300);
  const debouncedGameId = useDebounce(currentGameId, 300);

  // Keep track of available ranks separately to prevent UI flickering
  const [stableAvailableRanks, setStableAvailableRanks] = useState<string[]>(
    [],
  );

  // Track if filters are being applied (when immediate filters don't match debounced ones)
  const isFiltering = useMemo(() => {
    return (
      JSON.stringify(searchFilters) !==
        JSON.stringify(debouncedSearchFilters) ||
      currentGameId !== debouncedGameId
    );
  }, [searchFilters, debouncedSearchFilters, currentGameId, debouncedGameId]);

  // Search players query with proper type conversion using debounced values
  const searchInput = useMemo(
    () => ({
      game_id: debouncedGameId ?? undefined,
      ...debouncedSearchFilters,
      limit: 50,
      offset: 0,
    }),
    [debouncedGameId, debouncedSearchFilters],
  );

  const utils = api.useUtils();
  const { data: searchResults, isLoading: isSearching } =
    api.playerSearch.searchPlayers.useQuery(searchInput);

  // Mutations with optimistic updates for immediate UI feedback while preserving pagination
  const favoritePlayerMutation = api.playerSearch.favoritePlayer.useMutation({
    onMutate: async ({ player_id }) => {
      // Add to pending set to prevent duplicate requests
      setPendingFavorites((prev) => new Set(prev).add(player_id));

      // Cancel outgoing refetches to avoid overwriting optimistic update
      await utils.playerSearch.searchPlayers.cancel();

      // Snapshot previous value
      const previousData = utils.playerSearch.searchPlayers.getData();

      // Optimistically update the cache with stable object references
      utils.playerSearch.searchPlayers.setData(searchInput, (old) => {
        if (!old) return old;

        const updatedPlayers = old.players.map((player) => {
          if (player.id === player_id) {
            return {
              ...player,
              is_favorited: true,
              favorite_info: {
                id: "temp-" + player_id,
                notes: "",
                tags: ["prospect"],
                created_at: new Date(),
              },
            };
          }
          return player; // Return the same object reference for unchanged players
        });

        return {
          ...old,
          players: updatedPlayers,
        };
      });

      // Show immediate success feedback
      toast.success("Player bookmarked successfully", {
        description: "Added to your recruiting prospects",
      });

      // Mark that we have optimistic updates
      setHasOptimisticUpdates(true);

      return { previousData, player_id };
    },
    onSuccess: () => {
      // Only invalidate the favorites query to update sidebar counts, not the search results
      void utils.playerSearch.getFavorites.invalidate();
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.playerSearch.searchPlayers.setData(
          searchInput,
          context.previousData,
        );
      }

      toast.error("Bookmark failed", {
        description: error.message,
      });
    },
    onSettled: (_, __, { player_id }) => {
      // Remove from pending set
      setPendingFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(player_id);
        return newSet;
      });

      // Schedule a delayed cache refresh (5 minutes) to eventually sync data
      // setTimeout(() => {
      //   void utils.playerSearch.searchPlayers.invalidate();
      // }, 5 * 60 * 1000); // 5 minutes
      // No invalidation here - keep the optimistic updates permanent unless there's an error
    },
  });

  const unfavoritePlayerMutation =
    api.playerSearch.unfavoritePlayer.useMutation({
      onMutate: async ({ player_id }) => {
        // Add to pending set to prevent duplicate requests
        setPendingFavorites((prev) => new Set(prev).add(player_id));

        // Cancel outgoing refetches to avoid overwriting optimistic update
        await utils.playerSearch.searchPlayers.cancel();

        // Snapshot previous value
        const previousData = utils.playerSearch.searchPlayers.getData();

        // Optimistically update the cache with stable object references
        utils.playerSearch.searchPlayers.setData(searchInput, (old) => {
          if (!old) return old;

          const updatedPlayers = old.players.map((player) => {
            if (player.id === player_id) {
              return {
                ...player,
                is_favorited: false,
                favorite_info: null,
              };
            }
            return player; // Return the same object reference for unchanged players
          });

          return {
            ...old,
            players: updatedPlayers,
          };
        });

        // Show immediate success feedback
        toast.info("Player removed from bookmarks", {
          description: "Removed from your recruiting prospects",
        });

        // Mark that we have optimistic updates
        setHasOptimisticUpdates(true);

        return { previousData, player_id };
      },
      onSuccess: () => {
        // Only invalidate the favorites query to update sidebar counts, not the search results
        void utils.playerSearch.getFavorites.invalidate();
      },
      onError: (error, _, context) => {
        // Rollback on error
        if (context?.previousData) {
          utils.playerSearch.searchPlayers.setData(
            searchInput,
            context.previousData,
          );
        }

        toast.error("Remove bookmark failed", {
          description: error.message,
        });
      },
      onSettled: (_, __, { player_id }) => {
        // Remove from pending set
        setPendingFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(player_id);
          return newSet;
        });

        // Schedule a delayed cache refresh (5 minutes) to eventually sync data
        // setTimeout(() => {
        //   void utils.playerSearch.searchPlayers.invalidate();
        // }, 5 * 60 * 1000); // 5 minutes
        // No invalidation here - keep the optimistic updates permanent unless there's an error
      },
    });

  // Handle favorite/unfavorite directly without dialog
  const handleToggleFavorite = (player: SearchPlayer) => {
    // Prevent duplicate requests for the same player
    if (pendingFavorites.has(player.id)) {
      return;
    }

    if (player.is_favorited) {
      unfavoritePlayerMutation.mutate({ player_id: player.id });
    } else {
      favoritePlayerMutation.mutate({
        player_id: player.id,
        notes: "",
        tags: ["prospect"],
      });
    }
  };

  // Handle view player profile
  const handleViewPlayer = (player: SearchPlayer) => {
    setSelectedPlayer(player);
    setPlayerDialogOpen(true);
  };

  // Get current game profile for player
  const getGameProfile = (player: SearchPlayer) => {
    return player.game_profiles.find((profile) =>
      currentGameId
        ? profile.game.name === games.find((g) => g.id === currentGameId)?.name
        : false,
    );
  };

  // Helper function to get game icon emoji
  const getGameIcon = (gameShortName: string) => {
    const icons: Record<string, string> = {
      VAL: "🎯",
      OW2: "⚡",
      RL: "🚀",
      SSBU: "🥊",
    };
    return icons[gameShortName] ?? "🎮";
  };

  // Define proper rank orders for different games
  const getGameRankOrder = (gameName: string): string[] => {
    switch (gameName) {
      case "VALORANT":
        return [
          "Iron 1",
          "Iron 2",
          "Iron 3",
          "Bronze 1",
          "Bronze 2",
          "Bronze 3",
          "Silver 1",
          "Silver 2",
          "Silver 3",
          "Gold 1",
          "Gold 2",
          "Gold 3",
          "Platinum 1",
          "Platinum 2",
          "Platinum 3",
          "Diamond 1",
          "Diamond 2",
          "Diamond 3",
          "Ascendant 1",
          "Ascendant 2",
          "Ascendant 3",
          "Immortal 1",
          "Immortal 2",
          "Immortal 3",
          "Radiant",
        ];
      case "Overwatch 2":
        return [
          "Bronze 5",
          "Bronze 4",
          "Bronze 3",
          "Bronze 2",
          "Bronze 1",
          "Silver 5",
          "Silver 4",
          "Silver 3",
          "Silver 2",
          "Silver 1",
          "Gold 5",
          "Gold 4",
          "Gold 3",
          "Gold 2",
          "Gold 1",
          "Platinum 5",
          "Platinum 4",
          "Platinum 3",
          "Platinum 2",
          "Platinum 1",
          "Diamond 5",
          "Diamond 4",
          "Diamond 3",
          "Diamond 2",
          "Diamond 1",
          "Master 5",
          "Master 4",
          "Master 3",
          "Master 2",
          "Master 1",
          "Grandmaster 5",
          "Grandmaster 4",
          "Grandmaster 3",
          "Grandmaster 2",
          "Grandmaster 1",
          "Champion",
          "Top 500",
        ];
      case "Rocket League":
        return [
          "Bronze I",
          "Bronze II",
          "Bronze III",
          "Silver I",
          "Silver II",
          "Silver III",
          "Gold I",
          "Gold II",
          "Gold III",
          "Platinum I",
          "Platinum II",
          "Platinum III",
          "Diamond I",
          "Diamond II",
          "Diamond III",
          "Champion I",
          "Champion II",
          "Champion III",
          "Grand Champion I",
          "Grand Champion II",
          "Grand Champion III",
          "Supersonic Legend",
        ];
      default:
        return [];
    }
  };

  // Get unique ranks for current game in proper competitive order
  const getAvailableRanks = () => {
    if (!currentGameId) return [];
    const currentGame = games.find((g) => g.id === currentGameId);
    if (!currentGame) return [];

    // Skip rank filtering for Smash Ultimate
    if (currentGame.name === "Super Smash Bros. Ultimate") return [];

    const rankOrder = getGameRankOrder(currentGame.name);
    if (rankOrder.length === 0) {
      // Fallback to alphabetical sort for games without defined order
      const ranks = new Set<string>();
      searchResults?.players?.forEach((player) => {
        const gameProfile = player.game_profiles.find(
          (p) => p.game.name === currentGame.name,
        );
        if (gameProfile?.rank) {
          ranks.add(gameProfile.rank);
        }
      });
      return Array.from(ranks).sort();
    }

    // Filter rank order to only include ranks that exist in the data
    const availableRanks = new Set<string>();
    searchResults?.players?.forEach((player) => {
      const gameProfile = player.game_profiles.find(
        (p) => p.game.name === currentGame.name,
      );
      if (gameProfile?.rank) {
        availableRanks.add(gameProfile.rank);
      }
    });

    return rankOrder.filter((rank) => availableRanks.has(rank));
  };

  const players = searchResults?.players ?? [];
  const currentGameName =
    games.find((g) => g.id === currentGameId)?.name ?? "All Games";

  // Memoize available ranks to prevent infinite loops
  const availableRanks = React.useMemo(() => {
    return getAvailableRanks();
  }, [currentGameId, searchResults?.players, games]);

  // Update stable available ranks when new data comes in, but keep them stable during loading
  React.useEffect(() => {
    if (availableRanks.length > 0) {
      setStableAvailableRanks(availableRanks);
    }
  }, [availableRanks]);

  // Column definitions for the data table - memoized to prevent resets
  const columns: ColumnDef<SearchPlayer>[] = React.useMemo(
    () => [
      {
        accessorKey: "avatar",
        header: "",
        cell: ({ row }) => {
          const player = row.original;
          return (
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={player.image_url ?? undefined}
                alt={`${player.first_name} ${player.last_name}`}
              />
              <AvatarFallback className="bg-gray-700 text-white">
                {player.first_name.charAt(0)}
                {player.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Player",
        cell: ({ row }) => {
          const player = row.original;
          const gameProfile = getGameProfile(player);

          return (
            <div className="space-y-1">
              <div className="font-medium text-white">
                {player.first_name} {player.last_name}
              </div>
              <div className="text-sm text-gray-400">
                {gameProfile?.username ?? player.username ?? "No username"}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "school",
        header: "School",
        cell: ({ row }) => {
          const player = row.original;
          return (
            <div className="font-medium text-white">
              {player.school_ref?.name ?? player.school ?? "No school"}
            </div>
          );
        },
      },
      {
        accessorKey: "academics",
        header: "Academics",
        cell: ({ row }) => {
          const player = row.original;
          const gpaNumber = player.gpa ? parseFloat(String(player.gpa)) : null;

          return (
            <div className="space-y-1">
              <div className="font-medium text-white">
                {player.class_year ?? "No class year"}
              </div>
              <div className="text-sm text-gray-400">
                GPA: {gpaNumber?.toFixed(2) ?? "N/A"}
              </div>
            </div>
          );
        },
      },
      // Only show rank column for games that have meaningful ranks (not Smash Ultimate)
      ...(currentGameName !== "Super Smash Bros. Ultimate"
        ? [
            {
              accessorKey: "rank" as keyof SearchPlayer,
              header: "Rank",
              cell: ({ row }: { row: { original: SearchPlayer } }) => {
                const player = row.original;
                const gameProfile = getGameProfile(player);

                return (
                  <div className="font-medium text-white">
                    {gameProfile?.rank ?? "Unranked"}
                  </div>
                );
              },
            },
          ]
        : []),
      {
        accessorKey: "game_profile",
        header: "Game Profile",
        cell: ({ row }) => {
          const player = row.original;
          const gameProfile = getGameProfile(player);

          if (!gameProfile) {
            return (
              <div className="text-sm text-gray-500">
                No profile for selected game
              </div>
            );
          }

          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  {gameProfile.role ?? "No role"}
                </span>
              </div>
              {gameProfile.agents.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {gameProfile.agents.slice(0, 2).map((agent, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-700 text-xs text-gray-300"
                    >
                      {agent}
                    </Badge>
                  ))}
                  {gameProfile.agents.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{gameProfile.agents.length - 2} more
                    </span>
                  )}
                </div>
              )}
              <div className="text-sm text-gray-400">
                {gameProfile.play_style ?? ""}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "eval_scores",
        header: "EVAL Scores",
        cell: ({ row }) => {
          const player = row.original;
          const gameProfile = getGameProfile(player);

          return (
            <div className="space-y-1">
              <div className="text-sm">
                <span className="font-medium text-gray-300">Combine:</span>{" "}
                <span
                  className={
                    gameProfile?.combine_score
                      ? "text-cyan-400"
                      : "text-gray-500"
                  }
                >
                  {gameProfile?.combine_score?.toFixed(1) ?? "N/A"}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-gray-300">League:</span>{" "}
                <span
                  className={
                    gameProfile?.league_score
                      ? "text-green-400"
                      : "text-gray-500"
                  }
                >
                  {gameProfile?.league_score?.toFixed(1) ?? "N/A"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "actions",
        header: "",
        enableHiding: false, // Prevent this column from being hidden
        cell: ({ row }) => {
          const player = row.original;

          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleFavorite(player)}
                className={`${player.is_favorited ? "text-cyan-400 hover:bg-gray-700 hover:text-cyan-300" : "text-gray-500 hover:bg-gray-700 hover:text-white"} ${pendingFavorites.has(player.id) ? "cursor-wait opacity-70" : ""}`}
              >
                <Bookmark
                  className={`h-4 w-4 ${player.is_favorited ? "fill-current" : ""} ${pendingFavorites.has(player.id) ? "animate-pulse" : ""}`}
                />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleViewPlayer(player)}
                className="hover:bg-gray-700 hover:text-white"
              >
                <Eye className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-gray-700 bg-gray-800"
                >
                  <DropdownMenuLabel className="text-gray-300">
                    Actions
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(player.email)}
                    className="text-gray-300 focus:bg-gray-700 focus:text-white"
                  >
                    Copy email
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleViewPlayer(player)}
                    className="text-gray-300 focus:bg-gray-700 focus:text-white"
                  >
                    View full profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white">
                    Send message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [pendingFavorites, currentGameName],
  );

  // Get live player data for dialog to prevent staleness
  const liveSelectedPlayer = selectedPlayer
    ? (players.find((p) => p.id === selectedPlayer.id) ?? selectedPlayer)
    : null;

  // Use a stable reference for the players data to prevent unnecessary re-renders
  const stablePlayers = React.useMemo(() => players, [players]);

  return (
    <OnboardingGuard>
      <div className="flex min-h-screen bg-gray-900">
        {/* Main Content */}
        <div
          className={`flex-1 space-y-6 p-6 ${showFilters ? "mr-80" : ""} transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-orbitron text-3xl font-bold text-white">
                Player Search
              </h1>
              <p className="font-rajdhani text-gray-400">
                Search and recruit players across all supported games
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  void utils.playerSearch.searchPlayers.invalidate();
                  setHasOptimisticUpdates(false);
                  toast.info("Refreshing player data...");
                }}
                className={`border-gray-600 bg-white text-black hover:border-gray-500 ${hasOptimisticUpdates ? "ring-2 ring-cyan-400" : ""}`}
                title={
                  hasOptimisticUpdates
                    ? "Click to sync with server data"
                    : "Refresh player data"
                }
              >
                🔄 Refresh{" "}
                {hasOptimisticUpdates && (
                  <span className="ml-1 text-xs text-cyan-600">•</span>
                )}
              </Button>
              <Button
                variant={searchFilters.favorited_only ? "default" : "outline"}
                onClick={() =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    favorited_only: !prev.favorited_only,
                  }))
                }
                className={`gap-2 bg-white ${searchFilters.favorited_only ? "bg-cyan-600 hover:bg-cyan-700" : "border-gray-600 text-black"}`}
              >
                <Star
                  className={`h-4 w-4 ${searchFilters.favorited_only ? "fill-current" : ""}`}
                />
                {searchFilters.favorited_only
                  ? "Showing Bookmarks"
                  : "Bookmarks Only"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 border-gray-600 bg-white text-black hover:border-gray-500"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Filters"}
              </Button>
            </div>
          </div>

          {/* Game Tabs */}
          <Tabs
            value={currentGameId}
            onValueChange={setCurrentGameId}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 bg-gray-800">
              <TabsTrigger
                value=""
                className="text-gray-300 data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
              >
                All Games
              </TabsTrigger>
              {games.map((game) => (
                <TabsTrigger
                  key={game.id}
                  value={game.id}
                  className="text-gray-300 data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {getGameIcon(game.short_name)}
                    </span>
                    {game.short_name}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="" className="space-y-4">
              <Card className="border-gray-800 bg-gray-900">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white">
                    All Players
                  </CardTitle>
                  <CardDescription className="font-rajdhani text-gray-400">
                    Search across all games and player profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={columns}
                    data={stablePlayers}
                    loading={isSearching || isFiltering}
                    filterColumn="name"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {games.map((game) => (
              <TabsContent key={game.id} value={game.id} className="space-y-4">
                <Card className="border-gray-800 bg-gray-900">
                  <CardHeader>
                    <CardTitle className="font-orbitron flex items-center gap-2 text-white">
                      <span className="text-xl">
                        {getGameIcon(game.short_name)}
                      </span>
                      {game.name} Players
                    </CardTitle>
                    <CardDescription className="font-rajdhani text-gray-400">
                      Search for {game.name} players and view their
                      game-specific profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable
                      columns={columns}
                      data={stablePlayers}
                      loading={isSearching || isFiltering}
                      filterColumn="name"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Right Sidebar Filters */}
        {showFilters && (
          <div className="fixed top-0 right-0 z-50 h-full w-80 overflow-y-auto border-l border-gray-700 bg-gray-800 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-orbitron text-lg font-bold text-white">
                  Search Filters
                </h3>
                {isFiltering && (
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400"></div>
                    <span className="text-xs text-cyan-400">Applying...</span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search" className="text-gray-300">
                  Search
                </Label>
                <Input
                  id="search"
                  placeholder="Name, username, or school..."
                  value={searchFilters.search}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="border-gray-600 bg-gray-900 text-white"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="State or city..."
                  value={searchFilters.location}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="border-gray-600 bg-gray-900 text-white"
                />
              </div>

              {/* Class Year */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Class Year{" "}
                  {searchFilters.class_year.length > 0 &&
                    `(${searchFilters.class_year.length} selected)`}
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Freshman", "Sophomore", "Junior", "Senior"].map((year) => (
                    <Button
                      key={year}
                      variant={
                        searchFilters.class_year.includes(year)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        const newClassYears = searchFilters.class_year.includes(
                          year,
                        )
                          ? searchFilters.class_year.filter((y) => y !== year)
                          : [...searchFilters.class_year, year];
                        setSearchFilters((prev) => ({
                          ...prev,
                          class_year: newClassYears,
                        }));
                      }}
                      className={
                        searchFilters.class_year.includes(year)
                          ? "border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700"
                          : "border-gray-600 bg-gray-900 text-white hover:bg-gray-800"
                      }
                    >
                      {year}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rank Filter - Only show for games with meaningful ranks (not Smash Ultimate) */}
              {currentGameId &&
                stableAvailableRanks.length > 0 &&
                currentGameName !== "Super Smash Bros. Ultimate" && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Rank Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-300">
                          Min Rank
                        </Label>
                        <Select
                          value={searchFilters.min_rank ?? "all"}
                          onValueChange={(value) =>
                            setSearchFilters((prev) => ({
                              ...prev,
                              min_rank: value === "all" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger className="border-gray-600 bg-gray-900 text-xs text-white">
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent className="border-gray-600 bg-gray-800">
                            <SelectItem value="all" className="text-white">
                              No Min
                            </SelectItem>
                            {stableAvailableRanks.map((rank) => (
                              <SelectItem
                                key={rank}
                                value={rank}
                                className="text-white"
                              >
                                {rank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-300">
                          Max Rank
                        </Label>
                        <Select
                          value={searchFilters.max_rank ?? "all"}
                          onValueChange={(value) =>
                            setSearchFilters((prev) => ({
                              ...prev,
                              max_rank: value === "all" ? "" : value,
                            }))
                          }
                        >
                          <SelectTrigger className="border-gray-600 bg-gray-900 text-xs text-white">
                            <SelectValue placeholder="Max" />
                          </SelectTrigger>
                          <SelectContent className="border-gray-600 bg-gray-800">
                            <SelectItem value="all" className="text-white">
                              No Max
                            </SelectItem>
                            {stableAvailableRanks.map((rank) => (
                              <SelectItem
                                key={rank}
                                value={rank}
                                className="text-white"
                              >
                                {rank}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

              {/* GPA Range Slider */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  GPA Range: {searchFilters.min_gpa.toFixed(1)} -{" "}
                  {searchFilters.max_gpa.toFixed(1)}
                </Label>
                <Slider
                  range
                  value={[searchFilters.min_gpa, searchFilters.max_gpa]}
                  onValueChange={(value) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      min_gpa: value[0],
                      max_gpa: value[1],
                    }))
                  }
                  min={0}
                  max={4}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Combine Score Range Slider */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Combine Score Range: {searchFilters.min_combine_score} -{" "}
                  {searchFilters.max_combine_score}
                </Label>
                <Slider
                  range
                  value={[
                    searchFilters.min_combine_score,
                    searchFilters.max_combine_score,
                  ]}
                  onValueChange={(value) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      min_combine_score: value[0],
                      max_combine_score: value[1],
                    }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* League Score Range Slider */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  League Score Range: {searchFilters.min_league_score} -{" "}
                  {searchFilters.max_league_score}
                </Label>
                <Slider
                  range
                  value={[
                    searchFilters.min_league_score,
                    searchFilters.max_league_score,
                  ]}
                  onValueChange={(value) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      min_league_score: value[0],
                      max_league_score: value[1],
                    }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Clear Filters Button */}
              <Button
                variant="outline"
                onClick={() =>
                  setSearchFilters({
                    search: "",
                    location: "",
                    class_year: [],
                    min_gpa: 0,
                    max_gpa: 4,
                    min_rank: "",
                    max_rank: "",
                    role: "",
                    min_combine_score: 0,
                    max_combine_score: 100,
                    min_league_score: 0,
                    max_league_score: 100,
                    play_style: "",
                    agents: [],
                    favorited_only: false,
                  })
                }
                className="w-full border-gray-600 bg-white text-black"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {/* Player Profile Dialog */}
        <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-gray-800 bg-gray-900">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-2xl text-white">
                Player Profile
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Detailed information about {liveSelectedPlayer?.first_name}{" "}
                {liveSelectedPlayer?.last_name}
              </DialogDescription>
            </DialogHeader>

            {liveSelectedPlayer && (
              <div className="space-y-6">
                {/* Player Header */}
                <div className="flex items-start gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={liveSelectedPlayer.image_url ?? undefined}
                    />
                    <AvatarFallback className="bg-gray-700 text-xl text-white">
                      {liveSelectedPlayer.first_name.charAt(0)}
                      {liveSelectedPlayer.last_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-orbitron text-2xl font-bold text-white">
                      {liveSelectedPlayer.first_name}{" "}
                      {liveSelectedPlayer.last_name}
                    </h3>
                    <p className="font-rajdhani text-gray-400">
                      @{liveSelectedPlayer.username ?? "No username"}
                    </p>

                    <div className="mt-2 flex items-center gap-4">
                      {liveSelectedPlayer.main_game && (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {getGameIcon(
                              liveSelectedPlayer.main_game.short_name,
                            )}
                          </span>
                          <span className="text-white">
                            {liveSelectedPlayer.main_game.name}
                          </span>
                        </div>
                      )}

                      {liveSelectedPlayer.is_favorited && (
                        <Badge
                          variant="default"
                          className="bg-cyan-600 text-white"
                        >
                          Bookmarked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleToggleFavorite(liveSelectedPlayer)}
                    className={`${liveSelectedPlayer.is_favorited ? "bg-red-600 hover:bg-red-700" : "bg-cyan-600 hover:bg-cyan-700"} ${pendingFavorites.has(liveSelectedPlayer.id) ? "cursor-wait opacity-70" : ""}`}
                  >
                    <Bookmark
                      className={`mr-2 h-4 w-4 ${pendingFavorites.has(liveSelectedPlayer.id) ? "animate-pulse" : ""}`}
                    />
                    {liveSelectedPlayer.is_favorited
                      ? "Remove Bookmark"
                      : "Add Bookmark"}
                  </Button>
                  {liveSelectedPlayer.username && (
                    <Link
                      href={`/profiles/player/${liveSelectedPlayer.username}`}
                      target="_blank"
                    >
                      <Button
                        variant="outline"
                        className="border-gray-600 bg-white text-black hover:text-gray-800"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Public Profile
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="border-gray-600 bg-white text-black hover:text-gray-800"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                  <Link href={`mailto:${liveSelectedPlayer.email}`}>
                    <Button
                      variant="outline"
                      className="border-gray-600 bg-white text-black hover:text-gray-800"
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email Player
                    </Button>
                  </Link>
                </div>

                {/* Player Information Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Academic Info */}
                  <div>
                    <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                      <GraduationCap className="h-5 w-5 text-cyan-400" />
                      Academic Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">School:</span>
                        <span className="text-white">
                          {liveSelectedPlayer.school_ref?.name ??
                            liveSelectedPlayer.school ??
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Class Year:</span>
                        <span className="text-white">
                          {liveSelectedPlayer.class_year ?? "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">GPA:</span>
                        <span className="text-white">
                          {liveSelectedPlayer.gpa
                            ? parseFloat(
                                liveSelectedPlayer.gpa.toString(),
                              ).toFixed(2)
                            : "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Intended Major:</span>
                        <span className="text-white">
                          {liveSelectedPlayer.intended_major ?? "Not specified"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Graduation:</span>
                        <span className="text-white">
                          {liveSelectedPlayer.graduation_date ??
                            "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location */}
                  <div>
                    <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                      <MapPin className="h-5 w-5 text-cyan-400" />
                      Contact & Location
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="font-mono text-sm text-white">
                          {liveSelectedPlayer.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">
                          {liveSelectedPlayer.location ?? "Not specified"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game Profiles */}
                {liveSelectedPlayer.game_profiles.length > 0 && (
                  <div>
                    <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                      <GamepadIcon className="h-5 w-5 text-cyan-400" />
                      Game Profiles
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {liveSelectedPlayer.game_profiles.map((profile, idx) => (
                        <div key={idx} className="rounded-lg bg-gray-800 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <span className="text-xl">
                              {getGameIcon(profile.game.short_name)}
                            </span>
                            <span className="font-orbitron font-bold text-white">
                              {profile.game.name}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Rank:</span>
                              <span className="text-white">
                                {profile.rank ?? "Unranked"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Role:</span>
                              <span className="text-white">
                                {profile.role ?? "Not specified"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Username:</span>
                              <span className="font-mono text-white">
                                {profile.username}
                              </span>
                            </div>
                            {profile.combine_score && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  Combine Score:
                                </span>
                                <span className="text-white">
                                  {profile.combine_score.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Player Bio */}
                {liveSelectedPlayer.bio && (
                  <div>
                    <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                      <BookOpen className="h-5 w-5 text-cyan-400" />
                      Player Bio
                    </h4>
                    <div className="rounded-lg bg-gray-800 p-4">
                      <p className="font-rajdhani text-gray-300">
                        {liveSelectedPlayer.bio}
                      </p>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="border-t border-gray-700 pt-4 text-center">
                  <p className="text-sm text-gray-400">
                    Player profile created:{" "}
                    {new Date(
                      liveSelectedPlayer.created_at,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </OnboardingGuard>
  );
}
