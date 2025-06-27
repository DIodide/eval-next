"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, X, Zap, Calendar, BarChart3, Trophy, Users, GraduationCap, Target, User } from "lucide-react"
import Link from "next/link"
import { SignUpButton, SignInButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function PricingPage() {
  const { user } = useUser()
  const router = useRouter()
  const [requestDemoOpen, setRequestDemoOpen] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'player' | 'coach' | null>(null)

  const handleScheduleDemo = () => {
    window.open("https://calendly.com/evalgaming/eval-demo", "_blank")
    setRequestDemoOpen(false)
  }

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

  const handlePlayerCTA = () => {
    if (user) {
      router.push('/dashboard/player')
    } else {
      setShowSignUpModal(true)
    }
  }

  const handleCoachCTA = () => {
    if (user) {
      router.push('/dashboard/coaches')
    } else {
      setShowSignUpModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 relative">
      {/* Enhanced Background with Floating Elements */}
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
      <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-orange-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-cyan-500/20 rounded-full blur-lg animate-pulse delay-3000"></div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-3xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            PRICING PLANS
          </h1>

          {/* Compact Rainbow Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-eval-cyan"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-cyan to-eval-purple"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-purple to-eval-orange"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-eval-orange to-transparent"></div>
          </div>

          <p className="text-lg text-gray-300 mb-6 font-rajdhani max-w-2xl mx-auto">
            Choose the perfect plan to elevate your esports journey
          </p>

          <div className="flex justify-center">
            <Button
              onClick={() => setRequestDemoOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-cyan-400 hover:from-purple-700 hover:to-cyan-500 text-white font-orbitron font-bold px-6 py-2 tracking-wider transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              REQUEST A DEMO
            </Button>
          </div>
        </div>

        {/* Enhanced Pricing Tabs */}
        <div className="glass-morphism border-white/20 rounded-2xl p-6 md:p-8">
          <Tabs defaultValue="players" className="w-full max-w-6xl mx-auto">
            <TabsList className="grid grid-cols-3 mb-8 bg-black/40 rounded-full p-1 w-full max-w-sm mx-auto">
              <TabsTrigger
                value="players"
                className="font-orbitron text-sm text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black rounded-full transition-all duration-300 px-3 py-2"
              >
                PLAYERS
              </TabsTrigger>
              <TabsTrigger
                value="coaches"
                className="font-orbitron text-sm text-white data-[state=active]:bg-orange-400 data-[state=active]:text-black rounded-full transition-all duration-300 px-3 py-2"
              >
                COACHES
              </TabsTrigger>
              <TabsTrigger
                value="leagues"
                className="font-orbitron text-sm text-white data-[state=active]:bg-purple-400 data-[state=active]:text-black rounded-full transition-all duration-300 px-3 py-2"
              >
                LEAGUES
              </TabsTrigger>
            </TabsList>

            {/* Players Pricing */}
            <TabsContent value="players" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-8 max-w-md mx-auto">
                {/* Free Tier */}
                <Card className="glass-morphism border-white/20 hover:border-cyan-400/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-cyan-400/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white font-orbitron text-2xl">Free</CardTitle>
                    <CardDescription className="text-gray-400 font-rajdhani">
                      Get started with basic features
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="text-4xl font-orbitron text-white mb-2">$0</p>
                      <p className="text-gray-400 font-rajdhani">Forever free for players and students</p>
                    </div>
                    <ul className="space-y-3 font-rajdhani">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Basic player profile</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">View public tryouts</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Upload 1 gameplay clip</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Send up to 3 coach messages</span>
                      </li>
                      <li className="flex items-start">
                        <X className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">Advanced analytics</span>
                      </li>
                      <li className="flex items-start">
                        <X className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">Priority visibility to coaches</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handlePlayerCTA}
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-orbitron transform hover:scale-105 transition-all duration-300"
                    >
                      GET STARTED
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Coaches Pricing */}
            <TabsContent value="coaches" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Free Tier */}
                <Card className="glass-morphism border-white/20 hover:border-gray-400/30 transition-all duration-300 transform hover:scale-105">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white font-orbitron text-2xl">Free</CardTitle>
                    <CardDescription className="text-gray-400 font-rajdhani">Basic scouting tools</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="text-4xl font-orbitron text-white mb-2 line-through decoration-red-500">$0</p>
                      <p className="text-gray-400 font-rajdhani">Free pilot</p>
                    </div>
                    <ul className="space-y-3 font-rajdhani">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Basic coach profile</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Browse player profiles</span>
                      </li>
                      <li className="flex items-start">
                        <X className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">Contact players in curated e-sports recruiting database</span>
                      </li>
                      <li className="flex items-start">
                        <X className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">Advanced player search</span>
                      </li>
                      <li className="flex items-start">
                        <X className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">Create tryouts</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleCoachCTA}
                      className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-orbitron transform hover:scale-105 transition-all duration-300"
                    >
                      GET STARTED
                    </Button>
                  </CardFooter>
                </Card>

                {/* EVAL Gold Tier */}
                <Card className="glass-morphism border-orange-400/50 hover:border-orange-400 transition-all duration-300 shadow-lg shadow-orange-400/10 transform hover:scale-105 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-black font-orbitron px-4 py-1">POPULAR</Badge>
                  </div>
                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-white font-orbitron text-2xl">EVAL Gold</CardTitle>
                    <CardDescription className="text-gray-400 font-rajdhani">Enhanced recruiting tools</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="text-4xl font-orbitron text-white mb-2 line-through decoration-red-500">$0</p>
                      <p className="text-gray-400 font-rajdhani">per year</p>
                    </div>
                    <ul className="space-y-3 font-rajdhani">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Enhanced school profile</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Advanced player search filters</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Contact up to 100 players per month</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Scout at EVAL Combines</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Basic analytics dashboard</span>
                      </li>
                      <li className="flex items-start">
                        <X className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500">Talent pipeline management</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleCoachCTA}
                      className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-black font-orbitron transform hover:scale-105 transition-all duration-300"
                    >
                      UPGRADE NOW
                    </Button>
                  </CardFooter>
                </Card>

                {/* EVAL Platinum Tier */}
                <Card className="glass-morphism border-purple-400/50 hover:border-purple-400 transition-all duration-300 shadow-lg shadow-purple-400/10 transform hover:scale-105 relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-400 to-purple-500 text-black font-orbitron px-4 py-1">PREMIUM</Badge>
                  </div>
                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-white font-orbitron text-2xl">EVAL Platinum</CardTitle>
                    <CardDescription className="text-gray-400 font-rajdhani">
                      Complete recruiting solution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="mb-4">
                      <p className="text-4xl font-orbitron text-white mb-2 line-through decoration-red-500">$0</p>
                      <p className="text-gray-400 font-rajdhani">per year</p>
                    </div>
                    <ul className="space-y-3 font-rajdhani">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Premium verified coach profile</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Recruitment consulting</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Unlimited player contacts</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Unlimited tryout creation</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Advanced analytics and reporting</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Talent pipeline management</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300">Priority support</span>
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleCoachCTA}
                      className="w-full bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-black font-orbitron transform hover:scale-105 transition-all duration-300"
                    >
                      GO PREMIUM
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            {/* Leagues Pricing */}
            <TabsContent value="leagues" className="mt-8">
              <div className="glass-morphism border-white/20 rounded-xl p-8 md:p-12 text-center max-w-4xl mx-auto hover:border-purple-400/30 transition-all duration-300">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-orbitron text-3xl text-white mb-4">Custom League Solutions</h2>
                <p className="text-gray-300 font-rajdhani text-lg mb-8 max-w-2xl mx-auto">
                  We offer tailored solutions for leagues of all sizes. Our team will work with you to create a custom
                  package that meets your specific needs and budget.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
                  <div className="glass-morphism border-white/20 rounded-lg p-6 hover:border-cyan-400/30 transition-all duration-300 transform hover:scale-105">
                    <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <h3 className="font-orbitron text-white mb-2">Tournament Management</h3>
                    <p className="text-gray-300 font-rajdhani text-sm">
                      Complete tools for organizing and running tournaments
                    </p>
                  </div>
                  <div className="glass-morphism border-white/20 rounded-lg p-6 hover:border-purple-400/30 transition-all duration-300 transform hover:scale-105">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h3 className="font-orbitron text-white mb-2">Player Database</h3>
                    <p className="text-gray-300 font-rajdhani text-sm">
                      Comprehensive database of all registered players
                    </p>
                  </div>
                  <div className="glass-morphism border-white/20 rounded-lg p-6 hover:border-orange-400/30 transition-all duration-300 transform hover:scale-105">
                    <BarChart3 className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                    <h3 className="font-orbitron text-white mb-2">Broadcasting Tools</h3>
                    <p className="text-gray-300 font-rajdhani text-sm">
                      Integration with streaming platforms and overlays
                    </p>
                  </div>
                </div>
                <Link href="/about/contact">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-orbitron font-bold px-8 py-3 tracking-wider transform hover:scale-105 transition-all duration-300 shadow-lg">
                    CONTACT SALES
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-orbitron text-3xl text-white mb-4">Frequently Asked Questions</h2>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-cyan-400 via-purple-400 via-orange-400 to-transparent mx-auto"></div>
          </div>
          
          <div className="space-y-6">
            <div className="glass-morphism border-white/20 rounded-lg p-6 hover:border-cyan-400/30 transition-all duration-300">
              <h3 className="font-orbitron text-white text-xl mb-3 flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Can I change plans at any time?
              </h3>
              <p className="text-gray-300 font-rajdhani pl-5">
                Yes, you can upgrade, downgrade, or cancel your subscription at any time. Changes will take effect at
                the start of your next billing cycle.
              </p>
            </div>
            
            <div className="glass-morphism border-white/20 rounded-lg p-6 hover:border-purple-400/30 transition-all duration-300">
              <h3 className="font-orbitron text-white text-xl mb-3 flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                Does EVAL offer monthly plans?
              </h3>
              <p className="text-gray-300 font-rajdhani pl-5">
              To accomodate for the esports recruiting cycle, EVAL only offers annual plans. However, if you have specific needs, contact us at support@evalgaming.com.
              </p>
            </div>
            
            <div className="glass-morphism border-white/20 rounded-lg p-6 hover:border-orange-400/30 transition-all duration-300">
              <h3 className="font-orbitron text-white text-xl mb-3 flex items-center">
                <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                Do you offer student discounts?
              </h3>
              <p className="text-gray-300 font-rajdhani pl-5">
                Yes, we offer a 20% discount for verified students. Contact our support team with your student ID to
                apply for the discount.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Request Modal */}
      <Dialog open={requestDemoOpen} onOpenChange={setRequestDemoOpen}>
        <DialogContent className="sm:max-w-4xl glass-morphism border-white/20 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            <DialogTitle className="text-2xl font-bold text-white mb-4 font-orbitron">
              DISCOVER THE FUTURE OF COLLEGIATE ESPORTS RECRUITING
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Intro Section */}
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-400/20 border border-purple-400/30 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-cyan-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-orbitron">EVAL - Princeton-Backed Startup</h2>
                  <p className="text-slate-300 text-sm font-rajdhani">
                    The best recruiting platform offering analytics built specifically for collegiate esports programs
                  </p>
                </div>
              </div>
              <p className="text-slate-300 font-rajdhani leading-relaxed">
                After successfully powering the Spring 2025 Garden State Esports (GSE) Valorant season with rankings, MVP recognition, 
                and a full recruiting dashboard, EVAL is now excited to invite you to participate in our 2025 Summer Collegiate pilot.
              </p>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4 font-orbitron">Why coaches are choosing EVAL:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recruiting Dashboard */}
                <div className="glass-morphism border-white/20 rounded-lg p-4 hover:border-cyan-400/50 transition-all transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h4 className="font-bold text-white font-orbitron">Recruiting Dashboard</h4>
                  </div>
                  <p className="text-slate-300 text-sm font-rajdhani">
                    Browse ranked players across VALORANT, Rocket League, Overwatch, and Smash Ultimate. 
                    Bookmark top prospects and manage your recruiting pipeline—all in one platform.
                  </p>
                </div>

                {/* EVAL Rankings */}
                <div className="glass-morphism border-white/20 rounded-lg p-4 hover:border-orange-400/50 transition-all transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-orange-400" />
                    </div>
                    <h4 className="font-bold text-white font-orbitron">EVAL Rankings</h4>
                  </div>
                  <p className="text-slate-300 text-sm font-rajdhani">
                    Weekly player rankings, preseason projections, and season-long awards like Match MVP, 
                    Most Improved, and Most Clutch to give you a clear view of the most impactful players.
                  </p>
                </div>

                {/* EVAL Analytics */}
                <div className="glass-morphism border-white/20 rounded-lg p-4 hover:border-purple-400/50 transition-all transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-400" />
                    </div>
                    <h4 className="font-bold text-white font-orbitron">EVAL Analytics</h4>
                  </div>
                  <p className="text-slate-300 text-sm font-rajdhani">
                    Our proprietary Composite Score blends verified in-game stats with league data to create 
                    a single, trusted performance metric for evaluating player consistency and potential.
                  </p>
                </div>

                {/* Tryouts Platform */}
                <div className="glass-morphism border-white/20 rounded-lg p-4 hover:border-green-400/50 transition-all transform hover:scale-105">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-400" />
                    </div>
                    <h4 className="font-bold text-white font-orbitron">Tryouts Platform</h4>
                  </div>
                  <p className="text-slate-300 text-sm font-rajdhani">
                    Post and manage tryouts to discover top talent nationwide. Tryouts can be hosted 
                    for free or used to raise funds for your program or scholarships.
                  </p>
                </div>

                {/* Academic Profiles */}
                <div className="glass-morphism border-white/20 rounded-lg p-4 hover:border-blue-400/50 transition-all transform hover:scale-105 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="font-bold text-white font-orbitron">Academic & Extracurricular Profiles</h4>
                  </div>
                  <p className="text-slate-300 text-sm font-rajdhani">
                    View player GPAs, academic interests, and extracurricular involvement to evaluate 
                    holistic fit for your program. EVAL is free for students to sign up, helping your 
                    program reach a wider talent pool while supporting equitable access to recruitment.
                  </p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-600/10 to-cyan-400/10 border border-cyan-400/30 rounded-lg p-12 text-center">
              <div className="flex flex-col gap-8 justify-center items-center">
                <Button
                  onClick={handleScheduleDemo}
                  className="bg-gradient-to-r from-purple-600 to-cyan-400 hover:from-purple-700 hover:to-cyan-500 text-white font-orbitron font-bold px-20 py-8 text-3xl tracking-wider flex items-center space-x-5 transform hover:scale-105 transition-all duration-200 shadow-xl shadow-purple-500/30"
                >
                  <Calendar className="w-10 h-10" />
                  <span>SCHEDULE A DEMO</span>
                </Button>
                <div className="text-slate-400 text-sm font-rajdhani">
                  or email{" "}
                  <a href="mailto:support@evalgaming.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    support@evalgaming.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={resetAndCloseModal}>
        <DialogContent className="sm:max-w-lg glass-morphism border-white/20 text-white">
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
