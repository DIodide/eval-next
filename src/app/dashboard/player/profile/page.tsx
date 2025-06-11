"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
  LoaderIcon
} from "lucide-react";
import { api } from "@/trpc/react";

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
      setEditProfileOpen(false);
      setEditRecruitingOpen(false);
      setProfileErrors({});
      setRecruitingErrors({});
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
      setEditGameConnectionOpen(false);
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
      setEditSocialConnectionOpen(false);
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
  
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editRecruitingOpen, setEditRecruitingOpen] = useState(false);
  const [editGameConnectionOpen, setEditGameConnectionOpen] = useState(false);
  const [editSocialConnectionOpen, setEditSocialConnectionOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [connectionUsername, setConnectionUsername] = useState("");

  // Validation state
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [recruitingErrors, setRecruitingErrors] = useState<ValidationErrors>({});
  const [connectionError, setConnectionError] = useState("");

  // Editable profile data state (only location and bio)
  const [editableProfileData, setEditableProfileData] = useState<ProfileData>({
    location: "",
    bio: ""
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
              <h3 className="text-lg font-semibold text-white">Basic Information</h3>
              <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoadingProfile || updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <EditIcon className="h-4 w-4 mr-2" />
                    )}
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Update your profile information (Real name, username, and email are managed by your account settings)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {profileErrors.general && (
                      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{profileErrors.general}</p>
                      </div>
                    )}
                    <div>
                      <Label htmlFor="location" className="font-rajdhani pb-2">Location</Label>
                      <Input
                        id="location"
                        value={editableProfileData.location}
                        onChange={(e) => setEditableProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="City, State"
                      />
                      {profileErrors.location && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.location}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="bio" className="font-rajdhani pb-2">Bio</Label>
                      <Input
                        id="bio"
                        value={editableProfileData.bio}
                        onChange={(e) => setEditableProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Tell us about yourself..."
                      />
                      {profileErrors.bio && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.bio}</p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="text-black border-gray-600" onClick={() => setEditProfileOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleProfileSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
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
                    
                    {/* Editable fields */}
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
                  </div>
                ) : (
                  <p className="text-gray-400">
                    Complete your basic profile information to get started.
                  </p>
                )}
              </div>
            )}
          </Card>

          {/* Recruiting Information */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Recruiting Information</h3>
                <p className="text-sm text-gray-400 mt-1">Private information for college recruiters only</p>
              </div>
              <Dialog open={editRecruitingOpen} onOpenChange={setEditRecruitingOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-gray-600 text-black hover:bg-gray-200"
                    disabled={isLoadingProfile || updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <EditIcon className="h-4 w-4 mr-2" />
                    )}
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Edit Recruiting Information</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Private information for college recruiters - not visible on public profile
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                    {recruitingErrors.general && (
                      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{recruitingErrors.general}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="school" className="font-rajdhani pb-2">School</Label>
                        <Input
                          id="school"
                          value={recruitingData.school}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, school: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="University Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="class" className="font-rajdhani pb-2">Graduation Year</Label>
                        <Input
                          id="class"
                          value={recruitingData.class_year}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, class_year: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="2025"
                        />
                        {recruitingErrors.class_year && (
                          <p className="text-red-400 text-sm mt-1">{recruitingErrors.class_year}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mainGame" className="font-rajdhani pb-2">Main Game</Label>
                        <Select 
                          value={recruitingData.main_game_id} 
                          onValueChange={(value) => setRecruitingData(prev => ({ ...prev, main_game_id: value }))}
                          disabled={isLoadingGames}
                        >
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
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
                        <Label htmlFor="gpa" className="font-rajdhani pb-2">GPA</Label>
                        <Input
                          id="gpa"
                          value={recruitingData.gpa}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, gpa: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="3.5"
                        />
                        {recruitingErrors.gpa && (
                          <p className="text-red-400 text-sm mt-1">{recruitingErrors.gpa}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="intended_major" className="font-rajdhani pb-2">Intended Major</Label>
                      <Input
                        id="intended_major"
                        value={recruitingData.intended_major}
                        onChange={(e) => setRecruitingData(prev => ({ ...prev, intended_major: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Computer Science, Business, etc."
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-white">Contact Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="scholastic_contact" className="font-rajdhani pb-2">Scholastic Contact</Label>
                          <Input
                            id="scholastic_contact"
                            value={recruitingData.scholastic_contact}
                            onChange={(e) => setRecruitingData(prev => ({ ...prev, scholastic_contact: e.target.value }))}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="Guidance Counselor or Teacher Name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="scholastic_contact_email" className="font-rajdhani pb-2">Scholastic Contact Email</Label>
                          <Input
                            id="scholastic_contact_email"
                            type="email"
                            value={recruitingData.scholastic_contact_email}
                            onChange={(e) => setRecruitingData(prev => ({ ...prev, scholastic_contact_email: e.target.value }))}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="counselor@school.edu"
                          />
                          {recruitingErrors.scholastic_contact_email && (
                            <p className="text-red-400 text-sm mt-1">{recruitingErrors.scholastic_contact_email}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="guardian_email" className="font-rajdhani pb-2">Parent/Guardian Email</Label>
                        <Input
                          id="guardian_email"
                          type="email"
                          value={recruitingData.guardian_email}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, guardian_email: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
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
                        <Label htmlFor="extra_curriculars" className="font-rajdhani pb-2">Extra Curriculars</Label>
                        <Input
                          id="extra_curriculars"
                          value={recruitingData.extra_curriculars}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, extra_curriculars: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="Sports, clubs, leadership roles, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="academic_bio" className="font-rajdhani pb-2">Academic Bio</Label>
                        <Input
                          id="academic_bio"
                          value={recruitingData.academic_bio}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, academic_bio: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="Academic achievements, honors, awards..."
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="text-black border-gray-600" onClick={() => setEditRecruitingOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleRecruitingSave}
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {recruitingData.school || recruitingData.class_year || recruitingData.main_game_id || recruitingData.gpa || recruitingData.intended_major || recruitingData.scholastic_contact || recruitingData.extra_curriculars || recruitingData.academic_bio ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {recruitingData.school && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">School</Label>
                      <p className="text-white">{recruitingData.school}</p>
                    </div>
                  )}
                  {recruitingData.class_year && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Graduation Year</Label>
                      <p className="text-white">{recruitingData.class_year}</p>
                    </div>
                  )}
                  {recruitingData.main_game_id && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Main Game</Label>
                      <p className="text-white">{availableGames?.find(game => game.id === recruitingData.main_game_id)?.name ?? recruitingData.main_game_id}</p>
                    </div>
                  )}
                  {recruitingData.gpa && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">GPA</Label>
                      <p className="text-white">{recruitingData.gpa}</p>
                    </div>
                  )}
                  {recruitingData.intended_major && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Intended Major</Label>
                      <p className="text-white">{recruitingData.intended_major}</p>
                    </div>
                  )}
                  {recruitingData.scholastic_contact && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Scholastic Contact</Label>
                      <p className="text-white">{recruitingData.scholastic_contact}</p>
                    </div>
                  )}
                  {recruitingData.extra_curriculars && (
                    <div className="md:col-span-2">
                      <Label className="text-gray-400 font-rajdhani">Extra Curriculars</Label>
                      <p className="text-white">{recruitingData.extra_curriculars}</p>
                    </div>
                  )}
                  {recruitingData.academic_bio && (
                    <div className="md:col-span-2">
                      <Label className="text-gray-400 font-rajdhani">Academic Bio</Label>
                      <p className="text-white">{recruitingData.academic_bio}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">
                    Add your recruiting information to help college scouts find and evaluate you.
                  </p>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setEditRecruitingOpen(true)}
                  >
                    Add Recruiting Info
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Game Connections */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Game Connections</h3>
              <Dialog open={editGameConnectionOpen} onOpenChange={setEditGameConnectionOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={updatePlatformMutation.isPending || removePlatformMutation.isPending}
                  >
                    {updatePlatformMutation.isPending ? (
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <PlusIcon className="h-4 w-4 mr-2" />
                    )}
                    Connect Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Connect Game Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Link your gaming accounts to showcase your achievements
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {connectionError && (
                      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{connectionError}</p>
                      </div>
                    )}
                    <div>
                      <Label className="p-2">Select Platform</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {gameConnectionsConfig.filter(config => {
                          const isConnected = gameConnections.find(conn => conn.platform === config.platform)?.connected;
                          return !isConnected;
                        }).map((platform) => (
                          <Button
                            key={platform.platform}
                            variant={selectedPlatform === platform.platform ? "default" : "outline"}
                            className={`justify-start bg-slate-800 ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
                            onClick={() => setSelectedPlatform(platform.platform)}
                            disabled={updatePlatformMutation.isPending}
                          >
                            <platform.icon className="h-4 w-4 mr-2" />
                            {platform.displayName}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {selectedPlatform && (
                      <div>
                        <Label htmlFor="gameUsername">Username</Label>
                        <Input
                          id="gameUsername"
                          value={connectionUsername}
                          onChange={(e) => setConnectionUsername(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="Enter your username"
                          disabled={updatePlatformMutation.isPending}
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="text-black border-gray-600" 
                        onClick={() => {
                          setEditGameConnectionOpen(false);
                          setSelectedPlatform("");
                          setConnectionUsername("");
                          setConnectionError("");
                        }}
                        disabled={updatePlatformMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleGameConnectionSave}
                        disabled={updatePlatformMutation.isPending || !selectedPlatform || !connectionUsername.trim()}
                      >
                        {updatePlatformMutation.isPending ? (
                          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Connect Account
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
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
                      onClick={() => setEditGameConnectionOpen(true)}
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
              <Dialog open={editSocialConnectionOpen} onOpenChange={setEditSocialConnectionOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={updateSocialMutation.isPending || removeSocialMutation.isPending}
                  >
                    {updateSocialMutation.isPending ? (
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <PlusIcon className="h-4 w-4 mr-2" />
                    )}
                    Connect Social
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Connect Social Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Link your social media accounts to build your personal brand
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {connectionError && (
                      <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                        <p className="text-red-400 text-sm">{connectionError}</p>
                      </div>
                    )}
                    <div>
                      <Label>Select Platform</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {socialConnectionsConfig.filter(config => {
                          const isConnected = socialConnections.find(conn => conn.platform === config.platform)?.connected;
                          return !isConnected;
                        }).map((platform) => (
                          <Button
                            key={platform.platform}
                            variant={selectedPlatform === platform.platform ? "default" : "outline"}
                            className={`justify-start bg-slate-800 ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
                            onClick={() => setSelectedPlatform(platform.platform)}
                            disabled={updateSocialMutation.isPending}
                          >
                            <platform.icon className="h-4 w-4 mr-2" />
                            {platform.displayName}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {selectedPlatform && (
                      <div>
                        <Label htmlFor="socialUsername">Username</Label>
                        <Input
                          id="socialUsername"
                          value={connectionUsername}
                          onChange={(e) => setConnectionUsername(e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="Enter your username"
                          disabled={updateSocialMutation.isPending}
                        />
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="border-gray-600" 
                        onClick={() => {
                          setEditSocialConnectionOpen(false);
                          setSelectedPlatform("");
                          setConnectionUsername("");
                          setConnectionError("");
                        }}
                        disabled={updateSocialMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleSocialConnectionSave}
                        disabled={updateSocialMutation.isPending || !selectedPlatform || !connectionUsername.trim()}
                      >
                        {updateSocialMutation.isPending ? (
                          <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Connect Account
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
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
                      onClick={() => setEditSocialConnectionOpen(true)}
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
                onClick={() => setEditProfileOpen(true)}
              >
                <EditIcon className="h-4 w-4 mr-2" />
                Edit Basic Info
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
                onClick={() => setEditGameConnectionOpen(true)}
              >
                <GamepadIcon className="h-4 w-4 mr-2" />
                Connect Game Account
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-gray-300 hover:bg-gray-800"
                onClick={() => setEditSocialConnectionOpen(true)}
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