"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  TrophyIcon, 
  CalendarIcon, 
  MapPinIcon, 
  UsersIcon,
  CheckIcon,
  XIcon,
  MoreVerticalIcon,
  EyeIcon,
  UserMinusIcon,
  ClockIcon,
  MessageSquareIcon,
  Loader2,
  PlusIcon,
  SaveIcon,
  SendIcon,
  SchoolIcon,
  InfoIcon,
  EditIcon
} from "lucide-react";
import { api } from "@/trpc/react";
import type { Prisma } from "@prisma/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

// TypeScript interfaces matching the API response
interface Player {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  location?: string | null;
  bio?: string | null;
  class_year?: string | null;
  school?: string | null;
  gpa?: Prisma.Decimal | null;
  game_profiles?: Array<{
    username: string;
    rank?: string | null;
    rating?: number | null;
    role?: string | null;
    game: { name: string };
  }>;
  platform_connections?: Array<{
    platform: string;
    username: string;
  }>;
}

interface Application {
  id: string;
  status: ApplicationStatus;
  notes?: string | null;
  registered_at: string;
  player: Player;
}

interface Tryout {
  id: string;
  title: string;
  game: {
    id: string;
    name: string;
    short_name: string;
    icon?: string | null;
    color?: string | null;
  };
  date: Date;
  time_start?: string | null;
  time_end?: string | null;
  location: string;
  type: string;
  max_spots: number;
  registeredCount: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount?: number;
  waitlistedCount?: number;
  description: string;
  long_description?: string | null;
  status: string;
  price?: string | null;
  class_years?: string[] | null;
  required_roles?: string[] | null;
  registration_deadline?: Date | null;
  min_gpa?: Prisma.Decimal | null;
}

type ApplicationStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "WAITLISTED" | "CANCELLED";

