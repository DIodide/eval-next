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
  Building2Icon
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
    { enabled: isOnboarded }
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Please sign in to continue.</div>
      </div>
    );
  }

  // Show onboarding if not yet associated with a league
  if (!isOnboarded) {
    return (
      <>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-orbitron font-bold text-white mb-4">
              Welcome to League Administration
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              To get started, you need to associate with an existing league or request to create a new one.
            </p>
          </div>

          {/* Onboarding Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#1a1a2e] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BuildingIcon className="h-5 w-5 text-purple-400" />
                  Existing League
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  If your league already exists in our system, request association to manage it.
                </p>
                <Button
                  onClick={() => setShowAssociationForm(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Associate with League
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#1a1a2e] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PlusIcon className="h-5 w-5 text-green-400" />
                  New League
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">
                  Don&apos;t see your league? Request to create a new league on our platform.
                </p>
                <Button
                  onClick={() => setShowAssociationForm(true)}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  Create New League
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status Card */}
          <Card className="bg-[#1a1a2e] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircleIcon className="h-5 w-5 text-yellow-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <p className="text-gray-400">
                    Association with a league is required to access league management features
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  <p className="text-gray-400">
                    Once approved, you&apos;ll be able to manage players, teams, and league information
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
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
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <LeagueAssociationRequestForm onClose={() => setShowAssociationForm(false)} />
            </div>
          </div>
        )}
      </>
    );
  }

  // Main dashboard for onboarded league admins
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            League Dashboard
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your league, teams, and player information
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {leagueProfile?.league_ref && (
            <Link href={`/profiles/leagues/${leagueProfile.league_ref.id}`}>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
                <EyeIcon className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Players
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">
              Active league participants
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Teams
            </CardTitle>
            <TrophyIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">
              Registered teams
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              League Status
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Active</div>
            <p className="text-xs text-gray-400">
              Current season status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/leagues/players">
          <Card className="bg-[#1a1a2e] border-gray-800 hover:border-purple-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-purple-400" />
                Manage Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                View, edit, and manage all players participating in your league.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/teams">
          <Card className="bg-[#1a1a2e] border-gray-800 hover:border-purple-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrophyIcon className="h-5 w-5 text-purple-400" />
                Manage Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Organize teams, manage rosters, and track performance.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/schools">
          <Card className="bg-[#1a1a2e] border-gray-800 hover:border-purple-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2Icon className="h-5 w-5 text-purple-400" />
                Manage Schools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Add schools to your league and manage their participation.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/rankings">
          <Card className="bg-[#1a1a2e] border-gray-800 hover:border-purple-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3Icon className="h-5 w-5 text-purple-400" />
                Manage Rankings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Track player performance, team standings, and leaderboards.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/leagues/profile">
          <Card className="bg-[#1a1a2e] border-gray-800 hover:border-purple-500 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-purple-400" />
                League Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm">
                Update league information, settings, and public profile details.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="bg-[#1a1a2e] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p>No recent activity to display</p>
            <p className="text-sm">Activity will appear here as you manage your league</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 