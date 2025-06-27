"use client"

/**
 * Combines Page
 * 
 * Caching Strategy:
 * - Fetch all combines once with minimal server-side filtering (upcoming_only)
 * - Cache data for 5 minutes with 10-minute garbage collection
 * - All other filters (game, type, search, invite_only) applied client-side
 * - No network requests when changing filters - instant filtering from cache
 * - Games data cached separately for 15 minutes (more static)
 * - Smart refetch on mount and reconnect for fresh data
 */

import { useState, useMemo, useEffect, Suspense } from "react"
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search, 
  Filter, 
  Trophy, 
  ChevronRight, 
  MapPin, 
  Lock, 
  ChevronLeft,
  LoaderIcon,
  AlertCircleIcon,
  Clock
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/trpc/react"

// Map database game names to UI game names
const gameNameMap: Record<string, string> = {
  "VALORANT": "VALORANT",
  "Overwatch 2": "Overwatch 2", 
  "Super Smash Bros. Ultimate": "Smash Ultimate",
  "Rocket League": "Rocket League",
  "League of Legends": "League of Legends"
}

// Game colors for UI consistency
const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Rocket League": "from-blue-500 to-blue-700",
  "League of Legends": "from-purple-500 to-purple-700",
  "Smash Ultimate": "from-green-500 to-green-700",
}

