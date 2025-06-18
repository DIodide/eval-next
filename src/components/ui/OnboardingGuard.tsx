"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, LockIcon } from "lucide-react";
import { isCoachOnboarded } from "@/lib/permissions";

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
  showMessage = true 
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white font-rajdhani">Loading...</div>
      </div>
    );
  }

  // If onboarding is required but user is not onboarded
  if (requiresOnboarding && !isOnboarded) {
    if (!showMessage) return null;

    return (
      <div className="space-y-6">
        <Card className="bg-gray-900 border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-400 font-orbitron flex items-center gap-2">
              <LockIcon className="h-5 w-5" />
              Onboarding Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircleIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-orbitron font-bold text-white mb-4">
                Coach Onboarding Required
              </h3>
              <p className="text-gray-300 font-rajdhani mb-6 max-w-md mx-auto">
                To access this feature, you need to complete your coach onboarding by associating with a school. 
                Please submit a school association request from your dashboard.
              </p>
              <Button 
                onClick={() => router.push("/dashboard/coaches")}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
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