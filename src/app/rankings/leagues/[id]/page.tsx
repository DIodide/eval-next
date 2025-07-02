"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, MapPin, ChevronRight, Award, TrendingUp, User, Loader2, Calendar, DollarSign, Globe } from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/react"
import Image from "next/image"

type League = {
  id: string
  name: string
  short_name: string
  description: string | null
  region: string
  state: string | null
  tier: string
  status: string
  season: string
  format: string | null
  prize_pool: string | null
  founded_year: number | null
  logo_url: string | null
  banner_url: string | null
  league_games: Array<{
    game: {
      id: string
      name: string
      short_name: string
      color: string | null
      icon: string | null
    }
  }>
  teams: Array<{
    team: {
      id: string
      name: string
      school: {
        id: string
        name: string
        location: string | null
        state: string | null
      }
      members: Array<{
        player: {
          id: string
          username: string
          first_name: string | null
          last_name: string | null
        }
        role: string
        active: boolean
      }>
    }
  }>
  schools: Array<{
    school: {
      id: string
      name: string
      location: string | null
      state: string | null
      region: string | null
      type: string | null
      website: string | null
    }
  }>
  player_participants: Array<{
    player: {
      id: string
      username: string
      first_name: string | null
      last_name: string | null
      school: {
        id: string
        name: string
      } | null
      class_year: string | null
      game_profiles: Array<{
        username: string | null
        rank: string | null
        rating: number | null
        role: string | null
        agents: string[] | null
        combine_score: number | null
        league_score: number | null
      }>
    }
  }>
  matches: Array<{
    id: string
    scheduled_at: Date
    played_at: Date | null
    status: string
    team_a_score: number | null
    team_b_score: number | null
    team_a: {
      name: string
      school: {
        name: string
      }
    }
    team_b: {
      name: string
      school: {
        name: string
      }
    }
  }>
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />
  if (trend === "down") return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
  return <div className="w-4 h-4" />
}

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "League of Legends": "from-purple-500 to-purple-700",
}

const tierColors = {
  ELITE: "bg-yellow-400 text-black",
  PROFESSIONAL: "bg-purple-400 text-white",
  COMPETITIVE: "bg-cyan-400 text-black",
  DEVELOPMENTAL: "bg-green-400 text-black",
}

const statusColors = {
  ACTIVE: "bg-green-400 text-black",
  COMPLETED: "bg-gray-400 text-white",
  UPCOMING: "bg-blue-400 text-black",
  CANCELLED: "bg-red-400 text-white",
}

