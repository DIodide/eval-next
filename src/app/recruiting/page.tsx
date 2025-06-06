import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Navbar from "../_components/Navbar"
import Footer from "../_components/Footer"
import { TrendingUp, BarChart3, MessageSquare, Users, Trophy, GraduationCap, Eye, Award, UserCheck } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70 z-10" />
        <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Esports gaming background"
          fill
          className="object-cover"
          priority
        />
        <div className="relative z-20 max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            THE BRIDGE BETWEEN
            <br />
            <span className="text-cyan-400">TALENT</span> AND <span className="text-cyan-400">OPPORTUNITY</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 font-medium max-w-4xl mx-auto">
            Connecting esports players with college programs through advanced analytics and recruitment tools
          </p>

          {/* Dual CTA Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Players/Families Path */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-cyan-400/30">
              <div className="mb-6">
                <GraduationCap className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">FOR PLAYERS & FAMILIES</h3>
                <p className="text-gray-300">Get discovered, improve your game, and earn scholarships</p>
              </div>
              <ul className="text-left space-y-2 mb-6 text-sm">
                <li className="flex items-center">
                  <Trophy className="w-4 h-4 text-cyan-400 mr-2" />
                  Track your rankings and stats
                </li>
                <li className="flex items-center">
                  <Award className="w-4 h-4 text-cyan-400 mr-2" />
                  Access to $50M+ in scholarships
                </li>
                <li className="flex items-center">
                  <Eye className="w-4 h-4 text-cyan-400 mr-2" />
                  Get noticed by college scouts
                </li>
              </ul>
              <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-3">
                START YOUR JOURNEY
              </Button>
            </div>

            {/* Coaches Path */}
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-orange-400/30">
              <div className="mb-6">
                <UserCheck className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">FOR COACHES & SCOUTS</h3>
                <p className="text-gray-300">Discover talent, analyze performance, and build your roster</p>
              </div>
              <ul className="text-left space-y-2 mb-6 text-sm">
                <li className="flex items-center">
                  <BarChart3 className="w-4 h-4 text-orange-400 mr-2" />
                  Advanced player analytics
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-orange-400 mr-2" />
                  Access to 10K+ players
                </li>
                <li className="flex items-center">
                  <MessageSquare className="w-4 h-4 text-orange-400 mr-2" />
                  Direct communication tools
                </li>
              </ul>
              <Button className="w-full bg-orange-400 hover:bg-orange-500 text-black font-semibold py-3">
                FIND TALENT
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Players Section */}
      <section className="bg-gradient-to-b from-gray-900 to-black text-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-cyan-400">FOR PLAYERS & FAMILIES</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Take control of your esports future with tools designed to showcase your skills and connect you with
              opportunities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gray-800 border-cyan-400/20 hover:border-cyan-400/50 transition-colors">
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-gray-200">TRACK YOUR PROGRESS</h3>
                <p className="text-gray-400">
                  Monitor your performance across multiple games with detailed analytics and improvement insights
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-cyan-400/20 hover:border-cyan-400/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-gray-200">COMPETE IN COMBINES</h3>
                <p className="text-gray-400">
                  Participate in tournaments and showcases in front of college scouts and recruiters
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-cyan-400/20 hover:border-cyan-400/50 transition-colors">
              <CardContent className="p-8 text-center">
                <GraduationCap className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-gray-200">EARN SCHOLARSHIPS</h3>
                <p className="text-gray-400">
                  Get connected to over $50M in available esports scholarships and funding opportunities
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-4">
              CREATE PLAYER PROFILE
            </Button>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="bg-gradient-to-b from-black to-gray-900 text-white py-20 border-t border-gray-200/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-orange-400">FOR COACHES & SCOUTS</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover and recruit the next generation of esports talent with comprehensive analytics and scouting tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-gray-800 border-orange-400/20 hover:border-orange-400/50 transition-colors">
              <CardContent className="p-8 text-center">
                <BarChart3 className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-gray-200">ADVANCED ANALYTICS</h3>
                <p className="text-gray-400">
                  Access detailed performance metrics, gameplay analysis, and predictive insights for every player
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-orange-400/20 hover:border-orange-400/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Eye className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-gray-200">SCOUT TALENT</h3>
                <p className="text-gray-400">
                  Browse thousands of verified players, filter by skill level, game, and region to find perfect fits
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-orange-400/20 hover:border-orange-400/50 transition-colors">
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4 text-gray-200">DIRECT RECRUITMENT</h3>
                <p className="text-gray-400">
                  Connect directly with players and families through our secure messaging and recruitment platform
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" className="bg-orange-400 hover:bg-orange-500 text-black font-semibold px-8 py-4">
              START RECRUITING
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-900 text-white py-20 border-t border-gray-100/35">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">HOW IT WORKS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Player Journey */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-cyan-400">PLAYER JOURNEY</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">Create Your Profile</h4>
                    <p className="text-gray-400 text-sm">Set up your player profile with game stats and achievements</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">Compete & Improve</h4>
                    <p className="text-gray-400 text-sm">Participate in combines and track your performance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">Get Discovered</h4>
                    <p className="text-gray-400 text-sm">
                      College scouts find and recruit you based on your performance
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach Journey */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-orange-400">COACH JOURNEY</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">Set Up Scouting</h4>
                    <p className="text-gray-400 text-sm">Define your recruitment criteria and preferences</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">Analyze Players</h4>
                    <p className="text-gray-400 text-sm">Review detailed analytics and performance data</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-400 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold mb-1">Recruit Talent</h4>
                    <p className="text-gray-400 text-sm">Connect with players and build your championship roster</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-cyan-400 mb-2">$50M+</h3>
              <p className="text-gray-400">Scholarships Available</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-cyan-400 mb-2">10K+</h3>
              <p className="text-gray-400">Active Players</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-orange-400 mb-2">500+</h3>
              <p className="text-gray-400">Partner Colleges</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-orange-400 mb-2">1K+</h3>
              <p className="text-gray-400">Active Coaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 via-purple-600 to-orange-500 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">READY TO GET STARTED?</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Join the platform that&apos;s revolutionizing esports recruitment and player development
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
            <Button
              size="lg"
              className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-4 text-lg flex-1"
            >
              JOIN AS PLAYER
            </Button>
            <Button
              size="lg"
              className="bg-orange-400 hover:bg-orange-500 text-black font-semibold px-8 py-4 text-lg flex-1"
            >
              JOIN AS COACH
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
