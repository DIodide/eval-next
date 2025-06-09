"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Trophy, ChevronRight, MapPin, Lock, ChevronLeft } from "lucide-react"
import Link from "next/link"
import type { Combine } from "../types"

// Mock data for combine rankings
const combinesData = {
  VALORANT: {
    invitational: {
      id: 1,
      title: "EVAL INVITATIONAL",
      year: "2025",
      game: "VALORANT",
      date: "March 15, 2025",
      location: "Los Angeles, CA",
      spots: "20",
      prize: "$10,000",
      status: "invitation-only",
      qualified: false,
      description: "The most prestigious VALORANT combine event of the year",
      requirements: "Top 100 ranked players only",
      gameIcon: "🎯",
      gameColor: "from-red-500 to-red-700",
      bgColor: "bg-gradient-to-br from-red-900/80 to-red-800/80",
      image: "/placeholder.svg?height=200&width=300",
    },
    combines: [
      {
        id: 2,
        title: "EVAL COMBINE",
        year: "2025",
        game: "VALORANT",
        date: "April 22, 2025",
        location: "Online",
        spots: "12/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "Online VALORANT combine event",
        requirements: "All ranks welcome",
        gameIcon: "🎯",
        gameColor: "from-red-500 to-red-700",
        bgColor: "bg-gradient-to-br from-red-900/60 to-red-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 3,
        title: "EVAL COMBINE",
        year: "2025",
        game: "VALORANT",
        date: "May 10, 2025",
        location: "Chicago, IL",
        spots: "8/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "In-person VALORANT combine event in Chicago",
        requirements: "All ranks welcome",
        gameIcon: "🎯",
        gameColor: "from-red-500 to-red-700",
        bgColor: "bg-gradient-to-br from-red-900/60 to-red-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
  },
  "Overwatch 2": {
    invitational: {
      id: 4,
      title: "EVAL INVITATIONAL",
      year: "2025",
      game: "Overwatch 2",
      date: "March 8, 2025",
      location: "New York, NY",
      spots: "20",
      prize: "$10,000",
      status: "invitation-only",
      qualified: false,
      description: "The most prestigious Overwatch 2 combine event of the year",
      requirements: "Grandmaster rank or higher",
      gameIcon: "⚡",
      gameColor: "from-orange-500 to-orange-700",
      bgColor: "bg-gradient-to-br from-orange-900/80 to-orange-800/80",
      image: "/placeholder.svg?height=200&width=300",
    },
    combines: [
      {
        id: 5,
        title: "EVAL COMBINE",
        year: "2025",
        game: "Overwatch 2",
        date: "April 5, 2025",
        location: "Online",
        spots: "15/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "Online Overwatch 2 combine event",
        requirements: "All ranks welcome",
        gameIcon: "⚡",
        gameColor: "from-orange-500 to-orange-700",
        bgColor: "bg-gradient-to-br from-orange-900/60 to-orange-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 6,
        title: "EVAL COMBINE",
        year: "2025",
        game: "Overwatch 2",
        date: "June 15, 2025",
        location: "Seattle, WA",
        spots: "10/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "In-person Overwatch 2 combine event in Seattle",
        requirements: "All ranks welcome",
        gameIcon: "⚡",
        gameColor: "from-orange-500 to-orange-700",
        bgColor: "bg-gradient-to-br from-orange-900/60 to-orange-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
  },
  "Rocket League": {
    invitational: {
      id: 7,
      title: "EVAL INVITATIONAL",
      year: "2025",
      game: "Rocket League",
      date: "March 29, 2025",
      location: "Austin, TX",
      spots: "20",
      prize: "$10,000",
      status: "invitation-only",
      qualified: false,
      description: "The most prestigious Rocket League combine event of the year",
      requirements: "Champion rank teams only",
      gameIcon: "🚀",
      gameColor: "from-blue-500 to-blue-700",
      bgColor: "bg-gradient-to-br from-blue-900/80 to-blue-800/80",
      image: "/placeholder.svg?height=200&width=300",
    },
    combines: [
      {
        id: 8,
        title: "EVAL COMBINE",
        year: "2025",
        game: "Rocket League",
        date: "May 17, 2025",
        location: "Online",
        spots: "18/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "Online Rocket League combine event",
        requirements: "All ranks welcome",
        gameIcon: "🚀",
        gameColor: "from-blue-500 to-blue-700",
        bgColor: "bg-gradient-to-br from-blue-900/60 to-blue-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 9,
        title: "EVAL COMBINE",
        year: "2025",
        game: "Rocket League",
        date: "July 8, 2025",
        location: "Miami, FL",
        spots: "5/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "In-person Rocket League combine event in Miami",
        requirements: "All ranks welcome",
        gameIcon: "🚀",
        gameColor: "from-blue-500 to-blue-700",
        bgColor: "bg-gradient-to-br from-blue-900/60 to-blue-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
  },
  "League of Legends": {
    invitational: {
      id: 10,
      title: "EVAL INVITATIONAL",
      year: "2025",
      game: "League of Legends",
      date: "April 12, 2025",
      location: "Las Vegas, NV",
      spots: "20",
      prize: "$10,000",
      status: "invitation-only",
      qualified: false,
      description: "The most prestigious League of Legends combine event of the year",
      requirements: "Master tier teams only",
      gameIcon: "⚔️",
      gameColor: "from-purple-500 to-purple-700",
      bgColor: "bg-gradient-to-br from-purple-900/80 to-purple-800/80",
      image: "/placeholder.svg?height=200&width=300",
    },
    combines: [
      {
        id: 11,
        title: "EVAL COMBINE",
        year: "2025",
        game: "League of Legends",
        date: "June 7, 2025",
        location: "Online",
        spots: "14/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "Online League of Legends combine event",
        requirements: "All ranks welcome",
        gameIcon: "⚔️",
        gameColor: "from-purple-500 to-purple-700",
        bgColor: "bg-gradient-to-br from-purple-900/60 to-purple-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: 12,
        title: "EVAL COMBINE",
        year: "2025",
        game: "League of Legends",
        date: "August 22, 2025",
        location: "Boston, MA",
        spots: "9/20",
        prize: "$5,000",
        status: "open",
        qualified: false,
        description: "In-person League of Legends combine event in Boston",
        requirements: "All ranks welcome",
        gameIcon: "⚔️",
        gameColor: "from-purple-500 to-purple-700",
        bgColor: "bg-gradient-to-br from-purple-900/60 to-purple-800/60",
        image: "/placeholder.svg?height=200&width=300",
      },
    ],
  },
}

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "League of Legends": "from-purple-500 to-purple-700",
}

function InvitationalCard({ combine }: { combine: Combine }) {
  return (
    <Link href={`/tryouts/combines/${combine.id}`} className="block h-full">
      <Card
        className={`border-gray-700 hover:border-cyan-400/50 transition-all duration-300 h-full group ${combine.bgColor}`}
      >
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Badge variant="outline" className="border-white/30 text-white font-rajdhani text-xs">
                {combine.date}
              </Badge>
            </div>
          </div>

          <h3 className="font-orbitron font-bold text-white text-lg tracking-wide mb-4">{combine.title}</h3>

          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-200 font-rajdhani">{combine.location}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-200 font-rajdhani">{combine.game}</span>
            </div>
          </div>

          {/* Lock icon and status at bottom */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              <Badge className="bg-yellow-400 text-black font-orbitron text-xs">INVITATIONAL</Badge>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-200 font-rajdhani">{combine.spots} spots</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CombineCard({ combine }: { combine: Combine }) {
  return (
    <Link href={`/tryouts/combines/${combine.id}`} className="block h-full">
      <Card
        className={`border-gray-700 hover:border-cyan-400/50 transition-all duration-300 h-full group ${combine.bgColor}`}
      >
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Badge className="bg-cyan-400 text-black font-orbitron text-xs">COMBINE</Badge>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="border-white/30 text-white font-rajdhani text-xs">
                {combine.date}
              </Badge>
            </div>
          </div>

          <h3 className="font-orbitron font-bold text-white text-lg tracking-wide mb-4">
            {combine.title} <span className="text-cyan-400">{combine.year}</span>
          </h3>

          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-200 font-rajdhani">{combine.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide">
              VIEW DETAILS
            </Button>
            <div className="text-right">
              <span className="text-xs text-gray-200 font-rajdhani">{combine.spots}/20 spots</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function GameCarousel({ game, gameData }: { game: string; gameData: { invitational: Combine; combines: Combine[] }  }) {
  const gameColor = gameColors[game as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const [currentIndex, setCurrentIndex] = useState(0)
  // const itemsPerView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1
  const itemsPerView = 3
  const maxIndex = Math.max(0, gameData.combines.length + 1 - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  // Combine invitational and regular combines into one array for the carousel
  const allCombines = [gameData.invitational, ...gameData.combines]

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center text-2xl`}
          >
            {game === "VALORANT" && "🎯"}
            {game === "Overwatch 2" && "⚡"}
            {game === "Rocket League" && "🚀"}
            {game === "League of Legends" && "⚔️"}
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide">{game}</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex space-x-4 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {allCombines.map((combine, index) => (
            <div
              key={combine.id}
              className="min-w-[calc(100%/3-1rem)] md:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)] h-64"
            >
              {index === 0 ? <InvitationalCard combine={combine} /> : <CombineCard combine={combine} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function EvalCombinesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani">
            <span>Tryouts</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400">EVAL Combines</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            EVAL COMBINES
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-4xl mx-auto">
            Elite invitation-only tournaments featuring the best players in competitive esports. Earn your spot through
            exceptional performance and rankings.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mb-8">
          <Input
            type="text"
            placeholder="Search combines, games, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white pl-12 pr-4 py-4 rounded-full text-lg font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-center mb-12">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-orbitron text-sm">Filters:</span>
          </div>

          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white font-rajdhani">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white font-rajdhani">
                All Games
              </SelectItem>
              {Object.keys(combinesData).map((game) => (
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
              <SelectItem value="online" className="text-white font-rajdhani">
                Online
              </SelectItem>
              <SelectItem value="west" className="text-white font-rajdhani">
                West Coast
              </SelectItem>
              <SelectItem value="east" className="text-white font-rajdhani">
                East Coast
              </SelectItem>
              <SelectItem value="central" className="text-white font-rajdhani">
                Central
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setSelectedGame("all")
              setSelectedRegion("all")
            }}
            className="border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 font-rajdhani"
          >
            Clear Filters
          </Button>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-6 max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h3 className="font-orbitron text-xl text-white">EVAL Invitationals</h3>
          </div>
          <p className="text-gray-300 font-rajdhani text-center">
            EVAL Invitationals are exclusive tournaments for top-performing players. Maintain high rankings and
            exceptional performance to receive invitations. Regular EVAL Combines are open to all players.
          </p>
        </div>

        {/* Game Carousels */}
        <div className="space-y-16">
          {Object.entries(combinesData)
            .filter(([game]) => selectedGame === "all" || game === selectedGame)
            .map(([game, gameData]) => (
              <GameCarousel key={game} game={game} gameData={gameData} />
            ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20 py-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
          <h2 className="font-orbitron text-3xl font-bold text-white mb-4 tracking-wide">
            Ready to Compete at the Highest Level?
          </h2>
          <p className="text-gray-300 mb-8 font-rajdhani text-lg max-w-3xl mx-auto">
            Start building your profile today. Showcase your skills, climb the rankings, and earn your invitation to
            EVAL&apos;s most prestigious tournaments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-8 py-3 tracking-wider">
              CREATE PROFILE
            </Button>
            <Button
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-orbitron font-bold px-8 py-3 tracking-wider"
            >
              VIEW RANKINGS
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
