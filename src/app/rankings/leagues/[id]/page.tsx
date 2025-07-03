"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, MapPin, ChevronRight, Award, TrendingUp, User, Loader2, Calendar, DollarSign, Globe, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const { data: league, isLoading, error } = api.leagues.getById.useQuery({ id: leagueId })
  
  // Set default game when league loads
  useEffect(() => {
    if (league?.league_games?.[0]?.game?.id && !selectedGame) {
      setSelectedGame(league.league_games[0].game.id)
    }
  }, [league, selectedGame])
  
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

  const gameColor = gameColors[league.league_games?.[0]?.game?.short_name as keyof typeof gameColors] ?? "from-gray-500 to-gray-700"
  const tierColor = tierColors[league.tier as keyof typeof tierColors] ?? "bg-gray-400 text-white"
  const statusColor = statusColors[league.status as keyof typeof statusColors] ?? "bg-gray-400 text-white"

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
                      <p className="text-2xl font-black text-cyan-400 font-orbitron">{league.teams?.length ?? 0}</p>
                    </div>

                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-md p-4 border border-white/10 hover:border-purple-400/30 hover:bg-gray-900/60 transition-all duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-orbitron text-sm font-bold">Players</span>
                      </div>
                      <p className="text-2xl font-black text-purple-400 font-orbitron">{league.player_participants?.length ?? 0}</p>
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
                        <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
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
            <div className="flex items-center justify-center mb-4">
              <span className="text-gray-400 font-orbitron text-sm font-bold mr-4">FILTER BY GAME:</span>
              <div className="flex gap-2">
                {league.league_games.map((leagueGame) => (
                  <button
                    key={leagueGame.game.id}
                    onClick={() => setSelectedGame(leagueGame.game.id)}
                    className={`px-4 py-2 rounded-lg font-orbitron font-bold text-sm transition-all duration-300 ${
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
          <TabsList className="flex mb-8 bg-white/5 backdrop-blur-md rounded-lg p-1 w-fit mx-auto border border-white/10 shadow-xl">
            <TabsTrigger
              value="teams"
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-400 data-[state=active]:to-cyan-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-md mx-1 px-3 md:px-6 py-2 text-xs md:text-sm"
            >
              TEAM RANKINGS
            </TabsTrigger>
            <TabsTrigger
              value="players"
              className="font-orbitron font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-purple-500 data-[state=active]:text-black data-[state=active]:shadow-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-md mx-1 px-3 md:px-6 py-2 text-xs md:text-sm"
            >
              PLAYER RANKINGS
            </TabsTrigger>
          </TabsList>

          {/* Team Rankings */}
          <TabsContent value="teams">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl rounded-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold tracking-wide">Team Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400/20 to-cyan-500/20 rounded-full flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                    </div>
                    <span className="ml-3 text-gray-300 font-medium">Loading teams...</span>
                  </div>
                ) : leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {/* Desktop Table Header - Hidden on Mobile */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-sm font-orbitron font-bold text-gray-400 border-b border-gray-600/50">
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
                        className="bg-white/5 backdrop-blur-sm rounded-md border border-white/10 hover:border-cyan-400/30 hover:bg-white/10 hover:shadow-lg hover:shadow-cyan-400/10 transition-all duration-300 group"
                      >
                        {/* Desktop Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center p-5">
                          <div className="col-span-1 flex justify-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="font-orbitron font-black text-black text-sm">{team.rank}</span>
                            </div>
                          </div>
                          
                          <div className="col-span-5">
                            <h3 className="font-orbitron text-white font-bold group-hover:text-cyan-200 transition-colors">{team.team_name}</h3>
                            <p className="text-gray-400 font-medium text-sm">{team.school_name}</p>
                            <p className="text-gray-500 font-medium text-xs">{team.school_location}</p>
                        </div>

                          <div className="col-span-2 text-center">
                            <p className="text-gray-300 font-medium">
                              {team.wins}-{team.losses}
                            </p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="text-cyan-400 font-orbitron font-black">{team.points}</p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="text-gray-300 font-medium">{team.members.length}</p>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="md:hidden p-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="font-orbitron font-black text-black text-xs">{team.rank}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-orbitron text-white font-bold group-hover:text-cyan-200 transition-colors truncate">{team.team_name}</h3>
                              <p className="text-gray-400 font-medium text-sm truncate">{team.school_name}</p>
                              <p className="text-gray-500 font-medium text-xs truncate">{team.school_location}</p>
                              
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600/30">
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs font-medium">W-L</p>
                                  <p className="text-gray-300 font-medium text-sm">{team.wins}-{team.losses}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs font-medium">POINTS</p>
                                  <p className="text-cyan-400 font-orbitron font-black text-sm">{team.points}</p>
                          </div>
                          <div className="text-center">
                                  <p className="text-gray-400 text-xs font-medium">MEMBERS</p>
                                  <p className="text-gray-300 font-medium text-sm">{team.members.length}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 font-medium">No teams found in this league</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Player Rankings */}
          <TabsContent value="players">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl rounded-lg">
              <CardHeader>
                <CardTitle className="font-orbitron text-white text-xl font-bold tracking-wide">Player Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400/20 to-purple-500/20 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                    </div>
                    <span className="ml-3 text-gray-300 font-medium">Loading players...</span>
                  </div>
                ) : topPlayers && topPlayers.length > 0 ? (
                  <div className="space-y-3">
                    {/* Desktop Table Header - Hidden on Mobile */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-sm font-orbitron font-bold text-gray-400 border-b border-gray-600/50">
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
                        className="bg-slate-900/15 backdrop-blur-sm rounded-md border border-white/10 hover:border-purple-400/30 hover:bg-slate-700/10 hover:shadow-lg hover:shadow-purple-400/10 transition-all duration-300 group"
                      >
                        {/* Desktop Layout */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center p-5">
                          <div className="col-span-1 flex justify-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                              <span className="font-orbitron font-black text-black text-sm">{player.rank}</span>
                            </div>
                          </div>
                          
                          <div className="col-span-4">
                            <h3 className="font-orbitron text-white font-bold group-hover:text-purple-200 transition-colors">{player.username}</h3>
                            <p className="text-gray-400 font-medium text-sm">{player.school}</p>
                            {player.main_agent && (
                              <p className="text-gray-500 font-medium text-xs">Main: {player.main_agent}</p>
                            )}
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="text-purple-400 font-orbitron font-black">{player.eval_score?.toFixed(1) ?? 'N/A'}</p>
                        </div>

                          <div className="col-span-2 text-center">
                            <p className="text-gray-300 font-medium">{player.wins}-{player.losses}</p>
                          </div>

                          <div className="col-span-2 text-center">
                            <p className="text-gray-300 font-medium">{player.games_played}</p>
                          </div>

                          <div className="col-span-1 text-center">
                            <p className="text-gray-300 font-medium text-xs">{player.role ?? '-'}</p>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="md:hidden p-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                              <span className="font-orbitron font-black text-black text-xs">{player.rank}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-orbitron text-white font-bold group-hover:text-purple-200 transition-colors truncate">{player.username}</h3>
                              <p className="text-gray-400 font-medium text-sm truncate">{player.school}</p>
                              {player.main_agent && (
                                <p className="text-gray-500 font-medium text-xs truncate">Main: {player.main_agent}</p>
                              )}
                              
                              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-600/30">
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs font-medium">EVAL</p>
                                  <p className="text-purple-400 font-orbitron font-black text-sm">{player.eval_score?.toFixed(1) ?? 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs font-medium">W-L</p>
                                  <p className="text-gray-300 font-medium text-sm">{player.wins}-{player.losses}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-gray-400 text-xs font-medium">GAMES</p>
                                  <p className="text-gray-300 font-medium text-sm">{player.games_played}</p>
                                </div>
                            <div className="text-center">
                                  <p className="text-gray-400 text-xs font-medium">ROLE</p>
                                  <p className="text-gray-300 font-medium text-xs">{player.role ?? '-'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 font-medium">No players found in this league</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* League Info */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl rounded-lg">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg font-bold mb-4">League Information</h3>
              <div className="space-y-3">
                {league.founded_year && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Founded</span>
                    <span className="text-white font-medium">{league.founded_year}</span>
                  </div>
                )}
                {league.format && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Format</span>
                    <span className="text-white font-medium">{league.format}</span>
                  </div>
                )}
                {league.prize_pool && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Prize Pool</span>
                    <span className="text-white font-medium">{league.prize_pool}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Season</span>
                  <span className="text-white font-medium">{league.season}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Region</span>
                  <span className="text-white font-medium">{league.region}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl rounded-lg">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg font-bold mb-4">Participating Schools</h3>
              {league.schools && league.schools.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {league.schools.map((leagueSchool) => (
                    <div key={leagueSchool.school.id} className="text-sm p-2 bg-white/5 backdrop-blur-sm rounded border border-white/10">
                      <p className="text-white font-medium">{leagueSchool.school.name}</p>
                      <p className="text-gray-400 font-medium text-xs">{leagueSchool.school.location}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-medium">No schools registered</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-2xl rounded-lg">
            <CardContent className="p-6">
              <h3 className="font-orbitron text-white text-lg font-bold mb-4">Recent Matches</h3>
              {league.matches && league.matches.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {league.matches.slice(0, 5).map((match) => (
                    <div key={match.id} className="text-sm border-b border-gray-600/40 pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-medium text-xs">
                            {match.team_a.name} vs {match.team_b.name}
                          </p>
                          <p className="text-gray-400 font-medium text-xs">
                            {match.played_at ? 
                              new Date(match.played_at).toLocaleDateString() : 
                              new Date(match.scheduled_at).toLocaleDateString()
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          {match.team_a_score !== null && match.team_b_score !== null ? (
                            <p className="text-cyan-400 font-orbitron font-bold text-xs">
                              {match.team_a_score}-{match.team_b_score}
                            </p>
                          ) : (
                            <Badge className="bg-gray-600/50 text-white text-xs font-medium">{match.status}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 font-medium">No matches scheduled</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}