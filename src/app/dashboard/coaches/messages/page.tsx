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
  PlusIcon,
  SendIcon,
  FilterIcon,
  CheckIcon,
  MoreVerticalIcon,
  StarIcon,
  LoaderIcon,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { toast } from "sonner";

// Types based on tRPC API responses
interface Player {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  school?: string | null;
  classYear?: string | null;
  location?: string | null;
  gpa?: number | null;
  mainGame?: string;
  gameProfiles: Array<{
    game: string;
    rank?: string | null;
    role?: string | null;
    username: string;
  }>;
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
  player: Player;
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

export default function CoachMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "unread" | "starred" | "archived"
  >("all");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [messageTemplate, setMessageTemplate] = useState("");

  // tRPC queries and mutations
  const { data: conversationsData, isLoading: conversationsLoading } =
    api.messages.getConversations.useQuery({
      search: searchQuery,
      filter: filterStatus,
      limit: 50,
    });

  const { data: selectedConversation, isLoading: conversationLoading } =
    api.messages.getConversation.useQuery(
      { conversationId: selectedConversationId! },
      { enabled: !!selectedConversationId },
    );

  const { data: availablePlayers, isLoading: playersLoading } =
    api.messages.getAvailablePlayers.useQuery({
      limit: 50,
    });

