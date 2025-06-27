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
import Image from "next/image"
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
  X,
  Share2,
  Copy,
  Mail,
  Building
} from "lucide-react"
import { api } from "@/trpc/react"
import { toast } from "sonner"

// Map database game names to UI game names
const gameNameMap: Record<string, string> = {
  "VALORANT": "VALORANT",
  "Overwatch 2": "Overwatch 2", 
  "Super Smash Bros. Ultimate": "Smash Ultimate",
  "Rocket League": "Rocket League",
  "League of Legends": "League of Legends"
}



// Game icons - using actual game logos
const gameIcons = {
  "VALORANT": "/valorant/logos/Valorant Logo Red Border.jpg",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Primary Logo.png", 
  "Super Smash Bros. Ultimate": "/smash/logos/Smash Ball White Logo.png",
  "Rocket League": "/rocket-league/logos/Rocket League Emblem.png",
} as const

// Helper function to get game icon
const getGameIcon = (gameName: string) => {
  return gameIcons[gameName as keyof typeof gameIcons] ?? "/eval/logos/emblem.png"
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

// Enhanced time formatting with timezone conversion
const formatDateTimeInLocalTimezone = (
  utcDate: Date, 
  timeStart?: string | null, 
  timeEnd?: string | null,
  options: {
    showDate?: boolean;
    showTime?: boolean;
    showTimezone?: boolean;
  } = { showDate: true, showTime: true, showTimezone: true }
) => {
  if (!timeStart) {
    if (options.showDate && options.showTime) {
      return `${formatDate(utcDate)} • Time TBA`
    }
    return options.showDate ? formatDate(utcDate) : "Time TBA"
  }

  // Create a Date object by combining the UTC date with the time
  // We assume the time is stored in UTC and needs to be converted to local
  const timeParts = timeStart.split(':')
  const startHours = parseInt(timeParts[0] ?? '0', 10)
  const startMinutes = parseInt(timeParts[1] ?? '0', 10)
  
  // Create UTC datetime by combining date and time
  const utcDateTime = new Date(utcDate)
  utcDateTime.setUTCHours(startHours, startMinutes, 0, 0)
  
  const formatOptions: Intl.DateTimeFormatOptions = {}
  
  if (options.showDate) {
    formatOptions.weekday = 'long'
    formatOptions.year = 'numeric'
    formatOptions.month = 'long'
    formatOptions.day = 'numeric'
  }
  
  if (options.showTime) {
    formatOptions.hour = '2-digit'
    formatOptions.minute = '2-digit'
    if (options.showTimezone) {
      formatOptions.timeZoneName = 'short'
    }
  }

  const localStart = new Intl.DateTimeFormat('en-US', formatOptions).format(utcDateTime)

  // Handle end time if provided
  if (timeEnd) {
    const endTimeParts = timeEnd.split(':')
    const endHours = parseInt(endTimeParts[0] ?? '0', 10)
    const endMinutes = parseInt(endTimeParts[1] ?? '0', 10)
    const utcEndDateTime = new Date(utcDate)
    utcEndDateTime.setUTCHours(endHours, endMinutes, 0, 0)
    
    const localEnd = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      ...(options.showTimezone ? { timeZoneName: 'short' } : {})
    }).format(utcEndDateTime)

    if (options.showDate) {
      return `${localStart} - ${localEnd.split(' ').slice(-2).join(' ')}`
    } else {
      return `${localStart} - ${localEnd}`
    }
  }

  return localStart
}

// Keep legacy function for backward compatibility but mark as deprecated
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
    time_start?: string | null;
    time_end?: string | null;
  };
}

