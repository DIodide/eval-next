"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Users,
  Trophy,
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import Image from "next/image";

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "League of Legends": "from-purple-500 to-purple-700",
};

const tierColors = {
  ELITE: "bg-yellow-400 text-black",
  PROFESSIONAL: "bg-purple-400 text-white",
  COMPETITIVE: "bg-cyan-400 text-black",
  DEVELOPMENTAL: "bg-green-400 text-black",
};

const statusColors = {
  ACTIVE: "bg-green-400 text-white",
  COMPLETED: "bg-gray-400 text-white",
  UPCOMING: "bg-blue-400 text-white",
  CANCELLED: "bg-red-400 text-white",
};

type League = {
  id: string;
  name: string;
  short_name: string;
  region: string;
  state: string | null;
  season: string;
  status: string;
  tier: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  league_games: Array<{
    game: {
      id: string;
      name: string;
      short_name: string;
      color: string | null;
      icon: string | null;
    };
  }>;
  teams: Array<{
    team: {
      id: string;
      name: string;
      school: {
        name: string;
        location: string | null;
      };
    };
  }>;
  schools: Array<{
    school: {
      id: string;
      name: string;
      location: string | null;
      state: string | null;
    };
  }>;
  player_participants: Array<{ id: string }>;
};

function LeagueCard({ league }: { league: League }) {
  const gameColor =
    gameColors[
      league.league_games?.[0]?.game?.short_name as keyof typeof gameColors
    ] ?? "from-gray-500 to-gray-700";
  const tierColor =
    tierColors[league.tier as keyof typeof tierColors] ??
    "bg-gray-400 text-white";
  const statusColor =
    statusColors[league.status as keyof typeof statusColors] ??
    "bg-gray-400 text-white";

  return (
    <Link href={`/rankings/leagues/${league.id}`}>
      <Card className="group h-full cursor-pointer border-gray-600/50 bg-gradient-to-br from-gray-800/80 to-gray-900/60 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:transform hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-400/25">
        <CardContent className="relative overflow-hidden p-6">
          {/* Banner Background */}
          {league.banner_url && (
            <div className="absolute inset-0 h-full w-full opacity-20 transition-opacity duration-500 group-hover:opacity-30">
              <Image
                src={league.banner_url}
                alt={`${league.name} banner`}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
            </div>
          )}

          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-bl from-cyan-500/5 to-transparent opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>

          <div className="relative z-10 mb-4 flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {league.logo_url ? (
                <div className="h-12 w-12 overflow-hidden rounded-xl shadow-lg transition-shadow duration-300 group-hover:shadow-xl">
                  <Image
                    src={league.logo_url}
                    alt={`${league.name} logo`}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`h-12 w-12 bg-gradient-to-br ${gameColor} flex items-center justify-center rounded-xl shadow-lg transition-shadow duration-300 group-hover:shadow-xl`}
                >
                  <Trophy className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-orbitron text-lg font-bold tracking-wide text-white transition-colors duration-300 group-hover:text-cyan-200">
                  {league.short_name}
                </h3>
                <p className="text-sm font-medium text-gray-400">
                  {league.league_games?.[0]?.game?.name}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`${tierColor} font-orbitron text-xs`}>
                {league.tier}
              </Badge>
              <Badge className={`${statusColor} font-orbitron text-xs`}>
                {league.status}
              </Badge>
            </div>
          </div>

          <div className="relative z-10">
            <h4 className="font-orbitron mb-2 text-sm tracking-wide text-white transition-colors duration-300 group-hover:text-cyan-100">
              {league.name}
            </h4>
            <p className="mb-4 text-sm font-medium text-gray-300">
              {league.description ?? "Competitive esports league"}
            </p>

            <div className="mb-4 space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-cyan-400 transition-colors duration-300 group-hover:text-cyan-300" />
                <span className="font-medium text-gray-300">
                  {league.state ?? league.region}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-purple-400 transition-colors duration-300 group-hover:text-purple-300" />
                <span className="font-medium text-gray-300">
                  {league.teams.length} teams •{" "}
                  {league.player_participants.length} players
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-orange-400 transition-colors duration-300 group-hover:text-orange-300" />
                <span className="font-medium text-gray-300">
                  {league.season}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-400">
                {league.schools.length} schools participating
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:transform group-hover:text-cyan-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LeaguesRankingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedState, setSelectedState] = useState("all");

  // Get all leagues with filters
  const {
    data: leagues,
    isLoading,
    error,
  } = api.leagues.getAll.useQuery({
    ...(selectedGame !== "all" && { game_id: selectedGame }),
    ...(selectedTier !== "all" && {
      tier: selectedTier as
        | "ELITE"
        | "PROFESSIONAL"
        | "COMPETITIVE"
        | "DEVELOPMENTAL",
    }),
    ...(selectedStatus !== "all" && {
      status: selectedStatus as
        | "ACTIVE"
        | "COMPLETED"
        | "UPCOMING"
        | "CANCELLED",
    }),
    ...(selectedState !== "all" && { state: selectedState }),
  });

  // Filter leagues by search query
  const filteredLeagues =
    leagues?.filter(
      (league) =>
        league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        league.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (league.state?.toLowerCase() ?? "").includes(searchQuery.toLowerCase()),
    ) ?? [];

  // Get unique values for filters
  const games = Array.from(
    new Set(
      leagues?.map((l) => l.league_games?.[0]?.game).filter(Boolean) ?? [],
    ),
  ).map((g) => ({ id: g!.id, name: g!.name }));
  const states = Array.from(
    new Set(
      leagues?.map((l) => l.state).filter((s): s is string => Boolean(s)) ?? [],
    ),
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900/60 to-black">
        <div className="container mx-auto px-6 text-center">
          <div className="mx-auto max-w-2xl rounded-3xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-12 backdrop-blur-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20">
              <Trophy className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="font-orbitron mb-4 text-4xl font-bold text-white">
              Error Loading Leagues
            </h1>
            <p className="mb-8 text-lg font-medium text-gray-300">
              Failed to load league data. Please try again later.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="font-orbitron rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-cyan-400/25"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900/60 text-white">
      {/* Background accent elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/8 to-transparent blur-2xl"></div>
      <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-gradient-to-tl from-orange-500/8 to-transparent blur-xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Compact Header */}
        <div className="mb-12 text-center">
          <div className="mb-4">
            <h1 className="font-orbitron text-center text-3xl font-black text-white md:text-6xl">
              LEAGUE RANKINGS
            </h1>
          </div>

          {/* Compact Rainbow Divider */}
          <div className="mb-6 flex items-center justify-center">
            <div className="to-eval-cyan h-0.5 w-12 bg-gradient-to-r from-transparent"></div>
            <div className="from-eval-cyan to-eval-purple h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-purple to-eval-orange h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-orange h-0.5 w-12 bg-gradient-to-r to-transparent"></div>
          </div>

          <p className="mx-auto max-w-3xl text-lg font-medium text-gray-300">
            Explore competitive esports leagues across the country. Find the
            best teams, players, and schools competing at the highest level.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="rounded-3xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Search leagues, regions, or states..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-gray-500/50 bg-gray-700/50 pl-10 font-medium text-white placeholder-gray-400 transition-all duration-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger className="w-full border-gray-500/50 bg-gray-700/50 font-medium text-white transition-colors hover:border-cyan-400/50 sm:w-40">
                    <SelectValue placeholder="Game" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-600 bg-gray-800 backdrop-blur-sm">
                    <SelectItem
                      value="all"
                      className="font-medium text-white focus:bg-cyan-400/20"
                    >
                      All Games
                    </SelectItem>
                    {games.map((game) => (
                      <SelectItem
                        key={game.id}
                        value={game.id}
                        className="font-medium text-white focus:bg-cyan-400/20"
                      >
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-full border-gray-500/50 bg-gray-700/50 font-medium text-white transition-colors hover:border-purple-400/50 sm:w-40">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-600 bg-gray-800 backdrop-blur-sm">
                    <SelectItem
                      value="all"
                      className="font-medium text-white focus:bg-purple-400/20"
                    >
                      All Tiers
                    </SelectItem>
                    <SelectItem
                      value="ELITE"
                      className="font-medium text-white focus:bg-purple-400/20"
                    >
                      Elite
                    </SelectItem>
                    <SelectItem
                      value="PROFESSIONAL"
                      className="font-medium text-white focus:bg-purple-400/20"
                    >
                      Professional
                    </SelectItem>
                    <SelectItem
                      value="COMPETITIVE"
                      className="font-medium text-white focus:bg-purple-400/20"
                    >
                      Competitive
                    </SelectItem>
                    <SelectItem
                      value="DEVELOPMENTAL"
                      className="font-medium text-white focus:bg-purple-400/20"
                    >
                      Developmental
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full border-gray-500/50 bg-gray-700/50 font-medium text-white transition-colors hover:border-orange-400/50 sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-600 bg-gray-800 backdrop-blur-sm">
                    <SelectItem
                      value="all"
                      className="font-medium text-white focus:bg-orange-400/20"
                    >
                      All Status
                    </SelectItem>
                    <SelectItem
                      value="ACTIVE"
                      className="font-medium text-white focus:bg-orange-400/20"
                    >
                      Active
                    </SelectItem>
                    <SelectItem
                      value="UPCOMING"
                      className="font-medium text-white focus:bg-orange-400/20"
                    >
                      Upcoming
                    </SelectItem>
                    <SelectItem
                      value="COMPLETED"
                      className="font-medium text-white focus:bg-orange-400/20"
                    >
                      Completed
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full border-gray-500/50 bg-gray-700/50 font-medium text-white transition-colors hover:border-cyan-400/50 sm:w-40">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-600 bg-gray-800 backdrop-blur-sm">
                    <SelectItem
                      value="all"
                      className="font-medium text-white focus:bg-cyan-400/20"
                    >
                      All States
                    </SelectItem>
                    {states.map((state) => (
                      <SelectItem
                        key={state}
                        value={state}
                        className="font-medium text-white focus:bg-cyan-400/20"
                      >
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400/20 to-cyan-500/20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
              <p className="font-medium text-gray-300">Loading leagues...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="font-orbitron text-2xl font-bold text-white">
                  ACTIVE LEAGUES
                </h2>
                <div className="rounded-full border border-gray-600/40 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-4 py-2">
                  <p className="text-sm font-medium text-gray-300">
                    {filteredLeagues.length} of {leagues?.length ?? 0} leagues
                  </p>
                </div>
              </div>
            </div>

            {filteredLeagues.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredLeagues.map((league) => (
                  <LeagueCard key={league.id} league={league} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="rounded-3xl border border-gray-600/40 bg-gradient-to-br from-gray-800/60 to-gray-900/40 p-12 backdrop-blur-sm">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-gray-600/40 to-gray-700/40">
                    <Trophy className="h-10 w-10 text-gray-500" />
                  </div>
                  <h3 className="font-orbitron mb-4 text-2xl font-bold text-white">
                    No Leagues Found
                  </h3>
                  <p className="mb-6 text-lg font-medium text-gray-400">
                    {searchQuery
                      ? "No leagues match your search criteria. Try adjusting your filters."
                      : "No leagues are currently available."}
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedGame("all");
                        setSelectedTier("all");
                        setSelectedStatus("all");
                        setSelectedState("all");
                      }}
                      className="font-orbitron rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-cyan-400/25"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
