"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  GamepadIcon,
  LinkIcon,
  EditIcon,
  XIcon,
  InstagramIcon,
  TwitchIcon,
  TwitterIcon,
  PlusIcon,
  MessageCircleIcon,
  GithubIcon,
  LoaderIcon,
  SaveIcon,
  CheckIcon,
  UserIcon,
  ShieldIcon,
  ExternalLinkIcon,
} from "lucide-react";
import Link from "next/link";
import { api } from "@/trpc/react";
import { neobrutalism } from "@clerk/themes";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from "sonner";

// Types for connections
interface GameConnection {
  platform: string;
  username: string;
  connected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  displayName: string;
  color: string;
  requiresOAuth?: boolean; // New field to indicate OAuth requirement
  featured?: boolean; // New field to highlight main supported games
}

interface SocialConnection {
  platform: string;
  username: string;
  connected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  displayName: string;
  color: string;
  requiresOAuth?: boolean; // New field to indicate OAuth requirement
}

interface ProfileData {
  location: string;
  bio: string;
}

interface RecruitingData {
  school: string;
  class_year: string;
  main_game_id: string;
  scholastic_contact: string;
  scholastic_contact_email: string;
  guardian_email: string;
  gpa: string;
  graduation_date: string;
  intended_major: string;
  extra_curriculars: string;
  academic_bio: string;
}

type ValidationErrors = Record<string, string>;

