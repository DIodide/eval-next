"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UserTypeSelection from "./_components/UserTypeSelection";
import { usePostHog } from 'posthog-js/react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    if (isLoaded && user) {
      const userType = user.unsafeMetadata?.userType as string;
      const primaryEmail = user.emailAddresses[0]?.emailAddress;
      
      // Only identify if we have both PostHog and a primary email
      if (primaryEmail && posthog) {
        const currentDistinctId = posthog.get_distinct_id();
        
        // Only identify if the current distinct ID is different from the user's email
        // This prevents unnecessary identify calls
        if (currentDistinctId !== primaryEmail) {
          posthog.identify(primaryEmail, {
            name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
            userType: userType || undefined
          });
        }
      }

      if (userType === "coach") {
        router.push("/dashboard/coaches");
      } else if (userType === "player") {
        router.push("/dashboard/player");
      } else if (userType === "league") {
        router.push("/dashboard/leagues");
      } else {
        // If userType is not set or unknown, show the selection UI
        console.warn("Unknown userType or missing userType in unsafeMetadata:", userType);
        setShowUserTypeSelection(true);
      }
    }
  }, [isLoaded, user, router, posthog]);

  const handleUserTypeSelected = (userType: 'player' | 'coach' | 'league') => {
    // After userType is updated, redirect to the appropriate dashboard
    if (userType === "coach") {
      router.push("/dashboard/coaches");
    } else if (userType === "player") {
      router.push("/dashboard/player");
    } else if (userType === "league") {
      router.push("/dashboard/leagues");
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

  // If we get here, something went wrong - show loading state
  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center">
      <div className="text-white font-rajdhani">Redirecting...</div>
    </div>
  );
} 