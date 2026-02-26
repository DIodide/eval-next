"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircleIcon,
  SearchIcon,
  PlusIcon,
  FilterIcon,
  LoaderIcon,
  MailIcon,
  SendIcon,
  StarIcon,
  MoreVerticalIcon,
  MessageSquareIcon,
  CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NewConversationDialog } from "@/components/messaging";
import type { FilterStatus, MessageItem, CoachConversationDetail, CoachConversation } from "@/components/messaging/types";
import { formatLastSeen, getInitials, getGameIcon } from "@/components/messaging/utils";
import {
  useConversations,
  useSendMessage,
  useMarkAsRead,
  useToggleStar,
} from "@/hooks/use-messaging";
import { api } from "@/trpc/react";
import { toast } from "sonner";

export default function CoachMessagesPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const listQuery = useConversations("coach", { search, filter });
  const detailQuery = api.messages.getConversation.useQuery(
    { conversationId: selectedId! },
    { enabled: !!selectedId, refetchInterval: 2_000 },
  );

  const sendMutation = useSendMessage("coach", selectedId);
  const markReadMutation = useMarkAsRead("coach");
  const starMutation = useToggleStar("coach");

  const sendNewMutation = api.messages.sendMessage.useMutation({
    onSuccess: (data) => {
      setNewConvOpen(false);
      setSelectedId(data.conversationId);
      toast.success("Message sent!");
    },
    onError: (err) => { toast.error(err.message); },
  });

  const conversations = (listQuery.data?.conversations ?? []) as CoachConversation[];
  const detail = detailQuery.data as CoachConversationDetail | undefined;
  const messages = (detail?.messages ?? []) as MessageItem[];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const handleSelect = (id: string, unread: number) => {
    setSelectedId(id);
    if (unread > 0) markReadMutation.mutate({ conversationId: id });
  };

  const handleSend = () => {
    if (!selectedId || !draft.trim()) return;
    sendMutation.mutate(
      { conversationId: selectedId, content: draft },
      { onError: (err) => { toast.error(err.message); } },
    );
    setDraft("");
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/20 p-2.5">
          <MessageCircleIcon className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="font-orbitron text-2xl font-bold text-white">Messages</h1>
          <p className="font-rajdhani text-sm text-gray-400">
            Communicate with prospective players
          </p>
        </div>
      </div>

      {/* Main chat layout */}
      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden rounded-xl border border-gray-700/50">
        {/* Sidebar – conversation list */}
        <div className="flex w-80 flex-shrink-0 flex-col border-r border-gray-700/50 bg-gray-900/60">
          {/* Sidebar header */}
          <div className="space-y-3 border-b border-gray-700/50 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-orbitron flex items-center gap-2 text-sm font-bold text-white">
                <MailIcon className="h-4 w-4 text-cyan-400" />
                Conversations
              </h2>
              <Badge variant="outline" className="border-gray-600/50 text-xs text-gray-400">
                {conversations.length}
              </Badge>
            </div>
            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-8 border-gray-700 bg-gray-800/60 pl-9 text-sm text-white placeholder-gray-500 focus:border-cyan-500"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
                <SelectTrigger className="h-8 flex-1 border-gray-700 bg-gray-800/60 text-xs text-white">
                  <FilterIcon className="mr-1.5 h-3 w-3" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-800">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="starred">Starred</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="h-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-xs text-white"
                onClick={() => setNewConvOpen(true)}
              >
                <PlusIcon className="mr-1 h-3 w-3" />
                New
              </Button>
            </div>
          </div>

          {/* Conversation items */}
          <div className="flex-1 overflow-y-auto">
            {listQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoaderIcon className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <MessageSquareIcon className="mx-auto mb-3 h-10 w-10 text-gray-600" />
                <p className="font-rajdhani text-sm text-gray-500">No conversations</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const subtitle = [
                  conv.player.mainGame
                    ? getGameIcon(conv.player.mainGame) + " " + conv.player.mainGame
                    : null,
                  conv.player.school,
                ].filter(Boolean).join(" · ");

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelect(conv.id, conv.unreadCount)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border-l-4 px-4 py-3 transition-colors",
                      selectedId === conv.id
                        ? "border-l-cyan-400 bg-cyan-900/20"
                        : "border-l-transparent hover:bg-gray-800/40",
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={conv.player.avatar ?? undefined} />
                        <AvatarFallback className="bg-gray-700 text-xs text-white">
                          {getInitials(conv.player.name)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-orbitron truncate text-xs font-bold text-white">
                          {conv.player.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {conv.isStarred && (
                            <StarIcon
                              className="h-3 w-3 fill-current text-yellow-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                starMutation.mutate({ conversationId: conv.id });
                              }}
                            />
                          )}
                          <span className="text-[10px] text-gray-500">
                            {conv.lastMessage && formatLastSeen(conv.lastMessage.timestamp)}
                          </span>
                        </div>
                      </div>
                      {subtitle && (
                        <p className="truncate text-[11px] text-gray-500">{subtitle}</p>
                      )}
                      {conv.lastMessage && (
                        <p className="truncate text-xs text-gray-400">
                          {conv.lastMessage.senderType === "COACH" && (
                            <span className="text-cyan-400">You: </span>
                          )}
                          {conv.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex min-w-0 flex-1 flex-col bg-gray-900/40">
          {selectedId && detail ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between border-b border-gray-700/50 px-5 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-cyan-500/30">
                    <AvatarImage src={detail.player.avatar ?? undefined} />
                    <AvatarFallback className="bg-gray-700 text-white">
                      {getInitials(detail.player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-orbitron text-sm font-bold text-white">
                      {detail.player.name}
                    </h3>
                    {detail.player.school && (
                      <p className="text-xs text-gray-400">
                        {detail.player.mainGame && (
                          <span>{getGameIcon(detail.player.mainGame)} </span>
                        )}
                        {detail.player.school}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-yellow-400"
                    onClick={() => starMutation.mutate({ conversationId: detail.id })}
                  >
                    <StarIcon
                      className={cn("h-4 w-4", detail.isStarred && "fill-current text-yellow-400")}
                    />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages area */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
                {detailQuery.isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <LoaderIcon className="h-6 w-6 animate-spin text-cyan-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-500">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isSelf = msg.senderType === "COACH";
                      return (
                        <div key={msg.id} className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2.5 shadow",
                              isSelf
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                                : "border border-gray-700/40 bg-gray-800 text-white",
                            )}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <div className="mt-1 flex items-center justify-end gap-1">
                              <span className="text-[10px] opacity-60">
                                {format(new Date(msg.timestamp), "HH:mm")}
                              </span>
                              {isSelf && msg.isRead && (
                                <CheckIcon className="h-3 w-3 opacity-60" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="border-t border-gray-700/50 px-5 py-3">
                <div className="flex gap-3">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[2.5rem] max-h-32 resize-none border-gray-700 bg-gray-800/60 text-sm text-white placeholder-gray-500 focus:border-cyan-500"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!draft.trim() || sendMutation.isPending}
                    className="self-end bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                  >
                    {sendMutation.isPending ? (
                      <LoaderIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-[10px] text-gray-600">
                  Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-1 items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gray-700/50 bg-gray-800/50">
                  <MessageSquareIcon className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-orbitron text-lg font-bold text-white">
                    Select a Conversation
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pick a conversation or start a new one
                  </p>
                </div>
                <Button
                  onClick={() => setNewConvOpen(true)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Message a Player
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewConversationDialog
        role="coach"
        open={newConvOpen}
        onOpenChange={setNewConvOpen}
        onSend={(playerId, content) => sendNewMutation.mutate({ playerId, content })}
        isSending={sendNewMutation.isPending}
      />
    </div>
  );
}
