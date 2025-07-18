import React from "react";
import Image from "next/image";
import { CheckCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameSelectorProps } from "../types";

export function GameSelector({
  games,
  selectedGame,
  connections,
  onSelect,
  onKeyDown,
}: GameSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Select game">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => onSelect(game.id)}
          onKeyDown={onKeyDown}
          role="tab"
          aria-selected={selectedGame === game.id}
          aria-controls={`panel-${game.id}`}
          id={`tab-${game.id}`}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg border',
            'transition-all duration-200 font-rajdhani font-medium',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
            selectedGame === game.id
              ? `bg-gradient-to-r ${game.color} border-transparent text-white shadow-lg`
              : 'border-gray-600 text-gray-300 hover:border-gray-500 hover:bg-gray-800/50'
          )}
          aria-label={`View ${game.name} analytics`}
        >
          <Image
            src={game.image}
            alt=""
            width={16}
            height={16}
            className="object-contain"
            aria-hidden="true"
          />
          <span className="text-sm">{game.name}</span>
          {connections[game.id] && (
            <CheckCircleIcon
              className="h-3 w-3"
              aria-label="Connected"
            />
          )}
        </button>
      ))}
    </div>
  );
}

export default GameSelector; 