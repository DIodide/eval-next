"use client";

import { useState, useMemo, use } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Globe, MessageSquareIcon, ChevronLeftIcon, ChevronRightIcon, Trophy, Calendar, Clock, ExternalLink, Users, Share2Icon } from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

// Types for coach data
interface CoachData {
  id: string;
  first_name: string;
  last_name: string;
  username: string | null;
  image_url: string | null;
  email: string;
  created_at: Date;
  achievements: Array<{
    id: string;
    title: string;
    date_achieved: Date;
  }>;
}

interface TransformedCoach {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
  games: string[];
  achievements: Array<{
    id: string;
    title: string;
    date_achieved: Date;
  }>;
  isPrimary: boolean;
  email: string;
}

// Helper function to transform coach data to match the expected format
const transformCoachData = (coaches: CoachData[]): TransformedCoach[] => {
  return coaches.map((coach, index) => ({
    id: coach.id,
    name: `${coach.first_name} ${coach.last_name}`,
    title: index === 0 ? "Head Coach" : "Assistant Coach", // First coach is head coach
    image_url: coach.image_url,
    games: ["Multiple Games"], // We'll need to add this data to the backend later
    achievements: coach.achievements || [],
    isPrimary: index === 0, // First coach is primary
    email: coach.email,
  }));
};

interface SchoolProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

