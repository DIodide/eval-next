"use client";

import { useUser, SignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { HandshakeIcon, Loader2, Users, Search, MessageSquare } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function CoachOnboardingContent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const schoolId = searchParams.get("schoolId");
  const schoolName = searchParams.get("schoolName");
  
  const [claimMessage, setClaimMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  
  const userType = user?.unsafeMetadata?.userType as string | undefined;
  const isCoach = userType === "coach" || userType === "school";

  // School association request mutation
  const submitAssociationRequest = api.coachProfile.submitSchoolAssociationRequest.useMutation({
    onSuccess: () => {
      toast.success(
        "School association request submitted! An admin will review your request.",
      );
      // Redirect to coach dashboard
      router.push("/dashboard/coaches");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit request");
      setIsSubmitting(false);
    },
  });

  useEffect(() => {
    if (!isLoaded) return;
    
    // If no schoolId provided, redirect to sign-up
    if (!schoolId || !schoolName) {
      router.push("/sign-up/schools");
      return;
    }

    // If signed in as coach, show the claim form
    if (isSignedIn && isCoach) {
      setShowClaimForm(true);
    }
    // If signed in but not as coach, redirect to dashboard to select type
    else if (isSignedIn && userType && !isCoach) {
      toast.error("You must be registered as a coach to claim a school profile.");
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, isCoach, userType, schoolId, schoolName, router]);

  const handleSubmitClaim = () => {
    if (!schoolId) return;
    setIsSubmitting(true);
    submitAssociationRequest.mutate({
      school_id: schoolId,
      request_message: claimMessage || undefined,
    });
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="flex items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
          <span className="font-rajdhani text-white">Loading...</span>
        </div>
      </div>
    );
  }

  // If signed in as coach, show the claim confirmation form
  if (showClaimForm && schoolId && schoolName) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gray-900/90 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-cyan-500/10" />
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-green-500/20 to-transparent blur-2xl"></div>
        <div className="absolute right-20 bottom-20 h-24 w-24 animate-pulse rounded-full bg-gradient-to-tl from-emerald-500/20 to-transparent blur-xl delay-1000"></div>
        
        <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
          <Card className="max-w-lg border-green-500/30 bg-gray-900/90 shadow-2xl backdrop-blur-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <HandshakeIcon className="h-8 w-8 text-green-400" />
              </div>
              <CardTitle className="font-orbitron text-2xl text-white">
                Claim School Profile
              </CardTitle>
              <CardDescription className="text-gray-300">
                Submit a request to be associated with{" "}
                <span className="font-semibold text-green-400">{decodeURIComponent(schoolName)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-green-500/20 bg-green-900/20 p-4">
                <p className="text-sm text-gray-300">
                  An admin will review your request and verify your association with this school.
                  Once approved, you&apos;ll have full access to manage the school&apos;s profile, tryouts, and announcements.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="claim-message" className="text-gray-300">
                  Message (optional)
                </Label>
                <Textarea
                  id="claim-message"
                  placeholder="Tell us about your role at this school, provide your school email, or any other verification details..."
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  className="min-h-[100px] border-gray-700 bg-gray-800 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/profiles/school/${schoolId}`)}
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitClaim}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <HandshakeIcon className="mr-2 h-4 w-4" />
                      Submit Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If not signed in, show sign-up form with claim context
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900/90 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-cyan-500/10" />
      <div className="absolute inset-0 bg-black/60" />

      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-green-500/20 to-transparent blur-2xl"></div>
      <div className="absolute right-20 bottom-20 h-24 w-24 animate-pulse rounded-full bg-gradient-to-tl from-emerald-500/20 to-transparent blur-xl delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-cyan-500/15 to-transparent blur-lg delay-500"></div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding & Info */}
        <div className="hidden flex-col justify-center px-12 lg:flex lg:w-1/2 xl:px-16">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                <Image
                  src="/eval/logos/eLOGO_white.png"
                  alt="EVAL Logo"
                  width={32}
                  height={32}
                  className="brightness-0 invert"
                />
              </div>
              <span className="font-orbitron text-2xl font-black tracking-wider text-white">
                EVAL
              </span>
            </Link>
          </div>

          {/* Rainbow Bar */}
          <div className="mb-8 h-1 w-24 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500"></div>

          {/* Claim Context */}
          {schoolName && (
            <div className="mb-8 rounded-lg border border-green-500/30 bg-green-900/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <HandshakeIcon className="h-6 w-6 text-green-400" />
                <h2 className="font-orbitron text-xl font-bold text-green-400">
                  Claim Your School
                </h2>
              </div>
              <p className="text-gray-300">
                You&apos;re about to claim the profile for{" "}
                <span className="font-semibold text-white">{decodeURIComponent(schoolName)}</span>.
                Create an account to manage tryouts, announcements, and recruit players.
              </p>
            </div>
          )}

          {/* Heading */}
          <div className="mb-12">
            <h1 className="font-orbitron mb-4 text-4xl leading-tight font-black text-white xl:text-5xl">
              Create Your
              <span className="block bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                Coach Account
              </span>
            </h1>
            <p className="text-lg leading-relaxed font-medium text-gray-300">
              Join the premier esports platform and manage your school&apos;s esports program.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20">
                <Search className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">
                  Scout Top Talent
                </h3>
                <p className="text-sm text-gray-400">
                  Advanced search tools to find players with the skills you need
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">
                  Manage Tryouts
                </h3>
                <p className="text-sm text-gray-400">
                  Organize tryouts and evaluate prospective team members
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
                <MessageSquare className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">
                  Direct Communication
                </h3>
                <p className="text-sm text-gray-400">
                  Connect directly with players and build relationships
                </p>
              </div>
            </div>
          </div>

          {/* CTA Link */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="mb-4 text-sm text-gray-400">
              Already have an account?
            </p>
            <Link
              href={`/sign-in?redirect_url=${encodeURIComponent(`/onboarding/coach?schoolId=${schoolId}&schoolName=${schoolName}`)}`}
              className="font-orbitron inline-flex items-center font-bold text-green-400 transition-colors hover:text-green-300"
            >
              Sign in to your account →
            </Link>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="flex w-full items-center justify-center px-6 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-8 text-center lg:hidden">
              <Link href="/" className="inline-flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                  <Image
                    src="/eval/logos/eLOGO_white.png"
                    alt="EVAL Logo"
                    width={24}
                    height={24}
                    className="brightness-0 invert"
                  />
                </div>
                <span className="font-orbitron text-xl font-black tracking-wider text-white">
                  EVAL
                </span>
              </Link>
            </div>

            {/* Mobile Claim Context */}
            {schoolName && (
              <div className="mb-6 rounded-lg border border-green-500/30 bg-green-900/30 p-4 lg:hidden">
                <div className="flex items-center gap-2 mb-2">
                  <HandshakeIcon className="h-5 w-5 text-green-400" />
                  <span className="font-orbitron font-bold text-green-400">Claim Your School</span>
                </div>
                <p className="text-sm text-gray-300">
                  Claiming: <span className="font-semibold text-white">{decodeURIComponent(schoolName)}</span>
                </p>
              </div>
            )}

            {/* Mobile Title */}
            <div className="mb-8 text-center lg:hidden">
              <h2 className="font-orbitron mb-2 text-2xl font-black text-white">
                Create Coach Account
              </h2>
              <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500"></div>
            </div>

            {/* Sign Up Component */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-lg">
              <SignUp
                unsafeMetadata={{ userType: "school" }}
                forceRedirectUrl={schoolId && schoolName ? `/onboarding/coach?schoolId=${schoolId}&schoolName=${encodeURIComponent(schoolName)}` : "/dashboard/coaches"}
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none border-none",
                    headerTitle: "text-white font-orbitron font-bold text-xl",
                    headerSubtitle: "text-gray-300",
                    socialButtonsBlockButton:
                      "bg-gray-800/50 border border-white/20 text-white hover:bg-gray-700/50 transition-all duration-300",
                    socialButtonsBlockButtonText: "text-white font-medium",
                    dividerLine: "bg-white/20",
                    dividerText: "text-gray-400 font-medium",
                    formFieldInput:
                      "bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400/20",
                    formFieldLabel: "text-gray-300 font-medium",
                    footerActionLink:
                      "text-green-400 hover:text-green-300 font-medium",
                    footerActionText: "text-gray-400",
                    formButtonPrimary:
                      "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-orbitron font-bold shadow-lg hover:shadow-green-500/25 transition-all duration-300",
                    identityPreviewText: "text-gray-300",
                    identityPreviewEditButton:
                      "text-green-400 hover:text-green-300",
                  },
                }}
              />
            </div>

            {/* Bottom Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                By creating an account, you agree to our{" "}
                <Link
                  href="/tos"
                  className="text-green-400 transition-colors hover:text-green-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-green-400 transition-colors hover:text-green-300"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoachOnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-900">
          <div className="flex items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
            <span className="font-rajdhani text-white">Loading...</span>
          </div>
        </div>
      }
    >
      <CoachOnboardingContent />
    </Suspense>
  );
}
