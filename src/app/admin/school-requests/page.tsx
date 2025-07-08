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
  MessageSquareIcon
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
  const [statusFilter, setStatusFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | undefined>();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch requests with pagination
   
  const { data: requestsData, isLoading, refetch } = api.schoolAssociationRequests.getRequests.useQuery({
    search: searchTerm || undefined,
    status: statusFilter,
    page: 1,
    limit: 50,
  });

  // Get pending count for the header
   
  const pendingCountQuery = api.schoolAssociationRequests.getPendingCount.useQuery();
   
  const pendingCount = pendingCountQuery.data;

  // Approve request mutation
  const approveRequest = api.schoolAssociationRequests.approveRequest.useMutation({
    onSuccess: () => {
      toast.success("School association request approved successfully!");
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
  const rejectRequest = api.schoolAssociationRequests.rejectRequest.useMutation({
    onSuccess: () => {
      toast.success("School association request rejected");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            School Association Requests
          </h1>
          <p className="text-gray-400 mt-2">
            Manage coach school association requests and onboarding
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
                  placeholder="Search by coach name, email, or school..."
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
              <BuildingIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No school association requests found</p>
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
                      {/* Coach Info */}
                      <div className="space-y-2">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Coach Information
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p><span className="font-medium">Name:</span> {request.coach.first_name} {request.coach.last_name}</p>
                          <p><span className="font-medium">Email:</span> {request.coach.email}</p>
                          <p><span className="font-medium">Username:</span> {request.coach.username}</p>
                          <p><span className="font-medium">Joined:</span> {new Date(request.coach.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* School Info */}
                      <div className="space-y-2">
                        <h3 className="text-white font-medium flex items-center gap-2">
                          <BuildingIcon className="h-4 w-4" />
                          School Information
                        </h3>
                        <div className="text-sm text-gray-300 space-y-1">
                          {request.is_new_school_request ? (
                            // New school creation request
                            <>
                              <p><span className="font-medium">Name:</span> {request.proposed_school_name} <span className="text-cyan-400">(New School Request)</span></p>
                                                             <p><span className="font-medium">Type:</span> {request.proposed_school_type ? request.proposed_school_type.replace('_', ' ') : 'N/A'}</p>
                              <p><span className="font-medium">Location:</span> {request.proposed_school_location}, {request.proposed_school_state}</p>
                              {request.proposed_school_region && (
                                <p><span className="font-medium">Region:</span> {request.proposed_school_region}</p>
                              )}
                              {request.proposed_school_website && (
                                <p><span className="font-medium">Website:</span> <a href={request.proposed_school_website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{request.proposed_school_website}</a></p>
                              )}
                            </>
                          ) : (
                            // Existing school association request
                            <>
                              <p><span className="font-medium">Name:</span> {request.school?.name}</p>
                                                             <p><span className="font-medium">Type:</span> {request.school?.type ? request.school.type.replace('_', ' ') : 'N/A'}</p>
                              <p><span className="font-medium">Location:</span> {request.school?.location}, {request.school?.state}</p>
                              {request.school?.region && (
                                <p><span className="font-medium">Region:</span> {request.school.region}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Request Message */}
                    {request.request_message && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium flex items-center gap-2">
                          <MessageSquareIcon className="h-4 w-4" />
                          Coach Message
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