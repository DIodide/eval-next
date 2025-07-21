"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersIcon, PlusIcon, SearchIcon } from "lucide-react";

export default function LeaguePlayersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            Manage Players
          </h1>
          <p className="mt-2 text-gray-400">
            View and manage all players participating in your league
          </p>
        </div>
        <div className="mt-4 flex gap-3 sm:mt-0">
          <Button className="bg-purple-600 text-white hover:bg-purple-700">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Players
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">Active participants</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              New This Season
            </CardTitle>
            <PlusIcon className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">Recent additions</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Top Performers
            </CardTitle>
            <SearchIcon className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">--</div>
            <p className="text-xs text-gray-400">Highest rated</p>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Active Teams
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">0</div>
            <p className="text-xs text-gray-400">With players</p>
          </CardContent>
        </Card>
      </div>

      {/* Players List */}
      <Card className="border-gray-800 bg-[#1a1a2e]">
        <CardHeader>
          <CardTitle className="text-white">League Players</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-16 text-center text-gray-400">
            <UsersIcon className="mx-auto mb-4 h-16 w-16 text-gray-600" />
            <p className="text-lg font-medium">No players found</p>
            <p className="text-sm">
              Players will appear here once they join your league
            </p>
            <Button className="mt-6 bg-purple-600 text-white hover:bg-purple-700">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add First Player
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
