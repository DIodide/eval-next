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
  BuildingIcon,
  UserIcon,
  CalendarIcon,
  MessageSquareIcon,
  CrownIcon,
  GraduationCapIcon,
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
    is_new_school_request?: boolean;
    proposed_school_name?: string;
    proposed_school_type?: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
    proposed_school_location?: string;
    proposed_school_state?: string;
    proposed_school_region?: string;
    proposed_school_website?: string;
    coach: {
      first_name: string;
      last_name: string;
      email: string;
      username: string;
      created_at: string;
    };
    school?: {
      name: string;
      type: string;
      location: string;
      state: string;
      region?: string;
    };
  }>;
  pagination: {
    total: number;
  };
}

export default function SchoolRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | undefined
  >();
  const [requestTypeFilter, setRequestTypeFilter] = useState<
    "all" | "coach" | "league"
  >("all");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch coach school association requests
  const {
    data: coachRequestsData,
    isLoading: isLoadingCoachRequests,
    refetch: refetchCoachRequests,
  } = api.schoolAssociationRequests.getRequests.useQuery(
    {
      search: searchTerm || undefined,
      status: statusFilter,
      page: 1,
      limit: 50,
    },
    {
      enabled: requestTypeFilter === "all" || requestTypeFilter === "coach",
    },
  );

  // Fetch league school creation requests
  const {
    data: leagueRequestsData,
    isLoading: isLoadingLeagueRequests,
    refetch: refetchLeagueRequests,
  } = api.leagueSchoolCreationRequests.getRequests.useQuery(
    {
      search: searchTerm || undefined,
      status: statusFilter,
      page: 1,
      limit: 50,
    },
    {
      enabled: requestTypeFilter === "all" || requestTypeFilter === "league",
    },
  );

  // Get pending counts for the header
  const coachPendingCountQuery =
    api.schoolAssociationRequests.getPendingCount.useQuery();
  const leaguePendingCountQuery =
    api.leagueSchoolCreationRequests.getPendingCount.useQuery();

  const coachPendingCount = coachPendingCountQuery.data ?? 0;
  const leaguePendingCount = leaguePendingCountQuery.data ?? 0;
  const totalPendingCount = coachPendingCount + leaguePendingCount;

  // Combine and sort requests
  const combinedRequests = (() => {
    const coach =
      requestTypeFilter === "all" || requestTypeFilter === "coach"
        ? (coachRequestsData?.requests ?? []).map((req) => ({
            ...req,
            requestType: "coach" as const,
          }))
        : [];
    const league =
      requestTypeFilter === "all" || requestTypeFilter === "league"
        ? (leagueRequestsData?.requests ?? []).map((req) => ({
            ...req,
            requestType: "league" as const,
          }))
        : [];

    return [...coach, ...league].sort((a, b) => {
      // Sort by status (PENDING first) then by date
      if (a.status !== b.status) {
        const statusOrder = { PENDING: 0, APPROVED: 1, REJECTED: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return (
        new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
      );
    });
  })();

  const isLoading = isLoadingCoachRequests || isLoadingLeagueRequests;

  // Coach school association request mutations
  const approveCoachRequest =
    api.schoolAssociationRequests.approveRequest.useMutation({
      onSuccess: () => {
        toast.success("School association request approved successfully!");
        setSelectedRequest(null);
        setAdminNotes("");
        void refetchCoachRequests();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to approve request");
      },
      onSettled: () => {
        setIsProcessing(false);
      },
    });

  const rejectCoachRequest =
    api.schoolAssociationRequests.rejectRequest.useMutation({
      onSuccess: () => {
        toast.success("School association request rejected");
        setSelectedRequest(null);
        setAdminNotes("");
        void refetchCoachRequests();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to reject request");
      },
      onSettled: () => {
        setIsProcessing(false);
      },
    });

  // League school creation request mutations
  const approveLeagueRequest =
    api.leagueSchoolCreationRequests.approveRequest.useMutation({
      onSuccess: () => {
        toast.success("League school creation request approved successfully!");
        setSelectedRequest(null);
        setAdminNotes("");
        void refetchLeagueRequests();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to approve request");
      },
      onSettled: () => {
        setIsProcessing(false);
      },
    });

  const rejectLeagueRequest =
    api.leagueSchoolCreationRequests.rejectRequest.useMutation({
      onSuccess: () => {
        toast.success("League school creation request rejected");
        setSelectedRequest(null);
        setAdminNotes("");
        void refetchLeagueRequests();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to reject request");
      },
      onSettled: () => {
        setIsProcessing(false);
      },
    });

  const handleApprove = async (
    requestId: string,
    requestType: "coach" | "league",
  ) => {
    setIsProcessing(true);
    if (requestType === "coach") {
      await approveCoachRequest.mutateAsync({
        requestId,
        adminNotes: adminNotes || undefined,
      });
    } else {
      await approveLeagueRequest.mutateAsync({
        requestId,
        adminNotes: adminNotes || undefined,
      });
    }
  };

  const handleReject = async (
    requestId: string,
    requestType: "coach" | "league",
  ) => {
    if (!adminNotes.trim()) {
      toast.error("Admin notes are required for rejection");
      return;
    }

    setIsProcessing(true);
    if (requestType === "coach") {
      await rejectCoachRequest.mutateAsync({
        requestId,
        adminNotes,
      });
    } else {
      await rejectLeagueRequest.mutateAsync({
        requestId,
        adminNotes,
      });
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            School Requests Management
          </h1>
          <p className="mt-2 text-gray-400">
            Manage coach school association requests and league school creation
            requests
          </p>
        </div>
        {totalPendingCount > 0 && (
          <Badge
            variant="outline"
            className="border-yellow-500 bg-yellow-500/20 text-yellow-400"
          >
            {totalPendingCount} Pending
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
                  placeholder="Search by coach name, email, or school..."
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
        ) : !combinedRequests.length ? (
          <Card className="border-gray-800 bg-gray-900">
            <CardContent className="p-8 text-center">
              <BuildingIcon className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">
                No school association requests found
              </p>
            </CardContent>
          </Card>
        ) : (
          combinedRequests.map((request) => (
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
                          {new Date(request.requested_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Requester Info */}
                      <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-medium text-white">
                          <UserIcon className="h-4 w-4" />
                          {request.requestType === "coach"
                            ? "Coach Information"
                            : "League Administrator Information"}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-300">
                          {request.requestType === "coach" ? (
                            <>
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {request.coach.first_name}{" "}
                                {request.coach.last_name}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span>{" "}
                                {request.coach.email}
                              </p>
                              <p>
                                <span className="font-medium">Username:</span>{" "}
                                {request.coach.username}
                              </p>
                              <p>
                                <span className="font-medium">Joined:</span>{" "}
                                {new Date(
                                  request.coach.created_at,
                                ).toLocaleDateString()}
                              </p>
                            </>
                          ) : (
                            <>
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {request.administrator.first_name}{" "}
                                {request.administrator.last_name}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span>{" "}
                                {request.administrator.email}
                              </p>
                              <p>
                                <span className="font-medium">Username:</span>{" "}
                                {request.administrator.username}
                              </p>
                              <p>
                                <span className="font-medium">League ID:</span>{" "}
                                {request.administrator.league}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* School Info */}
                      <div className="space-y-2">
                        <h3 className="flex items-center gap-2 font-medium text-white">
                          <BuildingIcon className="h-4 w-4" />
                          School Information
                        </h3>
                        <div className="space-y-1 text-sm text-gray-300">
                          {request.requestType === "league" ? (
                            // League school creation request - always creating new school
                            <>
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {request.proposed_school_name}{" "}
                                <span className="text-cyan-400">
                                  (New School Request)
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Type:</span>{" "}
                                {request.proposed_school_type.replace("_", " ")}
                              </p>
                              <p>
                                <span className="font-medium">Location:</span>{" "}
                                {request.proposed_school_location},{" "}
                                {request.proposed_school_state}
                              </p>
                              {request.proposed_school_region && (
                                <p>
                                  <span className="font-medium">Region:</span>{" "}
                                  {request.proposed_school_region}
                                </p>
                              )}
                              {request.proposed_school_website && (
                                <p>
                                  <span className="font-medium">Website:</span>{" "}
                                  <a
                                    href={request.proposed_school_website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:underline"
                                  >
                                    {request.proposed_school_website}
                                  </a>
                                </p>
                              )}
                            </>
                          ) : request.is_new_school_request ? (
                            // Coach new school creation request
                            <>
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {request.proposed_school_name}{" "}
                                <span className="text-cyan-400">
                                  (New School Request)
                                </span>
                              </p>
                              <p>
                                <span className="font-medium">Type:</span>{" "}
                                {request.proposed_school_type
                                  ? request.proposed_school_type.replace(
                                      "_",
                                      " ",
                                    )
                                  : "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Location:</span>{" "}
                                {request.proposed_school_location},{" "}
                                {request.proposed_school_state}
                              </p>
                              {request.proposed_school_region && (
                                <p>
                                  <span className="font-medium">Region:</span>{" "}
                                  {request.proposed_school_region}
                                </p>
                              )}
                              {request.proposed_school_website && (
                                <p>
                                  <span className="font-medium">Website:</span>{" "}
                                  <a
                                    href={request.proposed_school_website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:underline"
                                  >
                                    {request.proposed_school_website}
                                  </a>
                                </p>
                              )}
                            </>
                          ) : (
                            // Coach existing school association request
                            <>
                              <p>
                                <span className="font-medium">Name:</span>{" "}
                                {request.school?.name}
                              </p>
                              <p>
                                <span className="font-medium">Type:</span>{" "}
                                {request.school?.type
                                  ? request.school.type.replace("_", " ")
                                  : "N/A"}
                              </p>
                              <p>
                                <span className="font-medium">Location:</span>{" "}
                                {request.school?.location},{" "}
                                {request.school?.state}
                              </p>
                              {request.school?.region && (
                                <p>
                                  <span className="font-medium">Region:</span>{" "}
                                  {request.school.region}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Request Message */}
                    {request.request_message && (
                      <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium text-white">
                          <MessageSquareIcon className="h-4 w-4" />
                          Coach Message
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
                              onClick={() =>
                                handleApprove(request.id, request.requestType)
                              }
                              disabled={isProcessing}
                              className="flex-1 bg-green-600 text-white hover:bg-green-700"
                            >
                              <CheckCircleIcon className="mr-1 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() =>
                                handleReject(request.id, request.requestType)
                              }
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
      {combinedRequests.length > 0 && (
        <div className="text-center text-sm text-gray-400">
          Showing {combinedRequests.length} of{" "}
          {(coachRequestsData?.pagination.total ?? 0) +
            (leagueRequestsData?.pagination.total ?? 0)}{" "}
          requests
        </div>
      )}
    </div>
  );
}
