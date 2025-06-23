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
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            PRICING PLANS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-3xl mx-auto">
            Choose the perfect plan to elevate your esports journey
          </p>

          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setRequestDemoOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-cyan-400 hover:from-purple-700 hover:to-cyan-500 text-white font-orbitron font-bold px-8 py-3 tracking-wider"
            >
              REQUEST A DEMO
            </Button>
          </div>
        </div>

        {/* Pricing Tabs */}
        <Tabs defaultValue="players" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 mb-12 bg-gray-800 rounded-full p-1 w-full max-w-md mx-auto">
            <TabsTrigger
              value="players"
              className="font-orbitron text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black rounded-full"
            >
              PLAYERS
            </TabsTrigger>
            <TabsTrigger
              value="coaches"
              className="font-orbitron text-white data-[state=active]:bg-orange-400 data-[state=active]:text-black rounded-full"
            >
              COACHES
            </TabsTrigger>
            <TabsTrigger
              value="leagues"
              className="font-orbitron text-white data-[state=active]:bg-purple-400 data-[state=active]:text-black rounded-full"
            >
              LEAGUES
            </TabsTrigger>
          </TabsList>

          {/* Players Pricing */}
          <TabsContent value="players" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <Card className="col-2 bg-gray-800 border-gray-700 hover:border-gray-500 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white font-orbitron text-2xl">Free</CardTitle>
                  <CardDescription className="text-gray-400 font-rajdhani">
                    Get started with basic features
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <p className="text-4xl font-orbitron text-white mb-2">$0</p>
                    <p className="text-gray-400 font-rajdhani">Free pilot</p>
                  </div>
                  <ul className="space-y-3 font-rajdhani">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Basic player profile</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">View public tryouts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Upload 1 gameplay clip</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
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
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-orbitron"
                  >
                    GET STARTED
                  </Button>
                </CardFooter>
              </Card>

              {/* Eval+ Tier */}
              {/* <Card className="bg-gray-800 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-400/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-white font-orbitron text-2xl">Eval+</CardTitle>
                    <Badge className="bg-cyan-400 text-black font-orbitron">POPULAR</Badge>
                  </div>
                  <CardDescription className="text-gray-400 font-rajdhani">
                    Enhanced features for serious players
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <p className="text-4xl font-orbitron text-white mb-2">$3</p>
                    <p className="text-gray-400 font-rajdhani">per month</p>
                  </div>
                  <ul className="space-y-3 font-rajdhani">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Enhanced player profile</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Priority registration for tryouts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Upload up to 10 gameplay clips</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Send up to 10 coach messages</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Basic performance analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Increased visibility to coaches</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">UPGRADE NOW</Button>
                </CardFooter>
              </Card> */}

              {/* Eval++ Tier */}
              {/* <Card className="bg-gray-800 border-purple-400/50 hover:border-purple-400 transition-all duration-300 shadow-lg shadow-purple-400/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-white font-orbitron text-2xl">Eval++</CardTitle>
                    <Badge className="bg-purple-400 text-black font-orbitron">PREMIUM</Badge>
                  </div>
                  <CardDescription className="text-gray-400 font-rajdhani">
                    Maximum exposure and opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <p className="text-4xl font-orbitron text-white mb-2">$10</p>
                    <p className="text-gray-400 font-rajdhani">per month</p>
                  </div>
                  <ul className="space-y-3 font-rajdhani">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Premium player profile with highlights</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Early access to exclusive tryouts</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Unlimited gameplay clip uploads</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Unlimited coach messages</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Advanced performance analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Featured profile for maximum visibility</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">1-on-1 coaching session per month</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-purple-400 hover:bg-purple-500 text-black font-orbitron">
                    GO PREMIUM
                  </Button>
                </CardFooter>
              </Card> */}
            </div>
          </TabsContent>

          {/* Coaches Pricing */}
          <TabsContent value="coaches" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-500 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white font-orbitron text-2xl">Free</CardTitle>
                  <CardDescription className="text-gray-400 font-rajdhani">Basic scouting tools</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <p className="text-4xl font-orbitron text-white mb-2">$0</p>
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
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-orbitron"
                  >
                    GET STARTED
                  </Button>
                </CardFooter>
              </Card>

              {/* Eval+ Tier */}
              <Card className="bg-gray-800 border-orange-400/50 hover:border-orange-400 transition-all duration-300 shadow-lg shadow-orange-400/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-white font-orbitron text-2xl">Eval+</CardTitle>
                    <Badge className="bg-orange-400 text-black font-orbitron">POPULAR</Badge>
                  </div>
                  <CardDescription className="text-gray-400 font-rajdhani">Enhanced recruiting tools</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <p className="text-4xl font-orbitron text-white mb-2">$0</p>
                    <p className="text-gray-400 font-rajdhani">per month</p>
                  </div>
                  <ul className="space-y-3 font-rajdhani">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Enhanced coach profile</span>
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
                      <span className="text-gray-300">Create up to 4 tryouts per month</span>
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
                    className="w-full bg-orange-400 hover:bg-orange-500 text-black font-orbitron"
                  >
                    UPGRADE NOW
                  </Button>
                </CardFooter>
              </Card>

              {/* Eval++ Tier */}
              <Card className="bg-gray-800 border-purple-400/50 hover:border-purple-400 transition-all duration-300 shadow-lg shadow-purple-400/10">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-white font-orbitron text-2xl">Eval++</CardTitle>
                    <Badge className="bg-purple-400 text-black font-orbitron">PREMIUM</Badge>
                  </div>
                  <CardDescription className="text-gray-400 font-rajdhani">
                    Complete recruiting solution
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <p className="text-4xl font-orbitron text-white mb-2">$0</p>
                    <p className="text-gray-400 font-rajdhani">per month</p>
                  </div>
                  <ul className="space-y-3 font-rajdhani">
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Premium coach profile with verification</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Advanced talent search algorithm</span>
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
                    className="w-full bg-purple-400 hover:bg-purple-500 text-black font-orbitron"
                  >
                    GO PREMIUM
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          {/* Leagues Pricing */}
          <TabsContent value="leagues" className="mt-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 md:p-12 text-center max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-orbitron text-3xl text-white mb-4">Custom League Solutions</h2>
              <p className="text-gray-300 font-rajdhani text-lg mb-8 max-w-2xl mx-auto">
                We offer tailored solutions for leagues of all sizes. Our team will work with you to create a custom
                package that meets your specific needs and budget.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-orbitron text-white mb-2">Tournament Management</h3>
                  <p className="text-gray-300 font-rajdhani text-sm">
                    Complete tools for organizing and running tournaments
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-orbitron text-white mb-2">Player Database</h3>
                  <p className="text-gray-300 font-rajdhani text-sm">
                    Comprehensive database of all registered players
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="font-orbitron text-white mb-2">Broadcasting Tools</h3>
                  <p className="text-gray-300 font-rajdhani text-sm">
                    Integration with streaming platforms and overlays
                  </p>
                </div>
              </div>
              <Link href="/about/contact">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-orbitron font-bold px-8 py-3 tracking-wider">
                CONTACT SALES
              </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="font-orbitron text-3xl text-white mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-orbitron text-white text-xl mb-2">Can I change plans at any time?</h3>
              <p className="text-gray-300 font-rajdhani">
                Yes, you can upgrade, downgrade, or cancel your subscription at any time. Changes will take effect at
                the start of your next billing cycle.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-orbitron text-white text-xl mb-2">Are there any long-term contracts?</h3>
              <p className="text-gray-300 font-rajdhani">
                No, all our plans are month-to-month with no long-term commitment required. You can cancel anytime.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="font-orbitron text-white text-xl mb-2">Do you offer student discounts?</h3>
              <p className="text-gray-300 font-rajdhani">
                Yes, we offer a 20% discount for verified students. Contact our support team with your student ID to
                apply for the discount.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Request Modal */}
      <Dialog open={requestDemoOpen} onOpenChange={setRequestDemoOpen}>
        <DialogContent className="sm:max-w-4xl bg-slate-900 text-white border-none max-h-[90vh] overflow-y-auto">
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
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-cyan-400/50 transition-all">
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
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-orange-400/50 transition-all">
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
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-purple-400/50 transition-all">
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
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-green-400/50 transition-all">
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
                <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-blue-400/50 transition-all md:col-span-2">
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
                  <a href="mailto:info@evalgaming.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    info@evalgaming.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
