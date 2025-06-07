"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, User, Clock, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react"
import Link from "next/link"
import type { Tryout } from "../types"

// Flattened tryouts data for easier lookup by ID
const allTryouts: Tryout[] = [
  {
    id: 1,
    title: "UCLA Esports Valorant Tryouts",
    school: "UCLA",
    price: "Free",
    type: "Online",
    spots: "5 spots left",
    totalSpots: "20 total spots",
    time: "2:00 PM - 5:00 PM PST",
    date: "Dec 15, 2024",
    organizer: "Coach Martinez",
    description:
      "Competitive tryouts for our varsity Valorant team. We're looking for dedicated players who can commit to regular practice sessions and tournament participation. Previous competitive experience is preferred but not required.",
    requirements: {
      gpa: "3.0+",
      location: "Los Angeles, CA (Remote OK)",
      classYear: "Freshman - Senior",
      role: "All roles",
    },
    game: "VALORANT",
    longDescription:
      "UCLA Esports is recruiting for our 2025 Valorant roster. These tryouts will consist of aim assessment, game knowledge evaluation, and team play scenarios. Players will be evaluated on mechanical skill, game sense, communication, and teamwork. Selected players will receive coaching, tournament opportunities, and potential scholarship consideration. Our team competes in collegiate leagues including CSL, NACE, and more.",
  },
  {
    id: 2,
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
      role: "IGL, Support",
    },
    game: "VALORANT",
    longDescription:
      "Stanford Cardinal Gaming is hosting in-person tryouts for our competitive Valorant program. We're specifically looking for in-game leaders and support players who can strengthen our strategic approach. The tryout fee covers venue costs and equipment. Players should bring their own peripherals if possible. Selected players will join our varsity roster with access to coaching staff, practice facilities, and tournament travel support.",
  },
  {
    id: 3,
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
      role: "All roles",
    },
    game: "VALORANT",
    longDescription:
      "The UC Berkeley Valorant Combine is an opportunity for players to showcase their skills to our coaching staff and potentially earn a spot on our roster. This event is open to players of all roles and experience levels. The combine will include custom game scenarios, aim training evaluation, and team coordination exercises. We're looking for players who demonstrate strong fundamentals, good communication, and the ability to adapt to different situations.",
  },
  {
    id: 4,
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
      role: "Tank, Support",
    },
    game: "Overwatch 2",
    longDescription:
      "USC Trojans Esports is recruiting tank and support players for our Overwatch 2 team. These hybrid tryouts will begin with online qualifiers followed by in-person final evaluations for selected candidates. Players will be assessed on hero pool depth, positioning, ultimate usage, and team coordination. Our program offers regular coaching, VOD reviews, and competitive play in collegiate leagues. The tryout fee helps cover administrative costs and facility usage.",
  },
  {
    id: 5,
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
      role: "All roles",
    },
    game: "Overwatch 2",
    longDescription:
      "The UCSD Overwatch Academy is a development program designed to nurture emerging talent. Unlike traditional tryouts, this program focuses on player growth over time. Participants will receive regular coaching, participate in scrimmages, and have opportunities to move up to the varsity roster based on improvement and performance. We welcome players of all roles who are committed to improving their gameplay and teamwork skills.",
  },
  {
    id: 6,
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
      role: "All characters",
    },
    game: "Smash Ultimate",
    longDescription:
      "The MIT Smash Bros Championship is both a competitive tournament and a recruitment opportunity. Top performers will be considered for our varsity Smash Ultimate team and may qualify for scholarship opportunities. The tournament will follow a double elimination bracket format with best-of-three matches (best-of-five for finals). Players should bring their own controllers. The entry fee covers venue costs, equipment, and prize pool contributions.",
  },
  {
    id: 7,
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
      role: "All characters",
    },
    game: "Smash Ultimate",
    longDescription:
      "Harvard Crimson Smash is hosting online qualifiers for our varsity Smash Ultimate team. These tryouts will be conducted through online matches with specific rulesets to evaluate player skill, adaptability, and character mastery. Players of all main characters are welcome to participate. Selected players will advance to in-person evaluations and potentially join our competitive roster, which competes in collegiate tournaments across the country.",
  },
  {
    id: 8,
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
      role: "All positions",
    },
    game: "Rocket League",
    longDescription:
      "Georgia Tech is hosting in-person tryouts for our competitive Rocket League team. Players will be evaluated through a series of 3v3 matches, skill challenges, and team rotation exercises. We're looking for well-rounded players with strong mechanical skills, game sense, and communication abilities. The tryout fee covers facility usage and equipment. Selected players will represent Georgia Tech in collegiate competitions including CRL and other major tournaments.",
  },
  {
    id: 9,
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
      role: "All positions",
    },
    game: "Rocket League",
    longDescription:
      "Carnegie Mellon University is conducting online tryouts for our Rocket League program. These sessions will focus on assessing individual mechanics, team play, and adaptability. Players will participate in various game modes and custom training scenarios to demonstrate their skills. We're building both varsity and development rosters, so players of all skill levels are encouraged to participate. Selected players will receive coaching, practice schedules, and competitive opportunities.",
  },
]

