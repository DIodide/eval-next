"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";

type PlatformType = "steam" | "valorant" | "battlenet" | "epicgames" | "startgg";
type SocialPlatformType = "github" | "discord" | "instagram" | "twitch" | "x";

export default function PlayerProfileTestPage() {
  const { user } = useUser();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Form states
  const [profileData, setProfileData] = useState({
    first_name: "John",
    last_name: "Doe",
    location: "San Francisco, CA",
    bio: "Professional esports player",
    school: "University of Gaming",
    gpa: 3.8,
    class_year: "2025",
    graduation_date: "2025-05-15",
    intended_major: "Computer Science",
    guardian_email: "parent@example.com",
    scholastic_contact: "Coach Smith",
    scholastic_contact_email: "coach@school.edu",
    extra_curriculars: "Chess Club, Gaming Club",
    academic_bio: "Dean's list student with strong academic performance",
  });

  const [platformConnection, setPlatformConnection] = useState({
    platform: "steam" as PlatformType,
    username: "testplayer123",
  });

  const [socialConnection, setSocialConnection] = useState({
    platform: "discord" as SocialPlatformType,
    username: "testplayer#1234",
  });

  const [removePlatform, setRemovePlatform] = useState<PlatformType>("steam");
  const [removeSocial, setRemoveSocial] = useState<SocialPlatformType>("discord");

  // tRPC mutations
  const updateProfileMutation = api.playerProfile.updateProfile.useMutation();
  const updatePlatformMutation = api.playerProfile.updatePlatformConnection.useMutation();
  const updateSocialMutation = api.playerProfile.updateSocialConnection.useMutation();
  const removePlatformMutation = api.playerProfile.removePlatformConnection.useMutation();
  const removeSocialMutation = api.playerProfile.removeSocialConnection.useMutation();

  const utils = api.useUtils();

  const handleTest = async (testName: string, testFn: () => Promise<unknown>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    setErrors(prev => ({ ...prev, [testName]: null }));
    
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (error: unknown) {
      setErrors(prev => ({ ...prev, [testName]: error }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testGetProfile = () => {
    return handleTest("getProfile", async () => {
      const result = await utils.playerProfile.getProfile.fetch();
      return result;
    });
  };

  const testUpdateProfile = () => {
    return handleTest("updateProfile", async () => {
      const result = await updateProfileMutation.mutateAsync(profileData);
      return result;
    });
  };

  const testUpdatePlatformConnection = () => {
    return handleTest("updatePlatformConnection", async () => {
      const result = await updatePlatformMutation.mutateAsync(platformConnection);
      return result;
    });
  };

  const testUpdateSocialConnection = () => {
    return handleTest("updateSocialConnection", async () => {
      const result = await updateSocialMutation.mutateAsync(socialConnection);
      return result;
    });
  };

  const testRemovePlatformConnection = () => {
    return handleTest("removePlatformConnection", async () => {
      const result = await removePlatformMutation.mutateAsync({ platform: removePlatform });
      return result;
    });
  };

  const testRemoveSocialConnection = () => {
    return handleTest("removeSocialConnection", async () => {
      const result = await removeSocialMutation.mutateAsync({ platform: removeSocial });
      return result;
    });
  };

  const testGetAvailableGames = () => {
    return handleTest("getAvailableGames", async () => {
      const result = await utils.playerProfile.getAvailableGames.fetch();
      return result;
    });
  };

  const clearResults = () => {
    setResults({});
    setErrors({});
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Player Profile tRPC Test Page</h1>
        <p className="text-muted-foreground">Test all playerProfile router endpoints</p>
        {user && (
          <p className="text-sm text-blue-600 mt-2">
            Logged in as: {user.emailAddresses[0]?.emailAddress}
          </p>
        )}
        {!user && (
          <p className="text-sm text-red-600 mt-2">
            Not logged in - you need to authenticate to test these endpoints
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Query Endpoints</CardTitle>
            <CardDescription>Test query operations (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button 
                onClick={testGetProfile}
                disabled={loading.getProfile}
                className="w-full"
              >
                {loading.getProfile ? "Loading..." : "Test getProfile"}
              </Button>
            </div>
            
            <div>
              <Button 
                onClick={testGetAvailableGames}
                disabled={loading.getAvailableGames}
                className="w-full"
              >
                {loading.getAvailableGames ? "Loading..." : "Test getAvailableGames"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Update Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>Test profile update mutation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                value={profileData.school}
                onChange={(e) => setProfileData(prev => ({ ...prev, school: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                type="number"
                step="0.1"
                min="0"
                max="4"
                value={profileData.gpa}
                onChange={(e) => setProfileData(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Professional esports player..."
              />
            </div>
            
            <div>
              <Label htmlFor="academic_bio">Academic Bio</Label>
              <Input
                id="academic_bio"
                value={profileData.academic_bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, academic_bio: e.target.value }))}
                placeholder="Dean's list student with strong academic performance..."
              />
            </div>
            
            <Button 
              onClick={testUpdateProfile}
              disabled={loading.updateProfile}
              className="w-full"
            >
              {loading.updateProfile ? "Loading..." : "Test updateProfile"}
            </Button>
          </CardContent>
        </Card>

        {/* Platform Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Connections</CardTitle>
            <CardDescription>Test platform connection operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform</Label>
              <select
                id="platform"
                value={platformConnection.platform}
                onChange={(e) => setPlatformConnection(prev => ({ ...prev, platform: e.target.value as PlatformType }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="steam">Steam</option>
                <option value="valorant">Valorant</option>
                <option value="battlenet">Battle.net</option>
                <option value="epicgames">Epic Games</option>
                <option value="startgg">Start.gg</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="platform_username">Username</Label>
              <Input
                id="platform_username"
                value={platformConnection.username}
                onChange={(e) => setPlatformConnection(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            
            <Button 
              onClick={testUpdatePlatformConnection}
              disabled={loading.updatePlatformConnection}
              className="w-full"
            >
              {loading.updatePlatformConnection ? "Loading..." : "Test updatePlatformConnection"}
            </Button>
            
            <div className="border-t pt-4">
              <Label htmlFor="remove_platform">Remove Platform</Label>
              <select
                id="remove_platform"
                value={removePlatform}
                onChange={(e) => setRemovePlatform(e.target.value as PlatformType)}
                className="w-full px-3 py-2 border rounded-md mb-2"
              >
                <option value="steam">Steam</option>
                <option value="valorant">Valorant</option>
                <option value="battlenet">Battle.net</option>
                <option value="epicgames">Epic Games</option>
                <option value="startgg">Start.gg</option>
              </select>
              
              <Button 
                onClick={testRemovePlatformConnection}
                disabled={loading.removePlatformConnection}
                variant="destructive"
                className="w-full"
              >
                {loading.removePlatformConnection ? "Loading..." : "Test removePlatformConnection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Social Connections</CardTitle>
            <CardDescription>Test social connection operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="social_platform">Platform</Label>
              <select
                id="social_platform"
                value={socialConnection.platform}
                onChange={(e) => setSocialConnection(prev => ({ ...prev, platform: e.target.value as SocialPlatformType }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="github">GitHub</option>
                <option value="discord">Discord</option>
                <option value="instagram">Instagram</option>
                <option value="twitch">Twitch</option>
                <option value="x">X (Twitter)</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="social_username">Username</Label>
              <Input
                id="social_username"
                value={socialConnection.username}
                onChange={(e) => setSocialConnection(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            
            <Button 
              onClick={testUpdateSocialConnection}
              disabled={loading.updateSocialConnection}
              className="w-full"
            >
              {loading.updateSocialConnection ? "Loading..." : "Test updateSocialConnection"}
            </Button>
            
            <div className="border-t pt-4">
              <Label htmlFor="remove_social">Remove Social</Label>
              <select
                id="remove_social"
                value={removeSocial}
                onChange={(e) => setRemoveSocial(e.target.value as SocialPlatformType)}
                className="w-full px-3 py-2 border rounded-md mb-2"
              >
                <option value="github">GitHub</option>
                <option value="discord">Discord</option>
                <option value="instagram">Instagram</option>
                <option value="twitch">Twitch</option>
                <option value="x">X (Twitter)</option>
              </select>
              
              <Button 
                onClick={testRemoveSocialConnection}
                disabled={loading.removeSocialConnection}
                variant="destructive"
                className="w-full"
              >
                {loading.removeSocialConnection ? "Loading..." : "Test removeSocialConnection"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
          <CardDescription>Results and errors from API calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(results).map(([testName, result]) => (
              <div key={testName} className="border rounded-lg p-4">
                <h3 className="font-semibold text-green-600 mb-2">✅ {testName}</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
            
            {Object.entries(errors).map(([testName, error]) => (
              <div key={testName} className="border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-600 mb-2">❌ {testName}</h3>
                <pre className="bg-red-50 p-3 rounded text-sm overflow-auto max-h-40">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            ))}
            
            {Object.keys(results).length === 0 && Object.keys(errors).length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No test results yet. Run some tests to see results here.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 