  const sendMessageMutation = api.messages.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessageContent("");
      toast.success("Message sent successfully!");
    },
    onError: (error) => {
      toast.error("Failed to send message: " + error.message);
    },
  });

  const sendBulkMessageMutation = api.messages.sendBulkMessage.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully sent ${data.messagesSent} messages`);
      setSelectedPlayers([]);
      setMessageTemplate("");
      setNewConversationOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to send messages: " + error.message);
    },
  });

  const markAsReadMutation = api.messages.markAsRead.useMutation({
    onSuccess: () => {
      toast.success("Messages marked as read");
    },
  });

  const toggleStarMutation = api.messages.toggleStar.useMutation({
    onSuccess: () => {
      toast.success("Conversation starred");
    },
  });

  // Use actual data from tRPC queries
  const conversations: Conversation[] = conversationsData?.conversations ?? [];
  const players: Player[] = availablePlayers ?? [];

  const handleSendMessage = () => {
    if (!newMessageContent.trim() || !selectedConversationId) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: newMessageContent,
    });
  };

  const handleStartNewConversation = () => {
    if (selectedPlayers.length === 0 || !messageTemplate.trim()) return;

    sendBulkMessageMutation.mutate({
      playerIds: selectedPlayers.map((p) => p.id),
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

  const getGameIcon = (game: string) => {
    const icons: Record<string, string> = {
      VALORANT: "🎯",
      "Overwatch 2": "⚡",
      "Rocket League": "🚀",
      "League of Legends": "⚔️",
      "Super Smash Bros. Ultimate": "🥊",
    };
    return icons[game] ?? "🎮";
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-orbitron text-3xl font-bold text-white">
          Messages
        </h1>
        <p className="font-rajdhani text-gray-400">
          Communicate with prospective players
        </p>
      </div>

      {/* Messages Layout */}
      <div className="grid h-[700px] gap-6 lg:grid-cols-3">
        {/* Conversations List */}
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-orbitron text-white">
                Conversations
              </CardTitle>
              <Badge
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                {conversations.length}
              </Badge>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="border-gray-700 bg-gray-800 pl-10 text-white placeholder-gray-400"
                />
              </div>

              <div className="flex space-x-2">
                <Select
                  value={filterStatus}
                  onValueChange={(
                    value: "all" | "unread" | "starred" | "archived",
                  ) => setFilterStatus(value)}
                >
                  <SelectTrigger className="flex-1 border-gray-700 bg-gray-800 text-white">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-700 bg-gray-800">
                    <SelectItem
                      value="all"
                      className="text-white hover:bg-gray-700"
                    >
                      All Messages
                    </SelectItem>
                    <SelectItem
                      value="unread"
                      className="text-white hover:bg-gray-700"
                    >
                      Unread
                    </SelectItem>
                    <SelectItem
                      value="starred"
                      className="text-white hover:bg-gray-700"
                    >
                      Starred
                    </SelectItem>
                    <SelectItem
                      value="archived"
                      className="text-white hover:bg-gray-700"
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
                      className="font-orbitron bg-cyan-600 whitespace-nowrap text-white hover:bg-cyan-700"
                    >
                      <PlusIcon className="mr-1 h-4 w-4" />
                      New Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto border-gray-800 bg-gray-900 text-white">
                    <DialogHeader>
                      <DialogTitle className="font-orbitron text-xl">
                        Start New Conversation
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Select players to message and compose your message
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6">
                      {/* Player Selection */}
                      <div>
                        <h3 className="font-orbitron mb-4 text-lg text-cyan-400">
                          Select Players
                        </h3>
                        {playersLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <LoaderIcon className="h-6 w-6 animate-spin text-cyan-400" />
                          </div>
                        ) : (
                          <div className="grid max-h-60 gap-3 overflow-y-auto">
                            {players.map((player) => (
                              <div
                                key={player.id}
                                className={cn(
                                  "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors",
                                  selectedPlayers.includes(player)
                                    ? "border-cyan-400 bg-cyan-900/20"
                                    : "border-gray-700 hover:border-gray-600",
                                )}
                                onClick={() => {
                                  setSelectedPlayers((prev) =>
                                    prev.includes(player)
                                      ? prev.filter((p) => p.id !== player.id)
                                      : [...prev, player],
                                  );
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={player.avatar ?? undefined}
                                    />
                                    <AvatarFallback className="bg-gray-700 text-white">
                                      {player.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h4 className="font-orbitron text-sm font-bold text-white">
                                      {player.name}
                                    </h4>
                                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                                      {player.mainGame && (
                                        <>
                                          <span>
                                            {getGameIcon(player.mainGame)}
                                          </span>
                                          <span>{player.mainGame}</span>
                                        </>
                                      )}
                                      {player.school && (
                                        <>
                                          <span>•</span>
                                          <span>{player.school}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {selectedPlayers.includes(player) && (
                                  <CheckIcon className="h-5 w-5 text-cyan-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedPlayers.length > 0 && (
                          <div className="mt-3">
                            <p className="mb-2 text-sm text-gray-400">
                              Selected players ({selectedPlayers.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {selectedPlayers.map((player) => (
                                <Badge
                                  key={player.id}
                                  variant="outline"
                                  className="border-cyan-400 text-cyan-400"
                                >
                                  {player.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Message Template */}
                      <div>
                        <h3 className="font-orbitron mb-4 text-lg text-cyan-400">
                          Compose Message
                        </h3>
                        <Textarea
                          value={messageTemplate}
                          onChange={(e) => setMessageTemplate(e.target.value)}
                          placeholder="Write your message here..."
                          className="min-h-32 border-gray-700 bg-gray-800 text-white"
                          rows={6}
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          This message will be sent to all selected players
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="outline"
                          onClick={() => setNewConversationOpen(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleStartNewConversation}
                          disabled={
                            selectedPlayers.length === 0 ||
                            !messageTemplate.trim() ||
                            sendBulkMessageMutation.isPending
                          }
                          className="bg-cyan-600 text-white hover:bg-cyan-700"
                        >
                          {sendBulkMessageMutation.isPending ? (
                            <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <SendIcon className="mr-2 h-4 w-4" />
                          )}
                          Send Messages ({selectedPlayers.length})
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
                <div className="px-4 py-12 text-center">
                  <LoaderIcon className="mx-auto mb-4 h-8 w-8 animate-spin text-cyan-400" />
                  <p className="text-sm text-gray-400">
                    Loading conversations...
                  </p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <MessageSquareIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-sm text-gray-400">No conversations yet</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Start messaging players to see conversations here
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      "cursor-pointer border-l-4 p-4 transition-colors",
                      selectedConversationId === conversation.id
                        ? "border-l-cyan-400 bg-cyan-900/20"
                        : "border-l-transparent hover:bg-gray-800/50",
                    )}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={conversation.player.avatar ?? undefined}
                          />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {conversation.player.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-orbitron truncate text-sm font-bold text-white">
                              {conversation.player.name}
                            </h4>
                            {conversation.isStarred && (
                              <StarIcon
                                className="h-3 w-3 cursor-pointer fill-current text-yellow-400"
                                onClick={(e) =>
                                  handleToggleStar(conversation.id, e)
                                }
                              />
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {conversation.unreadCount > 0 && (
                              <Badge className="bg-cyan-600 px-1.5 py-0.5 text-xs text-white">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessage &&
                                formatLastSeen(
                                  conversation.lastMessage.timestamp,
                                )}
                            </span>
                          </div>
                        </div>

                        <div className="mb-2 flex items-center space-x-2 text-xs text-gray-400">
                          {conversation.player.mainGame && (
                            <>
                              <span>
                                {getGameIcon(conversation.player.mainGame)}
                              </span>
                              <span>{conversation.player.mainGame}</span>
                            </>
                          )}
                          {conversation.player.school && (
                            <>
                              <span>•</span>
                              <span>{conversation.player.school}</span>
                            </>
                          )}
                        </div>

                        {conversation.lastMessage && (
                          <p className="truncate text-sm text-gray-400">
                            {conversation.lastMessage.senderType === "COACH" &&
                              "You: "}
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
          <Card className="flex h-full flex-col border-gray-800 bg-gray-900">
            {selectedConversationId && selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={
                              selectedConversation.player.avatar ?? undefined
                            }
                          />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {selectedConversation.player.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="font-orbitron font-bold text-white">
                          {selectedConversation.player.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          {selectedConversation.player.mainGame && (
                            <>
                              <span>
                                {getGameIcon(
                                  selectedConversation.player.mainGame,
                                )}
                              </span>
                              <span>
                                {selectedConversation.player.mainGame}
                              </span>
                            </>
                          )}
                          {selectedConversation.player.school && (
                            <>
                              <span>•</span>
                              <span>{selectedConversation.player.school}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
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
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                      >
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-hidden p-4">
                  <div className="h-full overflow-y-auto">
                    {conversationLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(selectedConversation?.messages ?? []).map(
                          (message: Message) => (
                            <div
                              key={message.id}
                              className={cn(
                                "flex",
                                message.senderType === "COACH"
                                  ? "justify-end"
                                  : "justify-start",
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[70%] rounded-lg px-4 py-2",
                                  message.senderType === "COACH"
                                    ? "bg-cyan-600 text-white"
                                    : "bg-gray-800 text-white",
                                )}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div className="mt-1 flex items-center justify-end space-x-1">
                                  <span className="text-xs opacity-70">
                                    {format(message.timestamp, "HH:mm")}
                                  </span>
                                  {message.senderType === "COACH" && (
                                    <CheckIcon className="h-3 w-3 opacity-70" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                        {(selectedConversation?.messages ?? []).length ===
                          0 && (
                          <div className="py-8 text-center">
                            <MessageSquareIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-400">
                              No messages yet
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              Start the conversation by sending a message
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-gray-800 p-4">
                  <div className="flex space-x-3">
                    <Textarea
                      value={newMessageContent}
                      onChange={(e) => setNewMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      className="resize-none border-gray-700 bg-gray-800 text-white"
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
                      className="self-end bg-cyan-600 text-white hover:bg-cyan-700"
                    >
                      {sendMessageMutation.isPending ? (
                        <LoaderIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              /* Empty Chat State */
              <div className="flex h-full items-center justify-center">
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
                    <MessageSquareIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg font-bold text-white">
                      Select a Conversation
                    </h3>
                    <p className="mt-2 text-sm text-gray-400">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                  <Button
                    onClick={() => setNewConversationOpen(true)}
                    className="font-orbitron bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
