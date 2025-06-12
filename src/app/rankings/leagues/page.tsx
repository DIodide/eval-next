"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Users, Trophy, MapPin, Calendar, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { League } from "@/app/rankings/types"

// Mock data for leagues
const leaguesData = [
  {
    id: 1,
    name: "California High School Esports League",
    shortName: "CHSEL",
    region: "West Coast",
    state: "California",
    game: "VALORANT",
    teams: 156,
    players: 780,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "Premier high school esports competition in California",
    tier: "Elite",
  },
  {
    id: 2,
    name: "Texas Esports Championship",
    shortName: "TEC",
    region: "South",
    state: "Texas",
    game: "Rocket League",
    teams: 124,
    players: 372,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "Statewide Rocket League tournament for high schools",
    tier: "Elite",
  },
  {
    id: 3,
    name: "Northeast Gaming Alliance",
    shortName: "NGA",
    region: "Northeast",
    state: "New York",
    game: "League of Legends",
    teams: 89,
    players: 445,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "Multi-state League of Legends competition",
    tier: "Professional",
  },
  {
    id: 4,
    name: "Florida Gaming Circuit",
    shortName: "FGC",
    region: "Southeast",
    state: "Florida",
    game: "Overwatch 2",
    teams: 67,
    players: 402,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "Premier Overwatch 2 league in the Southeast",
    tier: "Elite",
  },
  {
    id: 5,
    name: "Midwest Esports Conference",
    shortName: "MEC",
    region: "Midwest",
    state: "Illinois",
    game: "VALORANT",
    teams: 98,
    players: 490,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "Regional VALORANT competition across the Midwest",
    tier: "Competitive",
  },
  {
    id: 6,
    name: "Pacific Northwest Gaming",
    shortName: "PNG",
    region: "Northwest",
    state: "Washington",
    game: "Rocket League",
    teams: 45,
    players: 135,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "Regional Rocket League championship",
    tier: "Competitive",
  },
  {
    id: 7,
    name: "Garden State Esports",
    shortName: "GSE",
    region: "Northeast",
    state: "New Jersey",
    game: "VALORANT",
    teams: 78,
    players: 390,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "New Jersey's premier high school esports league",
    tier: "Elite",
  },
  {
    id: 8,
    name: "Arizona Gaming League",
    shortName: "AGL",
    region: "Southwest",
    state: "Arizona",
    game: "League of Legends",
    teams: 56,
    players: 280,
    season: "Spring 2025",
    status: "Active",
    logo: "/placeholder.svg?height=80&width=80",
    description: "Southwest League of Legends competition",
    tier: "Competitive",
  },
]

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "League of Legends": "from-purple-500 to-purple-700",
}

const tierColors = {
  Elite: "bg-yellow-400 text-black",
  Professional: "bg-purple-400 text-white",
  Competitive: "bg-cyan-400 text-black",
}

function LeagueCard({ league }: { league: League }) {
  const gameColor = gameColors[league.game as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const tierColor = tierColors[league.tier as keyof typeof tierColors] || "bg-gray-400 text-white"

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
                <h3 className="font-orbitron font-bold text-white text-lg tracking-wide">{league.shortName}</h3>
                <p className="text-gray-400 text-sm font-rajdhani">{league.game}</p>
              </div>
            </div>
            <Badge className={`${tierColor} font-orbitron text-xs`}>{league.tier}</Badge>
          </div>

          <h4 className="font-orbitron text-white text-sm mb-2 tracking-wide">{league.name}</h4>
          <p className="text-gray-300 text-sm mb-4 font-rajdhani">{league.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">{league.state}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">
                {league.teams} teams • {league.players} players
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">{league.season}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-green-400 text-green-400 font-orbitron text-xs">
              {league.status}
            </Badge>
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
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [selectedTier, setSelectedTier] = useState("all")

  // Filter leagues based on selected filters
  const filteredLeagues = leaguesData.filter((league) => {
    const matchesSearch =
      league.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      league.state.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGame = selectedGame === "all" || league.game === selectedGame
    const matchesRegion = selectedRegion === "all" || league.region === selectedRegion
    const matchesTier = selectedTier === "all" || league.tier === selectedTier

    return matchesSearch && matchesGame && matchesRegion && matchesTier
  })

  const uniqueGames = [...new Set(leaguesData.map((league) => league.game))]
  const uniqueRegions = [...new Set(leaguesData.map((league) => league.region))]
  const uniqueTiers = [...new Set(leaguesData.map((league) => league.tier))]

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani">
            <span>Rankings</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">Leagues</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            LEAGUE RANKINGS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-4xl mx-auto">
            Discover and track high school esports leagues across the United States. View team standings, player
            rankings, and league statistics.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="Search leagues, teams, or locations..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white pl-12 pr-4 py-4 rounded-full text-lg font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-orbitron text-sm">Filters:</span>
              </div>

              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white font-rajdhani">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white font-rajdhani">
                    All Games
                  </SelectItem>
                  {uniqueGames.map((game) => (
                    <SelectItem key={game} value={game} className="text-white font-rajdhani">
                      {game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white font-rajdhani">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white font-rajdhani">
                    All Regions
                  </SelectItem>
                  {uniqueRegions.map((region) => (
                    <SelectItem key={region} value={region} className="text-white font-rajdhani">
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white font-rajdhani">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white font-rajdhani">
                    All Tiers
                  </SelectItem>
                  {uniqueTiers.map((tier) => (
                    <SelectItem key={tier} value={tier} className="text-white font-rajdhani">
                      {tier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedGame("all")
                  setSelectedRegion("all")
                  setSelectedTier("all")
                }}
                className="border-gray-600 text-cyan-800 hover:border-cyan-400 hover:text-cyan-600 font-rajdhani"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-8 text-center">
          <p className="text-gray-300 font-rajdhani">
            Showing {filteredLeagues.length} of {leaguesData.length} leagues
          </p>
        </div>

        {/* Leagues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredLeagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>

        {/* No Results */}
        {filteredLeagues.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-orbitron text-xl text-white mb-2">No leagues found</h3>
            <p className="text-gray-400 font-rajdhani">Try adjusting your search criteria or filters</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-20 py-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
          <h2 className="font-orbitron text-3xl font-bold text-white mb-4 tracking-wide">Want to Join a League?</h2>
          <p className="text-gray-300 mb-8 font-rajdhani text-lg max-w-3xl mx-auto">
            Create your player profile and get discovered by league organizers and coaches looking for talent.
          </p>
          <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-8 py-3 tracking-wider">
            CREATE PROFILE
          </Button>
        </div>
      </div>
    </div>
  )
}
