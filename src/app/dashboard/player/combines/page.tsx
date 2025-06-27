"use client";

import { useState, useMemo, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon, 
  ClockIcon, 
  SearchIcon,
  FilterIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  TimerIcon,
  LoaderIcon,
  GamepadIcon,
  ZapIcon,
  TrophyIcon,
  StarIcon,
  LockIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import { formatDateTimeInLocalTimezone } from "@/lib/time-utils";

type RegistrationStatus = "PENDING" | "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED";

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
    case "LEAGUE OF LEGENDS":
      return "bg-purple-600";
    default:
      return "bg-gray-600";
  }
};

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

const getStatusColor = (status: RegistrationStatus) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-600";
    case "PENDING":
      return "bg-yellow-600";
    case "WAITLISTED":
      return "bg-blue-600";
    case "DECLINED":
      return "bg-red-600";
    case "CANCELLED":
      return "bg-gray-600";
    default:
      return "bg-gray-600";
  }
};

const getStatusIcon = (status: RegistrationStatus) => {
  switch (status) {
    case "CONFIRMED":
      return <CheckCircleIcon className="h-4 w-4" />;
    case "PENDING":
      return <TimerIcon className="h-4 w-4" />;
    case "WAITLISTED":
      return <AlertCircleIcon className="h-4 w-4" />;
    case "DECLINED":
      return <XCircleIcon className="h-4 w-4" />;
    case "CANCELLED":
      return <XCircleIcon className="h-4 w-4" />;
    default:
      return <AlertCircleIcon className="h-4 w-4" />;
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
};

const formatTime = (timeStart?: string, timeEnd?: string) => {
  if (!timeStart) return "Time TBA";
  if (!timeEnd) return timeStart;
  return `${timeStart} - ${timeEnd}`;
};

const isCombineUpcoming = (date: Date) => {
  return new Date(date) > new Date();
};

// Loading component for Suspense fallback
function CombinesPageLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            My Combines
          </h1>
          <p className="text-gray-400 mt-2">
            Track your combine registrations and view your performance analytics
          </p>
        </div>
      </div>
      <Card className="bg-[#1a1a2e] border-gray-800 p-8">
        <div className="flex items-center justify-center space-x-2">
          <LoaderIcon className="h-6 w-6 animate-spin text-cyan-400" />
          <span className="text-gray-400">Loading your combine registrations...</span>
        </div>
      </Card>
    </div>
  );
}

