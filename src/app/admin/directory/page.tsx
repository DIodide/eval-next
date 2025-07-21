"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Trophy,
  Search,
  ExternalLink,
  BarChart3,
  Building,
  UserIcon,
  Settings,
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
  const { data: schoolsData, isLoading: schoolsLoading } =
    api.adminDirectory.getSchools.useQuery({
      search: schoolSearch || undefined,
      type: (schoolType || undefined) as
        | "HIGH_SCHOOL"
        | "COLLEGE"
        | "UNIVERSITY"
        | undefined,
      state: schoolState || undefined,
      limit: ITEMS_PER_PAGE,
      offset: schoolPage * ITEMS_PER_PAGE,
    });

  // Fetch players
  const { data: playersData, isLoading: playersLoading } =
    api.adminDirectory.getPlayers.useQuery({
      search: playerSearch || undefined,
      class_year: playerClassYear || undefined,
      location: playerLocation || undefined,
      limit: ITEMS_PER_PAGE,
      offset: playerPage * ITEMS_PER_PAGE,
    });

  // Fetch leagues
  const { data: leaguesData, isLoading: leaguesLoading } =
    api.adminDirectory.getLeagues.useQuery({
      search: leagueSearch || undefined,
      tier: (leagueTier || undefined) as
        | "ELITE"
        | "PROFESSIONAL"
        | "COMPETITIVE"
        | "DEVELOPMENTAL"
        | undefined,
      status: (leagueStatus || undefined) as
        | "ACTIVE"
        | "COMPLETED"
        | "UPCOMING"
        | "CANCELLED"
        | undefined,
      limit: ITEMS_PER_PAGE,
      offset: leaguePage * ITEMS_PER_PAGE,
    });

  const formatSchoolType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatTier = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900/60 text-white">
      {/* Enhanced EVAL Chroma Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5" />
      <div className="absolute inset-0 bg-black/60" />

      {/* Animated chroma orbs */}
      <div className="bg-gradient-radial absolute top-0 left-0 h-96 w-96 animate-pulse rounded-full from-cyan-500/15 to-transparent blur-3xl"></div>
      <div className="bg-gradient-radial absolute right-0 bottom-0 h-80 w-80 animate-pulse rounded-full from-orange-500/15 to-transparent blur-2xl delay-1000"></div>
      <div className="bg-gradient-radial absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform animate-pulse rounded-full from-purple-500/10 to-transparent blur-2xl delay-500"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Enhanced Header with EVAL Rainbow Bar */}
        <div className="mb-12 text-center">
          <h1 className="font-orbitron mb-4 text-4xl font-black tracking-wider text-white md:text-6xl">
            ADMIN DIRECTORY
          </h1>

          {/* Enhanced EVAL Rainbow Divider */}
          <div className="mb-6 flex items-center justify-center">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-transparent to-cyan-400"></div>
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            <div className="h-1 w-12 rounded-full bg-gradient-to-r from-purple-500 to-orange-500"></div>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-orange-500 to-transparent"></div>
          </div>

          <p className="mx-auto max-w-3xl text-lg font-medium text-gray-300">
            Browse all schools, players, and leagues with direct links to public
            profiles
          </p>

          {/* Quick Action Button */}
          <div className="mt-6">
            <Link href="/admin/management">
              <Button className="font-orbitron rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-3 font-bold text-black shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-purple-600 hover:shadow-cyan-500/25">
                <Settings className="mr-2 h-5 w-5" />
                MANAGE ENTITIES
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 rounded-xl border border-white/20 bg-gray-900/70 p-1.5 shadow-2xl backdrop-blur-lg">
            <TabsTrigger
              value="overview"
              className="font-orbitron rounded-lg px-8 py-3 font-bold text-gray-300 transition-all duration-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger
              value="schools"
              className="font-orbitron rounded-lg px-8 py-3 font-bold text-gray-300 transition-all duration-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-orange-500 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              SCHOOLS
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="font-orbitron rounded-lg px-8 py-3 font-bold text-gray-300 transition-all duration-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              PLAYERS
            </TabsTrigger>
            <TabsTrigger
              value="leagues"
              className="font-orbitron rounded-lg px-8 py-3 font-bold text-gray-300 transition-all duration-300 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg"
            >
              LEAGUES
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="group border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:border-cyan-400/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-orbitron text-sm font-medium tracking-wide text-white">
                    TOTAL SCHOOLS
                  </CardTitle>
                  <Building className="h-6 w-6 text-cyan-400 transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-300" />
                </CardHeader>
                <CardContent>
                  <div className="font-orbitron text-3xl font-bold tracking-wider text-cyan-400">
                    {stats?.totals.schools ?? 0}
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                </CardContent>
              </Card>

              <Card className="group border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:border-orange-400/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-orbitron text-sm font-medium tracking-wide text-white">
                    TOTAL PLAYERS
                  </CardTitle>
                  <Users className="h-6 w-6 text-orange-400 transition-all duration-300 group-hover:scale-110 group-hover:text-orange-300" />
                </CardHeader>
                <CardContent>
                  <div className="font-orbitron text-3xl font-bold tracking-wider text-orange-400">
                    {stats?.totals.players ?? 0}
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-orange-400/50 to-transparent"></div>
                </CardContent>
              </Card>

              <Card className="group border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:border-purple-400/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-orbitron text-sm font-medium tracking-wide text-white">
                    TOTAL LEAGUES
                  </CardTitle>
                  <Trophy className="h-6 w-6 text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-300" />
                </CardHeader>
                <CardContent>
                  <div className="font-orbitron text-3xl font-bold tracking-wider text-purple-400">
                    {stats?.totals.leagues ?? 0}
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-purple-400/50 to-transparent"></div>
                </CardContent>
              </Card>

              <Card className="group border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:border-green-400/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-orbitron text-sm font-medium tracking-wide text-white">
                    ACTIVE LEAGUES
                  </CardTitle>
                  <BarChart3 className="h-6 w-6 text-green-400 transition-all duration-300 group-hover:scale-110 group-hover:text-green-300" />
                </CardHeader>
                <CardContent>
                  <div className="font-orbitron text-3xl font-bold tracking-wider text-green-400">
                    {stats?.totals.activeLeagues ?? 0}
                  </div>
                  <div className="mt-2 h-1 w-full rounded-full bg-gradient-to-r from-green-400/50 to-transparent"></div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Breakdown Charts */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-orange-500/20">
                <CardHeader>
                  <CardTitle className="font-orbitron font-bold tracking-wide text-white">
                    SCHOOLS BY TYPE
                  </CardTitle>
                  <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-orange-400 to-transparent"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.breakdowns.schoolsByType.map((item) => (
                      <div
                        key={item.type}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/60"
                      >
                        <span className="font-orbitron text-sm font-medium text-gray-300">
                          {formatSchoolType(item.type)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-orbitron border-orange-500/30 bg-orange-500/20 font-bold text-orange-400"
                        >
                          {item._count._all}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-cyan-500/20">
                <CardHeader>
                  <CardTitle className="font-orbitron font-bold tracking-wide text-white">
                    PLAYERS BY CLASS
                  </CardTitle>
                  <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-cyan-400 to-transparent"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.breakdowns.playersByClassYear
                      .slice(0, 5)
                      .map((item) => (
                        <div
                          key={item.class_year}
                          className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/60"
                        >
                          <span className="font-orbitron text-sm font-medium text-gray-300">
                            {item.class_year}
                          </span>
                          <Badge
                            variant="secondary"
                            className="font-orbitron border-cyan-500/30 bg-cyan-500/20 font-bold text-cyan-400"
                          >
                            {item._count._all}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg transition-all duration-300 hover:shadow-purple-500/20">
                <CardHeader>
                  <CardTitle className="font-orbitron font-bold tracking-wide text-white">
                    LEAGUES BY TIER
                  </CardTitle>
                  <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-purple-400 to-transparent"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.breakdowns.leaguesByTier.map((item) => (
                      <div
                        key={item.tier}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-800/40 p-3 transition-colors hover:bg-gray-800/60"
                      >
                        <span className="font-orbitron text-sm font-medium text-gray-300">
                          {formatTier(item.tier)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-orbitron border-purple-500/30 bg-purple-500/20 font-bold text-purple-400"
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
            <Card className="rounded-xl border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl font-bold tracking-wide text-white">
                  SCHOOL DIRECTORY
                </CardTitle>
                <CardDescription className="font-medium text-gray-400">
                  Browse all schools with direct links to their public profiles
                </CardDescription>
                <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-transparent"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced School Filters */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search schools..."
                      value={schoolSearch}
                      onChange={(e) => {
                        setSchoolSearch(e.target.value);
                        setSchoolPage(0);
                      }}
                      className="border-white/20 bg-gray-800/50 pl-10 text-white transition-colors placeholder:text-gray-400 focus:border-orange-400/50"
                    />
                  </div>

                  <Select
                    value={schoolType || "all"}
                    onValueChange={(value) => {
                      setSchoolType(value === "all" ? "" : value);
                      setSchoolPage(0);
                    }}
                  >
                    <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                      <SelectValue placeholder="School Type" />
                    </SelectTrigger>
                    <SelectContent className="border-white/20 bg-gray-800">
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
                    className="border-white/20 bg-gray-800/50 text-white transition-colors placeholder:text-gray-400 focus:border-orange-400/50"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      setSchoolSearch("");
                      setSchoolType("");
                      setSchoolState("");
                      setSchoolPage(0);
                    }}
                    className="border-white/20 text-gray-300 transition-colors hover:border-orange-400/50 hover:text-white"
                  >
                    Clear Filters
                  </Button>
                </div>

                {/* Schools List */}
                {schoolsLoading ? (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center space-x-3">
                      <div className="h-6 w-6 animate-pulse rounded-full bg-gradient-to-r from-orange-400 to-orange-500"></div>
                      <span className="font-orbitron text-gray-300">
                        Loading schools...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schoolsData?.schools.map((school) => (
                      <Card
                        key={school.id}
                        className="group border-white/10 bg-gray-800/40 shadow-lg transition-all duration-300 hover:border-orange-400/30 hover:shadow-orange-500/20"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {school.logo_url ? (
                                <img
                                  src={school.logo_url}
                                  alt={`${school.name} logo`}
                                  className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-gray-700/50">
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
                                  <span className="font-orbitron">
                                    {school._count.coaches} coaches
                                  </span>
                                  <span className="font-orbitron">
                                    {school._count.players} players
                                  </span>
                                  <span className="font-orbitron">
                                    {school._count.teams} teams
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="secondary"
                                className="font-orbitron border-orange-500/30 bg-orange-500/20 text-orange-400"
                              >
                                {formatSchoolType(school.type)}
                              </Badge>
                              <Link href={`/profiles/school/${school.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-gray-300 hover:border-orange-400/50 hover:text-white"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Enhanced Pagination */}
                    <div className="flex items-center justify-between pt-4">
                      <p className="font-orbitron text-sm text-gray-400">
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
                          className="border-white/20 text-gray-300 hover:border-orange-400/50 hover:text-white"
                        >
                          Previous
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSchoolPage(schoolPage + 1)}
                          disabled={!schoolsData?.hasMore}
                          className="border-white/20 text-gray-300 hover:border-orange-400/50 hover:text-white"
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
            <Card className="rounded-xl border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl font-bold tracking-wide text-white">
                  PLAYER DIRECTORY
                </CardTitle>
                <CardDescription className="font-medium text-gray-400">
                  Browse all players with direct links to their public profiles
                </CardDescription>
                <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-cyan-400 via-cyan-500 to-transparent"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced Player Filters */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search players..."
                      value={playerSearch}
                      onChange={(e) => {
                        setPlayerSearch(e.target.value);
                        setPlayerPage(0);
                      }}
                      className="border-white/20 bg-gray-800/50 pl-10 text-white transition-colors placeholder:text-gray-400 focus:border-cyan-400/50"
                    />
                  </div>

                  <Input
                    placeholder="Class year..."
                    value={playerClassYear}
                    onChange={(e) => {
                      setPlayerClassYear(e.target.value);
                      setPlayerPage(0);
                    }}
                    className="border-white/20 bg-gray-800/50 text-white transition-colors placeholder:text-gray-400 focus:border-cyan-400/50"
                  />

                  <Input
                    placeholder="Location..."
                    value={playerLocation}
                    onChange={(e) => {
                      setPlayerLocation(e.target.value);
                      setPlayerPage(0);
                    }}
                    className="border-white/20 bg-gray-800/50 text-white transition-colors placeholder:text-gray-400 focus:border-cyan-400/50"
                  />

                  <Button
                    variant="outline"
                    onClick={() => {
                      setPlayerSearch("");
                      setPlayerClassYear("");
                      setPlayerLocation("");
                      setPlayerPage(0);
                    }}
                    className="border-white/20 text-gray-300 transition-colors hover:border-cyan-400/50 hover:text-white"
                  >
                    Clear Filters
                  </Button>
                </div>

                {/* Players List */}
                {playersLoading ? (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center space-x-3">
                      <div className="h-6 w-6 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500"></div>
                      <span className="font-orbitron text-gray-300">
                        Loading players...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {playersData?.players.map((player) => (
                      <Card
                        key={player.id}
                        className="group border-white/10 bg-gray-800/40 shadow-lg transition-all duration-300 hover:border-cyan-400/30 hover:shadow-cyan-500/20"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {player.image_url ? (
                                <img
                                  src={player.image_url}
                                  alt={`${player.first_name} ${player.last_name}`}
                                  className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-gray-700/50">
                                  <UserIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}

                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white transition-colors group-hover:text-cyan-200">
                                  {player.first_name} {player.last_name}
                                  {player.username && (
                                    <span className="ml-2 font-normal text-gray-500">
                                      @{player.username}
                                    </span>
                                  )}
                                </h3>
                                <p className="font-medium text-gray-400">
                                  {player.school_ref?.name ??
                                    player.school ??
                                    "No school"}
                                  {player.class_year &&
                                    ` • Class of ${player.class_year}`}
                                  {player.location && ` • ${player.location}`}
                                </p>
                                <div className="mt-1 flex space-x-4 text-sm text-gray-500">
                                  <span className="font-orbitron">
                                    {player._count.game_profiles} game profiles
                                  </span>
                                  <span className="font-orbitron">
                                    {player._count.tryout_registrations} tryouts
                                  </span>
                                  <span className="font-orbitron">
                                    {player._count.combine_registrations}{" "}
                                    combines
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {player.main_game && (
                                <Badge
                                  variant="secondary"
                                  className="font-orbitron border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                                >
                                  {player.main_game.short_name}
                                </Badge>
                              )}
                              {player.class_year && (
                                <Badge
                                  variant="outline"
                                  className="font-orbitron border-white/20 text-gray-300"
                                >
                                  {player.class_year}
                                </Badge>
                              )}
                              {player.username && (
                                <Link
                                  href={`/profiles/players/${player.username}`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/20 text-gray-300 hover:border-cyan-400/50 hover:text-white"
                                  >
                                    <ExternalLink className="mr-2 h-4 w-4" />
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
                    <div className="flex items-center justify-between pt-4">
                      <p className="font-orbitron text-sm text-gray-400">
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
                          className="border-white/20 text-gray-300 hover:border-cyan-400/50 hover:text-white"
                        >
                          Previous
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPlayerPage(playerPage + 1)}
                          disabled={!playersData?.hasMore}
                          className="border-white/20 text-gray-300 hover:border-cyan-400/50 hover:text-white"
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
            <Card className="rounded-xl border-white/20 bg-gray-900/70 shadow-2xl backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl font-bold tracking-wide text-white">
                  LEAGUE DIRECTORY
                </CardTitle>
                <CardDescription className="font-medium text-gray-400">
                  Browse all leagues with direct links to their public profiles
                </CardDescription>
                <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-transparent"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Enhanced League Filters */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search leagues..."
                      value={leagueSearch}
                      onChange={(e) => {
                        setLeagueSearch(e.target.value);
                        setLeaguePage(0);
                      }}
                      className="border-white/20 bg-gray-800/50 pl-10 text-white transition-colors placeholder:text-gray-400 focus:border-purple-400/50"
                    />
                  </div>

                  <Select
                    value={leagueTier || "all"}
                    onValueChange={(value) => {
                      setLeagueTier(value === "all" ? "" : value);
                      setLeaguePage(0);
                    }}
                  >
                    <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                      <SelectValue placeholder="League Tier" />
                    </SelectTrigger>
                    <SelectContent className="border-white/20 bg-gray-800">
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="ELITE">Elite</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                      <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                      <SelectItem value="DEVELOPMENTAL">
                        Developmental
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={leagueStatus || "all"}
                    onValueChange={(value) => {
                      setLeagueStatus(value === "all" ? "" : value);
                      setLeaguePage(0);
                    }}
                  >
                    <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="border-white/20 bg-gray-800">
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
                    className="border-white/20 text-gray-300 transition-colors hover:border-purple-400/50 hover:text-white"
                  >
                    Clear Filters
                  </Button>
                </div>

                {/* Leagues List */}
                {leaguesLoading ? (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center space-x-3">
                      <div className="h-6 w-6 animate-pulse rounded-full bg-gradient-to-r from-purple-400 to-purple-500"></div>
                      <span className="font-orbitron text-gray-300">
                        Loading leagues...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaguesData?.leagues.map((league) => (
                      <Card
                        key={league.id}
                        className="group border-white/10 bg-gray-800/40 shadow-lg transition-all duration-300 hover:border-purple-400/30 hover:shadow-purple-500/20"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {league.logo_url ? (
                                <img
                                  src={league.logo_url}
                                  alt={`${league.name} logo`}
                                  className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-white/10 bg-gray-700/50">
                                  <Trophy className="h-8 w-8 text-gray-400" />
                                </div>
                              )}

                              <div>
                                <h3 className="font-orbitron text-lg font-bold text-white transition-colors group-hover:text-purple-200">
                                  {league.name}
                                </h3>
                                <p className="font-medium text-gray-400">
                                  {league.region}
                                  {league.state && `, ${league.state}`} •{" "}
                                  {league.season}
                                </p>
                                <div className="mt-1 flex space-x-4 text-sm text-gray-500">
                                  <span className="font-orbitron">
                                    {league._count.schools} schools
                                  </span>
                                  <span className="font-orbitron">
                                    {league._count.teams} teams
                                  </span>
                                  <span className="font-orbitron">
                                    {league._count.player_participants} players
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="secondary"
                                className="font-orbitron border-purple-500/30 bg-purple-500/20 text-purple-400"
                              >
                                {formatTier(league.tier)}
                              </Badge>
                              <Badge
                                variant={
                                  league.status === "ACTIVE"
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  league.status === "ACTIVE"
                                    ? "font-orbitron border-green-500/30 bg-green-500/20 text-green-400"
                                    : "font-orbitron border-white/20 text-gray-300"
                                }
                              >
                                {formatStatus(league.status)}
                              </Badge>
                              <Link href={`/profiles/leagues/${league.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-gray-300 hover:border-purple-400/50 hover:text-white"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View Profile
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {/* Enhanced Pagination */}
                    <div className="flex items-center justify-between pt-4">
                      <p className="font-orbitron text-sm text-gray-400">
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
                          className="border-white/20 text-gray-300 hover:border-purple-400/50 hover:text-white"
                        >
                          Previous
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLeaguePage(leaguePage + 1)}
                          disabled={!leaguesData?.hasMore}
                          className="border-white/20 text-gray-300 hover:border-purple-400/50 hover:text-white"
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
