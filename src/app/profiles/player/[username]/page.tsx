"use client";

import { useState, use } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  MessageSquareIcon, 
  StarIcon, 
  GamepadIcon, 
  GithubIcon, 
  TwitterIcon, 
  InstagramIcon, 
  TwitchIcon, 
  MessageCircleIcon, 
  ExternalLinkIcon, 
  Share2Icon,
  TrophyIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  BookOpenIcon,
  AwardIcon,
  Target,
  Users,
  Zap,
  CheckIcon,
  LoaderIcon
} from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { ValorantAnalytics } from "./ValorantAnalytics";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: {
      duration: 0.3
    }
  }
};

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6
    }
  }
};

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

// Mock data for game statistics (excluding Valorant which now uses real data)
const mockGameStats = {
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
    toast.success("Message sent successfully!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-orbitron shadow-lg border border-green-500/30 backdrop-blur-sm transition-all duration-300">
          <MessageSquareIcon className="w-4 h-4 mr-2" />
          Message Player
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 border-blue-500/30 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageSquareIcon className="h-5 w-5 text-blue-400" />
            </div>
            Send Message to {playerName}
          </DialogTitle>
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
          <Button variant="outline" onClick={() => setIsOpen(false)} className="border-blue-500/30 text-gray-300 hover:bg-blue-500/20">
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 text-white font-orbitron shadow-lg"
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
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied">("idle");
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

  // Handle share profile functionality
  const handleShareProfile = async () => {
    if (copyStatus !== "idle") return; // Prevent multiple clicks
    
    setCopyStatus("copying");
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setCopyStatus("copied");
      toast.success("Profile URL copied to clipboard!");
      
      // Reset to idle after 1 second
      setTimeout(() => {
        setCopyStatus("idle");
      }, 1000);
    } catch (err) {
      setCopyStatus("idle");
      // Fallback for browsers that don't support clipboard API
      toast.error("Unable to copy to clipboard. Please copy the URL manually.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-16 w-16 border-4 border-t-blue-400 border-r-purple-400 border-b-pink-400 border-l-transparent mx-auto"
          />
          <p className="text-gray-400 mt-6 font-rajdhani text-lg">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 rounded-2xl blur-xl" />
            <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-red-500/20 backdrop-blur-sm shadow-2xl p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 bg-red-500/20 rounded-full">
                  <UserIcon className="h-12 w-12 text-red-400" />
                </div>
              </div>
          <h1 className="text-3xl font-orbitron font-bold text-white mb-4">Player Not Found</h1>
              <p className="text-gray-400 font-rajdhani text-lg">The player profile you&apos;re looking for doesn&apos;t exist.</p>
            </Card>
        </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/10 to-gray-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Enhanced Header Section with Banner - Full Width */}
      <motion.div 
        className="relative h-80 overflow-hidden"
        variants={itemVariants}
      >
        {/* Banner Background */}
        <div className="absolute inset-0">
          {player.banner_url ? (
            /* Use uploaded banner image when available */
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${player.banner_url})` }}
            />
          ) : (
            /* Fallback to gradient background when no banner is set */
            <div className="w-full h-full bg-gradient-to-r from-blue-900/40 via-purple-900/50 to-pink-900/40" />
          )}
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-gray-900/20" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 container mx-auto px-4 max-w-6xl h-full flex items-end pb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 w-full">
            {/* Player Avatar and Basic Info - Inline Layout */}
            <motion.div 
              className="flex flex-col md:flex-row items-center md:items-end gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-lg"></div>
                <Avatar className="relative w-40 h-40 ring-4 ring-blue-400/30 shadow-2xl border-4 border-blue-400/20 bg-gray-900/50 backdrop-blur-sm">
                  <AvatarImage src={player.image_url ?? undefined} alt={`${player.first_name} ${player.last_name}`} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-600/90 to-purple-600/90 backdrop-blur-sm text-white font-orbitron border-2 border-blue-500/30">
                    {player.first_name?.[0] ?? ''}{player.last_name?.[0] ?? ''}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="text-center md:text-left">
                <motion.h1 
                  className="text-4xl md:text-5xl font-orbitron font-bold mb-3 text-white drop-shadow-2xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {player.first_name} {player.last_name}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex flex-col md:flex-row items-center gap-4 mb-4"
                >
                  <div className="flex items-center gap-2 text-blue-300">
                    <UserIcon className="w-5 h-5" />
                    <span className="font-rajdhani text-lg font-medium">@{player.username}</span>
                  </div>
                  {player.location && (
                    <div className="flex items-center gap-2 text-blue-300">
                      <MapPinIcon className="w-5 h-5" />
                      <span className="font-rajdhani text-lg">{player.location}</span>
                    </div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-col md:flex-row items-center gap-3"
                >
                  {player?.main_game?.name && (
                    <Badge className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white backdrop-blur-sm font-orbitron text-sm px-4 py-2 shadow-lg border border-blue-500/30">
                      {player.main_game.name}
                    </Badge>
                  )}
                  {player?.class_year && (
                    <Badge variant="outline" className="border-blue-400/60 text-blue-300 bg-blue-400/10 backdrop-blur-sm font-orbitron text-sm px-4 py-2 shadow-lg">
                      Class of {player.class_year}
                    </Badge>
                  )}
                  {(player?.school_ref?.name ?? player?.school) && (
                    <Badge variant="outline" className="border-cyan-400/60 text-cyan-300 bg-cyan-400/10 backdrop-blur-sm font-rajdhani text-sm px-4 py-2 shadow-lg">
                      {player.school_ref?.name ?? player.school}
                    </Badge>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Action Buttons and Performance Stats */}
            <motion.div 
              className="flex flex-col gap-4 lg:ml-auto"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {/* Performance Stats */}
              <div className="flex flex-col gap-3">
                {player?.game_profiles?.length > 0 && player.game_profiles[0]?.combine_score && (
                  <motion.div 
                    className="bg-gradient-to-r from-purple-600/30 via-purple-500/30 to-pink-600/30 backdrop-blur-sm border border-purple-500/40 rounded-xl p-4 shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/30 rounded-lg">
                        <StarIcon className="w-5 h-5 text-purple-300" />
                      </div>
                      <div>
                        <p className="text-purple-300 font-rajdhani text-sm font-medium">EVAL Score</p>
                        <p className="text-white font-orbitron text-2xl font-bold">
                          {Number(player.game_profiles[0]?.combine_score).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
                {player?.game_profiles?.length > 0 && player.game_profiles[0]?.league_score && (
                  <motion.div 
                    className="bg-gradient-to-r from-blue-600/30 via-blue-500/30 to-cyan-600/30 backdrop-blur-sm border border-blue-500/40 rounded-xl p-4 shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/30 rounded-lg">
                        <AwardIcon className="w-5 h-5 text-blue-300" />
                      </div>
                      <div>
                        <p className="text-blue-300 font-rajdhani text-sm font-medium">League Score</p>
                        <p className="text-white font-orbitron text-2xl font-bold">
                          {Number(player.game_profiles[0]?.league_score).toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleShareProfile}
                  disabled={copyStatus !== "idle"}
                  className={`font-orbitron shadow-lg border backdrop-blur-sm transition-all duration-150 ${
                    copyStatus === "copied" 
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-green-500/30" 
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-blue-500/30"
                  } text-white`}
                >
                  <motion.div
                    key={copyStatus}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className="w-4 h-4 mr-2"
                  >
                    {copyStatus === "copying" && (
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                    )}
                    {copyStatus === "copied" && (
                      <CheckIcon className="w-4 h-4" />
                    )}
                    {copyStatus === "idle" && (
                      <Share2Icon className="w-4 h-4" />
                    )}
                  </motion.div>
                  Share Profile
                </Button>
                {canMessage && (
                  <MessagePlayerDialog playerId={player.id} playerName={`${player.first_name} ${player.last_name}`} />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Container */}
      <div className="container mx-auto px-4 max-w-6xl py-8 space-y-8">
        {/* Player Details Card */}
        <motion.div 
          className="relative"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl blur-xl" />
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="text-white font-orbitron text-2xl flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <UserIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  Player Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Player Details */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="font-orbitron font-semibold text-white text-xl">Player Info</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 font-rajdhani">Class:</span>
                        </div>
                        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                          {player.class_year ?? "N/A"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <BookOpenIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 font-rajdhani">School:</span>
                        </div>
                        <span className="text-right text-sm text-gray-300 max-w-32 truncate">
                          {player?.school_ref?.name ?? player?.school ?? "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <GamepadIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 font-rajdhani">Main Game:</span>
                        </div>
                        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                          {player?.main_game?.name ?? "N/A"}
                        </Badge>
                      </div>
                      {player?.game_profiles?.length > 0 && player.game_profiles[0]?.role && (
                        <div className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-400 font-rajdhani">Role:</span>
                          </div>
                          <span className="text-gray-300 font-rajdhani font-medium">
                            {player.game_profiles[0]?.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Performance */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <TrophyIcon className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="font-orbitron font-semibold text-white text-xl">Performance</h3>
                    </div>
                    <div className="space-y-4">
                      {/* EVAL Score */}
                      {player.game_profiles.length > 0 && player.game_profiles[0]?.combine_score && (
                        <motion.div 
                          className="bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-pink-600/20 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm shadow-xl"
                          variants={statsCardVariants}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-purple-300 font-rajdhani text-sm font-medium">EVAL Score</p>
                              <p className="text-white font-orbitron text-3xl font-bold">
                                {Number(player.game_profiles[0]?.combine_score).toFixed(1)}
                              </p>
                            </div>
                            <div className="p-3 bg-purple-500/20 rounded-full">
                              <StarIcon className="w-8 h-8 text-purple-300" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* League Score */}
                      {player.game_profiles.length > 0 && player.game_profiles[0]?.league_score && (
                        <motion.div 
                          className="bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-cyan-600/20 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm shadow-xl"
                          variants={statsCardVariants}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-blue-300 font-rajdhani text-sm font-medium">League Score</p>
                              <p className="text-white font-orbitron text-3xl font-bold">
                                {Number(player.game_profiles[0]?.league_score).toFixed(1)}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-full">
                              <AwardIcon className="w-8 h-8 text-blue-300" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Bio Section */}
        {player.bio && (
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl blur-xl" />
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
                  <CardTitle className="text-white font-orbitron text-2xl flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <UserIcon className="h-6 w-6 text-blue-400" />
                    </div>
                    About
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <motion.p 
                    className="text-gray-300 font-rajdhani leading-relaxed text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                  >
                    {player.bio}
                  </motion.p>
            </CardContent>
          </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Academic & Recruiting Information */}
        {recruitingInfo && (recruitingInfo.academic_bio ?? recruitingInfo.extra_curriculars ?? recruitingInfo.intended_major ?? recruitingInfo.gpa ?? recruitingInfo.graduation_date) && (
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-blue-600/5 to-purple-600/5 rounded-2xl blur-xl" />
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-green-500/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
                  <CardTitle className="text-white font-orbitron text-2xl flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <BookOpenIcon className="h-6 w-6 text-green-400" />
                    </div>
                    Academic & Recruiting Profile
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Academic Information */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <h3 className="font-orbitron font-semibold text-white text-xl mb-6 flex items-center gap-2">
                        <AwardIcon className="h-5 w-5 text-green-400" />
                        Academic Information
                      </h3>
                      <div className="space-y-4">
                    {recruitingInfo.intended_major && (
                          <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <span className="text-gray-400 font-rajdhani text-sm font-medium">Intended Major:</span>
                            <p className="text-gray-300 font-rajdhani text-lg mt-1">{recruitingInfo.intended_major}</p>
                      </div>
                    )}
                    {recruitingInfo.graduation_date && (
                          <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <span className="text-gray-400 font-rajdhani text-sm font-medium">Expected Graduation:</span>
                            <p className="text-gray-300 font-rajdhani text-lg mt-1">{recruitingInfo.graduation_date}</p>
                      </div>
                    )}
                    {recruitingInfo.gpa && (
                          <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <span className="text-gray-400 font-rajdhani text-sm font-medium">GPA:</span>
                            <p className="text-gray-300 font-rajdhani text-lg mt-1 font-bold">{Number(recruitingInfo.gpa).toFixed(2)}</p>
                      </div>
                    )}
                    {recruitingInfo.academic_bio && (
                          <div className="p-4 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <span className="text-gray-400 font-rajdhani text-sm font-medium">Academic Achievements:</span>
                            <p className="text-gray-300 font-rajdhani leading-relaxed mt-2">{recruitingInfo.academic_bio}</p>
                      </div>
                    )}
                  </div>
                    </motion.div>

                {/* Extracurricular Activities */}
                {recruitingInfo.extra_curriculars && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      >
                        <h3 className="font-orbitron font-semibold text-white text-xl mb-6 flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-400" />
                          Extracurricular Activities
                        </h3>
                        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 rounded-xl border border-gray-700/50 backdrop-blur-sm shadow-lg">
                          <p className="text-gray-300 font-rajdhani leading-relaxed text-lg">{recruitingInfo.extra_curriculars}</p>
                    </div>
                      </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Connections Section */}
        {(player.platform_connections.length > 0 || player.social_connections.length > 0) && (
          <motion.div 
            className="relative"
            variants={itemVariants}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 via-blue-600/5 to-purple-600/5 rounded-2xl blur-xl" />
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-cyan-500/20 backdrop-blur-sm shadow-xl">
            <CardHeader>
                  <CardTitle className="text-white font-orbitron text-2xl flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <MessageCircleIcon className="h-6 w-6 text-cyan-400" />
                    </div>
                    Connected Accounts
                  </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Platform Connections */}
                {player.platform_connections.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                      >
                        <h3 className="font-orbitron font-semibold text-white text-xl mb-6 flex items-center gap-2">
                      <GamepadIcon className="w-5 h-5 text-cyan-400" />
                      Gaming Platforms
                    </h3>
                        <div className="space-y-4">
                          {player.platform_connections.map((connection, index) => (
                            <motion.div 
                              key={connection.platform} 
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl border border-cyan-500/20 backdrop-blur-sm shadow-lg"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getPlatformColor(connection.platform)} shadow-lg`}>
                              {getPlatformIcon(connection.platform)}
                            </div>
                            <div>
                                  <p className="text-white font-rajdhani font-medium text-lg">{getPlatformDisplayName(connection.platform)}</p>
                              <p className="text-gray-400 text-sm">{connection.username}</p>
                            </div>
                          </div>
                              <ExternalLinkIcon className="w-5 h-5 text-cyan-400" />
                            </motion.div>
                      ))}
                    </div>
                      </motion.div>
                )}

                {/* Social Connections */}
                {player.social_connections.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      >
                        <h3 className="font-orbitron font-semibold text-white text-xl mb-6 flex items-center gap-2">
                      <MessageCircleIcon className="w-5 h-5 text-cyan-400" />
                      Social Media
                    </h3>
                        <div className="space-y-4">
                          {player.social_connections.map((connection, index) => (
                            <motion.div 
                              key={connection.platform} 
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/60 to-gray-900/60 rounded-xl border border-cyan-500/20 backdrop-blur-sm shadow-lg"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getSocialColor(connection.platform)} shadow-lg`}>
                              {getSocialIcon(connection.platform)}
                            </div>
                            <div>
                                  <p className="text-white font-rajdhani font-medium text-lg">{getSocialDisplayName(connection.platform)}</p>
                              <p className="text-gray-400 text-sm">{connection.username}</p>
                            </div>
                          </div>
                              <ExternalLinkIcon className="w-5 h-5 text-cyan-400" />
                            </motion.div>
                      ))}
                    </div>
                      </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Game Statistics */}
        <motion.div 
          className="relative"
          variants={itemVariants}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/5 via-red-600/5 to-pink-600/5 rounded-2xl blur-xl" />
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-orange-500/20 backdrop-blur-sm shadow-xl">
          <CardHeader>
                <CardTitle className="text-white font-orbitron text-2xl flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <TrophyIcon className="h-6 w-6 text-orange-400" />
                  </div>
                  Game Statistics
                </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeGame} onValueChange={setActiveGame}>
                  <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-700/80 to-gray-800/80 border-gray-600/50 backdrop-blur-sm">
                    <TabsTrigger value="valorant" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white font-orbitron">Valorant</TabsTrigger>
                    <TabsTrigger value="overwatch" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white font-orbitron">Overwatch</TabsTrigger>
                    <TabsTrigger value="rocket-league" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white font-orbitron">Rocket League</TabsTrigger>
              </TabsList>

              {/* Valorant Stats - Now using real API data */}
              <TabsContent value="valorant" className="mt-6">
                <ValorantAnalytics playerId={player.id} />
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
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}