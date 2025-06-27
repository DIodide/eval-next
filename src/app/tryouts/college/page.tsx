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
    <div className="min-h-screen bg-gray-900/60 text-white relative overflow-hidden">
      {/* Background accent elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-orange-500/5" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-orange-500/8 to-transparent rounded-full blur-xl"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Compact Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <h1 className="font-orbitron text-3xl md:text-6xl font-black text-white text-center">
              COLLEGE TRYOUTS
            </h1>
          </div>
          
          {/* Compact Rainbow Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-eval-cyan"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-cyan to-eval-purple"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-purple to-eval-orange"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-eval-orange to-transparent"></div>
          </div>
          
          <p className="text-lg text-gray-300 max-w-3xl mx-auto font-medium">
            Discover and register for esports tryouts at top colleges and universities across the country.
          </p>
          
          {user && (
            <div className="mt-4 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full px-4 py-2 border border-blue-400/30 max-w-fit mx-auto">
              <p className="text-sm text-blue-300 font-medium">
                Logged in as: {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          )}

          {/* Cache Status Indicator */}
          {tryoutsResponse && (
            <div className="mt-4 text-xs text-gray-400 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span>Real-time data • Smart caching • Instant filtering</span>
            </div>
          )}
        </div>

        {/* Enhanced Search and Filters */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-600/40 shadow-2xl">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search tryouts, schools, or games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-gray-700/50 border-gray-500/50 text-white placeholder-gray-400 font-medium focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 rounded-xl py-3 text-lg"
                />
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FilterIcon className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-orbitron font-bold text-white">FILTERS</h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearFilters()}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  hasActiveFilters 
                    ? "text-cyan-400 hover:text-white hover:bg-cyan-400/20 border-cyan-400/50 shadow-lg shadow-cyan-400/25" 
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50 border-gray-500/50"
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
                <Label className="text-gray-300 font-medium mb-2 block">Game</Label>
                <Select value={gameFilter} onValueChange={setGameFilter}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-500/50 text-white font-medium hover:border-cyan-400/50 transition-colors">
                    <SelectValue placeholder="All Games" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-sm">
                    <SelectItem value="all" className="text-white font-medium focus:bg-cyan-400/20">All Games</SelectItem>
                    {availableGames?.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white font-medium focus:bg-cyan-400/20">
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <Label className="text-gray-300 font-medium mb-2 block">Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-500/50 text-white font-medium hover:border-purple-400/50 transition-colors">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-sm">
                    <SelectItem value="all" className="text-white font-medium focus:bg-purple-400/20">All Types</SelectItem>
                    <SelectItem value="ONLINE" className="text-white font-medium focus:bg-purple-400/20">Online</SelectItem>
                    <SelectItem value="IN_PERSON" className="text-white font-medium focus:bg-purple-400/20">In-Person</SelectItem>
                    <SelectItem value="HYBRID" className="text-white font-medium focus:bg-purple-400/20">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* State Filter */}
              <div>
                <Label className="text-gray-300 font-medium mb-2 block">State</Label>
                <Select value={stateFilter} onValueChange={setStateFilter}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-500/50 text-white font-medium hover:border-orange-400/50 transition-colors">
                    <SelectValue placeholder="All States" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 backdrop-blur-sm">
                    <SelectItem value="all" className="text-white font-medium focus:bg-orange-400/20">All States</SelectItem>
                    {availableStates.map((state) => (
                      <SelectItem key={state} value={state} className="text-white font-medium focus:bg-orange-400/20">
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Filters */}
              <div className="space-y-3">
                <Label className="text-gray-300 font-medium block">Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="freeOnly"
                      checked={freeOnly}
                      onChange={(e) => setFreeOnly(e.target.checked)}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-500 text-cyan-400 focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="freeOnly" className="text-white text-sm font-medium">Free only</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="upcomingOnly"
                      checked={upcomingOnly}
                      onChange={(e) => setUpcomingOnly(e.target.checked)}
                      className="w-4 h-4 rounded bg-gray-700 border-gray-500 text-cyan-400 focus:ring-cyan-400 focus:ring-2"
                    />
                    <label htmlFor="upcomingOnly" className="text-white text-sm font-medium">Upcoming only</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            {tryoutsResponse && allTryoutsResponse && (
              <div className="mt-6 pt-6 border-t border-gray-600/40">
                <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full px-4 py-2 border border-gray-600/40 max-w-fit">
                  <p className="text-gray-300 font-medium text-sm">
                    Showing {tryoutsResponse.tryouts.length} of {allTryoutsResponse.tryouts.length} tryouts
                    {tryoutsResponse.tryouts.length !== allTryoutsResponse.tryouts.length && (
                      <span className="text-cyan-400"> (filtered)</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingTryouts && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LoaderIcon className="w-8 h-8 animate-spin text-cyan-400" />
              </div>
              <p className="text-gray-300 font-medium">Loading tryouts...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {tryoutsError && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-3xl p-12 border border-gray-600/40 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircleIcon className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="font-orbitron text-2xl font-bold text-white mb-4">Error Loading Tryouts</h3>
              <p className="text-gray-300 mb-8 font-medium text-lg">{tryoutsError.message}</p>
              <Button 
                onClick={() => void refetchTryouts()} 
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-orbitron rounded-full px-8 py-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-400/25"
              >
                Try Again
              </Button>
            </div>
          </div>
                 )}

        {/* Tryouts Content with Carousels */}
        {!isLoadingTryouts && !tryoutsError && (
          <>
            {Object.keys(tryoutsByGame).length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-3xl p-12 border border-gray-600/40 backdrop-blur-sm max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-600/40 to-gray-700/40 rounded-full flex items-center justify-center mx-auto mb-6">
                    <GamepadIcon className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="font-orbitron text-2xl font-bold text-white mb-4">No Tryouts Found</h3>
                  <p className="text-gray-400 font-medium text-lg mb-6">
                    {hasActiveFilters 
                      ? "No tryouts match your search criteria. Try adjusting your filters."
                      : "No tryouts are currently available. Check back later for new opportunities."
                    }
                  </p>
                  <Button 
                    onClick={() => clearFilters(true)}
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-orbitron rounded-full px-8 py-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-400/25"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            ) : (
              /* Game Carousels */
              <div className="space-y-12">
                {Object.entries(tryoutsByGame).map(([gameName, tryouts]) => (
                  <GameCarousel key={gameName} game={gameName as GameType} tryouts={tryouts} />
                ))}
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        {!isLoadingTryouts && !tryoutsError && Object.keys(tryoutsByGame).length > 0 && (
          <div className="px-4 text-center mt-20 py-16 bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-sm rounded-3xl border border-gray-600/40 shadow-2xl hover:border-cyan-400/30 hover:bg-gray-800/60 transition-all duration-300">
            <h2 className="font-orbitron text-3xl font-bold text-white mb-4 tracking-wide">
              CAN&apos;T FIND WHAT YOU&apos;RE LOOKING FOR?
            </h2>
            <p className="text-gray-300 mb-8 font-medium text-lg max-w-3xl mx-auto">
              Check out your dashboard to manage your applications and discover more opportunities across the platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
              <Link href="/dashboard/player/tryouts">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-orbitron font-bold px-8 py-3 tracking-wider rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-400/25">
                  MY DASHBOARD
                </Button>
              </Link>
              <Link href="/rankings/leagues">
                <Button variant="outline" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:border-cyan-400 font-orbitron font-bold px-8 py-3 tracking-wider rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-cyan-400/25">
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
