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
import { Badge } from "@/components/ui/badge";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SearchIcon,
  TrophyIcon,
  UserIcon,
  CalendarIcon,
  MessageSquareIcon,
  GamepadIcon,
  GlobeIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// Type definitions for better type safety
interface GameInfo {
  id: string;
  name: string;
  short_name: string;
}

interface CustomGameInfo {
  name: string;
  short_name: string;
  icon?: string;
  color?: string;
}

interface LeagueGameInfo {
  game: {
    name: string;
    short_name: string;
  };
}

interface LeagueInfo {
  id: string;
  name: string;
  short_name: string;
  tier: string;
  region: string;
  state: string | null;
  league_games: LeagueGameInfo[];
}

interface AdministratorInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string | null;
  image_url: string | null;
  created_at: Date;
  league_id: string | null;
}

interface LeagueAssociationRequestData {
  id: string;
  status: string;
  created_at: Date;
  request_message: string;
  admin_notes: string | null;
  is_new_league_request: boolean;

  // Existing league request fields
  league: LeagueInfo | null;

  // New league request fields
  proposed_league_name: string | null;
  proposed_league_short_name: string | null;
  proposed_league_description: string | null;
  proposed_region: string | null;
  proposed_state: string | null;
  proposed_tier: string | null;
  proposed_season: string | null;
  proposed_format: string | null;
  proposed_founded_year: number | null;

  // Game fields - these come from JSON so we need to handle them carefully
  proposed_game_ids: unknown; // JSON field from Prisma
  proposed_custom_games: unknown; // JSON field from Prisma
  proposed_games?: GameInfo[]; // Added by tRPC resolver

  administrator: AdministratorInfo;
}

