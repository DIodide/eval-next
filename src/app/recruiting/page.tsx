"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  BarChart3,
  MessageSquare,
  Users,
  Trophy,
  GraduationCap,
  Eye,
  Award,
  UserCheck,
} from "lucide-react";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center py-5 text-center text-white md:h-screen">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-cyan-500/30 via-purple-500/10 to-orange-500/15" />
        <div className="absolute inset-0 z-5 bg-black/66" />
        {/* <Image
          src="/placeholder.svg?height=1080&width=1920"
          alt="Esports gaming background"
          fill
          className="object-cover"
          priority
        /> */}
        <div className="relative z-20 mx-auto max-w-6xl px-6">
          <h1 className="font-orbitron mb-6 text-4xl font-bold md:mb-10 md:text-7xl">
            THE BRIDGE BETWEEN
            <br />
            <span className="text-cyan-400">TALENT</span> AND{" "}
            <span className="text-cyan-400">OPPORTUNITY</span>
          </h1>
          <p className="mx-auto mb-12 max-w-4xl text-xl font-medium md:text-2xl">
            Connecting esports players with college programs through advanced
            analytics and recruitment tools
          </p>

          {/* Dual CTA Section */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* Players/Families Path */}
            <div className="rounded-md border border-cyan-400/30 bg-black/40 p-8 backdrop-blur-sm">
              <div className="mb-6">
                <GraduationCap className="mx-auto mb-4 h-16 w-16 text-cyan-400" />
                <h3 className="font-orbitron mb-2 text-2xl font-bold">
                  FOR PLAYERS & FAMILIES
                </h3>
                <p className="text-gray-300">
                  Get discovered, improve your game, and earn scholarships
                </p>
              </div>
              <ul className="mb-6 space-y-2 text-left text-sm">
                <li className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4 text-cyan-400" />
                  Track your rankings and stats
                </li>
                <li className="flex items-center">
                  <Award className="mr-2 h-4 w-4 text-cyan-400" />
                  Access to $50M+ in scholarships
                </li>
                <li className="flex items-center">
                  <Eye className="mr-2 h-4 w-4 text-cyan-400" />
                  Get noticed by college scouts
                </li>
              </ul>
              {user ? (
                <Button
                  onClick={() => router.push("/dashboard/player")}
                  className="w-full bg-cyan-400 py-3 font-semibold text-black hover:bg-cyan-500"
                >
                  START YOUR JOURNEY
                </Button>
              ) : (
                <SignUpButton
                  mode="modal"
                  unsafeMetadata={{ userType: "player" }}
                >
                  <Button className="w-full bg-cyan-400 py-3 font-semibold text-black hover:bg-cyan-500">
                    START YOUR JOURNEY
                  </Button>
                </SignUpButton>
              )}
            </div>

            {/* Coaches Path */}
            <div className="rounded-md border border-orange-400/30 bg-black/40 p-8 backdrop-blur-sm">
              <div className="mb-6">
                <UserCheck className="mx-auto mb-4 h-16 w-16 text-orange-400" />
                <h3 className="font-orbitron mb-2 text-2xl font-bold">
                  FOR COACHES & SCOUTS
                </h3>
                <p className="text-gray-300">
                  Discover talent, analyze performance, and build your roster
                </p>
              </div>
              <ul className="mb-6 space-y-2 text-left text-sm">
                <li className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-orange-400" />
                  Advanced player analytics
                </li>
                <li className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-orange-400" />
                  Access to nationwide recruiting
                </li>
                <li className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4 text-orange-400" />
                  Direct communication tools
                </li>
              </ul>
              {user ? (
                <Button
                  onClick={() => router.push("/dashboard/coaches")}
                  className="w-full bg-orange-400 py-3 font-semibold text-black hover:bg-orange-500"
                >
                  FIND TALENT
                </Button>
              ) : (
                <SignUpButton
                  mode="modal"
                  unsafeMetadata={{ userType: "coach" }}
                >
                  <Button className="w-full bg-orange-400 py-3 font-semibold text-black hover:bg-orange-500">
                    FIND TALENT
                  </Button>
                </SignUpButton>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Players Section */}
      <section className="border-t border-slate-800/40 bg-gradient-to-b from-gray-900/78 to-black/95 py-20 text-white">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-orbitron mb-4 text-4xl font-bold text-cyan-400 md:text-5xl">
              FOR PLAYERS & FAMILIES
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Take control of your esports future with tools designed to
              showcase your skills and connect you with opportunities
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-cyan-400/20 bg-gray-800 transition-colors hover:border-cyan-400/50">
              <CardContent className="p-8 text-center">
                <TrendingUp className="mx-auto mb-4 h-16 w-16 text-cyan-400" />
                <h3 className="mb-4 text-xl font-bold text-gray-200">
                  TRACK YOUR PROGRESS
                </h3>
                <p className="text-gray-400">
                  Monitor your performance across multiple games with detailed
                  analytics and improvement insights
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-400/20 bg-gray-800 transition-colors hover:border-cyan-400/50">
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto mb-4 h-16 w-16 text-cyan-400" />
                <h3 className="mb-4 text-xl font-bold text-gray-200">
                  COMPETE IN COMBINES
                </h3>
                <p className="text-gray-400">
                  Participate in tournaments and showcases in front of college
                  scouts and recruiters
                </p>
              </CardContent>
            </Card>

            <Card className="border-cyan-400/20 bg-gray-800 transition-colors hover:border-cyan-400/50">
              <CardContent className="p-8 text-center">
                <GraduationCap className="mx-auto mb-4 h-16 w-16 text-cyan-400" />
                <h3 className="mb-4 text-xl font-bold text-gray-200">
                  EARN SCHOLARSHIPS
                </h3>
                <p className="text-gray-400">
                  Get connected to over $50M in available esports scholarships
                  and funding opportunities
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            {user ? (
              <Button
                onClick={() => router.push("/dashboard/player")}
                size="lg"
                className="bg-cyan-400 px-8 py-4 font-semibold text-black hover:bg-cyan-500"
              >
                CREATE PLAYER PROFILE
              </Button>
            ) : (
              <SignUpButton
                mode="modal"
                unsafeMetadata={{ userType: "player" }}
              >
                <Button
                  size="lg"
                  className="bg-cyan-400 px-8 py-4 font-semibold text-black hover:bg-cyan-500"
                >
                  CREATE PLAYER PROFILE
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section className="border-t border-gray-200/40 bg-gradient-to-b from-black/95 to-gray-900/85 py-20 text-white">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-orbitron mb-4 text-4xl font-bold text-orange-400 md:text-5xl">
              FOR COACHES & SCOUTS
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-gray-300">
              Discover and recruit the next generation of esports talent with
              comprehensive analytics and scouting tools
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            <Card className="border-orange-400/20 bg-gray-800 transition-colors hover:border-orange-400/50">
              <CardContent className="p-8 text-center">
                <BarChart3 className="mx-auto mb-4 h-16 w-16 text-orange-400" />
                <h3 className="mb-4 text-xl font-bold text-gray-200">
                  ADVANCED ANALYTICS
                </h3>
                <p className="text-gray-400">
                  Access detailed performance metrics, gameplay analysis, and
                  predictive insights for every player
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-400/20 bg-gray-800 transition-colors hover:border-orange-400/50">
              <CardContent className="p-8 text-center">
                <Eye className="mx-auto mb-4 h-16 w-16 text-orange-400" />
                <h3 className="mb-4 text-xl font-bold text-gray-200">
                  SCOUT TALENT
                </h3>
                <p className="text-gray-400">
                  Browse thousands of verified players, filter by skill level,
                  game, and region to find perfect fits
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-400/20 bg-gray-800 transition-colors hover:border-orange-400/50">
              <CardContent className="p-8 text-center">
                <MessageSquare className="mx-auto mb-4 h-16 w-16 text-orange-400" />
                <h3 className="mb-4 text-xl font-bold text-gray-200">
                  DIRECT RECRUITMENT
                </h3>
                <p className="text-gray-400">
                  Connect directly with players and families through our secure
                  messaging and recruitment platform
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            {user ? (
              <Button
                onClick={() => router.push("/dashboard/coaches")}
                size="lg"
                className="bg-orange-400 px-8 py-4 font-semibold text-black hover:bg-orange-500"
              >
                START RECRUITING
              </Button>
            ) : (
              <SignUpButton mode="modal" unsafeMetadata={{ userType: "coach" }}>
                <Button
                  size="lg"
                  className="bg-orange-400 px-8 py-4 font-semibold text-black hover:bg-orange-500"
                >
                  START RECRUITING
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative overflow-hidden border-t border-gray-100/35 bg-gray-900/85 py-20 text-white">
        {/* Background accent elements */}
        <div className="absolute top-0 left-0 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/10 to-transparent blur-xl"></div>
        <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tl from-orange-500/10 to-transparent blur-xl"></div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="font-orbitron mb-4 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-4xl font-black text-transparent md:text-6xl">
              HOW IT WORKS
            </h2>
            <div className="mx-auto mb-6 h-1 w-24 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500"></div>
            <p className="mx-auto max-w-3xl text-xl font-medium text-gray-300">
              Your pathway to esports excellence starts here
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Player Journey */}
            <div className="relative">
              <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 p-8 backdrop-blur-sm">
                <div className="mb-8 flex items-center justify-center">
                  <div className="font-orbitron rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 px-6 py-3 text-lg font-bold text-black shadow-sm shadow-cyan-400/25">
                    PLAYER JOURNEY
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group flex items-start space-x-6">
                    <div className="relative">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-lg font-bold text-black shadow-lg shadow-cyan-400/25 transition-transform duration-300 group-hover:scale-110">
                        1
                      </div>
                      <div className="absolute top-12 left-1/2 h-8 w-0.5 -translate-x-1/2 transform bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
                    </div>
                    <div className="pt-2 text-left">
                      <h4 className="font-orbitron mb-2 text-lg font-bold text-white">
                        Create Your Profile
                      </h4>
                      <p className="leading-relaxed text-gray-300">
                        Set up your comprehensive player profile with game
                        stats, achievements, and showcase your gaming journey
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-6">
                    <div className="relative">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-lg font-bold text-black shadow-lg shadow-cyan-400/25 transition-transform duration-300 group-hover:scale-110">
                        2
                      </div>
                      <div className="absolute top-12 left-1/2 h-8 w-0.5 -translate-x-1/2 transform bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
                    </div>
                    <div className="pt-2 text-left">
                      <h4 className="font-orbitron mb-2 text-lg font-bold text-white">
                        Compete & Improve
                      </h4>
                      <p className="leading-relaxed text-gray-300">
                        Participate in elite combines, track your performance
                        metrics, and continuously level up your skills
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 text-lg font-bold text-black shadow-lg shadow-cyan-400/25 transition-transform duration-300 group-hover:scale-110">
                      3
                    </div>
                    <div className="pt-2 text-left">
                      <h4 className="font-orbitron mb-2 text-lg font-bold text-white">
                        Get Discovered
                      </h4>
                      <p className="leading-relaxed text-gray-300">
                        College scouts discover and recruit you based on your
                        outstanding performance and potential
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach Journey */}
            <div className="relative">
              <div className="rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-8 backdrop-blur-sm">
                <div className="mb-8 flex items-center justify-center">
                  <div className="font-orbitron rounded-2xl bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-3 text-lg font-bold text-black shadow-sm shadow-orange-400/25">
                    COACH JOURNEY
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group flex items-start space-x-6">
                    <div className="relative">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-lg font-bold text-black shadow-lg shadow-orange-400/25 transition-transform duration-300 group-hover:scale-110">
                        1
                      </div>
                      <div className="absolute top-12 left-1/2 h-8 w-0.5 -translate-x-1/2 transform bg-gradient-to-b from-orange-400/50 to-transparent"></div>
                    </div>
                    <div className="pt-2 text-left">
                      <h4 className="font-orbitron mb-2 text-lg font-bold text-white">
                        Set Up Scouting
                      </h4>
                      <p className="leading-relaxed text-gray-300">
                        Define your recruitment criteria, preferences, and
                        establish your scouting parameters for optimal talent
                        discovery
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-6">
                    <div className="relative">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-lg font-bold text-black shadow-lg shadow-orange-400/25 transition-transform duration-300 group-hover:scale-110">
                        2
                      </div>
                      <div className="absolute top-12 left-1/2 h-8 w-0.5 -translate-x-1/2 transform bg-gradient-to-b from-orange-400/50 to-transparent"></div>
                    </div>
                    <div className="pt-2 text-left">
                      <h4 className="font-orbitron mb-2 text-lg font-bold text-white">
                        Analyze Players
                      </h4>
                      <p className="leading-relaxed text-gray-300">
                        Review comprehensive analytics, performance data, and
                        detailed insights to identify top-tier talent
                      </p>
                    </div>
                  </div>

                  <div className="group flex items-start space-x-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-lg font-bold text-black shadow-lg shadow-orange-400/25 transition-transform duration-300 group-hover:scale-110">
                      3
                    </div>
                    <div className="pt-2 text-left">
                      <h4 className="font-orbitron mb-2 text-lg font-bold text-white">
                        Recruit Talent
                      </h4>
                      <p className="leading-relaxed text-gray-300">
                        Connect directly with players, engage with families, and
                        build your championship-winning roster
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative overflow-hidden bg-black/85 py-20 text-white">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-0 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5 blur-3xl"></div>
        <div className="absolute right-0 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tl from-orange-500/8 via-purple-500/5 to-cyan-500/5 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-r from-purple-500/3 to-transparent blur-2xl"></div>

        <div className="relative z-10 container mx-auto flex flex-col items-center justify-center px-6">
          {/* Enhanced Title Section */}
          <div className="mb-16 text-center">
            <div className="mb-6">
              <h2 className="font-orbitron mb-4 bg-gradient-to-r from-cyan-400 via-white to-orange-400 bg-clip-text text-4xl leading-tight font-black text-transparent md:text-7xl">
                CLAIM YOUR
              </h2>
              <h2 className="font-orbitron mb-6 bg-gradient-to-r from-orange-400 via-purple-400 to-cyan-400 bg-clip-text text-4xl leading-tight font-black text-transparent md:text-7xl">
                SCHOLARSHIP TODAY
              </h2>
            </div>

            {/* Rainbow Divider */}
            <div className="mb-8 flex items-center justify-center">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-cyan-500"></div>
              <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-purple-500"></div>
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-orange-500"></div>
              <div className="h-1 w-8 bg-gradient-to-r from-orange-500 to-purple-500"></div>
              <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-transparent"></div>
            </div>

            <p className="mx-auto max-w-3xl text-xl leading-relaxed font-medium text-gray-300 md:text-2xl">
              Unlock your potential and take the next step toward your esports
              future
            </p>
          </div>

          {/* Enhanced Stats Display */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-3">
            {/* Main Scholarship Stat */}
            <div className="group flex flex-col items-center md:col-span-1">
              <div className="w-full rounded-3xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-8 backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-2xl group-hover:shadow-cyan-400/20">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 transition-transform duration-300 group-hover:scale-110">
                      <span className="text-2xl font-bold text-black">$</span>
                    </div>
                  </div>
                  <h3 className="font-orbitron mb-3 bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-5xl font-black text-transparent transition-transform duration-300 group-hover:scale-105 md:text-6xl">
                    50M+
                  </h3>
                  <p className="text-lg font-medium text-gray-300">
                    Scholarships Available
                  </p>
                  <div className="mx-auto mt-3 h-0.5 w-12 bg-gradient-to-r from-cyan-400 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Supporting Stats */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-2">
              <div className="group rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 to-purple-600/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/40">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 transition-transform duration-300 group-hover:scale-110">
                    <BarChart3 className="h-6 w-6 text-black" />
                  </div>
                  <h4 className="font-orbitron mb-2 text-2xl font-bold text-purple-400">
                    24/7
                  </h4>
                  <p className="text-sm text-gray-400">Platform Access</p>
                </div>
              </div>

              <div className="group rounded-2xl border border-orange-400/20 bg-gradient-to-br from-orange-500/15 to-orange-600/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-orange-400/40">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 transition-transform duration-300 group-hover:scale-110">
                    <Trophy className="h-6 w-6 text-black" />
                  </div>
                  <h4 className="font-orbitron mb-2 text-2xl font-bold text-orange-400">
                    ALL
                  </h4>
                  <p className="text-sm text-gray-400">Major Games Supported</p>
                </div>
              </div>

              <div className="group rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/40">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 transition-transform duration-300 group-hover:scale-110">
                    <TrendingUp className="h-6 w-6 text-black" />
                  </div>
                  <h4 className="font-orbitron mb-2 text-xl font-bold text-cyan-400">
                    REAL-TIME
                  </h4>
                  <p className="text-sm text-gray-400">Performance Analytics</p>
                </div>
              </div>

              <div className="group rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/15 to-purple-600/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/40">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-400 to-purple-500 transition-transform duration-300 group-hover:scale-110">
                    <MessageSquare className="h-6 w-6 text-black" />
                  </div>
                  <h4 className="font-orbitron mb-2 text-xl font-bold text-purple-400">
                    INSTANT
                  </h4>
                  <p className="text-sm text-gray-400">Communication Tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-cyan-500/60 via-purple-500/60 to-orange-500/60 py-20 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="font-orbitron cyber-text mb-6 text-4xl font-black md:text-6xl">
            READY TO GET STARTED?
          </h2>
          <p className="mx-auto mb-12 max-w-3xl text-xl md:text-2xl">
            Join the platform that&apos;s revolutionizing esports recruitment
            and player development
          </p>
          <div className="mx-auto flex max-w-2xl flex-col justify-center gap-6 sm:flex-row">
            {user ? (
              <Button
                onClick={() => router.push("/dashboard/player")}
                size="lg"
                className="flex-1 bg-cyan-400 px-8 py-4 text-lg font-semibold text-black hover:bg-cyan-500"
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
                  className="flex-1 bg-cyan-400 px-8 py-4 text-lg font-semibold text-black hover:bg-cyan-500"
                >
                  JOIN AS PLAYER
                </Button>
              </SignUpButton>
            )}
            {user ? (
              <Button
                onClick={() => router.push("/dashboard/coaches")}
                size="lg"
                className="flex-1 bg-orange-400 px-8 py-4 text-lg font-semibold text-black hover:bg-orange-500"
              >
                JOIN AS COACH
              </Button>
            ) : (
              <SignUpButton mode="modal" unsafeMetadata={{ userType: "coach" }}>
                <Button
                  size="lg"
                  className="flex-1 bg-orange-400 px-8 py-4 text-lg font-semibold text-black hover:bg-orange-500"
                >
                  JOIN AS COACH
                </Button>
              </SignUpButton>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
