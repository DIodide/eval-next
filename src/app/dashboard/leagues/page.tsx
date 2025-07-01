"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrophyIcon, 
  UsersIcon,
  CalendarIcon,
  BuildingIcon,
  PlusIcon,
  AlertCircleIcon,
  ClockIcon,
  MegaphoneIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { LeagueAssociationRequestForm } from "./_components/LeagueAssociationRequestForm";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function LeaguesDashboard() {
  const { user } = useUser();
  
  // Get league organization info to show current requests (only for display purposes)
  const { data: leagueInfo, isLoading: isLoadingLeague } = api.leagueProfile.getLeagueInfo.useQuery();
  
  // Check if league is onboarded by looking at Clerk public metadata
  const canAccess = user?.publicMetadata?.onboarded === true && user?.publicMetadata?.userType === "league";

  // Get dashboard stats (only fetch if league has access)
  const { data: tournamentsCount = 0 } = api.tournaments.getActiveTournamentsCount.useQuery(undefined, {
    enabled: canAccess,
  });
  
  const { data: teamsCount = 0 } = api.teams.getManagedTeamsCount.useQuery(undefined, {
    enabled: canAccess,
  });
  
  const { data: matchesCount = 0 } = api.matches.getUpcomingMatchesCount.useQuery(undefined, {
    enabled: canAccess,
  });

  // State for quick actions
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);

  const quickActions = [
    {
      title: "Create Tournament",
      description: "Organize a new tournament event",
      icon: TrophyIcon,
      href: "/dashboard/leagues/tournaments/create",
      color: "from-blue-600 to-blue-700",
      requiresOnboarding: true,
      comingSoon: false
    },
    {
      title: "Manage Teams",
      description: "View and manage participating teams",
      icon: UsersIcon,
      href: "/dashboard/leagues/teams",
      color: "from-green-600 to-green-700",
      requiresOnboarding: true,
      comingSoon: false
    },
    {
      title: "View Profile",
      description: "Manage your organization profile",
      icon: BuildingIcon,
      href: "/dashboard/leagues/profile",
      color: "from-purple-600 to-purple-700",
      requiresOnboarding: false,
      comingSoon: false
    },
  ];

  const stats = [
    {
      title: "Active Tournaments",
      value: canAccess ? tournamentsCount.toString() : "—",
      icon: TrophyIcon,
      description: canAccess ? "Ongoing tournaments" : "Available after onboarding",
      href: canAccess ? "/dashboard/leagues/tournaments" : undefined,
    },
    {
      title: "Registered Teams",
      value: canAccess ? teamsCount.toString() : "—",
      icon: UsersIcon,
      description: canAccess ? "Teams in your leagues" : "Available after onboarding",
      href: canAccess ? "/dashboard/leagues/teams" : undefined,
    },
    {
      title: "Upcoming Matches",
      value: canAccess ? matchesCount.toString() : "—",
      icon: CalendarIcon,
      description: canAccess ? "Scheduled matches" : "Available after onboarding",
      href: canAccess ? "/dashboard/leagues/matches" : undefined,
    },
  ];

  if (isLoadingLeague) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-orbitron font-bold mb-2">
            Loading Dashboard...
          </h1>
        </div>
      </div>
    );
  }

  // Determine onboarding status based on Clerk metadata
  const hasPendingRequest = leagueInfo?.association_requests && leagueInfo.association_requests.length > 0 && 
                            leagueInfo.association_requests[0]!.status === 'PENDING';
  const canRequestAssociation = !canAccess && !hasPendingRequest;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-orbitron font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-cyan-100 font-rajdhani text-lg">
          {canAccess 
            ? "Manage your leagues, tournaments, and esports competitions."
            : "Complete your verification process to start managing leagues and tournaments."
          }
        </p>
      </div>

      {/* Onboarding Status Card */}
      {!canAccess && (
        <Card className="bg-gray-900 border-yellow-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-yellow-400 font-orbitron flex items-center gap-2">
              {hasPendingRequest ? (
                <>
                  <ClockIcon className="h-5 w-5" />
                  Verification Pending
                </>
              ) : canRequestAssociation ? (
                <>
                  <AlertCircleIcon className="h-5 w-5" />
                  Verification Required
                </>
              ) : (
                <>
                  <AlertCircleIcon className="h-5 w-5" />
                  Account Setup Needed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 font-rajdhani mb-4">
              {canAccess 
                ? "Your league organization account is fully activated and ready to use."
                : hasPendingRequest 
                  ? "Your league verification request is pending review by our administrators. You'll receive access once approved."
                  : canRequestAssociation
                    ? "To access league management features, you need to submit a verification request with your organization details."
                    : "Please contact support for assistance with your league organization account."
              }
            </p>
            
            {hasPendingRequest && leagueInfo?.association_requests && leagueInfo.association_requests.length > 0 && (
               <div className="bg-gray-800 rounded-lg p-4 mb-4">
                 <h4 className="text-white font-orbitron font-semibold mb-2 flex items-center gap-2">
                   <BuildingIcon className="h-4 w-4" />
                   Pending Verification
                 </h4>
                 <div className="text-sm text-gray-300">
                   <p className="mb-1">
                     <span className="font-medium">Organization:</span> {leagueInfo.association_requests[0]!.organization_name}
                   </p>
                   <p className="mb-1">
                     <span className="font-medium">Type:</span> {leagueInfo.association_requests[0]!.organization_type?.replace('_', ' ')}
                   </p>
                   <p className="mb-1">
                     <span className="font-medium">Location:</span> {leagueInfo.association_requests[0]!.organization_location}, {leagueInfo.association_requests[0]!.organization_state}
                   </p>
                   <p>
                     <span className="font-medium">Submitted:</span> {new Date(leagueInfo.association_requests[0]!.requested_at).toLocaleDateString()}
                   </p>
                 </div>
               </div>
             )}
            
            {canRequestAssociation && (
              <LeagueAssociationRequestForm />
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const StatCard = (
            <Card key={stat.title} className={`bg-gray-900 border-gray-800 ${!canAccess ? 'opacity-60' : stat.href ? 'hover:border-cyan-400 cursor-pointer' : ''} transition-colors`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-orbitron font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${canAccess ? 'text-cyan-400' : 'text-gray-600'}`} />
                </div>
              </CardContent>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.title} href={stat.href}>
              {StatCard}
            </Link>
          ) : (
            StatCard
          );
        })}
      </div>

      {/* Quick Actions Panel - Collapsible */}
      <Collapsible open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
        <Card className="bg-gray-900 border-gray-800">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-800 transition-colors">
              <CardTitle className="text-white font-orbitron flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusIcon className="w-5 h-5 text-cyan-400" />
                  Quick Actions
                </div>
                {isQuickActionsOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const isLocked = action.requiresOnboarding && !canAccess;
                  const isComingSoon = action.comingSoon;
                  
                  return (
                    <div key={action.title} className="relative">
                      <Link
                        href={isLocked || isComingSoon ? "#" : action.href}
                        className={`block ${isLocked || isComingSoon ? 'cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (isLocked || isComingSoon) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className={`bg-gradient-to-br ${action.color} p-6 rounded-lg text-white transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${isLocked || isComingSoon ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-3 mb-2">
                            {isLocked ? (
                              <AlertCircleIcon className="w-6 h-6 text-gray-200" />
                            ) : (
                              <Icon className="w-6 h-6 text-white" />
                            )}
                            <h3 className="font-orbitron font-semibold text-lg">
                              {action.title}
                            </h3>
                          </div>
                          <p className="text-sm text-white/80 font-rajdhani">
                            {isLocked ? "Available after verification" : action.description}
                          </p>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}