"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquareIcon,
  SearchIcon,
  SendIcon,
  CheckIcon,
  LoaderIcon,
  UsersIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials, getGameIcon } from "./utils";
import type { MessagingRole } from "./types";
import { api } from "@/trpc/react";

interface NewConversationDialogProps {
  role: MessagingRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (targetId: string, content: string) => void;
  isSending: boolean;
}

export function NewConversationDialog({
  role,
  open,
  onOpenChange,
  onSend,
  isSending,
}: NewConversationDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const { data: players, isLoading: playersLoading } =
    api.messages.getAvailablePlayers.useQuery(
      { search: searchQuery, limit: 50 },
      { enabled: role === "coach" && open },
    );

  const { data: coaches, isLoading: coachesLoading } =
    api.messages.getAvailableCoaches.useQuery(
      { search: searchQuery, limit: 50 },
      { enabled: role === "player" && open },
    );

  const contacts = role === "coach"
    ? (players ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        subtitle: [p.mainGame ? getGameIcon(p.mainGame) + " " + p.mainGame : null, p.school]
          .filter(Boolean)
          .join(" · "),
      }))
    : (coaches ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar,
        subtitle: c.schoolName ?? c.school ?? undefined,
      }));

  const isLoading = role === "coach" ? playersLoading : coachesLoading;

  const handleSend = () => {
    if (!selectedId || !message.trim()) return;
    onSend(selectedId, message);
    setSelectedId(null);
    setMessage("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      setSelectedId(null);
      setMessage("");
      setSearchQuery("");
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto border-gray-700/50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 text-white backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="font-orbitron flex items-center gap-2 text-xl text-cyan-300">
            <MessageSquareIcon className="h-5 w-5" />
            New Conversation
          </DialogTitle>
          <DialogDescription className="font-rajdhani text-gray-400">
            {role === "coach"
              ? "Select a player and compose your message"
              : "Select a coach and introduce yourself"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-orbitron mb-3 flex items-center gap-2 text-sm text-cyan-400">
              <UsersIcon className="h-4 w-4" />
              {role === "coach" ? "Select Player" : "Select Coach"}
            </h3>

            <div className="group relative mb-3">
              <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="font-rajdhani border-gray-600 bg-gray-800/50 pl-10 text-white placeholder-gray-400 focus:border-cyan-500"
              />
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="grid max-h-48 gap-2 overflow-y-auto pr-1">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all hover:scale-[1.01]",
                      selectedId === c.id
                        ? "border-cyan-400/50 bg-cyan-900/20"
                        : "border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30",
                    )}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border border-gray-700">
                        <AvatarImage src={c.avatar ?? undefined} />
                        <AvatarFallback className="font-orbitron bg-gray-700 text-sm text-white">
                          {getInitials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-orbitron text-sm font-bold text-white">
                          {c.name}
                        </h4>
                        {c.subtitle && (
                          <p className="font-rajdhani text-xs text-gray-400">
                            {c.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedId === c.id && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500">
                        <CheckIcon className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedId && (
              <div className="mt-3">
                <Badge variant="outline" className="border-cyan-400/50 text-cyan-300">
                  {contacts.find((c) => c.id === selectedId)?.name}
                </Badge>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-orbitron mb-3 flex items-center gap-2 text-sm text-cyan-400">
              <MessageSquareIcon className="h-4 w-4" />
              Message
            </h3>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              className="font-rajdhani min-h-24 border-gray-600 bg-gray-800/50 text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-700/50 pt-4">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="font-rajdhani border-gray-500/30 bg-gray-600/20 text-gray-200 hover:bg-gray-600/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!selectedId || !message.trim() || isSending}
              className="font-rajdhani bg-gradient-to-r from-cyan-600 to-blue-600 font-semibold text-white hover:from-cyan-700 hover:to-blue-700"
            >
              {isSending ? (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="mr-2 h-4 w-4" />
              )}
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
