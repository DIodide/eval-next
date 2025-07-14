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
  LockIcon,
  CrownIcon,
  BoltIcon,
  AwardIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import { formatDateTimeInLocalTimezone } from "@/lib/time-utils";

type RegistrationStatus = "PENDING" | "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED";

const getGameColor = (game: string) => {
  switch (game.toUpperCase()) {
    case "VALORANT":
      return "from-red-500/20 to-red-600/30 border-red-500/30";
    case "OVERWATCH 2":
      return "from-orange-500/20 to-orange-600/30 border-orange-500/30";
    case "SUPER SMASH BROS. ULTIMATE":
      return "from-yellow-500/20 to-yellow-600/30 border-yellow-500/30";
    case "ROCKET LEAGUE":
      return "from-blue-500/20 to-blue-600/30 border-blue-500/30";
    case "LEAGUE OF LEGENDS":
      return "from-purple-500/20 to-purple-600/30 border-purple-500/30";
    default:
      return "from-gray-500/20 to-gray-600/30 border-gray-500/30";
  }
};

const getGameBadgeColor = (game: string) => {
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

const isCombineUpcoming = (date: Date) => {
  return new Date(date) > new Date();
};

// Enhanced Loading component for Suspense fallback
function CombinesPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl" />
          <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 backdrop-blur-sm shadow-2xl">
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <ZapIcon className="h-8 w-8 text-blue-400" />
                  </div>
        <div>
                    <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            My Combines
          </h1>
                    <p className="text-gray-400 text-lg font-rajdhani">
            Track your combine registrations and view your performance analytics
          </p>
        </div>
      </div>
              </div>
            </div>
          </Card>
        </div>
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
          <div className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse" />
                <LoaderIcon className="absolute inset-0 w-16 h-16 text-blue-400 animate-spin" />
              </div>
              <h3 className="text-xl font-rajdhani font-semibold text-white">Loading Combines</h3>
              <p className="text-gray-400 font-rajdhani">Fetching your registration data...</p>
            </div>
        </div>
      </Card>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl" />
          <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 backdrop-blur-sm shadow-2xl">
            <div className="p-8">
      <div className="flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <ZapIcon className="h-8 w-8 text-blue-400" />
                    </div>
        <div>
                      <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            My Combines
          </h1>
                      <p className="text-gray-400 text-lg font-rajdhani">
            Track your combine registrations and view your performance analytics
          </p>
                    </div>
                  </div>
          {user && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <p className="text-blue-300 font-rajdhani">
                        {user.emailAddresses[0]?.emailAddress}
            </p>
                    </div>
          )}
        </div>
        <Link href="/tryouts/combines">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 font-orbitron font-semibold">
                    <SearchIcon className="h-5 w-5 mr-2" />
            Browse Combines
          </Button>
        </Link>
              </div>
            </div>
          </Card>
      </div>

        {/* Enhanced Filters and Search */}
        <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
          <div className="p-6 space-y-6">
          {/* Status Filter Tabs */}
            <div className="flex gap-3">
            <Button 
              variant={activeFilter === "upcoming" ? "default" : "ghost"}
                className={`font-rajdhani font-semibold transition-all duration-300 ${
                  activeFilter === "upcoming" 
                    ? "bg-gradient-to-r from-cyan-400 to-cyan-500 text-black shadow-lg" 
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
              onClick={() => setActiveFilter("upcoming")}
            >
                <CalendarIcon className="h-4 w-4 mr-2" />
              Upcoming
            </Button>
            <Button 
              variant={activeFilter === "past" ? "default" : "ghost"}
                className={`font-rajdhani font-semibold transition-all duration-300 ${
                  activeFilter === "past" 
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg" 
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
              onClick={() => setActiveFilter("past")}
            >
                <ClockIcon className="h-4 w-4 mr-2" />
              Past
            </Button>
            <Button 
              variant={activeFilter === "all" ? "default" : "ghost"}
                className={`font-rajdhani font-semibold transition-all duration-300 ${
                  activeFilter === "all" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg" 
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
              onClick={() => setActiveFilter("all")}
            >
                <FilterIcon className="h-4 w-4 mr-2" />
              All
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Enhanced Search */}
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
              <Input
                  placeholder="Search combines, games, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 h-12 font-rajdhani"
              />
            </div>

              {/* Enhanced Game Filter */}
            <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 h-12 font-rajdhani">
                <SelectValue placeholder="All Games" />
              </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-sm">
                  <SelectItem value="all" className="text-white font-rajdhani">All Games</SelectItem>
                {availableGames.map((game) => (
                    <SelectItem key={game} value={game} className="text-white font-rajdhani">
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

              {/* Enhanced Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as RegistrationStatus | "all")}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 h-12 font-rajdhani">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-sm">
                  <SelectItem value="all" className="text-white font-rajdhani">All Statuses</SelectItem>
                  <SelectItem value="PENDING" className="text-white font-rajdhani">Pending</SelectItem>
                  <SelectItem value="CONFIRMED" className="text-white font-rajdhani">Confirmed</SelectItem>
                  <SelectItem value="WAITLISTED" className="text-white font-rajdhani">Waitlisted</SelectItem>
                  <SelectItem value="DECLINED" className="text-white font-rajdhani">Declined</SelectItem>
                  <SelectItem value="CANCELLED" className="text-white font-rajdhani">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

            {/* Enhanced Results Count */}
          {filteredRegistrations && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/30 rounded-lg border border-gray-600/30">
                <BoltIcon className="h-4 w-4 text-cyan-400" />
                <span className="text-gray-300 font-rajdhani">
                  Showing <span className="text-white font-semibold">{filteredRegistrations.length}</span> of <span className="text-white font-semibold">{registrations?.length ?? 0}</span> registrations
                </span>
            </div>
          )}
        </div>
      </Card>

        {/* Enhanced Loading State */}
      {isLoadingRegistrations && (
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <div className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse" />
                  <LoaderIcon className="absolute inset-0 w-16 h-16 text-cyan-400 animate-spin" />
                </div>
                <h3 className="text-xl font-rajdhani font-semibold text-white">Loading Combines</h3>
                <p className="text-gray-400 font-rajdhani">Fetching your registration data...</p>
              </div>
          </div>
        </Card>
      )}

        {/* Enhanced Error State */}
      {registrationsError && (
          <Card className="bg-gradient-to-br from-red-900/20 to-gray-900/80 border-red-500/30 backdrop-blur-sm shadow-xl">
            <div className="p-12">
              <div className="text-center space-y-6">
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/30 rounded-full blur-xl" />
                  <div className="relative w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center border border-red-500/30">
                    <XCircleIcon className="w-12 h-12 text-red-400" />
                  </div>
            </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-rajdhani font-bold text-white">Error Loading Combines</h3>
                  <p className="text-red-300 max-w-md mx-auto font-rajdhani">
              {registrationsError.message}
            </p>
                </div>
            <Button 
              onClick={() => void refetchRegistrations()} 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
                  <LoaderIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
              </div>
          </div>
        </Card>
      )}

        {/* Enhanced Combines List */}
      {!isLoadingRegistrations && !registrationsError && (
          <div className="space-y-6">
          {filteredRegistrations.length === 0 ? (
              /* Enhanced Empty State */
              <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
                <div className="p-12">
                  <div className="text-center space-y-6">
                    <div className="relative mx-auto w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl" />
                      <div className="relative w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-600/50">
                        <ZapIcon className="w-12 h-12 text-gray-400" />
                      </div>
                </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-rajdhani font-bold text-white">
                  {searchQuery || (gameFilter !== "all") || (statusFilter !== "all")
                    ? "No combines match your filters" 
                    : `No ${activeFilter === "all" ? "" : activeFilter} combines`
                  }
                </h3>
                      <p className="text-gray-400 max-w-lg mx-auto font-rajdhani text-lg">
                  {searchQuery || (gameFilter !== "all") || (statusFilter !== "all")
                    ? "Try adjusting your search or filter criteria to find more results."
                    : activeFilter === "upcoming" 
                      ? "You don't have any upcoming combines. Start by browsing available opportunities and registering for events."
                      : activeFilter === "past"
                        ? "You don't have any past combines to review."
                        : "You haven't registered for any combines yet. Start exploring opportunities!"
                  }
                </p>
                    </div>
                {!searchQuery && (gameFilter === "all") && (statusFilter === "all") && (
                  <Link href="/tryouts/combines">
                        <Button className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-black shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 font-orbitron font-semibold">
                          <SearchIcon className="h-5 w-5 mr-2" />
                      Browse Available Combines
                    </Button>
                  </Link>
                )}
                  </div>
              </div>
            </Card>
          ) : (
              /* Enhanced Combines Cards */
            filteredRegistrations.map((registration) => {
              const combine = registration.combine;
              const isUpcoming = isCombineUpcoming(combine.date);
              const canCancel = isUpcoming && registration.status !== "CANCELLED" && registration.status !== "DECLINED";
              const spotsLeft = combine.max_spots - combine.registered_spots;
                const gameGradient = getGameColor(combine.game.name);

              return (
                  <Card key={registration.id} className={`group relative bg-gradient-to-br ${gameGradient} backdrop-blur-sm border hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] overflow-hidden`}>
                    {/* Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <div className="relative p-8">
                      <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                          {/* Enhanced Badges */}
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <Badge 
                          variant="secondary" 
                              className={`${getGameBadgeColor(combine.game.name)} text-white shadow-lg font-rajdhani font-semibold`}
                        >
                          <GamepadIcon className="h-3 w-3 mr-1" />
                          {combine.game.short_name}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                              className={`${getTypeColor(combine.type)} text-white shadow-lg font-rajdhani font-semibold`}
                        >
                          {combine.type}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                              className={`${getStatusColor(registration.status)} text-white flex items-center gap-1 shadow-lg font-rajdhani font-semibold`}
                        >
                          {getStatusIcon(registration.status)}
                          {registration.status}
                        </Badge>
                            <Badge variant="secondary" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg font-rajdhani font-semibold">
                          <TrophyIcon className="h-3 w-3 mr-1" />
                          {combine.prize_pool}
                        </Badge>
                        {combine.invite_only && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg font-rajdhani font-semibold">
                            <LockIcon className="h-3 w-3 mr-1" />
                            INVITE ONLY
                          </Badge>
                        )}
                        {registration.qualified && (
                              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg font-rajdhani font-semibold">
                            <StarIcon className="h-3 w-3 mr-1" />
                            QUALIFIED
                          </Badge>
                        )}
                        {!isUpcoming && (
                              <Badge variant="secondary" className="bg-gray-500 text-white shadow-lg font-rajdhani font-semibold">
                            Past Event
                          </Badge>
                        )}
                      </div>
                      
                          {/* Enhanced Title and Description */}
                          <h3 className="text-2xl font-orbitron font-bold text-white mb-3 group-hover:text-cyan-200 transition-colors">
                        {combine.title} <span className="text-cyan-400">{combine.year}</span>
                      </h3>
                          <p className="text-gray-300 mb-6 font-rajdhani text-lg leading-relaxed">
                        {combine.description}
                      </p>
                      
                          {/* Enhanced Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                              <CalendarIcon className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-400 font-rajdhani uppercase tracking-wide">Date</p>
                                <p className="text-white font-rajdhani font-semibold">{formatDate(combine.date)}</p>
                              </div>
                        </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                              <ClockIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-400 font-rajdhani uppercase tracking-wide">Time</p>
                                <p className="text-white font-rajdhani font-semibold">{formatDateTimeInLocalTimezone(
                            combine.date,
                            typeof combine.time_start === 'string' ? combine.time_start : undefined, 
                            typeof combine.time_end === 'string' ? combine.time_end : undefined,
                            { showDate: false, showTime: true, showTimezone: true }
                                )}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                              <MapPinIcon className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-400 font-rajdhani uppercase tracking-wide">Location</p>
                                <p className="text-white font-rajdhani font-semibold break-words">{combine.location}</p>
                              </div>
                        </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                              <UsersIcon className="h-5 w-5 text-orange-400 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-gray-400 font-rajdhani uppercase tracking-wide">Spots</p>
                                <p className="text-white font-rajdhani font-semibold">{spotsLeft} left</p>
                        </div>
                        </div>
                      </div>
                    </div>
                    
                        {/* Enhanced Action Buttons */}
                        <div className="flex flex-col gap-3 ml-8">
                      <Link href={`/tryouts/combines/${combine.id}`}>
                        <Button 
                          variant="outline" 
                              className="bg-cyan-500/10 border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm shadow-lg font-orbitron"
                          size="sm"
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      
                      {canCancel && (
                        <Button 
                          variant="outline" 
                              className="bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 backdrop-blur-sm shadow-lg"
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
                  
                      {/* Enhanced Footer */}
                      <div className="border-t border-gray-700/50 pt-6">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-6">
                            <div className="text-gray-400 font-rajdhani">
                              Organized by: <span className="text-white font-semibold">
                            {combine.organizer ? `${combine.organizer.first_name} ${combine.organizer.last_name}` : "EVAL Gaming"}
                          </span>
                        </div>
                            <div className="text-gray-400 font-rajdhani">
                              Status: <span className="text-cyan-400 font-semibold">{combine.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                          <div className="text-gray-400 font-rajdhani">
                            Registered: <span className="text-white font-semibold">{formatDate(registration.registered_at)}</span>
                          </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

        {/* Enhanced Cancel Registration Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-700/50 text-white backdrop-blur-sm">
          <DialogHeader>
              <DialogTitle className="text-xl font-orbitron font-bold text-cyan-300">Cancel Registration</DialogTitle>
              <DialogDescription className="text-gray-400 font-rajdhani text-lg">
              Are you sure you want to cancel your registration for this combine? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
            <div className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
                className="bg-gray-600/20 border-gray-500/30 text-gray-200 hover:bg-gray-600/30 font-rajdhani" 
              onClick={() => setCancelDialogOpen(false)}
              disabled={cancelRegistrationMutation.isPending}
            >
              Keep Registration
            </Button>
            <Button 
              variant="destructive" 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-rajdhani font-semibold" 
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