'use client';

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoaderIcon, RefreshCwIcon, ShieldIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

export function ValorantTestComponent() {
  const [testingCleanup, setTestingCleanup] = useState(false);
  const { data: valorantData, isLoading, refetch } = api.playerProfile.getValorantData.useQuery();
  const refreshMutation = api.playerProfile.refreshValorantData.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleTestCleanup = async () => {
    setTestingCleanup(true);
    try {
      const response = await fetch('/api/valorant/cleanup-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json() as { 
        success?: boolean; 
        cleaned?: boolean; 
        message?: string; 
        error?: string;
      };
      
      if (response.ok) {
        console.log('Cleanup result:', data);
        alert(`Cleanup: ${data.message}`);
        void refetch();
      } else {
        console.error('Cleanup failed:', data);
        alert(`Cleanup failed: ${data.error ?? 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      alert('Cleanup test failed');
    } finally {
      setTestingCleanup(false);
    }
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
        <div className="flex gap-2">
          <Button
            onClick={handleTestCleanup}
            disabled={testingCleanup}
            size="sm"
            variant="outline"
            className="border-orange-600 text-orange-400 hover:bg-orange-900/20"
          >
            {testingCleanup ? (
              <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <TrashIcon className="h-4 w-4 mr-2" />
            )}
            Test Cleanup
          </Button>

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
      
      {/* Debug information */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <h4 className="text-blue-200 font-medium mb-2">Debug Instructions:</h4>
        <ul className="text-blue-300 text-sm space-y-1 list-disc list-inside">
          <li><strong>Test Cleanup:</strong> Tests the metadata cleanup API directly</li>
          <li><strong>Force Remove Metadata:</strong> Removes VALORANT metadata from your account regardless of external account status</li>
          <li><strong>Refresh:</strong> Fetches fresh VALORANT data from your connected account</li>
          <li><strong>Console:</strong> Check browser console for detailed cleanup logs</li>
          <li><strong>Expected:</strong> After removing external account, metadata should be cleaned automatically</li>
        </ul>
      </div>
    </Card>
  );
} 