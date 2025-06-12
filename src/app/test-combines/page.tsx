"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";

type EventType = "ONLINE" | "IN_PERSON" | "HYBRID";
type CombineStatus = "UPCOMING" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "IN_PROGRESS" | "COMPLETED";
type RegistrationStatus = "PENDING" | "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED";

export default function CombinesTestPage() {
  const { user } = useUser();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Form states for browse filters
  const [browseFilters, setBrowseFilters] = useState({
    game_id: "",
    type: "" as EventType | "",
    status: "" as CombineStatus | "",
    year: "",
    invite_only: undefined as boolean | undefined,
    upcoming_only: true,
    search: "",
    limit: 10,
    offset: 0,
  });

  // Form state for getByGame
  const [gameQuery, setGameQuery] = useState({
    game_id: "",
    limit: 5,
  });

  // Form state for getById
  const [combineId, setCombineId] = useState("");

  // Form state for getPlayerRegistrations
  const [registrationQuery, setRegistrationQuery] = useState({
    status: "all" as "upcoming" | "past" | "all",
    limit: 20,
  });

  // Form state for register
  const [registerData, setRegisterData] = useState({
    combine_id: "",
  });

  // Form state for cancelRegistration
  const [cancelData, setCancelData] = useState({
    registration_id: "",
  });

  // Form state for getRegistrationStatus
  const [statusQuery, setStatusQuery] = useState({
    combine_id: "",
  });

  // Form state for create combine (coaches only)
  const [createCombineData, setCreateCombineData] = useState({
    title: "Test Combine - VALORANT",
    description: "This is a test combine created from the development testing page.",
    long_description: "Extended description for the test combine. This includes detailed information about what to expect during the combine event.",
    game_id: "",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    location: "Online - Discord Server",
    type: "ONLINE" as EventType,
    year: new Date().getFullYear().toString(),
    max_spots: 32,
    prize_pool: "Scholarship Opportunities",
    format: "Swiss System",
    requirements: "All ranks welcome",
    invite_only: false,
    status: "UPCOMING" as "UPCOMING" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED",
  });

  // Form state for updateStatus (coaches only)
  const [updateStatusData, setUpdateStatusData] = useState({
    combine_id: "",
    status: "REGISTRATION_OPEN" as CombineStatus,
  });

  // Form state for updateRegistrationStatus (coaches only)
  const [updateRegStatusData, setUpdateRegStatusData] = useState({
    registration_id: "",
    status: "CONFIRMED" as RegistrationStatus,
    qualified: false,
  });

  // tRPC hooks
  const utils = api.useUtils();

  // Mutation hooks
  const registerMutation = api.combines.register.useMutation();
  const cancelRegistrationMutation = api.combines.cancelRegistration.useMutation();
  const createCombineMutation = api.combines.create.useMutation();
  const updateStatusMutation = api.combines.updateStatus.useMutation();
  const updateRegistrationStatusMutation = api.combines.updateRegistrationStatus.useMutation();

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

  // Query Tests
  const testBrowse = () => {
    return handleTest("browse", async () => {
      const filters = {
        ...browseFilters,
        type: browseFilters.type || undefined,
        status: browseFilters.status || undefined,
        game_id: browseFilters.game_id || undefined,
        year: browseFilters.year || undefined,
        search: browseFilters.search || undefined,
      };
      const result = await utils.combines.browse.fetch(filters);
      return result;
    });
  };

  const testGetByGame = () => {
    return handleTest("getByGame", async () => {
      if (!gameQuery.game_id) {
        throw new Error("Game ID is required");
      }
      const result = await utils.combines.getByGame.fetch(gameQuery);
      return result;
    });
  };

  const testGetById = () => {
    return handleTest("getById", async () => {
      if (!combineId) {
        throw new Error("Combine ID is required");
      }
      const result = await utils.combines.getById.fetch({ id: combineId });
      return result;
    });
  };

  const testGetPlayerRegistrations = () => {
    return handleTest("getPlayerRegistrations", async () => {
      const result = await utils.combines.getPlayerRegistrations.fetch(registrationQuery);
      return result;
    });
  };

  const testGetRegistrationStatus = () => {
    return handleTest("getRegistrationStatus", async () => {
      if (!statusQuery.combine_id) {
        throw new Error("Combine ID is required");
      }
      const result = await utils.combines.getRegistrationStatus.fetch(statusQuery);
      return result;
    });
  };

  // Mutation Tests
  const testRegister = () => {
    return handleTest("register", async () => {
      if (!registerData.combine_id) {
        throw new Error("Combine ID is required");
      }
      const result = await registerMutation.mutateAsync(registerData);
      return result;
    });
  };

  const testCancelRegistration = () => {
    return handleTest("cancelRegistration", async () => {
      if (!cancelData.registration_id) {
        throw new Error("Registration ID is required");
      }
      const result = await cancelRegistrationMutation.mutateAsync(cancelData);
      return result;
    });
  };

  const testCreateCombine = () => {
    return handleTest("createCombine", async () => {
      if (!createCombineData.game_id) {
        throw new Error("Game ID is required");
      }
      const combineData = {
        ...createCombineData,
        date: new Date(createCombineData.date ?? Date.now()),
      };
      const result = await createCombineMutation.mutateAsync(combineData);
      return result;
    });
  };

  const testUpdateStatus = () => {
    return handleTest("updateStatus", async () => {
      if (!updateStatusData.combine_id) {
        throw new Error("Combine ID is required");
      }
      const result = await updateStatusMutation.mutateAsync(updateStatusData);
      return result;
    });
  };

  const testUpdateRegistrationStatus = () => {
    return handleTest("updateRegistrationStatus", async () => {
      if (!updateRegStatusData.registration_id) {
        throw new Error("Registration ID is required");
      }
      const result = await updateRegistrationStatusMutation.mutateAsync(updateRegStatusData);
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
        <h1 className="text-3xl font-bold mb-2">Combines tRPC Test Page</h1>
        <p className="text-muted-foreground">Test all combines router endpoints</p>
        {user && (
          <p className="text-sm text-blue-600 mt-2">
            Logged in as: {user.emailAddresses[0]?.emailAddress}
          </p>
        )}
        {!user && (
          <p className="text-sm text-red-600 mt-2">
            Not logged in - you need to authenticate to test protected endpoints
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Browse Combines */}
        <Card>
          <CardHeader>
            <CardTitle>Browse Combines</CardTitle>
            <CardDescription>Test browsing with filters (Public)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="game_id">Game ID (UUID)</Label>
                <Input
                  id="game_id"
                  value={browseFilters.game_id}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, game_id: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  value={browseFilters.year}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, year: e.target.value }))}
                  placeholder="2025"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={browseFilters.type}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, type: e.target.value as EventType | "" }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Types</option>
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In-Person</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={browseFilters.status}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, status: e.target.value as CombineStatus | "" }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="REGISTRATION_OPEN">Registration Open</option>
                  <option value="REGISTRATION_CLOSED">Registration Closed</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={browseFilters.search}
                onChange={(e) => setBrowseFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search title, description..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={browseFilters.invite_only === true}
                  onChange={(e) => setBrowseFilters(prev => ({ 
                    ...prev, 
                    invite_only: e.target.checked ? true : undefined 
                  }))}
                />
                <span className="text-sm">Invite Only</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={browseFilters.upcoming_only}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, upcoming_only: e.target.checked }))}
                />
                <span className="text-sm">Upcoming Only</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="limit">Limit</Label>
                <Input
                  id="limit"
                  type="number"
                  value={browseFilters.limit}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, limit: parseInt(e.target.value) || 10 }))}
                />
              </div>
              <div>
                <Label htmlFor="offset">Offset</Label>
                <Input
                  id="offset"
                  type="number"
                  value={browseFilters.offset}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, offset: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Button 
              onClick={testBrowse}
              disabled={loading.browse}
              className="w-full"
            >
              {loading.browse ? "Loading..." : "Test Browse"}
            </Button>
          </CardContent>
        </Card>

        {/* Get By Game */}
        <Card>
          <CardHeader>
            <CardTitle>Get Combines by Game</CardTitle>
            <CardDescription>Test getting combines for a specific game (Public)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="game_query_id">Game ID (Required)</Label>
              <Input
                id="game_query_id"
                value={gameQuery.game_id}
                onChange={(e) => setGameQuery(prev => ({ ...prev, game_id: e.target.value }))}
                placeholder="UUID of game"
              />
            </div>
            
            <div>
              <Label htmlFor="game_limit">Limit</Label>
              <Input
                id="game_limit"
                type="number"
                value={gameQuery.limit}
                onChange={(e) => setGameQuery(prev => ({ ...prev, limit: parseInt(e.target.value) || 5 }))}
              />
            </div>
            
            <Button 
              onClick={testGetByGame}
              disabled={loading.getByGame}
              className="w-full"
            >
              {loading.getByGame ? "Loading..." : "Test Get by Game"}
            </Button>
          </CardContent>
        </Card>

        {/* Get By ID */}
        <Card>
          <CardHeader>
            <CardTitle>Get Combine Details</CardTitle>
            <CardDescription>Test getting single combine details (Public)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="combine_id">Combine ID (Required)</Label>
              <Input
                id="combine_id"
                value={combineId}
                onChange={(e) => setCombineId(e.target.value)}
                placeholder="UUID of combine"
              />
            </div>
            
            <Button 
              onClick={testGetById}
              disabled={loading.getById}
              className="w-full"
            >
              {loading.getById ? "Loading..." : "Test Get by ID"}
            </Button>
          </CardContent>
        </Card>

        {/* Player Registrations */}
        <Card>
          <CardHeader>
            <CardTitle>Player Registrations</CardTitle>
            <CardDescription>Test getting player&apos;s combine registrations (Player Only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reg_status">Status Filter</Label>
              <select
                id="reg_status"
                value={registrationQuery.status}
                onChange={(e) => setRegistrationQuery(prev => ({ ...prev, status: e.target.value as "upcoming" | "past" | "all" }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="reg_limit">Limit</Label>
              <Input
                id="reg_limit"
                type="number"
                value={registrationQuery.limit}
                onChange={(e) => setRegistrationQuery(prev => ({ ...prev, limit: parseInt(e.target.value) || 20 }))}
              />
            </div>
            
            <Button 
              onClick={testGetPlayerRegistrations}
              disabled={loading.getPlayerRegistrations}
              className="w-full"
            >
              {loading.getPlayerRegistrations ? "Loading..." : "Test Player Registrations"}
            </Button>
          </CardContent>
        </Card>

        {/* Register for Combine */}
        <Card>
          <CardHeader>
            <CardTitle>Register for Combine</CardTitle>
            <CardDescription>Test registering for a combine (Player Only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="register_combine_id">Combine ID (Required)</Label>
              <Input
                id="register_combine_id"
                value={registerData.combine_id}
                onChange={(e) => setRegisterData(prev => ({ ...prev, combine_id: e.target.value }))}
                placeholder="UUID of combine"
              />
            </div>
            
            <Button 
              onClick={testRegister}
              disabled={loading.register}
              className="w-full"
            >
              {loading.register ? "Loading..." : "Test Register"}
            </Button>
          </CardContent>
        </Card>

        {/* Cancel Registration */}
        <Card>
          <CardHeader>
            <CardTitle>Cancel Registration</CardTitle>
            <CardDescription>Test canceling a registration (Player Only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cancel_registration_id">Registration ID (Required)</Label>
              <Input
                id="cancel_registration_id"
                value={cancelData.registration_id}
                onChange={(e) => setCancelData(prev => ({ ...prev, registration_id: e.target.value }))}
                placeholder="UUID of registration"
              />
            </div>
            
            <Button 
              onClick={testCancelRegistration}
              disabled={loading.cancelRegistration}
              variant="destructive"
              className="w-full"
            >
              {loading.cancelRegistration ? "Loading..." : "Test Cancel Registration"}
            </Button>
          </CardContent>
        </Card>

        {/* Registration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Get Registration Status</CardTitle>
            <CardDescription>Test checking registration status for a combine (Player Only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status_combine_id">Combine ID (Required)</Label>
              <Input
                id="status_combine_id"
                value={statusQuery.combine_id}
                onChange={(e) => setStatusQuery(prev => ({ ...prev, combine_id: e.target.value }))}
                placeholder="UUID of combine"
              />
            </div>
            
            <Button 
              onClick={testGetRegistrationStatus}
              disabled={loading.getRegistrationStatus}
              className="w-full"
            >
              {loading.getRegistrationStatus ? "Loading..." : "Test Registration Status"}
            </Button>
          </CardContent>
        </Card>

        {/* Create Combine (Coaches Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Create Combine (Coaches Only)</CardTitle>
            <CardDescription>Test creating a new combine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_title">Title</Label>
                <Input
                  id="create_title"
                  value={createCombineData.title}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create_game_id">Game ID (Required)</Label>
                <Input
                  id="create_game_id"
                  value={createCombineData.game_id}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, game_id: e.target.value }))}
                  placeholder="UUID of game"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="create_description">Description</Label>
              <Input
                id="create_description"
                value={createCombineData.description}
                onChange={(e) => setCreateCombineData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_date">Date</Label>
                <Input
                  id="create_date"
                  type="date"
                  value={createCombineData.date}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create_type">Type</Label>
                <select
                  id="create_type"
                  value={createCombineData.type}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, type: e.target.value as EventType }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="ONLINE">Online</option>
                  <option value="IN_PERSON">In-Person</option>
                  <option value="HYBRID">Hybrid</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_location">Location</Label>
                <Input
                  id="create_location"
                  value={createCombineData.location}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create_year">Year</Label>
                <Input
                  id="create_year"
                  value={createCombineData.year}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, year: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_max_spots">Max Spots</Label>
                <Input
                  id="create_max_spots"
                  type="number"
                  value={createCombineData.max_spots}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, max_spots: parseInt(e.target.value) || 32 }))}
                />
              </div>
              <div>
                <Label htmlFor="create_prize_pool">Prize Pool</Label>
                <Input
                  id="create_prize_pool"
                  value={createCombineData.prize_pool}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, prize_pool: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_format">Format</Label>
                <Input
                  id="create_format"
                  value={createCombineData.format}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, format: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create_status">Initial Status</Label>
                <select
                  id="create_status"
                  value={createCombineData.status}
                  onChange={(e) => setCreateCombineData(prev => ({ ...prev, status: e.target.value as "UPCOMING" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="REGISTRATION_OPEN">Registration Open</option>
                  <option value="REGISTRATION_CLOSED">Registration Closed</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="create_requirements">Requirements</Label>
              <Input
                id="create_requirements"
                value={createCombineData.requirements}
                onChange={(e) => setCreateCombineData(prev => ({ ...prev, requirements: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create_invite_only"
                checked={createCombineData.invite_only}
                onChange={(e) => setCreateCombineData(prev => ({ ...prev, invite_only: e.target.checked }))}
              />
              <Label htmlFor="create_invite_only">Invite Only</Label>
            </div>
            
            <Button 
              onClick={testCreateCombine}
              disabled={loading.createCombine}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading.createCombine ? "Loading..." : "Test Create Combine"}
            </Button>
          </CardContent>
        </Card>

        {/* Update Combine Status (Coaches Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Update Combine Status (Coaches Only)</CardTitle>
            <CardDescription>Test updating a combine status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="update_combine_id">Combine ID (Required)</Label>
              <Input
                id="update_combine_id"
                value={updateStatusData.combine_id}
                onChange={(e) => setUpdateStatusData(prev => ({ ...prev, combine_id: e.target.value }))}
                placeholder="UUID of combine"
              />
            </div>
            
            <div>
              <Label htmlFor="update_combine_status">New Status</Label>
              <select
                id="update_combine_status"
                value={updateStatusData.status}
                onChange={(e) => setUpdateStatusData(prev => ({ ...prev, status: e.target.value as CombineStatus }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="REGISTRATION_OPEN">Registration Open</option>
                <option value="REGISTRATION_CLOSED">Registration Closed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            <Button 
              onClick={testUpdateStatus}
              disabled={loading.updateStatus}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading.updateStatus ? "Loading..." : "Test Update Status"}
            </Button>
          </CardContent>
        </Card>

        {/* Update Registration Status (Coaches Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Update Registration Status (Coaches Only)</CardTitle>
            <CardDescription>Test updating a registration status and qualification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="update_reg_id">Registration ID (Required)</Label>
              <Input
                id="update_reg_id"
                value={updateRegStatusData.registration_id}
                onChange={(e) => setUpdateRegStatusData(prev => ({ ...prev, registration_id: e.target.value }))}
                placeholder="UUID of registration"
              />
            </div>
            
            <div>
              <Label htmlFor="update_reg_status">New Status</Label>
              <select
                id="update_reg_status"
                value={updateRegStatusData.status}
                onChange={(e) => setUpdateRegStatusData(prev => ({ ...prev, status: e.target.value as RegistrationStatus }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="DECLINED">Declined</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="update_qualified"
                checked={updateRegStatusData.qualified}
                onChange={(e) => setUpdateRegStatusData(prev => ({ ...prev, qualified: e.target.checked }))}
              />
              <Label htmlFor="update_qualified">Qualified</Label>
            </div>
            
            <Button 
              onClick={testUpdateRegistrationStatus}
              disabled={loading.updateRegistrationStatus}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading.updateRegistrationStatus ? "Loading..." : "Test Update Registration Status"}
            </Button>
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