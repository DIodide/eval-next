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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { MessageSquareIcon, StarIcon, GamepadIcon, GithubIcon, TwitterIcon, InstagramIcon, TwitchIcon, MessageCircleIcon, ExternalLinkIcon, InfoIcon } from "lucide-react";
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
    mainAgent: {
      name: "Jett",
      image: "/valorant/agents/jett.png"
    },
    mainGun: {
      name: "Vandal",
      image: "/valorant/weapons/vandal.png"
    },
    bestMap: {
      name: "Ascent", 
      image: "/valorant/maps/ascent.png"
    },
    worstMap: {
      name: "Breeze",
      image: "/valorant/maps/breeze.png"
    },
    stats: {
      evalScore: 87,
      rank: "Immortal 2",
      kda: "1.4/0.8/2.1",
      gameWinRate: "68%",
      roundWinRate: "55%",
      acs: 245,
      kastPercent: "76%",
      clutchFactor: "24%"
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
// Note: mockPlayerData is currently unused but kept for future reference
// const mockPlayerData = {
//   id: "player-123",
//   avatar: null, // Will use Clerk's imageUrl
//   firstName: "John",
//   lastName: "Doe",
//   username: "johndoe_pro",
//   class: "2025",
//   teamSchool: "University of California, Berkeley",
//   location: "Los Angeles, CA",
//   mainGame: "Valorant",
//   role: "Duelist",
//   evalScore: 4.2,
//   leagueScore: 3.8,
//   games: ["valorant", "overwatch", "rocket-league"]
// };



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
  const canMessage = user ? hasPermission(user, "message_player") : false;
  
  // Check if user is an onboarded coach
  const isOnboardedCoach = user?.publicMetadata?.onboarded === true && user?.publicMetadata?.userType === "coach";
  
  // Unwrap params Promise for Next.js 15
  const unwrappedParams = use(params);

  // Fetch player data from database
  const { data: player, isLoading, error } = api.playerProfile.getPublicProfile.useQuery({
    username: unwrappedParams.username
  }, {
    // Client-side caching configuration
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 1, // Only retry once for public profiles
    retryDelay: 1000, // Wait 1 second before retry
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Fetch recruiting info for onboarded coaches only
  const { data: recruitingInfo } = api.playerProfile.getPublicRecruitingInfo.useQuery({
    username: unwrappedParams.username
  }, {
    enabled: isOnboardedCoach, // Only fetch if user is an onboarded coach
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80 flex items-center justify-center">
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
          <p className="text-gray-400 font-rajdhani">The player profile you&apos;re looking for doesn&apos;t exist.</p>
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
                    {player.first_name?.[0] ?? ''}{player.last_name?.[0] ?? ''}
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
                    {player.game_profiles.length > 0 && player.game_profiles[0]?.role && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-rajdhani">Role:</span>
                        <span className="text-gray-300 font-rajdhani">{player.game_profiles[0]?.role}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-orbitron font-semibold text-gray-300 mb-3">Performance</h3>
                  <div className="space-y-4">
                    {/* EVAL Score */}
                    {player.game_profiles.length > 0 && player.game_profiles[0]?.combine_score && (
                      <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-4 rounded-lg border border-purple-700/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-purple-300 font-rajdhani text-sm">EVAL Score</p>
                            <p className="text-white font-orbitron text-2xl font-bold">
                              {Number(player.game_profiles[0]?.combine_score).toFixed(1)}
                            </p>
                          </div>
                          <StarIcon className="w-8 h-8 text-purple-300" />
                        </div>
                      </div>
                    )}

                    {/* League Score */}
                    {player.game_profiles.length > 0 && player.game_profiles[0]?.league_score && (
                      <div className="bg-gradient-to-r from-cyan-900/50 to-cyan-800/50 p-4 rounded-lg border border-cyan-700/30">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-cyan-300 font-rajdhani text-sm">League Score</p>
                            <p className="text-white font-orbitron text-2xl font-bold">
                              {Number(player.game_profiles[0]?.league_score).toFixed(1)}
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

        {/* Academic & Recruiting Information */}
        {recruitingInfo && (recruitingInfo.academic_bio ?? recruitingInfo.extra_curriculars ?? recruitingInfo.intended_major ?? recruitingInfo.gpa ?? recruitingInfo.graduation_date) && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Academic & Recruiting Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Information */}
                <div>
                  <h3 className="font-orbitron font-semibold text-gray-300 mb-4">Academic Information</h3>
                  <div className="space-y-3">
                    {recruitingInfo.intended_major && (
                      <div>
                        <span className="text-gray-400 font-rajdhani text-sm">Intended Major:</span>
                        <p className="text-gray-300 font-rajdhani">{recruitingInfo.intended_major}</p>
                      </div>
                    )}
                    {recruitingInfo.graduation_date && (
                      <div>
                        <span className="text-gray-400 font-rajdhani text-sm">Expected Graduation:</span>
                        <p className="text-gray-300 font-rajdhani">{recruitingInfo.graduation_date}</p>
                      </div>
                    )}
                    {recruitingInfo.gpa && (
                      <div>
                        <span className="text-gray-400 font-rajdhani text-sm">GPA:</span>
                        <p className="text-gray-300 font-rajdhani">{Number(recruitingInfo.gpa).toFixed(2)}</p>
                      </div>
                    )}
                    {recruitingInfo.academic_bio && (
                      <div>
                        <span className="text-gray-400 font-rajdhani text-sm">Academic Achievements:</span>
                        <p className="text-gray-300 font-rajdhani leading-relaxed mt-1">{recruitingInfo.academic_bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extracurricular Activities */}
                {recruitingInfo.extra_curriculars && (
                  <div>
                    <h3 className="font-orbitron font-semibold text-gray-300 mb-4">Extracurricular Activities</h3>
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                      <p className="text-gray-300 font-rajdhani leading-relaxed">{recruitingInfo.extra_curriculars}</p>
                    </div>
                  </div>
                )}
              </div>
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
                {/* Top Row: Role, Agent, Gun */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
                      MAIN ROLE
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                          <p>Primary role played in competitive matches. Duelists are entry fraggers who create space for the team.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-lg font-orbitron font-bold text-cyan-400">{mockGameStats.valorant.role}</div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
                      MAIN AGENT
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                          <p>Most frequently played agent based on match history and performance statistics.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                      <div className="text-lg font-orbitron font-bold text-white">{mockGameStats.valorant.mainAgent.name}</div>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
                      MAIN GUN
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                          <p>Primary weapon with highest kill count and best performance metrics.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                      <div className="text-lg font-orbitron font-bold text-white">{mockGameStats.valorant.mainGun.name}</div>
                    </div>
                  </div>
                </div>

                {/* Maps Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
                      BEST MAP
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                          <p>Highest win rate and performance map. Shows where the player excels most consistently.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                      <div className="text-lg font-orbitron font-bold text-green-400">{mockGameStats.valorant.bestMap.name}</div>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                    <div className="text-xs text-gray-400 font-rajdhani mb-1 flex items-center gap-1">
                      WORST MAP
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="bg-black text-white border-gray-600 max-w-48 md:max-w-56">
                          <p>Lowest win rate and performance map. Indicates areas for improvement.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded border border-gray-600 flex items-center justify-center">
                        <span className="text-xs text-gray-500">IMG</span>
                      </div>
                      <div className="text-lg font-orbitron font-bold text-red-400">{mockGameStats.valorant.worstMap.name}</div>
                    </div>
                  </div>
                </div>

                {/* Core Metrics Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-700/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-orbitron font-bold text-purple-300">{mockGameStats.valorant.stats.evalScore}</div>
                    <div className="text-xs text-purple-400 font-rajdhani flex items-center justify-center gap-1">
                      EVAL SCORE
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-purple-500 hover:text-purple-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>EVAL&apos;s proprietary ranking score (0-100) based on performance across multiple metrics including aim, game sense, and impact.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-700/30 rounded-lg p-3 text-center">
                    <div className="text-lg font-orbitron font-bold text-red-300">{mockGameStats.valorant.stats.rank}</div>
                    <div className="text-xs text-red-400 font-rajdhani flex items-center justify-center gap-1">
                      RANK
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-red-500 hover:text-red-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>Current competitive rank in Valorant&apos;s ranked system. Higher ranks indicate better skill level.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <div className="text-lg font-orbitron font-bold text-green-400">{mockGameStats.valorant.stats.gameWinRate}</div>
                    <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                      GAME WIN %
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>Percentage of games won out of total games played. Measures overall team success rate.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <div className="text-lg font-orbitron font-bold text-blue-400">{mockGameStats.valorant.stats.roundWinRate}</div>
                    <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                      ROUND WIN %
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>Percentage of individual rounds won. More granular than game win rate and shows consistent performance.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <div className="text-lg font-orbitron font-bold text-red-400">{mockGameStats.valorant.stats.kda}</div>
                    <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                      K/D/A
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>Kills/Deaths/Assists ratio. Shows average performance per game in eliminations and team support.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <div className="text-lg font-orbitron font-bold text-orange-400">
                      {mockGameStats.valorant.stats.acs}
                    </div>
                    <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                      ACS
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>Average Combat Score - comprehensive metric measuring overall impact per round including damage, kills, and utility usage.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <div className="text-lg font-orbitron font-bold text-yellow-400">
                      {mockGameStats.valorant.stats.kastPercent}
                    </div>
                    <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                      KAST%
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>Percentage of rounds where the player got a Kill, Assist, Survived, or was Traded. Measures consistent round contribution.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-center">
                    <div className="text-lg font-orbitron font-bold text-cyan-400">
                      {mockGameStats.valorant.stats.clutchFactor}
                    </div>
                    <div className="text-xs text-gray-400 font-rajdhani flex items-center justify-center gap-1">
                      CLUTCH FACTOR
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoIcon className="w-3 h-3 text-gray-500 hover:text-gray-300 cursor-help" />
                        </TooltipTrigger>
                                                 <TooltipContent side="bottom" className="bg-black text-white border-gray-600 max-w-40 md:max-w-48 whitespace-normal">
                           <p>Win rate in 1vX clutch situations. Measures performance under pressure when outnumbered.</p>
                         </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
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