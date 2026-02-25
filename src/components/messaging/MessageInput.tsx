"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon, LoaderIcon } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
  isPending: boolean;
}

export function MessageInput({ onSend, isPending }: MessageInputProps) {
  const [content, setContent] = useState("");

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content);
    setContent("");
  };

  return (
    <div className="border-t border-gray-700/50 bg-gradient-to-r from-gray-800/30 to-gray-900/30 p-4">
      <div className="flex space-x-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="font-rajdhani resize-none border-gray-600 bg-gray-800/50 text-white transition-all duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          rows={2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button
          onClick={handleSend}
          disabled={!content.trim() || isPending}
          className="self-end bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg transition-all hover:from-cyan-700 hover:to-blue-700"
        >
          {isPending ? (
            <LoaderIcon className="h-5 w-5 animate-spin" />
          ) : (
            <SendIcon className="h-5 w-5" />
          )}
        </Button>
      </div>
      <p className="font-rajdhani mt-2 text-xs text-gray-500">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
