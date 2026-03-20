"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, PenLine } from "lucide-react";

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
      <Card className="border-green-500/30 bg-green-500/5">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <p className="font-semibold text-green-400">Reflection Submitted</p>
          </div>
          {existingText && (
            <p className="text-sm text-gray-300 italic">
              &quot;{existingText.slice(0, 200)}
              {existingText.length > 200 ? "..." : ""}&quot;
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-rajdhani text-xl">
          <PenLine className="h-5 w-5 text-blue-400" />
          Written Reflection (Required)
        </CardTitle>
        <p className="text-sm text-gray-400">
          In 3-5 sentences, explain: Who are you doing this for? What standard
          are you holding yourself to? Why is this important to you beyond
          esports?
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your answer should be personal, specific, and honest. This will serve as your foundation throughout the rest of the Bootcamp..."
          className="min-h-[150px] border-white/10 bg-white/5 text-white placeholder:text-gray-500"
          maxLength={5000}
        />
        <div className="flex items-center justify-between">
          <p
            className={`text-sm ${
              charCount < 100
                ? "text-gray-500"
                : charCount > 5000
                  ? "text-red-400"
                  : "text-green-400"
            }`}
          >
            {charCount}/5000 characters{" "}
            {charCount < 100 && `(${100 - charCount} more needed)`}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Reflection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
