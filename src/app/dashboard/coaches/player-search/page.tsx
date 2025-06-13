"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Star, Filter, Heart } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
  class_year: string;
  school_type: string;
  min_gpa: number | undefined;
  max_gpa: number | undefined;
  role: string;
  min_combine_score: number | undefined;
  max_combine_score: number | undefined;
  min_league_score: number | undefined;
  max_league_score: number | undefined;
  play_style: string;
  agents: string[];
  favorited_only: boolean;
}

export default function CoachPlayerSearchPage() {
  const { toast } = useToast();
  const [currentGameId, setCurrentGameId] = useState<string>("");
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: "",
    location: "",
    class_year: "",
    school_type: "",
    min_gpa: undefined,
    max_gpa: undefined,
    role: "",
    min_combine_score: undefined,
    max_combine_score: undefined,
    min_league_score: undefined,
    max_league_score: undefined,
    play_style: "",
    agents: [],
    favorited_only: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<SearchPlayer | null>(null);
  const [favoriteNotes, setFavoriteNotes] = useState("");
  const [favoriteTags, setFavoriteTags] = useState<string[]>([]);

  // Fetch available games
  const { data: games = [] } = api.playerProfile.getAvailableGames.useQuery();

  // Search players query with proper type conversion
  const searchInput = {
    game_id: currentGameId || undefined,
    ...searchFilters,
    school_type: searchFilters.school_type ? searchFilters.school_type as "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY" : undefined,
    limit: 50,
    offset: 0,
  };

  const { data: searchResults, isLoading: isSearching, refetch: refetchPlayers } = api.playerSearch.searchPlayers.useQuery(searchInput);

  // Mutations
  const favoritePlayerMutation = api.playerSearch.favoritePlayer.useMutation({
    onSuccess: () => {
      toast({ title: "Player added to favorites" });
      void refetchPlayers();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const unfavoritePlayerMutation = api.playerSearch.unfavoritePlayer.useMutation({
    onSuccess: () => {
      toast({ title: "Player removed from favorites" });
      void refetchPlayers();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Handle favorite/unfavorite
  const handleToggleFavorite = (player: SearchPlayer) => {
    if (player.is_favorited) {
      unfavoritePlayerMutation.mutate({ player_id: player.id });
    } else {
      setSelectedPlayer(player);
      setFavoriteNotes("");
      setFavoriteTags([]);
    }
  };

  const handleSaveFavorite = () => {
    if (!selectedPlayer) return;
    
    favoritePlayerMutation.mutate({
      player_id: selectedPlayer.id,
      notes: favoriteNotes,
      tags: favoriteTags,
    });
    setSelectedPlayer(null);
  };

  // Get current game profile for player
  const getGameProfile = (player: SearchPlayer) => {
    return player.game_profiles.find(profile => 
      currentGameId ? profile.game.name === games.find(g => g.id === currentGameId)?.name : false
    );
  };

  // Column definitions for the data table
  const columns: ColumnDef<SearchPlayer>[] = [
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const player = row.original;
        return (
          <Avatar className="h-10 w-10">
            <AvatarImage src={player.image_url ?? undefined} alt={`${player.first_name} ${player.last_name}`} />
            <AvatarFallback>
              {player.first_name.charAt(0)}{player.last_name.charAt(0)}
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
        const currentGame = games.find(g => g.id === currentGameId);
        
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {player.first_name} {player.last_name}
            </div>
            <div className="text-sm text-muted-foreground">
              {gameProfile?.username || player.username || 'No username'}
            </div>
            {currentGame && gameProfile && (
              <div className="flex items-center gap-2">
                <img 
                  src={currentGame.icon || ''} 
                  alt={currentGame.name}
                  className="w-4 h-4"
                />
                <span className="text-xs text-muted-foreground">
                  {gameProfile.rank || 'Unranked'}
                </span>
              </div>
            )}
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
          <div className="space-y-1">
            <div className="font-medium">
              {player.school_ref?.name || player.school || 'No school'}
            </div>
            <div className="text-sm text-muted-foreground">
              {player.school_ref?.type.replace('_', ' ') || ''}
            </div>
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
            <div className="font-medium">
              {player.class_year || 'No class year'}
            </div>
            <div className="text-sm text-muted-foreground">
              GPA: {gpaNumber?.toFixed(2) || 'N/A'}
            </div>
            {player.intended_major && (
              <div className="text-xs text-muted-foreground">
                {player.intended_major}
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
        const player = row.original;
        const gameProfile = getGameProfile(player);
        
        if (!gameProfile) {
          return (
            <div className="text-sm text-muted-foreground">
              No profile for selected game
            </div>
          );
        }
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{gameProfile.role || 'No role'}</span>
            </div>
            {gameProfile.agents.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {gameProfile.agents.slice(0, 2).map((agent, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {agent}
                  </Badge>
                ))}
                {gameProfile.agents.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{gameProfile.agents.length - 2} more
                  </span>
                )}
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {gameProfile.play_style || ''}
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
              <span className="font-medium">Combine:</span>{' '}
              <span className={gameProfile?.combine_score ? 'text-blue-400' : 'text-muted-foreground'}>
                {gameProfile?.combine_score?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium">League:</span>{' '}
              <span className={gameProfile?.league_score ? 'text-green-400' : 'text-muted-foreground'}>
                {gameProfile?.league_score?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const player = row.original;
        
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleFavorite(player)}
              className={player.is_favorited ? 'text-red-400 hover:text-red-300' : 'text-muted-foreground hover:text-foreground'}
            >
              <Heart className={`h-4 w-4 ${player.is_favorited ? 'fill-current' : ''}`} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(player.email)}
                >
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  View full profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Send message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const players = searchResults?.players || [];
  const currentGameName = games.find(g => g.id === currentGameId)?.name || "All Games";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Player Search</h1>
          <p className="text-muted-foreground">
            Search and recruit players across all supported games
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className={showFilters ? "" : "hidden"}>
        <CardHeader>
          <CardTitle>Search Filters</CardTitle>
          <CardDescription>
            Use these filters to narrow down your player search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name, username, or school..."
                value={searchFilters.search}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="State or city..."
                value={searchFilters.location}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_year">Class Year</Label>
              <Select value={searchFilters.class_year || "all"} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, class_year: value === "all" ? "" : value }))}>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school_type">School Type</Label>
              <Select value={searchFilters.school_type || "all"} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, school_type: value === "all" ? "" : value }))}>
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
            <div className="space-y-2">
              <Label htmlFor="min_gpa">Min GPA</Label>
              <Input
                id="min_gpa"
                type="number"
                min="0"
                max="4"
                step="0.1"
                placeholder="0.0"
                value={searchFilters.min_gpa || ""}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, min_gpa: e.target.value ? parseFloat(e.target.value) : undefined }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_gpa">Max GPA</Label>
              <Input
                id="max_gpa"
                type="number"
                min="0"
                max="4"
                step="0.1"
                placeholder="4.0"
                value={searchFilters.max_gpa || ""}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, max_gpa: e.target.value ? parseFloat(e.target.value) : undefined }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant={searchFilters.favorited_only ? "default" : "outline"}
              onClick={() => setSearchFilters(prev => ({ ...prev, favorited_only: !prev.favorited_only }))}
              className="gap-2"
            >
              <Star className={`h-4 w-4 ${searchFilters.favorited_only ? 'fill-current' : ''}`} />
              {searchFilters.favorited_only ? "Showing Favorites" : "Show Favorites Only"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSearchFilters({
                search: "",
                location: "",
                class_year: "",
                school_type: "",
                min_gpa: undefined,
                max_gpa: undefined,
                role: "",
                min_combine_score: undefined,
                max_combine_score: undefined,
                min_league_score: undefined,
                max_league_score: undefined,
                play_style: "",
                agents: [],
                favorited_only: false,
              })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Game Tabs */}
      <Tabs value={currentGameId} onValueChange={setCurrentGameId} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="">All Games</TabsTrigger>
          {games.map((game) => (
            <TabsTrigger key={game.id} value={game.id}>
              <div className="flex items-center gap-2">
                {game.icon && (
                  <img src={game.icon} alt={game.name} className="w-4 h-4" />
                )}
                {game.short_name}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Players</CardTitle>
              <CardDescription>
                Search across all games and player profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={players}
                loading={isSearching}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {games.map((game) => (
          <TabsContent key={game.id} value={game.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {game.icon && (
                    <img src={game.icon} alt={game.name} className="w-6 h-6" />
                  )}
                  {game.name} Players
                </CardTitle>
                <CardDescription>
                  Search for {game.name} players and view their game-specific profiles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={columns}
                  data={players}
                  loading={isSearching}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Favorite Player Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to Favorites</DialogTitle>
            <DialogDescription>
              Add {selectedPlayer?.first_name} {selectedPlayer?.last_name} to your recruiting prospects
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this player..."
                value={favoriteNotes}
                onChange={(e) => setFavoriteNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                placeholder="priority, quarterback, local, etc. (comma separated)"
                value={favoriteTags.join(", ")}
                onChange={(e) => setFavoriteTags(e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlayer(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFavorite} disabled={favoritePlayerMutation.isPending}>
              Add to Favorites
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 