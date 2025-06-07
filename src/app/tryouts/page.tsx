"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import type { Tryout } from "./college/types"
import type { GameType } from "./_components/GameCarousel"
import GameCarousel from "./_components/GameCarousel"

// TODO: replace with actual data from the database.
const tryoutsData: Record<GameType, Tryout[]> = {
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

// FUNCTION FOR DEV USE
const duplicateTryouts = (data: Record<GameType, Tryout[]>): void => {
  (Object.keys(data) as GameType[]).forEach(game => {
    const originalTryouts = data[game];
    const lastId = Math.max(...originalTryouts.map(t => t.id));
    
    for (let i = 1; i <= 2; i++) {
      const newTryouts: Tryout[] = originalTryouts.map(tryout => ({
        ...tryout,
        id: tryout.id + (lastId * i)
      }));
      data[game].push(...newTryouts);
    }
  });
};

// REMOVE THIS BEFORE DEPLOYING
// duplicateTryouts(tryoutsData);
// END

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
            <GameCarousel key={game} game={game as GameType} tryouts={tryouts} />
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
