"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  ZapIcon
} from "lucide-react";

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
  {
    title: "Memberships",
    href: "/dashboard/player/memberships",
    icon: ShieldCheckIcon,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

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
            <h2 className="text-xl font-orbitron font-bold text-white">
              Dashboard
            </h2>
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
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "text-gray-300 hover:text-white hover:bg-gray-800"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </Link>
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