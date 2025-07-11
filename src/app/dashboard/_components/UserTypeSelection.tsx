"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserIcon, TrophyIcon, BuildingIcon } from "lucide-react";

interface UserTypeSelectionProps {
  onUserTypeSelected: (userType: 'player' | 'coach' | 'league') => void;
}

export default function UserTypeSelection({ onUserTypeSelected }: UserTypeSelectionProps) {
  const [selectedType, setSelectedType] = useState<'player' | 'coach' | 'league' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const handleTypeSelection = (type: 'player' | 'coach' | 'league') => {
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
      case 'player':
        return "Continue as Player";
      case 'coach':
        return "Continue as Coach";
      case 'league':
        return "Continue as League Administrator";
      default:
        return "Continue";
    }
  };

  const userTypeOptions = [
    {
      type: 'player' as const,
      title: 'Player',
      description: 'Join teams, participate in tryouts, and showcase your skills',
      icon: UserIcon,
      color: 'blue',
    },
    {
      type: 'coach' as const,
      title: 'Coach',
      description: 'Recruit players, manage teams, and organize tryouts',
      icon: TrophyIcon,
      color: 'cyan',
    },
    {
      type: 'league' as const,
      title: 'League Administrator',
      description: 'Manage league operations, teams, and player participation',
      icon: BuildingIcon,
      color: 'purple',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white mb-4">
            Welcome to EVAL Gaming
          </h1>
          <p className="text-gray-400 text-lg">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {userTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;
            const isDisabled = isSubmitting;

            return (
              <Card
                key={option.type}
                className={`
                  bg-[#1a1a2e] border-2 cursor-pointer transition-all duration-200 hover:scale-105
                  ${isSelected 
                    ? (option.color === 'blue' ? 'border-blue-400 bg-blue-400/10' :
                       option.color === 'cyan' ? 'border-cyan-400 bg-cyan-400/10' :
                       'border-purple-400 bg-purple-400/10')
                    : 'border-gray-800 hover:border-gray-600'
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleTypeSelection(option.type)}
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 p-4 rounded-full ${
                    option.color === 'blue' ? 'bg-blue-400/20' :
                    option.color === 'cyan' ? 'bg-cyan-400/20' :
                    'bg-purple-400/20'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      option.color === 'blue' ? 'text-blue-400' :
                      option.color === 'cyan' ? 'text-cyan-400' :
                      'text-purple-400'
                    }`} />
                  </div>
                  <CardTitle className="text-white text-xl">
                    {option.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-400 mb-4">
                    {option.description}
                  </p>
                  {isSelected && (
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
            className={`
              px-8 py-3 text-lg font-medium transition-all duration-200
              ${selectedType
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }
            `}
            disabled={!selectedType || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Setting up your account...
              </div>
            ) : (
              getSubmitButtonText()
            )}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            This choice cannot be changed later. Please choose carefully.
          </p>
        </div>
      </div>
    </div>
  );
} 