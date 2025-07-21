import React from "react";
import { LoaderIcon } from "lucide-react";
import type { LoadingStateProps } from "../types";
import {
  formatLoadingMessage,
  formatLoadingSubMessage,
} from "../utils/statsFormatters";

export function LoadingState({ game, message }: LoadingStateProps) {
  const defaultMessage = formatLoadingMessage(game);
  const subMessage = formatLoadingSubMessage(game);

  const gameColors = {
    valorant: "text-red-400",
    "rocket-league": "text-orange-400",
    smash: "text-purple-400",
    overwatch: "text-blue-400",
  };

  const gameBgColors = {
    valorant: "bg-red-900/20 border-red-700/30",
    "rocket-league": "bg-orange-900/20 border-orange-700/30",
    smash: "bg-purple-900/20 border-purple-700/30",
    overwatch: "bg-blue-900/20 border-blue-700/30",
  };

  return (
    <div className="space-y-6">
      <div className={`${gameBgColors[game]} rounded-lg border p-4`}>
        <div className="flex items-start gap-3">
          <LoaderIcon
            className={`h-5 w-5 ${gameColors[game]} mt-0.5 animate-spin`}
          />
          <div>
            <h4
              className={`font-orbitron text-sm font-semibold ${gameColors[game]} mb-2`}
            >
              {message ?? defaultMessage}
            </h4>
            <p className="font-rajdhani text-xs text-gray-200">{subMessage}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingState;
