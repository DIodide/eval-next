import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, User, Quote } from "lucide-react"
import FAQSection from "./_components/FAQSection"
import { FlipWords } from "@/components/ui/flip-words"

// Mock data for ranking previews
const collegeTriouts = [
  { id: 1, title: "UCLA Esports VALORANT", school: "UCLA", date: "Dec 15", spots: "5 left" },
  { id: 2, title: "Stanford Cardinal Gaming", school: "Stanford", date: "Dec 20", spots: "12 left" },
  { id: 3, title: "UC Berkeley Combine", school: "UC Berkeley", date: "Jan 5", spots: "8 left" },
  { id: 4, title: "USC Trojans OW2", school: "USC", date: "Dec 18", spots: "6 left" },
]

const evalCombines = [
  { id: 1, title: "EVAL Invitational 2025", game: "VALORANT", prize: "$50,000", status: "Invitation Only" },
  { id: 2, title: "EVAL Spring Championship", game: "VALORANT", prize: "$25,000", status: "Invitation Only" },
  { id: 3, title: "EVAL OW2 Masters", game: "Overwatch 2", prize: "$40,000", status: "Invitation Only" },
  { id: 4, title: "EVAL RL Championship", game: "Rocket League", prize: "$60,000", status: "Invitation Only" },
]

const testimonials = [
  {
    name: "Alex Chen",
    role: "VALORANT Player",
    school: "UCLA",
    quote:
      "EVAL helped me get noticed by college scouts. I went from unknown to scholarship recipient in just 6 months!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Coach Martinez",
    role: "Esports Coach",
    school: "Stanford University",
    quote:
      "The analytics and player insights on EVAL are game-changing. We&apos;ve built our entire roster using this platform.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
  {
    name: "Sarah Johnson",
    role: "Rocket League Player",
    school: "UC Berkeley",
    quote: "The combines on EVAL pushed me to improve my game. Now I&apos;m competing at the highest collegiate level.",
    avatar: "/placeholder.svg?height=60&width=60",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80 z-10" />
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Esports background"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 max-w-6xl mx-auto px-6">
          <div className="mb-8">
            <Image
              src="/eval/logos/eLOGO_white.png"
              alt="EVAL Logo"
              width={200}
              height={100}
              className="mx-auto mb-6"
            />
          </div>
          <h1 className="font-orbitron text-5xl md:text-7xl font-black mb-6 leading-tight tracking-wider cyber-text">
            THE COLLEGE ESPORTS
            <br />
            <span className="text-cyan-400">RECRUITING PLATFORM</span>
          </h1>

          {/* New Slogan */}
          <div className="mb-8">
            <h2 className="font-orbitron text-2xl md:text-5xl font-bold text-white mb-4 tracking-wider">
              <FlipWords 
                words={["GET RANKED", "GET RECRUITED", "GET SCHOLARSHIPS"]} 
                duration={2000}
              />
            </h2>
          </div>

          <p className="text-xl md:text-2xl mb-8 font-medium max-w-4xl mx-auto font-rajdhani">
            The premier platform connecting high school esports players with college programs through advanced
            analytics, elite combines, and direct recruitment opportunities.
          </p>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-3xl font-orbitron font-black text-cyan-400 mb-1">$50M+</div>
              <div className="text-sm font-rajdhani text-gray-300">Available Scholarships</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-orbitron font-black text-purple-400 mb-1">500+</div>
              <div className="text-sm font-rajdhani text-gray-300">Partner Colleges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-orbitron font-black text-orange-400 mb-1">10K+</div>
              <div className="text-sm font-rajdhani text-gray-300">Active Players</div>
            </div>
          </div>

          {/* Dual CTA Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Button
              size="lg"
              className="bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-black font-bold px-8 py-4 text-lg font-orbitron tracking-wider shadow-lg shadow-cyan-400/25"
            >
              FOR PLAYERS
            </Button>
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg font-orbitron tracking-wider shadow-lg shadow-orange-400/25"
            >
              FOR COACHES
            </Button>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-orbitron text-2xl text-center text-white mb-8 tracking-wide">TRUSTED BY</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <Image src="/partners/gse/GSE_LOGO.png" alt="Garden State Esports" width={150} height={60} />
            <Image src="/partners/psv/psv.png" alt="Princeton Student Ventures" width={150} height={60} />
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
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-2xl p-8 border border-cyan-400/20">
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
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl p-8 border border-purple-400/20">
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
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
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
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-rajdhani">
              Compete in the most popular esports titles with comprehensive analytics and recruitment opportunities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-red-500/25 group-hover:shadow-red-500/40">
                <Image
                  src="/valorant/logos/V_Lockup_Vertical Black.png"
                  alt="VALORANT"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="font-orbitron text-white font-bold group-hover:text-red-400 transition-colors">
                VALORANT
              </h3>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40">
                <Image
                  src="/rocket-league/logos/bwt_rocket_league.png"
                  alt="Rocket League"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="font-orbitron text-white font-bold group-hover:text-blue-400 transition-colors">
                ROCKET LEAGUE
              </h3>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40">
                <Image
                  src="/smash/logos/Super Smash Bros Ultimate Black Logo.png"
                  alt="Super Smash Bros Ultimate"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="font-orbitron text-white font-bold group-hover:text-purple-400 transition-colors">
                SMASH ULTIMATE
              </h3>
            </div>
            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-orange-500/25 group-hover:shadow-orange-500/40">
                <Image
                  src="/overwatch/logos/Overwatch 2 Secondary Black.png"
                  alt="Overwatch 2"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h3 className="font-orbitron text-white font-bold group-hover:text-orange-400 transition-colors">
                OVERWATCH 2
              </h3>
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
            className="bg-white hover:bg-gray-100 text-black font-bold px-12 py-6 text-xl font-orbitron tracking-wider shadow-2xl hover:shadow-white/20 hover:scale-105 transition-all duration-300"
          >
            GET STARTED TODAY
          </Button>
        </div>
      </section>
    </div>
  )
}
