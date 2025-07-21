"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Trophy,
  Star,
  ChevronRight,
  Medal,
  Crown,
  Award,
} from "lucide-react";
import type { Player } from "@/app/rankings/types";
import Link from "next/link";
import Image from "next/image";

// Mock data for combine rankings
const combineRankings = {
  VALORANT: [
    {
      rank: 1,
      username: "ValorantKing",
      school: "LAGA High",
      rating: 2.45,
      region: "West",
      state: "California",
    },
    {
      rank: 2,
      username: "HeadshotHero",
      school: "SF Tech",
      rating: 2.38,
      region: "West",
      state: "California",
    },
    {
      rank: 3,
      username: "ClutchMaster",
      school: "SD Prep",
      rating: 2.31,
      region: "West",
      state: "California",
    },
    {
      rank: 4,
      username: "AimGod",
      school: "Sac State High",
      rating: 2.24,
      region: "West",
      state: "California",
    },
    {
      rank: 5,
      username: "FragMachine",
      school: "OC Academy",
      rating: 2.17,
      region: "West",
      state: "California",
    },
    {
      rank: 6,
      username: "ShotCaller",
      school: "Austin High",
      rating: 2.1,
      region: "South",
      state: "Texas",
    },
    {
      rank: 7,
      username: "Precision",
      school: "Dallas Prep",
      rating: 2.03,
      region: "South",
      state: "Texas",
    },
    {
      rank: 8,
      username: "Tactical",
      school: "Houston Academy",
      rating: 1.96,
      region: "South",
      state: "Texas",
    },
    {
      rank: 9,
      username: "Lightning",
      school: "Miami High",
      rating: 1.89,
      region: "Southeast",
      state: "Florida",
    },
    {
      rank: 10,
      username: "Sniper",
      school: "Orlando Prep",
      rating: 1.82,
      region: "Southeast",
      state: "Florida",
    },
  ],
  "Rocket League": [
    {
      rank: 1,
      username: "RocketGod",
      school: "Denver High",
      rating: 1850,
      region: "West",
      state: "Colorado",
    },
    {
      rank: 2,
      username: "AerialAce",
      school: "Phoenix Prep",
      rating: 1820,
      region: "Southwest",
      state: "Arizona",
    },
    {
      rank: 3,
      username: "BoostMaster",
      school: "Seattle Academy",
      rating: 1790,
      region: "Northwest",
      state: "Washington",
    },
    {
      rank: 4,
      username: "GoalKeeper",
      school: "Portland High",
      rating: 1760,
      region: "Northwest",
      state: "Oregon",
    },
    {
      rank: 5,
      username: "Speedster",
      school: "Las Vegas Prep",
      rating: 1730,
      region: "West",
      state: "Nevada",
    },
    {
      rank: 6,
      username: "Demolition",
      school: "Chicago High",
      rating: 1700,
      region: "Midwest",
      state: "Illinois",
    },
    {
      rank: 7,
      username: "Flipper",
      school: "Detroit Academy",
      rating: 1670,
      region: "Midwest",
      state: "Michigan",
    },
    {
      rank: 8,
      username: "Striker",
      school: "Atlanta Prep",
      rating: 1640,
      region: "Southeast",
      state: "Georgia",
    },
    {
      rank: 9,
      username: "Defender",
      school: "Charlotte High",
      rating: 1610,
      region: "Southeast",
      state: "North Carolina",
    },
    {
      rank: 10,
      username: "Midfielder",
      school: "Nashville Academy",
      rating: 1580,
      region: "South",
      state: "Tennessee",
    },
  ],
  "Super Smash Bros. Ultimate": [
    {
      rank: 1,
      username: "SmashKing",
      school: "Boston High",
      rating: 2800,
      region: "Northeast",
      state: "Massachusetts",
    },
    {
      rank: 2,
      username: "ComboMaster",
      school: "NYC Academy",
      rating: 2750,
      region: "Northeast",
      state: "New York",
    },
    {
      rank: 3,
      username: "TechGod",
      school: "Philly Prep",
      rating: 2700,
      region: "Northeast",
      state: "Pennsylvania",
    },
    {
      rank: 4,
      username: "EdgeGuard",
      school: "DC High",
      rating: 2650,
      region: "Southeast",
      state: "Washington DC",
    },
    {
      rank: 5,
      username: "PlatformPro",
      school: "Baltimore Academy",
      rating: 2600,
      region: "Southeast",
      state: "Maryland",
    },
    {
      rank: 6,
      username: "Neutral",
      school: "Richmond Prep",
      rating: 2550,
      region: "Southeast",
      state: "Virginia",
    },
    {
      rank: 7,
      username: "Punisher",
      school: "Raleigh High",
      rating: 2500,
      region: "Southeast",
      state: "North Carolina",
    },
    {
      rank: 8,
      username: "Spacing",
      school: "Charleston Academy",
      rating: 2450,
      region: "Southeast",
      state: "South Carolina",
    },
    {
      rank: 9,
      username: "Recovery",
      school: "Jacksonville Prep",
      rating: 2400,
      region: "Southeast",
      state: "Florida",
    },
    {
      rank: 10,
      username: "Finisher",
      school: "Tampa High",
      rating: 2350,
      region: "Southeast",
      state: "Florida",
    },
  ],
  "Overwatch 2": [
    {
      rank: 1,
      username: "OverwatchPro",
      school: "LA Gaming",
      rating: 4200,
      region: "West",
      state: "California",
    },
    {
      rank: 2,
      username: "TankMain",
      school: "SF Academy",
      rating: 4150,
      region: "West",
      state: "California",
    },
    {
      rank: 3,
      username: "DPSGod",
      school: "San Diego High",
      rating: 4100,
      region: "West",
      state: "California",
    },
    {
      rank: 4,
      username: "SupportKing",
      school: "Portland Prep",
      rating: 4050,
      region: "Northwest",
      state: "Oregon",
    },
    {
      rank: 5,
      username: "FlexPlayer",
      school: "Seattle High",
      rating: 4000,
      region: "Northwest",
      state: "Washington",
    },
    {
      rank: 6,
      username: "Sniper",
      school: "Denver Academy",
      rating: 3950,
      region: "West",
      state: "Colorado",
    },
    {
      rank: 7,
      username: "Healer",
      school: "Phoenix Prep",
      rating: 3900,
      region: "Southwest",
      state: "Arizona",
    },
    {
      rank: 8,
      username: "Shield",
      school: "Austin High",
      rating: 3850,
      region: "South",
      state: "Texas",
    },
    {
      rank: 9,
      username: "Flanker",
      school: "Dallas Academy",
      rating: 3800,
      region: "South",
      state: "Texas",
    },
    {
      rank: 10,
      username: "Anchor",
      school: "Houston Prep",
      rating: 3750,
      region: "South",
      state: "Texas",
    },
  ],
};

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "Super Smash Bros. Ultimate": "from-purple-500 to-purple-700",
};

