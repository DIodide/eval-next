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
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin, Phone, Globe, MessageSquareIcon, ChevronLeftIcon, ChevronRightIcon, Trophy, Calendar, Clock, ExternalLink, Users } from "lucide-react";
import { hasPermission } from "@/lib/permissions";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// Mock data - replace with actual API calls later
const mockTryoutsData = {
  tryouts: [
    {
      id: "tryout-1",
      title: "Valorant Varsity Team Tryouts",
      description: "Competitive tryouts for our varsity Valorant team. Looking for skilled players with tournament experience.",
      date: new Date("2024-02-15T18:00:00Z"),
      time_start: "18:00",
      time_end: "20:00",
      location: "Berkeley Esports Arena",
      type: "IN_PERSON" as const,
      status: "PUBLISHED" as const,
      price: "Free",
      max_spots: 20,
      _count: { registrations: 15 },
      game: {
        id: "game-val",
        name: "VALORANT",
        short_name: "VAL",
        icon: null,
        color: null
      },
      school: {
        id: "uc-berkeley",
        name: "UC Berkeley",
        location: "Berkeley, CA",
        state: "CA",
        type: "University"
      },
      organizer: {
        id: "coach-1",
        first_name: "Sarah",
        last_name: "Johnson"
      }
    },
    {
      id: "tryout-2", 
      title: "Overwatch Open Recruitment",
      description: "Open recruitment for all skill levels. We'll help you develop your competitive skills.",
      date: new Date("2024-02-20T19:00:00Z"),
      time_start: "19:00",
      time_end: "21:00",
      location: "Online - Discord",
      type: "ONLINE" as const,
      status: "PUBLISHED" as const,
      price: "Free",
      max_spots: 30,
      _count: { registrations: 8 },
      game: {
        id: "game-ow",
        name: "Overwatch 2",
        short_name: "OW2",
        icon: null,
        color: null
      },
      school: {
        id: "uc-berkeley",
        name: "UC Berkeley", 
        location: "Berkeley, CA",
        state: "CA",
        type: "University"
      },
      organizer: {
        id: "coach-2",
        first_name: "Michael",
        last_name: "Chen"
      }
    },
    {
      id: "tryout-3",
      title: "Rocket League JV Team",
      description: "Junior varsity team tryouts for players looking to break into competitive Rocket League.",
      date: new Date("2024-01-10T17:00:00Z"), // Past date
      time_start: "17:00", 
      time_end: "19:00",
      location: "Berkeley Gaming Lab",
      type: "HYBRID" as const,
      status: "PUBLISHED" as const,
      price: "Free",
      max_spots: 15,
      _count: { registrations: 15 },
      game: {
        id: "game-rl",
        name: "Rocket League",
        short_name: "RL",
        icon: null,
        color: null
      },
      school: {
        id: "uc-berkeley",
        name: "UC Berkeley",
        location: "Berkeley, CA", 
        state: "CA",
        type: "University"
      },
      organizer: {
        id: "coach-2",
        first_name: "Michael",
        last_name: "Chen"
      }
    }
  ],
  total: 3,
  hasMore: false
};

