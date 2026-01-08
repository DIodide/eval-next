"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { GAME_LOGO_MAPPING } from "@/lib/game-logos";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  AlertTriangle,
  Building,
  Edit3,
  ExternalLink,
  FolderOpen,
  Loader2,
  Save,
  Search,
  Trophy,
  Upload,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const ITEMS_PER_PAGE = 20;

const availableGameNames = Object.keys(GAME_LOGO_MAPPING);

export default function AdminManagementPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam ?? "leagues");

  useEffect(() => {
    if (tabParam && ["leagues", "schools", "players"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
    type: string;
    location: string;
    state: string;
    region: string;
    country: string;
    country_iso2: string;
    bio: string;
    website: string;
    email: string;
    phone: string;
    logo_url: string;
    banner_url: string;
    esports_titles: string[];
    scholarships_available: boolean;
    in_state_tuition: string;
    out_of_state_tuition: string;
    minimum_gpa: number | null;
    minimum_sat: number | null;
    minimum_act: number | null;
  } | null>(null);
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: "",
    type: "COLLEGE" as "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY",
    location: "",
    state: "",
    region: "",
    country: "",
    country_iso2: "US",
    bio: "",
    website: "",
    email: "",
    phone: "",
    logo_url: "",
    banner_url: "",
    esports_titles: [] as string[],
    scholarships_available: false,
    in_state_tuition: "",
    out_of_state_tuition: "",
    minimum_gpa: null as number | null,
    minimum_sat: null as number | null,
    minimum_act: null as number | null,
  });
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

  // League school management states
  const [isManageSchoolsModalOpen, setIsManageSchoolsModalOpen] =
    useState(false);
  const [managingLeagueSchools, setManagingLeagueSchools] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [leagueSchoolSearch, setLeagueSchoolSearch] = useState("");
  const [availableSchoolsSearch, setAvailableSchoolsSearch] = useState("");

  // Fetch leagues
  const {
    data: leaguesData,
    isLoading: leaguesLoading,
    refetch: refetchLeagues,
  } = api.adminDirectory.getLeagues.useQuery({
    search: leagueSearch || undefined,
    limit: ITEMS_PER_PAGE,
    offset: leaguePage * ITEMS_PER_PAGE,
  });

  // Fetch schools
  const {
    data: schoolsData,
    isLoading: schoolsLoading,
    refetch: refetchSchools,
  } = api.adminDirectory.getSchools.useQuery({
    search: schoolSearch || undefined,
    limit: ITEMS_PER_PAGE,
    offset: schoolPage * ITEMS_PER_PAGE,
  });

  // Fetch players
  const {
    data: playersData,
    isLoading: playersLoading,
    refetch: refetchPlayers,
  } = api.adminDirectory.getPlayers.useQuery({
    search: playerSearch || undefined,
    limit: ITEMS_PER_PAGE,
    offset: playerPage * ITEMS_PER_PAGE,
  });

  // Fetch games for main game selection
  const { data: gamesData } = api.adminManagement.getGames.useQuery();

  // League school management queries
  const {
    data: leagueSchoolsData,
    isLoading: leagueSchoolsLoading,
    refetch: refetchLeagueSchools,
  } = api.adminManagement.getLeagueSchools.useQuery(
    {
      league_id: managingLeagueSchools?.id ?? "",
      limit: 50,
      offset: 0,
    },
    {
      enabled: !!managingLeagueSchools?.id,
    },
  );

  const {
    data: availableSchoolsData,
    isLoading: availableSchoolsLoading,
    refetch: refetchAvailableSchools,
  } = api.adminManagement.getAvailableSchoolsForLeague.useQuery(
    {
      league_id: managingLeagueSchools?.id ?? "",
      search: availableSchoolsSearch || undefined,
      limit: 50,
      offset: 0,
    },
    {
      enabled: !!managingLeagueSchools?.id,
    },
  );

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

  const updateSchoolMutation = api.adminManagement.fullUpdateSchool.useMutation(
    {
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
    },
  );

  const createSchoolMutation = api.adminManagement.createSchool.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "School created successfully",
      });
      void refetchSchools();
      setIsCreatingSchool(false);
      setNewSchool({
        name: "",
        type: "COLLEGE",
        location: "",
        state: "",
        region: "",
        country: "",
        country_iso2: "US",
        bio: "",
        website: "",
        email: "",
        phone: "",
        logo_url: "",
        banner_url: "",
        esports_titles: [],
        scholarships_available: false,
        in_state_tuition: "",
        out_of_state_tuition: "",
        minimum_gpa: null,
        minimum_sat: null,
        minimum_act: null,
      });
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

  // League school management mutations
  const addSchoolToLeagueMutation =
    api.adminManagement.addSchoolToLeague.useMutation({
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: data.message,
        });
        void refetchLeagueSchools();
        void refetchAvailableSchools();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const removeSchoolFromLeagueMutation =
    api.adminManagement.removeSchoolFromLeague.useMutation({
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: data.message,
        });
        void refetchLeagueSchools();
        void refetchAvailableSchools();
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
    type: string;
    location: string;
    state?: string | null;
    region?: string | null;
    country?: string | null;
    country_iso2?: string | null;
    bio?: string | null;
    website?: string | null;
    email?: string | null;
    phone?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
    esports_titles?: string[] | null;
    scholarships_available?: boolean | null;
    in_state_tuition?: string | null;
    out_of_state_tuition?: string | null;
    minimum_gpa?: number | null;
    minimum_sat?: number | null;
    minimum_act?: number | null;
  }) => {
    setEditingSchool({
      id: school.id,
      name: school.name,
      type: school.type,
      location: school.location,
      state: school.state ?? "",
      region: school.region ?? "",
      country: school.country ?? "",
      country_iso2: school.country_iso2 ?? "US",
      bio: school.bio ?? "",
      website: school.website ?? "",
      email: school.email ?? "",
      phone: school.phone ?? "",
      logo_url: school.logo_url ?? "",
      banner_url: school.banner_url ?? "",
      esports_titles: school.esports_titles ?? [],
      scholarships_available: school.scholarships_available ?? false,
      in_state_tuition: school.in_state_tuition ?? "",
      out_of_state_tuition: school.out_of_state_tuition ?? "",
      minimum_gpa: school.minimum_gpa ?? null,
      minimum_sat: school.minimum_sat ?? null,
      minimum_act: school.minimum_act ?? null,
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

    const leagueData = {
      id: editingLeague.id,
      name: editingLeague.name,
      description: editingLeague.description,
      logo_url: editingLeague.logo_url,
      banner_url: editingLeague.banner_url,
    };

    console.log("Saving League Data:", leagueData);

    void updateLeagueMutation.mutate(leagueData);
  };

  const handleSaveSchool = () => {
    if (!editingSchool) return;

    void updateSchoolMutation.mutate({
      id: editingSchool.id,
      name: editingSchool.name,
      type: editingSchool.type as "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY",
      location: editingSchool.location,
      state: editingSchool.state || null,
      region: editingSchool.region || null,
      country: editingSchool.country || null,
      country_iso2: editingSchool.country_iso2 || null,
      bio: editingSchool.bio,
      website: editingSchool.website,
      email: editingSchool.email,
      phone: editingSchool.phone,
      logo_url: editingSchool.logo_url,
      banner_url: editingSchool.banner_url,
      esports_titles: editingSchool.esports_titles,
      scholarships_available: editingSchool.scholarships_available,
      in_state_tuition: editingSchool.in_state_tuition || null,
      out_of_state_tuition: editingSchool.out_of_state_tuition || null,
      minimum_gpa: editingSchool.minimum_gpa,
      minimum_sat: editingSchool.minimum_sat,
      minimum_act: editingSchool.minimum_act,
    });
  };

  const handleCreateSchool = () => {
    if (!newSchool.name || !newSchool.location) {
      toast({
        title: "Error",
        description: "Name and Location are required",
        variant: "destructive",
      });
      return;
    }

    void createSchoolMutation.mutate({
      name: newSchool.name,
      type: newSchool.type,
      location: newSchool.location,
      state: newSchool.state || null,
      region: newSchool.region || null,
      country: newSchool.country || null,
      country_iso2: newSchool.country_iso2 || "US",
      bio: newSchool.bio || null,
      website: newSchool.website || null,
      email: newSchool.email || null,
      phone: newSchool.phone || null,
      logo_url: newSchool.logo_url || null,
      banner_url: newSchool.banner_url || null,
      esports_titles: newSchool.esports_titles,
      scholarships_available: newSchool.scholarships_available,
      in_state_tuition: newSchool.in_state_tuition || null,
      out_of_state_tuition: newSchool.out_of_state_tuition || null,
      minimum_gpa: newSchool.minimum_gpa,
      minimum_sat: newSchool.minimum_sat,
      minimum_act: newSchool.minimum_act,
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

  // League school management handlers
  const handleManageLeagueSchools = (league: { id: string; name: string }) => {
    setManagingLeagueSchools(league);
    setIsManageSchoolsModalOpen(true);
    setLeagueSchoolSearch("");
    setAvailableSchoolsSearch("");
  };

  const handleAddSchoolToLeague = (schoolId: string) => {
    if (!managingLeagueSchools) return;

    void addSchoolToLeagueMutation.mutate({
      league_id: managingLeagueSchools.id,
      school_id: schoolId,
    });
  };

  const handleRemoveSchoolFromLeague = (leagueSchoolId: string) => {
    void removeSchoolFromLeagueMutation.mutate({
      league_school_id: leagueSchoolId,
    });
  };

  const formatSchoolType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // File upload handlers for leagues
  const handleLeagueLogoUpload = (url: string) => {
    if (editingLeague) {
      setEditingLeague({ ...editingLeague, logo_url: url });
      toast({
        title: "Logo uploaded",
        description:
          "League logo uploaded successfully. Remember to save your changes.",
      });
    }
  };

  const handleLeagueBannerUpload = (url: string) => {
    if (editingLeague) {
      setEditingLeague({ ...editingLeague, banner_url: url });
      toast({
        title: "Banner uploaded",
        description:
          "League banner uploaded successfully. Remember to save your changes.",
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
        description:
          "School logo uploaded successfully. Remember to save your changes.",
      });
    }
  };

  const handleSchoolBannerUpload = (url: string) => {
    if (editingSchool) {
      setEditingSchool({ ...editingSchool, banner_url: url });
      toast({
        title: "Banner uploaded",
        description:
          "School banner uploaded successfully. Remember to save your changes.",
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
    <div className="relative min-h-screen overflow-hidden bg-gray-900/60 text-white">
      {/* EVAL Chroma Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/8 to-transparent blur-2xl"></div>
      <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-gradient-to-tl from-orange-500/8 to-transparent blur-xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header with EVAL Rainbow Bar */}
        <div className="mb-12 text-center">
          <h1 className="font-orbitron mb-4 text-4xl font-black text-white md:text-6xl">
            ADMIN MANAGEMENT
          </h1>

          {/* EVAL Rainbow Divider */}
          <div className="mb-6 flex items-center justify-center">
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent to-cyan-400"></div>
            <div className="h-0.5 w-8 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            <div className="h-0.5 w-8 bg-gradient-to-r from-purple-500 to-orange-500"></div>
            <div className="h-0.5 w-12 bg-gradient-to-r from-orange-500 to-transparent"></div>
          </div>

          <p className="mx-auto max-w-3xl text-lg font-medium text-gray-300">
            Manage leagues, schools, and players across the EVAL platform with
            advanced editing capabilities.
          </p>

          {/* Quick Action Button */}
          <div className="mt-6">
            <Link href="/admin/directory">
              <Button className="font-orbitron rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-8 py-3 font-bold text-black shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-cyan-600 hover:shadow-purple-500/25">
                <FolderOpen className="mr-2 h-5 w-5" />
                VIEW DIRECTORY
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 rounded-lg border border-white/10 bg-gray-900/50 p-1 backdrop-blur-sm">
            <TabsTrigger
              value="leagues"
              className="font-orbitron rounded-md px-6 py-2 font-bold text-gray-300 transition-all duration-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              <Trophy className="mr-2 h-4 w-4" />
              LEAGUES
            </TabsTrigger>
            <TabsTrigger
              value="schools"
              className="font-orbitron rounded-md px-6 py-2 font-bold text-gray-300 transition-all duration-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              <Building className="mr-2 h-4 w-4" />
              SCHOOLS
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="font-orbitron rounded-md px-6 py-2 font-bold text-gray-300 transition-all duration-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              <UserIcon className="mr-2 h-4 w-4" />
              PLAYERS
            </TabsTrigger>
          </TabsList>

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-6">
            <Card className="rounded-lg border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl font-bold text-white">
                  League Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Edit league information, descriptions, logos, and banners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search leagues..."
                    value={leagueSearch}
                    onChange={(e) => {
                      setLeagueSearch(e.target.value);
                      setLeaguePage(0);
                    }}
                    className="border-white/20 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Leagues List */}
                {leaguesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                      <span className="font-medium text-gray-300">
                        Loading leagues...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaguesData?.leagues.map((league) => (
                      <Card
                        key={league.id}
                        className="group border-white/10 bg-gray-800/30 transition-all duration-300 hover:border-cyan-400/30"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {league.logo_url ? (
                                <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                                  <Image
                                    src={league.logo_url}
                                    alt={`${league.name} logo`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-700/50">
                                  <Trophy className="h-8 w-8 text-gray-400" />
                                </div>
                              )}

                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white transition-colors group-hover:text-cyan-200">
                                  {league.name}
                                </h3>
                                <p className="font-medium text-gray-400">
                                  {league.region}
                                  {league.state && `, ${league.state}`} •{" "}
                                  {league.season}
                                </p>
                                <div className="mt-2 flex space-x-2">
                                  <Badge
                                    variant="secondary"
                                    className="border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                                  >
                                    {league.tier}
                                  </Badge>
                                  <Badge
                                    variant={
                                      league.status === "ACTIVE"
                                        ? "default"
                                        : "outline"
                                    }
                                    className={
                                      league.status === "ACTIVE"
                                        ? "border-green-500/30 bg-green-500/20 text-green-400"
                                        : ""
                                    }
                                  >
                                    {league.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Link href={`/profiles/leagues/${league.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="cursor-pointer border-white/20 text-gray-300 hover:text-white"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Profile
                                </Button>
                              </Link>
                              <Button
                                onClick={() =>
                                  handleManageLeagueSchools({
                                    id: league.id,
                                    name: league.name,
                                  })
                                }
                                variant="outline"
                                size="sm"
                                className="cursor-pointer border-cyan-400/30 text-cyan-300 hover:bg-cyan-400/10 hover:text-cyan-200"
                              >
                                <Building className="mr-2 h-4 w-4" />
                                Manage Schools
                              </Button>
                              <Button
                                onClick={() => handleEditLeague(league)}
                                className="cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-600 font-bold text-black hover:from-cyan-600 hover:to-cyan-700"
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-gray-400">
                        Showing {leaguePage * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(
                          (leaguePage + 1) * ITEMS_PER_PAGE,
                          leaguesData?.total ?? 0,
                        )}{" "}
                        of {leaguesData?.total ?? 0} leagues
                      </p>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setLeaguePage(Math.max(0, leaguePage - 1))
                          }
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
            <Card className="rounded-lg border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-orbitron text-xl font-bold text-white">
                      School Management
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Create, edit, and manage school profiles
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsCreatingSchool(true)}
                    className="font-orbitron bg-gradient-to-r from-green-500 to-green-600 font-bold text-black hover:from-green-600 hover:to-green-700"
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Add New School
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search schools..."
                    value={schoolSearch}
                    onChange={(e) => {
                      setSchoolSearch(e.target.value);
                      setSchoolPage(0);
                    }}
                    className="border-white/20 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Schools List */}
                {schoolsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                      <span className="font-medium text-gray-300">
                        Loading schools...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schoolsData?.schools.map((school) => (
                      <Card
                        key={school.id}
                        className="group border-white/10 bg-gray-800/30 transition-all duration-300 hover:border-orange-400/30"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {school.logo_url ? (
                                <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                                  <Image
                                    src={school.logo_url}
                                    alt={`${school.name} logo`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-700/50">
                                  <Building className="h-8 w-8 text-gray-400" />
                                </div>
                              )}

                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white transition-colors group-hover:text-orange-200">
                                  {school.name}
                                </h3>
                                <p className="font-medium text-gray-400">
                                  {formatSchoolType(school.type)} •{" "}
                                  {school.location}, {school.state}
                                </p>
                                <div className="mt-1 flex space-x-4 text-sm text-gray-500">
                                  <span>{school._count.coaches} coaches</span>
                                  <span>{school._count.players} players</span>
                                  <span>{school._count.teams} teams</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Link href={`/profiles/school/${school.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-gray-300 hover:text-white"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Profile
                                </Button>
                              </Link>
                              <Button
                                onClick={() => handleEditSchool(school)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-black hover:from-orange-600 hover:to-orange-700"
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-gray-400">
                        Showing {schoolPage * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(
                          (schoolPage + 1) * ITEMS_PER_PAGE,
                          schoolsData?.total ?? 0,
                        )}{" "}
                        of {schoolsData?.total ?? 0} schools
                      </p>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSchoolPage(Math.max(0, schoolPage - 1))
                          }
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
            <Card className="rounded-lg border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl font-bold text-white">
                  Player Management
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Edit player information, academic details, contact
                  information, and main game settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative max-w-md">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search players..."
                    value={playerSearch}
                    onChange={(e) => {
                      setPlayerSearch(e.target.value);
                      setPlayerPage(0);
                    }}
                    className="border-white/20 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Players List */}
                {playersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                      <span className="font-medium text-gray-300">
                        Loading players...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playersData?.players.map((player) => (
                      <Card
                        key={player.id}
                        className="group border-white/10 bg-gray-800/30 transition-all duration-300 hover:border-purple-400/30"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {player.image_url ? (
                                <div className="relative h-16 w-16 overflow-hidden rounded-lg">
                                  <Image
                                    src={player.image_url}
                                    alt={`${player.first_name} ${player.last_name}`}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-700/50">
                                  <UserIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}

                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white transition-colors group-hover:text-purple-200">
                                  {player.first_name} {player.last_name}
                                </h3>
                                <p className="font-medium text-gray-400">
                                  {player.username && `@${player.username}`} •{" "}
                                  {player.email}
                                </p>
                                <div className="mt-1 flex space-x-4 text-sm text-gray-500">
                                  {player.school && (
                                    <span>{player.school}</span>
                                  )}
                                  {player.class_year && (
                                    <span>Class of {player.class_year}</span>
                                  )}
                                  {player.location && (
                                    <span>{player.location}</span>
                                  )}
                                </div>
                                <div className="mt-2 flex space-x-2">
                                  {player.main_game ? (
                                    <Badge
                                      variant="secondary"
                                      className="border-purple-500/30 bg-purple-500/20 text-purple-400"
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
                                <Link
                                  href={`/profiles/player/${player.username}`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/20 text-gray-300 hover:text-white"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Profile
                                  </Button>
                                </Link>
                              )}
                              <Button
                                onClick={() =>
                                  handleEditPlayer({
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
                                    scholastic_contact:
                                      player.scholastic_contact,
                                    scholastic_contact_email:
                                      player.scholastic_contact_email,
                                    extra_curriculars: player.extra_curriculars,
                                    academic_bio: player.academic_bio,
                                  })
                                }
                                className="bg-gradient-to-r from-purple-500 to-purple-600 font-bold text-black hover:from-purple-600 hover:to-purple-700"
                              >
                                <Edit3 className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-gray-400">
                        Showing {playerPage * ITEMS_PER_PAGE + 1} to{" "}
                        {Math.min(
                          (playerPage + 1) * ITEMS_PER_PAGE,
                          playersData?.total ?? 0,
                        )}{" "}
                        of {playersData?.total ?? 0} players
                      </p>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPlayerPage(Math.max(0, playerPage - 1))
                          }
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
          <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto border-white/20 bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-cyan-400">
                Edit League
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update league information, description, and assets
              </DialogDescription>
            </DialogHeader>

            {editingLeague && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="league-name"
                    className="font-medium text-white"
                  >
                    League Name
                  </Label>
                  <Input
                    id="league-name"
                    value={editingLeague.name}
                    onChange={(e) =>
                      setEditingLeague({
                        ...editingLeague,
                        name: e.target.value,
                      })
                    }
                    className="border-white/20 bg-gray-800/50 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="league-description"
                    className="font-medium text-white"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="league-description"
                    value={editingLeague.description}
                    onChange={(e) =>
                      setEditingLeague({
                        ...editingLeague,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="border-white/20 bg-gray-800/50 text-white"
                  />
                </div>

                {/* Asset Management Section */}
                <div className="space-y-6">
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
                      <Upload className="h-5 w-5 text-cyan-400" />
                      League Assets
                    </h4>

                    {/* Warning about URL override */}
                    <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                        <div className="text-sm">
                          <p className="mb-1 font-medium text-yellow-200">
                            Asset Management
                          </p>
                          <p className="text-yellow-100/80">
                            You can either upload files to Supabase storage or
                            provide direct URLs.
                            <span className="font-semibold">
                              {" "}
                              Entering a URL will override any uploaded files.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                      {/* League Logo Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-cyan-200">Logo</h5>
                          <span className="text-xs text-gray-500">
                            400x400px recommended
                          </span>
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
                          <Label
                            htmlFor="league-logo"
                            className="font-medium text-white"
                          >
                            Or use direct URL
                          </Label>
                          <Input
                            id="league-logo"
                            value={editingLeague.logo_url}
                            onChange={(e) =>
                              setEditingLeague({
                                ...editingLeague,
                                logo_url: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="border-white/20 bg-gray-800/50 text-white"
                          />
                        </div>
                      </div>

                      {/* League Banner Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-cyan-200">Banner</h5>
                          <span className="text-xs text-gray-500">
                            1200x300px recommended
                          </span>
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
                          <Label
                            htmlFor="league-banner"
                            className="font-medium text-white"
                          >
                            Or use direct URL
                          </Label>
                          <Input
                            id="league-banner"
                            value={editingLeague.banner_url}
                            onChange={(e) =>
                              setEditingLeague({
                                ...editingLeague,
                                banner_url: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="border-white/20 bg-gray-800/50 text-white"
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {editingLeague.logo_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Logo</p>
                          <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-800/50">
                            <Image
                              src={editingLeague.logo_url}
                              alt="Logo preview"
                              fill
                              className="object-cover"
                              onError={() =>
                                setEditingLeague({
                                  ...editingLeague,
                                  logo_url: "",
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                      {editingLeague.banner_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Banner</p>
                          <div className="relative h-24 w-full overflow-hidden rounded-lg bg-gray-800/50">
                            <Image
                              src={editingLeague.banner_url}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                              onError={() =>
                                setEditingLeague({
                                  ...editingLeague,
                                  banner_url: "",
                                })
                              }
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
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 font-bold text-black hover:from-cyan-600 hover:to-cyan-700"
                  >
                    {updateLeagueMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
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
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-white/20 bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-orange-400">
                Edit School
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update school information, contact details, and assets
              </DialogDescription>
            </DialogHeader>

            {editingSchool && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-name"
                        className="font-medium text-white"
                      >
                        School Name
                      </Label>
                      <Input
                        id="edit-school-name"
                        value={editingSchool.name}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            name: e.target.value,
                          })
                        }
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-type"
                        className="font-medium text-white"
                      >
                        School Type
                      </Label>
                      <Select
                        value={editingSchool.type}
                        onValueChange={(value) =>
                          setEditingSchool({ ...editingSchool, type: value })
                        }
                      >
                        <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="border-white/20 bg-gray-800 text-white">
                          <SelectItem value="HIGH_SCHOOL">
                            High School
                          </SelectItem>
                          <SelectItem value="COLLEGE">
                            College (2-year)
                          </SelectItem>
                          <SelectItem value="UNIVERSITY">
                            University (4-year)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-location"
                        className="font-medium text-white"
                      >
                        City/Location
                      </Label>
                      <Input
                        id="edit-school-location"
                        value={editingSchool.location}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            location: e.target.value,
                          })
                        }
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-state"
                        className="font-medium text-white"
                      >
                        State
                      </Label>
                      <Input
                        id="edit-school-state"
                        value={editingSchool.state}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            state: e.target.value,
                          })
                        }
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-region"
                        className="font-medium text-white"
                      >
                        Region
                      </Label>
                      <Select
                        value={editingSchool.region}
                        onValueChange={(value) =>
                          setEditingSchool({ ...editingSchool, region: value })
                        }
                      >
                        <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                          <SelectValue placeholder="Select region" />
                        </SelectTrigger>
                        <SelectContent className="border-white/20 bg-gray-800 text-white">
                          <SelectItem value="northeast">Northeast</SelectItem>
                          <SelectItem value="southeast">Southeast</SelectItem>
                          <SelectItem value="midwest">Midwest</SelectItem>
                          <SelectItem value="southwest">Southwest</SelectItem>
                          <SelectItem value="west">West</SelectItem>
                          <SelectItem value="pacific">Pacific</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-country"
                        className="font-medium text-white"
                      >
                        Country
                      </Label>
                      <Input
                        id="edit-school-country"
                        value={editingSchool.country}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            country: e.target.value,
                          })
                        }
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-country-iso"
                        className="font-medium text-white"
                      >
                        Country Code (ISO2)
                      </Label>
                      <Input
                        id="edit-school-country-iso"
                        value={editingSchool.country_iso2}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            country_iso2: e.target.value
                              .toUpperCase()
                              .slice(0, 2),
                          })
                        }
                        maxLength={2}
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="school-website"
                        className="font-medium text-white"
                      >
                        Website
                      </Label>
                      <Input
                        id="school-website"
                        value={editingSchool.website}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            website: e.target.value,
                          })
                        }
                        placeholder="https://..."
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="school-email"
                        className="font-medium text-white"
                      >
                        Email
                      </Label>
                      <Input
                        id="school-email"
                        value={editingSchool.email}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            email: e.target.value,
                          })
                        }
                        placeholder="contact@school.edu"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="school-phone"
                        className="font-medium text-white"
                      >
                        Phone
                      </Label>
                      <Input
                        id="school-phone"
                        value={editingSchool.phone}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            phone: e.target.value,
                          })
                        }
                        placeholder="(555) 123-4567"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Description
                  </h4>
                  <div className="space-y-2">
                    <Label
                      htmlFor="school-bio"
                      className="font-medium text-white"
                    >
                      Bio/Description
                    </Label>
                    <Textarea
                      id="school-bio"
                      value={editingSchool.bio}
                      onChange={(e) =>
                        setEditingSchool({
                          ...editingSchool,
                          bio: e.target.value,
                        })
                      }
                      rows={4}
                      className="border-white/20 bg-gray-800/50 text-white"
                      placeholder="School description and information..."
                    />
                  </div>
                </div>

                {/* Academic Requirements */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Academic Requirements
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-gpa"
                        className="font-medium text-white"
                      >
                        Minimum GPA
                      </Label>
                      <Input
                        id="edit-school-gpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={editingSchool.minimum_gpa ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value ? parseFloat(value) : null;
                          setEditingSchool({
                            ...editingSchool,
                            minimum_gpa:
                              numValue !== null && !isNaN(numValue)
                                ? numValue
                                : null,
                          });
                        }}
                        placeholder="2.5"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-sat"
                        className="font-medium text-white"
                      >
                        Minimum SAT
                      </Label>
                      <Input
                        id="edit-school-sat"
                        type="number"
                        min="400"
                        max="1600"
                        value={editingSchool.minimum_sat ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value ? parseInt(value) : null;
                          setEditingSchool({
                            ...editingSchool,
                            minimum_sat:
                              numValue !== null && !isNaN(numValue)
                                ? numValue
                                : null,
                          });
                        }}
                        placeholder="1000"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-act"
                        className="font-medium text-white"
                      >
                        Minimum ACT
                      </Label>
                      <Input
                        id="edit-school-act"
                        type="number"
                        min="1"
                        max="36"
                        value={editingSchool.minimum_act ?? ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value ? parseInt(value) : null;
                          setEditingSchool({
                            ...editingSchool,
                            minimum_act:
                              numValue !== null && !isNaN(numValue)
                                ? numValue
                                : null,
                          });
                        }}
                        placeholder="20"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Tuition & Scholarships */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Tuition & Scholarships
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-in-state"
                        className="font-medium text-white"
                      >
                        In-State Tuition
                      </Label>
                      <Input
                        id="edit-school-in-state"
                        value={editingSchool.in_state_tuition}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            in_state_tuition: e.target.value,
                          })
                        }
                        placeholder="$12,000/year"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="edit-school-out-state"
                        className="font-medium text-white"
                      >
                        Out-of-State Tuition
                      </Label>
                      <Input
                        id="edit-school-out-state"
                        value={editingSchool.out_of_state_tuition}
                        onChange={(e) =>
                          setEditingSchool({
                            ...editingSchool,
                            out_of_state_tuition: e.target.value,
                          })
                        }
                        placeholder="$28,000/year"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-school-scholarships"
                      checked={editingSchool.scholarships_available}
                      onCheckedChange={(checked) =>
                        setEditingSchool({
                          ...editingSchool,
                          scholarships_available: checked === true,
                        })
                      }
                      className="border-white/20 data-[state=checked]:bg-green-500"
                    />
                    <Label
                      htmlFor="edit-school-scholarships"
                      className="font-medium text-white"
                    >
                      Esports Scholarships Available
                    </Label>
                  </div>
                </div>

                {/* Esports Titles */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Esports Titles
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium text-white">
                        Games Supported
                      </Label>
                      {editingSchool.esports_titles.length > 0 && (
                        <span className="text-xs text-orange-400">
                          {editingSchool.esports_titles.length} selected
                        </span>
                      )}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-white/10 bg-gray-800/30 p-3">
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {availableGameNames.map((gameName) => {
                          const isChecked =
                            editingSchool.esports_titles.includes(gameName);
                          return (
                            <div
                              key={gameName}
                              className={cn(
                                "flex cursor-pointer items-center space-x-2 rounded-md border p-2 transition-colors hover:border-orange-500/30 hover:bg-gray-700/50",
                                isChecked
                                  ? "border-orange-500/50 bg-orange-900/20"
                                  : "border-white/10 bg-gray-800/30",
                              )}
                              onClick={() => {
                                const newTitles = isChecked
                                  ? editingSchool.esports_titles.filter(
                                      (t) => t !== gameName,
                                    )
                                  : [...editingSchool.esports_titles, gameName];
                                setEditingSchool({
                                  ...editingSchool,
                                  esports_titles: newTitles,
                                });
                              }}
                            >
                              <Checkbox
                                id={`edit-game-${gameName}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const newTitles = checked
                                    ? [
                                        ...editingSchool.esports_titles,
                                        gameName,
                                      ]
                                    : editingSchool.esports_titles.filter(
                                        (t) => t !== gameName,
                                      );
                                  setEditingSchool({
                                    ...editingSchool,
                                    esports_titles: newTitles,
                                  });
                                }}
                                className="border-white/20 data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                              />
                              {GAME_LOGO_MAPPING[gameName] && (
                                <Image
                                  src={GAME_LOGO_MAPPING[gameName]}
                                  alt={gameName}
                                  width={20}
                                  height={20}
                                  className="h-5 w-5 flex-shrink-0 brightness-0 invert"
                                />
                              )}
                              <Label
                                htmlFor={`edit-game-${gameName}`}
                                className="cursor-pointer truncate text-sm text-gray-300"
                              >
                                {gameName}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Select the esports titles this school competes in.
                    </p>
                  </div>
                </div>

                {/* Asset Management Section */}
                <div className="space-y-6">
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="mb-4 flex items-center gap-2 font-semibold text-white">
                      <Upload className="h-5 w-5 text-orange-400" />
                      School Assets
                    </h4>

                    {/* Warning about URL override */}
                    <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />
                        <div className="text-sm">
                          <p className="mb-1 font-medium text-yellow-200">
                            Asset Management
                          </p>
                          <p className="text-yellow-100/80">
                            You can either upload files to Supabase storage or
                            provide direct URLs.
                            <span className="font-semibold">
                              {" "}
                              Entering a URL will override any uploaded files.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                      {/* School Logo Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-orange-200">Logo</h5>
                          <span className="text-xs text-gray-500">
                            400x400px recommended
                          </span>
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
                          <Label
                            htmlFor="school-logo"
                            className="font-medium text-white"
                          >
                            Or use direct URL
                          </Label>
                          <Input
                            id="school-logo"
                            value={editingSchool.logo_url}
                            onChange={(e) =>
                              setEditingSchool({
                                ...editingSchool,
                                logo_url: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="border-white/20 bg-gray-800/50 text-white"
                          />
                        </div>
                      </div>

                      {/* School Banner Section */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-orange-200">
                            Banner
                          </h5>
                          <span className="text-xs text-gray-500">
                            1200x300px recommended
                          </span>
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
                          <Label
                            htmlFor="school-banner"
                            className="font-medium text-white"
                          >
                            Or use direct URL
                          </Label>
                          <Input
                            id="school-banner"
                            value={editingSchool.banner_url}
                            onChange={(e) =>
                              setEditingSchool({
                                ...editingSchool,
                                banner_url: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="border-white/20 bg-gray-800/50 text-white"
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {editingSchool.logo_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Logo</p>
                          <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-800/50">
                            <Image
                              src={editingSchool.logo_url}
                              alt="Logo preview"
                              fill
                              className="object-cover"
                              onError={() =>
                                setEditingSchool({
                                  ...editingSchool,
                                  logo_url: "",
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                      {editingSchool.banner_url && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-400">Banner</p>
                          <div className="relative h-24 w-full overflow-hidden rounded-lg bg-gray-800/50">
                            <Image
                              src={editingSchool.banner_url}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                              onError={() =>
                                setEditingSchool({
                                  ...editingSchool,
                                  banner_url: "",
                                })
                              }
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
                    className="bg-gradient-to-r from-orange-500 to-orange-600 font-bold text-black hover:from-orange-600 hover:to-orange-700"
                  >
                    {updateSchoolMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
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
          <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto border-white/20 bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-purple-400">
                Edit Player
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Update player information, academic details, contact
                information, and main game settings. Name and username cannot be
                edited.
              </DialogDescription>
            </DialogHeader>

            {editingPlayer && (
              <div className="space-y-6">
                {/* Player Info Display - Read Only */}
                <div className="rounded-lg border border-white/10 bg-gray-800/30 p-4">
                  <h4 className="mb-2 font-semibold text-white">
                    Player Information (Read Only)
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-gray-400">Name</Label>
                      <p className="font-medium text-gray-300">
                        {editingPlayer.first_name} {editingPlayer.last_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Basic Information
                  </h4>

                  <div className="space-y-2">
                    <Label
                      htmlFor="player-location"
                      className="font-medium text-white"
                    >
                      Location
                    </Label>
                    <Input
                      id="player-location"
                      value={editingPlayer.location}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          location: e.target.value,
                        })
                      }
                      placeholder="City, State"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="player-bio"
                      className="font-medium text-white"
                    >
                      Bio
                    </Label>
                    <Textarea
                      id="player-bio"
                      value={editingPlayer.bio}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          bio: e.target.value,
                        })
                      }
                      rows={3}
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>

                {/* Main Game Selection */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Main Game Selection
                  </h4>

                  <div className="space-y-2">
                    <Label
                      htmlFor="player-main-game"
                      className="font-medium text-white"
                    >
                      Main Game
                    </Label>
                    <select
                      id="player-main-game"
                      value={editingPlayer.main_game_id ?? ""}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          main_game_id: e.target.value || null,
                        })
                      }
                      className="w-full rounded-md border border-white/20 bg-gray-800/50 px-3 py-2 text-white focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      <option value="">No main game selected</option>
                      {gamesData?.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-400">
                      The main game appears prominently on the player&apos;s
                      profile and is used for recruitment matching.
                    </p>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="player-gpa"
                        className="font-medium text-white"
                      >
                        GPA
                      </Label>
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
                          setEditingPlayer({
                            ...editingPlayer,
                            gpa:
                              numValue !== null && !isNaN(numValue)
                                ? numValue
                                : null,
                          });
                        }}
                        placeholder="3.75"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="player-class-year"
                        className="font-medium text-white"
                      >
                        Class Year
                      </Label>
                      <Input
                        id="player-class-year"
                        value={editingPlayer.class_year}
                        onChange={(e) =>
                          setEditingPlayer({
                            ...editingPlayer,
                            class_year: e.target.value,
                          })
                        }
                        placeholder="2025"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="player-graduation-date"
                        className="font-medium text-white"
                      >
                        Graduation Date
                      </Label>
                      <Input
                        id="player-graduation-date"
                        value={editingPlayer.graduation_date}
                        onChange={(e) =>
                          setEditingPlayer({
                            ...editingPlayer,
                            graduation_date: e.target.value,
                          })
                        }
                        placeholder="May 2025"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="player-intended-major"
                      className="font-medium text-white"
                    >
                      Intended Major
                    </Label>
                    <Input
                      id="player-intended-major"
                      value={editingPlayer.intended_major}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          intended_major: e.target.value,
                        })
                      }
                      placeholder="Computer Science"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="player-academic-bio"
                      className="font-medium text-white"
                    >
                      Academic Bio
                    </Label>
                    <Textarea
                      id="player-academic-bio"
                      value={editingPlayer.academic_bio}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          academic_bio: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Academic achievements, honors, etc."
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="player-extra-curriculars"
                      className="font-medium text-white"
                    >
                      Extra Curriculars
                    </Label>
                    <Textarea
                      id="player-extra-curriculars"
                      value={editingPlayer.extra_curriculars}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          extra_curriculars: e.target.value,
                        })
                      }
                      rows={3}
                      placeholder="Student government, clubs, activities, etc."
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="player-guardian-email"
                        className="font-medium text-white"
                      >
                        Guardian Email
                      </Label>
                      <Input
                        id="player-guardian-email"
                        type="email"
                        value={editingPlayer.guardian_email}
                        onChange={(e) =>
                          setEditingPlayer({
                            ...editingPlayer,
                            guardian_email: e.target.value,
                          })
                        }
                        placeholder="parent@example.com"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="player-scholastic-contact"
                        className="font-medium text-white"
                      >
                        Scholastic Contact
                      </Label>
                      <Input
                        id="player-scholastic-contact"
                        value={editingPlayer.scholastic_contact}
                        onChange={(e) =>
                          setEditingPlayer({
                            ...editingPlayer,
                            scholastic_contact: e.target.value,
                          })
                        }
                        placeholder="Ms. Johnson"
                        className="border-white/20 bg-gray-800/50 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="player-scholastic-contact-email"
                      className="font-medium text-white"
                    >
                      Scholastic Contact Email
                    </Label>
                    <Input
                      id="player-scholastic-contact-email"
                      type="email"
                      value={editingPlayer.scholastic_contact_email}
                      onChange={(e) =>
                        setEditingPlayer({
                          ...editingPlayer,
                          scholastic_contact_email: e.target.value,
                        })
                      }
                      placeholder="counselor@school.edu"
                      className="border-white/20 bg-gray-800/50 text-white"
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
                    className="bg-gradient-to-r from-purple-500 to-purple-600 font-bold text-black hover:from-purple-600 hover:to-purple-700"
                  >
                    {updatePlayerMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Manage League Schools Modal */}
        <Dialog
          open={isManageSchoolsModalOpen}
          onOpenChange={setIsManageSchoolsModalOpen}
        >
          <DialogContent className="max-h-[80vh] max-w-6xl overflow-y-auto border-white/20 bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-cyan-400">
                Manage Schools - {managingLeagueSchools?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Add or remove schools from this league. Schools can be
                forcefully added or removed as needed.
              </DialogDescription>
            </DialogHeader>

            {managingLeagueSchools && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Current Schools in League */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">
                        Schools in League
                      </h4>
                      <Badge
                        variant="secondary"
                        className="bg-cyan-500/20 text-cyan-400"
                      >
                        {leagueSchoolsData?.total ?? 0} schools
                      </Badge>
                    </div>

                    {/* Search for current schools */}
                    <div className="relative">
                      <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search current schools..."
                        value={leagueSchoolSearch}
                        onChange={(e) => setLeagueSchoolSearch(e.target.value)}
                        className="border-white/20 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    {/* Schools list */}
                    <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-gray-800/30 p-4">
                      {leagueSchoolsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                          <span className="ml-2 text-gray-300">
                            Loading schools...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {leagueSchoolsData?.schools
                            ?.filter(
                              (ls) =>
                                !leagueSchoolSearch ||
                                ls.school.name
                                  .toLowerCase()
                                  .includes(leagueSchoolSearch.toLowerCase()) ||
                                ls.school.location
                                  ?.toLowerCase()
                                  .includes(leagueSchoolSearch.toLowerCase()),
                            )
                            .map((leagueSchool) => (
                              <div
                                key={leagueSchool.id}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-700/30 p-3"
                              >
                                <div className="flex items-center space-x-3">
                                  {leagueSchool.school.logo_url ? (
                                    <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                                      <Image
                                        src={leagueSchool.school.logo_url}
                                        alt={`${leagueSchool.school.name} logo`}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600/50">
                                      <Building className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-white">
                                      {leagueSchool.school.name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {leagueSchool.school.location},{" "}
                                      {leagueSchool.school.state}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() =>
                                    handleRemoveSchoolFromLeague(
                                      leagueSchool.id,
                                    )
                                  }
                                  disabled={
                                    removeSchoolFromLeagueMutation.isPending
                                  }
                                  variant="outline"
                                  size="sm"
                                  className="cursor-pointer border-red-400/30 text-red-300 hover:bg-red-400/10 hover:text-red-200"
                                >
                                  {removeSchoolFromLeagueMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Remove"
                                  )}
                                </Button>
                              </div>
                            ))}
                          {(!leagueSchoolsData?.schools ||
                            leagueSchoolsData.schools.length === 0) && (
                            <div className="py-8 text-center">
                              <Building className="mx-auto h-12 w-12 text-gray-500" />
                              <p className="mt-2 text-gray-400">
                                No schools in this league yet
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available Schools to Add */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white">
                        Available Schools
                      </h4>
                      <Badge
                        variant="secondary"
                        className="bg-orange-500/20 text-orange-400"
                      >
                        {availableSchoolsData?.total ?? 0} available
                      </Badge>
                    </div>

                    {/* Search for available schools */}
                    <div className="relative">
                      <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search available schools..."
                        value={availableSchoolsSearch}
                        onChange={(e) =>
                          setAvailableSchoolsSearch(e.target.value)
                        }
                        className="border-white/20 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400"
                      />
                    </div>

                    {/* Available schools list */}
                    <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-gray-800/30 p-4">
                      {availableSchoolsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                          <span className="ml-2 text-gray-300">
                            Loading schools...
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availableSchoolsData?.schools?.map((school) => (
                            <div
                              key={school.id}
                              className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-700/30 p-3"
                            >
                              <div className="flex items-center space-x-3">
                                {school.logo_url ? (
                                  <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                                    <Image
                                      src={school.logo_url}
                                      alt={`${school.name} logo`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-600/50">
                                    <Building className="h-5 w-5 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-white">
                                    {school.name}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {school.location}, {school.state}
                                  </p>
                                  <div className="mt-1 flex space-x-4 text-xs text-gray-500">
                                    <span>{school._count.coaches} coaches</span>
                                    <span>{school._count.players} players</span>
                                    <span>{school._count.teams} teams</span>
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  handleAddSchoolToLeague(school.id)
                                }
                                disabled={addSchoolToLeagueMutation.isPending}
                                className="cursor-pointer bg-gradient-to-r from-green-500 to-green-600 font-bold text-black hover:from-green-600 hover:to-green-700"
                                size="sm"
                              >
                                {addSchoolToLeagueMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Add"
                                )}
                              </Button>
                            </div>
                          ))}
                          {(!availableSchoolsData?.schools ||
                            availableSchoolsData.schools.length === 0) && (
                            <div className="py-8 text-center">
                              <Building className="mx-auto h-12 w-12 text-gray-500" />
                              <p className="mt-2 text-gray-400">
                                {availableSchoolsSearch
                                  ? "No schools found matching your search"
                                  : "All schools are already in this league"}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsManageSchoolsModalOpen(false);
                      setManagingLeagueSchools(null);
                    }}
                    className="cursor-pointer border-white/20 text-gray-300 hover:text-white"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Create School Dialog */}
        <Dialog open={isCreatingSchool} onOpenChange={setIsCreatingSchool}>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-white/20 bg-gray-900 text-white">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-green-400">
                Add New School
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Create a new school profile with all relevant information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                  Basic Information *
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-name"
                      className="font-medium text-white"
                    >
                      School Name *
                    </Label>
                    <Input
                      id="new-school-name"
                      value={newSchool.name}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, name: e.target.value })
                      }
                      placeholder="University of Example"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-type"
                      className="font-medium text-white"
                    >
                      School Type *
                    </Label>
                    <Select
                      value={newSchool.type}
                      onValueChange={(value) =>
                        setNewSchool({
                          ...newSchool,
                          type: value as
                            | "HIGH_SCHOOL"
                            | "COLLEGE"
                            | "UNIVERSITY",
                        })
                      }
                    >
                      <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="border-white/20 bg-gray-800 text-white">
                        <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                        <SelectItem value="COLLEGE">
                          College (2-year)
                        </SelectItem>
                        <SelectItem value="UNIVERSITY">
                          University (4-year)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-location"
                      className="font-medium text-white"
                    >
                      City/Location *
                    </Label>
                    <Input
                      id="new-school-location"
                      value={newSchool.location}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, location: e.target.value })
                      }
                      placeholder="Los Angeles"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-state"
                      className="font-medium text-white"
                    >
                      State
                    </Label>
                    <Input
                      id="new-school-state"
                      value={newSchool.state}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, state: e.target.value })
                      }
                      placeholder="California"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-region"
                      className="font-medium text-white"
                    >
                      Region
                    </Label>
                    <Select
                      value={newSchool.region}
                      onValueChange={(value) =>
                        setNewSchool({ ...newSchool, region: value })
                      }
                    >
                      <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                        <SelectValue placeholder="Select region" />
                      </SelectTrigger>
                      <SelectContent className="border-white/20 bg-gray-800 text-white">
                        <SelectItem value="northeast">Northeast</SelectItem>
                        <SelectItem value="southeast">Southeast</SelectItem>
                        <SelectItem value="midwest">Midwest</SelectItem>
                        <SelectItem value="southwest">Southwest</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                        <SelectItem value="pacific">Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-country"
                      className="font-medium text-white"
                    >
                      Country
                    </Label>
                    <Input
                      id="new-school-country"
                      value={newSchool.country}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, country: e.target.value })
                      }
                      placeholder="United States"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-country-iso"
                      className="font-medium text-white"
                    >
                      Country Code (ISO2)
                    </Label>
                    <Input
                      id="new-school-country-iso"
                      value={newSchool.country_iso2}
                      onChange={(e) =>
                        setNewSchool({
                          ...newSchool,
                          country_iso2: e.target.value
                            .toUpperCase()
                            .slice(0, 2),
                        })
                      }
                      placeholder="US"
                      maxLength={2}
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-website"
                      className="font-medium text-white"
                    >
                      Website
                    </Label>
                    <Input
                      id="new-school-website"
                      value={newSchool.website}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, website: e.target.value })
                      }
                      placeholder="https://..."
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-email"
                      className="font-medium text-white"
                    >
                      Email
                    </Label>
                    <Input
                      id="new-school-email"
                      type="email"
                      value={newSchool.email}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, email: e.target.value })
                      }
                      placeholder="esports@school.edu"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-phone"
                      className="font-medium text-white"
                    >
                      Phone
                    </Label>
                    <Input
                      id="new-school-phone"
                      value={newSchool.phone}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, phone: e.target.value })
                      }
                      placeholder="(555) 123-4567"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                  Description
                </h4>
                <div className="space-y-2">
                  <Label
                    htmlFor="new-school-bio"
                    className="font-medium text-white"
                  >
                    Bio/Description
                  </Label>
                  <Textarea
                    id="new-school-bio"
                    value={newSchool.bio}
                    onChange={(e) =>
                      setNewSchool({ ...newSchool, bio: e.target.value })
                    }
                    rows={4}
                    placeholder="School description and esports program information..."
                    className="border-white/20 bg-gray-800/50 text-white"
                  />
                </div>
              </div>

              {/* Academic Requirements */}
              <div className="space-y-4">
                <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                  Academic Requirements
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-gpa"
                      className="font-medium text-white"
                    >
                      Minimum GPA
                    </Label>
                    <Input
                      id="new-school-gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={newSchool.minimum_gpa ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value ? parseFloat(value) : null;
                        setNewSchool({
                          ...newSchool,
                          minimum_gpa:
                            numValue !== null && !isNaN(numValue)
                              ? numValue
                              : null,
                        });
                      }}
                      placeholder="2.5"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-sat"
                      className="font-medium text-white"
                    >
                      Minimum SAT
                    </Label>
                    <Input
                      id="new-school-sat"
                      type="number"
                      min="400"
                      max="1600"
                      value={newSchool.minimum_sat ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value ? parseInt(value) : null;
                        setNewSchool({
                          ...newSchool,
                          minimum_sat:
                            numValue !== null && !isNaN(numValue)
                              ? numValue
                              : null,
                        });
                      }}
                      placeholder="1000"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-act"
                      className="font-medium text-white"
                    >
                      Minimum ACT
                    </Label>
                    <Input
                      id="new-school-act"
                      type="number"
                      min="1"
                      max="36"
                      value={newSchool.minimum_act ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        const numValue = value ? parseInt(value) : null;
                        setNewSchool({
                          ...newSchool,
                          minimum_act:
                            numValue !== null && !isNaN(numValue)
                              ? numValue
                              : null,
                        });
                      }}
                      placeholder="20"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tuition & Scholarships */}
              <div className="space-y-4">
                <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                  Tuition & Scholarships
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-in-state"
                      className="font-medium text-white"
                    >
                      In-State Tuition
                    </Label>
                    <Input
                      id="new-school-in-state"
                      value={newSchool.in_state_tuition}
                      onChange={(e) =>
                        setNewSchool({
                          ...newSchool,
                          in_state_tuition: e.target.value,
                        })
                      }
                      placeholder="$12,000/year"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-out-state"
                      className="font-medium text-white"
                    >
                      Out-of-State Tuition
                    </Label>
                    <Input
                      id="new-school-out-state"
                      value={newSchool.out_of_state_tuition}
                      onChange={(e) =>
                        setNewSchool({
                          ...newSchool,
                          out_of_state_tuition: e.target.value,
                        })
                      }
                      placeholder="$28,000/year"
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-school-scholarships"
                    checked={newSchool.scholarships_available}
                    onCheckedChange={(checked) =>
                      setNewSchool({
                        ...newSchool,
                        scholarships_available: checked === true,
                      })
                    }
                    className="border-white/20 data-[state=checked]:bg-green-500"
                  />
                  <Label
                    htmlFor="new-school-scholarships"
                    className="font-medium text-white"
                  >
                    Esports Scholarships Available
                  </Label>
                </div>
              </div>

              {/* Esports Titles */}
              <div className="space-y-4">
                <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                  Esports Titles
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium text-white">
                      Games Supported
                    </Label>
                    {newSchool.esports_titles.length > 0 && (
                      <span className="text-xs text-green-400">
                        {newSchool.esports_titles.length} selected
                      </span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto rounded-lg border border-white/10 bg-gray-800/30 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {availableGameNames.map((gameName) => {
                        const isChecked =
                          newSchool.esports_titles.includes(gameName);
                        return (
                          <div
                            key={gameName}
                            className={cn(
                              "flex cursor-pointer items-center space-x-2 rounded-md border p-2 transition-colors hover:border-green-500/30 hover:bg-gray-700/50",
                              isChecked
                                ? "border-green-500/50 bg-green-900/20"
                                : "border-white/10 bg-gray-800/30",
                            )}
                            onClick={() => {
                              const newTitles = isChecked
                                ? newSchool.esports_titles.filter(
                                    (t) => t !== gameName,
                                  )
                                : [...newSchool.esports_titles, gameName];
                              setNewSchool({
                                ...newSchool,
                                esports_titles: newTitles,
                              });
                            }}
                          >
                            <Checkbox
                              id={`new-game-${gameName}`}
                              checked={isChecked}
                              onCheckedChange={(checked) => {
                                const newTitles = checked
                                  ? [...newSchool.esports_titles, gameName]
                                  : newSchool.esports_titles.filter(
                                      (t) => t !== gameName,
                                    );
                                setNewSchool({
                                  ...newSchool,
                                  esports_titles: newTitles,
                                });
                              }}
                              className="border-white/20 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500"
                            />
                            {GAME_LOGO_MAPPING[gameName] && (
                              <Image
                                src={GAME_LOGO_MAPPING[gameName]}
                                alt={gameName}
                                width={20}
                                height={20}
                                className="h-5 w-5 flex-shrink-0 brightness-0 invert"
                              />
                            )}
                            <Label
                              htmlFor={`new-game-${gameName}`}
                              className="cursor-pointer truncate text-sm text-gray-300"
                            >
                              {gameName}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Select the esports titles this school competes in.
                  </p>
                </div>
              </div>

              {/* Asset URLs */}
              <div className="space-y-4">
                <h4 className="border-b border-white/10 pb-2 font-semibold text-white">
                  Asset URLs
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-logo"
                      className="font-medium text-white"
                    >
                      Logo URL
                    </Label>
                    <Input
                      id="new-school-logo"
                      value={newSchool.logo_url}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, logo_url: e.target.value })
                      }
                      placeholder="https://..."
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="new-school-banner"
                      className="font-medium text-white"
                    >
                      Banner URL
                    </Label>
                    <Input
                      id="new-school-banner"
                      value={newSchool.banner_url}
                      onChange={(e) =>
                        setNewSchool({
                          ...newSchool,
                          banner_url: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="border-white/20 bg-gray-800/50 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingSchool(false)}
                  className="border-white/20 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSchool}
                  disabled={createSchoolMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-green-600 font-bold text-black hover:from-green-600 hover:to-green-700"
                >
                  {createSchoolMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create School
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
