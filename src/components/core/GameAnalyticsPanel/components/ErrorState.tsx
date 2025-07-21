import React from "react";
import { InfoIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ErrorStateProps } from "../types";
import { getErrorMessage } from "../utils/statsFormatters";
import {
  getConnectionUrl,
  getConnectAccountText,
} from "../utils/connectionDetection";

export function ErrorState({
  game,
  error,
  message,
  onRetry,
  onConnect,
}: ErrorStateProps) {
  const errorMessage = getErrorMessage(error, message);
  const connectionUrl = getConnectionUrl(game);
  const connectText = getConnectAccountText(game);

  const _gameColors = {
    valorant: "text-red-400",
    "rocket-league": "text-orange-400",
    smash: "text-purple-400",
    overwatch: "text-blue-400",
  };

  const gameBgColors = {
    valorant: "bg-red-900/20 border-red-700/30",
    "rocket-league": "bg-red-900/20 border-red-700/30",
    smash: "bg-red-900/20 border-red-700/30",
    overwatch: "bg-red-900/20 border-red-700/30",
  };

  const isConnectionError =
    errorMessage.toLowerCase().includes("hasn't connected") ||
    errorMessage.toLowerCase().includes("not connected") ||
    errorMessage.toLowerCase().includes("connect your");

  return (
    <div className="space-y-6">
      <div className={`${gameBgColors[game]} rounded-lg border p-4`}>
        <div className="flex items-start gap-3">
          {isConnectionError ? (
            <InfoIcon className="mt-0.5 h-5 w-5 text-red-400" />
          ) : (
            <XIcon className="mt-0.5 h-5 w-5 text-red-400" />
          )}
          <div>
            <h4 className="font-orbitron mb-2 text-sm font-semibold text-red-300">
              {isConnectionError
                ? `${game.charAt(0).toUpperCase() + game.slice(1)} Stats Unavailable`
                : `Failed to Load ${game.charAt(0).toUpperCase() + game.slice(1)} Statistics`}
            </h4>
            <p className="font-rajdhani mb-3 text-xs text-red-200">
              {errorMessage}
            </p>

            <div className="flex gap-2">
              {isConnectionError ? (
                onConnect ? (
                  <Button
                    onClick={onConnect}
                    variant="outline"
                    size="sm"
                    className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                  >
                    {connectText}
                  </Button>
                ) : (
                  <Link href={connectionUrl}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                    >
                      {connectText}
                    </Button>
                  </Link>
                )
              ) : (
                onRetry && (
                  <Button
                    onClick={onRetry}
                    variant="outline"
                    size="sm"
                    className="border-red-400/50 text-red-400 hover:border-red-400 hover:bg-red-500/10"
                  >
                    Retry
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorState;
