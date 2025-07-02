"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3Icon, TrendingUpIcon, AwardIcon, UsersIcon, TargetIcon } from "lucide-react";

export default function LeagueRankingsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            Manage Rankings
          </h1>
          <p className="text-gray-400 mt-2">
            Track player performance, team standings, and league leaderboards
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" disabled>
            <TrendingUpIcon className="h-4 w-4 mr-2" />
            Update Rankings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Ranked Players
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">
              With performance data
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Top Performer
            </CardTitle>
            <AwardIcon className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">
              Current leader
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Matches Tracked
            </CardTitle>
            <TargetIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">
              This season
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Last Updated
            </CardTitle>
            <BarChart3Icon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">
              Rankings sync
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Player Rankings */}
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UsersIcon className="h-5 w-5 text-purple-400" />
              Player Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-400 py-12">
              <BarChart3Icon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium">No rankings data</p>
              <p className="text-sm">Player rankings will appear here after matches are played</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Standings */}
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AwardIcon className="h-5 w-5 text-yellow-400" />
              Team Standings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-gray-400 py-12">
              <TrendingUpIcon className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium">No standings data</p>
              <p className="text-sm">Team standings will be calculated based on match results</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Preview */}
      <Card className="bg-[#1a1a2e] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Coming Soon: Advanced Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-gray-400">
              <h3 className="text-white font-medium mb-2">Features planned for this section:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Player performance tracking and ELO ratings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Team standings with win/loss records
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Statistical leaderboards (KDA, accuracy, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                  Historical performance trends
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
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