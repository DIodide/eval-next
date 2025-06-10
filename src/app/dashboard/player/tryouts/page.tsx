"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Tryout } from "@/app/tryouts/types";
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon } from "lucide-react";

// Mock tryouts data for the dashboard
const mockTryouts: Tryout[] = [
  {
    id: 1,
    game: "VALORANT",
    title: "UCLA Esports Valorant Tryouts",
    school: "UCLA",
    price: "Free",
    type: "Online",
    spots: "5 spots left",
    totalSpots: "20 total spots",
    time: "2:00 PM - 5:00 PM PST",
    date: "Jul 15, 2025",
    organizer: "Coach Martinez",
    description: "Competitive tryouts for our varsity Valorant team",
    requirements: {
      gpa: "3.0+",
      location: "Los Angeles, CA (Remote OK)",
      classYear: "Freshman - Senior",
      role: "All roles"
    }
  },
  {
    id: 2,
    game: "Overwatch 2",
    title: "USC Trojans OW2 Tryouts",
    school: "USC",
    price: "$15",
    type: "Hybrid",
    spots: "6 spots left",
    totalSpots: "15 total spots",
    time: "3:00 PM - 6:00 PM PST",
    date: "Aug 18, 2025",
    organizer: "Coach Williams",
    description: "Looking for tank and support players",
    requirements: {
      gpa: "3.0+",
      location: "Los Angeles, CA",
      classYear: "All years",
      role: "Tank, Support"
    }
  },
  {
    id: 3,
    game: "VALORANT",
    title: "UC Berkeley Valorant Combine",
    school: "UC Berkeley",
    price: "Free",
    type: "Online",
    spots: "8 spots left",
    totalSpots: "25 total spots",
    time: "6:00 PM - 8:00 PM PST",
    date: "Jun 25, 2025",
    organizer: "Coach Chen",
    description: "Showcase your skills to college scouts",
    requirements: {
      gpa: "2.8+",
      location: "Berkeley, CA (Remote OK)",
      classYear: "All years",
      role: "All roles"
    }
  },
  {
    id: 4,
    game: "Smash Ultimate",
    title: "MIT Smash Bros Championship",
    school: "MIT",
    price: "$30",
    type: "In-Person",
    spots: "16 spots left",
    totalSpots: "64 total spots",
    time: "11:00 AM - 7:00 PM EST",
    date: "May 15, 2025",
    organizer: "Coach Thompson",
    description: "Elite tournament with scholarship opportunities",
    requirements: {
      gpa: "3.5+",
      location: "Cambridge, MA",
      classYear: "All years",
      role: "All characters"
    }
  },
  {
    id: 5,
    game: "Rocket League",
    title: "Georgia Tech RL Tryouts",
    school: "Georgia Tech",
    price: "$20",
    type: "In-Person",
    spots: "9 spots left",
    totalSpots: "24 total spots",
    time: "1:00 PM - 4:00 PM EST",
    date: "Apr 28, 2025",
    organizer: "Coach Wilson",
    description: "Competitive 3v3 team tryouts",
    requirements: {
      gpa: "3.0+",
      location: "Atlanta, GA",
      classYear: "All years",
      role: "All positions"
    }
  },
  {
    id: 6,
    game: "VALORANT",
    title: "Stanford Cardinal Gaming",
    school: "Stanford",
    price: "$25",
    type: "In-Person",
    spots: "12 spots left",
    totalSpots: "30 total spots",
    time: "10:00 AM - 1:00 PM PST",
    date: "Sep 20, 2025",
    organizer: "Coach Johnson",
    description: "Open tryouts for all skill levels",
    requirements: {
      gpa: "3.2+",
      location: "Stanford, CA",
      classYear: "Sophomore - Senior",
      role: "IGL, Support"
    }
  }
];

const getGameColor = (game: string) => {
  switch (game) {
    case "VALORANT":
      return "bg-red-600";
    case "Overwatch 2":
      return "bg-blue-700";
    case "Smash Ultimate":
      return "bg-yellow-600";
    case "Rocket League":
      return "bg-blue-600";
    default:
      return "bg-gray-600";
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Online":
      return "bg-green-600";
    case "In-Person":
      return "bg-purple-600";
    case "Hybrid":
      return "bg-indigo-600";
    default:
      return "bg-gray-600";
  }
};

