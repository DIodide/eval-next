"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy,
  Eye,
  Power,
  PowerOff
} from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type CombineStatus = "UPCOMING" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "IN_PROGRESS" | "COMPLETED";
type EventType = "ONLINE" | "IN_PERSON" | "HYBRID";

// Validation schema matching the API
const createCombineSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be less than 500 characters"),
  long_description: z.string().optional(),
  game_id: z.string().min(1, "Game selection is required"),
  date: z.date({ required_error: "Date is required" }),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  location: z.string().min(5, "Location must be at least 5 characters").max(200, "Location must be less than 200 characters"),
  type: z.enum(["ONLINE", "IN_PERSON", "HYBRID"]),
  year: z.string().min(4, "Year is required"),
  max_spots: z.number().int().min(1, "Max spots must be between 1 and 1000").max(1000, "Max spots must be between 1 and 1000"),
  registration_deadline: z.date().optional(),
  min_gpa: z.number().min(0).max(4.0).optional(),
  class_years: z.array(z.string()).default([]),
  required_roles: z.array(z.string()).default([]),
  prize_pool: z.string().default("TBD"),
  status: z.enum(["UPCOMING", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "IN_PROGRESS", "COMPLETED"]).default("UPCOMING"),
  requirements: z.string().default("None specified"),
  invite_only: z.boolean().default(false),
});

type CreateCombineData = z.infer<typeof createCombineSchema>;

