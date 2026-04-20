"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Track,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

export interface BootcampVideoPlayerHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  videoUrl: string;
  hlsUrl?: string | null;
  posterUrl?: string | null;
  captionUrl?: string | null;
  lastPositionSeconds?: number | null;
  durationSeconds?: number | null;
  isWatched: boolean;
  isLoading?: boolean;
  onWatched: () => void;
  onSavePosition?: (seconds: number) => void;
  onTimeUpdate?: (seconds: number) => void;
}

const WATCHED_FRACTION = 0.95;
const POSITION_SAVE_INTERVAL_SECONDS = 5;

export const VideoPlayer = forwardRef<
  BootcampVideoPlayerHandle,
  VideoPlayerProps
>(function VideoPlayer(
  {
    videoUrl,
    hlsUrl,
    posterUrl,
    captionUrl,
    lastPositionSeconds,
    durationSeconds,
    isWatched,
    isLoading,
    onWatched,
    onSavePosition,
    onTimeUpdate,
  },
  ref,
) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const watchedFiredRef = useRef(isWatched);
  const lastSavedAtRef = useRef(0);
  const resumedRef = useRef(false);

  useImperativeHandle(ref, () => ({
    seekTo(seconds: number) {
      const p = playerRef.current;
      if (!p) return;
      p.currentTime = Math.max(0, seconds);
      void p.play().catch(() => {});
    },
    getCurrentTime() {
      return playerRef.current?.currentTime ?? 0;
    },
  }));

  const handleLoadedMetadata = useCallback(() => {
    if (resumedRef.current) return;
    const p = playerRef.current;
    if (!p) return;
    const duration = p.state.duration || durationSeconds || 0;
    const resumeAt = lastPositionSeconds ?? 0;
    if (resumeAt > 5 && duration > 0 && resumeAt < duration - 5) {
      p.currentTime = resumeAt;
    }
    resumedRef.current = true;
  }, [lastPositionSeconds, durationSeconds]);

  const handleTimeUpdate = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const t = p.state.currentTime;
    const d = p.state.duration || durationSeconds || 0;

    onTimeUpdate?.(t);

    if (!watchedFiredRef.current && d > 0 && t / d >= WATCHED_FRACTION) {
      watchedFiredRef.current = true;
      onWatched();
    }

    if (
      onSavePosition &&
      t - lastSavedAtRef.current >= POSITION_SAVE_INTERVAL_SECONDS
    ) {
      lastSavedAtRef.current = t;
      onSavePosition(Math.floor(t));
    }
  }, [durationSeconds, onTimeUpdate, onWatched, onSavePosition]);

  const handlePause = useCallback(() => {
    const p = playerRef.current;
    if (p && onSavePosition) {
      onSavePosition(Math.floor(p.state.currentTime));
    }
  }, [onSavePosition]);

  useEffect(() => {
    if (!onSavePosition) return;
    const flush = () => {
      const p = playerRef.current;
      if (p) onSavePosition(Math.floor(p.state.currentTime));
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [onSavePosition]);

  const src = hlsUrl
    ? [{ src: hlsUrl, type: "application/x-mpegurl" as const }]
    : [{ src: videoUrl, type: "video/mp4" as const }];

  return (
    <div className="space-y-3">
      <MediaPlayer
        ref={playerRef}
        src={src}
        poster={posterUrl ?? undefined}
        crossOrigin
        playsInline
        streamType="on-demand"
        viewType="video"
        className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPause={handlePause}
      >
        <MediaProvider>
          {posterUrl && (
            <Poster src={posterUrl} alt="" className="vds-poster" />
          )}
          {captionUrl && (
            <Track
              src={captionUrl}
              kind="captions"
              label="English"
              language="en"
              default
            />
          )}
        </MediaProvider>
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>

      <div className="flex items-center justify-between">
        {!isWatched ? (
          <Button variant="outline" onClick={onWatched} disabled={isLoading}>
            {isLoading ? (
              "Saving..."
            ) : (
              <>
                <Check className="h-4 w-4 text-blue-400" />
                Mark as watched
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <span className="text-green-400">Watched</span>
          </div>
        )}
      </div>
    </div>
  );
});