const mockSchoolData = {
  id: "uc-berkeley",
  name: "University of California, Berkeley",
  location: "Berkeley, CA",
  logo: "/partners/keller/keller.png",
  bio: "UC Berkeley's esports program is one of the most competitive and well-established programs in collegiate esports. We compete across multiple titles including Valorant, League of Legends, Overwatch, and more. Our teams have consistently placed in top tournaments and our alumni have gone on to professional careers in esports.",
  website: "https://esports.berkeley.edu",
  email: "esports@berkeley.edu",
  phone: "(510) 642-6000",
  coaches: [
    {
      id: "coach-1",
      name: "Sarah Johnson",
      title: "Head Coach",
      image_url: "https://images.clerk.dev/uploaded/img_2eYI2aJ1NCbh9u7V4dP5kpZKHZc", // Example Clerk image URL
      games: ["Valorant", "Overwatch"],
      achievements: ["National Champion 2023", "Regional Winner 2022", "Coach of the Year 2023"],
      isPrimary: true,
      email: "s.johnson@berkeley.edu"
    },
    {
      id: "coach-2", 
      name: "Michael Chen",
      title: "Assistant Coach",
      image_url: "https://images.clerk.dev/uploaded/img_2eYI2aJ1NCbh9u7V4dP5kpZKHZd", // Example Clerk image URL
      games: ["Rocket League", "Smash Bros"],
      achievements: ["Regional Champion 2023", "Tournament Winner 2022"],
      isPrimary: false,
      email: "m.chen@berkeley.edu"
    },
    {
      id: "coach-3",
      name: "Alex Rodriguez",
      title: "Strategy Coach",
      image_url: "https://images.clerk.dev/uploaded/img_2eYI2aJ1NCbh9u7V4dP5kpZKHZe", // Example Clerk image URL
      games: ["League of Legends", "Valorant"],
      achievements: ["World Championship 2022", "Regional Winner 2023"],
      isPrimary: false,
      email: "a.rodriguez@berkeley.edu"
    },
    {
      id: "coach-4",
      name: "Jennifer Kim",
      title: "Performance Coach",
      image_url: "https://images.clerk.dev/uploaded/img_2eYI2aJ1NCbh9u7V4dP5kpZKHZf", // Example Clerk image URL
      games: ["Overwatch", "Apex Legends"],
      achievements: ["Championship Winner 2023", "Best Coach Award 2022"],
      isPrimary: false,
      email: "j.kim@berkeley.edu"
    },
    {
      id: "coach-5",
      name: "David Park",
      title: "Analyst Coach",
      image_url: "https://images.clerk.dev/uploaded/img_2eYI2aJ1NCbh9u7V4dP5kpZKHZg", // Example Clerk image URL
      games: ["Valorant", "CS2"],
      achievements: ["Analytics Excellence 2023", "Innovation Award 2022"],
      isPrimary: false,
      email: "d.park@berkeley.edu"
    }
  ]
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

function CoachCarousel({ coaches, canMessage }: { coaches: typeof mockSchoolData.coaches; canMessage: boolean }) {
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
                                 {/* Coach Avatar */}
                 <Avatar className="w-16 h-16">
                   <AvatarImage src={coach.image_url} alt={coach.name} />
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
                      {coach.achievements.slice(0, 2).map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                          <span className="text-sm text-gray-300 font-rajdhani">{achievement}</span>
                        </div>
                      ))}
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

