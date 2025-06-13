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
  EyeIcon
} from "lucide-react";
import Link from "next/link";

export default function CoachesDashboard() {
  const { user } = useUser();

  const quickActions = [
    {
      title: "Search Players",
      description: "Find and scout talented players",
      icon: SearchIcon,
      href: "/dashboard/coaches/player-search",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Create Tryout",
      description: "Organize a new tryout event",
      icon: PlusIcon,
      href: "/dashboard/coaches/tryouts",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Public Profile",
      description: "See how players view your profile",
      icon: EyeIcon,
      href: "/dashboard/coaches/public-profile",
      color: "bg-purple-600 hover:bg-purple-700"
    },
  ];

  const stats = [
    {
      title: "My Prospects",
      value: "12",
      icon: UsersIcon,
      description: "Players you're tracking"
    },
    {
      title: "Active Tryouts",
      value: "3",
      icon: TrophyIcon,
      description: "Ongoing recruitment events"
    },
    {
      title: "Unread Messages",
      value: "7",
      icon: MessageSquareIcon,
      description: "New player inquiries"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-orbitron font-bold mb-2">
          Welcome back, Coach {user?.firstName}!
        </h1>
        <p className="text-cyan-100 font-rajdhani text-lg">
          Manage your recruitment pipeline and discover the next generation of esports talent.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-gray-900 border-gray-800">
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
                  <Icon className="h-8 w-8 text-cyan-400" />
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
            return (
              <Card key={action.title} className="bg-gray-900 border-gray-800 hover:border-cyan-400 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${action.color}`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-rajdhani mb-4">
                        {action.description}
                      </p>
                      <Link href={action.href}>
                        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
                          Get Started
                        </Button>
                      </Link>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 