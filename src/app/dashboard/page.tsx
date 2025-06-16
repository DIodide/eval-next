"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import UserTypeSelection from "./_components/UserTypeSelection";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      const userType = user.unsafeMetadata?.userType as string;
      
      if (userType === "coach") {
        router.push("/dashboard/coaches");
      } else if (userType === "player") {
        router.push("/dashboard/player");
      } else {
        // If userType is not set or unknown, show the selection UI
        console.warn("Unknown userType or missing userType in unsafeMetadata:", userType);
        setShowUserTypeSelection(true);
      }
    }
  }, [isLoaded, user, router]);

  const handleUserTypeSelected = (userType: 'player' | 'coach') => {
    // After userType is updated, redirect to the appropriate dashboard
    if (userType === "coach") {
      router.push("/dashboard/coaches");
    } else {
      router.push("/dashboard/player");
    }
  };

  // Show loading state while checking user authentication
  if (!isLoaded) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          <div className="text-white font-rajdhani">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  // Show user type selection if needed
  if (showUserTypeSelection) {
    return <UserTypeSelection onUserTypeSelected={handleUserTypeSelected} />;
  }

  // Loading state while redirecting
  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <div className="flex items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        <div className="text-white font-rajdhani">Redirecting to your dashboard...</div>
      </div>
    </div>
  );
} 