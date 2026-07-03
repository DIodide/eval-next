"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, Upload, Film } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepThreeHighlightReelProps {
  initialData?: {
    reel_action_completed?: boolean;
    uploaded_clips?: string[];
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
  isSaving: boolean;
}

const EXAMPLE_REELS = [
  { title: "Valorant Highlights - Radiant Plays", thumbnail: null },
  { title: "Rocket League Aerial Goals", thumbnail: null },
  { title: "Smash Bros Tournament Run", thumbnail: null },
];

export function StepThreeHighlightReel({
  initialData,
  onSave,
  isSaving,
}: StepThreeHighlightReelProps) {
  const [mode, setMode] = useState<"choose" | "examples" | "upload" | "complete">(
    initialData?.reel_action_completed ? "complete" : "choose",
  );
  const [clips, setClips] = useState<{ name: string; file?: File }[]>(
    initialData?.uploaded_clips?.map((name) => ({ name })) ?? [],
  );

  const CLIP_SLOTS = [
    { label: "Upload your best clip here", required: true },
    { label: "Upload 3 important plays", required: true },
    { label: "Upload 2 more plays", required: false },
  ];

  if (mode === "complete") {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <Film className="h-6 w-6 text-green-400" />
          </div>
          <h3 className="mt-3 font-orbitron text-base font-bold text-white">
            Highlight Reel Complete!
          </h3>
          <p className="mt-1 font-rajdhani text-sm text-white/40">
            Your highlight reel step has been saved.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (mode === "choose") {
    return (
      <div className="space-y-4">
        <Card className="border-white/10 bg-white/5">
          <CardContent>
            <h3 className="font-orbitron text-lg font-bold text-white">
              Highlight Reel
            </h3>
            <p className="mt-2 font-rajdhani text-sm text-white/40">
              Choose how you want to complete this step. You can watch highlight reel
              examples from your cohort or create your own.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setMode("examples")}
                className="flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-600/5 hover:to-purple-600/5"
              >
                <Play className="h-8 w-8 text-blue-400" />
                <div className="text-center">
                  <div className="font-rajdhani text-sm font-bold text-white">
                    Watch Examples
                  </div>
                  <div className="mt-1 font-rajdhani text-xs text-white/30">
                    Scroll through your cohort&apos;s reels
                  </div>
                </div>
              </button>

              <button
                onClick={() => setMode("upload")}
                className="flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-600/5 hover:to-purple-600/5"
              >
                <Upload className="h-8 w-8 text-blue-400" />
                <div className="text-center">
                  <div className="font-rajdhani text-sm font-bold text-white">
                    Make Your Own
                  </div>
                  <div className="mt-1 font-rajdhani text-xs text-white/30">
                    Upload clips and create a reel
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "examples") {
    return (
      <div className="space-y-4">
        <Card className="border-white/10 bg-white/5">
          <CardContent>
            <h3 className="font-orbitron text-base font-bold text-white">
              Highlight Reel Examples
            </h3>
            <p className="mt-1 font-rajdhani text-xs text-white/30">
              Scroll through your cohort&apos;s highlight reels for inspiration.
            </p>

            <div className="mt-4 space-y-3">
              {EXAMPLE_REELS.map((reel, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded bg-white/[0.05]">
                    <Play className="h-6 w-6 text-white/30" />
                  </div>
                  <div>
                    <div className="font-rajdhani text-sm font-medium text-white/70">
                      {reel.title}
                    </div>
                    <div className="mt-1 font-rajdhani text-xs text-white/30">
                      Cohort highlight reel example
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                className="flex-1 border-white/10 bg-transparent font-rajdhani text-xs font-bold uppercase tracking-wider text-white/50 hover:bg-white/[0.03] hover:text-white"
              >
                Back
              </Button>
              <Button
                onClick={async () => {
                  await onSave({ reel_action_completed: true, reel_mode: "watched_examples" });
                  setMode("complete");
                }}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 font-rajdhani text-xs font-bold uppercase tracking-wider text-white hover:from-blue-500 hover:to-purple-500"
              >
                {isSaving ? "Saving..." : "Complete Step"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Upload mode
  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <h3 className="font-orbitron text-base font-bold text-white">
            Make Your Own Highlight Reel
          </h3>
          <p className="mt-1 font-rajdhani text-xs text-white/30">
            Upload your gaming clips and we&apos;ll help create a highlight reel for your profile.
          </p>

          <div className="mt-4 space-y-3">
            {CLIP_SLOTS.map((slot, i) => (
              <div key={i}>
                <label className="block font-rajdhani text-xs font-semibold text-white/50">
                  {slot.label}
                  {slot.required && <span className="text-red-400"> *</span>}
                </label>
                <div
                  className={cn(
                    "mt-1 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed py-4 transition-colors",
                    clips[i]
                      ? "border-green-500/30 bg-green-500/5"
                      : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
                  )}
                  onClick={() => {
                    // In a real implementation, this would open a file picker
                    const clipName = `clip-${i + 1}.mp4`;
                    setClips((prev) => {
                      const next = [...prev];
                      next[i] = { name: clipName };
                      return next;
                    });
                  }}
                >
                  {clips[i] ? (
                    <span className="font-rajdhani text-xs text-green-400">
                      {clips[i].name} uploaded
                    </span>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 text-white/30" />
                      <span className="font-rajdhani text-xs text-white/30">Click to upload</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setMode("choose")}
              className="flex-1 border-white/10 bg-transparent font-rajdhani text-xs font-bold uppercase tracking-wider text-white/50 hover:bg-white/[0.03] hover:text-white"
            >
              Back
            </Button>
            <Button
              onClick={async () => {
                await onSave({
                  reel_action_completed: true,
                  reel_mode: "uploaded",
                  uploaded_clips: clips.map((c) => c.name),
                });
                setMode("complete");
              }}
              disabled={clips.filter(Boolean).length < 2 || isSaving}
              className={cn(
                "flex-1 font-rajdhani text-xs font-bold uppercase tracking-wider",
                clips.filter(Boolean).length >= 2
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "opacity-50 cursor-not-allowed",
              )}
            >
              {isSaving ? "Saving..." : "Upload & Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
