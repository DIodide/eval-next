"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { api } from "@/trpc/react";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import {
  ChevronDown,
  DollarSign,
  GraduationCap,
  Menu,
  Search,
  Shield,
  Trophy,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SearchResult = {
  id: string;
  type: "PLAYER" | "COACH" | "SCHOOL" | "LEAGUE";
  title: string;
  subtitle: string;
  image_url: string | null;
  link: string | null;
  game?: {
    name: string;
    short_name: string;
    icon: string | null;
    color: string | null;
  } | null;
  school?: {
    id: string;
    name: string;
    type: string;
    logo_url: string | null;
  } | null;
};

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<
    "player" | "coach" | null
  >(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchInputFocused, setSearchInputFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Check if we're on a dashboard route
  const isDashboardRoute = pathname?.startsWith("/dashboard");
  // Check if we're on the home page
  const isHomePage = pathname === "/";

  // Check admin status when user is signed in
  useEffect(() => {
    if (user) {
      setIsCheckingAdmin(true);
      fetch("/api/check-admin-status")
        .then((res) => res.json())
        .then((data: { isAdmin: boolean }) => {
          setIsAdmin(data.isAdmin ?? false);
        })
        .catch((error) => {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        })
        .finally(() => {
          setIsCheckingAdmin(false);
        });
    } else {
      setIsAdmin(false);
      setIsCheckingAdmin(false);
    }
  }, [user]);

  // Search functionality
  const { data: searchResults, isLoading: isSearchLoading } =
    api.publicSearch.search.useQuery(
      { query: searchQuery, limit: 8 },
      {
        enabled: searchQuery.length >= 2, // Only search if query is at least 2 characters
        staleTime: 30 * 1000, // Cache results for 30 seconds
      },
    );

  // Handle clicking outside search to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node)
      ) {
        setShowSearchResults(false);
        setSearchInputFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show search results when we have results and input is focused
  useEffect(() => {
    setShowSearchResults(searchInputFocused && searchQuery.length >= 2);
  }, [searchInputFocused, searchQuery]);

  const handleSearchResultClick = (result: SearchResult) => {
    if (!result?.link) return;

    // Navigate immediately for instant redirect
    router.push(result.link);

    // Clean up state after navigation
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchInputFocused(false);
  };

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

  return (
    <nav
      className={`${isDashboardRoute ? "nav-glass-static" : "nav-glass"} z-50 px-4 py-4`}
    >
      <div className="container mx-auto flex items-center justify-between rounded-full">
        <Link
          href="/"
          className="logo-rainbow-hover flex-shrink-0 items-center py-1"
        >
          <Image
            src="/eval/logos/eLOGO_white.png"
            alt="EVAL Logo"
            width={80}
            height={40}
            className="h-10 w-20 object-contain drop-shadow-lg"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-8 lg:flex">
          <SignedIn>
            <Link
              href="/dashboard"
              className="nav-link heading-section text-xs text-white transition-colors hover:text-gray-200"
            >
              DASHBOARD
            </Link>
          </SignedIn>
          <Link
            href="/recruiting"
            className="nav-link heading-section text-xs text-white transition-colors hover:text-gray-200"
          >
            RECRUITING
          </Link>
          <Link
            href="/news"
            className="nav-link heading-section text-xs text-white transition-colors hover:text-gray-200"
          >
            NEWS
          </Link>
          <Link
            href="/colleges"
            className="nav-link heading-section text-xs text-white transition-colors hover:text-gray-200"
          >
            COLLEGES
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-link-dropdown heading-section relative flex cursor-context-menu items-center text-xs tracking-wide text-white transition-colors hover:text-gray-200">
              RANKINGS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-morphism border-white/20">
              <Link href="/rankings/leagues">
                <DropdownMenuItem className="font-inter dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white hover:bg-white/10 focus:bg-white/10">
                  LEAGUES
                </DropdownMenuItem>
              </Link>
              <Link href="/rankings/combines">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white hover:bg-white/10 focus:bg-white/10">
                  COMBINES
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <DropdownMenu>
            <DropdownMenuTrigger className="nav-link-dropdown heading-section relative flex cursor-context-menu items-center text-xs tracking-wide text-white transition-colors hover:text-gray-200">
              TRYOUTS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-morphism border-white/20">
              <Link href="/tryouts/combines">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white hover:bg-white/10 focus:bg-white/10">
                  EVAL COMBINES
                </DropdownMenuItem>
              </Link>
              <Link href="/tryouts/college">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white hover:bg-white/10 focus:bg-white/10">
                  COLLEGE
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu> */}
          {/* <SignedOut>
            <Link
              href="/pricing"
              className="nav-link heading-section text-xs text-white transition-colors hover:text-gray-200"
            >
              PRICING
            </Link>
          </SignedOut> */}
          <DropdownMenu>
            <DropdownMenuTrigger className="nav-link-dropdown heading-section relative flex cursor-context-menu items-center text-xs tracking-wide text-white transition-colors hover:text-gray-200">
              ABOUT US <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-morphism border-white/20">
              <Link href="/about/partners">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                  OUR PARTNERS
                </DropdownMenuItem>
              </Link>
              <Link href="/about/team">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                  OUR TEAM
                </DropdownMenuItem>
              </Link>
              <Link href="/about/contact">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                  CONTACT
                </DropdownMenuItem>
              </Link>
              <Link href="/about/faq">
                <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                  FAQs
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          {isAdmin && !isCheckingAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger className="nav-link-dropdown heading-section relative flex cursor-context-menu items-center text-xs tracking-wide text-white transition-colors hover:text-red-400">
                <Shield className="mr-1 h-4 w-4" />
                ADMIN <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass-morphism border-white/20">
                <Link href="/admin">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                    ADMIN DASHBOARD
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-player-profile">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                    PLAYER PROFILE TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-tryouts">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                    TRYOUTS TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-combines">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                    COMBINES TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-messages">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                    MESSAGES TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/test-player-search">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                    PLAYER SEARCH TEST
                  </DropdownMenuItem>
                </Link>
                <Link href="/admin/settings">
                  <DropdownMenuItem className="dropdown-rainbow-shadow heading-section cursor-pointer text-xs text-white focus:bg-white/10 data-[highlighted]:bg-white/10">
                    ADMIN SETTINGS
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile menu button and user actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Search - Hidden on mobile, visible on md+, and hidden on home page */}
          {!isHomePage && (
            <div className="hidden md:block">
              <Popover
                open={
                  (showSearchResults ||
                    (isSearchLoading && searchQuery.length >= 2)) &&
                  searchQuery.length >= 2
                }
                onOpenChange={(open) => {
                  if (!open) {
                    setShowSearchResults(false);
                    setSearchInputFocused(false);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="SEARCH PLAYERS, COACHES, SCHOOLS & LEAGUES"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchInputFocused(true)}
                      className="search-rainbow font-orbitron glass-morphism text-premium w-64 rounded-xl border-white/20 py-2 pr-10 pl-4 text-white transition-all duration-300 focus:w-72"
                    />
                    {isSearchLoading && searchQuery.length >= 2 ? (
                      <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
                      </div>
                    ) : (
                      <Search className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    )}
                  </div>
                </PopoverTrigger>

                <PopoverContent
                  ref={searchResultsRef}
                  align="start"
                  sideOffset={8}
                  className="glass-morphism esports-card w-[32rem] max-w-[calc(100vw-2rem)] min-w-[24rem] border border-white/20 p-0 shadow-lg"
                  style={{
                    maxHeight:
                      searchResults && searchResults.results.length === 1
                        ? "auto"
                        : "20rem",
                    overflowY:
                      searchResults && searchResults.results.length <= 2
                        ? "hidden"
                        : "auto",
                    overflowX: "hidden",
                  }}
                >
                  {isSearchLoading && searchQuery.length >= 2 ? (
                    <div className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
                        <span className="font-inter text-gray-300">
                          Searching...
                        </span>
                      </div>
                    </div>
                  ) : (
                    searchResults?.results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSearchResultClick(result)}
                        className="group w-full border-b border-white/10 px-6 py-4 text-left transition-all duration-300 last:border-b-0 hover:bg-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          {/* Profile Image or Game Icon */}
                          <div className="flex-shrink-0">
                            {result.image_url ? (
                              <Image
                                src={result.image_url}
                                alt={result.title}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50"
                              />
                            ) : result.type === "PLAYER" &&
                              result.game?.icon ? (
                              <Image
                                src={result.game.icon}
                                alt={result.game.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded object-cover ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50"
                              />
                            ) : result.type === "SCHOOL" ? (
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-blue-600 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50">
                                <GraduationCap className="h-5 w-5 text-white" />
                              </div>
                            ) : result.type === "LEAGUE" ? (
                              <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-orange-500 to-yellow-600 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50">
                                <Trophy className="h-5 w-5 text-white" />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Result Info */}
                          <div className="min-w-0 flex-1">
                            <div className="font-inter truncate font-semibold text-white transition-colors duration-300 group-hover:text-cyan-300">
                              {result.title}
                            </div>
                            <div className="font-inter truncate text-sm text-gray-300">
                              {result.subtitle}
                            </div>
                            {result.type === "PLAYER" && result.game && (
                              <div className="mt-1 text-xs font-medium text-cyan-400">
                                {result.game.name}
                              </div>
                            )}
                          </div>

                          {/* Type Badge */}
                          <div className="flex-shrink-0">
                            <span
                              className={`font-inter rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300 ${
                                result.type === "PLAYER"
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white group-hover:from-cyan-400 group-hover:to-blue-500"
                                  : result.type === "COACH"
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white group-hover:from-green-400 group-hover:to-emerald-500"
                                    : result.type === "LEAGUE"
                                      ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white group-hover:from-orange-400 group-hover:to-yellow-500"
                                      : "bg-gradient-to-r from-purple-500 to-violet-600 text-white group-hover:from-purple-400 group-hover:to-violet-500"
                              }`}
                            >
                              {result.type}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}

                  {!isSearchLoading &&
                    searchQuery.length >= 2 &&
                    searchResults?.results.length === 0 && (
                      <div className="font-inter px-6 py-4 text-center text-gray-400">
                        No results found for &quot;{searchQuery}&quot;
                      </div>
                    )}
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* User buttons - visible on desktop */}
          <div className="hidden items-center space-x-4 md:flex">
            <SignedOut>
              <Button
                onClick={() => setShowSignUpModal(true)}
                variant="outline"
                className="button-rainbow rounded-full border-white px-6 font-semibold text-white hover:bg-pink-600"
              >
                SIGN UP
              </Button>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  className="rounded-full border-none bg-white px-6 font-semibold text-black hover:bg-gray-300"
                >
                  SIGN IN
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all",
                    userButtonPopoverCard:
                      "bg-slate-900 border border-white/20",
                    userButtonPopoverActions: "bg-slate-900",
                    userButtonPopoverActionButton:
                      "text-white hover:bg-white/10 data-[active]:bg-white/20",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverActionButtonIcon: "text-white",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Dashboard"
                    labelIcon={<User className="h-4 w-4" />}
                    href="/dashboard"
                  />
                  <UserButton.Link
                    label="Pricing"
                    labelIcon={<DollarSign className="h-4 w-4" />}
                    href="/pricing"
                  />
                  <UserButton.Action label="manageAccount" />
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
                    avatarBox:
                      "w-8 h-8 ring-2 ring-white/20 hover:ring-white/40 transition-all",
                    userButtonPopoverCard:
                      "bg-slate-900 border border-white/20",
                    userButtonPopoverActions: "bg-slate-900",
                    userButtonPopoverActionButton:
                      "text-white hover:bg-white/10 data-[active]:bg-white/20",
                    userButtonPopoverActionButtonText: "text-white",
                    userButtonPopoverActionButtonIcon: "text-white",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Dashboard"
                    labelIcon={<User className="h-4 w-4" />}
                    href="/dashboard"
                  />
                  <UserButton.Link
                    label="Pricing"
                    labelIcon={<DollarSign className="h-4 w-4" />}
                    href="/pricing"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md p-2 transition-colors hover:bg-gray-800 lg:hidden"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-700 bg-black/95 backdrop-blur-sm lg:hidden">
          <div className="container mx-auto space-y-4 px-4 py-4">
            {/* Mobile Search - Hidden on home page */}
            {!isHomePage && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="SEARCH PLAYERS, COACHES, SCHOOLS & LEAGUES"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchInputFocused(true)}
                  className="search-rainbow glass-morphism font-inter w-full rounded-xl py-3 pr-12 pl-4 text-white transition-all duration-300"
                />
                {isSearchLoading && searchQuery.length >= 2 ? (
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform"
                  >
                    <Search className="h-5 w-5 text-gray-400" />
                  </button>
                )}

                {/* Mobile Search Results */}
                {(showSearchResults ||
                  (isSearchLoading && searchQuery.length >= 2)) && (
                  <div
                    className="glass-morphism esports-card absolute top-full right-0 left-0 z-50 mt-2 rounded-xl border border-white/20 shadow-lg"
                    style={{
                      maxHeight:
                        searchResults && searchResults.results.length === 1
                          ? "auto"
                          : "20rem",
                      overflowY:
                        searchResults && searchResults.results.length <= 2
                          ? "hidden"
                          : "auto",
                      overflowX: "hidden",
                    }}
                  >
                    {isSearchLoading && searchQuery.length >= 2 ? (
                      <div className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
                          <span className="font-inter text-gray-300">
                            Searching...
                          </span>
                        </div>
                      </div>
                    ) : (
                      searchResults?.results.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => {
                            handleSearchResultClick(result);
                            setIsMobileMenuOpen(false);
                          }}
                          className="group w-full border-b border-white/10 px-6 py-4 text-left transition-all duration-300 last:border-b-0 hover:bg-white/10"
                        >
                          <div className="flex items-center space-x-3">
                            {/* Profile Image or Game Icon */}
                            <div className="flex-shrink-0">
                              {result.image_url ? (
                                <Image
                                  src={result.image_url}
                                  alt={result.title}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50"
                                />
                              ) : result.type === "PLAYER" &&
                                result.game?.icon ? (
                                <Image
                                  src={result.game.icon}
                                  alt={result.game.name}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded object-cover ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50"
                                />
                              ) : result.type === "SCHOOL" ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-blue-600 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50">
                                  <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                              ) : result.type === "LEAGUE" ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gradient-to-br from-orange-500 to-yellow-600 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50">
                                  <Trophy className="h-5 w-5 text-white" />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gray-600 to-gray-700 ring-2 ring-white/20 transition-all duration-300 group-hover:ring-cyan-400/50">
                                  <User className="h-5 w-5 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Result Info */}
                            <div className="min-w-0 flex-1">
                              <div className="font-inter truncate font-semibold text-white transition-colors duration-300 group-hover:text-cyan-300">
                                {result.title}
                              </div>
                              <div className="font-inter truncate text-sm text-gray-300">
                                {result.subtitle}
                              </div>
                              {result.type === "PLAYER" && result.game && (
                                <div className="mt-1 text-xs font-medium text-cyan-400">
                                  {result.game.name}
                                </div>
                              )}
                            </div>

                            {/* Type Badge */}
                            <div className="flex-shrink-0">
                              <span
                                className={`font-inter rounded-full px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300 ${
                                  result.type === "PLAYER"
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white group-hover:from-cyan-400 group-hover:to-blue-500"
                                    : result.type === "COACH"
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white group-hover:from-green-400 group-hover:to-emerald-500"
                                      : result.type === "LEAGUE"
                                        ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white group-hover:from-orange-400 group-hover:to-yellow-500"
                                        : "bg-gradient-to-r from-purple-500 to-violet-600 text-white group-hover:from-purple-400 group-hover:to-violet-500"
                                }`}
                              >
                                {result.type}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}

                    {!isSearchLoading &&
                      searchQuery.length >= 2 &&
                      searchResults?.results.length === 0 && (
                        <div className="font-inter px-6 py-4 text-center text-gray-400">
                          No results found for &quot;{searchQuery}&quot;
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* Mobile Navigation Links */}
            <div className="space-y-3">
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="font-orbitron block py-2 text-white transition-colors hover:text-cyan-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
              </SignedIn>

              <Link
                href="/recruiting"
                className="font-orbitron block py-2 text-white transition-colors hover:text-cyan-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                RECRUITING
              </Link>

              <Link
                href="/news"
                className="font-orbitron block py-2 text-white transition-colors hover:text-cyan-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                NEWS
              </Link>

              <Link
                href="/colleges"
                className="font-orbitron block py-2 text-white transition-colors hover:text-cyan-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                COLLEGES
              </Link>

              {/* Rankings Submenu */}
              <div className="space-y-2">
                <div className="font-orbitron py-2 text-white">RANKINGS</div>
                <div className="space-y-2 pl-4">
                  <Link
                    href="/rankings/leagues"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    LEAGUES
                  </Link>
                  <Link
                    href="/rankings/combines"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    COMBINES
                  </Link>
                </div>
              </div>

              {/* Tryouts Submenu */}
              <div className="space-y-2">
                <div className="font-orbitron py-2 text-white">TRYOUTS</div>
                <div className="space-y-2 pl-4">
                  <Link
                    href="/tryouts/combines"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    EVAL COMBINES
                  </Link>
                  <Link
                    href="/tryouts/college"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    COLLEGE
                  </Link>
                </div>
              </div>

              <SignedOut>
                <Link
                  href="/pricing"
                  className="font-orbitron block py-2 text-white transition-colors hover:text-cyan-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  PRICING
                </Link>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/pricing"
                  className="font-orbitron block py-2 text-white transition-colors hover:text-cyan-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  PRICING
                </Link>
              </SignedIn>

              {/* About Us Submenu */}
              <div className="space-y-2">
                <div className="font-orbitron py-2 text-white">ABOUT US</div>
                <div className="space-y-2 pl-4">
                  <Link
                    href="/about/partners"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    OUR PARTNERS
                  </Link>
                  <Link
                    href="/about/team"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    OUR TEAM
                  </Link>
                  <Link
                    href="/about/contact"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    CONTACT
                  </Link>
                  <Link
                    href="/about/faq"
                    className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-cyan-400"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    FAQs
                  </Link>
                </div>
              </div>

              {/* Admin Menu for mobile */}
              {isAdmin && !isCheckingAdmin && (
                <div className="space-y-2">
                  <div className="font-orbitron flex items-center py-2 text-red-400">
                    <Shield className="mr-2 h-4 w-4" />
                    ADMIN
                  </div>
                  <div className="space-y-2 pl-4">
                    <Link
                      href="/admin"
                      className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ADMIN DASHBOARD
                    </Link>
                    <Link
                      href="/admin/test-player-profile"
                      className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      PLAYER PROFILE TEST
                    </Link>
                    <Link
                      href="/admin/test-tryouts"
                      className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      TRYOUTS TEST
                    </Link>
                    <Link
                      href="/admin/test-combines"
                      className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      COMBINES TEST
                    </Link>
                    <Link
                      href="/admin/test-messages"
                      className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      MESSAGES TEST
                    </Link>
                    <Link
                      href="/admin/test-player-search"
                      className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      PLAYER SEARCH TEST
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="font-orbitron block py-1 text-gray-300 transition-colors hover:text-red-400"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      ADMIN SETTINGS
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="border-t border-gray-700 pt-4">
              <SignedOut>
                <div className="space-y-3">
                  <Button
                    onClick={() => {
                      setShowSignUpModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="button-rainbow w-full rounded-full border-none bg-pink-500 py-2 text-white hover:bg-pink-600"
                  >
                    SIGN UP
                  </Button>
                  <SignInButton mode="modal">
                    <Button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full rounded-full border-none bg-blue-500 py-2 text-white hover:bg-blue-600"
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
        <DialogContent className="border-none bg-slate-900 text-white sm:max-w-lg">
          <DialogHeader className="relative">
            {/* <button
              onClick={resetAndCloseModal}
              className="absolute right-0 top-0 p-1 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button> */}
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
    </nav>
  );
}
