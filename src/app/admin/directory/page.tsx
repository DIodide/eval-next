"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Trophy, 
  Search, 
  ExternalLink, 
  BarChart3,
  Building,
  UserIcon,
  Settings
} from "lucide-react";

const ITEMS_PER_PAGE = 20;

export default function AdminDirectoryPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Schools state
  const [schoolSearch, setSchoolSearch] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [schoolState, setSchoolState] = useState("");
  const [schoolPage, setSchoolPage] = useState(0);

  // Players state
  const [playerSearch, setPlayerSearch] = useState("");
  const [playerClassYear, setPlayerClassYear] = useState("");
  const [playerLocation, setPlayerLocation] = useState("");
  const [playerPage, setPlayerPage] = useState(0);

  // Leagues state
  const [leagueSearch, setLeagueSearch] = useState("");
  const [leagueTier, setLeagueTier] = useState("");
  const [leagueStatus, setLeagueStatus] = useState("");
  const [leaguePage, setLeaguePage] = useState(0);

  // Fetch directory statistics
  const { data: stats } = api.adminDirectory.getStats.useQuery();

  // Fetch schools
  const { data: schoolsData, isLoading: schoolsLoading } = api.adminDirectory.getSchools.useQuery({
    search: schoolSearch || undefined,
    type: (schoolType || undefined) as "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY" | undefined,
    state: schoolState || undefined,
    limit: ITEMS_PER_PAGE,
    offset: schoolPage * ITEMS_PER_PAGE,
  });

  // Fetch players
  const { data: playersData, isLoading: playersLoading } = api.adminDirectory.getPlayers.useQuery({
    search: playerSearch || undefined,
    class_year: playerClassYear || undefined,
    location: playerLocation || undefined,
    limit: ITEMS_PER_PAGE,
    offset: playerPage * ITEMS_PER_PAGE,
  });

  // Fetch leagues
  const { data: leaguesData, isLoading: leaguesLoading } = api.adminDirectory.getLeagues.useQuery({
    search: leagueSearch || undefined,
    tier: (leagueTier || undefined) as "ELITE" | "PROFESSIONAL" | "COMPETITIVE" | "DEVELOPMENTAL" | undefined,
    status: (leagueStatus || undefined) as "ACTIVE" | "COMPLETED" | "UPCOMING" | "CANCELLED" | undefined,
    limit: ITEMS_PER_PAGE,
    offset: leaguePage * ITEMS_PER_PAGE,
  });

  const formatSchoolType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatTier = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="min-h-screen bg-gray-900/60 text-white relative overflow-hidden">
      {/* Enhanced EVAL Chroma Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5" />
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Animated chroma orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-cyan-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-radial from-orange-500/15 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-purple-500/10 to-transparent rounded-full blur-2xl animate-pulse delay-500"></div>
      
      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Enhanced Header with EVAL Rainbow Bar */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 tracking-wider">
            ADMIN DIRECTORY
          </h1>
          
          {/* Enhanced EVAL Rainbow Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-cyan-400 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full"></div>
          </div>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-medium">
            Browse all schools, players, and leagues with direct links to public profiles
          </p>
          
          {/* Quick Action Button */}
          <div className="mt-6">
            <Link href="/admin/management">
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-black font-orbitron font-bold px-8 py-3 rounded-lg shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
                <Settings className="w-5 h-5 mr-2" />
                MANAGE ENTITIES
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 bg-gray-900/70 backdrop-blur-lg border border-white/20 rounded-xl p-1.5 shadow-2xl">
            <TabsTrigger 
              value="overview" 
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 rounded-lg px-8 py-3"
            >
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger 
              value="schools" 
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 rounded-lg px-8 py-3"
            >
              SCHOOLS
            </TabsTrigger>
            <TabsTrigger 
              value="players" 
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 rounded-lg px-8 py-3"
            >
              PLAYERS
            </TabsTrigger>
            <TabsTrigger 
              value="leagues" 
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white transition-all duration-300 rounded-lg px-8 py-3"
            >
              LEAGUES
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 hover:border-cyan-400/50 transition-all duration-300 group shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white font-orbitron tracking-wide">TOTAL SCHOOLS</CardTitle>
                  <Building className="h-6 w-6 text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-cyan-400 font-orbitron tracking-wider">{stats?.totals.schools ?? 0}</div>
                  <div className="h-1 w-full bg-gradient-to-r from-cyan-400/50 to-transparent rounded-full mt-2"></div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 hover:border-orange-400/50 transition-all duration-300 group shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white font-orbitron tracking-wide">TOTAL PLAYERS</CardTitle>
                  <Users className="h-6 w-6 text-orange-400 group-hover:scale-110 group-hover:text-orange-300 transition-all duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-400 font-orbitron tracking-wider">{stats?.totals.players ?? 0}</div>
                  <div className="h-1 w-full bg-gradient-to-r from-orange-400/50 to-transparent rounded-full mt-2"></div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 hover:border-purple-400/50 transition-all duration-300 group shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white font-orbitron tracking-wide">TOTAL LEAGUES</CardTitle>
                  <Trophy className="h-6 w-6 text-purple-400 group-hover:scale-110 group-hover:text-purple-300 transition-all duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-400 font-orbitron tracking-wider">{stats?.totals.leagues ?? 0}</div>
                  <div className="h-1 w-full bg-gradient-to-r from-purple-400/50 to-transparent rounded-full mt-2"></div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 hover:border-green-400/50 transition-all duration-300 group shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white font-orbitron tracking-wide">ACTIVE LEAGUES</CardTitle>
                  <BarChart3 className="h-6 w-6 text-green-400 group-hover:scale-110 group-hover:text-green-300 transition-all duration-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-400 font-orbitron tracking-wider">{stats?.totals.activeLeagues ?? 0}</div>
                  <div className="h-1 w-full bg-gradient-to-r from-green-400/50 to-transparent rounded-full mt-2"></div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Breakdown Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white font-bold tracking-wide">SCHOOLS BY TYPE</CardTitle>
                  <div className="h-0.5 w-full bg-gradient-to-r from-orange-400 to-transparent rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.breakdowns.schoolsByType.map((item) => (
                      <div key={item.type} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 transition-colors border border-white/10">
                        <span className="text-sm text-gray-300 font-orbitron font-medium">{formatSchoolType(item.type)}</span>
                        <Badge 
                          variant="secondary" 
                          className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-orbitron font-bold"
                        >
                          {item._count._all}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white font-bold tracking-wide">PLAYERS BY CLASS</CardTitle>
                  <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 to-transparent rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.breakdowns.playersByClassYear.slice(0, 5).map((item) => (
                      <div key={item.class_year} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 transition-colors border border-white/10">
                        <span className="text-sm text-gray-300 font-orbitron font-medium">{item.class_year}</span>
                        <Badge 
                          variant="secondary" 
                          className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron font-bold"
                        >
                          {item._count._all}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white font-bold tracking-wide">LEAGUES BY TIER</CardTitle>
                  <div className="h-0.5 w-full bg-gradient-to-r from-purple-400 to-transparent rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.breakdowns.leaguesByTier.map((item) => (
                      <div key={item.tier} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/40 hover:bg-gray-800/60 transition-colors border border-white/10">
                        <span className="text-sm text-gray-300 font-orbitron font-medium">{formatTier(item.tier)}</span>
                        <Badge 
                          variant="secondary" 
                          className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron font-bold"
                        >
                          {item._count._all}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="space-y-6">
            <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 shadow-2xl rounded-xl">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold tracking-wide">SCHOOL DIRECTORY</CardTitle>
                <CardDescription className="text-gray-400 font-medium">
                  Browse all schools with direct links to their public profiles
                </CardDescription>
                <div className="h-0.5 w-full bg-gradient-to-r from-orange-400 via-orange-500 to-transparent rounded-full"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced School Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search schools..."
                      value={schoolSearch}
                      onChange={(e) => {
                        setSchoolSearch(e.target.value);
                        setSchoolPage(0);
                      }}
                      className="pl-10 bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-orange-400/50 transition-colors"
                    />
                  </div>
                  
                  <Select value={schoolType || "all"} onValueChange={(value) => {
                    setSchoolType(value === "all" ? "" : value);
                    setSchoolPage(0);
                  }}>
                    <SelectTrigger className="bg-gray-800/50 border-white/20 text-white">
                      <SelectValue placeholder="School Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                      <SelectItem value="COLLEGE">College</SelectItem>
                      <SelectItem value="UNIVERSITY">University</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="State..."
                    value={schoolState}
                    onChange={(e) => {
                      setSchoolState(e.target.value);
                      setSchoolPage(0);
                    }}
                    className="bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-orange-400/50 transition-colors"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSchoolSearch("");
                      setSchoolType("");
                      setSchoolState("");
                      setSchoolPage(0);
                    }}
                    className="border-white/20 text-gray-300 hover:text-white hover:border-orange-400/50 transition-colors"
                  >
                    Clear Filters
                  </Button>
                </div>

                {/* Schools List */}
                {schoolsLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-orbitron">Loading schools...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schoolsData?.schools.map((school) => (
                      <Card key={school.id} className="bg-gray-800/40 border-white/10 hover:border-orange-400/30 transition-all duration-300 group shadow-lg hover:shadow-orange-500/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {school.logo_url ? (
                                <img
                                  src={school.logo_url}
                                  alt={`${school.name} logo`}
                                  className="w-16 h-16 rounded-lg object-cover border border-white/10"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex items-center justify-center border border-white/10">
                                  <Building className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-orange-200 transition-colors">{school.name}</h3>
                                <p className="text-gray-400 font-medium">
                                  {formatSchoolType(school.type)} • {school.location}, {school.state}
                                </p>
                                <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                                  <span className="font-orbitron">{school._count.coaches} coaches</span>
                                  <span className="font-orbitron">{school._count.players} players</span>
                                  <span className="font-orbitron">{school._count.teams} teams</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="secondary" 
                                className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-orbitron"
                              >
                                {formatSchoolType(school.type)}
                              </Badge>
                              <Link href={`/profiles/school/${school.id}`}>
                                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white hover:border-orange-400/50">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Enhanced Pagination */}
                    <div className="flex justify-between items-center pt-4">
                      <p className="text-sm text-gray-400 font-orbitron">
                        Showing {schoolPage * ITEMS_PER_PAGE + 1} to {Math.min((schoolPage + 1) * ITEMS_PER_PAGE, schoolsData?.total ?? 0)} of {schoolsData?.total ?? 0} schools
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSchoolPage(Math.max(0, schoolPage - 1))}
                          disabled={schoolPage === 0}
                          className="border-white/20 text-gray-300 hover:text-white hover:border-orange-400/50"
                        >
                          Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSchoolPage(schoolPage + 1)}
                          disabled={!schoolsData?.hasMore}
                          className="border-white/20 text-gray-300 hover:text-white hover:border-orange-400/50"
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
            <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 shadow-2xl rounded-xl">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold tracking-wide">PLAYER DIRECTORY</CardTitle>
                <CardDescription className="text-gray-400 font-medium">
                  Browse all players with direct links to their public profiles
                </CardDescription>
                <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-transparent rounded-full"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced Player Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search players..."
                      value={playerSearch}
                      onChange={(e) => {
                        setPlayerSearch(e.target.value);
                        setPlayerPage(0);
                      }}
                      className="pl-10 bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400/50 transition-colors"
                    />
                  </div>
                  
                  <Input
                    placeholder="Class year..."
                    value={playerClassYear}
                    onChange={(e) => {
                      setPlayerClassYear(e.target.value);
                      setPlayerPage(0);
                    }}
                    className="bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400/50 transition-colors"
                  />

                  <Input
                    placeholder="Location..."
                    value={playerLocation}
                    onChange={(e) => {
                      setPlayerLocation(e.target.value);
                      setPlayerPage(0);
                    }}
                    className="bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400/50 transition-colors"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      setPlayerSearch("");
                      setPlayerClassYear("");
                      setPlayerLocation("");
                      setPlayerPage(0);
                    }}
                    className="border-white/20 text-gray-300 hover:text-white hover:border-cyan-400/50 transition-colors"
                  >
                    Clear Filters
                  </Button>
                </div>

                {/* Players List */}
                {playersLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-orbitron">Loading players...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playersData?.players.map((player) => (
                      <Card key={player.id} className="bg-gray-800/40 border-white/10 hover:border-cyan-400/30 transition-all duration-300 group shadow-lg hover:shadow-cyan-500/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {player.image_url ? (
                                <img
                                  src={player.image_url}
                                  alt={`${player.first_name} ${player.last_name}`}
                                  className="w-16 h-16 rounded-lg object-cover border border-white/10"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex items-center justify-center border border-white/10">
                                  <UserIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-cyan-200 transition-colors">
                                  {player.first_name} {player.last_name}
                                  {player.username && <span className="text-gray-500 ml-2 font-normal">@{player.username}</span>}
                                </h3>
                                <p className="text-gray-400 font-medium">
                                  {player.school_ref?.name ?? player.school ?? 'No school'} 
                                  {player.class_year && ` • Class of ${player.class_year}`}
                                  {player.location && ` • ${player.location}`}
                                </p>
                                <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                                  <span className="font-orbitron">{player._count.game_profiles} game profiles</span>
                                  <span className="font-orbitron">{player._count.tryout_registrations} tryouts</span>
                                  <span className="font-orbitron">{player._count.combine_registrations} combines</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {player.main_game && (
                                <Badge 
                                  variant="secondary" 
                                  className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-orbitron"
                                >
                                  {player.main_game.short_name}
                                </Badge>
                              )}
                              {player.class_year && (
                                <Badge 
                                  variant="outline" 
                                  className="border-white/20 text-gray-300 font-orbitron"
                                >
                                  {player.class_year}
                                </Badge>
                              )}
                              {player.username && (
                                <Link href={`/profiles/players/${player.username}`}>
                                  <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white hover:border-cyan-400/50">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Enhanced Pagination */}
                    <div className="flex justify-between items-center pt-4">
                      <p className="text-sm text-gray-400 font-orbitron">
                        Showing {playerPage * ITEMS_PER_PAGE + 1} to {Math.min((playerPage + 1) * ITEMS_PER_PAGE, playersData?.total ?? 0)} of {playersData?.total ?? 0} players
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayerPage(Math.max(0, playerPage - 1))}
                          disabled={playerPage === 0}
                          className="border-white/20 text-gray-300 hover:text-white hover:border-cyan-400/50"
                        >
                          Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayerPage(playerPage + 1)}
                          disabled={!playersData?.hasMore}
                          className="border-white/20 text-gray-300 hover:text-white hover:border-cyan-400/50"
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

          {/* Leagues Tab */}
          <TabsContent value="leagues" className="space-y-6">
            <Card className="bg-gray-900/70 backdrop-blur-lg border-white/20 shadow-2xl rounded-xl">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold tracking-wide">LEAGUE DIRECTORY</CardTitle>
                <CardDescription className="text-gray-400 font-medium">
                  Browse all leagues with direct links to their public profiles
                </CardDescription>
                <div className="h-0.5 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-transparent rounded-full"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced League Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search leagues..."
                      value={leagueSearch}
                      onChange={(e) => {
                        setLeagueSearch(e.target.value);
                        setLeaguePage(0);
                      }}
                      className="pl-10 bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400/50 transition-colors"
                    />
                  </div>
                  
                  <Select value={leagueTier || "all"} onValueChange={(value) => {
                    setLeagueTier(value === "all" ? "" : value);
                    setLeaguePage(0);
                  }}>
                    <SelectTrigger className="bg-gray-800/50 border-white/20 text-white">
                      <SelectValue placeholder="League Tier" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="ELITE">Elite</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                      <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                      <SelectItem value="DEVELOPMENTAL">Developmental</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={leagueStatus || "all"} onValueChange={(value) => {
                    setLeagueStatus(value === "all" ? "" : value);
                    setLeaguePage(0);
                  }}>
                    <SelectTrigger className="bg-gray-800/50 border-white/20 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setLeagueSearch("");
                      setLeagueTier("");
                      setLeagueStatus("");
                      setLeaguePage(0);
                    }}
                    className="border-white/20 text-gray-300 hover:text-white hover:border-purple-400/50 transition-colors"
                  >
                    Clear Filters
                  </Button>
                </div>

                {/* Leagues List */}
                {leaguesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-300 font-orbitron">Loading leagues...</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaguesData?.leagues.map((league) => (
                      <Card key={league.id} className="bg-gray-800/40 border-white/10 hover:border-purple-400/30 transition-all duration-300 group shadow-lg hover:shadow-purple-500/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {league.logo_url ? (
                                <img
                                  src={league.logo_url}
                                  alt={`${league.name} logo`}
                                  className="w-16 h-16 rounded-lg object-cover border border-white/10"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-700/50 rounded-lg flex items-center justify-center border border-white/10">
                                  <Trophy className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div>
                                <h3 className="font-orbitron font-bold text-lg text-white group-hover:text-purple-200 transition-colors">{league.name}</h3>
                                <p className="text-gray-400 font-medium">
                                  {league.region}{league.state && `, ${league.state}`} • {league.season}
                                </p>
                                <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                                  <span className="font-orbitron">{league._count.schools} schools</span>
                                  <span className="font-orbitron">{league._count.teams} teams</span>
                                  <span className="font-orbitron">{league._count.player_participants} players</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="secondary" 
                                className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-orbitron"
                              >
                                {formatTier(league.tier)}
                              </Badge>
                              <Badge 
                                variant={league.status === 'ACTIVE' ? 'default' : 'outline'}
                                className={league.status === 'ACTIVE' ? 
                                  'bg-green-500/20 text-green-400 border-green-500/30 font-orbitron' : 
                                  'border-white/20 text-gray-300 font-orbitron'
                                }
                              >
                                {formatStatus(league.status)}
                              </Badge>
                              <Link href={`/profiles/leagues/${league.id}`}>
                                <Button variant="outline" size="sm" className="border-white/20 text-gray-300 hover:text-white hover:border-purple-400/50">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Enhanced Pagination */}
                    <div className="flex justify-between items-center pt-4">
                      <p className="text-sm text-gray-400 font-orbitron">
                        Showing {leaguePage * ITEMS_PER_PAGE + 1} to {Math.min((leaguePage + 1) * ITEMS_PER_PAGE, leaguesData?.total ?? 0)} of {leaguesData?.total ?? 0} leagues
                      </p>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLeaguePage(Math.max(0, leaguePage - 1))}
                          disabled={leaguePage === 0}
                          className="border-white/20 text-gray-300 hover:text-white hover:border-purple-400/50"
                        >
                          Previous
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLeaguePage(leaguePage + 1)}
                          disabled={!leaguesData?.hasMore}
                          className="border-white/20 text-gray-300 hover:text-white hover:border-purple-400/50"
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
      </div>
    </div>
  );
} 