function CombinesPageContent() {
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState<"upcoming" | "past" | "all">("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<string | undefined>(undefined);

  // Fetch player registrations
  const { 
    data: registrations, 
    isLoading: isLoadingRegistrations, 
    error: registrationsError,
    refetch: refetchRegistrations 
  } = api.combines.getPlayerRegistrations.useQuery({
    status: activeFilter === "all" ? "all" : activeFilter,
    limit: 100
  });

  // Cancel registration mutation
  const cancelRegistrationMutation = api.combines.cancelRegistration.useMutation({
    onSuccess: () => {
      void refetchRegistrations();
      setCancelDialogOpen(false);
      setSelectedRegistration(undefined);
    },
    onError: (error) => {
      console.error('Failed to cancel registration:', error);
    }
  });

  // Filter and search registrations
  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];

    return registrations.filter(registration => {
      const combine = registration.combine;
      
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          combine.title.toLowerCase().includes(searchLower) ||
          combine.game.name.toLowerCase().includes(searchLower) ||
          combine.description.toLowerCase().includes(searchLower) ||
          combine.location.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Game filter
      if (gameFilter && gameFilter !== "all" && combine.game.name !== gameFilter) {
        return false;
      }

      // Status filter
      if (statusFilter && statusFilter !== "all" && registration.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [registrations, searchQuery, gameFilter, statusFilter]);

  // Get unique games for filter
  const availableGames = useMemo(() => {
    if (!registrations) return [];
    const games = registrations.map(reg => reg.combine.game.name);
    return [...new Set(games)];
  }, [registrations]);

  const handleCancelRegistration = () => {
    if (selectedRegistration) {
      cancelRegistrationMutation.mutate({
        registration_id: selectedRegistration
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            My Combines
          </h1>
          <p className="text-gray-400 mt-2">
            Track your combine registrations and view your performance analytics
          </p>
          {user && (
            <p className="text-sm text-cyan-400 mt-1">
              Logged in as: {user.emailAddresses[0]?.emailAddress}
            </p>
          )}
        </div>
        <Link href="/tryouts/combines">
          <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">
            <SearchIcon className="h-4 w-4 mr-2" />
            Browse Combines
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#1a1a2e] border-gray-800 p-6">
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex gap-2">
            <Button 
              variant={activeFilter === "upcoming" ? "default" : "ghost"}
              className={activeFilter === "upcoming" ? "bg-cyan-400 text-black" : "text-gray-300 hover:bg-gray-800"}
              onClick={() => setActiveFilter("upcoming")}
            >
              Upcoming
            </Button>
            <Button 
              variant={activeFilter === "past" ? "default" : "ghost"}
              className={activeFilter === "past" ? "bg-cyan-400 text-black" : "text-gray-300 hover:bg-gray-800"}
              onClick={() => setActiveFilter("past")}
            >
              Past
            </Button>
            <Button 
              variant={activeFilter === "all" ? "default" : "ghost"}
              className={activeFilter === "all" ? "bg-cyan-400 text-black" : "text-gray-300 hover:bg-gray-800"}
              onClick={() => setActiveFilter("all")}
            >
              All
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search combines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Game Filter */}
            <Select value={gameFilter} onValueChange={setGameFilter}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Games</SelectItem>
                {availableGames.map((game) => (
                  <SelectItem key={game} value={game} className="text-white">
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RegistrationStatus | "all")}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Statuses</SelectItem>
                <SelectItem value="PENDING" className="text-white">Pending</SelectItem>
                <SelectItem value="CONFIRMED" className="text-white">Confirmed</SelectItem>
                <SelectItem value="WAITLISTED" className="text-white">Waitlisted</SelectItem>
                <SelectItem value="DECLINED" className="text-white">Declined</SelectItem>
                <SelectItem value="CANCELLED" className="text-white">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Count */}
          {filteredRegistrations && (
            <div className="text-sm text-gray-400">
              Showing {filteredRegistrations.length} of {registrations?.length ?? 0} registrations
            </div>
          )}
        </div>
      </Card>

      {/* Loading State */}
      {isLoadingRegistrations && (
        <Card className="bg-[#1a1a2e] border-gray-800 p-8">
          <div className="flex items-center justify-center space-x-2">
            <LoaderIcon className="h-6 w-6 animate-spin text-cyan-400" />
            <span className="text-gray-400">Loading your combine registrations...</span>
          </div>
        </Card>
      )}

      {/* Error State */}
      {registrationsError && (
        <Card className="bg-[#1a1a2e] border-gray-800 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-900/20 rounded-full mx-auto flex items-center justify-center">
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Error Loading Combines</h3>
            <p className="text-red-400 max-w-md mx-auto">
              {registrationsError.message}
            </p>
            <Button 
              onClick={() => void refetchRegistrations()} 
              className="bg-cyan-400 hover:bg-cyan-500 text-black"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Combines List */}
      {!isLoadingRegistrations && !registrationsError && (
        <div className="space-y-4">
          {filteredRegistrations.length === 0 ? (
            /* Empty State */
            <Card className="bg-[#1a1a2e] border-gray-800 p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
                  <ZapIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {searchQuery || (gameFilter !== "all") || (statusFilter !== "all")
                    ? "No combines match your filters" 
                    : `No ${activeFilter === "all" ? "" : activeFilter} combines`
                  }
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchQuery || (gameFilter !== "all") || (statusFilter !== "all")
                    ? "Try adjusting your search or filter criteria to find more results."
                    : activeFilter === "upcoming" 
                      ? "You don't have any upcoming combines. Start by browsing available opportunities and registering for events."
                      : activeFilter === "past"
                        ? "You don't have any past combines to review."
                        : "You haven't registered for any combines yet. Start exploring opportunities!"
                  }
                </p>
                {!searchQuery && (gameFilter === "all") && (statusFilter === "all") && (
                  <Link href="/tryouts/combines">
                    <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron">
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Browse Available Combines
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            /* Combines Cards */
            filteredRegistrations.map((registration) => {
              const combine = registration.combine;
              const isUpcoming = isCombineUpcoming(combine.date);
              const canCancel = isUpcoming && registration.status !== "CANCELLED" && registration.status !== "DECLINED";
              const spotsLeft = combine.max_spots - combine.registered_spots;

              return (
                <Card key={registration.id} className="bg-[#1a1a2e] border-gray-800 p-6 hover:border-gray-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <Badge 
                          variant="secondary" 
                          className={`${getGameColor(combine.game.name)} text-white`}
                        >
                          <GamepadIcon className="h-3 w-3 mr-1" />
                          {combine.game.short_name}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`${getTypeColor(combine.type)} text-white`}
                        >
                          {combine.type}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(registration.status)} text-white flex items-center gap-1`}
                        >
                          {getStatusIcon(registration.status)}
                          {registration.status}
                        </Badge>
                        <Badge variant="secondary" className="bg-green-600 text-white">
                          <TrophyIcon className="h-3 w-3 mr-1" />
                          {combine.prize_pool}
                        </Badge>
                        {combine.invite_only && (
                          <Badge variant="secondary" className="bg-yellow-600 text-black">
                            <LockIcon className="h-3 w-3 mr-1" />
                            INVITE ONLY
                          </Badge>
                        )}
                        {registration.qualified && (
                          <Badge variant="secondary" className="bg-yellow-400 text-black">
                            <StarIcon className="h-3 w-3 mr-1" />
                            QUALIFIED
                          </Badge>
                        )}
                        {!isUpcoming && (
                          <Badge variant="secondary" className="bg-gray-500 text-white">
                            Past Event
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-semibold text-white mb-2 font-orbitron">
                        {combine.title} <span className="text-cyan-400">{combine.year}</span>
                      </h3>
                      <p className="text-gray-400 mb-3 font-rajdhani">
                        {combine.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <CalendarIcon className="h-4 w-4 text-cyan-400" />
                          <span>{formatDate(combine.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <ClockIcon className="h-4 w-4 text-green-400" />
                          <span>{formatDateTimeInLocalTimezone(
                            combine.date,
                            typeof combine.time_start === 'string' ? combine.time_start : undefined, 
                            typeof combine.time_end === 'string' ? combine.time_end : undefined,
                            { showDate: false, showTime: true, showTimezone: true }
                          )}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <MapPinIcon className="h-4 w-4 text-purple-400" />
                          <span className="truncate">{combine.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <UsersIcon className="h-4 w-4 text-orange-400" />
                          <span>{spotsLeft} spots left</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-6">
                      <Link href={`/tryouts/combines/${combine.id}`}>
                        <Button 
                          variant="outline" 
                          className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black font-orbitron"
                          size="sm"
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {canCancel && (
                        <Button 
                          variant="outline" 
                          className="border-red-600 text-red-400 hover:bg-red-900/20"
                          size="sm"
                          onClick={() => {
                            setSelectedRegistration(registration.id);
                            setCancelDialogOpen(true);
                          }}
                        >
                          Cancel Registration
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <div className="text-gray-400">
                          Organized by: <span className="text-white">
                            {combine.organizer ? `${combine.organizer.first_name} ${combine.organizer.last_name}` : "EVAL Gaming"}
                          </span>
                        </div>
                        <div className="text-gray-400">
                          Status: <span className="text-cyan-400">{combine.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        Registered: <span className="text-white">{formatDate(registration.registered_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Cancel Registration Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-cyan-300">Cancel Registration</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to cancel your registration for this combine? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              className="border-gray-600 text-black" 
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelRegistrationMutation.isPending}
            >
              Keep Registration
            </Button>
            <Button 
              variant="destructive" 
              className="bg-red-600 hover:bg-red-700" 
              onClick={handleCancelRegistration}
              disabled={cancelRegistrationMutation.isPending}
            >
              {cancelRegistrationMutation.isPending ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Cancel Registration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CombinesPage() {
  return (
    <Suspense fallback={<CombinesPageLoading />}>
      <CombinesPageContent />
    </Suspense>
  );
} 