// Game icon paths
const gameIconPaths = {
  VALORANT: "/valorant/logos/Valorant Logo Red Border.jpg",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Primary Logo.png", 
  "Rocket League": "/rocket-league/logos/Rocket League Emblem.png",
  "League of Legends": "/rocket-league/logos/Rocket League Emblem.png", // Fallback
  "Smash Ultimate": "/smash/logos/Smash Ball White Logo.png",
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const formatTime = (timeStart?: string, timeEnd?: string) => {
  if (!timeStart) return "Time TBA"
  if (!timeEnd) return timeStart
  return `${timeStart} - ${timeEnd}`
}

interface CombineCardProps {
  combine: {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    type: "ONLINE" | "IN_PERSON" | "HYBRID";
    year: string;
    max_spots: number;
    registered_spots: number;
    prize_pool: string;
    status: string;
    invite_only: boolean;
    game: {
      id: string;
      name: string;
      short_name: string;
      icon: string | null;
      color: string | null;
    };
    organizer: {
      id: string;
      first_name: string;
      last_name: string;
    } | null;
    _count: {
      registrations: number;
    };
    time_start?: string | null;
    time_end?: string | null;
  };
  isInvitational?: boolean;
}

function InvitationalCard({ combine }: CombineCardProps) {
  const gameName = gameNameMap[combine.game.name] ?? combine.game.name
  const gameColor = gameColors[gameName as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const bgColor = `bg-gradient-to-br ${gameColor.replace('from-', 'from-')}/80 ${gameColor.replace('to-', 'to-')}/80`

  return (
    <Link href={`/tryouts/combines/${combine.id}`} className="block h-full">
          <Card
      className={`glass-morphism border-white/20 p-2 hover:border-cyan-400/50 hover:scale-105 transition-all duration-300 h-full group ${bgColor}`}
    >
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Badge variant="outline" className="border-white/30 text-white font-rajdhani text-xs">
                {formatDate(combine.date)}
              </Badge>
            </div>
          </div>

          <h3 className="font-orbitron font-bold text-white text-lg tracking-wide mb-4">{combine.title}</h3>

          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-200 font-rajdhani">{combine.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-gray-200 font-rajdhani">{formatTime(combine.time_start ?? undefined, combine.time_end ?? undefined)}</span>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-gray-200 font-rajdhani">{gameName}</span>
            </div>
          </div>

          {/* Lock icon and status at bottom */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              <Badge className="bg-yellow-400 text-black font-orbitron text-xs">INVITATIONAL</Badge>
            </div>
            <div className="text-right">
              <span className="text-lg text-gray-200 font-rajdhani">{combine.registered_spots}/{combine.max_spots} spots taken</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function CombineCard({ combine }: CombineCardProps) {
  const gameName = gameNameMap[combine.game.name] ?? combine.game.name
  const gameColor = gameColors[gameName as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const bgColor = `bg-gradient-to-br ${gameColor.replace('from-', 'from-')}/60 ${gameColor.replace('to-', 'to-')}/60`

  return (
    <Link href={`/tryouts/combines/${combine.id}`} className="block h-full">
          <Card
      className={`glass-morphism border-white/20 hover:border-cyan-400/50 hover:scale-105 transition-all duration-300 h-full group ${bgColor}`}
    >
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <Badge className="bg-cyan-400 text-black font-orbitron text-xs">COMBINE</Badge>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="border-white/30 text-white font-rajdhani text-xs">
                {formatDate(combine.date)}
              </Badge>
            </div>
          </div>

          <h3 className="font-orbitron font-bold text-white text-lg tracking-wide mb-4">
            {combine.title} <span className="text-cyan-400">{combine.year}</span>
          </h3>

          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-200 font-rajdhani">{combine.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-green-400" />
              <span className="text-gray-200 font-rajdhani">{formatTime(combine.time_start ?? undefined, combine.time_end ?? undefined)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide">
              VIEW DETAILS
            </Button>
            <div className="text-right">
              <span className="text-lg  text-gray-200 font-rajdhani">{combine.registered_spots}/{combine.max_spots} spots taken</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface GameCarouselProps {
  game: string;
  combines: CombineCardProps['combine'][];
}

function GameCarousel({ game, combines }: GameCarouselProps) {
  const gameColor = gameColors[game as keyof typeof gameColors] ?? "from-gray-500 to-gray-700"
  const gameIconPath = gameIconPaths[game as keyof typeof gameIconPaths] ?? "/smash/logos/Smash Ball White Logo.png"
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3
  const maxIndex = Math.max(0, combines.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  // Separate invitational and regular combines
  const invitational = combines.find(c => c.invite_only)
  const regularCombines = combines.filter(c => !c.invite_only)

  // Combine them for display - invitational first if it exists
  const displayCombines = invitational ? [invitational, ...regularCombines] : regularCombines

  if (displayCombines.length === 0) return null

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center p-2">
            <Image
              src={gameIconPath}
              alt={`${game} logo`}
              width={48}
              height={48}
              className="object-contain w-full h-full"
            />
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide">{game}</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="glass-morphism border-white/20 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 hover:scale-110 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="glass-morphism border-white/20 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 hover:scale-110 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex space-x-4 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {displayCombines.map((combine) => (
            <div
              key={combine.id}
              className="min-w-[calc(100%/3-1rem)] md:min-w-[calc(50%-0.5rem)] lg:min-w-[calc(33.333%-0.667rem)] h-64"
            >
              {combine.invite_only ? (
                <InvitationalCard combine={combine} isInvitational={true} />
              ) : (
                <CombineCard combine={combine} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CombinesPageContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGame, setSelectedGame] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")
  const [inviteOnly, setInviteOnly] = useState<boolean | undefined>(undefined)
  const [upcomingOnly, setUpcomingOnly] = useState<boolean>(true)

  // Fetch ALL combines once and filter client-side for better caching
  const { 
    data: allCombinesResponse, 
    isLoading: isLoadingCombines, 
    error: combinesError,
    refetch: refetchCombines 
  } = api.combines.browse.useQuery({
    // Fetch all data without filters - this gets cached and reused
    upcoming_only: upcomingOnly, // Only this filter affects the server query (performance optimization)
    limit: 100, // Fetch more data upfront
    offset: 0
  }, {
    // Time-based invalidation: 30 seconds for development
    staleTime: 30 * 1000, // 30 seconds - data is considered fresh for 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes - garbage collection time for cached data
    refetchOnWindowFocus: true, // Refetch when window gains focus (helpful for development)
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnReconnect: true, // Refetch when internet connection is restored
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  // Client-side filtering of the cached data
  const combinesResponse = useMemo(() => {
    if (!allCombinesResponse?.combines) return allCombinesResponse;

    const filteredCombines = allCombinesResponse.combines.filter(combine => {
      // Game filter
      if (selectedGame !== "all" && combine.game.id !== selectedGame) {
        return false;
      }

      // Region filter (based on location)
      if (selectedRegion !== "all") {
        const location = combine.location.toLowerCase();
        if (selectedRegion === "online" && !location.includes("online")) return false;
        if (selectedRegion === "west" && !location.includes("ca") && !location.includes("wa") && !location.includes("seattle") && !location.includes("los angeles")) return false;
        if (selectedRegion === "east" && !location.includes("ny") && !location.includes("boston") && !location.includes("new york")) return false;
        if (selectedRegion === "central" && !location.includes("chicago") && !location.includes("austin") && !location.includes("il") && !location.includes("tx")) return false;
      }

      // Invite only filter
      if (inviteOnly !== undefined && combine.invite_only !== inviteOnly) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          combine.title.toLowerCase().includes(searchLower) ||
          combine.description.toLowerCase().includes(searchLower) ||
          combine.location.toLowerCase().includes(searchLower) ||
          combine.game.name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      return true;
    });

    return {
      ...allCombinesResponse,
      combines: filteredCombines,
      total: filteredCombines.length,
      hasMore: false // All data is loaded client-side
    };
  }, [allCombinesResponse, selectedGame, selectedRegion, inviteOnly, searchQuery])

  // Get available games for filter
  const { data: availableGames } = api.playerProfile.getAvailableGames.useQuery(undefined, {
    // Games data is more static, cache for longer
    staleTime: 15 * 60 * 1000, // 15 minutes - games don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection time
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch games on every mount
    refetchOnReconnect: false,
    retry: 2,
  })

  // Handle URL query parameters
  useEffect(() => {
    const gameParam = searchParams.get('game')
    if (gameParam) {
      // Find game by name (since URL passes game name, not ID)
      const matchingGame = availableGames?.find(game => 
        game.name === decodeURIComponent(gameParam)
      )
      if (matchingGame) {
        setSelectedGame(matchingGame.id)
      }
    }
  }, [searchParams, availableGames])

  // Group combines by game for display
  const combinesByGame = useMemo(() => {
    if (!combinesResponse?.combines || !availableGames) return {};

    const grouped: Record<string, typeof combinesResponse.combines> = {};
    
    availableGames.forEach(game => {
      const gameCombines = combinesResponse.combines.filter(combine => combine.game.id === game.id);
      if (gameCombines.length > 0) {
        const gameName = gameNameMap[game.name] ?? game.name;
        grouped[gameName] = gameCombines;
      }
    });

    return grouped;
  }, [combinesResponse, availableGames]);

  const clearFilters = (resetUpcomingOnly = false) => {
    setSearchQuery("")
    setSelectedGame("all")
    setSelectedRegion("all")
    setInviteOnly(undefined)
    if (resetUpcomingOnly) {
      setUpcomingOnly(true)
    }
  }

  // Loading state
  if (isLoadingCombines) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 relative">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="glass-morphism rounded-2xl p-8 text-center border-white/20">
            <LoaderIcon className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-white font-rajdhani text-lg">Loading combines...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (combinesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 relative">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative flex items-center justify-center min-h-screen">
          <div className="glass-morphism rounded-2xl p-8 text-center border-white/20 max-w-md">
            <AlertCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-white font-rajdhani mb-4 text-lg">Failed to load combines. Please try again.</p>
            <Button onClick={() => void refetchCombines()} className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/60">
    <div className="min-h-screen bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Floating Accent Elements
      <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-400/10 rounded-full blur-xl" /> */}
      
      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Compact Header with Rainbow Divider */}
        <div className="text-center mb-12">
          <div className="flex items-center space-x-2 text-sm text-gray-400 font-rajdhani mb-6 justify-center">
            <span>Tryouts</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-cyan-400 cyber-text">EVAL Combines</span>
          </div>
          
          <h1 className="font-orbitron font-black text-4xl sm:text-6xl text-white mb-4">
            EVAL COMBINES
          </h1>
          
          {/* Compact Rainbow Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-eval-cyan"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-cyan to-eval-purple"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-purple to-eval-orange"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-eval-orange to-transparent"></div>
          </div>
          
          <p className="text-lg sm:text-xl text-gray-300 font-rajdhani max-w-4xl mx-auto">
            Elite invitation-only tournaments featuring the best players in competitive esports. Earn your spot through
            exceptional performance and rankings.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="glass-morphism border-white/20 rounded-2xl p-6 sm:p-8 mb-12 backdrop-blur-sm">
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mb-8">
            <Input
              type="text"
              placeholder="Search combines, games, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-morphism border-white/20 text-white pl-12 pr-4 py-4 rounded-full text-lg font-rajdhani focus:border-cyan-400 focus:ring-cyan-400 placeholder-gray-400"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-orbitron text-sm">Filters:</span>
          </div>

          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="w-40 glass-morphism border-cyan-400/50 text-white font-rajdhani hover:border-cyan-400 transition-all">
              <SelectValue placeholder="All Games" />
            </SelectTrigger>
            <SelectContent className="glass-morphism border-white/20">
              <SelectItem value="all" className="text-white font-rajdhani">
                All Games
              </SelectItem>
              {availableGames?.filter(game => game.id && game.id.trim() !== '').map((game) => (
                <SelectItem key={game.id} value={game.id} className="text-white font-rajdhani">
                  {gameNameMap[game.name] ?? game.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40 glass-morphism border-purple-400/50 text-white font-rajdhani hover:border-purple-400 transition-all">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent className="glass-morphism border-white/20">
              <SelectItem value="all" className="text-white font-rajdhani">
                All Regions
              </SelectItem>
              <SelectItem value="online" className="text-white font-rajdhani">
                Online
              </SelectItem>
              <SelectItem value="west" className="text-white font-rajdhani">
                West Coast
              </SelectItem>
              <SelectItem value="east" className="text-white font-rajdhani">
                East Coast
              </SelectItem>
              <SelectItem value="central" className="text-white font-rajdhani">
                Central
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={inviteOnly === undefined ? "all" : inviteOnly ? "invite" : "open"} onValueChange={(value) => setInviteOnly(value === "all" ? undefined : value === "invite")}>
            <SelectTrigger className="w-40 glass-morphism border-orange-400/50 text-white font-rajdhani hover:border-orange-400 transition-all">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="glass-morphism border-white/20">
              <SelectItem value="all" className="text-white font-rajdhani">
                All Types
              </SelectItem>
              <SelectItem value="invite" className="text-white font-rajdhani">
                Invitational
              </SelectItem>
              <SelectItem value="open" className="text-white font-rajdhani">
                Open
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={upcomingOnly ? "upcoming" : "all"} onValueChange={(value) => setUpcomingOnly(value === "upcoming")}>
            <SelectTrigger className="w-40 glass-morphism border-cyan-400/50 text-white font-rajdhani hover:border-cyan-400 transition-all">
              <SelectValue placeholder="All Times" />
            </SelectTrigger>
            <SelectContent className="glass-morphism border-white/20">
              <SelectItem value="upcoming" className="text-white font-rajdhani">
                Upcoming Only
              </SelectItem>
              <SelectItem value="all" className="text-white font-rajdhani">
                All Times
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => clearFilters()}
            className="glass-morphism border-white/20 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 hover:scale-105 transition-all font-rajdhani"
          >
            Clear Filters
          </Button>

          <Button
            variant="outline"
            onClick={() => void refetchCombines()}
            className="glass-morphism border-cyan-400/50 text-cyan-400 hover:border-cyan-400 hover:text-cyan-400 hover:scale-105 transition-all font-rajdhani"
          >
            Refresh
          </Button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-6 max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h3 className="font-orbitron text-xl text-white">EVAL Invitationals</h3>
          </div>
          <p className="text-gray-300 font-rajdhani text-center">
            EVAL Invitationals are exclusive tournaments for top-performing players. Maintain high rankings and
            exceptional performance to receive invitations. Regular EVAL Combines are open to all players.
          </p>
        </div>

        {/* Game Carousels */}
        <div className="space-y-16">
          {Object.entries(combinesByGame)
            .filter(([game]) => selectedGame === "all" || combinesByGame[game]?.some(c => c.game.id === selectedGame))
            .map(([game, combines]) => (
              <GameCarousel key={game} game={game} combines={combines} />
            ))}
        </div>

        {/* No results message */}
        {Object.keys(combinesByGame).length === 0 && (
          <div className="glass-morphism border-white/20 rounded-2xl p-8 text-center">
            <AlertCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 font-rajdhani text-lg mb-4">No combines found matching your criteria.</p>
            <Button
              variant="outline"
              onClick={() => clearFilters(true)}
              className="glass-morphism border-cyan-400/50 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:scale-105 transition-all"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="px-4 text-center mt-20 py-16 glass-morphism border-white/20 rounded-2xl backdrop-blur-sm hover:border-cyan-400/30 transition-all duration-300">
          <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-4 tracking-wide">
            Ready to Compete at the Highest Level?
          </h2>
          <p className="text-gray-300 mb-8 font-rajdhani text-base sm:text-lg max-w-3xl mx-auto">
            Start building your profile today. Showcase your skills, climb the rankings, and earn your invitation to
            EVAL&apos;s most prestigious tournaments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Link href="/dashboard/player/profile">
              <Button className="bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-black font-orbitron font-bold px-8 py-3 tracking-wider w-full sm:w-auto hover:scale-105 transition-all">
                CREATE PROFILE
              </Button>
            </Link>
            <Link href="/rankings/combines">
              <Button
                variant="outline"
                className="glass-morphism border-cyan-400/50 text-cyan-400 hover:bg-cyan-400 hover:text-black font-orbitron font-bold px-8 py-3 tracking-wider w-full sm:w-auto hover:scale-105 transition-all"
              >
                VIEW RANKINGS
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default function EvalCombinesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CombinesPageContent />
    </Suspense>
  )
}
