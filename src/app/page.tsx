import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { TrendingUp, BarChart3, MessageSquare, Users, Trophy, Target } from "lucide-react"

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
        <div className="relative z-20 max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            GET RANKED.
            <br />
            GET RECRUITED.
            <br />
            GET SCHOLARSHIPS.
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-medium">
            CONNECTING TOP PLAYERS TO OVER $50M IN ESPORTS SCHOLARSHIPS
          </p>
          <Button
            size="lg"
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-4 text-lg rounded-full"
          >
            GET STARTED
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-900 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">OUR ADVANCED RANKING SYSTEM</h2>
          <p className="text-2xl md:text-3xl mb-16">CONNECTS PLAYERS AND COLLEGES</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 border-4 border-white rounded-full flex items-center justify-center mb-6 transform rotate-45">
                <TrendingUp className="w-12 h-12 transform -rotate-45" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                IMPROVE WITH OUR ADVANCED
                <br />
                ANALYTICS DASHBOARD
              </h3>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 border-4 border-white rounded-full flex items-center justify-center mb-6 transform rotate-45">
                <BarChart3 className="w-12 h-12 transform -rotate-45" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                PLAY GAMES AND CLIMB THE
                <br />
                EVAL LEADERBOARD
              </h3>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 h-32 border-4 border-white rounded-full flex items-center justify-center mb-6 transform rotate-45">
                <MessageSquare className="w-12 h-12 transform -rotate-45" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                CONNECT AND CHAT WITH TOP
                <br />
                COLLEGE SCOUTS
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Combines Section */}
      <section className="relative py-20 text-center text-black">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-200 to-cyan-300" />
        <Image
          src="/placeholder.svg?height=800&width=1920"
          alt="Gaming tournament background"
          fill
          className="object-cover opacity-30"
        />
        <div className="relative z-10 container mx-auto px-6">
          <p className="text-xl mb-4 font-medium">ENTER THE FRAY WITH</p>
          <h2 className="text-6xl md:text-8xl font-bold mb-8">
            <span className="italic">EVAL</span> COMBINES
          </h2>
          <p className="text-xl md:text-2xl mb-16 font-medium max-w-4xl mx-auto">
            COMPETE FOR CASH, SCHOLARSHIPS, AND RANKINGS WITH OTHER HIGH SCHOOL PLAYERS
          </p>

          {/* Game Logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 mb-16">
            <div className="flex items-center space-x-2">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">RL</span>
              </div>
              <span className="font-bold text-lg">ROCKET LEAGUE</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-16 h-16 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">VAL</span>
              </div>
              <span className="font-bold text-lg">VALORANT</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">SSB</span>
              </div>
              <span className="font-bold text-lg">SUPER SMASH BROS ULTIMATE</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">OW</span>
              </div>
              <span className="font-bold text-lg">OVERWATCH</span>
            </div>
          </div>

          <p className="text-xl font-bold">PLAY IN FRONT OF SCOUTS FROM TOP ESPORTS PROGRAMS ACROSS THE COUNTRY</p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8">
                <Trophy className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-4xl font-bold text-white mb-2">$50M+</h3>
                <p className="text-gray-400">In Scholarships Connected</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8">
                <Users className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-4xl font-bold text-white mb-2">10K+</h3>
                <p className="text-gray-400">Active Players</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8">
                <Target className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-4xl font-bold text-white mb-2">500+</h3>
                <p className="text-gray-400">Partner Colleges</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">READY TO LEVEL UP?</h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join thousands of players who are already climbing the ranks and earning scholarships through EVAL.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
              CREATE ACCOUNT
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black font-semibold px-8 py-4 text-lg"
            >
              LEARN MORE
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
