"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Clock, ChevronLeft, ChevronRight, Lock, Users } from "lucide-react"
import Link from "next/link"
import type { Combine } from "@/app/tryouts/types"
// Flattened combines data for easier lookup by ID
const allCombines: Combine[] = [
  {
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
    description: "The premier VALORANT tournament featuring the top 20 players nationwide. This invitation-only event showcases the highest level of competitive play with comprehensive scouting from college programs.",
    requirements: "Top 100 ranked players only",
    gameIcon: "🎯",
    gameColor: "from-red-500 to-red-700",
    bgColor: "bg-gradient-to-br from-red-900/80 to-red-800/80",
    image: "/placeholder.svg?height=200&width=300",
    // Additional fields for UI (not in Combine interface)
    time: "10:00 AM - 6:00 PM PST",
    type: "In-Person" as const,
    spotsRemaining: 0,
    organizer: "EVAL Gaming",
    longDescription: "The EVAL VALORANT Invitational represents the pinnacle of high school competitive VALORANT. Only the top 100 ranked players in our system are eligible for invitation. This exclusive tournament features best-of-three matches, professional-grade production, and direct scouting from over 50 college esports programs. Selected players will compete for rankings, recognition, and scholarship opportunities in a LAN environment with full broadcast coverage.",
    prizePool: "Scholarship Opportunities",
    format: "Single Elimination",
  },
  {
    id: 2,
    title: "EVAL COMBINE",
    year: "2025",
    game: "VALORANT",
    date: "April 22, 2025",
    location: "Online",
    spots: "20",
    prize: "$5,000",
    status: "open",
    qualified: false,
    description: "Spring season championship for collegiate-bound VALORANT players. Open registration with performance-based advancement.",
    requirements: "All ranks welcome",
    gameIcon: "🎯",
    gameColor: "from-red-500 to-red-700",
    bgColor: "bg-gradient-to-br from-red-900/60 to-red-800/60",
    image: "/placeholder.svg?height=200&width=300",
    // Additional fields for UI
    time: "2:00 PM - 8:00 PM PST",
    type: "Online" as const,
    spotsRemaining: 8,
    organizer: "EVAL Gaming",
    longDescription: "The EVAL VALORANT Combine is designed for players looking to showcase their skills to college scouts. This online tournament features multiple skill assessment rounds, team coordination challenges, and individual performance metrics. All participants receive detailed analytics reports and feedback. Top performers may be invited to future invitationals and will gain increased visibility to college recruiters.",
    prizePool: "Free",
    format: "Swiss System",
  },
  {
    id: 3,
    title: "EVAL COMBINE",
    year: "2025",
    game: "VALORANT",
    date: "May 10, 2025",
    location: "Chicago, IL",
    spots: "20",
    prize: "$5,000",
    status: "open",
    qualified: false,
    description: "Midwest regional showcase for emerging VALORANT talent under 18.",
    requirements: "All ranks welcome",
    gameIcon: "🎯",
    gameColor: "from-red-500 to-red-700",
    bgColor: "bg-gradient-to-br from-red-900/60 to-red-800/60",
    image: "/placeholder.svg?height=200&width=300",
    // Additional fields for UI
    time: "12:00 PM - 6:00 PM PST",
    type: "In-Person" as const,
    spotsRemaining: 12,
    organizer: "EVAL Gaming",
    longDescription: "This regional EVAL Combine focuses on developing young talent in the Midwest region. Players will participate in skill drills, team scrimmages, and receive coaching from professional analysts. The event includes workshops on game sense, communication, and mental preparation. College scouts from the region will be in attendance, making this an excellent opportunity for exposure.",
    prizePool: "Free",
    format: "Round Robin",
  },
  {
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
    description: "Premier Overwatch 2 tournament for top-tier players. Invitation-only event featuring the best teams nationwide.",
    requirements: "Grandmaster rank or higher",
    gameIcon: "⚡",
    gameColor: "from-orange-500 to-orange-700",
    bgColor: "bg-gradient-to-br from-orange-900/80 to-orange-800/80",
    image: "/placeholder.svg?height=200&width=300",
    // Additional fields for UI
    time: "9:00 AM - 7:00 PM EST",
    type: "In-Person" as const,
    spotsRemaining: 0,
    organizer: "EVAL Gaming",
    longDescription: "The EVAL Overwatch 2 Invitational brings together the most skilled teams in high school esports. Teams must demonstrate Grandmaster-level gameplay and exceptional coordination. This tournament features 6v6 matches with professional casting, analysis, and comprehensive team performance breakdowns. College esports programs will be actively scouting for both individual talent and complete team acquisitions.",
    prizePool: "Scholarship Opportunities",
    format: "Double Elimination",
  },
  {
    id: 5,
    title: "EVAL COMBINE",
    year: "2025",
    game: "Overwatch 2",
    date: "April 5, 2025",
    location: "Online",
    spots: "20",
    prize: "$5,000",
    status: "open",
    qualified: false,
    description: "College-exclusive Overwatch 2 championship for aspiring collegiate players.",
    requirements: "All ranks welcome",
    gameIcon: "⚡",
    gameColor: "from-orange-500 to-orange-700",
    bgColor: "bg-gradient-to-br from-orange-900/60 to-orange-800/60",
    image: "/placeholder.svg?height=200&width=300",
    // Additional fields for UI
    time: "1:00 PM - 7:00 PM EST",
    type: "Online" as const,
    spotsRemaining: 5,
    organizer: "EVAL Gaming",
    longDescription: "This Overwatch 2 Combine is specifically designed for players seeking collegiate opportunities. Teams will be evaluated on communication, strategy execution, and individual role performance. The event includes educational segments on collegiate esports, scholarship opportunities, and career paths in gaming. Performance data will be shared with partner college programs.",
    prizePool: "Free",
    format: "Swiss System",
  }
]

