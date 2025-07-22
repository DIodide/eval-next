"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  HomeIcon,
  UserIcon,
  TrophyIcon,
  SearchIcon,
  MessageSquareIcon,
  MenuIcon,
  XIcon,
  UsersIcon,
  EyeIcon,
  LockIcon,
  GraduationCapIcon,
} from "lucide-react";
import { isCoachOnboarded } from "@/lib/client/permissions";
import { api } from "@/trpc/react";

// Define protected routes that require onboarding
const protectedRoutes = [
  "/dashboard/coaches/player-search",
  "/dashboard/coaches/prospects",
  "/dashboard/coaches/tryouts",
  "/dashboard/coaches/messages",
];

export function CoachesDashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Fetch coach profile to get school association
  const { data: profile } = api.coachProfile.getProfile.useQuery(undefined, {
    enabled: isLoaded && !!user,
  });

  // Check if user is a coach
  if (isLoaded && user) {
    const userType = user.unsafeMetadata?.userType;
    if (userType !== "coach") {
      redirect("/dashboard");
    }
  }

  // Check onboarding status and redirect if necessary
  useEffect(() => {
    if (isLoaded && user) {
      const isOnboarded = isCoachOnboarded(user);
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (!isOnboarded && isProtectedRoute) {
        router.push("/dashboard/coaches");
      }
    }
  }, [isLoaded, user, pathname, router]);

  // Show loading state while checking user
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f1a]">
        <div className="font-rajdhani text-white">Loading...</div>
      </div>
    );
  }

  const isOnboarded = user ? isCoachOnboarded(user) : false;

  // Define sidebar items with dynamic public profile link
  const sidebarItems = [
    {
      title: "EVAL Home",
      href: "/dashboard/coaches",
      icon: HomeIcon,
      requiresOnboarding: false,
      enabled: true,
    },
    {
      title: "Profile",
      href: "/dashboard/coaches/profile",
      icon: UserIcon,
      requiresOnboarding: false,
      enabled: true,
      subItems: [
        // Only show public profile link for onboarded coaches with school association
        ...(isOnboarded && profile?.school_id
          ? [
              {
                title: "School Profile",
                href: `/profiles/school/${profile.school_id}`,
                icon: EyeIcon,
                requiresOnboarding: true,
              },
            ]
          : []),
      ],
    },
    {
      title: "Player Search",
      href: "/dashboard/coaches/player-search",
      icon: SearchIcon,
      requiresOnboarding: true,
      enabled: false,
    },
    {
      title: "My Prospects",
      href: "/dashboard/coaches/prospects",
      icon: UsersIcon,
      requiresOnboarding: true,
      enabled: true,
    },
    {
      title: "My Tryouts",
      href: "/dashboard/coaches/tryouts",
      icon: TrophyIcon,
      requiresOnboarding: true,
      enabled: true,
    },
    {
      title: "Messages",
      href: "/dashboard/coaches/messages",
      icon: MessageSquareIcon,
      requiresOnboarding: true,
      enabled: true,
    },
  ];

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
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-800 bg-[#1a1a2e] transition-transform duration-200 ease-in-out lg:static lg:inset-0 lg:translate-x-0 lg:min-h-full",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full min-h-full flex-col lg:min-h-[calc(100vh-80px)]">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-gray-800/50 bg-gradient-to-r from-slate-600/10 to-blue-600/10 p-6">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-blue-600">
                <GraduationCapIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-orbitron text-lg font-bold text-white">
                  Coach Portal
                </h2>
                <p className="font-rajdhani text-xs text-gray-400">
                  {user?.firstName} {user?.lastName}
                </p>
                {!isOnboarded && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                    <LockIcon className="h-3 w-3" />
                    Pending Association
                  </p>
                )}
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
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDisabled =
                  (item.requiresOnboarding && !isOnboarded) ||
                  item.enabled === false;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const hasActiveSubItem =
                  hasSubItems &&
                  item.subItems.some((subItem) => pathname === subItem.href);

                return (
                  <li key={item.href}>
                    {/* Main navigation item */}
                    {isDisabled ? (
                      <div
                        className={cn(
                          "flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium opacity-50",
                          "text-gray-500",
                        )}
                      >
                        <div className="rounded-lg bg-gray-800/30 p-2">
                          <LockIcon className="h-4 w-4" />
                        </div>
                        <span className="font-rajdhani font-medium">
                          {item.title}
                        </span>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "group relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                          isActive || hasActiveSubItem
                            ? "border border-slate-500/30 bg-gradient-to-r from-slate-600/20 to-blue-600/20 text-white shadow-lg shadow-blue-500/10"
                            : "text-gray-300 hover:border hover:border-gray-600/30 hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:text-white",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {/* Active indicator */}
                        {(isActive || hasActiveSubItem) && (
                          <div className="absolute top-0 left-0 h-full w-1 rounded-r-full bg-gradient-to-b from-slate-400 to-blue-500" />
                        )}

                        {/* Icon with enhanced styling */}
                        <div
                          className={cn(
                            "rounded-lg p-2 transition-all duration-200",
                            isActive || hasActiveSubItem
                              ? "bg-gradient-to-br from-slate-500/20 to-blue-500/20 text-slate-400"
                              : "text-gray-400 group-hover:bg-gray-700/30 group-hover:text-white",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <span className="font-rajdhani font-medium">
                          {item.title}
                        </span>

                        {/* Subtle glow effect for active items */}
                        {(isActive || hasActiveSubItem) && (
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-slate-600/5 to-blue-600/5" />
                        )}
                      </Link>
                    )}

                    {/* Sub-items with improved styling */}
                    {hasSubItems &&
                      item.subItems &&
                      item.subItems.length > 0 &&
                      !isDisabled && (
                        <ul className="mt-2 ml-6 space-y-1 border-l border-gray-700/50 pl-4">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = pathname === subItem.href;
                            const isSubDisabled =
                              subItem.requiresOnboarding && !isOnboarded;

                            return (
                              <li key={subItem.href}>
                                {isSubDisabled ? (
                                  <div className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 opacity-50">
                                    <div className="rounded p-1">
                                      <LockIcon className="h-3 w-3" />
                                    </div>
                                    <span className="font-rajdhani text-xs">
                                      {subItem.title}
                                    </span>
                                  </div>
                                ) : (
                                  <Link
                                    href={subItem.href}
                                    className={cn(
                                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                                      isSubActive
                                        ? "border border-slate-500/20 bg-gradient-to-r from-slate-500/15 to-blue-500/15 text-slate-400"
                                        : "text-gray-400 hover:bg-gray-800/30 hover:text-white",
                                    )}
                                    onClick={() => setSidebarOpen(false)}
                                  >
                                    <div
                                      className={cn(
                                        "rounded p-1 transition-all duration-200",
                                        isSubActive
                                          ? "text-slate-400"
                                          : "text-gray-500 group-hover:text-gray-300",
                                      )}
                                    >
                                      <SubIcon className="h-3 w-3" />
                                    </div>
                                    <span className="font-rajdhani text-xs">
                                      {subItem.title}
                                    </span>
                                  </Link>
                                )}
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
          <div className="space-y-3 p-4">
            {/* Institution Status */}
            <div className="rounded-lg border border-gray-700/30 bg-gradient-to-r from-gray-800/50 to-gray-700/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-rajdhani text-gray-400">
                  Institution Status
                </span>
                <div className="flex items-center gap-1">
                  {isOnboarded ? (
                    <>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                      <span className="font-rajdhani font-medium text-green-400">
                        Associated
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-amber-400"></div>
                      <span className="font-rajdhani font-medium text-amber-400">
                        Pending
                      </span>
                    </>
                  )}
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
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
