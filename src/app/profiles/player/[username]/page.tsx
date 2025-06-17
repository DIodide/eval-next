"use client";

import { useState, use } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquareIcon, StarIcon, GamepadIcon, GithubIcon, TwitterIcon, InstagramIcon, TwitchIcon, MessageCircleIcon, ExternalLinkIcon } from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import { api } from "@/trpc/react";

// Helper functions for platform and social connections
function getPlatformIcon(platform: string) {
  switch (platform) {
    case "steam":
      return <GamepadIcon className="w-4 h-4 text-white" />;
    case "valorant":
      return <GamepadIcon className="w-4 h-4 text-white" />;
    case "battlenet":
      return <GamepadIcon className="w-4 h-4 text-white" />;
    case "epicgames":
      return <GamepadIcon className="w-4 h-4 text-white" />;
    case "startgg":
      return <GamepadIcon className="w-4 h-4 text-white" />;
    default:
      return <GamepadIcon className="w-4 h-4 text-white" />;
  }
}

function getPlatformColor(platform: string) {
  switch (platform) {
    case "steam":
      return "bg-blue-600";
    case "valorant":
      return "bg-red-600";
    case "battlenet":
      return "bg-blue-800";
    case "epicgames":
      return "bg-gray-800";
    case "startgg":
      return "bg-purple-600";
    default:
      return "bg-gray-600";
  }
}

function getPlatformDisplayName(platform: string) {
  switch (platform) {
    case "steam":
      return "Steam";
    case "valorant":
      return "Valorant";
    case "battlenet":
      return "Battle.net";
    case "epicgames":
      return "Epic Games";
    case "startgg":
      return "Start.gg";
    default:
      return platform;
  }
}

function getSocialIcon(platform: string) {
  switch (platform) {
    case "github":
      return <GithubIcon className="w-4 h-4 text-white" />;
    case "discord":
      return <MessageCircleIcon className="w-4 h-4 text-white" />;
    case "instagram":
      return <InstagramIcon className="w-4 h-4 text-white" />;
    case "twitch":
      return <TwitchIcon className="w-4 h-4 text-white" />;
    case "x":
      return <TwitterIcon className="w-4 h-4 text-white" />;
    default:
      return <MessageCircleIcon className="w-4 h-4 text-white" />;
  }
}

function getSocialColor(platform: string) {
  switch (platform) {
    case "github":
      return "bg-gray-800";
    case "discord":
      return "bg-indigo-600";
    case "instagram":
      return "bg-pink-600";
    case "twitch":
      return "bg-purple-600";
    case "x":
      return "bg-gray-900";
    default:
      return "bg-gray-600";
  }
}

function getSocialDisplayName(platform: string) {
  switch (platform) {
    case "github":
      return "GitHub";
    case "discord":
      return "Discord";
    case "instagram":
      return "Instagram";
    case "twitch":
      return "Twitch";
    case "x":
      return "X (Twitter)";
    default:
      return platform;
  }
}

// Mock data for game statistics (keeping this separate from database data)
const mockGameStats = {
  valorant: {
    role: "Duelist",
    bestAgents: ["Jett", "Reyna", "Phoenix"],
    bestGun: {
      name: "Vandal",
      image: "/valorant/weapons/vandal.png"
    },
    bestMap: {
      name: "Ascent", 
      image: "/valorant/maps/ascent.png"
    },
    stats: {
      kda: "1.4",
      winRate: "68%",
      rank: "Immortal 2",
      clutchRate: "24%"
    }
  },
  overwatch: {
    role: "DPS",
    bestHeroes: ["Tracer", "Genji", "Widow"],
    bestMap: {
      name: "King's Row",
      image: "/overwatch/maps/kings-row.png"
    },
    stats: {
      eliminations: "24.3",
      deaths: "8.1", 
      damage: "11,240",
      rank: "Diamond 3",
      winRate: "71%"
    }
  },
  "rocket-league": {
    position: "Striker",
    stats: {
      goals: "1.8",
      saves: "2.3",
      assists: "1.2",
      score: "487",
      winRate: "74%",
      rank: "Champion II"
    }
  }
};

// Mock data - replace with actual API calls later
const mockPlayerData = {
  id: "player-123",
  avatar: null, // Will use Clerk's imageUrl
  firstName: "John",
  lastName: "Doe",
  username: "johndoe_pro",
  class: "2025",
  teamSchool: "University of California, Berkeley",
  location: "Los Angeles, CA",
  mainGame: "Valorant",
  role: "Duelist",
  evalScore: 4.2,
  leagueScore: 3.8,
  games: ["valorant", "overwatch", "rocket-league"]
};



interface PlayerProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

