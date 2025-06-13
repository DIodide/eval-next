"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Prospect | null>(null);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);

  // Fetch coach's favorited players
  const { data: prospects = [], isLoading, refetch } = api.playerSearch.getFavorites.useQuery();

  // Mutations
  const updateFavoriteMutation = api.playerSearch.updateFavorite.useMutation({
    onSuccess: () => {
      toast({ title: "Prospect updated successfully" });
      void refetch();
      setEditNotesOpen(false);
      setEditingProspect(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const unfavoriteMutation = api.playerSearch.unfavoritePlayer.useMutation({
    onSuccess: () => {
      toast({ title: "Prospect removed from list" });
      void refetch();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">My Prospects</h1>
          <p className="text-gray-400 font-rajdhani">
            Track and manage your favorited players ({prospects.length} total)
          </p>
        </div>
        <Button asChild className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
          <Link href="/dashboard/coaches/player-search">
            <Plus className="w-4 h-4 mr-2" />
            Add More Players
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search prospects by name, school, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {/* Game Filter */}
            <div className="w-48">
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
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
            <div className="w-48">
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                <option value="all">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prospects Organization */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="all" className="data-[state=active]:bg-cyan-600">
            All Prospects ({filteredProspects.length})
          </TabsTrigger>
          <TabsTrigger value="priority" className="data-[state=active]:bg-red-600">
            Priority ({priorityProspects.length})
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-green-600">
            Recent Activity
          </TabsTrigger>
        </TabsList>

        {/* All Prospects */}
        <TabsContent value="all" className="space-y-4">
          {filteredProspects.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 font-rajdhani">No prospects match your current filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProspects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  onView={() => {
                    setSelectedPlayer(prospect);
                    setPlayerDialogOpen(true);
                  }}
                  onEdit={() => handleEditProspect(prospect)}
                  onRemove={() => handleRemoveProspect(prospect)}
                  getGameIcon={getGameIcon}
                  getTagBadgeVariant={getTagBadgeVariant}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Priority Prospects */}
        <TabsContent value="priority" className="space-y-4">
          {priorityProspects.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 font-rajdhani">No priority prospects yet</p>
              <p className="text-sm text-gray-500 mt-2">Tag your most important prospects with "priority"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {priorityProspects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  onView={() => {
                    setSelectedPlayer(prospect);
                    setPlayerDialogOpen(true);
                  }}
                  onEdit={() => handleEditProspect(prospect)}
                  onRemove={() => handleRemoveProspect(prospect)}
                  getGameIcon={getGameIcon}
                  getTagBadgeVariant={getTagBadgeVariant}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Recent Activity */}
        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProspects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onView={() => {
                  setSelectedPlayer(prospect);
                  setPlayerDialogOpen(true);
                }}
                onEdit={() => handleEditProspect(prospect)}
                onRemove={() => handleRemoveProspect(prospect)}
                getGameIcon={getGameIcon}
                getTagBadgeVariant={getTagBadgeVariant}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Player Details Dialog */}
      <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron text-white">Player Profile</DialogTitle>
            <DialogDescription>
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
                    
                    <div className="flex gap-2">
                      {selectedPlayer.tags.map((tag) => (
                        <Badge key={tag} variant={getTagBadgeVariant(tag)} className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => handleEditProspect(selectedPlayer)}
                  className="bg-blue-600 hover:bg-blue-700"
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
              </div>

              {/* Player Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Contact & Location */}
                <div>
                  <h4 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    Contact & Location
                  </h4>
                  <div className="space-y-2">
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

              {/* Prospect Notes */}
              {selectedPlayer.notes && (
                <div>
                  <h4 className="font-orbitron font-bold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-cyan-400" />
                    Your Notes
                  </h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 font-rajdhani whitespace-pre-wrap">{selectedPlayer.notes}</p>
                  </div>
                </div>
              )}

              {/* Player Bio */}
              {selectedPlayer.player.bio && (
                <div>
                  <h4 className="font-orbitron font-bold text-white mb-3">Player Bio</h4>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-300 font-rajdhani">{selectedPlayer.player.bio}</p>
                  </div>
                </div>
              )}

              {/* Added Date */}
              <div className="text-center pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Added to prospects: {new Date(selectedPlayer.created_at).toLocaleDateString()}
                  {selectedPlayer.updated_at !== selectedPlayer.created_at && (
                    <span> • Last updated: {new Date(selectedPlayer.updated_at).toLocaleDateString()}</span>
                  )}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Notes Dialog */}
      <Dialog open={editNotesOpen} onOpenChange={setEditNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prospect Notes & Tags</DialogTitle>
            <DialogDescription>
              Update your notes and tags for {editingProspect?.player.first_name} {editingProspect?.player.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Add your private notes about this player..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                placeholder="priority, prospect, local, etc. (comma separated)"
                value={editTags.join(", ")}
                onChange={(e) => setEditTags(e.target.value.split(",").map(tag => tag.trim()).filter(Boolean))}
              />
              <p className="text-xs text-gray-500">
                Common tags: priority, prospect, local, top_talent, needs_work, interested
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" onClick={() => setEditNotesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateFavoriteMutation.isPending}>
              {updateFavoriteMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Prospect Card Component
interface ProspectCardProps {
  prospect: Prospect;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
  getGameIcon: (gameShortName: string) => string;
  getTagBadgeVariant: (tag: string) => "default" | "destructive" | "secondary" | "outline";
}

function ProspectCard({ prospect, onView, onEdit, onRemove, getGameIcon, getTagBadgeVariant }: ProspectCardProps) {
  const player = prospect.player;
  const mainProfile = player.game_profiles.find(p => p.game.short_name === player.main_game?.short_name);
  
  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={player.image_url ?? undefined} />
              <AvatarFallback className="bg-gray-700 text-white">
                {player.first_name.charAt(0)}{player.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-orbitron font-bold text-white">{player.first_name} {player.last_name}</h3>
              <p className="text-sm text-gray-400">{player.username || "No username"}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Notes & Tags
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="w-4 h-4 mr-2" />
                Email Player
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRemove} className="text-red-400 focus:text-red-300">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove from Prospects
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Game and School Info */}
        <div className="space-y-2">
          {player.main_game && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{getGameIcon(player.main_game.short_name)}</span>
              <span className="text-white text-sm">{player.main_game.name}</span>
              {mainProfile?.rank && (
                <Badge variant="outline" className="text-xs">{mainProfile.rank}</Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <School className="w-4 h-4" />
            <span>{player.school_ref?.name || player.school || "No school"}</span>
          </div>
          
          {player.class_year && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{player.class_year}</span>
              {player.gpa && (
                <span>• GPA: {parseFloat(player.gpa.toString()).toFixed(2)}</span>
              )}
            </div>
          )}
          
          {player.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{player.location}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {prospect.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prospect.tags.map((tag) => (
              <Badge key={tag} variant={getTagBadgeVariant(tag)} className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Notes Preview */}
        {prospect.notes && (
          <div className="bg-gray-800 p-3 rounded text-sm">
            <p className="text-gray-300 line-clamp-2">{prospect.notes}</p>
          </div>
        )}

        {/* Game Profile Preview */}
        {mainProfile && (
          <div className="bg-gray-800 p-3 rounded text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Role:</span>
              <span className="text-white">{mainProfile.role || "Not specified"}</span>
            </div>
            {mainProfile.combine_score && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Combine Score:</span>
                <span className="text-white">{mainProfile.combine_score.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={onView} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="border-gray-600 text-gray-300 hover:text-white">
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Added Date */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-800">
          Added {new Date(prospect.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
} 