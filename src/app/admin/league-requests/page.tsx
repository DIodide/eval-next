"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  GlobeIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// Type definitions for requests data
interface RequestData {
  requests: Array<{
    id: string;
    status: string;
    created_at: string;
    request_message: string;
    admin_notes?: string;
    is_new_league_request: boolean;
    proposed_league_name?: string;
    proposed_league_short_name?: string;
    proposed_league_description?: string;
    proposed_region?: string;
    proposed_state?: string;
    proposed_tier?: "ELITE" | "PROFESSIONAL" | "COMPETITIVE" | "DEVELOPMENTAL";
    proposed_season?: string;
    proposed_format?: string;
    proposed_founded_year?: number;
    proposed_game_ids?: string[];
    proposed_custom_games?: string[];
    proposed_games?: Array<{
      id: string;
      name: string;
      short_name: string;
    }>;
    administrator: {
      first_name: string;
      last_name: string;
      email: string;
      username?: string;
      created_at: string;
    };
    league?: {
      name: string;
      short_name: string;
      description: string;
      region: string;
      state?: string;
      tier: string;
      season: string;
      league_games: Array<{
        game: {
          name: string;
          short_name: string;
        };
      }>;
    };
  }>;
  pagination: {
    total: number;
  };
}

export default function LeagueRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch requests with pagination
  const { data: requestsData, isLoading, refetch } = api.leagueAssociationRequests.getRequests.useQuery({
    search: searchTerm || undefined,
    status: statusFilter,
    page: 1,
    limit: 50,
  });

  // Get pending count for the header
  const pendingCountQuery = api.leagueAssociationRequests.getPendingCount.useQuery();
  const pendingCount = pendingCountQuery.data;

  // Approve request mutation
  const approveRequest = api.leagueAssociationRequests.approveRequest.useMutation({
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
  const rejectRequest = api.leagueAssociationRequests.rejectRequest.useMutation({
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
  });

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
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
          <ClockIcon className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500">
          <XCircleIcon className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
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
      <Badge variant="outline" className={tierColors[tier as keyof typeof tierColors] || "bg-gray-500/20 text-gray-400 border-gray-500"}>
        {tier.replace("_", " ")}
      </Badge>
    );
  };

  // Helper function to render games for a request
  const renderGames = (request: any) => {
    if (request.is_new_league_request) {
      // For new league requests, use the resolved game details
      const proposedGames = request.proposed_games || [];
      const customGames: any[] = request.proposed_custom_games || [];
      
      if (proposedGames.length === 0 && customGames.length === 0) {
        return 'N/A';
      }

      return (
        <div className="space-y-1">
          {/* Show official games */}
          {proposedGames.map((game: any, index: number) => (
            <div key={index} className="text-sm">
              {game.name} ({game.short_name})
            </div>
          ))}
          
          {/* Show custom games */}
          {customGames.map((game: any, index: number) => (
            <div key={`custom-${index}`} className="text-sm text-cyan-400">
              {game.name} ({game.short_name}) <span className="text-xs">- Custom</span>
            </div>
          ))}
        </div>
      );
    } else {
      // For existing league requests, show the league's games
      if (!request.league?.league_games || request.league.league_games.length === 0) {
        return 'N/A';
      }

      return (
        <div className="space-y-1">
          {request.league.league_games.map((lg: any, index: number) => (
            <div key={index} className="text-sm">
              {lg.game.name} ({lg.game.short_name})
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            League Association Requests
          </h1>
          <p className="text-gray-400 mt-2">
            Manage league administrator association requests and onboarding
          </p>
        </div>
        {pendingCount !== undefined && pendingCount > 0 && (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-gray-300">Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by admin name, email, or league..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-gray-300">Status</Label>
              <Select 
                value={statusFilter ?? "all"} 
                onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value as "PENDING" | "APPROVED" | "REJECTED")}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
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
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading requests...</p>
            </CardContent>
          </Card>
        ) : !requestsData?.requests.length ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-8 text-center">
              <TrophyIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No league association requests found</p>
            </CardContent>
          </Card>
        ) : (
          requestsData.requests.map((request) => (
            <Card 
              key={request.id} 
              className={`bg-gray-900 border-gray-800 transition-colors ${
                selectedRequest === request.id ? 'border-cyan-500' : 'hover:border-gray-700'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Request Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusBadge(request.status)}
                        <span className="text-sm text-gray-400">
                          <CalendarIcon className="h-4 w-4 inline mr-1" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Administrator Info */}
                      <div className="space-y-2">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          League Administrator Information
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p><span className="font-medium">Name:</span> {request.administrator.first_name} {request.administrator.last_name}</p>
                          <p><span className="font-medium">Email:</span> {request.administrator.email}</p>
                          {request.administrator.username && (
                            <p><span className="font-medium">Username:</span> {request.administrator.username}</p>
                          )}
                          <p><span className="font-medium">Joined:</span> {new Date(request.administrator.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* League Info */}
                      <div className="space-y-2">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <TrophyIcon className="h-4 w-4" />
                          League Information
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          {request.is_new_league_request ? (
                            // New league creation request
                            <>
                              <p><span className="font-medium">Name:</span> {request.proposed_league_name} <span className="text-cyan-400">(New League Request)</span></p>
                              <p><span className="font-medium">Short Name:</span> {request.proposed_league_short_name}</p>
                              <p><span className="font-medium">Games:</span> {renderGames(request)}</p>
                              <p><span className="font-medium">Region:</span> {request.proposed_region}{request.proposed_state ? `, ${request.proposed_state}` : ''}</p>
                              {request.proposed_tier && (
                                <p><span className="font-medium">Tier:</span> {getTierBadge(request.proposed_tier)}</p>
                              )}
                              {request.proposed_season && (
                                <p><span className="font-medium">Season:</span> {request.proposed_season}</p>
                              )}
                              {request.proposed_format && (
                                <p><span className="font-medium">Format:</span> {request.proposed_format}</p>
                              )}
                              {request.proposed_founded_year && (
                                <p><span className="font-medium">Founded:</span> {request.proposed_founded_year}</p>
                              )}
                            </>
                          ) : (
                            // Existing league association request
                            <>
                              <p><span className="font-medium">Name:</span> {request.league?.name}</p>
                              <p><span className="font-medium">Short Name:</span> {request.league?.short_name}</p>
                              <p><span className="font-medium">Games:</span> {renderGames(request)}</p>
                              <p><span className="font-medium">Region:</span> {request.league?.region}{request.league?.state ? `, ${request.league.state}` : ''}</p>
                              {request.league?.tier && (
                                <p><span className="font-medium">Tier:</span> {getTierBadge(request.league.tier)}</p>
                              )}
                              {/* Season field not available in current schema */}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* League Description (for new leagues) */}
                    {request.is_new_league_request && request.proposed_league_description && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <GlobeIcon className="h-4 w-4" />
                          Proposed League Description
                        </h4>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-300 text-sm">{request.proposed_league_description}</p>
                        </div>
                      </div>
                    )}

                    {/* Request Message */}
                    {request.request_message && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <MessageSquareIcon className="h-4 w-4" />
                          Administrator Message
                        </h4>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-300 text-sm">{request.request_message}</p>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes (if reviewed) */}
                    {request.admin_notes && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Admin Notes</h4>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-300 text-sm">{request.admin_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {request.status === 'PENDING' && (
                    <div className="lg:w-64 space-y-4">
                      {selectedRequest === request.id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="adminNotes" className="text-gray-300">
                              Admin Notes
                            </Label>
                            <Textarea
                              id="adminNotes"
                              placeholder="Add notes about this decision..."
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              className="bg-gray-800 border-gray-700 text-white min-h-[80px]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(request.id)}
                              disabled={isProcessing}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(request.id)}
                              disabled={isProcessing || !adminNotes.trim()}
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
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
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
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
        <div className="text-center text-gray-400 text-sm">
          Showing {requestsData.requests.length} of {requestsData.pagination.totalCount} requests
        </div>
      )}
    </div>
  );
} 