export default function ProfilePage() {
  const { user } = useUser();

  // tRPC hooks
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = api.playerProfile.getProfile.useQuery();

  const { data: availableGames, isLoading: isLoadingGames } =
    api.playerProfile.getAvailableGames.useQuery();

  const updateProfileMutation = api.playerProfile.updateProfile.useMutation({
    onSuccess: () => {
      void refetchProfile();
      setIsEditingProfile(false);
      setIsEditingRecruiting(false);
      setProfileErrors({});
      setRecruitingErrors({});
      setHasUnsavedProfileChanges(false);
      setHasUnsavedRecruitingChanges(false);
    },
    onError: (error) => {
      setProfileErrors({ general: error.message });
      setRecruitingErrors({ general: error.message });
    },
  });

  // Connection mutations
  const updatePlatformMutation =
    api.playerProfile.updatePlatformConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
        setConnectionUsername("");
        setSelectedPlatform("");
        setConnectionError("");
        setIsEditingGameConnections(false);
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  const updateOAuthMutation =
    api.playerProfile.updateOAuthConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
        setSelectedPlatform("");
        setConnectionError("");
        setIsEditingGameConnections(false);
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  const updateSocialMutation =
    api.playerProfile.updateSocialConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
        setConnectionUsername("");
        setSelectedPlatform("");
        setConnectionError("");
        setIsEditingSocialConnections(false);
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  const removePlatformMutation =
    api.playerProfile.removePlatformConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  const removeSocialMutation =
    api.playerProfile.removeSocialConnection.useMutation({
      onSuccess: () => {
        void refetchProfile();
      },
      onError: (error) => {
        setConnectionError(error.message);
      },
    });

  // Banner update mutation
  const updatePlayerBannerMutation =
    api.playerProfile.updatePlayerBanner.useMutation({
      onSuccess: () => {
        toast.success("Banner updated successfully!");
        void refetchProfile();
      },
      onError: (error) => {
        toast.error(`Failed to update banner: ${error.message}`);
      },
    });

  // Editing states for each panel
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingRecruiting, setIsEditingRecruiting] = useState(false);
  const [isEditingGameConnections, setIsEditingGameConnections] =
    useState(false);
  const [isEditingSocialConnections, setIsEditingSocialConnections] =
    useState(false);

  // Connection state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [connectionUsername, setConnectionUsername] = useState("");

  // Unsaved changes tracking
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] =
    useState(false);
  const [hasUnsavedRecruitingChanges, setHasUnsavedRecruitingChanges] =
    useState(false);

  // Validation state
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [recruitingErrors, setRecruitingErrors] = useState<ValidationErrors>(
    {},
  );
  const [connectionError, setConnectionError] = useState("");

  // Editable profile data state (only location and bio)
  const [editableProfileData, setEditableProfileData] = useState<ProfileData>({
    location: "",
    bio: "",
  });

  // Recruiting data state
  const [recruitingData, setRecruitingData] = useState<RecruitingData>({
    school: "",
    class_year: "",
    main_game_id: "",
    scholastic_contact: "",
    scholastic_contact_email: "",
    guardian_email: "",
    gpa: "",
    graduation_date: "",
    intended_major: "",
    extra_curriculars: "",
    academic_bio: "",
  });

  // Update editable data when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditableProfileData({
        location: profileData.location ?? "",
        bio: profileData.bio ?? "",
      });

      // Update recruiting data from API
      setRecruitingData({
        school: profileData.school ?? "",
        class_year: profileData.class_year ?? "",
        main_game_id: profileData.main_game_id ?? "",
        scholastic_contact: profileData.scholastic_contact ?? "",
        scholastic_contact_email: profileData.scholastic_contact_email ?? "",
        guardian_email: profileData.guardian_email ?? "",
        gpa: profileData.gpa?.toString() ?? "",
        graduation_date: profileData.graduation_date ?? "",
        intended_major: profileData.intended_major ?? "",
        extra_curriculars: profileData.extra_curriculars ?? "",
        academic_bio: profileData.academic_bio ?? "",
      });
    }
  }, [profileData]);

  // Track form changes for profile
  useEffect(() => {
    if (profileData) {
      const hasChanges =
        editableProfileData.location !== (profileData.location ?? "") ||
        editableProfileData.bio !== (profileData.bio ?? "");
      setHasUnsavedProfileChanges(hasChanges);
    }
  }, [editableProfileData, profileData]);

  // Track form changes for recruiting
  useEffect(() => {
    if (profileData) {
      const hasChanges =
        recruitingData.school !== (profileData.school ?? "") ||
        recruitingData.class_year !== (profileData.class_year ?? "") ||
        recruitingData.main_game_id !== (profileData.main_game_id ?? "") ||
        recruitingData.scholastic_contact !==
          (profileData.scholastic_contact ?? "") ||
        recruitingData.scholastic_contact_email !==
          (profileData.scholastic_contact_email ?? "") ||
        recruitingData.guardian_email !== (profileData.guardian_email ?? "") ||
        recruitingData.gpa !== (profileData.gpa?.toString() ?? "") ||
        recruitingData.graduation_date !==
          (profileData.graduation_date ?? "") ||
        recruitingData.intended_major !== (profileData.intended_major ?? "") ||
        recruitingData.extra_curriculars !==
          (profileData.extra_curriculars ?? "") ||
        recruitingData.academic_bio !== (profileData.academic_bio ?? "");
      setHasUnsavedRecruitingChanges(hasChanges);
    }
  }, [recruitingData, profileData]);

  // Game connections configurations - Emphasizing the 4 main supported games
  const gameConnectionsConfig: GameConnection[] = [
    {
      platform: "valorant",
      username: "",
      connected: false,
      icon: ShieldIcon,
      displayName: "VALORANT",
      color: "bg-gradient-to-r from-red-500 to-red-600",
      requiresOAuth: true,
      featured: true,
    },
    {
      platform: "epicgames",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Rocket League",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      requiresOAuth: true,
      featured: true,
    },
    {
      platform: "battlenet",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Overwatch 2",
      color: "bg-gradient-to-r from-orange-400 to-blue-500",
      requiresOAuth: false,
      featured: true,
    },
    {
      platform: "startgg",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Smash Ultimate",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      requiresOAuth: true,
      featured: true,
    },
  ];

  // Social connections configurations
  const socialConnectionsConfig: SocialConnection[] = [
    {
      platform: "github",
      username: "",
      connected: false,
      icon: GithubIcon,
      displayName: "GitHub",
      color: "bg-gray-800",
    },
    {
      platform: "discord",
      username: "",
      connected: false,
      icon: MessageCircleIcon,
      displayName: "Discord",
      color: "bg-indigo-600",
      requiresOAuth: true, // Discord uses OAuth
    },
    {
      platform: "instagram",
      username: "",
      connected: false,
      icon: InstagramIcon,
      displayName: "Instagram",
      color: "bg-pink-600",
    },
    {
      platform: "twitch",
      username: "",
      connected: false,
      icon: TwitchIcon,
      displayName: "Twitch",
      color: "bg-purple-600",
    },
    {
      platform: "x",
      username: "",
      connected: false,
      icon: TwitterIcon,
      displayName: "X (Twitter)",
      color: "bg-gray-900",
    },
  ];

  // Create connection arrays from database data, config, and OAuth external accounts
  const gameConnections = gameConnectionsConfig.map((config) => {
    const dbConnection = profileData?.platform_connections?.find(
      (conn) => conn.platform === config.platform,
    );

    // Check for OAuth connections (like Valorant and Epic Games) from Clerk external accounts
    let isOAuthConnected = false;
    let oauthUsername = "";

    if (config.requiresOAuth && config.platform === "valorant") {
      const externalAccount = user?.externalAccounts?.find(
        (account) =>
          account.provider.includes("valorant") ||
          account.provider === "custom_valorant",
      );

      if (
        externalAccount &&
        externalAccount.verification?.status === "verified"
      ) {
        isOAuthConnected = true;
        oauthUsername =
          externalAccount.username ??
          externalAccount.emailAddress ??
          "Connected Account";
      }
    }

    if (config.requiresOAuth && config.platform === "epicgames") {
      const externalAccount = user?.externalAccounts?.find(
        (account) =>
          account.provider.includes("epic_games") ||
          account.provider === "custom_epic_games",
      );

      if (
        externalAccount &&
        externalAccount.verification?.status === "verified"
      ) {
        isOAuthConnected = true;
        oauthUsername =
          externalAccount.username ??
          externalAccount.emailAddress ??
          "Connected Account";
      }
    }

    if (config.requiresOAuth && config.platform === "startgg") {
      const externalAccount = user?.externalAccounts?.find(
        (account) =>
          account.provider.includes("start_gg") ||
          account.provider === "custom_start_gg",
      );

      if (
        externalAccount &&
        externalAccount.verification?.status === "verified"
      ) {
        isOAuthConnected = true;
        oauthUsername =
          externalAccount.username ??
          externalAccount.emailAddress ??
          "Connected Account";
      }
    }

    return {
      ...config,
      username: dbConnection?.username ?? oauthUsername,
      connected: dbConnection?.connected ?? isOAuthConnected,
    };
  });

  const socialConnections = socialConnectionsConfig.map((config) => {
    const dbConnection = profileData?.social_connections?.find(
      (conn) => conn.platform === config.platform,
    );

    // Check for OAuth connections (like Discord) from Clerk external accounts
    let isOAuthConnected = false;
    let oauthUsername = "";

    if (config.requiresOAuth && config.platform === "discord") {
      const externalAccount = user?.externalAccounts?.find(
        (account) => account.provider === "discord",
      );

      if (
        externalAccount &&
        externalAccount.verification?.status === "verified"
      ) {
        isOAuthConnected = true;
        oauthUsername =
          externalAccount.username ??
          externalAccount.emailAddress ??
          "Connected Account";
      }
    }

    return {
      ...config,
      username: dbConnection?.username ?? oauthUsername,
      connected: dbConnection?.connected ?? isOAuthConnected,
    };
  });

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateGPA = (gpa: string): boolean => {
    const gpaNum = parseFloat(gpa);
    return !isNaN(gpaNum) && gpaNum >= 0 && gpaNum <= 4.0;
  };

  const validateYear = (year: string): boolean => {
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return (
      !isNaN(yearNum) && yearNum >= currentYear && yearNum <= currentYear + 10
    );
  };

  const validateProfileData = (): boolean => {
    const errors: ValidationErrors = {};

    if (
      editableProfileData.location &&
      editableProfileData.location.length < 2
    ) {
      errors.location = "Location must be at least 2 characters";
    }

    if (editableProfileData.bio && editableProfileData.bio.length < 10) {
      errors.bio = "Bio must be at least 10 characters";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRecruitingData = (): boolean => {
    const errors: ValidationErrors = {};

    if (
      recruitingData.scholastic_contact_email &&
      !validateEmail(recruitingData.scholastic_contact_email)
    ) {
      errors.scholastic_contact_email = "Please enter a valid email address";
    }

    if (
      recruitingData.guardian_email &&
      !validateEmail(recruitingData.guardian_email)
    ) {
      errors.guardian_email = "Please enter a valid email address";
    }

    if (recruitingData.gpa && !validateGPA(recruitingData.gpa)) {
      errors.gpa = "GPA must be between 0.0 and 4.0";
    }

    if (recruitingData.class_year && !validateYear(recruitingData.class_year)) {
      errors.class_year = "Please enter a valid graduation year";
    }

    setRecruitingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateConnection = (): boolean => {
    if (!selectedPlatform) {
      setConnectionError("Please select a platform");
      return false;
    }

    if (!connectionUsername.trim()) {
      setConnectionError("Please enter a username");
      return false;
    }

    if (connectionUsername.trim().length < 3) {
      setConnectionError("Username must be at least 3 characters");
      return false;
    }

    setConnectionError("");
    return true;
  };

  const handleGameConnectionSave = () => {
    const platformConfig = gameConnectionsConfig.find(
      (p) => p.platform === selectedPlatform,
    );

    if (platformConfig?.requiresOAuth) {
      // Handle OAuth connection
      void handleOAuthConnection();
    } else {
      // Handle manual username connection
      if (!validateConnection()) return;

      updatePlatformMutation.mutate({
        platform: selectedPlatform as
          | "steam"
          | "valorant"
          | "battlenet"
          | "epicgames"
          | "startgg",
        username: connectionUsername.trim(),
      });
    }
  };

  const handleOAuthConnection = async () => {
    if (selectedPlatform === "valorant") {
      // Check if user already has a Valorant account connected
      const hasValorantAccount = user?.externalAccounts?.some(
        (account) =>
          account.provider.includes("valorant") ||
          account.provider === "custom_valorant",
      );

      if (!hasValorantAccount) {
        // Redirect to connect Valorant account
        setConnectionError(
          "Please connect your Valorant account first through your account settings.",
        );
        return;
      }

      // Use the OAuth connection
      updateOAuthMutation.mutate({
        platform: "valorant",
        provider: "custom_valorant",
      });
    }
  };

  const handleSocialConnectionSave = () => {
    const platformConfig = socialConnectionsConfig.find(
      (p) => p.platform === selectedPlatform,
    );

    if (platformConfig?.requiresOAuth) {
      // For Discord OAuth, redirect to external accounts page
      if (selectedPlatform === "discord") {
        window.open("/dashboard/player/profile/external-accounts", "_blank");
        return;
      }
    } else {
      // Handle manual username connection
      if (!validateConnection()) return;

      updateSocialMutation.mutate({
        platform: selectedPlatform as
          | "github"
          | "discord"
          | "instagram"
          | "twitch"
          | "x",
        username: connectionUsername.trim(),
      });
    }
  };

  const disconnectAccount = (platform: string, type: "game" | "social") => {
    // Check if this is an OAuth connection that needs to be managed through external accounts
    if (type === "game") {
      const platformConfig = gameConnectionsConfig.find(
        (config) => config.platform === platform,
      );
      const isOAuthConnection =
        platformConfig?.requiresOAuth &&
        user?.externalAccounts?.some((account) => {
          const isValorant =
            (account.provider.includes("valorant") ||
              account.provider === "custom_valorant") &&
            account.verification?.status === "verified";
          const isEpicGames =
            (account.provider.includes("epic_games") ||
              account.provider === "custom_epic_games") &&
            account.verification?.status === "verified";
          const isStartGG =
            (account.provider.includes("start_gg") ||
              account.provider === "custom_start_gg") &&
            account.verification?.status === "verified";
          return isValorant || isEpicGames || isStartGG;
        });

      if (isOAuthConnection) {
        // Redirect to external accounts management for OAuth connections
        window.open("/dashboard/player/profile/external-accounts", "_blank");
        return;
      }
    } else {
      // Check for social OAuth connections (like Discord)
      const socialConfig = socialConnectionsConfig.find(
        (config) => config.platform === platform,
      );
      const isDiscordOAuth =
        socialConfig?.requiresOAuth &&
        platform === "discord" &&
        user?.externalAccounts?.some(
          (account) =>
            account.provider === "discord" &&
            account.verification?.status === "verified",
        );

      if (isDiscordOAuth) {
        // Redirect to external accounts management for Discord OAuth
        window.open("/dashboard/player/profile/external-accounts", "_blank");
        return;
      }
    }

    // Handle regular platform connections
    if (type === "game") {
      removePlatformMutation.mutate({
        platform: platform as
          | "steam"
          | "valorant"
          | "battlenet"
          | "epicgames"
          | "startgg",
      });
    } else {
      removeSocialMutation.mutate({
        platform: platform as
          | "github"
          | "discord"
          | "instagram"
          | "twitch"
          | "x",
      });
    }
  };

  const handleProfileSave = () => {
    if (!validateProfileData()) return;

    updateProfileMutation.mutate({
      location: editableProfileData.location,
      bio: editableProfileData.bio,
    });
  };

  const handleRecruitingSave = () => {
    if (!validateRecruitingData()) return;

    // Convert GPA to number if provided
    const gpaNumber = recruitingData.gpa
      ? parseFloat(recruitingData.gpa)
      : undefined;

    updateProfileMutation.mutate({
      school: recruitingData.school || undefined,
      class_year: recruitingData.class_year || undefined,
      main_game_id: recruitingData.main_game_id || undefined,
      scholastic_contact: recruitingData.scholastic_contact || undefined,
      scholastic_contact_email:
        recruitingData.scholastic_contact_email || undefined,
      guardian_email: recruitingData.guardian_email || undefined,
      gpa: gpaNumber,
      graduation_date: recruitingData.graduation_date || undefined,
      intended_major: recruitingData.intended_major || undefined,
      extra_curriculars: recruitingData.extra_curriculars || undefined,
      academic_bio: recruitingData.academic_bio || undefined,
    });
  };

  const handleProfileCancel = () => {
    if (profileData) {
      setEditableProfileData({
        location: profileData.location ?? "",
        bio: profileData.bio ?? "",
      });
    }
    setIsEditingProfile(false);
    setHasUnsavedProfileChanges(false);
    setProfileErrors({});
  };

  const handleRecruitingCancel = () => {
    if (profileData) {
      setRecruitingData({
        school: profileData.school ?? "",
        class_year: profileData.class_year ?? "",
        main_game_id: profileData.main_game_id ?? "",
        scholastic_contact: profileData.scholastic_contact ?? "",
        scholastic_contact_email: profileData.scholastic_contact_email ?? "",
        guardian_email: profileData.guardian_email ?? "",
        gpa: profileData.gpa?.toString() ?? "",
        graduation_date: profileData.graduation_date ?? "",
        intended_major: profileData.intended_major ?? "",
        extra_curriculars: profileData.extra_curriculars ?? "",
        academic_bio: profileData.academic_bio ?? "",
      });
    }
    setIsEditingRecruiting(false);
    setHasUnsavedRecruitingChanges(false);
    setRecruitingErrors({});
  };

  // Banner upload handlers
  const handleBannerUpload = (url: string) => {
    updatePlayerBannerMutation.mutate({ banner_url: url });
  };

  const handleBannerRemove = () => {
    updatePlayerBannerMutation.mutate({ banner_url: "" });
  };

  const handleBannerUploadError = (error: string) => {
    toast.error(`Banner upload failed: ${error}`);
  };

  const connectedGameAccounts = gameConnections.filter(
    (conn) => conn.connected,
  ).length;
  const connectedSocialAccounts = socialConnections.filter(
    (conn) => conn.connected,
  ).length;
  const hasBasicInfo = !!(
    editableProfileData.location || editableProfileData.bio
  );
  const hasRecruitingInfo = !!(
    recruitingData.school ||
    recruitingData.main_game_id ||
    recruitingData.gpa ||
    recruitingData.extra_curriculars ||
    recruitingData.academic_bio
  );

  // Cap game connections at 2 and social connections at 1 for progress calculation
  const gameConnectionsForProgress = Math.min(connectedGameAccounts, 2);
  const socialConnectionsForProgress = Math.min(connectedSocialAccounts, 1);

  const profileCompletion = Math.min(
    (hasBasicInfo ? 20 : 0) +
      (hasRecruitingInfo ? 50 : 0) +
      gameConnectionsForProgress * 10 +
      socialConnectionsForProgress * 20,
    100,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="container mx-auto max-w-7xl space-y-8 p-6">
        {/* Enhanced Page Header */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-orange-500/10 p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 flex items-center space-x-6 lg:mb-0">
              {/* Enhanced Profile Avatar - Now Circular */}
              <div className="relative">
                <div className="border-gradient-to-br h-28 w-28 rounded-full border-4 bg-gradient-to-br from-blue-400 from-blue-500 to-purple-500 to-purple-600 p-1 shadow-2xl">
                  <UserButton
                    appearance={{
                      baseTheme: neobrutalism,
                      elements: {
                        avatarBox: "profile-avatar-large",
                        avatarImage: "rounded-full",
                      },
                    }}
                  />
                </div>
                {/* Online Status Indicator */}
                <div className="absolute -right-1 -bottom-1 h-6 w-6 animate-pulse rounded-full border-4 border-[#1a1a2e] bg-green-500"></div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-3">
                  <h1 className="font-orbitron text-3xl font-bold text-white">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  {user?.username && (
                    <Link
                      href={`/profiles/player/${user.username}`}
                      className="group flex items-center gap-1 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-purple-600/20 px-3 py-1 transition-all duration-200 hover:border-blue-400/50 hover:from-blue-600/30 hover:to-purple-600/30"
                    >
                      <ExternalLinkIcon className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                      <span className="font-rajdhani text-sm text-blue-400 group-hover:text-blue-300">
                        View Public Profile
                      </span>
                    </Link>
                  )}
                </div>
                {user?.username && (
                  <div className="mb-2 flex items-center space-x-1">
                    <UserIcon className="h-4 w-4 text-blue-400" />
                    <span className="font-rajdhani text-gray-300">
                      @{user.username}
                    </span>
                  </div>
                )}
                <p className="font-rajdhani text-gray-400">
                  Manage your gaming profile and recruitment information
                </p>
              </div>
            </div>

            {/* Profile Completion Widget */}
            <div className="min-w-[200px] rounded-xl border border-gray-700/50 bg-black/30 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-rajdhani text-sm text-gray-300">
                  Profile Strength
                </span>
                <span className="font-orbitron text-lg font-bold text-white">
                  {profileCompletion}%
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                  style={{ width: `${profileCompletion}%` }}
                />
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>
              <p className="font-rajdhani mt-2 text-xs text-gray-400">
                {profileCompletion < 50
                  ? "Complete your profile to attract recruiters"
                  : profileCompletion < 80
                    ? "Looking good! Add more connections"
                    : "Excellent! Your profile is ready to shine"}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-8 lg:col-span-2">
            {/* Basic Information */}
            <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    Basic Information
                  </h3>
                  {hasUnsavedProfileChanges && (
                    <Badge
                      variant="outline"
                      className="border-yellow-400 text-xs text-yellow-400"
                    >
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
                {!isEditingProfile && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsEditingProfile(true)}
                    disabled={
                      isLoadingProfile || updateProfileMutation.isPending
                    }
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>

              {/* Loading State */}
              {isLoadingProfile && (
                <div className="flex items-center justify-center py-8">
                  <LoaderIcon className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Loading profile...</span>
                </div>
              )}

              {/* Error State */}
              {profileError && (
                <div className="rounded-lg border border-red-600/30 bg-red-900/20 p-4">
                  <p className="text-red-400">
                    Failed to load profile: {profileError.message}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 border-red-600 text-red-400 hover:bg-red-900/20"
                    onClick={() => void refetchProfile()}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {/* Profile Content */}
              {!isLoadingProfile && !profileError && (
                <div className="space-y-6">
                  {user ||
                  editableProfileData.location ||
                  editableProfileData.bio ? (
                    <div className="space-y-6">
                      {/* Enhanced Form Section */}
                      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-purple-500/5 p-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Editable fields with enhanced styling */}
                          {isEditingProfile ? (
                            <>
                              <div className="group">
                                <Label
                                  htmlFor="location"
                                  className="font-rajdhani mb-2 block font-medium text-white"
                                >
                                  Location
                                </Label>
                                <Input
                                  id="location"
                                  value={editableProfileData.location}
                                  onChange={(e) =>
                                    setEditableProfileData((prev) => ({
                                      ...prev,
                                      location: e.target.value,
                                    }))
                                  }
                                  className="border-gray-600 bg-gray-800/50 text-white transition-all duration-200 focus:border-blue-400 focus:ring-blue-400/20"
                                  placeholder="Enter your location (e.g., San Francisco, CA)"
                                />
                                {profileErrors.location && (
                                  <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                                    <XIcon className="h-3 w-3" />
                                    {profileErrors.location}
                                  </p>
                                )}
                              </div>
                              <div className="group md:col-span-2">
                                <Label
                                  htmlFor="bio"
                                  className="font-rajdhani mb-2 block font-medium text-white"
                                >
                                  Bio
                                </Label>
                                <Input
                                  id="bio"
                                  value={editableProfileData.bio}
                                  onChange={(e) =>
                                    setEditableProfileData((prev) => ({
                                      ...prev,
                                      bio: e.target.value,
                                    }))
                                  }
                                  className="border-gray-600 bg-gray-800/50 text-white transition-all duration-200 focus:border-blue-400 focus:ring-blue-400/20"
                                  placeholder="Tell us about yourself and your gaming journey..."
                                />
                                {profileErrors.bio && (
                                  <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                                    <XIcon className="h-3 w-3" />
                                    {profileErrors.bio}
                                  </p>
                                )}
                              </div>

                              {/* Banner Upload */}
                              <div className="group md:col-span-2">
                                <Label className="font-rajdhani mb-2 block font-medium text-white">
                                  Banner Image
                                </Label>
                                <FileUpload
                                  bucket="PLAYERS"
                                  entityId={profileData?.id ?? ""}
                                  assetType="BANNER"
                                  currentImageUrl={profileData?.banner_url}
                                  label="Profile Banner"
                                  description="Upload a banner image for your public profile"
                                  onUploadSuccess={handleBannerUpload}
                                  onUploadError={handleBannerUploadError}
                                  onRemove={handleBannerRemove}
                                  disabled={
                                    updatePlayerBannerMutation.isPending
                                  }
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {editableProfileData.location && (
                                <div className="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4">
                                  <Label className="font-rajdhani text-sm text-gray-400">
                                    Location
                                  </Label>
                                  <p className="mt-1 font-medium text-white">
                                    {editableProfileData.location}
                                  </p>
                                </div>
                              )}
                              {editableProfileData.bio && (
                                <div className="rounded-lg border border-gray-700/50 bg-gray-800/30 p-4 md:col-span-2">
                                  <Label className="font-rajdhani text-sm text-gray-400">
                                    Bio
                                  </Label>
                                  <p className="mt-1 font-medium text-white">
                                    {editableProfileData.bio}
                                  </p>
                                </div>
                              )}
                              {!editableProfileData.location &&
                                !editableProfileData.bio && (
                                  <div className="py-8 text-center md:col-span-2">
                                    <div className="mb-4 text-gray-400">
                                      <UserIcon className="mx-auto mb-3 h-12 w-12 opacity-50" />
                                      <p>No profile information added yet</p>
                                      <p className="text-sm">
                                        Add your location and bio to help others
                                        get to know you
                                      </p>
                                    </div>
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      {isEditingProfile && (
                        <div className="flex justify-end space-x-3 border-t border-gray-700/50 pt-6">
                          <Button
                            variant="outline"
                            onClick={handleProfileCancel}
                            className="border-gray-600 text-gray-300 transition-all duration-200 hover:border-gray-500 hover:bg-gray-700 hover:text-white"
                          >
                            <XIcon className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleProfileSave}
                            disabled={
                              updateProfileMutation.isPending ||
                              !hasUnsavedProfileChanges
                            }
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updateProfileMutation.isPending ? (
                              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <SaveIcon className="mr-2 h-4 w-4" />
                            )}
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="mb-4 text-gray-400">
                        Complete your basic profile information to get started.
                      </p>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => setIsEditingProfile(true)}
                      >
                        Complete Profile
                      </Button>
                    </div>
                  )}

                  {/* Profile Errors */}
                  {profileErrors.general && (
                    <div className="rounded-lg border border-red-600/30 bg-red-900/20 p-3">
                      <p className="text-sm text-red-400">
                        {profileErrors.general}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Recruiting Information */}
            <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      Recruiting Information
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Private information for college recruiters only
                    </p>
                  </div>
                  {hasUnsavedRecruitingChanges && (
                    <Badge
                      variant="outline"
                      className="border-yellow-400 text-xs text-yellow-400"
                    >
                      Unsaved Changes
                    </Badge>
                  )}
                </div>
                {!isEditingRecruiting && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 bg-white text-black hover:bg-gray-200"
                    onClick={() => setIsEditingRecruiting(true)}
                    disabled={
                      isLoadingProfile || updateProfileMutation.isPending
                    }
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              <div className="space-y-6">
                {recruitingErrors.general && (
                  <div className="flex items-center gap-3 rounded-lg border border-red-600/30 bg-red-900/20 p-4">
                    <XIcon className="h-5 w-5 flex-shrink-0 text-red-400" />
                    <p className="text-sm text-red-400">
                      {recruitingErrors.general}
                    </p>
                  </div>
                )}

                {/* Enhanced Academic Information */}
                <div className="rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-orange-500/5 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <UserIcon className="h-5 w-5 text-purple-400" />
                    Academic Information
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <Label
                        htmlFor="school"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        School
                      </Label>
                      <Input
                        id="school"
                        value={recruitingData.school}
                        onChange={(e) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            school: e.target.value,
                          }))
                        }
                        disabled={!isEditingRecruiting}
                        className={cn(
                          "transition-all duration-200",
                          isEditingRecruiting
                            ? "border-gray-600 bg-gray-800/50 text-white focus:border-purple-400 focus:ring-purple-400/20"
                            : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                        )}
                        placeholder="Enter your high school's name"
                      />
                    </div>
                    <div className="group">
                      <Label
                        htmlFor="class"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        Graduation Year
                      </Label>
                      <Input
                        id="class"
                        value={recruitingData.class_year}
                        onChange={(e) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            class_year: e.target.value,
                          }))
                        }
                        disabled={!isEditingRecruiting}
                        className={cn(
                          "transition-all duration-200",
                          isEditingRecruiting
                            ? "border-gray-600 bg-gray-800/50 text-white focus:border-purple-400 focus:ring-purple-400/20"
                            : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                        )}
                        placeholder="e.g., 2025"
                      />
                      {recruitingErrors.class_year && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                          <XIcon className="h-3 w-3" />
                          {recruitingErrors.class_year}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Gaming & Academic Performance */}
                <div className="rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-green-500/5 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <GamepadIcon className="h-5 w-5 text-orange-400" />
                    Gaming & Academic Performance
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <Label
                        htmlFor="mainGame"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        Main Game
                      </Label>
                      <Select
                        value={recruitingData.main_game_id}
                        onValueChange={(value) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            main_game_id: value,
                          }))
                        }
                        disabled={isLoadingGames || !isEditingRecruiting}
                      >
                        <SelectTrigger
                          className={cn(
                            "transition-all duration-200",
                            isEditingRecruiting && !isLoadingGames
                              ? "border-gray-600 bg-gray-800/50 text-white focus:border-orange-400 focus:ring-orange-400/20"
                              : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                          )}
                        >
                          <SelectValue
                            placeholder={
                              isLoadingGames
                                ? "Loading games..."
                                : "Select your main competitive game"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="border-gray-700 bg-gray-800">
                          {availableGames?.map((game) => (
                            <SelectItem
                              key={game.id}
                              value={game.id}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              {game.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="group">
                      <Label
                        htmlFor="gpa"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        GPA
                      </Label>
                      <Input
                        id="gpa"
                        value={recruitingData.gpa}
                        onChange={(e) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            gpa: e.target.value,
                          }))
                        }
                        disabled={!isEditingRecruiting}
                        className={cn(
                          "transition-all duration-200",
                          isEditingRecruiting
                            ? "border-gray-600 bg-gray-800/50 text-white focus:border-orange-400 focus:ring-orange-400/20"
                            : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                        )}
                        placeholder="e.g., 3.7 (scale of 4.0)"
                      />
                      {recruitingErrors.gpa && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                          <XIcon className="h-3 w-3" />
                          {recruitingErrors.gpa}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="group mt-6">
                    <Label
                      htmlFor="intended_major"
                      className={cn(
                        "font-rajdhani mb-2 block font-medium",
                        isEditingRecruiting ? "text-white" : "text-gray-400",
                      )}
                    >
                      Intended Major
                    </Label>
                    <Input
                      id="intended_major"
                      value={recruitingData.intended_major}
                      onChange={(e) =>
                        setRecruitingData((prev) => ({
                          ...prev,
                          intended_major: e.target.value,
                        }))
                      }
                      disabled={!isEditingRecruiting}
                      className={cn(
                        "transition-all duration-200",
                        isEditingRecruiting
                          ? "border-gray-600 bg-gray-800/50 text-white focus:border-orange-400 focus:ring-orange-400/20"
                          : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                      )}
                      placeholder="e.g., Computer Science, Business Administration, Engineering"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="rounded-xl border border-green-500/20 bg-gradient-to-br from-green-500/5 to-blue-500/5 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <UserIcon className="h-5 w-5 text-green-400" />
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <Label
                        htmlFor="scholastic_contact"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        Scholastic Contact
                      </Label>
                      <Input
                        id="scholastic_contact"
                        value={recruitingData.scholastic_contact}
                        onChange={(e) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            scholastic_contact: e.target.value,
                          }))
                        }
                        disabled={!isEditingRecruiting}
                        className={cn(
                          "transition-all duration-200",
                          isEditingRecruiting
                            ? "border-gray-600 bg-gray-800/50 text-white focus:border-green-400 focus:ring-green-400/20"
                            : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                        )}
                        placeholder="Guidance Counselor or Teacher Name"
                      />
                    </div>
                    <div className="group">
                      <Label
                        htmlFor="scholastic_contact_email"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        Scholastic Contact Email
                      </Label>
                      <Input
                        id="scholastic_contact_email"
                        type="email"
                        value={recruitingData.scholastic_contact_email}
                        onChange={(e) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            scholastic_contact_email: e.target.value,
                          }))
                        }
                        disabled={!isEditingRecruiting}
                        className={cn(
                          "transition-all duration-200",
                          isEditingRecruiting
                            ? "border-gray-600 bg-gray-800/50 text-white focus:border-green-400 focus:ring-green-400/20"
                            : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                        )}
                        placeholder="counselor@school.edu"
                      />
                      {recruitingErrors.scholastic_contact_email && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                          <XIcon className="h-3 w-3" />
                          {recruitingErrors.scholastic_contact_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="group mt-6">
                    <Label
                      htmlFor="guardian_email"
                      className={cn(
                        "font-rajdhani mb-2 block font-medium",
                        isEditingRecruiting ? "text-white" : "text-gray-400",
                      )}
                    >
                      Parent/Guardian Email
                    </Label>
                    <Input
                      id="guardian_email"
                      type="email"
                      value={recruitingData.guardian_email}
                      onChange={(e) =>
                        setRecruitingData((prev) => ({
                          ...prev,
                          guardian_email: e.target.value,
                        }))
                      }
                      disabled={!isEditingRecruiting}
                      className={cn(
                        "transition-all duration-200",
                        isEditingRecruiting
                          ? "border-gray-600 bg-gray-800/50 text-white focus:border-green-400 focus:ring-green-400/20"
                          : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                      )}
                      placeholder="parent@email.com"
                    />
                    {recruitingErrors.guardian_email && (
                      <p className="mt-2 flex items-center gap-1 text-sm text-red-400">
                        <XIcon className="h-3 w-3" />
                        {recruitingErrors.guardian_email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-red-500/5 p-6">
                  <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                    <MessageCircleIcon className="h-5 w-5 text-pink-400" />
                    Additional Information
                  </h4>
                  <div className="space-y-6">
                    <div className="group">
                      <Label
                        htmlFor="extra_curriculars"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        Extracurricular Activities
                      </Label>
                      <Input
                        id="extra_curriculars"
                        value={recruitingData.extra_curriculars}
                        onChange={(e) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            extra_curriculars: e.target.value,
                          }))
                        }
                        disabled={!isEditingRecruiting}
                        className={cn(
                          "transition-all duration-200",
                          isEditingRecruiting
                            ? "border-gray-600 bg-gray-800/50 text-white focus:border-pink-400 focus:ring-pink-400/20"
                            : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                        )}
                        placeholder="e.g., Sports teams, clubs, leadership roles, volunteer work"
                      />
                    </div>
                    <div className="group">
                      <Label
                        htmlFor="academic_bio"
                        className={cn(
                          "font-rajdhani mb-2 block font-medium",
                          isEditingRecruiting ? "text-white" : "text-gray-400",
                        )}
                      >
                        Academic & Gaming Bio
                      </Label>
                      <Textarea
                        id="academic_bio"
                        value={recruitingData.academic_bio}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setRecruitingData((prev) => ({
                            ...prev,
                            academic_bio: e.target.value,
                          }))
                        }
                        disabled={!isEditingRecruiting}
                        className={cn(
                          "min-h-[100px] transition-all duration-200",
                          isEditingRecruiting
                            ? "border-gray-600 bg-gray-800/50 text-white focus:border-pink-400 focus:ring-pink-400/20"
                            : "border-gray-700 bg-gray-800/30 text-gray-300 opacity-60",
                        )}
                        placeholder="Tell coaches about your academic achievements, gaming experience, leadership roles, and what makes you a great team player..."
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                {isEditingRecruiting && (
                  <div className="flex justify-end space-x-3 border-t border-gray-700/50 pt-6">
                    <Button
                      variant="outline"
                      onClick={handleRecruitingCancel}
                      className="border-gray-600 text-gray-300 transition-all duration-200 hover:border-gray-500 hover:bg-gray-700 hover:text-white"
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRecruitingSave}
                      disabled={
                        updateProfileMutation.isPending ||
                        !hasUnsavedRecruitingChanges
                      }
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transition-all duration-200 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SaveIcon className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Game Connections */}
            <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-orange-500/30">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron mb-2 text-xl font-bold text-white">
                    Game Connections
                  </h3>
                  <p className="font-rajdhani text-sm text-gray-400">
                    Connect your accounts from our 4 supported games
                  </p>
                </div>
                {!isEditingGameConnections && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 font-medium text-white hover:from-orange-600 hover:to-orange-700"
                    onClick={() => setIsEditingGameConnections(true)}
                    disabled={
                      updatePlatformMutation.isPending ||
                      updateOAuthMutation.isPending ||
                      removePlatformMutation.isPending
                    }
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Connect Game
                  </Button>
                )}
              </div>

              {/* Featured Games Grid - Show all 4 supported games prominently */}
              {!isEditingGameConnections && (
                <div className="mb-6">
                  <h4 className="font-rajdhani mb-3 text-sm font-semibold tracking-wide text-gray-300 uppercase">
                    Supported Games
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {gameConnectionsConfig.map((game) => {
                      const connection = gameConnections.find(
                        (conn) => conn.platform === game.platform,
                      );
                      const isConnected = connection?.connected ?? false;

                      return (
                        <div
                          key={game.platform}
                          className={cn(
                            "group relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                            isConnected
                              ? "border-green-500/50 bg-green-500/10 hover:border-green-400/70"
                              : "border-gray-600/50 bg-gray-800/30 hover:border-gray-500/70",
                          )}
                          onClick={() =>
                            !isConnected && setIsEditingGameConnections(true)
                          }
                        >
                          <div className="flex flex-col items-center text-center">
                            {/* Game Logo */}
                            <div className="mb-3 flex h-12 w-12 items-center justify-center">
                              {game.platform === "valorant" ? (
                                <Image
                                  src="/valorant/logos/Valorant Logo Red Border.jpg"
                                  alt="VALORANT Logo"
                                  width={48}
                                  height={48}
                                  className="object-contain"
                                />
                              ) : game.platform === "epicgames" ? (
                                <Image
                                  src="/rocket-league/logos/Rocket League Emblem.png"
                                  alt="Rocket League Logo"
                                  width={48}
                                  height={48}
                                  className="object-contain"
                                />
                              ) : game.platform === "battlenet" ? (
                                <Image
                                  src="/overwatch/logos/Overwatch 2 Primary Logo.png"
                                  alt="Overwatch 2 Logo"
                                  width={48}
                                  height={48}
                                  className="object-contain"
                                />
                              ) : game.platform === "startgg" ? (
                                <Image
                                  src="/smash/logos/Smash Ball White Logo.png"
                                  alt="Smash Bros Logo"
                                  width={48}
                                  height={48}
                                  className="object-contain"
                                />
                              ) : (
                                <div
                                  className={cn("rounded-lg p-3", game.color)}
                                >
                                  <game.icon className="h-6 w-6 text-white" />
                                </div>
                              )}
                            </div>

                            {/* Game Name */}
                            <h5 className="font-rajdhani mb-1 text-sm font-semibold text-white">
                              {game.displayName}
                            </h5>

                            {/* Connection Status */}
                            {isConnected ? (
                              <div className="flex items-center gap-1">
                                <CheckIcon className="h-3 w-3 text-green-400" />
                                <span className="text-xs font-medium text-green-400">
                                  Connected
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">
                                Not Connected
                              </span>
                            )}

                            {/* OAuth Badge */}
                            {game.requiresOAuth && (
                              <Badge
                                variant="outline"
                                className="mt-2 border-blue-400/50 text-xs text-blue-400"
                              >
                                OAuth
                              </Badge>
                            )}
                          </div>

                          {/* Connect Overlay */}
                          {!isConnected && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <Button
                                size="sm"
                                className="bg-white text-black hover:bg-gray-200"
                              >
                                <PlusIcon className="mr-1 h-3 w-3" />
                                Connect
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enhanced Connection Form - shown when editing */}
              {isEditingGameConnections && (
                <div className="mb-6 space-y-6 rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500/20 p-2">
                      <GamepadIcon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-orbitron text-lg font-semibold text-white">
                        Connect Game Account
                      </h4>
                      <p className="font-rajdhani text-sm text-gray-400">
                        Choose a game platform to connect your account
                      </p>
                    </div>
                  </div>

                  {connectionError && (
                    <div className="rounded-lg border border-red-600/30 bg-red-900/20 p-4">
                      <div className="flex items-center gap-2">
                        <XIcon className="h-4 w-4 text-red-400" />
                        <p className="text-sm font-medium text-red-400">
                          {connectionError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="font-rajdhani mb-3 block font-medium text-white">
                      Select Game Platform
                    </Label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {gameConnectionsConfig
                        .filter((config) => {
                          const isConnected = gameConnections.find(
                            (conn) => conn.platform === config.platform,
                          )?.connected;
                          return !isConnected;
                        })
                        .map((platform) => (
                          <Button
                            key={platform.platform}
                            variant={
                              selectedPlatform === platform.platform
                                ? "default"
                                : "outline"
                            }
                            className={cn(
                              "h-auto justify-start p-4 text-left transition-all duration-200",
                              selectedPlatform === platform.platform
                                ? "border-orange-400 bg-gradient-to-r from-orange-500 to-red-500 text-white"
                                : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50 hover:text-white",
                            )}
                            onClick={() =>
                              setSelectedPlatform(platform.platform)
                            }
                            disabled={
                              updatePlatformMutation.isPending ||
                              updateOAuthMutation.isPending
                            }
                          >
                            <div className="flex w-full items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
                                {platform.platform === "valorant" ? (
                                  <Image
                                    src="/valorant/logos/Valorant Logo Red Border.jpg"
                                    alt="VALORANT Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                  />
                                ) : platform.platform === "epicgames" ? (
                                  <Image
                                    src="/rocket-league/logos/Rocket League Emblem.png"
                                    alt="Rocket League Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                  />
                                ) : platform.platform === "battlenet" ? (
                                  <Image
                                    src="/overwatch/logos/Overwatch 2 Primary Logo.png"
                                    alt="Overwatch 2 Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                  />
                                ) : platform.platform === "startgg" ? (
                                  <Image
                                    src="/smash/logos/Smash Ball White Logo.png"
                                    alt="Smash Bros Logo"
                                    width={32}
                                    height={32}
                                    className="object-contain"
                                  />
                                ) : (
                                  <platform.icon className="h-6 w-6" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-rajdhani font-semibold">
                                  {platform.displayName}
                                </p>
                                <p className="text-xs opacity-70">
                                  {platform.requiresOAuth
                                    ? "OAuth Authentication"
                                    : "Manual Username"}
                                </p>
                              </div>
                              {platform.requiresOAuth && (
                                <Badge
                                  variant="outline"
                                  className="border-blue-400/50 text-xs text-blue-400"
                                >
                                  OAuth
                                </Badge>
                              )}
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                  {selectedPlatform && (
                    <div>
                      {gameConnectionsConfig.find(
                        (p) => p.platform === selectedPlatform,
                      )?.requiresOAuth ? (
                        // OAuth platform (like Valorant)
                        <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <ShieldIcon className="h-5 w-5 text-blue-400" />
                            <div>
                              <h4 className="font-medium text-white">
                                Secure Connection Required
                              </h4>
                              <p className="text-sm text-blue-300">
                                This platform uses OAuth for secure
                                authentication
                              </p>
                            </div>
                          </div>
                          {(() => {
                            const platformConfig = gameConnectionsConfig.find(
                              (p) => p.platform === selectedPlatform,
                            );
                            const hasRequiredOAuth =
                              user?.externalAccounts?.some((account) => {
                                if (selectedPlatform === "valorant") {
                                  return (
                                    account.provider.includes("valorant") ||
                                    account.provider === "custom_valorant"
                                  );
                                } else if (selectedPlatform === "epicgames") {
                                  return (
                                    account.provider.includes("epic_games") ||
                                    account.provider === "custom_epic_games"
                                  );
                                }
                                return false;
                              });

                            const getAccountTypeName = () => {
                              if (selectedPlatform === "valorant")
                                return "Valorant";
                              if (selectedPlatform === "epicgames")
                                return "Epic Games";
                              return "OAuth";
                            };

                            return !hasRequiredOAuth ? (
                              <div className="text-center">
                                <p className="mb-3 text-sm text-gray-300">
                                  You need to connect your{" "}
                                  {getAccountTypeName()} account first
                                </p>
                                <Button
                                  variant="outline"
                                  className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                                  onClick={() =>
                                    window.open(
                                      "profile/external-accounts",
                                      "_blank",
                                    )
                                  }
                                >
                                  <LinkIcon className="mr-2 h-4 w-4" />
                                  Connect {getAccountTypeName()} Account
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="mb-2 flex items-center justify-center gap-2 text-green-400">
                                  <CheckIcon className="h-4 w-4" />
                                  <span className="text-sm">
                                    {getAccountTypeName()} account connected
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">
                                  Click &quot;Connect Account&quot; to link your{" "}
                                  {selectedPlatform === "valorant"
                                    ? "Valorant"
                                    : "Rocket League"}{" "}
                                  profile
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        // Manual username entry
                        <div>
                          <Label
                            htmlFor="gameUsername"
                            className="font-rajdhani text-white"
                          >
                            Username
                          </Label>
                          <Input
                            id="gameUsername"
                            value={connectionUsername}
                            onChange={(e) =>
                              setConnectionUsername(e.target.value)
                            }
                            className="mt-1 border-gray-700 bg-gray-800 text-white"
                            placeholder="Enter your username"
                            disabled={updatePlatformMutation.isPending}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingGameConnections(false);
                        setSelectedPlatform("");
                        setConnectionUsername("");
                        setConnectionError("");
                      }}
                      className="border-gray-600 bg-white text-black hover:bg-gray-200"
                      disabled={
                        updatePlatformMutation.isPending ||
                        updateOAuthMutation.isPending
                      }
                    >
                      <XIcon className="mr-2 h-4 w-4 text-white" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleGameConnectionSave}
                      disabled={
                        updatePlatformMutation.isPending ||
                        updateOAuthMutation.isPending ||
                        !selectedPlatform ||
                        (gameConnectionsConfig.find(
                          (p) => p.platform === selectedPlatform,
                        )?.requiresOAuth
                          ? !user?.externalAccounts?.some((account) => {
                              const isValorant =
                                account.provider.includes("valorant") ||
                                account.provider === "custom_valorant";
                              const isEpicGames =
                                account.provider.includes("epic_games") ||
                                account.provider === "custom_epic_games";
                              const isStartGG =
                                account.provider.includes("start_gg") ||
                                account.provider === "custom_start_gg";
                              return isValorant || isEpicGames || isStartGG;
                            })
                          : !connectionUsername.trim())
                      }
                      className="bg-cyan-600 text-white hover:bg-cyan-700"
                    >
                      {updatePlatformMutation.isPending ||
                      updateOAuthMutation.isPending ? (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SaveIcon className="mr-2 h-4 w-4" />
                      )}
                      Connect Account
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {gameConnections.some((conn) => conn.connected) ? (
                  gameConnections
                    .filter((conn) => conn.connected)
                    .map((connection) => {
                      // Check if this is an OAuth connection
                      const isOAuthConnection =
                        connection.requiresOAuth &&
                        user?.externalAccounts?.some((account) => {
                          const isValorant =
                            (account.provider.includes("valorant") ||
                              account.provider === "custom_valorant") &&
                            account.verification?.status === "verified";
                          const isEpicGames =
                            (account.provider.includes("epic_games") ||
                              account.provider === "custom_epic_games") &&
                            account.verification?.status === "verified";
                          const isStartGG =
                            (account.provider.includes("start_gg") ||
                              account.provider === "custom_start_gg") &&
                            account.verification?.status === "verified";
                          return isValorant || isEpicGames || isStartGG;
                        });

                      return (
                        <div
                          key={connection.platform}
                          className="flex items-center justify-between rounded-lg bg-gray-800 p-3"
                        >
                          <div className="flex items-center gap-3">
                            {connection.platform === "valorant" ? (
                              <div className="flex h-10 w-10 items-center justify-center">
                                <Image
                                  src="/valorant/logos/Valorant Logo Red Border.jpg"
                                  alt="VALORANT Logo"
                                  width={28}
                                  height={28}
                                  className="object-contain"
                                />
                              </div>
                            ) : connection.platform === "epicgames" ? (
                              <div className="flex h-10 w-10 items-center justify-center">
                                <Image
                                  src="/rocket-league/logos/Rocket League Emblem.png"
                                  alt="Rocket League Logo"
                                  width={28}
                                  height={28}
                                  className="object-contain"
                                />
                              </div>
                            ) : (
                              <div
                                className={`rounded p-2 ${connection.color}`}
                              >
                                <connection.icon className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white">
                                  {connection.displayName}
                                </p>
                                {isOAuthConnection && (
                                  <Badge
                                    variant="outline"
                                    className="border-blue-400 text-xs text-blue-400"
                                  >
                                    OAuth
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-400">
                                {connection.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-green-600 text-white"
                            >
                              Connected
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-red-400"
                              onClick={() =>
                                disconnectAccount(connection.platform, "game")
                              }
                              disabled={removePlatformMutation.isPending}
                            >
                              {removePlatformMutation.isPending ? (
                                <LoaderIcon className="h-4 w-4 animate-spin" />
                              ) : (
                                <XIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-8 text-center">
                    <div className="mb-6">
                      <GamepadIcon className="mx-auto mb-3 h-12 w-12 text-gray-500" />
                      <h4 className="font-orbitron mb-2 font-semibold text-white">
                        No Connected Accounts
                      </h4>
                      <p className="text-sm text-gray-400">
                        Connect your gaming accounts to showcase your
                        achievements across our 4 supported games
                      </p>
                    </div>
                    {isLoadingProfile ? (
                      <LoaderIcon className="mx-auto h-5 w-5 animate-spin text-blue-400" />
                    ) : (
                      <Button
                        className="bg-gradient-to-r from-orange-500 to-orange-600 font-medium text-white hover:from-orange-600 hover:to-orange-700"
                        onClick={() => setIsEditingGameConnections(true)}
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Connect Your First Game
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Social Connections */}
            <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-pink-500/30">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="font-orbitron mb-2 text-xl font-bold text-white">
                    Social Connections
                  </h3>
                  <p className="font-rajdhani text-sm text-gray-400">
                    Build your personal brand across social platforms
                  </p>
                </div>
                {!isEditingSocialConnections && (
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-purple-600 font-medium text-white hover:from-pink-600 hover:to-purple-700"
                    onClick={() => setIsEditingSocialConnections(true)}
                    disabled={
                      updateSocialMutation.isPending ||
                      removeSocialMutation.isPending
                    }
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Connect Social
                  </Button>
                )}
              </div>

              {/* Social Platforms Overview */}
              {!isEditingSocialConnections && (
                <div className="mb-6">
                  <h4 className="font-rajdhani mb-3 text-sm font-semibold tracking-wide text-gray-300 uppercase">
                    Available Platforms
                  </h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {socialConnectionsConfig.map((social) => {
                      const connection = socialConnections.find(
                        (conn) => conn.platform === social.platform,
                      );
                      const isConnected = connection?.connected ?? false;

                      return (
                        <div
                          key={social.platform}
                          className={cn(
                            "group cursor-pointer rounded-lg border p-4 transition-all duration-200",
                            isConnected
                              ? "border-green-500/50 bg-green-500/10 hover:border-green-400/70"
                              : "border-gray-600/50 bg-gray-800/30 hover:border-gray-500/70",
                          )}
                          onClick={() =>
                            !isConnected && setIsEditingSocialConnections(true)
                          }
                        >
                          <div className="flex items-center gap-3">
                            {/* Platform Icon */}
                            <div
                              className={cn(
                                "rounded-lg p-2",
                                social.color,
                                "flex-shrink-0",
                              )}
                            >
                              {social.platform === "discord" &&
                              social.requiresOAuth ? (
                                <Image
                                  src="/discord/Discord-Symbol-White.svg"
                                  alt="Discord Logo"
                                  width={20}
                                  height={20}
                                  className="object-contain"
                                />
                              ) : (
                                <social.icon className="h-5 w-5 text-white" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h5 className="font-rajdhani text-sm font-semibold text-white">
                                  {social.displayName}
                                </h5>
                                {social.requiresOAuth && (
                                  <Badge
                                    variant="outline"
                                    className="border-blue-400/50 text-xs text-blue-400"
                                  >
                                    OAuth
                                  </Badge>
                                )}
                              </div>

                              {isConnected ? (
                                <div className="mt-1 flex items-center gap-1">
                                  <CheckIcon className="h-3 w-3 text-green-400" />
                                  <span className="text-xs font-medium text-green-400">
                                    Connected
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">
                                  Not Connected
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Connect Button */}
                          {!isConnected && (
                            <div className="mt-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-gray-600 text-xs text-gray-300 hover:border-gray-500"
                              >
                                <PlusIcon className="mr-1 h-3 w-3" />
                                Connect
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Enhanced Social Connection Form - shown when editing */}
              {isEditingSocialConnections && (
                <div className="mb-6 space-y-6 rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5 p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-pink-500/20 p-2">
                      <LinkIcon className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                      <h4 className="font-orbitron text-lg font-semibold text-white">
                        Connect Social Account
                      </h4>
                      <p className="font-rajdhani text-sm text-gray-400">
                        Connect your social media to build your personal brand
                      </p>
                    </div>
                  </div>

                  {connectionError && (
                    <div className="rounded-lg border border-red-600/30 bg-red-900/20 p-4">
                      <div className="flex items-center gap-2">
                        <XIcon className="h-4 w-4 text-red-400" />
                        <p className="text-sm font-medium text-red-400">
                          {connectionError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="font-rajdhani mb-3 block font-medium text-white">
                      Select Social Platform
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {socialConnectionsConfig
                        .filter((config) => {
                          const isConnected = socialConnections.find(
                            (conn) => conn.platform === config.platform,
                          )?.connected;
                          return !isConnected;
                        })
                        .map((platform) => (
                          <Button
                            key={platform.platform}
                            variant={
                              selectedPlatform === platform.platform
                                ? "default"
                                : "outline"
                            }
                            className={cn(
                              "h-auto justify-start p-4 text-left transition-all duration-200",
                              selectedPlatform === platform.platform
                                ? "border-pink-400 bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                                : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/50 hover:text-white",
                            )}
                            onClick={() =>
                              setSelectedPlatform(platform.platform)
                            }
                            disabled={updateSocialMutation.isPending}
                          >
                            <div className="flex w-full items-center gap-3">
                              <div
                                className={cn(
                                  "rounded-lg p-2",
                                  platform.color,
                                  "flex-shrink-0",
                                )}
                              >
                                {platform.platform === "discord" &&
                                platform.requiresOAuth ? (
                                  <Image
                                    src="/discord/Discord-Symbol-White.svg"
                                    alt="Discord Logo"
                                    width={20}
                                    height={20}
                                    className="object-contain"
                                  />
                                ) : (
                                  <platform.icon className="h-5 w-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-rajdhani font-semibold">
                                  {platform.displayName}
                                </p>
                                <p className="text-xs opacity-70">
                                  {platform.requiresOAuth
                                    ? "OAuth Authentication"
                                    : "Manual Username"}
                                </p>
                              </div>
                              {platform.requiresOAuth && (
                                <Badge
                                  variant="outline"
                                  className="border-blue-400/50 text-xs text-blue-400"
                                >
                                  OAuth
                                </Badge>
                              )}
                            </div>
                          </Button>
                        ))}
                    </div>
                  </div>
                  {selectedPlatform && (
                    <div>
                      {socialConnectionsConfig.find(
                        (p) => p.platform === selectedPlatform,
                      )?.requiresOAuth ? (
                        // OAuth platform (like Discord)
                        <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <ShieldIcon className="h-5 w-5 text-blue-400" />
                            <div>
                              <h4 className="font-medium text-white">
                                Secure Connection Required
                              </h4>
                              <p className="text-sm text-blue-300">
                                This platform uses OAuth for secure
                                authentication
                              </p>
                            </div>
                          </div>
                          {!user?.externalAccounts?.some(
                            (account) => account.provider === "discord",
                          ) ? (
                            <div className="text-center">
                              <p className="mb-3 text-sm text-gray-300">
                                You need to connect your Discord account first
                              </p>
                              <Button
                                variant="outline"
                                className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                                onClick={() =>
                                  window.open(
                                    "/dashboard/player/profile/external-accounts",
                                    "_blank",
                                  )
                                }
                              >
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Connect Discord Account
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="mb-2 flex items-center justify-center gap-2 text-green-400">
                                <CheckIcon className="h-4 w-4" />
                                <span className="text-sm">
                                  Discord account connected
                                </span>
                              </div>
                              <p className="text-sm text-gray-300">
                                Click &quot;Connect Account&quot; to link your
                                Discord profile
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Manual username entry
                        <div>
                          <Label
                            htmlFor="socialUsername"
                            className="font-rajdhani text-white"
                          >
                            Username
                          </Label>
                          <Input
                            id="socialUsername"
                            value={connectionUsername}
                            onChange={(e) =>
                              setConnectionUsername(e.target.value)
                            }
                            className="mt-1 border-gray-700 bg-gray-800 text-white"
                            placeholder="Enter your username"
                            disabled={updateSocialMutation.isPending}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingSocialConnections(false);
                        setSelectedPlatform("");
                        setConnectionUsername("");
                        setConnectionError("");
                      }}
                      className="border-gray-600 text-white hover:bg-gray-200"
                      disabled={updateSocialMutation.isPending}
                    >
                      <XIcon className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSocialConnectionSave}
                      disabled={
                        updateSocialMutation.isPending ||
                        !selectedPlatform ||
                        (socialConnectionsConfig.find(
                          (p) => p.platform === selectedPlatform,
                        )?.requiresOAuth
                          ? !user?.externalAccounts?.some(
                              (account) => account.provider === "discord",
                            )
                          : !connectionUsername.trim())
                      }
                      className="bg-cyan-600 text-white hover:bg-cyan-700"
                    >
                      {updateSocialMutation.isPending ? (
                        <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <SaveIcon className="mr-2 h-4 w-4" />
                      )}
                      Connect Account
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {socialConnections.some((conn) => conn.connected) ? (
                  socialConnections
                    .filter((conn) => conn.connected)
                    .map((connection) => (
                      <div
                        key={connection.platform}
                        className="flex items-center justify-between rounded-lg bg-gray-800 p-3"
                      >
                        <div className="flex items-center gap-3">
                          {connection.platform === "discord" &&
                          connection.requiresOAuth ? (
                            <div className="flex h-8 w-8 items-center justify-center">
                              <Image
                                src="/discord/Discord-Symbol-White.svg"
                                alt="Discord Logo"
                                width={20}
                                height={20}
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div className={`rounded p-2 ${connection.color}`}>
                              <connection.icon className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">
                                {connection.displayName}
                              </p>
                              {connection.requiresOAuth && (
                                <Badge
                                  variant="outline"
                                  className="border-blue-400 text-xs text-blue-400"
                                >
                                  OAuth
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              @{connection.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-green-600 text-white"
                          >
                            Connected
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-red-400"
                            onClick={() =>
                              disconnectAccount(connection.platform, "social")
                            }
                            disabled={removeSocialMutation.isPending}
                          >
                            {removeSocialMutation.isPending ? (
                              <LoaderIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <XIcon className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center">
                    <div className="mb-6">
                      <LinkIcon className="mx-auto mb-3 h-12 w-12 text-gray-500" />
                      <h4 className="font-orbitron mb-2 font-semibold text-white">
                        No Social Connections
                      </h4>
                      <p className="text-sm text-gray-400">
                        Connect your social media accounts to build your
                        personal brand and reach a wider audience
                      </p>
                    </div>
                    {isLoadingProfile ? (
                      <LoaderIcon className="mx-auto h-5 w-5 animate-spin text-blue-400" />
                    ) : (
                      <Button
                        className="bg-gradient-to-r from-pink-500 to-purple-600 font-medium text-white hover:from-pink-600 hover:to-purple-700"
                        onClick={() => setIsEditingSocialConnections(true)}
                      >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Connect Your First Social
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Profile Sidebar */}
          <div className="space-y-8">
            <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-purple-500/30">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Profile Progress
              </h3>
              <div className="space-y-4">
                {/* Completion Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Basic Information:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {hasBasicInfo ? "✓" : "○"}
                      </span>
                      <span className="text-blue-400">
                        {hasBasicInfo ? "20pts" : "0pts"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Recruiting Info:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {hasRecruitingInfo ? "✓" : "○"}
                      </span>
                      <span className="text-blue-400">
                        {hasRecruitingInfo ? "50pts" : "0pts"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Game Accounts:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {connectedGameAccounts}/5 ({gameConnectionsForProgress}
                        /2 count)
                      </span>
                      <span className="text-blue-400">
                        {gameConnectionsForProgress * 10}pts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Social Accounts:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {connectedSocialAccounts}/5 (
                        {socialConnectionsForProgress}/1 count)
                      </span>
                      <span className="text-blue-400">
                        {socialConnectionsForProgress * 20}pts
                      </span>
                    </div>
                  </div>

                  {/* Progress Tips */}
                  {profileCompletion < 100 && (
                    <div className="mt-4 rounded-lg border border-blue-600/30 bg-blue-900/20 p-3">
                      <p className="text-xs text-blue-400">
                        <strong>Tip:</strong>{" "}
                        {!hasBasicInfo
                          ? "Complete your basic information first!"
                          : !hasRecruitingInfo
                            ? "Add recruiting info to help scouts find you!"
                            : gameConnectionsForProgress < 2
                              ? "Connect at least 2 gaming accounts to showcase your skills!"
                              : socialConnectionsForProgress < 1
                                ? "Connect at least 1 social account to build your brand!"
                                : "Great job! Your profile is complete!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border-gray-700/50 bg-[#1a1a2e]/80 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-green-500/30">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-800"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <EditIcon className="mr-2 h-4 w-4" />
                  Edit Basic Info
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-800"
                  onClick={() => setIsEditingGameConnections(true)}
                >
                  <GamepadIcon className="mr-2 h-4 w-4" />
                  Connect Game Account
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-300 hover:bg-gray-800"
                  onClick={() => setIsEditingSocialConnections(true)}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Connect Social Media
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
