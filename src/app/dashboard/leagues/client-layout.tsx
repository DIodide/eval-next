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
  UsersIcon,
  MenuIcon,
  XIcon,
  LockIcon,
  SettingsIcon,
  EyeIcon,
  BuildingIcon,
  BarChart3Icon,
} from "lucide-react";
import { isLeagueAdminOnboarded } from "@/lib/client/permissions";
import { api } from "@/trpc/react";

// Define protected routes that require onboarding
const protectedRoutes = [
  "/dashboard/leagues/players",
  "/dashboard/leagues/teams",
  "/dashboard/leagues/profile",
  "/dashboard/leagues/rankings",
];

export function LeaguesDashboardClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Get league profile data for onboarded users
  const isOnboarded = user ? isLeagueAdminOnboarded(user) : false;
  const { data: leagueProfile } = api.leagueAdminProfile.getProfile.useQuery(
    undefined,
    { enabled: isOnboarded },
  );

  // Check if user is a league administrator
  if (isLoaded && user) {
    const userType = user.unsafeMetadata?.userType;
    if (userType !== "league") {
      redirect("/dashboard");
    }
  }

  // Check onboarding status and redirect if necessary
  useEffect(() => {
    if (isLoaded && user) {
      const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (!isOnboarded && isProtectedRoute) {
        router.push("/dashboard/leagues");
      }
    }
  }, [isLoaded, user, pathname, router, isOnboarded]);

  // Show loading state while checking user
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f0f1a]">
        <div className="font-rajdhani text-white">Loading...</div>
      </div>
    );
  }

  // Define sidebar items
  const sidebarItems = [
    {
      title: "EVAL Home",
      href: "/dashboard/leagues",
      icon: HomeIcon,
      requiresOnboarding: false,
      enabled: true,
    },
    {
      title: "League Profile",
      href: "/dashboard/leagues/profile",
      icon: UserIcon,
      requiresOnboarding: true,
      enabled: true,
      subItems: [
        // Only show public profile link for onboarded league admins with league data
        ...(isOnboarded && leagueProfile?.league_ref?.id
          ? [
              {
                title: "Public Profile",
                href: `/profiles/leagues/${leagueProfile.league_ref.id}`,
                icon: EyeIcon,
                requiresOnboarding: true,
              },
            ]
          : []),
      ],
    },
    {
      title: "Player Search",
      href: "/dashboard/leagues/players",
      icon: UsersIcon,
      requiresOnboarding: true,
      enabled: false,
    },
    {
      title: "Manage Teams",
      href: "/dashboard/leagues/teams",
      icon: TrophyIcon,
      requiresOnboarding: true,
      enabled: false,
    },
    {
      title: "Manage Schools",
      href: "/dashboard/leagues/schools",
      icon: BuildingIcon,
      requiresOnboarding: true,
      enabled: true,
    },
    {
      title: "Manage Rankings",
      href: "/dashboard/leagues/rankings",
      icon: BarChart3Icon,
      requiresOnboarding: true,
      enabled: false,
    },
    {
      title: "League Settings",
      href: "/dashboard/leagues/settings",
      icon: SettingsIcon,
      requiresOnboarding: true,
      enabled: false,
    },
  ];

  return (
    <div className="flex h-screen bg-[#0f0f1a]">
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
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-800 bg-[#1a1a2e] transition-transform duration-200 ease-in-out lg:static lg:inset-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-gray-800 p-4">
            <div>
              <h2 className="font-orbitron text-xl font-bold text-white">
                League Dashboard
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                {user?.firstName} {user?.lastName}
              </p>
              {!isOnboarded && (
                <p className="mt-1 flex items-center gap-1 text-xs text-yellow-400">
                  <LockIcon className="h-3 w-3" />
                  Pending Onboarding
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDisabled =
                  (item.requiresOnboarding && !isOnboarded) ||
                  item.enabled === false;

                return (
                  <li key={item.href}>
                    {/* Main navigation item */}
                    {isDisabled ? (
                      <div
                        className={cn(
                          "flex cursor-not-allowed items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium opacity-50",
                          "text-gray-500",
                        )}
                      >
                        <LockIcon className="h-4 w-4" />
                        {item.title}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                    )}

                    {/* Sub-items (only show if enabled and they exist) */}
                    {item.subItems &&
                      item.subItems.length > 0 &&
                      !isDisabled && (
                        <ul className="mt-2 ml-8 space-y-1">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = pathname === subItem.href;

                            return (
                              <li key={subItem.href}>
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isSubActive
                                      ? "bg-indigo-500 text-white"
                                      : "text-gray-400 hover:bg-gray-700 hover:text-white",
                                  )}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <SubIcon className="h-4 w-4" />
                                  {subItem.title}
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

          <Separator className="bg-gray-800" />

          {/* Footer */}
          <div className="p-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSidebarOpen(false)}
            >
              <MenuIcon className="mr-2 h-4 w-4" />
              Close Menu
            </Button>
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
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}
