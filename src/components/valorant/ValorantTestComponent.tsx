'use client';

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoaderIcon, RefreshCwIcon, ShieldIcon } from "lucide-react";

export function ValorantTestComponent() {
  const { data: valorantData, isLoading, refetch } = api.playerProfile.getValorantData.useQuery();
  const refreshMutation = api.playerProfile.refreshValorantData.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <LoaderIcon className="h-4 w-4 animate-spin" />
          <span>Loading Valorant data...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldIcon className="h-5 w-5 text-red-500" />
          Valorant Integration Test
        </h3>
        <Button
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
          size="sm"
          variant="outline"
        >
          {refreshMutation.isPending ? (
            <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCwIcon className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {valorantData ? (
        <div className="space-y-3">
          <Badge className="bg-green-600 text-white">
            PUUID Connected
          </Badge>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Riot ID:</span>
              <p className="text-cyan-400 font-medium">
                {valorantData.gameName}#{valorantData.tagLine}
              </p>
            </div>
            <div>
              <span className="text-gray-400">PUUID:</span>
              <p className="text-white font-mono text-xs">
                {valorantData.puuid}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Last Updated:</span>
              <p className="text-white">
                {new Date(valorantData.lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400 mb-2">No Valorant data found</p>
          <p className="text-gray-500 text-sm">
            Connect your Valorant account in External Accounts to see data here
          </p>
        </div>
      )}

      {refreshMutation.error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-lg">
          <p className="text-red-400 text-sm">
            Error: {refreshMutation.error.message}
          </p>
        </div>
      )}
    </Card>
  );
} 