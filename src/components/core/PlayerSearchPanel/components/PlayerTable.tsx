"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  ExternalLink,
  MoreHorizontal,
  GraduationCap,
  MapPin,
  Copy,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PlayerSearchResult } from "../types";

interface PlayerTableProps {
  players: PlayerSearchResult[];
  isLoading: boolean;
  onPlayerClick: (player: PlayerSearchResult) => void;
  onFavoriteToggle: (player: PlayerSearchResult) => void;
  isPending: (id: string) => boolean;
}

export function PlayerTable({
  players,
  isLoading,
  onPlayerClick,
  onFavoriteToggle,
  isPending,
}: PlayerTableProps) {
  if (isLoading) {
    return <PlayerTableSkeleton />;
  }

  if (players.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      {/* Table Header */}
      <div className="border-b border-white/10 bg-white/5 px-6 py-3">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
          <div className="col-span-4">Player</div>
          <div className="col-span-2">School</div>
          <div className="col-span-2">Academics</div>
          <div className="col-span-2">EVAL Scores</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-white/5">
        {players.map((player) => (
          <PlayerRow
            key={player.id}
            player={player}
            onClick={() => onPlayerClick(player)}
            onFavoriteToggle={() => onFavoriteToggle(player)}
            isPending={isPending(player.id)}
          />
        ))}
      </div>
    </div>
  );
}

// Individual player row component
function PlayerRow({
  player,
  onClick,
  onFavoriteToggle,
  isPending,
}: {
  player: PlayerSearchResult;
  onClick: () => void;
  onFavoriteToggle: () => void;
  isPending: boolean;
}) {
  const gpa = player.academicInfo?.gpa
    ? parseFloat(String(player.academicInfo.gpa))
    : null;

  const combineScore = player.gameProfiles[0]?.combine_score;
  const leagueScore = player.gameProfiles[0]?.league_score;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(player.email);
    toast.success("Email copied to clipboard");
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group grid cursor-pointer grid-cols-12 items-center gap-4 px-6 py-4",
        "transition-colors duration-150",
        "hover:bg-white/[0.03]"
      )}
    >
      {/* Player Info */}
      <div className="col-span-4 flex items-center gap-4">
        <Avatar className="h-11 w-11 ring-2 ring-white/10 transition-all group-hover:ring-cyan-500/30">
          <AvatarImage
            src={player.imageUrl ?? undefined}
            alt={`${player.firstName} ${player.lastName}`}
          />
          <AvatarFallback className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 font-semibold text-white">
            {player.firstName?.charAt(0)}
            {player.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-white group-hover:text-cyan-400">
              {player.firstName} {player.lastName}
            </span>
            {player.isFavorited && (
              <Bookmark className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
            )}
          </div>
          <div className="truncate text-sm text-gray-500">
            @{player.username ?? "No username"}
          </div>
        </div>
      </div>

      {/* School */}
      <div className="col-span-2">
        <div className="truncate font-medium text-gray-300">
          {player.schoolRef?.name ?? player.school ?? "—"}
        </div>
        {player.location && (
          <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{player.location}</span>
          </div>
        )}
      </div>

      {/* Academics */}
      <div className="col-span-2">
        <div className="flex items-center gap-1.5 text-sm text-gray-300">
          <GraduationCap className="h-4 w-4 text-gray-500" />
          <span>
            {player.academicInfo?.classYear
              ? isNaN(Number(player.academicInfo.classYear))
                ? player.academicInfo.classYear
                : `'${player.academicInfo.classYear.slice(-2)}`
              : "—"}
          </span>
        </div>
        <div className="mt-1 text-sm">
          <span className="text-gray-500">GPA: </span>
          <span
            className={cn(
              "font-medium",
              gpa ? (gpa >= 3.5 ? "text-green-400" : gpa >= 3.0 ? "text-yellow-400" : "text-gray-300") : "text-gray-500"
            )}
          >
            {gpa?.toFixed(2) ?? "—"}
          </span>
        </div>
      </div>

      {/* EVAL Scores */}
      <div className="col-span-2">
        <div className="flex items-center gap-4">
          <ScoreBadge label="C" value={combineScore} color="cyan" />
          <ScoreBadge label="L" value={leagueScore} color="green" />
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          disabled={isPending}
          className={cn(
            "h-9 w-9 cursor-pointer rounded-lg p-0 transition-all",
            player.isFavorited
              ? "text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300"
              : "text-gray-500 hover:bg-white/10 hover:text-white"
          )}
        >
          <Bookmark
            className={cn(
              "h-4 w-4 transition-all",
              player.isFavorited && "fill-current",
              isPending && "animate-pulse"
            )}
          />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="h-9 w-9 cursor-pointer rounded-lg p-0 text-gray-500 hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              className="h-9 w-9 cursor-pointer rounded-lg p-0 text-gray-500 hover:bg-white/10 hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border-white/10 bg-[#1a1a2e]"
          >
            <DropdownMenuItem
              onClick={handleCopyEmail}
              className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `mailto:${player.email}`;
              }}
              className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white"
            >
              <Mail className="mr-2 h-4 w-4" />
              Send email
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="cursor-pointer text-gray-300 focus:bg-white/10 focus:text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View full profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Score badge component
function ScoreBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null | undefined;
  color: "cyan" | "green";
}) {
  const colorClasses = {
    cyan: "text-cyan-400",
    green: "text-green-400",
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className={cn("text-sm font-semibold", value ? colorClasses[color] : "text-gray-600")}>
        {value?.toFixed(1) ?? "—"}
      </span>
    </div>
  );
}

// Loading skeleton
function PlayerTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
      <div className="border-b border-white/10 bg-white/5 px-6 py-3">
        <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
          <div className="col-span-4">Player</div>
          <div className="col-span-2">School</div>
          <div className="col-span-2">Academics</div>
          <div className="col-span-2">EVAL Scores</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse px-6 py-4">
            <div className="grid grid-cols-12 items-center gap-4">
              <div className="col-span-4 flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-28 rounded bg-white/10" />
                  <div className="h-3 w-20 rounded bg-white/5" />
                </div>
              </div>
              <div className="col-span-2">
                <div className="h-4 w-24 rounded bg-white/10" />
              </div>
              <div className="col-span-2 space-y-2">
                <div className="h-4 w-16 rounded bg-white/10" />
                <div className="h-3 w-12 rounded bg-white/5" />
              </div>
              <div className="col-span-2">
                <div className="h-4 w-20 rounded bg-white/10" />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <div className="h-9 w-9 rounded bg-white/10" />
                <div className="h-9 w-9 rounded bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
        <GraduationCap className="h-8 w-8 text-gray-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">No players found</h3>
      <p className="mx-auto max-w-sm text-gray-500">
        Try adjusting your search terms or filters to find more players.
      </p>
    </div>
  );
}
