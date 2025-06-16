"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const userType = user.unsafeMetadata?.userType as string;
      
      if (userType === "coach") {
        router.push("/dashboard/coaches");
      } else if (userType === "player") {
        router.push("/dashboard/player");
      } else {
        // If userType is not set or unknown, redirect to a default page or profile setup
          console.warn("Unknown userType or missing userType in unsafeMetadata:", userType);
          // TODO: Reprompt the user to select their user type and update the userType in the unsafeMetadata
          // TODO: check onboarding status and redirect to the appropriate page
          // TODO: if onboarding is complete, redirect to the dashboard
        // You might want to redirect to a profile setup page or default to player
        router.push("/dashboard/player");
      }
    }
  }, [isLoaded, user, router]);

  // Show loading state while checking user authentication and redirecting
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

  // This should rarely be seen since we redirect immediately after loading
  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <div className="flex items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
        <div className="text-white font-rajdhani">Redirecting to your dashboard...</div>
      </div>
    </div>
  );
} 