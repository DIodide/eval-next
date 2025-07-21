"use client";

import { useState, use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Trophy,
  Calendar,
  Users,
  Building2,
  GamepadIcon,
  ExternalLink,
  TrophyIcon,
  Clock,
  UserIcon,
  Share2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface LeagueProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Banner skeleton */}
      <div className="relative h-64 w-full animate-pulse bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto -mt-20 max-w-7xl space-y-8 px-4 pb-16">
        {/* Header skeleton */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
          <Skeleton className="h-32 w-32 rounded-xl bg-gray-700" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-3/4 bg-gray-700" />
            <Skeleton className="h-6 w-1/2 bg-gray-700" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 bg-gray-700" />
              <Skeleton className="h-8 w-24 bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Content skeletons */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-gray-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-gray-700" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-gray-700" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full bg-gray-700" />
                <Skeleton className="h-16 w-full bg-gray-700" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTierColor(tier: string) {
  switch (tier) {
    case "ELITE":
      return "bg-yellow-600 text-yellow-100 border-yellow-500";
    case "PROFESSIONAL":
      return "bg-purple-600 text-purple-100 border-purple-500";
    case "COMPETITIVE":
      return "bg-blue-600 text-blue-100 border-blue-500";
    case "DEVELOPMENTAL":
      return "bg-green-600 text-green-100 border-green-500";
    default:
      return "bg-gray-600 text-gray-100 border-gray-500";
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-600 text-green-100 border-green-500";
    case "UPCOMING":
      return "bg-blue-600 text-blue-100 border-blue-500";
    case "COMPLETED":
      return "bg-gray-600 text-gray-100 border-gray-500";
    case "CANCELLED":
      return "bg-red-600 text-red-100 border-red-500";
    default:
      return "bg-gray-600 text-gray-100 border-gray-500";
  }
}

function getGameColor(gameName: string) {
  switch (gameName.toLowerCase()) {
    case "valorant":
      return "#FF4654";
    case "overwatch 2":
      return "#F99E1A";
    case "super smash bros. ultimate":
    case "smash":
      return "#0066CC";
    case "rocket league":
      return "#1F8AC6";
    default:
      return "#6B7280";
  }
}

export default function LeagueProfilePage({ params }: LeagueProfilePageProps) {
  const resolvedParams = use(params);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>("all");

  // Handle share profile functionality
  const handleShareProfile = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("League profile URL copied to clipboard!");
    } catch (err) {
      console.error(err);
      // Fallback for browsers that don't support clipboard API
      toast.error("Unable to copy to clipboard. Please copy the URL manually.");
    }
  };

  const {
    data: league,
    isLoading,
    error,
  } = api.leagueAdminProfile.getLeagueById.useQuery({
    id: resolvedParams.id,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !league) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="space-y-4 text-center">
          <div className="text-6xl">🏆</div>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            League Not Found
          </h1>
          <p className="max-w-md text-gray-400">
            The league you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/rankings/leagues">
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              Browse All Leagues
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalTeams = league.teams?.length ?? 0;
  const totalSchools = league.schools?.length ?? 0;
  const supportedGames = league.league_games ?? [];
  const administrators = league.administrators ?? [];

  const filteredTeams =
    selectedGameFilter === "all"
      ? league.teams
      : league.teams?.filter((leagueTeam) => {
          // For now, we don't have game info per team, so we'll show all
          return true;
        });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Banner Header */}
      <div className="relative h-64 w-full overflow-hidden">
        {league.banner_url ? (
          <Image
            src={league.banner_url}
            alt={`${league.name} banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

        {/* League Basic Info Overlay - moved to right side to avoid profile picture overlap */}
        <div className="absolute right-6 bottom-6">
          <div className="flex items-center gap-2 rounded-lg bg-black/40 px-4 py-2 text-white backdrop-blur-sm">
            <MapPin className="h-4 w-4" />
            <span className="font-rajdhani text-sm">
              {league.region}
              {league.state ? `, ${league.state}` : ""}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-20 max-w-7xl space-y-8 px-4 pb-16">
        {/* League Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
          {/* League Logo */}
          <div className="flex-shrink-0">
            <Avatar className="h-32 w-32 border-4 border-white/20 bg-gray-800">
              <AvatarImage
                src={league.logo_url ?? undefined}
                alt={league.name}
              />
              <AvatarFallback className="font-orbitron bg-purple-700 text-3xl text-white">
                {league.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* League Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="font-orbitron mb-2 text-4xl font-bold text-white lg:text-5xl">
                {league.name}
              </h1>
              <p className="font-rajdhani text-xl text-gray-300">
                {league.short_name} • {league.season} Season
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getTierColor(league.tier)} border`}>
                <Trophy className="mr-1 h-3 w-3" />
                {league.tier}
              </Badge>
              <Badge className={`${getStatusColor(league.status)} border`}>
                <Clock className="mr-1 h-3 w-3" />
                {league.status}
              </Badge>
              {league.founded_year && (
                <Badge
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  Est. {league.founded_year}
                </Badge>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-white">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="font-rajdhani">
                  <span className="text-lg font-bold">{totalTeams}</span> Teams
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="font-rajdhani">
                  <span className="text-lg font-bold">{totalSchools}</span>{" "}
                  Schools
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GamepadIcon className="h-5 w-5 text-gray-400" />
                <span className="font-rajdhani">
                  <span className="text-lg font-bold">
                    {supportedGames.length}
                  </span>{" "}
                  Games
                </span>
              </div>
              {administrators.length > 0 && (
                <div className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="font-rajdhani">
                    <span className="text-lg font-bold">
                      {administrators.length}
                    </span>{" "}
                    Admin{administrators.length > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* About Section */}
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">
                  About {league.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-rajdhani text-lg leading-relaxed text-gray-300">
                  {league.description ||
                    `${league.name} is a ${league.tier.toLowerCase()} tier esports league operating in ${league.region}${league.state ? `, ${league.state}` : ""}. Join competitive gaming teams and participate in organized tournaments across multiple games.`}
                </p>

                {league.format && (
                  <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
                    <h4 className="font-orbitron mb-2 font-semibold text-white">
                      League Format
                    </h4>
                    <p className="font-rajdhani text-gray-300">
                      {league.format}
                    </p>
                  </div>
                )}

                {league.prize_pool && (
                  <div className="mt-4 rounded-lg border border-yellow-700/50 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 p-4">
                    <h4 className="font-orbitron mb-2 flex items-center gap-2 font-semibold text-yellow-200">
                      <TrophyIcon className="h-4 w-4" />
                      Prize Pool
                    </h4>
                    <p className="font-rajdhani text-lg font-bold text-yellow-100">
                      {league.prize_pool}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teams Section */}
            {totalTeams > 0 && (
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    Participating Teams ({totalTeams})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {filteredTeams?.map((leagueTeam, index) => (
                      <div
                        key={leagueTeam.id}
                        className="rounded-lg border border-gray-700 bg-gray-800 p-4 transition-colors hover:border-purple-500"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-orbitron mb-1 font-semibold text-white">
                              {leagueTeam.team.name}
                            </h4>
                            <div className="font-rajdhani flex items-center gap-4 text-sm text-gray-400">
                              <span>W: {leagueTeam.wins}</span>
                              <span>L: {leagueTeam.losses}</span>
                              <span>Pts: {leagueTeam.points}</span>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-gray-600 text-gray-300"
                          >
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Share Profile */}
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">
                  Share League
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleShareProfile}
                  className="font-orbitron w-full bg-gray-600 text-white hover:bg-gray-700"
                >
                  <Share2Icon className="mr-2 h-4 w-4" />
                  Share League Profile
                </Button>
              </CardContent>
            </Card>

            {/* Supported Games */}
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron flex items-center gap-2 text-white">
                  <GamepadIcon className="h-5 w-5" />
                  Supported Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportedGames.map((leagueGame) => (
                  <div
                    key={leagueGame.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3"
                  >
                    {/* Game Icon/Color Indicator */}
                    {leagueGame.game.icon ? (
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                          src={leagueGame.game.icon}
                          alt={leagueGame.game.name}
                          fill
                          className="rounded object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-6 w-6 flex-shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            leagueGame.game.color ??
                            getGameColor(leagueGame.game.name),
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-orbitron text-sm font-medium text-white">
                        {leagueGame.game.name}
                      </p>
                      <p className="font-rajdhani text-xs text-gray-400">
                        {leagueGame.game.short_name}
                      </p>
                    </div>
                  </div>
                ))}

                {supportedGames.length === 0 && (
                  <div className="py-4 text-center">
                    <GamepadIcon className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                    <p className="text-sm text-gray-400">
                      No games configured yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* League Administrators */}
            {administrators.length > 0 && (
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2 text-white">
                    <Users className="h-5 w-5" />
                    League Administrators ({administrators.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {administrators.map((admin, index) => (
                    <div
                      key={admin.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={admin.image_url ?? undefined}
                          alt={`${admin.first_name} ${admin.last_name}`}
                        />
                        <AvatarFallback className="font-orbitron bg-gray-700 text-sm text-white">
                          {admin.first_name[0]}
                          {admin.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-orbitron truncate text-sm font-medium text-white">
                            {admin.first_name} {admin.last_name}
                          </p>
                          {index === 0 && (
                            <Badge
                              variant="outline"
                              className="border-purple-500 text-xs text-purple-300"
                            >
                              Founder
                            </Badge>
                          )}
                        </div>
                        <p className="font-rajdhani text-xs text-gray-400">
                          {admin.title ?? "Administrator"}
                        </p>
                        {admin.username && (
                          <p className="font-rajdhani text-xs text-gray-500">
                            @{admin.username}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Participating Schools */}
            {totalSchools > 0 && (
              <Card className="border-gray-700 bg-gray-900">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2 text-white">
                    <Building2 className="h-5 w-5" />
                    Schools ({totalSchools})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {league.schools?.slice(0, 10).map((leagueSchool) => (
                    <Link
                      key={leagueSchool.id}
                      href={`/profiles/school/${leagueSchool.school.id}`}
                      className="group flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3 transition-colors hover:border-purple-500"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={leagueSchool.school.logo_url ?? undefined}
                        />
                        <AvatarFallback className="bg-gray-700 text-xs text-white">
                          {leagueSchool.school.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-orbitron truncate text-sm font-medium text-white transition-colors group-hover:text-purple-300">
                          {leagueSchool.school.name}
                        </p>
                        <p className="font-rajdhani text-xs text-gray-400">
                          {leagueSchool.school.location},{" "}
                          {leagueSchool.school.state}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-purple-400" />
                    </Link>
                  ))}

                  {totalSchools > 10 && (
                    <div className="pt-2 text-center">
                      <p className="text-sm text-gray-400">
                        and {totalSchools - 10} more schools...
                      </p>
                    </div>
                  )}

                  {totalSchools === 0 && (
                    <div className="py-4 text-center">
                      <Building2 className="mx-auto mb-2 h-8 w-8 text-gray-600" />
                      <p className="text-sm text-gray-400">
                        No schools joined yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* League Stats */}
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">
                  League Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-800 p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {totalTeams}
                    </p>
                    <p className="text-sm text-gray-400">Teams</p>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {totalSchools}
                    </p>
                    <p className="text-sm text-gray-400">Schools</p>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {supportedGames.length}
                    </p>
                    <p className="text-sm text-gray-400">Games</p>
                  </div>
                  <div className="rounded-lg bg-gray-800 p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {administrators.length}
                    </p>
                    <p className="text-sm text-gray-400">Admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
