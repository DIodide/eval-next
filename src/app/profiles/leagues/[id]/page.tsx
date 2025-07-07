"use client";

import { useState, use } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Globe, 
  Trophy, 
  Calendar, 
  Users, 
  Building2,
  GamepadIcon,
  ExternalLink,
  TrophyIcon,
  Clock,
  UserIcon,
  Share2Icon
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
      <div className="relative h-64 w-full bg-gray-800 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10 space-y-8 pb-16">
        {/* Header skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <Skeleton className="w-32 h-32 rounded-xl bg-gray-700" />
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-gray-700" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-gray-700" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700">
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
    case 'ELITE':
      return 'bg-yellow-600 text-yellow-100 border-yellow-500';
    case 'PROFESSIONAL':
      return 'bg-purple-600 text-purple-100 border-purple-500';
    case 'COMPETITIVE':
      return 'bg-blue-600 text-blue-100 border-blue-500';
    case 'DEVELOPMENTAL':
      return 'bg-green-600 text-green-100 border-green-500';
    default:
      return 'bg-gray-600 text-gray-100 border-gray-500';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-600 text-green-100 border-green-500';
    case 'UPCOMING':
      return 'bg-blue-600 text-blue-100 border-blue-500';
    case 'COMPLETED':
      return 'bg-gray-600 text-gray-100 border-gray-500';
    case 'CANCELLED':
      return 'bg-red-600 text-red-100 border-red-500';
    default:
      return 'bg-gray-600 text-gray-100 border-gray-500';
  }
}

function getGameColor(gameName: string) {
  switch (gameName.toLowerCase()) {
    case 'valorant':
      return '#FF4654';
    case 'overwatch 2':
      return '#F99E1A';
    case 'super smash bros. ultimate':
    case 'smash':
      return '#0066CC';
    case 'rocket league':
      return '#1F8AC6';
    default:
      return '#6B7280';
  }
}

export default function LeagueProfilePage({ params }: LeagueProfilePageProps) {
  const resolvedParams = use(params);
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');

  // Handle share profile functionality
  const handleShareProfile = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("League profile URL copied to clipboard!");
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      toast.error("Unable to copy to clipboard. Please copy the URL manually.");
    }
  };
  
  const { data: league, isLoading, error } = api.leagueAdminProfile.getLeagueById.useQuery({
    id: resolvedParams.id,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏆</div>
          <h1 className="text-3xl font-orbitron font-bold text-white">League Not Found</h1>
          <p className="text-gray-400 max-w-md">
            The league you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/rankings/leagues">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
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

  const filteredTeams = selectedGameFilter === 'all' 
    ? league.teams 
    : league.teams?.filter(leagueTeam => {
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
          <div className="w-full h-full bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* League Basic Info Overlay - moved to right side to avoid profile picture overlap */}
        <div className="absolute bottom-6 right-6">
          <div className="flex items-center gap-2 text-white bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2">
            <MapPin className="w-4 h-4" />
            <span className="font-rajdhani text-sm">
              {league.region}{league.state ? `, ${league.state}` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10 space-y-8 pb-16">
        {/* League Header */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          {/* League Logo */}
          <div className="flex-shrink-0">
            <Avatar className="w-32 h-32 border-4 border-white/20 bg-gray-800">
              <AvatarImage src={league.logo_url ?? undefined} alt={league.name} />
              <AvatarFallback className="text-3xl font-orbitron bg-purple-700 text-white">
                {league.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* League Details */}
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-orbitron font-bold text-white mb-2">
                {league.name}
              </h1>
              <p className="text-xl text-gray-300 font-rajdhani">
                {league.short_name} • {league.season} Season
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getTierColor(league.tier)} border`}>
                <Trophy className="w-3 h-3 mr-1" />
                {league.tier}
              </Badge>
              <Badge className={`${getStatusColor(league.status)} border`}>
                <Clock className="w-3 h-3 mr-1" />
                {league.status}
              </Badge>
              {league.founded_year && (
                <Badge variant="outline" className="border-gray-600 text-gray-300">
                  <Calendar className="w-3 h-3 mr-1" />
                  Est. {league.founded_year}
                </Badge>
              )}
            </div>

                         {/* Quick Stats */}
             <div className="flex flex-wrap gap-6 text-white">
               <div className="flex items-center gap-2">
                 <Users className="w-5 h-5 text-gray-400" />
                 <span className="font-rajdhani">
                   <span className="font-bold text-lg">{totalTeams}</span> Teams
                 </span>
               </div>
               <div className="flex items-center gap-2">
                 <Building2 className="w-5 h-5 text-gray-400" />
                 <span className="font-rajdhani">
                   <span className="font-bold text-lg">{totalSchools}</span> Schools
                 </span>
               </div>
               <div className="flex items-center gap-2">
                 <GamepadIcon className="w-5 h-5 text-gray-400" />
                 <span className="font-rajdhani">
                   <span className="font-bold text-lg">{supportedGames.length}</span> Games
                 </span>
               </div>
               {administrators.length > 0 && (
                 <div className="flex items-center gap-2">
                   <UserIcon className="w-5 h-5 text-gray-400" />
                   <span className="font-rajdhani">
                     <span className="font-bold text-lg">{administrators.length}</span> Admin{administrators.length > 1 ? 's' : ''}
                   </span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">About {league.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed font-rajdhani text-lg">
                  {league.description || `${league.name} is a ${league.tier.toLowerCase()} tier esports league operating in ${league.region}${league.state ? `, ${league.state}` : ''}. Join competitive gaming teams and participate in organized tournaments across multiple games.`}
                </p>
                
                {league.format && (
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="font-orbitron font-semibold text-white mb-2">League Format</h4>
                    <p className="text-gray-300 font-rajdhani">{league.format}</p>
                  </div>
                )}

                {league.prize_pool && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-lg border border-yellow-700/50">
                    <h4 className="font-orbitron font-semibold text-yellow-200 mb-2 flex items-center gap-2">
                      <TrophyIcon className="w-4 h-4" />
                      Prize Pool
                    </h4>
                    <p className="text-yellow-100 font-rajdhani text-lg font-bold">{league.prize_pool}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Teams Section */}
            {totalTeams > 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white font-orbitron flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Participating Teams ({totalTeams})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTeams?.map((leagueTeam, index) => (
                      <div
                        key={leagueTeam.id}
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-orbitron font-semibold text-white mb-1">
                              {leagueTeam.team.name}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-400 font-rajdhani">
                              <span>W: {leagueTeam.wins}</span>
                              <span>L: {leagueTeam.losses}</span>
                              <span>Pts: {leagueTeam.points}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
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
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">Share League</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleShareProfile}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-orbitron"
                >
                  <Share2Icon className="w-4 h-4 mr-2" />
                  Share League Profile
                </Button>
              </CardContent>
            </Card>

            {/* Supported Games */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <GamepadIcon className="w-5 h-5" />
                  Supported Games
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportedGames.map((leagueGame) => (
                  <div
                    key={leagueGame.id}
                    className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                  >
                    {/* Game Icon/Color Indicator */}
                    {leagueGame.game.icon ? (
                      <div className="w-8 h-8 relative flex-shrink-0">
                        <Image
                          src={leagueGame.game.icon}
                          alt={leagueGame.game.name}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-6 h-6 rounded-full flex-shrink-0"
                                                 style={{ backgroundColor: leagueGame.game.color ?? getGameColor(leagueGame.game.name) }}
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-orbitron font-medium text-white text-sm">
                        {leagueGame.game.name}
                      </p>
                      <p className="text-gray-400 text-xs font-rajdhani">
                        {leagueGame.game.short_name}
                      </p>
                    </div>
                  </div>
                ))}
                
                {supportedGames.length === 0 && (
                  <div className="text-center py-4">
                    <GamepadIcon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-gray-400 text-sm">No games configured yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* League Administrators */}
            {administrators.length > 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white font-orbitron flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    League Administrators ({administrators.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {administrators.map((admin, index) => (
                    <div
                      key={admin.id}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={admin.image_url ?? undefined} alt={`${admin.first_name} ${admin.last_name}`} />
                        <AvatarFallback className="text-sm bg-gray-700 text-white font-orbitron">
                          {admin.first_name[0]}{admin.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-orbitron font-medium text-white text-sm truncate">
                            {admin.first_name} {admin.last_name}
                          </p>
                          {index === 0 && (
                            <Badge variant="outline" className="border-purple-500 text-purple-300 text-xs">
                              Founder
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs font-rajdhani">
                          {admin.title ?? "Administrator"}
                        </p>
                        {admin.username && (
                          <p className="text-gray-500 text-xs font-rajdhani">
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
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white font-orbitron flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Schools ({totalSchools})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {league.schools?.slice(0, 10).map((leagueSchool) => (
                    <Link
                      key={leagueSchool.id}
                      href={`/profiles/school/${leagueSchool.school.id}`}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500 transition-colors group"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={leagueSchool.school.logo_url ?? undefined} />
                        <AvatarFallback className="text-xs bg-gray-700 text-white">
                          {leagueSchool.school.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-orbitron font-medium text-white text-sm group-hover:text-purple-300 transition-colors truncate">
                          {leagueSchool.school.name}
                        </p>
                        <p className="text-gray-400 text-xs font-rajdhani">
                          {leagueSchool.school.location}, {leagueSchool.school.state}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-400 flex-shrink-0" />
                    </Link>
                  ))}

                  {totalSchools > 10 && (
                    <div className="text-center pt-2">
                      <p className="text-gray-400 text-sm">
                        and {totalSchools - 10} more schools...
                      </p>
                    </div>
                  )}
                  
                  {totalSchools === 0 && (
                    <div className="text-center py-4">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <p className="text-gray-400 text-sm">No schools joined yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* League Stats */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">League Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                                 <div className="grid grid-cols-2 gap-4">
                   <div className="text-center p-3 bg-gray-800 rounded-lg">
                     <p className="text-2xl font-bold text-white">{totalTeams}</p>
                     <p className="text-gray-400 text-sm">Teams</p>
                   </div>
                   <div className="text-center p-3 bg-gray-800 rounded-lg">
                     <p className="text-2xl font-bold text-white">{totalSchools}</p>
                     <p className="text-gray-400 text-sm">Schools</p>
                   </div>
                   <div className="text-center p-3 bg-gray-800 rounded-lg">
                     <p className="text-2xl font-bold text-white">{supportedGames.length}</p>
                     <p className="text-gray-400 text-sm">Games</p>
                   </div>
                   <div className="text-center p-3 bg-gray-800 rounded-lg">
                     <p className="text-2xl font-bold text-white">{administrators.length}</p>
                     <p className="text-gray-400 text-sm">Admins</p>
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