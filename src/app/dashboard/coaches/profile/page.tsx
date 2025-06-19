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
  InfoIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CoachProfilePage() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
  });

  // Fetch coach profile
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = api.coachProfile.getProfile.useQuery();

  // Mutations
  const updateProfileMutation = api.coachProfile.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      setHasUnsavedChanges(false);
      void refetchProfile();
    },
  });

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

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          <div className="text-white font-rajdhani">Loading profile...</div>
        </div>
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
    </div>
  );
} 