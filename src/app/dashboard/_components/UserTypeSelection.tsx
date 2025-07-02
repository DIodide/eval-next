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
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useUser();

  const handleTypeSelection = async (type: 'player' | 'coach' | 'league') => {
    setSelectedType(type);
    setIsUpdating(true);

    try {
      // Update user metadata with selected type
      await user?.update({
        unsafeMetadata: {
          userType: type,
        },
      });

      // Call the callback to redirect
      onUserTypeSelected(type);
         } catch (error) {
       console.error("Failed to update user type:", error);
       setIsUpdating(false);
     }
   };

   const handleButtonClick = (e: React.MouseEvent, type: 'player' | 'coach' | 'league') => {
     e.stopPropagation();
     if (!isUpdating) {
       void handleTypeSelection(type);
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedType === option.type;
            const isDisabled = isUpdating;

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
                   ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                 `}
                                 onClick={() => !isDisabled && void handleTypeSelection(option.type)}
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
                  <p className="text-gray-400 mb-6">
                    {option.description}
                  </p>
                  <Button
                                         className={`
                       w-full transition-colors
                       ${isSelected 
                         ? (option.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                            option.color === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' :
                            'bg-purple-600 hover:bg-purple-700 text-white')
                         : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                       }
                     `}
                    disabled={isDisabled}
                                         onClick={(e) => {
                       e.stopPropagation();
                       if (!isDisabled) void handleTypeSelection(option.type);
                     }}
                  >
                    {isUpdating && selectedType === option.type ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Setting up...
                      </div>
                    ) : (
                      `Choose ${option.title}`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            You can change your account type later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
} 