export default function AdminCombinesPage() {
  const { toast } = useToast();
  
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CombineStatus | "ALL">("ALL");
  const [gameFilter, setGameFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<EventType | "ALL">("ALL");
  const [yearFilter, setYearFilter] = useState<string>("ALL");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCombine, setEditingCombine] = useState<string | null>(null);
  const [selectedCombine, setSelectedCombine] = useState<string | null>(null);

  // Form state
  const [createForm, setCreateForm] = useState<CreateCombineData>({
    title: "",
    description: "",
    long_description: "",
    game_id: "",
    date: new Date(),
    time_start: "",
    time_end: "",
    location: "",
    type: "ONLINE",
    year: new Date().getFullYear().toString(),
    max_spots: 32,
    registration_deadline: undefined,
    min_gpa: undefined,
    class_years: [],
    required_roles: [],
    prize_pool: "TBD",
    status: "UPCOMING",
    requirements: "None specified",
    invite_only: false,
  });

  // Form validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // API queries and mutations
  const { data: games = [] } = api.playerProfile.getAvailableGames.useQuery();
  
  const { data: combinesData, refetch: refetchCombines } = api.combines.getAllForAdmin.useQuery({
    search: searchTerm || undefined,
    game_id: gameFilter !== "ALL" ? gameFilter : undefined,
    type: typeFilter !== "ALL" ? typeFilter : undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    year: yearFilter !== "ALL" ? yearFilter : undefined,
    page: 1,
    limit: 50
  });
  
  const createCombineMutation = api.combines.create.useMutation({
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Combine created successfully!" 
      });
      resetForm();
      setShowCreateDialog(false);
      void refetchCombines();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create combine",
        variant: "destructive" 
      });
    }
  });

  // Helper functions
  const resetForm = () => {
    setCreateForm({
      title: "",
      description: "",
      long_description: "",
      game_id: "",
      date: new Date(),
      time_start: "",
      time_end: "",
      location: "",
      type: "ONLINE",
      year: new Date().getFullYear().toString(),
      max_spots: 32,
      registration_deadline: undefined,
      min_gpa: undefined,
      class_years: [],
      required_roles: [],
      prize_pool: "TBD",
      status: "UPCOMING",
      requirements: "None specified",
      invite_only: false,
    });
    setValidationErrors({});
  };

  // Instant field validation like tryouts
  const validateField = (fieldName: string, value: string | number | Date | undefined | null) => {
    const errors: Record<string, string> = {};

    switch (fieldName) {
      case 'title':
        if (typeof value === 'string' && value.length < 5) {
          errors.title = "Title must be at least 5 characters";
        } else if (typeof value === 'string' && value.length > 200) {
          errors.title = "Title must be less than 200 characters";
        }
        break;
      
      case 'description':
        if (typeof value === 'string' && value.length < 10) {
          errors.description = "Description must be at least 10 characters";
        } else if (typeof value === 'string' && value.length > 500) {
          errors.description = "Description must be less than 500 characters";
        }
        break;
      
      case 'location':
        if (typeof value === 'string' && value.length < 5) {
          errors.location = "Location must be at least 5 characters";
        } else if (typeof value === 'string' && value.length > 200) {
          errors.location = "Location must be less than 200 characters";
        }
        break;
      
      case 'max_spots':
        if (typeof value === 'number' && (value < 1 || value > 1000)) {
          errors.max_spots = "Max spots must be between 1 and 1000";
        }
        break;
      
      case 'year':
        if (typeof value === 'string' && value.length < 4) {
          errors.year = "Year must be 4 digits";
        }
        break;
      
      case 'date':
        if (value instanceof Date && value < new Date()) {
          errors.date = "Date must be in the future";
        }
        break;
      
      case 'registration_deadline':
        if (value instanceof Date && createForm.date && value > createForm.date) {
          errors.registration_deadline = "Deadline must be before combine date";
        }
        break;
    }

    return errors;
  };

  // Update validation errors when fields change
  const handleFieldChange = (fieldName: string, value: string | number | Date | undefined | null) => {
    setCreateForm(prev => ({ ...prev, [fieldName]: value }));
    
    // Clear existing error for this field
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });

    // Validate field and set new errors
    const fieldErrors = validateField(fieldName, value);
    if (Object.keys(fieldErrors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...fieldErrors }));
    }

    // Also validate registration deadline if date changes
    if (fieldName === 'date' && createForm.registration_deadline) {
      const deadlineErrors = validateField('registration_deadline', createForm.registration_deadline);
      if (Object.keys(deadlineErrors).length > 0) {
        setValidationErrors(prev => ({ ...prev, ...deadlineErrors }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.registration_deadline;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    try {
      createCombineSchema.parse(createForm);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleCreateCombine = () => {
    if (!validateForm()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fix the errors in the form",
        variant: "destructive" 
      });
      return;
    }

    createCombineMutation.mutate(createForm);
  };

  const handleDeleteCombine = (combineId: string) => {
    if (confirm("Are you sure you want to delete this combine? This action cannot be undone.")) {
      // Add delete mutation when needed
      console.log("Delete combine:", combineId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStatusColor = (status: CombineStatus) => {
    switch (status) {
      case "UPCOMING": return "bg-blue-600 text-blue-100";
      case "REGISTRATION_OPEN": return "bg-green-600 text-green-100";
      case "REGISTRATION_CLOSED": return "bg-yellow-600 text-yellow-100";
      case "IN_PROGRESS": return "bg-purple-600 text-purple-100";
      case "COMPLETED": return "bg-gray-600 text-gray-100";
      default: return "bg-gray-600 text-gray-100";
    }
  };

  const getTypeIcon = (type: EventType) => {
    switch (type) {
      case "ONLINE": return "🌐";
      case "IN_PERSON": return "📍";
      case "HYBRID": return "🔄";
      default: return "❓";
    }
  };

  // Mock data for testing
  const mockGames = [
    { id: "1", name: "VALORANT" },
    { id: "2", name: "Overwatch 2" },
    { id: "3", name: "Rocket League" },
    { id: "4", name: "Super Smash Bros. Ultimate" },
  ];

  const mockCombines = [
    {
      id: "1",
      title: "VALORANT Spring Regional Combine",
      description: "Elite VALORANT combine showcasing the region's top competitive talent.",
      status: "REGISTRATION_OPEN" as CombineStatus,
      type: "ONLINE" as EventType,
      date: new Date("2024-04-15T09:00:00"),
      location: "Online - Custom Servers",
      max_spots: 64,
      _count: { registrations: 23 },
      game: { id: "1", name: "VALORANT" },
      invite_only: false,
      year: "2024",
    },
    {
      id: "2", 
      title: "Overwatch 2 Tank Mastery Combine",
      description: "Premier Overwatch 2 combine focusing on tank role mastery.",
      status: "UPCOMING" as CombineStatus,
      type: "HYBRID" as EventType,
      date: new Date("2024-05-01T10:00:00"),
      location: "University Gaming Center",
      max_spots: 32,
      _count: { registrations: 0 },
      game: { id: "2", name: "Overwatch 2" },
      invite_only: true,
      year: "2024",
    },
    {
      id: "3",
      title: "Rocket League Championship Combine",
      description: "High-stakes Rocket League combine for championship-level players.",
      status: "COMPLETED" as CombineStatus,
      type: "IN_PERSON" as EventType,
      date: new Date("2024-03-20T14:00:00"),
      location: "Esports Arena - Downtown",
      max_spots: 48,
      _count: { registrations: 48 },
      game: { id: "3", name: "Rocket League" },
      invite_only: false,
      year: "2024",
    },
    {
      id: "4",
      title: "Smash Ultimate Winter Series",
      description: "Ultimate fighting game combine featuring the best Smash players.",
      status: "REGISTRATION_CLOSED" as CombineStatus,
      type: "ONLINE" as EventType,
      date: new Date("2025-01-15T11:00:00"),
      location: "Online - Tournament Platform",
      max_spots: 24,
      _count: { registrations: 18 },
      game: { id: "4", name: "Super Smash Bros. Ultimate" },
      invite_only: true,
      year: "2025",
    },
  ];

  // Use real data from API
  const combines = combinesData?.combines ?? [];
  const totalCombines = combinesData?.total ?? 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">EVAL Combines Management</h1>
          <p className="text-gray-300">Create and manage competitive combines</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
              <Plus className="h-4 w-4" />
              Create Combine
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Combine</DialogTitle>
              <DialogDescription className="text-gray-300">
                Set up a new EVAL combine for competitive assessment
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-gray-300">Title *</Label>
                <Input
                  id="title"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                    validationErrors.title ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={createForm.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g., VALORANT Spring Regional Combine"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {createForm.title.length}/200 characters
                  </p>
                  {validationErrors.title && (
                    <p className="text-xs text-red-400">{validationErrors.title}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="game" className="text-gray-300">Game *</Label>
                <Select 
                  value={createForm.game_id} 
                  onValueChange={(value) => handleFieldChange('game_id', value)}
                >
                  <SelectTrigger className={`bg-gray-700 border-gray-600 text-white ${
                    validationErrors.game_id ? "border-red-500" : ""
                  }`}>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white hover:bg-gray-700">
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.game_id && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.game_id}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type" className="text-gray-300">Event Type *</Label>
                <Select 
                  value={createForm.type} 
                  onValueChange={(value: EventType) => handleFieldChange('type', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="ONLINE" className="text-white hover:bg-gray-700">🌐 Online</SelectItem>
                    <SelectItem value="IN_PERSON" className="text-white hover:bg-gray-700">📍 In Person</SelectItem>
                    <SelectItem value="HYBRID" className="text-white hover:bg-gray-700">🔄 Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date" className="text-gray-300">Date & Time *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  className={`bg-gray-700 border-gray-600 text-white ${
                    validationErrors.date ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={createForm.date.toISOString().slice(0, 16)}
                  onChange={(e) => handleFieldChange('date', new Date(e.target.value))}
                />
                {validationErrors.date && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location" className="text-gray-300">Location *</Label>
                <Input
                  id="location"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                    validationErrors.location ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={createForm.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="e.g., Online - Custom Servers"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {createForm.location.length}/200 characters
                  </p>
                  {validationErrors.location && (
                    <p className="text-xs text-red-400">{validationErrors.location}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="max_spots" className="text-gray-300">Max Spots</Label>
                <Input
                  id="max_spots"
                  type="number"
                  min="1"
                  max="1000"
                  className={`bg-gray-700 border-gray-600 text-white ${
                    validationErrors.max_spots ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={createForm.max_spots ?? ""}
                  onChange={(e) => handleFieldChange('max_spots', e.target.value ? parseInt(e.target.value) : undefined)}
                />
                {validationErrors.max_spots && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.max_spots}</p>
                )}
              </div>

              <div>
                <Label htmlFor="year" className="text-gray-300">Year *</Label>
                <Input
                  id="year"
                  className={`bg-gray-700 border-gray-600 text-white ${
                    validationErrors.year ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={createForm.year}
                  onChange={(e) => handleFieldChange('year', e.target.value)}
                />
                {validationErrors.year && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.year}</p>
                )}
              </div>

              <div>
                <Label htmlFor="registration_deadline" className="text-gray-300">Registration Deadline</Label>
                <Input
                  id="registration_deadline"
                  type="datetime-local"
                  className={`bg-gray-700 border-gray-600 text-white ${
                    validationErrors.registration_deadline ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={createForm.registration_deadline?.toISOString().slice(0, 16) ?? ""}
                  onChange={(e) => handleFieldChange('registration_deadline', e.target.value ? new Date(e.target.value) : undefined)}
                />
                {validationErrors.registration_deadline && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.registration_deadline}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-gray-300">Description *</Label>
                <Textarea
                  id="description"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                    validationErrors.description ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={createForm.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Brief description of the combine..."
                  rows={3}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {createForm.description.length}/500 characters
                  </p>
                  {validationErrors.description && (
                    <p className="text-xs text-red-400">{validationErrors.description}</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="long_description" className="text-gray-300">Detailed Description</Label>
                <Textarea
                  id="long_description"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  value={createForm.long_description ?? ""}
                  onChange={(e) => handleFieldChange('long_description', e.target.value)}
                  placeholder="Detailed description including rules, format, etc..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="time_start" className="text-gray-300">Start Time</Label>
                <Input
                  id="time_start"
                  type="time"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={createForm.time_start ?? ""}
                  onChange={(e) => handleFieldChange('time_start', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="time_end" className="text-gray-300">End Time</Label>
                <Input
                  id="time_end"
                  type="time"
                  className="bg-gray-700 border-gray-600 text-white"
                  value={createForm.time_end ?? ""}
                  onChange={(e) => handleFieldChange('time_end', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreateCombine}
                disabled={createCombineMutation.isPending}
              >
                {createCombineMutation.isPending ? "Creating..." : "Create Combine"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Total Combines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{mockCombines.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Registration Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {mockCombines.filter(c => c.status === "REGISTRATION_OPEN").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {mockCombines.filter(c => c.status === "UPCOMING").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Total Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {mockCombines.reduce((total, combine) => total + combine._count.registrations, 0)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-300">Filtered Results</CardTitle>
          </CardHeader>
          <CardContent>
                            <div className="text-2xl font-bold text-purple-400">{combines.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="text-gray-300">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  placeholder="Search combines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="game-filter" className="text-gray-300">Game</Label>
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="ALL" className="text-white hover:bg-gray-700">All Games</SelectItem>
                  {mockGames.map((game) => (
                    <SelectItem key={game.id} value={game.id} className="text-white hover:bg-gray-700">
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status-filter" className="text-gray-300">Status</Label>
              <Select value={statusFilter} onValueChange={(value: CombineStatus | "ALL") => setStatusFilter(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="ALL" className="text-white hover:bg-gray-700">All Statuses</SelectItem>
                  <SelectItem value="UPCOMING" className="text-white hover:bg-gray-700">Upcoming</SelectItem>
                  <SelectItem value="REGISTRATION_OPEN" className="text-white hover:bg-gray-700">Registration Open</SelectItem>
                  <SelectItem value="REGISTRATION_CLOSED" className="text-white hover:bg-gray-700">Registration Closed</SelectItem>
                  <SelectItem value="IN_PROGRESS" className="text-white hover:bg-gray-700">In Progress</SelectItem>
                  <SelectItem value="COMPLETED" className="text-white hover:bg-gray-700">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type-filter" className="text-gray-300">Type</Label>
              <Select value={typeFilter} onValueChange={(value: EventType | "ALL") => setTypeFilter(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="ALL" className="text-white hover:bg-gray-700">All Types</SelectItem>
                  <SelectItem value="ONLINE" className="text-white hover:bg-gray-700">🌐 Online</SelectItem>
                  <SelectItem value="IN_PERSON" className="text-white hover:bg-gray-700">📍 In Person</SelectItem>
                  <SelectItem value="HYBRID" className="text-white hover:bg-gray-700">🔄 Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year-filter" className="text-gray-300">Year</Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="ALL" className="text-white hover:bg-gray-700">All Years</SelectItem>
                  <SelectItem value="2024" className="text-white hover:bg-gray-700">2024</SelectItem>
                  <SelectItem value="2025" className="text-white hover:bg-gray-700">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combines List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
                      <CardTitle className="text-white">Combines ({combines.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {combines.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No combines found</div>
                <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              combines.map((combine) => (
              <div key={combine.id} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-700 bg-gray-750">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white">{combine.title}</h3>
                      <Badge className={getStatusColor(combine.status)}>
                        {combine.status.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="border-gray-500 text-gray-300">
                        {getTypeIcon(combine.type)} {combine.type}
                      </Badge>
                      {combine.invite_only && (
                        <Badge variant="secondary" className="bg-gray-600 text-gray-200">Invite Only</Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-300 mb-2">{combine.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {combine.game.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(combine.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {combine.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {combine._count.registrations}/{combine.max_spots} registered
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                      onClick={() => setSelectedCombine(combine.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white"
                      onClick={() => setEditingCombine(combine.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      onClick={() => handleDeleteCombine(combine.id)}
                      disabled={combine._count.registrations > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Combine Details Modal */}
      {selectedCombine && (
        <Dialog open={!!selectedCombine} onOpenChange={() => setSelectedCombine(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {mockCombines.find(c => c.id === selectedCombine)?.title}
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Combine details and registration management
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-gray-700 border-gray-600">
                <TabsTrigger value="details" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                  Details
                </TabsTrigger>
                <TabsTrigger value="registrations" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                  Registrations ({selectedCombine === "1" ? 23 : selectedCombine === "3" ? 48 : selectedCombine === "4" ? 18 : 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                {(() => {
                  const combine = mockCombines.find(c => c.id === selectedCombine);
                  if (!combine) return null;
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Game</Label>
                          <p className="font-medium text-white">{combine.game.name}</p>
                        </div>
                        <div>
                          <Label className="text-gray-300">Status</Label>
                          <Badge className={getStatusColor(combine.status)}>
                            {combine.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-gray-300">Date & Time</Label>
                          <p className="font-medium text-white">{formatDate(combine.date)}</p>
                        </div>
                        <div>
                          <Label className="text-gray-300">Location</Label>
                          <p className="font-medium text-white">{combine.location}</p>
                        </div>
                        <div>
                          <Label className="text-gray-300">Type</Label>
                          <p className="font-medium text-white">
                            {getTypeIcon(combine.type)} {combine.type}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-300">Participants</Label>
                          <p className="font-medium text-white">
                            {combine._count.registrations}/{combine.max_spots}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-gray-300">Description</Label>
                        <p className="text-gray-200">{combine.description}</p>
                      </div>
                    </>
                  );
                })()}
              </TabsContent>
              
              <TabsContent value="registrations" className="space-y-4">
                {(selectedCombine === "1" || selectedCombine === "3" || selectedCombine === "4") ? (
                  <div className="space-y-2">
                    {/* Mock registration data */}
                    {[
                      // VALORANT Combine registrations
                      ...(selectedCombine === "1" ? [
                        {
                          id: "reg1",
                          player: {
                            first_name: "Alex",
                            last_name: "Chen",
                            username: "alexchen_val",
                            email: "alex.chen@email.com"
                          },
                          status: "CONFIRMED",
                          qualified: true,
                          registered_at: new Date("2024-03-15T10:30:00")
                        },
                        {
                          id: "reg2",
                          player: {
                            first_name: "Sarah",
                            last_name: "Wilson",
                            username: "sarahw_gamer",
                            email: "sarah.wilson@email.com"
                          },
                          status: "PENDING",
                          qualified: false,
                          registered_at: new Date("2024-03-16T14:20:00")
                        },
                        {
                          id: "reg3",
                          player: {
                            first_name: "Marcus",
                            last_name: "Johnson",
                            username: "mjohnson_pro",
                            email: "marcus.johnson@email.com"
                          },
                          status: "CONFIRMED",
                          qualified: true,
                          registered_at: new Date("2024-03-17T09:15:00")
                        }
                      ] : []),
                      // Rocket League Combine registrations  
                      ...(selectedCombine === "3" ? [
                        {
                          id: "reg4",
                          player: {
                            first_name: "Diego",
                            last_name: "Martinez",
                            username: "diego_rocket",
                            email: "diego.martinez@email.com"
                          },
                          status: "CONFIRMED",
                          qualified: true,
                          registered_at: new Date("2024-03-10T15:45:00")
                        },
                        {
                          id: "reg5",
                          player: {
                            first_name: "Emma",
                            last_name: "Thompson",
                            username: "emma_boost",
                            email: "emma.thompson@email.com"
                          },
                          status: "CONFIRMED",
                          qualified: true,
                          registered_at: new Date("2024-03-11T12:20:00")
                        }
                      ] : []),
                      // Smash Ultimate registrations
                      ...(selectedCombine === "4" ? [
                        {
                          id: "reg6",
                          player: {
                            first_name: "Kevin",
                            last_name: "Park",
                            username: "kevin_smash",
                            email: "kevin.park@email.com"
                          },
                          status: "CONFIRMED",
                          qualified: true,
                          registered_at: new Date("2025-01-05T14:15:00")
                        },
                        {
                          id: "reg7",
                          player: {
                            first_name: "Lisa",
                            last_name: "Rodriguez",
                            username: "lisa_fighter",
                            email: "lisa.rodriguez@email.com"
                          },
                          status: "PENDING",
                          qualified: false,
                          registered_at: new Date("2025-01-06T09:30:00")
                        }
                      ] : [])
                    ].map((registration) => (
                      <div key={registration.id} className="border border-gray-600 rounded p-3 flex justify-between items-center bg-gray-750">
                        <div>
                          <p className="font-medium text-white">
                            {registration.player.first_name} {registration.player.last_name}
                          </p>
                          <p className="text-sm text-gray-300">
                            @{registration.player.username} • {registration.player.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Registered: {formatDate(registration.registered_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={registration.qualified ? "default" : "secondary"}>
                            {registration.qualified ? "Qualified" : "Not Qualified"}
                          </Badge>
                          <Badge className={getStatusColor(registration.status as CombineStatus)}>
                            {registration.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No registrations yet</h3>
                    <p className="text-gray-300">Players will appear here once they register</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 