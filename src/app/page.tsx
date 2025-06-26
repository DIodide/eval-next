"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, User, Quote, GraduationCap, X } from "lucide-react"
import FAQSection from "./_components/FAQSection"
import { FlipWords } from "@/components/ui/flip-words"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

// Mock data for ranking previews
const collegeTriouts = [
  { id: 1, title: "Princeton Esports Club VALORANT", school: "Princeton", date: "Dec 15", spots: "5 left" },
  { id: 2, title: "Princeton Esports Club Overwatch 2", school: "Princeton", date: "Dec 20", spots: "12 left" },
  { id: 3, title: "Princeton Esports Club Rocket League", school: "Princeton", date: "Jan 5", spots: "8 left" },
  { id: 4, title: "Princeton Esports Club Smash Ultimate", school: "Princeton", date: "Dec 18", spots: "6 left" },
]

const evalCombines = [
  { id: 1, title: "EVAL Rocket League Combine", game: "VALORANT", prize: "$300", status: "Open" },
  { id: 2, title: "EVAL Valorant Combine", game: "Rocket League", prize: "$500", status: "Open" },
  { id: 3, title: "EVAL Smash Ultimate Combine Day 1", game: "Overwatch 2", prize: "$100", status: "Open" },
  { id: 4, title: "EVAL Smash Ultimate Combine Day 2", game: "Rocket League", prize: "$100", status: "Open" },
]

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
    quote: "EVAL has opened up so many opportunities for me to get scholarships… thanks to EVAL, gaming in college can be my future!"
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export default function HomePage() {
  const { user } = useUser()
  const router = useRouter()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'player' | 'coach' | null>(null)

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
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-10" />
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

      {/* Partners Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-orbitron text-2xl text-center text-white mb-8 tracking-wide">TRUSTED BY</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <Image src="/partners/gse/GSE_LOGO.png" alt="Garden State Esports" width={150} height={60} />
            <Image src="/partners/keller/keller.png" alt="Keller Center" width={150} height={60} />
          </div>
        </div>
      </section>

      {/* Ranking Previews Section */}
      <section className="bg-black py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-4 cyber-text">
              RANKING PREVIEWS
            </h2>
            <p className="text-xl text-gray-300 font-rajdhani">Discover top opportunities and elite competition</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
            {/* College Tryouts */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-md p-8 border border-cyan-400/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-orbitron text-2xl text-cyan-400 font-bold tracking-wide">COLLEGE TRYOUTS</h3>
                <Link href="/tryouts/college">
                  <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold shadow-lg shadow-cyan-400/25">
                    VIEW MORE
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {collegeTriouts.map((tryout) => (
                  <Card
                    key={tryout.id}
                    className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-400/10"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-black" />
                          </div>
                          <div>
                            <h4 className="font-orbitron text-white font-semibold text-sm">{tryout.title}</h4>
                            <p className="text-gray-400 font-rajdhani text-xs">{tryout.school}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-cyan-400 font-orbitron text-sm font-bold">{tryout.date}</p>
                          <p className="text-gray-400 font-rajdhani text-xs">{tryout.spots}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* EVAL Combines */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-md p-8 border border-purple-400/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-orbitron text-2xl text-purple-400 font-bold tracking-wide">EVAL COMBINES</h3>
                <Link href="/tryouts/combines">
                  <Button className="bg-purple-400 hover:bg-purple-500 text-black font-orbitron font-bold shadow-lg shadow-purple-400/25">
                    VIEW MORE
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {evalCombines.map((combine) => (
                  <Card
                    key={combine.id}
                    className="bg-gray-800/80 backdrop-blur-sm border-gray-700 hover:border-purple-400/50 transition-all hover:shadow-lg hover:shadow-purple-400/10"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-md flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-orbitron text-white font-semibold text-sm">{combine.title}</h4>
                            <p className="text-gray-400 font-rajdhani text-xs">{combine.game}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-400 font-orbitron text-sm font-bold">{combine.prize}</p>
                          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-orbitron text-xs font-bold">
                            {combine.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Games Section */}
      <section className="bg-gray-900 py-20">
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
      <section className="bg-black py-20">
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

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 via-purple-600 to-orange-500 text-white py-20 relative overflow-hidden">
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
