"use client";

import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UsersIcon, 
  TrophyIcon, 
  MessageSquareIcon, 
  SearchIcon,
  PlusIcon,
  EyeIcon,
  AlertCircleIcon,
  ClockIcon,
  BuildingIcon,
  MegaphoneIcon,
  EditIcon,
  TrashIcon,
  PinIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { SchoolAssociationRequestForm } from "./_components/SchoolAssociationRequestForm";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";

// Type definitions matching the Prisma schema and tRPC return types
type SchoolAnnouncementType = "GENERAL" | "TRYOUT" | "ACHIEVEMENT" | "FACILITY" | "SCHOLARSHIP" | "ALUMNI" | "EVENT" | "SEASON_REVIEW";

type AnnouncementAuthor = {
  id: string;
  first_name: string;
  last_name: string;
  image_url: string | null;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: SchoolAnnouncementType;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
  author: AnnouncementAuthor;
};

type EditingAnnouncement = {
  id: string;
  title: string;
  content: string;
  type: SchoolAnnouncementType;
  is_pinned: boolean;
};

type NewAnnouncement = {
  title: string;
  content: string;
  type: SchoolAnnouncementType;
  is_pinned: boolean;
};

// Helper function to get announcement type colors
const getAnnouncementColor = (type: SchoolAnnouncementType): string => {
  switch (type) {
    case "TRYOUT":
      return "border-cyan-500 bg-cyan-400";
    case "ACHIEVEMENT":
      return "border-green-500 bg-green-400";
    case "FACILITY":
      return "border-yellow-500 bg-yellow-400";
    case "SCHOLARSHIP":
      return "border-purple-500 bg-purple-400";
    case "ALUMNI":
      return "border-blue-500 bg-blue-400";
    case "EVENT":
      return "border-indigo-500 bg-indigo-400";
    case "SEASON_REVIEW":
      return "border-red-500 bg-red-400";
    default: // GENERAL
      return "border-gray-500 bg-gray-400";
  }
};

// Format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    } else {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
    }
  }
};