function MessagePlayerDialog({ playerId, playerName }: { playerId: string; playerName: string }) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = () => {
    // TODO: Implement actual message sending via tRPC
    console.log("Sending message to player:", playerId, message);
    setMessage("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
          <MessageSquareIcon className="w-4 h-4 mr-2" />
          Message Player
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron">Send Message to {playerName}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Send a direct message to this player about recruitment opportunities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message" className="text-gray-300">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="border-gray-700 text-gray-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const [activeGame, setActiveGame] = useState("valorant");
  const { user } = useUser();
  const canMessage = hasPermission(user, "message_player");
  
  // Unwrap params Promise for Next.js 15
  const unwrappedParams = use(params);

  // Fetch player data from database
  const { data: player, isLoading, error } = api.playerProfile.getPublicProfile.useQuery({
    username: unwrappedParams.username
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4 font-rajdhani">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-orbitron font-bold text-white mb-4">Player Not Found</h1>
          <p className="text-gray-400 font-rajdhani">The player profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80 py-8">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Header Section */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={player.image_url ?? undefined} alt={`${player.first_name} ${player.last_name}`} />
                  <AvatarFallback className="text-2xl bg-gray-700 text-white">
                    {player.first_name[0]}{player.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-orbitron font-bold mb-2 text-white">
                    {player.first_name} {player.last_name}
                  </h1>
                  <p className="text-lg text-gray-400 mb-2 font-rajdhani">@{player.username}</p>
                  <p className="text-gray-400 font-rajdhani">{player.location}</p>
                </div>
              </div>

              {/* Player Details */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-orbitron font-semibold text-gray-300 mb-3">Player Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-rajdhani">Class:</span>
                      <Badge variant="secondary" className="bg-gray-700 text-cyan-400 border-gray-600">{player.class_year ?? "N/A"}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-rajdhani">School:</span>
                      <span className="text-right text-sm text-gray-300 max-w-32 truncate">{player.school_ref?.name ?? player.school ?? "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-rajdhani">Main Game:</span>
                      <Badge className="bg-cyan-600 text-white">{player.main_game?.name ?? "N/A"}</Badge>
                    </div>
                    {player.game_profiles.length > 0 && player.game_profiles[0].role && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-rajdhani">Role:</span>
                        <span className="text-gray-300 font-rajdhani">{player.game_profiles[0].role}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-orbitron font-semibold text-gray-300 mb-3">Performance</h3>
                  <div className="space-y-4">
                    {/* EVAL Score */}
                    {player.game_profiles.length > 0 && player.game_profiles[0].combine_score && (
                      <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-4 rounded-lg border border-purple-700/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-purple-300 font-rajdhani text-sm">EVAL Score</p>
                            <p className="text-white font-orbitron text-2xl font-bold">
                              {Number(player.game_profiles[0].combine_score).toFixed(1)}
                            </p>
                          </div>
                          <StarIcon className="w-8 h-8 text-purple-300" />
                        </div>
                      </div>
                    )}

                    {/* League Score */}
                    {player.game_profiles.length > 0 && player.game_profiles[0].league_score && (
                      <div className="bg-gradient-to-r from-cyan-900/50 to-cyan-800/50 p-4 rounded-lg border border-cyan-700/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-cyan-300 font-rajdhani text-sm">League Score</p>
                            <p className="text-white font-orbitron text-2xl font-bold">
                              {Number(player.game_profiles[0].league_score).toFixed(1)}
                            </p>
                          </div>
                          <StarIcon className="w-8 h-8 text-cyan-300" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canMessage && (
                <div className="flex flex-col gap-2">
                  <MessagePlayerDialog playerId={player.id} playerName={`${player.first_name} ${player.last_name}`} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        {player.bio && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 font-rajdhani leading-relaxed">{player.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Connections Section */}
        {(player.platform_connections.length > 0 || player.social_connections.length > 0) && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Platform Connections */}
                {player.platform_connections.length > 0 && (
                  <div>
                    <h3 className="font-orbitron font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <GamepadIcon className="w-5 h-5 text-cyan-400" />
                      Gaming Platforms
                    </h3>
                    <div className="space-y-3">
                      {player.platform_connections.map((connection) => (
                        <div key={connection.platform} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getPlatformColor(connection.platform)}`}>
                              {getPlatformIcon(connection.platform)}
                            </div>
                            <div>
                              <p className="text-white font-rajdhani font-medium">{getPlatformDisplayName(connection.platform)}</p>
                              <p className="text-gray-400 text-sm">{connection.username}</p>
                            </div>
                          </div>
                          <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Connections */}
                {player.social_connections.length > 0 && (
                  <div>
                    <h3 className="font-orbitron font-semibold text-gray-300 mb-4 flex items-center gap-2">
                      <MessageCircleIcon className="w-5 h-5 text-cyan-400" />
                      Social Media
                    </h3>
                    <div className="space-y-3">
                      {player.social_connections.map((connection) => (
                        <div key={connection.platform} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSocialColor(connection.platform)}`}>
                              {getSocialIcon(connection.platform)}
                            </div>
                            <div>
                              <p className="text-white font-rajdhani font-medium">{getSocialDisplayName(connection.platform)}</p>
                              <p className="text-gray-400 text-sm">{connection.username}</p>
                            </div>
                          </div>
                          <ExternalLinkIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game-Specific Stats */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white font-orbitron">Game Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeGame} onValueChange={setActiveGame}>
              <TabsList className="grid w-full grid-cols-3 bg-gray-700 border-gray-600">
                <TabsTrigger value="valorant" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-orbitron">Valorant</TabsTrigger>
                <TabsTrigger value="overwatch" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-orbitron">Overwatch</TabsTrigger>
                <TabsTrigger value="rocket-league" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white font-orbitron">Rocket League</TabsTrigger>
              </TabsList>

              {/* Valorant Stats */}
              <TabsContent value="valorant" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Role & Agents */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white font-orbitron">Role & Best Agents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="mb-3 bg-cyan-600 text-white">{mockGameStats.valorant.role}</Badge>
                      <div className="space-y-2">
                        {mockGameStats.valorant.bestAgents.map((agent, index) => (
                          <div key={agent} className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-sm font-orbitron font-bold text-white">
                              {index + 1}
                            </div>
                            <span className="text-gray-300 font-rajdhani">{agent}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Best Gun */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white font-orbitron">Best Gun</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="w-full h-32 bg-gray-800 rounded-lg mb-3 flex items-center justify-center border border-gray-700">
                          <span className="text-gray-500 font-rajdhani">Gun Image</span>
                        </div>
                        <p className="font-orbitron font-semibold text-white">{mockGameStats.valorant.bestGun.name}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Best Map */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white font-orbitron">Best Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="w-full h-32 bg-gray-800 rounded-lg mb-3 flex items-center justify-center border border-gray-700">
                          <span className="text-gray-500 font-rajdhani">Map Image</span>
                        </div>
                        <p className="font-orbitron font-semibold text-white">{mockGameStats.valorant.bestMap.name}</p>
                        <p className="text-sm text-gray-400 font-rajdhani">Win Rate: 78%</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-red-400">
                        {mockGameStats.valorant.stats.kda}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">K/D/A</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-green-400">
                        {mockGameStats.valorant.stats.winRate}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Win Rate</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-purple-400">
                        {mockGameStats.valorant.stats.rank}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Rank</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-blue-400">
                        {mockGameStats.valorant.stats.clutchRate}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Clutch Rate</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Overwatch Stats */}
              <TabsContent value="overwatch" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Role & Heroes */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white font-orbitron">Role & Best Heroes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="mb-3 bg-cyan-600 text-white">{mockGameStats.overwatch.role}</Badge>
                      <div className="space-y-2">
                        {mockGameStats.overwatch.bestHeroes.map((hero, index) => (
                          <div key={hero} className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-sm font-orbitron font-bold text-white">
                              {index + 1}
                            </div>
                            <span className="text-gray-300 font-rajdhani">{hero}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Best Map */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white font-orbitron">Best Map</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="w-full h-32 bg-gray-800 rounded-lg mb-3 flex items-center justify-center border border-gray-700">
                          <span className="text-gray-500 font-rajdhani">Map Image</span>
                        </div>
                        <p className="font-orbitron font-semibold text-white">{mockGameStats.overwatch.bestMap.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-red-400">
                        {mockGameStats.overwatch.stats.eliminations}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Elims/10min</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-gray-400">
                        {mockGameStats.overwatch.stats.deaths}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Deaths/10min</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-orange-400">
                        {mockGameStats.overwatch.stats.damage}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Damage/10min</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-purple-400">
                        {mockGameStats.overwatch.stats.rank}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Rank</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-green-400">
                        {mockGameStats.overwatch.stats.winRate}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Win Rate</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Rocket League Stats */}
              <TabsContent value="rocket-league" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white font-orbitron">Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="mb-3 bg-cyan-600 text-white">{mockGameStats["rocket-league"].position}</Badge>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-lg text-white font-orbitron">Overall Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mx-auto border border-gray-700">
                        <span className="text-gray-500 font-rajdhani">Chart</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-blue-400">
                        {mockGameStats["rocket-league"].stats.goals}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Goals/Game</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-green-400">
                        {mockGameStats["rocket-league"].stats.saves}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Saves/Game</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-yellow-400">
                        {mockGameStats["rocket-league"].stats.assists}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Assists/Game</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-orange-400">
                        {mockGameStats["rocket-league"].stats.score}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Score/Game</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-green-400">
                        {mockGameStats["rocket-league"].stats.winRate}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Win Rate</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-orbitron font-bold text-purple-400">
                        {mockGameStats["rocket-league"].stats.rank}
                      </div>
                      <div className="text-sm text-gray-400 font-rajdhani">Rank</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}