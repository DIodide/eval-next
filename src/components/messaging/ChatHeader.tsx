"use client";

import { CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon, MoreVerticalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "./utils";
import type { ContactInfo } from "./types";

interface ChatHeaderProps {
  contact: ContactInfo;
  isStarred: boolean;
  onToggleStar: () => void;
}

export function ChatHeader({
  contact,
  isStarred,
  onToggleStar,
}: ChatHeaderProps) {
  return (
    <CardHeader className="border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border-2 border-cyan-500/30">
            <AvatarImage src={contact.avatar ?? undefined} />
            <AvatarFallback className="font-orbitron bg-gray-700 text-white">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-orbitron text-lg font-bold text-white">
              {contact.name}
            </h3>
            {contact.subtitle && (
              <p className="font-rajdhani text-sm text-gray-400">
                {contact.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="border-gray-600/50 bg-gray-700/30 text-gray-300 transition-colors hover:border-yellow-400/30 hover:bg-gray-700/50 hover:text-yellow-400"
            onClick={onToggleStar}
          >
            <StarIcon
              className={cn(
                "h-4 w-4",
                isStarred && "fill-current text-yellow-400",
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
  );
}
