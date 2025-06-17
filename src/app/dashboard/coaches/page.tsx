"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UsersIcon, 
  TrophyIcon, 
  MessageSquareIcon, 
  SearchIcon,
  PlusIcon,
  EyeIcon,
  AlertCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  BuildingIcon
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { getOnboardingMessage, canAccessCoachFeatures } from "@/lib/permissions";
import { SchoolAssociationRequestForm } from "./_components/SchoolAssociationRequestForm";

export default function CoachesDashboard() {
  const { user } = useUser();
  
  // Get coach onboarding status
  const { data: onboardingStatus, isLoading: isLoadingStatus } = api.coachProfile.getOnboardingStatus.useQuery();
  
  // Get school info to show current requests
  const { data: schoolInfo, isLoading: isLoadingSchool } = api.coachProfile.getSchoolInfo.useQuery();
  
  const isLoading = isLoadingStatus || isLoadingSchool;
  const canAccess = onboardingStatus ? canAccessCoachFeatures(onboardingStatus) : false;

  const quickActions = [
    {
      title: "Search Players",
      description: "Find and scout talented players",
      icon: SearchIcon,
      href: "/dashboard/coaches/player-search",
      color: "bg-blue-600 hover:bg-blue-700",
      requiresOnboarding: true
    },
    {
      title: "Create Tryout",
      description: "Organize a new tryout event",
      icon: PlusIcon,
      href: "/dashboard/coaches/tryouts",
      color: "bg-green-600 hover:bg-green-700",
      requiresOnboarding: true
    },
    {
      title: "View Profile",
      description: "Manage your coach profile",
      icon: EyeIcon,
      href: "/dashboard/coaches/profile",
      color: "bg-purple-600 hover:bg-purple-700",
      requiresOnboarding: false
    },
  ];

  const stats = [
    {
      title: "My Prospects",
      value: canAccess ? "12" : "—",
      icon: UsersIcon,
      description: canAccess ? "Players you're tracking" : "Available after onboarding"
    },
    {
      title: "Active Tryouts",
      value: canAccess ? "3" : "—",
      icon: TrophyIcon,
      description: canAccess ? "Ongoing recruitment events" : "Available after onboarding"
    },
    {
      title: "Unread Messages",
      value: canAccess ? "7" : "—",
      icon: MessageSquareIcon,
      description: canAccess ? "New player inquiries" : "Available after onboarding"
    },
  ];

  if (isLoading) {
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

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-orbitron font-bold mb-2">
          Welcome back, Coach {user?.firstName}!
        </h1>
        <p className="text-cyan-100 font-rajdhani text-lg">
          {canAccess 
            ? "Manage your recruitment pipeline and discover the next generation of esports talent."
            : "Complete your onboarding to start recruiting talented esports players."
          }
        </p>
      </div>

      {/* Onboarding Status Card */}
      {!canAccess && onboardingStatus && (
        <Card className="bg-gray-900 border-yellow-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-yellow-400 font-orbitron flex items-center gap-2">
              {onboardingStatus.hasPendingRequest ? (
                <>
                  <ClockIcon className="h-5 w-5" />
                  School Association Pending
                </>
              ) : onboardingStatus.canRequestAssociation ? (
                <>
                  <AlertCircleIcon className="h-5 w-5" />
                  Onboarding Required
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
              {getOnboardingMessage(onboardingStatus)}
            </p>
            
                         {onboardingStatus.hasPendingRequest && schoolInfo?.school_requests && schoolInfo.school_requests.length > 0 && (
               <div className="bg-gray-800 rounded-lg p-4 mb-4">
                 <h4 className="text-white font-orbitron font-semibold mb-2 flex items-center gap-2">
                   <BuildingIcon className="h-4 w-4" />
                   Pending Request
                 </h4>
                 <div className="text-sm text-gray-300">
                   <p className="mb-1">
                     <span className="font-medium">School:</span> {schoolInfo.school_requests[0]!.school.name}
                   </p>
                   <p className="mb-1">
                     <span className="font-medium">Type:</span> {schoolInfo.school_requests[0]!.school.type.replace('_', ' ')}
                   </p>
                   <p className="mb-1">
                     <span className="font-medium">Location:</span> {schoolInfo.school_requests[0]!.school.location}, {schoolInfo.school_requests[0]!.school.state}
                   </p>
                   <p>
                     <span className="font-medium">Submitted:</span> {new Date(schoolInfo.school_requests[0]!.requested_at).toLocaleDateString()}
                   </p>
                 </div>
               </div>
             )}
            
            {onboardingStatus.canRequestAssociation && (
              <SchoolAssociationRequestForm />
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`bg-gray-900 border-gray-800 ${!canAccess ? 'opacity-60' : ''}`}>
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
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            const isDisabled = action.requiresOnboarding && !canAccess;
            
            return (
              <Card key={action.title} className={`bg-gray-900 border-gray-800 hover:border-cyan-400 transition-colors ${isDisabled ? 'opacity-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${action.color} ${isDisabled ? 'opacity-50' : ''}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-rajdhani mb-4">
                        {isDisabled ? "Complete onboarding to access" : action.description}
                      </p>
                      {isDisabled ? (
                        <Button 
                          disabled 
                          className="bg-gray-600 text-gray-400 font-orbitron cursor-not-allowed"
                        >
                          Requires Onboarding
                        </Button>
                      ) : (
                        <Link href={action.href}>
                          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
                            Get Started
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
          Recent Activity
        </h2>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-orbitron">
              Latest Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canAccess ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white font-rajdhani">
                      New player application received for VALORANT tryout
                    </p>
                    <p className="text-gray-400 text-sm">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white font-rajdhani">
                      Player profile updated: Alex Chen
                    </p>
                    <p className="text-gray-400 text-sm">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white font-rajdhani">
                      Tryout reminder: Overwatch 2 tryout starts tomorrow
                    </p>
                    <p className="text-gray-400 text-sm">1 day ago</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircleIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-rajdhani">
                  Complete your onboarding to view recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 