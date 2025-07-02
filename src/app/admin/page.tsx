"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  MessageSquare, 
  User, 
  Trophy, 
  Users, 
  Database,
  Shield,
  Activity,
  Settings,
  School,
  UserCheck,
  ClipboardList,
  Crown,
  AlertCircle
} from "lucide-react";
import { api } from "@/trpc/react";

const adminTools = [
  {
    title: "Test Messages",
    description: "Test messaging functionality between coaches and players",
    icon: MessageSquare,
    href: "/admin/test-messages",
    color: "text-blue-500",
  },
  {
    title: "Test Player Profile",
    description: "Test player profile creation, validation, and updates",
    icon: User,
    href: "/admin/test-player-profile",
    color: "text-green-500",
  },
  {
    title: "Test Coach & School Profiles",
    description: "Test coach profile endpoints, school associations, and announcements",
    icon: UserCheck,
    href: "/admin/test-coach-profiles",
    color: "text-indigo-500",
  },
  {
    title: "Test Player Search",
    description: "Test player search and filtering functionality",
    icon: Users,
    href: "/admin/test-player-search",
    color: "text-purple-500",
  },
  {
    title: "Test Combines",
    description: "Test combine creation, registration, and management",
    icon: Trophy,
    href: "/admin/test-combines",
    color: "text-orange-500",
  },
  {
    title: "Test Tryouts",
    description: "Test tryout functionality and registration system",
    icon: Trophy,
    href: "/admin/test-tryouts",
    color: "text-red-500",
  },
  {
    title: "System Health",
    description: "Monitor database connections and API health",
    icon: Activity,
    href: "/admin/system-health",
    color: "text-cyan-500",
  },
];

export default function AdminDashboard() {
  // Fetch pending counts
  const { data: pendingSchoolRequests } = api.schoolAssociationRequests.getPendingCount.useQuery();
  const { data: pendingLeagueRequests } = api.leagueAssociationRequests.getPendingCount.useQuery();

  const totalPending = (pendingSchoolRequests ?? 0) + (pendingLeagueRequests ?? 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-2">
        <Shield className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Developer tools and system management</p>
        </div>
      </div>

      {/* Pending Actions Section */}
      {totalPending > 0 && (
        <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-600/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-white">Pending Actions Required</CardTitle>
              </div>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                {totalPending} Total
              </Badge>
            </div>
            <CardDescription className="text-gray-300">
              Review and process pending association requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/admin/school-requests">
                <Button variant="outline" className="w-full border-yellow-600/50 hover:bg-yellow-600/10">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="h-4 w-4" />
                      <span>School Requests</span>
                    </div>
                    {pendingSchoolRequests !== undefined && pendingSchoolRequests > 0 && (
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                        {pendingSchoolRequests}
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>
              <Link href="/admin/league-requests">
                <Button variant="outline" className="w-full border-yellow-600/50 hover:bg-yellow-600/10">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>League Requests</span>
                    </div>
                    {pendingLeagueRequests !== undefined && pendingLeagueRequests > 0 && (
                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                        {pendingLeagueRequests}
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.title} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className={`h-6 w-6 ${tool.color}`} />
                  <CardTitle className="text-white">{tool.title}</CardTitle>
                </div>
                <CardDescription className="text-gray-400">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={tool.href}>
                  <Button className="w-full">
                    Access Tool
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-yellow-500" />
            <CardTitle className="text-white">Database Management</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Direct access to database operations and data management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/admin/database/users">
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/database/players">
              <Button variant="outline" className="w-full">
                Manage Players
              </Button>
            </Link>
            <Link href="/admin/database/coaches">
              <Button variant="outline" className="w-full">
                Manage Coaches
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-gray-500" />
            <CardTitle className="text-white">System Settings</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Configure system-wide settings and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/settings">
            <Button variant="secondary" className="w-full">
              Open Settings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
} 