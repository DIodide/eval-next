"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  onWatched: () => void;
  isWatched: boolean;
  isLoading?: boolean;
}

export function VideoPlayer({
  videoUrl,
  onWatched,
  isWatched,
  isLoading,
}: VideoPlayerProps) {
  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        <video
          className="h-full w-full"
          controls
          preload="metadata"
          onEnded={() => {
            if (!isWatched) onWatched();
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {!isWatched && (
        <Button
          onClick={onWatched}
          disabled={isLoading}
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
        >
          {isLoading ? (
            "Saving..."
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Watched
            </>
          )}
        </Button>
      )}

      {isWatched && (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Video completed
        </div>
      )}
    </div>
  );
}
