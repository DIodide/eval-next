"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ZapIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { toast } from "sonner";

import { TalentSearchBar } from "./_components/TalentSearchBar";
import {
  TalentFilterPanel,
  type TalentFilters,
} from "./_components/TalentFilterPanel";
import { TalentResultsGrid } from "./_components/TalentResultsGrid";
import { TalentPlayerModal } from "./_components/TalentPlayerModal";
import type { TalentSearchResult } from "@/types/talent-search";

export default function FindTalentPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [filters, setFilters] = useState<TalentFilters>({});
  const [selectedPlayer, setSelectedPlayer] = useState<TalentSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if coach is onboarded
  const canAccess =
    user?.publicMetadata?.onboarded === true &&
    user?.publicMetadata?.userType === "coach";

  // Check if AI search is available
  const { data: availabilityData } = api.talentSearch.isAvailable.useQuery(
    undefined,
    {
      enabled: canAccess,
    }
  );

  // Search query
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: executeSearch,
  } = api.talentSearch.search.useQuery(
    {
      query: submittedQuery,
      gameId: filters.gameId,
      classYears: filters.classYears,
      schoolTypes: filters.schoolTypes,
      locations: filters.locations,
      minGpa: filters.minGpa,
      maxGpa: filters.maxGpa,
      limit: 50,
    },
    {
      enabled: canAccess && !!submittedQuery && availabilityData?.isAvailable,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    }
  );

  // Favorite mutations
  const utils = api.useUtils();
  const favoriteMutation = api.playerSearch.favoritePlayer.useMutation({
    onSuccess: () => {
      void utils.talentSearch.search.invalidate();
      toast.success("Added to prospects");
    },
    onError: (error: { message: string }) => {
      toast.error(`Failed to add to prospects: ${error.message}`);
    },
  });

  const unfavoriteMutation = api.playerSearch.unfavoritePlayer.useMutation({
    onSuccess: () => {
      void utils.talentSearch.search.invalidate();
      toast.info("Removed from prospects");
    },
    onError: (error: { message: string }) => {
      toast.error(`Failed to remove from prospects: ${error.message}`);
    },
  });

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      setSubmittedQuery(searchQuery.trim());
    }
  }, [searchQuery]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const handleSelectPlayer = useCallback((player: TalentSearchResult) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  }, []);

  const handleFavoriteToggle = useCallback(
    (player: TalentSearchResult) => {
      if (player.isFavorited) {
        unfavoriteMutation.mutate({ player_id: player.id });
      } else {
        favoriteMutation.mutate({ player_id: player.id });
      }
    },
    [favoriteMutation, unfavoriteMutation]
  );

  // Not authorized view
  if (!canAccess) {
    return (
      <div className="space-y-8 p-6">
        <Card className="border-yellow-500 bg-gray-900">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center gap-2 text-yellow-400">
              <AlertCircleIcon className="h-5 w-5" />
              Access Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-rajdhani mb-4 text-gray-300">
              You need to complete your coach onboarding to access the AI-powered
              talent search feature.
            </p>
            <Link href="/dashboard/coaches">
              <Button className="cursor-pointer bg-cyan-600 text-white hover:bg-cyan-700">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // AI not configured view
  if (availabilityData && !availabilityData.isAvailable) {
    return (
      <div className="space-y-8 p-6">
        <Card className="border-yellow-500 bg-gray-900">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center gap-2 text-yellow-400">
              <AlertCircleIcon className="h-5 w-5" />
              Feature Unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-rajdhani mb-4 text-gray-300">
              {availabilityData.message}
            </p>
            <Link href="/dashboard/coaches">
              <Button className="cursor-pointer bg-cyan-600 text-white hover:bg-cyan-700">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Hero Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

        <div className="relative z-10 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-purple-600/10 p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-500/30 p-2">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                </div>
                <h1 className="font-orbitron text-4xl font-bold text-white">
                  Find Talent
                </h1>
                <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                  AI-Powered
                </Badge>
              </div>
              <p className="font-rajdhani max-w-2xl text-lg text-gray-300">
                Describe the player you're looking for in natural language. Our AI
                will find the best matches from our player database.
              </p>
            </div>
            <Link href="/dashboard/coaches" className="cursor-pointer">
              <Button
                variant="outline"
                className="cursor-pointer border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="space-y-4">
        <TalentSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSearch={handleSearch}
          isLoading={isSearching}
        />

        <TalentFilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />
      </div>

      {/* Results Section */}
      <TalentResultsGrid
        results={searchResults?.results ?? []}
        isLoading={isSearching}
        query={submittedQuery}
        onSelectPlayer={handleSelectPlayer}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Player Detail Modal */}
      <TalentPlayerModal
        player={selectedPlayer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFavoriteToggle={handleFavoriteToggle}
      />
    </div>
  );
}
