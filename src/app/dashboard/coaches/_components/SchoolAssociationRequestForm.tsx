"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BuildingIcon,
  SendIcon,
  PlusIcon,
  CheckIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

const US_REGIONS = [
  { value: "northeast", label: "Northeast" },
  { value: "southeast", label: "Southeast" },
  { value: "midwest", label: "Midwest" },
  { value: "southwest", label: "Southwest" },
  { value: "west", label: "West" },
  { value: "pacific", label: "Pacific" },
];

export function SchoolAssociationRequestForm() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [requestMessage, setRequestMessage] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNewSchoolRequest, setIsNewSchoolRequest] = useState(false);
  const [stateComboboxOpen, setStateComboboxOpen] = useState(false);
  const [regionComboboxOpen, setRegionComboboxOpen] = useState(false);
  const [newSchoolData, setNewSchoolData] = useState({
    name: "",
    type: undefined as "HIGH_SCHOOL" | "COLLEGE" | "UNIVERSITY" | undefined,
    location: "",
    state: "",
    region: "",
    website: "",
  });

  // Get available schools
  const { data: schools, isLoading: isLoadingSchools } =
    api.coachProfile.getAvailableSchools.useQuery();

  // Submit request mutation
  const submitRequest =
    api.coachProfile.submitSchoolAssociationRequest.useMutation({
      onSuccess: () => {
        toast.success("School association request submitted successfully!");
        setSelectedSchoolId("");
        setRequestMessage("");
        setComboboxOpen(false);
        setStateComboboxOpen(false);
        setRegionComboboxOpen(false);
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

  const selectedSchool = schools?.find(
    (school) => school.id === selectedSchoolId,
  );

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
      if (!newSchoolData.state) {
        toast.error("Please select the school state");
        return;
      }
      // Validate website URL if provided
      if (newSchoolData.website?.trim()) {
        const url = newSchoolData.website.trim();

        // Require protocol (http:// or https://)
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          toast.error(
            "Please enter a complete website URL starting with https:// or http://",
          );
          return;
        }

        try {
          new URL(url);
        } catch {
          toast.error(
            "Please enter a valid website URL (e.g., https://example.com)",
          );
          return;
        }
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
      proposed_school_location: isNewSchoolRequest
        ? newSchoolData.location
        : undefined,
      proposed_school_state: isNewSchoolRequest
        ? newSchoolData.state
        : undefined,
      proposed_school_region:
        isNewSchoolRequest && newSchoolData.region
          ? newSchoolData.region
          : undefined,
      proposed_school_website:
        isNewSchoolRequest && newSchoolData.website
          ? newSchoolData.website
          : undefined,
    });
  };

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="font-orbitron flex items-center gap-2 text-white">
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
                  setStateComboboxOpen(false);
                  setRegionComboboxOpen(false);
                }}
                className={`${!isNewSchoolRequest ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-700 hover:bg-gray-600 hover:text-white"} border-gray-600 text-white`}
              >
                <BuildingIcon className="mr-2 h-4 w-4" />
                Existing School
              </Button>
              <Button
                type="button"
                variant={isNewSchoolRequest ? "default" : "outline"}
                onClick={() => {
                  setIsNewSchoolRequest(true);
                  setSelectedSchoolId("");
                  setComboboxOpen(false);
                  setStateComboboxOpen(false);
                  setRegionComboboxOpen(false);
                }}
                className={`${isNewSchoolRequest ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-700 hover:bg-gray-600 hover:text-white"} border-gray-600 text-white`}
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Request New School
              </Button>
            </div>
          </div>

          {!isNewSchoolRequest ? (
            <>
              {/* School Combobox */}
              <div className="space-y-2">
                <Label className="text-gray-300">Select School *</Label>
                <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={comboboxOpen}
                      className="w-full justify-between border-gray-600 bg-gray-700 text-white hover:bg-gray-600 hover:text-white"
                      disabled={isLoadingSchools}
                    >
                      {selectedSchoolId && selectedSchool ? (
                        <div className="flex flex-col text-left">
                          <span className="font-medium">
                            {selectedSchool.name}
                          </span>
                          <span className="text-sm text-gray-400">
                            {selectedSchool.type.replace("_", " ")} •{" "}
                            {selectedSchool.location},{" "}
                            {US_STATES.find(
                              (s) => s.value === selectedSchool.state,
                            )?.label ?? selectedSchool.state}
                          </span>
                        </div>
                      ) : (
                        "Search and select a school..."
                      )}
                      <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full border-gray-600 bg-gray-700 p-0">
                    <Command className="bg-gray-700">
                      <CommandInput
                        placeholder="Search schools by name, location, or state..."
                        className="border-none bg-gray-700 text-white"
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
                                setStateComboboxOpen(false);
                                setRegionComboboxOpen(false);
                              }}
                              className="border-gray-500 bg-gray-600 text-white hover:bg-gray-500"
                            >
                              <PlusIcon className="mr-1 h-3 w-3" />
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
                              className="text-white hover:bg-gray-600 hover:text-white data-[selected=true]:bg-gray-600 data-[selected=true]:text-white"
                            >
                              <CheckIcon
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedSchoolId === school.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium text-white">
                                  {school.name}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {school.type.replace("_", " ")} •{" "}
                                  {school.location},{" "}
                                  {US_STATES.find(
                                    (s) => s.value === school.state,
                                  )?.label ?? school.state}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                          <div className="mx-1 my-1 border-t border-gray-600"></div>
                          <CommandItem
                            onSelect={() => {
                              setIsNewSchoolRequest(true);
                              setComboboxOpen(false);
                              setStateComboboxOpen(false);
                              setRegionComboboxOpen(false);
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
              <div className="space-y-4 rounded-lg bg-gray-700 p-4">
                <h4 className="mb-2 font-medium text-white">
                  New School Information
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName" className="text-gray-300">
                      School Name *
                    </Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="Enter school name"
                      value={newSchoolData.name}
                      onChange={(e) =>
                        setNewSchoolData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="border-gray-500 bg-gray-600 text-white"
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
                          className="w-full justify-between border-gray-500 bg-gray-600 text-white hover:bg-gray-500 hover:text-white"
                        >
                          {newSchoolData.type
                            ? newSchoolData.type === "HIGH_SCHOOL"
                              ? "High School"
                              : newSchoolData.type === "COLLEGE"
                                ? "2-year post secondary institution (College)"
                                : "4-year post secondary institution (University)"
                            : "Select type..."}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full border-gray-600 bg-gray-700 p-0">
                        <Command className="bg-gray-700">
                          <CommandList>
                            <CommandGroup>
                              <CommandItem
                                onSelect={() =>
                                  setNewSchoolData((prev) => ({
                                    ...prev,
                                    type: "HIGH_SCHOOL",
                                  }))
                                }
                                className="text-white hover:bg-gray-600 hover:text-white data-[selected=true]:bg-gray-600 data-[selected=true]:text-white"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newSchoolData.type === "HIGH_SCHOOL"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                High School
                              </CommandItem>
                              <CommandItem
                                onSelect={() =>
                                  setNewSchoolData((prev) => ({
                                    ...prev,
                                    type: "COLLEGE",
                                  }))
                                }
                                className="text-white hover:bg-gray-600 hover:text-white data-[selected=true]:bg-gray-600 data-[selected=true]:text-white"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newSchoolData.type === "COLLEGE"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                2-year post secondary institution (College)
                              </CommandItem>
                              <CommandItem
                                onSelect={() =>
                                  setNewSchoolData((prev) => ({
                                    ...prev,
                                    type: "UNIVERSITY",
                                  }))
                                }
                                className="text-white hover:bg-gray-600 hover:text-white data-[selected=true]:bg-gray-600 data-[selected=true]:text-white"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    newSchoolData.type === "UNIVERSITY"
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                4-year post secondary institution (University)
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
                      placeholder="Enter city (e.g., Boston, San Francisco, etc.)"
                      value={newSchoolData.location}
                      onChange={(e) =>
                        setNewSchoolData((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="border-gray-500 bg-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolState" className="text-gray-300">
                      State *
                    </Label>
                    <Popover
                      open={stateComboboxOpen}
                      onOpenChange={setStateComboboxOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={stateComboboxOpen}
                          className="w-full justify-between border-gray-500 bg-gray-600 text-white hover:bg-gray-500 hover:text-white"
                        >
                          {newSchoolData.state
                            ? US_STATES.find(
                                (s) => s.value === newSchoolData.state,
                              )?.label
                            : "Select state..."}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full border-gray-600 bg-gray-700 p-0">
                        <Command className="bg-gray-700">
                          <CommandInput
                            placeholder="Search states..."
                            className="border-none bg-gray-700 text-white"
                          />
                          <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm text-gray-400">
                              <div className="space-y-2">
                                <p>No states found.</p>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {US_STATES.map((state) => (
                                <CommandItem
                                  key={state.value}
                                  value={state.label}
                                  onSelect={() => {
                                    setNewSchoolData((prev) => ({
                                      ...prev,
                                      state: state.value,
                                    }));
                                    setStateComboboxOpen(false);
                                  }}
                                  className="text-white hover:bg-gray-600 hover:text-white data-[selected=true]:bg-gray-600 data-[selected=true]:text-white"
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      newSchoolData.state === state.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {state.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolRegion" className="text-gray-300">
                      Region (Optional)
                    </Label>
                    <Popover
                      open={regionComboboxOpen}
                      onOpenChange={setRegionComboboxOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={regionComboboxOpen}
                          className="w-full justify-between border-gray-500 bg-gray-600 text-white hover:bg-gray-500 hover:text-white"
                        >
                          {newSchoolData.region
                            ? US_REGIONS.find(
                                (r) => r.value === newSchoolData.region,
                              )?.label
                            : "Select region..."}
                          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full border-gray-600 bg-gray-700 p-0">
                        <Command className="bg-gray-700">
                          <CommandInput
                            placeholder="Search regions..."
                            className="border-none bg-gray-700 text-white"
                          />
                          <CommandList>
                            <CommandEmpty className="py-6 text-center text-sm text-gray-400">
                              <div className="space-y-2">
                                <p>No regions found.</p>
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value=""
                                onSelect={() => {
                                  setNewSchoolData((prev) => ({
                                    ...prev,
                                    region: "",
                                  }));
                                  setRegionComboboxOpen(false);
                                }}
                                className="text-gray-400 hover:bg-gray-600 hover:text-gray-400 data-[selected=true]:bg-gray-600 data-[selected=true]:text-gray-400"
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    !newSchoolData.region
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                No region selected
                              </CommandItem>
                              {US_REGIONS.map((region) => (
                                <CommandItem
                                  key={region.value}
                                  value={region.label}
                                  onSelect={() => {
                                    setNewSchoolData((prev) => ({
                                      ...prev,
                                      region: region.value,
                                    }));
                                    setRegionComboboxOpen(false);
                                  }}
                                  className="text-white hover:bg-gray-600 hover:text-white data-[selected=true]:bg-gray-600 data-[selected=true]:text-white"
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      newSchoolData.region === region.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  {region.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="schoolWebsite" className="text-gray-300">
                      Website (Optional)
                    </Label>
                    <Input
                      id="schoolWebsite"
                      type="url"
                      placeholder="https://example.com"
                      value={newSchoolData.website}
                      onChange={(e) =>
                        setNewSchoolData((prev) => ({
                          ...prev,
                          website: e.target.value,
                        }))
                      }
                      className="border-gray-500 bg-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Selected School Info */}
          {selectedSchool && (
            <div className="rounded-lg bg-gray-700 p-3">
              <h4 className="mb-2 font-medium text-white">Selected School</h4>
              <div className="space-y-1 text-sm text-gray-300">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {selectedSchool.name}
                </p>
                <p>
                  <span className="font-medium">Type:</span>{" "}
                  {selectedSchool.type.replace("_", " ")}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {selectedSchool.location},{" "}
                  {US_STATES.find((s) => s.value === selectedSchool.state)
                    ?.label ?? selectedSchool.state}
                </p>
                {selectedSchool.region && (
                  <p>
                    <span className="font-medium">Region:</span>{" "}
                    {selectedSchool.region}
                  </p>
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
              className="min-h-[100px] border-gray-600 bg-gray-700 text-white"
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-400">
              {requestMessage.length}/500 characters
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              (!selectedSchoolId && !isNewSchoolRequest) || isSubmitting
            }
            className="font-orbitron w-full bg-cyan-600 text-white hover:bg-cyan-700"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Submitting...
              </>
            ) : (
              <>
                <SendIcon className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </Button>

          <p className="text-xs text-gray-400">
            {isNewSchoolRequest
              ? "Your new school request will be reviewed by our administrators. If approved, the school will be created and you'll be associated with it."
              : "Your request will be reviewed by our administrators. You'll be notified once it's processed."}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
