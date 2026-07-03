"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const WHY_OPTIONS = [
  { id: "college_scholarships", label: "College Scholarships" },
  { id: "want_to_go_pro", label: "Want to Go Pro" },
  { id: "community_friends", label: "Community / Friends" },
  { id: "streamer_content_creator", label: "Streamer / Content Creator" },
];

interface StepZeroWhyEsportsProps {
  initialSelections?: string[];
  initialWhyText?: string;
  onSaveWhyEsports: (selections: string[]) => Promise<void>;
  onSaveYourWhy: (text: string) => Promise<void>;
  isSaving: boolean;
}

export function StepZeroWhyEsports({
  initialSelections = [],
  initialWhyText = "",
  onSaveWhyEsports,
  onSaveYourWhy,
  isSaving,
}: StepZeroWhyEsportsProps) {
  const [selections, setSelections] = useState<string[]>(initialSelections);
  const [whyEsportsSaved, setWhyEsportsSaved] = useState(
    initialSelections.length > 0,
  );
  const [yourWhy, setYourWhy] = useState(initialWhyText);
  const [yourWhySaved, setYourWhySaved] = useState(initialWhyText.length > 0);

  const wordCount = yourWhy.trim().split(/\s+/).filter(Boolean).length;

  const toggleSelection = (id: string) => {
    setSelections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      {/* Phase 1: Why Esports */}
      {!whyEsportsSaved ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent>
            <h3 className="font-orbitron text-lg font-bold text-white">
              Why Esports
            </h3>
            <p className="mt-2 font-rajdhani text-sm text-white/40">
              What draws you to esports? Select all that apply.
            </p>

            <div className="mt-5 space-y-3">
              {WHY_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  onClick={() => toggleSelection(option.id)}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-all",
                    selections.includes(option.id)
                      ? "border-blue-500/50 bg-blue-500/10 text-white"
                      : "border-white/10 text-white/60 hover:border-white/20 hover:bg-white/[0.03]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                      selections.includes(option.id)
                        ? "border-blue-500 bg-blue-500"
                        : "border-white/20",
                    )}
                  >
                    {selections.includes(option.id) && (
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="font-rajdhani text-sm font-medium">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            <Button
              onClick={async () => {
                await onSaveWhyEsports(selections);
                setWhyEsportsSaved(true);
              }}
              disabled={selections.length === 0 || isSaving}
              className={cn(
                "mt-5 w-full font-rajdhani text-sm font-bold uppercase tracking-wider",
                selections.length > 0
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "opacity-50 cursor-not-allowed",
              )}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Phase 2: Your Why */
        <Card className="border-white/10 bg-white/5">
          <CardContent>
            {!yourWhySaved ? (
              <>
                <h3 className="font-orbitron text-lg font-bold text-white">
                  Your Why
                </h3>
                <p className="mt-2 font-rajdhani text-sm text-white/40">
                  Write your why in 15 words or less. What drives you?
                </p>

                <div className="mt-4">
                  <Textarea
                    value={yourWhy}
                    onChange={(e) => {
                      const words = e.target.value
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean);
                      if (words.length <= 15 || e.target.value.length < yourWhy.length) {
                        setYourWhy(e.target.value);
                      }
                    }}
                    placeholder="I want to..."
                    rows={3}
                    className="border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                  />
                  <div className="mt-1 text-right font-mono text-[10px] text-white/30">
                    {wordCount}/15 words
                  </div>
                </div>

                <Button
                  onClick={async () => {
                    await onSaveYourWhy(yourWhy.trim());
                    setYourWhySaved(true);
                  }}
                  disabled={wordCount === 0 || isSaving}
                  className={cn(
                    "mt-3 w-full font-rajdhani text-sm font-bold uppercase tracking-wider",
                    wordCount > 0
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                      : "opacity-50 cursor-not-allowed",
                  )}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mt-3 font-orbitron text-base font-bold text-white">
                  Step Complete!
                </h3>
                <p className="mt-1 font-rajdhani text-sm text-white/40">
                  Your why: &ldquo;{yourWhy}&rdquo;
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
