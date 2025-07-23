"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2Icon,
  PlusIcon,
  Search,
  Trash2Icon,
  Users,
  GraduationCap,
  MapPin,
  ExternalLink,
  Loader2,
  AlertCircle,
  EditIcon,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48 bg-gray-700" />
          <Skeleton className="h-5 w-64 bg-gray-700" />
        </div>
        <Skeleton className="mt-4 h-10 w-32 bg-gray-700 sm:mt-0" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="border-gray-800 bg-[#1a1a2e]">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24 bg-gray-700" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-8 w-12 bg-gray-700" />
              <Skeleton className="h-4 w-32 bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="border-gray-800 bg-[#1a1a2e]">
            <CardHeader>
              <Skeleton className="h-6 w-32 bg-gray-700" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-16 w-full bg-gray-700" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SchoolTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "HIGH_SCHOOL":
      return <GraduationCap className="h-4 w-4" />;
    case "COLLEGE":
    case "UNIVERSITY":
      return <Building2Icon className="h-4 w-4" />;
    default:
      return <Building2Icon className="h-4 w-4" />;
  }
}

function SchoolTypeBadge({ type }: { type: string }) {
  const colors = {
    HIGH_SCHOOL: "bg-blue-600 text-blue-100",
    COLLEGE: "bg-green-600 text-green-100",
    UNIVERSITY: "bg-purple-600 text-purple-100",
  };

  const labels = {
    HIGH_SCHOOL: "High School",
    COLLEGE: "College",
    UNIVERSITY: "University",
  };

  return (
    <Badge
      className={`${colors[type as keyof typeof colors] || "bg-gray-600 text-gray-100"} border-0`}
    >
      <SchoolTypeIcon type={type} />
      <span className="ml-1">
        {labels[type as keyof typeof labels] || type}
      </span>
    </Badge>
  );
}

