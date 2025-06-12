"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DollarSign,
  GraduationCap,
  Mail,
  Phone,
  ArrowLeft,
  LoaderIcon,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck
} from "lucide-react"
import { api } from "@/trpc/react"
import { gameIcons } from "@/app/tryouts/_components/GameCarousel"

// Map database game names to UI game names
const gameNameMap: Record<string, keyof typeof gameIcons> = {
  "VALORANT": "VALORANT",
  "Overwatch 2": "Overwatch 2", 
  "Super Smash Bros. Ultimate": "Smash Ultimate",
  "Rocket League": "Rocket League"
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

const formatTime = (timeStart?: string | null, timeEnd?: string | null) => {
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
      return <UserCheck className="w-4 h-4" />
  }
}

export default function TryoutDetailPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const tryoutId = params.id as string

  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false)
  const [registrationNotes, setRegistrationNotes] = useState("")
  const [registrationError, setRegistrationError] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  // Fetch tryout details
  const { 
    data: tryout, 
    isLoading: isLoadingTryout, 
    error: tryoutError,
    refetch: refetchTryout 
  } = api.tryouts.getById.useQuery(
    { id: tryoutId },
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
  } = api.tryouts.getPlayerRegistrations.useQuery(
    { status: "all", limit: 100 },
    {
      enabled: !!user,
      staleTime: 1 * 60 * 1000, // 1 minute
    }
  )

  // Register for tryout mutation
  const registerMutation = api.tryouts.register.useMutation({
    onSuccess: () => {
      void refetchTryout()
      void refetchPlayerRegistrations() // This will update the registration status
      setRegistrationDialogOpen(false)
      setRegistrationNotes("")
      setRegistrationError("")
    },
    onError: (error) => {
      console.error('Registration failed:', error)
      setRegistrationError(error.message)
    }
  })

  // Cancel registration mutation
  const cancelRegistrationMutation = api.tryouts.cancelRegistration.useMutation({
    onSuccess: () => {
      void refetchTryout()
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
    reg => reg.tryout.id === tryoutId
  )

  const handleRegister = () => {
    setRegistrationError("")
    registerMutation.mutate({
      tryout_id: tryoutId,
      notes: registrationNotes || undefined
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

  if (isLoadingTryout) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-center py-32">
            <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400" />
            <span className="ml-3 text-gray-400 font-rajdhani">Loading tryout details...</span>
          </div>
        </div>
      </div>
    )
  }

  if (tryoutError || !tryout) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center py-32">
            <h1 className="text-2xl font-orbitron font-bold text-white mb-4">
              Tryout Not Found
            </h1>
            <p className="text-gray-400 mb-8">
              The tryout you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link href="/tryouts/college">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tryouts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const gameName = gameNameMap[tryout.game.name] ?? "VALORANT"
  const spotsLeft = tryout.max_spots - tryout.registered_spots
  const isPastTryout = new Date(tryout.date) < new Date()
  const isDeadlinePassed = tryout.registration_deadline && new Date(tryout.registration_deadline) < new Date()
  const canRegister = !isPastTryout && !isDeadlinePassed && spotsLeft > 0 && !existingRegistration && user

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/tryouts/college">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tryouts
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
                    <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                      <Image 
                        src={gameIcons[gameName]} 
                        alt={tryout.game.name} 
                        width={40} 
                        height={40} 
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h1 className="font-orbitron font-black text-3xl text-white mb-2 cyber-text">
                        {tryout.title}
                      </h1>
                      <p className="text-xl text-gray-300 font-rajdhani">
                        {tryout.school.name}
                      </p>
                      <p className="text-gray-400 font-rajdhani">
                        {tryout.school.location}, {tryout.school.state}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={tryout.price === "Free" ? "secondary" : "outline"}
                      className={`${
                        tryout.price === "Free" 
                          ? "bg-green-600 text-white" 
                          : "border-cyan-400 text-cyan-400"
                      } font-orbitron text-lg px-4 py-2 mb-2`}
                    >
                      {tryout.price}
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
                      <p className="text-white font-medium">{formatDate(tryout.date)}</p>
                      <p className="text-gray-400 text-sm">{formatTime(tryout.time_start, tryout.time_end)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{tryout.type}</p>
                      <p className="text-gray-400 text-sm">{tryout.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{tryout.max_spots} Total Spots</p>
                      <p className="text-gray-400 text-sm">{tryout.registered_spots} registered</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{tryout.game.name}</p>
                      <p className="text-gray-400 text-sm">{tryout.school.type}</p>
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
                        </div>
                      </div>
                      
                      {/* Cancel Registration Button */}
                      {canCancelRegistration && (
                        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline"
                              size="sm"
                              className="border-red-400/50 text-red-300 hover:bg-red-500/10 hover:border-red-400 font-rajdhani"
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
                                Are you sure you want to cancel your registration for {tryout.title}? This action cannot be undone.
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
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  Keep Registration
                                </Button>
                                <Button 
                                  onClick={handleCancelRegistration}
                                  disabled={cancelRegistrationMutation.isPending}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  {cancelRegistrationMutation.isPending ? (
                                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                  ) : null}
                                  Yes, Cancel Registration
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Error Message */}
                    {registrationError && (
                      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                          <p className="text-red-400 text-sm">{registrationError}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      {canRegister ? (
                        <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron text-lg px-8 py-3"
                              size="lg"
                            >
                              REGISTER NOW
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
                            <DialogHeader>
                              <DialogTitle className="font-orbitron">Register for Tryout</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                You&apos;re about to register for {tryout.title}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Registration Error in Dialog */}
                              {registrationError && (
                                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                                  <div className="flex items-center space-x-2">
                                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                    <p className="text-red-400 text-sm">{registrationError}</p>
                                  </div>
                                </div>
                              )}
                              
                              <div>
                                <Label htmlFor="notes" className="font-rajdhani">
                                  Additional Notes (Optional)
                                </Label>
                                <Textarea
                                  id="notes"
                                  value={registrationNotes}
                                  onChange={(e) => setRegistrationNotes(e.target.value)}
                                  className="bg-gray-800 border-gray-700 text-white"
                                  placeholder="Tell the organizer anything they should know..."
                                  rows={3}
                                />
                              </div>
                              <div className="flex justify-end gap-3">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setRegistrationDialogOpen(false)
                                    setRegistrationError("")
                                  }}
                                  className="border-gray-600 text-gray-300"
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleRegister}
                                  disabled={registerMutation.isPending}
                                  className="bg-cyan-600 hover:bg-cyan-700"
                                >
                                  {registerMutation.isPending ? (
                                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                                  ) : null}
                                  Confirm Registration
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <div className="space-y-3">
                          <Button 
                            disabled
                            className="bg-gray-600 text-gray-300 font-orbitron text-lg px-8 py-3 cursor-not-allowed"
                            size="lg"
                          >
                            {!user ? (
                              <>
                                <UserCheck className="w-5 h-5 mr-2" />
                                SIGN IN TO REGISTER
                              </>
                            ) : isPastTryout ? (
                              <>
                                <XCircle className="w-5 h-5 mr-2" />
                                TRYOUT ENDED
                              </>
                            ) : isDeadlinePassed ? (
                              <>
                                <Clock className="w-5 h-5 mr-2" />
                                REGISTRATION CLOSED
                              </>
                            ) : spotsLeft <= 0 ? (
                              <>
                                <XCircle className="w-5 h-5 mr-2" />
                                TRYOUT FULL
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 mr-2" />
                                UNAVAILABLE
                              </>
                            )}
                          </Button>
                          
                          {/* Explanation text */}
                          <div className="text-center text-sm text-gray-400">
                            {!user ? (
                              <p>Please sign in to register for this tryout</p>
                            ) : isPastTryout ? (
                              <p>This tryout has already occurred</p>
                            ) : isDeadlinePassed ? (
                              <p>The registration deadline has passed</p>
                            ) : spotsLeft <= 0 ? (
                              <p>This tryout is at full capacity</p>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">About This Tryout</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 font-rajdhani leading-relaxed text-lg">
                  {tryout.description}
                </p>
              </CardContent>
            </Card>

            {/* Requirements */}
            {(tryout.min_gpa ?? tryout.class_years.length > 0 ?? tryout.required_roles.length > 0) && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tryout.min_gpa && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-5 h-5 text-cyan-400" />
                      <span className="text-gray-300">Minimum GPA: {tryout.min_gpa.toString()}</span>
                    </div>
                  )}
                  {tryout.class_years.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                      <span className="text-gray-300">
                        Class Years: {tryout.class_years.join(", ")}
                      </span>
                    </div>
                  )}
                  {tryout.required_roles.length > 0 && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-cyan-400" />
                      <span className="text-gray-300">
                        Required Roles: {tryout.required_roles.join(", ")}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Organizer Info */}
            {tryout.organizer && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="font-orbitron text-white">Organizer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-lg font-medium text-white">
                      {tryout.organizer.first_name} {tryout.organizer.last_name}
                    </p>
                    {tryout.organizer.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`mailto:${tryout.organizer.email}`}
                          className="text-cyan-400 hover:text-cyan-300 text-sm"
                        >
                          {tryout.organizer.email}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Spots</span>
                  <span className="text-white font-medium">{tryout.max_spots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Registered</span>
                  <span className="text-white font-medium">{tryout.registered_spots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Available</span>
                  <span className={`font-medium ${spotsLeft > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {spotsLeft}
                  </span>
                </div>
                {tryout.registration_deadline && (
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deadline</span>
                      <span className="text-white font-medium text-sm">
                        {formatDate(tryout.registration_deadline)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* School Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">School Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-lg font-medium text-white">{tryout.school.name}</p>
                  <p className="text-gray-400">{tryout.school.type}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{tryout.school.location}, {tryout.school.state}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
