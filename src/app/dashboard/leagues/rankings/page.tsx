"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3Icon,
  TrendingUpIcon,
  AwardIcon,
  UsersIcon,
  TargetIcon,
} from "lucide-react";

export default function LeagueRankingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            Manage Rankings
          </h1>
          <p className="mt-2 text-gray-400">
            Track player performance, team standings, and league leaderboards
          </p>
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0">
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            disabled
          >
            <TrendingUpIcon className="mr-2 h-4 w-4" />
            Update Rankings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Ranked Players
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">With performance data</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Top Performer
            </CardTitle>
            <AwardIcon className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">Current leader</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Matches Tracked
            </CardTitle>
            <TargetIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">This season</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Last Updated
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">Rankings sync</p>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Player Rankings */}
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <UsersIcon className="h-5 w-5 text-purple-400" />
              Player Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-gray-400">
              <BarChart3Icon className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-lg font-medium">No rankings data</p>
              <p className="text-sm">
                Player rankings will appear here after matches are played
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Team Standings */}
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <AwardIcon className="h-5 w-5 text-yellow-400" />
              Team Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center text-gray-400">
              <TrendingUpIcon className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-lg font-medium">No standings data</p>
              <p className="text-sm">
                Team standings will be calculated based on match results
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview */}
      <Card className="border-gray-800 bg-[#1a1a2e]">
        <CardHeader>
          <CardTitle className="text-white">
            Coming Soon: Advanced Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-gray-400">
              <h3 className="mb-2 font-medium text-white">
                Features planned for this section:
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  Player performance tracking and ELO ratings
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  Team standings with win/loss records
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  Statistical leaderboards (KDA, accuracy, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  Historical performance trends
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-400"></div>
                  Export rankings for tournaments
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
