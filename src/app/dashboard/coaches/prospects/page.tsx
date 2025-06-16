"use client";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable react/no-unescaped-entities */

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Link from "next/link";
import {
  Heart,
  Star,
  Edit,
  Trash2,
  MessageCircle,
  ExternalLink,
  Search,
  Filter,
  Users,
  School,
  Calendar,
  TrophyIcon,
  GraduationCap,
  MapPin,
  Mail,
  Eye,
  MoreVertical,
  Plus,
  UserCheck,
  Target,
  BookOpen,
  Award,
  GamepadIcon,
  X,
  Clock,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { data: prospects = [], isLoading, refetch } = api.playerSearch.getFavorites.useQuery();

  // Mutations
  const updateFavoriteMutation = api.playerSearch.updateFavorite.useMutation({
    onSuccess: () => {
      toast.success("Prospect updated successfully");
      void refetch();
      setEditNotesOpen(false);
      setEditingProspect(null);
    },
    onError: (error) => {
      toast.error("Update failed", {
        description: error.message,
      });
    },
  });

  const unfavoriteMutation = api.playerSearch.unfavoritePlayer.useMutation({
    onSuccess: () => {
      toast.info("Prospect removed from list");
      void refetch();
    },
    onError: (error) => {
      toast.error("Remove failed", {
        description: error.message,
      });
    },
  });

  // Get unique games and tags for filtering
  const availableGames = Array.from(new Set(prospects.map(p => p.player.main_game?.short_name).filter((name): name is string => Boolean(name))));
  const availableTags = Array.from(new Set(prospects.flatMap(p => p.tags)));

  // Filter prospects based on search and filters
  const filteredProspects = prospects.filter((prospect) => {
    const player = prospect.player;
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
    const school = (player.school_ref?.name ?? player.school ?? "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = !searchQuery || 
      fullName.includes(searchLower) ||
      school.includes(searchLower) ||
      Boolean(player.username?.toLowerCase().includes(searchLower)) ||
      Boolean(player.location?.toLowerCase().includes(searchLower));
    
    const matchesGame = selectedGame === "all" || player.main_game?.short_name === selectedGame;
    const matchesTag = selectedTag === "all" || prospect.tags.includes(selectedTag);

    return matchesSearch && matchesGame && matchesTag;
  });

  // Group prospects by priority/tags for easier organization
  const priorityProspects = filteredProspects.filter(p => p.tags.includes("priority"));
  const recentProspects = filteredProspects
    .filter(p => !p.tags.includes("priority"))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
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
    if (confirm(`Are you sure you want to remove ${prospect.player.first_name} ${prospect.player.last_name} from your prospects?`)) {
      unfavoriteMutation.mutate({ player_id: prospect.player.id });
    }
  };

  const handleViewPlayer = (prospect: Prospect) => {
    setSelectedPlayer(prospect);
    setPlayerDialogOpen(true);
  };

  const getGameIcon = (gameShortName: string) => {
    const icons: Record<string, string> = {
      "VAL": "🎯",
      "OW2": "⚡",
      "RL": "🚀",
      "SSBU": "🥊",
    };
    return icons[gameShortName] || "🎮";
  };

  const getTagBadgeVariant = (tag: string): "default" | "destructive" | "secondary" | "outline" => {
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
            <AvatarImage src={player.image_url ?? undefined} alt={`${player.first_name} ${player.last_name}`} />
            <AvatarFallback className="bg-gray-700 text-white">
              {player.first_name.charAt(0)}{player.last_name.charAt(0)}
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
            <div className="font-medium text-white text-lg">
              {player.first_name} {player.last_name}
            </div>
            <div className="text-sm text-gray-400">
              @{player.username || 'No username'}
            </div>
            {player.main_game && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{getGameIcon(player.main_game.short_name)}</span>
                <span className="text-sm text-gray-300">{player.main_game.name}</span>
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
              {player.school_ref?.name || player.school || 'No school'}
            </div>
            <div className="text-sm text-gray-400">
              {player.class_year || 'No class year'} • GPA: {gpaNumber?.toFixed(2) || 'N/A'}
            </div>
            {player.location && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
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
        const mainGameProfile = player.game_profiles.find(p => p.game.name === player.main_game?.name);
        
        if (!mainGameProfile) {
          return (
            <div className="text-sm text-gray-500">
              No game profile
            </div>
          );
        }
        
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{mainGameProfile.rank || 'Unranked'}</span>
            </div>
            <div className="text-sm text-gray-400">
              {mainGameProfile.role || 'No role'}
            </div>
            {mainGameProfile.agents.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {mainGameProfile.agents.slice(0, 2).map((agent, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
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
        const mainGameProfile = player.game_profiles.find(p => p.game.name === player.main_game?.name);
        
        return (
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium text-gray-300">Combine:</span>{' '}
              <span className={mainGameProfile?.combine_score ? 'text-cyan-400 font-medium' : 'text-gray-500'}>
                {mainGameProfile?.combine_score?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-300">League:</span>{' '}
              <span className={mainGameProfile?.league_score ? 'text-green-400 font-medium' : 'text-gray-500'}>
                {mainGameProfile?.league_score?.toFixed(1) || 'N/A'}
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
                <Badge key={index} variant={getTagBadgeVariant(tag)} className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Added {new Date(prospect.created_at).toLocaleDateString()}
            </div>
            {prospect.notes && (
              <div className="text-xs text-gray-300 bg-gray-800 p-2 rounded max-w-xs">
                {prospect.notes.length > 50 ? `${prospect.notes.substring(0, 50)}...` : prospect.notes}
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
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(prospect.player.email)}
                  className="text-gray-300 focus:text-white focus:bg-gray-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewPlayer(prospect)}
                  className="text-gray-300 focus:text-white focus:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View full profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleEditProspect(prospect)}
                  className="text-gray-300 focus:text-white focus:bg-gray-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit notes & tags
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 focus:text-white focus:bg-gray-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send message
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  onClick={() => handleRemoveProspect(prospect)}
                  className="text-red-400 focus:text-red-300 focus:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          <div className="text-white font-rajdhani">Loading your prospects...</div>
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
            <h1 className="text-3xl font-orbitron font-bold text-white">My Prospects</h1>
            <p className="text-gray-400 font-rajdhani">Track and manage your favorited players</p>
          </div>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
            <Link href="/dashboard/coaches/player-search">
              <Search className="w-4 h-4 mr-2" />
              Find Players
            </Link>
          </Button>
        </div>
        
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-orbitron text-white mb-2">No Prospects Yet</h3>
          <p className="text-gray-400 font-rajdhani mb-6">
            Start building your prospect list by favoriting players during your search
          </p>
          <Button asChild className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
            <Link href="/dashboard/coaches/player-search">
              <Search className="w-4 h-4 mr-2" />
              Search for Players
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-900 min-h-screen">
      {/* Main Content */}
      <div className={`flex-1 space-y-6 p-6 ${showFilters ? 'mr-80' : ''} transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white">My Prospects</h1>
            <p className="text-gray-400 font-rajdhani">
              Track and manage your favorited players ({prospects.length} total)
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
              <Link href="/dashboard/coaches/player-search">
                <Plus className="w-4 h-4 mr-2" />
                Add More Players
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 border-gray-600 text-black hover:text-white hover:border-gray-500"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? "Hide Filters" : "Filters"}
            </Button>
          </div>
        </div>

        {/* Prospects Organization Tabs */}
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-cyan-600 text-gray-300 data-[state=active]:text-white">
              All Prospects ({filteredProspects.length})
            </TabsTrigger>
            <TabsTrigger value="priority" className="data-[state=active]:bg-red-600 text-gray-300 data-[state=active]:text-white">
              Priority ({priorityProspects.length})
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-green-600 text-gray-300 data-[state=active]:text-white">
              Recent Activity
            </TabsTrigger>
          </TabsList>

          {/* All Prospects */}
          <TabsContent value="all" className="space-y-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">All Prospects</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProspects.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 font-rajdhani">No prospects match your current filters</p>
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
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <Target className="w-5 h-5 text-red-400" />
                  Priority Prospects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priorityProspects.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 font-rajdhani">No priority prospects yet</p>
                    <p className="text-sm text-gray-500 mt-2">Tag your most important prospects with "priority"</p>
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
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
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
        <div className="fixed right-0 top-0 h-full w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto z-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-orbitron font-bold text-white">Prospect Filters</h3>
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
              <Label htmlFor="search" className="text-gray-300">Search</Label>
              <Input
                id="search"
                placeholder="Name, username, school, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border-gray-600 text-white"
              />
            </div>

            {/* Game Filter */}
            <div className="space-y-2">
              <Label htmlFor="game" className="text-gray-300">Game</Label>
              <select
                id="game"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
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
              <Label htmlFor="tag" className="text-gray-300">Tag</Label>
              <select
                id="tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-white"
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
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-orbitron text-white">Edit Prospect</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update notes and tags for {editingProspect?.player.first_name} {editingProspect?.player.last_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add your notes about this prospect..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-gray-300">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="priority, local, top_talent, etc."
                value={editTags.join(", ")}
                onChange={(e) => setEditTags(e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))}
                className="bg-gray-800 border-gray-700 text-white"
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
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {updateFavoriteMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Details Dialog */}
      <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron text-white">Player Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              Detailed information about {selectedPlayer?.player.first_name} {selectedPlayer?.player.last_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlayer && (
            <div className="space-y-6">
              {/* Player Header */}
              <div className="flex items-start gap-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={selectedPlayer.player.image_url ?? undefined} />
                  <AvatarFallback className="bg-gray-700 text-white text-xl">
                    {selectedPlayer.player.first_name.charAt(0)}{selectedPlayer.player.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-orbitron font-bold text-white">
                    {selectedPlayer.player.first_name} {selectedPlayer.player.last_name}
                  </h3>
                  <p className="text-gray-400 font-rajdhani">@{selectedPlayer.player.username || "No username"}</p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    {selectedPlayer.player.main_game && (
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getGameIcon(selectedPlayer.player.main_game.short_name)}</span>
                        <span className="text-white">{selectedPlayer.player.main_game.name}</span>
                      </div>
                    )}
                    
                    <Badge variant="default" className="bg-cyan-600 text-white">
                      <Bookmark className="w-3 h-3 mr-1" />
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
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Notes & Tags
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Player
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRemoveProspect(selectedPlayer)}
                  className="border-red-600 text-red-400 hover:text-red-300 hover:border-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Prospect
                </Button>
              </div>

              {/* Prospect Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prospect Details */}
                <div>
                  <h4 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-cyan-400" />
                    Prospect Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPlayer.tags.map((tag, index) => (
                          <Badge key={index} variant={getTagBadgeVariant(tag)} className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Added:</span>
                      <span className="text-white ml-2">{new Date(selectedPlayer.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Last Updated:</span>
                      <span className="text-white ml-2">{new Date(selectedPlayer.updated_at).toLocaleDateString()}</span>
                    </div>
                    {selectedPlayer.notes && (
                      <div>
                        <span className="text-gray-400">Notes:</span>
                        <div className="bg-gray-800 p-3 rounded-lg mt-1">
                          <p className="text-gray-300 text-sm">{selectedPlayer.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Info */}
                <div>
                  <h4 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    Academic Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">School:</span>
                      <span className="text-white">{selectedPlayer.player.school_ref?.name || selectedPlayer.player.school || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Class Year:</span>
                      <span className="text-white">{selectedPlayer.player.class_year || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GPA:</span>
                      <span className="text-white">
                        {selectedPlayer.player.gpa ? parseFloat(selectedPlayer.player.gpa.toString()).toFixed(2) : "Not specified"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Intended Major:</span>
                      <span className="text-white">{selectedPlayer.player.intended_major || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Graduation:</span>
                      <span className="text-white">{selectedPlayer.player.graduation_date || "Not specified"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Location */}
              <div>
                <h4 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  Contact & Location
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white font-mono text-sm">{selectedPlayer.player.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Location:</span>
                    <span className="text-white">{selectedPlayer.player.location || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Game Profiles */}
              {selectedPlayer.player.game_profiles.length > 0 && (
                <div>
                  <h4 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2">
                    <GamepadIcon className="w-5 h-5 text-cyan-400" />
                    Game Profiles
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPlayer.player.game_profiles.map((profile, idx) => (
                      <div key={idx} className="bg-gray-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">{getGameIcon(profile.game.short_name)}</span>
                          <span className="font-orbitron font-bold text-white">{profile.game.name}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rank:</span>
                            <span className="text-white">{profile.rank || "Unranked"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Role:</span>
                            <span className="text-white">{profile.role || "Not specified"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Username:</span>
                            <span className="text-white font-mono">{profile.username}</span>
                          </div>
                          {profile.combine_score && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Combine Score:</span>
                              <span className="text-white">{profile.combine_score.toFixed(1)}</span>
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
                  <h4 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    Player Bio
                  </h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 font-rajdhani">{selectedPlayer.player.bio}</p>
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