const isTryoutPast = (dateStr: string, timeStr: string): boolean => {
  const currentDate = new Date();
  
  // Parse the date string (e.g., "Dec 15, 2024")
  const tryoutDate = new Date(dateStr);
  
  // Extract end time from time range (e.g., "2:00 PM - 5:00 PM PST" -> "5:00 PM PST")
  const endTimeRegex = /- (.+)$/;
  const endTimeMatch = endTimeRegex.exec(timeStr);
  if (!endTimeMatch?.[1]) return false;
  
  const endTimeStr = endTimeMatch[1];
  
  // Parse the end time and combine with date
  const timeWithoutTimezone = endTimeStr.replace(/\s+(PST|EST|CST|MST)/, '');
  const timeParts = timeWithoutTimezone.split(' ');
  if (timeParts.length !== 2) return false;
  
  const timeOnly = timeParts[0];
  const period = timeParts[1];
  
  if (!timeOnly || !period) return false;
  
  const timeSplit = timeOnly.split(':');
  if (timeSplit.length !== 2) return false;
  
  const hoursStr = timeSplit[0];
  const minutesStr = timeSplit[1];
  
  if (!hoursStr || !minutesStr) return false;
  
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  if (isNaN(hours) || isNaN(minutes)) return false;
  
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  
  tryoutDate.setHours(hour24, minutes, 0, 0);
  
  return currentDate > tryoutDate;
};

export default function TryoutsPage() {
  const [activeFilter, setActiveFilter] = useState<"upcoming" | "past">("upcoming");

  // Load filter preference from localStorage on mount
  useEffect(() => {
    try {
      const savedFilter = localStorage.getItem('dashboardTryoutsFilter');
      if (savedFilter === 'upcoming' || savedFilter === 'past') {
        setActiveFilter(savedFilter);
      }
    } catch (error) {
      // localStorage not available or disabled, use default
      console.warn('Could not access localStorage:', error);
    }
  }, []);

  // Save filter preference to localStorage when it changes
  const handleFilterChange = (filter: "upcoming" | "past") => {
    setActiveFilter(filter);
    try {
      localStorage.setItem('dashboardTryoutsFilter', filter);
    } catch (error) {
      // localStorage not available or disabled, continue without persistence
      console.warn('Could not save to localStorage:', error);
    }
  };

  const filteredTryouts = mockTryouts.filter(tryout => {
    const isPast = isTryoutPast(tryout.date, tryout.time);
    return activeFilter === "past" ? isPast : !isPast;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            My Tryouts
          </h1>
          <p className="text-gray-400 mt-2">
            Track your tryout applications and status updates
          </p>
        </div>
        <Link href="/tryouts/college">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Browse Tryouts
          </Button>
        </Link>
      </div>

      {/* Tryouts Filter/Tabs */}
      <div className="flex gap-4">
        <Button 
          variant={activeFilter === "upcoming" ? "default" : "ghost"}
          className={activeFilter === "upcoming" ? "bg-blue-600" : "text-gray-300 hover:bg-gray-800"}
          onClick={() => handleFilterChange("upcoming")}
        >
          Upcoming
        </Button>
        <Button 
          variant={activeFilter === "past" ? "default" : "ghost"}
          className={activeFilter === "past" ? "bg-blue-600" : "text-gray-300 hover:bg-gray-800"}
          onClick={() => handleFilterChange("past")}
        >
          Past
        </Button>
      </div>

      {/* Tryouts List */}
      <div className="space-y-4">
        {filteredTryouts.length === 0 ? (
          /* Empty State */
          <Card className="bg-[#1a1a2e] border-gray-800 p-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                No {activeFilter} Tryouts
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {activeFilter === "upcoming" 
                  ? "You don't have any upcoming tryouts. Start by browsing available opportunities and submitting your applications."
                  : "You don't have any past tryouts to review."
                }
              </p>
              <Link href="/tryouts/college">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Browse Available Tryouts
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          /* Tryouts Cards */
          filteredTryouts.map((tryout) => (
            <Card key={tryout.id} className="bg-[#1a1a2e] border-gray-800 p-6 hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`${getGameColor(tryout.game)} text-white`}
                    >
                      {tryout.game}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`${getTypeColor(tryout.type)} text-white`}
                    >
                      {tryout.type}
                    </Badge>
                    {tryout.price === "Free" ? (
                      <Badge variant="secondary" className="bg-green-600 text-white">
                        Free
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-600 text-white">
                        {tryout.price}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {tryout.title}
                  </h3>
                  <p className="text-gray-400 mb-3">
                    {tryout.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{tryout.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <ClockIcon className="h-4 w-4" />
                      <span>{tryout.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{tryout.requirements.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <UsersIcon className="h-4 w-4" />
                      <span>{tryout.spots}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {activeFilter === "upcoming" ? (
                    <Badge variant="secondary" className="bg-yellow-600 text-white">
                      Applied
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-600 text-white">
                      Completed
                    </Badge>
                  )}
         
                  <Link target="_blank" href={`/tryouts/college/${tryout.id}`}>
                    <Button 
                      variant="outline" 
                      className="border-gray-600 text-black hover:bg-gray-200"
                      size="sm"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="border-t border-gray-800 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">
                    Organizer: <span className="text-white">{tryout.organizer}</span>
                  </div>
                  <div className="text-gray-400">
                    Requirements: <span className="text-white">{tryout.requirements.gpa} GPA • {tryout.requirements.classYear}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 