function ConfirmRemoveDialog({
  open,
  onOpenChange,
  schoolName,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolName: string;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-gray-700 bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron flex items-center gap-2 text-xl text-red-400">
            <Trash2Icon className="h-5 w-5" />
            Remove School
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-300">
            Are you sure you want to remove{" "}
            <span className="font-semibold text-white">{schoolName}</span> from
            your league?
          </p>
          <p className="mt-2 text-sm text-gray-400">
            This will remove all associated data and cannot be reversed.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2Icon className="mr-2 h-4 w-4" />
                Remove School
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSchoolDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [showNewSchoolForm, setShowNewSchoolForm] = useState(false);

  // Reset to search view when dialog opens
  useEffect(() => {
    if (open) {
      setShowNewSchoolForm(false);
    }
  }, [open]);

  // New school form state
  const [newSchoolData, setNewSchoolData] = useState<{
    proposed_school_name: string;
    proposed_school_type: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
    proposed_school_location: string;
    proposed_school_state: string;
    proposed_school_region: string;
    proposed_school_website: string;
    request_message: string;
  }>({
    proposed_school_name: "",
    proposed_school_type: "HIGH_SCHOOL",
    proposed_school_location: "",
    proposed_school_state: "",
    proposed_school_region: "",
    proposed_school_website: "",
    request_message: "",
  });

  const utils = api.useUtils();

  // Search schools
  const { data: searchResults, isLoading: isSearching } =
    api.leagueAdminProfile.searchAvailableSchools.useQuery(
      {
        search: searchQuery,
        limit: 10,
        ...(selectedType !== "all" && {
          type: selectedType as "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY",
        }),
        ...(selectedState !== "all" && { state: selectedState }),
      },
      {
        enabled: searchQuery.length >= 2 && !showNewSchoolForm,
      },
    );

  // Add school to league
  const addSchoolMutation =
    api.leagueAdminProfile.addSchoolToLeague.useMutation({
      onSuccess: (data) => {
        toast.success(`${data.school.name} has been added to your league!`);
        void utils.leagueAdminProfile.getLeagueSchoolsInfinite.invalidate();
        setOpen(false);
        setSearchQuery("");
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to add school to league");
      },
    });

  // Create school request
  const createSchoolMutation =
    api.leagueAdminProfile.submitSchoolCreationRequest.useMutation({
      onSuccess: () => {
        toast.success("School creation request submitted for admin review!");
        setOpen(false);
        setShowNewSchoolForm(false);
        setNewSchoolData({
          proposed_school_name: "",
          proposed_school_type: "HIGH_SCHOOL",
          proposed_school_location: "",
          proposed_school_state: "",
          proposed_school_region: "",
          proposed_school_website: "",
          request_message: "",
        });
      },
      onError: (error) => {
        toast.error(
          error.message ?? "Failed to submit school creation request",
        );
      },
    });

  const handleAddSchool = (schoolId: string) => {
    addSchoolMutation.mutate({ school_id: schoolId });
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    createSchoolMutation.mutate(newSchoolData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 text-white hover:bg-purple-700">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add School
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto border-gray-700 bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">
            {showNewSchoolForm ? "Create New School" : "Add School to League"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {showNewSchoolForm
              ? "Submit a request to create a new school that doesn't exist yet."
              : "Search for existing schools and add them to your league."}
          </DialogDescription>
        </DialogHeader>

        {!showNewSchoolForm ? (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search schools by name, location, or state..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-gray-700 bg-gray-800 pl-10 text-white"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-48 border-gray-700 bg-gray-800 text-white">
                    <SelectValue placeholder="School Type" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                    <SelectItem value="COLLEGE">College</SelectItem>
                    <SelectItem value="UNIVERSITY">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Results */}
            <div className="space-y-4">
              {isSearching && searchQuery.length >= 2 && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-400">
                    Searching schools...
                  </span>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-300">
                    Search Results ({searchResults.length})
                  </h3>
                  {searchResults.map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={school.logo_url ?? undefined} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {school.name
                              .split(" ")
                              .map((w) => w[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium text-white">
                            {school.name}
                          </h4>
                          <div className="mt-1 flex items-center gap-2">
                            <SchoolTypeBadge type={school.type} />
                            <span className="flex items-center gap-1 text-sm text-gray-400">
                              <MapPin className="h-3 w-3" />
                              {school.location}, {school.state}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                            <span>{school._count.players} players</span>
                            <span>{school._count.coaches} coaches</span>
                            <span>{school._count.teams} teams</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleAddSchool(school.id)}
                        disabled={addSchoolMutation.isPending}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        {addSchoolMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add to League"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 &&
                searchResults &&
                searchResults.length === 0 &&
                !isSearching && (
                  <div className="py-8 text-center text-gray-400">
                    <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                    <p>No schools found matching your search.</p>
                    <p className="mt-1 text-sm">
                      Try adjusting your search terms.
                    </p>
                  </div>
                )}

              {searchQuery.length < 2 && (
                <div className="py-8 text-center text-gray-400">
                  <Search className="mx-auto mb-2 h-8 w-8" />
                  <p>Start typing to search for schools</p>
                  <p className="mt-1 text-sm">
                    Enter at least 2 characters to begin searching
                  </p>
                </div>
              )}
            </div>

            {/* New School Request Button */}
            <div className="border-t border-gray-700 pt-4">
              <Button
                onClick={() => setShowNewSchoolForm(true)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Can&apos;t find the school? Create a new one
              </Button>
            </div>
          </div>
        ) : (
          /* New School Form */
          <form onSubmit={handleCreateSchool} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="school-name">School Name *</Label>
                <Input
                  id="school-name"
                  value={newSchoolData.proposed_school_name}
                  onChange={(e) =>
                    setNewSchoolData((prev) => ({
                      ...prev,
                      proposed_school_name: e.target.value,
                    }))
                  }
                  className="border-gray-700 bg-gray-800 text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="school-type">School Type *</Label>
                <Select
                  value={newSchoolData.proposed_school_type}
                  onValueChange={(
                    value: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY",
                  ) =>
                    setNewSchoolData((prev) => ({
                      ...prev,
                      proposed_school_type: value,
                    }))
                  }
                >
                  <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800">
                    <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                    <SelectItem value="COLLEGE">College</SelectItem>
                    <SelectItem value="UNIVERSITY">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location (City) *</Label>
                <Input
                  id="location"
                  value={newSchoolData.proposed_school_location}
                  onChange={(e) =>
                    setNewSchoolData((prev) => ({
                      ...prev,
                      proposed_school_location: e.target.value,
                    }))
                  }
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder="e.g., Los Angeles"
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={newSchoolData.proposed_school_state}
                  onChange={(e) =>
                    setNewSchoolData((prev) => ({
                      ...prev,
                      proposed_school_state: e.target.value,
                    }))
                  }
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder="e.g., California"
                  required
                />
              </div>
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={newSchoolData.proposed_school_region}
                  onChange={(e) =>
                    setNewSchoolData((prev) => ({
                      ...prev,
                      proposed_school_region: e.target.value,
                    }))
                  }
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder="e.g., West Coast"
                />
              </div>
              <div>
                <Label htmlFor="website">Website *</Label>
                <Input
                  id="website"
                  type="url"
                  value={newSchoolData.proposed_school_website}
                  onChange={(e) =>
                    setNewSchoolData((prev) => ({
                      ...prev,
                      proposed_school_website: e.target.value,
                    }))
                  }
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder="https://example.edu"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Request Message *</Label>
              <Textarea
                id="message"
                value={newSchoolData.request_message}
                onChange={(e) =>
                  setNewSchoolData((prev) => ({
                    ...prev,
                    request_message: e.target.value,
                  }))
                }
                className="border-gray-700 bg-gray-800 text-white"
                placeholder="Please explain why this school should be created..."
                required
                minLength={10}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewSchoolForm(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Back to Search
              </Button>
              <Button
                type="submit"
                disabled={createSchoolMutation.isPending}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {createSchoolMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface SchoolCreationRequest {
  id: string;
  proposed_school_name: string;
  proposed_school_type: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
  proposed_school_location: string;
  proposed_school_state: string;
  proposed_school_region: string | null;
  proposed_school_website: string | null;
  request_message: string;
}

interface SchoolRequestFormData {
  request_id: string;
  proposed_school_name: string;
  proposed_school_type: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
  proposed_school_location: string;
  proposed_school_state: string;
  proposed_school_region?: string;
  proposed_school_website?: string;
  request_message: string;
}

function EditSchoolRequestDialog({
  open,
  onOpenChange,
  request,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: SchoolCreationRequest | null;
  onSubmit: (data: SchoolRequestFormData) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState<{
    proposed_school_name: string;
    proposed_school_type: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
    proposed_school_location: string;
    proposed_school_state: string;
    proposed_school_region: string;
    proposed_school_website: string;
    request_message: string;
  }>({
    proposed_school_name: "",
    proposed_school_type: "HIGH_SCHOOL",
    proposed_school_location: "",
    proposed_school_state: "",
    proposed_school_region: "",
    proposed_school_website: "",
    request_message: "",
  });

  // Reset form data when request changes
  useEffect(() => {
    if (request) {
      setFormData({
        proposed_school_name: request.proposed_school_name ?? "",
        proposed_school_type: request.proposed_school_type ?? "HIGH_SCHOOL",
        proposed_school_location: request.proposed_school_location ?? "",
        proposed_school_state: request.proposed_school_state ?? "",
        proposed_school_region: request.proposed_school_region ?? "",
        proposed_school_website: request.proposed_school_website ?? "",
        request_message: request.request_message ?? "",
      });
    }
  }, [request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    onSubmit({
      request_id: request.id,
      ...formData,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto border-gray-700 bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">
            Edit School Request
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your school creation request details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="edit-school-name">School Name *</Label>
              <Input
                id="edit-school-name"
                value={formData.proposed_school_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_school_name: e.target.value,
                  }))
                }
                className="border-gray-700 bg-gray-800 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-school-type">School Type *</Label>
              <Select
                value={formData.proposed_school_type}
                onValueChange={(
                  value: "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY",
                ) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_school_type: value,
                  }))
                }
              >
                <SelectTrigger className="border-gray-700 bg-gray-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800">
                  <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                  <SelectItem value="COLLEGE">College</SelectItem>
                  <SelectItem value="UNIVERSITY">University</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-location">Location (City) *</Label>
              <Input
                id="edit-location"
                value={formData.proposed_school_location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_school_location: e.target.value,
                  }))
                }
                className="border-gray-700 bg-gray-800 text-white"
                placeholder="e.g., Los Angeles"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-state">State *</Label>
              <Input
                id="edit-state"
                value={formData.proposed_school_state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_school_state: e.target.value,
                  }))
                }
                className="border-gray-700 bg-gray-800 text-white"
                placeholder="e.g., California"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-region">Region</Label>
              <Input
                id="edit-region"
                value={formData.proposed_school_region}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_school_region: e.target.value,
                  }))
                }
                className="border-gray-700 bg-gray-800 text-white"
                placeholder="e.g., West Coast"
              />
            </div>
            <div>
              <Label htmlFor="edit-website">Website *</Label>
              <Input
                id="edit-website"
                type="url"
                value={formData.proposed_school_website}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    proposed_school_website: e.target.value,
                  }))
                }
                className="border-gray-700 bg-gray-800 text-white"
                placeholder="https://example.edu"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="edit-message">Request Message *</Label>
            <Textarea
              id="edit-message"
              value={formData.request_message}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  request_message: e.target.value,
                }))
              }
              className="border-gray-700 bg-gray-800 text-white"
              placeholder="Please explain why this school should be created..."
              required
              minLength={10}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-purple-600 text-white hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteSchoolRequestDialog({
  open,
  onOpenChange,
  schoolName,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolName: string;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-gray-700 bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="font-orbitron flex items-center gap-2 text-xl text-red-400">
            <Trash2Icon className="h-5 w-5" />
            Delete Request
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-300">
            Are you sure you want to delete your request for{" "}
            <span className="font-semibold text-white">{schoolName}</span>?
          </p>
          <p className="mt-2 text-sm text-gray-400">
            This will permanently remove the request from admin review.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isLoading}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2Icon className="mr-2 h-4 w-4" />
                Delete Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function LeagueSchoolsPage() {
  const utils = api.useUtils();

  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    schoolName: string;
    leagueSchoolId: string;
  }>({
    open: false,
    schoolName: "",
    leagueSchoolId: "",
  });

  // State for edit school request dialog
  const [editRequestDialog, setEditRequestDialog] = useState<{
    open: boolean;
    request: SchoolCreationRequest | null;
  }>({
    open: false,
    request: null,
  });

  // State for delete school request confirmation
  const [deleteRequestDialog, setDeleteRequestDialog] = useState<{
    open: boolean;
    requestId: string;
    schoolName: string;
  }>({
    open: false,
    requestId: "",
    schoolName: "",
  });

  // Get league schools with infinite scroll
  const {
    data: leagueSchoolsData,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.leagueAdminProfile.getLeagueSchoolsInfinite.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  // Flatten the paginated data
  const leagueSchools =
    leagueSchoolsData?.pages.flatMap((page) => page.items) ?? [];

  // Get school creation requests for this league admin
  const { data: schoolCreationRequests, isLoading: isLoadingRequests } =
    api.leagueAdminProfile.getSchoolCreationRequests.useQuery();

  // Remove school mutation
  const removeSchoolMutation =
    api.leagueAdminProfile.removeSchoolFromLeague.useMutation({
      onSuccess: (data) => {
        toast.success(data.message);
        void utils.leagueAdminProfile.getLeagueSchoolsInfinite.invalidate();
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to remove school from league");
      },
    });

  const handleRemoveSchool = (leagueSchoolId: string, schoolName: string) => {
    setConfirmDialog({
      open: true,
      schoolName,
      leagueSchoolId,
    });
  };

  const handleConfirmRemove = () => {
    removeSchoolMutation.mutate({
      league_school_id: confirmDialog.leagueSchoolId,
    });
  };

  // Update school creation request mutation
  const updateSchoolRequestMutation =
    api.leagueAdminProfile.updateSchoolCreationRequest.useMutation({
      onSuccess: (data) => {
        toast.success(data.message);
        void utils.leagueAdminProfile.getSchoolCreationRequests.invalidate();
        setEditRequestDialog({ open: false, request: null });
      },
      onError: (error) => {
        toast.error(
          error.message ?? "Failed to update school creation request",
        );
      },
    });

  // Delete school creation request mutation
  const deleteSchoolRequestMutation =
    api.leagueAdminProfile.deleteSchoolCreationRequest.useMutation({
      onSuccess: (data) => {
        toast.success(data.message);
        void utils.leagueAdminProfile.getSchoolCreationRequests.invalidate();
        setDeleteRequestDialog({ open: false, requestId: "", schoolName: "" });
      },
      onError: (error) => {
        toast.error(
          error.message ?? "Failed to delete school creation request",
        );
      },
    });

  const handleEditRequest = (request: SchoolCreationRequest) => {
    setEditRequestDialog({ open: true, request });
  };

  const handleDeleteRequest = (requestId: string, schoolName: string) => {
    setDeleteRequestDialog({ open: true, requestId, schoolName });
  };

  const handleConfirmDeleteRequest = () => {
    deleteSchoolRequestMutation.mutate({
      request_id: deleteRequestDialog.requestId,
    });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const totalSchools = leagueSchools?.length ?? 0;
  const totalPlayers =
    leagueSchools?.reduce((sum, ls) => sum + ls.school._count.players, 0) ?? 0;
  const totalCoaches =
    leagueSchools?.reduce((sum, ls) => sum + ls.school._count.coaches, 0) ?? 0;

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-orbitron text-3xl font-bold text-white">
              Manage Schools
            </h1>
            <p className="mt-2 text-gray-400">
              Add schools to your league and manage their participation
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <AddSchoolDialog />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-gray-800 bg-[#1a1a2e]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Schools
              </CardTitle>
              <Building2Icon className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalSchools}
              </div>
              <p className="text-xs text-gray-400">Schools in your league</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-[#1a1a2e]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Players
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalPlayers}
              </div>
              <p className="text-xs text-gray-400">Across all schools</p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-[#1a1a2e]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Coaches
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {totalCoaches}
              </div>
              <p className="text-xs text-gray-400">Across all schools</p>
            </CardContent>
          </Card>
        </div>

        {/* Schools List */}
        <Card className="border-b border-gray-800 bg-gray-800">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center gap-2 text-white">
              <Building2Icon className="h-5 w-5" />
              League Schools ({totalSchools})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isError ? (
              <div className="bg-gray-800 py-12 text-center text-gray-400">
                <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-600" />
                <h3 className="mb-2 text-lg font-medium text-red-400">
                  Failed to Load Schools
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm">
                  There was an error loading your league schools. Please try
                  refreshing the page.
                </p>
              </div>
            ) : totalSchools > 0 ? (
              <div className="divide-y divide-gray-700">
                {leagueSchools?.map((leagueSchool, index) => (
                  <div
                    key={leagueSchool.id}
                    className={`flex items-center justify-between border-gray-700 bg-gray-800 p-4 transition-colors first:border-t-0 hover:bg-gray-700 ${
                      index === leagueSchools.length - 1 ? "rounded-b-lg" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={leagueSchool.school.logo_url ?? undefined}
                        />
                        <AvatarFallback className="bg-gray-700 text-lg text-white">
                          {leagueSchool.school.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <Link
                            href={`/profiles/school/${leagueSchool.school.id}`}
                          >
                            <h3 className="font-orbitron cursor-pointer text-lg font-semibold text-white transition-colors hover:text-purple-300">
                              {leagueSchool.school.name}
                            </h3>
                          </Link>
                          <SchoolTypeBadge type={leagueSchool.school.type} />
                        </div>
                        <div className="mb-2 flex items-center gap-2 text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {leagueSchool.school.location},{" "}
                            {leagueSchool.school.state}
                          </span>
                          {leagueSchool.school.region && (
                            <span className="text-gray-500">
                              • {leagueSchool.school.region}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {leagueSchool.school._count.players} players
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>
                              {leagueSchool.school._count.coaches} coaches
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Building2Icon className="h-4 w-4" />
                            <span>
                              {leagueSchool.school._count.teams} teams
                            </span>
                          </div>
                          <div className="text-gray-500">
                            Joined{" "}
                            {new Date(
                              leagueSchool.joined_at,
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/profiles/school/${leagueSchool.school.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          View Profile
                        </Button>
                      </Link>
                      <Button
                        onClick={() =>
                          handleRemoveSchool(
                            leagueSchool.id,
                            leagueSchool.school.name,
                          )
                        }
                        disabled={removeSchoolMutation.isPending}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        {removeSchoolMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2Icon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasNextPage && (
                  <div className="bg-gray-800 pt-4 text-center">
                    <Button
                      onClick={() => void fetchNextPage()}
                      disabled={isFetchingNextPage}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading more schools...
                        </>
                      ) : (
                        <>
                          Load More Schools
                          <PlusIcon className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-800 py-12 text-center text-gray-400">
                <Building2Icon className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                <h3 className="mb-2 text-lg font-medium">
                  No schools added yet
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm">
                  Get started by adding schools to your league. Schools can
                  participate with their teams and players in your competitions.
                </p>
                <AddSchoolDialog />
              </div>
            )}
          </CardContent>
        </Card>

        {/* School Creation Requests */}
        <Card className="border-b border-gray-800 bg-gray-800">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center gap-2 text-white">
              <GraduationCap className="h-5 w-5" />
              School Creation Requests ({schoolCreationRequests?.length ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingRequests ? (
              <div className="space-y-3 p-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full bg-gray-700" />
                ))}
              </div>
            ) : schoolCreationRequests && schoolCreationRequests.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {schoolCreationRequests
                  .sort((a, b) => {
                    // Sort by status (PENDING first) then by date (newest first)
                    if (a.status !== b.status) {
                      const statusOrder = {
                        PENDING: 0,
                        APPROVED: 1,
                        REJECTED: 2,
                      };
                      return (
                        statusOrder[a.status as keyof typeof statusOrder] -
                        statusOrder[b.status as keyof typeof statusOrder]
                      );
                    }
                    return (
                      new Date(b.requested_at).getTime() -
                      new Date(a.requested_at).getTime()
                    );
                  })
                  .map((request, index, array) => (
                    <div
                      key={request.id}
                      className={`flex items-center justify-between border-gray-700 bg-gray-800 p-4 transition-colors first:border-t-0 hover:bg-gray-700 ${
                        index === array.length - 1 ? "rounded-b-lg" : ""
                      }`}
                    >
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="font-orbitron text-lg font-semibold text-white">
                            {request.proposed_school_name}
                          </h3>
                          <Badge
                            className={
                              request.status === "PENDING"
                                ? "border-yellow-500 bg-yellow-500/20 text-yellow-400"
                                : request.status === "APPROVED"
                                  ? "border-green-500 bg-green-500/20 text-green-400"
                                  : "border-red-500 bg-red-500/20 text-red-400"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <div className="mb-2 flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            {request.proposed_school_type.replace("_", " ")}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {request.proposed_school_location},{" "}
                            {request.proposed_school_state}
                          </span>
                          <span className="text-gray-500">
                            {new Date(
                              request.requested_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        {request.request_message && (
                          <p className="mb-2 text-sm text-gray-300">
                            &quot;{request.request_message}&quot;
                          </p>
                        )}
                        {request.admin_notes && (
                          <div className="rounded bg-gray-700 p-2 text-sm">
                            <span className="font-semibold text-gray-300">
                              Admin Notes:{" "}
                            </span>
                            <span className="text-gray-400">
                              {request.admin_notes}
                            </span>
                          </div>
                        )}
                        {request.created_school && (
                          <div className="mt-2 rounded border border-green-700 bg-green-900/20 p-2 text-sm">
                            <span className="font-semibold text-green-300">
                              School Created:{" "}
                            </span>
                            <span className="text-green-200">
                              {request.created_school.name}
                            </span>
                            <span className="ml-2 text-gray-400">
                              ({request.created_school.location},{" "}
                              {request.created_school.state})
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {request.status === "PENDING" && (
                          <>
                            <Button
                              onClick={() => handleEditRequest(request)}
                              variant="outline"
                              size="sm"
                              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                            >
                              <EditIcon className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={() =>
                                handleDeleteRequest(
                                  request.id,
                                  request.proposed_school_name,
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2Icon className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </>
                        )}
                        {request.created_school && (
                          <Link
                            href={`/profiles/school/${request.created_school.id}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <ExternalLink className="mr-1 h-4 w-4" />
                              View School
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-gray-800 py-12 text-center text-gray-400">
                <GraduationCap className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                <h3 className="mb-2 text-lg font-medium">
                  No school requests yet
                </h3>
                <p className="mx-auto mb-6 max-w-md text-sm">
                  When you submit requests for new schools, they will appear
                  here with their approval status.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <ConfirmRemoveDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog((prev) => ({ ...prev, open }))
          }
          schoolName={confirmDialog.schoolName}
          onConfirm={handleConfirmRemove}
          isLoading={removeSchoolMutation.isPending}
        />

        {/* Edit School Request Dialog */}
        <EditSchoolRequestDialog
          open={editRequestDialog.open}
          onOpenChange={(open) =>
            setEditRequestDialog((prev) => ({ ...prev, open }))
          }
          request={editRequestDialog.request}
          onSubmit={(data) => updateSchoolRequestMutation.mutate(data)}
          isLoading={updateSchoolRequestMutation.isPending}
        />

        {/* Delete School Request Dialog */}
        <DeleteSchoolRequestDialog
          open={deleteRequestDialog.open}
          onOpenChange={(open) =>
            setDeleteRequestDialog((prev) => ({ ...prev, open }))
          }
          schoolName={deleteRequestDialog.schoolName}
          onConfirm={handleConfirmDeleteRequest}
          isLoading={deleteSchoolRequestMutation.isPending}
        />
      </div>
    </div>
  );
}
