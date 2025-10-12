"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { GSERocketLeagueStats } from "@/types/gse";
import {
  Target,
  Trophy,
  TrendingUp,
  Zap,
  Shield,
  Crosshair,
  Gauge,
  Map,
} from "lucide-react";

interface GSEStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  stats: GSERocketLeagueStats;
}

export function GSEStatsModal({
  isOpen,
  onClose,
  playerName,
  stats,
}: GSEStatsModalProps) {
  const statCategories = [
    {
      title: "Core Statistics",
      icon: Trophy,
      color: "text-yellow-400",
      stats: [
        { label: "Total Games", value: stats.total_games, color: undefined },
        { label: "Wins", value: stats.total_wins, color: undefined },
        { label: "Losses", value: stats.total_losses, color: undefined },
        {
          label: "Win Rate",
          value: `${(stats.win_percentage * 100).toFixed(1)}%`,
          color: undefined,
        },
      ],
    },
    {
      title: "Performance (Per Game)",
      icon: Target,
      color: "text-cyan-400",
      stats: [
        {
          label: "Goals",
          value: stats.goals_per_game.toFixed(2),
          color: undefined,
        },
        {
          label: "Assists",
          value: stats.assists_per_game.toFixed(2),
          color: undefined,
        },
        {
          label: "Saves",
          value: stats.saves_per_game.toFixed(2),
          color: undefined,
        },
        {
          label: "Shots",
          value: stats.shots_per_game.toFixed(2),
          color: undefined,
        },
        {
          label: "Demos",
          value: stats.demos_per_game.toFixed(2),
          color: undefined,
        },
        {
          label: "MVPs",
          value: stats.mvps_per_game.toFixed(2),
          color: undefined,
        },
      ],
    },
    {
      title: "Advanced Analytics",
      icon: TrendingUp,
      color: "text-purple-400",
      stats: [
        {
          label: "Shooting %",
          value: `${stats.shooting_percentage.toFixed(1)}%`,
          color: undefined,
        },
        {
          label: "Demo Ratio",
          value: stats.demo_ratio.toFixed(2),
          color: undefined,
        },
        {
          label: "Clutch Rate",
          value: `${(stats.clutch_success_rate * 100).toFixed(1)}%`,
          color: undefined,
        },
        {
          label: "Avg Speed",
          value: `${stats.speed_percentage.toFixed(1)}%`,
          color: undefined,
        },
      ],
    },
    {
      title: "Field Position",
      icon: Map,
      color: "text-orange-400",
      stats: [
        {
          label: "Defensive",
          value: `${stats.percent_defense.toFixed(1)}%`,
          color: "text-blue-400",
        },
        {
          label: "Neutral",
          value: `${stats.percent_neutral.toFixed(1)}%`,
          color: "text-gray-400",
        },
        {
          label: "Offensive",
          value: `${stats.percent_offense.toFixed(1)}%`,
          color: "text-red-400",
        },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-white/10 bg-gradient-to-br from-gray-900 to-gray-950 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron flex items-center gap-3 text-2xl font-bold">
            <Zap className="h-6 w-6 text-blue-400" />
            {playerName}&apos;s Rocket League Stats
          </DialogTitle>
          <div className="flex items-center gap-2 pt-2">
            <Badge className="font-orbitron bg-gradient-to-r from-blue-500 to-blue-600 text-xs">
              Rocket League
            </Badge>
            <Badge className="bg-white/10 font-medium text-gray-300">
              Main Car: {stats.main_car}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {statCategories.map((category, idx) => {
            const IconComponent = category.icon;
            return (
              <div
                key={idx}
                className="rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
              >
                <div className="mb-4 flex items-center gap-2">
                  <IconComponent className={`h-5 w-5 ${category.color}`} />
                  <h3 className="font-orbitron text-sm font-bold tracking-wide text-white">
                    {category.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {category.stats.map((stat, statIdx) => (
                    <div
                      key={statIdx}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-400">
                        {stat.label}
                      </span>
                      <span
                        className={`font-orbitron text-sm font-bold ${stat.color ?? "text-white"}`}
                      >
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Position Distribution Visual */}
        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <h3 className="font-orbitron mb-4 text-sm font-bold tracking-wide text-white">
            Field Position Distribution
          </h3>
          <div className="relative h-8 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="absolute left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600"
              style={{ width: `${stats.percent_defense}%` }}
            />
            <div
              className="absolute h-full bg-gradient-to-r from-gray-500 to-gray-600"
              style={{
                left: `${stats.percent_defense}%`,
                width: `${stats.percent_neutral}%`,
              }}
            />
            <div
              className="absolute right-0 h-full bg-gradient-to-r from-red-500 to-red-600"
              style={{ width: `${stats.percent_offense}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs font-medium">
            <span className="text-blue-400">
              Defense {stats.percent_defense.toFixed(1)}%
            </span>
            <span className="text-gray-400">
              Neutral {stats.percent_neutral.toFixed(1)}%
            </span>
            <span className="text-red-400">
              Offense {stats.percent_offense.toFixed(1)}%
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
