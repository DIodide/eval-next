"use client";

import { format } from "date-fns";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageItem, MessagingRole } from "./types";

interface MessageBubbleProps {
  message: MessageItem;
  role: MessagingRole;
}

export function MessageBubble({ message, role }: MessageBubbleProps) {
  const isSelf =
    (role === "coach" && message.senderType === "COACH") ||
    (role === "player" && message.senderType === "PLAYER");

  return (
    <div className={cn("flex", isSelf ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-2xl px-4 py-3 shadow-lg",
          isSelf
            ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
            : "border border-gray-600/30 bg-gradient-to-r from-gray-700 to-gray-800 text-white",
        )}
      >
        <p className="font-rajdhani text-sm leading-relaxed">
          {message.content}
        </p>
        <div className="mt-1 flex items-center justify-end space-x-1">
          <span className="font-rajdhani text-xs opacity-70">
            {format(new Date(message.timestamp), "HH:mm")}
          </span>
          {isSelf && message.isRead && (
            <CheckIcon className="h-3 w-3 opacity-70" />
          )}
        </div>
      </div>
    </div>
  );
}
