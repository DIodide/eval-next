"use client";

import React, { useState } from "react";
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
  PowerOff,
  Check,
  X,
  ExternalLink,
  MoreHorizontal
} from "lucide-react";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { DataTable } from "@/components/ui/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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

// Registration type for the data table
type Registration = {
  id: string;
  status: string;
  qualified: boolean | null;
  registered_at: Date;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    username: string | null;
    email: string;
    image_url: string | null;
  };
};

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

  // Edit form state
  const [editForm, setEditForm] = useState<CreateCombineData & { id: string }>({
    id: "",
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
  const [editValidationErrors, setEditValidationErrors] = useState<Record<string, string>>({});

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

  const updateCombineMutation = api.combines.update.useMutation({
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Combine updated successfully!" 
      });
      setEditingCombine(null);
      setEditValidationErrors({});
      void refetchCombines();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update combine",
        variant: "destructive" 
      });
    }
  });

  const updateRegistrationStatusMutation = api.combines.updateRegistrationStatus.useMutation({
    onSuccess: () => {
      toast({ 
        title: "Success", 
        description: "Registration status updated successfully!" 
      });
      void refetchCombines();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update registration status",
        variant: "destructive" 
      });
    }
  });

  // Get specific combine for editing
  const { data: editingCombineData } = api.combines.getByIdForAdmin.useQuery(
    { id: editingCombine! },
    { 
      enabled: !!editingCombine,
    }
  );

  // Update edit form when editing data changes
  React.useEffect(() => {
    if (editingCombineData && editingCombine) {
      setEditForm({
        id: editingCombineData.id,
        title: editingCombineData.title,
        description: editingCombineData.description,
        long_description: editingCombineData.long_description ?? "",
        game_id: editingCombineData.game_id,
        date: typeof editingCombineData.date === 'string' ? new Date(editingCombineData.date) : editingCombineData.date,
        time_start: editingCombineData.time_start ?? "",
        time_end: editingCombineData.time_end ?? "",
        location: editingCombineData.location,
        type: editingCombineData.type as EventType,
        year: editingCombineData.year,
        max_spots: editingCombineData.max_spots,
        registration_deadline: editingCombineData.registration_deadline ? new Date(editingCombineData.registration_deadline) : undefined,
        min_gpa: editingCombineData.min_gpa ? Number(editingCombineData.min_gpa) : undefined,
        class_years: Array.isArray(editingCombineData.class_years) ? editingCombineData.class_years : [],
        required_roles: Array.isArray(editingCombineData.required_roles) ? editingCombineData.required_roles : [],
        prize_pool: editingCombineData.prize_pool,
        status: editingCombineData.status as CombineStatus,
        requirements: editingCombineData.requirements,
        invite_only: editingCombineData.invite_only,
      });
    }
  }, [editingCombineData, editingCombine]);

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

  const handleEditFieldChange = (fieldName: string, value: string | number | Date | undefined | null) => {
    setEditForm(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Validate field and update errors
    const errors = { ...editValidationErrors };
    const fieldError = validateField(fieldName, value);
    if (fieldError[fieldName]) {
      errors[fieldName] = fieldError[fieldName];
    } else {
      delete errors[fieldName];
    }
    setEditValidationErrors(errors);
  };

  const validateEditForm = (): boolean => {
    const result = createCombineSchema.safeParse({
      title: editForm.title,
      description: editForm.description,
      long_description: editForm.long_description,
      game_id: editForm.game_id,
      date: editForm.date,
      time_start: editForm.time_start,
      time_end: editForm.time_end,
      location: editForm.location,
      type: editForm.type,
      year: editForm.year,
      max_spots: editForm.max_spots,
      registration_deadline: editForm.registration_deadline,
      min_gpa: editForm.min_gpa,
      class_years: editForm.class_years,
      required_roles: editForm.required_roles,
      prize_pool: editForm.prize_pool,
      status: editForm.status,
      requirements: editForm.requirements,
      invite_only: editForm.invite_only,
    });
    
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const field = error.path[0] as string;
        errors[field] = error.message;
      });
      setEditValidationErrors(errors);
      return false;
    }
    setEditValidationErrors({});
    return true;
  };

  const handleUpdateCombine = () => {
    if (!validateEditForm()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fix the errors in the form",
        variant: "destructive" 
      });
      return;
    }

    if (editForm.id) {
      updateCombineMutation.mutate({
        id: editForm.id,
        title: editForm.title,
        description: editForm.description,
        long_description: editForm.long_description ?? undefined,
        game_id: editForm.game_id,
        date: editForm.date,
        time_start: editForm.time_start ?? undefined,
        time_end: editForm.time_end ?? undefined,
        location: editForm.location,
        type: editForm.type,
        year: editForm.year,
        max_spots: editForm.max_spots,
        registration_deadline: editForm.registration_deadline,
        min_gpa: editForm.min_gpa,
        class_years: editForm.class_years,
        required_roles: editForm.required_roles,
        prize_pool: editForm.prize_pool,
        status: editForm.status,
        requirements: editForm.requirements,
        invite_only: editForm.invite_only,
      });
    }
  };

  const handleUpdateRegistrationStatus = (registrationId: string, status: "CONFIRMED" | "DECLINED", qualified?: boolean) => {
    updateRegistrationStatusMutation.mutate({
      registration_id: registrationId,
      status,
      qualified,
    });
  };

  const handleViewPlayerProfile = (username: string) => {
    window.open(`/profiles/player/${username}`, '_blank');
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

  // Registration table columns
  const registrationColumns: ColumnDef<Registration>[] = React.useMemo(() => [
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => {
        const registration = row.original;
        return (
          <Avatar className="w-8 h-8">
            <AvatarImage src={registration.player.image_url ?? undefined} />
            <AvatarFallback className="bg-gray-700 text-white text-xs">
              {registration.player.first_name.charAt(0)}{registration.player.last_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        );
      },
    },
    {
      accessorKey: "player",
      header: "Player",
      cell: ({ row }) => {
        const registration = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-white">
              {registration.player.first_name} {registration.player.last_name}
            </div>
            <div className="text-sm text-gray-400">
              @{registration.player.username ?? 'No username'}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const registration = row.original;
        return (
          <div className="text-white font-mono text-sm">
            {registration.player.email}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const registration = row.original;
        return (
          <Badge 
            className={
              registration.status === "CONFIRMED" 
                ? "bg-green-600 text-white" 
                : registration.status === "PENDING"
                ? "bg-yellow-600 text-white"
                : registration.status === "DECLINED"
                ? "bg-red-600 text-white"
                : "bg-gray-600 text-white"
            }
          >
            {registration.status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "qualified",
      header: "Qualified",
      cell: ({ row }) => {
        const registration = row.original;
        if (registration.qualified === null) {
          return <span className="text-gray-400 text-sm">Not set</span>;
        }
        return (
          <Badge className={registration.qualified ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
            {registration.qualified ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "registered_at",
      header: "Registered",
      cell: ({ row }) => {
        const registration = row.original;
        return (
          <div className="text-gray-400 text-sm">
            {formatDate(new Date(registration.registered_at))}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const registration = row.original;
        const isProcessing = updateRegistrationStatusMutation.isPending;
        
        return (
          <div className="flex items-center gap-2">
            {registration.status === "PENDING" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateRegistrationStatus(registration.id, "CONFIRMED", true)}
                  disabled={isProcessing}
                  className="hover:bg-green-700 hover:text-white text-green-400"
                  title="Accept Registration"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateRegistrationStatus(registration.id, "DECLINED")}
                  disabled={isProcessing}
                  className="hover:bg-red-700 hover:text-white text-red-400"
                  title="Decline Registration"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewPlayerProfile(registration.player.username ?? registration.player.id)}
              className="hover:bg-gray-700 hover:text-white text-gray-400"
              title="View Player Profile"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-700 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(registration.player.email)}
                  className="text-gray-300 focus:text-white focus:bg-gray-700"
                >
                  Copy email
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleViewPlayerProfile(registration.player.username ?? registration.player.id)}
                  className="text-gray-300 focus:text-white focus:bg-gray-700"
                >
                  View full profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                {registration.status === "CONFIRMED" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateRegistrationStatus(registration.id, "DECLINED")}
                    className="text-red-300 focus:text-red-100 focus:bg-gray-700"
                  >
                    Decline registration
                  </DropdownMenuItem>
                )}
                {registration.status === "DECLINED" && (
                  <DropdownMenuItem
                    onClick={() => handleUpdateRegistrationStatus(registration.id, "CONFIRMED", true)}
                    className="text-green-300 focus:text-green-100 focus:bg-gray-700"
                  >
                    Accept registration
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ], [updateRegistrationStatusMutation.isPending]);

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

      {/* Edit Combine Dialog */}
      {editingCombine && (
        <Dialog open={!!editingCombine} onOpenChange={() => setEditingCombine(null)}>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Combine</DialogTitle>
              <DialogDescription className="text-gray-300">
                Update combine details and manage registrations
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="bg-gray-700 border-gray-600">
                <TabsTrigger value="details" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600">
                  Combine Details
                </TabsTrigger>
                <TabsTrigger value="registrations" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600">
                  Registrations ({editingCombineData?.registrations?.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="edit-title" className="text-gray-300">Title *</Label>
                <Input
                  id="edit-title"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                    editValidationErrors.title ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={editForm.title}
                  onChange={(e) => handleEditFieldChange('title', e.target.value)}
                  placeholder="e.g., VALORANT Spring Regional Combine"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {editForm.title.length}/200 characters
                  </p>
                  {editValidationErrors.title && (
                    <p className="text-xs text-red-400">{editValidationErrors.title}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-status" className="text-gray-300">Status *</Label>
                <Select 
                  value={editForm.status} 
                  onValueChange={(value: CombineStatus) => handleEditFieldChange('status', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="UPCOMING" className="text-white hover:bg-gray-700">Upcoming</SelectItem>
                    <SelectItem value="REGISTRATION_OPEN" className="text-white hover:bg-gray-700">Registration Open</SelectItem>
                    <SelectItem value="REGISTRATION_CLOSED" className="text-white hover:bg-gray-700">Registration Closed</SelectItem>
                    <SelectItem value="IN_PROGRESS" className="text-white hover:bg-gray-700">In Progress</SelectItem>
                    <SelectItem value="COMPLETED" className="text-white hover:bg-gray-700">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-game" className="text-gray-300">Game *</Label>
                <Select 
                  value={editForm.game_id} 
                  onValueChange={(value) => handleEditFieldChange('game_id', value)}
                >
                  <SelectTrigger className={`bg-gray-700 border-gray-600 text-white ${
                    editValidationErrors.game_id ? "border-red-500" : ""
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
                {editValidationErrors.game_id && (
                  <p className="text-xs text-red-400 mt-1">{editValidationErrors.game_id}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-type" className="text-gray-300">Event Type *</Label>
                <Select 
                  value={editForm.type} 
                  onValueChange={(value: EventType) => handleEditFieldChange('type', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="ONLINE" className="text-white hover:bg-gray-700">Online</SelectItem>
                    <SelectItem value="IN_PERSON" className="text-white hover:bg-gray-700">In Person</SelectItem>
                    <SelectItem value="HYBRID" className="text-white hover:bg-gray-700">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-max-spots" className="text-gray-300">Max Participants *</Label>
                <Input
                  id="edit-max-spots"
                  type="number"
                  min="1"
                  max="1000"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                    editValidationErrors.max_spots ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={editForm.max_spots}
                  onChange={(e) => handleEditFieldChange('max_spots', parseInt(e.target.value))}
                />
                {editValidationErrors.max_spots && (
                  <p className="text-xs text-red-400 mt-1">{editValidationErrors.max_spots}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="edit-description" className="text-gray-300">Description *</Label>
                <Textarea
                  id="edit-description"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 resize-none ${
                    editValidationErrors.description ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={editForm.description}
                  onChange={(e) => handleEditFieldChange('description', e.target.value)}
                  placeholder="Describe the combine's format, goals, and requirements..."
                  rows={3}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {editForm.description.length}/500 characters
                  </p>
                  {editValidationErrors.description && (
                    <p className="text-xs text-red-400">{editValidationErrors.description}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-location" className="text-gray-300">Location *</Label>
                <Input
                  id="edit-location"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                    editValidationErrors.location ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={editForm.location}
                  onChange={(e) => handleEditFieldChange('location', e.target.value)}
                  placeholder="e.g., Online - Custom Servers"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {editForm.location.length}/200 characters
                  </p>
                  {editValidationErrors.location && (
                    <p className="text-xs text-red-400">{editValidationErrors.location}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-date" className="text-gray-300">Date & Time *</Label>
                <Input
                  id="edit-date"
                  type="datetime-local"
                  className={`bg-gray-700 border-gray-600 text-white ${
                    editValidationErrors.date ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={editForm.date.toISOString().slice(0, 16)}
                  onChange={(e) => handleEditFieldChange('date', new Date(e.target.value))}
                />
                {editValidationErrors.date && (
                  <p className="text-xs text-red-400 mt-1">{editValidationErrors.date}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-prize-pool" className="text-gray-300">Prize Pool</Label>
                <Input
                  id="edit-prize-pool"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  value={editForm.prize_pool}
                  onChange={(e) => handleEditFieldChange('prize_pool', e.target.value)}
                  placeholder="e.g., $1,000 + Scholarships"
                />
              </div>

              <div>
                <Label htmlFor="edit-year" className="text-gray-300">Year *</Label>
                <Input
                  id="edit-year"
                  className={`bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${
                    editValidationErrors.year ? "border-red-500 focus-visible:border-red-500" : ""
                  }`}
                  value={editForm.year}
                  onChange={(e) => handleEditFieldChange('year', e.target.value)}
                  placeholder="2024"
                />
                {editValidationErrors.year && (
                  <p className="text-xs text-red-400 mt-1">{editValidationErrors.year}</p>
                )}
              </div>
            </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-gray-600 text-white hover:bg-gray-700" 
                    onClick={() => setEditingCombine(null)}
                    disabled={updateCombineMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={handleUpdateCombine}
                    disabled={updateCombineMutation.isPending}
                  >
                    {updateCombineMutation.isPending ? "Updating..." : "Update Combine"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="registrations" className="mt-4">
                {editingCombineData?.registrations && editingCombineData.registrations.length > 0 ? (
                  <div className="space-y-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                      <DataTable
                        columns={registrationColumns}
                        data={editingCombineData.registrations as Registration[]}
                        loading={updateRegistrationStatusMutation.isPending}
                        filterColumn="player"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No registrations yet.</p>
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