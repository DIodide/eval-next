"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  UserIcon, 
  SchoolIcon, 
  SaveIcon, 
  CheckIcon,
  XIcon,
  ExternalLinkIcon,
  MapPinIcon,
  GlobeIcon,
  Loader2,
  AlertCircleIcon,
  InfoIcon,
  EditIcon,
  MailIcon,
  PhoneIcon,
  TrophyIcon,
  PlusIcon,
  CalendarIcon,
  TrashIcon,
  ImageIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import type { TRPCError } from "@trpc/server";

interface ValidationErrors {
  bio?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  banner_url?: string;
}

interface Achievement {
  id: string;
  title: string;
  date_achieved: Date;
  created_at: Date;
  updated_at: Date;
}

export default function CoachProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditingSchool, setIsEditingSchool] = useState(false);
  const [hasUnsavedSchoolChanges, setHasUnsavedSchoolChanges] = useState(false);
  const [schoolValidationErrors, setSchoolValidationErrors] = useState<ValidationErrors>({});
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
  });

  // School form state
  const [schoolFormData, setSchoolFormData] = useState({
    bio: "",
    website: "",
    email: "",
    phone: "",
    logo_url: "",
    banner_url: "",
  });

  // Achievement form state
  const [achievementFormData, setAchievementFormData] = useState({
    title: "",
    date_achieved: "",
  });

  // Fetch coach profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = api.coachProfile.getProfile.useQuery();

  // Fetch school details (only for onboarded coaches)
  const { data: schoolDetails, isLoading: schoolLoading, refetch: refetchSchoolDetails } = api.schoolProfile.getDetailsForEdit.useQuery(
    undefined,
    {
      enabled: !!profile?.school_id, // Only fetch if coach has a school association
    }
  );

  // Fetch coach achievements
  const { data: achievements, isLoading: achievementsLoading, refetch: refetchAchievements } = api.coachProfile.getAchievements.useQuery() as {
    data: Achievement[] | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Mutations
  const updateProfileMutation = api.coachProfile.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setHasUnsavedChanges(false);
      void refetchProfile();
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update profile: ${message}`);
    },
  });

  const updateSchoolMutation = api.schoolProfile.updateInfo.useMutation({
    onSuccess: () => {
      setIsEditingSchool(false);
      setHasUnsavedSchoolChanges(false);
      setSchoolValidationErrors({});
      void refetchSchoolDetails();
      toast.success("School information updated successfully!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update school information: ${message}`);
    },
  });

  const createAchievementMutation = api.coachProfile.createAchievement.useMutation({
    onSuccess: () => {
      setIsAddingAchievement(false);
      setAchievementFormData({ title: "", date_achieved: "" });
      void refetchAchievements();
      toast.success("Achievement added successfully!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to add achievement: ${message}`);
    },
  });

  const updateAchievementMutation = api.coachProfile.updateAchievement.useMutation({
    onSuccess: () => {
      setEditingAchievementId(null);
      setAchievementFormData({ title: "", date_achieved: "" });
      void refetchAchievements();
      toast.success("Achievement updated successfully!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update achievement: ${message}`);
    },
  });

  const deleteAchievementMutation = api.coachProfile.deleteAchievement.useMutation({
    onSuccess: () => {
      void refetchAchievements();
      toast.success("Achievement deleted successfully!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete achievement: ${message}`);
    },
  });

  // School asset upload mutations
  const updateSchoolLogoMutation = api.schoolProfile.updateSchoolLogo.useMutation({
    onSuccess: () => {
      toast.success("School logo updated successfully!");
      void refetchSchoolDetails();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update school logo: ${message}`);
    },
  });

  const updateSchoolBannerMutation = api.schoolProfile.updateSchoolBanner.useMutation({
    onSuccess: () => {
      toast.success("School banner updated successfully!");
      void refetchSchoolDetails();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update school banner: ${message}`);
    },
  });

  // Client-side validation functions
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Empty email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Empty phone is optional
    // Allow various phone formats
    const phoneRegex = /^[\+]?[1-9]?[\d\s\-\(\)\.]{7,15}$/;
    return phoneRegex.test(phone);
  };

  const validateSchoolForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Bio validation
    if (schoolFormData.bio.length > 2000) {
      errors.bio = "Bio must be 2000 characters or less";
    }

    // Website validation
    if (schoolFormData.website && !validateUrl(schoolFormData.website)) {
      errors.website = "Please enter a valid URL (e.g., https://example.edu)";
    }

    // Email validation
    if (schoolFormData.email && !validateEmail(schoolFormData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (schoolFormData.phone && !validatePhone(schoolFormData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    // Logo URL validation
    if (schoolFormData.logo_url && !validateUrl(schoolFormData.logo_url)) {
      errors.logo_url = "Please enter a valid URL for the logo";
    }

    setSchoolValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        username: profile.username ?? "",
      });
    }
  }, [profile]);

  // Initialize school form data when school details load
  useEffect(() => {
    if (schoolDetails) {
      setSchoolFormData({
        bio: schoolDetails.bio ?? "",
        website: schoolDetails.website ?? "",
        email: schoolDetails.email ?? "",
        phone: schoolDetails.phone ?? "",
        logo_url: schoolDetails.logo_url ?? "",
        banner_url: schoolDetails.banner_url ?? "",
      });
    }
  }, [schoolDetails]);

  // Track form changes
  useEffect(() => {
    if (profile) {
      const hasChanges = 
        formData.first_name !== (profile.first_name ?? "") ||
        formData.last_name !== (profile.last_name ?? "") ||
        formData.username !== (profile.username ?? "");
      setHasUnsavedChanges(hasChanges);
    }
  }, [formData, profile]);

  // Track school form changes (updated to include banner_url)
  useEffect(() => {
    if (schoolDetails) {
      const hasChanges = 
        schoolFormData.bio !== (schoolDetails.bio ?? "") ||
        schoolFormData.website !== (schoolDetails.website ?? "") ||
        schoolFormData.email !== (schoolDetails.email ?? "") ||
        schoolFormData.phone !== (schoolDetails.phone ?? "") ||
        schoolFormData.logo_url !== (schoolDetails.logo_url ?? "") ||
        schoolFormData.banner_url !== (schoolDetails.banner_url ?? "");
      setHasUnsavedSchoolChanges(hasChanges);
    }
  }, [schoolFormData, schoolDetails]);

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        username: profile.username ?? "",
      });
    }
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const handleSchoolSave = () => {
    if (!validateSchoolForm()) {
      toast.error("Please fix the validation errors before saving");
      return;
    }
    updateSchoolMutation.mutate(schoolFormData);
  };

  const handleSchoolCancel = () => {
    if (schoolDetails) {
      setSchoolFormData({
        bio: schoolDetails.bio ?? "",
        website: schoolDetails.website ?? "",
        email: schoolDetails.email ?? "",
        phone: schoolDetails.phone ?? "",
        logo_url: schoolDetails.logo_url ?? "",
        banner_url: schoolDetails.banner_url ?? "",
      });
    }
    setIsEditingSchool(false);
    setHasUnsavedSchoolChanges(false);
    setSchoolValidationErrors({});
  };

  const handleSchoolFieldChange = (field: keyof typeof schoolFormData, value: string) => {
    setSchoolFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedSchoolChanges(true);
    
    // Clear validation error for this field when user starts typing
    if (schoolValidationErrors[field]) {
      setSchoolValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Achievement handlers
  const handleAddAchievement = () => {
    if (!achievementFormData.title.trim() || !achievementFormData.date_achieved) {
      toast.error("Please fill in all fields");
      return;
    }

    createAchievementMutation.mutate({
      title: achievementFormData.title.trim(),
      date_achieved: new Date(achievementFormData.date_achieved),
    });
  };

  const handleEditAchievement = (achievement: { id: string; title: string; date_achieved: Date }) => {
    setEditingAchievementId(achievement.id);
    setAchievementFormData({
      title: achievement.title,
      date_achieved: achievement.date_achieved.toISOString().split('T')[0] ?? "",
    });
  };

  const handleUpdateAchievement = () => {
    if (!achievementFormData.title.trim() || !achievementFormData.date_achieved || !editingAchievementId) {
      toast.error("Please fill in all fields");
      return;
    }

    updateAchievementMutation.mutate({
      id: editingAchievementId,
      title: achievementFormData.title.trim(),
      date_achieved: new Date(achievementFormData.date_achieved),
    });
  };

  const handleCancelAchievement = () => {
    setIsAddingAchievement(false);
    setEditingAchievementId(null);
    setAchievementFormData({ title: "", date_achieved: "" });
  };

  const handleDeleteAchievement = (id: string) => {
    if (confirm("Are you sure you want to delete this achievement?")) {
      deleteAchievementMutation.mutate({ id });
    }
  };

  const getSchoolTypeLabel = (type: string) => {
    switch (type) {
      case "HIGH_SCHOOL":
        return "High School";
      case "COLLEGE":
        return "College";
      case "UNIVERSITY":
        return "University";
      default:
        return type;
    }
  };

  const getSchoolTypeBadgeColor = (type: string) => {
    switch (type) {
      case "HIGH_SCHOOL":
        return "bg-blue-600";
      case "COLLEGE":
        return "bg-green-600";
      case "UNIVERSITY":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  const handleSchoolLogoUpload = (url: string) => {
    updateSchoolLogoMutation.mutate({ logo_url: url });
  };

  const handleSchoolLogoRemove = () => {
    updateSchoolLogoMutation.mutate({ logo_url: "" });
  };

  const handleSchoolBannerUpload = (url: string) => {
    updateSchoolBannerMutation.mutate({ banner_url: url });
  };

  const handleSchoolBannerRemove = () => {
    updateSchoolBannerMutation.mutate({ banner_url: "" });
  };

  const handleSchoolUploadError = (error: string) => {
    toast.error(`Upload failed: ${error}`);
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Skeleton */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Header Skeleton */}
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Form Fields Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* School Association Skeleton */}
          <div>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white font-orbitron">
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                <div className="p-3 bg-gray-800 rounded-lg">
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements Skeleton */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-36" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-64" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <AlertCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-xl font-orbitron text-white mb-2">Profile Not Found</h3>
        <p className="text-gray-400 font-rajdhani">Unable to load your coach profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">Coach Profile</h1>
          <p className="text-gray-400 font-rajdhani">Manage your coaching profile and school association</p>
        </div>
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
          >
            <UserIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center justify-between">
                <span>Profile Information</span>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                    Unsaved Changes
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="bg-gray-700 text-white text-xl">
                    {profile.first_name?.[0]}{profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-white">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="text-gray-400">@{profile.username}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name" className="text-white font-rajdhani">
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    disabled={!isEditing}
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white mt-1",
                      !isEditing && "opacity-60"
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-white font-rajdhani">
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    disabled={!isEditing}
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white mt-1",
                      !isEditing && "opacity-60"
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="username" className="text-white font-rajdhani">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    disabled={!isEditing}
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white mt-1",
                      !isEditing && "opacity-60"
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending || !hasUnsavedChanges}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SaveIcon className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* School Association */}
        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center">
                <SchoolIcon className="w-5 h-5 mr-2" />
                School Association
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.school_ref ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-rajdhani font-semibold">Associated</span>
                      </div>
                      <Badge className={cn("text-white text-xs", getSchoolTypeBadgeColor(profile.school_ref.type))}>
                        {getSchoolTypeLabel(profile.school_ref.type)}
                      </Badge>
                    </div>
                    <h4 className="font-orbitron font-bold text-white mb-2">
                      {profile.school_ref.name}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span>{profile.school_ref.location}, {profile.school_ref.state}</span>
                      </div>
                      {profile.school_ref.region && (
                        <div className="flex items-center space-x-2">
                          <GlobeIcon className="w-4 h-4 text-gray-400" />
                          <span>{profile.school_ref.region} Region</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-cyan-600 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                    >
                      <a href={`/profiles/school/${profile.school_ref.id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLinkIcon className="w-4 h-4 mr-1" />
                        View Public Profile
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircleIcon className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-rajdhani font-semibold">Not Associated</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      You need to associate with a school to create tryouts and manage recruitment events.
                    </p>
                  </div>
                  
                  <Button 
                    asChild
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                  >
                    <Link href="/dashboard/coaches">
                      <SchoolIcon className="w-4 h-4 mr-2" />
                      Associate with School
                    </Link>
                  </Button>
                </div>
              )}

              {/* Info Box */}
              <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <InfoIcon className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="text-xs text-blue-300">
                    <p className="font-semibold mb-1">Why associate with a school?</p>
                    <p>School association is required to create tryouts and ensures all recruitment events are properly linked to your institution.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* School Information Panel - Only show for onboarded coaches */}
      {profile.school_ref && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center justify-between">
              <div className="flex items-center">
                <SchoolIcon className="w-5 h-5 mr-2" />
                <span>School Information</span>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedSchoolChanges && (
                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                    Unsaved Changes
                  </Badge>
                )}
                {!isEditingSchool && (
                  <Button
                    onClick={() => setIsEditingSchool(true)}
                    size="sm"
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                  >
                    <EditIcon className="w-4 h-4 mr-2" />
                    Edit School Info
                  </Button>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {schoolLoading && (
              <div className="space-y-6">
                {/* Basic Info Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Editable Fields Skeleton */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {schoolDetails && (
              <>
                {/* Non-editable basic info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white font-rajdhani">School Name</Label>
                    <div className="text-gray-300 font-rajdhani mt-1 p-2 bg-gray-800 rounded-md opacity-60">
                      {schoolDetails.name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-white font-rajdhani">School Type</Label>
                    <div className="text-gray-300 font-rajdhani mt-1 p-2 bg-gray-800 rounded-md opacity-60">
                      {getSchoolTypeLabel(schoolDetails.type)}
                    </div>
                  </div>
                  <div>
                    <Label className="text-white font-rajdhani">Location</Label>
                    <div className="text-gray-300 font-rajdhani mt-1 p-2 bg-gray-800 rounded-md opacity-60">
                      {schoolDetails.location}, {schoolDetails.state}
                    </div>
                  </div>
                  {schoolDetails.region && (
                    <div>
                      <Label className="text-white font-rajdhani">Region</Label>
                      <div className="text-gray-300 font-rajdhani mt-1 p-2 bg-gray-800 rounded-md opacity-60">
                        {schoolDetails.region}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-700" />

                {/* Editable school information */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="school_bio" className="text-white font-rajdhani">
                      School Bio/Description
                    </Label>
                    <Textarea
                      id="school_bio"
                      value={schoolFormData.bio}
                      onChange={(e) => handleSchoolFieldChange('bio', e.target.value)}
                      disabled={!isEditingSchool}
                      placeholder="Enter a description of your school's esports program..."
                      className={cn(
                        "bg-gray-800 border-gray-700 text-white mt-1 min-h-[100px]",
                        !isEditingSchool && "opacity-60",
                        schoolValidationErrors.bio && "border-red-500"
                      )}
                      maxLength={2000}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-xs text-gray-500">
                        {schoolFormData.bio.length}/2000 characters
                      </div>
                      {schoolValidationErrors.bio && (
                        <div className="text-xs text-red-400 flex items-center">
                          <AlertCircleIcon className="w-3 h-3 mr-1" />
                          {schoolValidationErrors.bio}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="school_website" className="text-white font-rajdhani flex items-center">
                        <GlobeIcon className="w-4 h-4 mr-1" />
                        Website
                      </Label>
                      <Input
                        id="school_website"
                        value={schoolFormData.website}
                        onChange={(e) => handleSchoolFieldChange('website', e.target.value)}
                        disabled={!isEditingSchool}
                        placeholder="https://example.edu"
                        className={cn(
                          "bg-gray-800 border-gray-700 text-white mt-1",
                          !isEditingSchool && "opacity-60",
                          schoolValidationErrors.website && "border-red-500"
                        )}
                      />
                      {schoolValidationErrors.website && (
                        <div className="text-xs text-red-400 mt-1 flex items-center">
                          <AlertCircleIcon className="w-3 h-3 mr-1" />
                          {schoolValidationErrors.website}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="school_email" className="text-white font-rajdhani flex items-center">
                        <MailIcon className="w-4 h-4 mr-1" />
                        Contact Email
                      </Label>
                      <Input
                        id="school_email"
                        type="email"
                        value={schoolFormData.email}
                        onChange={(e) => handleSchoolFieldChange('email', e.target.value)}
                        disabled={!isEditingSchool}
                        placeholder="esports@example.edu"
                        className={cn(
                          "bg-gray-800 border-gray-700 text-white mt-1",
                          !isEditingSchool && "opacity-60",
                          schoolValidationErrors.email && "border-red-500"
                        )}
                      />
                      {schoolValidationErrors.email && (
                        <div className="text-xs text-red-400 mt-1 flex items-center">
                          <AlertCircleIcon className="w-3 h-3 mr-1" />
                          {schoolValidationErrors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="school_phone" className="text-white font-rajdhani flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1" />
                        Phone Number
                      </Label>
                      <Input
                        id="school_phone"
                        value={schoolFormData.phone}
                        onChange={(e) => handleSchoolFieldChange('phone', e.target.value)}
                        disabled={!isEditingSchool}
                        placeholder="(555) 123-4567"
                        className={cn(
                          "bg-gray-800 border-gray-700 text-white mt-1",
                          !isEditingSchool && "opacity-60",
                          schoolValidationErrors.phone && "border-red-500"
                        )}
                      />
                      {schoolValidationErrors.phone && (
                        <div className="text-xs text-red-400 mt-1 flex items-center">
                          <AlertCircleIcon className="w-3 h-3 mr-1" />
                          {schoolValidationErrors.phone}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="school_logo" className="text-white font-rajdhani">
                        Logo URL
                      </Label>
                      <Input
                        id="school_logo"
                        value={schoolFormData.logo_url}
                        onChange={(e) => handleSchoolFieldChange('logo_url', e.target.value)}
                        disabled={!isEditingSchool}
                        placeholder="https://example.edu/logo.png"
                        className={cn(
                          "bg-gray-800 border-gray-700 text-white mt-1",
                          !isEditingSchool && "opacity-60",
                          schoolValidationErrors.logo_url && "border-red-500"
                        )}
                      />
                      {schoolValidationErrors.logo_url && (
                        <div className="text-xs text-red-400 mt-1 flex items-center">
                          <AlertCircleIcon className="w-3 h-3 mr-1" />
                          {schoolValidationErrors.logo_url}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Validation Error Summary */}
                {Object.keys(schoolValidationErrors).length > 0 && isEditingSchool && (
                  <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="text-red-400 font-semibold mb-2">Please fix the following errors:</h4>
                        <ul className="text-red-300 text-sm space-y-1">
                          {Object.entries(schoolValidationErrors).map(([field, error]) => (
                            <li key={field}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* School Action Buttons */}
                {isEditingSchool && (
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <Button
                      variant="outline"
                      onClick={handleSchoolCancel}
                      className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <XIcon className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSchoolSave}
                      disabled={updateSchoolMutation.isPending || !hasUnsavedSchoolChanges || Object.keys(schoolValidationErrors).length > 0}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      {updateSchoolMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <SaveIcon className="w-4 h-4 mr-2" />
                      )}
                      Save School Info
                    </Button>
                  </div>
                )}

                {/* School Info Help Text */}
                <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <InfoIcon className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div className="text-xs text-blue-300">
                      <p className="font-semibold mb-1">School Information</p>
                      <p>This information will be displayed on your school&apos;s public profile page and helps prospective players learn about your esports program.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* School Assets Panel */}
      {profile?.school_id && schoolDetails && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-cyan-400" />
              School Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* School Logo */}
              <div className="space-y-2">
                <FileUpload
                  bucket="SCHOOLS"
                  entityId={schoolDetails.id}
                  assetType="LOGO"
                  currentImageUrl={schoolDetails.logo_url}
                  label="School Logo"
                  description="Upload your school's official logo"
                  onUploadSuccess={handleSchoolLogoUpload}
                  onUploadError={handleSchoolUploadError}
                  onRemove={handleSchoolLogoRemove}
                  disabled={updateSchoolLogoMutation.isPending}
                />
              </div>

              {/* School Banner */}
              <div className="space-y-2">
                <FileUpload
                  bucket="SCHOOLS"
                  entityId={schoolDetails.id}
                  assetType="BANNER"
                  currentImageUrl={schoolDetails.banner_url}
                  label="School Banner"
                  description="Upload a banner image for your school profile"
                  onUploadSuccess={handleSchoolBannerUpload}
                  onUploadError={handleSchoolUploadError}
                  onRemove={handleSchoolBannerRemove}
                  disabled={updateSchoolBannerMutation.isPending}
                />
              </div>
            </div>

            {/* Priority Information */}
            <div className="text-sm text-blue-300 bg-blue-900/20 border border-blue-600/30 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <InfoIcon className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-2 text-blue-300">Logo Priority System:</p>
                  <p className="mb-2">If you provide both a logo URL (in School Information) and upload a logo file here, <strong>the most recently changed item will be used</strong>.</p>
                  <p className="text-blue-400">💡 For best results, use either the URL field OR file upload, not both.</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-400 bg-gray-800/50 p-4 rounded-lg">
              <p className="mb-2"><strong className="text-gray-300">Asset Guidelines:</strong></p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Logo:</strong> Square format (400x400px recommended) - Used in school listings and player profiles</li>
                <li><strong>Banner:</strong> Wide format (1200x300px recommended) - Used as header image on your school page</li>
                <li>Supported formats: PNG, JPG, JPEG, WebP</li>
                <li>Maximum file size: 5MB per image</li>
                <li>Images are automatically optimized for web display</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements Panel */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center justify-between">
            <div className="flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2" />
              <span>Achievements</span>
            </div>
            <Button
              onClick={() => setIsAddingAchievement(true)}
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievementsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-64" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Add Achievement Form */}
          {isAddingAchievement && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-orbitron">Add New Achievement</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="achievement_title" className="text-white font-rajdhani">
                      Achievement Title
                    </Label>
                    <Input
                      id="achievement_title"
                      value={achievementFormData.title}
                      onChange={(e) => setAchievementFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Regional Championship Winner"
                      className="bg-gray-900 border-gray-600 text-white mt-1"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label htmlFor="achievement_date" className="text-white font-rajdhani flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      Date Achieved
                    </Label>
                    <Input
                      id="achievement_date"
                      type="date"
                      value={achievementFormData.date_achieved}
                      onChange={(e) => setAchievementFormData(prev => ({ ...prev, date_achieved: e.target.value }))}
                      className="bg-gray-900 border-gray-600 text-white mt-1"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelAchievement}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAchievement}
                    disabled={createAchievementMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {createAchievementMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SaveIcon className="w-4 h-4 mr-2" />
                    )}
                    Add Achievement
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements List */}
          {achievements && achievements.length > 0 ? (
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    {editingAchievementId === achievement.id ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`edit_title_${achievement.id}`} className="text-white font-rajdhani">
                              Achievement Title
                            </Label>
                            <Input
                              id={`edit_title_${achievement.id}`}
                              value={achievementFormData.title}
                              onChange={(e) => setAchievementFormData(prev => ({ ...prev, title: e.target.value }))}
                              className="bg-gray-900 border-gray-600 text-white mt-1"
                              maxLength={200}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit_date_${achievement.id}`} className="text-white font-rajdhani flex items-center">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              Date Achieved
                            </Label>
                            <Input
                              id={`edit_date_${achievement.id}`}
                              type="date"
                              value={achievementFormData.date_achieved}
                              onChange={(e) => setAchievementFormData(prev => ({ ...prev, date_achieved: e.target.value }))}
                              className="bg-gray-900 border-gray-600 text-white mt-1"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            variant="outline"
                            onClick={handleCancelAchievement}
                            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <XIcon className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateAchievement}
                            disabled={updateAchievementMutation.isPending}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                          >
                            {updateAchievementMutation.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <SaveIcon className="w-4 h-4 mr-2" />
                            )}
                            Update Achievement
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-orbitron font-semibold text-white mb-1">
                            {achievement.title}
                          </h4>
                          <div className="flex items-center text-gray-400 text-sm">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span className="font-rajdhani">
                              {new Date(achievement.date_achieved).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAchievement(achievement)}
                            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <EditIcon className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAchievement(achievement.id)}
                            disabled={deleteAchievementMutation.isPending}
                            className="border-red-600 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            !achievementsLoading && (
              <div className="text-center py-8">
                <TrophyIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-orbitron text-gray-400 mb-2">No Achievements Yet</h3>
                <p className="text-gray-500 font-rajdhani mb-4">
                  Add your coaching achievements to showcase your experience on your school&apos;s public profile.
                </p>
                <Button
                  onClick={() => setIsAddingAchievement(true)}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Achievement
                </Button>
              </div>
            )
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <InfoIcon className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-xs text-blue-300">
                <p className="font-semibold mb-1">Achievement Display</p>
                <p>These achievements will be displayed on your school&apos;s public profile page to showcase your coaching experience and accomplishments.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 