// Helper function to get related combines (same game)
function getRelatedCombines(currentCombine: Combine) {
  return allCombines.filter((combine) => combine.game === currentCombine.game && combine.id !== currentCombine.id)
}

function CombineCard({ combine }: { combine: Combine }) {
  const isInvitational = combine.status === "invitation-only"

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 min-w-[320px] hover:shadow-lg hover:shadow-cyan-400/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${combine.gameColor} rounded-lg flex items-center justify-center`}
            >
              <span className="text-2xl">{combine.gameIcon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white text-sm tracking-wide">
                {combine.title} {combine.year && <span className="text-cyan-400">{combine.year}</span>}
              </h3>
              <p className="text-gray-400 text-xs font-rajdhani">{combine.game}</p>
            </div>
          </div>
          <Badge className="bg-green-600 text-white font-orbitron text-xs flex-shrink-0">FREE</Badge>
        </div>

        <p className="text-gray-300 text-sm mb-4 font-rajdhani">{combine.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.type}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.spots} spots</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.date}</span>
          </div>
          {combine.time && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">{combine.time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-rajdhani">by {combine.organizer}</span>
          <Link href={`/tryouts/combines/${combine.id}`}>
            <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide">
              VIEW DETAILS
            </Button>
          </Link>
        </div>

        {isInvitational && (
          <div className="flex items-center justify-center mt-4 pt-3 border-t border-gray-600">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              <Badge className="bg-yellow-400 text-black font-orbitron text-xs">INVITATION ONLY</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RelatedCombinesCarousel({ combines }: { combines: Combine[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 2
  const maxIndex = Math.max(0, combines.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  if (combines.length === 0) return null

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide">More Combines</h2>
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
          {combines.map((combine) => (
            <CombineCard key={combine.id} combine={combine} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CombineDetailPage() {
  const params = useParams()
  const combineId = Number(params.id)

  // Find the current combine
  const combine = allCombines.find((c) => c.id === combineId)

  // If combine not found, show error
  if (!combine) {
    return (
      <div className="min-h-screen bg-black">
 
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="font-orbitron text-4xl font-bold text-white mb-4">Combine Not Found</h1>
        <p className="text-gray-300 mb-8 font-rajdhani">The combine you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/tryouts/combines">
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">Back to Combines</Button>
          </Link>
        </div>
   
      </div>
    )
  }

  // Get related combines (same game)
  const relatedCombines = getRelatedCombines(combine)
  const isInvitational = combine.status === "invitation-only"

  return (
    <div className="min-h-screen bg-black">


      <div className="container mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani">
            <Link href="/tryouts/combines" className="hover:text-cyan-400">
              Combines
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{combine.title}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Combine Info */}
          <div className="lg:col-span-2">
            <h1 className="font-orbitron text-3xl md:text-4xl font-bold text-white mb-4 tracking-wide">
              {combine.title} {combine.year && <span className="text-cyan-400">{combine.year}</span>}
            </h1>

            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-12 h-12 bg-gradient-to-br ${combine.gameColor} rounded-lg flex items-center justify-center`}
              >
                <span className="text-2xl">{combine.gameIcon}</span>
              </div>
              <div>
                <h2 className="font-orbitron text-xl text-white">{combine.game}</h2>
                <p className="text-gray-400 font-rajdhani">Organized by {combine.organizer}</p>
              </div>
            </div>

            {/* Improved Date & Time Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-orbitron text-lg">Date</span>
                </div>
                <p className="text-3xl font-orbitron font-bold text-cyan-400 mb-2">{combine.date.split(",")[0]}</p>
                <p className="text-lg text-gray-300 font-rajdhani">{combine.date.split(",")[1]}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-orbitron text-lg">Time</span>
                </div>
                <p className="text-2xl font-orbitron font-bold text-cyan-400 mb-2">{combine.time?.split(" - ")[0]}</p>
                <p className="text-lg text-gray-300 font-rajdhani">to {combine.time?.split(" - ")[1]}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-orbitron text-lg">Location</span>
                </div>
                <p className="text-xl font-orbitron font-bold text-white mb-1">{combine.type}</p>
                <p className="text-gray-300 font-rajdhani">{combine.location}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-orbitron text-lg">Capacity</span>
                </div>
                <p className="text-xl font-orbitron font-bold text-white mb-1">{combine.spots} total spots</p>
                {typeof combine.spotsRemaining === 'number' && combine.spotsRemaining > 0 && (
                  <p className="text-green-400 font-rajdhani font-bold">{combine.spotsRemaining} spots remaining</p>
                )}
                {typeof combine.spotsRemaining === 'number' && combine.spotsRemaining === 0 && !isInvitational && (
                  <p className="text-red-400 font-rajdhani font-bold">Full - Join waitlist</p>
                )}
              </div>
            </div>

            {isInvitational && combine.requirements && (
              <div className="mb-8">
                <h3 className="font-orbitron text-xl text-white mb-4">Invitation Requirements</h3>
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <Lock className="w-6 h-6 text-yellow-400" />
                    <h4 className="font-orbitron text-white font-bold">Invitation Only</h4>
                  </div>
                  <p className="text-gray-300 font-rajdhani">{combine.requirements}</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-orbitron text-xl text-white mb-4">
                About This {isInvitational ? "Invitational" : "Combine"}
              </h3>
              <div className="bg-gray-800 rounded-lg p-6">
                <p className="text-gray-300 font-rajdhani leading-relaxed">{combine.longDescription}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Game Logo and Registration */}
          <div>
            <div className="bg-gray-800 rounded-lg p-6 sticky top-6">
              <div
                className={`w-full aspect-square bg-gradient-to-br ${combine.gameColor} rounded-lg flex items-center justify-center mb-6`}
              >
                <span className="text-7xl">{combine.gameIcon}</span>
              </div>

              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-gray-400 font-rajdhani">Entry Fee</p>
                  <p className="text-white font-orbitron text-2xl">FREE</p>
                </div>
                <div>
                  <p className="text-gray-400 font-rajdhani">Format</p>
                  <p className="text-white font-orbitron text-lg">{combine.format}</p>
                </div>
              </div>

              {isInvitational ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-orbitron text-sm">Invitation Required</span>
                    </div>
                    <p className="text-gray-300 font-rajdhani text-sm">
                      This is an exclusive tournament. Invitations are sent to qualifying players.
                    </p>
                  </div>
                  <Button
                    disabled
                    className="w-full bg-gray-600 text-gray-400 font-orbitron font-bold py-4 text-lg tracking-wider cursor-not-allowed"
                  >
                    INVITATION ONLY
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {typeof combine.spotsRemaining === 'number' && (
                    combine.spotsRemaining > 0 ? (
                      <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold py-4 text-lg tracking-wider">
                        REGISTER NOW
                      </Button>
                    ) : (
                      <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-orbitron font-bold py-4 text-lg tracking-wider">
                        JOIN WAITLIST
                      </Button>
                    )
                  )}
                </div>
              )}

              <p className="text-center text-gray-400 font-rajdhani text-sm mt-4">
                All EVAL combines are completely free to participate
              </p>
            </div>
          </div>
        </div>

        {/* Related Combines */}
        <RelatedCombinesCarousel combines={relatedCombines} />
      </div>

    
    </div>
  )
}