export default function LeagueDetailPage() {
  const params = useParams()
  const leagueId = params.id as string
  const [activeTab, setActiveTab] = useState("teams")

  const { data: league, isLoading, error } = api.leagues.getById.useQuery({ id: leagueId }) as { 
    data: League | undefined
    isLoading: boolean
    error: unknown
  }
  const { data: leaderboard, isLoading: leaderboardLoading } = api.leagues.getLeaderboard.useQuery({ 
    id: leagueId, 
    limit: 20 
  })
  const { data: topPlayers, isLoading: playersLoading } = api.leagues.getTopPlayers.useQuery({ 
    id: leagueId, 
    limit: 20 
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900/60 text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
          <p className="text-gray-300 font-medium">Loading league details...</p>
        </div>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-900/60 text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-12 border border-white/10 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-red-400" />
            </div>
          <h1 className="font-orbitron text-4xl font-bold text-white mb-4">League Not Found</h1>
            <p className="text-gray-300 mb-8 font-medium text-lg">The league you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/rankings/leagues">
              <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-orbitron rounded-full px-8 py-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-400/25">
                Back to Leagues
              </Button>
          </Link>
          </div>
        </div>
      </div>
    )
  }

  const gameColor = gameColors[league.league_games[0]?.game?.short_name as keyof typeof gameColors] ?? "from-gray-500 to-gray-700"
  const tierColor = tierColors[league.tier as keyof typeof tierColors] ?? "bg-gray-400 text-white"
  const statusColor = statusColors[league.status as keyof typeof statusColors] ?? "bg-gray-400 text-white"

  const teamsCount = league.teams?.length ?? 0
  const playersCount = league.player_participants?.length ?? 0
  const schoolsCount = league.schools?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-900/60 text-white relative overflow-hidden">
      {/* Background accent elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-orange-500/8 to-transparent rounded-full blur-xl"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-medium">
            <Link href="/rankings" className="hover:text-cyan-400 transition-colors">
              Rankings
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/rankings/leagues" className="hover:text-cyan-400 transition-colors">
              Leagues
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">{league.short_name}</span>
          </div>
        </div>

        {/* League Header */}
        <div className="mb-12">
          <div className="relative rounded-lg overflow-hidden border border-white/10 shadow-2xl">
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
              <div className={`absolute inset-0 bg-gradient-to-b from-gray-800/40 to-gray-900/30`} />
            )}

            {/* Content */}
            <div className="relative p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                {/* Logo Section */}
                {league.logo_url ? (
                  <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl relative bg-black/20">
                    <Image
                      src={league.logo_url}
                      alt={`${league.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className={`w-28 h-28 bg-gradient-to-br ${gameColor} rounded-2xl flex items-center justify-center shadow-xl`}>
                    <Trophy className="w-14 h-14 text-white" />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="font-orbitron text-3xl md:text-4xl font-black text-white tracking-wide">{league.name}</h1>
                    <Badge className={`${tierColor} font-orbitron font-bold shadow-lg`}>{league.tier}</Badge>
                    <Badge className={`${statusColor} font-orbitron font-bold shadow-lg`}>{league.status}</Badge>
                  </div>

                  <p className="text-lg text-gray-300 mb-6 font-medium leading-relaxed">{league.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-md p-4 border border-white/10 hover:border-cyan-400/30 hover:bg-gray-900/60 transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="w-5 h-5 text-cyan-400" />
                        <span className="text-white font-orbitron text-sm font-bold">Teams</span>
                      </div>
                      <p className="text-2xl font-black text-cyan-400 font-orbitron">{teamsCount}</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-md p-4 border border-white/10 hover:border-purple-400/30 hover:bg-gray-900/60 transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-orbitron text-sm font-bold">Players</span>
                      </div>
                      <p className="text-2xl font-black text-purple-400 font-orbitron">{playersCount}</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-md p-4 border border-white/10 hover:border-orange-400/30 hover:bg-gray-900/60 transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-orange-400" />
                        <span className="text-white font-orbitron text-sm font-bold">Region</span>
                      </div>
                      <p className="text-sm text-gray-300 font-medium">{league.state ?? league.region}</p>
                    </div>

                    <Link 
                      href={`/profiles/leagues/${league.id}`}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-md p-4 border border-white/10 hover:border-cyan-400/30 hover:bg-gray-900/60 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <span className="text-white font-orbitron text-sm font-bold">Public Profile</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-300 group-hover:text-cyan-400 transition-colors">
                        <span>View Profile</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* League Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {league.founded_year && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Founded</h3>
              <p className="text-white font-orbitron text-lg font-bold">{league.founded_year}</p>
            </div>
          )}

          {league.format && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Format</h3>
              <p className="text-white font-orbitron text-lg font-bold">{league.format}</p>
            </div>
          )}

          {league.prize_pool && (
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-gray-400 text-sm font-medium mb-2">Prize Pool</h3>
              <p className="text-white font-orbitron text-lg font-bold">{league.prize_pool}</p>
            </div>
          )}

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h3 className="text-gray-400 text-sm font-medium mb-2">Season</h3>
            <p className="text-white font-orbitron text-lg font-bold">{league.season}</p>
          </div>
        </div>

        {/* Schools Section */}
        {schoolsCount > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Participating Schools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {league.schools.map((leagueSchool) => (
                <div key={leagueSchool.school.id} className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-orbitron text-lg font-bold mb-2">{leagueSchool.school.name}</h3>
                  {leagueSchool.school.location && (
                    <p className="text-gray-300 text-sm">{leagueSchool.school.location}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab("teams")}
            className={`px-6 py-3 rounded-full font-orbitron font-bold transition-all duration-300 ${
              activeTab === "teams"
                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                : "bg-gray-900/50 text-gray-300 hover:bg-gray-900/70"
            }`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`px-6 py-3 rounded-full font-orbitron font-bold transition-all duration-300 ${
              activeTab === "players"
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                : "bg-gray-900/50 text-gray-300 hover:bg-gray-900/70"
            }`}
          >
            Players
          </button>
          <button
            onClick={() => setActiveTab("matches")}
            className={`px-6 py-3 rounded-full font-orbitron font-bold transition-all duration-300 ${
              activeTab === "matches"
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                : "bg-gray-900/50 text-gray-300 hover:bg-gray-900/70"
            }`}
          >
            Matches
          </button>
        </div>

        {/* Content Sections */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-white/10 p-6">
          {activeTab === "teams" && (
            <div>
              {/* Teams content */}
            </div>
          )}

          {activeTab === "players" && (
            <div>
              {/* Players content */}
            </div>
          )}

          {activeTab === "matches" && (
            <div>
              {/* Matches content */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

