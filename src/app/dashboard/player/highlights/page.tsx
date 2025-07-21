"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VideoIcon,
  UploadIcon,
  PlayIcon,
  EyeIcon,
  StarIcon,
  TrophyIcon,
  ClockIcon,
  UsersIcon,
  TrendingUpIcon,
  FileVideoIcon,
  BookOpenIcon,
  ZapIcon,
  PlusIcon,
  ImageIcon,
  TagIcon,
  BarChartIcon,
  ExternalLinkIcon,
  InfoIcon,
  CheckCircleIcon,
} from "lucide-react";
import Link from "next/link";

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

// Animated number component
const AnimatedNumber = ({
  value,
  duration = 2,
}: {
  value: number;
  duration?: number;
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationId: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(value * easeOut));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export default function HighlightsPage() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const [highlightTitle, setHighlightTitle] = useState("");
  const [highlightDescription, setHighlightDescription] = useState("");

  // Mock data for demonstration
  const highlightStats = {
    totalHighlights: 0,
    totalViews: 0,
    recruiterViews: 0,
    avgRating: 0,
    topGame: "Not set",
  };

  const supportedGames = [
    { id: "valorant", name: "VALORANT", color: "text-red-400" },
    { id: "rocket-league", name: "Rocket League", color: "text-orange-400" },
    { id: "overwatch", name: "Overwatch 2", color: "text-orange-400" },
    {
      id: "smash",
      name: "Super Smash Bros Ultimate",
      color: "text-yellow-400",
    },
    { id: "csgo", name: "CS2", color: "text-blue-400" },
  ];

  const highlightTips = [
    {
      icon: ClockIcon,
      title: "Optimal Length",
      description:
        "Keep clips between 30 seconds to 2 minutes for maximum engagement",
      color: "text-blue-400",
    },
    {
      icon: TrophyIcon,
      title: "Game-Changing Moments",
      description: "Showcase clutch plays, team wipes, and strategic victories",
      color: "text-yellow-400",
    },
    {
      icon: UsersIcon,
      title: "Team Coordination",
      description:
        "Include moments that show leadership and communication skills",
      color: "text-green-400",
    },
    {
      icon: TagIcon,
      title: "Descriptive Titles",
      description:
        "Use clear, engaging titles that describe the highlight's context",
      color: "text-purple-400",
    },
    {
      icon: StarIcon,
      title: "Quality Over Quantity",
      description:
        "Upload your absolute best plays rather than many average clips",
      color: "text-pink-400",
    },
    {
      icon: ImageIcon,
      title: "Thumbnail Selection",
      description: "Choose compelling thumbnails that capture the action",
      color: "text-cyan-400",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="container mx-auto space-y-8 p-6">
        {/* Enhanced Page Header */}
        <motion.div className="relative" variants={itemVariants}>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-xl" />
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative border-blue-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-2xl backdrop-blur-sm">
              <div className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/20 p-3">
                        <VideoIcon className="h-8 w-8 text-blue-400" />
                      </div>
                      <div>
                        <h1 className="font-orbitron bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
                          My Highlights
                        </h1>
                        <p className="font-rajdhani text-lg text-gray-400">
                          Showcase your best gaming moments to college
                          recruiters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className="font-rajdhani border-blue-400/30 px-3 py-1 text-blue-300"
                      >
                        <FileVideoIcon className="mr-1 h-3 w-3" />
                        {highlightStats.totalHighlights} highlights
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-rajdhani border-purple-400/30 px-3 py-1 text-purple-300"
                      >
                        <EyeIcon className="mr-1 h-3 w-3" />
                        {highlightStats.totalViews} total views
                      </Badge>
                    </div>
                  </div>
                  <Dialog
                    open={uploadDialogOpen}
                    onOpenChange={setUploadDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="font-orbitron bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl">
                        <UploadIcon className="mr-2 h-5 w-5" />
                        Upload Highlight
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl border-gray-700/50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 text-white backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="font-orbitron flex items-center gap-2 text-2xl text-blue-300">
                          <VideoIcon className="h-6 w-6" />
                          Upload New Highlight
                        </DialogTitle>
                        <DialogDescription className="font-rajdhani text-lg text-gray-400">
                          Share your best gaming moments with college recruiters
                          and scouts
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* File Upload Area */}
                        <div className="group cursor-pointer rounded-xl border-2 border-dashed border-gray-600 p-8 text-center transition-colors hover:border-blue-500/50">
                          <div className="space-y-4">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 transition-colors group-hover:bg-blue-500/30">
                              <UploadIcon className="h-8 w-8 text-blue-400" />
                            </div>
                            <div>
                              <h3 className="font-orbitron text-lg font-semibold text-white">
                                Drop your video here
                              </h3>
                              <p className="font-rajdhani text-gray-400">
                                or click to browse files
                              </p>
                            </div>
                            <div className="flex justify-center">
                              <Badge
                                variant="outline"
                                className="font-rajdhani border-gray-600 text-gray-300"
                              >
                                MP4, MOV, AVI up to 500MB
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Video Details */}
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="title"
                              className="font-rajdhani text-sm font-semibold text-white"
                            >
                              Title *
                            </Label>
                            <Input
                              id="title"
                              value={highlightTitle}
                              onChange={(e) =>
                                setHighlightTitle(e.target.value)
                              }
                              className="font-rajdhani mt-1 border-gray-600 bg-gray-800/50 text-white"
                              placeholder="Epic 1v5 Clutch - VALORANT Ranked"
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor="game"
                              className="font-rajdhani text-sm font-semibold text-white"
                            >
                              Game *
                            </Label>
                            <Select
                              value={selectedGame}
                              onValueChange={setSelectedGame}
                            >
                              <SelectTrigger className="font-rajdhani mt-1 border-gray-600 bg-gray-800/50 text-white">
                                <SelectValue placeholder="Select game" />
                              </SelectTrigger>
                              <SelectContent className="border-gray-700 bg-gray-800">
                                {supportedGames.map((game) => (
                                  <SelectItem
                                    key={game.id}
                                    value={game.id}
                                    className="font-rajdhani text-white"
                                  >
                                    {game.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label
                              htmlFor="description"
                              className="font-rajdhani text-sm font-semibold text-white"
                            >
                              Description
                            </Label>
                            <Input
                              id="description"
                              value={highlightDescription}
                              onChange={(e) =>
                                setHighlightDescription(e.target.value)
                              }
                              className="font-rajdhani mt-1 border-gray-600 bg-gray-800/50 text-white"
                              placeholder="Describe the context and what makes this highlight special..."
                            />
                          </div>
                        </div>

                        {/* Upload Button */}
                        <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setUploadDialogOpen(false)}
                            className="font-rajdhani border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                          <Button
                            disabled={!highlightTitle || !selectedGame}
                            className="font-rajdhani bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                          >
                            <UploadIcon className="mr-2 h-4 w-4" />
                            Upload Highlight
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={itemVariants}
        >
          {/* Total Highlights */}
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/5 p-6 shadow-xl transition-all duration-300 hover:border-blue-400/40">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-blue-500/20 p-3">
                  <FileVideoIcon className="h-6 w-6 text-blue-400" />
                </div>
                <TrendingUpIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-rajdhani text-lg font-semibold text-white">
                  Total Highlights
                </h3>
                <p className="font-orbitron text-3xl font-bold text-blue-400">
                  <AnimatedNumber
                    value={highlightStats.totalHighlights}
                    duration={1.5}
                  />
                </p>
                <p className="text-sm text-gray-400">
                  Ready to upload your first?
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Total Views */}
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/5 p-6 shadow-xl transition-all duration-300 hover:border-green-400/40">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-green-500/20 p-3">
                  <EyeIcon className="h-6 w-6 text-green-400" />
                </div>
                <BarChartIcon className="h-4 w-4 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-rajdhani text-lg font-semibold text-white">
                  Total Views
                </h3>
                <p className="font-orbitron text-3xl font-bold text-green-400">
                  <AnimatedNumber
                    value={highlightStats.totalViews}
                    duration={1.7}
                  />
                </p>
                <p className="text-sm text-gray-400">Across all highlights</p>
              </div>
            </Card>
          </motion.div>

          {/* Recruiter Views */}
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-600/5 p-6 shadow-xl transition-all duration-300 hover:border-purple-400/40">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-purple-500/20 p-3">
                  <UsersIcon className="h-6 w-6 text-purple-400" />
                </div>
                <TrophyIcon className="h-4 w-4 text-purple-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-rajdhani text-lg font-semibold text-white">
                  Recruiter Views
                </h3>
                <p className="font-orbitron text-3xl font-bold text-purple-400">
                  <AnimatedNumber
                    value={highlightStats.recruiterViews}
                    duration={1.9}
                  />
                </p>
                <p className="text-sm text-gray-400">From college scouts</p>
              </div>
            </Card>
          </motion.div>

          {/* Average Rating */}
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 p-6 shadow-xl transition-all duration-300 hover:border-yellow-400/40">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-xl bg-yellow-500/20 p-3">
                  <StarIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <ZapIcon className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="space-y-2">
                <h3 className="font-rajdhani text-lg font-semibold text-white">
                  Avg Rating
                </h3>
                <p className="font-orbitron text-3xl font-bold text-yellow-400">
                  {highlightStats.avgRating || "—"}
                </p>
                <p className="text-sm text-gray-400">Out of 5 stars</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Upload Section & Tips */}
        <motion.div
          className="grid gap-8 lg:grid-cols-3"
          variants={itemVariants}
        >
          {/* Upload Card */}
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm lg:col-span-1">
              <div className="space-y-6 p-8 text-center">
                <div className="relative">
                  <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <UploadIcon className="h-10 w-10 text-blue-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                    <PlusIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-orbitron text-xl font-bold text-white">
                    Upload Your First Highlight
                  </h3>
                  <p className="font-rajdhani text-gray-400">
                    Share your best plays with college recruiters and build your
                    esports portfolio
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={() => setUploadDialogOpen(true)}
                    className="font-rajdhani w-full bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                  >
                    <FileVideoIcon className="mr-2 h-4 w-4" />
                    Choose Files
                  </Button>
                  <div className="font-rajdhani flex items-center justify-center gap-2 text-xs text-gray-400">
                    <InfoIcon className="h-3 w-3" />
                    <span>MP4, MOV, AVI • Max 500MB</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Enhanced Tips Card */}
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm lg:col-span-2">
              <div className="p-8">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-500/20 p-2">
                    <BookOpenIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h3 className="font-orbitron text-xl font-bold text-white">
                    Highlight Best Practices
                  </h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {highlightTips.map((tip, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-4 transition-colors hover:border-gray-600/50"
                    >
                      <div
                        className={`flex-shrink-0 rounded-lg bg-gray-700/50 p-2`}
                      >
                        <tip.icon className={`h-4 w-4 ${tip.color}`} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-rajdhani text-sm font-semibold text-white">
                          {tip.title}
                        </h4>
                        <p className="font-rajdhani text-xs leading-relaxed text-gray-400">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Empty State */}
        <motion.div variants={itemVariants}>
          <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
            <div className="space-y-8 p-12 text-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl" />
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-gray-700/50 bg-gradient-to-br from-gray-700/50 to-gray-800/50">
                  <PlayIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>

              <div className="mx-auto max-w-2xl space-y-4">
                <h3 className="font-orbitron text-2xl font-bold text-white">
                  No Highlights Yet
                </h3>
                <p className="font-rajdhani text-lg leading-relaxed text-gray-400">
                  Start building your highlight reel by uploading your best
                  gaming moments. College recruiters want to see your skills in
                  action, your decision-making under pressure, and your ability
                  to perform in clutch situations.
                </p>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  onClick={() => setUploadDialogOpen(true)}
                  className="font-rajdhani bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
                >
                  <VideoIcon className="mr-2 h-5 w-5" />
                  Upload Your First Video
                </Button>
                <Link href="/recruiting">
                  <Button
                    variant="outline"
                    className="font-rajdhani border-gray-600 px-8 py-3 text-gray-300 hover:bg-gray-700/50"
                  >
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    Learn About Recruiting
                  </Button>
                </Link>
              </div>

              {/* Success Metrics Preview */}
              <div className="grid grid-cols-1 gap-6 border-t border-gray-700/50 pt-8 md:grid-cols-3">
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="font-orbitron font-bold text-white">
                      Visibility
                    </span>
                  </div>
                  <p className="font-rajdhani text-sm text-gray-400">
                    Get noticed by college scouts actively looking for talent
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <TrophyIcon className="h-5 w-5 text-yellow-400" />
                    <span className="font-orbitron font-bold text-white">
                      Showcase Skills
                    </span>
                  </div>
                  <p className="font-rajdhani text-sm text-gray-400">
                    Demonstrate your gameplay mechanics and game sense
                  </p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <UsersIcon className="h-5 w-5 text-blue-400" />
                    <span className="font-orbitron font-bold text-white">
                      Build Network
                    </span>
                  </div>
                  <p className="font-rajdhani text-sm text-gray-400">
                    Connect with coaches and fellow competitive players
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
