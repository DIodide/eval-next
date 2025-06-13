/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  MessageSquareIcon, 
  SearchIcon, 
  SendIcon,
  FilterIcon,
  CheckIcon,
  MoreVerticalIcon,
  StarIcon,
  LoaderIcon,
  SchoolIcon,
  MapPinIcon,
  TrophyIcon,
  PlusIcon
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// Types for player messages
interface Coach {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  school?: string | null;
  schoolId?: string | null;
  schoolName?: string | null;
  username?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderType: "COACH" | "PLAYER";
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  coach: Coach;
  lastMessage: {
    id: string;
    content: string;
    senderType: "COACH" | "PLAYER";
    timestamp: Date;
    isRead: boolean;
  } | null;
  unreadCount: number;
  isStarred: boolean;
  isArchived: boolean;
  updatedAt: Date;
}

export default function PlayerMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "starred" | "archived">("all");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [messageTemplate, setMessageTemplate] = useState("");
  const [coachSearchQuery, setCoachSearchQuery] = useState("");

  // tRPC queries and mutations for player messages
  const { data: conversationsData, isLoading: conversationsLoading } = api.messages.getPlayerConversations.useQuery({
    search: searchQuery,
    filter: filterStatus,
    limit: 50,
  });

  const { data: selectedConversation, isLoading: conversationLoading } = api.messages.getPlayerConversation.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  const { data: availableCoaches, isLoading: coachesLoading } = api.messages.getAvailableCoaches.useQuery({
    search: coachSearchQuery,
    limit: 50,
  });

  const sendMessageMutation = api.messages.sendPlayerMessage.useMutation({
    onSuccess: () => {
      setNewMessageContent("");
      toast.success("Message sent successfully!");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const sendNewMessageMutation = api.messages.sendPlayerMessage.useMutation({
    onSuccess: () => {
      setMessageTemplate("");
      setSelectedCoach(null);
      setNewConversationOpen(false);
      toast.success("Message sent successfully!");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const markAsReadMutation = api.messages.markPlayerMessagesAsRead.useMutation({
    onSuccess: () => {
      toast.success("Messages marked as read");
    },
  });

  const toggleStarMutation = api.messages.togglePlayerStar.useMutation({
    onSuccess: () => {
      toast.success("Conversation starred");
    },
  });

  // Use actual data from tRPC queries
  const conversations: Conversation[] = (conversationsData?.conversations ?? []) as Conversation[];
  const coaches: Coach[] = availableCoaches ?? [];

  const handleSendMessage = () => {
    if (!newMessageContent.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: newMessageContent,
    });
  };

  const handleStartNewConversation = () => {
    if (!selectedCoach || !messageTemplate.trim()) return;

    sendNewMessageMutation.mutate({
      coachId: selectedCoach.id,
      content: messageTemplate,
    });
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
    
    // Mark unread messages as read
    if (conversation.unreadCount > 0) {
      markAsReadMutation.mutate({
        conversationId: conversation.id,
      });
    }
  };

  const handleToggleStar = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStarMutation.mutate({ conversationId });
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, "MMM d");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">Messages</h1>
          <p className="text-gray-400 font-rajdhani">Communication with coaches and recruiters</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-cyan-400 text-cyan-400">
            {conversations.filter(c => c.unreadCount > 0).length} Unread
          </Badge>
          <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
            <DialogTrigger asChild>
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron">
                <PlusIcon className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-orbitron text-xl">Start New Conversation</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Select a coach to message and introduce yourself
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Coach Selection */}
                <div>
                  <h3 className="font-orbitron text-lg text-cyan-400 mb-4">Select Coach</h3>
                  
                  {/* Search Coaches */}
                  <div className="relative mb-4">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      value={coachSearchQuery}
                      onChange={(e) => setCoachSearchQuery(e.target.value)}
                      placeholder="Search coaches or schools..." 
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pl-10"
                    />
                  </div>

                  {coachesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoaderIcon className="w-6 h-6 animate-spin text-cyan-400" />
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-60 overflow-y-auto">
                      {coaches.map((coach) => (
                        <div
                          key={coach.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedCoach?.id === coach.id
                              ? "border-cyan-400 bg-cyan-900/20"
                              : "border-gray-700 hover:border-gray-600"
                          )}
                          onClick={() => setSelectedCoach(coach)}
                        >
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={coach.avatar ?? undefined} />
                              <AvatarFallback className="bg-gray-700 text-white">
                                {coach.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-orbitron font-bold text-white text-sm">{coach.name}</h4>
                              <div className="flex items-center space-x-2 text-xs text-gray-400">
                                {coach.schoolName && (
                                  <>
                                    <SchoolIcon className="w-3 h-3" />
                                    <span>{coach.schoolName}</span>
                                  </>
                                )}
                                {coach.username && (
                                  <>
                                    <span>•</span>
                                    <span>@{coach.username}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {selectedCoach?.id === coach.id && (
                            <CheckIcon className="w-5 h-5 text-cyan-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {selectedCoach && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400 mb-2">Selected coach:</p>
                      <Badge variant="outline" className="border-cyan-400 text-cyan-400">
                        {selectedCoach.name} - {selectedCoach.schoolName}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Message Template */}
                <div>
                  <h3 className="font-orbitron text-lg text-cyan-400 mb-4">Compose Message</h3>
                  <Textarea
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    placeholder="Introduce yourself and express your interest in their program..."
                    className="bg-gray-800 border-gray-700 text-white min-h-32"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Be professional and specific about your interest in their program
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setNewConversationOpen(false)}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartNewConversation}
                    disabled={!selectedCoach || !messageTemplate.trim() || sendNewMessageMutation.isPending}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    {sendNewMessageMutation.isPending ? (
                      <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <SendIcon className="w-4 h-4 mr-2" />
                    )}
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Messages Layout */}
      <div className="grid gap-6 lg:grid-cols-3 h-[700px]">
        {/* Conversations List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-orbitron">Conversations</CardTitle>
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                {conversations.length}
              </Badge>
            </div>
            
            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coaches or schools..." 
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={(value: "all" | "unread" | "starred" | "archived") => setFilterStatus(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <FilterIcon className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all" className="text-white hover:bg-gray-700">All Messages</SelectItem>
                  <SelectItem value="unread" className="text-white hover:bg-gray-700">Unread</SelectItem>
                  <SelectItem value="starred" className="text-white hover:bg-gray-700">Starred</SelectItem>
                  <SelectItem value="archived" className="text-white hover:bg-gray-700">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {conversationsLoading ? (
                <div className="text-center py-12 px-4">
                  <LoaderIcon className="w-8 h-8 text-cyan-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-400 text-sm">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageSquareIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">No messages yet</p>
                  <p className="text-gray-500 text-xs mt-2">Start a conversation with a coach to begin recruiting discussions</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "p-4 cursor-pointer transition-colors border-l-4",
                      selectedConversationId === conversation.id
                        ? "bg-cyan-900/20 border-l-cyan-400"
                        : "hover:bg-gray-800/50 border-l-transparent"
                    )}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={conversation.coach.avatar ?? undefined} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {conversation.coach.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-orbitron font-bold text-white text-sm truncate">
                              {conversation.coach.name}
                            </h4>
                            {conversation.isStarred && (
                              <StarIcon 
                                className="w-3 h-3 text-yellow-400 fill-current cursor-pointer" 
                                onClick={(e) => handleToggleStar(conversation.id, e)}
                              />
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-cyan-600 text-white text-xs px-1.5 py-0.5">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage && formatLastSeen(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                          {conversation.coach.school && (
                            <>
                              <SchoolIcon className="w-3 h-3" />
                              <span>{conversation.coach.school}</span>
                            </>
                          )}
                        </div>
                        
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-400 truncate">
                            {conversation.lastMessage.senderType === "PLAYER" && "You: "}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-900 border-gray-800 h-full flex flex-col">
            {selectedConversationId && selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedConversation.coach.avatar ?? undefined} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {selectedConversation.coach.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-white">
                          {selectedConversation.coach.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          {selectedConversation.coach.school && (
                            <>
                              <SchoolIcon className="w-4 h-4" />
                              <span>{selectedConversation.coach.school}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                        onClick={() => handleToggleStar(selectedConversation.id, {} as React.MouseEvent)}
                      >
                        <StarIcon className={cn("w-4 h-4", selectedConversation.isStarred && "fill-current text-yellow-400")} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      >
                        <MoreVerticalIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 p-4 overflow-y-auto">
                  {conversationLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <LoaderIcon className="w-8 h-8 animate-spin text-cyan-400" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(selectedConversation?.messages ?? []).map((message: Message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.senderType === "PLAYER" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              message.senderType === "PLAYER"
                                ? "bg-cyan-600 text-white"
                                : "bg-gray-800 text-white"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-xs opacity-70">
                                {format(message.timestamp, "HH:mm")}
                              </span>
                              {message.senderType === "PLAYER" && (
                                <CheckIcon className="w-3 h-3 opacity-70" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(selectedConversation?.messages ?? []).length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquareIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400 text-sm">No messages yet</p>
                          <p className="text-gray-500 text-xs mt-2">Start the conversation by sending a message!</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-gray-800 p-4">
                  <div className="flex space-x-3">
                    <Textarea
                      value={newMessageContent}
                      onChange={(e) => setNewMessageContent(e.target.value)}
                      placeholder="Type your response..."
                      className="bg-gray-800 border-gray-700 text-white resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessageContent.trim() || sendMessageMutation.isPending}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white self-end"
                    >
                      {sendMessageMutation.isPending ? (
                        <LoaderIcon className="w-4 h-4 animate-spin" />
                      ) : (
                        <SendIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              /* Empty Chat State */
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
                    <MessageSquareIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-orbitron font-bold text-white">Select a Conversation</h3>
                    <p className="text-gray-400 text-sm mt-2">
                      Choose a conversation from the list or start a new one
                    </p>
                  </div>
                  <Button 
                    onClick={() => setNewConversationOpen(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Message a Coach
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Recruiting Tips */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Recruiting Communication Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white flex items-center">
                <TrophyIcon className="w-4 h-4 mr-2 text-cyan-400" />
                Be Authentic
              </h4>
              <p className="text-sm text-gray-400">Show your genuine personality and passion for esports</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white flex items-center">
                <CheckIcon className="w-4 h-4 mr-2 text-cyan-400" />
                Respond Promptly
              </h4>
              <p className="text-sm text-gray-400">Quick responses show interest and professionalism</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white flex items-center">
                <MessageSquareIcon className="w-4 h-4 mr-2 text-cyan-400" />
                Ask Questions
              </h4>
              <p className="text-sm text-gray-400">Show interest in their program, team culture, and opportunities</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white flex items-center">
                <MapPinIcon className="w-4 h-4 mr-2 text-cyan-400" />
                Share Your Goals
              </h4>
              <p className="text-sm text-gray-400">Communicate your academic and esports aspirations clearly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 