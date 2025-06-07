"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import type { Tryout } from "../types"
import type { GameType } from "@/app/tryouts/_components/GameCarousel"
import GameCarousel from "@/app/tryouts/_components/GameCarousel"

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
      requirements: {
        gpa: "3.0+",
        location: "Los Angeles, CA (Remote OK)",
        classYear: "Freshman - Senior",
        role: "All roles"
      },
      longDescription: "UCLA Esports is recruiting for our 2025 Valorant roster. These tryouts will consist of aim assessment, game knowledge evaluation, and team play scenarios. Players will be evaluated on mechanical skill, game sense, communication, and teamwork. Selected players will receive coaching, tournament opportunities, and potential scholarship consideration. Our team competes in collegiate leagues including CSL, NACE, and more."
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
      requirements: {
        gpa: "3.2+",
        location: "Stanford, CA",
        classYear: "Sophomore - Senior",
        role: "IGL, Support"
      },
      longDescription: "Stanford Cardinal Gaming is hosting in-person tryouts for our competitive Valorant program. We're specifically looking for in-game leaders and support players who can strengthen our strategic approach. The tryout fee covers venue costs and equipment. Players should bring their own peripherals if possible. Selected players will join our varsity roster with access to coaching staff, practice facilities, and tournament travel support."
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
      requirements: {
        gpa: "2.8+",
        location: "Berkeley, CA (Remote OK)",
        classYear: "All years",
        role: "All roles"
      },
      longDescription: "The UC Berkeley Valorant Combine is an opportunity for players to showcase their skills to our coaching staff and potentially earn a spot on our roster. This event is open to players of all roles and experience levels. The combine will include custom game scenarios, aim training evaluation, and team coordination exercises. We're looking for players who demonstrate strong fundamentals, good communication, and the ability to adapt to different situations."
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
      requirements: {
        gpa: "3.0+",
        location: "Los Angeles, CA",
        classYear: "All years",
        role: "Tank, Support"
      },
      longDescription: "USC Trojans Esports is recruiting tank and support players for our Overwatch 2 team. These hybrid tryouts will begin with online qualifiers followed by in-person final evaluations for selected candidates. Players will be assessed on hero pool depth, positioning, ultimate usage, and team coordination. Our program offers regular coaching, VOD reviews, and competitive play in collegiate leagues. The tryout fee helps cover administrative costs and facility usage."
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
      requirements: {
        gpa: "2.5+",
        location: "San Diego, CA (Remote OK)",
        classYear: "Freshman - Junior",
        role: "All roles"
      },
      longDescription: "The UCSD Overwatch Academy is a development program designed to nurture emerging talent. Unlike traditional tryouts, this program focuses on player growth over time. Participants will receive regular coaching, participate in scrimmages, and have opportunities to move up to the varsity roster based on improvement and performance. We welcome players of all roles who are committed to improving their gameplay and teamwork skills."
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
      requirements: {
        gpa: "3.5+",
        location: "Cambridge, MA",
        classYear: "All years",
        role: "All characters"
      },
      longDescription: "The MIT Smash Bros Championship is both a competitive tournament and a recruitment opportunity. Top performers will be considered for our varsity Smash Ultimate team and may qualify for scholarship opportunities. The tournament will follow a double elimination bracket format with best-of-three matches (best-of-five for finals). Players should bring their own controllers. The entry fee covers venue costs, equipment, and prize pool contributions."
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
      requirements: {
        gpa: "3.2+",
        location: "Cambridge, MA (Remote OK)",
        classYear: "All years",
        role: "All characters"
      },
      longDescription: "Harvard Crimson Smash is hosting online qualifiers for our varsity Smash Ultimate team. These tryouts will be conducted through online matches with specific rulesets to evaluate player skill, adaptability, and character mastery. Players of all main characters are welcome to participate. Selected players will advance to in-person evaluations and potentially join our competitive roster, which competes in collegiate tournaments across the country."
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
      requirements: {
        gpa: "3.0+",
        location: "Atlanta, GA",
        classYear: "All years",
        role: "All positions"
      },
      longDescription: "Georgia Tech is hosting in-person tryouts for our competitive Rocket League team. Players will be evaluated through a series of 3v3 matches, skill challenges, and team rotation exercises. We're looking for well-rounded players with strong mechanical skills, game sense, and communication abilities. The tryout fee covers facility usage and equipment. Selected players will represent Georgia Tech in collegiate competitions including CRL and other major tournaments."
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
      requirements: {
        gpa: "3.2+",
        location: "Pittsburgh, PA (Remote OK)",
        classYear: "Freshman - Junior",
        role: "All positions"
      },
      longDescription: "Carnegie Mellon University is conducting online tryouts for our Rocket League program. These sessions will focus on assessing individual mechanics, team play, and adaptability. Players will participate in various game modes and custom training scenarios to demonstrate their skills. We're building both varsity and development rosters, so players of all skill levels are encouraged to participate. Selected players will receive coaching, practice schedules, and competitive opportunities."
    }
  ]
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