export default function CoachesDashboard() {
  const { user } = useUser();
  
  // Get school info to show current requests (only for display purposes)
  const { data: schoolInfo, isLoading: isLoadingSchool } = api.coachProfile.getSchoolInfo.useQuery();
  
  // Check if coach is onboarded by looking at Clerk public metadata
  const canAccess = user?.publicMetadata?.onboarded === true && user?.publicMetadata?.userType === "coach";

  // Get dashboard stats (only fetch if coach has access)
  const { data: prospectsCount = 0 } = api.playerSearch.getFavoritesCount.useQuery(undefined, {
    enabled: canAccess,
  });
  
  const { data: activeTryoutsCount = 0 } = api.tryouts.getActiveTryoutsCount.useQuery(undefined, {
    enabled: canAccess,
  });
  
  const { data: unreadMessagesCount = 0 } = api.messages.getUnreadCount.useQuery(undefined, {
    enabled: canAccess,
  });

  // Get recent activity (only fetch if coach has access)
  const { data: recentActivity = [] } = api.coachProfile.getRecentActivity.useQuery(undefined, {
    enabled: canAccess,
  });

  // Get school announcements (only fetch if coach has access and has a school)
  const schoolId = schoolInfo?.school_id;
  const { data: announcementsData, isLoading: isLoadingAnnouncements } = api.schoolProfile.getAnnouncements.useQuery(
    { schoolId: schoolId!, limit: 10 },
    { enabled: canAccess && !!schoolId }
  );

  // State for announcement management
  const [editingAnnouncement, setEditingAnnouncement] = useState<EditingAnnouncement | null>(null);
  
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<NewAnnouncement>({
    title: "",
    content: "",
    type: "GENERAL",
    is_pinned: false,
  });

  // Mutations for announcements
  const utils = api.useUtils();
  
  const deleteMutation = api.schoolProfile.deleteAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted successfully!");
      if (schoolId) {
        void utils.schoolProfile.getAnnouncements.invalidate({ schoolId });
      }
    },
    onError: (error) => {
      toast.error(`Failed to delete announcement: ${error.message}`);
    },
  });

  const createMutation = api.schoolProfile.createAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Announcement created successfully!");
      setShowCreateForm(false);
      setCreateForm({ title: "", content: "", type: "GENERAL", is_pinned: false });
      if (schoolId) {
        void utils.schoolProfile.getAnnouncements.invalidate({ schoolId });
      }
    },
    onError: (error) => {
      toast.error(`Failed to create announcement: ${error.message}`);
    },
  });

  const updateMutation = api.schoolProfile.updateAnnouncement.useMutation({
    onSuccess: () => {
      toast.success("Announcement updated successfully!");
      setEditingAnnouncement(null);
      if (schoolId) {
        void utils.schoolProfile.getAnnouncements.invalidate({ schoolId });
      }
    },
    onError: (error) => {
      toast.error(`Failed to update announcement: ${error.message}`);
    },
  });

  const handleDeleteAnnouncement = (announcementId: string) => {
    if (confirm("Are you sure you want to delete this announcement? This action cannot be undone.")) {
      deleteMutation.mutate({ id: announcementId });
    }
  };

  const quickActions = [
    {
      title: "Search Players",
      description: "Find and scout talented players",
      icon: SearchIcon,
      href: "/dashboard/coaches/player-search",
      color: "from-blue-600 to-blue-700",
      requiresOnboarding: true,
      comingSoon: true
    },
    {
      title: "Create Tryout",
      description: "Organize a new tryout event",
      icon: PlusIcon,
      href: "/dashboard/coaches/tryouts",
      color: "from-green-600 to-green-700",
      requiresOnboarding: true,
      comingSoon: false
    },
    {
      title: "View Profile",
      description: "Manage your coach profile",
      icon: EyeIcon,
      href: "/dashboard/coaches/profile",
      color: "from-purple-600 to-purple-700",
      requiresOnboarding: false,
      comingSoon: false
    },
  ];

  const stats = [
    {
      title: "My Prospects",
      value: canAccess ? prospectsCount.toString() : "—",
      icon: UsersIcon,
      description: canAccess ? "Players you're tracking" : "Available after onboarding",
      href: canAccess ? "/dashboard/coaches/prospects" : undefined,
    },
    {
      title: "Active Tryouts",
      value: canAccess ? activeTryoutsCount.toString() : "—",
      icon: TrophyIcon,
      description: canAccess ? "Ongoing recruitment events" : "Available after onboarding",
      href: canAccess ? "/dashboard/coaches/tryouts" : undefined,
    },
    {
      title: "Unread Messages",
      value: canAccess ? unreadMessagesCount.toString() : "—",
      icon: MessageSquareIcon,
      description: canAccess ? "New player inquiries" : "Available after onboarding",
      href: canAccess ? "/dashboard/coaches/messages" : undefined,
    },
  ];

  if (isLoadingSchool) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-orbitron font-bold mb-2">
            Loading Dashboard...
          </h1>
        </div>
      </div>
    );
  }

  // Determine onboarding status based on Clerk metadata
  const hasPendingRequest = schoolInfo?.school_requests && schoolInfo.school_requests.length > 0 && 
                            schoolInfo.school_requests[0]!.status === 'PENDING';
  const canRequestAssociation = !canAccess && !hasPendingRequest;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-orbitron font-bold mb-2">
          Welcome back, Coach {user?.firstName}!
        </h1>
        <p className="text-cyan-100 font-rajdhani text-lg">
          {canAccess 
            ? "Manage your recruitment pipeline and discover the next generation of esports talent."
            : "Complete your onboarding to start recruiting talented esports players."
          }
        </p>
      </div>

      {/* Onboarding Status Card */}
      {!canAccess && (
        <Card className="bg-gray-900 border-yellow-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-yellow-400 font-orbitron flex items-center gap-2">
              {hasPendingRequest ? (
                <>
                  <ClockIcon className="h-5 w-5" />
                  School Association Pending
                </>
              ) : canRequestAssociation ? (
                <>
                  <AlertCircleIcon className="h-5 w-5" />
                  Onboarding Required
                </>
              ) : (
                <>
                  <AlertCircleIcon className="h-5 w-5" />
                  Account Setup Needed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 font-rajdhani mb-4">
              {canAccess 
                ? "Your coach account is fully activated and ready to use."
                : hasPendingRequest 
                  ? "Your school association request is pending review by our administrators. You'll receive access once approved."
                  : canRequestAssociation
                    ? "To access coach features, you need to associate with a school. Please submit a school association request."
                    : "Please contact support for assistance with your coach account."
              }
            </p>
            
            {hasPendingRequest && schoolInfo?.school_requests && schoolInfo.school_requests.length > 0 && (
               <div className="bg-gray-800 rounded-lg p-4 mb-4">
                 <h4 className="text-white font-orbitron font-semibold mb-2 flex items-center gap-2">
                   <BuildingIcon className="h-4 w-4" />
                   Pending Request
                 </h4>
                 <div className="text-sm text-gray-300">
                   {schoolInfo.school_requests[0]!.is_new_school_request ? (
                     // New school creation request
                     <>
                       <p className="mb-1">
                         <span className="font-medium">School:</span> {schoolInfo.school_requests[0]!.proposed_school_name} (New School Request)
                       </p>
                       <p className="mb-1">
                         <span className="font-medium">Type:</span> {schoolInfo.school_requests[0]!.proposed_school_type?.replace('_', ' ')}
                       </p>
                       <p className="mb-1">
                         <span className="font-medium">Location:</span> {schoolInfo.school_requests[0]!.proposed_school_location}, {schoolInfo.school_requests[0]!.proposed_school_state}
                       </p>
                       {schoolInfo.school_requests[0]!.proposed_school_region && (
                         <p className="mb-1">
                           <span className="font-medium">Region:</span> {schoolInfo.school_requests[0]!.proposed_school_region}
                         </p>
                       )}
                       {schoolInfo.school_requests[0]!.proposed_school_website && (
                         <p className="mb-1">
                           <span className="font-medium">Website:</span> {schoolInfo.school_requests[0]!.proposed_school_website}
                         </p>
                       )}
                     </>
                   ) : (
                     // Existing school association request
                     <>
                       <p className="mb-1">
                         <span className="font-medium">School:</span> {schoolInfo.school_requests[0]!.school?.name}
                       </p>
                       <p className="mb-1">
                         <span className="font-medium">Type:</span> {schoolInfo.school_requests[0]!.school?.type.replace('_', ' ')}
                       </p>
                       <p className="mb-1">
                         <span className="font-medium">Location:</span> {schoolInfo.school_requests[0]!.school?.location}, {schoolInfo.school_requests[0]!.school?.state}
                       </p>
                     </>
                   )}
                   <p>
                     <span className="font-medium">Submitted:</span> {new Date(schoolInfo.school_requests[0]!.requested_at).toLocaleDateString()}
                   </p>
                 </div>
               </div>
             )}
            
            {canRequestAssociation && (
              <SchoolAssociationRequestForm />
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const StatCard = (
            <Card key={stat.title} className={`bg-gray-900 border-gray-800 ${!canAccess ? 'opacity-60' : stat.href ? 'hover:border-cyan-400 cursor-pointer' : ''} transition-colors`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-rajdhani">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-orbitron font-bold text-white">
                      {stat.value}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <Icon className={`h-8 w-8 ${canAccess ? 'text-cyan-400' : 'text-gray-600'}`} />
                </div>
              </CardContent>
            </Card>
          );

          return stat.href ? (
            <Link key={stat.title} href={stat.href}>
              {StatCard}
            </Link>
          ) : (
            StatCard
          );
        })}
      </div>

      {/* Quick Actions Panel - Now Collapsible */}
      <Collapsible open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
        <Card className="bg-gray-900 border-gray-800">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-800 transition-colors">
              <CardTitle className="text-white font-orbitron flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusIcon className="w-5 h-5 text-cyan-400" />
                  Quick Actions
                </div>
                {isQuickActionsOpen ? (
                  <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const isLocked = action.requiresOnboarding && !canAccess;
                  const isComingSoon = action.comingSoon;
                  
                  return (
                    <div key={action.title} className="relative">
                      <Link
                        href={isLocked || isComingSoon ? "#" : action.href}
                        className={`block ${isLocked || isComingSoon ? 'cursor-not-allowed' : ''}`}
                        onClick={(e) => {
                          if (isLocked || isComingSoon) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className={`bg-gradient-to-br ${action.color} p-6 rounded-lg text-white transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${isLocked || isComingSoon ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-3 mb-2">
                            {isLocked ? (
                              <AlertCircleIcon className="w-6 h-6 text-gray-200" />
                            ) : (
                              <Icon className="w-6 h-6 text-white" />
                            )}
                            <h3 className="font-orbitron font-semibold text-lg">
                              {action.title}
                            </h3>
                          </div>
                          <p className="text-sm text-white/80 font-rajdhani">
                            {isLocked ? "Available after onboarding" : action.description}
                          </p>
                        </div>
                      </Link>
                      
                      {/* Coming Soon overlay for Search Players */}
                      {isComingSoon && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-yellow-500 text-black font-orbitron text-xs px-2 py-1">
                            Coming Soon
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* School Announcements */}
      {canAccess && schoolId && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-orbitron font-bold text-white flex items-center gap-2">
              <MegaphoneIcon className="h-6 w-6 text-cyan-400" />
              School Announcements
            </h2>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              {showCreateForm ? "Cancel" : "New Announcement"}
            </Button>
          </div>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">
                Program Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Inline Create Form */}
              {showCreateForm && (
                <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-cyan-500">
                  <h3 className="font-orbitron font-semibold text-white mb-4">Create New Announcement</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="create-title" className="text-gray-300">Title *</Label>
                      <Input
                        id="create-title"
                        placeholder="Enter announcement title..."
                        value={createForm.title}
                        onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-500 mt-1">{createForm.title.length}/200 characters</div>
                    </div>
                    
                    <div>
                      <Label htmlFor="create-content" className="text-gray-300">Content *</Label>
                      <Textarea
                        id="create-content"
                        placeholder="Write your announcement content..."
                        value={createForm.content}
                        onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                        maxLength={2000}
                      />
                      <div className="text-xs text-gray-500 mt-1">{createForm.content.length}/2000 characters</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="create-type" className="text-gray-300">Type</Label>
                        <Select value={createForm.type} onValueChange={(value: typeof createForm.type) => setCreateForm({ ...createForm, type: value })}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="GENERAL">General</SelectItem>
                            <SelectItem value="TRYOUT">Tryout</SelectItem>
                            <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                            <SelectItem value="FACILITY">Facility</SelectItem>
                            <SelectItem value="SCHOLARSHIP">Scholarship</SelectItem>
                            <SelectItem value="ALUMNI">Alumni</SelectItem>
                            <SelectItem value="EVENT">Event</SelectItem>
                            <SelectItem value="SEASON_REVIEW">Season Review</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                          id="create-pinned"
                          checked={createForm.is_pinned}
                          onCheckedChange={(checked) => setCreateForm({ ...createForm, is_pinned: checked as boolean })}
                          className="border-gray-600"
                        />
                        <Label htmlFor="create-pinned" className="text-gray-300">Pin this announcement</Label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => {
                          if (!createForm.title.trim() || !createForm.content.trim()) {
                            toast.error("Please fill in all required fields");
                            return;
                          }
                          createMutation.mutate(createForm);
                        }}
                        disabled={createMutation.isPending}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                      >
                        {createMutation.isPending ? "Creating..." : "Create Announcement"}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false);
                          setCreateForm({ title: "", content: "", type: "GENERAL", is_pinned: false });
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {isLoadingAnnouncements ? (
                  // Loading skeleton
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="border-l-4 border-gray-600 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                          <div className="h-3 w-16 bg-gray-600 rounded animate-pulse"></div>
                        </div>
                        <div className="h-4 w-48 bg-gray-600 rounded animate-pulse mb-1"></div>
                        <div className="space-y-1">
                          <div className="h-3 w-full bg-gray-600 rounded animate-pulse"></div>
                          <div className="h-3 w-3/4 bg-gray-600 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : announcementsData?.announcements && announcementsData.announcements.length > 0 ? (
                  // Real announcements
                  (announcementsData.announcements as Announcement[]).map((announcement) => {
                    const colors = getAnnouncementColor(announcement.type);
                    const [borderColor, dotColor] = colors.split(' ');
                    const isEditing = editingAnnouncement?.id === announcement.id;
                    
                    return (
                      <div key={announcement.id} className={`border-l-4 ${borderColor} pl-4 py-2 group`}>
                        {isEditing ? (
                          // Inline edit form
                          <div className="bg-gray-800 rounded-lg p-4 border border-cyan-500">
                            <h4 className="font-orbitron font-semibold text-white mb-4">Edit Announcement</h4>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="edit-title" className="text-gray-300">Title *</Label>
                                <Input
                                  id="edit-title"
                                  value={editingAnnouncement.title}
                                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                                  className="bg-gray-700 border-gray-600 text-white"
                                  maxLength={200}
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="edit-content" className="text-gray-300">Content *</Label>
                                <Textarea
                                  id="edit-content"
                                  value={editingAnnouncement.content}
                                  onChange={(e) => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                                  maxLength={2000}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-type" className="text-gray-300">Type</Label>
                                  <Select value={editingAnnouncement.type} onValueChange={(value: SchoolAnnouncementType) => setEditingAnnouncement({ ...editingAnnouncement, type: value })}>
                                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-700 border-gray-600">
                                      <SelectItem value="GENERAL">General</SelectItem>
                                      <SelectItem value="TRYOUT">Tryout</SelectItem>
                                      <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                                      <SelectItem value="FACILITY">Facility</SelectItem>
                                      <SelectItem value="SCHOLARSHIP">Scholarship</SelectItem>
                                      <SelectItem value="ALUMNI">Alumni</SelectItem>
                                      <SelectItem value="EVENT">Event</SelectItem>
                                      <SelectItem value="SEASON_REVIEW">Season Review</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex items-center space-x-2 pt-6">
                                  <Checkbox
                                    id="edit-pinned"
                                    checked={editingAnnouncement.is_pinned}
                                    onCheckedChange={(checked) => setEditingAnnouncement({ ...editingAnnouncement, is_pinned: checked as boolean })}
                                    className="border-gray-600"
                                  />
                                  <Label htmlFor="edit-pinned" className="text-gray-300">Pin this announcement</Label>
                                </div>
                              </div>

                              <div className="flex gap-2 pt-2">
                                <Button 
                                  onClick={() => {
                                    if (!editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) {
                                      toast.error("Please fill in all required fields");
                                      return;
                                    }
                                    updateMutation.mutate(editingAnnouncement);
                                  }}
                                  disabled={updateMutation.isPending}
                                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                                >
                                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button 
                                  variant="outline"
                                  onClick={() => setEditingAnnouncement(null)}
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Normal view
                          <>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
                                <span className="text-xs text-gray-400 font-rajdhani">
                                  {formatRelativeTime(announcement.created_at)}
                                </span>
                                {Boolean(announcement.is_pinned) && (
                                  <Badge variant="outline" className="text-xs px-1 py-0 border-yellow-400 text-yellow-400">
                                    <PinIcon className="w-3 h-3 mr-1" />
                                    Pinned
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs px-1 py-0 border-gray-500 text-gray-400">
                                  {announcement.type.replace('_', ' ').toLowerCase()}
                                </Badge>
                              </div>
                              {/* Action buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingAnnouncement({
                                    id: announcement.id,
                                    title: announcement.title,
                                    content: announcement.content,
                                    type: announcement.type,
                                    is_pinned: announcement.is_pinned,
                                  })}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                                >
                                  <EditIcon className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                  disabled={deleteMutation.isPending}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                >
                                  <TrashIcon className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <h4 className="font-orbitron font-semibold text-sm text-white mb-1">
                              {announcement.title}
                            </h4>
                            <p className="text-gray-400 text-sm font-rajdhani">
                              {announcement.content}
                            </p>
                            {announcement.author && (
                              <div className="mt-2 text-xs text-gray-500 font-rajdhani">
                                by {announcement.author.first_name} {announcement.author.last_name}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })
                ) : (
                  // Empty state
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <MegaphoneIcon className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 font-rajdhani mb-2">
                      No announcements yet
                    </p>
                    <p className="text-gray-500 text-sm">
                      Create your first announcement to share updates with your school community.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-6">
          Recent Activity
        </h2>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-orbitron">
              Latest Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {canAccess ? (
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                      <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-white font-rajdhani">
                          {activity.title}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ClockIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-rajdhani">
                      No recent activity in the last 7 days
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      Start recruiting players and managing tryouts to see activity here
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircleIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 font-rajdhani">
                  Complete your onboarding to view recent activity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 