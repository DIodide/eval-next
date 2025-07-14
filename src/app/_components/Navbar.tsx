"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, User, GraduationCap, X, Shield, Menu, Trophy } from "lucide-react"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { api } from "@/trpc/react"

type SearchResult = {
  id: string
  type: "PLAYER" | "COACH" | "SCHOOL" | "LEAGUE"
  title: string
  subtitle: string
  image_url: string | null
  link: string | null
  game?: {
    name: string
    short_name: string
    icon: string | null
    color: string | null
  } | null
  school?: {
    id: string
    name: string
    type: string
    logo_url: string | null
  } | null
}

export default function Navbar() {
  const { user } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'player' | 'coach' | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchInputFocused, setSearchInputFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchResultsRef = useRef<HTMLDivElement>(null)
  
  // Check if we're on a dashboard route
  const isDashboardRoute = pathname?.startsWith('/dashboard')

  // Check admin status when user is signed in
  useEffect(() => {
    if (user) {
      setIsCheckingAdmin(true)
      fetch('/api/check-admin-status')
        .then(res => res.json())
        .then((data: { isAdmin: boolean }) => {
          setIsAdmin(data.isAdmin ?? false)
        })
        .catch(error => {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
        })
        .finally(() => {
          setIsCheckingAdmin(false)
        })
    } else {
      setIsAdmin(false)
      setIsCheckingAdmin(false)
    }
  }, [user])

  // Search functionality
  const { data: searchResults, isLoading: isSearchLoading } = api.publicSearch.search.useQuery(
    { query: searchQuery, limit: 8 },
    { 
      enabled: searchQuery.length >= 2, // Only search if query is at least 2 characters
      staleTime: 30 * 1000, // Cache results for 30 seconds
    }
  )

  // Handle clicking outside search to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(event.target as Node) &&
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false)
        setSearchInputFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show search results when we have results and input is focused
  useEffect(() => {
    setShowSearchResults(searchInputFocused && searchQuery.length >= 2 && (searchResults?.results.length ?? 0) > 0 && !isSearchLoading)
  }, [searchInputFocused, searchQuery, searchResults, isSearchLoading])

  const handleSearchResultClick = (result: SearchResult) => {
    if (!result?.link) return
    
    // Navigate immediately for instant redirect
    router.push(result.link)
    
    // Clean up state after navigation
    setSearchQuery("")
    setShowSearchResults(false)
    setSearchInputFocused(false)
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

  return (
    <nav className={`${isDashboardRoute ? 'nav-glass-static' : 'nav-glass'} z-50 px-4 py-4`}>
      <div className="container mx-auto flex items-center justify-between rounded-full">
        <Link href="/" className="items-center flex-shrink-0 logo-rainbow-hover py-1">
          <Image
            src="/eval/logos/eLOGO_white.png"
            alt="EVAL Logo"
            width={80}
            height={40}
            className="object-contain w-20 h-10 drop-shadow-lg"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-8">
          <SignedIn>
            <Link href="/dashboard" className="nav-link heading-section text-sm text-white hover:text-gray-200 transition-colors">
              DASHBOARD
            </Link>
          </SignedIn>
          <Link href="/recruiting" className="nav-link heading-section text-sm text-white hover:text-gray-200 transition-colors">
            RECRUITING
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-link-dropdown heading-section text-sm text-white hover:text-gray-200 transition-colors tracking-wide flex items-center cursor-context-menu relative">
              RANKINGS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-morphism border-white/20">
              <Link href="/rankings/leagues">
                <DropdownMenuItem className="font-inter dropdown-rainbow-shadow heading-section text-sm text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  LEAGUES
                </DropdownMenuItem>
              </Link>
              <Link href="/rankings/combines">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  COMBINES
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-link-dropdown heading-section text-sm text-white hover:text-gray-200 transition-colors tracking-wide flex items-center cursor-context-menu relative">
              TRYOUTS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-morphism border-white/20">
              <Link href="/tryouts/combines">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  EVAL COMBINES
                </DropdownMenuItem>
              </Link>
              <Link href="/tryouts/college">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                  COLLEGE
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/pricing" className="nav-link heading-section text-sm text-white hover:text-gray-200 transition-colors">
            PRICING
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-link-dropdown heading-section text-sm text-white hover:text-gray-200 transition-colors tracking-wide flex items-center cursor-context-menu relative">
              ABOUT US <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-morphism border-white/20">
              <Link href="/about/partners">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                  OUR PARTNERS
                </DropdownMenuItem>
              </Link>
              <Link href="/about/team">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                  OUR TEAM
                </DropdownMenuItem>
              </Link>
              <Link href="/about/contact">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                  CONTACT
                </DropdownMenuItem>
              </Link>
              <Link href="/about/faq">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                  FAQs
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          {isAdmin && !isCheckingAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger className="nav-link-dropdown heading-section text-sm text-white hover:text-red-400 transition-colors tracking-wide flex items-center cursor-context-menu relative">
                <Shield className="w-4 h-4 mr-1" />
                ADMIN <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-morphism border-white/20">
                <Link href="/admin">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                    ADMIN DASHBOARD
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-player-profile">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                    PLAYER PROFILE TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-tryouts">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                    TRYOUTS TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-combines">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                    COMBINES TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-messages">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                    MESSAGES TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-player-search">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                    PLAYER SEARCH TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/settings">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section text-sm text-white data-[highlighted]:bg-white/10 focus:bg-white/10 cursor-pointer">
                    ADMIN SETTINGS
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile menu button and user actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - Hidden on mobile, visible on md+ */}
          <div className="relative hidden md:block">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH PLAYERS, COACHES, SCHOOLS & LEAGUES"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchInputFocused(true)}
              className="search-rainbow font-orbitron glass-morphism text-premium text-white rounded-xl pl-4 pr-10 py-2 w-64 border-white/20 transition-all duration-300 focus:w-72"
            />
            {isSearchLoading && searchQuery.length >= 2 ? (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
              </div>
            ) : (
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            )}
            
            {/* Search Results Dropdown */}
            {(showSearchResults || (isSearchLoading && searchQuery.length >= 2)) && (
              <div
                ref={searchResultsRef}
                className="absolute top-full left-0 mt-2 glass-morphism border border-white/20 rounded-xl shadow-lg z-50 min-w-96 w-max max-w-lg esports-card"
                style={{
                  maxHeight: searchResults && searchResults.results.length === 1 ? 'auto' : '20rem',
                  overflowY: searchResults && searchResults.results.length <= 2 ? 'hidden' : 'auto',
                  overflowX: 'hidden'
                }}
              >
                {isSearchLoading && searchQuery.length >= 2 ? (
                  <div className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
                      <span className="text-gray-300 font-inter">Searching...</span>
                    </div>
                  </div>
                ) : (
                  searchResults?.results.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-6 py-4 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 transition-all duration-300 group"
                    >
                    <div className="flex items-center space-x-3">
                      {/* Profile Image or Game Icon */}
                      <div className="flex-shrink-0">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.title}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300"
                          />
                        ) : result.type === "PLAYER" && result.game?.icon ? (
                          <img
                            src={result.game.icon}
                            alt={result.game.name}
                            className="w-10 h-10 rounded object-cover ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300"
                          />
                        ) : result.type === "SCHOOL" ? (
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300">
                            <GraduationCap className="w-5 h-5 text-white" />
                          </div>
                        ) : result.type === "LEAGUE" ? (
                          <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Result Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold truncate font-inter group-hover:text-cyan-300 transition-colors duration-300">
                          {result.title}
                        </div>
                        <div className="text-gray-300 text-sm truncate font-inter">
                          {result.subtitle}
                        </div>
                        {result.type === "PLAYER" && result.game && (
                          <div className="text-xs text-cyan-400 font-medium mt-1">
                            {result.game.name}
                          </div>
                        )}
                      </div>
                      
                      {/* Type Badge */}
                      <div className="flex-shrink-0">
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold font-inter tracking-wide transition-all duration-300 ${
                          result.type === "PLAYER" 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white group-hover:from-cyan-400 group-hover:to-blue-500" 
                            : result.type === "COACH"
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white group-hover:from-green-400 group-hover:to-emerald-500"
                            : result.type === "LEAGUE"
                            ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white group-hover:from-orange-400 group-hover:to-yellow-500"
                            : "bg-gradient-to-r from-purple-500 to-violet-600 text-white group-hover:from-purple-400 group-hover:to-violet-500"
                        }`}>
                          {result.type}
                        </span>
                      </div>
                    </div>
                  </button>
                  ))
                )}
                
                {!isSearchLoading && searchQuery.length >= 2 && searchResults?.results.length === 0 && (
                  <div className="px-6 py-4 text-gray-400 text-center font-inter">
                    No results found for &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User buttons - visible on desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <Button
                onClick={() => setShowSignUpModal(true)}
                variant="outline"
                className="button-rainbow hover:bg-pink-600 text-white border-white rounded-full px-6 font-semibold"
              >
                SIGN UP
              </Button>
              <SignInButton mode="modal">
                <Button variant="outline" className="bg-white hover:bg-gray-300 text-black border-none rounded-full px-6 font-semibold">
                  SIGN IN
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all"
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Dashboard"
                    labelIcon={<User className="w-4 h-4" />}
                    href="/dashboard"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>

          {/* Mobile UserButton - visible only on mobile */}
          <div className="md:hidden">
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ring-2 ring-white/20 hover:ring-white/40 transition-all"
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Dashboard"
                    labelIcon={<User className="w-4 h-4" />}
                    href="/dashboard"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 backdrop-blur-sm border-t border-gray-700">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH PLAYERS, COACHES, SCHOOLS & LEAGUES"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchInputFocused(true)}
                className="search-rainbow w-full glass-morphism text-white rounded-xl pl-4 pr-12 py-3 font-inter transition-all duration-300"
              />
              {isSearchLoading && searchQuery.length >= 2 ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
                </div>
              ) : (
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              )}
              
              {/* Mobile Search Results */}
              {(showSearchResults || (isSearchLoading && searchQuery.length >= 2)) && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 glass-morphism border border-white/20 rounded-xl shadow-lg z-50 esports-card"
                  style={{
                    maxHeight: searchResults && searchResults.results.length === 1 ? 'auto' : '20rem',
                    overflowY: searchResults && searchResults.results.length <= 2 ? 'hidden' : 'auto',
                    overflowX: 'hidden'
                  }}
                >
                  {isSearchLoading && searchQuery.length >= 2 ? (
                    <div className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
                        <span className="text-gray-300 font-inter">Searching...</span>
                      </div>
                    </div>
                  ) : (
                    searchResults?.results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          handleSearchResultClick(result)
                          setIsMobileMenuOpen(false)
                        }}
                        className="w-full px-6 py-4 text-left hover:bg-white/10 border-b border-white/10 last:border-b-0 transition-all duration-300 group"
                      >
                      <div className="flex items-center space-x-3">
                        {/* Profile Image or Game Icon */}
                        <div className="flex-shrink-0">
                          {result.image_url ? (
                            <img
                              src={result.image_url}
                              alt={result.title}
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300"
                            />
                          ) : result.type === "PLAYER" && result.game?.icon ? (
                            <img
                              src={result.game.icon}
                              alt={result.game.name}
                              className="w-10 h-10 rounded object-cover ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300"
                            />
                          ) : result.type === "SCHOOL" ? (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300">
                              <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                          ) : result.type === "LEAGUE" ? (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300">
                              <Trophy className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all duration-300">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        {/* Result Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-semibold truncate font-inter group-hover:text-cyan-300 transition-colors duration-300">
                            {result.title}
                          </div>
                          <div className="text-gray-300 text-sm truncate font-inter">
                            {result.subtitle}
                          </div>
                          {result.type === "PLAYER" && result.game && (
                            <div className="text-xs text-cyan-400 font-medium mt-1">
                              {result.game.name}
                            </div>
                          )}
                        </div>
                        
                        {/* Type Badge */}
                        <div className="flex-shrink-0">
                          <span className={`px-3 py-1 text-xs rounded-full font-semibold font-inter tracking-wide transition-all duration-300 ${
                            result.type === "PLAYER" 
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white group-hover:from-cyan-400 group-hover:to-blue-500" 
                              : result.type === "COACH"
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white group-hover:from-green-400 group-hover:to-emerald-500"
                              : result.type === "LEAGUE"
                              ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white group-hover:from-orange-400 group-hover:to-yellow-500"
                              : "bg-gradient-to-r from-purple-500 to-violet-600 text-white group-hover:from-purple-400 group-hover:to-violet-500"
                          }`}>
                            {result.type}
                          </span>
                        </div>
                      </div>
                      </button>
                    ))
                  )}
                  
                  {!isSearchLoading && searchQuery.length >= 2 && searchResults?.results.length === 0 && (
                    <div className="px-6 py-4 text-gray-400 text-center font-inter">
                      No results found for &quot;{searchQuery}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="block font-orbitron text-white hover:text-cyan-400 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
              </SignedIn>
              
              <Link 
                href="/recruiting" 
                className="block font-orbitron text-white hover:text-cyan-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                RECRUITING
              </Link>

              {/* Rankings Submenu */}
              <div className="space-y-2">
                <div className="font-orbitron text-white py-2">RANKINGS</div>
                <div className="pl-4 space-y-2">
                  <Link 
                    href="/rankings/leagues"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    LEAGUES
                  </Link>
                  <Link 
                    href="/rankings/combines"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    COMBINES
                  </Link>
                </div>
              </div>

              {/* Tryouts Submenu */}
              <div className="space-y-2">
                <div className="font-orbitron text-white py-2">TRYOUTS</div>
                <div className="pl-4 space-y-2">
                  <Link 
                    href="/tryouts/combines"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    EVAL COMBINES
                  </Link>
                  <Link 
                    href="/tryouts/college"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    COLLEGE
                  </Link>
                </div>
              </div>

              <Link 
                href="/pricing" 
                className="block font-orbitron text-white hover:text-cyan-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                PRICING
              </Link>


              {/* About Us Submenu */}
              <div className="space-y-2">
                <div className="font-orbitron text-white py-2">ABOUT US</div>
                <div className="pl-4 space-y-2">
                  <Link 
                    href="/about/partners"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    OUR PARTNERS
                  </Link>
                  <Link 
                    href="/about/team"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    OUR TEAM
                  </Link>
                  <Link 
                    href="/about/contact"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    CONTACT
                  </Link>
                  <Link 
                    href="/about/faq"
                    className="block font-orbitron text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    FAQs
                  </Link>
                </div>
              </div>

              {/* Admin Menu for mobile */}
              {isAdmin && !isCheckingAdmin && (
                <div className="space-y-2">
                  <div className="font-orbitron text-red-400 py-2 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    ADMIN
                  </div>
                  <div className="pl-4 space-y-2">
                    <Link 
                      href="/admin"
                      className="block font-orbitron text-gray-300 hover:text-red-400 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ADMIN DASHBOARD
                    </Link>
                    <Link 
                      href="/admin/test-player-profile"
                      className="block font-orbitron text-gray-300 hover:text-red-400 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      PLAYER PROFILE TEST
                    </Link>
                    <Link 
                      href="/admin/test-tryouts"
                      className="block font-orbitron text-gray-300 hover:text-red-400 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      TRYOUTS TEST
                    </Link>
                    <Link 
                      href="/admin/test-combines"
                      className="block font-orbitron text-gray-300 hover:text-red-400 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      COMBINES TEST
                    </Link>
                    <Link 
                      href="/admin/test-messages"
                      className="block font-orbitron text-gray-300 hover:text-red-400 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      MESSAGES TEST
                    </Link>
                    <Link 
                      href="/admin/test-player-search"
                      className="block font-orbitron text-gray-300 hover:text-red-400 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      PLAYER SEARCH TEST
                    </Link>
                    <Link 
                      href="/admin/settings"
                      className="block font-orbitron text-gray-300 hover:text-red-400 transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ADMIN SETTINGS
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-700">
              <SignedOut>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowSignUpModal(true)
                      setIsMobileMenuOpen(false)
                    }}
                    className="button-rainbow w-full bg-pink-500 hover:bg-pink-600 text-white border-none rounded-full py-2"
                  >
                    SIGN UP
                  </Button>
                  <SignInButton mode="modal">
                    <Button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white border-none rounded-full py-2"
                    >
                      SIGN IN
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={resetAndCloseModal}>
        <DialogContent className="sm:max-w-lg bg-slate-900 text-white border-none">
          <DialogHeader className="relative">
            {/* <button
              onClick={resetAndCloseModal}
              className="absolute right-0 top-0 p-1 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button> */}
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
    </nav>
  )
}
