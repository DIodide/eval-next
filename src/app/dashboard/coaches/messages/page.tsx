"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  UserPlusIcon,
  FilterIcon,
  ClockIcon,
  CheckIcon,
  MoreVerticalIcon,
  StarIcon,
  ArchiveIcon,
  TrashIcon,
  LoaderIcon
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
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "starred" | "archived">("all");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [messageTemplate, setMessageTemplate] = useState("");

  // tRPC queries and mutations
  const { data: conversationsData, isLoading: conversationsLoading } = api.messages.getConversations.useQuery({
    search: searchQuery,
    filter: filterStatus,
    limit: 50,
  });

  const { data: selectedConversation, isLoading: conversationLoading } = api.messages.getConversation.useQuery(
    { conversationId: selectedConversationId! },
    { enabled: !!selectedConversationId }
  );

  const { data: availablePlayers, isLoading: playersLoading } = api.messages.getAvailablePlayers.useQuery({
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
      playerIds: selectedPlayers.map(p => p.id),
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
      "VALORANT": "🎯",
      "Overwatch 2": "⚡",
      "Rocket League": "🚀",
      "League of Legends": "⚔️",
      "Super Smash Bros. Ultimate": "🥊",
    };
    return icons[game] ?? "🎮";
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
          <p className="text-gray-400 font-rajdhani">Communicate with prospective players</p>
        </div>
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
                Select players to message and compose your message
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Player Selection */}
              <div>
                <h3 className="font-orbitron text-lg text-cyan-400 mb-4">Select Players</h3>
                {playersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoaderIcon className="w-6 h-6 animate-spin text-cyan-400" />
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedPlayers.includes(player)
                            ? "border-cyan-400 bg-cyan-900/20"
                            : "border-gray-700 hover:border-gray-600"
                        )}
                        onClick={() => {
                          setSelectedPlayers(prev =>
                            prev.includes(player)
                              ? prev.filter(p => p.id !== player.id)
                              : [...prev, player]
                          );
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={player.avatar ?? undefined} />
                            <AvatarFallback className="bg-gray-700 text-white">
                              {player.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-orbitron font-bold text-white text-sm">{player.name}</h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                              {player.mainGame && (
                                <>
                                  <span>{getGameIcon(player.mainGame)}</span>
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
                          <CheckIcon className="w-5 h-5 text-cyan-400" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedPlayers.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-2">Selected players ({selectedPlayers.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlayers.map((player) => (
                        <Badge key={player.id} variant="outline" className="border-cyan-400 text-cyan-400">
                          {player.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Template */}
              <div>
                <h3 className="font-orbitron text-lg text-cyan-400 mb-4">Compose Message</h3>
                <Textarea
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Write your message here..."
                  className="bg-gray-800 border-gray-700 text-white min-h-32"
                  rows={6}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This message will be sent to all selected players
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
                  disabled={selectedPlayers.length === 0 || !messageTemplate.trim() || sendBulkMessageMutation.isPending}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  {sendBulkMessageMutation.isPending ? (
                    <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SendIcon className="w-4 h-4 mr-2" />
                  )}
                  Send Messages ({selectedPlayers.length})
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
                  placeholder="Search conversations..." 
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
                  <p className="text-gray-400 text-sm">No conversations yet</p>
                  <p className="text-gray-500 text-xs mt-2">Start messaging players to see conversations here</p>
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
                          <AvatarImage src={conversation.player.avatar ?? undefined} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {conversation.player.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-orbitron font-bold text-white text-sm truncate">
                              {conversation.player.name}
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
                          {conversation.player.mainGame && (
                            <>
                              <span>{getGameIcon(conversation.player.mainGame)}</span>
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
                          <p className="text-sm text-gray-400 truncate">
                            {conversation.lastMessage.senderType === "COACH" && "You: "}
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
                          <AvatarImage src={selectedConversation.player.avatar ?? undefined} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {selectedConversation.player.name.split(' ').map(n => n[0]).join('')}
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
                              <span>{getGameIcon(selectedConversation.player.mainGame)}</span>
                              <span>{selectedConversation.player.mainGame}</span>
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
                            message.senderType === "COACH" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              message.senderType === "COACH"
                                ? "bg-cyan-600 text-white"
                                : "bg-gray-800 text-white"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-end space-x-1 mt-1">
                              <span className="text-xs opacity-70">
                                {format(message.timestamp, "HH:mm")}
                              </span>
                              {message.senderType === "COACH" && (
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
                          <p className="text-gray-500 text-xs mt-2">Start the conversation by sending a message</p>
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
                      placeholder="Type your message..."
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
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                  <Button 
                    onClick={() => setNewConversationOpen(true)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-orbitron"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Start New Conversation
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Messaging Guidelines */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Recruiting Communication Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white">Be Professional</h4>
              <p className="text-sm text-gray-400">Maintain a respectful and professional tone in all communications</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white">Be Specific</h4>
              <p className="text-sm text-gray-400">Clearly outline opportunities, expectations, and next steps</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white">Be Timely</h4>
              <p className="text-sm text-gray-400">Respond promptly to maintain engagement and show interest</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-orbitron font-semibold text-white">Be Transparent</h4>
              <p className="text-sm text-gray-400">Provide honest information about your program and requirements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 