"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  TrophyIcon,
  EyeIcon,
  MessageCircleIcon,
  UserIcon,
  CalendarIcon,
  TrendingUpIcon,
  StarIcon,
  ArrowRightIcon,
  PlusIcon,
  TargetIcon,
  ZapIcon,
  PlayIcon,
  AwardIcon,
  CheckCircleIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { GameAnalyticsPanel } from "@/components/core/GameAnalyticsPanel";

export default function DashboardPage() {
  // Get profile data for stats
  const { data: profileData } = api.playerProfile.getProfile.useQuery();

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!profileData) return 0;

    let completion = 0;
    const weights = {
      basicInfo: 20,
      recruitingInfo: 50,
      gameConnections: 20,
      socialConnections: 10,
    };

    // Basic info
    if (profileData.location || profileData.bio) {
      completion += weights.basicInfo;
    }

    // Recruiting info
    if (
      profileData.school ||
      profileData.main_game_id ||
      profileData.gpa ||
      profileData.extra_curriculars ||
      profileData.academic_bio
    ) {
      completion += weights.recruitingInfo;
    }

    // Game connections (cap at 2 connections)
    const gameConnections =
      profileData.platform_connections?.filter((conn) => conn.connected)
        .length || 0;
    completion += Math.min(gameConnections, 2) * (weights.gameConnections / 2);

    // Social connections (cap at 1 connection)
    const socialConnections =
      profileData.social_connections?.filter((conn) => conn.connected).length ||
      0;
    completion += Math.min(socialConnections, 1) * weights.socialConnections;

    return Math.min(completion, 100);
  };

  const profileCompletion = calculateProfileCompletion();

  const quickActions = [
    {
      title: "Complete Profile",
      description: "Boost your visibility",
      href: "/dashboard/player/profile",
      icon: UserIcon,
      color: "from-blue-500 to-blue-600",
      progress: profileCompletion,
    },
    {
      title: "Browse Tryouts",
      description: "Find opportunities",
      href: "/dashboard/player/tryouts",
      icon: TargetIcon,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Join Combines",
      description: "Showcase skills",
      href: "/dashboard/player/combines",
      icon: TrophyIcon,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Check Messages",
      description: "Stay connected",
      href: "/dashboard/player/messages",
      icon: MessageCircleIcon,
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Hero Header */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-2">
                  <ZapIcon className="h-6 w-6 text-blue-400" />
                </div>
                <h1 className="font-orbitron text-4xl font-bold text-white">
                  EVAL Home
                </h1>
              </div>
              <p className="font-rajdhani mb-4 text-lg text-gray-300">
                Welcome back! Ready to dominate the esports scene?
              </p>
              <div className="flex items-center gap-4 text-sm">
                <Badge
                  variant="outline"
                  className="border-blue-400/50 text-blue-400"
                >
                  Player Dashboard
                </Badge>
                {/* <div className="flex items-center gap-1 text-gray-400">
                  <ClockIcon className="h-4 w-4" />
                  <span>Last active: Today</span>
                </div> */}
              </div>
            </div>

            {/* Quick Profile Status */}
            <div className="min-w-[250px] rounded-xl border border-gray-700/50 bg-black/30 p-4 backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-rajdhani text-sm text-gray-300">
                  Profile Strength
                </span>
                <span className="font-orbitron text-lg font-bold text-white">
                  {profileCompletion}%
                </span>
              </div>
              <div className="relative mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${profileCompletion}%` }}
                />
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
              <p className="font-rajdhani text-xs text-gray-400">
                {profileCompletion < 50
                  ? "Keep building your profile!"
                  : profileCompletion < 80
                    ? "Almost there!"
                    : "Profile looking strong!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Analytics - Moved to Top */}
      <GameAnalyticsPanel />

      {/* Enhanced Stats Grid */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Active Tryouts */}
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-600/5 p-6 shadow-xl transition-all duration-300 hover:border-blue-400/40">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-blue-500/20 p-3">
              <TargetIcon className="h-6 w-6 text-blue-400" />
            </div>
            <Badge
              variant="outline"
              className="border-blue-400/50 text-blue-400"
            >
              Active
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="font-rajdhani text-lg font-semibold text-white">
              Tryouts
            </h3>
            <p className="font-orbitron text-3xl font-bold text-blue-400">-</p>
            <p className="text-sm text-gray-400">Coming soon</p>
          </div>
        </Card>

        {/* Profile Views */}
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-600/5 p-6 shadow-xl transition-all duration-300 hover:border-green-400/40">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-green-500/20 p-3">
              <EyeIcon className="h-6 w-6 text-green-400" />
            </div>
            <TrendingUpIcon className="h-4 w-4 text-green-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-rajdhani text-lg font-semibold text-white">
              Profile Views
            </h3>
            <p className="font-orbitron text-3xl font-bold text-green-400">-</p>
            <p className="text-sm text-gray-400">Coming soon</p>
          </div>
        </Card>

        {/* Messages */}
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-purple-600/5 p-6 shadow-xl transition-all duration-300 hover:border-purple-400/40">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-purple-500/20 p-3">
              <MessageCircleIcon className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-rajdhani text-lg font-semibold text-white">
              Messages
            </h3>
            <p className="font-orbitron text-3xl font-bold text-purple-400">
              -
            </p>
            <p className="text-sm text-gray-400">Coming soon</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ZapIcon className="h-5 w-5 text-blue-400" />
          <h2 className="font-orbitron text-2xl font-bold text-white">
            Quick Actions
          </h2>
        </div>
        <div className="grid gap-0 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            let roundedClasses = "";

            // Mobile (single column):
            // First card: rounded top, Last card: rounded bottom
            if (index === 0) roundedClasses += " rounded-t-lg rounded-b-none";
            if (index === 1) roundedClasses += " rounded-t-none rounded-b-none";
            if (index === 2) roundedClasses += " rounded-t-none rounded-b-none";
            if (index === quickActions.length - 1)
              roundedClasses += " rounded-b-lg rounded-t-none";

            // Medium screens (2 columns): 2x2 grid
            // [0] [1]
            // [2] [3]
            if (index === 0)
              roundedClasses +=
                " md:rounded-tl-lg md:rounded-bl-none md:rounded-tr-none md:rounded-br-none"; // top-left only
            if (index === 1)
              roundedClasses +=
                " md:rounded-tr-lg md:rounded-tl-none md:rounded-bl-none md:rounded-br-none"; // top-right only
            if (index === 2)
              roundedClasses +=
                " md:rounded-bl-lg md:rounded-tl-none md:rounded-tr-none md:rounded-br-none"; // bottom-left only
            if (index === 3)
              roundedClasses +=
                " md:rounded-br-lg md:rounded-tl-none md:rounded-tr-none md:rounded-bl-none"; // bottom-right only

            // Large screens (4 columns): single row
            // [0] [1] [2] [3]
            if (index === 0)
              roundedClasses += " lg:rounded-l-lg lg:rounded-r-none"; // left side only
            if (index === 1 || index === 2)
              roundedClasses += " lg:rounded-none"; // middle cards: no rounding
            if (index === 3)
              roundedClasses += " lg:rounded-r-lg lg:rounded-l-none"; // right side only

            return (
              <Link key={index} href={action.href}>
                <Card
                  className={`quick-actions group h-full cursor-pointer border-gray-700/50 bg-[#1a1a2e]/80 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-gray-600/70 hover:shadow-xl ${roundedClasses}`}
                >
                  <div className="mb-3 flex items-center gap-2">
                    {/* <action.icon className="h-5 w-5 text-white" /> */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-rajdhani font-semibold text-white transition-colors group-hover:text-blue-400">
                          {action.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-400">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRightIcon className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-blue-400" />
                  </div>
                  {action.progress !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">
                          {action.progress === 0
                            ? "Fill out your profile to boost recruiting chances!"
                            : "Progress"}
                        </span>
                        <span
                          className={`${action.progress === 0 ? "text-orange-400" : "text-blue-400"}`}
                        >
                          {action.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            action.progress === 0
                              ? "bg-orange-500/50"
                              : "bg-gradient-to-r from-blue-500 to-purple-500"
                          }`}
                          style={{ width: `${Math.max(action.progress, 5)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Activity and Events Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-gray-600/30">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <PlayIcon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white">
                Recent Activity
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:border-gray-500"
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            <div className="py-8 text-center">
              <AwardIcon className="mx-auto mb-3 h-12 w-12 text-gray-500" />
              <p className="mb-4 text-gray-400">
                No recent activity to display
              </p>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:border-gray-500"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Take Action
              </Button>
            </div>
          </div>
        </Card>

        {/* Upcoming Events & Deadlines */}
        <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-gray-600/30">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/20 p-2">
                <CalendarIcon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="font-orbitron text-xl font-bold text-white">
                Upcoming Events
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:border-gray-500"
            >
              View Calendar
            </Button>
          </div>
          <div className="space-y-4">
            <div className="py-8 text-center">
              <CheckCircleIcon className="mx-auto mb-3 h-12 w-12 text-gray-500" />
              <p className="mb-4 text-gray-400">No upcoming deadlines</p>
              <p className="text-sm text-gray-500">
                You&apos;re all caught up!
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Achievement Highlights */}
      <Card className="border-purple-500/20 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/20 p-2">
              <AwardIcon className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-orbitron text-xl font-bold text-white">
              Achievement Highlights
            </h3>
          </div>
          <Link href="/dashboard/player/highlights">
            <Button
              variant="outline"
              size="sm"
              className="border-purple-400/50 text-purple-400 hover:border-purple-400 hover:bg-purple-500/10"
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-purple-500/20 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-3">
              <TrophyIcon className="h-5 w-5 text-yellow-400" />
              <span className="font-rajdhani font-semibold text-white">
                Latest Achievement
              </span>
            </div>
            <p className="text-sm text-gray-300">Reached Diamond rank</p>
            <p className="text-xs text-gray-400">VALORANT • 1 day ago</p>
          </div>
          <div className="rounded-xl border border-purple-500/20 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-3">
              <StarIcon className="h-5 w-5 text-blue-400" />
              <span className="font-rajdhani font-semibold text-white">
                Performance
              </span>
            </div>
            <p className="text-sm text-gray-300">68% win rate this season</p>
            <p className="text-xs text-gray-400">Competitive • Ranked</p>
          </div>
          <div className="rounded-xl border border-purple-500/20 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-3">
              <EyeIcon className="h-5 w-5 text-green-400" />
              <span className="font-rajdhani font-semibold text-white">
                Visibility
              </span>
            </div>
            <p className="text-sm text-gray-300">156 profile views</p>
            <p className="text-xs text-gray-400">This month • +23%</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
