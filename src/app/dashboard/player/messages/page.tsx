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
  PlusIcon,
  MessageCircleIcon,
  MailIcon,
  UsersIcon,
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
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "unread" | "starred" | "archived"
  >("all");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [messageTemplate, setMessageTemplate] = useState("");
  const [coachSearchQuery, setCoachSearchQuery] = useState("");

  // tRPC queries and mutations for player messages
  const { data: conversationsData, isLoading: conversationsLoading } =
    api.messages.getPlayerConversations.useQuery({
      search: searchQuery,
      filter: filterStatus,
      limit: 50,
    });

  const { data: selectedConversation, isLoading: conversationLoading } =
    api.messages.getPlayerConversation.useQuery(
      { conversationId: selectedConversationId! },
      { enabled: !!selectedConversationId },
    );

  const { data: availableCoaches, isLoading: coachesLoading } =
    api.messages.getAvailableCoaches.useQuery({
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
  const conversations: Conversation[] = (conversationsData?.conversations ??
    []) as Conversation[];
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
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, "MMM d");
  };

  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <div className="container mx-auto space-y-8 p-6">
        {/* Enhanced Page Header */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-xl" />
          <Card className="relative border-blue-500/20 bg-gradient-to-br from-gray-800/90 to-gray-900/90 shadow-2xl backdrop-blur-sm">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-500/20 p-3">
                      <MessageCircleIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <h1 className="font-orbitron bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
                        Messages
                      </h1>
                      <p className="font-rajdhani text-lg text-gray-400">
                        Communication with coaches and recruiters
                      </p>
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                      <span className="font-rajdhani font-semibold text-blue-300">
                        {unreadCount} unread message
                        {unreadCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="font-rajdhani border-blue-400/30 px-3 py-1 text-blue-300"
                  >
                    <UsersIcon className="mr-1 h-3 w-3" />
                    {conversations.length} conversation
                    {conversations.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Messages Layout */}
        <div className="grid h-[700px] gap-8 lg:grid-cols-3">
          {/* Enhanced Conversations List */}
          <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
            <CardHeader className="space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-orbitron flex items-center gap-2 text-xl text-white">
                  <MailIcon className="h-5 w-5 text-emerald-400" />
                  Conversations
                </CardTitle>
                <Badge
                  variant="outline"
                  className="font-rajdhani border-gray-600/50 text-gray-300"
                >
                  {conversations.length}
                </Badge>
              </div>

              {/* Enhanced Search and Filter */}
              <div className="space-y-3">
                <div className="group relative">
                  <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors group-focus-within:text-emerald-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search coaches or schools..."
                    className="font-rajdhani h-12 border-gray-600 bg-gray-800/50 pl-12 text-white placeholder-gray-400 transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="flex space-x-3">
                  <Select
                    value={filterStatus}
                    onValueChange={(
                      value: "all" | "unread" | "starred" | "archived",
                    ) => setFilterStatus(value)}
                  >
                    <SelectTrigger className="font-rajdhani flex-1 border-gray-600 bg-gray-800/50 text-white transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20">
                      <FilterIcon className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-700 bg-gray-800 backdrop-blur-sm">
                      <SelectItem
                        value="all"
                        className="font-rajdhani text-white hover:bg-gray-700"
                      >
                        All Messages
                      </SelectItem>
                      <SelectItem
                        value="unread"
                        className="font-rajdhani text-white hover:bg-gray-700"
                      >
                        Unread
                      </SelectItem>
                      <SelectItem
                        value="starred"
                        className="font-rajdhani text-white hover:bg-gray-700"
                      >
                        Starred
                      </SelectItem>
                      <SelectItem
                        value="archived"
                        className="font-rajdhani text-white hover:bg-gray-700"
                      >
                        Archived
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Dialog
                    open={newConversationOpen}
                    onOpenChange={setNewConversationOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="font-orbitron bg-gradient-to-r from-emerald-500 to-green-600 font-semibold whitespace-nowrap text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl"
                      >
                        <PlusIcon className="mr-1 h-4 w-4" />
                        New Message
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto border-gray-700/50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 text-white backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="font-orbitron flex items-center gap-2 text-2xl text-emerald-300">
                          <MessageSquareIcon className="h-6 w-6" />
                          Start New Conversation
                        </DialogTitle>
                        <DialogDescription className="font-rajdhani text-lg text-gray-400">
                          Select a coach to message and introduce yourself
                          professionally
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-8">
                        {/* Enhanced Coach Selection */}
                        <div>
                          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg text-emerald-400">
                            <UsersIcon className="h-5 w-5" />
                            Select Coach
                          </h3>

                          {/* Enhanced Search Coaches */}
                          <div className="group relative mb-4">
                            <SearchIcon className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400 transition-colors group-focus-within:text-emerald-400" />
                            <Input
                              value={coachSearchQuery}
                              onChange={(e) =>
                                setCoachSearchQuery(e.target.value)
                              }
                              placeholder="Search coaches or schools..."
                              className="font-rajdhani h-12 border-gray-600 bg-gray-800/50 pl-12 text-white placeholder-gray-400 transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          {coachesLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <div className="relative">
                                <div className="h-12 w-12 animate-pulse rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20" />
                                <LoaderIcon className="absolute inset-0 h-12 w-12 animate-spin text-emerald-400" />
                              </div>
                            </div>
                          ) : (
                            <div className="grid max-h-60 gap-3 overflow-y-auto pr-2">
                              {coaches.map((coach) => (
                                <div
                                  key={coach.id}
                                  className={cn(
                                    "group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-300 hover:scale-[1.02]",
                                    selectedCoach?.id === coach.id
                                      ? "border-emerald-400/50 bg-gradient-to-r from-emerald-900/30 to-green-900/20 shadow-lg"
                                      : "border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30",
                                  )}
                                  onClick={() => setSelectedCoach(coach)}
                                >
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12 border-2 border-gray-700 transition-colors group-hover:border-emerald-500/30">
                                      <AvatarImage
                                        src={coach.avatar ?? undefined}
                                      />
                                      <AvatarFallback className="font-orbitron bg-gray-700 text-white">
                                        {coach.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="font-orbitron font-bold text-white">
                                        {coach.name}
                                      </h4>
                                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                                        {coach.schoolName && (
                                          <div className="flex items-center gap-1">
                                            <SchoolIcon className="h-4 w-4" />
                                            <span className="font-rajdhani">
                                              {coach.schoolName}
                                            </span>
                                          </div>
                                        )}
                                        {coach.username && (
                                          <div className="flex items-center gap-1">
                                            <span>•</span>
                                            <span className="font-rajdhani">
                                              @{coach.username}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {selectedCoach?.id === coach.id && (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                                      <CheckIcon className="h-4 w-4 text-white" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {selectedCoach && (
                            <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-900/20 p-4">
                              <p className="font-rajdhani mb-2 text-sm text-gray-400">
                                Selected coach:
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="font-rajdhani border-emerald-400/50 text-emerald-300"
                                >
                                  {selectedCoach.name}
                                </Badge>
                                <span className="text-gray-400">-</span>
                                <Badge
                                  variant="outline"
                                  className="font-rajdhani border-blue-400/50 text-blue-300"
                                >
                                  {selectedCoach.schoolName}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Message Template */}
                        <div>
                          <h3 className="font-orbitron mb-4 flex items-center gap-2 text-lg text-emerald-400">
                            <MessageSquareIcon className="h-5 w-5" />
                            Compose Message
                          </h3>
                          <Textarea
                            value={messageTemplate}
                            onChange={(e) => setMessageTemplate(e.target.value)}
                            placeholder="Introduce yourself and express your interest in their program..."
                            className="font-rajdhani min-h-32 border-gray-600 bg-gray-800/50 text-white transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            rows={6}
                          />
                          <p className="font-rajdhani mt-2 text-xs text-gray-500">
                            Be professional and specific about your interest in
                            their program
                          </p>
                        </div>

                        {/* Enhanced Action Buttons */}
                        <div className="flex justify-end space-x-3 border-t border-gray-700/50 pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setNewConversationOpen(false)}
                            className="font-rajdhani border-gray-500/30 bg-gray-600/20 text-gray-200 hover:bg-gray-600/30"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleStartNewConversation}
                            disabled={
                              !selectedCoach ||
                              !messageTemplate.trim() ||
                              sendNewMessageMutation.isPending
                            }
                            className="font-rajdhani bg-gradient-to-r from-emerald-600 to-green-700 font-semibold text-white hover:from-emerald-700 hover:to-green-800"
                          >
                            {sendNewMessageMutation.isPending ? (
                              <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <SendIcon className="mr-2 h-4 w-4" />
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
              <div className="max-h-[500px] space-y-1 overflow-y-auto">
                {conversationsLoading ? (
                  <div className="px-4 py-16 text-center">
                    <div className="relative mx-auto mb-4 h-16 w-16">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-xl" />
                      <LoaderIcon className="relative mx-auto h-16 w-16 animate-spin text-emerald-400" />
                    </div>
                    <h3 className="font-rajdhani text-lg font-semibold text-white">
                      Loading Conversations
                    </h3>
                    <p className="font-rajdhani text-sm text-gray-400">
                      Fetching your messages...
                    </p>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-4 py-16 text-center">
                    <div className="relative mx-auto mb-6 h-16 w-16">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-xl" />
                      <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/50">
                        <MessageSquareIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="font-rajdhani mb-2 text-lg font-bold text-white">
                      No messages yet
                    </h3>
                    <p className="font-rajdhani mb-4 text-sm text-gray-400">
                      Start a conversation with a coach to begin recruiting
                      discussions
                    </p>
                    <Button
                      onClick={() => setNewConversationOpen(true)}
                      className="font-orbitron bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700"
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Start Messaging
                    </Button>
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group cursor-pointer border-l-4 p-4 transition-all duration-300 hover:bg-gray-800/30",
                        selectedConversationId === conversation.id
                          ? "border-l-emerald-400 bg-emerald-900/20 shadow-lg"
                          : "border-l-transparent hover:bg-gray-800/50",
                      )}
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border-2 border-gray-700 transition-colors group-hover:border-emerald-500/30">
                            <AvatarImage
                              src={conversation.coach.avatar ?? undefined}
                            />
                            <AvatarFallback className="font-orbitron bg-gray-700 text-white">
                              {conversation.coach.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                              <span className="text-xs font-bold text-white">
                                {conversation.unreadCount}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-orbitron truncate font-bold text-white transition-colors group-hover:text-emerald-200">
                                {conversation.coach.name}
                              </h4>
                              {conversation.isStarred && (
                                <StarIcon
                                  className="h-4 w-4 cursor-pointer fill-current text-yellow-400 transition-transform hover:scale-110"
                                  onClick={(e) =>
                                    handleToggleStar(conversation.id, e)
                                  }
                                />
                              )}
                            </div>
                            <span className="font-rajdhani text-xs text-gray-500">
                              {conversation.lastMessage &&
                                formatLastSeen(
                                  conversation.lastMessage.timestamp,
                                )}
                            </span>
                          </div>

                          <div className="mb-2 flex items-center space-x-2 text-xs text-gray-400">
                            {conversation.coach.school && (
                              <div className="flex items-center gap-1">
                                <SchoolIcon className="h-3 w-3" />
                                <span className="font-rajdhani">
                                  {conversation.coach.school}
                                </span>
                              </div>
                            )}
                          </div>

                          {conversation.lastMessage && (
                            <p className="font-rajdhani truncate text-sm text-gray-400">
                              {conversation.lastMessage.senderType ===
                                "PLAYER" && (
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
            <Card className="flex h-full flex-col border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
              {selectedConversationId && selectedConversation ? (
                <>
                  {/* Enhanced Chat Header */}
                  <CardHeader className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 border-2 border-emerald-500/30">
                            <AvatarImage
                              src={
                                selectedConversation.coach.avatar ?? undefined
                              }
                            />
                            <AvatarFallback className="font-orbitron bg-gray-700 text-lg text-white">
                              {selectedConversation.coach.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-gray-800 bg-green-500" />
                        </div>
                        <div>
                          <h3 className="font-orbitron text-lg font-bold text-white">
                            {selectedConversation.coach.name}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            {selectedConversation.coach.school && (
                              <div className="flex items-center gap-1">
                                <SchoolIcon className="h-4 w-4" />
                                <span className="font-rajdhani">
                                  {selectedConversation.coach.school}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600/50 bg-gray-700/30 text-gray-300 transition-colors hover:border-yellow-400/30 hover:bg-gray-700/50 hover:text-yellow-400"
                          onClick={() =>
                            handleToggleStar(
                              selectedConversation.id,
                              {} as React.MouseEvent,
                            )
                          }
                        >
                          <StarIcon
                            className={cn(
                              "h-4 w-4",
                              selectedConversation.isStarred &&
                                "fill-current text-yellow-400",
                            )}
                          />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600/50 bg-gray-700/30 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Enhanced Messages */}
                  <CardContent className="flex-1 overflow-hidden p-6">
                    <div className="h-full overflow-y-auto pr-2">
                      {conversationLoading ? (
                        <div className="flex h-full items-center justify-center">
                          <div className="relative">
                            <div className="h-12 w-12 animate-pulse rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20" />
                            <LoaderIcon className="absolute inset-0 h-12 w-12 animate-spin text-emerald-400" />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {(selectedConversation?.messages ?? []).map(
                            (message: Message) => (
                              <div
                                key={message.id}
                                className={cn(
                                  "group flex",
                                  message.senderType === "PLAYER"
                                    ? "justify-end"
                                    : "justify-start",
                                )}
                              >
                                <div
                                  className={cn(
                                    "max-w-[70%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-300 group-hover:scale-[1.02]",
                                    message.senderType === "PLAYER"
                                      ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white"
                                      : "border border-gray-600/30 bg-gradient-to-r from-gray-700 to-gray-800 text-white",
                                  )}
                                >
                                  <p className="font-rajdhani text-sm leading-relaxed">
                                    {message.content}
                                  </p>
                                  <div className="mt-2 flex items-center justify-end space-x-1">
                                    <span className="font-rajdhani text-xs opacity-70">
                                      {format(message.timestamp, "HH:mm")}
                                    </span>
                                    {message.senderType === "PLAYER" && (
                                      <CheckIcon className="h-3 w-3 opacity-70" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                          {(selectedConversation?.messages ?? []).length ===
                            0 && (
                            <div className="py-16 text-center">
                              <div className="relative mx-auto mb-6 h-16 w-16">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-xl" />
                                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/50">
                                  <MessageSquareIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              </div>
                              <h3 className="font-rajdhani mb-2 text-lg font-bold text-white">
                                No messages yet
                              </h3>
                              <p className="font-rajdhani text-sm text-gray-400">
                                Start the conversation by sending a message!
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Enhanced Message Input */}
                  <div className="border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/30 p-6">
                    <div className="flex space-x-4">
                      <Textarea
                        value={newMessageContent}
                        onChange={(e) => setNewMessageContent(e.target.value)}
                        placeholder="Type your response..."
                        className="font-rajdhani resize-none border-gray-600 bg-gray-800/50 text-white transition-all duration-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                        disabled={
                          !newMessageContent.trim() ||
                          sendMessageMutation.isPending
                        }
                        className="self-end bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-lg transition-all duration-300 hover:from-emerald-700 hover:to-green-800 hover:shadow-xl"
                      >
                        {sendMessageMutation.isPending ? (
                          <LoaderIcon className="h-5 w-5 animate-spin" />
                        ) : (
                          <SendIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                    <p className="font-rajdhani mt-3 text-xs text-gray-500">
                      Press Enter to send, Shift+Enter for new line
                    </p>
                  </div>
                </>
              ) : (
                /* Enhanced Empty Chat State */
                <div className="flex h-full items-center justify-center">
                  <div className="space-y-6 text-center">
                    <div className="relative mx-auto h-24 w-24">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 blur-xl" />
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/50">
                        <MessageSquareIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-orbitron text-2xl font-bold text-white">
                        Select a Conversation
                      </h3>
                      <p className="font-rajdhani mx-auto max-w-md text-lg text-gray-400">
                        Choose a conversation from the list or start a new one
                        with a coach
                      </p>
                    </div>
                    <Button
                      onClick={() => setNewConversationOpen(true)}
                      className="font-orbitron bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl"
                    >
                      <PlusIcon className="mr-2 h-5 w-5" />
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
