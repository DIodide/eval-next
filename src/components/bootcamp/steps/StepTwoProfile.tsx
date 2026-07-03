"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const COACH_FIELDS = [
  { key: "biggest_strength", label: "Biggest Strength", placeholder: "What's your greatest strength as a player?" },
  { key: "biggest_growth_area", label: "Biggest Growth Area", placeholder: "Where do you need the most improvement?" },
  { key: "role_on_team", label: "Role on a Team", placeholder: "What role do you play on your team?" },
  { key: "example_leadership", label: "Example of Leadership", placeholder: "Describe a time you showed leadership..." },
  { key: "example_resilience", label: "Example of Resilience", placeholder: "Describe a time you bounced back from adversity..." },
];

interface StepTwoProfileProps {
  initialData?: {
    coach_perspective?: Record<string, string>;
    eval_ranking_description?: string;
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
  isSaving: boolean;
}

export function StepTwoProfile({
  initialData,
  onSave,
  isSaving,
}: StepTwoProfileProps) {
  const [coachPerspective, setCoachPerspective] = useState<Record<string, string>>(
    initialData?.coach_perspective ?? {},
  );
  const [rankingDescription, setRankingDescription] = useState(
    initialData?.eval_ranking_description ?? "",
  );
  const [saved, setSaved] = useState(
    initialData?.coach_perspective
      ? Object.keys(initialData.coach_perspective).length >= 5
      : false,
  );

  const allFieldsFilled = COACH_FIELDS.every(
    (f) => coachPerspective[f.key]?.trim(),
  );

  if (saved) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-3 font-orbitron text-base font-bold text-white">Profile Step Complete!</h3>
          <p className="mt-1 font-rajdhani text-sm text-white/40">Your application perspective has been saved.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Edit CTA */}
      <Card className="border-blue-500/20 bg-gradient-to-r from-blue-600/5 to-purple-600/5">
        <CardContent>
          <h3 className="font-orbitron text-base font-bold text-white">
            Make Your Profile!
          </h3>
          <p className="mt-1 font-rajdhani text-sm text-white/40">
            Have fun making your profile. Click edit profile and add your why, photo, name, and what makes you attractive to coaches.
          </p>
          <Button asChild variant="outline" className="mt-3 border-blue-500/30 bg-blue-600/20 font-rajdhani text-xs font-bold uppercase tracking-wider text-blue-300 hover:bg-blue-600/30 hover:text-blue-200">
            <Link href="/dashboard/player/profile">
              Edit Your Profile
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Application Tips */}
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <h4 className="font-rajdhani text-sm font-bold text-white/70">
            How to Write About Esports
          </h4>
          <div className="mt-3 space-y-3 text-xs text-white/40">
            <div className="rounded border border-red-500/10 bg-red-500/5 px-3 py-2">
              <span className="font-bold text-red-400">Don&apos;t say: </span>
              &ldquo;I am Radiant in Valorant.&rdquo; or &ldquo;I&apos;m top 100 in Rocket League&rdquo;
            </div>
            <div className="rounded border border-green-500/10 bg-green-500/5 px-3 py-2">
              <span className="font-bold text-green-400">Say: </span>
              &ldquo;I spend 15-20 hours a week practicing, reviewing VODs, and competing with teammates. Through this, I&apos;ve learned how to communicate under pressure, accept coaching, and hold myself accountable.&rdquo;
            </div>
          </div>
        </CardContent>
      </Card>

      {/* EVAL Ranking Description */}
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <h4 className="font-rajdhani text-sm font-bold text-white/70">
            Describe Your Rank in Application Terms
          </h4>
          <p className="mt-1 font-rajdhani text-xs text-white/30">
            Re-write your EVAL ranking in a way coaches will understand.
          </p>
          <Textarea
            value={rankingDescription}
            onChange={(e) => setRankingDescription(e.target.value)}
            placeholder="Instead of just your rank, describe what it means in terms of dedication, skill, and work ethic..."
            rows={3}
            className="mt-3 border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
          />
        </CardContent>
      </Card>

      {/* Coach Perspective Workshop */}
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <h3 className="font-orbitron text-base font-bold text-white">
            Coach Perspective Workshop
          </h3>
          <p className="mt-1 font-rajdhani text-xs text-white/30">
            Answer these from a coach&apos;s perspective. What would they say about you?
          </p>

          <div className="mt-4 space-y-4">
            {COACH_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/50">
                  {field.label}
                </label>
                <Textarea
                  value={coachPerspective[field.key] ?? ""}
                  onChange={(e) =>
                    setCoachPerspective((prev) => ({
                      ...prev,
                      [field.key]: e.target.value,
                    }))
                  }
                  placeholder={field.placeholder}
                  rows={2}
                  className="mt-1 border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={async () => {
          await onSave({
            coach_perspective: coachPerspective,
            eval_ranking_description: rankingDescription,
          });
          setSaved(true);
        }}
        disabled={!allFieldsFilled || isSaving}
        className={cn(
          "w-full font-rajdhani text-sm font-bold uppercase tracking-wider",
          allFieldsFilled
            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
            : "opacity-50 cursor-not-allowed",
        )}
      >
        {isSaving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
