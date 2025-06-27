"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, GraduationCap, AlertTriangle } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface UserTypeSelectionProps {
  onUserTypeSelected: (userType: 'player' | 'coach') => void;
}

export default function UserTypeSelection({ onUserTypeSelected }: UserTypeSelectionProps) {
  const [selectedUserType, setSelectedUserType] = useState<'player' | 'coach' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const handleUserTypeSelect = (userType: 'player' | 'coach') => {
    setSelectedUserType(userType);
    setError(null); // Clear any previous errors when selecting a new type
  };

  const handleSubmit = async () => {
    if (!selectedUserType) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/update-user-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userType: selectedUserType }),
      });

      const data = await response.json() as { error?: string; success?: boolean; message?: string };

      if (response.ok) {
        // Refresh the user data to get the updated metadata
        await user?.reload();
        
        // Call the callback to handle the redirect
        onUserTypeSelected(selectedUserType);
      } else {
        // Handle specific error cases
        if (response.status === 403) {
          setError(data.error ?? 'User type cannot be changed');
        } else if (response.status === 400) {
          setError(data.error ?? 'Invalid user type selected');
        } else {
          setError(data.error ?? 'Failed to update user type. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error updating user type:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 items-center justify-center p-6 pb-[10vh]">
      <Card className="w-full max-w-2xl bg-gray-800 border-gray-700">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-orbitron font-bold text-white mb-4">
            Welcome to EVAL
          </CardTitle>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Choose Your Account Type</h2>
            <p className="text-gray-300 font-rajdhani">
              Empowering students and college coaches to connect through esports.
            </p>
            
            {/* Warning Banner */}
            <div className="flex items-center justify-center gap-2 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <p className="text-yellow-300 text-sm font-medium">
                This choice cannot be changed later. Please select carefully.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* User Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player Option */}
            <button
              onClick={() => handleUserTypeSelect('player')}
              className={`p-8 rounded-lg border-2 text-center transition-all ${
                selectedUserType === 'player'
                  ? 'border-cyan-400 bg-cyan-900/50 shadow-lg shadow-cyan-500/20'
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
                  selectedUserType === 'player' 
                    ? 'border-cyan-400 bg-cyan-500/20' 
                    : 'border-gray-500 bg-gray-700/50'
                }`}>
                  <User className={`w-8 h-8 ${
                    selectedUserType === 'player' ? 'text-cyan-400' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-white text-lg mb-3">PLAYER</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    I am a student looking to find esports scholarships and connect with college programs.
                  </p>
                </div>
              </div>
            </button>

            {/* Coach Option */}
            <button
              onClick={() => handleUserTypeSelect('coach')}
              className={`p-8 rounded-lg border-2 text-center transition-all ${
                selectedUserType === 'coach'
                  ? 'border-cyan-400 bg-cyan-900/50 shadow-lg shadow-cyan-500/20'
                  : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
                  selectedUserType === 'coach' 
                    ? 'border-cyan-400 bg-cyan-500/20' 
                    : 'border-gray-500 bg-gray-700/50'
                }`}>
                  <GraduationCap className={`w-8 h-8 ${
                    selectedUserType === 'coach' ? 'text-cyan-400' : 'text-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-white text-lg mb-3">COACH</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    I am a coach, director, or administrator looking to recruit talented esports players.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center justify-center gap-2 bg-red-900/20 border border-red-700 rounded-lg p-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Continue Button */}
          <div className="pt-4">
            {selectedUserType ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg py-4 font-orbitron font-medium shadow-lg text-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Setting up your account...
                  </div>
                ) : (
                  `CONTINUE AS ${selectedUserType === 'coach' ? 'COACH' : 'PLAYER'}`
                )}
              </Button>
            ) : (
              <Button
                disabled
                className="w-full bg-gray-700 text-gray-500 rounded-lg py-4 font-orbitron font-medium cursor-not-allowed text-lg"
              >
                SELECT AN ACCOUNT TYPE TO CONTINUE
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 