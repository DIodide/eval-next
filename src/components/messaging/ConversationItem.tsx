"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLastSeen, getInitials } from "./utils";
import type { ContactInfo } from "./types";

interface ConversationItemProps {
  id: string;
  contact: ContactInfo;
  lastMessage: {
    content: string;
    senderType: "COACH" | "PLAYER";
    timestamp: Date;
  } | null;
  unreadCount: number;
  isStarred: boolean;
  isSelected: boolean;
  selfSenderType: "COACH" | "PLAYER";
  onSelect: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
}

export function ConversationItem({
  contact,
  lastMessage,
  unreadCount,
  isStarred,
  isSelected,
  selfSenderType,
  onSelect,
  onToggleStar,
}: ConversationItemProps) {
  return (
    <div
      className={cn(
        "group cursor-pointer border-l-4 p-4 transition-all duration-200 hover:bg-gray-800/30",
        isSelected
          ? "border-l-cyan-400 bg-cyan-900/20"
          : "border-l-transparent hover:bg-gray-800/50",
      )}
      onClick={onSelect}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-gray-700 transition-colors group-hover:border-cyan-500/30">
            <AvatarImage src={contact.avatar ?? undefined} />
            <AvatarFallback className="font-orbitron bg-gray-700 text-white">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500">
              <span className="text-xs font-bold text-white">
                {unreadCount}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-orbitron truncate text-sm font-bold text-white transition-colors group-hover:text-cyan-200">
                {contact.name}
              </h4>
              {isStarred && (
                <StarIcon
                  className="h-3 w-3 cursor-pointer fill-current text-yellow-400 transition-transform hover:scale-110"
                  onClick={onToggleStar}
                />
              )}
            </div>
            <span className="font-rajdhani text-xs text-gray-500">
              {lastMessage && formatLastSeen(lastMessage.timestamp)}
            </span>
          </div>

          {contact.subtitle && (
            <p className="font-rajdhani mb-1 truncate text-xs text-gray-400">
              {contact.subtitle}
            </p>
          )}

          {lastMessage && (
            <p className="font-rajdhani truncate text-sm text-gray-400">
              {lastMessage.senderType === selfSenderType && (
                <span className="text-cyan-400">You: </span>
              )}
              {lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
