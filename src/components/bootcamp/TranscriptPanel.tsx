"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Cue {
  start: number;
  end: number;
  speaker: string | null;
  text: string;
}

interface TranscriptPanelProps {
  vttUrl: string | null | undefined;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

function parseVtt(vtt: string): Cue[] {
  const blocks = vtt.replace(/\r\n/g, "\n").split(/\n\n+/);
  const cues: Cue[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").filter(Boolean);
    const tsLine = lines.find((l) => l.includes("-->"));
    if (!tsLine) continue;
    const [startRaw, endRaw] = tsLine.split("-->").map((s) => s.trim());
    const start = toSeconds(startRaw ?? "");
    const end = toSeconds(endRaw ?? "");
    if (Number.isNaN(start) || Number.isNaN(end)) continue;

    const textLines = lines.slice(lines.indexOf(tsLine) + 1);
    const textJoined = textLines.join(" ").trim();
    const speakerMatch = /<v\s+([^>]+)>([\s\S]*?)<\/v>/.exec(textJoined);
    const speaker = speakerMatch ? speakerMatch[1]!.trim() : null;
    const text = speakerMatch
      ? speakerMatch[2]!.trim()
      : textJoined.replace(/<[^>]+>/g, "").trim();

    if (text) cues.push({ start, end, speaker, text });
  }
  return cues;
}

function toSeconds(ts: string): number {
  const parts = ts.split(":").map(Number);
  if (parts.length === 2) {
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  }
  if (parts.length === 3) {
    return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
  }
  return NaN;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TranscriptPanel({
  vttUrl,
  currentTime,
  onSeek,
}: TranscriptPanelProps) {
  const [cues, setCues] = useState<Cue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const userScrolledAtRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const activeCueElRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!vttUrl) {
      setCues(null);
      return;
    }
    let cancelled = false;
    setError(null);
    setCues(null);
    fetch(vttUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (!cancelled) setCues(parseVtt(text));
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load transcript");
      });
    return () => {
      cancelled = true;
    };
  }, [vttUrl]);

  const filtered = useMemo(() => {
    if (!cues) return null;
    if (!query.trim()) return cues;
    const q = query.toLowerCase();
    return cues.filter((c) => c.text.toLowerCase().includes(q));
  }, [cues, query]);

  const activeIndex = useMemo(() => {
    if (!cues) return -1;
    for (let i = 0; i < cues.length; i++) {
      const c = cues[i]!;
      if (currentTime >= c.start && currentTime < c.end) return i;
    }
    return -1;
  }, [cues, currentTime]);

  useEffect(() => {
    if (activeIndex < 0 || !activeCueElRef.current) return;
    const recentlyScrolled = Date.now() - userScrolledAtRef.current < 3000;
    if (recentlyScrolled) return;
    activeCueElRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeIndex]);

  const handleUserScroll = () => {
    userScrolledAtRef.current = Date.now();
  };

  if (!vttUrl) {
    return (
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-6 text-sm text-white/40">
        No transcript available for this lesson.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-lg border border-white/[0.06] bg-[#08080c]">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <span className="font-orbitron text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          Transcript
        </span>
        <div className="ml-auto flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-2 py-1">
          <Search className="h-3 w-3 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-24 bg-transparent text-xs text-white placeholder:text-white/20 focus:outline-none"
          />
        </div>
      </div>

      <div
        ref={listRef}
        onScroll={handleUserScroll}
        className="max-h-[540px] flex-1 overflow-y-auto px-2 py-2"
      >
        {error && (
          <div className="px-3 py-4 text-xs text-red-400/70">
            Could not load transcript ({error}).
          </div>
        )}

        {!cues && !error && (
          <div className="space-y-2 px-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-6 animate-pulse rounded bg-white/[0.04]"
              />
            ))}
          </div>
        )}

        {filtered?.length === 0 && (
          <div className="px-3 py-4 text-xs text-white/30">
            No cues match &ldquo;{query}&rdquo;.
          </div>
        )}

        {filtered?.map((cue, i) => {
          const isActive =
            cues && activeIndex >= 0 && cues[activeIndex] === cue;
          return (
            <button
              key={`${cue.start}-${i}`}
              ref={isActive ? activeCueElRef : null}
              onClick={() => onSeek(cue.start)}
              className={cn(
                "group block w-full rounded-md px-3 py-2 text-left transition-colors",
                isActive
                  ? "bg-blue-500/10 ring-1 ring-blue-400/30"
                  : "hover:bg-white/[0.03]",
              )}
            >
              <div className="flex items-baseline gap-2">
                {cue.speaker && (
                  <span
                    className={cn(
                      "rounded-sm px-1.5 py-0.5 font-orbitron text-[9px] font-bold uppercase tracking-wider",
                      isActive
                        ? "bg-blue-400/20 text-blue-200"
                        : "bg-white/[0.04] text-white/50",
                    )}
                  >
                    {cue.speaker}
                  </span>
                )}
                <span className="font-mono text-[10px] text-white/25">
                  {formatTime(cue.start)}
                </span>
              </div>
              <p
                className={cn(
                  "mt-1 text-sm leading-relaxed",
                  isActive ? "text-white" : "text-white/60",
                )}
              >
                {cue.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
