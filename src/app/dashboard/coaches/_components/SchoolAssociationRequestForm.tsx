"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BuildingIcon, SendIcon, SearchIcon } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export function SchoolAssociationRequestForm() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [requestMessage, setRequestMessage] = useState("");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available schools
  const { data: schools, isLoading: isLoadingSchools } = api.coachProfile.getAvailableSchools.useQuery();

  // Submit request mutation
  const submitRequest = api.coachProfile.submitSchoolAssociationRequest.useMutation({
    onSuccess: () => {
      toast.success("School association request submitted successfully!");
      setSelectedSchoolId("");
      setRequestMessage("");
      setSchoolSearch("");
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

  // Filter schools based on search
  const filteredSchools = schools?.filter(school =>
    school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    school.location.toLowerCase().includes(schoolSearch.toLowerCase()) ||
    school.state.toLowerCase().includes(schoolSearch.toLowerCase())
  ) ?? [];

  const selectedSchool = schools?.find(school => school.id === selectedSchoolId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSchoolId) {
      toast.error("Please select a school");
      return;
    }

    setIsSubmitting(true);
    await submitRequest.mutateAsync({
      school_id: selectedSchoolId,
      request_message: requestMessage || undefined,
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
          {/* School Search */}
          <div className="space-y-2">
            <Label htmlFor="schoolSearch" className="text-gray-300">
              Search Schools
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="schoolSearch"
                type="text"
                placeholder="Search by school name, location, or state..."
                value={schoolSearch}
                onChange={(e) => setSchoolSearch(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
                disabled={isLoadingSchools}
              />
            </div>
          </div>

          {/* School Selection */}
          <div className="space-y-2">
            <Label htmlFor="school" className="text-gray-300">
              Select School *
            </Label>
            <Select 
              value={selectedSchoolId} 
              onValueChange={setSelectedSchoolId}
              disabled={isLoadingSchools}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose a school..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {filteredSchools.length === 0 ? (
                  <div className="p-3 text-gray-400 text-sm">
                    {isLoadingSchools ? "Loading schools..." : "No schools found"}
                  </div>
                ) : (
                  filteredSchools.map((school) => (
                    <SelectItem
                      key={school.id}
                      value={school.id}
                      className="text-white hover:bg-gray-600"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{school.name}</span>
                        <span className="text-sm text-gray-400">
                          {school.type.replace('_', ' ')} • {school.location}, {school.state}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

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
            disabled={!selectedSchoolId || isSubmitting}
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
             Your request will be reviewed by our administrators. You&apos;ll be notified once it&apos;s processed.
           </p>
        </form>
      </CardContent>
    </Card>
  );
} 