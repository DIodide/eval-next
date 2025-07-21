"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UsersIcon,
  TrophyIcon,
  SettingsIcon,
  AlertCircleIcon,
  ClockIcon,
  BuildingIcon,
  PlusIcon,
  EyeIcon,
  BarChart3Icon,
  Building2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LeagueAssociationRequestForm } from "./_components/LeagueAssociationRequestForm";
import { isLeagueAdminOnboarded } from "@/lib/client/permissions";
import { api } from "@/trpc/react";

export default function LeagueDashboardPage() {
  const { user, isLoaded } = useUser();
  const [showAssociationForm, setShowAssociationForm] = useState(false);

  // Fetch league admin profile data (only if onboarded)
  const isOnboarded = isLoaded && user ? isLeagueAdminOnboarded(user) : false;
  const { data: leagueProfile } = api.leagueAdminProfile.getProfile.useQuery(
    undefined,
    { enabled: isOnboarded },
  );

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-white">Please sign in to continue.</div>
      </div>
    );
  }

  // Show onboarding if not yet associated with a league
  if (!isOnboarded) {
    return (
      <>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center">
            <h1 className="font-orbitron mb-4 text-3xl font-bold text-white">
              Welcome to League Administration
            </h1>
            <p className="mb-8 text-lg text-gray-400">
              To get started, you need to associate with an existing league or
              request to create a new one.
            </p>
          </div>

          {/* Onboarding Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-gray-800 bg-[#1a1a2e]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <BuildingIcon className="h-5 w-5 text-purple-400" />
                  Existing League
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-400">
                  If your league already exists in our system, request
                  association to manage it.
                </p>
                <Button
                  onClick={() => setShowAssociationForm(true)}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700"
                >
                  Associate with League
                </Button>
              </CardContent>
            </Card>

            <Card className="border-gray-800 bg-[#1a1a2e]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <PlusIcon className="h-5 w-5 text-green-400" />
                  New League
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-400">
                  Don&apos;t see your league? Request to create a new league on
                  our platform.
                </p>
                <Button
                  onClick={() => setShowAssociationForm(true)}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Create New League
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Card */}
          <Card className="border-gray-800 bg-[#1a1a2e]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertCircleIcon className="h-5 w-5 text-yellow-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                  <p className="text-gray-400">
                    Association with a league is required to access league
                    management features
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  <p className="text-gray-400">
                    Once approved, you&apos;ll be able to manage players, teams,
                    and league information
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-gray-600"></div>
                  <p className="text-gray-400">
                    Your league will have a public profile page for visibility
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal Overlay for Association Form */}
        {showAssociationForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
              <LeagueAssociationRequestForm
                onClose={() => setShowAssociationForm(false)}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Main dashboard for onboarded league admins
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            League Dashboard
          </h1>
          <p className="mt-2 text-gray-400">
            Manage your league, teams, and player information
          </p>
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0">
          {leagueProfile?.league_ref && (
            <Link href={`/profiles/leagues/${leagueProfile.league_ref.id}`}>
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                View Public Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Players
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">Active league participants</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Teams
            </CardTitle>
            <TrophyIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">Registered teams</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              League Status
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Active</div>
            <p className="text-xs text-gray-400">Current season status</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/leagues/players">
          <Card className="cursor-pointer border-gray-800 bg-[#1a1a2e] transition-colors hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <UsersIcon className="h-5 w-5 text-purple-400" />
                Manage Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                View, edit, and manage all players participating in your league.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/teams">
          <Card className="cursor-pointer border-gray-800 bg-[#1a1a2e] transition-colors hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrophyIcon className="h-5 w-5 text-purple-400" />
                Manage Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Organize teams, manage rosters, and track performance.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/schools">
          <Card className="cursor-pointer border-gray-800 bg-[#1a1a2e] transition-colors hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Building2Icon className="h-5 w-5 text-purple-400" />
                Manage Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Add schools to your league and manage their participation.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/rankings">
          <Card className="cursor-pointer border-gray-800 bg-[#1a1a2e] transition-colors hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3Icon className="h-5 w-5 text-purple-400" />
                Manage Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Track player performance, team standings, and leaderboards.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/profile">
          <Card className="cursor-pointer border-gray-800 bg-[#1a1a2e] transition-colors hover:border-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <SettingsIcon className="h-5 w-5 text-purple-400" />
                League Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">
                Update league information, settings, and public profile details.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="border-gray-800 bg-[#1a1a2e]">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-400">
            <ClockIcon className="mx-auto mb-4 h-12 w-12 text-gray-600" />
            <p>No recent activity to display</p>
            <p className="text-sm">
              Activity will appear here as you manage your league
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
