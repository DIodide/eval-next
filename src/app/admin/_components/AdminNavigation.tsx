"use client";

import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Crown,
  FolderOpen,
  Gamepad2,
  Home,
  MessageSquare,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const adminRoutes = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/admin/directory",
    label: "Directory",
    icon: FolderOpen,
  },
  {
    href: "/admin/management",
    label: "Management",
    icon: Settings,
  },
  {
    href: "/admin/test-messages",
    label: "Test Messages",
    icon: MessageSquare,
  },
  {
    href: "/admin/test-player-profile",
    label: "Test Player Profile",
    icon: User,
  },
  {
    href: "/admin/test-player-search",
    label: "Test Player Search",
    icon: Users,
  },
  {
    href: "/admin/test-combines",
    label: "Test Combines",
    icon: Trophy,
  },
  {
    href: "/admin/test-tryouts",
    label: "Test Tryouts",
    icon: Trophy,
  },
  {
    href: "/admin/test-riot-oauth",
    label: "Test Riot OAuth",
    icon: Gamepad2,
  },
  {
    href: "/admin/combines",
    label: "Manage Combines",
    icon: Trophy,
  },
  {
    href: "/admin/system-health",
    label: "System Health",
    icon: Activity,
  },
  {
    href: "/admin/school-requests",
    label: "School Requests",
    icon: ClipboardList,
  },
  {
    href: "/admin/league-requests",
    label: "League Requests",
    icon: Crown,
  },
  {
    href: "/admin/settings",
    label: "Admin Settings",
    icon: Settings,
  },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-700 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="text-lg font-bold text-white">
                Admin Dashboard
              </span>
            </div>

            <div className="ml-8 hidden items-center space-x-2 md:flex">
              {adminRoutes.map((route) => {
                const Icon = route.icon;
                const isActive = pathname === route.href;

                return (
                  <Link key={route.href} href={route.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className="text-gray-300 hover:text-white"
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {route.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="pb-4 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            {adminRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;

              return (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start text-gray-300 hover:text-white"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
