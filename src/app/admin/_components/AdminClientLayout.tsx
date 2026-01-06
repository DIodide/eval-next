"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  Activity,
  ArrowLeft,
  ClipboardList,
  Crown,
  FolderOpen,
  Gamepad2,
  Home,
  MenuIcon,
  MessageSquare,
  Settings,
  Shield,
  Trophy,
  User,
  Users,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const adminRoutes = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Directory",
    href: "/admin/directory",
    icon: FolderOpen,
  },
  {
    title: "Management",
    href: "/admin/management",
    icon: Settings,
  },
  {
    title: "Manage Combines",
    href: "/admin/combines",
    icon: Trophy,
  },
  {
    title: "System Health",
    href: "/admin/system-health",
    icon: Activity,
  },
  {
    title: "School Requests",
    href: "/admin/school-requests",
    icon: ClipboardList,
  },
  {
    title: "League Requests",
    href: "/admin/league-requests",
    icon: Crown,
  },
  {
    title: "Admin Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const testRoutes = [
  {
    title: "Test Messages",
    href: "/admin/test-messages",
    icon: MessageSquare,
  },
  {
    title: "Test Player Profile",
    href: "/admin/test-player-profile",
    icon: User,
  },
  {
    title: "Test Player Search",
    href: "/admin/test-player-search",
    icon: Users,
  },
  {
    title: "Test Combines",
    href: "/admin/test-combines",
    icon: Trophy,
  },
  {
    title: "Test Tryouts",
    href: "/admin/test-tryouts",
    icon: Trophy,
  },
  {
    title: "Test Riot OAuth",
    href: "/admin/test-riot-oauth",
    icon: Gamepad2,
  },
];

export function AdminClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f1a]">
        <div className="font-rajdhani text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-[#0f0f1a]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-800 bg-[#1a1a2e] transition-transform duration-200 ease-in-out lg:static lg:inset-0 lg:min-h-full lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full min-h-full flex-col lg:min-h-[calc(100vh-80px)]">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-gray-800/50 bg-gradient-to-r from-red-600/10 to-orange-600/10 p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-orbitron text-lg font-bold text-white">
                  Admin Portal
                </h2>
                <p className="font-rajdhani text-xs text-gray-400">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-gray-800/50 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* Main Routes */}
            <div className="mb-4">
              <p className="font-rajdhani mb-2 px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Main
              </p>
              <ul className="space-y-1">
                {adminRoutes.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "border border-red-500/30 bg-gradient-to-r from-red-600/20 to-orange-600/20 text-white shadow-lg shadow-red-500/10"
                            : "text-gray-300 hover:border hover:border-gray-600/30 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute top-0 left-0 h-full w-1 rounded-r-full bg-gradient-to-b from-red-400 to-orange-500" />
                        )}

                        {/* Icon with enhanced styling */}
                        <div
                          className={cn(
                            "rounded-lg p-2 transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-400"
                              : "text-gray-400 group-hover:bg-gray-700/30 group-hover:text-white",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="font-rajdhani font-medium">
                          {item.title}
                        </span>

                        {/* Subtle glow effect for active items */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/5 to-orange-600/5" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Test Routes */}
            <div className="mb-4">
              <p className="font-rajdhani mb-2 px-4 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                Testing
              </p>
              <ul className="space-y-1">
                {testRoutes.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "border border-red-500/30 bg-gradient-to-r from-red-600/20 to-orange-600/20 text-white shadow-lg shadow-red-500/10"
                            : "text-gray-300 hover:border hover:border-gray-600/30 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute top-0 left-0 h-full w-1 rounded-r-full bg-gradient-to-b from-red-400 to-orange-500" />
                        )}

                        {/* Icon with enhanced styling */}
                        <div
                          className={cn(
                            "rounded-lg p-2 transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-400"
                              : "text-gray-400 group-hover:bg-gray-700/30 group-hover:text-white",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="font-rajdhani font-medium">
                          {item.title}
                        </span>

                        {/* Subtle glow effect for active items */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600/5 to-orange-600/5" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <Separator className="bg-gray-800/50" />

          {/* Footer */}
          <div className="space-y-3 p-4">
            {/* Back to Dashboard Button */}
            <Link href="/dashboard" className="block">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-700/50 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>

            {/* Admin Status */}
            <div className="rounded-lg border border-gray-700/30 bg-gradient-to-r from-gray-800/50 to-gray-700/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-rajdhani text-gray-400">
                  Admin Status
                </span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                  <span className="font-rajdhani font-medium text-green-400">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="font-rajdhani text-center text-xs text-gray-500">
              © 2024 EVAL Gaming
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar for mobile */}
        <div className="border-b border-gray-800 bg-[#1a1a2e] p-4 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="mr-2 h-5 w-5" />
            Menu
          </Button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
