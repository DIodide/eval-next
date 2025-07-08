"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
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
  CalendarIcon,
  BarChartIcon,
  ExternalLinkIcon,
  InfoIcon,
  CheckCircleIcon,
  AlertTriangleIcon
} from "lucide-react";
import Link from "next/link";

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
    topGame: "Not set"
  };

  const supportedGames = [
    { id: "valorant", name: "VALORANT", color: "text-red-400" },
    { id: "rocket-league", name: "Rocket League", color: "text-orange-400" },
    { id: "overwatch", name: "Overwatch 2", color: "text-orange-400" },
    { id: "smash", name: "Super Smash Bros Ultimate", color: "text-yellow-400" },
    { id: "csgo", name: "CS2", color: "text-blue-400" }
  ];

  const highlightTips = [
    {
      icon: ClockIcon,
      title: "Optimal Length",
      description: "Keep clips between 30 seconds to 2 minutes for maximum engagement",
      color: "text-blue-400"
    },
    {
      icon: TrophyIcon,
      title: "Game-Changing Moments",
      description: "Showcase clutch plays, team wipes, and strategic victories",
      color: "text-yellow-400"
    },
    {
      icon: UsersIcon,
      title: "Team Coordination",
      description: "Include moments that show leadership and communication skills",
      color: "text-green-400"
    },
    {
      icon: TagIcon,
      title: "Descriptive Titles",
      description: "Use clear, engaging titles that describe the highlight's context",
      color: "text-purple-400"
    },
    {
      icon: StarIcon,
      title: "Quality Over Quantity",
      description: "Upload your absolute best plays rather than many average clips",
      color: "text-pink-400"
    },
    {
      icon: ImageIcon,
      title: "Thumbnail Selection",
      description: "Choose compelling thumbnails that capture the action",
      color: "text-cyan-400"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl" />
          <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 backdrop-blur-sm shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <VideoIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        My Highlights
                      </h1>
                      <p className="text-gray-400 text-lg font-rajdhani">
                        Showcase your best gaming moments to college recruiters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-blue-400/30 text-blue-300 px-3 py-1 font-rajdhani">
                      <FileVideoIcon className="h-3 w-3 mr-1" />
                      {highlightStats.totalHighlights} highlights
                    </Badge>
                    <Badge variant="outline" className="border-purple-400/30 text-purple-300 px-3 py-1 font-rajdhani">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {highlightStats.totalViews} total views
                    </Badge>
                  </div>
                </div>
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-orbitron font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3">
                      <UploadIcon className="h-5 w-5 mr-2" />
                      Upload Highlight
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-700/50 text-white max-w-2xl backdrop-blur-sm">
                    <DialogHeader>
                      <DialogTitle className="font-orbitron text-2xl text-blue-300 flex items-center gap-2">
                        <VideoIcon className="h-6 w-6" />
                        Upload New Highlight
                      </DialogTitle>
                      <DialogDescription className="text-gray-400 font-rajdhani text-lg">
                        Share your best gaming moments with college recruiters and scouts
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      {/* File Upload Area */}
                      <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors group cursor-pointer">
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                            <UploadIcon className="w-8 h-8 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-orbitron font-semibold text-white">Drop your video here</h3>
                            <p className="text-gray-400 font-rajdhani">or click to browse files</p>
                          </div>
                          <div className="flex justify-center">
                            <Badge variant="outline" className="border-gray-600 text-gray-300 font-rajdhani">
                              MP4, MOV, AVI up to 500MB
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Video Details */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title" className="text-white font-rajdhani text-sm font-semibold">Title *</Label>
                          <Input
                            id="title"
                            value={highlightTitle}
                            onChange={(e) => setHighlightTitle(e.target.value)}
                            className="bg-gray-800/50 border-gray-600 text-white mt-1 font-rajdhani"
                            placeholder="Epic 1v5 Clutch - VALORANT Ranked"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="game" className="text-white font-rajdhani text-sm font-semibold">Game *</Label>
                          <Select value={selectedGame} onValueChange={setSelectedGame}>
                            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white mt-1 font-rajdhani">
                              <SelectValue placeholder="Select game" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {supportedGames.map((game) => (
                                <SelectItem key={game.id} value={game.id} className="text-white font-rajdhani">
                                  {game.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-white font-rajdhani text-sm font-semibold">Description</Label>
                          <Input
                            id="description"
                            value={highlightDescription}
                            onChange={(e) => setHighlightDescription(e.target.value)}
                            className="bg-gray-800/50 border-gray-600 text-white mt-1 font-rajdhani"
                            placeholder="Describe the context and what makes this highlight special..."
                          />
                        </div>
                      </div>

                      {/* Upload Button */}
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        <Button
                          variant="outline"
                          onClick={() => setUploadDialogOpen(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 font-rajdhani"
                        >
                          Cancel
                        </Button>
                        <Button
                          disabled={!highlightTitle || !selectedGame}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-rajdhani"
                        >
                          <UploadIcon className="w-4 h-4 mr-2" />
                          Upload Highlight
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Highlights */}
          <Card className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileVideoIcon className="h-6 w-6 text-blue-400" />
              </div>
              <TrendingUpIcon className="h-4 w-4 text-blue-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-rajdhani font-semibold text-white">Total Highlights</h3>
              <p className="text-3xl font-orbitron font-bold text-blue-400">{highlightStats.totalHighlights}</p>
              <p className="text-sm text-gray-400">Ready to upload your first?</p>
            </div>
          </Card>

          {/* Total Views */}
          <Card className="bg-gradient-to-br from-green-500/5 to-green-600/5 border-green-500/20 hover:border-green-400/40 transition-all duration-300 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <EyeIcon className="h-6 w-6 text-green-400" />
              </div>
              <BarChartIcon className="h-4 w-4 text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-rajdhani font-semibold text-white">Total Views</h3>
              <p className="text-3xl font-orbitron font-bold text-green-400">{highlightStats.totalViews}</p>
              <p className="text-sm text-gray-400">Across all highlights</p>
            </div>
          </Card>

          {/* Recruiter Views */}
          <Card className="bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <UsersIcon className="h-6 w-6 text-purple-400" />
              </div>
              <TrophyIcon className="h-4 w-4 text-purple-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-rajdhani font-semibold text-white">Recruiter Views</h3>
              <p className="text-3xl font-orbitron font-bold text-purple-400">{highlightStats.recruiterViews}</p>
              <p className="text-sm text-gray-400">From college scouts</p>
            </div>
          </Card>

          {/* Average Rating */}
          <Card className="bg-gradient-to-br from-yellow-500/5 to-yellow-600/5 border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <StarIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <ZapIcon className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-rajdhani font-semibold text-white">Avg Rating</h3>
              <p className="text-3xl font-orbitron font-bold text-yellow-400">{highlightStats.avgRating || "—"}</p>
              <p className="text-sm text-gray-400">Out of 5 stars</p>
            </div>
          </Card>
        </div>

        {/* Enhanced Upload Section & Tips */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upload Card */}
          <Card className="lg:col-span-1 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <div className="p-8 text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full mx-auto flex items-center justify-center mb-2">
                  <UploadIcon className="w-10 h-10 text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <PlusIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-orbitron font-bold text-white">Upload Your First Highlight</h3>
                <p className="text-gray-400 font-rajdhani">
                  Share your best plays with college recruiters and build your esports portfolio
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={() => setUploadDialogOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-rajdhani font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FileVideoIcon className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 font-rajdhani">
                  <InfoIcon className="h-3 w-3" />
                  <span>MP4, MOV, AVI • Max 500MB</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Enhanced Tips Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <BookOpenIcon className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-xl font-orbitron font-bold text-white">Highlight Best Practices</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {highlightTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                    <div className={`p-2 bg-gray-700/50 rounded-lg flex-shrink-0`}>
                      <tip.icon className={`h-4 w-4 ${tip.color}`} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-rajdhani font-semibold text-white text-sm">{tip.title}</h4>
                      <p className="text-gray-400 text-xs font-rajdhani leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Empty State */}
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
          <div className="p-12 text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-full mx-auto flex items-center justify-center border border-gray-700/50">
                <PlayIcon className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <h3 className="text-2xl font-orbitron font-bold text-white">No Highlights Yet</h3>
              <p className="text-gray-400 font-rajdhani text-lg leading-relaxed">
                Start building your highlight reel by uploading your best gaming moments. College recruiters want to see your skills in action, your decision-making under pressure, and your ability to perform in clutch situations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setUploadDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-rajdhani font-semibold shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3"
              >
                <VideoIcon className="h-5 w-5 mr-2" />
                Upload Your First Video
              </Button>
              <Link href="/recruiting">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 font-rajdhani px-8 py-3">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Learn About Recruiting
                </Button>
              </Link>
            </div>

            {/* Success Metrics Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-700/50">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                  <span className="font-orbitron font-bold text-white">Visibility</span>
                </div>
                <p className="text-sm text-gray-400 font-rajdhani">Get noticed by college scouts actively looking for talent</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <TrophyIcon className="h-5 w-5 text-yellow-400" />
                  <span className="font-orbitron font-bold text-white">Showcase Skills</span>
                </div>
                <p className="text-sm text-gray-400 font-rajdhani">Demonstrate your gameplay mechanics and game sense</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <UsersIcon className="h-5 w-5 text-blue-400" />
                  <span className="font-orbitron font-bold text-white">Build Network</span>
                </div>
                <p className="text-sm text-gray-400 font-rajdhani">Connect with coaches and fellow competitive players</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 