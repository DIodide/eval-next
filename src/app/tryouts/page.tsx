"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, MapPin, Users, Calendar, User, Clock } from "lucide-react"
import type { Tryout } from "./types"

// Mock data for tryouts
const tryoutsData: Record<keyof typeof gameIcons, Tryout[]> = {
  VALORANT: [
    {
      id: 1,
      game: "VALORANT",
      title: "UCLA Esports Valorant Tryouts",
      school: "UCLA",
      price: "Free",
      type: "Online",
      spots: "5 spots left",
      totalSpots: "20 total spots",
      time: "2:00 PM - 5:00 PM PST",
      date: "Dec 15, 2024",
      organizer: "Coach Martinez",
      description: "Competitive tryouts for our varsity Valorant team",
    },
    {
      id: 2,
      game: "VALORANT",
      title: "Stanford Cardinal Gaming",
      school: "Stanford",
      price: "$25",
      type: "In-Person",
      spots: "12 spots left",
      totalSpots: "30 total spots",
      time: "10:00 AM - 1:00 PM PST",
      date: "Dec 20, 2024",
      organizer: "Coach Johnson",
      description: "Open tryouts for all skill levels",
    },
    {
      id: 3,
      game: "VALORANT",
      title: "UC Berkeley Valorant Combine",
      school: "UC Berkeley",
      price: "Free",
      type: "Online",
      spots: "8 spots left",
      totalSpots: "25 total spots",
      time: "6:00 PM - 8:00 PM PST",
      date: "Jan 5, 2025",
      organizer: "Coach Chen",
      description: "Showcase your skills to college scouts",
    },
  ],
  "Overwatch 2": [
    { 
      id: 4,
      game: "Overwatch 2",
      title: "USC Trojans OW2 Tryouts",
      school: "USC",
      price: "$15",
      type: "Hybrid",
      spots: "6 spots left",
      totalSpots: "15 total spots",
      time: "3:00 PM - 6:00 PM PST",
      date: "Dec 18, 2024",
      organizer: "Coach Williams",
      description: "Looking for tank and support players",
    },
    {
      id: 5,
      game: "Overwatch 2",
      title: "UCSD Overwatch Academy",
      school: "UCSD",
      price: "Free",
      type: "Online",
      spots: "10 spots left",
      totalSpots: "20 total spots",
      time: "7:00 PM - 9:00 PM PST",
      date: "Dec 22, 2024",
      organizer: "Coach Davis",
      description: "Development program for rising talent",
    },
  ],
  "Smash Ultimate": [
    {
      id: 6,
      game: "Smash Ultimate",
      title: "MIT Smash Bros Championship",
      school: "MIT",
      price: "$30",
      type: "In-Person",
      spots: "16 spots left",
      totalSpots: "64 total spots",
      time: "11:00 AM - 7:00 PM EST",
      date: "Jan 10, 2025",
      organizer: "Coach Thompson",
      description: "Elite tournament with scholarship opportunities",
    },
    {
      id: 7,
      game: "Smash Ultimate",
      title: "Harvard Crimson Smash",
      school: "Harvard",
      price: "Free",
      type: "Online",
      spots: "20 spots left",
      totalSpots: "32 total spots",
      time: "4:00 PM - 6:00 PM EST",
      date: "Jan 15, 2025",
      organizer: "Coach Brown",
      description: "Open qualifiers for varsity team",
    },
  ],
  "Rocket League": [
    {
      id: 8,
      game: "Rocket League",
      title: "Georgia Tech RL Tryouts",
      school: "Georgia Tech",
      price: "$20",
      type: "In-Person",
      spots: "9 spots left",
      totalSpots: "24 total spots",
      time: "1:00 PM - 4:00 PM EST",
      date: "Dec 28, 2024",
      organizer: "Coach Wilson",
      description: "Competitive 3v3 team tryouts",
    },
    {
      id: 9,
      game: "Rocket League",
      title: "Carnegie Mellon Rocket League",
      school: "CMU",
      price: "Free",
      type: "Online",
      spots: "15 spots left",
      totalSpots: "32 total spots",
      time: "8:00 PM - 10:00 PM EST",
      date: "Jan 8, 2025",
      organizer: "Coach Garcia",
      description: "Skills assessment and team placement",
    },
  ],
}

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Smash Ultimate": "from-yellow-500 to-yellow-700",
  "Rocket League": "from-blue-500 to-blue-700",
}

