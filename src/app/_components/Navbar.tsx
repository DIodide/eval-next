"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, User, GraduationCap, X, Shield, Menu } from "lucide-react"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Navbar() {
  const { user } = useUser()
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'player' | 'coach' | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <nav className="nav-glass lg:sticky lg:top-0 z-51 px-4 py-4">
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
              type="text"
              placeholder="SEARCH PLAYER"
              className="search-rainbow font-orbitron glass-morphism text-premium text-white rounded-xl pl-4 pr-10 py-1 w-48 border-white/20"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile UserButton - visible only on mobile */}
          <div className="md:hidden">
            <SignedIn>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
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
                placeholder="PLAYER SEARCH"
                className="search-rainbow w-full bg-gray-800 text-gray-300 rounded-full pl-4 pr-10 py-2"
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-white" />
              </button>
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
                    className="block font-inter text-gray-300 hover:text-cyan-400 transition-colors py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    LEAGUES
                  </Link>
                  <Link 
                    href="/rankings/combines"
                    className="block font-inter text-gray-300 hover:text-cyan-400 transition-colors py-1"
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
