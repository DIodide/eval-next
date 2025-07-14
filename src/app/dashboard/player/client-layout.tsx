"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  HomeIcon, 
  UserIcon, 
  TrophyIcon, 
  PlayIcon, 
  MessageSquareIcon,
  MenuIcon,
  XIcon,
  UsersIcon,
  ShieldCheckIcon,
  ZapIcon,
  LinkIcon,
  ExternalLinkIcon
} from "lucide-react";

export default function PlayerDashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  // Generate sidebar items dynamically to include username-dependent links
  const sidebarItems = [
    {
      title: "EVAL Home",
      href: "/dashboard/player",
      icon: HomeIcon,
    },
    {
      title: "Profile",
      href: "/dashboard/player/profile",
      icon: UserIcon,
      subItems: [
        {
          title: "External Accounts",
          href: "/dashboard/player/profile/external-accounts",
          icon: LinkIcon,
        },
        ...(user?.username ? [{
          title: "Public Profile",
          href: `/profiles/player/${user.username}`,
          icon: ExternalLinkIcon,
        }] : [])
      ]
    },
    {
      title: "My Tryouts",
      href: "/dashboard/player/tryouts",
      icon: TrophyIcon,
    },
    {
      title: "My Combines",
      href: "/dashboard/player/combines",
      icon: ZapIcon,
    },
    {
      title: "My Highlights",
      href: "/dashboard/player/highlights",
      icon: PlayIcon,
    },
    {
      title: "Messages",
      href: "/dashboard/player/messages",
      icon: MessageSquareIcon,
      },
    // {
    //   title: "Memberships",
    //   href: "/dashboard/player/memberships",
    //   icon: ShieldCheckIcon,
    // },
  ];

  // Check if user is a player
  if (isLoaded && user) {
    const userType = user.unsafeMetadata?.userType;
    if (userType !== "player") {
      redirect("/dashboard");
    }
  }

  // Show loading state while checking user
  if (!isLoaded) {
    return (
      <div className="flex max-h-[calc(100vh-80px)] bg-[#0f0f1a]">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-[#1a1a2e] border-r border-gray-800">
          <div className="flex flex-col h-full">
            {/* Sidebar header skeleton */}
            <div className="p-6 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>

            {/* Navigation skeleton */}
            <nav className="flex-1 p-4">
              <ul className="space-y-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <li key={i}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
                      <div className="p-2 rounded-lg">
                        <Skeleton className="h-4 w-4" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                    {/* Occasionally show sub-items */}
                    {i === 1 && (
                      <ul className="ml-6 mt-2 space-y-1 border-l border-gray-700/50 pl-4">
                        <li>
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </li>
                        <li>
                          <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </li>
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <Separator className="bg-gray-800/50" />

            {/* Footer skeleton */}
            <div className="p-4 space-y-3">
              <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg p-3 border border-gray-700/30">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <div className="flex items-center gap-1">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-3 w-32 mx-auto" />
            </div>
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header skeleton */}
          <div className="lg:hidden bg-[#1a1a2e] border-b border-gray-800 p-4">
            <Skeleton className="h-6 w-6" />
          </div>

          {/* Page content skeleton */}
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              {/* Page header skeleton */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-96" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Content cards skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main content area */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <Skeleton className="h-6 w-40 mb-4" />
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional content blocks */}
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Skeleton className="w-8 h-8 rounded" />
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-24" />
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sidebar content */}
                <div className="space-y-6">
                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-800 rounded-lg">
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-5 w-full mb-2" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                    <Skeleton className="h-6 w-28 mb-4" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom section skeleton */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 bg-gray-800 rounded-lg">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2 mb-3" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-h-[calc(100vh-80px)] bg-[#0f0f1a]">
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a2e] border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-white" />
              </div>
            <div>
                <h2 className="text-lg font-orbitron font-bold text-white">
                  Player Hub
              </h2>
                <p className="text-xs text-gray-400 font-rajdhani">
                {user?.firstName} {user?.lastName}
              </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white hover:bg-gray-800/50"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isProfileSection = item.href === '/dashboard/player/profile';
                const hasActiveSubItem = hasSubItems && item.subItems.some(subItem => pathname === subItem.href);
                
                return (
                  <li key={item.href}>
                    {/* Main navigation item */}
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                        isActive || hasActiveSubItem
                          ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10"
                          : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:border hover:border-gray-600/30"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      {/* Active indicator */}
                      {(isActive || hasActiveSubItem) && (
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full" />
                      )}
                      
                      {/* Icon with enhanced styling */}
                      <div className={cn(
                        "p-2 rounded-lg transition-all duration-200",
                        isActive || hasActiveSubItem
                          ? "bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400"
                          : "text-gray-400 group-hover:text-white group-hover:bg-gray-700/30"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <span className="font-rajdhani font-medium">{item.title}</span>
                      
                      {/* Subtle glow effect for active items */}
                      {(isActive || hasActiveSubItem) && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-xl" />
                      )}
                    </Link>

                    {/* Sub-items with improved styling */}
                    {hasSubItems && (isProfileSection || hasActiveSubItem) && (
                      <ul className="ml-6 mt-2 space-y-1 border-l border-gray-700/50 pl-4">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = pathname === subItem.href;
                          
                          return (
                            <li key={subItem.href}>
                              <Link
                                href={subItem.href}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                                  isSubActive
                                    ? "bg-gradient-to-r from-blue-500/15 to-purple-500/15 text-blue-400 border border-blue-500/20"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800/30"
                                )}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <div className={cn(
                                  "p-1 rounded transition-all duration-200",
                                  isSubActive
                                    ? "text-blue-400"
                                    : "text-gray-500 group-hover:text-gray-300"
                                )}>
                                  <SubIcon className="h-3 w-3" />
                                </div>
                                <span className="font-rajdhani text-xs">{subItem.title}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <Separator className="bg-gray-800/50" />

          {/* Enhanced Footer */}
          <div className="p-4 space-y-3">
            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 rounded-lg p-3 border border-gray-700/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-rajdhani">Profile Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-rajdhani font-medium">Active</span>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <p className="text-xs text-gray-500 text-center font-rajdhani">
              © 2024 EVAL Gaming
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-[#1a1a2e] border-b border-gray-800 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 