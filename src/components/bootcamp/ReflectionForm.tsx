"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ReflectionFormProps {
  onSubmit: (text: string) => Promise<void>;
  alreadySubmitted: boolean;
  existingText?: string | null;
}

export function ReflectionForm({
  onSubmit,
  alreadySubmitted,
  existingText,
}: ReflectionFormProps) {
  const [text, setText] = useState(existingText ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = text.length;
  const isValid = charCount >= 100 && charCount <= 5000;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onSubmit(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (alreadySubmitted) {
    return (
      <div className="border border-white/[0.08] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-5 w-5 items-center justify-center border border-white/20 bg-white text-black">
            <Check className="h-3 w-3" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-rajdhani text-sm font-semibold text-white/60">
              Reflection Submitted
            </div>
          </div>
        </div>
        {existingText && (
          <p className="mt-3 border-l-2 border-white/[0.06] pl-4 text-[13px] italic text-white/25">
            {existingText.slice(0, 200)}
            {existingText.length > 200 ? "..." : ""}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-mono text-[10px] uppercase tracking-wider text-white/25">
        Written Reflection
      </h3>
      <div className="mt-1 font-rajdhani text-lg font-semibold text-white">
        Write Your Why
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-white/35">
        In 3-5 sentences: Who are you doing this for? What standard are you
        holding yourself to? Why is this important to you beyond esports?
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your answer should be personal, specific, and honest..."
        className="mt-4 min-h-[160px] w-full border border-white/[0.08] bg-transparent px-4 py-3 text-[14px] leading-relaxed text-white/70 placeholder:text-white/15 focus:border-white/20 focus:outline-none"
        maxLength={5000}
      />

      <div className="mt-3 flex items-center justify-between">
        <span
          className={cn(
            "font-mono text-[10px]",
            charCount < 100
              ? "text-white/20"
              : charCount > 5000
                ? "text-red-400/60"
                : "text-white/30",
          )}
        >
          {charCount}
          {charCount < 100 && (
            <span className="text-white/15"> / min 100</span>
          )}
        </span>
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="border border-white/20 bg-white px-5 py-2 font-rajdhani text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {isSubmitting ? "Submitting..." : "Submit Reflection"}
        </button>
      </div>
    </div>
  );
}
