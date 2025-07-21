"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, TrophyIcon, BuildingIcon } from "lucide-react";

interface UserTypeSelectionProps {
  onUserTypeSelected: (userType: "player" | "coach" | "league") => void;
}

export default function UserTypeSelection({
  onUserTypeSelected,
}: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<
    "player" | "coach" | "league" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const handleTypeSelection = (type: "player" | "coach" | "league") => {
    if (isSubmitting) return;
    setSelectedType(type);
  };

  const handleSubmit = async () => {
    if (!selectedType || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Update user metadata with selected type
      await user?.update({
        unsafeMetadata: {
          userType: selectedType,
        },
      });

      // Call the parent callback
      onUserTypeSelected(selectedType);
    } catch (error) {
      console.error("Failed to update user type:", error);
      setIsSubmitting(false);
    }
  };

  const getSubmitButtonText = () => {
    if (!selectedType) return "Select a user type to continue";

    switch (selectedType) {
      case "player":
        return "Continue as Player";
      case "coach":
        return "Continue as Coach";
      case "league":
        return "Continue as League Administrator";
      default:
        return "Continue";
    }
  };

  const userTypeOptions = [
    {
      type: "player" as const,
      title: "Player",
      description:
        "Join teams, participate in tryouts, and showcase your skills",
      icon: UserIcon,
      color: "blue",
    },
    {
      type: "coach" as const,
      title: "Coach",
      description: "Recruit players, manage teams, and organize tryouts",
      icon: TrophyIcon,
      color: "cyan",
    },
    {
      type: "league" as const,
      title: "League Administrator",
      description: "Manage league operations, teams, and player participation",
      icon: BuildingIcon,
      color: "purple",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-orbitron mb-4 text-4xl font-bold text-white">
            Welcome to EVAL Gaming
          </h1>
          <p className="text-lg text-gray-400">
            Choose your account type to get started
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {userTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;
            const isDisabled = isSubmitting;

            return (
              <Card
                key={option.type}
                className={`cursor-pointer border-2 bg-[#1a1a2e] transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? option.color === "blue"
                      ? "border-blue-400 bg-blue-400/10"
                      : option.color === "cyan"
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-purple-400 bg-purple-400/10"
                    : "border-gray-800 hover:border-gray-600"
                } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() => handleTypeSelection(option.type)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto mb-4 rounded-full p-4 ${
                      option.color === "blue"
                        ? "bg-blue-400/20"
                        : option.color === "cyan"
                          ? "bg-cyan-400/20"
                          : "bg-purple-400/20"
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 ${
                        option.color === "blue"
                          ? "text-blue-400"
                          : option.color === "cyan"
                            ? "text-cyan-400"
                            : "text-purple-400"
                      }`}
                    />
                  </div>
                  <CardTitle className="text-xl text-white">
                    {option.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="mb-4 text-gray-400">{option.description}</p>
                  {isSelected && (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <div className="h-2 w-2 rounded-full bg-green-400"></div>
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            className={`px-8 py-3 text-lg font-medium transition-all duration-200 ${
              selectedType
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:from-blue-700 hover:to-purple-700"
                : "cursor-not-allowed bg-gray-800 text-gray-500"
            } `}
            disabled={!selectedType || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                Setting up your account...
              </div>
            ) : (
              getSubmitButtonText()
            )}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This choice cannot be changed later. Please choose carefully.
          </p>
        </div>
      </div>
    </div>
  );
}
