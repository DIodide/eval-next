"use client";

import { useState } from "react";
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
import {
  CheckCircleIcon,
  PlusIcon,
  SendIcon,
  X,
  BuildingIcon,
  ArrowRightIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import {
  MultiSelectGames,
  type CustomGame,
} from "@/components/ui/multi-select-games";

interface LeagueAssociationRequestFormProps {
  onClose?: () => void;
}

interface LeagueAssociationRequestData {
  is_new_league_request: boolean;
  request_message: string;
  league_id?: string;
  proposed_league_name?: string;
  proposed_league_short_name?: string;
  proposed_league_description?: string;
  proposed_game_ids?: string[];
  proposed_custom_games?: CustomGame[];
  proposed_region?: string;
  proposed_state?: string;
  proposed_tier?: "ELITE" | "PROFESSIONAL" | "COMPETITIVE" | "DEVELOPMENTAL";
  proposed_season?: string;
  proposed_format?: string;
  proposed_founded_year?: number;
}

// Remove placeholder data - will fetch real leagues from database

export function LeagueAssociationRequestForm({
  onClose,
}: LeagueAssociationRequestFormProps) {
  const { toast } = useToast();
  const [isNewLeagueRequest, setIsNewLeagueRequest] = useState<boolean | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch available games for game selection
  const { data: games } = api.tryouts.getGames.useQuery();

  // Fetch available leagues for association requests
  const { data: availableLeagues, isLoading: isLoadingLeagues } =
    api.leagues.getAvailableForAssociation.useQuery();

  // Form state for existing league association
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [requestMessage, setRequestMessage] = useState("");

  // Form state for new league creation
  const [newLeagueData, setNewLeagueData] = useState({
    proposed_league_name: "",
    proposed_league_short_name: "",
    proposed_league_description: "",
    proposed_region: "",
    proposed_state: "",
    proposed_tier: "" as
      | "ELITE"
      | "PROFESSIONAL"
      | "COMPETITIVE"
      | "DEVELOPMENTAL"
      | "",
    proposed_season: "",
    proposed_format: "",
    proposed_founded_year: "",
    request_message: "",
  });

  // Multi-game selection state
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [customGames, setCustomGames] = useState<CustomGame[]>([]);

  const submitRequest =
    api.leagueAdminProfile.submitLeagueAssociationRequest.useMutation({
      onSuccess: () => {
        setSuccess(true);
        setError(null);
        toast({
          title: "Request Submitted",
          description:
            "Your league association request has been submitted successfully. We'll review it and get back to you soon.",
        });

        // Reset form
        setSelectedLeagueId("");
        setRequestMessage("");
        setNewLeagueData({
          proposed_league_name: "",
          proposed_league_short_name: "",
          proposed_league_description: "",
          proposed_region: "",
          proposed_state: "",
          proposed_tier: "",
          proposed_season: "",
          proposed_format: "",
          proposed_founded_year: "",
          request_message: "",
        });
        setSelectedGameIds([]);
        setCustomGames([]);
        setIsNewLeagueRequest(null);

        setTimeout(() => {
          setSuccess(false);
          onClose?.();
        }, 2000);
      },
      onError: (error) => {
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: error.message,
        });
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (
      isNewLeagueRequest &&
      selectedGameIds.length === 0 &&
      customGames.length === 0
    ) {
      setError("Please select at least one game for the new league.");
      setIsSubmitting(false);
      return;
    }

    // Prepare submission data
    let submissionData: LeagueAssociationRequestData;

    if (isNewLeagueRequest) {
      submissionData = {
        is_new_league_request: true,
        request_message: newLeagueData.request_message,
        proposed_league_name: newLeagueData.proposed_league_name,
        proposed_league_short_name: newLeagueData.proposed_league_short_name,
        proposed_league_description: newLeagueData.proposed_league_description,
        proposed_game_ids:
          selectedGameIds.length > 0 ? selectedGameIds : undefined,
        proposed_custom_games: customGames.length > 0 ? customGames : undefined,
        proposed_region: newLeagueData.proposed_region,
        proposed_state: newLeagueData.proposed_state || undefined,
        proposed_tier: newLeagueData.proposed_tier as
          | "ELITE"
          | "PROFESSIONAL"
          | "COMPETITIVE"
          | "DEVELOPMENTAL"
          | undefined,
        proposed_season: newLeagueData.proposed_season,
        proposed_format: newLeagueData.proposed_format || undefined,
        proposed_founded_year: newLeagueData.proposed_founded_year
          ? parseInt(newLeagueData.proposed_founded_year)
          : undefined,
      };
    } else {
      submissionData = {
        is_new_league_request: false,
        league_id: selectedLeagueId,
        request_message: requestMessage,
      };
    }

    await submitRequest.mutateAsync(submissionData);
  };

  if (success) {
    return (
      <Card className="border-gray-700 bg-gray-800 shadow-2xl">
        <CardContent className="p-8 text-center">
          <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h3 className="mb-2 text-xl font-semibold text-white">
            Request Submitted!
          </h3>
          <p className="text-gray-300">
            Your league association request has been submitted successfully.
            We&apos;ll review it and get back to you soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Selection between existing and new league
  if (isNewLeagueRequest === null) {
    return (
      <Card className="border-gray-700 bg-gray-800 shadow-2xl">
        <CardHeader className="pb-6 text-center">
          <div className="mb-4 flex items-center justify-between">
            <div></div>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CardTitle className="font-orbitron mb-2 text-2xl text-white">
            League Association
          </CardTitle>
          <p className="text-gray-400">
            Choose how you&apos;d like to get started with league management
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Existing League Card */}
            <Card
              className="group relative cursor-pointer overflow-hidden border-gray-600 bg-gray-900/50 transition-all duration-300 hover:border-purple-500/50"
              onClick={() => setIsNewLeagueRequest(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="rounded-lg bg-purple-600/20 p-3 transition-colors group-hover:bg-purple-600/30">
                    <BuildingIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-lg">Join Existing League</div>
                    <div className="text-sm font-normal text-gray-400">
                      Connect with your league
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="mb-6 leading-relaxed text-gray-400">
                  If your league already exists on Eval, request administrator
                  access to start managing players, teams, and tournaments.
                </p>
                <div className="flex items-center font-medium text-purple-400 transition-colors group-hover:text-purple-300">
                  <span>Associate Now</span>
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>

            {/* New League Card */}
            <Card
              className="group relative cursor-pointer overflow-hidden border-gray-600 bg-gray-900/50 transition-all duration-300 hover:border-cyan-500/50"
              onClick={() => setIsNewLeagueRequest(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3 text-white">
                  <div className="rounded-lg bg-cyan-600/20 p-3 transition-colors group-hover:bg-cyan-600/30">
                    <PlusIcon className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-lg">Create New League</div>
                    <div className="text-sm font-normal text-gray-400">
                      Start from scratch
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="mb-6 leading-relaxed text-gray-400">
                  Don&apos;t see your league? Request to create a new league on
                  Eval with custom games, rules, and branding.
                </p>
                <div className="flex items-center font-medium text-cyan-400 transition-colors group-hover:text-cyan-300">
                  <span>Create League</span>
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              For additional support, please contact us at{" "}
              <a
                href="mailto:support@evalgaming.com"
                className="text-cyan-400 hover:text-cyan-300"
              >
                support@evalgaming.com
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Form based on selection
  return (
    <Card className="border-gray-700 bg-gray-800 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsNewLeagueRequest(null)}
              className="text-gray-400 hover:text-white"
            >
              ←
            </Button>
            <CardTitle className="font-orbitron text-white">
              {isNewLeagueRequest
                ? "Create New League"
                : "Join Existing League"}
            </CardTitle>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-500 bg-red-900/20 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {isNewLeagueRequest ? (
            // New League Creation Form
            <div className="space-y-4">
              <div className="rounded-lg border border-cyan-500 bg-cyan-900/20 p-4">
                <h4 className="mb-2 font-medium text-cyan-400">
                  Creating a New League
                </h4>
                <p className="text-sm text-gray-300">
                  You&apos;re requesting to create a brand new league. Please
                  provide detailed information about your proposed league. Our
                  team will review your request and help you get started.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proposed_league_name" className="text-white">
                    League Name *
                  </Label>
                  <Input
                    id="proposed_league_name"
                    placeholder="Enter the full league name"
                    value={newLeagueData.proposed_league_name}
                    onChange={(e) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_league_name: e.target.value,
                      })
                    }
                    className="border-gray-700 bg-gray-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="proposed_league_short_name"
                    className="text-white"
                  >
                    Short Name *
                  </Label>
                  <Input
                    id="proposed_league_short_name"
                    placeholder="e.g., NECL, VUOL"
                    value={newLeagueData.proposed_league_short_name}
                    onChange={(e) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_league_short_name: e.target.value,
                      })
                    }
                    className="border-gray-700 bg-gray-800 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="proposed_league_description"
                  className="text-white"
                >
                  League Description *
                </Label>
                <Textarea
                  id="proposed_league_description"
                  placeholder="Describe the league's mission, target audience, and goals..."
                  value={newLeagueData.proposed_league_description}
                  onChange={(e) =>
                    setNewLeagueData({
                      ...newLeagueData,
                      proposed_league_description: e.target.value,
                    })
                  }
                  className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
                  required
                />
              </div>

              {/* Multi-Game Selection */}
              <div className="space-y-2">
                <Label className="text-white">Supported Games *</Label>
                <MultiSelectGames
                  availableGames={games ?? []}
                  selectedGameIds={selectedGameIds}
                  customGames={customGames}
                  onSelectedGamesChange={setSelectedGameIds}
                  onCustomGamesChange={setCustomGames}
                  placeholder="Select games your league will support..."
                />
                <p className="text-xs text-gray-400">
                  Select from Eval&apos;s supported games or add custom games
                  that your league will host.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proposed_region" className="text-white">
                    Region *
                  </Label>
                  <Input
                    id="proposed_region"
                    placeholder="e.g., North America, Europe"
                    value={newLeagueData.proposed_region}
                    onChange={(e) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_region: e.target.value,
                      })
                    }
                    className="border-gray-700 bg-gray-800 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposed_state" className="text-white">
                    State/Province
                  </Label>
                  <Input
                    id="proposed_state"
                    placeholder="e.g., California, Ontario"
                    value={newLeagueData.proposed_state}
                    onChange={(e) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_state: e.target.value,
                      })
                    }
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proposed_tier" className="text-white">
                    Competition Tier
                  </Label>
                  <Select
                    value={newLeagueData.proposed_tier}
                    onValueChange={(value) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_tier: value as
                          | "ELITE"
                          | "PROFESSIONAL"
                          | "COMPETITIVE"
                          | "DEVELOPMENTAL"
                          | "",
                      })
                    }
                  >
                    <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-700 bg-gray-800">
                      <SelectItem value="ELITE">Elite</SelectItem>
                      <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                      <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                      <SelectItem value="DEVELOPMENTAL">
                        Developmental
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposed_season" className="text-white">
                    Season *
                  </Label>
                  <Input
                    id="proposed_season"
                    placeholder="e.g., Spring 2024, Fall 2024"
                    value={newLeagueData.proposed_season}
                    onChange={(e) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_season: e.target.value,
                      })
                    }
                    className="border-gray-700 bg-gray-800 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="proposed_format" className="text-white">
                    Format
                  </Label>
                  <Input
                    id="proposed_format"
                    placeholder="e.g., Round Robin, Tournament"
                    value={newLeagueData.proposed_format}
                    onChange={(e) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_format: e.target.value,
                      })
                    }
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposed_founded_year" className="text-white">
                    Founded Year
                  </Label>
                  <Input
                    id="proposed_founded_year"
                    type="number"
                    placeholder="e.g., 2024"
                    value={newLeagueData.proposed_founded_year}
                    onChange={(e) =>
                      setNewLeagueData({
                        ...newLeagueData,
                        proposed_founded_year: e.target.value,
                      })
                    }
                    className="border-gray-700 bg-gray-800 text-white"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_league_message" className="text-white">
                  Request Message *
                </Label>
                <Textarea
                  id="new_league_message"
                  placeholder="Explain why you want to create this league, your experience, and how you plan to manage it..."
                  value={newLeagueData.request_message}
                  onChange={(e) =>
                    setNewLeagueData({
                      ...newLeagueData,
                      request_message: e.target.value,
                    })
                  }
                  className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
                  maxLength={1000}
                  required
                />
                <div className="text-right text-xs text-gray-400">
                  {newLeagueData.request_message.length}/1000 characters
                </div>
              </div>
            </div>
          ) : (
            // Existing League Association Form
            <div className="space-y-4">
              <div className="rounded-lg border border-purple-500 bg-purple-900/20 p-4">
                <h4 className="mb-2 font-medium text-purple-400">
                  Join Existing League
                </h4>
                <p className="text-sm text-gray-300">
                  Request to become an administrator for an existing league.
                  You&apos;ll need approval from our team and potentially from
                  current league administrators.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="league" className="text-white">
                  Select League *
                </Label>
                <Select
                  value={selectedLeagueId}
                  onValueChange={setSelectedLeagueId}
                  required
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue placeholder="Choose a league" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800">
                    {isLoadingLeagues ? (
                      <SelectItem value="loading" disabled>
                        Loading leagues...
                      </SelectItem>
                    ) : availableLeagues && availableLeagues.length > 0 ? (
                      availableLeagues.map((league) => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name} ({league.short_name}) - {league.tier}
                          {league.region && ` - ${league.region}`}
                          {league.state && ` (${league.state})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-leagues" disabled>
                        No leagues available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-white">
                  Request Message *
                </Label>
                <Textarea
                  id="message"
                  placeholder="Explain your connection to this league and why you should be granted administrator access..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="min-h-[100px] border-gray-700 bg-gray-800 text-white"
                  maxLength={500}
                  required
                />
                <div className="text-right text-xs text-gray-400">
                  {requestMessage.length}/500 characters
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              (!selectedLeagueId && !isNewLeagueRequest) ||
              isSubmitting ||
              (isNewLeagueRequest &&
                selectedGameIds.length === 0 &&
                customGames.length === 0) ||
              (!isNewLeagueRequest && isLoadingLeagues)
            }
            className="font-orbitron w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>

          <p className="text-xs text-gray-400">
            {isNewLeagueRequest
              ? "Your new league request will be reviewed by our administrators. If approved, the league will be created and you&apos;ll be granted administrator access."
              : "Your request will be reviewed by our administrators. You&apos;ll be notified once it&apos;s processed."}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
