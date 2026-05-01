"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Play } from "lucide-react";
import { useState } from "react";

export function BootcampTeaserSection() {
  const { data: teaser, isLoading } = api.bootcamp.getHomepageTeaser.useQuery(
    undefined,
    { staleTime: 5 * 60 * 1000 },
  );
  const [videoStarted, setVideoStarted] = useState(false);

  const bootcampUrl = teaser
    ? `/dashboard/player/bootcamp/${teaser.moduleSlug}/${teaser.slug}`
    : "/dashboard/player/bootcamp";

  return (
    <section className="border border-blue-500/20 bg-black/95 bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 py-20">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="font-rajdhani mb-2 text-sm tracking-[0.25em] text-cyan-300/80 uppercase">
              Your journey starts here
            </p>
            <h2 className="font-orbitron cyber-text mb-4 text-4xl font-black text-white md:text-5xl">
              STEP 1: BUILD YOUR{" "}
              <span className="text-cyan-400">COLLEGE LIST</span>
            </h2>
            <p className="font-rajdhani mx-auto max-w-3xl text-xl text-gray-300">
              Watch how our EVAL+ Bootcamp guides you through every step of the
              esports recruiting process — starting with finding the right
              schools for you.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Video Player */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-cyan-400/20 shadow-2xl shadow-cyan-400/10">
                {isLoading ? (
                  <div className="flex aspect-video w-full items-center justify-center bg-gray-900">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
                  </div>
                ) : teaser?.videoUrl ? (
                  <div className="relative aspect-video w-full bg-black">
                    {!videoStarted && teaser.posterUrl ? (
                      <button
                        onClick={() => setVideoStarted(true)}
                        className="group relative flex h-full w-full items-center justify-center"
                        aria-label="Play video"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={teaser.posterUrl}
                          alt="Step 1 preview"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-cyan-400/90 shadow-xl transition-transform duration-300 group-hover:scale-110">
                          <Play className="h-8 w-8 translate-x-0.5 text-black" />
                        </div>
                      </button>
                    ) : (
                      <video
                        src={teaser?.videoUrl ?? ""}
                        poster={teaser?.posterUrl ?? undefined}
                        controls
                        autoPlay={videoStarted}
                        className="h-full w-full"
                        preload="none"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-gray-900">
                    <p className="font-rajdhani text-gray-500">
                      Video coming soon
                    </p>
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute -inset-1 -z-10 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl" />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5">
                <span className="font-orbitron text-xs font-bold tracking-widest text-cyan-400">
                  EVAL+ BOOTCAMP
                </span>
              </div>

              <h3 className="font-orbitron text-3xl font-black text-white">
                From High School to College Esports
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan-400" />
                  <p className="font-rajdhani text-lg text-gray-300">
                    Build a personalized list of colleges that match your game,
                    GPA, and scholarship goals
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-purple-400" />
                  <p className="font-rajdhani text-lg text-gray-300">
                    Learn what college coaches are actually looking for in
                    esports recruits
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-orange-400" />
                  <p className="font-rajdhani text-lg text-gray-300">
                    Start your recruiting journey with a clear, step-by-step
                    action plan
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link href={bootcampUrl}>
                  <Button
                    size="lg"
                    className="font-orbitron w-full bg-gradient-to-r from-cyan-400 to-cyan-500 px-8 py-4 text-base font-bold tracking-wider text-black shadow-lg shadow-cyan-400/25 hover:from-cyan-500 hover:to-cyan-600 sm:w-auto"
                  >
                    START BOOTCAMP
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
