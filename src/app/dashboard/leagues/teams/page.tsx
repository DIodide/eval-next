"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrophyIcon, PlusIcon, UsersIcon, TargetIcon } from "lucide-react";

export default function LeagueTeamsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            Manage Teams
          </h1>
          <p className="text-gray-400 mt-2">
            Organize teams, manage rosters, and track performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Teams
            </CardTitle>
            <TrophyIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">
              Registered teams
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Active Players
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">
              Across all teams
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Matches Played
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
              Top Team
            </CardTitle>
            <TrophyIcon className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">
              Best record
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Teams List */}
      <Card className="bg-[#1a1a2e] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">League Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-16">
            <TrophyIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-medium">No teams found</p>
            <p className="text-sm">Teams will appear here once they register for your league</p>
            <Button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add First Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 