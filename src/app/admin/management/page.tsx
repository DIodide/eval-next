"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Trophy, 
  Building, 
  Search, 
  Edit3, 
  Save,
  Loader2,
  ExternalLink,
  FolderOpen,
  Upload,
  AlertTriangle,
  UserIcon
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";

const ITEMS_PER_PAGE = 20;

export default function AdminManagementPage() {
  const [activeTab, setActiveTab] = useState("leagues");
  
  // Search and filter states
  const [leagueSearch, setLeagueSearch] = useState("");
  const [leaguePage, setLeaguePage] = useState(0);
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolPage, setSchoolPage] = useState(0);
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerPage, setPlayerPage] = useState(0);
  
  // Edit modal states
  const [editingLeague, setEditingLeague] = useState<{
    id: string;
    name: string;
    description: string;
    logo_url: string;
    banner_url: string;
  } | null>(null);
  const [editingSchool, setEditingSchool] = useState<{
    id: string;
    name: string;
    bio: string;
    website: string;
    email: string;
    phone: string;
    logo_url: string;
    banner_url: string;
  } | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    main_game_id: string | null;
    location: string;
    bio: string;
    gpa: number | null;
    class_year: string;
    graduation_date: string;
    intended_major: string;
    guardian_email: string;
    scholastic_contact: string;
    scholastic_contact_email: string;
    extra_curriculars: string;
    academic_bio: string;
  } | null>(null);
  const [isLeagueModalOpen, setIsLeagueModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  // Fetch leagues
  const { data: leaguesData, isLoading: leaguesLoading, refetch: refetchLeagues } = api.adminDirectory.getLeagues.useQuery({
    search: leagueSearch || undefined,
    limit: ITEMS_PER_PAGE,
    offset: leaguePage * ITEMS_PER_PAGE,
  });

  // Fetch schools
  const { data: schoolsData, isLoading: schoolsLoading, refetch: refetchSchools } = api.adminDirectory.getSchools.useQuery({
    search: schoolSearch || undefined,
    limit: ITEMS_PER_PAGE,
    offset: schoolPage * ITEMS_PER_PAGE,
  });

  // Fetch players
  const { data: playersData, isLoading: playersLoading, refetch: refetchPlayers } = api.adminDirectory.getPlayers.useQuery({
    search: playerSearch || undefined,
    limit: ITEMS_PER_PAGE,
    offset: playerPage * ITEMS_PER_PAGE,
  });

  // Fetch games for main game selection
  const { data: gamesData } = api.adminManagement.getGames.useQuery();

  // Mutations
  const updateLeagueMutation = api.adminManagement.updateLeague.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "League updated successfully",
      });
      void refetchLeagues();
      setIsLeagueModalOpen(false);
      setEditingLeague(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSchoolMutation = api.adminManagement.updateSchool.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "School updated successfully",
      });
      void refetchSchools();
      setIsSchoolModalOpen(false);
      setEditingSchool(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlayerMutation = api.adminManagement.updatePlayer.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Player updated successfully",
      });
      void refetchPlayers();
      setIsPlayerModalOpen(false);
      setEditingPlayer(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditLeague = (league: {
    id: string;
    name: string;
    description?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
  }) => {
    setEditingLeague({
      id: league.id,
      name: league.name,
      description: league.description ?? "",
      logo_url: league.logo_url ?? "",
      banner_url: league.banner_url ?? "",
    });
    setIsLeagueModalOpen(true);
  };

  const handleEditSchool = (school: {
    id: string;
    name: string;
    bio?: string | null;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
  }) => {
    setEditingSchool({
      id: school.id,
      name: school.name,
      bio: school.bio ?? "",
      website: school.website ?? "",
      email: school.email ?? "",
      phone: school.phone ?? "",
      logo_url: school.logo_url ?? "",
      banner_url: school.banner_url ?? "",
    });
    setIsSchoolModalOpen(true);
  };

  const handleEditPlayer = (player: {
    id: string;
    first_name: string;
    last_name: string;
    main_game_id?: string | null;
    location?: string | null;
    bio?: string | null;
    gpa?: number | null;
    class_year?: string | null;
    graduation_date?: string | null;
    intended_major?: string | null;
    guardian_email?: string | null;
    scholastic_contact?: string | null;
    scholastic_contact_email?: string | null;
    extra_curriculars?: string | null;
    academic_bio?: string | null;
  }) => {
    setEditingPlayer({
      id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      main_game_id: player.main_game_id ?? null,
      location: player.location ?? "",
      bio: player.bio ?? "",
      gpa: player.gpa ?? null,
      class_year: player.class_year ?? "",
      graduation_date: player.graduation_date ?? "",
      intended_major: player.intended_major ?? "",
      guardian_email: player.guardian_email ?? "",
      scholastic_contact: player.scholastic_contact ?? "",
      scholastic_contact_email: player.scholastic_contact_email ?? "",
      extra_curriculars: player.extra_curriculars ?? "",
      academic_bio: player.academic_bio ?? "",
    });
    setIsPlayerModalOpen(true);
  };

  const handleSaveLeague = () => {
    if (!editingLeague) return;
    
    void updateLeagueMutation.mutate({
      id: editingLeague.id,
      name: editingLeague.name,
      description: editingLeague.description,
      logo_url: editingLeague.logo_url,
      banner_url: editingLeague.banner_url,
    });
  };

  const handleSaveSchool = () => {
    if (!editingSchool) return;
    
    void updateSchoolMutation.mutate({
      id: editingSchool.id,
      bio: editingSchool.bio,
      website: editingSchool.website,
      email: editingSchool.email,
      phone: editingSchool.phone,
      logo_url: editingSchool.logo_url,
      banner_url: editingSchool.banner_url,
    });
  };

  const handleSavePlayer = () => {
    if (!editingPlayer) return;
    
    void updatePlayerMutation.mutate({
      id: editingPlayer.id,
      main_game_id: editingPlayer.main_game_id,
      location: editingPlayer.location,
      bio: editingPlayer.bio,
      gpa: editingPlayer.gpa,
      class_year: editingPlayer.class_year,
      graduation_date: editingPlayer.graduation_date,
      intended_major: editingPlayer.intended_major,
      guardian_email: editingPlayer.guardian_email,
      scholastic_contact: editingPlayer.scholastic_contact,
      scholastic_contact_email: editingPlayer.scholastic_contact_email,
      extra_curriculars: editingPlayer.extra_curriculars,
      academic_bio: editingPlayer.academic_bio,
    });
  };

  const formatSchoolType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // File upload handlers for leagues
  const handleLeagueLogoUpload = (url: string) => {
    if (editingLeague) {
      setEditingLeague({ ...editingLeague, logo_url: url });
      toast({
        title: "Logo uploaded",
        description: "League logo uploaded successfully. Remember to save your changes.",
      });
    }
  };

  const handleLeagueBannerUpload = (url: string) => {
    if (editingLeague) {
      setEditingLeague({ ...editingLeague, banner_url: url });
      toast({
        title: "Banner uploaded",
        description: "League banner uploaded successfully. Remember to save your changes.",
      });
    }
  };

  const handleLeagueUploadError = (error: string) => {
    toast({
      title: "Upload failed",
      description: error,
      variant: "destructive",
    });
  };

  // File upload handlers for schools
  const handleSchoolLogoUpload = (url: string) => {
    if (editingSchool) {
      setEditingSchool({ ...editingSchool, logo_url: url });
      toast({
        title: "Logo uploaded",
        description: "School logo uploaded successfully. Remember to save your changes.",
      });
    }
  };

  const handleSchoolBannerUpload = (url: string) => {
    if (editingSchool) {
      setEditingSchool({ ...editingSchool, banner_url: url });
      toast({
        title: "Banner uploaded",
        description: "School banner uploaded successfully. Remember to save your changes.",
      });
    }
  };

  const handleSchoolUploadError = (error: string) => {
    toast({
      title: "Upload failed",
      description: error,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900/60 text-white relative overflow-hidden">
      {/* EVAL Chroma Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-orange-500/8 to-transparent rounded-full blur-xl"></div>
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header with EVAL Rainbow Bar */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4">
            ADMIN MANAGEMENT
          </h1>
          
          {/* EVAL Rainbow Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-orange-500"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></div>
          </div>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-medium">
            Manage leagues, schools, and players across the EVAL platform with advanced editing capabilities.
          </p>
          
          {/* Quick Action Button */}
          <div className="mt-6">
            <Link href="/admin/directory">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-black font-orbitron font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300">
                <FolderOpen className="w-5 h-5 mr-2" />
                VIEW DIRECTORY
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-lg p-1">
            <TabsTrigger 
              value="leagues" 
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 rounded-md px-6 py-2"
            >
              <Trophy className="w-4 h-4 mr-2" />
              LEAGUES
            </TabsTrigger>
            <TabsTrigger 
              value="schools" 
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 rounded-md px-6 py-2"
            >
              <Building className="w-4 h-4 mr-2" />
              SCHOOLS
            </TabsTrigger>
            <TabsTrigger 
              value="players" 
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 rounded-md px-6 py-2"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              PLAYERS
            </TabsTrigger>
          </TabsList>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-white/10 shadow-2xl rounded-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold">League Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Edit league information, descriptions, logos, and banners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leagues..."
                    value={leagueSearch}
                    onChange={(e) => {
                      setLeagueSearch(e.target.value);
                      setLeaguePage(0);
                    }}
                    className="pl-10 bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Leagues List */}
                {leaguesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                      <span className="text-gray-300 font-medium">Loading leagues...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaguesData?.leagues.map((league) => (
                      <Card key={league.id} className="bg-gray-800/30 border-white/10 hover:border-cyan-400/30 transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {league.logo_url ? (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                  <Image
                                    src={league.logo_url}
                                    alt={`${league.name} logo`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex items-center justify-center">
                                  <Trophy className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white group-hover:text-cyan-200 transition-colors">
                                  {league.name}
                                </h3>
                                <p className="text-gray-400 font-medium">
                                  {league.region}{league.state && `, ${league.state}`} • {league.season}
                                </p>
                                <div className="flex space-x-2 mt-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                                  >
                                    {league.tier}
                                  </Badge>
                                  <Badge 
                                    variant={league.status === 'ACTIVE' ? 'default' : 'outline'}
                                    className={league.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                                  >
                                    {league.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/profiles/leagues/${league.id}`}>
                                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                              </Link>
                              <Button 
                                onClick={() => handleEditLeague(league)}
                                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold"
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                      <p className="text-sm text-gray-400">
                        Showing {leaguePage * ITEMS_PER_PAGE + 1} to {Math.min((leaguePage + 1) * ITEMS_PER_PAGE, leaguesData?.total ?? 0)} of {leaguesData?.total ?? 0} leagues
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLeaguePage(Math.max(0, leaguePage - 1))}
                          disabled={leaguePage === 0}
                          className="border-white/20 text-gray-300 hover:text-white"
                        >
                          Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLeaguePage(leaguePage + 1)}
                          disabled={!leaguesData?.hasMore}
                          className="border-white/20 text-gray-300 hover:text-white"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-white/10 shadow-2xl rounded-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold">School Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Edit school information, bios, contact details, and assets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search schools..."
                    value={schoolSearch}
                    onChange={(e) => {
                      setSchoolSearch(e.target.value);
                      setSchoolPage(0);
                    }}
                    className="pl-10 bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Schools List */}
                {schoolsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                      <span className="text-gray-300 font-medium">Loading schools...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schoolsData?.schools.map((school) => (
                      <Card key={school.id} className="bg-gray-800/30 border-white/10 hover:border-orange-400/30 transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {school.logo_url ? (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                  <Image
                                    src={school.logo_url}
                                    alt={`${school.name} logo`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex items-center justify-center">
                                  <Building className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white group-hover:text-orange-200 transition-colors">
                                  {school.name}
                                </h3>
                                <p className="text-gray-400 font-medium">
                                  {formatSchoolType(school.type)} • {school.location}, {school.state}
                                </p>
                                <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                                  <span>{school._count.coaches} coaches</span>
                                  <span>{school._count.players} players</span>
                                  <span>{school._count.teams} teams</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Link href={`/profiles/school/${school.id}`}>
                                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                              </Link>
                              <Button 
                                onClick={() => handleEditSchool(school)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold"
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                      <p className="text-sm text-gray-400">
                        Showing {schoolPage * ITEMS_PER_PAGE + 1} to {Math.min((schoolPage + 1) * ITEMS_PER_PAGE, schoolsData?.total ?? 0)} of {schoolsData?.total ?? 0} schools
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSchoolPage(Math.max(0, schoolPage - 1))}
                          disabled={schoolPage === 0}
                          className="border-white/20 text-gray-300 hover:text-white"
                        >
                          Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSchoolPage(schoolPage + 1)}
                          disabled={!schoolsData?.hasMore}
                          className="border-white/20 text-gray-300 hover:text-white"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <Card className="bg-gray-900/50 backdrop-blur-sm border-white/10 shadow-2xl rounded-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold">Player Management</CardTitle>
                <CardDescription className="text-gray-400">
                  Edit player information, academic details, contact information, and main game settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search players..."
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value);
                      setPlayerPage(0);
                    }}
                    className="pl-10 bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Players List */}
                {playersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                      <span className="text-gray-300 font-medium">Loading players...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playersData?.players.map((player) => (
                      <Card key={player.id} className="bg-gray-800/30 border-white/10 hover:border-purple-400/30 transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {player.image_url ? (
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                                  <Image
                                    src={player.image_url}
                                    alt={`${player.first_name} ${player.last_name}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex items-center justify-center">
                                  <UserIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                                  {player.first_name} {player.last_name}
                                </h3>
                                <p className="text-gray-400 font-medium">
                                  {player.username && `@${player.username}`} • {player.email}
                                </p>
                                <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                                  {player.school && <span>{player.school}</span>}
                                  {player.class_year && <span>Class of {player.class_year}</span>}
                                  {player.location && <span>{player.location}</span>}
                                </div>
                                <div className="flex space-x-2 mt-2">
                                  {player.main_game ? (
                                    <Badge 
                                      variant="secondary" 
                                      className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                                    >
                                      Main: {player.main_game.short_name}
                                    </Badge>
                                  ) : (
                                    <Badge 
                                      variant="outline"
                                      className="border-yellow-500/30 text-yellow-400"
                                    >
                                      No main game
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant="outline"
                                    className="border-gray-500/30 text-gray-400"
                                  >
                                    {player._count.game_profiles} games
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {player.username && (
                                <Link href={`/profiles/player/${player.username}`}>
                                  <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Button>
                                </Link>
                              )}
                              <Button 
                                onClick={() => handleEditPlayer({
                                  id: player.id,
                                  first_name: player.first_name,
                                  last_name: player.last_name,
                                  main_game_id: player.main_game?.id ?? null,
                                  location: player.location,
                                  bio: player.bio,
                                  gpa: player.gpa ? Number(player.gpa) : null,
                                  class_year: player.class_year,
                                  graduation_date: player.graduation_date,
                                  intended_major: player.intended_major,
                                  guardian_email: player.guardian_email,
                                  scholastic_contact: player.scholastic_contact,
                                  scholastic_contact_email: player.scholastic_contact_email,
                                  extra_curriculars: player.extra_curriculars,
                                  academic_bio: player.academic_bio,
                                })}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-black font-bold"
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-between items-center pt-4">
                      <p className="text-sm text-gray-400">
                        Showing {playerPage * ITEMS_PER_PAGE + 1} to {Math.min((playerPage + 1) * ITEMS_PER_PAGE, playersData?.total ?? 0)} of {playersData?.total ?? 0} players
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayerPage(Math.max(0, playerPage - 1))}
                          disabled={playerPage === 0}
                          className="border-white/20 text-gray-300 hover:text-white"
                        >
                          Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayerPage(playerPage + 1)}
                          disabled={!playersData?.hasMore}
                          className="border-white/20 text-gray-300 hover:text-white"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* League Edit Modal */}
        <Dialog open={isLeagueModalOpen} onOpenChange={setIsLeagueModalOpen}>
          <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-cyan-400">Edit League</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update league information, description, and assets
              </DialogDescription>
            </DialogHeader>
            
            {editingLeague && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="league-name" className="text-white font-medium">League Name</Label>
                  <Input
                    id="league-name"
                    value={editingLeague.name}
                    onChange={(e) => setEditingLeague({...editingLeague, name: e.target.value})}
                    className="bg-gray-800/50 border-white/20 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="league-description" className="text-white font-medium">Description</Label>
                  <Textarea
                    id="league-description"
                    value={editingLeague.description}
                    onChange={(e) => setEditingLeague({...editingLeague, description: e.target.value})}
                    rows={4}
                    className="bg-gray-800/50 border-white/20 text-white"
                  />
                </div>
                
                {/* Asset Management Section */}
                <div className="space-y-6">
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-cyan-400" />
                      League Assets
                    </h4>
                    
                    {/* Warning about URL override */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-yellow-200 font-medium mb-1">Asset Management</p>
                          <p className="text-yellow-100/80">
                            You can either upload files to Supabase storage or provide direct URLs. 
                            <span className="font-semibold"> Entering a URL will override any uploaded files.</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* League Logo Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-cyan-200">Logo</h5>
                          <span className="text-xs text-gray-500">400x400px recommended</span>
                        </div>
                        
                        {/* File Upload */}
                        <FileUpload
                          bucket="LEAGUES"
                          entityId={editingLeague.id}
                          assetType="LOGO"
                          currentImageUrl={editingLeague.logo_url || null}
                          label="Upload Logo"
                          description="Upload a logo file to Supabase storage"
                          onUploadSuccess={handleLeagueLogoUpload}
                          onUploadError={handleLeagueUploadError}
                          disabled={updateLeagueMutation.isPending}
                        />
                        
                        {/* URL Override */}
                        <div className="space-y-2">
                          <Label htmlFor="league-logo" className="text-white font-medium">Or use direct URL</Label>
                          <Input
                            id="league-logo"
                            value={editingLeague.logo_url}
                            onChange={(e) => setEditingLeague({...editingLeague, logo_url: e.target.value})}
                            placeholder="https://..."
                            className="bg-gray-800/50 border-white/20 text-white"
                          />
                        </div>
                      </div>
                      
                      {/* League Banner Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-cyan-200">Banner</h5>
                          <span className="text-xs text-gray-500">1200x300px recommended</span>
                        </div>
                        
                        {/* File Upload */}
                        <FileUpload
                          bucket="LEAGUES"
                          entityId={editingLeague.id}
                          assetType="BANNER"
                          currentImageUrl={editingLeague.banner_url || null}
                          label="Upload Banner"
                          description="Upload a banner file to Supabase storage"
                          onUploadSuccess={handleLeagueBannerUpload}
                          onUploadError={handleLeagueUploadError}
                          disabled={updateLeagueMutation.isPending}
                        />
                        
                        {/* URL Override */}
                        <div className="space-y-2">
                          <Label htmlFor="league-banner" className="text-white font-medium">Or use direct URL</Label>
                          <Input
                            id="league-banner"
                            value={editingLeague.banner_url}
                            onChange={(e) => setEditingLeague({...editingLeague, banner_url: e.target.value})}
                            placeholder="https://..."
                            className="bg-gray-800/50 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Preview */}
                {(editingLeague.logo_url || editingLeague.banner_url) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editingLeague.logo_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Logo</p>
                          <div className="relative w-24 h-24 bg-gray-800/50 rounded-lg overflow-hidden">
                            <Image
                              src={editingLeague.logo_url}
                              alt="Logo preview"
                              fill
                              className="object-cover"
                              onError={() => setEditingLeague({...editingLeague, logo_url: ""})}
                            />
                          </div>
                        </div>
                      )}
                      {editingLeague.banner_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Banner</p>
                          <div className="relative w-full h-24 bg-gray-800/50 rounded-lg overflow-hidden">
                            <Image
                              src={editingLeague.banner_url}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                              onError={() => setEditingLeague({...editingLeague, banner_url: ""})}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsLeagueModalOpen(false)}
                    className="border-white/20 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveLeague}
                    disabled={updateLeagueMutation.isPending}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold"
                  >
                    {updateLeagueMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* School Edit Modal */}
        <Dialog open={isSchoolModalOpen} onOpenChange={setIsSchoolModalOpen}>
          <DialogContent className="bg-gray-900 border-white/20 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-orange-400">Edit School</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update school information, contact details, and assets
              </DialogDescription>
            </DialogHeader>
            
            {editingSchool && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="school-bio" className="text-white font-medium">Bio/Description</Label>
                  <Textarea
                    id="school-bio"
                    value={editingSchool.bio}
                    onChange={(e) => setEditingSchool({...editingSchool, bio: e.target.value})}
                    rows={4}
                    className="bg-gray-800/50 border-white/20 text-white"
                    placeholder="School description and information..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school-website" className="text-white font-medium">Website</Label>
                    <Input
                      id="school-website"
                      value={editingSchool.website}
                      onChange={(e) => setEditingSchool({...editingSchool, website: e.target.value})}
                      placeholder="https://..."
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school-email" className="text-white font-medium">Email</Label>
                    <Input
                      id="school-email"
                      value={editingSchool.email}
                      onChange={(e) => setEditingSchool({...editingSchool, email: e.target.value})}
                      placeholder="contact@school.edu"
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school-phone" className="text-white font-medium">Phone</Label>
                    <Input
                      id="school-phone"
                      value={editingSchool.phone}
                      onChange={(e) => setEditingSchool({...editingSchool, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                {/* Asset Management Section */}
                <div className="space-y-6">
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                      <Upload className="h-5 w-5 text-orange-400" />
                      School Assets
                    </h4>
                    
                    {/* Warning about URL override */}
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-yellow-200 font-medium mb-1">Asset Management</p>
                          <p className="text-yellow-100/80">
                            You can either upload files to Supabase storage or provide direct URLs. 
                            <span className="font-semibold"> Entering a URL will override any uploaded files.</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* School Logo Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-orange-200">Logo</h5>
                          <span className="text-xs text-gray-500">400x400px recommended</span>
                        </div>
                        
                        {/* File Upload */}
                        <FileUpload
                          bucket="SCHOOLS"
                          entityId={editingSchool.id}
                          assetType="LOGO"
                          currentImageUrl={editingSchool.logo_url || null}
                          label="Upload Logo"
                          description="Upload a logo file to Supabase storage"
                          onUploadSuccess={handleSchoolLogoUpload}
                          onUploadError={handleSchoolUploadError}
                          disabled={updateSchoolMutation.isPending}
                        />
                        
                        {/* URL Override */}
                        <div className="space-y-2">
                          <Label htmlFor="school-logo" className="text-white font-medium">Or use direct URL</Label>
                          <Input
                            id="school-logo"
                            value={editingSchool.logo_url}
                            onChange={(e) => setEditingSchool({...editingSchool, logo_url: e.target.value})}
                            placeholder="https://..."
                            className="bg-gray-800/50 border-white/20 text-white"
                          />
                        </div>
                      </div>
                      
                      {/* School Banner Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-orange-200">Banner</h5>
                          <span className="text-xs text-gray-500">1200x300px recommended</span>
                        </div>
                        
                        {/* File Upload */}
                        <FileUpload
                          bucket="SCHOOLS"
                          entityId={editingSchool.id}
                          assetType="BANNER"
                          currentImageUrl={editingSchool.banner_url || null}
                          label="Upload Banner"
                          description="Upload a banner file to Supabase storage"
                          onUploadSuccess={handleSchoolBannerUpload}
                          onUploadError={handleSchoolUploadError}
                          disabled={updateSchoolMutation.isPending}
                        />
                        
                        {/* URL Override */}
                        <div className="space-y-2">
                          <Label htmlFor="school-banner" className="text-white font-medium">Or use direct URL</Label>
                          <Input
                            id="school-banner"
                            value={editingSchool.banner_url}
                            onChange={(e) => setEditingSchool({...editingSchool, banner_url: e.target.value})}
                            placeholder="https://..."
                            className="bg-gray-800/50 border-white/20 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Preview */}
                {(editingSchool.logo_url || editingSchool.banner_url) && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-white">Preview</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {editingSchool.logo_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Logo</p>
                          <div className="relative w-24 h-24 bg-gray-800/50 rounded-lg overflow-hidden">
                            <Image
                              src={editingSchool.logo_url}
                              alt="Logo preview"
                              fill
                              className="object-cover"
                              onError={() => setEditingSchool({...editingSchool, logo_url: ""})}
                            />
                          </div>
                        </div>
                      )}
                      {editingSchool.banner_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Banner</p>
                          <div className="relative w-full h-24 bg-gray-800/50 rounded-lg overflow-hidden">
                            <Image
                              src={editingSchool.banner_url}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                              onError={() => setEditingSchool({...editingSchool, banner_url: ""})}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsSchoolModalOpen(false)}
                    className="border-white/20 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveSchool}
                    disabled={updateSchoolMutation.isPending}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-black font-bold"
                  >
                    {updateSchoolMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Player Edit Modal */}
        <Dialog open={isPlayerModalOpen} onOpenChange={setIsPlayerModalOpen}>
          <DialogContent className="bg-gray-900 border-white/20 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-purple-400">Edit Player</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update player information, academic details, contact information, and main game settings. Name and username cannot be edited.
              </DialogDescription>
            </DialogHeader>
            
                        {editingPlayer && (
              <div className="space-y-6">
                {/* Player Info Display - Read Only */}
                <div className="bg-gray-800/30 rounded-lg p-4 border border-white/10">
                  <h4 className="font-semibold text-white mb-2">Player Information (Read Only)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Name</Label>
                      <p className="text-gray-300 font-medium">
                        {editingPlayer.first_name} {editingPlayer.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white border-b border-white/10 pb-2">Basic Information</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-location" className="text-white font-medium">Location</Label>
                    <Input
                      id="player-location"
                      value={editingPlayer.location}
                      onChange={(e) => setEditingPlayer({...editingPlayer, location: e.target.value})}
                      placeholder="City, State"
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-bio" className="text-white font-medium">Bio</Label>
                    <Textarea
                      id="player-bio"
                      value={editingPlayer.bio}
                      onChange={(e) => setEditingPlayer({...editingPlayer, bio: e.target.value})}
                      rows={3}
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                </div>

                {/* Main Game Selection */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white border-b border-white/10 pb-2">Main Game Selection</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-main-game" className="text-white font-medium">Main Game</Label>
                    <select
                      id="player-main-game"
                      value={editingPlayer.main_game_id ?? ""}
                      onChange={(e) => setEditingPlayer({
                        ...editingPlayer, 
                        main_game_id: e.target.value || null
                      })}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">No main game selected</option>
                      {gamesData?.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-400">
                      The main game appears prominently on the player&apos;s profile and is used for recruitment matching.
                    </p>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white border-b border-white/10 pb-2">Academic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="player-gpa" className="text-white font-medium">GPA</Label>
                      <Input
                        id="player-gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={editingPlayer.gpa ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value ? parseFloat(value) : null;
                          setEditingPlayer({...editingPlayer, gpa: (numValue !== null && !isNaN(numValue)) ? numValue : null});
                        }}
                        placeholder="3.75"
                        className="bg-gray-800/50 border-white/20 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="player-class-year" className="text-white font-medium">Class Year</Label>
                      <Input
                        id="player-class-year"
                        value={editingPlayer.class_year}
                        onChange={(e) => setEditingPlayer({...editingPlayer, class_year: e.target.value})}
                        placeholder="2025"
                        className="bg-gray-800/50 border-white/20 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="player-graduation-date" className="text-white font-medium">Graduation Date</Label>
                      <Input
                        id="player-graduation-date"
                        value={editingPlayer.graduation_date}
                        onChange={(e) => setEditingPlayer({...editingPlayer, graduation_date: e.target.value})}
                        placeholder="May 2025"
                        className="bg-gray-800/50 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-intended-major" className="text-white font-medium">Intended Major</Label>
                    <Input
                      id="player-intended-major"
                      value={editingPlayer.intended_major}
                      onChange={(e) => setEditingPlayer({...editingPlayer, intended_major: e.target.value})}
                      placeholder="Computer Science"
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-academic-bio" className="text-white font-medium">Academic Bio</Label>
                    <Textarea
                      id="player-academic-bio"
                      value={editingPlayer.academic_bio}
                      onChange={(e) => setEditingPlayer({...editingPlayer, academic_bio: e.target.value})}
                      rows={3}
                      placeholder="Academic achievements, honors, etc."
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-extra-curriculars" className="text-white font-medium">Extra Curriculars</Label>
                    <Textarea
                      id="player-extra-curriculars"
                      value={editingPlayer.extra_curriculars}
                      onChange={(e) => setEditingPlayer({...editingPlayer, extra_curriculars: e.target.value})}
                      rows={3}
                      placeholder="Student government, clubs, activities, etc."
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-white border-b border-white/10 pb-2">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="player-guardian-email" className="text-white font-medium">Guardian Email</Label>
                      <Input
                        id="player-guardian-email"
                        type="email"
                        value={editingPlayer.guardian_email}
                        onChange={(e) => setEditingPlayer({...editingPlayer, guardian_email: e.target.value})}
                        placeholder="parent@example.com"
                        className="bg-gray-800/50 border-white/20 text-white"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="player-scholastic-contact" className="text-white font-medium">Scholastic Contact</Label>
                      <Input
                        id="player-scholastic-contact"
                        value={editingPlayer.scholastic_contact}
                        onChange={(e) => setEditingPlayer({...editingPlayer, scholastic_contact: e.target.value})}
                        placeholder="Ms. Johnson"
                        className="bg-gray-800/50 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="player-scholastic-contact-email" className="text-white font-medium">Scholastic Contact Email</Label>
                    <Input
                      id="player-scholastic-contact-email"
                      type="email"
                      value={editingPlayer.scholastic_contact_email}
                      onChange={(e) => setEditingPlayer({...editingPlayer, scholastic_contact_email: e.target.value})}
                      placeholder="counselor@school.edu"
                      className="bg-gray-800/50 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsPlayerModalOpen(false)}
                    className="border-white/20 text-gray-300 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSavePlayer}
                    disabled={updatePlayerMutation.isPending}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-black font-bold"
                  >
                    {updatePlayerMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 