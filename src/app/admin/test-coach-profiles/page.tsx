"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";

type SchoolType = "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY";
type AnnouncementType =
  | "GENERAL"
  | "TRYOUT"
  | "ACHIEVEMENT"
  | "FACILITY"
  | "SCHOLARSHIP"
  | "ALUMNI"
  | "EVENT"
  | "SEASON_REVIEW";

export default function CoachProfilesTestPage() {
  const { user } = useUser();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Form state for updateProfile
  const [updateProfileData, setUpdateProfileData] = useState({
    first_name: "Test",
    last_name: "Coach",
    username: "testcoach123",
  });

  // Form state for school association request
  const [schoolAssocData, setSchoolAssocData] = useState({
    school_id: "",
    request_message:
      "I am requesting association with this school for testing purposes. This is a development test message.",
    is_new_school_request: false,
    proposed_school_name: "Test University",
    proposed_school_type: "UNIVERSITY" as SchoolType,
    proposed_school_location: "Test City",
    proposed_school_state: "California",
    proposed_school_region: "West",
    proposed_school_website: "https://test-university.edu",
  });

  // Form state for announcements (using schoolProfile router)
  const [announcementData, setAnnouncementData] = useState({
    title: "Test Announcement",
    content:
      "This is a test announcement created from the development testing page. It includes detailed information about upcoming events and opportunities.",
    type: "GENERAL" as AnnouncementType,
    is_pinned: false,
  });

  // Form state for achievements (correct schema)
  const [achievementData, setAchievementData] = useState({
    title: "Test Achievement",
    date_achieved: new Date().toISOString().split("T")[0], // Default to today
  });

  // Form state for school profile queries
  const [schoolQueryData, setSchoolQueryData] = useState({
    schoolId: "",
    limit: 10,
    type: "all" as AnnouncementType | "all" | "",
  });

  // Form state for achievement operations
  const [achievementQuery, setAchievementQuery] = useState({
    achievementId: "",
  });

  // Form state for announcement operations
  const [announcementQuery, setAnnouncementQuery] = useState({
    announcementId: "",
  });

  // tRPC hooks
  const utils = api.useUtils();

  // Mutation hooks
  const updateProfileMutation = api.coachProfile.updateProfile.useMutation();
  const removeSchoolAssociationMutation =
    api.coachProfile.removeSchoolAssociation.useMutation();
  const createAnnouncementMutation =
    api.schoolProfile.createAnnouncement.useMutation();
  const updateAnnouncementMutation =
    api.schoolProfile.updateAnnouncement.useMutation();
  const deleteAnnouncementMutation =
    api.schoolProfile.deleteAnnouncement.useMutation();
  const createAchievementMutation =
    api.coachProfile.createAchievement.useMutation();
  const updateAchievementMutation =
    api.coachProfile.updateAchievement.useMutation();
  const deleteAchievementMutation =
    api.coachProfile.deleteAchievement.useMutation();

  const handleTest = async (
    testName: string,
    testFn: () => Promise<unknown>,
  ) => {
    setLoading((prev) => ({ ...prev, [testName]: true }));
    setErrors((prev) => ({ ...prev, [testName]: null }));

    try {
      const result = await testFn();
      setResults((prev) => ({ ...prev, [testName]: result }));
    } catch (error: unknown) {
      setErrors((prev) => ({ ...prev, [testName]: error }));
    } finally {
      setLoading((prev) => ({ ...prev, [testName]: false }));
    }
  };

  // Query Tests
  const testGetProfile = () => {
    return handleTest("getProfile", async () => {
      const result = await utils.coachProfile.getProfile.fetch();
      return result;
    });
  };

  const testGetBasicProfile = () => {
    return handleTest("getBasicProfile", async () => {
      const result = await utils.coachProfile.getBasicProfile.fetch();
      return result;
    });
  };

  const testGetSchoolInfo = () => {
    return handleTest("getSchoolInfo", async () => {
      const result = await utils.coachProfile.getSchoolInfo.fetch();
      return result;
    });
  };

  const testGetOnboardingStatus = () => {
    return handleTest("getOnboardingStatus", async () => {
      const result = await utils.coachProfile.getOnboardingStatus.fetch();
      return result;
    });
  };

  const testGetRecentActivity = () => {
    return handleTest("getRecentActivity", async () => {
      const result = await utils.coachProfile.getRecentActivity.fetch();
      return result;
    });
  };

  const testGetAchievements = () => {
    return handleTest("getAchievements", async () => {
      const result = await utils.coachProfile.getAchievements.fetch();
      return result;
    });
  };

  const testGetAvailableSchools = () => {
    return handleTest("getAvailableSchools", async () => {
      const result = await utils.coachProfile.getAvailableSchools.fetch();
      return result;
    });
  };

  // School Profile Query Tests
  const testSchoolProfileById = () => {
    return handleTest("schoolProfile.getById", async () => {
      if (!schoolQueryData.schoolId) {
        throw new Error("School ID is required");
      }
      const result = await utils.schoolProfile.getById.fetch({
        id: schoolQueryData.schoolId,
      });
      return result;
    });
  };

  const testSchoolProfileTryouts = () => {
    return handleTest("schoolProfile.getTryouts", async () => {
      if (!schoolQueryData.schoolId) {
        throw new Error("School ID is required");
      }
      const result = await utils.schoolProfile.getTryouts.fetch({
        schoolId: schoolQueryData.schoolId,
        limit: schoolQueryData.limit,
      });
      return result;
    });
  };

  const testSchoolProfileAnnouncements = () => {
    return handleTest("schoolProfile.getAnnouncements", async () => {
      if (!schoolQueryData.schoolId) {
        throw new Error("School ID is required");
      }
      const result = await utils.schoolProfile.getAnnouncements.fetch({
        schoolId: schoolQueryData.schoolId,
        limit: schoolQueryData.limit,
        ...(schoolQueryData.type &&
          schoolQueryData.type !== "all" && { type: schoolQueryData.type }),
      });
      return result;
    });
  };

  const testSchoolProfileStats = () => {
    return handleTest("schoolProfile.getStats", async () => {
      if (!schoolQueryData.schoolId) {
        throw new Error("School ID is required");
      }
      const result = await utils.schoolProfile.getStats.fetch({
        schoolId: schoolQueryData.schoolId,
      });
      return result;
    });
  };

  const testSchoolProfileDetailsForEdit = () => {
    return handleTest("schoolProfile.getDetailsForEdit", async () => {
      // This endpoint uses the coach's school from context, no parameters needed
      const result = await utils.schoolProfile.getDetailsForEdit.fetch();
      return result;
    });
  };

  // Mutation Tests
  const testUpdateProfile = () => {
    return handleTest("updateProfile", async () => {
      const result = await updateProfileMutation.mutateAsync(updateProfileData);
      return result;
    });
  };

  const testRequestSchoolAssociation = () => {
    return handleTest("requestSchoolAssociation", async () => {
      // Note: This test will show that this endpoint might not exist
      // We'll test what we can and show the error if it doesn't exist
      throw new Error("requestSchoolAssociation endpoint not found in router");
    });
  };

  const testRemoveSchoolAssociation = () => {
    return handleTest("removeSchoolAssociation", async () => {
      const result = await removeSchoolAssociationMutation.mutateAsync();
      return result;
    });
  };

  const testCreateAnnouncement = () => {
    return handleTest("createAnnouncement", async () => {
      const result =
        await createAnnouncementMutation.mutateAsync(announcementData);
      return result;
    });
  };

  const testUpdateAnnouncement = () => {
    return handleTest("updateAnnouncement", async () => {
      if (!announcementQuery.announcementId) {
        throw new Error("Announcement ID is required");
      }
      const result = await updateAnnouncementMutation.mutateAsync({
        id: announcementQuery.announcementId,
        ...announcementData,
      });
      return result;
    });
  };

  const testDeleteAnnouncement = () => {
    return handleTest("deleteAnnouncement", async () => {
      if (!announcementQuery.announcementId) {
        throw new Error("Announcement ID is required");
      }
      const result = await deleteAnnouncementMutation.mutateAsync({
        id: announcementQuery.announcementId,
      });
      return result;
    });
  };

  const testCreateAchievement = () => {
    return handleTest("createAchievement", async () => {
      if (!achievementData.date_achieved) {
        throw new Error("Date achieved is required");
      }
      const result = await createAchievementMutation.mutateAsync({
        title: achievementData.title,
        date_achieved: new Date(achievementData.date_achieved),
      });
      return result;
    });
  };

  const testUpdateAchievement = () => {
    return handleTest("updateAchievement", async () => {
      if (!achievementQuery.achievementId) {
        throw new Error("Achievement ID is required");
      }
      if (!achievementData.date_achieved) {
        throw new Error("Date achieved is required");
      }
      const result = await updateAchievementMutation.mutateAsync({
        id: achievementQuery.achievementId,
        title: achievementData.title,
        date_achieved: new Date(achievementData.date_achieved),
      });
      return result;
    });
  };

  const testDeleteAchievement = () => {
    return handleTest("deleteAchievement", async () => {
      if (!achievementQuery.achievementId) {
        throw new Error("Achievement ID is required");
      }
      const result = await deleteAchievementMutation.mutateAsync({
        id: achievementQuery.achievementId,
      });
      return result;
    });
  };

  const clearResults = () => {
    setResults({});
    setErrors({});
  };

  const formatResult = (data: unknown) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coach Profiles API Testing</h1>
          <p className="text-muted-foreground">
            Test coach profile endpoints, school associations, announcements,
            and achievements
          </p>
        </div>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Query Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Query Tests</CardTitle>
            <CardDescription>
              Test read-only endpoints that fetch coach profile data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Button
                onClick={testGetProfile}
                disabled={loading.getProfile}
                className="w-full justify-start"
              >
                {loading.getProfile ? "Testing..." : "Test getProfile"}
              </Button>

              <Button
                onClick={testGetBasicProfile}
                disabled={loading.getBasicProfile}
                className="w-full justify-start"
              >
                {loading.getBasicProfile
                  ? "Testing..."
                  : "Test getBasicProfile"}
              </Button>

              <Button
                onClick={testGetSchoolInfo}
                disabled={loading.getSchoolInfo}
                className="w-full justify-start"
              >
                {loading.getSchoolInfo ? "Testing..." : "Test getSchoolInfo"}
              </Button>

              <Button
                onClick={testGetOnboardingStatus}
                disabled={loading.getOnboardingStatus}
                className="w-full justify-start"
              >
                {loading.getOnboardingStatus
                  ? "Testing..."
                  : "Test getOnboardingStatus"}
              </Button>

              <Button
                onClick={testGetRecentActivity}
                disabled={loading.getRecentActivity}
                className="w-full justify-start"
              >
                {loading.getRecentActivity
                  ? "Testing..."
                  : "Test getRecentActivity"}
              </Button>

              <Button
                onClick={testGetAchievements}
                disabled={loading.getAchievements}
                className="w-full justify-start"
              >
                {loading.getAchievements
                  ? "Testing..."
                  : "Test getAchievements"}
              </Button>

              <Button
                onClick={testGetAvailableSchools}
                disabled={loading.getAvailableSchools}
                className="w-full justify-start"
              >
                {loading.getAvailableSchools
                  ? "Testing..."
                  : "Test getAvailableSchools"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Update Test */}
        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
            <CardDescription>Test profile update functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={updateProfileData.first_name}
                onChange={(e) =>
                  setUpdateProfileData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={updateProfileData.last_name}
                onChange={(e) =>
                  setUpdateProfileData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={updateProfileData.username}
                onChange={(e) =>
                  setUpdateProfileData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
              />
            </div>

            <Button
              onClick={testUpdateProfile}
              disabled={loading.updateProfile}
              className="w-full"
            >
              {loading.updateProfile ? "Testing..." : "Test updateProfile"}
            </Button>
          </CardContent>
        </Card>

        {/* School Association Tests */}
        <Card>
          <CardHeader>
            <CardTitle>School Association</CardTitle>
            <CardDescription>
              Test school association removal (request not available)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="school_id">School ID (for existing school)</Label>
              <Input
                id="school_id"
                value={schoolAssocData.school_id}
                onChange={(e) =>
                  setSchoolAssocData((prev) => ({
                    ...prev,
                    school_id: e.target.value,
                  }))
                }
                placeholder="UUID of existing school"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="request_message">Request Message</Label>
              <Textarea
                id="request_message"
                value={schoolAssocData.request_message}
                onChange={(e) =>
                  setSchoolAssocData((prev) => ({
                    ...prev,
                    request_message: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_new_school_request"
                checked={schoolAssocData.is_new_school_request}
                onChange={(e) =>
                  setSchoolAssocData((prev) => ({
                    ...prev,
                    is_new_school_request: e.target.checked,
                  }))
                }
              />
              <Label htmlFor="is_new_school_request">New School Request</Label>
            </div>

            {schoolAssocData.is_new_school_request && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="proposed_school_name">
                    Proposed School Name
                  </Label>
                  <Input
                    id="proposed_school_name"
                    value={schoolAssocData.proposed_school_name}
                    onChange={(e) =>
                      setSchoolAssocData((prev) => ({
                        ...prev,
                        proposed_school_name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="proposed_school_type">School Type</Label>
                  <Select
                    value={schoolAssocData.proposed_school_type}
                    onValueChange={(value) =>
                      setSchoolAssocData((prev) => ({
                        ...prev,
                        proposed_school_type: value as SchoolType,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
                      <SelectItem value="COLLEGE">College</SelectItem>
                      <SelectItem value="UNIVERSITY">University</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="proposed_school_location">Location</Label>
                  <Input
                    id="proposed_school_location"
                    value={schoolAssocData.proposed_school_location}
                    onChange={(e) =>
                      setSchoolAssocData((prev) => ({
                        ...prev,
                        proposed_school_location: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Button
                onClick={testRequestSchoolAssociation}
                disabled={loading.requestSchoolAssociation}
                className="w-full"
              >
                {loading.requestSchoolAssociation
                  ? "Testing..."
                  : "Test requestSchoolAssociation (will show error)"}
              </Button>

              <Button
                onClick={testRemoveSchoolAssociation}
                disabled={loading.removeSchoolAssociation}
                variant="destructive"
                className="w-full"
              >
                {loading.removeSchoolAssociation
                  ? "Testing..."
                  : "Test removeSchoolAssociation"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Announcement Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>
              Test announcement CRUD operations (via schoolProfile router)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="announcement_title">Title</Label>
              <Input
                id="announcement_title"
                value={announcementData.title}
                onChange={(e) =>
                  setAnnouncementData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcement_content">Content</Label>
              <Textarea
                id="announcement_content"
                value={announcementData.content}
                onChange={(e) =>
                  setAnnouncementData((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcement_type">Type</Label>
              <Select
                value={announcementData.type}
                onValueChange={(value) =>
                  setAnnouncementData((prev) => ({
                    ...prev,
                    type: value as AnnouncementType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="TRYOUT">Tryout</SelectItem>
                  <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                  <SelectItem value="FACILITY">Facility</SelectItem>
                  <SelectItem value="SCHOLARSHIP">Scholarship</SelectItem>
                  <SelectItem value="ALUMNI">Alumni</SelectItem>
                  <SelectItem value="EVENT">Event</SelectItem>
                  <SelectItem value="SEASON_REVIEW">Season Review</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_pinned"
                checked={announcementData.is_pinned}
                onChange={(e) =>
                  setAnnouncementData((prev) => ({
                    ...prev,
                    is_pinned: e.target.checked,
                  }))
                }
              />
              <Label htmlFor="is_pinned">Pinned</Label>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcement_id">
                Announcement ID (for update/delete)
              </Label>
              <Input
                id="announcement_id"
                value={announcementQuery.announcementId}
                onChange={(e) =>
                  setAnnouncementQuery((prev) => ({
                    ...prev,
                    announcementId: e.target.value,
                  }))
                }
                placeholder="UUID of announcement"
              />
            </div>

            <div className="grid gap-2">
              <Button
                onClick={testCreateAnnouncement}
                disabled={loading.createAnnouncement}
                className="w-full"
              >
                {loading.createAnnouncement
                  ? "Testing..."
                  : "Test createAnnouncement"}
              </Button>

              <Button
                onClick={testUpdateAnnouncement}
                disabled={loading.updateAnnouncement}
                className="w-full"
              >
                {loading.updateAnnouncement
                  ? "Testing..."
                  : "Test updateAnnouncement"}
              </Button>

              <Button
                onClick={testDeleteAnnouncement}
                disabled={loading.deleteAnnouncement}
                variant="destructive"
                className="w-full"
              >
                {loading.deleteAnnouncement
                  ? "Testing..."
                  : "Test deleteAnnouncement"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Test achievement CRUD operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="achievement_title">Title</Label>
              <Input
                id="achievement_title"
                value={achievementData.title}
                onChange={(e) =>
                  setAchievementData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="achievement_date_achieved">Date Achieved</Label>
              <Input
                id="achievement_date_achieved"
                type="date"
                value={achievementData.date_achieved}
                onChange={(e) =>
                  setAchievementData((prev) => ({
                    ...prev,
                    date_achieved: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="achievement_id">
                Achievement ID (for update/delete)
              </Label>
              <Input
                id="achievement_id"
                value={achievementQuery.achievementId}
                onChange={(e) =>
                  setAchievementQuery((prev) => ({
                    ...prev,
                    achievementId: e.target.value,
                  }))
                }
                placeholder="UUID of achievement"
              />
            </div>

            <div className="grid gap-2">
              <Button
                onClick={testCreateAchievement}
                disabled={loading.createAchievement}
                className="w-full"
              >
                {loading.createAchievement
                  ? "Testing..."
                  : "Test createAchievement"}
              </Button>

              <Button
                onClick={testUpdateAchievement}
                disabled={loading.updateAchievement}
                className="w-full"
              >
                {loading.updateAchievement
                  ? "Testing..."
                  : "Test updateAchievement"}
              </Button>

              <Button
                onClick={testDeleteAchievement}
                disabled={loading.deleteAchievement}
                variant="destructive"
                className="w-full"
              >
                {loading.deleteAchievement
                  ? "Testing..."
                  : "Test deleteAchievement"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* School Profile Query Tests */}
        <Card>
          <CardHeader>
            <CardTitle>School Profile Queries</CardTitle>
            <CardDescription>
              Test school profile related endpoints
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="school_query_id">School ID</Label>
              <Input
                id="school_query_id"
                value={schoolQueryData.schoolId}
                onChange={(e) =>
                  setSchoolQueryData((prev) => ({
                    ...prev,
                    schoolId: e.target.value,
                  }))
                }
                placeholder="UUID of school"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="school_query_limit">Limit</Label>
              <Input
                id="school_query_limit"
                type="number"
                value={schoolQueryData.limit}
                onChange={(e) =>
                  setSchoolQueryData((prev) => ({
                    ...prev,
                    limit: parseInt(e.target.value) || 10,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="school_query_type">
                Announcement Type (optional)
              </Label>
              <Select
                value={schoolQueryData.type}
                onValueChange={(value) =>
                  setSchoolQueryData((prev) => ({
                    ...prev,
                    type: value as AnnouncementType | "all" | "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="TRYOUT">Tryout</SelectItem>
                  <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Button
                onClick={testSchoolProfileById}
                disabled={loading["schoolProfile.getById"]}
                className="w-full"
              >
                {loading["schoolProfile.getById"]
                  ? "Testing..."
                  : "Test schoolProfile.getById"}
              </Button>

              <Button
                onClick={testSchoolProfileTryouts}
                disabled={loading["schoolProfile.getTryouts"]}
                className="w-full"
              >
                {loading["schoolProfile.getTryouts"]
                  ? "Testing..."
                  : "Test schoolProfile.getTryouts"}
              </Button>

              <Button
                onClick={testSchoolProfileAnnouncements}
                disabled={loading["schoolProfile.getAnnouncements"]}
                className="w-full"
              >
                {loading["schoolProfile.getAnnouncements"]
                  ? "Testing..."
                  : "Test schoolProfile.getAnnouncements"}
              </Button>

              <Button
                onClick={testSchoolProfileStats}
                disabled={loading["schoolProfile.getStats"]}
                className="w-full"
              >
                {loading["schoolProfile.getStats"]
                  ? "Testing..."
                  : "Test schoolProfile.getStats"}
              </Button>

              <Button
                onClick={testSchoolProfileDetailsForEdit}
                disabled={loading["schoolProfile.getDetailsForEdit"]}
                className="w-full"
              >
                {loading["schoolProfile.getDetailsForEdit"]
                  ? "Testing..."
                  : "Test schoolProfile.getDetailsForEdit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      {(Object.keys(results).length > 0 || Object.keys(errors).length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Results and errors from API tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results).map(([testName, result]) => (
                <div key={testName} className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold text-green-600">
                    ✅ {testName}
                  </h3>
                  <pre className="bg-muted max-h-96 overflow-auto rounded p-3 text-sm">
                    {formatResult(result)}
                  </pre>
                </div>
              ))}

              {Object.entries(errors).map(([testName, error]) => (
                <div key={testName} className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold text-red-600">
                    ❌ {testName}
                  </h3>
                  <pre className="max-h-96 overflow-auto rounded bg-red-50 p-3 text-sm text-red-800">
                    {formatResult(error)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
