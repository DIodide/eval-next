"use client"

/**
 * Combines Detail Page
 * 
 * Features:
 * - Real-time combine data from tRPC
 * - Registration and cancellation functionality
 * - Invite-only vs open combine handling
 * - Related combines carousel
 * - Responsive design with improved UI
 * - Loading and error states
 */

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { SignInButton, SignUpButton } from "@clerk/nextjs"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  MapPin, 
  Users, 
  Calendar, 
  Clock,
  ArrowLeft,
  LoaderIcon,
  CheckCircle,
  AlertCircle,
  XCircle,
  Lock,
  Trophy,
  Star,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react"
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

// Game icons
const gameIcons = {
  VALORANT: "🎯",
  "Overwatch 2": "⚡",
  "Rocket League": "🚀",
  "League of Legends": "⚔️",
  "Smash Ultimate": "🎮",
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

const formatTime = (timeStart?: string, timeEnd?: string) => {
  if (!timeStart) return "Time TBA"
  if (!timeEnd) return timeStart
  return `${timeStart} - ${timeEnd}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'bg-green-600 text-white'
    case 'PENDING':
      return 'bg-yellow-600 text-white'
    case 'WAITLISTED':
      return 'bg-orange-600 text-white'
    case 'DECLINED':
      return 'bg-red-600 text-white'
    case 'CANCELLED':
      return 'bg-gray-600 text-white'
    default:
      return 'bg-gray-600 text-white'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return <CheckCircle className="w-4 h-4" />
    case 'PENDING':
      return <Clock className="w-4 h-4" />
    case 'WAITLISTED':
      return <AlertCircle className="w-4 h-4" />
    case 'DECLINED':
      return <XCircle className="w-4 h-4" />
    case 'CANCELLED':
      return <XCircle className="w-4 h-4" />
    default:
      return <CheckCircle className="w-4 h-4" />
  }
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
    claimed_spots: number;
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
    time_start?: string | null;
    time_end?: string | null;
  };
}

function RelatedCombineCard({ combine }: CombineCardProps) {
  const gameName = gameNameMap[combine.game.name] ?? combine.game.name
  const gameColor = gameColors[gameName as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const gameIcon = gameIcons[gameName as keyof typeof gameIcons] || "🎮"
  const spotsLeft = combine.max_spots - combine.claimed_spots

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 min-w-[320px] hover:shadow-lg hover:shadow-cyan-400/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center`}
            >
              <span className="text-2xl">{gameIcon}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white text-sm tracking-wide">
                {combine.title} <span className="text-cyan-400">{combine.year}</span>
              </h3>
              <p className="text-gray-400 text-xs font-rajdhani">{gameName}</p>
            </div>
          </div>
          <Badge className={combine.invite_only ? "bg-yellow-400 text-black" : "bg-green-600 text-white"} variant="outline">
            {combine.invite_only ? "INVITE" : "OPEN"}
          </Badge>
        </div>

        <p className="text-gray-300 text-sm mb-4 font-rajdhani line-clamp-2">{combine.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.type} • {combine.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{spotsLeft}/{combine.max_spots} spots available</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{formatDate(combine.date)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-white font-medium">{formatTime(combine.time_start ?? undefined, combine.time_end ?? undefined)}</p>
              <p className="text-gray-400 text-sm">Event Time</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-rajdhani">EVAL Gaming</span>
          <Link href={`/tryouts/combines/${combine.id}`}>
            <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide">
              VIEW DETAILS
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function RelatedCombinesCarousel({ combines }: { combines: CombineCardProps['combine'][] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 3
  const maxIndex = Math.max(0, combines.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  if (combines.length === 0) return null

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide">
          Related Combines
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex space-x-6 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {combines.map((combine) => (
            <div key={combine.id} className="min-w-[calc(100%/3-1rem)]">
              <RelatedCombineCard combine={combine} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CombineDetailPage() {
  const { user } = useUser()
  const params = useParams()
  const combineId = params.id as string

  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false)
  const [registrationError, setRegistrationError] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
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

  // Fetch combine details
  const { 
    data: combine, 
    isLoading: isLoadingCombine, 
    error: combineError,
    refetch: refetchCombine 
  } = api.combines.getById.useQuery(
    { id: combineId },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    }
  )

  // Check if user is already registered
  const { 
    data: playerRegistrations,
    refetch: refetchPlayerRegistrations 
  } = api.combines.getPlayerRegistrations.useQuery(
    { status: "all", limit: 100 },
    {
      enabled: !!user,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  // Fetch related combines from the same game
  const { data: relatedCombinesResponse } = api.combines.browse.useQuery(
    {
      game_id: combine?.game.id,
      upcoming_only: true,
      limit: 10,
      offset: 0,
    },
    {
      enabled: !!combine?.game.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  // Register for combine mutation
  const registerMutation = api.combines.register.useMutation({
    onSuccess: () => {
      void refetchCombine()
      void refetchPlayerRegistrations()
      setRegistrationDialogOpen(false)
      setRegistrationError("")
    },
    onError: (error) => {
      console.error('Registration failed:', error)
      setRegistrationError(error.message)
    }
  })

  // Cancel registration mutation
  const cancelRegistrationMutation = api.combines.cancelRegistration.useMutation({
    onSuccess: () => {
      void refetchCombine()
      void refetchPlayerRegistrations()
      setCancelDialogOpen(false)
    },
    onError: (error) => {
      console.error('Cancel registration failed:', error)
      setRegistrationError(error.message)
    }
  })

  // Check if already registered
  const existingRegistration = playerRegistrations?.find(
    reg => reg.combine.id === combineId
  )

  const handleRegister = () => {
    setRegistrationError("")
    registerMutation.mutate({
      combine_id: combineId
    })
  }

  const handleCancelRegistration = () => {
    if (existingRegistration) {
      cancelRegistrationMutation.mutate({
        registration_id: existingRegistration.id
      })
    }
  }

  // Check if user can cancel registration
  const canCancelRegistration = existingRegistration && 
    ['PENDING', 'WAITLISTED', 'CONFIRMED'].includes(existingRegistration.status)

  // Transform related combines, excluding current combine
  const relatedCombines = relatedCombinesResponse?.combines
    ?.filter(relatedCombine => relatedCombine.id !== combineId) ?? []

  if (isLoadingCombine) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-32">
            <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400" />
            <span className="ml-3 text-gray-400 font-rajdhani">Loading combine details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (combineError || !combine) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center py-32">
            <h1 className="text-2xl font-orbitron font-bold text-white mb-4">
              Combine Not Found
            </h1>
            <p className="text-gray-400 mb-8">
              The combine you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/tryouts/combines">
              <Button className="bg-cyan-400 hover:bg-cyan-500 text-black">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Combines
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const gameName = gameNameMap[combine.game.name] ?? combine.game.name
  const gameColor = gameColors[gameName as keyof typeof gameColors] || "from-gray-500 to-gray-700"
  const gameIcon = gameIcons[gameName as keyof typeof gameIcons] || "🎮"
  const spotsLeft = combine.max_spots - combine.claimed_spots
  const isPastCombine = new Date(combine.date) < new Date()
  const canRegister = !isPastCombine && spotsLeft > 0 && !existingRegistration && user && !combine.invite_only

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/tryouts/combines">
            <Button variant="ghost" className="text-gray-400 hover:bg-transparent hover:text-cyan-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Combines
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={`w-16 h-16 bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center`}>
                      <span className="text-3xl">{gameIcon}</span>
                    </div>
                    <div className="flex-1">
                      <h1 className="font-orbitron font-black text-3xl text-white mb-2 cyber-text">
                        {combine.title} <span className="text-cyan-400">{combine.year}</span>
                      </h1>
                      <p className="text-xl text-gray-300 font-rajdhani">
                        {gameName}
                      </p>
                      <p className="text-gray-400 font-rajdhani">
                        Organized by {combine.organizer ? `${combine.organizer.first_name} ${combine.organizer.last_name}` : "EVAL Gaming"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={combine.invite_only ? "outline" : "secondary"}
                      className={`${
                        combine.invite_only 
                          ? "border-yellow-400 text-yellow-400" 
                          : "bg-green-600 text-white"
                      } font-orbitron text-lg px-4 py-2 mb-2`}
                    >
                      {combine.invite_only ? "INVITE ONLY" : "OPEN"}
                    </Badge>
                    <div className="text-sm text-gray-400">
                      {spotsLeft > 0 ? (
                        <span className="text-green-400">{spotsLeft} spots left</span>
                      ) : (
                        <span className="text-red-400">Full</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{formatDate(combine.date)}</p>
                      <p className="text-gray-400 text-sm">Competition Date</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{combine.type}</p>
                      <p className="text-gray-400 text-sm">{combine.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{combine.max_spots} Total Spots</p>
                      <p className="text-gray-400 text-sm">{combine.claimed_spots} registered</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{combine.prize_pool}</p>
                      <p className="text-gray-400 text-sm">Prize Pool</p>
                    </div>
                  </div>
                </div>

                {/* Registration Status or Button */}
                {existingRegistration ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(existingRegistration.status)}
                        <div>
                          <p className="text-white font-medium">Registration Status</p>
                          <Badge className={getStatusColor(existingRegistration.status)}>
                            {existingRegistration.status}
                          </Badge>
                          {existingRegistration.qualified && (
                            <Badge className="ml-2 bg-yellow-400 text-black">
                              <Star className="w-3 h-3 mr-1" />
                              QUALIFIED
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Cancel Registration Button */}
                      {canCancelRegistration && (
                        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="bg-red-700 border-red-700 text-white hover:bg-red-600 hover:text-white hover:border-red-600 font-rajdhani"
                              disabled={cancelRegistrationMutation.isPending}
                            >
                              {cancelRegistrationMutation.isPending ? (
                                <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4 mr-1" />
                              )}
                              Cancel
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-orbitron text-red-300">Cancel Registration</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Are you sure you want to cancel your registration for {combine.title}? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Cancel Error */}
                              {registrationError && (
                                <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3">
                                  <div className="flex items-center space-x-2">
                                    <XCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                                    <p className="text-red-300 text-sm">{registrationError}</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-end gap-3">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setCancelDialogOpen(false)
                                    setRegistrationError("")
                                  }}
                                  className="border-gray-600 text-black hover:bg-gray-700"
                                >
                                  Keep Registration
                                </Button>
                                <Button 
                                  onClick={handleCancelRegistration}
                                  disabled={cancelRegistrationMutation.isPending}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  {cancelRegistrationMutation.isPending ? (
                                    <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
                                  ) : (
                                    "Yes, Cancel"
                                  )}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ) : !user ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-white font-medium mb-4">Sign in to register for this combine</p>
                      <div className="flex gap-4 justify-center">
                        <Dialog open={showSignUpModal} onOpenChange={setShowSignUpModal}>
                          <DialogTrigger asChild>
                            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">
                              Sign Up
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-orbitron text-cyan-300">Choose Account Type</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Select the type of account you&apos;d like to create to get started.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 gap-3">
                                <div 
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    selectedUserType === 'player' 
                                      ? 'border-cyan-400 bg-cyan-400/10' 
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                  onClick={() => handleUserTypeSelect('player')}
                                >
                                  <h3 className="font-orbitron font-bold text-white mb-2">Player Account</h3>
                                  <p className="text-gray-400 text-sm">Register for combines, build your profile, and get scouted by colleges.</p>
                                </div>
                                <div 
                                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                    selectedUserType === 'coach' 
                                      ? 'border-cyan-400 bg-cyan-400/10' 
                                      : 'border-gray-600 hover:border-gray-500'
                                  }`}
                                  onClick={() => handleUserTypeSelect('coach')}
                                >
                                  <h3 className="font-orbitron font-bold text-white mb-2">Coach Account</h3>
                                  <p className="text-gray-400 text-sm">Scout players, manage tryouts, and recruit for your esports program.</p>
                                </div>
                              </div>
                              
                              <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={resetAndCloseModal} className="border-gray-600 text-black hover:bg-gray-700">
                                  Cancel
                                </Button>
                                <SignUpButton 
                                  mode="modal"
                                  forceRedirectUrl={selectedUserType === 'player' ? '/sign-up/players' : '/sign-up/schools'}
                                >
                                  <Button 
                                    onClick={handleSignUp}
                                    disabled={!selectedUserType}
                                    className="bg-cyan-400 hover:bg-cyan-500 text-black disabled:opacity-50"
                                  >
                                    Continue
                                  </Button>
                                </SignUpButton>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <SignInButton mode="modal">
                          <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-orbitron">
                            Sign In
                          </Button>
                        </SignInButton>
                      </div>
                    </div>
                  </div>
                ) : combine.invite_only ? (
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">Invitation Only</p>
                        <p className="text-gray-400 text-sm">This is an exclusive combine. Invitations are sent to qualifying players.</p>
                      </div>
                    </div>
                  </div>
                ) : canRegister ? (
                  <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold py-4 text-lg tracking-wider"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                        ) : null}
                        REGISTER NOW
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle className="font-orbitron text-cyan-300">Register for Combine</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Confirm your registration for {combine.title}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {registrationError && (
                          <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                              <p className="text-red-300 text-sm">{registrationError}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="bg-gray-800 rounded-lg p-4">
                          <p className="text-gray-300 text-sm mb-2">You&apos;re registering for:</p>
                          <p className="text-white font-medium">{combine.title} {combine.year}</p>
                          <p className="text-gray-400 text-sm">{formatDate(combine.date)}</p>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setRegistrationDialogOpen(false)
                              setRegistrationError("")
                            }}
                            className="border-gray-600 text-black hover:bg-gray-700"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleRegister}
                            disabled={registerMutation.isPending}
                            className="bg-cyan-400 hover:bg-cyan-500 text-black"
                          >
                            {registerMutation.isPending ? (
                              <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
                            ) : null}
                            Confirm Registration
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : isPastCombine ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-400 text-center">This combine has already occurred</p>
                  </div>
                ) : spotsLeft === 0 ? (
                  <Button 
                    disabled
                    className="w-full bg-gray-600 text-gray-400 font-orbitron font-bold py-4 text-lg tracking-wider cursor-not-allowed"
                  >
                    COMBINE FULL
                  </Button>
                ) : null}
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-orbitron text-xl text-white">
                  About This {combine.invite_only ? "Invitational" : "Combine"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  {combine.description}
                </p>
                {combine.invite_only && combine.requirements && (
                  <div className="mt-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <h4 className="font-orbitron text-white font-bold">Requirements</h4>
                    </div>
                    <p className="text-gray-300 font-rajdhani">{combine.requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="bg-gray-900 border-gray-800 sticky top-6">
              <CardContent className="p-6">
                <div
                  className={`w-full aspect-square bg-gradient-to-br ${gameColor} rounded-lg flex items-center justify-center mb-6`}
                >
                  <span className="text-7xl">{gameIcon}</span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-rajdhani">Entry Fee</span>
                    <span className="text-white font-orbitron text-lg">FREE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-rajdhani">Format</span>
                    <span className="text-white font-orbitron text-sm">{combine.format ?? "TBA"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 font-rajdhani">Status</span>
                    <Badge className={combine.status === 'REGISTRATION_OPEN' ? 'bg-green-600' : 'bg-gray-600'}>
                      {combine.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                <p className="text-center text-gray-400 font-rajdhani text-sm">
                  All EVAL combines are completely free to participate
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Combines */}
        <RelatedCombinesCarousel combines={relatedCombines} />
      </div>
    </div>
  )
}
