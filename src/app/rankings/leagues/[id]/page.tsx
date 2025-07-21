"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Users,
  MapPin,
  ChevronRight,
  Award,
  TrendingUp,
  User,
  Loader2,
  Calendar,
  DollarSign,
  Globe,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/trpc/react";

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="h-4 w-4 text-green-400" />;
  if (trend === "down")
    return <TrendingUp className="h-4 w-4 rotate-180 text-red-400" />;
  return <div className="h-4 w-4" />;
}

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
  ACTIVE: "bg-green-400 text-black",
  COMPLETED: "bg-gray-400 text-white",
  UPCOMING: "bg-blue-400 text-black",
  CANCELLED: "bg-red-400 text-white",
};

export default function LeagueDetailPage() {
  const params = useParams();
  const leagueId = params.id as string;
  const [activeTab, setActiveTab] = useState("teams");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const {
    data: league,
    isLoading,
    error,
  } = api.leagues.getById.useQuery({ id: leagueId });

  // Set default game when league loads
  useEffect(() => {
    if (league?.league_games?.[0]?.game?.id && !selectedGame) {
      setSelectedGame(league.league_games[0].game.id);
    }
  }, [league, selectedGame]);

  const { data: leaderboard, isLoading: leaderboardLoading } =
    api.leagues.getLeaderboard.useQuery({
      id: leagueId,
      limit: 20,
    });
  const { data: topPlayers, isLoading: playersLoading } =
    api.leagues.getTopPlayers.useQuery({
      id: leagueId,
      limit: 20,
    });

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900/60 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400/20 to-cyan-500/20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
          <p className="font-medium text-gray-300">Loading league details...</p>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900/60 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="mx-auto max-w-2xl rounded-lg border border-white/10 bg-white/5 p-12 backdrop-blur-md">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20">
              <Trophy className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="font-orbitron mb-4 text-4xl font-bold text-white">
              League Not Found
            </h1>
            <p className="mb-8 text-lg font-medium text-gray-300">
              The league you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/rankings/leagues">
              <Button className="font-orbitron rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-cyan-700 hover:shadow-xl hover:shadow-cyan-400/25">
                Back to Leagues
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="relative min-h-screen overflow-hidden bg-gray-900/60 text-white">
      {/* Background accent elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/8 to-transparent blur-2xl"></div>
      <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-gradient-to-tl from-orange-500/8 to-transparent blur-xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-400">
            <Link
              href="/rankings"
              className="transition-colors hover:text-cyan-400"
            >
              Rankings
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/rankings/leagues"
              className="transition-colors hover:text-cyan-400"
            >
              Leagues
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-cyan-400">{league.short_name}</span>
          </div>
        </div>

        {/* League Header */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-lg border border-white/10 shadow-2xl">
            {/* Banner Background */}
            {league.banner_url ? (
              <div className="absolute inset-0">
                <Image
                  src={league.banner_url}
                  alt={`${league.name} banner`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/85 to-gray-900/95" />
              </div>
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-b from-gray-800/40 to-gray-900/30`}
              />
            )}

            {/* Content */}
            <div className="relative p-8">
              <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center">
                {/* Logo Section */}
                {league.logo_url ? (
                  <div className="relative h-28 w-28 overflow-hidden rounded-2xl bg-black/20 shadow-xl">
                    <Image
                      src={league.logo_url}
                      alt={`${league.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className={`h-28 w-28 bg-gradient-to-br ${gameColor} flex items-center justify-center rounded-2xl shadow-xl`}
                  >
                    <Trophy className="h-14 w-14 text-white" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <h1 className="font-orbitron text-3xl font-black tracking-wide text-white md:text-4xl">
                      {league.name}
                    </h1>
                    <Badge
                      className={`${tierColor} font-orbitron font-bold shadow-lg`}
                    >
                      {league.tier}
                    </Badge>
                    <Badge
                      className={`${statusColor} font-orbitron font-bold shadow-lg`}
                    >
                      {league.status}
                    </Badge>
                  </div>

                  <p className="mb-6 text-lg leading-relaxed font-medium text-gray-300">
                    {league.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-md border border-white/10 bg-gray-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-900/60">
                      <div className="mb-2 flex items-center space-x-2">
                        <Users className="h-5 w-5 text-cyan-400" />
                        <span className="font-orbitron text-sm font-bold text-white">
                          Teams
                        </span>
                      </div>
                      <p className="font-orbitron text-2xl font-black text-cyan-400">
                        {league.teams?.length ?? 0}
                      </p>
                    </div>

                    <div className="rounded-md border border-white/10 bg-gray-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/30 hover:bg-gray-900/60">
                      <div className="mb-2 flex items-center space-x-2">
                        <User className="h-5 w-5 text-purple-400" />
                        <span className="font-orbitron text-sm font-bold text-white">
                          Players
                        </span>
                      </div>
                      <p className="font-orbitron text-2xl font-black text-purple-400">
                        {league.player_participants?.length ?? 0}
                      </p>
                    </div>

                    <div className="rounded-md border border-white/10 bg-gray-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-orange-400/30 hover:bg-gray-900/60">
                      <div className="mb-2 flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-orange-400" />
                        <span className="font-orbitron text-sm font-bold text-white">
                          Region
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-300">
                        {league.state ?? league.region}
                      </p>
                    </div>

                    <Link
                      href={`/profiles/leagues/${league.id}`}
                      className="group rounded-md border border-white/10 bg-gray-900/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-900/60"
                    >
                      <div className="mb-2 flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-cyan-400" />
                        <span className="font-orbitron text-sm font-bold text-white">
                          Public Profile
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300 transition-colors group-hover:text-cyan-400">
                        <span>View Profile</span>
                        <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Selection Tabs - Only show if multiple games */}
        {league.league_games && league.league_games.length > 1 && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-center">
              <span className="font-orbitron mr-4 text-sm font-bold text-gray-400">
                FILTER BY GAME:
              </span>
              <div className="flex gap-2">
                {league.league_games.map((leagueGame) => (
                  <button
                    key={leagueGame.game.id}
                    onClick={() => setSelectedGame(leagueGame.game.id)}
                    className={`font-orbitron rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300 ${
                      selectedGame === leagueGame.game.id
                        ? `bg-gradient-to-r ${gameColors[leagueGame.game.short_name as keyof typeof gameColors] ?? "from-gray-500 to-gray-700"} text-white shadow-lg`
                        : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    {leagueGame.game.short_name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rankings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mx-auto mb-8 flex w-fit rounded-lg border border-white/10 bg-white/5 p-1 shadow-xl backdrop-blur-md">
            <TabsTrigger
              value="teams"
              className="font-orbitron mx-1 rounded-md px-3 py-2 text-xs font-bold text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 data-[state=active]:text-black data-[state=active]:shadow-lg md:px-6 md:text-sm"
            >
              TEAM RANKINGS
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="font-orbitron mx-1 rounded-md px-3 py-2 text-xs font-bold text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg md:px-6 md:text-sm"
            >
              PLAYER RANKINGS
            </TabsTrigger>
          </TabsList>

          {/* Team Rankings */}
          <TabsContent value="teams">
            <Card className="rounded-lg border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl font-bold tracking-wide text-white">
                  Team Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400/20 to-cyan-500/20">
                      <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                    </div>
                    <span className="ml-3 font-medium text-gray-300">
                      Loading teams...
                    </span>
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {/* Desktop Table Header - Hidden on Mobile */}
                    <div className="font-orbitron hidden grid-cols-12 gap-4 border-b border-gray-600/50 px-5 py-3 text-sm font-bold text-gray-400 md:grid">
                      <div className="col-span-1 text-center">RANK</div>
                      <div className="col-span-5">TEAM</div>
                      <div className="col-span-2 text-center">W-L</div>
                      <div className="col-span-2 text-center">POINTS</div>
                      <div className="col-span-2 text-center">MEMBERS</div>
                    </div>

                    {/* Responsive Table Rows */}
                    {leaderboard.map((team) => (
                      <div
                        key={team.rank}
                        className="group rounded-md border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-lg hover:shadow-cyan-400/10"
                      >
                        {/* Desktop Layout */}
                        <div className="hidden grid-cols-12 items-center gap-4 p-5 md:grid">
                          <div className="col-span-1 flex justify-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-lg">
                              <span className="font-orbitron text-sm font-black text-black">
                                {team.rank}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-5">
                            <h3 className="font-orbitron font-bold text-white transition-colors group-hover:text-cyan-200">
                              {team.team_name}
                            </h3>
                            <p className="text-sm font-medium text-gray-400">
                              {team.school_name}
                            </p>
                            <p className="text-xs font-medium text-gray-500">
                              {team.school_location}
                            </p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="font-medium text-gray-300">
                              {team.wins}-{team.losses}
                            </p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="font-orbitron font-black text-cyan-400">
                              {team.points}
                            </p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="font-medium text-gray-300">
                              {team.members.length}
                            </p>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="p-4 md:hidden">
                          <div className="flex items-start space-x-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 shadow-lg">
                              <span className="font-orbitron text-xs font-black text-black">
                                {team.rank}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-orbitron truncate font-bold text-white transition-colors group-hover:text-cyan-200">
                                {team.team_name}
                              </h3>
                              <p className="truncate text-sm font-medium text-gray-400">
                                {team.school_name}
                              </p>
                              <p className="truncate text-xs font-medium text-gray-500">
                                {team.school_location}
                              </p>

                              <div className="mt-3 flex items-center justify-between border-t border-gray-600/30 pt-3">
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-400">
                                    W-L
                                  </p>
                                  <p className="text-sm font-medium text-gray-300">
                                    {team.wins}-{team.losses}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-400">
                                    POINTS
                                  </p>
                                  <p className="font-orbitron text-sm font-black text-cyan-400">
                                    {team.points}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-400">
                                    MEMBERS
                                  </p>
                                  <p className="text-sm font-medium text-gray-300">
                                    {team.members.length}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gray-600/20 to-gray-700/20">
                      <Users className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="font-medium text-gray-400">
                      No teams found in this league
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Rankings */}
          <TabsContent value="players">
            <Card className="rounded-lg border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl font-bold tracking-wide text-white">
                  Player Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-400/20 to-purple-500/20">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    </div>
                    <span className="ml-3 font-medium text-gray-300">
                      Loading players...
                    </span>
                  </div>
                ) : topPlayers && topPlayers.length > 0 ? (
                  <div className="space-y-3">
                    {/* Desktop Table Header - Hidden on Mobile */}
                    <div className="font-orbitron hidden grid-cols-12 gap-4 border-b border-gray-600/50 px-5 py-3 text-sm font-bold text-gray-400 md:grid">
                      <div className="col-span-1 text-center">RANK</div>
                      <div className="col-span-4">PLAYER</div>
                      <div className="col-span-2 text-center">EVAL</div>
                      <div className="col-span-2 text-center">W-L</div>
                      <div className="col-span-2 text-center">GAMES</div>
                      <div className="col-span-1 text-center">ROLE</div>
                    </div>

                    {/* Responsive Table Rows */}
                    {topPlayers.map((player) => (
                      <div
                        key={player.rank}
                        className="group rounded-md border border-white/10 bg-slate-900/15 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/30 hover:bg-slate-700/10 hover:shadow-lg hover:shadow-purple-400/10"
                      >
                        {/* Desktop Layout */}
                        <div className="hidden grid-cols-12 items-center gap-4 p-5 md:grid">
                          <div className="col-span-1 flex justify-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-purple-500 shadow-lg">
                              <span className="font-orbitron text-sm font-black text-black">
                                {player.rank}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-4">
                            <h3 className="font-orbitron font-bold text-white transition-colors group-hover:text-purple-200">
                              {player.username}
                            </h3>
                            <p className="text-sm font-medium text-gray-400">
                              {player.school}
                            </p>
                            {player.main_agent && (
                              <p className="text-xs font-medium text-gray-500">
                                Main: {player.main_agent}
                              </p>
                            )}
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="font-orbitron font-black text-purple-400">
                              {player.eval_score?.toFixed(1) ?? "N/A"}
                            </p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="font-medium text-gray-300">
                              {player.wins}-{player.losses}
                            </p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="font-medium text-gray-300">
                              {player.games_played}
                            </p>
                          </div>

                          <div className="col-span-1 text-center">
                            <p className="text-xs font-medium text-gray-300">
                              {player.role ?? "-"}
                            </p>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="p-4 md:hidden">
                          <div className="flex items-start space-x-4">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-400 to-purple-500 shadow-lg">
                              <span className="font-orbitron text-xs font-black text-black">
                                {player.rank}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-orbitron truncate font-bold text-white transition-colors group-hover:text-purple-200">
                                {player.username}
                              </h3>
                              <p className="truncate text-sm font-medium text-gray-400">
                                {player.school}
                              </p>
                              {player.main_agent && (
                                <p className="truncate text-xs font-medium text-gray-500">
                                  Main: {player.main_agent}
                                </p>
                              )}

                              <div className="mt-3 grid grid-cols-4 gap-2 border-t border-gray-600/30 pt-3">
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-400">
                                    EVAL
                                  </p>
                                  <p className="font-orbitron text-sm font-black text-purple-400">
                                    {player.eval_score?.toFixed(1) ?? "N/A"}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-400">
                                    W-L
                                  </p>
                                  <p className="text-sm font-medium text-gray-300">
                                    {player.wins}-{player.losses}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-400">
                                    GAMES
                                  </p>
                                  <p className="text-sm font-medium text-gray-300">
                                    {player.games_played}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs font-medium text-gray-400">
                                    ROLE
                                  </p>
                                  <p className="text-xs font-medium text-gray-300">
                                    {player.role ?? "-"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-gray-600/20 to-gray-700/20">
                      <User className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="font-medium text-gray-400">
                      No players found in this league
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* League Info */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="rounded-lg border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
            <CardContent className="p-6">
              <h3 className="font-orbitron mb-4 text-lg font-bold text-white">
                League Information
              </h3>
              <div className="space-y-3">
                {league.founded_year && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-400">Founded</span>
                    <span className="font-medium text-white">
                      {league.founded_year}
                    </span>
                  </div>
                )}
                {league.format && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-400">Format</span>
                    <span className="font-medium text-white">
                      {league.format}
                    </span>
                  </div>
                )}
                {league.prize_pool && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-400">
                      Prize Pool
                    </span>
                    <span className="font-medium text-white">
                      {league.prize_pool}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-400">Season</span>
                  <span className="font-medium text-white">
                    {league.season}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-400">Region</span>
                  <span className="font-medium text-white">
                    {league.region}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
            <CardContent className="p-6">
              <h3 className="font-orbitron mb-4 text-lg font-bold text-white">
                Participating Schools
              </h3>
              {league.schools && league.schools.length > 0 ? (
                <div className="max-h-48 space-y-3 overflow-y-auto">
                  {league.schools.map((leagueSchool) => (
                    <div
                      key={leagueSchool.school.id}
                      className="rounded border border-white/10 bg-white/5 p-2 text-sm backdrop-blur-sm"
                    >
                      <p className="font-medium text-white">
                        {leagueSchool.school.name}
                      </p>
                      <p className="text-xs font-medium text-gray-400">
                        {leagueSchool.school.location}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-medium text-gray-400">
                  No schools registered
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
            <CardContent className="p-6">
              <h3 className="font-orbitron mb-4 text-lg font-bold text-white">
                Recent Matches
              </h3>
              {league.matches && league.matches.length > 0 ? (
                <div className="max-h-48 space-y-3 overflow-y-auto">
                  {league.matches.slice(0, 5).map((match) => (
                    <div
                      key={match.id}
                      className="border-b border-gray-600/40 pb-3 text-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-white">
                            {match.team_a.name} vs {match.team_b.name}
                          </p>
                          <p className="text-xs font-medium text-gray-400">
                            {match.played_at
                              ? new Date(match.played_at).toLocaleDateString()
                              : new Date(
                                  match.scheduled_at,
                                ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {match.team_a_score !== null &&
                          match.team_b_score !== null ? (
                            <p className="font-orbitron text-xs font-bold text-cyan-400">
                              {match.team_a_score}-{match.team_b_score}
                            </p>
                          ) : (
                            <Badge className="bg-gray-600/50 text-xs font-medium text-white">
                              {match.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-medium text-gray-400">
                  No matches scheduled
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