export default function LeagueRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | undefined
  >();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch requests with pagination
  const {
    data: requestsData,
    isLoading,
    refetch,
  } = api.leagueAssociationRequests.getRequests.useQuery({
    search: searchTerm || undefined,
    status: statusFilter,
    page: 1,
    limit: 50,
  });

  // Get pending count for the header
  const pendingCountQuery =
    api.leagueAssociationRequests.getPendingCount.useQuery();
  const pendingCount = pendingCountQuery.data;

  // Approve request mutation
  const approveRequest =
    api.leagueAssociationRequests.approveRequest.useMutation({
      onSuccess: () => {
        toast.success("League association request approved successfully!");
        setSelectedRequest(null);
        setAdminNotes("");
        void refetch();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to approve request");
      },
      onSettled: () => {
        setIsProcessing(false);
      },
    });

  // Reject request mutation
  const rejectRequest = api.leagueAssociationRequests.rejectRequest.useMutation(
    {
      onSuccess: () => {
        toast.success("League association request rejected");
        setSelectedRequest(null);
        setAdminNotes("");
        void refetch();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to reject request");
      },
      onSettled: () => {
        setIsProcessing(false);
      },
    },
  );

  const handleApprove = async (requestId: string) => {
    setIsProcessing(true);
    await approveRequest.mutateAsync({
      requestId,
      adminNotes: adminNotes || undefined,
    });
  };

  const handleReject = async (requestId: string) => {
    if (!adminNotes.trim()) {
      toast.error("Admin notes are required for rejection");
      return;
    }

    setIsProcessing(true);
    await rejectRequest.mutateAsync({
      requestId,
      adminNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 bg-yellow-500/20 text-yellow-400"
          >
            <ClockIcon className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge
            variant="outline"
            className="border-green-500 bg-green-500/20 text-green-400"
          >
            <CheckCircleIcon className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge
            variant="outline"
            className="border-red-500 bg-red-500/20 text-red-400"
          >
            <XCircleIcon className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTierBadge = (tier: string) => {
    const tierColors = {
      ELITE: "bg-purple-500/20 text-purple-400 border-purple-500",
      PROFESSIONAL: "bg-blue-500/20 text-blue-400 border-blue-500",
      COMPETITIVE: "bg-orange-500/20 text-orange-400 border-orange-500",
      DEVELOPMENTAL: "bg-green-500/20 text-green-400 border-green-500",
    };
    return (
      <Badge
        variant="outline"
        className={
          tierColors[tier as keyof typeof tierColors] ||
          "border-gray-500 bg-gray-500/20 text-gray-400"
        }
      >
        {tier.replace("_", " ")}
      </Badge>
    );
  };

  // Helper function to safely parse JSON fields and render games for a request
  const renderGames = (
    request: LeagueAssociationRequestData,
  ): React.ReactNode => {
    if (request.is_new_league_request) {
      // For new league requests, use the resolved game details and custom games
      const proposedGames = request.proposed_games ?? [];

      // Safely parse custom games from JSON field
      let customGames: CustomGameInfo[] = [];
      try {
        if (
          request.proposed_custom_games &&
          Array.isArray(request.proposed_custom_games)
        ) {
          customGames = request.proposed_custom_games as CustomGameInfo[];
        }
      } catch (error) {
        console.warn("Error parsing custom games:", error);
        customGames = [];
      }

      if (proposedGames.length === 0 && customGames.length === 0) {
        return "N/A";
      }

      return (
        <div className="space-y-1">
          {/* Show official games */}
          {proposedGames.map((game: GameInfo, index: number) => (
            <div key={index} className="text-sm">
              {game.name} ({game.short_name})
            </div>
          ))}

          {/* Show custom games */}
          {customGames.map((game: CustomGameInfo, index: number) => (
            <div key={`custom-${index}`} className="text-sm text-cyan-400">
              {game.name} ({game.short_name}){" "}
              <span className="text-xs">- Custom</span>
            </div>
          ))}
        </div>
      );
    } else {
      // For existing league requests, show the league's games
      if (
        !request.league?.league_games ||
        request.league.league_games.length === 0
      ) {
        return "N/A";
      }

      return (
        <div className="space-y-1">
          {request.league.league_games.map(
            (lg: LeagueGameInfo, index: number) => (
              <div key={index} className="text-sm">
                {lg.game.name} ({lg.game.short_name})
              </div>
            ),
          )}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            League Association Requests
          </h1>
          <p className="mt-2 text-gray-400">
            Manage league administrator association requests and onboarding
          </p>
        </div>
        {pendingCount !== undefined && pendingCount > 0 && (
          <Badge
            variant="outline"
            className="border-yellow-500 bg-yellow-500/20 text-yellow-400"
          >
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="font-orbitron text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-gray-300">
                Search
              </Label>
              <div className="relative">
                <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by admin name, email, or league..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-gray-700 bg-gray-800 pl-10 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">
                Status
              </Label>
              <Select
                value={statusFilter ?? "all"}
                onValueChange={(value) =>
                  setStatusFilter(
                    value === "all"
                      ? undefined
                      : (value as "PENDING" | "APPROVED" | "REJECTED"),
                  )
                }
              >
                <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="border-gray-800 bg-gray-900">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-400" />
              <p className="text-gray-400">Loading requests...</p>
            </CardContent>
          </Card>
        ) : !requestsData?.requests.length ? (
          <Card className="border-gray-800 bg-gray-900">
            <CardContent className="p-8 text-center">
              <TrophyIcon className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">
                No league association requests found
              </p>
            </CardContent>
          </Card>
        ) : (
          requestsData.requests.map((request) => (
            <Card
              key={request.id}
              className={`border-gray-800 bg-gray-900 transition-colors ${
                selectedRequest === request.id
                  ? "border-cyan-500"
                  : "hover:border-gray-700"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  {/* Request Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(request.status)}
                        <span className="text-sm text-gray-400">
                          <CalendarIcon className="mr-1 inline h-4 w-4" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Administrator Info */}
                      <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-medium text-white">
                          <UserIcon className="h-4 w-4" />
                          League Administrator Information
                        </h3>
                        <div className="space-y-1 text-sm text-gray-300">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {request.administrator.first_name}{" "}
                            {request.administrator.last_name}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span>{" "}
                            {request.administrator.email}
                          </p>
                          {request.administrator.username && (
                            <p>
                              <span className="font-medium">Username:</span>{" "}
                              {request.administrator.username}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Joined:</span>{" "}
                            {new Date(
                              request.administrator.created_at,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* League Info */}
                      <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-medium text-white">
                          <TrophyIcon className="h-4 w-4" />
                          League Information
                        </h3>
                        <div className="space-y-1 text-sm text-gray-300">
                          {request.is_new_league_request ? (
                            // New league creation request
                            <>
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {request.proposed_league_name}{" "}
                                <span className="text-cyan-400">
                                  (New League Request)
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Short Name:</span>{" "}
                                {request.proposed_league_short_name}
                              </p>
                              <p>
                                <span className="font-medium">Games:</span>{" "}
                                {renderGames(request)}
                              </p>
                              <p>
                                <span className="font-medium">Region:</span>{" "}
                                {request.proposed_region}
                                {request.proposed_state
                                  ? `, ${request.proposed_state}`
                                  : ""}
                              </p>
                              {request.proposed_tier && (
                                <p>
                                  <span className="font-medium">Tier:</span>{" "}
                                  {getTierBadge(request.proposed_tier)}
                                </p>
                              )}
                              {request.proposed_season && (
                                <p>
                                  <span className="font-medium">Season:</span>{" "}
                                  {request.proposed_season}
                                </p>
                              )}
                              {request.proposed_format && (
                                <p>
                                  <span className="font-medium">Format:</span>{" "}
                                  {request.proposed_format}
                                </p>
                              )}
                              {request.proposed_founded_year && (
                                <p>
                                  <span className="font-medium">Founded:</span>{" "}
                                  {request.proposed_founded_year}
                                </p>
                              )}
                            </>
                          ) : (
                            // Existing league association request
                            <>
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {request.league?.name}
                              </p>
                              <p>
                                <span className="font-medium">Short Name:</span>{" "}
                                {request.league?.short_name}
                              </p>
                              <p>
                                <span className="font-medium">Games:</span>{" "}
                                {renderGames(request)}
                              </p>
                              <p>
                                <span className="font-medium">Region:</span>{" "}
                                {request.league?.region}
                                {request.league?.state
                                  ? `, ${request.league.state}`
                                  : ""}
                              </p>
                              {request.league?.tier && (
                                <p>
                                  <span className="font-medium">Tier:</span>{" "}
                                  {getTierBadge(request.league.tier)}
                                </p>
                              )}
                              {/* Season field not available in current schema */}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* League Description (for new leagues) */}
                    {request.is_new_league_request &&
                      request.proposed_league_description && (
                        <div className="space-y-2">
                          <h4 className="flex items-center gap-2 font-medium text-white">
                            <GlobeIcon className="h-4 w-4" />
                            Proposed League Description
                          </h4>
                          <div className="rounded-lg bg-gray-800 p-3">
                            <p className="text-sm text-gray-300">
                              {request.proposed_league_description}
                            </p>
                          </div>
                        </div>
                      )}

                    {/* Request Message */}
                    {request.request_message && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium text-white">
                          <MessageSquareIcon className="h-4 w-4" />
                          Administrator Message
                        </h4>
                        <div className="rounded-lg bg-gray-800 p-3">
                          <p className="text-sm text-gray-300">
                            {request.request_message}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes (if reviewed) */}
                    {request.admin_notes && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-white">Admin Notes</h4>
                        <div className="rounded-lg bg-gray-800 p-3">
                          <p className="text-sm text-gray-300">
                            {request.admin_notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {request.status === "PENDING" && (
                    <div className="space-y-4 lg:w-64">
                      {selectedRequest === request.id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label
                              htmlFor="adminNotes"
                              className="text-gray-300"
                            >
                              Admin Notes
                            </Label>
                            <Textarea
                              id="adminNotes"
                              placeholder="Add notes about this decision..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className="min-h-[80px] border-gray-700 bg-gray-800 text-white"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(request.id)}
                              disabled={isProcessing}
                              className="flex-1 bg-green-600 text-white hover:bg-green-700"
                            >
                              <CheckCircleIcon className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              disabled={isProcessing || !adminNotes.trim()}
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircleIcon className="mr-1 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                          <Button
                            onClick={() => setSelectedRequest(null)}
                            variant="outline"
                            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            setSelectedRequest(request.id);
                            setAdminNotes("");
                          }}
                          className="w-full bg-cyan-600 text-white hover:bg-cyan-700"
                        >
                          Review Request
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {requestsData && (
        <div className="text-center text-sm text-gray-400">
          Showing {requestsData.requests.length} of{" "}
          {requestsData.pagination.totalCount} requests
        </div>
      )}
    </div>
  );
}
