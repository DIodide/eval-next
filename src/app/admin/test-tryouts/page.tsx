"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUser } from "@clerk/nextjs";
import { TRPCError } from "@trpc/server";

type EventType = "ONLINE" | "IN_PERSON" | "HYBRID";
type RegistrationStatus = "PENDING" | "CONFIRMED" | "WAITLISTED" | "DECLINED" | "CANCELLED";

export default function TryoutsTestPage() {
  const { user } = useUser();
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Form states for browse filters
  const [browseFilters, setBrowseFilters] = useState({
    game_id: "",
    school_id: "",
    type: "" as EventType | "",
    state: "",
    free_only: false,
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
  const [tryoutId, setTryoutId] = useState("");

  // Form state for getPlayerRegistrations
  const [registrationQuery, setRegistrationQuery] = useState({
    status: "all" as "upcoming" | "past" | "all",
    limit: 20,
  });

  // Form state for register
  const [registerData, setRegisterData] = useState({
    tryout_id: "",
    notes: "Test registration from development",
  });

  // Form state for cancelRegistration
  const [cancelData, setCancelData] = useState({
    registration_id: "",
  });

  // Form state for getRegistrationStatus
  const [statusQuery, setStatusQuery] = useState({
    tryout_id: "",
  });

  // Form state for create tryout (coaches only)
  const [createTryoutData, setCreateTryoutData] = useState({
    title: "Test Tryout - VALORANT",
    description: "This is a test tryout created from the development testing page.",
    long_description: "Extended description for the test tryout. This includes detailed information about what to expect during the tryout process.",
    game_id: "",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    time_start: "14:00",
    time_end: "17:00",
    location: "Online - Discord Server",
    type: "ONLINE" as EventType,
    price: "Free",
    max_spots: 20,
    registration_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
    min_gpa: 3.0,
    class_years: ["Freshman", "Sophomore", "Junior", "Senior"],
    required_roles: ["All roles"],
  });

  // Form state for updateRegistrationStatus (coaches only)
  const [updateStatusData, setUpdateStatusData] = useState({
    registration_id: "",
    status: "CONFIRMED" as RegistrationStatus,
  });

  // tRPC hooks
  const utils = api.useUtils();

  // Mutation hooks
  const registerMutation = api.tryouts.register.useMutation();
  const cancelRegistrationMutation = api.tryouts.cancelRegistration.useMutation();
  const createTryoutMutation = api.tryouts.create.useMutation();
  const updateRegistrationStatusMutation = api.tryouts.updateRegistrationStatus.useMutation();

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
        game_id: browseFilters.game_id || undefined,
        school_id: browseFilters.school_id || undefined,
        state: browseFilters.state || undefined,
        search: browseFilters.search || undefined,
      };
      const result = await utils.tryouts.browse.fetch(filters);
      return result;
    });
  };

  const testGetByGame = () => {
    return handleTest("getByGame", async () => {
      if (!gameQuery.game_id) {
        throw new Error("Game ID is required");
      }
      const result = await utils.tryouts.getByGame.fetch(gameQuery);
      return result;
    });
  };

  const testGetById = () => {
    return handleTest("getById", async () => {
      if (!tryoutId) {
        throw new Error("Tryout ID is required");
      }
      const result = await utils.tryouts.getById.fetch({ id: tryoutId });
      return result;
    });
  };

  const testGetPlayerRegistrations = () => {
    return handleTest("getPlayerRegistrations", async () => {
      const result = await utils.tryouts.getPlayerRegistrations.fetch(registrationQuery);
      return result;
    });
  };

  const testGetRegistrationStatus = () => {
    return handleTest("getRegistrationStatus", async () => {
      if (!statusQuery.tryout_id) {
        throw new Error("Tryout ID is required");
      }
      const result = await utils.tryouts.getRegistrationStatus.fetch(statusQuery);
      return result;
    });
  };

  // Mutation Tests
  const testRegister = () => {
    return handleTest("register", async () => {
      if (!registerData.tryout_id) {
        throw new Error("Tryout ID is required");
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

  const testCreateTryout = () => {
    return handleTest("createTryout", async () => {
      if (!createTryoutData.game_id) {
        throw new Error("Game ID is required");
      }
      const tryoutData = {
        ...createTryoutData,
        date: new Date(createTryoutData.date ?? Date.now()),
        registration_deadline: createTryoutData.registration_deadline && createTryoutData.registration_deadline.trim() !== "" ? 
          new Date(createTryoutData.registration_deadline) : undefined,
      };
      const result = await createTryoutMutation.mutateAsync(tryoutData);
      return result;
    });
  };

  const testUpdateRegistrationStatus = () => {
    return handleTest("updateRegistrationStatus", async () => {
      if (!updateStatusData.registration_id) {
        throw new Error("Registration ID is required");
      }
      const result = await updateRegistrationStatusMutation.mutateAsync(updateStatusData);
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
        <h1 className="text-3xl font-bold mb-2">Tryouts tRPC Test Page</h1>
        <p className="text-muted-foreground">Test all tryouts router endpoints</p>
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
        {/* Browse Tryouts */}
        <Card>
          <CardHeader>
            <CardTitle>Browse Tryouts</CardTitle>
            <CardDescription>Test browsing with filters</CardDescription>
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
                <Label htmlFor="school_id">School ID (UUID)</Label>
                <Input
                  id="school_id"
                  value={browseFilters.school_id}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, school_id: e.target.value }))}
                  placeholder="Optional"
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
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={browseFilters.state}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="CA, NY, TX..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                value={browseFilters.search}
                onChange={(e) => setBrowseFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search title, description, school..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={browseFilters.free_only}
                  onChange={(e) => setBrowseFilters(prev => ({ ...prev, free_only: e.target.checked }))}
                />
                <span className="text-sm">Free Only</span>
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
            <CardTitle>Get Tryouts by Game</CardTitle>
            <CardDescription>Test getting tryouts for a specific game</CardDescription>
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
            <CardTitle>Get Tryout Details</CardTitle>
            <CardDescription>Test getting single tryout details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tryout_id">Tryout ID (Required)</Label>
              <Input
                id="tryout_id"
                value={tryoutId}
                onChange={(e) => setTryoutId(e.target.value)}
                placeholder="UUID of tryout"
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
            <CardDescription>Test getting player&apos;s tryout registrations (dashboard)</CardDescription>
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

        {/* Register for Tryout */}
        <Card>
          <CardHeader>
            <CardTitle>Register for Tryout</CardTitle>
            <CardDescription>Test registering for a tryout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="register_tryout_id">Tryout ID (Required)</Label>
              <Input
                id="register_tryout_id"
                value={registerData.tryout_id}
                onChange={(e) => setRegisterData(prev => ({ ...prev, tryout_id: e.target.value }))}
                placeholder="UUID of tryout"
              />
            </div>
            
            <div>
              <Label htmlFor="register_notes">Notes (Optional)</Label>
              <Input
                id="register_notes"
                value={registerData.notes}
                onChange={(e) => setRegisterData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
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
            <CardDescription>Test canceling a registration</CardDescription>
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
            <CardDescription>Test checking registration status for a tryout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status_tryout_id">Tryout ID (Required)</Label>
              <Input
                id="status_tryout_id"
                value={statusQuery.tryout_id}
                onChange={(e) => setStatusQuery(prev => ({ ...prev, tryout_id: e.target.value }))}
                placeholder="UUID of tryout"
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

        {/* Create Tryout (Coaches Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Create Tryout (Coaches Only)</CardTitle>
            <CardDescription>Test creating a new tryout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_title">Title</Label>
                <Input
                  id="create_title"
                  value={createTryoutData.title}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create_game_id">Game ID (Required)</Label>
                <Input
                  id="create_game_id"
                  value={createTryoutData.game_id}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, game_id: e.target.value }))}
                  placeholder="UUID of game"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="create_description">Description</Label>
              <Input
                id="create_description"
                value={createTryoutData.description}
                onChange={(e) => setCreateTryoutData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_date">Date</Label>
                <Input
                  id="create_date"
                  type="date"
                  value={createTryoutData.date}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create_type">Type</Label>
                <select
                  id="create_type"
                  value={createTryoutData.type}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, type: e.target.value as EventType }))}
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
                  value={createTryoutData.location}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="create_price">Price</Label>
                <Input
                  id="create_price"
                  value={createTryoutData.price}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="create_max_spots">Max Spots</Label>
                <Input
                  id="create_max_spots"
                  type="number"
                  value={createTryoutData.max_spots}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, max_spots: parseInt(e.target.value) || 20 }))}
                />
              </div>
              <div>
                <Label htmlFor="create_min_gpa">Min GPA</Label>
                <Input
                  id="create_min_gpa"
                  type="number"
                  step="0.1"
                  value={createTryoutData.min_gpa}
                  onChange={(e) => setCreateTryoutData(prev => ({ ...prev, min_gpa: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <Button 
              onClick={testCreateTryout}
              disabled={loading.createTryout}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading.createTryout ? "Loading..." : "Test Create Tryout"}
            </Button>
          </CardContent>
        </Card>

        {/* Update Registration Status (Coaches Only) */}
        <Card>
          <CardHeader>
            <CardTitle>Update Registration Status (Coaches Only)</CardTitle>
            <CardDescription>Test updating a registration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="update_registration_id">Registration ID (Required)</Label>
              <Input
                id="update_registration_id"
                value={updateStatusData.registration_id}
                onChange={(e) => setUpdateStatusData(prev => ({ ...prev, registration_id: e.target.value }))}
                placeholder="UUID of registration"
              />
            </div>
            
            <div>
              <Label htmlFor="update_status">New Status</Label>
              <select
                id="update_status"
                value={updateStatusData.status}
                onChange={(e) => setUpdateStatusData(prev => ({ ...prev, status: e.target.value as RegistrationStatus }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="WAITLISTED">Waitlisted</option>
                <option value="DECLINED">Declined</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <Button 
              onClick={testUpdateRegistrationStatus}
              disabled={loading.updateRegistrationStatus}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              {loading.updateRegistrationStatus ? "Loading..." : "Test Update Status"}
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