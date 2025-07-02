"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserIcon, SaveIcon, EyeIcon, BuildingIcon } from "lucide-react";
import { useState } from "react";

export default function LeagueProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mock league data - this would come from tRPC in a real implementation
  const [leagueData, setLeagueData] = useState({
    name: "",
    short_name: "",
    description: "",
    region: "",
    state: "",
    tier: "",
    season: "",
    format: "",
    prize_pool: "",
    founded_year: "",
    status: "ACTIVE"
  });

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement actual save using tRPC
      // await api.leagueAdminProfile.updateLeagueProfile.mutate(leagueData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save league profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            League Profile
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your league information and public profile
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800">
            <EyeIcon className="h-4 w-4 mr-2" />
            Preview Public Profile
          </Button>
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <UserIcon className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Basic Information */}
      <Card className="bg-[#1a1a2e] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BuildingIcon className="h-5 w-5 text-purple-400" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">League Name</Label>
              <Input
                id="name"
                value={leagueData.name}
                onChange={(e) => setLeagueData({...leagueData, name: e.target.value})}
                disabled={!isEditing}
                placeholder="Enter league name"
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short_name" className="text-white">Short Name / Abbreviation</Label>
              <Input
                id="short_name"
                value={leagueData.short_name}
                onChange={(e) => setLeagueData({...leagueData, short_name: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., NCEL"
                maxLength={10}
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">League Description</Label>
            <Textarea
              id="description"
              value={leagueData.description}
              onChange={(e) => setLeagueData({...leagueData, description: e.target.value})}
              disabled={!isEditing}
              placeholder="Describe your league's mission, goals, and what makes it unique..."
              className="bg-gray-800 border-gray-700 text-white disabled:opacity-50 min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="region" className="text-white">Region</Label>
              <Input
                id="region"
                value={leagueData.region}
                onChange={(e) => setLeagueData({...leagueData, region: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., Northeast, West Coast"
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state" className="text-white">Primary State</Label>
              <Input
                id="state"
                value={leagueData.state}
                onChange={(e) => setLeagueData({...leagueData, state: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., New Jersey"
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* League Details */}
      <Card className="bg-[#1a1a2e] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">League Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tier" className="text-white">League Tier</Label>
              <Select 
                value={leagueData.tier} 
                onValueChange={(value) => setLeagueData({...leagueData, tier: value})}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white disabled:opacity-50">
                  <SelectValue placeholder="Select tier..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="DEVELOPMENTAL">Developmental</SelectItem>
                  <SelectItem value="COMPETITIVE">Competitive</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="ELITE">Elite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="season" className="text-white">Current Season</Label>
              <Input
                id="season"
                value={leagueData.season}
                onChange={(e) => setLeagueData({...leagueData, season: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., 2024-2025"
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="format" className="text-white">Competition Format</Label>
              <Input
                id="format"
                value={leagueData.format}
                onChange={(e) => setLeagueData({...leagueData, format: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., Regular Season + Playoffs"
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize_pool" className="text-white">Prize Pool (Optional)</Label>
              <Input
                id="prize_pool"
                value={leagueData.prize_pool}
                onChange={(e) => setLeagueData({...leagueData, prize_pool: e.target.value})}
                disabled={!isEditing}
                placeholder="e.g., $10,000"
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="founded_year" className="text-white">Founded Year</Label>
              <Input
                id="founded_year"
                type="number"
                value={leagueData.founded_year}
                onChange={(e) => setLeagueData({...leagueData, founded_year: e.target.value})}
                disabled={!isEditing}
                placeholder="2024"
                min="2000"
                max="2030"
                className="bg-gray-800 border-gray-700 text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" className="text-white">League Status</Label>
              <Select 
                value={leagueData.status} 
                onValueChange={(value) => setLeagueData({...leagueData, status: value})}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white disabled:opacity-50">
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="UPCOMING">Upcoming</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      {!isEditing && (
        <Card className="bg-blue-900/20 border-blue-700">
          <CardContent className="pt-6">
            <p className="text-blue-300 text-sm">
              <strong>Pro Tip:</strong> Keep your league information up to date to help teams and players find and join your league. 
              Your public profile will showcase this information to potential participants.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 