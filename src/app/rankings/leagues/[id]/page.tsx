"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, MapPin, ChevronRight, Award, TrendingUp, User } from "lucide-react"
import Link from "next/link"

// Mock data for league details
const leagueDetails = {
  1: {
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
    logo: "/placeholder.svg?height=120&width=120",
    description:
      "Premier high school esports competition in California featuring the best VALORANT teams across the state.",
    tier: "Elite",
    founded: "2019",
    website: "https://chsel.org",
    prizePool: "$25,000",
    format: "Double Elimination",
    teamRankings: [
      {
        rank: 1,
        team: "Los Angeles Gaming Academy",
        school: "LAGA High",
        wins: 24,
        losses: 2,
        points: 2840,
        trend: "up",
      },
      { rank: 2, team: "San Francisco Strikers", school: "SF Tech", wins: 22, losses: 4, points: 2720, trend: "up" },
      { rank: 3, team: "San Diego Surge", school: "SD Prep", wins: 21, losses: 5, points: 2650, trend: "down" },
      {
        rank: 4,
        team: "Sacramento Sentinels",
        school: "Sac State High",
        wins: 20,
        losses: 6,
        points: 2580,
        trend: "up",
      },
      {
        rank: 5,
        team: "Orange County Outlaws",
        school: "OC Academy",
        wins: 19,
        losses: 7,
        points: 2510,
        trend: "same",
      },
      { rank: 6, team: "Fresno Phoenix", school: "Fresno Central", wins: 18, losses: 8, points: 2440, trend: "down" },
      { rank: 7, team: "Berkeley Bears", school: "Berkeley High", wins: 17, losses: 9, points: 2370, trend: "up" },
      {
        rank: 8,
        team: "Riverside Raptors",
        school: "Riverside Prep",
        wins: 16,
        losses: 10,
        points: 2300,
        trend: "same",
      },
      { rank: 9, team: "Stockton Storm", school: "Stockton High", wins: 15, losses: 11, points: 2230, trend: "down" },
      {
        rank: 10,
        team: "Bakersfield Blaze",
        school: "Bakersfield Academy",
        wins: 14,
        losses: 12,
        points: 2160,
        trend: "up",
      },
    ],
    playerRankings: [
      {
        rank: 1,
        username: "ValorantKing",
        school: "LAGA High",
        team: "Los Angeles Gaming Academy",
        rating: 2.45,
        kd: 1.8,
        acs: 285,
      },
      {
        rank: 2,
        username: "HeadshotHero",
        school: "SF Tech",
        team: "San Francisco Strikers",
        rating: 2.38,
        kd: 1.7,
        acs: 278,
      },
      {
        rank: 3,
        username: "ClutchMaster",
        school: "SD Prep",
        team: "San Diego Surge",
        rating: 2.31,
        kd: 1.6,
        acs: 271,
      },
      {
        rank: 4,
        username: "AimGod",
        school: "Sac State High",
        team: "Sacramento Sentinels",
        rating: 2.24,
        kd: 1.5,
        acs: 264,
      },
      {
        rank: 5,
        username: "FragMachine",
        school: "OC Academy",
        team: "Orange County Outlaws",
        rating: 2.17,
        kd: 1.4,
        acs: 257,
      },
      {
        rank: 6,
        username: "ShotCaller",
        school: "Fresno Central",
        team: "Fresno Phoenix",
        rating: 2.1,
        kd: 1.3,
        acs: 250,
      },
      {
        rank: 7,
        username: "Precision",
        school: "Berkeley High",
        team: "Berkeley Bears",
        rating: 2.03,
        kd: 1.2,
        acs: 243,
      },
      {
        rank: 8,
        username: "Tactical",
        school: "Riverside Prep",
        team: "Riverside Raptors",
        rating: 1.96,
        kd: 1.1,
        acs: 236,
      },
      {
        rank: 9,
        username: "Lightning",
        school: "Stockton High",
        team: "Stockton Storm",
        rating: 1.89,
        kd: 1.0,
        acs: 229,
      },
      {
        rank: 10,
        username: "Sniper",
        school: "Bakersfield Academy",
        team: "Bakersfield Blaze",
        rating: 1.82,
        kd: 0.9,
        acs: 222,
      },
    ],
  },
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-400" />
  if (trend === "down") return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
  return <div className="w-4 h-4" />
}