function RelatedCombineCard({ combine }: CombineCardProps) {
  const gameName = gameNameMap[combine.game.name] ?? combine.game.name
  const spotsLeft = combine.max_spots - combine.registered_spots

  return (
    <Card className="glass-morphism border-white/20 hover:border-cyan-400/50 transition-all duration-300 min-w-[320px] hover:shadow-lg hover:shadow-cyan-400/20 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={getGameIcon(combine.game.name)}
                alt={combine.game.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white text-sm tracking-wide">
                {combine.title} <span className="text-cyan-400">{combine.year}</span>
              </h3>
              <p className="text-gray-400 text-xs font-rajdhani">{gameName}</p>
            </div>
          </div>
          <Badge className={`${combine.invite_only ? "bg-yellow-400 text-black hover:bg-yellow-300" : "bg-green-600 text-white hover:bg-green-500"} transition-all duration-300 hover:scale-105`} variant="outline">
            {combine.invite_only ? "INVITE" : "OPEN"}
          </Badge>
        </div>

        <p className="text-gray-300 text-sm mb-4 font-rajdhani line-clamp-2">{combine.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm glass-morphism border-white/10 rounded-lg p-2 hover:border-cyan-400/30 transition-all duration-300">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{combine.type} • {combine.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm glass-morphism border-white/10 rounded-lg p-2 hover:border-purple-400/30 transition-all duration-300">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300 font-rajdhani">{spotsLeft}/{combine.max_spots} spots available</span>
          </div>
          <div className="flex items-center space-x-2 text-sm glass-morphism border-white/10 rounded-lg p-2 hover:border-orange-400/30 transition-all duration-300">
            <Calendar className="w-4 h-4 text-orange-400" />
            <span className="text-gray-300 font-rajdhani">{formatDate(combine.date)}</span>
          </div>
          <div className="flex items-center space-x-3 glass-morphism border-white/10 rounded-lg p-2 hover:border-cyan-400/30 transition-all duration-300">
            <Clock className="w-5 h-5 text-cyan-400" />
            <div>
              <p className="text-white font-medium">{formatDateTimeInLocalTimezone(combine.date, combine.time_start, combine.time_end, { showDate: false, showTime: true, showTimezone: false })}</p>
              <p className="text-gray-400 text-sm">Local Time</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-rajdhani">EVAL Gaming</span>
          <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide pointer-events-none">
            VIEW DETAILS
          </Button>
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
      <div className="glass-morphism border-white/20 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-400/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <h2 className="font-orbitron text-3xl font-bold text-white tracking-wide">
              <span className="text-purple-400">RELATED</span> COMBINES
            </h2>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="glass-morphism border-white/20 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="glass-morphism border-white/20 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg">
          <div
            className="flex space-x-6 transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {combines.map((combine) => (
              <div key={combine.id} className="min-w-[calc(100%/3-1rem)]">
                <Link href={`/tryouts/combines/${combine.id}`} className="block transition-transform ">
                  <RelatedCombineCard combine={combine} />
                </Link>
              </div>
            ))}
          </div>
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
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 relative">
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Floating Accent Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-400/10 rounded-full blur-xl animate-pulse" />
        
        <div className="relative container mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="glass-morphism rounded-2xl p-8 text-center border-white/20 hover:border-cyan-400/30 transition-all duration-300">
              <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400 mx-auto mb-4" />
              <span className="text-white font-rajdhani text-lg">Loading combine details...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (combineError || !combine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 relative">
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Floating Accent Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-400/10 rounded-full blur-xl" />
        
        <div className="relative container mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="glass-morphism rounded-2xl p-8 text-center border-white/20 hover:border-red-400/30 transition-all duration-300 max-w-md">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-2xl font-orbitron font-bold text-white mb-4">
                Combine Not Found
              </h1>
              <p className="text-gray-400 mb-8 font-rajdhani">
                The combine you&apos;re looking for doesn&apos;t exist or has been removed.
              </p>
              <Link href="/tryouts/combines">
                <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron transition-all duration-300 hover:scale-105">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Combines
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const gameName = gameNameMap[combine.game.name] ?? combine.game.name
  const spotsLeft = combine.max_spots - combine.registered_spots
  const isPastCombine = new Date(combine.date) < new Date()
  const canRegister = !isPastCombine && spotsLeft > 0 && !existingRegistration && user && !combine.invite_only

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30 relative">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Floating Accent Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-cyan-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-400/10 rounded-full blur-xl animate-pulse" />
      <div className="absolute top-1/2 right-10 w-20 h-20 bg-cyan-400/5 rounded-full blur-xl animate-pulse" />
      
      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Compact Header with Rainbow Divider */}
        <div className="text-center mb-12">
          <Link href="/tryouts/combines" className="inline-flex items-center text-gray-400 hover:text-cyan-300 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-rajdhani">Back to Combines</span>
          </Link>
          
          <h1 className="font-orbitron font-black text-4xl sm:text-5xl text-white mb-4 tracking-wider">
            EVAL COMBINE
          </h1>
          
          {/* Compact Rainbow Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-eval-cyan"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-cyan to-eval-purple"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-eval-purple to-eval-orange"></div>
            <div className="w-12 h-0.5 bg-gradient-to-r from-eval-orange to-transparent"></div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
            
            {/* Header Card */}
            <Card className="glass-morphism border-white/20 hover:border-cyan-400/30 transition-all duration-300">
              <CardContent className="p-8">
                {/* Combine Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                  <div className="flex items-center space-x-6 mb-4 lg:mb-0">
                    <div className="w-20 h-20 glass-morphism rounded-full flex items-center justify-center border-white/20 shadow-lg overflow-hidden">
                      <Image
                        src={getGameIcon(combine.game.name)}
                        alt={combine.game.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h1 className="font-orbitron font-black text-3xl lg:text-4xl text-white mb-2 cyber-text">
                        {combine.title} <span className="text-cyan-400">{combine.year}</span>
                      </h1>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                        <p className="text-xl text-gray-300 font-rajdhani font-semibold">
                          EVAL Gaming
                        </p>
                        <div className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full"></div>
                        <p className="text-gray-400 font-rajdhani">
                          Official EVAL Combine
                        </p>
                        <div className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full"></div>
                        <Badge
                          className={`${
                            combine.invite_only 
                              ? "bg-yellow-400 text-black hover:bg-yellow-300" 
                              : "bg-green-600 text-white hover:bg-green-500"
                          } transition-all duration-300 hover:scale-105`}
                        >
                          {combine.invite_only ? "INVITE ONLY" : "OPEN ENTRY"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Share Button */}
                  <div className="flex items-center cursor-pointer">
                    <button 
                      onClick={() => {
                        void navigator.clipboard.writeText(window.location.href).then(() => {
                          toast.success("Link copied!", {
                            description: "Combine link has been copied to your clipboard",
                          })
                        }).catch(() => {
                          toast.error("Failed to copy link", {
                            description: "Please try again or copy the URL manually",
                          })
                        })
                      }}
                      className="flex items-center space-x-2 glass-morphism border-white/20 hover:border-cyan-400/50 text-cyan-400 hover:text-cyan-300 rounded-lg px-4 py-2 transition-all duration-300 transform hover:scale-105 group"
                    >
                      <Share2 className="cursor-pointer w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span className="cursor-pointer font-medium">Share</span>
                    </button>
                  </div>
                </div>

                {/* Critical Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Date & Time */}
                  <div className="glass-morphism border-white/10 rounded-lg p-4 hover:border-cyan-400/30 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <span className="font-orbitron text-cyan-400 text-sm font-semibold">WHEN</span>
                    </div>
                    <p className="text-white font-semibold text-lg mb-1">{formatDate(combine.date)}</p>
                    <p className="text-gray-300 font-medium">{formatDateTimeInLocalTimezone(combine.date, combine.time_start, combine.time_end, { showDate: false, showTime: true, showTimezone: true })}</p>
                  </div>

                  {/* Location & Format */}
                  <div className="glass-morphism border-white/10 rounded-lg p-4 hover:border-purple-400/30 transition-all duration-300">
                    <div className="flex items-center space-x-3 mb-2">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      <span className="font-orbitron text-purple-400 text-sm font-semibold">WHERE</span>
                    </div>
                    <p className="text-white font-semibold text-lg mb-1">{combine.type}</p>
                    <p className="text-gray-300 font-medium">{combine.location}</p>
                  </div>
                </div>

                {/* Combine Summary */}
                <div className="glass-morphism border-white/10 rounded-lg p-6 mb-6">
                  <h3 className="font-orbitron text-white text-lg font-semibold mb-3">
                    ABOUT THIS COMBINE
                  </h3>
                  <p className="text-gray-300 font-rajdhani text-lg leading-relaxed mb-4">
                    {combine.description}
                  </p>
                  {combine.long_description && combine.long_description !== combine.description && (
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-gray-400 font-rajdhani leading-relaxed">
                        {combine.long_description}
                      </p>
                    </div>
                  )}
                  
                  {/* EVAL Contact Information */}
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    {/* Contact Info */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-400 text-sm">Organized by</span>
                        <span className="text-white font-medium">EVAL Gaming</span>
                      </div>
                      <div className="flex items-center space-x-2 pl-6">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 text-sm">support@evalgaming.com</span>
                      </div>
                    </div>

                    {/* Prize Pool */}
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <div>
                        <span className="text-white font-medium">Prize Pool: </span>
                        <span className="text-orange-400 font-semibold">{combine.prize_pool}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Two Column Layout for Requirements and Registration */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Requirements */}
                  <div className="glass-morphism border-white/10 rounded-lg p-6">
                    <h3 className="font-orbitron text-orange-400 text-lg font-semibold mb-4">
                      REQUIREMENTS
                    </h3>
                    <div className="space-y-3">
                      {/* Entry Fee */}
                      <div className="flex items-center space-x-3">
                        <Trophy className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <div>
                          <span className="text-white font-medium">Entry Fee: </span>
                          <span className="text-green-400 font-semibold">FREE</span>
                        </div>
                      </div>
                      
                      {/* Game */}
                      <div className="flex items-center space-x-3">
                        <Users className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <div>
                          <span className="text-white font-medium">Game: </span>
                          <span className="text-gray-300">{gameName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registration Progress */}
                  <div className="glass-morphism border-white/10 rounded-lg p-6">
                    <h3 className="font-orbitron text-purple-400 text-lg font-semibold mb-4">
                      REGISTRATION STATUS
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 font-medium">Registered Players</span>
                        <span className="text-white font-semibold">{combine.registered_spots}/{combine.max_spots}</span>
                      </div>
                      <div className="w-full bg-gray-700/50 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            spotsLeft > 5 ? 'bg-green-500' : 
                            spotsLeft > 0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(combine.registered_spots / combine.max_spots) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${
                          spotsLeft > 5 ? 'text-green-400' : 
                          spotsLeft > 0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Combine is full'}
                        </span>
                        <span className="text-gray-400">
                          {Math.round((combine.registered_spots / combine.max_spots) * 100)}% filled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Registration Status or Button */}
                {existingRegistration ? (
                  <div className="glass-morphism border-white/20 rounded-lg p-4 hover:border-green-400/30 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(existingRegistration.status)}
                        <div>
                          <p className="text-white font-medium">Registration Status</p>
                          <Badge className={`${getStatusColor(existingRegistration.status)} transition-all duration-300 hover:scale-105`}>
                            {existingRegistration.status}
                          </Badge>
                          {existingRegistration.qualified && (
                            <Badge className="ml-2 bg-yellow-400 text-black transition-all duration-300 hover:scale-105">
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
                          <DialogContent className="glass-morphism border-white/20 text-white max-w-md">
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
                                  className="glass-morphism border-white/20 text-white hover:border-gray-300/40"
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
                          <DialogContent className="glass-morphism border-white/20 text-white max-w-md">
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
                                                          <Button variant="outline" onClick={resetAndCloseModal} className="glass-morphism border-white/20 text-white hover:border-gray-300/40">
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
                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-lg p-4 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10">
                    <div className="flex items-center space-x-3">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">Invitation Only</p>
                        <p className="text-gray-400 text-sm font-rajdhani">This is an exclusive combine. Invitations are sent to qualifying players.</p>
                      </div>
                    </div>
                  </div>
                ) : canRegister ? (
                  <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
                    <DialogTrigger asChild>
                                          <Button 
                      className="w-full bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold py-4 text-lg tracking-wider transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/20"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                      ) : null}
                      REGISTER NOW
                    </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-morphism border-white/20 text-white max-w-md hover:border-cyan-400/30 transition-all duration-300">
                      <DialogHeader>
                        <DialogTitle className="font-orbitron text-cyan-300 text-xl">REGISTER FOR COMBINE</DialogTitle>
                        <DialogDescription className="text-gray-400 font-rajdhani">
                          Confirm your registration for {combine.title}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {registrationError && (
                          <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 hover:border-red-400/50 transition-all duration-300">
                            <div className="flex items-center space-x-2">
                              <XCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                              <p className="text-red-300 text-sm font-rajdhani">{registrationError}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="glass-morphism border-white/10 rounded-lg p-4 hover:border-cyan-400/30 transition-all duration-300">
                          <p className="text-gray-300 text-sm mb-2 font-rajdhani">You&apos;re registering for:</p>
                          <p className="text-white font-medium font-orbitron">{combine.title} {combine.year}</p>
                          <p className="text-gray-400 text-sm font-rajdhani">{formatDate(combine.date)}</p>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setRegistrationDialogOpen(false)
                              setRegistrationError("")
                            }}
                            className="glass-morphism border-white/20 text-white hover:border-gray-300/40"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleRegister}
                            disabled={registerMutation.isPending}
                            className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron transition-all duration-300 hover:scale-105"
                          >
                            {registerMutation.isPending ? (
                              <LoaderIcon className="w-4 h-4 mr-1 animate-spin" />
                            ) : null}
                            CONFIRM REGISTRATION
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : isPastCombine ? (
                  <div className="glass-morphism border-white/20 rounded-lg p-4 hover:border-gray-400/30 transition-all duration-300">
                    <p className="text-gray-400 text-center font-rajdhani">This combine has already occurred</p>
                  </div>
                ) : spotsLeft === 0 ? (
                  <Button 
                    disabled
                    className="w-full bg-gray-600 text-gray-400 font-orbitron font-bold py-4 text-lg tracking-wider cursor-not-allowed opacity-50"
                  >
                    COMBINE FULL
                  </Button>
                ) : null}
              </CardContent>
            </Card>


        </div>

        {/* More Combines Section */}
        {relatedCombines.length > 0 && (
          <div className="mt-16">
            <div className="glass-morphism border-white/20 rounded-2xl p-8">
              <div className="mb-8 text-center">
                <h2 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-2">
                  More {gameName} Combines
                </h2>
                <p className="text-gray-400 font-rajdhani text-lg">
                  Discover other EVAL {gameName} combines happening soon
                </p>
              </div>

              {/* Related Combines Carousel */}
              <RelatedCombinesCarousel combines={relatedCombines} />

              {/* View All Button */}
              <div className="text-center mt-8">
                <Link href={`/tryouts/combines?game=${encodeURIComponent(combine.game.name)}`}>
                  <Button 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-orbitron px-8 py-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    View All {gameName} Combines
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
