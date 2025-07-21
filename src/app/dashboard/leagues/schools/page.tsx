"use client";

import { useState } from "react";
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
    <div className="space-y-6">
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
        enabled: searchQuery.length >= 2,
      },
    );

  // Add school to league
  const addSchoolMutation =
    api.leagueAdminProfile.addSchoolToLeague.useMutation({
      onSuccess: (data) => {
        toast.success(`${data.school.name} has been added to your league!`);
        void utils.leagueAdminProfile.getLeagueSchools.invalidate();
        setOpen(false);
        setSearchQuery("");
      },
      onError: (error) => {
        toast.error(error.message ?? "Failed to add school to league");
      },
    });

  const handleAddSchool = (schoolId: string) => {
    addSchoolMutation.mutate({ school_id: schoolId });
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
            Add School to League
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Search for existing schools and add them to your league.
          </DialogDescription>
        </DialogHeader>

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
                <span className="ml-2 text-gray-400">Searching schools...</span>
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
        </div>
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

  // Get league schools
  const { data: leagueSchools, isLoading } =
    api.leagueAdminProfile.getLeagueSchools.useQuery();

  // Remove school mutation
  const removeSchoolMutation =
    api.leagueAdminProfile.removeSchoolFromLeague.useMutation({
      onSuccess: (data) => {
        toast.success(data.message);
        void utils.leagueAdminProfile.getLeagueSchools.invalidate();
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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const totalSchools = leagueSchools?.length ?? 0;
  const totalPlayers =
    leagueSchools?.reduce((sum, ls) => sum + ls.school._count.players, 0) ?? 0;
  const totalCoaches =
    leagueSchools?.reduce((sum, ls) => sum + ls.school._count.coaches, 0) ?? 0;

  return (
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
            <div className="text-2xl font-bold text-white">{totalSchools}</div>
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
            <div className="text-2xl font-bold text-white">{totalPlayers}</div>
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
            <div className="text-2xl font-bold text-white">{totalCoaches}</div>
            <p className="text-xs text-gray-400">Across all schools</p>
          </CardContent>
        </Card>
      </div>

      {/* Schools List */}
      <Card className="border-gray-800 bg-[#1a1a2e]">
        <CardHeader>
          <CardTitle className="font-orbitron flex items-center gap-2 text-white">
            <Building2Icon className="h-5 w-5" />
            League Schools ({totalSchools})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalSchools > 0 ? (
            <div className="space-y-4">
              {leagueSchools?.map((leagueSchool) => (
                <div
                  key={leagueSchool.id}
                  className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 p-4 transition-colors hover:border-purple-500"
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
                        <h3 className="font-orbitron text-lg font-semibold text-white">
                          {leagueSchool.school.name}
                        </h3>
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
                          <span>{leagueSchool.school._count.teams} teams</span>
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
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <Building2Icon className="mx-auto mb-4 h-16 w-16 text-gray-600" />
              <h3 className="mb-2 text-lg font-medium">No schools added yet</h3>
              <p className="mx-auto mb-6 max-w-md text-sm">
                Get started by adding schools to your league. Schools can
                participate with their teams and players in your competitions.
              </p>
              <AddSchoolDialog />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmRemoveDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        schoolName={confirmDialog.schoolName}
        onConfirm={handleConfirmRemove}
        isLoading={removeSchoolMutation.isPending}
      />
    </div>
  );
}
