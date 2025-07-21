import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Trophy, Users, Target, Globe } from "lucide-react";

export default function LeagueSignUpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900/90 text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
      <div className="absolute inset-0 bg-black/60" />

      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-cyan-500/20 to-transparent blur-2xl"></div>
      <div className="absolute right-20 bottom-20 h-24 w-24 animate-pulse rounded-full bg-gradient-to-tl from-purple-500/20 to-transparent blur-xl delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-orange-500/15 to-transparent blur-lg delay-500"></div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding & Info */}
        <div className="hidden flex-col justify-center px-12 lg:flex lg:w-1/2 xl:px-16">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg">
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
          <div className="mb-8 h-1 w-24 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500"></div>

          {/* Heading */}
          <div className="mb-12">
            <h1 className="font-orbitron mb-4 text-4xl leading-tight font-black text-white xl:text-5xl">
              Create Your
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                League Admin Account
              </span>
            </h1>
            <p className="text-lg leading-relaxed font-medium text-gray-300">
              Join the premier esports platform and showcase your competitive
              gaming league with professional profiles and rankings.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
                <Globe className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">
                  Shareable League Profile
                </h3>
                <p className="text-sm text-gray-400">
                  Professional public profile showcasing your league brand and
                  identity
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">
                  Team & Player Analytics
                </h3>
                <p className="text-sm text-gray-400">
                  Comprehensive performance tracking and insights
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">
                  Professional Rankings
                </h3>
                <p className="text-sm text-gray-400">
                  Industry-standard ranking and leaderboard systems
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20">
                <Trophy className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">
                  League Management
                </h3>
                <p className="text-sm text-gray-400">
                  Organize teams, manage players, and showcase your league
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
              href="/sign-in"
              className="font-orbitron inline-flex items-center font-bold text-cyan-400 transition-colors hover:text-cyan-300"
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg">
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

            {/* Mobile Title */}
            <div className="mb-8 text-center lg:hidden">
              <h2 className="font-orbitron mb-2 text-2xl font-black text-white">
                Create League Admin Account
              </h2>
              <div className="mx-auto h-1 w-16 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500"></div>
            </div>

            {/* Sign Up Component with Enhanced Styling */}
            <div className="rounded-2xl border border-white/10 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-lg">
              <SignUp
                unsafeMetadata={{ userType: "league" }}
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
                      "bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20",
                    formFieldLabel: "text-gray-300 font-medium",
                    footerActionLink:
                      "text-cyan-400 hover:text-cyan-300 font-medium",
                    footerActionText: "text-gray-400",
                    formButtonPrimary:
                      "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-orbitron font-bold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300",
                    identityPreviewText: "text-gray-300",
                    identityPreviewEditButton:
                      "text-cyan-400 hover:text-cyan-300",
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
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy-policy"
                  className="text-cyan-400 transition-colors hover:text-cyan-300"
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