// Helper function to get related tryouts (same game)
function getRelatedTryouts(currentTryout: Tryout) {
  return allTryouts.filter((tryout) => tryout.game === currentTryout.game && tryout.id !== currentTryout.id)
}

function TryoutCard({ tryout }: { tryout: Tryout }) {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 min-w-[320px] hover:shadow-lg hover:shadow-cyan-400/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-400" />
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
          <Link href={`/tryouts/college/${tryout.id}`}>
            <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide">
              REGISTER
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function RelatedTryoutsCarousel({ tryouts }: { tryouts: Tryout[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 2
  const maxIndex = Math.max(0, tryouts.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  if (tryouts.length === 0) return null

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide">More Tryouts</h2>
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

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-blue-500 to-blue-700",
  "Smash Ultimate": "from-purple-500 to-purple-700",
  "Rocket League": "from-orange-500 to-orange-700",
}

const gameIcons = {
  VALORANT: "⚔️",
  "Overwatch 2": "🛡️",
  "Smash Ultimate": "👊",
  "Rocket League": "⚽",
}

export default function TryoutDetailPage() {
  const params = useParams()
  const tryoutId = Number(params.id)

  // Find the current tryout
  const tryout = allTryouts.find((t) => t.id === tryoutId)

  // If tryout not found, show error
  if (!tryout) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="font-orbitron text-4xl font-bold text-white mb-4">Tryout Not Found</h1>
          <p className="text-gray-300 mb-8 font-rajdhani">The tryout you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/tryouts/college">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">Back to Tryouts</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get related tryouts (same game)
  const relatedTryouts = getRelatedTryouts(tryout)

  // Game-specific styling
  const gameColor = gameColors[tryout.game] || "from-gray-500 to-gray-700"
  const gameIcon = gameIcons[tryout.game] || "🎮"

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani">
            <Link href="/tryouts/college" className="hover:text-cyan-400">
              Tryouts
            </Link>
            <span>/</span>
            <Link href={`/tryouts/college?game=${tryout.game}`} className="hover:text-cyan-400">
              {tryout.game}
            </Link>
            <span>/</span>
            <span className="text-white">{tryout.title}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tryout Info */}
          <div className="lg:col-span-2">
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
              {tryout.title}
            </h1>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <h2 className="font-orbitron text-xl text-white">{tryout.school}</h2>
                <p className="text-gray-400 font-rajdhani">Organized by {tryout.organizer}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-orbitron text-sm">Date & Time</span>
                </div>
                <p className="text-gray-300 font-rajdhani">{tryout.date}</p>
                <p className="text-gray-300 font-rajdhani">{tryout.time}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-orbitron text-sm">Location</span>
                </div>
                <p className="text-gray-300 font-rajdhani">{tryout.type}</p>
                <p className="text-gray-300 font-rajdhani">{tryout.requirements.location}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-orbitron text-sm">Capacity</span>
                </div>
                <p className="text-gray-300 font-rajdhani">{tryout.spots}</p>
                <p className="text-gray-300 font-rajdhani">{tryout.totalSpots}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-orbitron text-sm">Requirements</span>
                </div>
                <p className="text-gray-300 font-rajdhani">GPA: {tryout.requirements.gpa}</p>
                <p className="text-gray-300 font-rajdhani">Year: {tryout.requirements.classYear}</p>
                <p className="text-gray-300 font-rajdhani">Role: {tryout.requirements.role}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-orbitron text-xl text-white mb-4">Description</h3>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-300 font-rajdhani leading-relaxed">{tryout.longDescription}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Game Logo and Registration */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
              <div
                className={`w-full aspect-square bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center mb-6`}
              >
                <span className="text-7xl">{gameIcon}</span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-400 font-rajdhani">Price</p>
                  <p className="text-white font-orbitron text-2xl">{tryout.price}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-rajdhani">Spots</p>
                  <p className="text-white font-orbitron text-2xl">{tryout.spots.split(" ")[0]}</p>
                </div>
              </div>

              <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold py-4 text-lg tracking-wider mb-4">
                REGISTER NOW
              </Button>

              <p className="text-center text-gray-400 font-rajdhani text-sm">
                {tryout.price === "Free"
                  ? "Registration is free for this tryout"
                  : "Payment will be processed securely"}
              </p>
            </div>
          </div>
        </div>

        {/* Related Tryouts */}
        <RelatedTryoutsCarousel tryouts={relatedTryouts} />
      </div>
    </div>
  )
}