const gameIcons = {
  VALORANT: "/valorant/logos/Valorant Logo Red Border.jpg",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Primary Logo.png",
  "Rocket League": "/rocket-league/logos/Rocket League Emblem.png",
  "Super Smash Bros. Ultimate": "/smash/logos/Smash Ball White Logo.png",
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
  if (rank === 3) return <Award className="h-5 w-5 text-orange-400" />;
  return <Trophy className="h-4 w-4 text-cyan-400" />;
}

function GameRankingCard({
  game,
  players,
}: {
  game: string;
  players: Player[];
}) {
  const gameColor =
    gameColors[game as keyof typeof gameColors] || "from-gray-500 to-gray-700";
  const gameIcon =
    gameIcons[game as keyof typeof gameIcons] ||
    "/smash/logos/Smash Ball White Logo.png";

  return (
    <Card className="group rounded-lg border-white/10 bg-gray-900/60 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-800/60 hover:shadow-lg hover:shadow-cyan-400/10">
      <CardContent className="relative overflow-hidden p-4 sm:p-6">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-bl from-cyan-500/5 to-transparent opacity-50 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>

        <div className="relative z-10 mb-4 flex items-center space-x-2 sm:mb-6 sm:space-x-3">
          <Image
            src={gameIcon}
            alt={game}
            width={40}
            height={40}
            className="flex-shrink-0 object-contain sm:h-12 sm:w-12"
          />
          <div>
            <h3 className="font-orbitron text-lg font-bold tracking-wide text-white transition-colors duration-300 group-hover:text-cyan-200 sm:text-xl">
              {game}
            </h3>
            <p className="text-xs font-medium text-gray-400 sm:text-sm">
              Top 10 Players
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-2 sm:space-y-3">
          {players.slice(0, 10).map((player) => (
            <div
              key={player.rank}
              className="flex items-center justify-between rounded-md border border-white/10 bg-gray-800/40 px-3 py-2 backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-700/40 sm:p-3"
            >
              <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center sm:h-8 sm:w-8">
                  {getRankIcon(player.rank)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-orbitron truncate text-xs font-semibold text-white sm:text-sm">
                    {player.username}
                  </h4>
                  <p className="truncate text-xs font-medium text-gray-400">
                    {player.school}
                  </p>
                </div>
              </div>

              <div className="ml-2 flex-shrink-0 text-right">
                <p className="font-orbitron text-xs font-bold text-cyan-400 sm:text-sm">
                  {player.rating}
                </p>
                <p className="text-xs font-medium text-gray-400">
                  {player.state}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-3 border-t border-white/20 pt-3 sm:mt-4 sm:pt-4">
          <Button
            variant="outline"
            className="font-orbitron w-full border-white/10 bg-gray-800/40 text-xs text-white backdrop-blur-md transition-all duration-300 hover:border-cyan-400/50 hover:bg-gray-700/40 sm:text-sm"
            disabled={true}
          >
            FULL RANKINGS COMING SOON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CombinesRankingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const games = Object.keys(combineRankings);
  const regions = [
    "West",
    "Southwest",
    "Northwest",
    "Midwest",
    "South",
    "Southeast",
    "Northeast",
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900/60 text-white">
      {/* Background accent elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-500/8 to-transparent blur-2xl"></div>
      <div className="absolute right-0 bottom-0 h-48 w-48 rounded-full bg-gradient-to-tl from-orange-500/8 to-transparent blur-xl"></div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Compact Header */}
        <div className="mb-12 text-center">
          <div className="mb-4">
            <h1 className="font-orbitron text-center text-3xl font-black text-white md:text-6xl">
              COMBINE RANKINGS
            </h1>
          </div>

          {/* Compact Rainbow Divider */}
          <div className="mb-6 flex items-center justify-center">
            <div className="to-eval-cyan h-0.5 w-12 bg-gradient-to-r from-transparent"></div>
            <div className="from-eval-cyan to-eval-purple h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-purple to-eval-orange h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-orange h-0.5 w-12 bg-gradient-to-r to-transparent"></div>
          </div>

          <p className="mx-auto max-w-3xl text-lg font-medium text-gray-300">
            The best players across the country, ranked by their performance in
            EVAL combines and tournaments.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="mx-auto max-w-4xl rounded-lg border border-white/10 bg-gray-900/40 p-6 shadow-2xl backdrop-blur-md">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="Search players, schools, or regions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="rounded-lg border-white/10 bg-gray-800/60 py-4 pr-4 pl-12 text-lg font-medium text-white backdrop-blur-md placeholder:text-gray-400 focus:border-cyan-400/50 focus:ring-cyan-400/30"
              />
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-cyan-400" />
                <span className="font-orbitron text-sm font-bold text-white">
                  FILTERS:
                </span>
              </div>

              <Select value={selectedGame} onValueChange={setSelectedGame}>
                <SelectTrigger className="w-48 border-white/10 bg-gray-800/60 font-medium text-white backdrop-blur-md transition-colors hover:border-cyan-400/50">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-gray-900/95 backdrop-blur-md">
                  <SelectItem
                    value="all"
                    className="font-medium text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    All Games
                  </SelectItem>
                  {games.map((game) => (
                    <SelectItem
                      key={game}
                      value={game}
                      className="font-medium text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-40 border-white/10 bg-gray-800/60 font-medium text-white backdrop-blur-md transition-colors hover:border-purple-400/50">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-gray-900/95 backdrop-blur-md">
                  <SelectItem
                    value="all"
                    className="font-medium text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    All Regions
                  </SelectItem>
                  {regions.map((region) => (
                    <SelectItem
                      key={region}
                      value={region}
                      className="font-medium text-white hover:bg-white/10 focus:bg-white/10"
                    >
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGame("all");
                  setSelectedRegion("all");
                }}
                className="border-white/10 bg-gray-800/60 font-medium text-white backdrop-blur-md transition-all duration-300 hover:border-orange-400/50 hover:bg-gray-700/60"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-16">
          <div className="rounded-lg border border-yellow-400/30 bg-gray-900/60 p-8 text-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-yellow-400/50">
            <div className="mb-4 flex items-center justify-center space-x-3">
              <Crown className="h-8 w-8 text-yellow-400" />
              <h2 className="font-orbitron text-2xl font-bold text-white">
                TOP PERFORMERS
              </h2>
            </div>
            <p className="mb-6 font-medium text-gray-300">
              These players have demonstrated exceptional skill across multiple
              EVAL combines and tournaments.
            </p>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-md border border-white/10 bg-gray-800/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/30 hover:bg-gray-700/40">
                <Crown className="mx-auto mb-2 h-6 w-6 text-yellow-400" />
                <h3 className="font-orbitron text-sm font-bold text-white">
                  ValorantKing
                </h3>
                <p className="text-xs font-medium text-gray-400">
                  VALORANT Champion
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-gray-800/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30 hover:bg-gray-700/40">
                <Trophy className="mx-auto mb-2 h-6 w-6 text-blue-400" />
                <h3 className="font-orbitron text-sm font-bold text-white">
                  RocketGod
                </h3>
                <p className="text-xs font-medium text-gray-400">
                  Rocket League MVP
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-gray-800/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-purple-400/30 hover:bg-gray-700/40">
                <Star className="mx-auto mb-2 h-6 w-6 text-purple-400" />
                <h3 className="font-orbitron text-sm font-bold text-white">
                  SmashKing
                </h3>
                <p className="text-xs font-medium text-gray-400">
                  Smash Champion
                </p>
              </div>
              <div className="rounded-md border border-white/10 bg-gray-800/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-orange-400/30 hover:bg-gray-700/40">
                <Award className="mx-auto mb-2 h-6 w-6 text-orange-400" />
                <h3 className="font-orbitron text-sm font-bold text-white">
                  OverwatchPro
                </h3>
                <p className="text-xs font-medium text-gray-400">OW2 Legend</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Rankings Grid */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {Object.entries(combineRankings)
            .filter(([game]) => selectedGame === "all" || game === selectedGame)
            .map(([game, players]) => (
              <GameRankingCard key={game} game={game} players={players} />
            ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 rounded-lg border border-white/10 bg-gray-900/60 px-4 py-16 text-center shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-800/60">
          <h2 className="font-orbitron mb-4 text-3xl font-bold tracking-wide text-white">
            READY TO CLIMB THE RANKINGS?
          </h2>
          <p className="mx-auto mb-8 max-w-3xl text-lg font-medium text-gray-300">
            Participate in EVAL combines and tournaments to showcase your skills
            and earn your place among the top players.
          </p>
          <div className="mx-auto flex max-w-lg flex-col justify-center gap-4 sm:flex-row">
            <Link href="/tryouts/combines">
              <Button className="font-orbitron bg-gradient-to-r from-cyan-400 to-cyan-500 px-8 py-3 font-bold tracking-wider text-black shadow-lg transition-all duration-300 hover:from-cyan-500 hover:to-cyan-600 hover:shadow-xl">
                JOIN NEXT COMBINE
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