function MessageCoachDialog({ coachId, coachName }: { coachId: string; coachName: string }) {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = () => {
    // TODO: Implement actual message sending via tRPC
    console.log("Sending message to coach:", coachId, message);
    setMessage("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
          <MessageSquareIcon className="w-3 h-3 mr-1" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron">Send Message to {coachName}</DialogTitle>
          <DialogDescription className="text-gray-400">
            Send a direct message to this coach about tryouts and recruitment opportunities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message" className="text-gray-300">Message</Label>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} className="border-gray-700 text-gray-300">
            Cancel
          </Button>
          <Button 
            onClick={handleSendMessage} 
            disabled={!message.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CoachCarousel({ coaches, canMessage }: { coaches: TransformedCoach[]; canMessage: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(coaches.length / itemsPerPage);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const visibleCoaches = coaches.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-orbitron font-bold text-white">Our Coaches</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={totalPages <= 1}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <span className="text-gray-400 text-sm font-rajdhani">
            {currentIndex + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={totalPages <= 1}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCoaches.map((coach) => (
          <Card key={coach.id} className={`bg-gray-900 border-gray-700 relative ${coach.isPrimary ? 'ring-1 ring-cyan-500' : ''}`}>
            {coach.isPrimary && (
              <Badge className="absolute -top-2 -right-2 bg-cyan-600 text-white font-orbitron">Primary Contact</Badge>
            )}
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                 <Avatar className="w-16 h-16">
                   <AvatarImage src={coach.image_url ?? undefined} alt={coach.name} />
                   <AvatarFallback className="text-lg bg-gray-700 text-white font-orbitron">
                     {coach.name.split(' ').map(n => n[0]).join('')}
                   </AvatarFallback>
                 </Avatar>

                {/* Coach Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-orbitron font-semibold text-lg text-white mb-1">{coach.name}</h4>
                      <p className="text-gray-400 font-rajdhani mb-2">{coach.title}</p>
                    </div>
                    {canMessage && (
                      <MessageCoachDialog coachId={coach.id} coachName={coach.name} />
                    )}
                  </div>
                  
                  {/* Games */}
                  <div className="mb-3">
                    <div className="text-sm text-gray-400 mb-1 font-rajdhani">Specializes in:</div>
                    <div className="flex flex-wrap gap-1">
                      {coach.games.map((game) => (
                        <Badge key={game} variant="outline" className="text-xs border-cyan-600 text-cyan-400">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mb-3">
                    <a 
                      href={`mailto:${coach.email}`}
                      className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-rajdhani"
                    >
                      <Mail className="w-3 h-3" />
                      {coach.email}
                    </a>
                  </div>

                  {/* Achievements */}
                  <div>
                    <div className="text-sm text-gray-400 mb-2 font-rajdhani">Recent Achievements:</div>
                    <div className="space-y-1">
                      {coach.achievements.length > 0 ? (
                        coach.achievements.slice(0, 2).map((achievement) => (
                          <div key={achievement.id} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                            <span className="text-sm text-gray-300 font-rajdhani">{achievement.title}</span>
                            <span className="text-xs text-gray-500 font-rajdhani">
                              ({new Date(achievement.date_achieved).getFullYear()})
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-sm text-gray-300 font-rajdhani">E-Sports Coaching Experience</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dots indicator */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-cyan-400' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Game logo mapping
const gameLogos: Record<string, string> = {
  "VALORANT": "/valorant/logos/V_Lockup_Vertical Black.png",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Primary Logo.png",
  "Super Smash Bros. Ultimate": "/smash/logos/Smash Ball White Logo.png",
  "Rocket League": "/rocket-league/logos/Rocket League Emblem.png",
}

// Tryout status colors


// Game colors
const getGameColor = (game: string) => {
  switch (game.toUpperCase()) {
    case "VALORANT":
      return "bg-red-600";
    case "OVERWATCH 2":
      return "bg-orange-600";
    case "SUPER SMASH BROS. ULTIMATE":
      return "bg-yellow-600";
    case "ROCKET LEAGUE":
      return "bg-blue-600";
    default:
      return "bg-gray-600";
  }
};

// Tryout type colors
const getTypeColor = (type: string) => {
  switch (type) {
    case "ONLINE":
      return "bg-green-600";
    case "IN_PERSON":
      return "bg-purple-600";
    case "HYBRID":
      return "bg-indigo-600";
    default:
      return "bg-gray-600";
  }
};

// Format date helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

// Format time helper
const formatTime = (timeStart?: string | null, timeEnd?: string | null) => {
  if (!timeStart) return "Time TBA";
  if (!timeEnd) return timeStart;
  return `${timeStart} - ${timeEnd}`;
};

// Get announcement type colors
const getAnnouncementColor = (type: string) => {
  switch (type) {
    case "TRYOUT":
      return "border-cyan-500 bg-cyan-400";
    case "ACHIEVEMENT":
      return "border-green-500 bg-green-400";
    case "FACILITY":
      return "border-yellow-500 bg-yellow-400";
    case "SCHOLARSHIP":
      return "border-purple-500 bg-purple-400";
    case "ALUMNI":
      return "border-blue-500 bg-blue-400";
    case "EVENT":
      return "border-indigo-500 bg-indigo-400";
    case "SEASON_REVIEW":
      return "border-red-500 bg-red-400";
    default: // GENERAL
      return "border-gray-500 bg-gray-400";
  }
};

// Format relative time
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
    }
  }
};

export default function SchoolProfilePage({ params }: SchoolProfilePageProps) {
  const { user } = useUser();
  const unwrappedParams = use(params);

  // Handle share profile functionality
  const handleShareProfile = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("School profile URL copied to clipboard!");
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      toast.error("Unable to copy to clipboard. Please copy the URL manually.");
    }
  };
  
  // Fetch school data using tRPC
  const { data: schoolData, isLoading: isLoadingSchool, error: schoolError } = api.schoolProfile.getById.useQuery({
    id: unwrappedParams.id,
  });
  
  // Transform the data to match expected format
  const school = schoolData ? {
    id: schoolData.id,
    name: schoolData.name,
    location: `${schoolData.location}, ${schoolData.state}`,
    logo: schoolData.logo_url ?? "/eval/logos/emblem.png", // Fallback logo
    bio: schoolData.bio ?? "Welcome to our esports program. We are committed to excellence in competitive gaming.",
    website: schoolData.website ?? "",
    email: schoolData.email ?? "",
    phone: schoolData.phone ?? "",
    coaches: transformCoachData(schoolData.coaches as CoachData[]),
  } : null;
  
  const primaryCoach = school?.coaches.find((coach: TransformedCoach) => coach.isPrimary);
  const primaryContact = primaryCoach?.email ?? school?.email ?? "";
  const canMessage = user ? hasPermission(user, "message_coach") : false;
  const [tryoutFilter, setTryoutFilter] = useState<"all" | "upcoming" | "past">("all")
  const [tryoutGameFilter, setTryoutGameFilter] = useState<string>("all")

  // Get tryouts using real API
  const { data: tryoutsData, isLoading: isLoadingTryouts, error: tryoutsError } = api.schoolProfile.getTryouts.useQuery({
    schoolId: unwrappedParams.id,
    filter: tryoutFilter,
    gameId: tryoutGameFilter === "all" ? undefined : tryoutGameFilter,
    limit: 50, // Get more tryouts for filtering
  });

  // Get available games for filtering
  const { data: availableGamesData } = api.schoolProfile.getAvailableGames.useQuery({
    schoolId: unwrappedParams.id,
  });

  // Get school announcements
  const { data: announcementsData, isLoading: isLoadingAnnouncements } = api.schoolProfile.getAnnouncements.useQuery({
    schoolId: unwrappedParams.id,
    limit: 10,
  });

  // Since filtering is now done on the server, we can use the data directly
  const filteredTryouts = tryoutsData?.tryouts ?? [];

  // Use available games from the API
  const availableGames = availableGamesData ?? [];

  // Get counts for each filter - we need to make separate API calls for counts
  const { data: allTryoutsData } = api.schoolProfile.getTryouts.useQuery({
    schoolId: unwrappedParams.id,
    filter: "all",
    limit: 1, // Just get count, don't need the actual data
  });

  const { data: upcomingTryoutsData } = api.schoolProfile.getTryouts.useQuery({
    schoolId: unwrappedParams.id,
    filter: "upcoming", 
    limit: 1,
  });

  const { data: pastTryoutsData } = api.schoolProfile.getTryouts.useQuery({
    schoolId: unwrappedParams.id,
    filter: "past",
    limit: 1,
  });

  const tryoutCounts = useMemo(() => {
    return {
      all: allTryoutsData?.total ?? 0,
      upcoming: upcomingTryoutsData?.total ?? 0,
      past: pastTryoutsData?.total ?? 0,
    };
  }, [allTryoutsData?.total, upcomingTryoutsData?.total, pastTryoutsData?.total]);

  // Handle loading state
  if (isLoadingSchool) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section Skeleton */}
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start gap-8">
                {/* School Logo and Basic Info Skeleton */}
                <div className="flex flex-col items-center md:items-start">
                  <Skeleton className="w-32 h-32 rounded-lg mb-4" />
                  <div className="text-center md:text-left space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>

                {/* School Details Skeleton */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>

                  {/* Contact Information Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-36" />
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-4 h-4" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-48" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Skeleton className="h-5 w-24" />
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-8" />
                        </div>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-20" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Layout Skeleton */}
          <div className="space-y-8 mb-8">
            {/* Coaches and Program Updates Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Coaches Section Skeleton */}
              <div className="xl:col-span-2">
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <Skeleton className="h-6 w-32" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {Array.from({ length: 2 }).map((_, i) => (
                          <Card key={i} className="bg-gray-900 border-gray-700">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="flex-1 space-y-3">
                                  <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                  </div>
                                  <div className="space-y-2">
                                    <Skeleton className="h-3 w-20" />
                                    <div className="flex flex-wrap gap-1">
                                      <Skeleton className="h-5 w-16" />
                                      <Skeleton className="h-5 w-20" />
                                    </div>
                                  </div>
                                  <Skeleton className="h-4 w-40" />
                                  <div className="space-y-1">
                                    <Skeleton className="h-3 w-28" />
                                    <Skeleton className="h-4 w-48" />
                                    <Skeleton className="h-4 w-36" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Program Updates Skeleton */}
              <div>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white font-orbitron">
                      <Skeleton className="h-6 w-32" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border-l-4 border-cyan-500 pl-4 py-2">
                          <div className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-40" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tryouts Panel Skeleton */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filter Skeleton */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-32" />
                </div>

                {/* Tryouts Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-gray-900 border-gray-700">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Skeleton className="w-8 h-8" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-3 w-full" />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Skeleton className="w-4 h-4" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="w-4 h-4" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Skeleton className="w-4 h-4" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Skeleton className="w-4 h-4" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-5 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Section Skeleton */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-6 rounded-lg border border-cyan-700/30">
                <Skeleton className="h-6 w-64 mb-3" />
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Skeleton className="h-10 w-48" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle error state
  if (schoolError) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <div className="text-center py-16">
                <h1 className="text-2xl font-orbitron font-bold mb-4 text-red-400">School Not Found</h1>
                <p className="text-gray-400 font-rajdhani">
                  The school you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Handle case where school data is null
  if (!school) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardContent className="p-8">
              <div className="text-center py-16">
                <h1 className="text-2xl font-orbitron font-bold mb-4 text-gray-400">No School Data</h1>
                <p className="text-gray-400 font-rajdhani">
                  Unable to load school information at this time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* School Logo and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Image src={school.logo} alt={school.name} width={128} height={128} className="w-32 h-32 rounded-lg mb-4 p-1" />
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-orbitron font-bold mb-2 text-white">{school.name}</h1>
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="font-rajdhani">{school.location}</span>
                  </div>
                </div>
              </div>

              {/* School Details */}
              <div className="flex-1">
                <div className="mb-6">
                  <h3 className="font-orbitron font-semibold text-gray-300 mb-3">About the Program</h3>
                  <p className="text-gray-400 leading-relaxed font-rajdhani">{school.bio}</p>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-orbitron font-semibold text-gray-300 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      {primaryContact && (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-400 font-rajdhani">Primary Contact:</div>
                            <a href={`mailto:${primaryContact}`} className="text-cyan-400 hover:text-cyan-300 font-rajdhani">
                              {primaryContact}
                            </a>
                          </div>
                        </div>
                      )}
                      {school.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <a href={`tel:${school.phone}`} className="text-gray-300 font-rajdhani">
                            {school.phone}
                          </a>
                        </div>
                      )}
                      {school.website && (
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <a 
                            href={school.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 font-rajdhani"
                          >
                            Official Website
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div>
                    <h3 className="font-orbitron font-semibold text-gray-300 mb-3">Actions</h3>
                    <Button 
                      onClick={handleShareProfile}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-orbitron"
                    >
                      <Share2Icon className="w-4 h-4 mr-2" />
                      Share School Profile
                    </Button>
                  </div>

                  <div>
                    <h3 className="font-orbitron font-semibold text-gray-300 mb-3">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-rajdhani">Active Coaches:</span>
                        <Badge variant="secondary" className="bg-gray-700 text-cyan-400 border-gray-600">{school.coaches.length}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-rajdhani">Games Offered:</span>
                        {/* TODO: Add Number From DB */}
                        <span className="text-sm text-gray-300 font-rajdhani">Multiple</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-rajdhani">Program Type:</span>
                        <Badge className="bg-cyan-600 text-white">Collegiate</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Layout */}
        <div className="space-y-8 mb-8">
          {/* Top Section: Coaches and Program Updates */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Coaches Section - Left Column */}
            <div className="xl:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8">
                  <CoachCarousel coaches={school?.coaches || []} canMessage={canMessage} />
                </CardContent>
              </Card>
            </div>

            {/* Program Updates Panel - Right Column */}
            <div>
            {/* Announcements/Feed Panel */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">Program Updates</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {isLoadingAnnouncements ? (
                    // Loading skeleton
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border-l-4 border-gray-600 pl-4 py-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Skeleton className="w-2 h-2 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-4 w-48 mb-1" />
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : announcementsData?.announcements && announcementsData.announcements.length > 0 ? (
                    // Real announcements
                    announcementsData.announcements.map((announcement) => {
                      const colors = getAnnouncementColor(announcement.type);
                      const [borderColor, dotColor] = colors.split(' ');
                      
                      return (
                        <div key={announcement.id} className={`border-l-4 ${borderColor} pl-4 py-2`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                            <span className="text-xs text-gray-400 font-rajdhani">
                              {formatRelativeTime(new Date(announcement.created_at))}
                            </span>
                            {announcement.is_pinned && (
                              <Badge variant="outline" className="text-xs px-1 py-0 border-yellow-400 text-yellow-400">
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-orbitron font-semibold text-sm text-white mb-1">
                            {announcement.title}
                          </h4>
                          <p className="text-gray-400 text-sm font-rajdhani">
                            {announcement.content}
                          </p>
                          {announcement.author_id && (
                            <div className="mt-2 text-xs text-gray-500 font-rajdhani">
                              by Coach
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Empty state
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-2xl">📢</span>
                      </div>
                      <p className="text-gray-400 font-rajdhani">
                        No announcements yet. Check back later for program updates!
                      </p>
                    </div>
                  )}
                </div>
                
                {/* View All Button */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 font-orbitron"
                  >
                    View All Updates
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
          </div>

          {/* Full-Width Tryouts Panel */}
          <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-orbitron flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-cyan-400" />
                    Program Tryouts
                  </CardTitle>
                  <Badge variant="outline" className="text-cyan-400 border-cyan-400">
                    {tryoutCounts.all} Total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tryout Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Status Filter Tabs */}
                  <div className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg">
                    <button
                      onClick={() => setTryoutFilter("all")}
                      className={`px-4 py-2 rounded-md text-sm font-orbitron transition-colors ${
                        tryoutFilter === "all" 
                          ? "bg-cyan-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      All ({tryoutCounts.all})
                    </button>
                    <button
                      onClick={() => setTryoutFilter("upcoming")}
                      className={`px-4 py-2 rounded-md text-sm font-orbitron transition-colors ${
                        tryoutFilter === "upcoming" 
                          ? "bg-cyan-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Upcoming ({tryoutCounts.upcoming})
                    </button>
                    <button
                      onClick={() => setTryoutFilter("past")}
                      className={`px-4 py-2 rounded-md text-sm font-orbitron transition-colors ${
                        tryoutFilter === "past" 
                          ? "bg-cyan-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Past ({tryoutCounts.past})
                    </button>
                  </div>

                  {/* Game Filter */}
                  {availableGames.length > 1 && (
                    <select
                      value={tryoutGameFilter}
                      onChange={(e) => setTryoutGameFilter(e.target.value)}
                      className="bg-gray-900/50 border border-gray-600 rounded-md px-3 py-2 text-sm text-white font-rajdhani focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="all">All Games</option>
                      {availableGames.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Tryouts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoadingTryouts ? (
                    <>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="bg-gray-900 border-gray-700">
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                <Skeleton className="w-8 h-8" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-5 w-32" />
                                  <Skeleton className="h-3 w-full" />
                                </div>
                              </div>
                              <Skeleton className="h-5 w-12" />
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Skeleton className="w-4 h-4" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="w-4 h-4" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="w-4 h-4" />
                                  <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-5 w-16" />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="w-4 h-4" />
                                  <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-5 w-20" />
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                            <Skeleton className="h-10 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  ) : tryoutsError ? (
                    <div className="col-span-full text-center py-16">
                      <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-red-400 font-rajdhani text-lg">
                        Error loading tryouts. Please try again later.
                      </p>
                    </div>
                  ) : filteredTryouts.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 font-rajdhani text-lg">
                        {tryoutFilter === "upcoming" ? "No upcoming tryouts" :
                         tryoutFilter === "past" ? "No past tryouts" : "No tryouts found"}
                      </p>
                    </div>
                  ) : (
                    filteredTryouts.map((tryout) => {
                      const isUpcoming = new Date(tryout.date) > new Date();
                      const spotsLeft = tryout.max_spots - (tryout._count?.registrations ?? 0);

                      return (
                        <Card key={tryout.id} className="bg-gray-900 border-gray-700 hover:border-cyan-400/50 transition-colors flex flex-col h-full">
                          <CardContent className="p-6 flex flex-col flex-1">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-12 h-12 flex items-center justify-center">
                                  {gameLogos[tryout.game.name] ? (
                                    <Image
                                      src={gameLogos[tryout.game.name]!}
                                      alt={tryout.game.name}
                                      width={48}
                                      height={48}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-3xl">🎮</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <h4 className="font-orbitron font-semibold text-white text-sm leading-tight line-clamp-2 break-words">
                                    {tryout.title}
                                  </h4>
                                  <p className="text-gray-400 text-xs font-rajdhani mt-1 line-clamp-2 break-words leading-tight">
                                    {tryout.description}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {isUpcoming && spotsLeft <= 5 && spotsLeft > 0 && (
                                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                                    {spotsLeft} left
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 mb-6 flex-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300 font-rajdhani">
                                  {formatDate(tryout.date)}
                                </span>
                                {tryout.time_start && (
                                  <>
                                    <Clock className="w-4 h-4 text-gray-400 ml-3" />
                                    <span className="text-gray-300 font-rajdhani">
                                      {formatTime(tryout.time_start, tryout.time_end)}
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-300 font-rajdhani">
                                    {tryout.location}
                                  </span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs border-0 text-white ${getTypeColor(tryout.type)}`}
                                >
                                  {tryout.type}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-300 font-rajdhani">
                                    {tryout._count?.registrations ?? 0}/{tryout.max_spots} registered
                                  </span>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs border-0 text-white ${getGameColor(tryout.game.name)}`}
                                >
                                  {tryout.game.short_name ?? tryout.game.name}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-700">
                                <span className="text-gray-400 font-rajdhani">
                                  Price: <span className="text-cyan-400">{tryout.price}</span>
                                </span>
                                {tryout.organizer && (
                                  <span className="text-gray-400 font-rajdhani">
                                    by {tryout.organizer.first_name} {tryout.organizer.last_name}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action */}
                            <div className="mt-auto">
                              <Button
                                asChild
                                size="default"
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                              >
                                <a 
                                  href={`/tryouts/college/${tryout.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-2"
                                >
                                  View Details
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>

                {/* View All Button */}
                {tryoutsData?.tryouts && tryoutsData.tryouts.length > 0 && (
                  <div className="text-center">
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 font-orbitron"
                    >
                                         <a 
                       href="/tryouts/college"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2"
                     >
                        View All Tryouts
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>

        {/* Program Contact Section - Full Width */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-6 rounded-lg border border-cyan-700/30">
              <h3 className="font-orbitron font-semibold text-lg mb-3 text-white">Interested in Joining Our Program?</h3>
              <p className="text-gray-400 mb-4 font-rajdhani">
                Reach out to our coaching staff to learn more about tryouts, team opportunities, and our esports program.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`mailto:${primaryContact}?subject=Interest in Esports Program`}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg transition-colors text-center font-orbitron"
                >
                  Contact Primary Coach
                </a>
                <a
                  href={`mailto:${school.email}?subject=General Program Inquiry`}
                  className="bg-transparent border border-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white px-6 py-2 rounded-lg transition-colors text-center font-orbitron"
                >
                  General Inquiry
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}