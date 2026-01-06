"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getAvailableGameNames } from "@/lib/game-logos";
import { api } from "@/trpc/react";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Calendar, GraduationCap, Quote, Search, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import FAQSection from "./_components/FAQSection";

// Helper function to calculate spots remaining
const getSpotsRemaining = (maxSpots: number, registeredSpots: number) => {
  const remaining = maxSpots - registeredSpots;
  if (remaining <= 0) return "Full";
  return `${remaining} left`;
};

// Helper function to format date more concisely
const formatCompactDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

// Game icon mapping
const gameIcons = {
  VALORANT: "/valorant/logos/Valorant Logo Red Border.jpg",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Primary Logo.png",
  "Super Smash Bros. Ultimate": "/smash/logos/Smash Ball White Logo.png",
  "Rocket League": "/rocket-league/logos/Rocket League Emblem.png",
} as const;

// Helper function to get game icon
const getGameIcon = (gameName: string) => {
  return (
    gameIcons[gameName as keyof typeof gameIcons] ?? "/eval/logos/emblem.png"
  );
};

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
    quote:
      "EVAL has opened up so many opportunities for me to get scholarships… thanks to EVAL, gaming in college can be my future!",
    avatar: "/placeholder.svg?height=60&width=60",
  },
];

export default function HomePage() {
  const { user } = useUser();
  const router = useRouter();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<
    "player" | "coach" | null
  >(null);

  // College search state
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [hasScholarships, setHasScholarships] = useState<boolean | undefined>(
    undefined,
  );
  const [inUS, setInUS] = useState<boolean | undefined>(undefined);
  // Fetch real data from API
  const { data: upcomingTryouts = [] } =
    api.tryouts.getUpcomingForHomepage.useQuery({ limit: 3 });
  const { data: upcomingCombines = [] } =
    api.combines.getUpcomingForHomepage.useQuery({ limit: 3 });

  const handleUserTypeSelect = (userType: "player" | "coach") => {
    setSelectedUserType(userType);
  };

  const handleSignUp = () => {
    if (selectedUserType) {
      setShowSignUpModal(false);
      // Reset selection after a brief delay to allow modal to close
      setTimeout(() => setSelectedUserType(null), 300);
    }
  };

  const resetAndCloseModal = () => {
    setSelectedUserType(null);
    setShowSignUpModal(false);
  };

  const handleGetStarted = () => {
    if (user) {
      // User is signed in, redirect to dashboard
      router.push("/dashboard");
    } else {
      // User is not signed in, show signup modal
      setShowSignUpModal(true);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center text-center text-white">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
        <div className="absolute inset-0 z-5 bg-black/66" />
        {/* <Image
          src="/eval/valorant_champs.jpg?height=1080&width=1920"
          alt="Esports background"
          fill
          className="object-cover"
          priority
        /> */}
        <div className="relative z-20 mx-auto max-w-6xl px-6">
          {/* <div className="mb-8">
            <Image
              src="/eval/logos/eLOGO_white.png"
              alt="EVAL Logo"
              width={200}
              height={100}
              className="mx-auto mb-6"
            />
          </div> */}
          <h2 className="font-orbitron mb-6 text-5xl leading-tight font-black text-white md:text-7xl">
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
          {/* <div className="mx-auto mb-12 grid max-w-2xl grid-cols-1 gap-8">
            <div className="text-center">
              <div className="font-orbitron mb-1 text-3xl font-black text-cyan-400">
                $50M+
              </div>
              <div className="font-rajdhani text-sm text-gray-300">
                Available Scholarships
              </div>
            </div>
            <div className="text-center">
              <div className="font-orbitron mb-1 text-3xl font-black text-purple-400">
                500+
              </div>
              <div className="font-rajdhani text-sm text-gray-300">
                Partner Colleges
              </div>
            </div>
            <div className="text-center">
              <div className="font-orbitron mb-1 text-3xl font-black text-orange-400">
                10K+
              </div>
              <div className="font-rajdhani text-sm text-gray-300">
                Active Players
              </div>
            </div>
          </div> */}

          {/* College Search Bar */}
          <div className="mx-auto mb-12 max-w-3xl">
            <div className="mb-3 text-center">
              <p className="font-rajdhani text-sm tracking-[0.2em] text-cyan-300/80 uppercase">
                Find colleges by games, scholarships, location
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                router.push("/colleges");
                // setShowSearchModal(true);
              }}
              className="group relative flex w-full cursor-text items-center justify-between overflow-hidden rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-left text-white shadow-lg shadow-cyan-500/10 transition-all duration-500 ease-out hover:border-cyan-400/60 hover:shadow-cyan-400/30 focus-visible:ring-2 focus-visible:ring-cyan-400/70 focus-visible:outline-none"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-orange-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex items-center space-x-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 transition-all duration-500 group-hover:bg-cyan-500/25 group-hover:text-white">
                  <Search className="h-5 w-5" />
                </span>
                <div className="flex flex-col">
                  <span className="font-orbitron text-lg font-semibold">
                    Search for colleges
                    <span
                      className="ml-2 inline-block h-5 w-[2px] translate-y-[1px] animate-pulse bg-cyan-300/80"
                      aria-hidden
                    />
                  </span>
                  <span className="font-rajdhani text-sm text-gray-300">
                    by scholarships, supported games and location
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Dual CTA Buttons */}
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
            <Link href="/recruiting">
              <Button
                size="lg"
                className="font-orbitron w-full bg-gradient-to-r from-cyan-400 to-cyan-500 px-8 py-4 text-lg font-bold tracking-wider text-black shadow-lg shadow-cyan-400/25 hover:from-cyan-500 hover:to-cyan-600"
              >
                FOR PLAYERS
              </Button>
            </Link>
            <Link href="/recruiting">
              <Button
                size="lg"
                className="font-orbitron w-full bg-gradient-to-r from-orange-400 to-orange-500 px-8 py-4 text-lg font-bold tracking-wider text-black shadow-lg shadow-orange-400/25 hover:from-orange-500 hover:to-orange-600"
              >
                FOR COACHES
              </Button>
            </Link>
          </div>

          {/* Alternative CTA Buttons */}

          {/* CTA: Get started */}
          {/* <div className="mx-auto mb-2 max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 via-cyan-500/5 to-purple-500/5 p-6 shadow-lg shadow-cyan-500/10 backdrop-blur-sm md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="font-rajdhani text-xs tracking-[0.2em] text-cyan-300/80 uppercase">
                    Get started today
                  </p>
                  <h3 className="font-orbitron text-2xl font-black text-white md:text-3xl">
                    I am a...
                  </h3>
                  <p className="font-rajdhani text-sm text-gray-300">
                    Pick your track to begin recruiting or discover programs.
                  </p>
                </div>

                <div className="grid w-full gap-3 sm:grid-cols-2 md:max-w-md">
                  <Link href="/recruiting">
                    <Button
                      size="lg"
                      className="group font-orbitron flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-cyan-400 to-cyan-500 px-6 py-4 text-lg font-bold tracking-wide text-black shadow-lg shadow-cyan-400/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-400/40 focus-visible:ring-2 focus-visible:ring-cyan-300/70"
                    >
                      <span className="flex items-center gap-3">
                        <User className="h-5 w-5" />
                        Player
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-80 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>

                  <Link href="/recruiting">
                    <Button
                      size="lg"
                      className="group font-orbitron flex w-full items-center justify-between rounded-lg bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-4 text-lg font-bold tracking-wide text-black shadow-lg shadow-orange-400/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-orange-400/40 focus-visible:ring-2 focus-visible:ring-orange-300/70"
                    >
                      <span className="flex items-center gap-3">
                        <GraduationCap className="h-5 w-5" />
                        Coach
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-80 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div> */}
          {/* End of Alternative CTA Buttons */}
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="border border-blue-500/20 bg-black/95 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="font-orbitron cyber-text mb-4 text-4xl font-black text-white md:text-5xl">
              WHAT WE OFFER
            </h2>
            <p className="font-rajdhani mx-auto max-w-3xl text-xl text-gray-300">
              Comprehensive solutions for players, coaches, and leagues in the
              esports ecosystem
            </p>
          </div>

          {/* Dynamic Flow Layout */}
          <div className="relative mx-auto max-w-7xl">
            {/* Connecting Flow Line */}
            <div className="relative top-[-25] right-0 left-0 hidden h-0.5 -translate-y-1/2 transform bg-gradient-to-r from-cyan-400 via-orange-400 to-purple-400 opacity-30 lg:block"></div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-4">
              {/* For Players */}
              <div className="group relative">
                <div className="transform rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-2xl hover:shadow-cyan-400/20">
                  <div className="relative">
                    <h3 className="font-orbitron mb-4 text-2xl font-black tracking-wide text-cyan-400 md:text-3xl">
                      FOR PLAYERS
                    </h3>
                    <div className="mb-6 h-0.5 w-16 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
                    <div className="space-y-4">
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Level up your game with advanced insights
                      </p>
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Connect with verified college coaches
                      </p>
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Showcase skills in EVAL Combines
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Coaches */}
              <div className="group relative">
                <div className="transform rounded-xl border border-orange-400/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/40 hover:shadow-2xl hover:shadow-orange-400/20">
                  <div className="relative">
                    {/* <div className="absolute -top-2 -left-2 w-6 h-6 bg-orange-400 rounded-full hidden lg:block"></div> */}
                    <h3 className="font-orbitron mb-4 text-2xl font-black tracking-wide text-orange-400 md:text-3xl">
                      FOR COACHES
                    </h3>
                    <div className="mb-6 h-0.5 w-16 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                    <div className="space-y-4">
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Scout players with EVAL metrics
                      </p>
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Host tryouts for your programs
                      </p>
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Get recruiting consulting
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Leagues */}
              <div className="group relative">
                <div className="transform rounded-xl border border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/40 hover:shadow-2xl hover:shadow-purple-400/20">
                  <div className="relative">
                    {/* <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-400 rounded-full hidden lg:block"></div> */}
                    <h3 className="font-orbitron mb-4 text-2xl font-black tracking-wide text-purple-400 md:text-3xl">
                      FOR LEAGUES
                    </h3>
                    <div className="mb-6 h-0.5 w-16 bg-gradient-to-r from-purple-400 to-purple-600"></div>
                    <div className="space-y-4">
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Highlight players for scholarships
                      </p>
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
                        Enable competitive rankings
                      </p>
                      <p className="font-rajdhani text-lg leading-relaxed font-medium text-white md:text-xl">
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
      <section className="border border-blue-500/20 bg-black/95 bg-gradient-to-r from-blue-700/10 via-purple-700/10 to-pink-700/10 py-16">
        <div className="container mx-auto px-6">
          <h2 className="font-orbitron mb-8 text-center text-2xl tracking-wide text-white">
            TRUSTED BY
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <Image
              src="/partners/gse/GSE_LOGO.png"
              alt="Garden State Esports"
              width={150}
              height={60}
            />
            <Image
              src="/partners/keller/keller.png"
              alt="Keller Center"
              width={150}
              height={60}
            />
          </div>
        </div>
      </section>

      {/* Upcoming Tournaments Section */}
      <section className="border border-blue-500/20 bg-[#0e041f]/98 from-blue-700/10 via-purple-700/10 to-pink-700/10 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-orbitron cyber-text mb-4 text-4xl font-black text-white md:text-5xl">
              UPCOMING TOURNAMENTS
            </h2>
            <p className="font-rajdhani text-xl text-gray-300">
              Don&apos;t miss out on these exciting opportunities to compete and
              get recruited
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 lg:grid-cols-1">
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
            <div className="rounded-md border border-purple-400/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron text-2xl font-bold tracking-wide text-purple-400">
                    EVAL COMBINES
                  </h3>
                </div>
                <Link href="/tryouts/combines">
                  <Button className="font-orbitron bg-purple-400 font-bold text-black shadow-lg shadow-purple-400/25 hover:bg-purple-500">
                    VIEW MORE
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col space-y-4">
                {upcomingCombines.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="font-rajdhani text-gray-400">
                      No upcoming combines available
                    </p>
                  </div>
                ) : (
                  upcomingCombines.map((combine) => (
                    <Link
                      key={combine.id}
                      href={`/tryouts/combines/${combine.id}`}
                    >
                      <Card className="transform cursor-pointer border-gray-700 bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-purple-400/50 hover:bg-gray-800/90 hover:shadow-lg hover:shadow-purple-400/20">
                        <CardContent className="p-5">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={getGameIcon(combine.game.name)}
                                alt={combine.game.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-orbitron mb-1 truncate font-semibold text-white">
                                {combine.title}
                              </h4>
                              <p className="font-rajdhani mb-2 text-sm text-gray-400">
                                {combine.game.name}
                              </p>
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4 text-purple-400" />
                                <span className="font-rajdhani text-sm text-purple-400">
                                  {formatCompactDate(combine.date)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2 text-right">
                              <div className="font-orbitron text-sm font-bold text-purple-400">
                                {combine.prize_pool}
                              </div>
                              <Button
                                size="sm"
                                className="font-orbitron bg-purple-500 px-4 py-1 text-xs text-white hover:bg-purple-600"
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
      <section className="hidden border border-blue-500/20 bg-black/95 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-orbitron cyber-text mb-4 text-4xl font-black text-white md:text-5xl">
              OUR GAMES
            </h2>
            <p className="font-rajdhani mx-auto max-w-5xl text-xl text-gray-300">
              We support the biggest titles in collegiate esports with
              comprehensive analytics and recruitment opportunities.
            </p>
          </div>

          <div className="max-w-8xl mx-auto grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="group flex cursor-pointer items-center justify-center text-center transition-all duration-300 hover:scale-110">
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
            <div className="group mx-5 flex cursor-pointer items-center justify-center text-center transition-all duration-300 hover:scale-110">
              <Image
                src="/rocket-league/logos/Rocket League Black and White Logo.png"
                alt="Rocket League"
                width={750}
                height={304}
                className="object-contain"
              />
            </div>
            <div className="group cursor-pointer text-center">
              <div className="mx-auto mb-4 flex items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110">
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
            <div className="group flex cursor-pointer items-center justify-center text-center">
              <div className="mx-auto mb-4 flex items-center justify-center rounded-2xl px-5 shadow-lg transition-all duration-300 group-hover:scale-110">
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
          <div className="mb-16 text-center">
            <h2 className="font-orbitron cyber-text mb-4 text-4xl font-black text-white md:text-5xl">
              SUCCESS STORIES
            </h2>
            <p className="font-rajdhani text-xl text-gray-300">
              Hear from players and coaches who&apos;ve achieved their goals
              with EVAL
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 transition-all hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-400/10"
              >
                <CardContent className="p-6">
                  <Quote className="mb-4 h-8 w-8 text-cyan-400" />
                  <p className="font-rajdhani mb-6 leading-relaxed text-gray-300 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500">
                      <span className="font-orbitron text-sm font-bold text-black">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-orbitron font-semibold text-white">
                        {testimonial.name}
                      </h4>
                      <p className="font-rajdhani text-sm text-gray-400">
                        {testimonial.role}
                      </p>
                      <p className="font-rajdhani text-sm font-semibold text-cyan-400">
                        {testimonial.school}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Discord Community Section */}
      <section className="bg-black/95 bg-gradient-to-br py-20">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Left Content */}
              <div className="text-left">
                <h2 className="font-orbitron cyber-text mb-6 text-4xl font-black text-white md:text-5xl">
                  JOIN OUR DISCORD
                </h2>
                <p className="font-rajdhani mb-8 text-xl leading-relaxed text-gray-300">
                  Connect with a community of players, coaches, and esports
                  enthusiasts in our vibrant Discord community. Get real-time
                  updates, participate in discussions, and stay ahead of the
                  competition.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-cyan-400"></div>
                    <p className="font-rajdhani text-gray-300">
                      Live tournament updates and announcements
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-purple-400"></div>
                    <p className="font-rajdhani text-gray-300">
                      Direct access to EVAL team and coaches
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-orange-400"></div>
                    <p className="font-rajdhani text-gray-300">
                      Exclusive opportunities and early access
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 rounded-full bg-cyan-400"></div>
                    <p className="font-rajdhani text-gray-300">
                      Community events and scrimmages
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Discord Widget */}
              <div className="flex justify-center lg:justify-end">
                <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-purple-400/10">
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
      <section className="relative overflow-hidden bg-gradient-to-r from-cyan-500/90 via-purple-500/90 to-orange-500/90 py-20 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="font-orbitron cyber-text mb-6 text-4xl font-black md:text-6xl">
            START YOUR ESPORTS JOURNEY
          </h2>
          <p className="font-rajdhani mx-auto mb-12 max-w-3xl text-xl md:text-2xl">
            Join thousands of players and coaches already using EVAL to achieve
            their esports dreams
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="font-orbitron bg-white px-12 py-6 text-xl font-bold tracking-wider text-black shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-gray-100 hover:shadow-white/20"
          >
            GET STARTED TODAY
          </Button>
        </div>
      </section>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={resetAndCloseModal}>
        <DialogContent className="border-none bg-slate-900 text-white sm:max-w-lg">
          <DialogHeader className="relative">
            <DialogTitle className="mb-4 text-2xl font-bold text-white">
              SIGN UP
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-bold text-white">
                CHOOSE YOUR ACCOUNT TYPE
              </h2>
              <p className="text-sm text-slate-300">
                Empowering students and college coaches to connect.
              </p>
            </div>

            {/* Horizontal Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Player Option */}
              <button
                onClick={() => handleUserTypeSelect("player")}
                className={`rounded-lg border-2 p-6 text-center transition-all ${
                  selectedUserType === "player"
                    ? "border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      selectedUserType === "player"
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-500 bg-slate-700/50"
                    }`}
                  >
                    <User
                      className={`h-6 w-6 ${
                        selectedUserType === "player"
                          ? "text-blue-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-white">PLAYER</h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      I am a player looking to find an esports scholarship and
                      related opportunities.
                    </p>
                  </div>
                </div>
              </button>

              {/* College Option */}
              <button
                onClick={() => handleUserTypeSelect("coach")}
                className={`rounded-lg border-2 p-6 text-center transition-all ${
                  selectedUserType === "coach"
                    ? "border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      selectedUserType === "coach"
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-500 bg-slate-700/50"
                    }`}
                  >
                    <GraduationCap
                      className={`h-6 w-6 ${
                        selectedUserType === "coach"
                          ? "text-blue-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-white">SCHOOL</h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      I am a coach, director or administrator looking to make
                      finding players easier.
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
                  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white shadow-lg hover:bg-blue-700"
                >
                  SIGN UP AS{" "}
                  {selectedUserType === "coach"
                    ? "SCHOOL"
                    : selectedUserType.toUpperCase()}
                </Button>
              </SignUpButton>
            ) : (
              <Button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-slate-700 py-3 font-medium text-slate-500"
              >
                SIGN UP
              </Button>
            )}

            {/* Sign In Link */}
            <div className="text-center">
              <SignInButton mode="modal">
                <button
                  onClick={resetAndCloseModal}
                  className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  Already have an account? Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* College Search Modal */}
      <CollegeSearchModal
        open={showSearchModal}
        onOpenChange={setShowSearchModal}
        searchQuery={collegeSearchQuery}
        onSearchQueryChange={setCollegeSearchQuery}
        selectedGames={selectedGames}
        onSelectedGamesChange={setSelectedGames}
        hasScholarships={hasScholarships}
        onHasScholarshipsChange={setHasScholarships}
        inUS={inUS}
        onInUSChange={setInUS}
      />
    </div>
  );
}

