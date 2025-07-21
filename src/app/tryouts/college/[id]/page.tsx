"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  Users,
  Calendar,
  Clock,
  GraduationCap,
  Mail,
  ArrowLeft,
  LoaderIcon,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck,
  User,
  X,
  ExternalLink,
  MessageCircle,
  Building,
  Share2,
  Copy,
  DollarSign,
} from "lucide-react";
import { api } from "@/trpc/react";
import { gameIcons } from "@/app/tryouts/_components/GameCarousel";
import TryoutCard from "@/app/tryouts/_components/TryoutCard";
import type { CardTryout } from "@/app/tryouts/_components/TryoutCard";
import { toast } from "sonner";
import { formatDateTimeInLocalTimezone } from "@/lib/time-utils";

// Map database game names to UI game names
const gameNameMap: Record<string, keyof typeof gameIcons> = {
  VALORANT: "VALORANT",
  "Overwatch 2": "Overwatch 2",
  "Super Smash Bros. Ultimate": "Smash Ultimate",
  "Rocket League": "Rocket League",
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

const formatTime = (timeStart?: string | null, timeEnd?: string | null) => {
  if (!timeStart) return "Time TBA";
  if (!timeEnd) return timeStart;
  return `${timeStart} - ${timeEnd}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-600 text-white";
    case "PENDING":
      return "bg-yellow-600 text-white";
    case "WAITLISTED":
      return "bg-orange-600 text-white";
    case "DECLINED":
      return "bg-red-600 text-white";
    case "CANCELLED":
      return "bg-gray-600 text-white";
    default:
      return "bg-gray-600 text-white";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return <CheckCircle className="h-4 w-4" />;
    case "PENDING":
      return <Clock className="h-4 w-4" />;
    case "WAITLISTED":
      return <AlertCircle className="h-4 w-4" />;
    case "DECLINED":
      return <XCircle className="h-4 w-4" />;
    case "CANCELLED":
      return <XCircle className="h-4 w-4" />;
    default:
      return <UserCheck className="h-4 w-4" />;
  }
};

export default function TryoutDetailPage() {
  const { user } = useUser();
  const params = useParams();
  const tryoutId = params.id as string;

  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationNotes, setRegistrationNotes] = useState("");
  const [registrationError, setRegistrationError] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<
    "player" | "coach" | null
  >(null);

  const handleUserTypeSelect = (userType: "player" | "coach") => {
    setSelectedUserType(userType);
  };

  const handleSignUp = () => {
    if (selectedUserType) {
      setShowSignUpModal(false);
      // Reset selection after a brief delay to allow modal to close
      setTimeout(() => setSelectedUserType(null), 300);
    }
  };

  const resetAndCloseModal = () => {
    setSelectedUserType(null);
    setShowSignUpModal(false);
  };

  // Fetch tryout details
  const {
    data: tryout,
    isLoading: isLoadingTryout,
    error: tryoutError,
    refetch: refetchTryout,
  } = api.tryouts.getById.useQuery(
    { id: tryoutId },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 3,
    },
  );

  // Check if user is already registered
  const { data: playerRegistrations, refetch: refetchPlayerRegistrations } =
    api.tryouts.getPlayerRegistrations.useQuery(
      { status: "all", limit: 100 },
      {
        enabled: !!user,
        staleTime: 1 * 60 * 1000, // 1 minute
      },
    );

  // Fetch related tryouts from the same game
  const { data: relatedTryoutsResponse } = api.tryouts.browse.useQuery(
    {
      game_id: tryout?.game.id,
      upcoming_only: true,
      limit: 10,
      offset: 0,
    },
    {
      enabled: !!tryout?.game.id,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  );

  // Register for tryout mutation
  const registerMutation = api.tryouts.register.useMutation({
    onSuccess: () => {
      void refetchTryout();
      void refetchPlayerRegistrations(); // This will update the registration status
      setRegistrationDialogOpen(false);
      setRegistrationNotes("");
      setRegistrationError("");
      toast.success("Registration successful", {
        description: "You are now registered for this tryout",
      });
    },
    onError: (error) => {
      toast.error("Registration failed", {
        description: error.message,
      });
      console.error("Registration failed:", error);
      setRegistrationError(error.message);
    },
  });

  // Cancel registration mutation
  const cancelRegistrationMutation = api.tryouts.cancelRegistration.useMutation(
    {
      onSuccess: () => {
        void refetchTryout();
        void refetchPlayerRegistrations();
        setCancelDialogOpen(false);
      },
      onError: (error) => {
        console.error("Cancel registration failed:", error);
        setRegistrationError(error.message);
      },
    },
  );

  // Check if already registered
  const existingRegistration = playerRegistrations?.find(
    (reg) => reg.tryout.id === tryoutId,
  );

  const handleRegister = () => {
    setRegistrationError("");
    registerMutation.mutate({
      tryout_id: tryoutId,
      notes: registrationNotes || undefined,
    });
  };

  const handleCancelRegistration = () => {
    if (existingRegistration) {
      cancelRegistrationMutation.mutate({
        registration_id: existingRegistration.id,
      });
    }
  };

  // Check if user can cancel registration
  const canCancelRegistration =
    existingRegistration &&
    ["PENDING", "WAITLISTED", "CONFIRMED"].includes(
      existingRegistration.status,
    );

  // Transform related tryouts to card format, excluding current tryout
  const relatedTryouts: CardTryout[] =
    relatedTryoutsResponse?.tryouts
      ?.filter((relatedTryout) => relatedTryout.id !== tryoutId)
      ?.map((apiTryout) => ({
        id: apiTryout.id,
        title: apiTryout.title,
        description: apiTryout.description,
        game:
          gameNameMap[apiTryout.game.name] ??
          (apiTryout.game.name as keyof typeof gameIcons),
        school: apiTryout.school.name,
        date: formatDate(apiTryout.date),
        time: formatTime(apiTryout.time_start, apiTryout.time_end),
        type: apiTryout.type,
        price: apiTryout.price === "Free" ? "Free" : apiTryout.price,
        spots: `${apiTryout.max_spots - apiTryout.registered_spots} spots left`,
        totalSpots: `${apiTryout.max_spots} total`,
        organizer: apiTryout.organizer
          ? `${apiTryout.organizer.first_name} ${apiTryout.organizer.last_name}`
          : "TBA",
      })) ?? [];

  if (isLoadingTryout) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="glass-morphism rounded-2xl border-white/20 p-8 text-center">
              <LoaderIcon className="mx-auto mb-4 h-8 w-8 animate-spin text-cyan-400" />
              <span className="font-rajdhani text-lg text-white">
                Loading tryout details...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tryoutError || !tryout) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center justify-center py-32">
            <div className="glass-morphism max-w-md rounded-2xl border-white/20 p-8 text-center">
              <XCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
              <h1 className="font-orbitron mb-4 text-2xl font-bold text-white">
                Tryout Not Found
              </h1>
              <p className="mb-8 text-gray-400">
                The tryout you&apos;re looking for doesn&apos;t exist or has
                been removed.
              </p>
              <Link href="/tryouts/college">
                <Button className="font-orbitron bg-cyan-400 text-black hover:bg-cyan-500">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Tryouts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const gameName = gameNameMap[tryout.game.name] ?? "VALORANT";
  const spotsLeft = tryout.max_spots - tryout.registered_spots;
  const isPastTryout = new Date(tryout.date) < new Date();
  const isDeadlinePassed =
    tryout.registration_deadline &&
    new Date(tryout.registration_deadline) < new Date();
  const canRegister =
    !isPastTryout &&
    !isDeadlinePassed &&
    spotsLeft > 0 &&
    !existingRegistration &&
    user;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-cyan-500/30 via-purple-500/30 to-orange-500/30">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Floating Accent Elements */}
      <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-cyan-400/10 blur-xl" />
      <div className="absolute top-40 right-20 h-24 w-24 rounded-full bg-purple-400/10 blur-xl" />
      <div className="absolute bottom-20 left-1/4 h-40 w-40 rounded-full bg-orange-400/10 blur-xl" />

      <div className="relative container mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Compact Header with Rainbow Divider */}
        <div className="mb-12 text-center">
          <Link
            href="/tryouts/college"
            className="mb-6 inline-flex items-center text-gray-400 transition-colors hover:text-cyan-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="font-rajdhani">Back to Tryouts</span>
          </Link>

          <h1 className="font-orbitron mb-4 text-4xl font-black tracking-wider text-white sm:text-5xl">
            TRYOUT DETAILS
          </h1>

          {/* Compact Rainbow Divider */}
          <div className="mb-6 flex items-center justify-center">
            <div className="to-eval-cyan h-0.5 w-12 bg-gradient-to-r from-transparent"></div>
            <div className="from-eval-cyan to-eval-purple h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-purple to-eval-orange h-0.5 w-8 bg-gradient-to-r"></div>
            <div className="from-eval-orange h-0.5 w-12 bg-gradient-to-r to-transparent"></div>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-8">
          {/* Header Card */}
          <Card className="glass-morphism border-white/20 transition-all duration-300 hover:border-cyan-400/30">
            <CardContent className="p-8">
              {/* Tryout Header */}
              <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="mb-4 flex items-center space-x-6 lg:mb-0">
                  <div className="glass-morphism flex h-20 w-20 items-center justify-center rounded-full border-white/20 shadow-lg">
                    <Image
                      src={gameIcons[gameName]}
                      alt={tryout.game.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="font-orbitron cyber-text mb-2 text-3xl font-black text-white lg:text-4xl">
                      {tryout.title}
                    </h1>
                    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                      <p className="font-rajdhani text-xl font-semibold text-gray-300">
                        {tryout.school.name}
                      </p>
                      <div className="hidden h-1 w-1 rounded-full bg-gray-500 sm:block"></div>
                      <p className="font-rajdhani text-gray-400">
                        {tryout.school.location}, {tryout.school.state}
                      </p>
                      <div className="hidden h-1 w-1 rounded-full bg-gray-500 sm:block"></div>
                      <p className="font-rajdhani text-gray-400">
                        {tryout.school.type}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <div className="flex cursor-pointer items-center">
                  <button
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(window.location.href)
                        .then(() => {
                          toast.success("Link copied!", {
                            description:
                              "Tryout link has been copied to your clipboard",
                          });
                        })
                        .catch(() => {
                          toast.error("Failed to copy link", {
                            description:
                              "Please try again or copy the URL manually",
                          });
                        });
                    }}
                    className="glass-morphism group flex transform items-center space-x-2 rounded-lg border-white/20 px-4 py-2 text-cyan-400 transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:text-cyan-300"
                  >
                    <Share2 className="h-4 w-4 cursor-pointer transition-transform group-hover:scale-110" />
                    <span className="cursor-pointer font-medium">Share</span>
                  </button>
                </div>
              </div>

              {/* Critical Information Grid */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Date & Time */}
                <div className="glass-morphism rounded-lg border-white/10 p-4 transition-all duration-300 hover:border-cyan-400/30">
                  <div className="mb-2 flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    <span className="font-orbitron text-sm font-semibold text-cyan-400">
                      WHEN
                    </span>
                  </div>
                  <p className="mb-1 text-lg font-semibold text-white">
                    {formatDate(tryout.date)}
                  </p>
                  <p className="font-medium text-gray-300">
                    {formatDateTimeInLocalTimezone(
                      tryout.date,
                      tryout.time_start,
                      tryout.time_end,
                      { showDate: false, showTime: true, showTimezone: true },
                    )}
                  </p>
                  {tryout.registration_deadline && (
                    <div className="mt-2 border-t border-white/10 pt-2">
                      <p className="text-sm font-medium text-orange-400">
                        Registration closes:{" "}
                        {formatDate(tryout.registration_deadline)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Location & Format */}
                <div className="glass-morphism rounded-lg border-white/10 p-4 transition-all duration-300 hover:border-purple-400/30">
                  <div className="mb-2 flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    <span className="font-orbitron text-sm font-semibold text-purple-400">
                      WHERE
                    </span>
                  </div>
                  <p className="mb-1 text-lg font-semibold text-white">
                    {tryout.type}
                  </p>
                  <p className="font-medium text-gray-300">{tryout.location}</p>
                  <p className="text-sm text-gray-400">
                    {tryout.school.location}, {tryout.school.state}
                  </p>
                </div>
              </div>

              {/* Tryout Summary */}
              <div className="glass-morphism mb-6 rounded-lg border-white/10 p-6">
                <h3 className="font-orbitron mb-3 text-lg font-semibold text-white">
                  ABOUT THIS TRYOUT
                </h3>
                <p className="font-rajdhani mb-4 text-lg leading-relaxed text-gray-300">
                  {tryout.description}
                </p>
                {tryout.long_description &&
                  tryout.long_description !== tryout.description && (
                    <div className="border-t border-white/10 pt-4">
                      <p className="font-rajdhani leading-relaxed text-gray-400">
                        {tryout.long_description}
                      </p>
                    </div>
                  )}

                {/* Organizer Information and School Actions */}
                {tryout.organizer && (
                  <div className="space-y-4 border-t border-white/10 pt-4">
                    {/* Organizer Info */}
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-gray-400">
                          Organized by
                        </span>
                        <span className="font-medium text-white">
                          {tryout.organizer.first_name}{" "}
                          {tryout.organizer.last_name}
                        </span>
                      </div>
                      {tryout.organizer.email && (
                        <div className="flex items-center space-x-2 pl-6">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-300">
                            {tryout.organizer.email}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* School Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {/* View School Profile */}
                      <Link
                        href={`/profiles/school/${tryout.school.id}`}
                        className="glass-morphism group flex transform items-center justify-center space-x-2 rounded-lg border-white/20 px-4 py-2 text-cyan-400 transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:text-cyan-300"
                      >
                        <Building className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="font-medium">View School Profile</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>

                      {/* Message Coach */}
                      {user && (
                        <button
                          onClick={() => {
                            // For now, we'll show a toast indicating this feature is coming soon
                            // In the future, this would open a messaging dialog or navigate to messages
                            toast.info("Feature coming soon", {
                              description:
                                "Direct messaging will be available in a future update",
                            });
                          }}
                          className="glass-morphism group flex transform items-center justify-center space-x-2 rounded-lg border-white/20 px-4 py-2 text-purple-400 transition-all duration-300 hover:scale-105 hover:border-purple-400/50 hover:text-purple-300"
                        >
                          <MessageCircle className="h-4 w-4 transition-transform group-hover:scale-110" />
                          <span className="font-medium">Message Coach</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements & Registration Progress */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Requirements */}
                <div className="glass-morphism rounded-lg border-white/10 p-6">
                  <h3 className="font-orbitron mb-4 text-lg font-semibold text-orange-400">
                    REQUIREMENTS
                  </h3>
                  <div className="space-y-3">
                    {/* Price */}
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 flex-shrink-0 text-orange-400" />
                      <div>
                        <span className="font-medium text-white">
                          Registration Fee:{" "}
                        </span>
                        <span
                          className={`font-semibold ${
                            tryout.price === "Free" ||
                            tryout.price === "$0" ||
                            tryout.price === "0"
                              ? "text-green-400"
                              : "text-gray-300"
                          }`}
                        >
                          {tryout.price === "Free" ||
                          tryout.price === "$0" ||
                          tryout.price === "0"
                            ? "FREE"
                            : tryout.price}
                        </span>
                      </div>
                    </div>

                    {tryout.min_gpa && (
                      <div className="flex items-center space-x-3">
                        <GraduationCap className="h-4 w-4 flex-shrink-0 text-orange-400" />
                        <div>
                          <span className="font-medium text-white">
                            Minimum GPA:{" "}
                          </span>
                          <span className="text-gray-300">
                            {tryout.min_gpa.toString()}
                          </span>
                        </div>
                      </div>
                    )}
                    {tryout.class_years.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 flex-shrink-0 text-orange-400" />
                        <div>
                          <span className="font-medium text-white">
                            Eligible Class Years:{" "}
                          </span>
                          <span className="text-gray-300">
                            {tryout.class_years.join(", ")}
                          </span>
                        </div>
                      </div>
                    )}
                    {tryout.required_roles.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 flex-shrink-0 text-orange-400" />
                        <div>
                          <span className="font-medium text-white">
                            Required Roles:{" "}
                          </span>
                          <span className="text-gray-300">
                            {tryout.required_roles.join(", ")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Progress */}
                <div className="glass-morphism rounded-lg border-white/10 p-6">
                  <h3 className="font-orbitron mb-4 text-lg font-semibold text-purple-400">
                    REGISTRATION STATUS
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-300">
                        Registered Players
                      </span>
                      <span className="font-semibold text-white">
                        {tryout.registered_spots}/{tryout.max_spots}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-700/50">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          spotsLeft > 5
                            ? "bg-green-500"
                            : spotsLeft > 0
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${(tryout.registered_spots / tryout.max_spots) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={`font-medium ${
                          spotsLeft > 5
                            ? "text-green-400"
                            : spotsLeft > 0
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {spotsLeft > 0
                          ? `${spotsLeft} spots remaining`
                          : "Tryout is full"}
                      </span>
                      <span className="text-gray-400">
                        {Math.round(
                          (tryout.registered_spots / tryout.max_spots) * 100,
                        )}
                        % filled
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Status or Button */}
              {existingRegistration ? (
                <div className="glass-morphism rounded-lg border-white/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(existingRegistration.status)}
                      <div>
                        <p className="font-medium text-white">
                          Registration Status
                        </p>
                        <Badge
                          className={getStatusColor(
                            existingRegistration.status,
                          )}
                        >
                          {existingRegistration.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Cancel Registration Button */}
                    {canCancelRegistration && (
                      <Dialog
                        open={cancelDialogOpen}
                        onOpenChange={setCancelDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-rajdhani border-red-600 bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:border-red-700 hover:bg-red-700 hover:shadow-red-500/40"
                            disabled={cancelRegistrationMutation.isPending}
                          >
                            {cancelRegistrationMutation.isPending ? (
                              <LoaderIcon className="mr-1 h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="mr-1 h-4 w-4" />
                            )}
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-morphism max-w-md border-white/20 text-white">
                          <DialogHeader>
                            <DialogTitle className="font-orbitron text-red-300">
                              Cancel Registration
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              Are you sure you want to cancel your registration
                              for {tryout.title}? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Cancel Error */}
                            {registrationError && (
                              <div className="glass-morphism rounded-lg border-red-400/30 bg-red-500/10 p-3">
                                <div className="flex items-center space-x-2">
                                  <XCircle className="h-4 w-4 flex-shrink-0 text-red-300" />
                                  <p className="text-sm text-red-300">
                                    {registrationError}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-end gap-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setCancelDialogOpen(false);
                                  setRegistrationError("");
                                }}
                                className="glass-morphism border-white/30 text-white hover:border-white/50 hover:bg-white/10"
                              >
                                Keep Registration
                              </Button>
                              <Button
                                onClick={handleCancelRegistration}
                                disabled={cancelRegistrationMutation.isPending}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-red-700"
                              >
                                {cancelRegistrationMutation.isPending ? (
                                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
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
                    <div className="glass-morphism rounded-lg border-red-400/30 bg-red-500/10 p-4">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
                        <p className="text-sm text-red-400">
                          {registrationError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-4">
                    {canRegister ? (
                      <Dialog
                        open={registrationDialogOpen}
                        onOpenChange={setRegistrationDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            className="font-orbitron transform bg-gradient-to-r from-cyan-500 to-cyan-600 px-8 py-3 text-lg text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-cyan-700 hover:shadow-cyan-500/40"
                            size="lg"
                          >
                            REGISTER NOW
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-morphism max-w-md border-white/20 text-white">
                          <DialogHeader>
                            <DialogTitle className="font-orbitron">
                              Register for Tryout
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                              You&apos;re about to register for {tryout.title}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Registration Error in Dialog */}
                            {registrationError && (
                              <div className="glass-morphism rounded-lg border-red-400/30 bg-red-500/10 p-3">
                                <div className="flex items-center space-x-2">
                                  <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                                  <p className="text-sm text-red-400">
                                    {registrationError}
                                  </p>
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
                                onChange={(e) =>
                                  setRegistrationNotes(e.target.value)
                                }
                                className="glass-morphism border-white/20 text-white placeholder-gray-400 focus:border-cyan-400/50"
                                placeholder="Tell the organizer anything they should know..."
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end gap-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setRegistrationDialogOpen(false);
                                  setRegistrationError("");
                                }}
                                className="glass-morphism border-white/30 text-white hover:border-white/50 hover:bg-white/10"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleRegister}
                                disabled={registerMutation.isPending}
                                className="bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25 hover:from-cyan-600 hover:to-cyan-700"
                              >
                                {registerMutation.isPending ? (
                                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Confirm Registration
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="space-y-3">
                        {!user ? (
                          <Button
                            onClick={() => setShowSignUpModal(true)}
                            className="font-orbitron transform bg-gradient-to-r from-purple-500 to-purple-600 px-8 py-3 text-lg text-white shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-500/40"
                            size="lg"
                          >
                            <UserCheck className="mr-2 h-5 w-5" />
                            SIGN IN TO REGISTER
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="font-orbitron cursor-not-allowed bg-gray-600 px-8 py-3 text-lg text-gray-300"
                            size="lg"
                          >
                            {isPastTryout ? (
                              <>
                                <XCircle className="mr-2 h-5 w-5" />
                                TRYOUT ENDED
                              </>
                            ) : isDeadlinePassed ? (
                              <>
                                <Clock className="mr-2 h-5 w-5" />
                                REGISTRATION CLOSED
                              </>
                            ) : spotsLeft <= 0 ? (
                              <>
                                <XCircle className="mr-2 h-5 w-5" />
                                TRYOUT FULL
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-5 w-5" />
                                UNAVAILABLE
                              </>
                            )}
                          </Button>
                        )}

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
        </div>

        {/* More Tryouts Section */}
        {relatedTryouts.length > 0 && (
          <div className="mt-16">
            <div className="glass-morphism rounded-2xl border-white/20 p-8">
              <div className="mb-8 text-center">
                <h2 className="font-orbitron mb-2 text-2xl font-bold text-white sm:text-3xl">
                  More {tryout.game.name} Tryouts
                </h2>
                <p className="font-rajdhani text-lg text-gray-400">
                  Discover other {tryout.game.name} tryouts happening soon
                </p>
              </div>

              {/* Horizontal Scrollable Cards */}
              <div className="relative">
                <div className="scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent flex space-x-6 overflow-x-auto pb-4">
                  {relatedTryouts.map((relatedTryout) => (
                    <div key={relatedTryout.id} className="flex-shrink-0">
                      <TryoutCard tryout={relatedTryout} />
                    </div>
                  ))}
                </div>
              </div>

              {/* View All Button */}
              <div className="mt-8 text-center">
                <Link
                  href={`/tryouts/college?game=${encodeURIComponent(tryout.game.name)}`}
                >
                  <Button className="font-orbitron transform bg-gradient-to-r from-cyan-500 to-purple-500 px-8 py-3 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-cyan-600 hover:to-purple-600 hover:shadow-xl">
                    View All {tryout.game.name} Tryouts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sign Up Modal */}
      <Dialog open={showSignUpModal} onOpenChange={resetAndCloseModal}>
        <DialogContent className="glass-morphism border-white/20 text-white sm:max-w-lg">
          <DialogHeader className="relative">
            <DialogTitle className="mb-4 text-2xl font-bold text-white">
              SIGN UP
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-bold text-white">
                CHOOSE YOUR ACCOUNT TYPE
              </h2>
              <p className="text-sm text-slate-300">
                Empowering students and college coaches to connect.
              </p>
            </div>

            {/* Horizontal Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Player Option */}
              <button
                onClick={() => handleUserTypeSelect("player")}
                className={`rounded-lg border-2 p-6 text-center transition-all ${
                  selectedUserType === "player"
                    ? "border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      selectedUserType === "player"
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-500 bg-slate-700/50"
                    }`}
                  >
                    <User
                      className={`h-6 w-6 ${
                        selectedUserType === "player"
                          ? "text-blue-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-white">PLAYER</h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      I am a player looking to find an esports scholarship and
                      related opportunities.
                    </p>
                  </div>
                </div>
              </button>

              {/* College Option */}
              <button
                onClick={() => handleUserTypeSelect("coach")}
                className={`rounded-lg border-2 p-6 text-center transition-all ${
                  selectedUserType === "coach"
                    ? "border-blue-400 bg-blue-900/50 shadow-lg shadow-blue-500/20"
                    : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                      selectedUserType === "coach"
                        ? "border-blue-400 bg-blue-500/20"
                        : "border-slate-500 bg-slate-700/50"
                    }`}
                  >
                    <GraduationCap
                      className={`h-6 w-6 ${
                        selectedUserType === "coach"
                          ? "text-blue-400"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="mb-2 font-bold text-white">SCHOOL</h3>
                    <p className="text-xs leading-relaxed text-slate-300">
                      I am a coach, director or administrator looking to make
                      finding players easier.
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
                  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white shadow-lg hover:bg-blue-700"
                >
                  SIGN UP AS{" "}
                  {selectedUserType === "coach"
                    ? "SCHOOL"
                    : selectedUserType.toUpperCase()}
                </Button>
              </SignUpButton>
            ) : (
              <Button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-slate-700 py-3 font-medium text-slate-500"
              >
                SIGN UP
              </Button>
            )}

            {/* Sign In Link */}
            <div className="text-center">
              <SignInButton mode="modal">
                <button
                  onClick={resetAndCloseModal}
                  className="text-sm text-blue-400 transition-colors hover:text-blue-300"
                >
                  Already have an account? Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
