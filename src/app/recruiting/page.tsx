"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, BarChart3, MessageSquare, Users, Trophy, GraduationCap, Eye, Award, UserCheck } from "lucide-react"
import { SignUpButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { user } = useUser()
  const router = useRouter()



  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 via-purple-500/10 to-orange-500/15 z-10" />
        <div className="absolute inset-0 bg-black/66 z-5" />
        {/* <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Esports gaming background"
          fill
          className="object-cover"
          priority
        /> */}
        <div className="relative z-20 max-w-6xl mx-auto px-6">
          <h1 className="font-orbitron text-4xl md:text-6xl font-bold mb-6">
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
            <div className="bg-black/40 backdrop-blur-sm rounded-md p-8 border border-cyan-400/30">
              <div className="mb-6">
                <GraduationCap className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <h3 className="font-orbitron text-2xl font-bold mb-2">FOR PLAYERS & FAMILIES</h3>
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
              {user ? (
                <Button 
                  onClick={() => router.push('/dashboard/player')}
                  className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-3"
                >
                  START YOUR JOURNEY
                </Button>
              ) : (
                <SignUpButton
                  mode="modal"
                  unsafeMetadata={{ userType: "player" }}
                >
                  <Button className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-3">
                    START YOUR JOURNEY
                  </Button>
                </SignUpButton>
              )}
            </div>

            {/* Coaches Path */}
            <div className="bg-black/40 backdrop-blur-sm rounded-md p-8 border border-orange-400/30">
              <div className="mb-6">
                <UserCheck className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-2xl font-orbitron font-bold mb-2">FOR COACHES & SCOUTS</h3>
                <p className="text-gray-300">Discover talent, analyze performance, and build your roster</p>
              </div>
              <ul className="text-left space-y-2 mb-6 text-sm">
                <li className="flex items-center">
                  <BarChart3 className="w-4 h-4 text-orange-400 mr-2" />
                  Advanced player analytics
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 text-orange-400 mr-2" />
                  Access to nationwide recruiting
                </li>
                <li className="flex items-center">
                  <MessageSquare className="w-4 h-4 text-orange-400 mr-2" />
                  Direct communication tools
                </li>
              </ul>
              {user ? (
                <Button 
                  onClick={() => router.push('/dashboard/coaches')}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-black font-semibold py-3"
                >
                  FIND TALENT
                </Button>
              ) : (
                <SignUpButton
                  mode="modal"
                  unsafeMetadata={{ userType: "coach" }}
                >
                  <Button className="w-full bg-orange-400 hover:bg-orange-500 text-black font-semibold py-3">
                    FIND TALENT
                  </Button>
                </SignUpButton>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Players Section */}
      <section className="border-t border-slate-800/40 bg-gradient-to-b from-gray-900/78 to-black/95 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-orbitron md:text-5xl font-bold mb-4 text-cyan-400">FOR PLAYERS & FAMILIES</h2>
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
            {user ? (
              <Button 
                onClick={() => router.push('/dashboard/player')}
                size="lg" 
                className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-4"
              >
                CREATE PLAYER PROFILE
              </Button>
            ) : (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: "player" }}
              >
                <Button size="lg" className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-4">
                  CREATE PLAYER PROFILE
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="bg-gradient-to-b from-black/95 to-gray-900/85 text-white py-20 border-t border-gray-200/40">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-orbitron md:text-5xl font-bold mb-4 text-orange-400">FOR COACHES & SCOUTS</h2>
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
            {user ? (
              <Button 
                onClick={() => router.push('/dashboard/coaches')}
                size="lg" 
                className="bg-orange-400 hover:bg-orange-500 text-black font-semibold px-8 py-4"
              >
                START RECRUITING
              </Button>
            ) : (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: "coach" }}
              >
                <Button size="lg" className="bg-orange-400 hover:bg-orange-500 text-black font-semibold px-8 py-4">
                  START RECRUITING
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-900/85 text-white py-20 border-t border-gray-100/35 relative overflow-hidden">
        {/* Background accent elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-orange-500/10 to-transparent rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mb-16">
            <h2 className="font-orbitron text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
              HOW IT WORKS
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Your pathway to esports excellence starts here
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
            {/* Player Journey */}
            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 rounded-2xl p-8 border border-cyan-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black rounded-2xl px-6 py-3 font-orbitron font-bold text-lg shadow-sm shadow-cyan-400/25">
                    PLAYER JOURNEY
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-400/25 group-hover:scale-110 transition-transform duration-300">
                        1
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
                    </div>
                    <div className="text-left pt-2">
                      <h4 className="font-orbitron font-bold mb-2 text-white text-lg">Create Your Profile</h4>
                      <p className="text-gray-300 leading-relaxed">Set up your comprehensive player profile with game stats, achievements, and showcase your gaming journey</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-400/25 group-hover:scale-110 transition-transform duration-300">
                        2
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
                    </div>
                    <div className="text-left pt-2">
                      <h4 className="font-orbitron font-bold mb-2 text-white text-lg">Compete & Improve</h4>
                      <p className="text-gray-300 leading-relaxed">Participate in elite combines, track your performance metrics, and continuously level up your skills</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6 group">
                    <div className="bg-gradient-to-r from-cyan-400 to-cyan-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-cyan-400/25 group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                    <div className="text-left pt-2">
                      <h4 className="font-orbitron font-bold mb-2 text-white text-lg">Get Discovered</h4>
                      <p className="text-gray-300 leading-relaxed">College scouts discover and recruit you based on your outstanding performance and potential</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach Journey */}
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 rounded-2xl p-8 border border-orange-400/20 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-8">
                  <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-black rounded-2xl px-6 py-3 font-orbitron font-bold text-lg shadow-sm shadow-orange-400/25">
                    COACH JOURNEY
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-orange-400/25 group-hover:scale-110 transition-transform duration-300">
                        1
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-orange-400/50 to-transparent"></div>
                    </div>
                    <div className="text-left pt-2">
                      <h4 className="font-orbitron font-bold mb-2 text-white text-lg">Set Up Scouting</h4>
                      <p className="text-gray-300 leading-relaxed">Define your recruitment criteria, preferences, and establish your scouting parameters for optimal talent discovery</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6 group">
                    <div className="relative">
                      <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-orange-400/25 group-hover:scale-110 transition-transform duration-300">
                        2
                      </div>
                      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-orange-400/50 to-transparent"></div>
                    </div>
                    <div className="text-left pt-2">
                      <h4 className="font-orbitron font-bold mb-2 text-white text-lg">Analyze Players</h4>
                      <p className="text-gray-300 leading-relaxed">Review comprehensive analytics, performance data, and detailed insights to identify top-tier talent</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-6 group">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-500 text-black rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg shadow-orange-400/25 group-hover:scale-110 transition-transform duration-300">
                      3
                    </div>
                    <div className="text-left pt-2">
                      <h4 className="font-orbitron font-bold mb-2 text-white text-lg">Recruit Talent</h4>
                      <p className="text-gray-300 leading-relaxed">Connect directly with players, engage with families, and build your championship-winning roster</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black/85 text-white py-20 relative overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-orange-500/8 via-purple-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500/3 to-transparent rounded-full blur-2xl"></div>
        
        <div className="container mx-auto px-6 flex flex-col items-center justify-center relative z-10">
          {/* Enhanced Title Section */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <h2 className="font-orbitron text-4xl md:text-7xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-white to-orange-400 bg-clip-text text-transparent leading-tight">
                CLAIM YOUR
              </h2>
              <h2 className="font-orbitron text-4xl md:text-7xl font-black mb-6 bg-gradient-to-r from-orange-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                SCHOLARSHIP TODAY
              </h2>
            </div>
            
            {/* Rainbow Divider */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent to-cyan-500"></div>
              <div className="w-8 h-1 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
              <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-orange-500"></div>
              <div className="w-8 h-1 bg-gradient-to-r from-orange-500 to-purple-500"></div>
              <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-transparent"></div>
            </div>
            
                         <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
               Unlock your potential and take the next step toward your esports future
             </p>
          </div>

          {/* Enhanced Stats Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Main Scholarship Stat */}
            <div className="md:col-span-1 flex flex-col items-center group">
              <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-3xl p-8 border border-cyan-400/30 backdrop-blur-sm group-hover:border-cyan-400/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-cyan-400/20 w-full">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-2xl font-bold text-black">$</span>
                    </div>
                  </div>
                  <h3 className="font-orbitron text-5xl md:text-6xl font-black text-transparent bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text mb-3 group-hover:scale-105 transition-transform duration-300">
                    50M+
                  </h3>
                  <p className="text-gray-300 font-medium text-lg">Scholarships Available</p>
                  <div className="w-12 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent mx-auto mt-3"></div>
                </div>
              </div>
            </div>

                         {/* Supporting Stats */}
             <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/5 rounded-2xl p-6 border border-purple-400/20 backdrop-blur-sm group hover:border-purple-400/40 transition-all duration-300">
                 <div className="text-center">
                   <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                     <BarChart3 className="w-6 h-6 text-black" />
                   </div>
                   <h4 className="font-orbitron text-2xl font-bold text-purple-400 mb-2">24/7</h4>
                   <p className="text-gray-400 text-sm">Platform Access</p>
                 </div>
               </div>

               <div className="bg-gradient-to-br from-orange-500/15 to-orange-600/5 rounded-2xl p-6 border border-orange-400/20 backdrop-blur-sm group hover:border-orange-400/40 transition-all duration-300">
                 <div className="text-center">
                   <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                     <Trophy className="w-6 h-6 text-black" />
                   </div>
                   <h4 className="font-orbitron text-2xl font-bold text-orange-400 mb-2">ALL</h4>
                   <p className="text-gray-400 text-sm">Major Games Supported</p>
                 </div>
               </div>

               <div className="bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 rounded-2xl p-6 border border-cyan-400/20 backdrop-blur-sm group hover:border-cyan-400/40 transition-all duration-300">
                 <div className="text-center">
                   <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                     <TrendingUp className="w-6 h-6 text-black" />
                   </div>
                   <h4 className="font-orbitron text-xl font-bold text-cyan-400 mb-2">REAL-TIME</h4>
                   <p className="text-gray-400 text-sm">Performance Analytics</p>
                 </div>
               </div>

               <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/5 rounded-2xl p-6 border border-purple-400/20 backdrop-blur-sm group hover:border-purple-400/40 transition-all duration-300">
                 <div className="text-center">
                   <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                     <MessageSquare className="w-6 h-6 text-black" />
                   </div>
                   <h4 className="font-orbitron text-xl font-bold text-purple-400 mb-2">INSTANT</h4>
                   <p className="text-gray-400 text-sm">Communication Tools</p>
                 </div>
               </div>
             </div>
          </div>

          
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500/60 via-purple-500/60 to-orange-500/60 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="font-orbitron text-4xl md:text-6xl font-black mb-6 cyber-text">READY TO GET STARTED?</h2>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
            Join the platform that&apos;s revolutionizing esports recruitment and player development
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
            {user ? (
              <Button
                onClick={() => router.push('/dashboard/player')}
                size="lg"
                className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-4 text-lg flex-1"
              >
                JOIN AS PLAYER
              </Button>
            ) : (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: "player" }}
              >
                <Button
                  size="lg"
                  className="bg-cyan-400 hover:bg-cyan-500 text-black font-semibold px-8 py-4 text-lg flex-1"
                >
                  JOIN AS PLAYER
                </Button>
              </SignUpButton>
            )}
            {user ? (
              <Button
                onClick={() => router.push('/dashboard/coaches')}
                size="lg"
                className="bg-orange-400 hover:bg-orange-500 text-black font-semibold px-8 py-4 text-lg flex-1"
              >
                JOIN AS COACH
              </Button>
            ) : (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: "coach" }}
              >
                <Button
                  size="lg"
                  className="bg-orange-400 hover:bg-orange-500 text-black font-semibold px-8 py-4 text-lg flex-1"
                >
                  JOIN AS COACH
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