// College Search Modal Component
function CollegeSearchModal({
  open,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  selectedGames,
  onSelectedGamesChange,
  hasScholarships,
  onHasScholarshipsChange,
  inUS,
  onInUSChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedGames: string[];
  onSelectedGamesChange: (games: string[]) => void;
  hasScholarships: boolean | undefined;
  onHasScholarshipsChange: (value: boolean | undefined) => void;
  inUS: boolean | undefined;
  onInUSChange: (value: boolean | undefined) => void;
}) {
  const router = useRouter();

  // Get available games from hardcoded logo mapping
  const availableGames = useMemo(() => getAvailableGameNames(), []);

  // Search colleges
  const { data: searchResults, isLoading } =
    api.schoolProfile.searchColleges.useQuery(
      {
        search: searchQuery || undefined,
        gameNames: selectedGames.length > 0 ? selectedGames : undefined,
        hasScholarships: hasScholarships,
        inUS: inUS,
        limit: 20,
        offset: 0,
      },
      {
        enabled: open,
      },
    );

  const handleGameToggle = (gameName: string) => {
    if (selectedGames.includes(gameName)) {
      onSelectedGamesChange(selectedGames.filter((name) => name !== gameName));
    } else {
      onSelectedGamesChange([...selectedGames, gameName]);
    }
  };

  const handleCollegeClick = (collegeId: string) => {
    router.push(`/profiles/school/${collegeId}`);
    onOpenChange(false);
  };

  const clearFilters = () => {
    onSearchQueryChange("");
    onSelectedGamesChange([]);
    onHasScholarshipsChange(undefined);
    onInUSChange(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 bg-none opacity-100 backdrop-blur-none" />
        <DialogContent className="data-[state=open]:animate-in data-[state=open]:zoom-in-90 data-[state=closed]:animate-out data-[state=closed]:zoom-out-90 max-h-[90vh] max-w-4xl overflow-y-auto border border-cyan-400/15 bg-slate-900/5 text-white shadow-2xl backdrop-blur-none transition-all duration-300">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-2xl font-bold text-white">
              SEARCH COLLEGES
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by college name, location, or state..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="border-gray-700 bg-gray-800/60 pl-10 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
              />
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div className="font-orbitron text-lg font-semibold text-white">
                FILTERS
              </div>

              {/* Games Filter */}
              {availableGames.length > 0 && (
                <div>
                  <div className="font-rajdhani mb-2 text-sm font-medium text-gray-300">
                    Games Supported
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableGames.map((gameName) => (
                      <button
                        key={gameName}
                        onClick={() => handleGameToggle(gameName)}
                        className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                          selectedGames.includes(gameName)
                            ? "border-cyan-400 bg-cyan-400/20 text-cyan-400"
                            : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {gameName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scholarships Filter */}
              <div>
                <div className="font-rajdhani mb-2 text-sm font-medium text-gray-300">
                  Scholarships
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={hasScholarships === true}
                      onCheckedChange={(checked) =>
                        onHasScholarshipsChange(checked ? true : undefined)
                      }
                      className="border-gray-600"
                    />
                    <span className="font-rajdhani text-sm text-gray-300">
                      Has Scholarships
                    </span>
                  </label>
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <div className="font-rajdhani mb-2 text-sm font-medium text-gray-300">
                  Location
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={inUS === true}
                      onCheckedChange={(checked) =>
                        onInUSChange(checked ? true : undefined)
                      }
                      className="border-gray-600"
                    />
                    <span className="font-rajdhani text-sm text-gray-300">
                      In United States
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={inUS === false}
                      onCheckedChange={(checked) =>
                        onInUSChange(checked ? false : undefined)
                      }
                      className="border-gray-600"
                    />
                    <span className="font-rajdhani text-sm text-gray-300">
                      Outside United States
                    </span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedGames.length > 0 ||
                hasScholarships !== undefined ||
                inUS !== undefined ||
                searchQuery) && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="font-rajdhani border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="font-orbitron text-lg font-semibold text-white">
                RESULTS
                {searchResults && (
                  <span className="font-rajdhani ml-2 text-sm font-normal text-gray-400">
                    ({searchResults.total} colleges found)
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
                  <p className="font-rajdhani mt-2 text-gray-400">
                    Searching...
                  </p>
                </div>
              ) : searchResults && searchResults.schools.length > 0 ? (
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {searchResults.schools.map((college) => (
                    <button
                      key={college.id}
                      onClick={() => handleCollegeClick(college.id)}
                      className="group w-full rounded-lg border border-gray-700 bg-gray-800/60 p-4 text-left transition-all hover:border-cyan-400/50 hover:bg-gray-800/80"
                    >
                      <div className="flex items-center space-x-4">
                        {college.logo_url ? (
                          <Image
                            src={college.logo_url}
                            alt={college.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-blue-600">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-orbitron font-semibold text-white group-hover:text-cyan-400">
                            {college.name}
                          </div>
                          <div className="font-rajdhani text-sm text-gray-400">
                            {college.type.replace("_", " ")} •{" "}
                            {college.location}
                            {college.state && `, ${college.state}`}
                          </div>
                          {college.esports_titles &&
                            college.esports_titles.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {college.esports_titles
                                  .slice(0, 3)
                                  .map((title, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-400"
                                    >
                                      {title}
                                    </span>
                                  ))}
                                {college.esports_titles.length > 3 && (
                                  <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
                                    +{college.esports_titles.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          {college.scholarships_available && (
                            <div className="mt-1 text-xs font-semibold text-green-400">
                              ✓ Scholarships Available
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="font-rajdhani text-gray-400">
                    No colleges found. Try adjusting your filters.
                  </p>
                </div>
              )}
            </div>

            {/* View All Link */}
            <div className="pt-4 text-center">
              <Button
                onClick={() => {
                  router.push("/colleges");
                  onOpenChange(false);
                }}
                className="font-orbitron bg-cyan-400 text-black hover:bg-cyan-500"
              >
                VIEW ALL COLLEGES
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
