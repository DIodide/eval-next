"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, X, Zap } from "lucide-react"

export default function PricingPage() {
  const [requestDemoOpen, setRequestDemoOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">

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
              className="font-orbitron data-[state=active]:bg-cyan-400 data-[state=active]:text-black rounded-full"
            >
              PLAYERS
            </TabsTrigger>
            <TabsTrigger
              value="coaches"
              className="font-orbitron data-[state=active]:bg-orange-400 data-[state=active]:text-black rounded-full"
            >
              COACHES
            </TabsTrigger>
            <TabsTrigger
              value="leagues"
              className="font-orbitron data-[state=active]:bg-purple-400 data-[state=active]:text-black rounded-full"
            >
              LEAGUES
            </TabsTrigger>
          </TabsList>

          {/* Players Pricing */}
          <TabsContent value="players" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Tier */}
              <Card className="bg-gray-800 border-gray-700 hover:border-gray-500 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white font-orbitron text-2xl">Free</CardTitle>
                  <CardDescription className="text-gray-400 font-rajdhani">
                    Get started with basic features
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="mb-4">
                    <p className="text-4xl font-orbitron text-white mb-2">$0</p>
                    <p className="text-gray-400 font-rajdhani">Forever free</p>
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
                  <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-orbitron">GET STARTED</Button>
                </CardFooter>
              </Card>

              {/* Eval+ Tier */}
              <Card className="bg-gray-800 border-cyan-400/50 hover:border-cyan-400 transition-all duration-300 shadow-lg shadow-cyan-400/10">
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
              </Card>

              {/* Eval++ Tier */}
              <Card className="bg-gray-800 border-purple-400/50 hover:border-purple-400 transition-all duration-300 shadow-lg shadow-purple-400/10">
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
              </Card>
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
                    <p className="text-gray-400 font-rajdhani">Forever free</p>
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
                      <Check className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Contact up to 5 players per month</span>
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
                  <Button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-orbitron">GET STARTED</Button>
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
                    <p className="text-4xl font-orbitron text-white mb-2">$15</p>
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
                      <span className="text-gray-300">Contact up to 30 players per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">Create up to 3 tryouts</span>
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
                  <Button className="w-full bg-orange-400 hover:bg-orange-500 text-black font-orbitron">
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
                    <p className="text-4xl font-orbitron text-white mb-2">$40</p>
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
                  <Button className="w-full bg-purple-400 hover:bg-purple-500 text-black font-orbitron">
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
              <Button className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-orbitron font-bold px-8 py-3 tracking-wider">
                CONTACT SALES
              </Button>
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

    </div>
  )
}