export default function LeagueDetailPage() {
  const params = useParams()
  const leagueId = Number(params.id)
  const [activeTab, setActiveTab] = useState("teams")

  // Find the league details
  const league = leagueDetails[leagueId as keyof typeof leagueDetails]

  if (!league) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="font-orbitron text-4xl font-bold text-white mb-4">League Not Found</h1>
        <p className="text-gray-300 mb-8 font-rajdhani">The league you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/rankings/leagues">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">Back to Leagues</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">

      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani">
            <Link href="/rankings/leagues" className="hover:text-cyan-400">
              Rankings
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/rankings/leagues" className="hover:text-cyan-400">
              Leagues
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">{league.shortName}</span>
          </div>
        </div>

        {/* League Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center">
              <Trophy className="w-16 h-16 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white tracking-wide">{league.name}</h1>
                <Badge className="bg-yellow-400 text-black font-orbitron">{league.tier}</Badge>
              </div>

              <p className="text-xl text-gray-300 mb-4 font-rajdhani">{league.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Teams</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400 font-orbitron">{league.teams}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Players</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400 font-orbitron">{league.players}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Region</span>
                  </div>
                  <p className="text-sm text-gray-300 font-rajdhani">{league.state}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Prize Pool</span>
                  </div>
                  <p className="text-sm text-gray-300 font-rajdhani">{league.prizePool}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rankings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-8 bg-gray-800 rounded-full p-1 w-full max-w-md mx-auto">
            <TabsTrigger
              value="teams"
              className="font-orbitron data-[state=active]:bg-cyan-400 data-[state=active]:text-black rounded-full"
            >
              TEAM RANKINGS
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="font-orbitron data-[state=active]:bg-cyan-400 data-[state=active]:text-black rounded-full"
            >
              PLAYER RANKINGS
            </TabsTrigger>
          </TabsList>

          {/* Team Rankings */}
          <TabsContent value="teams">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl tracking-wide">Team Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {league.teamRankings.map((team) => (
                    <div
                      key={team.rank}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                          <span className="font-orbitron font-bold text-black text-sm">{team.rank}</span>
                        </div>
                        <div>
                          <h3 className="font-orbitron text-white font-semibold">{team.team}</h3>
                          <p className="text-gray-400 font-rajdhani text-sm">{team.school}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-white font-orbitron text-sm">W-L</p>
                          <p className="text-gray-300 font-rajdhani">
                            {team.wins}-{team.losses}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-orbitron text-sm">Points</p>
                          <p className="text-cyan-400 font-orbitron font-bold">{team.points}</p>
                        </div>
                        <TrendIcon trend={team.trend} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Rankings */}
          <TabsContent value="players">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl tracking-wide">Player Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {league.playerRankings.map((player) => (
                    <div
                      key={player.rank}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                          <span className="font-orbitron font-bold text-black text-sm">{player.rank}</span>
                        </div>
                        <div>
                          <h3 className="font-orbitron text-white font-semibold">{player.username}</h3>
                          <p className="text-gray-400 font-rajdhani text-sm">{player.school}</p>
                          <p className="text-gray-500 font-rajdhani text-xs">{player.team}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-white font-orbitron text-sm">Rating</p>
                          <p className="text-cyan-400 font-orbitron font-bold">{player.rating}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-orbitron text-sm">K/D</p>
                          <p className="text-gray-300 font-rajdhani">{player.kd}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-orbitron text-sm">ACS</p>
                          <p className="text-gray-300 font-rajdhani">{player.acs}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* League Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg mb-4">League Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Founded</span>
                  <span className="text-white font-rajdhani">{league.founded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Format</span>
                  <span className="text-white font-rajdhani">{league.format}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Season</span>
                  <span className="text-white font-rajdhani">{league.season}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Status</span>
                  <Badge className="bg-green-600 text-white font-orbitron text-xs">{league.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Total Teams</span>
                  <span className="text-cyan-400 font-orbitron font-bold">{league.teams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Total Players</span>
                  <span className="text-cyan-400 font-orbitron font-bold">{league.players}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Prize Pool</span>
                  <span className="text-yellow-400 font-orbitron font-bold">{league.prizePool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Game</span>
                  <span className="text-white font-rajdhani">{league.game}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-400/30">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg mb-4">Join This League</h3>
              <p className="text-gray-300 font-rajdhani text-sm mb-4">
                Interested in competing? Create your profile and get noticed by league organizers.
              </p>
              <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold">
                CREATE PROFILE
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