// Create Tryout Dialog Component
function CreateTryoutDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    long_description: "",
    game_id: "",
    date: undefined as Date | undefined,
    time_start: "",
    time_end: "",
    location: "",
    type: "ONLINE" as "ONLINE" | "IN_PERSON" | "HYBRID",
    price: "Free",
    max_spots: 20,
    registration_deadline: undefined as Date | undefined,
    min_gpa: "",
    class_years: [] as string[],
    required_roles: [] as string[],
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [deadlinePickerOpen, setDeadlinePickerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { data: games } = api.tryouts.getGames.useQuery();
  
  const createTryoutMutation = api.tryouts.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
      // Reset form
      setFormData({
        title: "",
        description: "",
        long_description: "",
        game_id: "",
        date: undefined,
        time_start: "",
        time_end: "",
        location: "",
        type: "ONLINE",
        price: "Free",
        max_spots: 20,
        registration_deadline: undefined,
        min_gpa: "",
        class_years: [],
        required_roles: [],
      });
    },
    onError: (error) => {
      // Handle validation errors from server and client-side validation
      const errors: Record<string, string> = {};
      
      // Parse server validation errors
      if (error.data?.code === "BAD_REQUEST") {
        const message = error.message;
        if (message.includes("title")) {
          errors.title = "Title must be at least 5 characters";
        }
        if (message.includes("description")) {
          errors.description = "Description must be at least 10 characters";
        }
        if (message.includes("location")) {
          errors.location = "Location must be at least 5 characters";
        }
        if (message.includes("game_id")) {
          errors.game_id = "Game selection is required";
        }
        if (message.includes("date")) {
          errors.date = "Date is required";
        }
      }
      
      // Add client-side validation for missing required fields
      if (!formData.title || formData.title.length < 5) {
        errors.title = "Title is required and must be at least 5 characters";
      }
      if (!formData.description || formData.description.length < 10) {
        errors.description = "Description is required and must be at least 10 characters";
      }
      if (!formData.game_id) {
        errors.game_id = "Please select a game";
      }
      if (!formData.date) {
        errors.date = "Please select a tryout date";
      }
      if (!formData.location || formData.location.length < 5) {
        errors.location = "Location is required and must be at least 5 characters";
      }
      
      setValidationErrors(errors);
    },
  });

  // Real-time validation function
  const validateField = (fieldName: string, value: string | number | Date | string[] | undefined | null) => {
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
      
      case 'price':
        if (typeof value === 'string' && value.length > 50) {
          errors.price = "Price must be less than 50 characters";
        }
        break;
      
      case 'max_spots':
        if (typeof value === 'number' && (value < 1 || value > 1000)) {
          errors.max_spots = "Max spots must be between 1 and 1000";
        }
        break;
      
      case 'min_gpa':
        if (typeof value === 'string' && value && (parseFloat(value) < 0 || parseFloat(value) > 4.0)) {
          errors.min_gpa = "GPA must be between 0.0 and 4.0";
        }
        break;
      
      case 'date':
        if (value instanceof Date && value < new Date()) {
          errors.date = "Date must be in the future";
        }
        break;
      
      case 'registration_deadline':
        if (value instanceof Date && formData.date && value > formData.date) {
          errors.registration_deadline = "Deadline must be before tryout date";
        }
        break;
    }

    return errors;
  };

  // Update validation errors when fields change
  const handleFieldChange = (fieldName: string, value: string | number | Date | string[] | undefined | null) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
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
    if (fieldName === 'date' && formData.registration_deadline) {
      const deadlineErrors = validateField('registration_deadline', formData.registration_deadline);
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

  // Track form changes for unsaved changes indicator
  useEffect(() => {
    const hasData = Boolean(
      formData.title ?? 
      formData.description ?? 
      formData.game_id ?? 
      formData.date ?? 
      formData.location ?? 
      formData.long_description ??
      formData.time_start ?? 
      formData.time_end ?? 
      (formData.price !== "Free") ??
      (formData.max_spots !== 20) ?? 
      formData.min_gpa ??
      (formData.class_years.length > 0) ?? 
      (formData.required_roles.length > 0)
    );
    setHasUnsavedChanges(hasData);
  }, [formData]);

  const handleSubmit = (status: "DRAFT" | "PUBLISHED") => {
    // Clear any existing validation errors
    setValidationErrors({});

    // For published tryouts, validate all required fields before submission
    if (status === "PUBLISHED") {
      const errors: Record<string, string> = {};
      
      if (!formData.title || formData.title.length < 5) {
        errors.title = "Title is required and must be at least 5 characters";
      }
      if (!formData.description || formData.description.length < 10) {
        errors.description = "Description is required and must be at least 10 characters";
      }
      if (!formData.game_id) {
        errors.game_id = "Please select a game";
      }
      if (!formData.date) {
        errors.date = "Please select a tryout date";
      }
      if (!formData.location || formData.location.length < 5) {
        errors.location = "Location is required and must be at least 5 characters";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    // For draft tryouts, only validate minimal requirements
    if (status === "DRAFT") {
      const errors: Record<string, string> = {};
      
      if (!formData.title || formData.title.length < 3) {
        errors.title = "Title is required (minimum 3 characters for draft)";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    const submitData = {
      ...formData,
      status,
      date: formData.date!,
      registration_deadline: formData.registration_deadline,
      min_gpa: formData.min_gpa ? parseFloat(formData.min_gpa) : undefined,
    };
    
    createTryoutMutation.mutate(submitData);
  };

  const handleSaveDraft = () => {
    handleSubmit("DRAFT");
  };

  const classYearOptions = ["Freshman", "Sophomore", "Junior", "Senior"];
  const roleOptions = {
    "VALORANT": ["Duelist", "Controller", "Initiator", "Sentinel", "IGL", "Flex"],
    "Overwatch 2": ["Tank", "DPS", "Support", "Flex"],
    "Rocket League": ["Striker", "Midfielder", "Goalkeeper", "All positions"],
    "Super Smash Bros. Ultimate": ["All characters welcome", "Character specialist"],
  };

  const selectedGame = games?.find(g => g.id === formData.game_id);
  const availableRoles = selectedGame ? roleOptions[selectedGame.name as keyof typeof roleOptions] ?? [] : [];

  const canSaveDraft = formData.title.length >= 3; // Minimal requirement for draft
  const canPublish = formData.title && formData.description && formData.game_id && 
                    formData.date && formData.location &&
                    Object.keys(validationErrors).length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl flex items-center justify-between">
            <span>Create New Tryout</span>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                Unsaved Changes
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new tryout event for your team. You can save as draft at any time or publish when ready.
          </DialogDescription>
        </DialogHeader>
        
        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-red-500/20 p-1 rounded-full mt-0.5">
                <XIcon className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-orbitron font-semibold text-red-200 mb-2">
                  Please fix the following issues:
                </h4>
                <ul className="space-y-1 text-sm text-red-300">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      <span className="capitalize">{field.replace('_', ' ')}: {error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg text-cyan-400 border-b border-gray-700 pb-2">
                Basic Information
              </h3>
              
              <div>
                <Label htmlFor="title" className="text-white font-rajdhani text-sm">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g., VALORANT Varsity Team Tryouts"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.title && "border-red-500 focus-visible:border-red-500"
                  )}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.title.length}/200 characters
                  </p>
                  {validationErrors.title && (
                    <p className="text-xs text-red-400">{validationErrors.title}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-white font-rajdhani text-sm">
                  Short Description <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Brief description of the tryout..."
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.description && "border-red-500 focus-visible:border-red-500"
                  )}
                  rows={3}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                  {validationErrors.description && (
                    <p className="text-xs text-red-400">{validationErrors.description}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="long_description" className="text-white font-rajdhani text-sm">
                  Detailed Description
                </Label>
                <Textarea
                  id="long_description"
                  value={formData.long_description}
                  onChange={(e) => handleFieldChange('long_description', e.target.value)}
                  placeholder="Detailed information about the tryout process, requirements, what to expect..."
                  className="bg-gray-800 border-gray-700 text-white mt-1"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional - Provide additional context for players
                </p>
              </div>

              <div>
                <Label htmlFor="game" className="text-white font-rajdhani text-sm">
                  Game <span className="text-red-400">*</span>
                </Label>
                <Select 
                  value={formData.game_id} 
                  onValueChange={(value) => handleFieldChange('game_id', value)}
                >
                  <SelectTrigger className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.game_id && "border-red-500"
                  )}>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {games?.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{game.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {game.short_name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.game_id && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.game_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Event Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg text-cyan-400 border-b border-gray-700 pb-2">
                Event Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-rajdhani text-sm">
                    Date <span className="text-red-400">*</span>
                  </Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                          !formData.date && "text-gray-400",
                          validationErrors.date && "border-red-500 focus-visible:border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          handleFieldChange('date', date);
                          setDatePickerOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                        className="bg-gray-800"
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.date && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.date}</p>
                  )}
                </div>
                
                <div>
                  <Label className="text-white font-rajdhani text-sm">
                    Registration Deadline
                  </Label>
                  <Popover open={deadlinePickerOpen} onOpenChange={setDeadlinePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                          !formData.registration_deadline && "text-gray-400",
                          validationErrors.registration_deadline && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.registration_deadline ? format(formData.registration_deadline, "PPP") : "Optional"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.registration_deadline}
                        onSelect={(date) => {
                          handleFieldChange('registration_deadline', date);
                          setDeadlinePickerOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (formData.date) {
                            return date < today || date >= formData.date;
                          }
                          return date < today;
                        }}
                        initialFocus
                        className="bg-gray-800"
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.registration_deadline && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.registration_deadline}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_start" className="text-white font-rajdhani text-sm">Start Time</Label>
                  <Input
                    id="time_start"
                    type="time"
                    value={formData.time_start}
                    onChange={(e) => handleFieldChange('time_start', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="time_end" className="text-white font-rajdhani text-sm">End Time</Label>
                  <Input
                    id="time_end"
                    type="time"
                    value={formData.time_end}
                    onChange={(e) => handleFieldChange('time_end', e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-white font-rajdhani text-sm">
                  Location <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="e.g., Gaming Center Room A101 or Discord Server"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.location && "border-red-500 focus-visible:border-red-500"
                  )}
                />
                {validationErrors.location && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.location}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-rajdhani text-sm">
                    Event Type <span className="text-red-400">*</span>
                  </Label>
                  <Select value={formData.type} onValueChange={(value: "ONLINE" | "IN_PERSON" | "HYBRID") => handleFieldChange('type', value)}>
                    <SelectTrigger className={cn(
                      "bg-gray-800 border-gray-700 text-white mt-1",
                      validationErrors.type && "border-red-500"
                    )}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="ONLINE" className="text-white hover:bg-gray-700">🌐 Online</SelectItem>
                      <SelectItem value="IN_PERSON" className="text-white hover:bg-gray-700">🏢 In Person</SelectItem>
                      <SelectItem value="HYBRID" className="text-white hover:bg-gray-700">🔄 Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price" className="text-white font-rajdhani text-sm">Price</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    placeholder="e.g., Free, $25, $50"
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white mt-1",
                      validationErrors.price && "border-red-500 focus-visible:border-red-500"
                    )}
                  />
                  {validationErrors.price && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.price}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_spots" className="text-white font-rajdhani text-sm">
                    Max Spots <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="max_spots"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.max_spots}
                    onChange={(e) => handleFieldChange('max_spots', parseInt(e.target.value) || 20)}
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white mt-1",
                      validationErrors.max_spots && "border-red-500 focus-visible:border-red-500"
                    )}
                  />
                  {validationErrors.max_spots && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.max_spots}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="min_gpa" className="text-white font-rajdhani text-sm">Minimum GPA</Label>
                  <Input
                    id="min_gpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="4.0"
                    value={formData.min_gpa}
                    onChange={(e) => handleFieldChange('min_gpa', e.target.value)}
                    placeholder="e.g., 3.0"
                    className={cn(
                      "bg-gray-800 border-gray-700 text-white mt-1",
                      validationErrors.min_gpa && "border-red-500 focus-visible:border-red-500"
                    )}
                  />
                  {validationErrors.min_gpa && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.min_gpa}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements Section - Full Width */}
        <div className="space-y-6 mt-8 border-t border-gray-700 pt-6">
          <h3 className="font-orbitron text-lg text-cyan-400">
            Requirements & Preferences
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-white font-rajdhani text-sm">Eligible Class Years</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {classYearOptions.map((year) => (
                  <Button
                    key={year}
                    type="button"
                    variant={formData.class_years.includes(year) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const newClassYears = formData.class_years.includes(year)
                        ? formData.class_years.filter(y => y !== year)
                        : [...formData.class_years, year];
                      handleFieldChange('class_years', newClassYears);
                    }}
                    className={formData.class_years.includes(year) 
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                      : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                    }
                  >
                    {year}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to allow all class years
              </p>
            </div>

            {availableRoles.length > 0 && (
              <div>
                <Label className="text-white font-rajdhani text-sm">
                  Required/Preferred Roles for {selectedGame?.name}
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableRoles.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={formData.required_roles.includes(role) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newRequiredRoles = formData.required_roles.includes(role)
                          ? formData.required_roles.filter(r => r !== role)
                          : [...formData.required_roles, role];
                        handleFieldChange('required_roles', newRequiredRoles);
                      }}
                      className={formData.required_roles.includes(role) 
                        ? "bg-cyan-600 hover:bg-cyan-700 text-white" 
                        : "border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      }
                    >
                      {role}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty if no specific roles are required
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-red-400">*</span>
            <span>Required fields</span>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDraft}
              disabled={createTryoutMutation.isPending || !canSaveDraft}
              className="bg-gray-600 hover:bg-gray-700 text-white"
            >
              {createTryoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={createTryoutMutation.isPending || !canPublish}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {createTryoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4 mr-2" />
              )}
              Publish Tryout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Add after the CreateTryoutDialog component
function EditTryoutDialog({ 
  open, 
  onOpenChange, 
  onSuccess,
  tryout
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tryout: Tryout | null;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    long_description: "",
    game_id: "",
    date: undefined as Date | undefined,
    time_start: "",
    time_end: "",
    location: "",
    type: "ONLINE" as "ONLINE" | "IN_PERSON" | "HYBRID",
    price: "Free",
    max_spots: 20,
    registration_deadline: undefined as Date | undefined,
    min_gpa: "",
    class_years: [] as string[],
    required_roles: [] as string[],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [deadlinePickerOpen, setDeadlinePickerOpen] = useState(false);

  // Fetch games for dropdown
  const { data: games } = api.tryouts.getGames.useQuery();
  
  const updateTryoutMutation = api.tryouts.update.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      setHasUnsavedChanges(false);
      setValidationErrors({});
    },
    onError: (error) => {
      // Handle validation errors from server and client-side validation
      const errors: Record<string, string> = {};
      
      // Parse server validation errors
      if (error.data?.code === "BAD_REQUEST") {
        const message = error.message;
        if (message.includes("title")) {
          errors.title = "Title must be at least 5 characters";
        }
        if (message.includes("description")) {
          errors.description = "Description must be at least 10 characters";
        }
        if (message.includes("location")) {
          errors.location = "Location must be at least 5 characters";
        }
        if (message.includes("game_id")) {
          errors.game_id = "Game selection is required";
        }
        if (message.includes("date")) {
          errors.date = "Date is required";
        }
      }
      
      // Add client-side validation for missing required fields
      if (!formData.title || formData.title.length < 5) {
        errors.title = "Title is required and must be at least 5 characters";
      }
      if (!formData.description || formData.description.length < 10) {
        errors.description = "Description is required and must be at least 10 characters";
      }
      if (!formData.game_id) {
        errors.game_id = "Please select a game";
      }
      if (!formData.date) {
        errors.date = "Please select a tryout date";
      }
      if (!formData.location || formData.location.length < 5) {
        errors.location = "Location is required and must be at least 5 characters";
      }
      
      setValidationErrors(errors);
    },
  });

  // Initialize form data when tryout changes
  useEffect(() => {
    if (tryout) {
      setFormData({
        title: tryout.title,
        description: tryout.description,
        long_description: tryout.long_description ?? "",
        game_id: tryout.game.id,
        date: new Date(tryout.date),
        time_start: tryout.time_start ?? "",
        time_end: tryout.time_end ?? "",
        location: tryout.location,
        type: tryout.type as "ONLINE" | "IN_PERSON" | "HYBRID",
        price: tryout.price ?? "Free",
        max_spots: tryout.max_spots,
        registration_deadline: tryout.registration_deadline ? new Date(tryout.registration_deadline) : undefined,
        min_gpa: tryout.min_gpa ? tryout.min_gpa.toString() : "",
        class_years: tryout.class_years ?? [],
        required_roles: tryout.required_roles ?? [],
      });
      setValidationErrors({});
      setHasUnsavedChanges(false);
    }
  }, [tryout]);

  const validateField = (fieldName: string, value: string | number | Date | string[] | undefined | null) => {
    const errors: Record<string, string> = {};
    
    switch (fieldName) {
      case 'title':
        if (typeof value === 'string') {
          if (value.length < 5) errors.title = "Title must be at least 5 characters";
          if (value.length > 200) errors.title = "Title must be less than 200 characters";
        }
        break;
      case 'description':
        if (typeof value === 'string') {
          if (value.length < 10) errors.description = "Description must be at least 10 characters";
          if (value.length > 500) errors.description = "Description must be less than 500 characters";
        }
        break;
      case 'location':
        if (typeof value === 'string') {
          if (value.length < 5) errors.location = "Location must be at least 5 characters";
          if (value.length > 200) errors.location = "Location must be less than 200 characters";
        }
        break;
      case 'price':
        if (typeof value === 'string' && value.length > 50) {
          errors.price = "Price must be less than 50 characters";
        }
        break;
      case 'max_spots':
        if (typeof value === 'number') {
          if (value < 1) errors.max_spots = "Must have at least 1 spot";
          if (value > 1000) errors.max_spots = "Cannot exceed 1000 spots";
        }
        break;
      case 'min_gpa':
        if (typeof value === 'string' && value) {
          const gpa = parseFloat(value);
          if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
            errors.min_gpa = "GPA must be between 0.0 and 4.0";
          }
        }
        break;
      case 'date':
        if (value instanceof Date) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (value < today) {
            errors.date = "Date must be in the future";
          }
        }
        break;
      case 'registration_deadline':
        if (value instanceof Date && formData.date) {
          if (value >= formData.date) {
            errors.registration_deadline = "Deadline must be before tryout date";
          }
        }
        break;
      case 'game_id':
        if (!value) {
          errors.game_id = "Game selection is required";
        }
        break;
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev, ...errors };
      // Clear the error if validation passes
      if (Object.keys(errors).length === 0) {
        delete newErrors[fieldName];
      }
      return newErrors;
    });

    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldName: string, value: string | number | Date | string[] | undefined | null) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setHasUnsavedChanges(true);
    
    // Validate field on change
    validateField(fieldName, value);
    
    // Special validation for registration deadline when date changes
    if (fieldName === 'date' && formData.registration_deadline) {
      validateField('registration_deadline', formData.registration_deadline);
    }
  };

  const handleSubmit = (status: "DRAFT" | "PUBLISHED") => {
    if (!tryout) return;

    // Clear any existing validation errors
    setValidationErrors({});

    // For published tryouts, validate all required fields before submission
    if (status === "PUBLISHED") {
      const errors: Record<string, string> = {};
      
      if (!formData.title || formData.title.length < 5) {
        errors.title = "Title is required and must be at least 5 characters";
      }
      if (!formData.description || formData.description.length < 10) {
        errors.description = "Description is required and must be at least 10 characters";
      }
      if (!formData.game_id) {
        errors.game_id = "Please select a game";
      }
      if (!formData.date) {
        errors.date = "Please select a tryout date";
      }
      if (!formData.location || formData.location.length < 5) {
        errors.location = "Location is required and must be at least 5 characters";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    // For draft tryouts, only validate minimal requirements
    if (status === "DRAFT") {
      const errors: Record<string, string> = {};
      
      if (!formData.title || formData.title.length < 3) {
        errors.title = "Title is required (minimum 3 characters for draft)";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

    const submitData = {
      id: tryout.id,
      ...formData,
      status,
      date: formData.date!,
      registration_deadline: formData.registration_deadline,
      min_gpa: formData.min_gpa ? parseFloat(formData.min_gpa) : undefined,
    };
    
    updateTryoutMutation.mutate(submitData);
  };

  const handleSaveDraft = () => {
    handleSubmit("DRAFT");
  };

  const classYearOptions = ["Freshman", "Sophomore", "Junior", "Senior"];
  const roleOptions = {
    "VALORANT": ["Duelist", "Controller", "Initiator", "Sentinel", "IGL", "Flex"],
    "Overwatch 2": ["Tank", "DPS", "Support", "Flex"],
    "Rocket League": ["Striker", "Midfielder", "Goalkeeper", "All positions"],
    "Super Smash Bros. Ultimate": ["All characters welcome", "Character specialist"],
  };

  const selectedGame = games?.find(g => g.id === formData.game_id);
  const availableRoles = selectedGame ? roleOptions[selectedGame.name as keyof typeof roleOptions] ?? [] : [];

  const canSaveDraft = formData.title.length >= 3;
  const canPublish = formData.title && formData.description && formData.game_id && 
                    formData.date && formData.location &&
                    Object.keys(validationErrors).length === 0;

  if (!tryout) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl flex items-center justify-between">
            <span>Edit Tryout</span>
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">
                Unsaved Changes
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Edit your tryout event. You can save as draft or publish when ready.
          </DialogDescription>
        </DialogHeader>
        
        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="bg-red-500/20 p-1 rounded-full mt-0.5">
                <XIcon className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-orbitron font-semibold text-red-200 mb-2">
                  Please fix the following issues:
                </h4>
                <ul className="space-y-1 text-sm text-red-300">
                  {Object.entries(validationErrors).map(([field, error]) => (
                    <li key={field} className="flex items-center space-x-2">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      <span className="capitalize">{field.replace('_', ' ')}: {error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg text-cyan-400 border-b border-gray-700 pb-2">
                Basic Information
              </h3>
              
              <div>
                <Label htmlFor="edit-title" className="text-white font-rajdhani text-sm">
                  Title <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g., VALORANT Varsity Team Tryouts"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.title && "border-red-500 focus-visible:border-red-500"
                  )}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.title.length}/200 characters
                  </p>
                  {validationErrors.title && (
                    <p className="text-xs text-red-400">{validationErrors.title}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description" className="text-white font-rajdhani text-sm">
                  Short Description <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Brief description of the tryout..."
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.description && "border-red-500 focus-visible:border-red-500"
                  )}
                  rows={3}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                  {validationErrors.description && (
                    <p className="text-xs text-red-400">{validationErrors.description}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-game" className="text-white font-rajdhani text-sm">
                  Game <span className="text-red-400">*</span>
                </Label>
                <Select 
                  value={formData.game_id} 
                  onValueChange={(value) => handleFieldChange('game_id', value)}
                >
                  <SelectTrigger className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.game_id && "border-red-500"
                  )}>
                    <SelectValue placeholder="Select a game" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {games?.map((game) => (
                      <SelectItem key={game.id} value={game.id} className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <span>{game.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {game.short_name}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.game_id && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.game_id}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Event Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-orbitron text-lg text-cyan-400 border-b border-gray-700 pb-2">
                Event Details
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white font-rajdhani text-sm">
                    Date <span className="text-red-400">*</span>
                  </Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                          !formData.date && "text-gray-400",
                          validationErrors.date && "border-red-500 focus-visible:border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => {
                          handleFieldChange('date', date);
                          setDatePickerOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="bg-gray-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.date && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.date}</p>
                  )}
                </div>

                <div>
                  <Label className="text-white font-rajdhani text-sm">
                    Registration Deadline
                  </Label>
                  <Popover open={deadlinePickerOpen} onOpenChange={setDeadlinePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1 bg-gray-800 border-gray-700 text-white hover:bg-gray-700",
                          !formData.registration_deadline && "text-gray-400",
                          validationErrors.registration_deadline && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.registration_deadline ? format(formData.registration_deadline, "PPP") : "Optional"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                      <Calendar
                        mode="single"
                        selected={formData.registration_deadline}
                        onSelect={(date) => {
                          handleFieldChange('registration_deadline', date);
                          setDeadlinePickerOpen(false);
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (formData.date) {
                            return date < today || date >= formData.date;
                          }
                          return date < today;
                        }}
                        initialFocus
                        className="bg-gray-800"
                      />
                    </PopoverContent>
                  </Popover>
                  {validationErrors.registration_deadline && (
                    <p className="text-xs text-red-400 mt-1">{validationErrors.registration_deadline}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="edit-location" className="text-white font-rajdhani text-sm">
                  Location <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  placeholder="e.g., Online - Discord Server"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white mt-1",
                    validationErrors.location && "border-red-500 focus-visible:border-red-500"
                  )}
                />
                {validationErrors.location && (
                  <p className="text-xs text-red-400 mt-1">{validationErrors.location}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <InfoIcon className="w-4 h-4" />
            <span>Changes are automatically validated</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDraft}
              disabled={updateTryoutMutation.isPending || !canSaveDraft}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {updateTryoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4 mr-2" />
              )}
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit("PUBLISHED")}
              disabled={updateTryoutMutation.isPending || !canPublish}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {updateTryoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckIcon className="w-4 h-4 mr-2" />
              )}
              Publish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MyTryoutsPage() {
  const [selectedTryout, setSelectedTryout] = useState<Tryout | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);
  const [createTryoutOpen, setCreateTryoutOpen] = useState(false);
  const [editTryoutOpen, setEditTryoutOpen] = useState(false);
  const [editingTryout, setEditingTryout] = useState<Tryout | null>(null);

  // Fetch coach's tryouts - this will tell us if school association is required
  const { data: tryoutsData, isLoading: tryoutsLoading, error: tryoutsError, refetch: refetchTryouts } = api.tryouts.getCoachTryouts.useQuery({
    status: "all",
    limit: 50,
    offset: 0,
  }, {
    retry: false, // Don't retry on error so we can detect school requirement
  });

  // Check if coach needs school association
  const isSchoolRequired = tryoutsError?.data?.code === "BAD_REQUEST" && 
    tryoutsError.message.includes("Coach must be associated with a school");

  // Fetch applications for selected tryout
  const { data: applicationsData, isLoading: applicationsLoading } = api.tryouts.getTryoutApplications.useQuery(
    {
      tryout_id: selectedTryout?.id ?? "",
      status: "all",
    },
    {
      enabled: !!selectedTryout?.id && !isSchoolRequired,
    }
  );

  // Mutations for managing applications
  const updateStatusMutation = api.tryouts.updateRegistrationStatus.useMutation({
    onSuccess: () => {
      // Refetch applications after status update
      void api.useUtils().tryouts.getTryoutApplications.invalidate();
    },
  });

  const removeRegistrationMutation = api.tryouts.removeRegistration.useMutation({
    onSuccess: () => {
      // Refetch applications after removal
      void api.useUtils().tryouts.getTryoutApplications.invalidate();
    },
  });

  const handleApplicationAction = (applicationId: string, action: "ACCEPT" | "REJECT" | "REMOVE") => {
    if (action === "REMOVE") {
      removeRegistrationMutation.mutate({ registration_id: applicationId });
    } else {
      const status = action === "ACCEPT" ? "CONFIRMED" : "DECLINED";
      updateStatusMutation.mutate({ 
        registration_id: applicationId, 
        status: status
      });
    }
  };

  const handleCreateTryoutSuccess = () => {
    void refetchTryouts();
  };

  const handleEditTryoutSuccess = () => {
    void refetchTryouts();
    setSelectedTryout(null); // Clear selection to refresh the view
  };

  const handleEditTryout = (tryout: Tryout) => {
    setEditingTryout(tryout);
    setEditTryoutOpen(true);
  };

  const getGameIcon = (game: string) => {
    const icons: Record<string, string> = {
      "VALORANT": "🎯",
      "Overwatch 2": "⚡",
      "Rocket League": "🚀",
      "League of Legends": "⚔️",
      "Super Smash Bros. Ultimate": "🥊",
    };
    return icons[game] ?? "🎮";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-400">DRAFT</Badge>;
      case "PUBLISHED":
        return <Badge variant="outline" className="text-xs border-green-400 text-green-400">PUBLISHED</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="text-xs border-red-400 text-red-400">CANCELLED</Badge>;
      default:
        return <Badge variant="outline" className="text-xs border-gray-400 text-gray-400">UNKNOWN</Badge>;
    }
  };

  // Show loading state
  if (tryoutsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          <div className="text-white font-rajdhani">Loading tryouts...</div>
        </div>
      </div>
    );
  }

  // Show school association requirement
  if (isSchoolRequired) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white">My Tryouts</h1>
            <p className="text-gray-400 font-rajdhani">Manage your recruitment events and player applications</p>
          </div>
        </div>

        {/* School Association Required Card */}
        <Card className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-600/30">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="bg-yellow-500/20 p-4 rounded-full">
                  <SchoolIcon className="w-12 h-12 text-yellow-400" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-white mb-2">
                  School Association Required
                </h2>
                <p className="text-gray-300 font-rajdhani text-lg max-w-2xl mx-auto">
                  To create and manage tryouts, you need to associate your coach profile with a school. 
                  This ensures all tryouts are properly linked to your institution.
                </p>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-600/40 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="font-orbitron font-semibold text-yellow-200 mb-3">What you need to do:</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-500 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-yellow-100 font-rajdhani">
                        Go to your coach profile settings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-500 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-yellow-100 font-rajdhani">
                        Select or add your school/institution
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-yellow-500 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-yellow-100 font-rajdhani">
                        Save your profile and return here to create tryouts
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-orbitron"
                >
                  <Link href="/dashboard/coaches/profile">
                    <SchoolIcon className="w-5 h-5 mr-2" />
                    Set Up School Association
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => refetchTryouts()}
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 font-orbitron"
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                  Check Again
                </Button>
              </div>

              <div className="text-sm text-gray-400 font-rajdhani">
                <p>Need help? Contact support if you&apos;re having trouble associating your school.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tryouts = tryoutsData?.tryouts ?? [];
  
  // Set first tryout as selected if none selected
  if (!selectedTryout && tryouts.length > 0 && tryouts[0]) {
    setSelectedTryout(tryouts[0]);
  }

  const applications = applicationsData?.applications ?? [];
  const pendingApplications = applications.filter(app => app.status === "PENDING");
  const acceptedApplications = applications.filter(app => app.status === "CONFIRMED");
  const rejectedApplications = applications.filter(app => app.status === "DECLINED");

  // Show empty state if no tryouts
  if (tryouts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white">My Tryouts</h1>
            <p className="text-gray-400 font-rajdhani">Manage your recruitment events and player applications</p>
          </div>
          <Button 
            onClick={() => setCreateTryoutOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New Tryout
          </Button>
        </div>
        <div className="text-center py-12">
          <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-orbitron text-white mb-2">No Tryouts Yet</h3>
          <p className="text-gray-400 font-rajdhani mb-6">Create your first tryout to start recruiting players</p>
          <Button 
            onClick={() => setCreateTryoutOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Your First Tryout
          </Button>
        </div>
        
        <CreateTryoutDialog
          open={createTryoutOpen}
          onOpenChange={setCreateTryoutOpen}
          onSuccess={handleCreateTryoutSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">My Tryouts</h1>
          <p className="text-gray-400 font-rajdhani">Manage your recruitment events and player applications</p>
        </div>
        <Button 
          onClick={() => setCreateTryoutOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create New Tryout
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tryouts List */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white font-orbitron">Your Tryouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tryouts.map((tryout) => (
                <div
                  key={tryout.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTryout?.id === tryout.id
                      ? "border-cyan-400 bg-cyan-900/20"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedTryout(tryout as Tryout)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getGameIcon(tryout.game.name)}</span>
                      {getStatusBadge(tryout.status)}
                    </div>
                    {/* Edit button for draft tryouts */}
                    {tryout.status === "DRAFT" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent selecting the tryout
                          handleEditTryout(tryout as Tryout);
                        }}
                        className="border-yellow-600 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                      >
                        <EditIcon className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  <h3 className="font-orbitron font-bold text-white text-sm mb-2">{tryout.title}</h3>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span>{new Date(tryout.date).toLocaleDateString()} {tryout.time_start && `at ${tryout.time_start}`}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="w-3 h-3" />
                      <span>{tryout.registeredCount}/{tryout.max_spots} registered</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{tryout.pendingCount} pending applications</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Tryout Details and Applications */}
        <div className="lg:col-span-2">
          {selectedTryout && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white font-orbitron flex items-center space-x-2">
                      <span className="text-2xl">{getGameIcon(selectedTryout.game.name)}</span>
                      <span>{selectedTryout.title}</span>
                    </CardTitle>
                    <p className="text-gray-400 font-rajdhani mt-1">{selectedTryout.description}</p>
                  </div>
                  {getStatusBadge(selectedTryout.status)}
                </div>
                
                {/* Tryout Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <CalendarIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm text-white font-rajdhani">{new Date(selectedTryout.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <MapPinIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm text-white font-rajdhani">{selectedTryout.location}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <UsersIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Registered</p>
                    <p className="text-sm text-white font-rajdhani">{selectedTryout.registeredCount}/{selectedTryout.max_spots}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded-lg">
                    <ClockIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className="text-sm text-white font-rajdhani">{selectedTryout.pendingCount}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {applicationsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 font-rajdhani">Loading applications...</div>
                  </div>
                ) : (
                  <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                      <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                        Pending ({pendingApplications.length})
                      </TabsTrigger>
                      <TabsTrigger value="accepted" className="data-[state=active]:bg-green-600">
                        Accepted ({acceptedApplications.length})
                      </TabsTrigger>
                      <TabsTrigger value="rejected" className="data-[state=active]:bg-red-600">
                        Rejected ({rejectedApplications.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* Pending Applications */}
                    <TabsContent value="pending" className="space-y-4">
                      {pendingApplications.length === 0 ? (
                        <div className="text-center py-8">
                          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 font-rajdhani">No pending applications</p>
                        </div>
                      ) : (
                        pendingApplications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={application.player.avatar ?? undefined} />
                                <AvatarFallback className="bg-gray-700 text-white">
                                  {application.player.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-orbitron font-bold text-white">{application.player.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {application.player.game_profiles?.[0]?.rank ?? "Unranked"} • {application.player.game_profiles?.[0]?.role ?? "No role"}
                                </p>
                                <p className="text-xs text-gray-500">{application.player.class_year ?? "Unknown year"}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPlayer(application.player);
                                  setPlayerDialogOpen(true);
                                }}
                                className="border-gray-600 text-gray-300 hover:text-white"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApplicationAction(application.id, "ACCEPT")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckIcon className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleApplicationAction(application.id, "REJECT")}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={updateStatusMutation.isPending}
                              >
                                <XIcon className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>

                    {/* Accepted Applications */}
                    <TabsContent value="accepted" className="space-y-4">
                      {acceptedApplications.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 font-rajdhani">No accepted players yet</p>
                        </div>
                      ) : (
                        acceptedApplications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={application.player.avatar ?? undefined} />
                                <AvatarFallback className="bg-gray-700 text-white">
                                  {application.player.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-orbitron font-bold text-white">{application.player.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {application.player.game_profiles?.[0]?.rank ?? "Unranked"} • {application.player.game_profiles?.[0]?.role ?? "No role"}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className="bg-green-600 text-white text-xs">Accepted</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPlayer(application.player);
                                  setPlayerDialogOpen(true);
                                }}
                                className="border-gray-600 text-gray-300 hover:text-white"
                              >
                                <EyeIcon className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                                    <MoreVerticalIcon className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                  <DropdownMenuItem 
                                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                                    onClick={() => {/* TODO: Implement message functionality */}}
                                  >
                                    <MessageSquareIcon className="w-4 h-4 mr-2" />
                                    Send Message
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    onClick={() => handleApplicationAction(application.id, "REMOVE")}
                                    disabled={removeRegistrationMutation.isPending}
                                  >
                                    <UserMinusIcon className="w-4 h-4 mr-2" />
                                    Remove Player
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))
                      )}
                    </TabsContent>

                    {/* Rejected Applications */}
                    <TabsContent value="rejected" className="space-y-4">
                      {rejectedApplications.length === 0 ? (
                        <div className="text-center py-8">
                          <XIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 font-rajdhani">No rejected applications</p>
                        </div>
                      ) : (
                        rejectedApplications.map((application) => (
                          <div key={application.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg opacity-75">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={application.player.avatar ?? undefined} />
                                <AvatarFallback className="bg-gray-700 text-white">
                                  {application.player.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-orbitron font-bold text-white">{application.player.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {application.player.game_profiles?.[0]?.rank ?? "Unranked"} • {application.player.game_profiles?.[0]?.role ?? "No role"}
                                </p>
                                <Badge className="bg-red-600 text-white text-xs mt-1">Rejected</Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedPlayer(application.player);
                                setPlayerDialogOpen(true);
                              }}
                              className="border-gray-600 text-gray-300 hover:text-white"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Player Details Dialog */}
      <Dialog open={playerDialogOpen} onOpenChange={setPlayerDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-orbitron text-xl">Player Profile</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Detailed information about {selectedPlayer.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Player Header */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedPlayer.avatar ?? undefined} />
                    <AvatarFallback className="bg-gray-700 text-white text-lg">
                      {selectedPlayer.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-orbitron font-bold text-white">{selectedPlayer.name}</h3>
                    <p className="text-gray-400">{selectedPlayer.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-cyan-600 text-white">{selectedPlayer.game_profiles?.[0]?.rank ?? "Unranked"}</Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">{selectedPlayer.game_profiles?.[0]?.role ?? "No role"}</Badge>
                    </div>
                  </div>
                </div>

                {/* Player Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-orbitron font-bold text-white mb-3">Game Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Primary Role:</span>
                        <span className="text-white">{selectedPlayer.game_profiles?.[0]?.role ?? "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rank:</span>
                        <span className="text-white">{selectedPlayer.game_profiles?.[0]?.rank ?? "Unranked"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Class Year:</span>
                        <span className="text-white">{selectedPlayer.class_year ?? "Not specified"}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-orbitron font-bold text-white mb-3">Academic Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">School:</span>
                        <span className="text-white">{selectedPlayer.school ?? "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">GPA:</span>
                        <span className="text-white">{selectedPlayer.gpa?.toString() ?? "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white">{selectedPlayer.location ?? "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedPlayer.bio && (
                  <div>
                    <h4 className="font-orbitron font-bold text-white mb-3">Player Bio</h4>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-gray-300 font-rajdhani">{selectedPlayer.bio}</p>
                    </div>
                  </div>
                )}

                {/* Platform Connections */}
                {selectedPlayer.platform_connections && selectedPlayer.platform_connections.length > 0 && (
                  <div>
                    <h4 className="font-orbitron font-bold text-white mb-3">Platform Connections</h4>
                    <div className="space-y-2">
                      {selectedPlayer.platform_connections.map((connection, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                          <span className="text-gray-400 capitalize">{connection.platform}:</span>
                          <span className="text-white font-mono">{connection.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Tryout Dialog */}
      <CreateTryoutDialog
        open={createTryoutOpen}
        onOpenChange={setCreateTryoutOpen}
        onSuccess={handleCreateTryoutSuccess}
      />

      {/* Edit Tryout Dialog */}
      <EditTryoutDialog
        open={editTryoutOpen}
        onOpenChange={setEditTryoutOpen}
        onSuccess={handleEditTryoutSuccess}
        tryout={editingTryout}
      />
    </div>
  );
} 