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
  CheckIcon,
  XIcon,
  InstagramIcon,
  TwitchIcon,
  TwitterIcon,
  MonitorIcon,
  PlusIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  GithubIcon
} from "lucide-react";

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
  realName: string;
  username: string;
  email: string;
  location: string;
  bio: string;
}

interface RecruitingData {
  school: string;
  class: string;
  mainGame: string;
  scholasticContact: string;
  scholasticContactEmail: string;
  parentContact: string;
  gpa: string;
  graduationDate: string;
  intendedMajor: string;
  extraCurriculars: string;
  academicBio: string;
}

type ValidationErrors = Record<string, string>;

const supportedGames = [
  "Valorant",
  "Overwatch 2", 
  "Smash Ultimate",
  "Rocket League"
];

export default function ProfilePage() {
  const { user } = useUser();
  
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

  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    realName: "",
    username: "",
    email: "",
    location: "",
    bio: ""
  });

  // Populate profile data from Clerk when user data is available
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        realName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
        username: user.username ?? '',
        email: user.emailAddresses[0]?.emailAddress ?? '',
        // Leave location and bio empty - these will come from your database
      }));
    }
  }, [user]);

  // Recruiting data state
  const [recruitingData, setRecruitingData] = useState<RecruitingData>({
    school: "",
    class: "",
    mainGame: "",
    scholasticContact: "",
    scholasticContactEmail: "",
    parentContact: "",
    gpa: "",
    graduationDate: "",
    intendedMajor: "",
    extraCurriculars: "",
    academicBio: ""
  });

  // Game connections state
  const [gameConnections, setGameConnections] = useState<GameConnection[]>([
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
  ]);

  // Social connections state
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([
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
  ]);

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

    if (profileData.email && !validateEmail(profileData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (profileData.username && profileData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (profileData.realName && profileData.realName.length < 2) {
      errors.realName = "Name must be at least 2 characters";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRecruitingData = (): boolean => {
    const errors: ValidationErrors = {};

    if (recruitingData.scholasticContactEmail && !validateEmail(recruitingData.scholasticContactEmail)) {
      errors.scholasticContactEmail = "Please enter a valid email address";
    }

    if (recruitingData.parentContact && !validateEmail(recruitingData.parentContact)) {
      errors.parentContact = "Please enter a valid email address";
    }

    if (recruitingData.gpa && !validateGPA(recruitingData.gpa)) {
      errors.gpa = "GPA must be between 0.0 and 4.0";
    }

    if (recruitingData.class && !validateYear(recruitingData.class)) {
      errors.class = "Please enter a valid graduation year";
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
    
    setGameConnections(prev => prev.map(conn => 
      conn.platform === selectedPlatform 
        ? { ...conn, username: connectionUsername.trim(), connected: true }
        : conn
    ));
    
    setConnectionUsername("");
    setSelectedPlatform("");
    setConnectionError("");
    setEditGameConnectionOpen(false);
  };

  const handleSocialConnectionSave = () => {
    if (!validateConnection()) return;
    
    setSocialConnections(prev => prev.map(conn => 
      conn.platform === selectedPlatform 
        ? { ...conn, username: connectionUsername.trim(), connected: true }
        : conn
    ));
    
    setConnectionUsername("");
    setSelectedPlatform("");
    setConnectionError("");
    setEditSocialConnectionOpen(false);
  };

  const disconnectAccount = (platform: string, type: 'game' | 'social') => {
    if (type === 'game') {
      setGameConnections(prev => prev.map(conn => 
        conn.platform === platform 
          ? { ...conn, username: "", connected: false }
          : conn
      ));
    } else {
      setSocialConnections(prev => prev.map(conn => 
        conn.platform === platform 
          ? { ...conn, username: "", connected: false }
          : conn
      ));
    }
  };

  const handleProfileSave = () => {
    if (!validateProfileData()) return;
    setEditProfileOpen(false);
  };

  const handleRecruitingSave = () => {
    if (!validateRecruitingData()) return;
    setEditRecruitingOpen(false);
  };

  const connectedGameAccounts = gameConnections.filter(conn => conn.connected).length;
  const connectedSocialAccounts = socialConnections.filter(conn => conn.connected).length;
  const hasBasicInfo = !!(profileData.realName || profileData.username || profileData.email || profileData.bio);
  const hasRecruitingInfo = !!(recruitingData.school || recruitingData.mainGame || recruitingData.gpa || recruitingData.extraCurriculars || recruitingData.academicBio);
  
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <EditIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Update your basic profile information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="realName" className="font-rajdhani pb-2">Real Name</Label>
                        <Input
                          id="realName"
                          value={profileData.realName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, realName: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="John Doe"
                        />
                        {profileErrors.realName && (
                          <p className="text-red-400 text-sm mt-1">{profileErrors.realName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="username" className="font-rajdhani pb-2">Username</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="gamertag123"
                        />
                        {profileErrors.username && (
                          <p className="text-red-400 text-sm mt-1">{profileErrors.username}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="font-rajdhani pb-2">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="john@example.com"
                      />
                      {profileErrors.email && (
                        <p className="text-red-400 text-sm mt-1">{profileErrors.email}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="location" className="font-rajdhani pb-2">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="City, State"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="font-rajdhani pb-2">Bio</Label>
                      <Input
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="text-black border-gray-600" onClick={() => setEditProfileOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleProfileSave}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {profileData.realName || profileData.username || profileData.email || profileData.bio ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {profileData.realName && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Real Name</Label>
                      <p className="text-white">{profileData.realName}</p>
                    </div>
                  )}
                  {profileData.username && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Username</Label>
                      <p className="text-white">{profileData.username}</p>
                    </div>
                  )}
                  {profileData.email && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Email</Label>
                      <p className="text-white">{profileData.email}</p>
                    </div>
                  )}
                  {profileData.location && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Location</Label>
                      <p className="text-white">{profileData.location}</p>
                    </div>
                  )}
                  {profileData.bio && (
                    <div className="md:col-span-2">
                      <Label className="text-gray-400 font-rajdhani">Bio</Label>
                      <p className="text-white">{profileData.bio}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">
                  Complete your basic profile information to get started.
                </p>
              )}
            </div>
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
                  >
                    <EditIcon className="h-4 w-4 mr-2" />
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="school" className="font-rajdhani pb-2">School/University</Label>
                        <Input
                          id="school"
                          value={recruitingData.school}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, school: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="High School or University"
                        />
                      </div>
                      <div>
                        <Label htmlFor="class" className="font-rajdhani pb-2">Graduation Year</Label>
                        <Input
                          id="class"
                          value={recruitingData.class}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, class: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="2025"
                        />
                        {recruitingErrors.class && (
                          <p className="text-red-400 text-sm mt-1">{recruitingErrors.class}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="mainGame" className="font-rajdhani pb-2">Main Game</Label>
                        <Select value={recruitingData.mainGame} onValueChange={(value) => setRecruitingData(prev => ({ ...prev, mainGame: value }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Select your main game" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {supportedGames.map((game) => (
                              <SelectItem key={game} value={game} className="text-white hover:bg-gray-700">
                                {game}
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
                      <Label htmlFor="intendedMajor" className="font-rajdhani pb-2">Intended Major</Label>
                      <Input
                        id="intendedMajor"
                        value={recruitingData.intendedMajor}
                        onChange={(e) => setRecruitingData(prev => ({ ...prev, intendedMajor: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Computer Science, Business, etc."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scholasticContact" className="font-rajdhani pb-2">Scholastic Contact</Label>
                        <Input
                          id="scholasticContact"
                          value={recruitingData.scholasticContact}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, scholasticContact: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="Guidance Counselor or Teacher Name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scholasticContactEmail" className="font-rajdhani pb-2">Scholastic Contact Email</Label>
                        <Input
                          id="scholasticContactEmail"
                          type="email"
                          value={recruitingData.scholasticContactEmail}
                          onChange={(e) => setRecruitingData(prev => ({ ...prev, scholasticContactEmail: e.target.value }))}
                          className="bg-gray-800 border-gray-700 text-white"
                          placeholder="counselor@school.edu"
                        />
                        {recruitingErrors.scholasticContactEmail && (
                          <p className="text-red-400 text-sm mt-1">{recruitingErrors.scholasticContactEmail}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="parentContact" className="font-rajdhani pb-2">Parent/Guardian Contact Email</Label>
                      <Input
                        id="parentContact"
                        type="email"
                        value={recruitingData.parentContact}
                        onChange={(e) => setRecruitingData(prev => ({ ...prev, parentContact: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="parent@email.com"
                      />
                      {recruitingErrors.parentContact && (
                        <p className="text-red-400 text-sm mt-1">{recruitingErrors.parentContact}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="extraCurriculars" className="font-rajdhani pb-2">Extra Curriculars</Label>
                      <Input
                        id="extraCurriculars"
                        value={recruitingData.extraCurriculars}
                        onChange={(e) => setRecruitingData(prev => ({ ...prev, extraCurriculars: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Sports, clubs, leadership roles, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="academicBio" className="font-rajdhani pb-2">Academic Bio</Label>
                      <Input
                        id="academicBio"
                        value={recruitingData.academicBio}
                        onChange={(e) => setRecruitingData(prev => ({ ...prev, academicBio: e.target.value }))}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Academic achievements, honors, awards..."
                      />
                    </div>
                    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                      <p className="text-yellow-400 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <strong>Privacy Notice:</strong> This recruiting information will not be visible on your public profile and is only accessible to verified college recruiters.
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="text-black border-gray-600" onClick={() => setEditRecruitingOpen(false)}>
                        Cancel
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRecruitingSave}>
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-4">
              {hasRecruitingInfo ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {recruitingData.school && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">School</Label>
                      <p className="text-white">{recruitingData.school}</p>
                    </div>
                  )}
                  {recruitingData.class && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Graduation Year</Label>
                      <p className="text-white">{recruitingData.class}</p>
                    </div>
                  )}
                  {recruitingData.mainGame && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Main Game</Label>
                      <p className="text-white">{recruitingData.mainGame}</p>
                    </div>
                  )}
                  {recruitingData.gpa && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">GPA</Label>
                      <p className="text-white">{recruitingData.gpa}</p>
                    </div>
                  )}
                  {recruitingData.intendedMajor && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Intended Major</Label>
                      <p className="text-white">{recruitingData.intendedMajor}</p>
                    </div>
                  )}
                  {recruitingData.scholasticContact && (
                    <div>
                      <Label className="text-gray-400 font-rajdhani">Scholastic Contact</Label>
                      <p className="text-white">{recruitingData.scholasticContact}</p>
                    </div>
                  )}
                  {recruitingData.extraCurriculars && (
                    <div className="md:col-span-2">
                      <Label className="text-gray-400 font-rajdhani">Extra Curriculars</Label>
                      <p className="text-white">{recruitingData.extraCurriculars}</p>
                    </div>
                  )}
                  {recruitingData.academicBio && (
                    <div className="md:col-span-2">
                      <Label className="text-gray-400 font-rajdhani">Academic Bio</Label>
                      <p className="text-white">{recruitingData.academicBio}</p>
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
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
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
                    <div>
                      <Label className="p-2">Select Platform</Label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        {gameConnections.filter(conn => !conn.connected).map((platform) => (
                          <Button
                            key={platform.platform}
                            variant={selectedPlatform === platform.platform ? "default" : "outline"}
                            className={`justify-start bg-slate-800 ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
                            onClick={() => setSelectedPlatform(platform.platform)}
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
                        />
                        {connectionError && (
                          <p className="text-red-400 text-sm mt-1">{connectionError}</p>
                        )}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="text-black border-gray-600" onClick={() => {
                        setEditGameConnectionOpen(false);
                        setSelectedPlatform("");
                        setConnectionUsername("");
                        setConnectionError("");
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleGameConnectionSave}
                      >
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
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 py-2">
                  No game accounts connected yet. Connect your accounts to showcase your gaming achievements.
                </p>
              )}
            </div>
          </Card>

          {/* Social Connections */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Social Connections</h3>
              <Dialog open={editSocialConnectionOpen} onOpenChange={setEditSocialConnectionOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
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
                    <div>
                      <Label>Select Platform</Label>
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {socialConnections.filter(conn => !conn.connected).map((platform) => (
                          <Button
                            key={platform.platform}
                            variant={selectedPlatform === platform.platform ? "default" : "outline"}
                            className={`justify-start bg-slate-800 ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
                            onClick={() => setSelectedPlatform(platform.platform)}
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
                        />
                        {connectionError && (
                          <p className="text-red-400 text-sm mt-1">{connectionError}</p>
                        )}
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="border-gray-600" onClick={() => {
                        setEditSocialConnectionOpen(false);
                        setSelectedPlatform("");
                        setConnectionUsername("");
                        setConnectionError("");
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleSocialConnectionSave}
                      >
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
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 py-2">
                  No social accounts connected yet. Connect your social media to build your personal brand.
                </p>
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