"use client";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react/no-unescaped-entities */

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Bookmark,
  BookOpen,
  Clock,
  Edit,
  Eye,
  Filter,
  GamepadIcon,
  GraduationCap,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Target,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

interface Prospect {
  id: string;
  notes: string | null;
  tags: string[];
  created_at: Date;
  updated_at: Date;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    username: string | null;
    email: string;
    image_url: string | null;
    location: string | null;
    bio: string | null;
    school: string | null;
    class_year: string | null;
    graduation_date: string | null;
    intended_major: string | null;
    gpa: any;
    school_ref: {
      name: string;
      type: string;
    } | null;
    main_game: {
      name: string;
      short_name: string;
      icon: string | null;
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
      };
    }>;
  };
}

export default function MyProspectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Prospect | null>(null);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");

  // Fetch coach's favorited players
  const utils = api.useUtils();
  const { data: prospects = [], isLoading } =
    api.playerSearch.getFavorites.useQuery();

  // Mutations with optimistic updates
  const updateFavoriteMutation = api.playerSearch.updateFavorite.useMutation({
    onMutate: async ({ player_id, notes, tags }) => {
      // Cancel outgoing refetches
      await utils.playerSearch.getFavorites.cancel();

      // Snapshot the previous value
      const previousData = utils.playerSearch.getFavorites.getData();

      // Optimistically update the cache
      utils.playerSearch.getFavorites.setData(undefined, (old) => {
        if (!old) return old;
        return old.map((prospect) =>
          prospect.player.id === player_id
            ? {
                ...prospect,
                notes: notes ?? null,
                tags: tags ?? [],
                updated_at: new Date(),
              }
            : prospect,
        );
      });

      return { previousData };
    },
    onSuccess: () => {
      toast.success("Prospect updated successfully");
      setEditNotesOpen(false);
      setEditingProspect(null);
    },
    onError: (error, _, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        utils.playerSearch.getFavorites.setData(
          undefined,
          context.previousData,
        );
      }
      toast.error("Update failed", {
        description: error.message,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      void utils.playerSearch.getFavorites.invalidate();
    },
  });

  const unfavoriteMutation = api.playerSearch.unfavoritePlayer.useMutation({
    onMutate: async ({ player_id }) => {
      // Cancel outgoing refetches
      await utils.playerSearch.getFavorites.cancel();

      // Snapshot the previous value
      const previousData = utils.playerSearch.getFavorites.getData();

      // Optimistically remove from the cache
      utils.playerSearch.getFavorites.setData(undefined, (old) => {
        if (!old) return old;
        return old.filter((prospect) => prospect.player.id !== player_id);
      });

      // Show immediate success feedback
      toast.info("Prospect removed from list");

      return { previousData };
    },
    onError: (error, _, context) => {
      // Revert optimistic update
      if (context?.previousData) {
        utils.playerSearch.getFavorites.setData(
          undefined,
          context.previousData,
        );
      }
      toast.error("Remove failed", {
        description: error.message,
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      void utils.playerSearch.getFavorites.invalidate();
    },
  });

  // Get unique games and tags for filtering
  const availableGames = Array.from(
    new Set(
      prospects
        .map((p) => p.player.main_game?.short_name)
        .filter((name): name is string => Boolean(name)),
    ),
  );
  const availableTags = Array.from(new Set(prospects.flatMap((p) => p.tags)));

  // Filter prospects based on search and filters
  const filteredProspects = prospects.filter((prospect) => {
    const player = prospect.player;
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const school = (
      player.school_ref?.name ??
      player.school ??
      ""
    ).toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      fullName.includes(searchLower) ||
      school.includes(searchLower) ||
      Boolean(player.username?.toLowerCase().includes(searchLower)) ||
      Boolean(player.location?.toLowerCase().includes(searchLower));

    const matchesGame =
      selectedGame === "all" || player.main_game?.short_name === selectedGame;
    const matchesTag =
      selectedTag === "all" || prospect.tags.includes(selectedTag);

    return matchesSearch && matchesGame && matchesTag;
  });

  // Group prospects by priority/tags for easier organization
  const priorityProspects = filteredProspects.filter((p) =>
    p.tags.includes("priority"),
  );
  const recentProspects = filteredProspects
    .filter((p) => !p.tags.includes("priority"))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 10);

  const handleEditProspect = (prospect: Prospect) => {
    setEditingProspect(prospect);
    setEditNotes(prospect.notes || "");
    setEditTags(prospect.tags);
    setEditNotesOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingProspect) return;

    updateFavoriteMutation.mutate({
      player_id: editingProspect.player.id,
      notes: editNotes,
      tags: editTags,
    });
  };

  const handleRemoveProspect = (prospect: Prospect) => {
    if (
      confirm(
        `Are you sure you want to remove ${prospect.player.first_name} ${prospect.player.last_name} from your prospects?`,
      )
    ) {
      unfavoriteMutation.mutate({ player_id: prospect.player.id });
    }
  };

  const handleViewPlayer = (prospect: Prospect) => {
    setSelectedPlayer(prospect);
    setPlayerDialogOpen(true);
  };

  const getGameIcon = (gameShortName: string) => {
    const icons: Record<string, string> = {
      VAL: "🎯",
      OW2: "⚡",
      RL: "🚀",
      SSBU: "🥊",
    };
    return icons[gameShortName] || "🎮";
  };

  const getTagBadgeVariant = (
    tag: string,
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (tag.toLowerCase()) {
      case "priority":
        return "destructive";
      case "prospect":
        return "default";
      case "local":
        return "secondary";
      case "top_talent":
        return "default";
      default:
        return "outline";
    }
  };

  // Get current data based on tab
  const getCurrentProspects = () => {
    switch (currentTab) {
      case "priority":
        return priorityProspects;
      case "recent":
        return recentProspects;
      default:
        return filteredProspects;
    }
  };

  // Column definitions for the data table
  const columns: ColumnDef<Prospect>[] = [
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const prospect = row.original;
        const player = prospect.player;
        return (
          <Avatar className="h-12 w-12">
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
      accessorKey: "player",
      header: "Player",
      cell: ({ row }) => {
        const prospect = row.original;
        const player = prospect.player;

        return (
          <div className="space-y-2">
            <div className="text-lg font-medium text-white">
              {player.first_name} {player.last_name}
            </div>
            <div className="text-sm text-gray-400">
              @{player.username || "No username"}
            </div>
            {player.main_game && (
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {getGameIcon(player.main_game.short_name)}
                </span>
                <span className="text-sm text-gray-300">
                  {player.main_game.name}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "school",
      header: "School & Academics",
      cell: ({ row }) => {
        const prospect = row.original;
        const player = prospect.player;
        const gpaNumber = player.gpa ? parseFloat(String(player.gpa)) : null;

        return (
          <div className="space-y-2">
            <div className="font-medium text-white">
              {player.school_ref?.name || player.school || "No school"}
            </div>
            <div className="text-sm text-gray-400">
              {player.class_year || "No class year"} • GPA:{" "}
              {gpaNumber?.toFixed(2) || "N/A"}
            </div>
            {player.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {player.location}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "game_profile",
      header: "Game Profile",
      cell: ({ row }) => {
        const prospect = row.original;
        const player = prospect.player;
        const mainGameProfile = player.game_profiles.find(
          (p) => p.game.name === player.main_game?.name,
        );

        if (!mainGameProfile) {
          return <div className="text-sm text-gray-500">No game profile</div>;
        }

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">
                {mainGameProfile.rank || "Unranked"}
              </span>
            </div>
            <div className="text-sm text-gray-400">
              {mainGameProfile.role || "No role"}
            </div>
            {mainGameProfile.agents.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {mainGameProfile.agents.slice(0, 2).map((agent, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-gray-700 text-xs text-gray-300"
                  >
                    {agent}
                  </Badge>
                ))}
                {mainGameProfile.agents.length > 2 && (
                  <span className="text-xs text-gray-500">
                    +{mainGameProfile.agents.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "eval_scores",
      header: "EVAL Scores",
      cell: ({ row }) => {
        const prospect = row.original;
        const player = prospect.player;
        const mainGameProfile = player.game_profiles.find(
          (p) => p.game.name === player.main_game?.name,
        );

        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-300">Combine:</span>{" "}
              <span
                className={
                  mainGameProfile?.combine_score
                    ? "font-medium text-cyan-400"
                    : "text-gray-500"
                }
              >
                {mainGameProfile?.combine_score?.toFixed(1) || "N/A"}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-300">League:</span>{" "}
              <span
                className={
                  mainGameProfile?.league_score
                    ? "font-medium text-green-400"
                    : "text-gray-500"
                }
              >
                {mainGameProfile?.league_score?.toFixed(1) || "N/A"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "prospect_info",
      header: "Prospect Info",
      cell: ({ row }) => {
        const prospect = row.original;

        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {prospect.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant={getTagBadgeVariant(tag)}
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              Added {new Date(prospect.created_at).toLocaleDateString()}
            </div>
            {prospect.notes && (
              <div className="max-w-xs rounded bg-gray-800 p-2 text-xs text-gray-300">
                {prospect.notes.length > 50
                  ? `${prospect.notes.substring(0, 50)}...`
                  : prospect.notes}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => {
        const prospect = row.original;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewPlayer(prospect)}
              className="text-gray-400 hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditProspect(prospect)}
              className="text-gray-400 hover:text-cyan-400"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
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
                  onClick={() =>
                    navigator.clipboard.writeText(prospect.player.email)
                  }
                  className="text-gray-300 focus:bg-gray-700 focus:text-white"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewPlayer(prospect)}
                  className="text-gray-300 focus:bg-gray-700 focus:text-white"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View full profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEditProspect(prospect)}
                  className="text-gray-300 focus:bg-gray-700 focus:text-white"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit notes & tags
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send message
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={() => handleRemoveProspect(prospect)}
                  className="text-red-400 focus:bg-gray-700 focus:text-red-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove prospect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-cyan-500"></div>
          <div className="font-rajdhani text-white">
            Loading your prospects...
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no prospects
  if (prospects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-white">
              My Prospects
            </h1>
            <p className="font-rajdhani text-gray-400">
              Track and manage your favorited players
            </p>
          </div>
          <Button
            asChild
            className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
          >
            <Link href="/dashboard/coaches/player-search">
              <Search className="mr-2 h-4 w-4" />
              Find Players
            </Link>
          </Button>
        </div>

        <div className="py-12 text-center">
          <Heart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
          <h3 className="font-orbitron mb-2 text-xl text-white">
            No Prospects Yet
          </h3>
          <p className="font-rajdhani mb-6 text-gray-400">
            Start building your prospect list by favoriting players during your
            search
          </p>
          <Button
            asChild
            className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
          >
            <Link href="/dashboard/coaches/player-search">
              <Search className="mr-2 h-4 w-4" />
              Search for Players
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Main Content */}
      <div
        className={`flex-1 space-y-6 p-6 ${showFilters ? "mr-80" : ""} transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-white">
              My Prospects
            </h1>
            <p className="font-rajdhani text-gray-400">
              Track and manage your favorited players ({prospects.length} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
            >
              <Link href="/dashboard/coaches/player-search">
                <Plus className="mr-2 h-4 w-4" />
                Add More Players
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 border-gray-600 bg-white text-black hover:border-gray-500 hover:text-white"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Filters"}
            </Button>
          </div>
        </div>

        {/* Prospects Organization Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger
              value="all"
              className="text-gray-300 data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
            >
              All Prospects ({filteredProspects.length})
            </TabsTrigger>
            <TabsTrigger
              value="priority"
              className="text-gray-300 data-[state=active]:bg-red-600 data-[state=active]:text-white"
            >
              Priority ({priorityProspects.length})
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="text-gray-300 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            >
              Recent Activity
            </TabsTrigger>
          </TabsList>

          {/* All Prospects */}
          <TabsContent value="all" className="space-y-4">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">
                  All Prospects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProspects.length === 0 ? (
                  <div className="py-8 text-center">
                    <Search className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="font-rajdhani text-gray-400">
                      No prospects match your current filters
                    </p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={filteredProspects}
                    loading={false}
                    filterColumn="player"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Priority Prospects */}
          <TabsContent value="priority" className="space-y-4">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-red-400" />
                  Priority Prospects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priorityProspects.length === 0 ? (
                  <div className="py-8 text-center">
                    <Target className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="font-rajdhani text-gray-400">
                      No priority prospects yet
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Tag your most important prospects with "priority"
                    </p>
                  </div>
                ) : (
                  <DataTable
                    columns={columns}
                    data={priorityProspects}
                    loading={false}
                    filterColumn="player"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="recent" className="space-y-4">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-green-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={recentProspects}
                  loading={false}
                  filterColumn="player"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Sidebar Filters */}
      {showFilters && (
        <div className="fixed top-0 right-0 z-50 h-full w-80 overflow-y-auto border-l border-gray-700 bg-gray-800 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-orbitron text-lg font-bold text-white">
              Prospect Filters
            </h3>
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
                placeholder="Name, username, school, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-600 bg-gray-900 text-white"
              />
            </div>

            {/* Game Filter */}
            <div className="space-y-2">
              <Label htmlFor="game" className="text-gray-300">
                Game
              </Label>
              <select
                id="game"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              >
                <option value="all">All Games</option>
                {availableGames.map((game) => (
                  <option key={game} value={game}>
                    {game}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag Filter */}
            <div className="space-y-2">
              <Label htmlFor="tag" className="text-gray-300">
                Tag
              </Label>
              <select
                id="tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white"
              >
                <option value="all">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedGame("all");
                setSelectedTag("all");
              }}
              className="w-full border-gray-600 text-black hover:text-white"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Edit Notes Dialog */}
      <Dialog open={editNotesOpen} onOpenChange={setEditNotesOpen}>
        <DialogContent className="max-w-2xl border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl text-white">
              Edit Prospect
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update notes and tags for {editingProspect?.player.first_name}{" "}
              {editingProspect?.player.last_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add your notes about this prospect..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-300">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                placeholder="priority, local, top_talent, etc."
                value={editTags.join(", ")}
                onChange={(e) =>
                  setEditTags(
                    e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  )
                }
                className="border-gray-700 bg-gray-800 text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditNotesOpen(false)}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={updateFavoriteMutation.isPending}
                className="bg-cyan-600 text-white hover:bg-cyan-700"
              >
                {updateFavoriteMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Details Dialog */}
      <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-2xl text-white">
              Player Profile
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about {selectedPlayer?.player.first_name}{" "}
              {selectedPlayer?.player.last_name}
            </DialogDescription>
          </DialogHeader>

          {selectedPlayer && (
            <div className="space-y-6">
              {/* Player Header */}
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={selectedPlayer.player.image_url ?? undefined}
                  />
                  <AvatarFallback className="bg-gray-700 text-xl text-white">
                    {selectedPlayer.player.first_name.charAt(0)}
                    {selectedPlayer.player.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-orbitron text-2xl font-bold text-white">
                    {selectedPlayer.player.first_name}{" "}
                    {selectedPlayer.player.last_name}
                  </h3>
                  <p className="font-rajdhani text-gray-400">
                    @{selectedPlayer.player.username || "No username"}
                  </p>

                  <div className="mt-2 flex items-center gap-4">
                    {selectedPlayer.player.main_game && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {getGameIcon(
                            selectedPlayer.player.main_game.short_name,
                          )}
                        </span>
                        <span className="text-white">
                          {selectedPlayer.player.main_game.name}
                        </span>
                      </div>
                    )}

                    <Badge variant="default" className="bg-cyan-600 text-white">
                      <Bookmark className="mr-1 h-3 w-3" />
                      Prospect
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => handleEditProspect(selectedPlayer)}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Notes & Tags
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Player
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveProspect(selectedPlayer)}
                  className="border-red-600 text-red-400 hover:border-red-500 hover:text-red-300"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Prospect
                </Button>
              </div>

              {/* Prospect Information */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Prospect Details */}
                <div>
                  <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                    <Bookmark className="h-5 w-5 text-cyan-400" />
                    Prospect Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Tags:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {selectedPlayer.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant={getTagBadgeVariant(tag)}
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Added:</span>
                      <span className="ml-2 text-white">
                        {new Date(
                          selectedPlayer.created_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="ml-2 text-white">
                        {new Date(
                          selectedPlayer.updated_at,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedPlayer.notes && (
                      <div>
                        <span className="text-gray-400">Notes:</span>
                        <div className="mt-1 rounded-lg bg-gray-800 p-3">
                          <p className="text-sm text-gray-300">
                            {selectedPlayer.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

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
                        {selectedPlayer.player.school_ref?.name ||
                          selectedPlayer.player.school ||
                          "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Class Year:</span>
                      <span className="text-white">
                        {selectedPlayer.player.class_year || "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GPA:</span>
                      <span className="text-white">
                        {selectedPlayer.player.gpa
                          ? parseFloat(
                              selectedPlayer.player.gpa.toString(),
                            ).toFixed(2)
                          : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Intended Major:</span>
                      <span className="text-white">
                        {selectedPlayer.player.intended_major ||
                          "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Graduation:</span>
                      <span className="text-white">
                        {selectedPlayer.player.graduation_date ||
                          "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div>
                <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                  <MapPin className="h-5 w-5 text-cyan-400" />
                  Contact & Location
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-mono text-sm text-white">
                      {selectedPlayer.player.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">
                      {selectedPlayer.player.location || "Not specified"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Game Profiles */}
              {selectedPlayer.player.game_profiles.length > 0 && (
                <div>
                  <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                    <GamepadIcon className="h-5 w-5 text-cyan-400" />
                    Game Profiles
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {selectedPlayer.player.game_profiles.map((profile, idx) => (
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
                              {profile.rank || "Unranked"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Role:</span>
                            <span className="text-white">
                              {profile.role || "Not specified"}
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
              {selectedPlayer.player.bio && (
                <div>
                  <h4 className="font-orbitron mb-3 flex items-center gap-2 font-bold text-white">
                    <BookOpen className="h-5 w-5 text-cyan-400" />
                    Player Bio
                  </h4>
                  <div className="rounded-lg bg-gray-800 p-4">
                    <p className="font-rajdhani text-gray-300">
                      {selectedPlayer.player.bio}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
