"use client";

import { useState, useMemo, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AwardIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { formatDateTimeInLocalTimezone } from "@/lib/time-utils";

type RegistrationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "WAITLISTED"
  | "DECLINED"
  | "CANCELLED";

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
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const isCombineUpcoming = (date: Date) => {
  return new Date(date) > new Date();
};

// Enhanced Loading component for Suspense fallback
function CombinesPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-xl" />
          <Card className="relative border-blue-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-2xl backdrop-blur-sm">
            <div className="p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/20 p-3">
                    <ZapIcon className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="font-orbitron bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
                      My Combines
                    </h1>
                    <p className="font-rajdhani text-lg text-gray-400">
                      Track your combine registrations and view your performance
                      analytics
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
          <div className="p-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                <LoaderIcon className="absolute inset-0 h-16 w-16 animate-spin text-blue-400" />
              </div>
              <h3 className="font-rajdhani text-xl font-semibold text-white">
                Loading Combines
              </h3>
              <p className="font-rajdhani text-gray-400">
                Fetching your registration data...
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CombinesPageContent() {
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState<"upcoming" | "past" | "all">(
    "upcoming",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus | "all">(
    "all",
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<
    string | undefined
  >(undefined);

  // Fetch player registrations
  const {
    data: registrations,
    isLoading: isLoadingRegistrations,
    error: registrationsError,
    refetch: refetchRegistrations,
  } = api.combines.getPlayerRegistrations.useQuery({
    status: activeFilter === "all" ? "all" : activeFilter,
    limit: 100,
  });

  // Cancel registration mutation
  const cancelRegistrationMutation =
    api.combines.cancelRegistration.useMutation({
      onSuccess: () => {
        void refetchRegistrations();
        setCancelDialogOpen(false);
        setSelectedRegistration(undefined);
      },
      onError: (error) => {
        console.error("Failed to cancel registration:", error);
      },
    });

  // Filter and search registrations
  const filteredRegistrations = useMemo(() => {
    if (!registrations) return [];

    return registrations.filter((registration) => {
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
      if (
        gameFilter &&
        gameFilter !== "all" &&
        combine.game.name !== gameFilter
      ) {
        return false;
      }

      // Status filter
      if (
        statusFilter &&
        statusFilter !== "all" &&
        registration.status !== statusFilter
      ) {
        return false;
      }

      return true;
    });
  }, [registrations, searchQuery, gameFilter, statusFilter]);

  // Get unique games for filter
  const availableGames = useMemo(() => {
    if (!registrations) return [];
    const games = registrations.map((reg) => reg.combine.game.name);
    return [...new Set(games)];
  }, [registrations]);

  const handleCancelRegistration = () => {
    if (selectedRegistration) {
      cancelRegistrationMutation.mutate({
        registration_id: selectedRegistration,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto space-y-8 p-6">
        {/* Enhanced Page Header */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-xl" />
          <Card className="relative border-blue-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-2xl backdrop-blur-sm">
            <div className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-500/20 p-3">
                      <ZapIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="font-orbitron bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
                        My Combines
                      </h1>
                      <p className="font-rajdhani text-lg text-gray-400">
                        Track your combine registrations and view your
                        performance analytics
                      </p>
                    </div>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                      <p className="font-rajdhani text-blue-300">
                        {user.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  )}
                </div>
                <Link href="/tryouts/combines">
                  <Button className="font-orbitron border-0 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl">
                    <SearchIcon className="mr-2 h-5 w-5" />
                    Browse Combines
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Filters and Search */}
        <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
          <div className="space-y-6 p-6">
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
                <CalendarIcon className="mr-2 h-4 w-4" />
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
                <ClockIcon className="mr-2 h-4 w-4" />
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
                <FilterIcon className="mr-2 h-4 w-4" />
                All
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Enhanced Search */}
              <div className="group relative">
                <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors group-focus-within:text-cyan-400" />
                <Input
                  placeholder="Search combines, games, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="font-rajdhani h-12 border-gray-600 bg-gray-800/50 pl-12 text-white placeholder-gray-400 transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              {/* Enhanced Game Filter */}
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="font-rajdhani h-12 border-gray-600 bg-gray-800/50 text-white transition-all duration-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800 backdrop-blur-sm">
                  <SelectItem value="all" className="font-rajdhani text-white">
                    All Games
                  </SelectItem>
                  {availableGames.map((game) => (
                    <SelectItem
                      key={game}
                      value={game}
                      className="font-rajdhani text-white"
                    >
                      {game}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Enhanced Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as RegistrationStatus | "all")
                }
              >
                <SelectTrigger className="font-rajdhani h-12 border-gray-600 bg-gray-800/50 text-white transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800 backdrop-blur-sm">
                  <SelectItem value="all" className="font-rajdhani text-white">
                    All Statuses
                  </SelectItem>
                  <SelectItem
                    value="PENDING"
                    className="font-rajdhani text-white"
                  >
                    Pending
                  </SelectItem>
                  <SelectItem
                    value="CONFIRMED"
                    className="font-rajdhani text-white"
                  >
                    Confirmed
                  </SelectItem>
                  <SelectItem
                    value="WAITLISTED"
                    className="font-rajdhani text-white"
                  >
                    Waitlisted
                  </SelectItem>
                  <SelectItem
                    value="DECLINED"
                    className="font-rajdhani text-white"
                  >
                    Declined
                  </SelectItem>
                  <SelectItem
                    value="CANCELLED"
                    className="font-rajdhani text-white"
                  >
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Results Count */}
            {filteredRegistrations && (
              <div className="flex items-center gap-2 rounded-lg border border-gray-600/30 bg-gray-700/30 px-4 py-2">
                <BoltIcon className="h-4 w-4 text-cyan-400" />
                <span className="font-rajdhani text-gray-300">
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {filteredRegistrations.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {registrations?.length ?? 0}
                  </span>{" "}
                  registrations
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Enhanced Loading State */}
        {isLoadingRegistrations && (
          <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
            <div className="p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20" />
                  <LoaderIcon className="absolute inset-0 h-16 w-16 animate-spin text-cyan-400" />
                </div>
                <h3 className="font-rajdhani text-xl font-semibold text-white">
                  Loading Combines
                </h3>
                <p className="font-rajdhani text-gray-400">
                  Fetching your registration data...
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Error State */}
        {registrationsError && (
          <Card className="border-red-500/30 bg-gradient-to-br from-red-900/20 to-gray-900/80 shadow-xl backdrop-blur-sm">
            <div className="p-12">
              <div className="space-y-6 text-center">
                <div className="relative mx-auto h-24 w-24">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-red-600/30 blur-xl" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-red-500/30 bg-red-900/30">
                    <XCircleIcon className="h-12 w-12 text-red-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-rajdhani text-2xl font-bold text-white">
                    Error Loading Combines
                  </h3>
                  <p className="font-rajdhani mx-auto max-w-md text-red-300">
                    {registrationsError.message}
                  </p>
                </div>
                <Button
                  onClick={() => void refetchRegistrations()}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-xl"
                >
                  <LoaderIcon className="mr-2 h-4 w-4" />
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
              <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
                <div className="p-12">
                  <div className="space-y-6 text-center">
                    <div className="relative mx-auto h-24 w-24">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl" />
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/50">
                        <ZapIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-rajdhani text-2xl font-bold text-white">
                        {searchQuery ||
                        gameFilter !== "all" ||
                        statusFilter !== "all"
                          ? "No combines match your filters"
                          : `No ${activeFilter === "all" ? "" : activeFilter} combines`}
                      </h3>
                      <p className="font-rajdhani mx-auto max-w-lg text-lg text-gray-400">
                        {searchQuery ||
                        gameFilter !== "all" ||
                        statusFilter !== "all"
                          ? "Try adjusting your search or filter criteria to find more results."
                          : activeFilter === "upcoming"
                            ? "You don't have any upcoming combines. Start by browsing available opportunities and registering for events."
                            : activeFilter === "past"
                              ? "You don't have any past combines to review."
                              : "You haven't registered for any combines yet. Start exploring opportunities!"}
                      </p>
                    </div>
                    {!searchQuery &&
                      gameFilter === "all" &&
                      statusFilter === "all" && (
                        <Link href="/tryouts/combines">
                          <Button className="font-orbitron bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-black shadow-lg transition-all duration-300 hover:from-cyan-500 hover:to-blue-600 hover:shadow-xl">
                            <SearchIcon className="mr-2 h-5 w-5" />
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
                const canCancel =
                  isUpcoming &&
                  registration.status !== "CANCELLED" &&
                  registration.status !== "DECLINED";
                const spotsLeft = combine.max_spots - combine.registered_spots;
                const gameGradient = getGameColor(combine.game.name);

                return (
                  <Card
                    key={registration.id}
                    className={`group relative bg-gradient-to-br ${gameGradient} overflow-hidden border backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}
                  >
                    {/* Background Animation */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

                    <div className="relative p-8">
                      <div className="mb-6 flex items-start justify-between">
                        <div className="flex-1">
                          {/* Enhanced Badges */}
                          <div className="mb-4 flex flex-wrap items-center gap-3">
                            <Badge
                              variant="secondary"
                              className={`${getGameBadgeColor(combine.game.name)} font-rajdhani font-semibold text-white shadow-lg`}
                            >
                              <GamepadIcon className="mr-1 h-3 w-3" />
                              {combine.game.short_name}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`${getTypeColor(combine.type)} font-rajdhani font-semibold text-white shadow-lg`}
                            >
                              {combine.type}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`${getStatusColor(registration.status)} font-rajdhani flex items-center gap-1 font-semibold text-white shadow-lg`}
                            >
                              {getStatusIcon(registration.status)}
                              {registration.status}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="font-rajdhani bg-gradient-to-r from-green-600 to-emerald-600 font-semibold text-white shadow-lg"
                            >
                              <TrophyIcon className="mr-1 h-3 w-3" />
                              {combine.prize_pool}
                            </Badge>
                            {combine.invite_only && (
                              <Badge
                                variant="secondary"
                                className="font-rajdhani bg-gradient-to-r from-yellow-500 to-yellow-600 font-semibold text-black shadow-lg"
                              >
                                <LockIcon className="mr-1 h-3 w-3" />
                                INVITE ONLY
                              </Badge>
                            )}
                            {registration.qualified && (
                              <Badge
                                variant="secondary"
                                className="font-rajdhani bg-gradient-to-r from-yellow-400 to-yellow-500 font-semibold text-black shadow-lg"
                              >
                                <StarIcon className="mr-1 h-3 w-3" />
                                QUALIFIED
                              </Badge>
                            )}
                            {!isUpcoming && (
                              <Badge
                                variant="secondary"
                                className="font-rajdhani bg-gray-500 font-semibold text-white shadow-lg"
                              >
                                Past Event
                              </Badge>
                            )}
                          </div>

                          {/* Enhanced Title and Description */}
                          <h3 className="font-orbitron mb-3 text-2xl font-bold text-white transition-colors group-hover:text-cyan-200">
                            {combine.title}{" "}
                            <span className="text-cyan-400">
                              {combine.year}
                            </span>
                          </h3>
                          <p className="font-rajdhani mb-6 text-lg leading-relaxed text-gray-300">
                            {combine.description}
                          </p>

                          {/* Enhanced Info Grid */}
                          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
                              <CalendarIcon className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                              <div>
                                <p className="font-rajdhani text-xs tracking-wide text-gray-400 uppercase">
                                  Date
                                </p>
                                <p className="font-rajdhani font-semibold text-white">
                                  {formatDate(combine.date)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
                              <ClockIcon className="h-5 w-5 flex-shrink-0 text-green-400" />
                              <div>
                                <p className="font-rajdhani text-xs tracking-wide text-gray-400 uppercase">
                                  Time
                                </p>
                                <p className="font-rajdhani font-semibold text-white">
                                  {formatDateTimeInLocalTimezone(
                                    combine.date,
                                    typeof combine.time_start === "string"
                                      ? combine.time_start
                                      : undefined,
                                    typeof combine.time_end === "string"
                                      ? combine.time_end
                                      : undefined,
                                    {
                                      showDate: false,
                                      showTime: true,
                                      showTimezone: true,
                                    },
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
                              <MapPinIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                              <div className="min-w-0 flex-1">
                                <p className="font-rajdhani text-xs tracking-wide text-gray-400 uppercase">
                                  Location
                                </p>
                                <p className="font-rajdhani font-semibold break-words text-white">
                                  {combine.location}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border border-gray-700/30 bg-gray-800/30 p-3">
                              <UsersIcon className="h-5 w-5 flex-shrink-0 text-orange-400" />
                              <div>
                                <p className="font-rajdhani text-xs tracking-wide text-gray-400 uppercase">
                                  Spots
                                </p>
                                <p className="font-rajdhani font-semibold text-white">
                                  {spotsLeft} left
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="ml-8 flex flex-col gap-3">
                          <Link href={`/tryouts/combines/${combine.id}`}>
                            <Button
                              variant="outline"
                              className="font-orbitron border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-cyan-400/50 hover:bg-cyan-500/20"
                              size="sm"
                            >
                              <ExternalLinkIcon className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </Link>

                          {canCancel && (
                            <Button
                              variant="outline"
                              className="border-red-500/30 bg-red-500/10 text-red-300 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/20"
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="font-rajdhani text-gray-400">
                              Organized by:{" "}
                              <span className="font-semibold text-white">
                                {combine.organizer
                                  ? `${combine.organizer.first_name} ${combine.organizer.last_name}`
                                  : "EVAL Gaming"}
                              </span>
                            </div>
                            <div className="font-rajdhani text-gray-400">
                              Status:{" "}
                              <span className="font-semibold text-cyan-400">
                                {combine.status.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                          <div className="font-rajdhani text-gray-400">
                            Registered:{" "}
                            <span className="font-semibold text-white">
                              {formatDate(registration.registered_at)}
                            </span>
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
          <DialogContent className="border-gray-700/50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 text-white backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="font-orbitron text-xl font-bold text-cyan-300">
                Cancel Registration
              </DialogTitle>
              <DialogDescription className="font-rajdhani text-lg text-gray-400">
                Are you sure you want to cancel your registration for this
                combine? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 pt-6">
              <Button
                variant="outline"
                className="font-rajdhani border-gray-500/30 bg-gray-600/20 text-gray-200 hover:bg-gray-600/30"
                onClick={() => setCancelDialogOpen(false)}
                disabled={cancelRegistrationMutation.isPending}
              >
                Keep Registration
              </Button>
              <Button
                variant="destructive"
                className="font-rajdhani bg-gradient-to-r from-red-600 to-red-700 font-semibold hover:from-red-700 hover:to-red-800"
                onClick={handleCancelRegistration}
                disabled={cancelRegistrationMutation.isPending}
              >
                {cancelRegistrationMutation.isPending ? (
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
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
