"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, User, GraduationCap, X } from "lucide-react"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Navbar() {
  const [showSignUpModal, setShowSignUpModal] = useState(false)
  const [selectedUserType, setSelectedUserType] = useState<'player' | 'coach' | null>(null)

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
    <nav className="bg-black text-white px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/eval/logos/eLOGO_white.png"
            alt="EVAL Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <SignedIn>
            <Link href="/dashboard/player" className="font-orbitron hover:text-cyan-400 transition-colors">
              DASHBOARD
            </Link>
          </SignedIn>
          <Link href="/recruiting" className="font-orbitron hover:text-cyan-400 transition-colors">
            RECRUITING
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="font-orbitron hover:text-cyan-400 transition-colors tracking-wide flex items-center cursor-context-menu">
              RANKINGS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <Link href="/rankings/leagues">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  LEAGUES
                </DropdownMenuItem>
              </Link>
              <Link href="/rankings/combines">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  COMBINES
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="font-orbitron hover:text-cyan-400 transition-colors tracking-wide flex items-center cursor-context-menu">
              TRYOUTS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <Link href="/tryouts/combines">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  EVAL COMBINES
                </DropdownMenuItem>
              </Link>
              <Link href="/tryouts/college">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  COLLEGE
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/pricing" className="font-orbitron hover:text-cyan-400 transition-colors">
            PRICING
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="font-orbitron hover:text-cyan-400 transition-colors tracking-wide flex items-center cursor-context-menu">
              ABOUT US <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <Link href="/about/partners">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  OUR PARTNERS
                </DropdownMenuItem>
              </Link>
              <Link href="/about/team">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  OUR TEAM
                </DropdownMenuItem>
              </Link>
              <Link href="/about/contact">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  CONTACT
                </DropdownMenuItem>
              </Link>
              <Link href="/about/faq">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  FAQs
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/test-playerprofile" className="font-orbitron hover:text-cyan-400 transition-colors">
            DEV
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="PLAYER SEARCH"
              className="bg-gray-800 text-gray-300 rounded-full pl-4 pr-10 py-2 w-48 focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          <SignedOut>
            <Button
              onClick={() => setShowSignUpModal(true)}
              variant="outline"
              className="bg-pink-500 hover:bg-pink-600 text-white border-none rounded-full px-6"
            >
              SIGN UP
            </Button>
            <SignInButton mode="modal">
              <Button variant="outline" className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-full px-6">
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
      </div>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={resetAndCloseModal}>
        <DialogContent className="sm:max-w-lg bg-slate-900 text-white border-none">
          <DialogHeader className="relative">
            <button
              onClick={resetAndCloseModal}
              className="absolute right-0 top-0 p-1 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
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
