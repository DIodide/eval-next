"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Trophy, MapPin, Calendar, ChevronRight, Loader2 } from "lucide-react"
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
  game: {
    id: string
    name: string
    short_name: string
    color: string | null
    icon: string | null
  } | null
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
  const gameColor = gameColors[league.game?.short_name as keyof typeof gameColors] ?? "from-gray-500 to-gray-700"
  const tierColor = tierColors[league.tier as keyof typeof tierColors] ?? "bg-gray-400 text-white"
  const statusColor = statusColors[league.status as keyof typeof statusColors] ?? "bg-gray-400 text-white"

  return (
    <Link href={`/rankings/leagues/${league.id}`}>
      <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center`}>
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white text-lg tracking-wide">{league.short_name}</h3>
                <p className="text-gray-400 text-sm font-rajdhani">{league.game?.name}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Badge className={`${tierColor} font-orbitron text-xs`}>{league.tier}</Badge>
              <Badge className={`${statusColor} font-orbitron text-xs`}>{league.status}</Badge>
            </div>
          </div>

          <h4 className="font-orbitron text-white text-sm mb-2 tracking-wide">{league.name}</h4>
          <p className="text-gray-300 text-sm mb-4 font-rajdhani">{league.description ?? "Competitive esports league"}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">{league.state ?? league.region}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">
                {league.teams.length} teams • {league.player_participants.length} players
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">{league.season}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-400 font-rajdhani">
              {league.schools.length} schools participating
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
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
  const games = Array.from(new Set(leagues?.map(l => l.game).filter(Boolean) ?? [])).map(g => ({ id: g.id, name: g.name }))
  const states = Array.from(new Set(leagues?.map(l => l.state).filter((s): s is string => Boolean(s)) ?? []))

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="font-orbitron text-4xl font-bold text-white mb-4">Error Loading Leagues</h1>
          <p className="text-gray-300 mb-8 font-rajdhani">Failed to load league data. Please try again later.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Trophy className="w-8 h-8 text-cyan-400" />
              <h1 className="font-orbitron text-4xl md:text-5xl font-bold text-white tracking-wide">
                LEAGUE RANKINGS
              </h1>
            </div>
            <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto">
              Explore competitive esports leagues across the country. Find the best teams, players, and schools competing at the highest level.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search leagues, regions, or states..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 font-rajdhani focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-white font-rajdhani">
                    <SelectValue placeholder="Game" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white font-rajdhani">All Games</SelectItem>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white font-rajdhani">
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-white font-rajdhani">
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white font-rajdhani">All Tiers</SelectItem>
                    <SelectItem value="ELITE" className="text-white font-rajdhani">Elite</SelectItem>
                    <SelectItem value="PROFESSIONAL" className="text-white font-rajdhani">Professional</SelectItem>
                    <SelectItem value="COMPETITIVE" className="text-white font-rajdhani">Competitive</SelectItem>
                    <SelectItem value="DEVELOPMENTAL" className="text-white font-rajdhani">Developmental</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-white font-rajdhani">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white font-rajdhani">All Status</SelectItem>
                    <SelectItem value="ACTIVE" className="text-white font-rajdhani">Active</SelectItem>
                    <SelectItem value="UPCOMING" className="text-white font-rajdhani">Upcoming</SelectItem>
                    <SelectItem value="COMPLETED" className="text-white font-rajdhani">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-700 border-gray-600 text-white font-rajdhani">
                    <SelectValue placeholder="State" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white font-rajdhani">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state} className="text-white font-rajdhani">
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
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-300 font-rajdhani">Loading leagues...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-400 font-rajdhani">
                Showing {filteredLeagues.length} of {leagues?.length ?? 0} leagues
              </p>
            </div>

            {filteredLeagues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeagues.map((league) => (
                  <LeagueCard key={league.id} league={league} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-orbitron text-xl text-white mb-2">No Leagues Found</h3>
                <p className="text-gray-400 font-rajdhani">
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
                    className="mt-4 bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
