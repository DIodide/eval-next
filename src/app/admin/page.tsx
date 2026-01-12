"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  UserCheck,
  ClipboardList,
  Crown,
  AlertCircle,
  Download,
  School,
  Loader2,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

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
    description:
      "Test coach profile endpoints, school associations, and announcements",
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
  const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);

  // Fetch pending counts
  const { data: pendingSchoolRequests } =
    api.schoolAssociationRequests.getPendingCount.useQuery();
  const { data: pendingLeagueRequests } =
    api.leagueAssociationRequests.getPendingCount.useQuery();
  const { data: pendingLeagueSchoolCreationRequests } =
    api.leagueSchoolCreationRequests.getPendingCount.useQuery();

  // Fetch unclaimed colleges count
  const { data: unclaimedCollegesData } =
    api.adminDirectory.getUnclaimedColleges.useQuery({
      limit: 1,
      offset: 0,
    });

  // CSV generation query (only fetch when download is triggered)
  const csvQuery = api.adminDirectory.getUnclaimedCollegesCSV.useQuery(
    {
      baseUrl:
        typeof window !== "undefined" ? window.location.origin : "https://evalgaming.com",
    },
    {
      enabled: false, // Only fetch manually
    },
  );

  const totalPending =
    (pendingSchoolRequests ?? 0) +
    (pendingLeagueRequests ?? 0) +
    (pendingLeagueSchoolCreationRequests ?? 0);

  const handleDownloadCSV = async () => {
    setIsDownloadingCSV(true);
    try {
      const result = await csvQuery.refetch();
      
      if (!result.data?.data || result.data.data.length === 0) {
        toast.error("No unclaimed colleges found");
        return;
      }

      // Generate CSV content
      const headers = [
        "School Name",
        "School Type",
        "Location",
        "State",
        "Region",
        "Country",
        "Website",
        "Profile URL",
        "Claim Link",
      ];

      const rows = result.data.data.map((school) => [
        `"${school.schoolName.replace(/"/g, '""')}"`,
        school.schoolType,
        `"${school.location.replace(/"/g, '""')}"`,
        school.state,
        school.region,
        school.country,
        school.website,
        school.profileUrl,
        school.claimLink,
      ]);

      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join(
        "\n",
      );

      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `unclaimed-colleges-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${result.data.data.length} unclaimed college profiles`);
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Failed to download CSV");
    } finally {
      setIsDownloadingCSV(false);
    }
  };

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
        <Card className="border-yellow-600/50 bg-gradient-to-r from-yellow-900/20 to-orange-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
                <CardTitle className="text-white">
                  Pending Actions Required
                </CardTitle>
              </div>
              <Badge
                variant="outline"
                className="border-yellow-500 bg-yellow-500/20 text-yellow-400"
              >
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
                <Button
                  variant="outline"
                  className="w-full border-yellow-600/50 hover:bg-yellow-600/10"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ClipboardList className="h-4 w-4" />
                      <span>School Requests</span>
                    </div>
                    {(pendingSchoolRequests ?? 0) +
                      (pendingLeagueSchoolCreationRequests ?? 0) >
                      0 && (
                      <Badge
                        variant="outline"
                        className="border-yellow-500 bg-yellow-500/20 text-yellow-400"
                      >
                        {(pendingSchoolRequests ?? 0) +
                          (pendingLeagueSchoolCreationRequests ?? 0)}
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>
              <Link href="/admin/league-requests">
                <Button
                  variant="outline"
                  className="w-full border-yellow-600/50 hover:bg-yellow-600/10"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4" />
                      <span>League Requests</span>
                    </div>
                    {pendingLeagueRequests !== undefined &&
                      pendingLeagueRequests > 0 && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500 bg-yellow-500/20 text-yellow-400"
                        >
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
            <Card
              key={tool.title}
              className="hover:bg-gray-750 border-gray-700 bg-gray-800 transition-colors"
            >
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
                  <Button className="w-full">Access Tool</Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-gray-700 bg-gray-800">
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

      {/* Unclaimed Colleges Section */}
      <Card className="border-green-600/50 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <School className="h-6 w-6 text-green-400" />
              <CardTitle className="text-white">
                Coach Recruitment Tools
              </CardTitle>
            </div>
            {unclaimedCollegesData && (
              <Badge
                variant="outline"
                className="border-green-500 bg-green-500/20 text-green-400"
              >
                {unclaimedCollegesData.total} Unclaimed
              </Badge>
            )}
          </div>
          <CardDescription className="text-gray-300">
            Download CSV of unclaimed college profiles with claim links for coach outreach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-green-500/20 bg-green-900/20 p-4">
            <p className="text-sm text-gray-300">
              Generate a CSV file containing all college and university profiles without associated coaches.
              Each row includes the school name, location, profile URL, and a unique claim link that coaches
              can use to sign up and request association with their school.
            </p>
          </div>
          <Button
            onClick={handleDownloadCSV}
            disabled={isDownloadingCSV}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
          >
            {isDownloadingCSV ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating CSV...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Unclaimed Colleges CSV
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-gray-700 bg-gray-800">
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
