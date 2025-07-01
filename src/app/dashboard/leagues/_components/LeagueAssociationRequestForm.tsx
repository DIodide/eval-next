"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";

const ORGANIZATION_TYPES = [
  { value: "PROFESSIONAL_LEAGUE", label: "Professional League" },
  { value: "COLLEGIATE_LEAGUE", label: "Collegiate League" },
  { value: "HIGH_SCHOOL_LEAGUE", label: "High School League" },
  { value: "AMATEUR_LEAGUE", label: "Amateur League" },
  { value: "TOURNAMENT_ORGANIZER", label: "Tournament Organizer" },
  { value: "ESPORTS_COMPANY", label: "Esports Company" },
  { value: "GAMING_ORGANIZATION", label: "Gaming Organization" },
] as const;

const GAME_OPTIONS = [
  "Valorant",
  "League of Legends",
  "Counter-Strike 2",
  "Overwatch 2",
  "Rocket League",
  "Apex Legends",
  "Fortnite",
  "Call of Duty",
  "Other"
];

export function LeagueAssociationRequestForm() {
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    organizationWebsite: "",
    organizationLocation: "",
    organizationState: "",
    organizationRegion: "",
    description: "",
    foundedYear: "",
    requestMessage: "",
    references: "",
  });

  const [leaguesOperated, setLeaguesOperated] = useState<string[]>([]);
  const [gamesSupported, setGamesSupported] = useState<string[]>([]);
  const [verificationDocuments, setVerificationDocuments] = useState<string[]>([]);
  const [newLeague, setNewLeague] = useState("");
  const [newDocument, setNewDocument] = useState("");

  const submitRequest = api.leagueProfile.submitAssociationRequest.useMutation({
    onSuccess: () => {
      toast.success("League verification request submitted successfully!");
      // Reset form
      setFormData({
        organizationName: "",
        organizationType: "",
        organizationWebsite: "",
        organizationLocation: "",
        organizationState: "",
        organizationRegion: "",
        description: "",
        foundedYear: "",
        requestMessage: "",
        references: "",
      });
      setLeaguesOperated([]);
      setGamesSupported([]);
      setVerificationDocuments([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit request");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.organizationName || !formData.organizationType) {
      toast.error("Please fill in all required fields");
      return;
    }

    await submitRequest.mutateAsync({
      organizationName: formData.organizationName,
      organizationType: formData.organizationType as any,
      organizationWebsite: formData.organizationWebsite || undefined,
      organizationLocation: formData.organizationLocation || undefined,
      organizationState: formData.organizationState || undefined,
      organizationRegion: formData.organizationRegion || undefined,
      description: formData.description || undefined,
      foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
      leaguesOperated,
      gamesSupported,
      verificationDocuments,
      references: formData.references || undefined,
      requestMessage: formData.requestMessage || undefined,
    });
  };

  const addLeague = () => {
    if (newLeague.trim() && !leaguesOperated.includes(newLeague.trim())) {
      setLeaguesOperated([...leaguesOperated, newLeague.trim()]);
      setNewLeague("");
    }
  };

  const removeLeague = (league: string) => {
    setLeaguesOperated(leaguesOperated.filter(l => l !== league));
  };

  const addDocument = () => {
    if (newDocument.trim() && !verificationDocuments.includes(newDocument.trim())) {
      setVerificationDocuments([...verificationDocuments, newDocument.trim()]);
      setNewDocument("");
    }
  };

  const removeDocument = (doc: string) => {
    setVerificationDocuments(verificationDocuments.filter(d => d !== doc));
  };

  const toggleGame = (game: string) => {
    if (gamesSupported.includes(game)) {
      setGamesSupported(gamesSupported.filter(g => g !== game));
    } else {
      setGamesSupported([...gamesSupported, game]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-orbitron font-semibold text-white mb-4">
          League Organization Verification Request
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="organizationName" className="text-gray-300">
              Organization Name *
            </Label>
            <Input
              id="organizationName"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
              placeholder="Enter organization name"
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          {/* Organization Type */}
          <div className="space-y-2">
            <Label htmlFor="organizationType" className="text-gray-300">
              Organization Type *
            </Label>
            <Select 
              value={formData.organizationType} 
              onValueChange={(value) => setFormData({ ...formData, organizationType: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {ORGANIZATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website" className="text-gray-300">
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.organizationWebsite}
              onChange={(e) => setFormData({ ...formData, organizationWebsite: e.target.value })}
              placeholder="https://example.com"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Founded Year */}
          <div className="space-y-2">
            <Label htmlFor="foundedYear" className="text-gray-300">
              Founded Year
            </Label>
            <Input
              id="foundedYear"
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.foundedYear}
              onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
              placeholder="2020"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-300">
              Location
            </Label>
            <Input
              id="location"
              value={formData.organizationLocation}
              onChange={(e) => setFormData({ ...formData, organizationLocation: e.target.value })}
              placeholder="City"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-gray-300">
              State/Province
            </Label>
            <Input
              id="state"
              value={formData.organizationState}
              onChange={(e) => setFormData({ ...formData, organizationState: e.target.value })}
              placeholder="State or Province"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="description" className="text-gray-300">
            Organization Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your organization, its mission, and activities..."
            className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
          />
        </div>

        {/* Leagues Operated */}
        <div className="space-y-2 mt-4">
          <Label className="text-gray-300">
            Leagues/Tournaments Operated
          </Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newLeague}
              onChange={(e) => setNewLeague(e.target.value)}
              placeholder="Enter league/tournament name"
              className="bg-gray-700 border-gray-600 text-white flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLeague())}
            />
            <Button type="button" onClick={addLeague} variant="outline" className="border-gray-600">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {leaguesOperated.map((league) => (
              <Badge key={league} variant="secondary" className="bg-gray-600 text-white">
                {league}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeLeague(league)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Games Supported */}
        <div className="space-y-2 mt-4">
          <Label className="text-gray-300">
            Games Supported
          </Label>
          <div className="flex flex-wrap gap-2">
            {GAME_OPTIONS.map((game) => (
              <Badge
                key={game}
                variant={gamesSupported.includes(game) ? "default" : "outline"}
                className={`cursor-pointer ${
                  gamesSupported.includes(game) 
                    ? "bg-cyan-600 text-white" 
                    : "border-gray-600 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => toggleGame(game)}
              >
                {game}
              </Badge>
            ))}
          </div>
        </div>

        {/* Verification Documents */}
        <div className="space-y-2 mt-4">
          <Label className="text-gray-300">
            Verification Documents (URLs)
          </Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newDocument}
              onChange={(e) => setNewDocument(e.target.value)}
              placeholder="https://example.com/document.pdf"
              className="bg-gray-700 border-gray-600 text-white flex-1"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDocument())}
            />
            <Button type="button" onClick={addDocument} variant="outline" className="border-gray-600">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {verificationDocuments.map((doc) => (
              <Badge key={doc} variant="secondary" className="bg-gray-600 text-white max-w-xs truncate">
                {doc}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => removeDocument(doc)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* References */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="references" className="text-gray-300">
            References
          </Label>
          <Textarea
            id="references"
            value={formData.references}
            onChange={(e) => setFormData({ ...formData, references: e.target.value })}
            placeholder="Contact information for references who can verify your organization..."
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* Request Message */}
        <div className="space-y-2 mt-4">
          <Label htmlFor="requestMessage" className="text-gray-300">
            Additional Message
          </Label>
          <Textarea
            id="requestMessage"
            value={formData.requestMessage}
            onChange={(e) => setFormData({ ...formData, requestMessage: e.target.value })}
            placeholder="Any additional information or special requests..."
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700"
          disabled={submitRequest.isPending}
        >
          {submitRequest.isPending ? "Submitting..." : "Submit Verification Request"}
        </Button>
      </div>
    </form>
  );
}