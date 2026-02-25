"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  FilterIcon,
  LoaderIcon,
  MailIcon,
} from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { getGameIcon } from "./utils";
import type {
  ContactInfo,
  FilterStatus,
  MessagingRole,
  CoachConversation,
  PlayerConversation,
} from "./types";

interface ConversationListProps {
  role: MessagingRole;
  conversations: CoachConversation[] | PlayerConversation[];
  selectedId: string | null;
  searchQuery: string;
  filterStatus: FilterStatus;
  isLoading: boolean;
  onSelect: (id: string, unreadCount: number) => void;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: FilterStatus) => void;
  onNewConversation: () => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
}

function getContactFromConversation(
  role: MessagingRole,
  conv: CoachConversation | PlayerConversation,
): ContactInfo {
  if (role === "coach") {
    const c = conv as CoachConversation;
    return {
      id: c.player.id,
      name: c.player.name,
      email: c.player.email,
      avatar: c.player.avatar,
      school: c.player.school,
      subtitle: [
        c.player.mainGame ? getGameIcon(c.player.mainGame) + " " + c.player.mainGame : null,
        c.player.school,
      ]
        .filter(Boolean)
        .join(" · "),
    };
  }
  const c = conv as PlayerConversation;
  return {
    id: c.coach.id,
    name: c.coach.name,
    email: c.coach.email,
    avatar: c.coach.avatar,
    school: c.coach.school,
    subtitle: c.coach.schoolName ?? c.coach.school ?? undefined,
  };
}

export function ConversationList({
  role,
  conversations,
  selectedId,
  searchQuery,
  filterStatus,
  isLoading,
  onSelect,
  onSearchChange,
  onFilterChange,
  onNewConversation,
  onToggleStar,
}: ConversationListProps) {
  return (
    <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="font-orbitron flex items-center gap-2 text-xl text-white">
            <MailIcon className="h-5 w-5 text-cyan-400" />
            Conversations
          </CardTitle>
          <Badge
            variant="outline"
            className="font-rajdhani border-gray-600/50 text-gray-300"
          >
            {conversations.length}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="group relative">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400 transition-colors group-focus-within:text-cyan-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="font-rajdhani border-gray-600 bg-gray-800/50 pl-10 text-white placeholder-gray-400 transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div className="flex space-x-2">
            <Select
              value={filterStatus}
              onValueChange={(v) => onFilterChange(v as FilterStatus)}
            >
              <SelectTrigger className="font-rajdhani flex-1 border-gray-600 bg-gray-800/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20">
                <FilterIcon className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-800">
                <SelectItem value="all" className="font-rajdhani text-white hover:bg-gray-700">
                  All Messages
                </SelectItem>
                <SelectItem value="unread" className="font-rajdhani text-white hover:bg-gray-700">
                  Unread
                </SelectItem>
                <SelectItem value="starred" className="font-rajdhani text-white hover:bg-gray-700">
                  Starred
                </SelectItem>
                <SelectItem value="archived" className="font-rajdhani text-white hover:bg-gray-700">
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              className="font-orbitron bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold whitespace-nowrap text-white shadow-lg hover:from-cyan-600 hover:to-blue-700"
              onClick={onNewConversation}
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="max-h-[500px] space-y-1 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-12 text-center">
              <LoaderIcon className="mx-auto mb-4 h-8 w-8 animate-spin text-cyan-400" />
              <p className="font-rajdhani text-sm text-gray-400">
                Loading conversations...
              </p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <MessageSquareIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="font-rajdhani text-sm text-gray-400">
                No conversations yet
              </p>
              <Button
                onClick={onNewConversation}
                variant="link"
                className="font-rajdhani mt-2 text-cyan-400"
              >
                Start a conversation
              </Button>
            </div>
          ) : (
            conversations.map((conv) => {
              const contact = getContactFromConversation(role, conv);
              return (
                <ConversationItem
                  key={conv.id}
                  id={conv.id}
                  contact={contact}
                  lastMessage={
                    conv.lastMessage
                      ? {
                          content: conv.lastMessage.content,
                          senderType: conv.lastMessage.senderType,
                          timestamp: conv.lastMessage.timestamp,
                        }
                      : null
                  }
                  unreadCount={conv.unreadCount}
                  isStarred={conv.isStarred}
                  isSelected={selectedId === conv.id}
                  selfSenderType={role === "coach" ? "COACH" : "PLAYER"}
                  onSelect={() => onSelect(conv.id, conv.unreadCount)}
                  onToggleStar={(e) => onToggleStar(conv.id, e)}
                />
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
