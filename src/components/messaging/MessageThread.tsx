"use client";

import { useEffect, useRef } from "react";
import { MessageSquareIcon, LoaderIcon } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import type { MessageItem, MessagingRole } from "./types";

interface MessageThreadProps {
  messages: MessageItem[];
  role: MessagingRole;
  isLoading: boolean;
}

export function MessageThread({ messages, role, isLoading }: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4"
      style={{ minHeight: 0 }}
    >
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      ) : messages.length === 0 ? (
        <div className="py-16 text-center">
          <div className="relative mx-auto mb-6 h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/50">
              <MessageSquareIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <h3 className="font-rajdhani mb-2 text-lg font-bold text-white">
            No messages yet
          </h3>
          <p className="font-rajdhani text-sm text-gray-400">
            Start the conversation by sending a message
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
