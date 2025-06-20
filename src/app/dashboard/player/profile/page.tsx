"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GamepadIcon,
  LinkIcon,
  EditIcon,
  XIcon,
  InstagramIcon,
  TwitchIcon,
  TwitterIcon,
  MonitorIcon,
  PlusIcon,
  MessageCircleIcon,
  GithubIcon,
  LoaderIcon,
  SaveIcon,
  CheckIcon,
  UserIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import { neobrutalism } from "@clerk/themes";
import { cn } from "@/lib/utils";

// Types for connections
interface GameConnection {
  platform: string;
  username: string;
  connected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  displayName: string;
  color: string;
}

interface SocialConnection {
  platform: string;
  username: string;
  connected: boolean;
  icon: React.ComponentType<{ className?: string }>;
  displayName: string;
  color: string;
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
    refetch: refetchProfile 
  } = api.playerProfile.getProfile.useQuery();

  const { 
    data: availableGames, 
    isLoading: isLoadingGames 
  } = api.playerProfile.getAvailableGames.useQuery();
  
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
    }
  });

  // Connection mutations
  const updatePlatformMutation = api.playerProfile.updatePlatformConnection.useMutation({
    onSuccess: () => {
      void refetchProfile();
      setConnectionUsername("");
      setSelectedPlatform("");
      setConnectionError("");
      setIsEditingGameConnections(false);
    },
    onError: (error) => {
      setConnectionError(error.message);
    }
  });

  const updateSocialMutation = api.playerProfile.updateSocialConnection.useMutation({
    onSuccess: () => {
      void refetchProfile();
      setConnectionUsername("");
      setSelectedPlatform("");
      setConnectionError("");
      setIsEditingSocialConnections(false);
    },
    onError: (error) => {
      setConnectionError(error.message);
    }
  });

  const removePlatformMutation = api.playerProfile.removePlatformConnection.useMutation({
    onSuccess: () => {
      void refetchProfile();
    },
    onError: (error) => {
      setConnectionError(error.message);
    }
  });

  const removeSocialMutation = api.playerProfile.removeSocialConnection.useMutation({
    onSuccess: () => {
      void refetchProfile();
    },
    onError: (error) => {
      setConnectionError(error.message);
    }
  });
  
  // Editing states for each panel
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingRecruiting, setIsEditingRecruiting] = useState(false);
  const [isEditingGameConnections, setIsEditingGameConnections] = useState(false);
  const [isEditingSocialConnections, setIsEditingSocialConnections] = useState(false);
  
  // Connection state
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [connectionUsername, setConnectionUsername] = useState("");

  // Unsaved changes tracking
  const [hasUnsavedProfileChanges, setHasUnsavedProfileChanges] = useState(false);
  const [hasUnsavedRecruitingChanges, setHasUnsavedRecruitingChanges] = useState(false);

  // Validation state
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [recruitingErrors, setRecruitingErrors] = useState<ValidationErrors>({});
  const [connectionError, setConnectionError] = useState("");

  // Editable profile data state (only location and bio)
  const [editableProfileData, setEditableProfileData] = useState<ProfileData>({
    location: "",
    bio: ""
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
    academic_bio: ""
  });

  // Update editable data when profile data loads
  useEffect(() => {
    if (profileData) {
      setEditableProfileData({
        location: profileData.location ?? "",
        bio: profileData.bio ?? ""
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
        academic_bio: profileData.academic_bio ?? ""
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
        recruitingData.scholastic_contact !== (profileData.scholastic_contact ?? "") ||
        recruitingData.scholastic_contact_email !== (profileData.scholastic_contact_email ?? "") ||
        recruitingData.guardian_email !== (profileData.guardian_email ?? "") ||
        recruitingData.gpa !== (profileData.gpa?.toString() ?? "") ||
        recruitingData.graduation_date !== (profileData.graduation_date ?? "") ||
        recruitingData.intended_major !== (profileData.intended_major ?? "") ||
        recruitingData.extra_curriculars !== (profileData.extra_curriculars ?? "") ||
        recruitingData.academic_bio !== (profileData.academic_bio ?? "");
      setHasUnsavedRecruitingChanges(hasChanges);
    }
  }, [recruitingData, profileData]);

  // Game connections configurations
  const gameConnectionsConfig: GameConnection[] = [
    {
      platform: "steam",
      username: "",
      connected: false,
      icon: MonitorIcon,
      displayName: "Steam",
      color: "bg-blue-600"
    },
    {
      platform: "valorant",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "VALORANT",
      color: "bg-red-600"
    },
    {
      platform: "battlenet",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Battle.net",
      color: "bg-blue-500"
    },
    {
      platform: "epicgames",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "Epic Games",
      color: "bg-gray-600"
    },
    {
      platform: "startgg",
      username: "",
      connected: false,
      icon: GamepadIcon,
      displayName: "start.gg",
      color: "bg-purple-600"
    }
  ];

  // Social connections configurations
  const socialConnectionsConfig: SocialConnection[] = [
    {
      platform: "github",
      username: "",
      connected: false,
      icon: GithubIcon,
      displayName: "GitHub",
      color: "bg-gray-800"
    },
    {
      platform: "discord",
      username: "",
      connected: false,
      icon: MessageCircleIcon,
      displayName: "Discord",
      color: "bg-indigo-600"
    },
    {
      platform: "instagram",
      username: "",
      connected: false,
      icon: InstagramIcon,
      displayName: "Instagram",
      color: "bg-pink-600"
    },
    {
      platform: "twitch",
      username: "",
      connected: false,
      icon: TwitchIcon,
      displayName: "Twitch",
      color: "bg-purple-600"
    },
    {
      platform: "x",
      username: "",
      connected: false,
      icon: TwitterIcon,
      displayName: "X (Twitter)",
      color: "bg-gray-900"
    }
  ];

  // Create connection arrays from database data and config
  const gameConnections = gameConnectionsConfig.map(config => {
    const dbConnection = profileData?.platform_connections?.find(conn => conn.platform === config.platform);
    return {
      ...config,
      username: dbConnection?.username ?? "",
      connected: dbConnection?.connected ?? false
    };
  });

  const socialConnections = socialConnectionsConfig.map(config => {
    const dbConnection = profileData?.social_connections?.find(conn => conn.platform === config.platform);
    return {
      ...config,
      username: dbConnection?.username ?? "",
      connected: dbConnection?.connected ?? false
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
    return !isNaN(yearNum) && yearNum >= currentYear && yearNum <= currentYear + 10;
  };

  const validateProfileData = (): boolean => {
    const errors: ValidationErrors = {};

    if (editableProfileData.location && editableProfileData.location.length < 2) {
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

    if (recruitingData.scholastic_contact_email && !validateEmail(recruitingData.scholastic_contact_email)) {
      errors.scholastic_contact_email = "Please enter a valid email address";
    }

    if (recruitingData.guardian_email && !validateEmail(recruitingData.guardian_email)) {
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
    if (!validateConnection()) return;
    
    updatePlatformMutation.mutate({
      platform: selectedPlatform as "steam" | "valorant" | "battlenet" | "epicgames" | "startgg",
      username: connectionUsername.trim()
    });
  };

  const handleSocialConnectionSave = () => {
    if (!validateConnection()) return;
    
    updateSocialMutation.mutate({
      platform: selectedPlatform as "github" | "discord" | "instagram" | "twitch" | "x",
      username: connectionUsername.trim()
    });
  };

  const disconnectAccount = (platform: string, type: 'game' | 'social') => {
    if (type === 'game') {
      removePlatformMutation.mutate({
        platform: platform as "steam" | "valorant" | "battlenet" | "epicgames" | "startgg"
      });
    } else {
      removeSocialMutation.mutate({
        platform: platform as "github" | "discord" | "instagram" | "twitch" | "x"
      });
    }
  };

  const handleProfileSave = () => {
    if (!validateProfileData()) return;
    
    updateProfileMutation.mutate({
      location: editableProfileData.location,
      bio: editableProfileData.bio
    });
  };

  const handleRecruitingSave = () => {
    if (!validateRecruitingData()) return;
    
    // Convert GPA to number if provided
    const gpaNumber = recruitingData.gpa ? parseFloat(recruitingData.gpa) : undefined;
    
    updateProfileMutation.mutate({
      school: recruitingData.school || undefined,
      class_year: recruitingData.class_year || undefined,
      main_game_id: recruitingData.main_game_id || undefined,
      scholastic_contact: recruitingData.scholastic_contact || undefined,
      scholastic_contact_email: recruitingData.scholastic_contact_email || undefined,
      guardian_email: recruitingData.guardian_email || undefined,
      gpa: gpaNumber,
      graduation_date: recruitingData.graduation_date || undefined,
      intended_major: recruitingData.intended_major || undefined,
      extra_curriculars: recruitingData.extra_curriculars || undefined,
      academic_bio: recruitingData.academic_bio || undefined
    });
  };

  const handleProfileCancel = () => {
    if (profileData) {
      setEditableProfileData({
        location: profileData.location ?? "",
        bio: profileData.bio ?? ""
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
        academic_bio: profileData.academic_bio ?? ""
      });
    }
    setIsEditingRecruiting(false);
    setHasUnsavedRecruitingChanges(false);
    setRecruitingErrors({});
  };

  const connectedGameAccounts = gameConnections.filter(conn => conn.connected).length;
  const connectedSocialAccounts = socialConnections.filter(conn => conn.connected).length;
  const hasBasicInfo = !!(editableProfileData.location || editableProfileData.bio);
  const hasRecruitingInfo = !!(recruitingData.school || recruitingData.main_game_id || recruitingData.gpa || recruitingData.extra_curriculars || recruitingData.academic_bio);
  
  // Cap game connections at 2 and social connections at 1 for progress calculation
  const gameConnectionsForProgress = Math.min(connectedGameAccounts, 2);
  const socialConnectionsForProgress = Math.min(connectedSocialAccounts, 1);
  
  const profileCompletion = Math.min(
    (hasBasicInfo ? 20 : 0) + 
    (hasRecruitingInfo ? 50 : 0) + 
    (gameConnectionsForProgress * 10) + 
    (socialConnectionsForProgress * 20), 
    100
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            Profile
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your gaming profile and recruitment information
          </p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white">Basic Information</h3>
                {hasUnsavedProfileChanges && (
                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                    Unsaved Changes
                  </Badge>
                )}
              </div>
              {!isEditingProfile && (
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsEditingProfile(true)}
                  disabled={isLoadingProfile || updateProfileMutation.isPending}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
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
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                <p className="text-red-400">Failed to load profile: {profileError.message}</p>
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
              <div className="space-y-4">
                {user || editableProfileData.location || editableProfileData.bio ? (
                  <div className="space-y-4">
                    {/* Profile Image */}
                    <div className="flex justify-center">
                      <UserButton 
                        appearance={{
                          baseTheme: neobrutalism,
                          elements: {
                            avatarBox: "profile-avatar-large",
                            //userButtonPopoverCard: "bg-[#1a1a2e] border-gray-800 p-5",
                            userButtonPopoverActions: "text-white"
                          }
                        }}
                      />
                    </div>
                    
                    {/* Horizontal Separator */}
                    <div className="border-t border-gray-700"></div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Clerk-managed fields (read-only) */}
                      {user?.firstName && user?.lastName && (
                        <div>
                          <Label className="text-gray-400 font-rajdhani">Real Name</Label>
                          <p className="text-white">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500 mt-1">Managed by account settings</p>
                        </div>
                      )}
                      {user?.username && (
                        <div>
                          <Label className="text-gray-400 font-rajdhani">Username</Label>
                          <p className="text-white">{user.username}</p>
                          <p className="text-xs text-gray-500 mt-1">Managed by account settings</p>
                        </div>
                      )}
                      {user?.emailAddresses[0]?.emailAddress && (
                        <div>
                          <Label className="text-gray-400 font-rajdhani">Email</Label>
                          <p className="text-white">{user.emailAddresses[0].emailAddress}</p>
                          <p className="text-xs text-gray-500 mt-1">Managed by account settings</p>
                        </div>
                      )}
                      
                      {                      /* Editable fields */}
                      {isEditingProfile ? (
                        <>
                          <div>
                            <Label htmlFor="location" className="text-white font-rajdhani">Location</Label>
                            <Input
                              id="location"
                              value={editableProfileData.location}
                              onChange={(e) => setEditableProfileData(prev => ({ ...prev, location: e.target.value }))}
                              className="bg-gray-800 border-gray-700 text-white mt-1"
                              placeholder="City, State"
                            />
                            {profileErrors.location && (
                              <p className="text-red-400 text-sm mt-1">{profileErrors.location}</p>
                            )}
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="bio" className="text-white font-rajdhani">Bio</Label>
                            <Input
                              id="bio"
                              value={editableProfileData.bio}
                              onChange={(e) => setEditableProfileData(prev => ({ ...prev, bio: e.target.value }))}
                              className="bg-gray-800 border-gray-700 text-white mt-1"
                              placeholder="Tell us about yourself..."
                            />
                            {profileErrors.bio && (
                              <p className="text-red-400 text-sm mt-1">{profileErrors.bio}</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          {editableProfileData.location && (
                            <div>
                              <Label className="text-gray-400 font-rajdhani">Location</Label>
                              <p className="text-white">{editableProfileData.location}</p>
                            </div>
                          )}
                          {editableProfileData.bio && (
                            <div className="md:col-span-2">
                              <Label className="text-gray-400 font-rajdhani">Bio</Label>
                              <p className="text-white">{editableProfileData.bio}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isEditingProfile && (
                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                        <Button
                          variant="outline"
                          onClick={handleProfileCancel}
                          className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                          <XIcon className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleProfileSave}
                          disabled={updateProfileMutation.isPending || !hasUnsavedProfileChanges}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          {updateProfileMutation.isPending ? (
                            <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <SaveIcon className="w-4 h-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">Complete your basic profile information to get started.</p>
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
                  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{profileErrors.general}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Recruiting Information */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">Recruiting Information</h3>
                  <p className="text-sm text-gray-400 mt-1">Private information for college recruiters only</p>
                </div>
                {hasUnsavedRecruitingChanges && (
                  <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
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
                  disabled={isLoadingProfile || updateProfileMutation.isPending}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {recruitingErrors.general && (
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{recruitingErrors.general}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>School</Label>
                  <Input
                    id="school"
                    value={recruitingData.school}
                    onChange={(e) => setRecruitingData(prev => ({ ...prev, school: e.target.value }))}
                    disabled={!isEditingRecruiting}
                    className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <Label htmlFor="class" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Graduation Year</Label>
                  <Input
                    id="class"
                    value={recruitingData.class_year}
                    onChange={(e) => setRecruitingData(prev => ({ ...prev, class_year: e.target.value }))}
                    disabled={!isEditingRecruiting}
                    className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                    placeholder="2025"
                  />
                  {recruitingErrors.class_year && (
                    <p className="text-red-400 text-sm mt-1">{recruitingErrors.class_year}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mainGame" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Main Game</Label>
                  <Select 
                    value={recruitingData.main_game_id} 
                    onValueChange={(value) => setRecruitingData(prev => ({ ...prev, main_game_id: value }))}
                    disabled={isLoadingGames || !isEditingRecruiting}
                  >
                    <SelectTrigger className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}>
                      <SelectValue placeholder={isLoadingGames ? "Loading games..." : "Select your main game"} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {availableGames?.map((game) => (
                        <SelectItem key={game.id} value={game.id} className="text-white hover:bg-gray-700">
                          {game.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gpa" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>GPA</Label>
                  <Input
                    id="gpa"
                    value={recruitingData.gpa}
                    onChange={(e) => setRecruitingData(prev => ({ ...prev, gpa: e.target.value }))}
                    disabled={!isEditingRecruiting}
                    className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                    placeholder="3.5"
                  />
                  {recruitingErrors.gpa && (
                    <p className="text-red-400 text-sm mt-1">{recruitingErrors.gpa}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="intended_major" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Intended Major</Label>
                <Input
                  id="intended_major"
                  value={recruitingData.intended_major}
                  onChange={(e) => setRecruitingData(prev => ({ ...prev, intended_major: e.target.value }))}
                  disabled={!isEditingRecruiting}
                  className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                  placeholder="Computer Science, Business, etc."
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scholastic_contact" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Scholastic Contact</Label>
                    <Input
                      id="scholastic_contact"
                      value={recruitingData.scholastic_contact}
                      onChange={(e) => setRecruitingData(prev => ({ ...prev, scholastic_contact: e.target.value }))}
                      disabled={!isEditingRecruiting}
                      className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                      placeholder="Guidance Counselor or Teacher Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scholastic_contact_email" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Scholastic Contact Email</Label>
                    <Input
                      id="scholastic_contact_email"
                      type="email"
                      value={recruitingData.scholastic_contact_email}
                      onChange={(e) => setRecruitingData(prev => ({ ...prev, scholastic_contact_email: e.target.value }))}
                      disabled={!isEditingRecruiting}
                      className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                      placeholder="counselor@school.edu"
                    />
                    {recruitingErrors.scholastic_contact_email && (
                      <p className="text-red-400 text-sm mt-1">{recruitingErrors.scholastic_contact_email}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="guardian_email" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Parent/Guardian Email</Label>
                  <Input
                    id="guardian_email"
                    type="email"
                    value={recruitingData.guardian_email}
                    onChange={(e) => setRecruitingData(prev => ({ ...prev, guardian_email: e.target.value }))}
                    disabled={!isEditingRecruiting}
                    className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                    placeholder="parent@email.com"
                  />
                  {recruitingErrors.guardian_email && (
                    <p className="text-red-400 text-sm mt-1">{recruitingErrors.guardian_email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold text-white">Additional Information</h4>
                <div>
                  <Label htmlFor="extra_curriculars" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Extra Curriculars</Label>
                  <Input
                    id="extra_curriculars"
                    value={recruitingData.extra_curriculars}
                    onChange={(e) => setRecruitingData(prev => ({ ...prev, extra_curriculars: e.target.value }))}
                    disabled={!isEditingRecruiting}
                    className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                    placeholder="Sports, clubs, leadership roles, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="academic_bio" className={cn("font-rajdhani pb-2", isEditingRecruiting ? "text-white" : "text-gray-400")}>Academic Bio</Label>
                  <Input
                    id="academic_bio"
                    value={recruitingData.academic_bio}
                    onChange={(e) => setRecruitingData(prev => ({ ...prev, academic_bio: e.target.value }))}
                    disabled={!isEditingRecruiting}
                    className={cn("bg-gray-800 border-gray-700 text-white", !isEditingRecruiting && "opacity-60")}
                    placeholder="Academic achievements, honors, awards..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              {isEditingRecruiting && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handleRecruitingCancel}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRecruitingSave}
                    disabled={updateProfileMutation.isPending || !hasUnsavedRecruitingChanges}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {updateProfileMutation.isPending ? (
                      <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SaveIcon className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Game Connections */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Game Connections</h3>
              {!isEditingGameConnections && (
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsEditingGameConnections(true)}
                  disabled={updatePlatformMutation.isPending || removePlatformMutation.isPending}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Connect Account
                </Button>
              )}
            </div>

            {/* Connection Form - shown when editing */}
            {isEditingGameConnections && (
              <div className="space-y-4 mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-md font-semibold text-white">Connect Game Account</h4>
                {connectionError && (
                  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{connectionError}</p>
                  </div>
                )}
                <div>
                  <Label className="text-white font-rajdhani mb-2 block">Select Platform</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {gameConnectionsConfig.filter(config => {
                      const isConnected = gameConnections.find(conn => conn.platform === config.platform)?.connected;
                      return !isConnected;
                    }).map((platform) => (
                      <Button
                        key={platform.platform}
                        variant={selectedPlatform === platform.platform ? "default" : "outline"}
                        className={`text-white justify-start bg-slate-800 ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
                        onClick={() => setSelectedPlatform(platform.platform)}
                        disabled={updatePlatformMutation.isPending}
                      >
                        <platform.icon className="h-4 w-4 mr-2 text-white" />
                        {platform.displayName}
                      </Button>
                    ))}
                  </div>
                </div>
                {selectedPlatform && (
                  <div>
                    <Label htmlFor="gameUsername" className="text-white font-rajdhani">Username</Label>
                    <Input
                      id="gameUsername"
                      value={connectionUsername}
                      onChange={(e) => setConnectionUsername(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="Enter your username"
                      disabled={updatePlatformMutation.isPending}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingGameConnections(false);
                      setSelectedPlatform("");
                      setConnectionUsername("");
                      setConnectionError("");
                    }}
                    className="border-gray-600 text-black hover:bg-gray-200"
                    disabled={updatePlatformMutation.isPending}
                  >
                    <XIcon className="w-4 h-4 mr-2 text-black" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGameConnectionSave}
                    disabled={updatePlatformMutation.isPending || !selectedPlatform || !connectionUsername.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {updatePlatformMutation.isPending ? (
                      <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SaveIcon className="w-4 h-4 mr-2" />
                    )}
                    Connect Account
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {gameConnections.some(conn => conn.connected) ? (
                gameConnections.filter(conn => conn.connected).map((connection) => (
                  <div key={connection.platform} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${connection.color}`}>
                        <connection.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{connection.displayName}</p>
                        <p className="text-gray-400 text-sm">{connection.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        Connected
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-400"
                        onClick={() => disconnectAccount(connection.platform, 'game')}
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
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    No game accounts connected yet. Connect your accounts to showcase your gaming achievements.
                  </p>
                  {isLoadingProfile ? (
                    <LoaderIcon className="h-5 w-5 animate-spin text-blue-400 mx-auto" />
                  ) : (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsEditingGameConnections(true)}
                    >
                      Connect Your First Account
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Social Connections */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Social Connections</h3>
              {!isEditingSocialConnections && (
                <Button 
                  size="sm" 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsEditingSocialConnections(true)}
                  disabled={updateSocialMutation.isPending || removeSocialMutation.isPending}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Connect Social
                </Button>
              )}
            </div>

            {/* Connection Form - shown when editing */}
            {isEditingSocialConnections && (
              <div className="space-y-4 mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h4 className="text-md font-semibold text-white">Connect Social Account</h4>
                {connectionError && (
                  <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{connectionError}</p>
                  </div>
                )}
                <div>
                  <Label className="text-white font-rajdhani mb-2 block">Select Platform</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {socialConnectionsConfig.filter(config => {
                      const isConnected = socialConnections.find(conn => conn.platform === config.platform)?.connected;
                      return !isConnected;
                    }).map((platform) => (
                      <Button
                        key={platform.platform}
                        variant={selectedPlatform === platform.platform ? "default" : "outline"}
                        className={`text-white justify-start bg-slate-800 ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
                        onClick={() => setSelectedPlatform(platform.platform)}
                        disabled={updateSocialMutation.isPending}
                      >
                        <platform.icon className="h-4 w-4 mr-2 text-white" />
                        {platform.displayName}
                      </Button>
                    ))}
                  </div>
                </div>
                {selectedPlatform && (
                  <div>
                    <Label htmlFor="socialUsername" className="text-white font-rajdhani">Username</Label>
                    <Input
                      id="socialUsername"
                      value={connectionUsername}
                      onChange={(e) => setConnectionUsername(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      placeholder="Enter your username"
                      disabled={updateSocialMutation.isPending}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingSocialConnections(false);
                      setSelectedPlatform("");
                      setConnectionUsername("");
                      setConnectionError("");
                    }}
                    className="border-gray-600 text-black hover:bg-gray-200"
                    disabled={updateSocialMutation.isPending}
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSocialConnectionSave}
                    disabled={updateSocialMutation.isPending || !selectedPlatform || !connectionUsername.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {updateSocialMutation.isPending ? (
                      <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SaveIcon className="w-4 h-4 mr-2" />
                    )}
                    Connect Account
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {socialConnections.some(conn => conn.connected) ? (
                socialConnections.filter(conn => conn.connected).map((connection) => (
                  <div key={connection.platform} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${connection.color}`}>
                        <connection.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{connection.displayName}</p>
                        <p className="text-gray-400 text-sm">@{connection.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        Connected
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-400"
                        onClick={() => disconnectAccount(connection.platform, 'social')}
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
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    No social accounts connected yet. Connect your social media to build your personal brand.
                  </p>
                  {isLoadingProfile ? (
                    <LoaderIcon className="h-5 w-5 animate-spin text-blue-400 mx-auto" />
                  ) : (
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsEditingSocialConnections(true)}
                    >
                      Connect Your First Account
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-6">
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Profile Completion</h3>
            <div className="space-y-4">
              {/* Circular Progress */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgb(55, 65, 81)"
                      strokeWidth="8"
                      fill="none"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgb(59, 130, 246)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - profileCompletion / 100)}`}
                      className="transition-all duration-500 ease-in-out"
                    />
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{profileCompletion}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center">Profile Complete</p>
              </div>
              
              {/* Completion Breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Basic Information:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">{hasBasicInfo ? '✓' : '○'}</span>
                    <span className="text-blue-400">{hasBasicInfo ? '20pts' : '0pts'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Recruiting Info:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">{hasRecruitingInfo ? '✓' : '○'}</span>
                    <span className="text-blue-400">{hasRecruitingInfo ? '50pts' : '0pts'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Game Accounts:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">{connectedGameAccounts}/5 ({gameConnectionsForProgress}/2 count)</span>
                    <span className="text-blue-400">{gameConnectionsForProgress * 10}pts</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Social Accounts:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white">{connectedSocialAccounts}/5 ({socialConnectionsForProgress}/1 count)</span>
                    <span className="text-blue-400">{socialConnectionsForProgress * 20}pts</span>
                  </div>
                </div>
                
                {/* Progress Tips */}
                {profileCompletion < 100 && (
                  <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <p className="text-blue-400 text-xs">
                      <strong>Tip:</strong> {
                        !hasBasicInfo ? "Complete your basic information first!" :
                        !hasRecruitingInfo ? "Add recruiting info to help scouts find you!" :
                        gameConnectionsForProgress < 2 ? "Connect at least 2 gaming accounts to showcase your skills!" :
                        socialConnectionsForProgress < 1 ? "Connect at least 1 social account to build your brand!" :
                        "Great job! Your profile is complete!"
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
                onClick={() => setIsEditingProfile(true)}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit Basic Info
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
                onClick={() => setIsEditingGameConnections(true)}
              >
                <GamepadIcon className="h-4 w-4 mr-2" />
                Connect Game Account
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
                onClick={() => setIsEditingSocialConnections(true)}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                Connect Social Media
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 