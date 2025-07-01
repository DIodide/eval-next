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
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  MessageSquareIcon,
  TrophyIcon,
  GamepadIcon,
  LinkIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// Type definitions for requests data
interface RequestData {
  requests: Array<{
    id: string;
    status: string;
    requested_at: string;
    request_message?: string;
    admin_notes?: string;
    organization_name: string;
    organization_type: "PROFESSIONAL_LEAGUE" | "COLLEGIATE_LEAGUE" | "HIGH_SCHOOL_LEAGUE" | "AMATEUR_LEAGUE" | "TOURNAMENT_ORGANIZER" | "ESPORTS_COMPANY" | "GAMING_ORGANIZATION";
    organization_location?: string;
    organization_state?: string;
    organization_region?: string;
    organization_website?: string;
    description?: string;
    founded_year?: number;
    leagues_operated: string[];
    games_supported: string[];
    verification_documents: string[];
    references?: string;
    league_organization: {
      first_name: string;
      last_name: string;
      email: string;
      username: string;
      created_at: string;
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { data: requestsData, isLoading, refetch } = api.leagueAssociationRequests.getRequests.useQuery({
    search: searchTerm || undefined,
    status: statusFilter,
    page: 1,
    limit: 50,
  });

  // Get pending count for the header
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pendingCountQuery = api.leagueAssociationRequests.getPendingCount.useQuery();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pendingCount = pendingCountQuery.data;

  // Approve request mutation
  const approveRequest = api.leagueAssociationRequests.approveRequest.useMutation({
    onSuccess: () => {
      toast.success("League verification request approved successfully!");
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
      toast.success("League verification request rejected");
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

  const formatOrganizationType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            League Verification Requests
          </h1>
          <p className="text-gray-400 mt-2">
            Manage league organization verification requests and onboarding
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
                  placeholder="Search by organization name, contact name, or email..."
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
              <p className="text-gray-400">No league verification requests found</p>
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
                          {new Date(request.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Info */}
                      <div className="space-y-2">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Contact Information
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p><span className="font-medium">Name:</span> {request.league_organization.first_name} {request.league_organization.last_name}</p>
                          <p><span className="font-medium">Email:</span> {request.league_organization.email}</p>
                          <p><span className="font-medium">Username:</span> {request.league_organization.username}</p>
                          <p><span className="font-medium">Joined:</span> {new Date(request.league_organization.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Organization Info */}
                      <div className="space-y-2">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <BuildingIcon className="h-4 w-4" />
                          Organization Information
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p><span className="font-medium">Name:</span> {request.organization_name}</p>
                          <p><span className="font-medium">Type:</span> {formatOrganizationType(request.organization_type)}</p>
                          {request.organization_location && request.organization_state && (
                            <p><span className="font-medium">Location:</span> {request.organization_location}, {request.organization_state}</p>
                          )}
                          {request.organization_region && (
                            <p><span className="font-medium">Region:</span> {request.organization_region}</p>
                          )}
                          {request.founded_year && (
                            <p><span className="font-medium">Founded:</span> {request.founded_year}</p>
                          )}
                          {request.organization_website && (
                            <p><span className="font-medium">Website:</span> <a href={request.organization_website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline inline-flex items-center gap-1"><LinkIcon className="h-3 w-3" />{request.organization_website}</a></p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {request.description && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Description</h4>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-300 text-sm">{request.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Games Supported */}
                    {request.games_supported.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <GamepadIcon className="h-4 w-4" />
                          Games Supported
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {request.games_supported.map((game) => (
                            <Badge key={game} variant="secondary" className="bg-gray-700 text-gray-300">
                              {game}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Leagues Operated */}
                    {request.leagues_operated.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <TrophyIcon className="h-4 w-4" />
                          Leagues/Tournaments Operated
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {request.leagues_operated.map((league) => (
                            <Badge key={league} variant="secondary" className="bg-gray-700 text-gray-300">
                              {league}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Verification Documents */}
                    {request.verification_documents.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Verification Documents</h4>
                        <div className="space-y-1">
                          {request.verification_documents.map((doc, index) => (
                            <a 
                              key={index} 
                              href={doc} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-cyan-400 hover:underline text-sm flex items-center gap-1"
                            >
                              <LinkIcon className="h-3 w-3" />
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* References */}
                    {request.references && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">References</h4>
                        <div className="bg-gray-800 rounded-lg p-3">
                          <p className="text-gray-300 text-sm">{request.references}</p>
                        </div>
                      </div>
                    )}

                    {/* Request Message */}
                    {request.request_message && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <MessageSquareIcon className="h-4 w-4" />
                          Additional Message
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
          Showing {requestsData.requests.length} of {requestsData.pagination.total} requests
        </div>
      )}
    </div>
  );
}