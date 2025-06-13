"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  GamepadIcon,
  StarIcon,
  MessageSquareIcon,
  Loader2
} from "lucide-react";
import { api } from "@/trpc/react";
import type { Prisma } from "@prisma/client";

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
}

type ApplicationStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "WAITLISTED" | "CANCELLED";

export default function MyTryoutsPage() {
  const [selectedTryout, setSelectedTryout] = useState<Tryout | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerDialogOpen, setPlayerDialogOpen] = useState(false);

  // Fetch coach's tryouts
  const { data: tryoutsData, isLoading: tryoutsLoading } = api.tryouts.getCoachTryouts.useQuery({
    status: "all",
    limit: 50,
    offset: 0,
  });

  // Fetch applications for selected tryout
  const { data: applicationsData, isLoading: applicationsLoading } = api.tryouts.getTryoutApplications.useQuery(
    {
      tryout_id: selectedTryout?.id ?? "",
      status: "all",
    },
    {
      enabled: !!selectedTryout?.id,
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
        status: status as "CONFIRMED" | "DECLINED"
      });
    }
  };

  const getGameIcon = (game: string) => {
    const icons: Record<string, string> = {
      "VALORANT": "🎯",
      "Overwatch 2": "⚡",
      "Rocket League": "🚀",
      "League of Legends": "⚔️",
    };
    return icons[game] ?? "🎮";
  };

  const tryouts = tryoutsData?.tryouts ?? [];
  const applications = applicationsData?.applications ?? [];
  
  // Set first tryout as selected if none selected
  if (!selectedTryout && tryouts.length > 0) {
    setSelectedTryout(tryouts[0] as Tryout);
  }

  const pendingApplications = applications.filter(app => app.status === "PENDING");
  const acceptedApplications = applications.filter(app => app.status === "CONFIRMED");
  const rejectedApplications = applications.filter(app => app.status === "DECLINED");

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

  if (tryouts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-orbitron font-bold text-white">My Tryouts</h1>
            <p className="text-gray-400 font-rajdhani">Manage your recruitment events and player applications</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
            Create New Tryout
          </Button>
        </div>
        <div className="text-center py-12">
          <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-orbitron text-white mb-2">No Tryouts Yet</h3>
          <p className="text-gray-400 font-rajdhani mb-6">Create your first tryout to start recruiting players</p>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
            Create Your First Tryout
          </Button>
        </div>
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
        <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
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
                      <Badge 
                        variant="outline" 
                        className="text-xs border-green-400 text-green-400"
                      >
                        ACTIVE
                      </Badge>
                    </div>
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
                  <Badge 
                    variant="outline" 
                    className="border-green-400 text-green-400"
                  >
                    ACTIVE
                  </Badge>
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
    </div>
  );
} 