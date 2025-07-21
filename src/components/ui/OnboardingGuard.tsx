"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, LockIcon } from "lucide-react";
import { isCoachOnboarded } from "@/lib/client/permissions";

interface OnboardingGuardProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean;
  redirectTo?: string;
  showMessage?: boolean;
}

export function OnboardingGuard({
  children,
  requiresOnboarding = true,
  redirectTo = "/dashboard/coaches",
  showMessage = true,
}: OnboardingGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const isOnboarded = user ? isCoachOnboarded(user) : false;

  useEffect(() => {
    if (isLoaded && user && requiresOnboarding && !isOnboarded) {
      router.push(redirectTo);
    }
  }, [isLoaded, user, requiresOnboarding, isOnboarded, router, redirectTo]);

  // Show loading while checking
  if (!isLoaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="font-rajdhani text-white">Loading...</div>
      </div>
    );
  }

  // If onboarding is required but user is not onboarded
  if (requiresOnboarding && !isOnboarded) {
    if (!showMessage) return null;

    return (
      <div className="space-y-6">
        <Card className="border-yellow-500 bg-gray-900">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center gap-2 text-yellow-400">
              <LockIcon className="h-5 w-5" />
              Onboarding Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center">
              <AlertCircleIcon className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
              <h3 className="font-orbitron mb-4 text-xl font-bold text-white">
                Coach Onboarding Required
              </h3>
              <p className="font-rajdhani mx-auto mb-6 max-w-md text-gray-300">
                To access this feature, you need to complete your coach
                onboarding by associating with a school. Please submit a school
                association request from your dashboard.
              </p>
              <Button
                onClick={() => router.push("/dashboard/coaches")}
                className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is onboarded or onboarding is not required
  return <>{children}</>;
}
