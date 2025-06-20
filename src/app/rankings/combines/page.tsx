"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Trophy, Star, ChevronRight, Medal, Crown, Award } from "lucide-react"
import type { Player } from "@/app/rankings/types"
import Link from "next/link"



// Mock data for combine rankings
const combineRankings = {
  VALORANT: [
    { rank: 1, username: "ValorantKing", school: "LAGA High", rating: 2.45, region: "West", state: "California" },
    { rank: 2, username: "HeadshotHero", school: "SF Tech", rating: 2.38, region: "West", state: "California" },
    { rank: 3, username: "ClutchMaster", school: "SD Prep", rating: 2.31, region: "West", state: "California" },
    { rank: 4, username: "AimGod", school: "Sac State High", rating: 2.24, region: "West", state: "California" },
    { rank: 5, username: "FragMachine", school: "OC Academy", rating: 2.17, region: "West", state: "California" },
    { rank: 6, username: "ShotCaller", school: "Austin High", rating: 2.1, region: "South", state: "Texas" },
    { rank: 7, username: "Precision", school: "Dallas Prep", rating: 2.03, region: "South", state: "Texas" },
    { rank: 8, username: "Tactical", school: "Houston Academy", rating: 1.96, region: "South", state: "Texas" },
    { rank: 9, username: "Lightning", school: "Miami High", rating: 1.89, region: "Southeast", state: "Florida" },
    { rank: 10, username: "Sniper", school: "Orlando Prep", rating: 1.82, region: "Southeast", state: "Florida" },
  ],
  "Rocket League": [
    { rank: 1, username: "RocketGod", school: "Denver High", rating: 1850, region: "West", state: "Colorado" },
    { rank: 2, username: "AerialAce", school: "Phoenix Prep", rating: 1820, region: "Southwest", state: "Arizona" },
    {
      rank: 3,
      username: "BoostMaster",
      school: "Seattle Academy",
      rating: 1790,
      region: "Northwest",
      state: "Washington",
    },
    { rank: 4, username: "GoalKeeper", school: "Portland High", rating: 1760, region: "Northwest", state: "Oregon" },
    { rank: 5, username: "Speedster", school: "Las Vegas Prep", rating: 1730, region: "West", state: "Nevada" },
    { rank: 6, username: "Demolition", school: "Chicago High", rating: 1700, region: "Midwest", state: "Illinois" },
    { rank: 7, username: "Flipper", school: "Detroit Academy", rating: 1670, region: "Midwest", state: "Michigan" },
    { rank: 8, username: "Striker", school: "Atlanta Prep", rating: 1640, region: "Southeast", state: "Georgia" },
    {
      rank: 9,
      username: "Defender",
      school: "Charlotte High",
      rating: 1610,
      region: "Southeast",
      state: "North Carolina",
    },
    {
      rank: 10,
      username: "Midfielder",
      school: "Nashville Academy",
      rating: 1580,
      region: "South",
      state: "Tennessee",
    },
  ],
  "League of Legends": [
    {
      rank: 1,
      username: "LeagueKing",
      school: "Boston High",
      rating: 2800,
      region: "Northeast",
      state: "Massachusetts",
    },
    { rank: 2, username: "MidLaner", school: "NYC Academy", rating: 2750, region: "Northeast", state: "New York" },
    { rank: 3, username: "JungleGod", school: "Philly Prep", rating: 2700, region: "Northeast", state: "Pennsylvania" },
    { rank: 4, username: "ADCMaster", school: "DC High", rating: 2650, region: "Southeast", state: "Washington DC" },
    {
      rank: 5,
      username: "SupportHero",
      school: "Baltimore Academy",
      rating: 2600,
      region: "Southeast",
      state: "Maryland",
    },
    { rank: 6, username: "TopLaner", school: "Richmond Prep", rating: 2550, region: "Southeast", state: "Virginia" },
    {
      rank: 7,
      username: "Assassin",
      school: "Raleigh High",
      rating: 2500,
      region: "Southeast",
      state: "North Carolina",
    },
    {
      rank: 8,
      username: "Mage",
      school: "Charleston Academy",
      rating: 2450,
      region: "Southeast",
      state: "South Carolina",
    },
    { rank: 9, username: "Tank", school: "Jacksonville Prep", rating: 2400, region: "Southeast", state: "Florida" },
    { rank: 10, username: "Carry", school: "Tampa High", rating: 2350, region: "Southeast", state: "Florida" },
  ],
  "Overwatch 2": [
    { rank: 1, username: "OverwatchPro", school: "LA Gaming", rating: 4200, region: "West", state: "California" },
    { rank: 2, username: "TankMain", school: "SF Academy", rating: 4150, region: "West", state: "California" },
    { rank: 3, username: "DPSGod", school: "San Diego High", rating: 4100, region: "West", state: "California" },
    { rank: 4, username: "SupportKing", school: "Portland Prep", rating: 4050, region: "Northwest", state: "Oregon" },
    { rank: 5, username: "FlexPlayer", school: "Seattle High", rating: 4000, region: "Northwest", state: "Washington" },
    { rank: 6, username: "Sniper", school: "Denver Academy", rating: 3950, region: "West", state: "Colorado" },
    { rank: 7, username: "Healer", school: "Phoenix Prep", rating: 3900, region: "Southwest", state: "Arizona" },
    { rank: 8, username: "Shield", school: "Austin High", rating: 3850, region: "South", state: "Texas" },
    { rank: 9, username: "Flanker", school: "Dallas Academy", rating: 3800, region: "South", state: "Texas" },
    { rank: 10, username: "Anchor", school: "Houston Prep", rating: 3750, region: "South", state: "Texas" },
  ],
}

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "League of Legends": "from-purple-500 to-purple-700",
}

