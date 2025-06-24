"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  MessageSquare, 
  User, 
  Trophy, 
  Users, 
  Settings,
  Home,
  ArrowLeft,
  Activity,
  ClipboardList
} from "lucide-react";

const adminRoutes = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: Home,
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
    href: "/admin/settings",
    label: "Admin Settings",
    icon: Settings,
  },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="text-white font-bold text-lg">Admin Dashboard</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 ml-8">
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
                      <Icon className="h-4 w-4 mr-2" />
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
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className="md:hidden pb-4">
          <div className="grid grid-cols-2 gap-2">
            {adminRoutes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.href;
              
              return (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full text-gray-300 hover:text-white justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
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