"use client";

import { Button } from "@/components/ui/button";
import { MessageSquareIcon, PlusIcon } from "lucide-react";

interface EmptyChatStateProps {
  onNewConversation: () => void;
  ctaLabel?: string;
}

export function EmptyChatState({
  onNewConversation,
  ctaLabel = "Start New Conversation",
}: EmptyChatStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="space-y-6 text-center">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-gray-600/50 bg-gray-800/50">
            <MessageSquareIcon className="h-10 w-10 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-orbitron text-xl font-bold text-white">
            Select a Conversation
          </h3>
          <p className="font-rajdhani mx-auto max-w-md text-gray-400">
            Choose a conversation from the list or start a new one
          </p>
        </div>
        <Button
          onClick={onNewConversation}
          className="font-orbitron bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg hover:from-cyan-600 hover:to-blue-700"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
