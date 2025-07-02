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
  UserIcon
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Directory</h1>
          <p className="text-gray-400 mt-2">
            Browse all schools, players, and leagues with direct links to public profiles
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schools">Schools</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="leagues">Leagues</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totals.schools || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totals.players || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totals.leagues || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Leagues</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totals.activeLeagues || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Schools by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.breakdowns.schoolsByType.map((item) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm">{formatSchoolType(item.type)}</span>
                      <Badge variant="secondary">{item._count._all}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Players by Class Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.breakdowns.playersByClassYear.slice(0, 5).map((item) => (
                    <div key={item.class_year} className="flex justify-between items-center">
                      <span className="text-sm">{item.class_year}</span>
                      <Badge variant="secondary">{item._count._all}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leagues by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.breakdowns.leaguesByTier.map((item) => (
                    <div key={item.tier} className="flex justify-between items-center">
                      <span className="text-sm">{formatTier(item.tier)}</span>
                      <Badge variant="secondary">{item._count._all}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schools Tab */}
        <TabsContent value="schools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>School Directory</CardTitle>
              <CardDescription>
                Browse all schools with direct links to their public profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* School Filters */}
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
                    className="pl-10"
                  />
                </div>
                
                <Select value={schoolType || "all"} onValueChange={(value) => {
                  setSchoolType(value === "all" ? "" : value);
                  setSchoolPage(0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="School Type" />
                  </SelectTrigger>
                  <SelectContent>
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
                />

                <Button
                  variant="outline"
                  onClick={() => {
                    setSchoolSearch("");
                    setSchoolType("");
                    setSchoolState("");
                    setSchoolPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              {/* Schools List */}
              {schoolsLoading ? (
                <div className="text-center py-8">Loading schools...</div>
              ) : (
                <div className="space-y-4">
                  {schoolsData?.schools.map((school) => (
                    <Card key={school.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {school.logo_url ? (
                              <img
                                src={school.logo_url}
                                alt={`${school.name} logo`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Building className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            
                            <div>
                              <h3 className="font-semibold text-lg">{school.name}</h3>
                              <p className="text-gray-600 dark:text-gray-400">
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
                            <Badge variant="secondary">{formatSchoolType(school.type)}</Badge>
                            <Link href={`/profiles/school/${school.id}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {schoolPage * ITEMS_PER_PAGE + 1} to {Math.min((schoolPage + 1) * ITEMS_PER_PAGE, schoolsData?.total || 0)} of {schoolsData?.total || 0} schools
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSchoolPage(Math.max(0, schoolPage - 1))}
                        disabled={schoolPage === 0}
                      >
                        Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSchoolPage(schoolPage + 1)}
                        disabled={!schoolsData?.hasMore}
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
          <Card>
            <CardHeader>
              <CardTitle>Player Directory</CardTitle>
              <CardDescription>
                Browse all players with direct links to their public profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Player Filters */}
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
                    className="pl-10"
                  />
                </div>
                
                <Input
                  placeholder="Class year..."
                  value={playerClassYear}
                  onChange={(e) => {
                    setPlayerClassYear(e.target.value);
                    setPlayerPage(0);
                  }}
                />

                <Input
                  placeholder="Location..."
                  value={playerLocation}
                  onChange={(e) => {
                    setPlayerLocation(e.target.value);
                    setPlayerPage(0);
                  }}
                />

                <Button
                  variant="outline"
                  onClick={() => {
                    setPlayerSearch("");
                    setPlayerClassYear("");
                    setPlayerLocation("");
                    setPlayerPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              {/* Players List */}
              {playersLoading ? (
                <div className="text-center py-8">Loading players...</div>
              ) : (
                <div className="space-y-4">
                  {playersData?.players.map((player) => (
                    <Card key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {player.image_url ? (
                              <img
                                src={player.image_url}
                                alt={`${player.first_name} ${player.last_name}`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            
                            <div>
                              <h3 className="font-semibold text-lg">
                                {player.first_name} {player.last_name}
                                {player.username && <span className="text-gray-500 ml-2">@{player.username}</span>}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {player.school_ref?.name || player.school || 'No school'} 
                                {player.class_year && ` • Class of ${player.class_year}`}
                                {player.location && ` • ${player.location}`}
                              </p>
                              <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                                <span>{player._count.game_profiles} game profiles</span>
                                <span>{player._count.tryout_registrations} tryout registrations</span>
                                <span>{player._count.combine_registrations} combine registrations</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {player.main_game && (
                              <Badge variant="secondary">{player.main_game.short_name}</Badge>
                            )}
                            {player.class_year && (
                              <Badge variant="outline">Class of {player.class_year}</Badge>
                            )}
                            {player.username && (
                              <Link href={`/profiles/player/${player.username}`}>
                                <Button variant="outline" size="sm">
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

                  {/* Pagination */}
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {playerPage * ITEMS_PER_PAGE + 1} to {Math.min((playerPage + 1) * ITEMS_PER_PAGE, playersData?.total || 0)} of {playersData?.total || 0} players
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPlayerPage(Math.max(0, playerPage - 1))}
                        disabled={playerPage === 0}
                      >
                        Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPlayerPage(playerPage + 1)}
                        disabled={!playersData?.hasMore}
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
          <Card>
            <CardHeader>
              <CardTitle>League Directory</CardTitle>
              <CardDescription>
                Browse all leagues with direct links to their public profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* League Filters */}
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
                    className="pl-10"
                  />
                </div>
                
                <Select value={leagueTier || "all"} onValueChange={(value) => {
                  setLeagueTier(value === "all" ? "" : value);
                  setLeaguePage(0);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="League Tier" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
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
                >
                  Clear Filters
                </Button>
              </div>

              {/* Leagues List */}
              {leaguesLoading ? (
                <div className="text-center py-8">Loading leagues...</div>
              ) : (
                <div className="space-y-4">
                  {leaguesData?.leagues.map((league) => (
                    <Card key={league.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {league.logo_url ? (
                              <img
                                src={league.logo_url}
                                alt={`${league.name} logo`}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            
                            <div>
                              <h3 className="font-semibold text-lg">
                                {league.name} ({league.short_name})
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400">
                                {league.region}{league.state && `, ${league.state}`} • {league.season}
                                {league.founded_year && ` • Founded ${league.founded_year}`}
                              </p>
                              <div className="flex space-x-4 text-sm text-gray-500 mt-1">
                                <span>{league._count.schools} schools</span>
                                <span>{league._count.teams} teams</span>
                                <span>{league._count.player_participants} players</span>
                                <span>{league._count.administrators} admins</span>
                              </div>
                              {league.league_games.length > 0 && (
                                <div className="flex space-x-2 mt-2">
                                  {league.league_games.map((gameRel) => (
                                    <Badge key={gameRel.game.id} variant="outline" className="text-xs">
                                      {gameRel.game.short_name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{formatTier(league.tier)}</Badge>
                            <Badge 
                              variant={league.status === 'ACTIVE' ? 'default' : 'outline'}
                            >
                              {formatStatus(league.status)}
                            </Badge>
                            <Link href={`/profiles/leagues/${league.id}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing {leaguePage * ITEMS_PER_PAGE + 1} to {Math.min((leaguePage + 1) * ITEMS_PER_PAGE, leaguesData?.total || 0)} of {leaguesData?.total || 0} leagues
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLeaguePage(Math.max(0, leaguePage - 1))}
                        disabled={leaguePage === 0}
                      >
                        Previous
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLeaguePage(leaguePage + 1)}
                        disabled={!leaguesData?.hasMore}
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
  );
} 