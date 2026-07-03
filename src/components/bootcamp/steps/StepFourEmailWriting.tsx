"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EMAIL_SECTIONS = [
  {
    key: "who_you_are",
    label: "Who You Are",
    description: "Your name, grade, school, and location.",
    placeholder: "My name is..., I'm a [grade] at [school] in [city, state].",
  },
  {
    key: "what_you_play",
    label: "What You Play",
    description: "Your main game(s), role, and competitive level or rank.",
    placeholder: "I compete in [game] as a [role], currently ranked...",
  },
  {
    key: "your_experience",
    label: "Your Experience",
    description: "Teams, leadership roles, championships, or notable results.",
    placeholder: "I've competed with [team] and achieved...",
  },
  {
    key: "academics_character",
    label: "Your Academics & Character",
    description: "GPA, leadership, work ethic, and growth mindset.",
    placeholder: "I maintain a [GPA] while balancing...",
  },
  {
    key: "why_reaching_out",
    label: "Why You're Reaching Out",
    description: "Express interest in their program and ask for a conversation.",
    placeholder: "I'm reaching out because I'm very interested in your program at...",
  },
];

interface StepFourEmailWritingProps {
  initialData?: {
    email_draft?: Record<string, string>;
    email_signature?: string;
  };
  onSave: (data: Record<string, unknown>) => Promise<void>;
  isSaving: boolean;
}

export function StepFourEmailWriting({
  initialData,
  onSave,
  isSaving,
}: StepFourEmailWritingProps) {
  const [phase, setPhase] = useState<"learn" | "write" | "complete">(
    initialData?.email_draft &&
      Object.values(initialData.email_draft).every((v) => v?.trim())
      ? "complete"
      : "learn",
  );
  const [emailDraft, setEmailDraft] = useState<Record<string, string>>(
    initialData?.email_draft ?? {},
  );
  const [signature, setSignature] = useState(
    initialData?.email_signature ?? "",
  );

  const allSectionsFilled = EMAIL_SECTIONS.every(
    (s) => emailDraft[s.key]?.trim(),
  );

  if (phase === "complete") {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-3 font-orbitron text-base font-bold text-white">
            Email Writing Complete!
          </h3>
          <p className="mt-1 font-rajdhani text-sm text-white/40">
            Your outreach email has been saved. You&apos;re ready to connect with coaches!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (phase === "learn") {
    return (
      <div className="space-y-4">
        <Card className="border-white/10 bg-white/5">
          <CardContent>
            <h3 className="font-orbitron text-lg font-bold text-white">
              College Outreach Email
            </h3>
            <p className="mt-2 font-rajdhani text-sm text-white/40">
              Your email should have 5 key sections. Let&apos;s learn what each one needs.
            </p>

            <div className="mt-5 space-y-3">
              {EMAIL_SECTIONS.map((section) => (
                <div
                  key={section.key}
                  className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <div className="font-rajdhani text-sm font-bold text-white">
                    {section.label}
                  </div>
                  <div className="mt-0.5 font-rajdhani text-xs text-white/40">
                    {section.description}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setPhase("write")}
              className="mt-5 w-full bg-gradient-to-r from-blue-600 to-purple-600 font-rajdhani text-sm font-bold uppercase tracking-wider text-white hover:from-blue-500 hover:to-purple-500"
            >
              Now Let&apos;s Practice Making Some Emails
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Write phase
  return (
    <div className="space-y-4">
      <Card className="border-white/10 bg-white/5">
        <CardContent>
          <h3 className="font-orbitron text-lg font-bold text-white">
            Time to Write Your Email!
          </h3>
          <p className="mt-2 font-rajdhani text-sm text-white/40">
            Fill in each section to craft your outreach email.
          </p>

          <div className="mt-5 space-y-5">
            {EMAIL_SECTIONS.map((section) => (
              <div key={section.key}>
                <div className="flex items-baseline justify-between">
                  <label className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/50">
                    {section.label}
                  </label>
                  <span className="font-rajdhani text-[10px] text-white/20">
                    {section.description}
                  </span>
                </div>
                <Textarea
                  value={emailDraft[section.key] ?? ""}
                  onChange={(e) =>
                    setEmailDraft((prev) => ({
                      ...prev,
                      [section.key]: e.target.value,
                    }))
                  }
                  placeholder={section.placeholder}
                  rows={2}
                  className="mt-1 border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
                />
              </div>
            ))}

            {/* Signature */}
            <div>
              <label className="font-rajdhani text-xs font-semibold uppercase tracking-wider text-white/50">
                Sign Your Name
              </label>
              <Input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Your full name"
                className="mt-1 border-white/10 bg-white/[0.03] text-sm text-white placeholder-white/20 focus-visible:border-blue-500/50 focus-visible:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Button
              variant="outline"
              onClick={() => setPhase("learn")}
              className="flex-1 border-white/10 bg-transparent font-rajdhani text-xs font-bold uppercase tracking-wider text-white/50 hover:bg-white/[0.03] hover:text-white"
            >
              Back
            </Button>
            <Button
              onClick={async () => {
                await onSave({
                  email_draft: emailDraft,
                  email_signature: signature,
                });
                setPhase("complete");
              }}
              disabled={!allSectionsFilled || isSaving}
              className={cn(
                "flex-1 font-rajdhani text-sm font-bold uppercase tracking-wider",
                allSectionsFilled
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                  : "opacity-50 cursor-not-allowed",
              )}
            >
              {isSaving ? "Saving..." : "Save Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
