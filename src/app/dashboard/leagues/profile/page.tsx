"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import {
  UserIcon,
  SaveIcon,
  EyeIcon,
  BuildingIcon,
  AlertCircleIcon,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export default function LeagueProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [leagueData, setLeagueData] = useState({
    name: "",
    short_name: "",
    description: "",
    region: "",
    state: "",
    tier: "",
    season: "",
    format: "",
    prize_pool: "",
    founded_year: "",
    status: "ACTIVE",
  });

  // Get league admin profile data
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = api.leagueAdminProfile.getProfile.useQuery();

  // Update league profile mutation
  const updateLeagueProfile =
    api.leagueAdminProfile.updateLeagueProfile.useMutation({
      onSuccess: () => {
        toast({
          title: "Profile Updated",
          description: "League profile has been updated successfully.",
        });
        setIsEditing(false);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.message,
        });
      },
    });

  // Update logo mutation
  const updateLogoMutation =
    api.leagueAdminProfile.updateLeagueLogo.useMutation({
      onSuccess: () => {
        sonnerToast.success("League logo updated successfully!");
        void refetch();
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        sonnerToast.error(`Failed to update logo: ${errorMessage}`);
      },
    });

  // Update banner mutation
  const updateBannerMutation =
    api.leagueAdminProfile.updateLeagueBanner.useMutation({
      onSuccess: () => {
        sonnerToast.success("League banner updated successfully!");
        void refetch();
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        sonnerToast.error(`Failed to update banner: ${errorMessage}`);
      },
    });

  // Initialize form data when profile data loads
  useEffect(() => {
    if (profileData?.league_ref) {
      const league = profileData.league_ref;
      setLeagueData({
        name: league.name ?? "",
        short_name: league.short_name ?? "",
        description: league.description ?? "",
        region: league.region ?? "",
        state: league.state ?? "",
        tier: league.tier ?? "",
        season: league.season ?? "",
        format: league.format ?? "",
        prize_pool: league.prize_pool ?? "",
        founded_year: league.founded_year?.toString() ?? "",
        status: league.status ?? "ACTIVE",
      });
    }
  }, [profileData]);

  const handleSave = async () => {
    try {
      await updateLeagueProfile.mutateAsync({
        name: leagueData.name,
        short_name: leagueData.short_name,
        description: leagueData.description,
        region: leagueData.region,
        state: leagueData.state,
        tier: leagueData.tier as
          | "ELITE"
          | "PROFESSIONAL"
          | "COMPETITIVE"
          | "DEVELOPMENTAL",
        season: leagueData.season,
        format: leagueData.format,
        prize_pool: leagueData.prize_pool,
        founded_year: leagueData.founded_year
          ? parseInt(leagueData.founded_year)
          : undefined,
        status: leagueData.status as
          | "UPCOMING"
          | "ACTIVE"
          | "COMPLETED"
          | "CANCELLED",
      });
    } catch (error) {
      // Error handled by mutation onError
      console.error("Failed to save league profile:", error);
    }
  };

  const handleLogoUpload = (url: string) => {
    updateLogoMutation.mutate({ logo_url: url });
  };

  const handleLogoRemove = () => {
    updateLogoMutation.mutate({ logo_url: "" });
  };

  const handleBannerUpload = (url: string) => {
    updateBannerMutation.mutate({ banner_url: url });
  };

  const handleBannerRemove = () => {
    updateBannerMutation.mutate({ banner_url: "" });
  };

  const handleUploadError = (error: string) => {
    sonnerToast.error(`Upload failed: ${error}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="ml-2 text-white">Loading league profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="border-red-700 bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircleIcon className="h-5 w-5" />
              <span>Error loading profile: {error.message}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // No league association
  if (!profileData?.league_ref) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <Card className="border-yellow-700 bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-300">
              <AlertCircleIcon className="h-5 w-5" />
              <span>
                You must be associated with a league to manage league profiles.
                Please submit a league association request first.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-white">
              League Profile
            </h1>
            <p className="mt-2 text-gray-400">
              Manage your league information and public profile
            </p>
          </div>
          <div className="mt-4 flex gap-3 sm:mt-0">
            {profileData?.league_ref && (
              <Button
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() =>
                  window.open(
                    `/profiles/leagues/${profileData.league_ref!.id}`,
                    "_blank",
                  )
                }
              >
                <EyeIcon className="mr-2 h-4 w-4" />
                Preview Public Profile
              </Button>
            )}
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <UserIcon className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={updateLeagueProfile.isPending}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateLeagueProfile.isPending}
                  className="bg-purple-600 text-white hover:bg-purple-700"
                >
                  {updateLeagueProfile.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <SaveIcon className="mr-2 h-4 w-4" />
                  )}
                  {updateLeagueProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BuildingIcon className="h-5 w-5 text-purple-400" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  League Name
                </Label>
                <Input
                  id="name"
                  value={leagueData.name}
                  onChange={(e) =>
                    setLeagueData({ ...leagueData, name: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Enter league name"
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_name" className="text-white">
                  Short Name / Abbreviation
                </Label>
                <Input
                  id="short_name"
                  value={leagueData.short_name}
                  onChange={(e) =>
                    setLeagueData({ ...leagueData, short_name: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="e.g., NCEL"
                  maxLength={10}
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                League Description
              </Label>
              <Textarea
                id="description"
                value={leagueData.description}
                onChange={(e) =>
                  setLeagueData({ ...leagueData, description: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Describe your league's mission, goals, and what makes it unique..."
                className="min-h-[120px] border-gray-700 bg-gray-800 text-white disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region" className="text-white">
                  Region
                </Label>
                <Input
                  id="region"
                  value={leagueData.region}
                  onChange={(e) =>
                    setLeagueData({ ...leagueData, region: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="e.g., Northeast, West Coast"
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state" className="text-white">
                  Primary State
                </Label>
                <Input
                  id="state"
                  value={leagueData.state}
                  onChange={(e) =>
                    setLeagueData({ ...leagueData, state: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="e.g., New Jersey"
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* League Assets */}
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5 text-purple-400" />
              League Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* League Logo */}
              <div className="space-y-2">
                <FileUpload
                  bucket="LEAGUES"
                  entityId={profileData?.league_ref?.id ?? ""}
                  assetType="LOGO"
                  currentImageUrl={profileData?.league_ref?.logo_url}
                  label="League Logo"
                  description="Upload your league's official logo"
                  onUploadSuccess={handleLogoUpload}
                  onUploadError={handleUploadError}
                  onRemove={handleLogoRemove}
                  disabled={updateLogoMutation.isPending}
                />
              </div>

              {/* League Banner */}
              <div className="space-y-2">
                <FileUpload
                  bucket="LEAGUES"
                  entityId={profileData?.league_ref?.id ?? ""}
                  assetType="BANNER"
                  currentImageUrl={profileData?.league_ref?.banner_url}
                  label="League Banner"
                  description="Upload a banner image for your league profile"
                  onUploadSuccess={handleBannerUpload}
                  onUploadError={handleUploadError}
                  onRemove={handleBannerRemove}
                  disabled={updateBannerMutation.isPending}
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-4 text-sm text-gray-400">
              <p className="mb-2">
                <strong className="text-gray-300">Asset Guidelines:</strong>
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>Logo:</strong> Square format (400x400px recommended) -
                  Used in league listings and team profiles
                </li>
                <li>
                  <strong>Banner:</strong> Wide format (1200x300px recommended)
                  - Used as header image on your league page
                </li>
                <li>Supported formats: PNG, JPG, JPEG, WebP</li>
                <li>Maximum file size: 5MB per image</li>
                <li>Images are automatically optimized for web display</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* League Details */}
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="text-white">League Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tier" className="text-white">
                  League Tier
                </Label>
                <Select
                  value={leagueData.tier}
                  onValueChange={(value) =>
                    setLeagueData({ ...leagueData, tier: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800 text-white disabled:opacity-50">
                    <SelectValue placeholder="Select tier..." />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800">
                    <SelectItem value="DEVELOPMENTAL">Developmental</SelectItem>
                    <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ELITE">Elite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="season" className="text-white">
                  Current Season
                </Label>
                <Input
                  id="season"
                  value={leagueData.season}
                  onChange={(e) =>
                    setLeagueData({ ...leagueData, season: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="e.g., 2024-2025"
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="format" className="text-white">
                  Competition Format
                </Label>
                <Input
                  id="format"
                  value={leagueData.format}
                  onChange={(e) =>
                    setLeagueData({ ...leagueData, format: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="e.g., Regular Season + Playoffs"
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prize_pool" className="text-white">
                  Prize Pool (Optional)
                </Label>
                <Input
                  id="prize_pool"
                  value={leagueData.prize_pool}
                  onChange={(e) =>
                    setLeagueData({ ...leagueData, prize_pool: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="e.g., $10,000"
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="founded_year" className="text-white">
                  Founded Year
                </Label>
                <Input
                  id="founded_year"
                  type="number"
                  value={leagueData.founded_year}
                  onChange={(e) =>
                    setLeagueData({
                      ...leagueData,
                      founded_year: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  placeholder="2024"
                  min="2000"
                  max="2030"
                  className="border-gray-700 bg-gray-800 text-white disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-white">
                  League Status
                </Label>
                <Select
                  value={leagueData.status}
                  onValueChange={(value) =>
                    setLeagueData({ ...leagueData, status: value })
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800 text-white disabled:opacity-50">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800">
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Games Section */}
        <Card className="border-gray-800 bg-[#1a1a2e]">
          <CardHeader>
            <CardTitle className="text-white">Games</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-white">Supported Games</Label>
              <div className="flex flex-wrap gap-2">
                {profileData?.league_ref?.league_games?.map((leagueGame) => (
                  <div
                    key={leagueGame.game.id}
                    className="flex items-center gap-2 rounded-full border border-purple-600/40 bg-purple-600/20 px-3 py-1"
                  >
                    <span className="text-sm text-purple-300">
                      {leagueGame.game.name}
                    </span>
                  </div>
                )) ?? (
                  <p className="text-sm text-gray-400">No games configured</p>
                )}
              </div>
              <p className="text-sm text-gray-400">
                Game selection is managed during league association requests.
                Contact support if you need to modify supported games.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        {!isEditing && (
          <Card className="border-blue-700 bg-blue-900/20">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-300">
                <strong>Pro Tip:</strong> Keep your league information up to
                date to help teams and players find and join your league. Your
                public profile will showcase this information to potential
                participants.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