const gameIcons = {
  VALORANT: "/valorant/logos/V_Lockup_Vertical Black.png",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Secondary Black.png",
  "Smash Ultimate": "/smash/logos/smash-logo.png",
  "Rocket League": "/rocket-league/logos/rl-logo.png",
}

function TryoutCard({ tryout }: { tryout: Tryout }) {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 min-w-[320px] hover:shadow-lg hover:shadow-cyan-400/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <Image 
                src={"/eval/logos/eLOGO_white.png"} 
                alt={tryout.title} 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white text-sm tracking-wide">{tryout.title}</h3>
              <p className="text-gray-400 text-xs font-rajdhani">{tryout.school}</p>
            </div>
          </div>
          <Badge
            variant={tryout.price === "Free" ? "secondary" : "outline"}
            className={`${tryout.price === "Free" ? "bg-green-600 text-white" : "border-cyan-400 text-cyan-400"} font-orbitron text-xs flex-shrink-0`}
          >
            {tryout.price}
          </Badge>
        </div>

        <p className="text-gray-300 text-sm mb-4 font-rajdhani">{tryout.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{tryout.type}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">
              {tryout.spots} • {tryout.totalSpots}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{tryout.date}</span>
          </div>
          {tryout.time && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">{tryout.time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-rajdhani">by {tryout.organizer}</span>
          <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide">
            REGISTER
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function GameCarousel({ game, tryouts }: { game: keyof typeof gameIcons; tryouts: Tryout[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3
  const maxIndex = Math.max(0, tryouts.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 bg-gradient-to-br ${gameColors[game]} rounded-lg flex items-center justify-center text-2xl`}
          >
            <Image 
              src={gameIcons[game]} 
              alt={game} 
              width={48} 
              height={48} 
              className="object-contain" 
            />
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
          className="flex space-x-6 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (320 + 24)}px)` }}
        >
          {tryouts.map((tryout) => (
            <TryoutCard key={tryout.id} tryout={tryout} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TryoutsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="min-h-screen bg-black">

      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            TRYOUTS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-3xl mx-auto">
            Discover and register for esports tryouts at top colleges and universities
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search tryouts, schools, or games..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white pl-12 pr-4 py-4 rounded-full text-lg font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <Badge
              variant="outline"
              className="border-cyan-400 text-cyan-400 font-orbitron cursor-pointer hover:bg-cyan-400 hover:text-black"
            >
              All Games
            </Badge>
            <Badge
              variant="outline"
              className="border-gray-600 text-gray-400 font-orbitron cursor-pointer hover:border-cyan-400 hover:text-cyan-400"
            >
              Free Only
            </Badge>
            <Badge
              variant="outline"
              className="border-gray-600 text-gray-400 font-orbitron cursor-pointer hover:border-cyan-400 hover:text-cyan-400"
            >
              Online
            </Badge>
            <Badge
              variant="outline"
              className="border-gray-600 text-gray-400 font-orbitron cursor-pointer hover:border-cyan-400 hover:text-cyan-400"
            >
              In-Person
            </Badge>
            <Badge
              variant="outline"
              className="border-gray-600 text-gray-400 font-orbitron cursor-pointer hover:border-cyan-400 hover:text-cyan-400"
            >
              This Week
            </Badge>
          </div>
        </div>

        {/* Game Carousels */}
        <div className="space-y-16">
          {Object.entries(tryoutsData).map(([game, tryouts]) => (
            <GameCarousel key={game} game={game as keyof typeof gameIcons} tryouts={tryouts} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 py-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
          <h2 className="font-orbitron text-3xl font-bold text-white mb-4 tracking-wide">
            CAN&apos;T FIND WHAT YOU&apos;RE LOOKING FOR?
          </h2>
          <p className="text-gray-300 mb-8 font-rajdhani text-lg">
            Create an alert to get notified when new tryouts match your criteria
          </p>
          <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-8 py-3 tracking-wider">
            CREATE ALERT
          </Button>
        </div>
      </div>


    </div>
  )
}
