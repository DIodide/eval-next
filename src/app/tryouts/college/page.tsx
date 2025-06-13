"use client"

/**
 * College Tryouts Page
 * 
 * Caching Strategy:
 * - Fetch all tryouts once with minimal server-side filtering (upcoming_only)
 * - Cache data for 5 minutes with 10-minute garbage collection
 * - All other filters (game, type, state, search, free_only) applied client-side
 * - No network requests when changing filters - instant filtering from cache
 * - Games data cached separately for 15 minutes (more static)
 * - Smart refetch on mount and reconnect for fresh data
 */

import { useState, useMemo, useEffect, Suspense } from "react"
import { useUser } from "@clerk/nextjs"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Search, 
  LoaderIcon,
  FilterIcon,
  XCircleIcon,
  GamepadIcon,
  AlertCircleIcon,
  X
} from "lucide-react"
import Link from "next/link"
import { api } from "@/trpc/react"
import GameCarousel from "@/app/tryouts/_components/GameCarousel"
import type { GameType } from "@/app/tryouts/_components/GameCarousel"
import type { CardTryout } from "@/app/tryouts/_components/TryoutCard"
import type { Tryout } from "@/app/tryouts/types"

// Map database game names to UI game names
const gameNameMap: Record<string, GameType> = {
  "VALORANT": "VALORANT",
  "Overwatch 2": "Overwatch 2", 
  "Super Smash Bros. Ultimate": "Smash Ultimate",
  "Rocket League": "Rocket League"
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

// Transform API tryout to card tryout format
const transformToCardTryout = (apiTryout: Tryout): CardTryout => ({
  id: apiTryout.id,
  title: apiTryout.title,
  description: apiTryout.description,
  game: gameNameMap[apiTryout.game.name] ?? apiTryout.game.name as GameType,
  school: apiTryout.school.name,
  date: formatDate(apiTryout.date),
  time: formatTime(apiTryout.time_start ?? undefined, apiTryout.time_end ?? undefined),
  type: apiTryout.type,
  price: apiTryout.price === "Free" ? "Free" : apiTryout.price,
  spots: `${apiTryout.max_spots - apiTryout.registered_spots} spots left`,
  totalSpots: `${apiTryout.max_spots} total`,
  organizer: apiTryout.organizer ? `${apiTryout.organizer.first_name} ${apiTryout.organizer.last_name}` : "TBA",
})

function TryoutsPageContent() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [gameFilter, setGameFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [stateFilter, setStateFilter] = useState<string>("all")
  const [freeOnly, setFreeOnly] = useState<boolean>(false)
  const [upcomingOnly, setUpcomingOnly] = useState<boolean>(true)
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false)
  const [selectedTryout, setSelectedTryout] = useState<string | null>(null)
  const [registrationNotes, setRegistrationNotes] = useState("")

  // Fetch ALL tryouts once and filter client-side for better caching
  const { 
    data: allTryoutsResponse, 
    isLoading: isLoadingTryouts, 
    error: tryoutsError,
    refetch: refetchTryouts 
  } = api.tryouts.browse.useQuery({
    // Fetch all data without filters - this gets cached and reused
    upcoming_only: upcomingOnly, // Only this filter affects the server query (performance optimization)
    limit: 100, // Fetch more data upfront
    offset: 0
  }, {
    // Time-based invalidation: 5 minutes
    staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time for cached data
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnReconnect: true, // Refetch when internet connection is restored
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  })

  // Client-side filtering of the cached data
  const tryoutsResponse = useMemo(() => {
    if (!allTryoutsResponse?.tryouts) return allTryoutsResponse;

    const filteredTryouts = allTryoutsResponse.tryouts.filter(tryout => {
      // Game filter
      if (gameFilter !== "all" && tryout.game.id !== gameFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && tryout.type !== typeFilter) {
        return false;
      }

      // State filter
      if (stateFilter !== "all" && tryout.school.state !== stateFilter) {
        return false;
      }

      // Free only filter
      if (freeOnly && tryout.price !== "Free") {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          tryout.title.toLowerCase().includes(searchLower) ||
          tryout.description.toLowerCase().includes(searchLower) ||
          tryout.school.name.toLowerCase().includes(searchLower) ||
          tryout.game.name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      return true;
    });

    return {
      ...allTryoutsResponse,
      tryouts: filteredTryouts,
      total: filteredTryouts.length,
      hasMore: false // All data is loaded client-side
    };
  }, [allTryoutsResponse, gameFilter, typeFilter, stateFilter, freeOnly, searchQuery])

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
        setGameFilter(matchingGame.id)
      }
    }
  }, [searchParams, availableGames])

  // Register for tryout mutation
  const registerMutation = api.tryouts.register.useMutation({
    onSuccess: () => {
      void refetchTryouts() // This refetches the base data, then client-side filtering applies automatically
      setRegistrationDialogOpen(false)
      setSelectedTryout(null)
      setRegistrationNotes("")
    },
    onError: (error) => {
      console.error('Registration failed:', error)
    }
  })

  // Get unique states for filter
  const availableStates = useMemo(() => {
    if (!tryoutsResponse?.tryouts) return []
    const states = tryoutsResponse.tryouts.map(tryout => tryout.school.state)
    return [...new Set(states)].sort()
  }, [tryoutsResponse])

  // Group tryouts by game and transform to card format
  const tryoutsByGame = useMemo(() => {
    if (!tryoutsResponse?.tryouts) return {} as Record<GameType, CardTryout[]>;
    
    const grouped = {} as Record<GameType, CardTryout[]>;
    
    tryoutsResponse.tryouts.forEach(apiTryout => {
      const gameName = gameNameMap[apiTryout.game.name] ?? apiTryout.game.name as GameType;
      if (!grouped[gameName]) {
        grouped[gameName] = [];
      }
      grouped[gameName].push(transformToCardTryout(apiTryout));
    });
    
    return grouped;
  }, [tryoutsResponse])

  const handleRegister = () => {
    if (selectedTryout) {
      registerMutation.mutate({
        tryout_id: selectedTryout,
        notes: registrationNotes || undefined
      })
    }
  }

  const clearFilters = (resetUpcomingOnly = false) => {
    setSearchQuery("")
    setGameFilter("all")
    setTypeFilter("all")
    setStateFilter("all")
    setFreeOnly(false)
    if (resetUpcomingOnly) {
      setUpcomingOnly(true)
    }
  }

  // Check if any filters are active
  const hasActiveFilters = searchQuery !== "" || 
                          gameFilter !== "all" || 
                          typeFilter !== "all" || 
                          stateFilter !== "all" || 
                          freeOnly

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            TRYOUTS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-3xl mx-auto">
            Discover and register for esports tryouts at top colleges and universities
          </p>
          {user && (
            <p className="text-sm text-blue-400 mb-4">
              Logged in as: {user.emailAddresses[0]?.emailAddress}
            </p>
          )}

          {/* Cache Status Indicator */}
          {tryoutsResponse && (
            <div className="text-xs text-gray-500 mb-4 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Data cached • Client-side filtering • No network requests on filter changes</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Input
              type="text"
              placeholder="Search tryouts, schools, or games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white pl-12 pr-4 py-4 rounded-full text-lg font-rajdhani focus:border-cyan-400 focus:ring-cyan-400"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>

        {/* Filters Section */}
        <Card className="bg-gray-900 border-gray-800 p-6 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-4">
              <FilterIcon className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-orbitron font-bold text-white">Filters</h2>
              <div className="flex-1"></div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilters()}
                className={`flex items-center gap-2 ${
                  hasActiveFilters 
                    ? "text-cyan-400 hover:text-white hover:bg-cyan-900/20 border border-cyan-400/20" 
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4" />
                Clear Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-cyan-400 text-black font-medium">
                    {[searchQuery, gameFilter !== "all", typeFilter !== "all", stateFilter !== "all", freeOnly].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Game Filter */}
              <div>
                <Label className="text-gray-400 font-rajdhani mb-2">Game</Label>
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="All Games" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">All Games</SelectItem>
                    {availableGames?.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white">
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <Label className="text-gray-400 font-rajdhani mb-2">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">All Types</SelectItem>
                    <SelectItem value="ONLINE" className="text-white">Online</SelectItem>
                    <SelectItem value="IN_PERSON" className="text-white">In-Person</SelectItem>
                    <SelectItem value="HYBRID" className="text-white">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* State Filter */}
              <div>
                <Label className="text-gray-400 font-rajdhani mb-2">State</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all" className="text-white">All States</SelectItem>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={state} className="text-white">
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Filters */}
              <div className="space-y-2">
                <Label className="text-gray-400 font-rajdhani">Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="freeOnly"
                      checked={freeOnly}
                      onChange={(e) => setFreeOnly(e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700"
                    />
                    <label htmlFor="freeOnly" className="text-white text-sm">Free only</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="upcomingOnly"
                      checked={upcomingOnly}
                      onChange={(e) => setUpcomingOnly(e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700"
                    />
                    <label htmlFor="upcomingOnly" className="text-white text-sm">Upcoming only</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {tryoutsResponse && allTryoutsResponse && (
              <div className="text-sm text-gray-400">
                Showing {tryoutsResponse.tryouts.length} of {allTryoutsResponse.tryouts.length} tryouts
                {tryoutsResponse.tryouts.length !== allTryoutsResponse.tryouts.length && (
                  <span className="text-cyan-400"> (filtered)</span>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Loading State */}
        {isLoadingTryouts && (
          <Card className="bg-gray-900 border-gray-800 p-12">
            <div className="flex items-center justify-center space-x-3">
              <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400" />
              <span className="text-gray-400 text-lg">Loading tryouts...</span>
            </div>
          </Card>
        )}

        {/* Error State */}
        {tryoutsError && (
          <Card className="bg-gray-900 border-gray-800 p-12">
            <div className="text-center space-y-4">
              <XCircleIcon className="w-16 h-16 text-red-400 mx-auto" />
              <h3 className="text-xl font-semibold text-white">Error Loading Tryouts</h3>
              <p className="text-red-400 max-w-md mx-auto">{tryoutsError.message}</p>
              <Button 
                onClick={() => void refetchTryouts()} 
                className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {/* Tryouts Content with Carousels */}
        {!isLoadingTryouts && !tryoutsError && (
          <>
            {Object.keys(tryoutsByGame).length === 0 ? (
              /* Empty State */
              <Card className="bg-gray-900 border-gray-800 p-12">
                <div className="text-center space-y-6">
                  <GamepadIcon className="w-20 h-20 text-gray-400 mx-auto" />
                  <h3 className="text-2xl font-orbitron font-bold text-white">No Tryouts Found</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    No tryouts match your current filters. Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                  <Button 
                    onClick={() => clearFilters(true)}
                    className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron"
                  >
                    Reset Filters
                  </Button>
                </div>
              </Card>
            ) : (
              /* Game Carousels */
              <div className="space-y-8">
                {Object.entries(tryoutsByGame).map(([gameName, tryouts]) => (
                  <GameCarousel key={gameName} game={gameName as GameType} tryouts={tryouts} />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        {!isLoadingTryouts && !tryoutsError && Object.keys(tryoutsByGame).length > 0 && (
          <div className="text-center mt-20 py-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
            <h2 className="font-orbitron text-3xl font-bold text-white mb-4 tracking-wide">
              CAN&apos;T FIND WHAT YOU&apos;RE LOOKING FOR?
            </h2>
            <p className="text-gray-300 mb-8 font-rajdhani text-lg">
              Check out your dashboard to manage your applications and discover more opportunities
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard/player/tryouts">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-orbitron font-bold px-8 py-3 tracking-wider">
                  MY DASHBOARD
                </Button>
              </Link>
              <Link href="/rankings/leagues">
                <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-orbitron font-bold px-8 py-3 tracking-wider">
                  VIEW RANKINGS
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Registration Dialog */}
      <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-orbitron">Register for Tryout</DialogTitle>
            <DialogDescription className="text-gray-400">
              {user ? "Complete your registration below" : "You must be signed in to register for tryouts"}
            </DialogDescription>
          </DialogHeader>
          
          {user ? (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 font-rajdhani mb-2">Registration Notes (Optional)</Label>
                <textarea
                  value={registrationNotes}
                  onChange={(e) => setRegistrationNotes(e.target.value)}
                  placeholder="Add any notes about your registration, experience, or specific roles you play..."
                  className="w-full bg-gray-800 border-gray-700 text-white rounded-lg p-3 h-24 resize-none focus:border-cyan-400 focus:ring-cyan-400"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300" 
                  onClick={() => setRegistrationDialogOpen(false)}
                  disabled={registerMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleRegister}
                  className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Register
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <AlertCircleIcon className="w-12 h-12 text-yellow-400 mx-auto" />
              <p className="text-gray-400">Please sign in to register for tryouts</p>
              <Link href="/sign-up/players">
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">
                  Sign Up / Sign In
                </Button>
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function TryoutsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TryoutsPageContent />
    </Suspense>
  )
}