// Game icons mapping
const gameIcons: Record<string, string> = {
  "VALORANT": "🎯",
  "Overwatch 2": "⚡",
  "Super Smash Bros. Ultimate": "👊",
  "Rocket League": "🚗",
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
const formatTime = (timeStart?: string, timeEnd?: string) => {
  if (!timeStart) return "Time TBA";
  if (!timeEnd) return timeStart;
  return `${timeStart} - ${timeEnd}`;
};

export default function SchoolProfilePage({ params }: SchoolProfilePageProps) {
  const { user } = useUser();
  const unwrappedParams = use(params);
  const school = mockSchoolData;
  const primaryCoach = school.coaches.find(coach => coach.isPrimary);
  const primaryContact = primaryCoach?.email ?? school.email;
  const canMessage = user ? hasPermission(user, "message_coach") : false;
  const [tryoutFilter, setTryoutFilter] = useState<"all" | "upcoming" | "past">("all")
  const [tryoutGameFilter, setTryoutGameFilter] = useState<string>("all")

  // Use mock data for now - in production this would be a real API call with proper UUID
  const tryoutsData = mockTryoutsData;
  const isLoadingTryouts = false;

  // Filter tryouts based on current filters
  const filteredTryouts = useMemo(() => {
    if (!tryoutsData?.tryouts) return [];

    return tryoutsData.tryouts.filter(tryout => {
      const now = new Date();
      const tryoutDate = new Date(tryout.date);
      
      // Date filter
      if (tryoutFilter === "upcoming" && tryoutDate <= now) return false;
      if (tryoutFilter === "past" && tryoutDate > now) return false;
      
      // Game filter
      if (tryoutGameFilter !== "all" && tryout.game.id !== tryoutGameFilter) return false;
      
      return true;
    });
  }, [tryoutsData?.tryouts, tryoutFilter, tryoutGameFilter]);

  // Get unique games for filter
  const availableGames = useMemo(() => {
    if (!tryoutsData?.tryouts) return [];
    const games = tryoutsData.tryouts.map(tryout => tryout.game);
    const uniqueGames = games.filter((game, index, self) => 
      index === self.findIndex(g => g.id === game.id)
    );
    return uniqueGames;
  }, [tryoutsData?.tryouts]);

  // Get counts for each filter
  const tryoutCounts = useMemo(() => {
    if (!tryoutsData?.tryouts) return { all: 0, upcoming: 0, past: 0 };
    
    const now = new Date();
    const upcoming = tryoutsData.tryouts.filter(t => new Date(t.date) > now).length;
    const past = tryoutsData.tryouts.filter(t => new Date(t.date) <= now).length;
    
    return {
      all: tryoutsData.tryouts.length,
      upcoming,
      past
    };
  }, [tryoutsData?.tryouts]);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              {/* School Logo and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <div className="w-32 h-32 bg-gray-700 rounded-lg mb-4 flex items-center justify-center border border-gray-600">
                  <span className="text-gray-400 text-sm font-rajdhani">School Logo</span>
                </div>
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
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-400 font-rajdhani">Primary Contact:</div>
                          <a href={`mailto:${primaryContact}`} className="text-cyan-400 hover:text-cyan-300 font-rajdhani">
                            {primaryContact}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${school.phone}`} className="text-gray-300 font-rajdhani">
                          {school.phone}
                        </a>
                      </div>
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
                    </div>
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
                        <span className="text-sm text-gray-300 font-rajdhani">6+</span>
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
                  <CoachCarousel coaches={school.coaches} canMessage={canMessage} />
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
                  {/* Mock announcements */}
                  <div className="border-l-4 border-cyan-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-xs text-gray-400 font-rajdhani">2 hours ago</span>
                    </div>
                    <h4 className="font-orbitron font-semibold text-sm text-white mb-1">Valorant Tryouts Starting Soon</h4>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      Registration for our Valorant team tryouts opens next Monday. Check your email for details.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-gray-400 font-rajdhani">1 day ago</span>
                    </div>
                    <h4 className="font-orbitron font-semibold text-sm text-white mb-1">Championship Victory!</h4>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      Our Overwatch team secured 1st place in the Pacific Coast Championship. Congratulations!
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs text-gray-400 font-rajdhani">3 days ago</span>
                    </div>
                    <h4 className="font-orbitron font-semibold text-sm text-white mb-1">New Training Facility</h4>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      Our new esports training facility is now open with 20 high-end gaming stations.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-xs text-gray-400 font-rajdhani">1 week ago</span>
                    </div>
                    <h4 className="font-orbitron font-semibold text-sm text-white mb-1">Scholarship Program Launch</h4>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      Announcing our new esports scholarship program for outstanding players.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-gray-400 font-rajdhani">1 week ago</span>
                    </div>
                    <h4 className="font-orbitron font-semibold text-sm text-white mb-1">Alumni Spotlight</h4>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      Former player Jake Martinez signs with a professional Rocket League team.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-xs text-gray-400 font-rajdhani">2 weeks ago</span>
                    </div>
                    <h4 className="font-orbitron font-semibold text-sm text-white mb-1">Season Review Meeting</h4>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      All team members are invited to our end-of-season review and planning session.
                    </p>
                  </div>
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
                    <div className="col-span-full flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
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
                                <div className="text-3xl">
                                  {gameIcons[tryout.game.name] ?? "🎮"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-orbitron font-semibold text-white text-lg truncate">
                                    {tryout.title}
                                  </h4>
                                  <p className="text-gray-400 text-sm font-rajdhani mt-1">
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