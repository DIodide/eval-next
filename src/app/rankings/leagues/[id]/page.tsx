"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, MapPin, ChevronRight, Award, TrendingUp, User, Loader2, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/react"

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

  const { data: league, isLoading, error } = api.leagues.getById.useQuery({ id: leagueId })
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
      <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-300 font-rajdhani">Loading league details...</p>
        </div>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">
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

  const gameColor = gameColors[league.game?.short_name as keyof typeof gameColors] ?? "from-gray-500 to-gray-700"
  const tierColor = tierColors[league.tier as keyof typeof tierColors] ?? "bg-gray-400 text-white"
  const statusColor = statusColors[league.status as keyof typeof statusColors] ?? "bg-gray-400 text-white"

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani">
            <Link href="/rankings" className="hover:text-cyan-400">
              Rankings
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/rankings/leagues" className="hover:text-cyan-400">
              Leagues
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">{league.short_name}</span>
          </div>
        </div>

        {/* League Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className={`w-32 h-32 bg-gradient-to-br ${gameColor} rounded-2xl flex items-center justify-center`}>
              <Trophy className="w-16 h-16 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white tracking-wide">{league.name}</h1>
                <Badge className={`${tierColor} font-orbitron`}>{league.tier}</Badge>
                <Badge className={`${statusColor} font-orbitron`}>{league.status}</Badge>
              </div>

              <p className="text-xl text-gray-300 mb-4 font-rajdhani">{league.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Teams</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400 font-orbitron">{league.teams?.length ?? 0}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <User className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Players</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-400 font-orbitron">{league.player_participants?.length ?? 0}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Region</span>
                  </div>
                  <p className="text-sm text-gray-300 font-rajdhani">{league.state ?? league.region}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Award className="w-4 h-4 text-cyan-400" />
                    <span className="text-white font-orbitron text-sm">Game</span>
                  </div>
                  <p className="text-sm text-gray-300 font-rajdhani">{league.game?.name}</p>
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
                {leaderboardLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="ml-2 text-gray-300 font-rajdhani">Loading teams...</span>
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((team) => (
                      <div
                        key={team.rank}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                            <span className="font-orbitron font-bold text-black text-sm">{team.rank}</span>
                          </div>
                          <div>
                            <h3 className="font-orbitron text-white font-semibold">{team.team_name}</h3>
                            <p className="text-gray-400 font-rajdhani text-sm">{team.school_name}</p>
                            <p className="text-gray-500 font-rajdhani text-xs">{team.school_location}</p>
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
                          <div className="text-center">
                            <p className="text-white font-orbitron text-sm">Members</p>
                            <p className="text-gray-300 font-rajdhani">{team.members.length}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 font-rajdhani">No teams found in this league</p>
                  </div>
                )}
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
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="ml-2 text-gray-300 font-rajdhani">Loading players...</span>
                  </div>
                ) : topPlayers && topPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {topPlayers.map((player) => (
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
                            {player.main_agent && (
                              <p className="text-gray-500 font-rajdhani text-xs">Main: {player.main_agent}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-white font-orbitron text-sm">EVAL</p>
                            <p className="text-cyan-400 font-orbitron font-bold">{player.eval_score?.toFixed(1) ?? 'N/A'}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-orbitron text-sm">W-L</p>
                            <p className="text-gray-300 font-rajdhani">{player.wins}-{player.losses}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-orbitron text-sm">Games</p>
                            <p className="text-gray-300 font-rajdhani">{player.games_played}</p>
                          </div>
                          {player.role && (
                            <div className="text-center">
                              <p className="text-white font-orbitron text-sm">Role</p>
                              <p className="text-gray-300 font-rajdhani text-xs">{player.role}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 font-rajdhani">No players found in this league</p>
                  </div>
                )}
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
                {league.founded_year && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-rajdhani">Founded</span>
                    <span className="text-white font-rajdhani">{league.founded_year}</span>
                  </div>
                )}
                {league.format && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-rajdhani">Format</span>
                    <span className="text-white font-rajdhani">{league.format}</span>
                  </div>
                )}
                {league.prize_pool && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-rajdhani">Prize Pool</span>
                    <span className="text-white font-rajdhani">{league.prize_pool}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Season</span>
                  <span className="text-white font-rajdhani">{league.season}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-rajdhani">Region</span>
                  <span className="text-white font-rajdhani">{league.region}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg mb-4">Participating Schools</h3>
              {league.schools && league.schools.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {league.schools.map((leagueSchool) => (
                    <div key={leagueSchool.school.id} className="text-sm">
                      <p className="text-white font-rajdhani">{leagueSchool.school.name}</p>
                      <p className="text-gray-400 font-rajdhani text-xs">{leagueSchool.school.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-rajdhani">No schools registered</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg mb-4">Recent Matches</h3>
              {league.matches && league.matches.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {league.matches.slice(0, 5).map((match) => (
                    <div key={match.id} className="text-sm border-b border-gray-600 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-rajdhani text-xs">
                            {match.team_a.name} vs {match.team_b.name}
                          </p>
                          <p className="text-gray-400 font-rajdhani text-xs">
                            {match.played_at ? 
                              new Date(match.played_at).toLocaleDateString() : 
                              new Date(match.scheduled_at).toLocaleDateString()
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          {match.team_a_score !== null && match.team_b_score !== null ? (
                            <p className="text-cyan-400 font-orbitron text-xs">
                              {match.team_a_score}-{match.team_b_score}
                            </p>
                          ) : (
                            <Badge className="bg-gray-600 text-white text-xs">{match.status}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-rajdhani">No matches scheduled</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

