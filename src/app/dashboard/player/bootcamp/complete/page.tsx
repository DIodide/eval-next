"use client";

import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Award, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BootcampCompletePage() {
  const { user } = useUser();
  const { data: progressData } = api.bootcamp.getBootcampProgress.useQuery({
    bootcampSlug: "recruit-bootcamp",
  });

  const completionPct =
    progressData?.overallProgress?.completionPercentage ?? 0;
  const isComplete = completionPct >= 100;
  const completedAt = progressData?.overallProgress?.completedAt;

  const playerName =
    user?.fullName ?? user?.firstName ?? "Player";

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  if (!isComplete) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <Award className="h-12 w-12 text-white/15" />
        <h1 className="mt-4 font-orbitron text-xl font-bold text-white">
          Not Yet Complete
        </h1>
        <p className="mt-2 max-w-sm text-sm text-white/40">
          Complete all 5 steps of the bootcamp to earn your certificate.
          You&apos;re at {Math.round(completionPct)}%.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link
            href="/dashboard/player/bootcamp"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4 text-blue-400" />
            Back to Bootcamp
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-12">
      {/* Congrats Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
          <Award className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 className="mt-5 font-orbitron text-2xl font-bold text-white lg:text-3xl">
          Congratulations!
        </h1>
        <p className="mt-2 text-base text-white/50">
          You completed the bootcamp 100%
        </p>
      </div>

      {/* Certificate */}
      <div className="mt-10 w-full max-w-2xl">
        <Card className="relative overflow-hidden border-2 border-yellow-500/20 bg-gradient-to-br from-[#0f0f1a] via-[#151528] to-[#0f0f1a] p-10 shadow-2xl lg:p-14">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 h-20 w-20 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-xl" />
          <div className="absolute top-0 right-0 h-20 w-20 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 h-20 w-20 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 h-20 w-20 border-b-2 border-r-2 border-yellow-500/30 rounded-br-xl" />

          <div className="text-center">
            {/* EVAL Logo */}
            <div className="font-orbitron text-xs font-bold uppercase tracking-[0.5em] text-yellow-500/50">
              EVAL
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/20">
              Certificate of Completion
            </div>

            {/* Main Content */}
            <div className="mt-8">
              <p className="font-rajdhani text-sm text-white/40">
                This certifies that
              </p>
              <h2 className="mt-2 font-orbitron text-2xl font-bold text-white lg:text-3xl">
                {playerName}
              </h2>
              <div className="mx-auto mt-3 h-px w-32 bg-yellow-500/20" />
            </div>

            <div className="mt-6">
              <p className="text-sm leading-relaxed text-white/50">
                has successfully completed the
              </p>
              <p className="mt-1 font-orbitron text-lg font-bold text-yellow-400">
                EVAL Recruit Bootcamp
              </p>
              <p className="mt-3 max-w-md mx-auto text-xs leading-relaxed text-white/30">
                Demonstrating competency in college list building, esports
                application framing, highlight reel creation, and coach outreach
                — earning the EVAL Verified badge.
              </p>
            </div>

            {/* Date & Badge */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/20">
                  Date
                </div>
                <div className="mt-1 font-rajdhani text-sm font-medium text-white/50">
                  {formattedDate}
                </div>
              </div>
              <div className="h-8 w-px bg-white/[0.06]" />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-white/20">
                  Badge
                </div>
                <div className="mt-1 flex items-center gap-1.5 font-rajdhani text-sm font-medium text-yellow-400">
                  <Award className="h-3.5 w-3.5" />
                  EVAL Verified
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => window.print()}
            className="bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20"
          >
            <Download className="h-4 w-4" />
            Download Certificate
          </Button>
          <Button variant="outline" asChild>
            <Link
              href="/dashboard/player/bootcamp"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bootcamp
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
