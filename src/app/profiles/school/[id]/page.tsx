"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { hasPermission } from "@/lib/client/permissions";
import { getGameLogoPath } from "@/lib/game-logos";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  BuildingIcon,
  Calendar,
  ChevronLeftIcon,
  ChevronRightIcon,
  Clock,
  DollarSign,
  ExternalLink,
  Facebook,
  Globe,
  GraduationCapIcon,
  HandshakeIcon,
  Instagram,
  Loader2,
  Mail,
  MapPin,
  MessageSquareIcon,
  Phone,
  SchoolIcon,
  Share2Icon,
  Trophy,
  Twitch,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import { use, useMemo, useState } from "react";
import { toast } from "sonner";

// Animation variants - more subtle for school profiles
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.005,
    transition: {
      duration: 0.2,
    },
  },
};

// Region mapping from School Association Request Form
const REGION_MAPPING: Record<string, string> = {
  northeast: "Northeast",
  southeast: "Southeast",
  midwest: "Midwest",
  southwest: "Southwest",
  west: "West",
  pacific: "Pacific",
};

// Helper function to get readable region name
const getReadableRegion = (region: string | null): string | null => {
  if (!region) return null;
  return REGION_MAPPING[region.toLowerCase()] ?? region;
};

// Helper function to get school type description
const getSchoolTypeDescription = (type: string): string => {
  switch (type) {
    case "HIGH_SCHOOL":
      return "Secondary education institution";
    case "COLLEGE":
      return "2-year post secondary institution";
    case "UNIVERSITY":
      return "4-year post secondary institution";
    default:
      return "Educational institution";
  }
};

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

