"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingIcon, SendIcon, PlusIcon, CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function SchoolAssociationRequestForm() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [requestMessage, setRequestMessage] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewSchoolRequest, setIsNewSchoolRequest] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({
    name: "",
    type: undefined as "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY" | undefined,
    location: "",
    state: "",
    region: "",
    website: "",
  });

  // Get available schools
  const { data: schools, isLoading: isLoadingSchools } = api.coachProfile.getAvailableSchools.useQuery();

  // Submit request mutation
  const submitRequest = api.coachProfile.submitSchoolAssociationRequest.useMutation({
    onSuccess: () => {
      toast.success("School association request submitted successfully!");
      setSelectedSchoolId("");
      setRequestMessage("");
      setComboboxOpen(false);
      setIsNewSchoolRequest(false);
      setNewSchoolData({
        name: "",
        type: undefined,
        location: "",
        state: "",
        region: "",
        website: "",
      });
      // Refetch onboarding status and school info
      void utils.coachProfile.getOnboardingStatus.invalidate();
      void utils.coachProfile.getSchoolInfo.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit request");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const utils = api.useUtils();

  const selectedSchool = schools?.find(school => school.id === selectedSchoolId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNewSchoolRequest) {
      // Validate new school data
      if (!newSchoolData.name.trim()) {
        toast.error("Please enter the school name");
        return;
      }
      if (!newSchoolData.type) {
        toast.error("Please select the school type");
        return;
      }
      if (!newSchoolData.location.trim()) {
        toast.error("Please enter the school location");
        return;
      }
      if (!newSchoolData.state.trim()) {
        toast.error("Please enter the school state");
        return;
      }
    } else {
      if (!selectedSchoolId) {
        toast.error("Please select a school");
        return;
      }
    }

    setIsSubmitting(true);
    await submitRequest.mutateAsync({
      school_id: isNewSchoolRequest ? undefined : selectedSchoolId,
      request_message: requestMessage || undefined,
      is_new_school_request: isNewSchoolRequest,
      proposed_school_name: isNewSchoolRequest ? newSchoolData.name : undefined,
      proposed_school_type: isNewSchoolRequest ? newSchoolData.type : undefined,
      proposed_school_location: isNewSchoolRequest ? newSchoolData.location : undefined,
      proposed_school_state: isNewSchoolRequest ? newSchoolData.state : undefined,
      proposed_school_region: isNewSchoolRequest && newSchoolData.region ? newSchoolData.region : undefined,
      proposed_school_website: isNewSchoolRequest && newSchoolData.website ? newSchoolData.website : undefined,
    });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white font-orbitron flex items-center gap-2">
          <BuildingIcon className="h-5 w-5" />
          Request School Association
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mode Toggle */}
          <div className="space-y-2">
            <Label className="text-gray-300">Request Type</Label>
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={!isNewSchoolRequest ? "default" : "outline"}
                onClick={() => {
                  setIsNewSchoolRequest(false);
                  setSelectedSchoolId("");
                  setComboboxOpen(false);
                }}
                className={`${!isNewSchoolRequest ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-700 hover:bg-gray-600"} text-white border-gray-600`}
              >
                <BuildingIcon className="h-4 w-4 mr-2" />
                Existing School
              </Button>
              <Button
                type="button"
                variant={isNewSchoolRequest ? "default" : "outline"}
                onClick={() => {
                  setIsNewSchoolRequest(true);
                  setSelectedSchoolId("");
                  setComboboxOpen(false);
                }}
                className={`${isNewSchoolRequest ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-700 hover:bg-gray-600 hover:text-gray-200"} text-white border-gray-600`}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Request New School
              </Button>
            </div>
          </div>

          {!isNewSchoolRequest ? (
            <>
              {/* School Combobox */}
              <div className="space-y-2">
                <Label className="text-gray-300">
                  Select School *
                </Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:text-gray-200"
                      disabled={isLoadingSchools}
                    >
                      {selectedSchoolId && selectedSchool ? (
                        <div className="flex flex-col text-left">
                          <span className="font-medium">{selectedSchool.name}</span>
                          <span className="text-sm text-gray-400">
                            {selectedSchool.type.replace('_', ' ')} • {selectedSchool.location}, {selectedSchool.state}
                          </span>
                        </div>
                      ) : (
                        "Search and select a school..."
                      )}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-gray-700 border-gray-600">
                    <Command className="bg-gray-700">
                      <CommandInput 
                        placeholder="Search schools by name, location, or state..." 
                        className="bg-gray-700 text-white border-none"
                      />
                      <CommandList>
                        <CommandEmpty className="py-6 text-center text-sm text-gray-400">
                          <div className="space-y-2">
                            <p>No schools found.</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsNewSchoolRequest(true);
                                setComboboxOpen(false);
                              }}
                              className="bg-gray-600 hover:bg-gray-500 text-white border-gray-500"
                            >
                              <PlusIcon className="h-3 w-3 mr-1" />
                              Request New School Instead
                            </Button>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          {schools?.map((school) => (
                            <CommandItem
                              key={school.id}
                              value={`${school.name} ${school.location} ${school.state} ${school.type}`.toLowerCase()}
                              onSelect={() => {
                                setSelectedSchoolId(school.id);
                                setComboboxOpen(false);
                              }}
                              className="text-white hover:bg-gray-600 data-[selected=true]:bg-gray-600"
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedSchoolId === school.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-white">{school.name}</span>
                                <span className="text-sm text-gray-400">
                                  {school.type.replace('_', ' ')} • {school.location}, {school.state}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                          <div className="border-t border-gray-600 mx-1 my-1"></div>
                          <CommandItem
                            onSelect={() => {
                              setIsNewSchoolRequest(true);
                              setComboboxOpen(false);
                            }}
                            className="text-cyan-400 hover:bg-gray-600 hover:text-cyan-300 data-[selected=true]:bg-gray-600 data-[selected=true]:text-cyan-300"
                          >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Don&apos;t see your school? Request a new one
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </>
          ) : (
            <>
              {/* New School Form */}
              <div className="space-y-4 bg-gray-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">New School Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName" className="text-gray-300">
                      School Name *
                    </Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="Enter school name"
                      value={newSchoolData.name}
                      onChange={(e) => setNewSchoolData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schoolType" className="text-gray-300">
                      School Type *
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                        >
                          {newSchoolData.type ? (
                            newSchoolData.type === "HIGH_SCHOOL" ? "High School" :
                            newSchoolData.type === "COLLEGE" ? "College" : "University"
                          ) : "Select type..."}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0 bg-gray-700 border-gray-600">
                        <Command className="bg-gray-700">
                          <CommandList>
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => setNewSchoolData(prev => ({ ...prev, type: "HIGH_SCHOOL" }))}
                                className="text-white hover:bg-gray-600 data-[selected=true]:bg-gray-600"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newSchoolData.type === "HIGH_SCHOOL" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                High School
                              </CommandItem>
                              <CommandItem
                                onSelect={() => setNewSchoolData(prev => ({ ...prev, type: "COLLEGE" }))}
                                className="text-white hover:bg-gray-600 data-[selected=true]:bg-gray-600"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newSchoolData.type === "COLLEGE" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                College
                              </CommandItem>
                              <CommandItem
                                onSelect={() => setNewSchoolData(prev => ({ ...prev, type: "UNIVERSITY" }))}
                                className="text-white hover:bg-gray-600 data-[selected=true]:bg-gray-600"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newSchoolData.type === "UNIVERSITY" ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                University
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schoolLocation" className="text-gray-300">
                      City/Location *
                    </Label>
                    <Input
                      id="schoolLocation"
                      type="text"
                      placeholder="Enter city"
                      value={newSchoolData.location}
                      onChange={(e) => setNewSchoolData(prev => ({ ...prev, location: e.target.value }))}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schoolState" className="text-gray-300">
                      State *
                    </Label>
                    <Input
                      id="schoolState"
                      type="text"
                      placeholder="Enter state"
                      value={newSchoolData.state}
                      onChange={(e) => setNewSchoolData(prev => ({ ...prev, state: e.target.value }))}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schoolRegion" className="text-gray-300">
                      Region (Optional)
                    </Label>
                    <Input
                      id="schoolRegion"
                      type="text"
                      placeholder="Enter region"
                      value={newSchoolData.region}
                      onChange={(e) => setNewSchoolData(prev => ({ ...prev, region: e.target.value }))}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="schoolWebsite" className="text-gray-300">
                      Website (Optional)
                    </Label>
                    <Input
                      id="schoolWebsite"
                      type="url"
                      placeholder="Enter website URL"
                      value={newSchoolData.website}
                      onChange={(e) => setNewSchoolData(prev => ({ ...prev, website: e.target.value }))}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Selected School Info */}
          {selectedSchool && (
            <div className="bg-gray-700 rounded-lg p-3">
              <h4 className="text-white font-medium mb-2">Selected School</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <p><span className="font-medium">Name:</span> {selectedSchool.name}</p>
                <p><span className="font-medium">Type:</span> {selectedSchool.type.replace('_', ' ')}</p>
                <p><span className="font-medium">Location:</span> {selectedSchool.location}, {selectedSchool.state}</p>
                {selectedSchool.region && (
                  <p><span className="font-medium">Region:</span> {selectedSchool.region}</p>
                )}
              </div>
            </div>
          )}

          {/* Request Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-300">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Explain your connection to this school and why you should be associated..."
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-400 text-right">
              {requestMessage.length}/500 characters
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={(!selectedSchoolId && !isNewSchoolRequest) || isSubmitting}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>

          <p className="text-xs text-gray-400">
            {isNewSchoolRequest 
              ? "Your new school request will be reviewed by our administrators. If approved, the school will be created and you'll be associated with it."
              : "Your request will be reviewed by our administrators. You'll be notified once it's processed."
            }
          </p>
        </form>
      </CardContent>
    </Card>
  );
} 