const gameIcons = {
  VALORANT: "🎯",
  "Overwatch 2": "⚡",
  "Rocket League": "🚀",
  "League of Legends": "⚔️",
}

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />
  if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />
  return <Trophy className="w-4 h-4 text-cyan-400" />
}

function GameRankingCard({ game, players }: { game: string; players: Player[] }) {
  const gameColor = gameColors[game as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const gameIcon = gameIcons[game as keyof typeof gameIcons] || "🎮"

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center text-xl`}
          >
            {gameIcon}
          </div>
          <div>
            <h3 className="font-orbitron text-xl font-bold text-white tracking-wide">{game}</h3>
            <p className="text-gray-400 font-rajdhani text-sm">Top 10 Players</p>
          </div>
        </div>

        <div className="space-y-3">
          {players.slice(0, 10).map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8">{getRankIcon(player.rank)}</div>
                <div>
                  <h4 className="font-orbitron text-white font-semibold text-sm">{player.username}</h4>
                  <p className="text-gray-400 font-rajdhani text-xs">{player.school}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-cyan-400 font-orbitron font-bold text-sm">{player.rating}</p>
                <p className="text-gray-400 font-rajdhani text-xs">{player.state}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-600">
          <Button
            variant="outline"
            className="w-full border-cyan-400 text-cyan-black hover:bg-cyan-400 hover:text-black font-orbitron text-sm"
            disabled={true}
          >
            FULL RANKINGS COMING SOON
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CombinesRankingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")

  const games = Object.keys(combineRankings)
  const regions = ["West", "Southwest", "Northwest", "Midwest", "South", "Southeast", "Northeast"]

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani">
            <span>Rankings</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">Combines</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            COMBINE RANKINGS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-4xl mx-auto">
            The best players across the country, ranked by their performance in EVAL combines and tournaments.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="Search players, schools, or regions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement> ) => setSearchQuery(e.target.value)}
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
                <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white font-rajdhani">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white font-rajdhani">
                    All Games
                  </SelectItem>
                  {games.map((game) => (
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
                  {regions.map((region) => (
                    <SelectItem key={region} value={region} className="text-white font-rajdhani">
                      {region}
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
                }}
                className="border-gray-600 text-black hover:border-cyan-500 hover:text-cyan-600 font-rajdhani"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-16">
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h2 className="font-orbitron text-2xl text-white">Top Performers</h2>
            </div>
            <p className="text-gray-300 font-rajdhani mb-6">
              These players have demonstrated exceptional skill across multiple EVAL combines and tournaments.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-gray-800 rounded-lg p-4">
                <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <h3 className="font-orbitron text-white text-sm">ValorantKing</h3>
                <p className="text-gray-400 font-rajdhani text-xs">VALORANT Champion</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <h3 className="font-orbitron text-white text-sm">RocketGod</h3>
                <p className="text-gray-400 font-rajdhani text-xs">Rocket League MVP</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <Star className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <h3 className="font-orbitron text-white text-sm">LeagueKing</h3>
                <p className="text-gray-400 font-rajdhani text-xs">LoL Prodigy</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <Award className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                <h3 className="font-orbitron text-white text-sm">OverwatchPro</h3>
                <p className="text-gray-400 font-rajdhani text-xs">OW2 Legend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Rankings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {Object.entries(combineRankings)
            .filter(([game]) => selectedGame === "all" || game === selectedGame)
            .map(([game, players]) => (
              <GameRankingCard key={game} game={game} players={players} />
            ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 py-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
          <h2 className="font-orbitron text-3xl font-bold text-white mb-4 tracking-wide">
            Ready to Climb the Rankings?
          </h2>
          <p className="text-gray-300 mb-8 font-rajdhani text-lg max-w-3xl mx-auto">
            Participate in EVAL combines and tournaments to showcase your skills and earn your place among the top
            players.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Link href="/tryouts/college">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-8 py-3 tracking-wider">
              JOIN NEXT COMBINE
            </Button>
            </Link>
          </div>
        </div>
      </div>


    </div>
  )
}
