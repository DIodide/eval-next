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
  LockIcon
} from "lucide-react";
import { isCoachOnboarded } from "@/lib/permissions";

// Define protected routes that require onboarding
const protectedRoutes = [
  "/dashboard/coaches/player-search",
  "/dashboard/coaches/prospects", 
  "/dashboard/coaches/tryouts",
  "/dashboard/coaches/messages"
];

const sidebarItems = [
  {
    title: "EVAL Home",
    href: "/dashboard/coaches",
    icon: HomeIcon,
    requiresOnboarding: false,
  },
  {
    title: "Profile",
    href: "/dashboard/coaches/profile",
    icon: UserIcon,
    requiresOnboarding: false,
    subItems: [
      {
        title: "Public Profile",
        href: "/dashboard/coaches/public-profile",
        icon: EyeIcon,
        requiresOnboarding: false,
      }
    ]
  },
  {
    title: "Player Search",
    href: "/dashboard/coaches/player-search",
    icon: SearchIcon,
    requiresOnboarding: true,
  },
  {
    title: "My Prospects",
    href: "/dashboard/coaches/prospects",
    icon: UsersIcon,
    requiresOnboarding: true,
  },
  {
    title: "My Tryouts",
    href: "/dashboard/coaches/tryouts",
    icon: TrophyIcon,
    requiresOnboarding: true,
  },
  {
    title: "Messages",
    href: "/dashboard/coaches/messages",
    icon: MessageSquareIcon,
    requiresOnboarding: true,
  },
];

export default function CoachesDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();

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
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (!isOnboarded && isProtectedRoute) {
        router.push("/dashboard/coaches");
      }
    }
  }, [isLoaded, user, pathname, router]);

  // Show loading state while checking user
  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-[#0f0f1a] items-center justify-center">
        <div className="text-white font-rajdhani">Loading...</div>
      </div>
    );
  }

  const isOnboarded = user ? isCoachOnboarded(user) : false;

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
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a2e] border-r border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div>
              <h2 className="text-xl font-orbitron font-bold text-white">
                Coach Dashboard
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {user?.firstName} {user?.lastName}
              </p>
              {!isOnboarded && (
                <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                  <LockIcon className="h-3 w-3" />
                  Pending Onboarding
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white"
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
                const isDisabled = item.requiresOnboarding && !isOnboarded;
                
                return (
                  <li key={item.href}>
                    {/* Main navigation item */}
                    {isDisabled ? (
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-not-allowed opacity-50",
                          "text-gray-500"
                        )}
                      >
                        <LockIcon className="h-4 w-4" />
                        {item.title}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                          isActive
                            ? "bg-cyan-600 text-white"
                            : "text-gray-300 hover:text-white hover:bg-gray-800"
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                    )}

                    {/* Sub-items (always visible for Profile) */}
                    {item.subItems && (
                      <ul className="ml-4 mt-2 space-y-1">
                        {item.subItems.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = pathname === subItem.href;
                          const isSubDisabled = subItem.requiresOnboarding && !isOnboarded;
                          
                          return (
                            <li key={subItem.href}>
                              {isSubDisabled ? (
                                <div
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-50",
                                    "text-gray-500"
                                  )}
                                >
                                  <LockIcon className="h-3 w-3" />
                                  {subItem.title}
                                </div>
                              ) : (
                                <Link
                                  href={subItem.href}
                                  className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isSubActive
                                      ? "bg-cyan-600 text-white"
                                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                                  )}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  <SubIcon className="h-4 w-4" />
                                  {subItem.title}
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

          <Separator className="bg-gray-800" />

          {/* Footer */}
          <div className="p-4">
            <p className="text-xs text-gray-400">
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
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 