"use client";

import { useState, use } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  LoaderIcon,
} from "lucide-react";
import { hasPermission } from "@/lib/client/permissions";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { GameAnalyticsPanel } from "@/components/core/GameAnalyticsPanel";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.3,
    },
  },
};

const statsCardVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
    },
  },
};

// Helper functions for platform and social connections
function getPlatformIcon(platform: string) {
  switch (platform) {
    case "steam":
      return <GamepadIcon className="h-4 w-4 text-white" />;
    case "valorant":
      return <GamepadIcon className="h-4 w-4 text-white" />;
    case "battlenet":
      return <GamepadIcon className="h-4 w-4 text-white" />;
    case "epicgames":
      return <GamepadIcon className="h-4 w-4 text-white" />;
    case "startgg":
      return <GamepadIcon className="h-4 w-4 text-white" />;
    default:
      return <GamepadIcon className="h-4 w-4 text-white" />;
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
      return <GithubIcon className="h-4 w-4 text-white" />;
    case "discord":
      return <MessageCircleIcon className="h-4 w-4 text-white" />;
    case "instagram":
      return <InstagramIcon className="h-4 w-4 text-white" />;
    case "twitch":
      return <TwitchIcon className="h-4 w-4 text-white" />;
    case "x":
      return <TwitterIcon className="h-4 w-4 text-white" />;
    default:
      return <MessageCircleIcon className="h-4 w-4 text-white" />;
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
      return "Discord"; //
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

interface PlayerProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

function MessagePlayerDialog({
  playerId,
  playerName,
}: {
  playerId: string;
  playerName: string;
}) {
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
        <Button className="font-orbitron border border-green-500/30 bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:from-green-700 hover:to-blue-700">
          <MessageSquareIcon className="mr-2 h-4 w-4" />
          Message Player
        </Button>
      </DialogTrigger>
      <DialogContent className="border-blue-500/30 bg-gradient-to-br from-gray-900/95 to-gray-800/95 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-orbitron flex items-center gap-2 text-xl">
            <div className="rounded-lg bg-blue-500/20 p-2">
              <MessageSquareIcon className="h-5 w-5 text-blue-400" />
            </div>
            Send Message to {playerName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send a direct message to this player about recruitment
            opportunities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message" className="text-gray-300">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-gray-700 bg-gray-800 text-white placeholder-gray-400"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-blue-500/30 text-gray-300 hover:bg-blue-500/20"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="font-orbitron bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700"
          >
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copying" | "copied">(
    "idle",
  );
  const { user } = useUser();
  const canMessage = user ? hasPermission(user, "message_player") : false;

  // Check if user is an onboarded coach
  const isOnboardedCoach =
    user?.publicMetadata?.onboarded === true &&
    user?.publicMetadata?.userType === "coach";

  // Unwrap params Promise for Next.js 15
  const unwrappedParams = use(params);

  // Fetch player data from database
  const {
    data: player,
    isLoading,
    error,
  } = api.playerProfile.getPublicProfile.useQuery(
    {
      username: unwrappedParams.username,
    },
    {
      // Client-side caching configuration
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      retry: 1, // Only retry once for public profiles
      retryDelay: 1000, // Wait 1 second before retry
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  );

  // Fetch recruiting info for onboarded coaches only
  const { data: recruitingInfo } =
    api.playerProfile.getPublicRecruitingInfo.useQuery(
      {
        username: unwrappedParams.username,
      },
      {
        enabled: isOnboardedCoach, // Only fetch if user is an onboarded coach
        staleTime: 5 * 60 * 1000,
        retry: 1,
        retryDelay: 1000,
        refetchOnWindowFocus: false,
      },
    );

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-16 w-16 rounded-full border-4 border-t-blue-400 border-r-purple-400 border-b-pink-400 border-l-transparent"
          />
          <p className="font-rajdhani mt-6 text-lg text-gray-400">
            Loading player profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 blur-xl" />
            <Card className="relative border-red-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 shadow-2xl backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-center">
                <div className="rounded-full bg-red-500/20 p-4">
                  <UserIcon className="h-12 w-12 text-red-400" />
                </div>
              </div>
              <h1 className="font-orbitron mb-4 text-3xl font-bold text-white">
                Player Not Found
              </h1>
              <p className="font-rajdhani text-lg text-gray-400">
                The player profile you&apos;re looking for doesn&apos;t exist.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="via-black-900/50 min-h-screen bg-gradient-to-br from-gray-900 to-gray-900"
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
              className="h-full w-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${player.banner_url})` }}
            />
          ) : (
            /* Fallback to gradient background when no banner is set */
            <div className="h-full w-full bg-gradient-to-r from-blue-900/40 via-purple-900/50 to-pink-900/40" />
          )}
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-gray-900/20" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 container mx-auto flex h-full max-w-6xl items-end px-4 pb-8">
          <div className="flex w-full flex-col items-start gap-6 lg:flex-row lg:items-end">
            {/* Player Avatar and Basic Info - Inline Layout */}
            <motion.div
              className="flex flex-col items-center gap-6 md:flex-row md:items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-lg"></div>
                <Avatar className="relative h-40 w-40 border-4 border-blue-400/20 bg-gray-900/50 shadow-2xl ring-4 ring-blue-400/30 backdrop-blur-sm">
                  <AvatarImage
                    src={player.image_url ?? undefined}
                    alt={`${player.first_name} ${player.last_name}`}
                  />
                  <AvatarFallback className="font-orbitron border-2 border-blue-500/30 bg-gradient-to-br from-blue-600/90 to-purple-600/90 text-3xl text-white backdrop-blur-sm">
                    {player.first_name?.[0] ?? ""}
                    {player.last_name?.[0] ?? ""}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="text-center md:text-left">
                <motion.h1
                  className="font-orbitron mb-3 text-4xl font-bold text-white drop-shadow-2xl md:text-5xl"
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
                  className="mb-4 flex flex-col items-center gap-4 md:flex-row"
                >
                  <div className="flex items-center gap-2 text-blue-300">
                    <UserIcon className="h-5 w-5" />
                    <span className="font-rajdhani text-lg font-medium">
                      @{player.username}
                    </span>
                  </div>
                  {player.location && (
                    <div className="flex items-center gap-2 text-blue-300">
                      <MapPinIcon className="h-5 w-5" />
                      <span className="font-rajdhani text-lg">
                        {player.location}
                      </span>
                    </div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-col items-center gap-3 md:flex-row"
                >
                  {player?.main_game?.name && (
                    <Badge className="font-orbitron border border-blue-500/30 bg-gradient-to-r from-blue-600/90 to-purple-600/90 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-sm">
                      {player.main_game.name}
                    </Badge>
                  )}
                  {player?.class_year && (
                    <Badge
                      variant="outline"
                      className="font-orbitron border-blue-400/60 bg-blue-400/10 px-4 py-2 text-sm text-blue-300 shadow-lg backdrop-blur-sm"
                    >
                      Class of {player.class_year}
                    </Badge>
                  )}
                  {(player?.school_ref?.name ?? player?.school) && (
                    <Badge
                      variant="outline"
                      className="font-rajdhani border-cyan-400/60 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 shadow-lg backdrop-blur-sm"
                    >
                      {player.school_ref?.name ?? player.school}
                    </Badge>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col gap-4 lg:ml-auto"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleShareProfile}
                  disabled={copyStatus !== "idle"}
                  className={`font-orbitron border shadow-lg backdrop-blur-sm transition-all duration-150 ${
                    copyStatus === "copied"
                      ? "border-green-500/30 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : "border-blue-500/30 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  } text-white`}
                >
                  <motion.div
                    key={copyStatus}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.1 }}
                    className="mr-2 h-4 w-4"
                  >
                    {copyStatus === "copying" && (
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                    )}
                    {copyStatus === "copied" && (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    {copyStatus === "idle" && (
                      <Share2Icon className="h-4 w-4" />
                    )}
                  </motion.div>
                  Share Profile
                </Button>
                {canMessage && (
                  <MessagePlayerDialog
                    playerId={player.id}
                    playerName={`${player.first_name} ${player.last_name}`}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content Container */}
      <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* Player Details Card */}
        <motion.div className="relative" variants={itemVariants}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 blur-xl" />
          <Card className="relative border-blue-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-orbitron flex items-center gap-3 text-2xl text-white">
                <div className="rounded-lg bg-blue-500/20 p-2">
                  <UserIcon className="h-6 w-6 text-blue-400" />
                </div>
                Player Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Player Details */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-blue-500/20 p-2">
                      <Zap className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="font-orbitron text-xl font-semibold text-white">
                      Player Info
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-rajdhani text-gray-400">
                          Class:
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="border-blue-600/30 bg-blue-600/20 text-blue-400"
                      >
                        {player.class_year ?? "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-rajdhani text-gray-400">
                          School:
                        </span>
                      </div>
                      <span className="max-w-32 truncate text-right text-sm text-gray-300">
                        {player?.school_ref?.name ?? player?.school ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <GamepadIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-rajdhani text-gray-400">
                          Main Game:
                        </span>
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {player?.main_game?.name ?? "N/A"}
                      </Badge>
                    </div>
                    {player?.game_profiles?.length > 0 &&
                      player.game_profiles[0]?.role && (
                        <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3 backdrop-blur-sm">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="font-rajdhani text-gray-400">
                              Role:
                            </span>
                          </div>
                          <span className="font-rajdhani font-medium text-gray-300">
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
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-purple-500/20 p-2">
                      <TrophyIcon className="h-5 w-5 text-purple-400" />
                    </div>
                    <h3 className="font-orbitron text-xl font-semibold text-white">
                      Performance
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* EVAL Score */}
                    {player.game_profiles.length > 0 &&
                      player.game_profiles[0]?.combine_score && (
                        <motion.div
                          className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/20 via-purple-500/20 to-pink-600/20 p-6 shadow-xl backdrop-blur-sm"
                          variants={statsCardVariants}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-rajdhani text-sm font-medium text-purple-300">
                                EVAL Score
                              </p>
                              <p className="font-orbitron text-3xl font-bold text-white">
                                {Number(
                                  player.game_profiles[0]?.combine_score,
                                ).toFixed(1)}
                              </p>
                            </div>
                            <div className="rounded-full bg-purple-500/20 p-3">
                              <StarIcon className="h-8 w-8 text-purple-300" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                    {/* League Score */}
                    {player.game_profiles.length > 0 &&
                      player.game_profiles[0]?.league_score && (
                        <motion.div
                          className="rounded-xl border border-blue-500/30 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-cyan-600/20 p-6 shadow-xl backdrop-blur-sm"
                          variants={statsCardVariants}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-rajdhani text-sm font-medium text-blue-300">
                                League Score
                              </p>
                              <p className="font-orbitron text-3xl font-bold text-white">
                                {Number(
                                  player.game_profiles[0]?.league_score,
                                ).toFixed(1)}
                              </p>
                            </div>
                            <div className="rounded-full bg-blue-500/20 p-3">
                              <AwardIcon className="h-8 w-8 text-blue-300" />
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

        {/* Enhanced Bio Section */}
        {player.bio && (
          <motion.div className="relative" variants={itemVariants}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 blur-xl" />
            <Card className="relative border-blue-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-orbitron flex items-center gap-3 text-2xl text-white">
                  <div className="rounded-lg bg-blue-500/20 p-2">
                    <UserIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  About
                </CardTitle>
              </CardHeader>
              <CardContent>
                <motion.p
                  className="font-rajdhani text-lg leading-relaxed text-gray-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {player.bio}
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Academic & Recruiting Information */}
        {recruitingInfo &&
          (recruitingInfo.academic_bio ??
            recruitingInfo.extra_curriculars ??
            recruitingInfo.intended_major ??
            recruitingInfo.gpa ??
            recruitingInfo.graduation_date) && (
            <motion.div className="relative" variants={itemVariants}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-600/5 via-blue-600/5 to-purple-600/5 blur-xl" />
              <Card className="relative border-green-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-3 text-2xl text-white">
                    <div className="rounded-lg bg-green-500/20 p-2">
                      <BookOpenIcon className="h-6 w-6 text-green-400" />
                    </div>
                    Academic & Recruiting Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Academic Information */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <h3 className="font-orbitron mb-6 flex items-center gap-2 text-xl font-semibold text-white">
                        <AwardIcon className="h-5 w-5 text-green-400" />
                        Academic Information
                      </h3>
                      <div className="space-y-4">
                        {recruitingInfo.intended_major && (
                          <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                            <span className="font-rajdhani text-sm font-medium text-gray-400">
                              Intended Major:
                            </span>
                            <p className="font-rajdhani mt-1 text-lg text-gray-300">
                              {recruitingInfo.intended_major}
                            </p>
                          </div>
                        )}
                        {recruitingInfo.graduation_date && (
                          <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                            <span className="font-rajdhani text-sm font-medium text-gray-400">
                              Expected Graduation:
                            </span>
                            <p className="font-rajdhani mt-1 text-lg text-gray-300">
                              {recruitingInfo.graduation_date}
                            </p>
                          </div>
                        )}
                        {recruitingInfo.gpa && (
                          <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                            <span className="font-rajdhani text-sm font-medium text-gray-400">
                              GPA:
                            </span>
                            <p className="font-rajdhani mt-1 text-lg font-bold text-gray-300">
                              {Number(recruitingInfo.gpa).toFixed(2)}
                            </p>
                          </div>
                        )}
                        {recruitingInfo.academic_bio && (
                          <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                            <span className="font-rajdhani text-sm font-medium text-gray-400">
                              Academic Achievements:
                            </span>
                            <p className="font-rajdhani mt-2 leading-relaxed text-gray-300">
                              {recruitingInfo.academic_bio}
                            </p>
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
                        <h3 className="font-orbitron mb-6 flex items-center gap-2 text-xl font-semibold text-white">
                          <Users className="h-5 w-5 text-green-400" />
                          Extracurricular Activities
                        </h3>
                        <div className="rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-lg backdrop-blur-sm">
                          <p className="font-rajdhani text-lg leading-relaxed text-gray-300">
                            {recruitingInfo.extra_curriculars}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        {/* Enhanced Connections Section */}
        {(player.platform_connections.length > 0 ||
          player.social_connections.length > 0) && (
          <motion.div className="relative" variants={itemVariants}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-600/5 via-blue-600/5 to-purple-600/5 blur-xl" />
            <Card className="relative border-cyan-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-orbitron flex items-center gap-3 text-2xl text-white">
                  <div className="rounded-lg bg-cyan-500/20 p-2">
                    <MessageCircleIcon className="h-6 w-6 text-cyan-400" />
                  </div>
                  Connected Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  {/* Platform Connections */}
                  {player.platform_connections.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <h3 className="font-orbitron mb-6 flex items-center gap-2 text-xl font-semibold text-white">
                        <GamepadIcon className="h-5 w-5 text-cyan-400" />
                        Gaming Platforms
                      </h3>
                      <div className="space-y-4">
                        {player.platform_connections.map(
                          (connection, index) => (
                            <motion.div
                              key={connection.platform}
                              className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-gradient-to-r from-gray-800/60 to-gray-900/60 p-4 shadow-lg backdrop-blur-sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: 0.4 + index * 0.1,
                                duration: 0.4,
                              }}
                              whileHover={{ scale: 1.02, y: -2 }}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full ${getPlatformColor(connection.platform)} shadow-lg`}
                                >
                                  {getPlatformIcon(connection.platform)}
                                </div>
                                <div>
                                  <p className="font-rajdhani text-lg font-medium text-white">
                                    {getPlatformDisplayName(
                                      connection.platform,
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-400">
                                    {connection.username}
                                  </p>
                                </div>
                              </div>
                              <ExternalLinkIcon className="h-5 w-5 text-cyan-400" />
                            </motion.div>
                          ),
                        )}
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
                      <h3 className="font-orbitron mb-6 flex items-center gap-2 text-xl font-semibold text-white">
                        <MessageCircleIcon className="h-5 w-5 text-cyan-400" />
                        Social Media
                      </h3>
                      <div className="space-y-4">
                        {player.social_connections.map((connection, index) => (
                          <motion.div
                            key={connection.platform}
                            className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-gradient-to-r from-gray-800/60 to-gray-900/60 p-4 shadow-lg backdrop-blur-sm"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.5 + index * 0.1,
                              duration: 0.4,
                            }}
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full ${getSocialColor(connection.platform)} shadow-lg`}
                              >
                                {getSocialIcon(connection.platform)}
                              </div>
                              <div>
                                <p className="font-rajdhani text-lg font-medium text-white">
                                  {getSocialDisplayName(connection.platform)}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {connection.username}
                                </p>
                              </div>
                            </div>
                            <ExternalLinkIcon className="h-5 w-5 text-cyan-400" />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Game Statistics */}
        <motion.div className="relative" variants={itemVariants}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-600/5 via-red-600/5 to-pink-600/5 blur-xl" />
          <Card className="relative border-orange-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-0 px-0 shadow-xl backdrop-blur-sm">
            <CardContent className="relative px-0">
              <GameAnalyticsPanel
                playerId={player.id}
                viewMode="other"
                targetPlayerProfile={player}
                showConnectionPrompts={false}
                publicHeader={true}
                showInfoPanel={false}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
