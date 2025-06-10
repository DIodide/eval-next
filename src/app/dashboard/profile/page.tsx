"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  ExternalLinkIcon
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
  school: string;
  class: string;
  bio: string;
}

export default function ProfilePage() {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editGameConnectionOpen, setEditGameConnectionOpen] = useState(false);
  const [editSocialConnectionOpen, setEditSocialConnectionOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [connectionUsername, setConnectionUsername] = useState("");

  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    realName: "",
    username: "",
    email: "",
    location: "",
    school: "",
    class: "",
    bio: ""
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

  const handleGameConnectionSave = () => {
    if (!selectedPlatform || !connectionUsername.trim()) return;
    
    setGameConnections(prev => prev.map(conn => 
      conn.platform === selectedPlatform 
        ? { ...conn, username: connectionUsername.trim(), connected: true }
        : conn
    ));
    
    setConnectionUsername("");
    setSelectedPlatform("");
    setEditGameConnectionOpen(false);
  };

  const handleSocialConnectionSave = () => {
    if (!selectedPlatform || !connectionUsername.trim()) return;
    
    setSocialConnections(prev => prev.map(conn => 
      conn.platform === selectedPlatform 
        ? { ...conn, username: connectionUsername.trim(), connected: true }
        : conn
    ));
    
    setConnectionUsername("");
    setSelectedPlatform("");
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
    // Here you would typically save to your backend
    setEditProfileOpen(false);
  };

  const connectedGameAccounts = gameConnections.filter(conn => conn.connected).length;
  const connectedSocialAccounts = socialConnections.filter(conn => conn.connected).length;
  const totalConnections = connectedGameAccounts + connectedSocialAccounts;
  const profileCompletion = Math.min(25 + (totalConnections * 10), 100);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            My Profile
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your gaming profile and recruitment information
          </p>
        </div>
        
        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <EditIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update your basic profile information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="realName">Real Name</Label>
                  <Input
                    id="realName"
                    value={profileData.realName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, realName: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="gamertag123"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="school">School</Label>
                  <Input
                    id="school"
                    value={profileData.school}
                    onChange={(e) => setProfileData(prev => ({ ...prev, school: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class Year</Label>
                  <Input
                    id="class"
                    value={profileData.class}
                    onChange={(e) => setProfileData(prev => ({ ...prev, class: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="2025"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="City, State"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" className="border-gray-600" onClick={() => setEditProfileOpen(false)}>
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

      {/* Profile Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <Card className="bg-[#1a1a2e] border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              {profileData.realName || profileData.username || profileData.email ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {profileData.realName && (
                    <div>
                      <Label className="text-gray-400">Real Name</Label>
                      <p className="text-white">{profileData.realName}</p>
                    </div>
                  )}
                  {profileData.username && (
                    <div>
                      <Label className="text-gray-400">Username</Label>
                      <p className="text-white">{profileData.username}</p>
                    </div>
                  )}
                  {profileData.email && (
                    <div>
                      <Label className="text-gray-400">Email</Label>
                      <p className="text-white">{profileData.email}</p>
                    </div>
                  )}
                  {profileData.school && (
                    <div>
                      <Label className="text-gray-400">School</Label>
                      <p className="text-white">{profileData.school}</p>
                    </div>
                  )}
                  {profileData.location && (
                    <div>
                      <Label className="text-gray-400">Location</Label>
                      <p className="text-white">{profileData.location}</p>
                    </div>
                  )}
                  {profileData.class && (
                    <div>
                      <Label className="text-gray-400">Class Year</Label>
                      <p className="text-white">{profileData.class}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-400">
                  Complete your profile to get noticed by college esports recruiters.
                </p>
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
                <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle>Connect Game Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Link your gaming accounts to showcase your achievements
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Platform</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {gameConnections.filter(conn => !conn.connected).map((platform) => (
                          <Button
                            key={platform.platform}
                            variant={selectedPlatform === platform.platform ? "default" : "outline"}
                            className={`justify-start ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
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
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="border-gray-600" onClick={() => {
                        setEditGameConnectionOpen(false);
                        setSelectedPlatform("");
                        setConnectionUsername("");
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleGameConnectionSave}
                        disabled={!selectedPlatform || !connectionUsername.trim()}
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
                <p className="text-gray-400 text-center py-4">
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
                <DialogContent className="bg-[#1a1a2e] border-gray-800 text-white">
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
                            className={`justify-start ${selectedPlatform === platform.platform ? platform.color : 'border-gray-600'}`}
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
                      </div>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="border-gray-600" onClick={() => {
                        setEditSocialConnectionOpen(false);
                        setSelectedPlatform("");
                        setConnectionUsername("");
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700" 
                        onClick={handleSocialConnectionSave}
                        disabled={!selectedPlatform || !connectionUsername.trim()}
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
                <p className="text-gray-400 text-center py-4">
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
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">{profileCompletion}% Complete</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Game Accounts:</span>
                  <span className="text-white">{connectedGameAccounts}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Social Accounts:</span>
                  <span className="text-white">{connectedSocialAccounts}/3</span>
                </div>
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