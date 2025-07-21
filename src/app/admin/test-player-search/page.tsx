"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@clerk/nextjs";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

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

export default function PlayerSearchTestPage() {
  const { user } = useUser();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Search form states
  const [searchParams, setSearchParams] = useState({
    game_id: "",
    search: "",
    location: "",
    class_year: "",
    school_type: "",
    min_gpa: undefined as number | undefined,
    max_gpa: undefined as number | undefined,
    role: "",
    min_combine_score: undefined as number | undefined,
    max_combine_score: undefined as number | undefined,
    min_league_score: undefined as number | undefined,
    max_league_score: undefined as number | undefined,
    play_style: "",
    agents: [] as string[],
    favorited_only: false,
    limit: 50,
    offset: 0,
  });

  // Favorite form states
  const [favoriteData, setFavoriteData] = useState({
    player_id: "",
    notes: "Test notes for this player",
    tags: ["priority", "prospect"],
  });

  const [unfavoritePlayerId, setUnfavoritePlayerId] = useState("");

  // tRPC queries and mutations
  const utils = api.useUtils();

  const favoritePlayerMutation = api.playerSearch.favoritePlayer.useMutation();
  const unfavoritePlayerMutation =
    api.playerSearch.unfavoritePlayer.useMutation();

  const handleTest = async (
    testName: string,
    testFn: () => Promise<unknown>,
  ) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));
    setErrors((prev) => ({ ...prev, [testName]: null }));

    try {
      const result = await testFn();
      setResults((prev) => ({ ...prev, [testName]: result }));
    } catch (error: unknown) {
      setErrors((prev) => ({ ...prev, [testName]: error }));
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  // Test functions
  const testGetAvailableGames = () => {
    return handleTest("getAvailableGames", async () => {
      const result = await utils.playerProfile.getAvailableGames.fetch();
      return result;
    });
  };

  const testBasicSearch = () => {
    return handleTest("basicSearch", async () => {
      const result = await utils.playerSearch.searchPlayers.fetch({
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testNameSearch = () => {
    return handleTest("nameSearch", async () => {
      const result = await utils.playerSearch.searchPlayers.fetch({
        search: "Alex",
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testGameFilter = () => {
    return handleTest("gameFilter", async () => {
      // First get available games
      const games = await utils.playerProfile.getAvailableGames.fetch();
      const valorantGame = games.find((g) => g.short_name === "VAL");

      if (!valorantGame) {
        throw new Error("VALORANT game not found");
      }

      const result = await utils.playerSearch.searchPlayers.fetch({
        game_id: valorantGame.id,
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testGameFilterDetailed = () => {
    return handleTest("gameFilterDetailed", async () => {
      // First get available games
      const games = await utils.playerProfile.getAvailableGames.fetch();
      const valorantGame = games.find((g) => g.short_name === "VAL");

      if (!valorantGame) {
        throw new Error("VALORANT game not found");
      }

      // Test all players first
      const allPlayersResult = await utils.playerSearch.searchPlayers.fetch({
        limit: 50,
        offset: 0,
      });

      // Test VALORANT players
      const valorantPlayersResult =
        await utils.playerSearch.searchPlayers.fetch({
          game_id: valorantGame.id,
          limit: 50,
          offset: 0,
        });

      // Count how many players have VALORANT profiles
      const playersWithValorantProfiles = allPlayersResult.players.filter((p) =>
        p.game_profiles.some((gp) => gp.game.short_name === "VAL"),
      );

      return {
        valorantGameId: valorantGame.id,
        totalPlayers: allPlayersResult.totalCount,
        valorantFilteredPlayers: valorantPlayersResult.totalCount,
        playersWithValorantProfiles: playersWithValorantProfiles.length,
        sampleValorantPlayers: valorantPlayersResult.players
          .slice(0, 3)
          .map((p) => ({
            name: `${p.first_name} ${p.last_name}`,
            valorantProfiles: p.game_profiles.filter(
              (gp) => gp.game.short_name === "VAL",
            ),
          })),
        allPlayersSample: allPlayersResult.players.slice(0, 3).map((p) => ({
          name: `${p.first_name} ${p.last_name}`,
          gameProfiles: p.game_profiles.map((gp) => gp.game.short_name),
        })),
      };
    });
  };

  const testSchoolTypeFilter = () => {
    return handleTest("schoolTypeFilter", async () => {
      const result = await utils.playerSearch.searchPlayers.fetch({
        school_type: "UNIVERSITY",
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testGpaFilter = () => {
    return handleTest("gpaFilter", async () => {
      const result = await utils.playerSearch.searchPlayers.fetch({
        min_gpa: 3.5,
        max_gpa: 4.0,
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testRoleFilter = () => {
    return handleTest("roleFilter", async () => {
      const result = await utils.playerSearch.searchPlayers.fetch({
        role: "Duelist",
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testCombineScoreFilter = () => {
    return handleTest("combineScoreFilter", async () => {
      const result = await utils.playerSearch.searchPlayers.fetch({
        min_combine_score: 80,
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testComplexSearch = () => {
    return handleTest("complexSearch", async () => {
      const games = await utils.playerProfile.getAvailableGames.fetch();
      const valorantGame = games.find((g) => g.short_name === "VAL");

      const result = await utils.playerSearch.searchPlayers.fetch({
        game_id: valorantGame?.id,
        search: "a",
        school_type: "UNIVERSITY",
        min_gpa: 3.0,
        role: "Duelist",
        min_combine_score: 50,
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testCustomSearch = () => {
    return handleTest("customSearch", async () => {
      const searchData = { ...searchParams };
      // Clean up undefined values and fix school_type type
      Object.keys(searchData).forEach((key) => {
        if (
          searchData[key as keyof typeof searchData] === undefined ||
          searchData[key as keyof typeof searchData] === ""
        ) {
          delete searchData[key as keyof typeof searchData];
        }
      });

      // Fix school_type type
      if (
        searchData.school_type &&
        !["HIGH_SCHOOL", "COLLEGE", "UNIVERSITY"].includes(
          searchData.school_type,
        )
      ) {
        searchData.school_type = "";
      }

      const result = await utils.playerSearch.searchPlayers.fetch(
        searchData as any,
      );
      return result;
    });
  };

  const testFavoritePlayer = () => {
    return handleTest("favoritePlayer", async () => {
      const result = await favoritePlayerMutation.mutateAsync(favoriteData);
      return result;
    });
  };

  const testUnfavoritePlayer = () => {
    return handleTest("unfavoritePlayer", async () => {
      const result = await unfavoritePlayerMutation.mutateAsync({
        player_id: unfavoritePlayerId,
      });
      return result;
    });
  };

  const testFavoritesOnly = () => {
    return handleTest("favoritesOnly", async () => {
      const result = await utils.playerSearch.searchPlayers.fetch({
        favorited_only: true,
        limit: 10,
        offset: 0,
      });
      return result;
    });
  };

  const testDatabaseCounts = () => {
    return handleTest("databaseCounts", async () => {
      // Get counts directly
      const [gamesResult, playersResult] = await Promise.all([
        utils.playerProfile.getAvailableGames.fetch(),
        utils.playerSearch.searchPlayers.fetch({ limit: 5, offset: 0 }),
      ]);

      return {
        totalGames: gamesResult.length,
        games: gamesResult.map((g) => ({
          id: g.id,
          name: g.name,
          short_name: g.short_name,
        })),
        totalPlayers: playersResult.totalCount,
        samplePlayers: playersResult.players.map((p) => ({
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          main_game: p.main_game,
          game_profiles_count: p.game_profiles.length,
          game_profiles: p.game_profiles.map((gp) => ({
            game: gp.game.short_name,
            role: gp.role,
            username: gp.username,
          })),
        })),
      };
    });
  };

  const clearResults = () => {
    setResults({});
    setErrors({});
  };

  // Helper function to render results
  const renderResult = (testName: string) => {
    const result = results[testName];
    const error = errors[testName];

    if (error) {
      return (
        <div className="mt-2 rounded border border-red-200 bg-red-50 p-3">
          <p className="font-medium text-red-800">Error:</p>
          <pre className="mt-1 text-sm whitespace-pre-wrap text-red-700">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      );
    }

    if (result) {
      return (
        <div className="mt-2 rounded border border-green-200 bg-green-50 p-3">
          <p className="font-medium text-green-800">Success:</p>
          <pre className="mt-1 max-h-48 overflow-auto text-sm whitespace-pre-wrap text-green-700">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      );
    }

    return null;
  };

  // Simple columns for data table
  const columns: ColumnDef<SearchPlayer>[] = [
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <Avatar className="h-8 w-8">
            <AvatarImage src={player.image_url ?? undefined} />
            <AvatarFallback>
              {player.first_name.charAt(0)}
              {player.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <div>
            <div className="font-medium">
              {player.first_name} {player.last_name}
            </div>
            <div className="text-muted-foreground text-sm">
              {player.username}
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
        return player.school_ref?.name || player.school || "No school";
      },
    },
    {
      accessorKey: "gpa",
      header: "GPA",
      cell: ({ row }) => {
        const player = row.original;
        return player.gpa
          ? parseFloat(player.gpa.toString()).toFixed(2)
          : "N/A";
      },
    },
    {
      accessorKey: "main_game",
      header: "Main Game",
      cell: ({ row }) => {
        const player = row.original;
        return player.main_game?.short_name || "N/A";
      },
    },
    {
      accessorKey: "favorited",
      header: "Favorited",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <Badge variant={player.is_favorited ? "default" : "secondary"}>
            {player.is_favorited ? "Yes" : "No"}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold">
          Player Search tRPC Test Page
        </h1>
        <p className="text-muted-foreground">
          Test all playerSearch router endpoints and functionality
        </p>
        {user && (
          <p className="mt-2 text-sm text-blue-600">
            Logged in as: {user.emailAddresses[0]?.emailAddress}
          </p>
        )}
        {!user && (
          <p className="mt-2 text-sm text-red-600">
            Not logged in - you need to authenticate to test these endpoints
          </p>
        )}
      </div>

      <div className="mb-6 flex justify-center gap-4">
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quick Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tests</CardTitle>
            <CardDescription>Pre-configured test scenarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testGetAvailableGames}
              disabled={loading.getAvailableGames}
              className="w-full"
            >
              {loading.getAvailableGames
                ? "Loading..."
                : "Test Get Available Games"}
            </Button>
            {renderResult("getAvailableGames")}

            <Button
              onClick={testBasicSearch}
              disabled={loading.basicSearch}
              className="w-full"
            >
              {loading.basicSearch
                ? "Loading..."
                : "Test Basic Search (First 10 Players)"}
            </Button>
            {renderResult("basicSearch")}

            <Button
              onClick={testDatabaseCounts}
              disabled={loading.databaseCounts}
              className="w-full"
            >
              {loading.databaseCounts
                ? "Loading..."
                : "Test Database Counts & Game Profiles"}
            </Button>
            {renderResult("databaseCounts")}

            <Button
              onClick={testNameSearch}
              disabled={loading.nameSearch}
              className="w-full"
            >
              {loading.nameSearch ? "Loading..." : "Test Name Search (Alex)"}
            </Button>
            {renderResult("nameSearch")}

            <Button
              onClick={testGameFilter}
              disabled={loading.gameFilter}
              className="w-full"
            >
              {loading.gameFilter
                ? "Loading..."
                : "Test Game Filter (VALORANT)"}
            </Button>
            {renderResult("gameFilter")}

            <Button
              onClick={testGameFilterDetailed}
              disabled={loading.gameFilterDetailed}
              className="w-full"
            >
              {loading.gameFilterDetailed
                ? "Loading..."
                : "Test Game Filter (Detailed Debug)"}
            </Button>
            {renderResult("gameFilterDetailed")}

            <Button
              onClick={testSchoolTypeFilter}
              disabled={loading.schoolTypeFilter}
              className="w-full"
            >
              {loading.schoolTypeFilter
                ? "Loading..."
                : "Test School Type Filter (University)"}
            </Button>
            {renderResult("schoolTypeFilter")}

            <Button
              onClick={testGpaFilter}
              disabled={loading.gpaFilter}
              className="w-full"
            >
              {loading.gpaFilter ? "Loading..." : "Test GPA Filter (3.5-4.0)"}
            </Button>
            {renderResult("gpaFilter")}

            <Button
              onClick={testRoleFilter}
              disabled={loading.roleFilter}
              className="w-full"
            >
              {loading.roleFilter ? "Loading..." : "Test Role Filter (Duelist)"}
            </Button>
            {renderResult("roleFilter")}

            <Button
              onClick={testCombineScoreFilter}
              disabled={loading.combineScoreFilter}
              className="w-full"
            >
              {loading.combineScoreFilter
                ? "Loading..."
                : "Test Combine Score Filter (80+)"}
            </Button>
            {renderResult("combineScoreFilter")}

            <Button
              onClick={testComplexSearch}
              disabled={loading.complexSearch}
              className="w-full"
            >
              {loading.complexSearch
                ? "Loading..."
                : "Test Complex Search (Multiple Filters)"}
            </Button>
            {renderResult("complexSearch")}

            <Button
              onClick={testFavoritesOnly}
              disabled={loading.favoritesOnly}
              className="w-full"
            >
              {loading.favoritesOnly ? "Loading..." : "Test Favorites Only"}
            </Button>
            {renderResult("favoritesOnly")}
          </CardContent>
        </Card>

        {/* Custom Search */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Search</CardTitle>
            <CardDescription>Build your own search query</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Name, username, school..."
                  value={searchParams.search}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="State or city..."
                  value={searchParams.location}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="class_year">Class Year</Label>
                <Select
                  value={searchParams.class_year || "all"}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      class_year: value === "all" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="Freshman">Freshman</SelectItem>
                    <SelectItem value="Sophomore">Sophomore</SelectItem>
                    <SelectItem value="Junior">Junior</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="school_type">School Type</Label>
                <Select
                  value={searchParams.school_type || "all"}
                  onValueChange={(value) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      school_type: value === "all" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                    <SelectItem value="COLLEGE">College</SelectItem>
                    <SelectItem value="UNIVERSITY">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min_gpa">Min GPA</Label>
                <Input
                  id="min_gpa"
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  placeholder="0.0"
                  value={searchParams.min_gpa || ""}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      min_gpa: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_gpa">Max GPA</Label>
                <Input
                  id="max_gpa"
                  type="number"
                  min="0"
                  max="4"
                  step="0.1"
                  placeholder="4.0"
                  value={searchParams.max_gpa || ""}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      max_gpa: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  placeholder="e.g., Duelist, Tank, Support"
                  value={searchParams.role}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="play_style">Play Style</Label>
                <Input
                  id="play_style"
                  placeholder="e.g., Aggressive, Tactical"
                  value={searchParams.play_style}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      play_style: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="min_combine_score">Min Combine Score</Label>
                <Input
                  id="min_combine_score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={searchParams.min_combine_score || ""}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      min_combine_score: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="max_combine_score">Max Combine Score</Label>
                <Input
                  id="max_combine_score"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={searchParams.max_combine_score || ""}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      max_combine_score: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="limit">Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min="1"
                  max="100"
                  value={searchParams.limit}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      limit: parseInt(e.target.value) || 50,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="offset">Offset</Label>
                <Input
                  id="offset"
                  type="number"
                  min="0"
                  value={searchParams.offset}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      offset: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>

            <Button
              onClick={testCustomSearch}
              disabled={loading.customSearch}
              className="w-full"
            >
              {loading.customSearch ? "Searching..." : "Run Custom Search"}
            </Button>
            {renderResult("customSearch")}
          </CardContent>
        </Card>

        {/* Favorite Operations */}
        <Card>
          <CardHeader>
            <CardTitle>Favorite Operations</CardTitle>
            <CardDescription>
              Test favoriting and unfavoriting players
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="favorite_player_id">Player ID to Favorite</Label>
              <Input
                id="favorite_player_id"
                placeholder="Enter player ID"
                value={favoriteData.player_id}
                onChange={(e) =>
                  setFavoriteData((prev) => ({
                    ...prev,
                    player_id: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="favorite_notes">Notes</Label>
              <Textarea
                id="favorite_notes"
                placeholder="Add notes about this player..."
                value={favoriteData.notes}
                onChange={(e) =>
                  setFavoriteData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="favorite_tags">Tags (comma separated)</Label>
              <Input
                id="favorite_tags"
                placeholder="priority, prospect, local, etc."
                value={favoriteData.tags.join(", ")}
                onChange={(e) =>
                  setFavoriteData((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  }))
                }
              />
            </div>

            <Button
              onClick={testFavoritePlayer}
              disabled={loading.favoritePlayer}
              className="w-full"
            >
              {loading.favoritePlayer
                ? "Favoriting..."
                : "Test Favorite Player"}
            </Button>
            {renderResult("favoritePlayer")}

            <div className="border-t pt-4">
              <Label htmlFor="unfavorite_player_id">
                Player ID to Unfavorite
              </Label>
              <Input
                id="unfavorite_player_id"
                placeholder="Enter player ID"
                value={unfavoritePlayerId}
                onChange={(e) => setUnfavoritePlayerId(e.target.value)}
              />

              <Button
                onClick={testUnfavoritePlayer}
                disabled={loading.unfavoritePlayer}
                variant="destructive"
                className="mt-2 w-full"
              >
                {loading.unfavoritePlayer
                  ? "Unfavoriting..."
                  : "Test Unfavorite Player"}
              </Button>
              {renderResult("unfavoritePlayer")}
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Search Results Data Table</CardTitle>
            <CardDescription>
              View search results in table format
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.customSearch ||
            results.basicSearch ||
            results.nameSearch ||
            results.gameFilter ? (
              <DataTable
                columns={columns}
                data={
                  (results.customSearch as any)?.players ||
                  (results.basicSearch as any)?.players ||
                  (results.nameSearch as any)?.players ||
                  (results.gameFilter as any)?.players ||
                  []
                }
                loading={
                  loading.customSearch ||
                  loading.basicSearch ||
                  loading.nameSearch ||
                  loading.gameFilter
                }
              />
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                Run a search to see results here
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Developer Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Developer Notes</CardTitle>
          <CardDescription>
            Information about the playerSearch router endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium">Available Endpoints:</h4>
              <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                <li>
                  <code>searchPlayers</code> - Search players with various
                  filters
                </li>
                <li>
                  <code>favoritePlayer</code> - Add a player to favorites with
                  notes and tags
                </li>
                <li>
                  <code>unfavoritePlayer</code> - Remove a player from favorites
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Search Filters Available:</h4>
              <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                <li>game_id, search (name/username/school), location</li>
                <li>class_year, school_type, min_gpa, max_gpa</li>
                <li>role, play_style, agents array</li>
                <li>min_combine_score, max_combine_score</li>
                <li>min_league_score, max_league_score</li>
                <li>favorited_only, limit, offset</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium">Tips:</h4>
              <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                <li>Run "Test Basic Search" first to see if data exists</li>
                <li>Get player IDs from search results to test favoriting</li>
                <li>
                  Use the custom search form to test specific filter
                  combinations
                </li>
                <li>Check the JSON output for detailed response structure</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
