"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  MailPlus,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

export function CoachesTab() {
  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [introFilter, setIntroFilter] = useState<string>("all");
  const [page, setPage] = useState(0);

  // Dialog state
  const [editingCoach, setEditingCoach] = useState<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    school: string;
    school_id: string | null;
    title: string | null;
    status: string;
  } | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingCoach, setDeletingCoach] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    school: "",
    school_id: null as string | null,
    title: "",
  });

  // Queries
  const {
    data: coachesData,
    isLoading: coachesLoading,
    refetch: refetchCoaches,
  } = api.adminCoaches.getProvisionedCoaches.useQuery({
    search: search || undefined,
    status:
      statusFilter !== "all"
        ? (statusFilter as "SCRAPED" | "INVITED")
        : undefined,
    introEmailSent:
      introFilter === "sent"
        ? true
        : introFilter === "not_sent"
          ? false
          : undefined,
    school: schoolFilter !== "all" ? schoolFilter : undefined,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  const { data: stats, refetch: refetchStats } =
    api.adminCoaches.getStats.useQuery();

  const { data: schoolOptions } =
    api.adminCoaches.getSchoolsForFilter.useQuery();

  const { data: allSchools } =
    api.coachProfile.getAvailableSchools.useQuery();

  // Mutations
  const sendIntroEmail = api.adminCoaches.sendIntroEmail.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      void refetchCoaches();
      void refetchStats();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendBulkIntroEmails = api.adminCoaches.sendBulkIntroEmails.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowBulkConfirm(false);
      void refetchCoaches();
      void refetchStats();
    },
    onError: (error) => {
      toast.error(error.message);
      setShowBulkConfirm(false);
    },
  });

  const updateCoach = api.adminCoaches.updateCoach.useMutation({
    onSuccess: () => {
      toast.success("Coach updated");
      setEditingCoach(null);
      void refetchCoaches();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteCoach = api.adminCoaches.deleteCoach.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setDeletingCoach(null);
      void refetchCoaches();
      void refetchStats();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetEmailCount =
    api.adminCoaches.resetForwardedEmailCount.useMutation({
      onSuccess: () => {
        toast.success("Email counter reset");
        void refetchCoaches();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const createCoachMutation = api.adminCoaches.createCoach.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsCreateOpen(false);
      setCreateForm({
        email: "",
        first_name: "",
        last_name: "",
        school: "",
        school_id: null,
        title: "",
      });
      void refetchCoaches();
      void refetchStats();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const coaches = coachesData?.coaches ?? [];
  const total = coachesData?.total ?? 0;
  const hasMore = coachesData?.hasMore ?? false;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Preprovisioned</p>
                <p className="font-orbitron text-2xl font-bold text-white">
                  {stats?.totalPreprovisioned ?? "—"}
                </p>
              </div>
              <Users className="h-8 w-8 text-teal-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Intro Emails Sent</p>
                <p className="font-orbitron text-2xl font-bold text-green-400">
                  {stats?.totalIntroEmailsSent ?? "—"}
                </p>
              </div>
              <Mail className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending Intros</p>
                <p className="font-orbitron text-2xl font-bold text-yellow-400">
                  {stats?.totalIntroEmailsPending ?? "—"}
                </p>
              </div>
              <MailPlus className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/10 bg-gray-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Messages Received</p>
                <p className="font-orbitron text-2xl font-bold text-blue-400">
                  {stats?.totalConversations ?? "—"}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="rounded-lg border-white/10 bg-gray-900/50 shadow-2xl backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-orbitron text-xl font-bold text-white">
                Preprovisioned Coach Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage coach accounts that have not yet been claimed via signup
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
                onClick={() => setShowBulkConfirm(true)}
                disabled={
                  !stats?.totalIntroEmailsPending ||
                  sendBulkIntroEmails.isPending
                }
              >
                <Send className="mr-2 h-4 w-4" />
                Send Intro to All Unsent
              </Button>
              <Button
                size="sm"
                className="bg-teal-600 text-white hover:bg-teal-700"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Coach
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, school..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="border-white/20 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[140px] border-white/20 bg-gray-800/50 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SCRAPED">Scraped</SelectItem>
                <SelectItem value="INVITED">Invited</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={introFilter}
              onValueChange={(v) => {
                setIntroFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[160px] border-white/20 bg-gray-800/50 text-white">
                <SelectValue placeholder="Intro Email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Emails</SelectItem>
                <SelectItem value="sent">Intro Sent</SelectItem>
                <SelectItem value="not_sent">Not Sent</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={schoolFilter}
              onValueChange={(v) => {
                setSchoolFilter(v);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[180px] border-white/20 bg-gray-800/50 text-white">
                <SelectValue placeholder="School" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {schoolOptions?.map((school) => (
                  <SelectItem key={school} value={school}>
                    {school}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Coach List */}
          {coachesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            </div>
          ) : coaches.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No preprovisioned coaches found
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Showing {page * ITEMS_PER_PAGE + 1}–
                {Math.min((page + 1) * ITEMS_PER_PAGE, total)} of {total}{" "}
                coaches
              </p>

              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 bg-gray-800/30 p-4 md:flex-row md:items-center md:justify-between"
                >
                  {/* Coach Info */}
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">
                        {coach.first_name} {coach.last_name}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          coach.status === "INVITED"
                            ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                            : "border-gray-500/50 bg-gray-500/10 text-gray-400"
                        }
                      >
                        {coach.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-gray-600/50 text-gray-500"
                      >
                        {coach.source}
                      </Badge>
                      {coach.intro_email_sent && (
                        <Badge
                          variant="outline"
                          className="border-green-500/50 bg-green-500/10 text-green-400"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Intro Sent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{coach.email}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span>{coach.school}</span>
                      {coach.title && <span>· {coach.title}</span>}
                      <span>
                        · {coach._count.Conversation} message
                        {coach._count.Conversation !== 1 ? "s" : ""}
                      </span>
                      <span>
                        · Forwarded: {coach.forwarded_emails_count}/3
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {!coach.intro_email_sent && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                        onClick={() =>
                          sendIntroEmail.mutate({ coachId: coach.id })
                        }
                        disabled={sendIntroEmail.isPending}
                      >
                        {sendIntroEmail.isPending ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-3 w-3" />
                        )}
                        Send Intro
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-gray-300 hover:bg-white/5"
                      onClick={() =>
                        setEditingCoach({
                          id: coach.id,
                          first_name: coach.first_name,
                          last_name: coach.last_name,
                          email: coach.email,
                          school: coach.school,
                          school_id: coach.school_id,
                          title: coach.title,
                          status: coach.status,
                        })
                      }
                    >
                      <Pencil className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    {coach.forwarded_emails_count > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-gray-300 hover:bg-white/5"
                        onClick={() =>
                          resetEmailCount.mutate({ coachId: coach.id })
                        }
                        disabled={resetEmailCount.isPending}
                      >
                        <RefreshCw className="mr-1 h-3 w-3" />
                        Reset Counter
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() =>
                        setDeletingCoach({
                          id: coach.id,
                          name: `${coach.first_name} ${coach.last_name}`,
                          email: coach.email,
                        })
                      }
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="border-white/20 text-gray-300"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {page + 1} of {Math.max(1, Math.ceil(total / ITEMS_PER_PAGE))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="border-white/20 text-gray-300"
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Coach Dialog */}
      <Dialog
        open={!!editingCoach}
        onOpenChange={(open) => !open && setEditingCoach(null)}
      >
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto border-white/20 bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl font-bold text-teal-400">
              Edit Coach
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Update preprovisioned coach details
            </DialogDescription>
          </DialogHeader>
          {editingCoach && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">First Name</Label>
                  <Input
                    value={editingCoach.first_name}
                    onChange={(e) =>
                      setEditingCoach({
                        ...editingCoach,
                        first_name: e.target.value,
                      })
                    }
                    className="border-white/20 bg-gray-800/50 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Last Name</Label>
                  <Input
                    value={editingCoach.last_name}
                    onChange={(e) =>
                      setEditingCoach({
                        ...editingCoach,
                        last_name: e.target.value,
                      })
                    }
                    className="border-white/20 bg-gray-800/50 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Email</Label>
                <Input
                  type="email"
                  value={editingCoach.email}
                  onChange={(e) =>
                    setEditingCoach({
                      ...editingCoach,
                      email: e.target.value,
                    })
                  }
                  className="border-white/20 bg-gray-800/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">School</Label>
                <Select
                  value={editingCoach.school_id ?? ""}
                  onValueChange={(schoolId) => {
                    const school = allSchools?.find((s) => s.id === schoolId);
                    setEditingCoach({
                      ...editingCoach,
                      school: school?.name ?? editingCoach.school,
                      school_id: schoolId,
                    });
                  }}
                >
                  <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                    <SelectValue placeholder={editingCoach.school || "Select a school"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {allSchools?.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                        {school.state ? ` (${school.state})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Title</Label>
                <Input
                  value={editingCoach.title ?? ""}
                  onChange={(e) =>
                    setEditingCoach({
                      ...editingCoach,
                      title: e.target.value || null,
                    })
                  }
                  placeholder="e.g. Head Coach, Director of Esports"
                  className="border-white/20 bg-gray-800/50 text-white placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Status</Label>
                <Select
                  value={editingCoach.status}
                  onValueChange={(v) =>
                    setEditingCoach({ ...editingCoach, status: v })
                  }
                >
                  <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCRAPED">Scraped</SelectItem>
                    <SelectItem value="INVITED">Invited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingCoach(null)}
                  className="border-white/20 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() =>
                    updateCoach.mutate({
                      id: editingCoach.id,
                      first_name: editingCoach.first_name,
                      last_name: editingCoach.last_name,
                      email: editingCoach.email,
                      school: editingCoach.school,
                      school_id: editingCoach.school_id,
                      title: editingCoach.title,
                      status: editingCoach.status as "SCRAPED" | "INVITED",
                    })
                  }
                  disabled={updateCoach.isPending}
                  className="bg-teal-600 text-white hover:bg-teal-700"
                >
                  {updateCoach.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Coach Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto border-white/20 bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="font-orbitron text-xl font-bold text-teal-400">
              Create Preprovisioned Coach
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manually add a new preprovisioned coach account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">First Name *</Label>
                <Input
                  value={createForm.first_name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, first_name: e.target.value })
                  }
                  className="border-white/20 bg-gray-800/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Last Name *</Label>
                <Input
                  value={createForm.last_name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, last_name: e.target.value })
                  }
                  className="border-white/20 bg-gray-800/50 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email *</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="border-white/20 bg-gray-800/50 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">School *</Label>
              <Select
                value={createForm.school_id ?? ""}
                onValueChange={(schoolId) => {
                  const school = allSchools?.find((s) => s.id === schoolId);
                  setCreateForm({
                    ...createForm,
                    school: school?.name ?? "",
                    school_id: schoolId,
                  });
                }}
              >
                <SelectTrigger className="border-white/20 bg-gray-800/50 text-white">
                  <SelectValue placeholder="Select a school" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {allSchools?.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                      {school.state ? ` (${school.state})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Title</Label>
              <Input
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm({ ...createForm, title: e.target.value })
                }
                placeholder="e.g. Head Coach, Director of Esports"
                className="border-white/20 bg-gray-800/50 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-white/20 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  createCoachMutation.mutate({
                    email: createForm.email,
                    first_name: createForm.first_name,
                    last_name: createForm.last_name,
                    school: createForm.school,
                    school_id: createForm.school_id,
                    title: createForm.title || null,
                  })
                }
                disabled={
                  createCoachMutation.isPending ||
                  !createForm.email ||
                  !createForm.first_name ||
                  !createForm.last_name ||
                  !createForm.school
                }
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                {createCoachMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Coach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCoach}
        onOpenChange={(open) => !open && setDeletingCoach(null)}
      >
        <DialogContent className="max-w-md border-white/20 bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Delete Coach
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingCoach && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to delete{" "}
                <span className="font-medium text-white">
                  {deletingCoach.name}
                </span>{" "}
                ({deletingCoach.email})?
              </p>
              <p className="text-sm text-yellow-400">
                All associated conversations and messages will be permanently
                deleted.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeletingCoach(null)}
                  className="border-white/20 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteCoach.mutate({ id: deletingCoach.id })}
                  disabled={deleteCoach.isPending}
                >
                  {deleteCoach.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Send Confirmation Dialog */}
      <Dialog open={showBulkConfirm} onOpenChange={setShowBulkConfirm}>
        <DialogContent className="max-w-md border-white/20 bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-400">
              <Send className="h-5 w-5" />
              Send Bulk Intro Emails
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This will send intro emails to all coaches who haven&apos;t
              received one yet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-300">
              <span className="font-orbitron text-lg font-bold text-yellow-400">
                {stats?.totalIntroEmailsPending ?? 0}
              </span>{" "}
              coaches will receive an intro email.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBulkConfirm(false)}
                className="border-white/20 text-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => sendBulkIntroEmails.mutate()}
                disabled={sendBulkIntroEmails.isPending}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                {sendBulkIntroEmails.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send to All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
