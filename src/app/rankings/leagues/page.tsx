"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Trophy, MapPin, Calendar, ChevronRight, Loader2, BarChart3 } from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/react"

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
  ACTIVE: "bg-green-400 text-white",
  COMPLETED: "bg-gray-400 text-white",
  UPCOMING: "bg-blue-400 text-white",
  CANCELLED: "bg-red-400 text-white",
}

type League = {
  id: string
  name: string
  short_name: string
  region: string
  state: string | null
  season: string
  status: string
  tier: string
  description: string | null
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
        name: string
        location: string | null
      }
    }
  }>
  schools: Array<{
    school: {
      id: string
      name: string
      location: string | null
      state: string | null
    }
  }>
  player_participants: Array<{ id: string }>
}

function LeagueCard({ league }: { league: League }) {
  const gameColor = gameColors[league.league_games?.[0]?.game?.short_name as keyof typeof gameColors] ?? "from-gray-500 to-gray-700"
  const tierColor = tierColors[league.tier as keyof typeof tierColors] ?? "bg-gray-400 text-white"
  const statusColor = statusColors[league.status as keyof typeof statusColors] ?? "bg-gray-400 text-white"

  return (
    <Link href={`/rankings/leagues/${league.id}`}>
      <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/60 border-gray-600/50 backdrop-blur-sm hover:border-cyan-400/60 transition-all duration-500 hover:shadow-xl hover:shadow-cyan-400/25 hover:transform hover:scale-[1.02] cursor-pointer h-full group">
        <CardContent className="p-6 relative overflow-hidden">
          {/* Subtle background accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-500/5 to-transparent rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${gameColor} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white text-lg tracking-wide group-hover:text-cyan-200 transition-colors duration-300">{league.short_name}</h3>
                <p className="text-gray-400 text-sm font-medium">{league.league_games?.[0]?.game?.name}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`${tierColor} font-orbitron text-xs`}>{league.tier}</Badge>
              <Badge className={`${statusColor} font-orbitron text-xs`}>{league.status}</Badge>
            </div>
          </div>

          <div className="relative z-10">
            <h4 className="font-orbitron text-white text-sm mb-2 tracking-wide group-hover:text-cyan-100 transition-colors duration-300">{league.name}</h4>
            <p className="text-gray-300 text-sm mb-4 font-medium">{league.description ?? "Competitive esports league"}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors duration-300" />
                <span className="text-gray-300 font-medium">{league.state ?? league.region}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                <span className="text-gray-300 font-medium">
                  {league.teams.length} teams • {league.player_participants.length} players
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-orange-400 group-hover:text-orange-300 transition-colors duration-300" />
                <span className="text-gray-300 font-medium">{league.season}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400 font-medium">
                {league.schools.length} schools participating
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-300 group-hover:transform group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function LeaguesRankingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedState, setSelectedState] = useState("all")

  // Get all leagues with filters
  const { data: leagues, isLoading, error } = api.leagues.getAll.useQuery({
    ...(selectedGame !== "all" && { game_id: selectedGame }),
    ...(selectedTier !== "all" && { tier: selectedTier as "ELITE" | "PROFESSIONAL" | "COMPETITIVE" | "DEVELOPMENTAL" }),
    ...(selectedStatus !== "all" && { status: selectedStatus as "ACTIVE" | "COMPLETED" | "UPCOMING" | "CANCELLED" }),
    ...(selectedState !== "all" && { state: selectedState }),
  })

  // Filter leagues by search query
  const filteredLeagues = leagues?.filter(league => 
    league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    league.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    league.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (league.state?.toLowerCase() ?? "").includes(searchQuery.toLowerCase())
  ) ?? []

  // Get unique values for filters
  const games = Array.from(new Set(leagues?.map(l => l.league_games?.[0]?.game).filter(Boolean) ?? [])).map(g => ({ id: g!.id, name: g!.name }))
  const states = Array.from(new Set(leagues?.map(l => l.state).filter((s): s is string => Boolean(s)) ?? []))

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900/60 to-black flex items-center justify-center">
        <div className="container mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-3xl p-12 border border-gray-600/40 backdrop-blur-sm max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="font-orbitron text-4xl font-bold text-white mb-4">Error Loading Leagues</h1>
            <p className="text-gray-300 mb-8 font-medium text-lg">Failed to load league data. Please try again later.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-orbitron rounded-full px-8 py-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-400/25"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900/60 text-white relative overflow-hidden">
      {/* Background accent elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-orange-500/8 to-transparent rounded-full blur-xl"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <h1 className="font-orbitron text-3xl md:text-6xl font-black text-white text-center">
              LEAGUE RANKINGS
            </h1>
          </div>
          
          {/* Compact Rainbow Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-eval-cyan"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-cyan to-eval-purple"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-purple to-eval-orange"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-eval-orange to-transparent"></div>
          </div>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-medium">
            Explore competitive esports leagues across the country. Find the best teams, players, and schools competing at the highest level.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/40 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search leagues, regions, or states..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-500/50 text-white placeholder-gray-400 font-medium focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700/50 border-gray-500/50 text-white font-medium hover:border-cyan-400/50 transition-colors">
                    <SelectValue placeholder="Game" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-sm">
                    <SelectItem value="all" className="text-white font-medium focus:bg-cyan-400/20">All Games</SelectItem>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white font-medium focus:bg-cyan-400/20">
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700/50 border-gray-500/50 text-white font-medium hover:border-purple-400/50 transition-colors">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-sm">
                    <SelectItem value="all" className="text-white font-medium focus:bg-purple-400/20">All Tiers</SelectItem>
                    <SelectItem value="ELITE" className="text-white font-medium focus:bg-purple-400/20">Elite</SelectItem>
                    <SelectItem value="PROFESSIONAL" className="text-white font-medium focus:bg-purple-400/20">Professional</SelectItem>
                    <SelectItem value="COMPETITIVE" className="text-white font-medium focus:bg-purple-400/20">Competitive</SelectItem>
                    <SelectItem value="DEVELOPMENTAL" className="text-white font-medium focus:bg-purple-400/20">Developmental</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700/50 border-gray-500/50 text-white font-medium hover:border-orange-400/50 transition-colors">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-sm">
                    <SelectItem value="all" className="text-white font-medium focus:bg-orange-400/20">All Status</SelectItem>
                    <SelectItem value="ACTIVE" className="text-white font-medium focus:bg-orange-400/20">Active</SelectItem>
                    <SelectItem value="UPCOMING" className="text-white font-medium focus:bg-orange-400/20">Upcoming</SelectItem>
                    <SelectItem value="COMPLETED" className="text-white font-medium focus:bg-orange-400/20">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700/50 border-gray-500/50 text-white font-medium hover:border-cyan-400/50 transition-colors">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-sm">
                    <SelectItem value="all" className="text-white font-medium focus:bg-cyan-400/20">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state} className="text-white font-medium focus:bg-cyan-400/20">
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
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
              <p className="text-gray-300 font-medium">Loading leagues...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <h2 className="font-orbitron text-2xl font-bold text-white">
                  ACTIVE LEAGUES
                </h2>
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full px-4 py-2 border border-gray-600/40">
                  <p className="text-gray-300 font-medium text-sm">
                    {filteredLeagues.length} of {leagues?.length ?? 0} leagues
                  </p>
                </div>
              </div>
            </div>

            {filteredLeagues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeagues.map((league) => (
                  <LeagueCard key={league.id} league={league} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-3xl p-12 border border-gray-600/40 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-600/40 to-gray-700/40 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="font-orbitron text-2xl font-bold text-white mb-4">No Leagues Found</h3>
                  <p className="text-gray-400 font-medium text-lg mb-6">
                    {searchQuery 
                      ? "No leagues match your search criteria. Try adjusting your filters."
                      : "No leagues are currently available."
                    }
                  </p>
                  {searchQuery && (
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedGame("all")
                        setSelectedTier("all")
                        setSelectedStatus("all")
                        setSelectedState("all")
                      }}
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-orbitron rounded-full px-8 py-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-400/25"
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
  )
}
