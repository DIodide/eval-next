import React from "react";
import { ClockIcon, ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { GameComponentProps } from "../../types";

interface ComingSoonProps extends GameComponentProps {
  gameName: string;
  gameId: string;
  platform: string;
}

export function ComingSoon({
  gameName,
  gameId: _gameId,
  platform,
  isConnected,
  viewMode = "self",
  showInfoPanel: _showInfoPanel = true, // Include for consistency but not used
  size = "default",
  onConnect,
}: ComingSoonProps) {
  // Compact mode for embedding in smaller spaces
  if (size === "compact") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/20 p-4 text-center">
          <ClockIcon className="mx-auto mb-2 h-8 w-8 text-yellow-400" />
          <h4 className="font-orbitron mb-1 text-sm font-semibold text-yellow-300">
            {gameName} Coming Soon
          </h4>
          <p className="font-rajdhani text-xs text-yellow-200">
            Analytics in development
          </p>
          {!isConnected && viewMode === "self" && (
            <div className="mt-3">
              {onConnect ? (
                <Button
                  onClick={onConnect}
                  variant="outline"
                  size="sm"
                  className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10"
                >
                  Connect Account
                </Button>
              ) : (
                <Link href="/dashboard/player/profile/external-accounts">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10"
                  >
                    Connect Account
                  </Button>
                </Link>
              )}
            </div>
          )}
          {isConnected && (
            <div className="mt-3 rounded-lg border border-green-700/30 bg-green-900/20 p-2">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="font-rajdhani text-xs text-green-300">
                  Account Connected
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-yellow-700/30 bg-yellow-900/20 p-6 text-center">
        <div className="mb-4">
          <ClockIcon className="mx-auto mb-3 h-12 w-12 text-yellow-400" />
          <h4 className="font-orbitron mb-2 text-lg font-semibold text-yellow-300">
            {gameName} Analytics Coming Soon
          </h4>
          <p className="font-rajdhani mx-auto mb-4 max-w-md text-sm text-yellow-200">
            We&apos;re working hard to bring you comprehensive statistics and
            performance analytics for {gameName}.
          </p>
          {!isConnected && (
            <>
              <p className="font-rajdhani mb-4 text-xs text-yellow-300">
                {viewMode === "other"
                  ? `This player hasn't connected their ${platform === "startgg" ? "start.gg" : gameName} account yet.`
                  : `Connect your ${platform === "startgg" ? "start.gg" : gameName} account now to be ready when analytics launch!`}
              </p>
              {viewMode === "self" &&
                (onConnect ? (
                  <Button
                    onClick={onConnect}
                    variant="outline"
                    className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10"
                  >
                    Connect {platform === "startgg" ? "start.gg" : gameName}{" "}
                    Account
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Link href="/dashboard/player/profile/external-accounts">
                    <Button
                      variant="outline"
                      className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10"
                    >
                      Connect {platform === "startgg" ? "start.gg" : gameName}{" "}
                      Account
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ))}
            </>
          )}
          {isConnected && (
            <div className="mt-4 rounded-lg border border-green-700/30 bg-green-900/20 p-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="font-rajdhani text-sm text-green-300">
                  {viewMode === "other"
                    ? `This player has connected their ${gameName} account - ready for analytics!`
                    : `${gameName} account connected - you're ready for analytics!`}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComingSoon;