function MessageCoachDialog({
  coachId,
  coachName,
}: {
  coachId: string;
  coachName: string;
}) {
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
        <Button
          size="sm"
          className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
        >
          <MessageSquareIcon className="mr-1 h-3 w-3" />
          Message
        </Button>
      </DialogTrigger>
      <DialogContent className="border-gray-800 bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron">
            Send Message to {coachName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Send a direct message to this coach about tryouts and recruitment
            opportunities.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="message" className="text-gray-300">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-gray-700 bg-gray-800 text-white placeholder-gray-400"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-gray-700 text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="bg-cyan-600 text-white hover:bg-cyan-700"
          >
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CoachCarousel({
  coaches,
  canMessage,
}: {
  coaches: TransformedCoach[];
  canMessage: boolean;
}) {
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
    (currentIndex + 1) * itemsPerPage,
  );

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <motion.h3
          className="font-orbitron flex items-center gap-2 text-xl font-bold text-white"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="rounded-lg bg-cyan-500/20 p-1.5">
            <Users className="h-5 w-5 text-cyan-400" />
          </div>
          Our Coaching Staff
        </motion.h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={totalPages <= 1}
            className="border-gray-700/50 bg-black/20 text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/70 hover:bg-gray-700/30 hover:text-white"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <span className="font-rajdhani rounded border border-gray-700/30 bg-black/20 px-2 py-1 text-sm text-gray-400 backdrop-blur-sm">
            {currentIndex + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={totalPages <= 1}
            className="border-gray-700/50 bg-black/20 text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-600/70 hover:bg-gray-700/30 hover:text-white"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visibleCoaches.map((coach, index) => (
          <motion.div
            key={coach.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            variants={cardHoverVariants}
            whileHover="hover"
            className={`relative border bg-[#1a1a2e]/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
              coach.isPrimary
                ? "border-cyan-500/30 hover:border-cyan-400/50"
                : "border-gray-700/50 hover:border-gray-600/70"
            }`}
          >
            {coach.isPrimary && (
              <Badge className="font-orbitron absolute -top-1.5 -right-1.5 z-10 border border-cyan-500/30 bg-cyan-600/90 text-xs text-white backdrop-blur-sm">
                Primary Contact
              </Badge>
            )}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar className="h-12 w-12 border border-gray-700/30 ring-2 ring-cyan-400/20">
                    <AvatarImage
                      src={coach.image_url ?? undefined}
                      alt={coach.name}
                    />
                    <AvatarFallback className="font-orbitron border border-cyan-500/30 bg-gradient-to-br from-cyan-600/80 to-blue-600/80 text-sm text-white backdrop-blur-sm">
                      {coach.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                {/* Coach Info */}
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h4 className="font-orbitron mb-1 font-semibold text-white">
                        {coach.name}
                      </h4>
                      <p className="font-rajdhani text-sm text-cyan-400">
                        {coach.title}
                      </p>
                    </div>
                    {canMessage && (
                      <MessageCoachDialog
                        coachId={coach.id}
                        coachName={coach.name}
                      />
                    )}
                  </div>

                  {/* Contact */}
                  <div className="mb-3">
                    <a
                      href={`mailto:${coach.email}`}
                      className="font-rajdhani flex items-center gap-1 text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                    >
                      <Mail className="h-3 w-3" />
                      {coach.email}
                    </a>
                  </div>

                  {/* Achievements */}
                  <div className="rounded border border-gray-700/30 bg-black/20 p-3 backdrop-blur-sm">
                    <div className="font-rajdhani mb-2 text-sm text-gray-400">
                      Recent Achievements:
                    </div>
                    <div className="space-y-1">
                      {coach.achievements.length > 0 ? (
                        coach.achievements.slice(0, 2).map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-center gap-2"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                            <span className="font-rajdhani text-sm text-gray-300">
                              {achievement.title}
                            </span>
                            <span className="font-rajdhani text-xs text-gray-500">
                              (
                              {new Date(
                                achievement.date_achieved,
                              ).getFullYear()}
                              )
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400"></div>
                          <span className="font-rajdhani text-sm text-gray-300">
                            E-Sports Coaching Experience
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dots indicator */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full border backdrop-blur-sm transition-all duration-300 ${
                index === currentIndex
                  ? "border-cyan-400/50 bg-cyan-400/80 shadow-lg shadow-cyan-400/20"
                  : "border-gray-600/30 bg-gray-600/50 hover:border-gray-500/50 hover:bg-gray-500/70"
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
  VALORANT: "/valorant/logos/V_Lockup_Vertical Black.png",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Primary Logo.png",
  "Super Smash Bros. Ultimate": "/smash/logos/Smash Ball White Logo.png",
  "Rocket League": "/rocket-league/logos/Rocket League Emblem.png",
};

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

// Helper function to get readable tryout type names
const getReadableTypeName = (type: string): string => {
  switch (type) {
    case "ONLINE":
      return "Online";
    case "IN_PERSON":
      return "In Person";
    case "HYBRID":
      return "Hybrid";
    default:
      return type;
  }
};

// Helper function to get readable game names
const getReadableGameName = (gameName: string): string => {
  switch (gameName.toUpperCase()) {
    case "VALORANT":
      return "VALORANT";
    case "OVERWATCH 2":
      return "Overwatch 2";
    case "SUPER SMASH BROS. ULTIMATE":
      return "Smash Ultimate";
    case "ROCKET LEAGUE":
      return "Rocket League";
    case "RL":
      return "Rocket League";
    case "VAL":
      return "VALORANT";
    case "OW2":
      return "Overwatch 2";
    case "SSBU":
      return "Smash Ultimate";
    default:
      return gameName;
  }
};

// Format date helper
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );
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
  const { user, isSignedIn, isLoaded: isAuthLoaded } = useUser();
  const unwrappedParams = use(params);

  // Get user type from Clerk metadata
  const userType = user?.publicMetadata?.userType as
    | "player"
    | "coach"
    | "league"
    | undefined;
  const isPlayer = userType === "player";
  const isCoach = userType === "coach";

  // Get coach onboarding status (only for coaches) - to check if they already have a school
  const { data: coachStatus } = api.coachProfile.getOnboardingStatus.useQuery(
    undefined,
    {
      enabled: isAuthLoaded && isSignedIn && isCoach,
    },
  );

  // Determine if the coach can claim this school
  const coachCanClaim = isCoach && coachStatus?.canRequestAssociation === true;
  const coachHasSchool = isCoach && coachStatus?.hasSchoolAssociation === true;
  const coachHasPendingRequest =
    isCoach && coachStatus?.hasPendingRequest === true;

  // Claim school dialog state
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");

  // School association request mutation (for coaches)
  const submitAssociationRequest =
    api.coachProfile.submitSchoolAssociationRequest.useMutation({
      onSuccess: () => {
        toast.success(
          "School association request submitted! An admin will review your request.",
        );
        setIsClaimDialogOpen(false);
        setClaimMessage("");
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to submit request");
      },
    });

  // Handle share profile functionality
  const handleShareProfile = async () => {
    try {
      const url = window.location.href;
      const urlWithSchoolName = `${url}?schoolName=${encodeURIComponent(school?.name ?? "")}`;
      await navigator.clipboard.writeText(urlWithSchoolName);
      toast.success("School profile URL copied to clipboard!");
    } catch (err) {
      console.error(err);
      // Fallback for browsers that don't support clipboard API
      toast.error("Unable to copy to clipboard. Please copy the URL manually.");
    }
  };

  // Fetch school data using tRPC
  const {
    data: schoolData,
    isLoading: isLoadingSchool,
    error: schoolError,
  } = api.schoolProfile.getById.useQuery({
    id: unwrappedParams.id,
  });

  // Transform the data to match expected format
  const school = schoolData
    ? {
        id: schoolData.id,
        name: schoolData.name,
        location: `${schoolData.location}, ${schoolData.state ?? ""}`,
        logo: schoolData.logo_url ?? "/eval/logos/emblem.png", // Fallback logo
        banner: schoolData.banner_url ?? null, // Use banner from API when available
        bio:
          schoolData.bio ??
          "Welcome to our esports program. We are committed to excellence in competitive gaming.",
        website: schoolData.website ?? "",
        email: schoolData.email ?? "",
        phone: schoolData.phone ?? "",
        type: schoolData.type,
        region: schoolData.region,
        country: schoolData.country,
        country_iso2: schoolData.country_iso2,
        esports_titles: schoolData.esports_titles ?? [],
        social_links: schoolData.social_links as {
          facebook?: string | null;
          twitter?: string | null;
          instagram?: string | null;
          youtube?: string | null;
          twitch?: string | null;
        } | null,
        discord_handle: schoolData.discord_handle,
        in_state_tuition: schoolData.in_state_tuition,
        out_of_state_tuition: schoolData.out_of_state_tuition,
        minimum_gpa: schoolData.minimum_gpa,
        minimum_sat: schoolData.minimum_sat,
        minimum_act: schoolData.minimum_act,
        scholarships_available: schoolData.scholarships_available,
        coaches: transformCoachData(schoolData.coaches ?? []),
      }
    : null;

  const primaryCoach = school?.coaches.find(
    (coach: TransformedCoach) => coach.isPrimary,
  );
  const primaryContact = primaryCoach?.email ?? school?.email ?? "";
  const canMessage = user ? hasPermission(user, "message_coach") : false;
  const [tryoutFilter, setTryoutFilter] = useState<"all" | "upcoming" | "past">(
    "all",
  );
  const [tryoutGameFilter, setTryoutGameFilter] = useState<string>("all");

  // Get tryouts using real API
  const {
    data: tryoutsData,
    isLoading: isLoadingTryouts,
    error: tryoutsError,
  } = api.schoolProfile.getTryouts.useQuery({
    schoolId: unwrappedParams.id,
    filter: tryoutFilter,
    gameId: tryoutGameFilter === "all" ? undefined : tryoutGameFilter,
    limit: 50, // Get more tryouts for filtering
  });

  // Get available games for filtering
  const { data: availableGamesData } =
    api.schoolProfile.getAvailableGames.useQuery({
      schoolId: unwrappedParams.id,
    });

  // Get school announcements
  const { data: announcementsData, isLoading: isLoadingAnnouncements } =
    api.schoolProfile.getAnnouncements.useQuery({
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
  }, [
    allTryoutsData?.total,
    upcomingTryoutsData?.total,
    pastTryoutsData?.total,
  ]);

  // Handle loading state
  if (isLoadingSchool) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-16 w-16 rounded-full border-4 border-t-cyan-400 border-r-blue-400 border-b-cyan-400 border-l-transparent"
          />
          <p className="font-rajdhani mt-6 text-lg text-gray-400">
            Loading school profile...
          </p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (schoolError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 blur-xl" />
            <Card className="relative border-red-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 shadow-2xl backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-center">
                <div className="rounded-full bg-red-500/20 p-4">
                  <SchoolIcon className="h-12 w-12 text-red-400" />
                </div>
              </div>
              <h1 className="font-orbitron mb-4 text-3xl font-bold text-white">
                School Not Found
              </h1>
              <p className="font-rajdhani text-lg text-gray-400">
                The school you&apos;re looking for doesn&apos;t exist or may
                have been removed.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  // Handle case where school data is null
  if (!school) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-gray-600/20 blur-xl" />
            <Card className="relative border-gray-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 shadow-2xl backdrop-blur-sm">
              <div className="mb-6 flex items-center justify-center">
                <div className="rounded-full bg-gray-500/20 p-4">
                  <SchoolIcon className="h-12 w-12 text-gray-400" />
                </div>
              </div>
              <h1 className="font-orbitron mb-4 text-3xl font-bold text-white">
                No School Data
              </h1>
              <p className="font-rajdhani text-lg text-gray-400">
                Unable to load school information at this time.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/10 to-gray-900"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Enhanced Header with Banner */}
      <motion.div
        className="relative h-64 overflow-hidden"
        variants={itemVariants}
      >
        {/* Banner Background */}
        <div className="absolute inset-0">
          {school.banner ? (
            /* Use uploaded banner image when available */
            <div
              className="h-full w-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${school.banner})` }}
            />
          ) : (
            /* Fallback to gradient background when no banner is set */
            <div className="h-full w-full bg-gradient-to-r from-cyan-900/30 via-blue-900/40 to-cyan-900/30" />
          )}
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/30" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 container mx-auto flex h-full max-w-6xl items-end px-4 pb-6">
          <div className="flex w-full flex-col items-start gap-4 md:flex-row md:items-end">
            {/* School Logo and Basic Info - Inline Layout */}
            <motion.div
              className="flex flex-col items-center gap-4 md:flex-row md:items-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={school.logo}
                  alt={school.name}
                  width={250}
                  height={250}
                  className="h-26 w-26 rounded-lg border-2 border-cyan-400/20 bg-gray-900/50 object-contain p-2 shadow-xl backdrop-blur-sm"
                />
              </motion.div>
              <div className="text-center md:text-left">
                <motion.h1
                  className="font-orbitron mb-2 text-3xl font-bold text-white drop-shadow-lg md:text-4xl"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {school.name}
                </motion.h1>
                <motion.div
                  className="mb-3 flex flex-col items-center gap-3 md:flex-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="flex items-center gap-2 text-cyan-300">
                    <MapPin className="h-4 w-4" />
                    <span className="font-rajdhani">{school.location}</span>
                  </div>
                  {school.region && (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Globe className="h-4 w-4" />
                      <span className="font-rajdhani">
                        {getReadableRegion(school.region)} Region
                      </span>
                    </div>
                  )}
                  {school.country && (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Globe className="h-4 w-4" />
                      <span className="font-rajdhani">
                        {school.country}{" "}
                        {school.country_iso2 === "US" ? "🇺🇸" : "🌍"}
                      </span>
                    </div>
                  )}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="font-rajdhani text-sm text-gray-300"
                >
                  {getSchoolTypeDescription(school.type)}
                </motion.div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col gap-2 md:ml-auto"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                onClick={handleShareProfile}
                className="font-orbitron bg-cyan-600 text-white shadow-lg hover:bg-cyan-700"
              >
                <Share2Icon className="mr-2 h-4 w-4" />
                Share School Profile
              </Button>
              {school.website && (
                <div className="space-y-1">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-cyan-400 text-cyan-400 shadow-lg hover:bg-cyan-400 hover:text-gray-900"
                  >
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Official Website
                    </a>
                  </Button>
                  <div className="font-rajdhani text-center text-xs break-all text-cyan-300">
                    {school.website}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Unclaimed School Profile Banner
            Show if:
            - School has no coaches (unclaimed), AND
            - User is NOT signed in as a player, AND
            - User is NOT a coach who already has a school
            
            Hide for:
            - Players (they don't need to see this)
            - Coaches who already have a school association
        */}
        {school.coaches.length === 0 &&
          !(isSignedIn && isPlayer) &&
          !coachHasSchool && (
            <motion.div
              className="relative"
              variants={itemVariants}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="border-green-500/30 bg-gradient-to-r from-green-900/40 via-emerald-900/40 to-green-900/40 shadow-lg">
                <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500/20 p-2">
                      <HandshakeIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-orbitron text-lg font-semibold text-white">
                        This School Profile is Unclaimed
                      </h3>
                      <p className="font-rajdhani text-sm text-gray-300">
                        {coachHasPendingRequest
                          ? "You already have a pending school association request. Please wait for admin review."
                          : `Are you a coach at ${school.name}? Claim this profile to manage tryouts, announcements, and recruit players.`}
                      </p>
                    </div>
                  </div>

                  {/* Different button states based on user status */}
                  {coachHasPendingRequest ? (
                    // Coach has a pending request - show disabled button
                    <Button
                      disabled
                      className="font-orbitron shrink-0 bg-gray-600 text-gray-300"
                    >
                      <Loader2 className="mr-2 h-4 w-4" />
                      Request Pending
                    </Button>
                  ) : isSignedIn && coachCanClaim ? (
                    // Signed in as coach who can claim - show dialog
                    <Dialog
                      open={isClaimDialogOpen}
                      onOpenChange={setIsClaimDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="font-orbitron shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700">
                          <HandshakeIcon className="mr-2 h-4 w-4" />
                          Claim This Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-gray-800 bg-gray-900 text-white">
                        <DialogHeader>
                          <DialogTitle className="font-orbitron">
                            Claim School Profile
                          </DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Submit a request to be associated with {school.name}
                            . An admin will review your request.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="school-name"
                              className="text-gray-300"
                            >
                              School
                            </Label>
                            <Input
                              id="school-name"
                              value={school.name}
                              disabled
                              className="border-gray-700 bg-gray-800 text-gray-400"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="claim-message"
                              className="text-gray-300"
                            >
                              Message (optional)
                            </Label>
                            <Textarea
                              id="claim-message"
                              placeholder="Tell us about your role at this school..."
                              value={claimMessage}
                              onChange={(e) => setClaimMessage(e.target.value)}
                              className="border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsClaimDialogOpen(false)}
                            className="border-gray-700 text-gray-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              submitAssociationRequest.mutate({
                                school_id: school.id,
                                request_message: claimMessage || undefined,
                              });
                            }}
                            disabled={submitAssociationRequest.isPending}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            {submitAssociationRequest.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              "Submit Request"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : !isSignedIn ? (
                    // Not signed in - redirect to coach sign-up, then back to this page
                    <Button
                      asChild
                      className="font-orbitron shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700"
                    >
                      <a
                        href={`/sign-up/schools?redirect_url=${encodeURIComponent(`/profiles/school/${school.id}`)}`}
                      >
                        <HandshakeIcon className="mr-2 h-4 w-4" />
                        Sign Up as Coach
                      </a>
                    </Button>
                  ) : (
                    // Signed in but not a coach - redirect to coach sign-up, then back to this page
                    <Button
                      asChild
                      className="font-orbitron shrink-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:from-green-600 hover:to-emerald-700"
                    >
                      <a
                        href={`/sign-up/schools?redirect_url=${encodeURIComponent(`/profiles/school/${school.id}`)}`}
                      >
                        <HandshakeIcon className="mr-2 h-4 w-4" />
                        Become a Coach
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

        {/* Merged School Information and About Section */}
        <motion.div className="relative" variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-cyan-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-lg">
              <CardHeader>
                <CardTitle className="font-orbitron flex items-center gap-2 text-xl text-white">
                  <div className="rounded-lg bg-cyan-500/20 p-1.5">
                    <BuildingIcon className="h-5 w-5 text-cyan-400" />
                  </div>
                  About Our Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bio */}
                {school.bio && (
                  <motion.p
                    className="font-rajdhani leading-relaxed text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    {school.bio}
                  </motion.p>
                )}

                {/* Compact Information Grid */}
                <div className="grid grid-cols-1 gap-4 border-t border-gray-700/50 pt-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Contact Information */}
                  {primaryContact && (
                    <motion.div
                      className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-cyan-400" />
                        <span className="font-rajdhani text-xs font-medium text-gray-400">
                          Primary Contact:
                        </span>
                      </div>
                      <a
                        href={`mailto:${primaryContact}`}
                        className="font-rajdhani text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        {primaryContact}
                      </a>
                    </motion.div>
                  )}
                  {school.phone && (
                    <motion.div
                      className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-cyan-400" />
                        <span className="font-rajdhani text-xs font-medium text-gray-400">
                          Phone:
                        </span>
                      </div>
                      <a
                        href={`tel:${school.phone}`}
                        className="font-rajdhani text-sm text-cyan-400 transition-colors hover:text-cyan-300"
                      >
                        {school.phone}
                      </a>
                    </motion.div>
                  )}
                  <motion.div
                    className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Users className="h-4 w-4 text-cyan-400" />
                      <span className="font-rajdhani text-xs font-medium text-gray-400">
                        Active Coaches:
                      </span>
                    </div>
                    <span className="font-rajdhani text-sm font-bold text-cyan-400">
                      {school.coaches.length}
                    </span>
                  </motion.div>
                  <motion.div
                    className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <GraduationCapIcon className="h-4 w-4 text-cyan-400" />
                      <span className="font-rajdhani text-xs font-medium text-gray-400">
                        Institution Type:
                      </span>
                    </div>
                    <span className="font-rajdhani text-sm text-gray-300">
                      {getSchoolTypeDescription(school.type)}
                    </span>
                  </motion.div>
                </div>

                {/* Social Media Links */}
                {(school.social_links ?? school.discord_handle) && (
                  <div className="mt-4 border-t border-gray-700/50 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquareIcon className="h-4 w-4 text-cyan-400" />
                      <span className="font-rajdhani text-sm font-medium text-gray-400">
                        Connect With Us:{" "}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {school.social_links?.facebook && (
                        <a
                          href={school.social_links.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-gray-700/30 bg-gray-800/30 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
                        >
                          <Facebook className="h-4 w-4" />
                          Facebook
                        </a>
                      )}
                      {school.social_links?.twitter && (
                        <a
                          href={school.social_links.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-gray-700/30 bg-gray-800/30 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400"
                        >
                          <Twitter className="h-4 w-4" />
                          Twitter
                        </a>
                      )}
                      {school.social_links?.instagram && (
                        <a
                          href={school.social_links.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-gray-700/30 bg-gray-800/30 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400"
                        >
                          <Instagram className="h-4 w-4" />
                          Instagram
                        </a>
                      )}
                      {school.social_links?.youtube && (
                        <a
                          href={school.social_links.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-gray-700/30 bg-gray-800/30 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Youtube className="h-4 w-4" />
                          YouTube
                        </a>
                      )}
                      {school.social_links?.twitch && (
                        <a
                          href={school.social_links.twitch}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-lg border border-gray-700/30 bg-gray-800/30 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400"
                        >
                          <Twitch className="h-4 w-4" />
                          Twitch
                        </a>
                      )}
                      {school.discord_handle && (
                        <div className="flex items-center gap-1 rounded-lg border border-gray-700/30 bg-gray-800/30 px-3 py-1.5 text-sm text-gray-300">
                          <MessageSquareIcon className="h-4 w-4" />
                          Discord: {school.discord_handle}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tuition Information */}
                {(school.in_state_tuition ?? school.out_of_state_tuition) && (
                  <div className="mt-4 border-t border-gray-700/50 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-cyan-400" />
                      <span className="font-rajdhani text-sm font-medium text-gray-400">
                        Tuition Information:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {school.in_state_tuition && (
                        <div className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-2">
                          <span className="font-rajdhani text-xs text-gray-400">
                            In-State:
                          </span>
                          <span className="font-rajdhani ml-2 text-sm font-semibold text-cyan-400">
                            {school.in_state_tuition}
                          </span>
                        </div>
                      )}
                      {school.out_of_state_tuition && (
                        <div className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-2">
                          <span className="font-rajdhani text-xs text-gray-400">
                            Out-of-State:
                          </span>
                          <span className="font-rajdhani ml-2 text-sm font-semibold text-cyan-400">
                            {school.out_of_state_tuition}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Academic Requirements */}
                {(school.minimum_gpa ??
                  school.minimum_sat ??
                  school.minimum_act) && (
                  <div className="mt-4 border-t border-gray-700/50 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-cyan-400" />
                      <span className="font-rajdhani text-sm font-medium text-gray-400">
                        Academic Requirements:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                      {school.minimum_gpa && (
                        <div className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-2">
                          <span className="font-rajdhani text-xs text-gray-400">
                            Minimum GPA:
                          </span>
                          <span className="font-rajdhani ml-2 text-sm font-semibold text-cyan-400">
                            {school.minimum_gpa.toString()}
                          </span>
                        </div>
                      )}
                      {school.minimum_sat && (
                        <div className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-2">
                          <span className="font-rajdhani text-xs text-gray-400">
                            Minimum SAT:
                          </span>
                          <span className="font-rajdhani ml-2 text-sm font-semibold text-cyan-400">
                            {school.minimum_sat}
                          </span>
                        </div>
                      )}
                      {school.minimum_act && (
                        <div className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-2">
                          <span className="font-rajdhani text-xs text-gray-400">
                            Minimum ACT:
                          </span>
                          <span className="font-rajdhani ml-2 text-sm font-semibold text-cyan-400">
                            {school.minimum_act}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Esports Titles */}
                {school.esports_titles && school.esports_titles.length > 0 && (
                  <div className="mt-4 border-t border-gray-700/50 pt-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-cyan-400" />
                      <span className="font-rajdhani text-sm font-medium text-gray-400">
                        Esports Titles:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {school.esports_titles.map(
                        (title: string, index: number) => {
                          const logoPath = getGameLogoPath(title);
                          return (
                            <motion.div
                              key={`${title}-${index}`}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className="group relative flex items-center gap-2 rounded-lg border border-gray-700/30 bg-gray-800/30 px-3 py-2 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10"
                            >
                              <div className="rounded-full bg-cyan-400/50 p-2">
                                {logoPath ? (
                                  <div className="relative h-6 w-6 flex-shrink-0">
                                    <Image
                                      src={logoPath}
                                      alt={title}
                                      width={24}
                                      height={24}
                                      className="h-full w-full object-contain"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <Trophy className="h-6 w-6 flex-shrink-0 text-black" />
                                )}
                              </div>
                              <span className="font-rajdhani text-sm text-gray-300 group-hover:text-cyan-400">
                                {title}
                              </span>
                            </motion.div>
                          );
                        },
                      )}
                    </div>
                  </div>
                )}

                {/* Scholarship Information */}
                {school.scholarships_available && (
                  <div className="mt-4 border-t border-gray-700/50 pt-4">
                    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                      <Award className="h-5 w-5 text-green-400" />
                      <div>
                        <span className="font-rajdhani text-sm font-semibold text-green-400">
                          Scholarships Available
                        </span>
                        <p className="font-rajdhani text-xs text-gray-400">
                          This program offers esports scholarships
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Main Content Layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Enhanced Coaches Section - Left Column */}
          <motion.div
            className="relative xl:col-span-2"
            variants={itemVariants}
          >
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="border-cyan-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-lg">
                <CardContent className="p-6">
                  <CoachCarousel
                    coaches={school?.coaches || []}
                    canMessage={canMessage}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Enhanced Program Updates Panel - Right Column */}
          <motion.div className="relative" variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              initial="rest"
              whileHover="hover"
            >
              <Card className="border-blue-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-orbitron flex items-center gap-2 text-xl text-white">
                    <div className="rounded-lg bg-blue-500/20 p-1.5">
                      <GraduationCapIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    Program Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="max-h-80 space-y-3 overflow-y-auto">
                    {isLoadingAnnouncements ? (
                      // Loading skeleton
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="border-l-4 border-gray-600 py-2 pl-3"
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <Skeleton className="h-2 w-2 rounded-full" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                            <Skeleton className="mb-1 h-4 w-40" />
                            <div className="space-y-1">
                              <Skeleton className="h-3 w-full" />
                              <Skeleton className="h-3 w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : announcementsData?.announcements &&
                      announcementsData.announcements.length > 0 ? (
                      // Real announcements
                      announcementsData.announcements.map(
                        (announcement, index) => {
                          const colors = getAnnouncementColor(
                            announcement.type,
                          );
                          const [borderColor, dotColor] = colors.split(" ");

                          return (
                            <motion.div
                              key={announcement.id}
                              className={`border-l-4 ${borderColor} rounded-r-lg bg-gray-800/20 py-2 pl-3`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.3,
                              }}
                            >
                              <div className="mb-1 flex items-center gap-2">
                                <div
                                  className={`h-1.5 w-1.5 ${dotColor} rounded-full`}
                                ></div>
                                <span className="font-rajdhani text-xs text-gray-400">
                                  {formatRelativeTime(
                                    new Date(announcement.created_at),
                                  )}
                                </span>
                                {announcement.is_pinned && (
                                  <Badge
                                    variant="outline"
                                    className="border-yellow-400 px-1 py-0 text-xs text-yellow-400"
                                  >
                                    Pinned
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-orbitron mb-1 text-sm font-semibold text-white">
                                {announcement.title}
                              </h4>
                              <p className="font-rajdhani text-sm text-gray-400">
                                {announcement.content}
                              </p>
                              {announcement.author_id && (
                                <div className="font-rajdhani mt-1 text-xs text-gray-500">
                                  by Coach
                                </div>
                              )}
                            </motion.div>
                          );
                        },
                      )
                    ) : (
                      // Empty state
                      <div className="py-6 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                          <span className="text-xl">📢</span>
                        </div>
                        <p className="font-rajdhani text-sm text-gray-400">
                          No announcements yet. Check back later for program
                          updates!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* View All Button */}
                  <div className="mt-3 border-t border-gray-700 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-orbitron w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      View All Updates
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Full-Width Tryouts Panel */}
        <motion.div className="relative" variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-orange-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-orbitron flex items-center gap-2 text-xl text-white">
                    <div className="rounded-lg bg-orange-500/20 p-1.5">
                      <Trophy className="h-5 w-5 text-orange-400" />
                    </div>
                    Program Tryouts
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className="border-orange-400/50 bg-orange-400/10 text-orange-400 backdrop-blur-sm"
                  >
                    {tryoutCounts.all} Total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tryout Filters */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* Status Filter Tabs */}
                  <div className="flex space-x-1 rounded border border-gray-700/30 bg-black/20 p-1 backdrop-blur-sm">
                    <button
                      onClick={() => setTryoutFilter("all")}
                      className={`font-orbitron rounded px-3 py-1.5 text-sm transition-all duration-300 ${
                        tryoutFilter === "all"
                          ? "border border-orange-500/30 bg-orange-600/80 text-white shadow-lg shadow-orange-500/20 backdrop-blur-sm"
                          : "text-gray-400 hover:bg-gray-700/30 hover:text-white"
                      }`}
                    >
                      All ({tryoutCounts.all})
                    </button>
                    <button
                      onClick={() => setTryoutFilter("upcoming")}
                      className={`font-orbitron rounded px-3 py-1.5 text-sm transition-all duration-300 ${
                        tryoutFilter === "upcoming"
                          ? "border border-orange-500/30 bg-orange-600/80 text-white shadow-lg shadow-orange-500/20 backdrop-blur-sm"
                          : "text-gray-400 hover:bg-gray-700/30 hover:text-white"
                      }`}
                    >
                      Upcoming ({tryoutCounts.upcoming})
                    </button>
                    <button
                      onClick={() => setTryoutFilter("past")}
                      className={`font-orbitron rounded px-3 py-1.5 text-sm transition-all duration-300 ${
                        tryoutFilter === "past"
                          ? "border border-orange-500/30 bg-orange-600/80 text-white shadow-lg shadow-orange-500/20 backdrop-blur-sm"
                          : "text-gray-400 hover:bg-gray-700/30 hover:text-white"
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
                      className="font-rajdhani rounded border border-gray-700/30 bg-black/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm transition-all duration-300 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/50"
                    >
                      <option value="all">All Games</option>
                      {availableGames.map((game) => (
                        <option key={game.id} value={game.id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Tryouts Grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {isLoadingTryouts ? (
                    <>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Card
                          key={i}
                          className="border-gray-700/50 bg-[#1a1a2e]/80 shadow-xl backdrop-blur-sm"
                        >
                          <CardContent className="space-y-3 p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-1 items-center gap-3">
                                <Skeleton className="h-8 w-8" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-3 w-full" />
                                </div>
                              </div>
                              <Skeleton className="h-4 w-12" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-3 w-16" />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-4" />
                                  <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-4" />
                                  <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-4 w-20" />
                              </div>
                              <div className="flex items-center justify-between border-t border-gray-700 pt-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <Skeleton className="h-8 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  ) : tryoutsError ? (
                    <div className="col-span-full py-12 text-center">
                      <Trophy className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                      <p className="font-rajdhani text-red-400">
                        Error loading tryouts. Please try again later.
                      </p>
                    </div>
                  ) : filteredTryouts.length === 0 ? (
                    <div className="col-span-full py-12 text-center">
                      <Trophy className="mx-auto mb-3 h-12 w-12 text-gray-600" />
                      <p className="font-rajdhani text-gray-400">
                        {tryoutFilter === "upcoming"
                          ? "No upcoming tryouts"
                          : tryoutFilter === "past"
                            ? "No past tryouts"
                            : "No tryouts found"}
                      </p>
                    </div>
                  ) : (
                    filteredTryouts.map((tryout, index) => {
                      const isUpcoming = new Date(tryout.date) > new Date();
                      const spotsLeft =
                        tryout.max_spots - (tryout._count?.registrations ?? 0);

                      return (
                        <motion.div
                          key={tryout.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          variants={cardHoverVariants}
                          whileHover="hover"
                        >
                          <Card className="flex h-full flex-col border-gray-700/50 bg-[#1a1a2e]/80 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-orange-400/50 hover:shadow-2xl">
                            <CardContent className="flex flex-1 flex-col p-4">
                              {/* Header */}
                              <div className="mb-3 flex items-start justify-between">
                                <div className="flex flex-1 items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center">
                                    {gameLogos[tryout.game.name] ? (
                                      <Image
                                        src={gameLogos[tryout.game.name]!}
                                        alt={tryout.game.name}
                                        width={40}
                                        height={40}
                                        className="h-full w-full object-contain"
                                      />
                                    ) : (
                                      <div className="text-2xl">🎮</div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <h4 className="font-orbitron line-clamp-2 text-sm leading-tight font-semibold break-words text-white">
                                      {tryout.title}
                                    </h4>
                                    <p className="font-rajdhani mt-1 line-clamp-2 text-xs leading-tight break-words text-gray-400">
                                      {tryout.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {isUpcoming &&
                                    spotsLeft <= 5 &&
                                    spotsLeft > 0 && (
                                      <Badge
                                        variant="outline"
                                        className="border-yellow-400/50 bg-yellow-400/10 text-xs text-yellow-400 backdrop-blur-sm"
                                      >
                                        {spotsLeft} left
                                      </Badge>
                                    )}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="mb-4 flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="h-3 w-3 text-gray-400" />
                                  <span className="font-rajdhani text-xs text-gray-300">
                                    {formatDate(tryout.date)}
                                  </span>
                                  {tryout.time_start && (
                                    <>
                                      <Clock className="ml-2 h-3 w-3 text-gray-400" />
                                      <span className="font-rajdhani text-xs text-gray-300">
                                        {formatTime(
                                          tryout.time_start,
                                          tryout.time_end,
                                        )}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="font-rajdhani text-xs text-gray-300">
                                      {tryout.location}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`border-0 text-xs text-white backdrop-blur-sm ${getTypeColor(tryout.type)}/80`}
                                  >
                                    {getReadableTypeName(tryout.type)}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    <span className="font-rajdhani text-xs text-gray-300">
                                      {tryout._count?.registrations ?? 0}/
                                      {tryout.max_spots} registered
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`border-0 text-xs text-white backdrop-blur-sm ${getGameColor(tryout.game.name)}/80`}
                                  >
                                    {getReadableGameName(
                                      tryout.game.short_name ??
                                        tryout.game.name,
                                    )}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-700 pt-2 text-sm">
                                  <span className="font-rajdhani text-xs text-gray-400">
                                    Price:{" "}
                                    <span className="text-orange-400">
                                      {tryout.price}
                                    </span>
                                  </span>
                                  {tryout.organizer && (
                                    <span className="font-rajdhani text-xs text-gray-400">
                                      by {tryout.organizer.first_name}{" "}
                                      {tryout.organizer.last_name}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action */}
                              <div className="mt-auto">
                                <Button
                                  asChild
                                  size="sm"
                                  className="font-orbitron w-full bg-orange-600 text-white shadow-lg hover:bg-orange-700"
                                >
                                  <a
                                    href={`/tryouts/college/${tryout.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2"
                                  >
                                    View Details
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
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
                      className="font-orbitron border-orange-400/50 bg-black/20 text-orange-400 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-orange-400/70 hover:bg-orange-400/10 hover:text-orange-300"
                    >
                      <a
                        href="/tryouts/college"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        View All Tryouts
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Program Contact Section - Full Width */}
        <motion.div className="relative" variants={itemVariants}>
          <motion.div
            variants={cardHoverVariants}
            initial="rest"
            whileHover="hover"
          >
            <Card className="border-cyan-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-lg">
              <CardContent className="p-6">
                <div className="rounded-lg border border-cyan-700/30 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-6">
                  <motion.h3
                    className="font-orbitron mb-3 flex items-center gap-2 text-xl font-semibold text-white"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <div className="rounded-lg bg-cyan-500/20 p-1.5">
                      <Mail className="h-5 w-5 text-cyan-400" />
                    </div>
                    Interested in Joining Our Program?
                  </motion.h3>
                  <motion.p
                    className="font-rajdhani mb-4 leading-relaxed text-gray-300"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    Reach out to our coaching staff to learn more about tryouts,
                    team opportunities, and our esports program.
                  </motion.p>
                  <motion.div
                    className="flex flex-col gap-3 sm:flex-row"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    <Button
                      asChild
                      className="font-orbitron bg-cyan-600 text-white shadow-lg hover:bg-cyan-700"
                    >
                      <a
                        href={`mailto:${primaryContact}?subject=Interest in Esports Program`}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Primary Coach
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="border-cyan-400 text-cyan-400 shadow-lg hover:bg-cyan-400 hover:text-gray-900"
                    >
                      <a
                        href={`mailto:${school.email}?subject=General Program Inquiry`}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        General Inquiry
                      </a>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
