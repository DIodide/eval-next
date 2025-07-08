 
 
 
 
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
  PlusIcon,
  MessageCircleIcon,
  MailIcon,
  UsersIcon
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

  const unreadCount = conversations.filter(c => c.unreadCount > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Enhanced Page Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl" />
          <Card className="relative bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-blue-500/20 backdrop-blur-sm shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                      <MessageCircleIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        Messages
                      </h1>
                      <p className="text-gray-400 text-lg font-rajdhani">
                        Communication with coaches and recruiters
                      </p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-300 font-rajdhani font-semibold">
                        {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="border-blue-400/30 text-blue-300 px-3 py-1 font-rajdhani">
                    <UsersIcon className="h-3 w-3 mr-1" />
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Messages Layout */}
        <div className="grid gap-8 lg:grid-cols-3 h-[700px]">
          {/* Enhanced Conversations List */}
          <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-orbitron text-xl flex items-center gap-2">
                  <MailIcon className="h-5 w-5 text-emerald-400" />
                  Conversations
                </CardTitle>
                <Badge variant="outline" className="border-gray-600/50 text-gray-300 font-rajdhani">
                  {conversations.length}
                </Badge>
              </div>
              
              {/* Enhanced Search and Filter */}
              <div className="space-y-3">
                <div className="relative group">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                  <Input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search coaches or schools..." 
                    className="pl-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 h-12 font-rajdhani"
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Select value={filterStatus} onValueChange={(value: "all" | "unread" | "starred" | "archived") => setFilterStatus(value)}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 flex-1 font-rajdhani">
                      <FilterIcon className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 backdrop-blur-sm">
                      <SelectItem value="all" className="text-white hover:bg-gray-700 font-rajdhani">All Messages</SelectItem>
                      <SelectItem value="unread" className="text-white hover:bg-gray-700 font-rajdhani">Unread</SelectItem>
                      <SelectItem value="starred" className="text-white hover:bg-gray-700 font-rajdhani">Starred</SelectItem>
                      <SelectItem value="archived" className="text-white hover:bg-gray-700 font-rajdhani">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Dialog open={newConversationOpen} onOpenChange={setNewConversationOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-orbitron font-semibold shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        New Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-700/50 text-white max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="font-orbitron text-2xl text-emerald-300 flex items-center gap-2">
                          <MessageSquareIcon className="h-6 w-6" />
                          Start New Conversation
                        </DialogTitle>
                        <DialogDescription className="text-gray-400 font-rajdhani text-lg">
                          Select a coach to message and introduce yourself professionally
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-8">
                        {/* Enhanced Coach Selection */}
                        <div>
                          <h3 className="font-orbitron text-lg text-emerald-400 mb-4 flex items-center gap-2">
                            <UsersIcon className="h-5 w-5" />
                            Select Coach
                          </h3>
                          
                          {/* Enhanced Search Coaches */}
                          <div className="relative mb-4 group">
                            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                            <Input 
                              value={coachSearchQuery}
                              onChange={(e) => setCoachSearchQuery(e.target.value)}
                              placeholder="Search coaches or schools..." 
                              className="pl-12 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 h-12 font-rajdhani"
                            />
                          </div>

                          {coachesLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="relative">
                                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full animate-pulse" />
                                <LoaderIcon className="absolute inset-0 w-12 h-12 text-emerald-400 animate-spin" />
                              </div>
                            </div>
                          ) : (
                            <div className="grid gap-3 max-h-60 overflow-y-auto pr-2">
                              {coaches.map((coach) => (
                                <div
                                  key={coach.id}
                                  className={cn(
                                    "group flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                                    selectedCoach?.id === coach.id
                                      ? "border-emerald-400/50 bg-gradient-to-r from-emerald-900/30 to-green-900/20 shadow-lg"
                                      : "border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30"
                                  )}
                                  onClick={() => setSelectedCoach(coach)}
                                >
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="w-12 h-12 border-2 border-gray-700 group-hover:border-emerald-500/30 transition-colors">
                                      <AvatarImage src={coach.avatar ?? undefined} />
                                      <AvatarFallback className="bg-gray-700 text-white font-orbitron">
                                        {coach.name.split(' ').map(n => n[0]).join('')}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="font-orbitron font-bold text-white">{coach.name}</h4>
                                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                                        {coach.schoolName && (
                                          <div className="flex items-center gap-1">
                                            <SchoolIcon className="w-4 h-4" />
                                            <span className="font-rajdhani">{coach.schoolName}</span>
                                          </div>
                                        )}
                                        {coach.username && (
                                          <div className="flex items-center gap-1">
                                            <span>•</span>
                                            <span className="font-rajdhani">@{coach.username}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {selectedCoach?.id === coach.id && (
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                      <CheckIcon className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {selectedCoach && (
                            <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-lg">
                              <p className="text-sm text-gray-400 mb-2 font-rajdhani">Selected coach:</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="border-emerald-400/50 text-emerald-300 font-rajdhani">
                                  {selectedCoach.name}
                                </Badge>
                                <span className="text-gray-400">-</span>
                                <Badge variant="outline" className="border-blue-400/50 text-blue-300 font-rajdhani">
                                  {selectedCoach.schoolName}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Message Template */}
                        <div>
                          <h3 className="font-orbitron text-lg text-emerald-400 mb-4 flex items-center gap-2">
                            <MessageSquareIcon className="h-5 w-5" />
                            Compose Message
                          </h3>
                          <Textarea
                            value={messageTemplate}
                            onChange={(e) => setMessageTemplate(e.target.value)}
                            placeholder="Introduce yourself and express your interest in their program..."
                            className="bg-gray-800/50 border-gray-600 text-white min-h-32 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-rajdhani"
                            rows={6}
                          />
                          <p className="text-xs text-gray-500 mt-2 font-rajdhani">
                            Be professional and specific about your interest in their program
                          </p>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700/50">
                          <Button
                            variant="outline"
                            onClick={() => setNewConversationOpen(false)}
                            className="bg-gray-600/20 border-gray-500/30 text-gray-200 hover:bg-gray-600/30 font-rajdhani"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleStartNewConversation}
                            disabled={!selectedCoach || !messageTemplate.trim() || sendNewMessageMutation.isPending}
                            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-rajdhani font-semibold"
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
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {conversationsLoading ? (
                  <div className="text-center py-16 px-4">
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full blur-xl" />
                      <LoaderIcon className="relative w-16 h-16 text-emerald-400 mx-auto animate-spin" />
                    </div>
                    <h3 className="text-lg font-rajdhani font-semibold text-white">Loading Conversations</h3>
                    <p className="text-gray-400 text-sm font-rajdhani">Fetching your messages...</p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="relative mx-auto w-16 h-16 mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full blur-xl" />
                      <div className="relative w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-600/50">
                        <MessageSquareIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-lg font-rajdhani font-bold text-white mb-2">No messages yet</h3>
                    <p className="text-gray-400 text-sm font-rajdhani mb-4">Start a conversation with a coach to begin recruiting discussions</p>
                    <Button 
                      onClick={() => setNewConversationOpen(true)}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-orbitron"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Start Messaging
                    </Button>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group p-4 cursor-pointer transition-all duration-300 border-l-4 hover:bg-gray-800/30",
                        selectedConversationId === conversation.id
                          ? "bg-emerald-900/20 border-l-emerald-400 shadow-lg"
                          : "hover:bg-gray-800/50 border-l-transparent"
                      )}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12 border-2 border-gray-700 group-hover:border-emerald-500/30 transition-colors">
                            <AvatarImage src={conversation.coach.avatar ?? undefined} />
                            <AvatarFallback className="bg-gray-700 text-white font-orbitron">
                              {conversation.coach.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">{conversation.unreadCount}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-orbitron font-bold text-white truncate group-hover:text-emerald-200 transition-colors">
                                {conversation.coach.name}
                              </h4>
                              {conversation.isStarred && (
                                <StarIcon 
                                  className="w-4 h-4 text-yellow-400 fill-current cursor-pointer hover:scale-110 transition-transform" 
                                  onClick={(e) => handleToggleStar(conversation.id, e)}
                                />
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-rajdhani">
                              {conversation.lastMessage && formatLastSeen(conversation.lastMessage.timestamp)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                            {conversation.coach.school && (
                              <div className="flex items-center gap-1">
                                <SchoolIcon className="w-3 h-3" />
                                <span className="font-rajdhani">{conversation.coach.school}</span>
                              </div>
                            )}
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className="text-sm text-gray-400 truncate font-rajdhani">
                              {conversation.lastMessage.senderType === "PLAYER" && (
                                <span className="text-emerald-400">You: </span>
                              )}
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

          {/* Enhanced Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm shadow-xl h-full flex flex-col">
              {selectedConversationId && selectedConversation ? (
                <>
                  {/* Enhanced Chat Header */}
                  <CardHeader className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="w-14 h-14 border-2 border-emerald-500/30">
                            <AvatarImage src={selectedConversation.coach.avatar ?? undefined} />
                            <AvatarFallback className="bg-gray-700 text-white font-orbitron text-lg">
                              {selectedConversation.coach.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800" />
                        </div>
                        <div>
                          <h3 className="font-orbitron font-bold text-white text-lg">
                            {selectedConversation.coach.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            {selectedConversation.coach.school && (
                              <div className="flex items-center gap-1">
                                <SchoolIcon className="w-4 h-4" />
                                <span className="font-rajdhani">{selectedConversation.coach.school}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-gray-700/30 border-gray-600/50 text-gray-300 hover:text-yellow-400 hover:bg-gray-700/50 hover:border-yellow-400/30 transition-colors"
                          onClick={() => handleToggleStar(selectedConversation.id, {} as React.MouseEvent)}
                        >
                          <StarIcon className={cn("w-4 h-4", selectedConversation.isStarred && "fill-current text-yellow-400")} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-gray-700/30 border-gray-600/50 text-gray-300 hover:text-white hover:bg-gray-700/50"
                        >
                          <MoreVerticalIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Enhanced Messages */}
                  <CardContent className="flex-1 p-6 overflow-hidden">
                    <div className="h-full overflow-y-auto pr-2">
                      {conversationLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full animate-pulse" />
                            <LoaderIcon className="absolute inset-0 w-12 h-12 text-emerald-400 animate-spin" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {(selectedConversation?.messages ?? []).map((message: Message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "flex group",
                              message.senderType === "PLAYER" ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[70%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 group-hover:scale-[1.02]",
                                message.senderType === "PLAYER"
                                  ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                                  : "bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-gray-600/30"
                              )}
                            >
                              <p className="text-sm font-rajdhani leading-relaxed">{message.content}</p>
                              <div className="flex items-center justify-end space-x-1 mt-2">
                                <span className="text-xs opacity-70 font-rajdhani">
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
                          <div className="text-center py-16">
                            <div className="relative mx-auto w-16 h-16 mb-6">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full blur-xl" />
                              <div className="relative w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-600/50">
                                <MessageSquareIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                            <h3 className="text-lg font-rajdhani font-bold text-white mb-2">No messages yet</h3>
                            <p className="text-gray-400 text-sm font-rajdhani">Start the conversation by sending a message!</p>
                          </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Enhanced Message Input */}
                  <div className="border-t border-gray-700/50 p-6 bg-gradient-to-r from-gray-800/30 to-gray-900/30">
                    <div className="flex space-x-4">
                      <Textarea
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        placeholder="Type your response..."
                        className="bg-gray-800/50 border-gray-600 text-white resize-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-rajdhani"
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
                        className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white self-end shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {sendMessageMutation.isPending ? (
                          <LoaderIcon className="w-5 h-5 animate-spin" />
                        ) : (
                          <SendIcon className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 font-rajdhani">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </>
              ) : (
                /* Enhanced Empty Chat State */
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="relative mx-auto w-24 h-24">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-full blur-xl" />
                      <div className="relative w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-600/50">
                        <MessageSquareIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-orbitron font-bold text-white">Select a Conversation</h3>
                      <p className="text-gray-400 font-rajdhani text-lg max-w-md mx-auto">
                        Choose a conversation from the list or start a new one with a coach
                      </p>
                    </div>
                    <Button 
                      onClick={() => setNewConversationOpen(true)}
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-orbitron shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      Message a Coach
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 