import {
  ShieldIcon,
  GamepadIcon,
  TrophyIcon,
  TargetIcon,
} from "lucide-react";
import type { GameConfig } from "../types";

export const GAME_CONFIGS: GameConfig[] = [
  {
    id: 'valorant',
    name: 'VALORANT',
    icon: ShieldIcon,
    image: '/valorant/logos/Valorant Logo Red Border.jpg',
    color: 'from-red-500 to-red-600',
    borderColor: 'border-red-500/30',
    platform: 'valorant',
    enabled: true,
  },
  {
    id: 'rocket-league',
    name: 'Rocket League',
    icon: GamepadIcon,
    image: '/rocket-league/logos/Rocket League Emblem.png',
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-500/30',
    platform: 'epicgames',
    enabled: true,
  },
  {
    id: 'smash',
    name: 'Smash Ultimate',
    icon: TrophyIcon,
    image: '/smash/logos/Smash Ball White Logo.png',
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-500/30',
    platform: 'startgg',
    enabled: true,
  },
  {
    id: 'overwatch',
    name: 'Overwatch 2',
    icon: TargetIcon,
    image: '/overwatch/logos/Overwatch 2 Primary Logo.png',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500/30',
    platform: 'battlenet',
    enabled: false, // Coming soon
  },
];

export const PLATFORM_PROVIDER_MAP = {
  valorant: ['custom_valorant', 'valorant'],
  epicgames: ['custom_epic_games', 'epic_games'],
  startgg: ['custom_start_gg', 'start_gg'],
  battlenet: ['custom_battlenet', 'battlenet'],
} as const;

export const DEFAULT_CACHE_STRATEGY = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000,   // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

export const ROCKET_LEAGUE_PLAYLISTS = ['duels', 'doubles', 'standard'] as const;
export type RocketLeaguePlaylist = typeof ROCKET_LEAGUE_PLAYLISTS[number];

export const PLAYLIST_DISPLAY_NAMES = {
  duels: '1v1 Duels',
  doubles: '2v2 Doubles',
  standard: '3v3 Standard',
} as const;

export const GAME_URLS = {
  valorant: '/dashboard/player/profile',
  epicgames: '/dashboard/player/profile/external-accounts',
  startgg: '/dashboard/player/profile/external-accounts',
  battlenet: '/dashboard/player/profile/external-accounts',
} as const;

export const EVAL_SCORE_THRESHOLDS = {
  excellent: 80,
  good: 70,
  average: 50,
  poor: 30,
} as const;

export const WIN_RATE_THRESHOLDS = {
  excellent: 0.7,
  good: 0.6,
  average: 0.5,
  poor: 0.3,
} as const; 