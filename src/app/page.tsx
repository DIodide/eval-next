"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Quote, GraduationCap, Calendar } from "lucide-react"
import FAQSection from "./_components/FAQSection"
import { FlipWords } from "@/components/ui/flip-words"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { api } from "@/trpc/react"

// Helper function to calculate spots remaining
const getSpotsRemaining = (maxSpots: number, registeredSpots: number) => {
  const remaining = maxSpots - registeredSpots
  if (remaining <= 0) return "Full"
  return `${remaining} left`
}

// Helper function to format date more concisely
const formatCompactDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

// Game icon mapping
const gameIcons = {
  "VALORANT": "/valorant/logos/Valorant Logo Red Border.jpg",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Primary Logo.png", 
  "Super Smash Bros. Ultimate": "/smash/logos/Smash Ball White Logo.png",
  "Rocket League": "/rocket-league/logos/Rocket League Emblem.png",
} as const

// Helper function to get game icon
const getGameIcon = (gameName: string) => {
  return gameIcons[gameName as keyof typeof gameIcons] ?? "/eval/logos/emblem.png"
}



const testimonials = [
  {
    name: "Chelsea O",
    role: "Valorant Team Manager",
    school: "Middlesex High School",
    quote:
      "Thanks to EVAL, we placed 1st in our group and got top 4 in playoffs!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Chris Aviles",
    role: "Founder and President",
    school: "Garden State Esports",
    quote:
      "EVAL did an outstanding job… they have gotten farther than anybody I’ve ever worked with.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Nikolai Kostev",
    role: "Valorant Player",
    school: "Midtown High School",
    quote: "EVAL has opened up so many opportunities for me to get scholarships… thanks to EVAL, gaming in college can be my future!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export default function HomePage() {
  const { user } = useUser()
  const router = useRouter()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'player' | 'coach' | null>(null)
  // Fetch real data from API
  const { data: upcomingTryouts = [] } = api.tryouts.getUpcomingForHomepage.useQuery({ limit: 3 })
  const { data: upcomingCombines = [] } = api.combines.getUpcomingForHomepage.useQuery({ limit: 3 })

  const handleUserTypeSelect = (userType: 'player' | 'coach') => {
    setSelectedUserType(userType)
  }

  const handleSignUp = () => {
    if (selectedUserType) {
      setShowSignUpModal(false)
      // Reset selection after a brief delay to allow modal to close
      setTimeout(() => setSelectedUserType(null), 300)
    }
  }

  const resetAndCloseModal = () => {
    setSelectedUserType(null)
    setShowSignUpModal(false)
  }

  const handleGetStarted = () => {
    if (user) {
      // User is signed in, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not signed in, show signup modal
      setShowSignUpModal(true)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5 z-10" />
        <div className="absolute inset-0 bg-black/66 z-5" />
        {/* <Image
          src="/eval/valorant_champs.jpg?height=1080&width=1920"
          alt="Esports background"
          fill
          className="object-cover"
          priority
        /> */}
        <div className="relative z-20 max-w-6xl mx-auto px-6">
          {/* <div className="mb-8">
            <Image
              src="/eval/logos/eLOGO_white.png"
              alt="EVAL Logo"
              width={200}
              height={100}
              className="mx-auto mb-6"
            />
          </div> */}
            <h2 className="text-5xl md:text-7xl font-black leading-tight text-white mb-6 font-orbitron">
              CONNECTING <span className="text-cyan-400">GAMERS</span>
              <br />
              TO <span className="text-cyan-400">COLLEGE</span> SCHOLARSHIPS
            </h2>

          {/* New Slogan */}
          {/* <div className="mb-8">
            <h2 className="font-rajdani text-xl md:text-3xl font-bold text-white mb-4 tracking-wider">
              <span className="text-white">GET RANKED</span> • <span className="text-white">GET RECRUITED</span>{" "}
              • <span className="text-white">GET SCHOLARSHIPS</span>
            </h2>
          </div> */}

          {/* <p className="text-xl md:text-2xl mb-8 font-medium max-w-4xl mx-auto font-rajdhani">
            The premier platform connecting high school esports players with college programs through advanced
            analytics, elite combines, and direct recruitment opportunities.
          </p> */}

          {/* Key Stats */}
          <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto mb-12">
            {/* <div className="text-center">
              <div className="text-3xl font-orbitron font-black text-cyan-400 mb-1">$50M+</div>
              <div className="text-sm font-rajdhani text-gray-300">Available Scholarships</div>
            </div> */}
            {/* <div className="text-center">
              <div className="text-3xl font-orbitron font-black text-purple-400 mb-1">500+</div>
              <div className="text-sm font-rajdhani text-gray-300">Partner Colleges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-orbitron font-black text-orange-400 mb-1">10K+</div>
              <div className="text-sm font-rajdhani text-gray-300">Active Players</div>
            </div> */}
          </div>

          {/* Dual CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Link href="/recruiting">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-black font-bold px-8 py-4 text-lg font-orbitron tracking-wider shadow-lg shadow-cyan-400/25"
              >
                FOR PLAYERS
              </Button>
            </Link>
            <Link href="/recruiting">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg font-orbitron tracking-wider shadow-lg shadow-orange-400/25"
              >
                FOR COACHES
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="bg-black/95 py-16 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-500/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-4 cyber-text">
              WHAT WE OFFER
            </h2>
            <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto">
              Comprehensive solutions for players, coaches, and leagues in the esports ecosystem
            </p>
          </div>

          {/* Dynamic Flow Layout */}
          <div className="relative max-w-7xl mx-auto">
            {/* Connecting Flow Line */}
            <div className="relative top-[-25] left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-orange-400 to-purple-400 transform -translate-y-1/2 hidden lg:block opacity-30"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
              {/* For Players */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-xl p-6 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-cyan-400/20">
                  <div className="relative">
                    
                    <h3 className="font-orbitron text-2xl md:text-3xl text-cyan-400 font-black tracking-wide mb-4">
                      FOR PLAYERS
                    </h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-600 mb-6"></div>
                    <div className="space-y-4">
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Level up your game with advanced insights
                      </p>
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Connect with verified college coaches
                      </p>
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Showcase skills in EVAL Combines
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Coaches */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-xl p-6 border border-orange-400/20 hover:border-orange-400/40 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-orange-400/20">
                  <div className="relative">
                    {/* <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-400 rounded-full hidden lg:block"></div> */}
                    <h3 className="font-orbitron text-2xl md:text-3xl text-orange-400 font-black tracking-wide mb-4">
                      FOR COACHES
                    </h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 mb-6"></div>
                    <div className="space-y-4">
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Scout players with EVAL metrics
                      </p>
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Host tryouts for your programs
                      </p>
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Get recruiting consulting
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Leagues */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-400/20">
                  <div className="relative">
                    {/* <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-400 rounded-full hidden lg:block"></div> */}
                    <h3 className="font-orbitron text-2xl md:text-3xl text-purple-400 font-black tracking-wide mb-4">
                      FOR LEAGUES
                    </h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 mb-6"></div>
                    <div className="space-y-4">
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Highlight players for scholarships
                      </p>
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Enable competitive rankings
                      </p>
                      <p className="text-lg md:text-xl text-white font-rajdhani font-medium leading-relaxed">
                        Create college pipelines
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="bg-black/95 py-16 bg-gradient-to-r from-blue-700/10 via-purple-700/10 to-pink-700/10 border border-blue-500/20">
        <div className="container mx-auto px-6">
          <h2 className="font-orbitron text-2xl text-center text-white mb-8 tracking-wide">TRUSTED BY</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <Image src="/partners/gse/GSE_LOGO.png" alt="Garden State Esports" width={150} height={60} />
            <Image src="/partners/keller/keller.png" alt="Keller Center" width={150} height={60} />
          </div>
        </div>
      </section>

              {/* Upcoming Tournaments Section */}
        <section className="bg-[#0e041f]/98 py-20 from-blue-700/10 via-purple-700/10 to-pink-700/10 border border-blue-500/20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-4 cyber-text">
                UPCOMING TOURNAMENTS
              </h2>
              <p className="text-xl text-gray-300 font-rajdhani">Don&apos;t miss out on these exciting opportunities to compete and get recruited</p>
            </div>

                      <div className="grid grid-cols-1 lg:grid-cols-1 gap-12 max-w-7xl mx-auto">
              {/* College Tryouts */}
              {/* <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-md p-8 border border-cyan-400/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-orbitron text-2xl text-cyan-400 font-bold tracking-wide">COLLEGE TRYOUTS</h3>
                  </div>
                  <Link href="/tryouts/college">
                    <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold shadow-lg shadow-cyan-400/25">
                      VIEW MORE
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-col space-y-4">
                  {upcomingTryouts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 font-rajdhani">No upcoming tryouts available</p>
                    </div>
                  ) : (
                    upcomingTryouts.map((tryout) => (
                      <Link key={tryout.id} href={`/tryouts/college/${tryout.id}`}>
                        <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-cyan-400/50 hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 cursor-pointer transform hover:scale-[1.02]">
                          <CardContent className="p-5">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={getGameIcon(tryout.game.name)}
                                  alt={tryout.game.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-orbitron text-white font-semibold truncate mb-1">{tryout.title}</h4>
                                <p className="text-gray-400 font-rajdhani text-sm mb-2">{tryout.school.name}</p>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-cyan-400" />
                                  <span className="text-cyan-400 font-rajdhani text-sm">
                                    {formatCompactDate(tryout.date)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-gradient-to-r from-green-400 to-green-500 text-black font-orbitron text-xs font-bold">
                                  {getSpotsRemaining(tryout.max_spots, tryout.registered_spots)}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div> */}

                          {/* EVAL Combines */}
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-md p-8 border border-purple-400/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-orbitron text-2xl text-purple-400 font-bold tracking-wide">EVAL COMBINES</h3>
                  </div>
                  <Link href="/tryouts/combines">
                    <Button className="bg-purple-400 hover:bg-purple-500 text-black font-orbitron font-bold shadow-lg shadow-purple-400/25">
                      VIEW MORE
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-col space-y-4">
                  {upcomingCombines.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 font-rajdhani">No upcoming combines available</p>
                    </div>
                  ) : (
                    upcomingCombines.map((combine) => (
                      <Link key={combine.id} href={`/tryouts/combines/${combine.id}`}>
                        <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-purple-400/50 hover:bg-gray-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/20 cursor-pointer transform hover:scale-[1.02]">
                          <CardContent className="p-5">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={getGameIcon(combine.game.name)}
                                  alt={combine.game.name}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-orbitron text-white font-semibold truncate mb-1">{combine.title}</h4>
                                <p className="text-gray-400 font-rajdhani text-sm mb-2">{combine.game.name}</p>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  <span className="text-purple-400 font-rajdhani text-sm">
                                    {formatCompactDate(combine.date)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end space-y-2">
                                <div className="text-purple-400 font-orbitron font-bold text-sm">{combine.prize_pool}</div>
                                <Button 
                                  size="sm" 
                                  className="bg-purple-500 hover:bg-purple-600 text-white font-orbitron text-xs px-4 py-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  JOIN COMBINE
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))
                  )}
                </div>
              </div>
          </div>
        </div>
      </section>

      {/* Our Games Section */}
      <section className="bg-black/95 py-20 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-blue-500/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-4 cyber-text">OUR GAMES</h2>
            <p className="text-xl text-gray-300 max-w-5xl mx-auto font-rajdhani">
              We support the biggest titles in collegiate esports with comprehensive analytics and recruitment opportunities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-8xl mx-auto">
            <div className="flex items-center justify-center text-center group cursor-pointer hover:scale-110 transition-all duration-300">
                <Image
                  src="/valorant/logos/Lockup Horizontal Off-White_cropped.png"
                  alt="VALORANT"
                  width={5000}
                  height={5000}
                  className="transition-all duration-300"
                />
              {/* <h3 className="font-orbitron text-white font-bold group-hover:text-red-400 transition-colors">
                VALORANT
              </h3> */}
            </div>
            <div className=" flex items-center justify-center mx-5 text-center group cursor-pointer hover:scale-110 transition-all duration-300">
              <Image
                  src="/rocket-league/logos/Rocket League Black and White Logo.png"
                  alt="Rocket League"
                  width={750}
                  height={304}
                  className="object-contain"
                />
            </div>
            <div className="text-center group cursor-pointer">
              <div className=" rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 ">
                <Image
                  src="/smash/logos/SSBU Logo white_trans.png"
                  alt="Super Smash Bros Ultimate"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
              {/* <h3 className="font-orbitron text-white font-bold group-hover:text-purple-400 transition-colors">
                SMASH ULTIMATE
              </h3> */}
            </div>
            <div className="text-center group cursor-pointer flex justify-center items-center">
              <div className=" rounded-2xl flex items-center justify-center mx-auto px-5 mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg ">
                <Image
                  src="/overwatch/logos/Overwatch 2 Wordmark.png"
                  alt="Overwatch 2"
                  width={500}
                  height={500}
                  className="object-contain"
                />
              </div>
              {/* <h3 className="font-orbitron text-white font-bold group-hover:text-orange-400 transition-colors">
                OVERWATCH 2
              </h3> */}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-black/95 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-4 cyber-text">
              SUCCESS STORIES
            </h2>
            <p className="text-xl text-gray-300 font-rajdhani">
              Hear from players and coaches who&apos;ve achieved their goals with EVAL
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-cyan-400/50 transition-all hover:shadow-xl hover:shadow-cyan-400/10 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-cyan-400 mb-4" />
                  <p className="text-gray-300 font-rajdhani mb-6 italic leading-relaxed">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-black font-orbitron font-bold text-sm">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-orbitron text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-gray-400 font-rajdhani text-sm">{testimonial.role}</p>
                      <p className="text-cyan-400 font-rajdhani text-sm font-semibold">{testimonial.school}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Discord Community Section */}
      <section className="bg-gradient-to-br bg-black/95 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-left">
                <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-6 cyber-text">
                  JOIN OUR DISCORD
                </h2>
                <p className="text-xl text-gray-300 mb-8 font-rajdhani leading-relaxed">
                  Connect with a community of players, coaches, and esports enthusiasts in our vibrant Discord community. 
                  Get real-time updates, participate in discussions, and stay ahead of the competition.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                    <p className="text-gray-300 font-rajdhani">Live tournament updates and announcements</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <p className="text-gray-300 font-rajdhani">Direct access to EVAL team and coaches</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <p className="text-gray-300 font-rajdhani">Exclusive opportunities and early access</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                    <p className="text-gray-300 font-rajdhani">Community events and scrimmages</p>
                  </div>
                </div>
              </div>

              {/* Right Discord Widget */}
              <div className="flex justify-center lg:justify-end">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg p-6 hover:shadow-xl hover:shadow-purple-400/10 transition-all">
                  <iframe 
                    src="https://discord.com/widget?id=1208123255592849438&theme=dark" 
                    width="350" 
                    height="500" 
                    frameBorder="0" 
                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection className="bg-gray-900/99" />

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500/90 via-purple-500/90 to-orange-500/90 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-orbitron text-4xl md:text-6xl font-black mb-6 cyber-text">START YOUR ESPORTS JOURNEY</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-rajdhani">
            Join thousands of players and coaches already using EVAL to achieve their esports dreams
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white hover:bg-gray-100 text-black font-bold px-12 py-6 text-xl font-orbitron tracking-wider shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
          >
            GET STARTED TODAY
          </Button>
        </div>
      </section>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={resetAndCloseModal}>
        <DialogContent className="sm:max-w-lg bg-slate-900 text-white border-none">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-bold text-white mb-4">SIGN UP</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">CHOOSE YOUR ACCOUNT TYPE</h2>
              <p className="text-slate-300 text-sm">
                Empowering students and college coaches to connect.
              </p>
            </div>

            {/* Horizontal Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Player Option */}
              <button
                onClick={() => handleUserTypeSelect('player')}
                className={`p-6 rounded-lg border-2 text-center transition-all ${
                  selectedUserType === 'player'
                    ? 'border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    selectedUserType === 'player' 
                      ? 'border-blue-400 bg-blue-500/20' 
                      : 'border-slate-500 bg-slate-700/50'
                  }`}>
                    <User className={`w-6 h-6 ${
                      selectedUserType === 'player' ? 'text-blue-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">PLAYER</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      I am a player looking to find an esports scholarship and related opportunities.
                    </p>
                  </div>
                </div>
              </button>

              {/* College Option */}
              <button
                onClick={() => handleUserTypeSelect('coach')}
                className={`p-6 rounded-lg border-2 text-center transition-all ${
                  selectedUserType === 'coach'
                    ? 'border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20'
                    : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                    selectedUserType === 'coach' 
                      ? 'border-blue-400 bg-blue-500/20' 
                      : 'border-slate-500 bg-slate-700/50'
                  }`}>
                    <GraduationCap className={`w-6 h-6 ${
                      selectedUserType === 'coach' ? 'text-blue-400' : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-2">SCHOOL</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      I am a coach, director or administrator looking to make finding players easier.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Sign Up Button */}
            {selectedUserType ? (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: selectedUserType }}
              >
                <Button
                  onClick={handleSignUp}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 font-medium shadow-lg"
                >
                  SIGN UP AS {selectedUserType === 'coach' ? 'SCHOOL' : selectedUserType.toUpperCase()}
                </Button>
              </SignUpButton>
            ) : (
              <Button
                disabled
                className="w-full bg-slate-700 text-slate-500 rounded-lg py-3 font-medium cursor-not-allowed"
              >
                SIGN UP
              </Button>
            )}

            {/* Sign In Link */}
            <div className="text-center">
              <SignInButton mode="modal">
                <button 
                  onClick={resetAndCloseModal}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Already have an account? Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
