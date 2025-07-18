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
  onConnect,
}: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-6 text-center">
        <div className="mb-4">
          <ClockIcon className="w-12 h-12 mx-auto text-yellow-400 mb-3" />
          <h4 className="text-lg font-orbitron font-semibold text-yellow-300 mb-2">
            {gameName} Analytics Coming Soon
          </h4>
          <p className="text-yellow-200 font-rajdhani text-sm max-w-md mx-auto mb-4">
            We&apos;re working hard to bring you comprehensive statistics and performance analytics for {gameName}.
          </p>
          {!isConnected && (
            <>
              <p className="text-yellow-300 font-rajdhani text-xs mb-4">
                Connect your {platform === 'startgg' ? 'start.gg' : gameName} account now to be ready when analytics launch!
              </p>
              {onConnect ? (
                <Button
                  onClick={onConnect}
                  variant="outline"
                  className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10"
                >
                  Connect {platform === 'startgg' ? 'start.gg' : gameName} Account
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Link href="/dashboard/player/profile/external-accounts">
                  <Button
                    variant="outline"
                    className="border-yellow-400/50 text-yellow-400 hover:border-yellow-400 hover:bg-yellow-500/10"
                  >
                    Connect {platform === 'startgg' ? 'start.gg' : gameName} Account
                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </>
          )}
          {isConnected && (
            <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-300 font-rajdhani text-sm">
                  {gameName} account connected - you&apos;re ready for analytics!
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