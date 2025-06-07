"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Lock, Calendar, Users, MapPin, Trophy, Star, ChevronRight } from "lucide-react"

interface Combine {
  id: number;
  title: string;
  year: string;
  date: string;
  location: string;
  spots: string;
  prize: string;
  status: string;
  qualified: boolean;
  description: string;
  requirements: string;
}

// Mock data for EVAL combines
const combinesData = {
  VALORANT: [
    {
      id: 1,
      title: "EVAL Invitational 2025",
      year: "2025",
      date: "March 15-17, 2025",
      location: "Los Angeles, CA",
      spots: "64 players",
      prize: "$50,000",
      status: "invitation-only",
      qualified: false,
      description: "Elite tournament featuring the top VALORANT players nationwide",
      requirements: "Top 100 ranked players only",
    },
    {
      id: 2,
      title: "EVAL Spring Championship",
      year: "2025",
      date: "April 22-24, 2025",
      location: "Online",
      spots: "128 players",
      prize: "$25,000",
      status: "invitation-only",
      qualified: false,
      description: "Spring season championship for collegiate players",
      requirements: "College team members only",
    },
    {
      id: 3,
      title: "EVAL Rising Stars",
      year: "2025",
      date: "May 10-12, 2025",
      location: "Chicago, IL",
      spots: "32 players",
      prize: "$15,000",
      status: "invitation-only",
      qualified: false,
      description: "Showcase for emerging talent under 18",
      requirements: "High school players only",
    },
  ],
  "Overwatch 2": [
    {
      id: 4,
      title: "EVAL OW2 Masters",
      year: "2025",
      date: "March 8-10, 2025",
      location: "New York, NY",
      spots: "48 players",
      prize: "$40,000",
      status: "invitation-only",
      qualified: false,
      description: "Premier Overwatch 2 tournament for top-tier players",
      requirements: "Grandmaster rank or higher",
    },
    {
      id: 5,
      title: "EVAL Collegiate Cup",
      year: "2025",
      date: "April 5-7, 2025",
      location: "Online",
      spots: "96 players",
      prize: "$20,000",
      status: "invitation-only",
      qualified: false,
      description: "College-exclusive Overwatch 2 championship",
      requirements: "Enrolled college students",
    },
  ],
  "Rocket League": [
    {
      id: 6,
      title: "EVAL RL Championship",
      year: "2025",
      date: "March 29-31, 2025",
      location: "Austin, TX",
      spots: "24 teams",
      prize: "$60,000",
      status: "invitation-only",
      qualified: false,
      description: "Elite 3v3 Rocket League tournament",
      requirements: "Champion rank teams only",
    },
    {
      id: 7,
      title: "EVAL Rookie League",
      year: "2025",
      date: "May 17-19, 2025",
      location: "Online",
      spots: "48 teams",
      prize: "$10,000",
      status: "invitation-only",
      qualified: false,
      description: "Development tournament for new players",
      requirements: "Diamond rank or below",
    },
  ],
  "League of Legends": [
    {
      id: 8,
      title: "EVAL LoL Invitational",
      year: "2025",
      date: "April 12-14, 2025",
      location: "Las Vegas, NV",
      spots: "16 teams",
      prize: "$75,000",
      status: "invitation-only",
      qualified: false,
      description: "Premier League of Legends tournament",
      requirements: "Master tier teams only",
    },
  ],
}

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "League of Legends": "from-purple-500 to-purple-700",
}

const gameIcons = {
  VALORANT: "🎯",
  "Overwatch 2": "⚡",
  "Rocket League": "🚀",
  "League of Legends": "⚔️",
}

function CombineCard({ combine, isLocked = true }: { combine: Combine; isLocked?: boolean }) {
  return (
    <Card
      className={`bg-gray-800 border-gray-700 transition-all duration-300 min-w-[320px] relative overflow-hidden ${
        isLocked ? "opacity-60" : "hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20"
      }`}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
            <p className="text-white font-orbitron font-bold text-lg">INVITATION ONLY</p>
            <p className="text-gray-300 font-rajdhani text-sm">Not Qualified</p>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <Badge className="bg-cyan-400 text-black font-orbitron text-xs">EVAL OFFICIAL</Badge>
            </div>
            <h3 className="font-orbitron font-bold text-white text-lg tracking-wide mb-1">{combine.title}</h3>
            <p className="text-gray-400 text-sm font-rajdhani mb-3">{combine.description}</p>
          </div>
          <div className="text-right">
            <p className="text-cyan-400 font-orbitron text-2xl font-bold">{combine.year}</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.date}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.spots}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 font-rajdhani">Prize Pool: {combine.prize}</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs text-gray-400 font-rajdhani mb-2">Requirements:</p>
          <p className="text-sm text-gray-300 font-rajdhani">{combine.requirements}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function GameSection({ game, combines }: { game: string; combines: Combine[] }) {
  const gameColor = gameColors[game as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const gameIcon = gameIcons[game as keyof typeof gameIcons] || "🎮"

  return (
    <div className="mb-16">
      <div className="flex items-center space-x-4 mb-8">
        <div
          className={`w-16 h-16 bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center text-2xl`}
        >
          {gameIcon}
        </div>
        <div>
          <h2 className="font-orbitron text-3xl font-bold text-white tracking-wide">{game}</h2>
          <p className="text-gray-400 font-rajdhani">{combines.length} exclusive combines available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combines.map((combine) => (
          <CombineCard key={combine.id} combine={combine} isLocked={true} />
        ))}
      </div>
    </div>
  )
}

export default function EvalCombinesPage() {
  const [searchQuery, setSearchQuery] = useState("")

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

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Input
              type="text"
              placeholder="Search combines, games, or locations..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white pl-12 pr-4 py-4 rounded-full text-lg font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Status Banner */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <Lock className="w-6 h-6 text-yellow-400" />
              <h3 className="font-orbitron text-xl text-white">Invitation Only Events</h3>
            </div>
            <p className="text-gray-300 font-rajdhani">
              EVAL Combines are exclusive tournaments for top-performing players. Maintain high rankings and exceptional
              performance to receive invitations.
            </p>
          </div>
        </div>

        {/* How to Qualify Section */}
        <div className="mb-16 bg-gray-900 rounded-2xl p-8">
          <h2 className="font-orbitron text-2xl text-cyan-400 mb-6 text-center">How to Get Invited</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-orbitron text-white text-lg mb-2">Maintain High Rankings</h3>
              <p className="text-gray-300 font-rajdhani text-sm">
                Stay in the top percentile of players in your game to be considered for invitations
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-orbitron text-white text-lg mb-2">Exceptional Performance</h3>
              <p className="text-gray-300 font-rajdhani text-sm">
                Demonstrate outstanding gameplay and consistent results in tournaments
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-black" />
              </div>
              <h3 className="font-orbitron text-white text-lg mb-2">Community Recognition</h3>
              <p className="text-gray-300 font-rajdhani text-sm">
                Build a strong reputation within the competitive gaming community
              </p>
            </div>
          </div>
        </div>

        {/* Game Sections */}
        <div className="space-y-16">
          {Object.entries(combinesData).map(([game, combines]) => (
            <GameSection key={game} game={game} combines={combines} />
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
