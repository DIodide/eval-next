"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { GAME_LOGO_MAPPING } from "@/lib/game-logos";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";
import {
  AlertCircleIcon,
  Award,
  CalendarIcon,
  CheckIcon,
  DollarSign,
  EditIcon,
  ExternalLinkIcon,
  Facebook,
  Gamepad2,
  GlobeIcon,
  GraduationCapIcon,
  ImageIcon,
  InfoIcon,
  Instagram,
  Loader2,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  PhoneIcon,
  PlusIcon,
  SaveIcon,
  SchoolIcon,
  TrashIcon,
  TrophyIcon,
  Twitch,
  Twitter,
  UserIcon,
  XIcon,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ValidationErrors {
  bio?: string;
  website?: string;
  email?: string;
  phone?: string;
  banner_url?: string;
  discord_handle?: string;
  in_state_tuition?: string;
  out_of_state_tuition?: string;
  minimum_gpa?: string;
  minimum_sat?: string;
  minimum_act?: string;
  scholarships_available?: string;
  social_links?: string;
  esports_titles?: string;
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
  const [schoolValidationErrors, setSchoolValidationErrors] =
    useState<ValidationErrors>({});
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<
    string | null
  >(null);

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
    banner_url: "",
    discord_handle: "",
    social_links: {
      facebook: "",
      twitter: "",
      instagram: "",
      youtube: "",
      twitch: "",
    },
    in_state_tuition: "",
    out_of_state_tuition: "",
    minimum_gpa: null as number | null,
    minimum_sat: null as number | null,
    minimum_act: null as number | null,
    scholarships_available: false,
    esports_titles: [] as string[],
  });

  // Achievement form state
  const [achievementFormData, setAchievementFormData] = useState({
    title: "",
    date_achieved: "",
  });

  // Fetch coach profile
  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = api.coachProfile.getProfile.useQuery();

  // Fetch school details (only for onboarded coaches)
  const {
    data: schoolDetails,
    isLoading: schoolLoading,
    refetch: refetchSchoolDetails,
  } = api.schoolProfile.getDetailsForEdit.useQuery(undefined, {
    enabled: !!profile?.school_id, // Only fetch if coach has a school association
  });

  // Fetch coach achievements
  const {
    data: achievements,
    isLoading: achievementsLoading,
    refetch: refetchAchievements,
  } = api.coachProfile.getAchievements.useQuery() as {
    data: Achievement[] | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  // Get available games from game logos mapping
  const availableGameNames = Object.keys(GAME_LOGO_MAPPING).sort();

  // Mutations
  const updateProfileMutation = api.coachProfile.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setHasUnsavedChanges(false);
      void refetchProfile();
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
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
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to update school information: ${message}`);
    },
  });

  const createAchievementMutation =
    api.coachProfile.createAchievement.useMutation({
      onSuccess: () => {
        setIsAddingAchievement(false);
        setAchievementFormData({ title: "", date_achieved: "" });
        void refetchAchievements();
        toast.success("Achievement added successfully!");
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to add achievement: ${message}`);
      },
    });

  const updateAchievementMutation =
    api.coachProfile.updateAchievement.useMutation({
      onSuccess: () => {
        setEditingAchievementId(null);
        setAchievementFormData({ title: "", date_achieved: "" });
        void refetchAchievements();
        toast.success("Achievement updated successfully!");
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to update achievement: ${message}`);
      },
    });

  const deleteAchievementMutation =
    api.coachProfile.deleteAchievement.useMutation({
      onSuccess: () => {
        void refetchAchievements();
        toast.success("Achievement deleted successfully!");
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to delete achievement: ${message}`);
      },
    });

  // School asset upload mutations
  const updateSchoolLogoMutation =
    api.schoolProfile.updateSchoolLogo.useMutation({
      onSuccess: () => {
        toast.success("School logo updated successfully!");
        void refetchSchoolDetails();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to update school logo: ${message}`);
      },
    });

  const updateSchoolBannerMutation =
    api.schoolProfile.updateSchoolBanner.useMutation({
      onSuccess: () => {
        toast.success("School banner updated successfully!");
        void refetchSchoolDetails();
      },
      onError: (error) => {
        const message =
          error instanceof Error ? error.message : "Unknown error";
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
      const socialLinks = schoolDetails.social_links as {
        facebook?: string | null;
        twitter?: string | null;
        instagram?: string | null;
        youtube?: string | null;
        twitch?: string | null;
      } | null;

      setSchoolFormData({
        bio: schoolDetails.bio ?? "",
        website: schoolDetails.website ?? "",
        email: schoolDetails.email ?? "",
        phone: schoolDetails.phone ?? "",
        banner_url: schoolDetails.banner_url ?? "",
        discord_handle: schoolDetails.discord_handle ?? "",
        social_links: {
          facebook: socialLinks?.facebook ?? "",
          twitter: socialLinks?.twitter ?? "",
          instagram: socialLinks?.instagram ?? "",
          youtube: socialLinks?.youtube ?? "",
          twitch: socialLinks?.twitch ?? "",
        },
        in_state_tuition: schoolDetails.in_state_tuition ?? "",
        out_of_state_tuition: schoolDetails.out_of_state_tuition ?? "",
        minimum_gpa: schoolDetails.minimum_gpa
          ? Number(schoolDetails.minimum_gpa)
          : null,
        minimum_sat: schoolDetails.minimum_sat ?? null,
        minimum_act: schoolDetails.minimum_act ?? null,
        scholarships_available: schoolDetails.scholarships_available ?? false,
        esports_titles: schoolDetails.esports_titles ?? [],
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

  // Track school form changes (updated to include all fields)
  useEffect(() => {
    if (schoolDetails) {
      const socialLinks = schoolDetails.social_links as {
        facebook?: string | null;
        twitter?: string | null;
        instagram?: string | null;
        youtube?: string | null;
        twitch?: string | null;
      } | null;

      const originalTitles = schoolDetails.esports_titles ?? [];
      const titlesChanged =
        schoolFormData.esports_titles.length !== originalTitles.length ||
        schoolFormData.esports_titles.some(
          (title) => !originalTitles.includes(title),
        );

      const hasChanges =
        schoolFormData.bio !== (schoolDetails.bio ?? "") ||
        schoolFormData.website !== (schoolDetails.website ?? "") ||
        schoolFormData.email !== (schoolDetails.email ?? "") ||
        schoolFormData.phone !== (schoolDetails.phone ?? "") ||
        schoolFormData.banner_url !== (schoolDetails.banner_url ?? "") ||
        schoolFormData.discord_handle !==
          (schoolDetails.discord_handle ?? "") ||
        schoolFormData.social_links.facebook !==
          (socialLinks?.facebook ?? "") ||
        schoolFormData.social_links.twitter !== (socialLinks?.twitter ?? "") ||
        schoolFormData.social_links.instagram !==
          (socialLinks?.instagram ?? "") ||
        schoolFormData.social_links.youtube !== (socialLinks?.youtube ?? "") ||
        schoolFormData.social_links.twitch !== (socialLinks?.twitch ?? "") ||
        schoolFormData.in_state_tuition !==
          (schoolDetails.in_state_tuition ?? "") ||
        schoolFormData.out_of_state_tuition !==
          (schoolDetails.out_of_state_tuition ?? "") ||
        schoolFormData.minimum_gpa !==
          (schoolDetails.minimum_gpa
            ? Number(schoolDetails.minimum_gpa)
            : null) ||
        schoolFormData.minimum_sat !== (schoolDetails.minimum_sat ?? null) ||
        schoolFormData.minimum_act !== (schoolDetails.minimum_act ?? null) ||
        schoolFormData.scholarships_available !==
          (schoolDetails.scholarships_available ?? false) ||
        titlesChanged;
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
      const socialLinks = schoolDetails.social_links as {
        facebook?: string | null;
        twitter?: string | null;
        instagram?: string | null;
        youtube?: string | null;
        twitch?: string | null;
      } | null;

      setSchoolFormData({
        bio: schoolDetails.bio ?? "",
        website: schoolDetails.website ?? "",
        email: schoolDetails.email ?? "",
        phone: schoolDetails.phone ?? "",
        banner_url: schoolDetails.banner_url ?? "",
        discord_handle: schoolDetails.discord_handle ?? "",
        social_links: {
          facebook: socialLinks?.facebook ?? "",
          twitter: socialLinks?.twitter ?? "",
          instagram: socialLinks?.instagram ?? "",
          youtube: socialLinks?.youtube ?? "",
          twitch: socialLinks?.twitch ?? "",
        },
        in_state_tuition: schoolDetails.in_state_tuition ?? "",
        out_of_state_tuition: schoolDetails.out_of_state_tuition ?? "",
        minimum_gpa: schoolDetails.minimum_gpa
          ? Number(schoolDetails.minimum_gpa)
          : null,
        minimum_sat: schoolDetails.minimum_sat ?? null,
        minimum_act: schoolDetails.minimum_act ?? null,
        scholarships_available: schoolDetails.scholarships_available ?? false,
        esports_titles: schoolDetails.esports_titles ?? [],
      });
    }
    setIsEditingSchool(false);
    setHasUnsavedSchoolChanges(false);
    setSchoolValidationErrors({});
  };

  const handleSchoolFieldChange = (
    field: keyof typeof schoolFormData,
    value: string,
  ) => {
    setSchoolFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedSchoolChanges(true);

    // Clear validation error for this field when user starts typing
    if (schoolValidationErrors[field]) {
      setSchoolValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Achievement handlers
  const handleAddAchievement = () => {
    if (
      !achievementFormData.title.trim() ||
      !achievementFormData.date_achieved
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    createAchievementMutation.mutate({
      title: achievementFormData.title.trim(),
      date_achieved: new Date(achievementFormData.date_achieved),
    });
  };

  const handleEditAchievement = (achievement: {
    id: string;
    title: string;
    date_achieved: Date;
  }) => {
    setEditingAchievementId(achievement.id);
    setAchievementFormData({
      title: achievement.title,
      date_achieved:
        achievement.date_achieved.toISOString().split("T")[0] ?? "",
    });
  };

  const handleUpdateAchievement = () => {
    if (
      !achievementFormData.title.trim() ||
      !achievementFormData.date_achieved ||
      !editingAchievementId
    ) {
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
      <div className="space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Information Skeleton */}
          <div className="lg:col-span-2">
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Header Skeleton */}
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Form Fields Skeleton */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* School Association Skeleton */}
          <div>
            <Card className="border-gray-800 bg-gray-900">
              <CardHeader>
                <CardTitle className="font-orbitron text-white">
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-gray-800 p-4">
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
                <div className="rounded-lg bg-gray-800 p-3">
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements Skeleton */}
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center justify-between text-white">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-36" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-gray-700 bg-gray-800">
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
      <div className="p-6 py-12 text-center">
        <AlertCircleIcon className="mx-auto mb-4 h-16 w-16 text-red-400" />
        <h3 className="font-orbitron mb-2 text-xl text-white">
          Profile Not Found
        </h3>
        <p className="font-rajdhani text-gray-400">
          Unable to load your coach profile
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-3xl font-bold text-white">
            Coach Profile
          </h1>
          <p className="font-rajdhani text-gray-400">
            Manage your coaching profile and school association
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
          >
            <UserIcon className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle className="font-orbitron flex items-center justify-between text-white">
                <span>Profile Information</span>
                {hasUnsavedChanges && (
                  <Badge
                    variant="outline"
                    className="border-yellow-400 text-xs text-yellow-400"
                  >
                    Unsaved Changes
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback className="bg-gray-700 text-xl text-white">
                    {profile.first_name?.[0]}
                    {profile.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-orbitron text-xl font-bold text-white">
                    {profile.first_name} {profile.last_name}
                  </h3>
                  <p className="text-gray-400">@{profile.username}</p>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Editable Fields */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label
                    htmlFor="first_name"
                    className="font-rajdhani text-white"
                  >
                    First Name
                  </Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        first_name: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className={cn(
                      "mt-1 border-gray-700 bg-gray-800 text-white",
                      !isEditing && "opacity-60",
                    )}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="last_name"
                    className="font-rajdhani text-white"
                  >
                    Last Name
                  </Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        last_name: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className={cn(
                      "mt-1 border-gray-700 bg-gray-800 text-white",
                      !isEditing && "opacity-60",
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label
                    htmlFor="username"
                    className="font-rajdhani text-white"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className={cn(
                      "mt-1 border-gray-700 bg-gray-800 text-white",
                      !isEditing && "opacity-60",
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <XIcon className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={
                      updateProfileMutation.isPending || !hasUnsavedChanges
                    }
                    className="bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <SaveIcon className="mr-2 h-4 w-4" />
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
          <Card className="border-gray-800 bg-gray-900">
            <CardHeader>
              <CardTitle className="font-orbitron flex items-center text-white">
                <SchoolIcon className="mr-2 h-5 w-5" />
                School Association
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.school_ref ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-600/30 bg-green-900/20 p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckIcon className="h-5 w-5 text-green-400" />
                        <span className="font-rajdhani font-semibold text-green-400">
                          Associated
                        </span>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs text-white",
                          getSchoolTypeBadgeColor(profile.school_ref.type),
                        )}
                      >
                        {getSchoolTypeLabel(profile.school_ref.type)}
                      </Badge>
                    </div>
                    <h4 className="font-orbitron mb-2 font-bold text-white">
                      {profile.school_ref.name}
                    </h4>
                    <div className="space-y-1 text-sm text-gray-300">
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-4 w-4 text-gray-400" />
                        <span>
                          {profile.school_ref.location},{" "}
                          {profile.school_ref.state}
                        </span>
                      </div>
                      {profile.school_ref.region && (
                        <div className="flex items-center space-x-2">
                          <GlobeIcon className="h-4 w-4 text-gray-400" />
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
                      className="border-cyan-600 text-cyan-400 hover:bg-cyan-900/20 hover:text-cyan-300"
                    >
                      <a
                        href={`/profiles/school/${profile.school_ref.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLinkIcon className="mr-1 h-4 w-4" />
                        View Public Profile
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border border-yellow-600/30 bg-yellow-900/20 p-4">
                    <div className="mb-2 flex items-center space-x-2">
                      <AlertCircleIcon className="h-5 w-5 text-yellow-400" />
                      <span className="font-rajdhani font-semibold text-yellow-400">
                        Not Associated
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">
                      You need to associate with a school to create tryouts and
                      manage recruitment events.
                    </p>
                  </div>

                  <Button
                    asChild
                    className="font-orbitron w-full bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    <Link href="/dashboard/coaches">
                      <SchoolIcon className="mr-2 h-4 w-4" />
                      Associate with School
                    </Link>
                  </Button>
                </div>
              )}

              {/* Info Box */}
              <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-3">
                <div className="flex items-start space-x-2">
                  <InfoIcon className="mt-0.5 h-4 w-4 text-blue-400" />
                  <div className="text-xs text-blue-300">
                    <p className="mb-1 font-semibold">
                      Why associate with a school?
                    </p>
                    <p>
                      School association is required to create tryouts and
                      ensures all recruitment events are properly linked to your
                      institution.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* School Information Panel - Only show for onboarded coaches */}
      {profile.school_ref && (
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center justify-between text-white">
              <div className="flex items-center">
                <SchoolIcon className="mr-2 h-5 w-5" />
                <span>School Information</span>
              </div>
              <div className="flex items-center gap-2">
                {hasUnsavedSchoolChanges && (
                  <Badge
                    variant="outline"
                    className="border-yellow-400 text-xs text-yellow-400"
                  >
                    Unsaved Changes
                  </Badge>
                )}
                {!isEditingSchool && (
                  <Button
                    onClick={() => setIsEditingSchool(true)}
                    size="sm"
                    className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <Label className="font-rajdhani text-white">
                      School Name
                    </Label>
                    <div className="font-rajdhani mt-1 rounded-md bg-gray-800 p-2 text-gray-300 opacity-60">
                      {schoolDetails.name}
                    </div>
                  </div>
                  <div>
                    <Label className="font-rajdhani text-white">
                      School Type
                    </Label>
                    <div className="font-rajdhani mt-1 rounded-md bg-gray-800 p-2 text-gray-300 opacity-60">
                      {getSchoolTypeLabel(schoolDetails.type)}
                    </div>
                  </div>
                  <div>
                    <Label className="font-rajdhani text-white">Location</Label>
                    <div className="font-rajdhani mt-1 rounded-md bg-gray-800 p-2 text-gray-300 opacity-60">
                      {schoolDetails.location}, {schoolDetails.state}
                    </div>
                  </div>
                  {schoolDetails.region && (
                    <div>
                      <Label className="font-rajdhani text-white">Region</Label>
                      <div className="font-rajdhani mt-1 rounded-md bg-gray-800 p-2 text-gray-300 opacity-60">
                        {schoolDetails.region}
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="bg-gray-700" />

                {/* Editable school information */}
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="school_bio"
                      className="font-rajdhani text-white"
                    >
                      School Bio/Description
                    </Label>
                    <Textarea
                      id="school_bio"
                      value={schoolFormData.bio}
                      onChange={(e) =>
                        handleSchoolFieldChange("bio", e.target.value)
                      }
                      disabled={!isEditingSchool}
                      placeholder="Enter a description of your school's esports program..."
                      className={cn(
                        "mt-1 min-h-[100px] border-gray-700 bg-gray-800 text-white",
                        !isEditingSchool && "opacity-60",
                        schoolValidationErrors.bio && "border-red-500",
                      )}
                      maxLength={2000}
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {schoolFormData.bio.length}/2000 characters
                      </div>
                      {schoolValidationErrors.bio && (
                        <div className="flex items-center text-xs text-red-400">
                          <AlertCircleIcon className="mr-1 h-3 w-3" />
                          {schoolValidationErrors.bio}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <Label
                        htmlFor="school_website"
                        className="font-rajdhani flex items-center text-white"
                      >
                        <GlobeIcon className="mr-1 h-4 w-4" />
                        Website
                      </Label>
                      <Input
                        id="school_website"
                        value={schoolFormData.website}
                        onChange={(e) =>
                          handleSchoolFieldChange("website", e.target.value)
                        }
                        disabled={!isEditingSchool}
                        placeholder="https://example.edu"
                        className={cn(
                          "mt-1 border-gray-700 bg-gray-800 text-white",
                          !isEditingSchool && "opacity-60",
                          schoolValidationErrors.website && "border-red-500",
                        )}
                      />
                      {schoolValidationErrors.website && (
                        <div className="mt-1 flex items-center text-xs text-red-400">
                          <AlertCircleIcon className="mr-1 h-3 w-3" />
                          {schoolValidationErrors.website}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="school_email"
                        className="font-rajdhani flex items-center text-white"
                      >
                        <MailIcon className="mr-1 h-4 w-4" />
                        Contact Email
                      </Label>
                      <Input
                        id="school_email"
                        type="email"
                        value={schoolFormData.email}
                        onChange={(e) =>
                          handleSchoolFieldChange("email", e.target.value)
                        }
                        disabled={!isEditingSchool}
                        placeholder="esports@example.edu"
                        className={cn(
                          "mt-1 border-gray-700 bg-gray-800 text-white",
                          !isEditingSchool && "opacity-60",
                          schoolValidationErrors.email && "border-red-500",
                        )}
                      />
                      {schoolValidationErrors.email && (
                        <div className="mt-1 flex items-center text-xs text-red-400">
                          <AlertCircleIcon className="mr-1 h-3 w-3" />
                          {schoolValidationErrors.email}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label
                        htmlFor="school_phone"
                        className="font-rajdhani flex items-center text-white"
                      >
                        <PhoneIcon className="mr-1 h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="school_phone"
                        value={schoolFormData.phone}
                        onChange={(e) =>
                          handleSchoolFieldChange("phone", e.target.value)
                        }
                        disabled={!isEditingSchool}
                        placeholder="(555) 123-4567"
                        className={cn(
                          "mt-1 border-gray-700 bg-gray-800 text-white",
                          !isEditingSchool && "opacity-60",
                          schoolValidationErrors.phone && "border-red-500",
                        )}
                      />
                      {schoolValidationErrors.phone && (
                        <div className="mt-1 flex items-center text-xs text-red-400">
                          <AlertCircleIcon className="mr-1 h-3 w-3" />
                          {schoolValidationErrors.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6 bg-gray-700" />

                  {/* Esports Titles Section */}
                  <div className="space-y-4">
                    <h4 className="font-rajdhani flex items-center text-lg font-semibold text-white">
                      <Gamepad2 className="mr-2 h-4 w-4 text-cyan-400" />
                      Esports Titles
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-rajdhani text-white">
                          Games Supported
                        </Label>
                        {schoolFormData.esports_titles.length > 0 && (
                          <span className="text-xs text-cyan-400">
                            {schoolFormData.esports_titles.length} selected
                          </span>
                        )}
                      </div>
                      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {availableGameNames.map((gameName) => {
                            const isChecked =
                              schoolFormData.esports_titles.includes(gameName);
                            return (
                              <div
                                key={gameName}
                                className={cn(
                                  "flex items-center space-x-2 rounded-md border p-2 transition-colors",
                                  isChecked
                                    ? "border-cyan-600/50 bg-cyan-900/20"
                                    : "border-gray-700 bg-gray-800/30",
                                  isEditingSchool &&
                                    "cursor-pointer hover:border-cyan-600/30 hover:bg-gray-700/50",
                                  !isEditingSchool && "opacity-60",
                                )}
                                onClick={() => {
                                  if (!isEditingSchool) return;
                                  const newTitles = isChecked
                                    ? schoolFormData.esports_titles.filter(
                                        (t) => t !== gameName,
                                      )
                                    : [
                                        ...schoolFormData.esports_titles,
                                        gameName,
                                      ];
                                  setSchoolFormData((prev) => ({
                                    ...prev,
                                    esports_titles: newTitles,
                                  }));
                                }}
                              >
                                <Checkbox
                                  id={`game-${gameName}`}
                                  checked={isChecked}
                                  disabled={!isEditingSchool}
                                  onCheckedChange={(checked) => {
                                    const newTitles = checked
                                      ? [
                                          ...schoolFormData.esports_titles,
                                          gameName,
                                        ]
                                      : schoolFormData.esports_titles.filter(
                                          (t) => t !== gameName,
                                        );
                                    setSchoolFormData((prev) => ({
                                      ...prev,
                                      esports_titles: newTitles,
                                    }));
                                  }}
                                  className="border-gray-600 data-[state=checked]:border-cyan-600 data-[state=checked]:bg-cyan-600"
                                />
                                {GAME_LOGO_MAPPING[gameName] && (
                                  <Image
                                    src={GAME_LOGO_MAPPING[gameName]}
                                    alt={gameName}
                                    width={20}
                                    height={20}
                                    className="h-5 w-5 flex-shrink-0 brightness-0 invert"
                                  />
                                )}
                                <Label
                                  htmlFor={`game-${gameName}`}
                                  className={cn(
                                    "cursor-pointer truncate text-sm text-gray-300",
                                    !isEditingSchool && "cursor-default",
                                  )}
                                >
                                  {gameName}
                                </Label>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Select the esports titles your school&apos;s program
                        competes in.
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6 bg-gray-700" />

                  {/* Social Media Links Section */}
                  <div className="space-y-4">
                    <h4 className="font-rajdhani flex items-center text-lg font-semibold text-white">
                      <MessageCircleIcon className="mr-2 h-4 w-4 text-indigo-400" />
                      Social Media & Discord
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="discord_handle"
                          className="font-rajdhani flex items-center text-white"
                        >
                          <MessageCircleIcon className="mr-1 h-4 w-4 text-indigo-400" />
                          Discord Handle
                        </Label>
                        <Input
                          id="discord_handle"
                          value={schoolFormData.discord_handle}
                          onChange={(e) =>
                            handleSchoolFieldChange(
                              "discord_handle",
                              e.target.value,
                            )
                          }
                          disabled={!isEditingSchool}
                          placeholder="username#0000 or server invite link"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="social_twitter"
                          className="font-rajdhani flex items-center text-white"
                        >
                          <Twitter className="mr-1 h-4 w-4 text-sky-400" />
                          Twitter/X
                        </Label>
                        <Input
                          id="social_twitter"
                          value={schoolFormData.social_links.twitter}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              social_links: {
                                ...prev.social_links,
                                twitter: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="https://twitter.com/schoolesports"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="social_instagram"
                          className="font-rajdhani flex items-center text-white"
                        >
                          <Instagram className="mr-1 h-4 w-4 text-pink-400" />
                          Instagram
                        </Label>
                        <Input
                          id="social_instagram"
                          value={schoolFormData.social_links.instagram}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              social_links: {
                                ...prev.social_links,
                                instagram: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="https://instagram.com/schoolesports"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="social_facebook"
                          className="font-rajdhani flex items-center text-white"
                        >
                          <Facebook className="mr-1 h-4 w-4 text-blue-500" />
                          Facebook
                        </Label>
                        <Input
                          id="social_facebook"
                          value={schoolFormData.social_links.facebook}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              social_links: {
                                ...prev.social_links,
                                facebook: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="https://facebook.com/schoolesports"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="social_youtube"
                          className="font-rajdhani flex items-center text-white"
                        >
                          <Youtube className="mr-1 h-4 w-4 text-red-500" />
                          YouTube
                        </Label>
                        <Input
                          id="social_youtube"
                          value={schoolFormData.social_links.youtube}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              social_links: {
                                ...prev.social_links,
                                youtube: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="https://youtube.com/@schoolesports"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="social_twitch"
                          className="font-rajdhani flex items-center text-white"
                        >
                          <Twitch className="mr-1 h-4 w-4 text-purple-400" />
                          Twitch
                        </Label>
                        <Input
                          id="social_twitch"
                          value={schoolFormData.social_links.twitch}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              social_links: {
                                ...prev.social_links,
                                twitch: e.target.value,
                              },
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="https://twitch.tv/schoolesports"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6 bg-gray-700" />

                  {/* Tuition Information Section */}
                  <div className="space-y-4">
                    <h4 className="font-rajdhani flex items-center text-lg font-semibold text-white">
                      <DollarSign className="mr-2 h-4 w-4 text-green-400" />
                      Tuition Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label
                          htmlFor="in_state_tuition"
                          className="font-rajdhani text-white"
                        >
                          In-State Tuition
                        </Label>
                        <Input
                          id="in_state_tuition"
                          value={schoolFormData.in_state_tuition}
                          onChange={(e) =>
                            handleSchoolFieldChange(
                              "in_state_tuition",
                              e.target.value,
                            )
                          }
                          disabled={!isEditingSchool}
                          placeholder="$15,000/year or N/A"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="out_of_state_tuition"
                          className="font-rajdhani text-white"
                        >
                          Out-of-State Tuition
                        </Label>
                        <Input
                          id="out_of_state_tuition"
                          value={schoolFormData.out_of_state_tuition}
                          onChange={(e) =>
                            handleSchoolFieldChange(
                              "out_of_state_tuition",
                              e.target.value,
                            )
                          }
                          disabled={!isEditingSchool}
                          placeholder="$35,000/year or N/A"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6 bg-gray-700" />

                  {/* Academic Requirements Section */}
                  <div className="space-y-4">
                    <h4 className="font-rajdhani flex items-center text-lg font-semibold text-white">
                      <GraduationCapIcon className="mr-2 h-4 w-4 text-blue-400" />
                      Academic Requirements
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <Label
                          htmlFor="minimum_gpa"
                          className="font-rajdhani text-white"
                        >
                          Minimum GPA
                        </Label>
                        <Input
                          id="minimum_gpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="4"
                          value={schoolFormData.minimum_gpa ?? ""}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              minimum_gpa: e.target.value
                                ? parseFloat(e.target.value)
                                : null,
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="2.50"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="minimum_sat"
                          className="font-rajdhani text-white"
                        >
                          Minimum SAT
                        </Label>
                        <Input
                          id="minimum_sat"
                          type="number"
                          min="400"
                          max="1600"
                          value={schoolFormData.minimum_sat ?? ""}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              minimum_sat: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="1000"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="minimum_act"
                          className="font-rajdhani text-white"
                        >
                          Minimum ACT
                        </Label>
                        <Input
                          id="minimum_act"
                          type="number"
                          min="1"
                          max="36"
                          value={schoolFormData.minimum_act ?? ""}
                          onChange={(e) =>
                            setSchoolFormData((prev) => ({
                              ...prev,
                              minimum_act: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            }))
                          }
                          disabled={!isEditingSchool}
                          placeholder="21"
                          className={cn(
                            "mt-1 border-gray-700 bg-gray-800 text-white",
                            !isEditingSchool && "opacity-60",
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6 bg-gray-700" />

                  {/* Scholarships Section */}
                  <div className="space-y-4">
                    <h4 className="font-rajdhani flex items-center text-lg font-semibold text-white">
                      <Award className="mr-2 h-4 w-4 text-yellow-400" />
                      Scholarship Information
                    </h4>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="scholarships_available"
                        checked={schoolFormData.scholarships_available}
                        onCheckedChange={(checked) =>
                          setSchoolFormData((prev) => ({
                            ...prev,
                            scholarships_available: checked === true,
                          }))
                        }
                        disabled={!isEditingSchool}
                        className="border-gray-600 data-[state=checked]:bg-cyan-600"
                      />
                      <Label
                        htmlFor="scholarships_available"
                        className={cn(
                          "font-rajdhani text-white",
                          !isEditingSchool && "opacity-60",
                        )}
                      >
                        Esports scholarships are available at this school
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Validation Error Summary */}
                {Object.keys(schoolValidationErrors).length > 0 &&
                  isEditingSchool && (
                    <div className="rounded-lg border border-red-600/30 bg-red-900/20 p-4">
                      <div className="flex items-start space-x-2">
                        <AlertCircleIcon className="mt-0.5 h-5 w-5 text-red-400" />
                        <div>
                          <h4 className="mb-2 font-semibold text-red-400">
                            Please fix the following errors:
                          </h4>
                          <ul className="space-y-1 text-sm text-red-300">
                            {Object.entries(schoolValidationErrors).map(
                              ([field, error]) => (
                                <li key={field}>• {error}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                {/* School Action Buttons */}
                {isEditingSchool && (
                  <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleSchoolCancel}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSchoolSave}
                      disabled={
                        updateSchoolMutation.isPending ||
                        !hasUnsavedSchoolChanges ||
                        Object.keys(schoolValidationErrors).length > 0
                      }
                      className="bg-cyan-600 text-white hover:bg-cyan-700"
                    >
                      {updateSchoolMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SaveIcon className="mr-2 h-4 w-4" />
                      )}
                      Save School Info
                    </Button>
                  </div>
                )}

                {/* School Info Help Text */}
                <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-3">
                  <div className="flex items-start space-x-2">
                    <InfoIcon className="mt-0.5 h-4 w-4 text-blue-400" />
                    <div className="text-xs text-blue-300">
                      <p className="mb-1 font-semibold">School Information</p>
                      <p>
                        This information will be displayed on your school&apos;s
                        public profile page and helps prospective players learn
                        about your esports program.
                      </p>
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
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="font-orbitron flex items-center gap-2 text-white">
              <ImageIcon className="h-5 w-5 text-cyan-400" />
              School Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
            <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4 text-sm text-blue-300">
              <div className="flex items-start space-x-2">
                <InfoIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
                <div>
                  <p className="mb-2 font-semibold text-blue-300">
                    Logo Priority System:
                  </p>
                  <p className="mb-2">
                    If you provide both a logo URL (in School Information) and
                    upload a logo file here,{" "}
                    <strong>the most recently changed item will be used</strong>
                    .
                  </p>
                  <p className="text-blue-400">
                    💡 For best results, use either the URL field OR file
                    upload, not both.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-800/50 p-4 text-sm text-gray-400">
              <p className="mb-2">
                <strong className="text-gray-300">Asset Guidelines:</strong>
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>
                  <strong>Logo:</strong> Square format (400x400px recommended) -
                  Used in school listings and player profiles
                </li>
                <li>
                  <strong>Banner:</strong> Wide format (1200x300px recommended)
                  - Used as header image on your school page
                </li>
                <li>Supported formats: PNG, JPG, JPEG, WebP</li>
                <li>Maximum file size: 5MB per image</li>
                <li>Images are automatically optimized for web display</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements Panel */}
      <Card className="border-gray-800 bg-gray-900">
        <CardHeader>
          <CardTitle className="font-orbitron flex items-center justify-between text-white">
            <div className="flex items-center">
              <TrophyIcon className="mr-2 h-5 w-5" />
              <span>Achievements</span>
            </div>
            <Button
              onClick={() => setIsAddingAchievement(true)}
              size="sm"
              className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievementsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="border-gray-700 bg-gray-800">
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
            <Card className="border-gray-700 bg-gray-800">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-orbitron text-white">
                    Add New Achievement
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="achievement_title"
                      className="font-rajdhani text-white"
                    >
                      Achievement Title
                    </Label>
                    <Input
                      id="achievement_title"
                      value={achievementFormData.title}
                      onChange={(e) =>
                        setAchievementFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="e.g., Regional Championship Winner"
                      className="mt-1 border-gray-600 bg-gray-900 text-white"
                      maxLength={200}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="achievement_date"
                      className="font-rajdhani flex items-center text-white"
                    >
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      Date Achieved
                    </Label>
                    <Input
                      id="achievement_date"
                      type="date"
                      value={achievementFormData.date_achieved}
                      onChange={(e) =>
                        setAchievementFormData((prev) => ({
                          ...prev,
                          date_achieved: e.target.value,
                        }))
                      }
                      className="mt-1 border-gray-600 bg-gray-900 text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelAchievement}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <XIcon className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAchievement}
                    disabled={createAchievementMutation.isPending}
                    className="bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    {createAchievementMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <SaveIcon className="mr-2 h-4 w-4" />
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
                <Card
                  key={achievement.id}
                  className="border-gray-700 bg-gray-800"
                >
                  <CardContent className="p-4">
                    {editingAchievementId === achievement.id ? (
                      // Edit mode
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <Label
                              htmlFor={`edit_title_${achievement.id}`}
                              className="font-rajdhani text-white"
                            >
                              Achievement Title
                            </Label>
                            <Input
                              id={`edit_title_${achievement.id}`}
                              value={achievementFormData.title}
                              onChange={(e) =>
                                setAchievementFormData((prev) => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              className="mt-1 border-gray-600 bg-gray-900 text-white"
                              maxLength={200}
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor={`edit_date_${achievement.id}`}
                              className="font-rajdhani flex items-center text-white"
                            >
                              <CalendarIcon className="mr-1 h-4 w-4" />
                              Date Achieved
                            </Label>
                            <Input
                              id={`edit_date_${achievement.id}`}
                              type="date"
                              value={achievementFormData.date_achieved}
                              onChange={(e) =>
                                setAchievementFormData((prev) => ({
                                  ...prev,
                                  date_achieved: e.target.value,
                                }))
                              }
                              className="mt-1 border-gray-600 bg-gray-900 text-white"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                          <Button
                            variant="outline"
                            onClick={handleCancelAchievement}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleUpdateAchievement}
                            disabled={updateAchievementMutation.isPending}
                            className="bg-cyan-600 text-white hover:bg-cyan-700"
                          >
                            {updateAchievementMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <SaveIcon className="mr-2 h-4 w-4" />
                            )}
                            Update Achievement
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-orbitron mb-1 font-semibold text-white">
                            {achievement.title}
                          </h4>
                          <div className="flex items-center text-sm text-gray-400">
                            <CalendarIcon className="mr-1 h-4 w-4" />
                            <span className="font-rajdhani">
                              {new Date(
                                achievement.date_achieved,
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAchievement(achievement)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                          >
                            <EditIcon className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteAchievement(achievement.id)
                            }
                            disabled={deleteAchievementMutation.isPending}
                            className="border-red-600 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                          >
                            <TrashIcon className="h-3 w-3" />
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
              <div className="py-8 text-center">
                <TrophyIcon className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                <h3 className="font-orbitron mb-2 text-lg text-gray-400">
                  No Achievements Yet
                </h3>
                <p className="font-rajdhani mb-4 text-gray-500">
                  Add your coaching achievements to showcase your experience on
                  your school&apos;s public profile.
                </p>
                <Button
                  onClick={() => setIsAddingAchievement(true)}
                  className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Your First Achievement
                </Button>
              </div>
            )
          )}

          {/* Info Box */}
          <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-3">
            <div className="flex items-start space-x-2">
              <InfoIcon className="mt-0.5 h-4 w-4 text-blue-400" />
              <div className="text-xs text-blue-300">
                <p className="mb-1 font-semibold">Achievement Display</p>
                <p>
                  These achievements will be displayed on your school&apos;s
                  public profile page to showcase your coaching experience and
                  accomplishments.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
