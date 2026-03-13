"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { LoaderIcon, MessageCircleIcon } from "lucide-react";
import { toast } from "sonner";

import type {
  CoachConversationDetail,
  ContactInfo,
  FilterStatus,
  PlayerConversationDetail,
  MessagingRole,
} from "@/components/messaging/types";
import {
  useConversation,
  useConversations,
  useMarkAsRead,
  usePlayerMessagingStatus,
  useSendMessage,
  useToggleArchive,
  useToggleStar,
} from "@/hooks/use-messaging";
import { api } from "@/trpc/react";
import { ChatHeader } from "./ChatHeader";
import { ConversationList } from "./ConversationList";
import { EmptyChatState } from "./EmptyChatState";
import { MessageInput } from "./MessageInput";
import { MessageThread } from "./MessageThread";
import { MessagingPaywall } from "./MessagingPaywall";
import { NewConversationDialog } from "./NewConversationDialog";

interface MessagingShellProps {
  role: MessagingRole;
}

function getHeaderCopy(role: MessagingRole) {
  if (role === "coach") {
    return {
      title: "Messages",
      subtitle:
        "Reach players, keep threads organized, and follow up from one inbox.",
      iconClassName: "bg-cyan-500/20 text-cyan-400",
      ctaLabel: "Message a Player",
    };
  }

  return {
    title: "Messages",
    subtitle: "Keep coach conversations moving and track your outbound intros.",
    iconClassName: "bg-blue-500/20 text-blue-400",
    ctaLabel: "Message a Coach",
  };
}

function getContactInfo(
  detail: CoachConversationDetail | PlayerConversationDetail,
): ContactInfo {
  if ("player" in detail) {
    return {
      id: detail.player.id,
      name: detail.player.name,
      email: detail.player.email,
      avatar: detail.player.avatar,
      school: detail.player.school,
      subtitle: [detail.player.mainGame, detail.player.school]
        .filter(Boolean)
        .join(" · "),
    };
  }

  return {
    id: detail.coach.id,
    name: detail.coach.name,
    email: detail.coach.email,
    avatar: detail.coach.avatar,
    school: detail.coach.school,
    subtitle: detail.coach.schoolName ?? detail.coach.school ?? undefined,
  };
}

export function MessagingShell({ role }: MessagingShellProps) {
  const copy = getHeaderCopy(role);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const utils = api.useUtils();
  const listQuery = useConversations(role, {
    search: deferredSearch,
    filter,
  });
  const detailQuery = useConversation(role, selectedId);
  const sendMutation = useSendMessage(role, selectedId);
  const markReadMutation = useMarkAsRead(role);
  const starMutation = useToggleStar(role);
  const archiveMutation = useToggleArchive(role);
  const playerMessagingStatus = usePlayerMessagingStatus(role === "player");

  const sendCoachConversationMutation = api.messages.sendMessage.useMutation({
    onSuccess: async (data) => {
      setSelectedId(data.conversationId);
      setNewConversationOpen(false);
      await Promise.all([
        utils.messages.getConversations.invalidate(),
        utils.messages.getConversation.invalidate({
          conversationId: data.conversationId,
        }),
      ]);
      toast.success("Conversation started.");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendPlayerConversationMutation =
    api.messages.sendPlayerMessage.useMutation({
      onSuccess: async (data) => {
        setSelectedId(data.conversationId);
        setNewConversationOpen(false);
        await Promise.all([
          utils.messages.getPlayerConversations.invalidate(),
          utils.messages.getPlayerConversation.invalidate({
            conversationId: data.conversationId,
          }),
          utils.messages.getPlayerMessagingStatus.invalidate(),
        ]);
        toast.success("Conversation started.");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const conversations = useMemo(
    () => listQuery.data?.conversations ?? [],
    [listQuery.data?.conversations],
  );
  const detail = detailQuery.data;

  const hasSelectedConversation = Boolean(selectedId);
  const playerQuota = playerMessagingStatus.data;
  const canStartPlayerConversation =
    role === "coach" ? true : (playerQuota?.canStartConversation ?? true);

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0]!.id);
    }
  }, [conversations, selectedId]);

  useEffect(() => {
    if (
      selectedId &&
      filter !== "archived" &&
      conversations.length > 0 &&
      !conversations.some((conversation) => conversation.id === selectedId)
    ) {
      setSelectedId(conversations[0]?.id ?? null);
    }
  }, [conversations, filter, selectedId]);

  const handleSelectConversation = (
    conversationId: string,
    unreadCount: number,
  ) => {
    setSelectedId(conversationId);
    if (unreadCount > 0) {
      markReadMutation.mutate({ conversationId });
    }
  };

  const handleToggleArchive = () => {
    if (!selectedId) {
      return;
    }

    archiveMutation.mutate(
      { conversationId: selectedId },
      {
        onSuccess: (result) => {
          if (result.isArchived && filter !== "archived") {
            setSelectedId(null);
          }
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleSendMessage = (content: string) => {
    if (!selectedId) {
      return;
    }

    sendMutation.mutate(
      { conversationId: selectedId, content },
      {
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleStartConversation = (targetId: string, content: string) => {
    if (role === "coach") {
      sendCoachConversationMutation.mutate({ playerId: targetId, content });
      return;
    }

    sendPlayerConversationMutation.mutate({ coachId: targetId, content });
  };

  const contact = detail ? getContactInfo(detail) : null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className={`rounded-xl p-2.5 ${copy.iconClassName}`}>
            <MessageCircleIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-orbitron text-2xl font-bold text-white">
              {copy.title}
            </h1>
            <p className="font-rajdhani max-w-2xl text-sm text-gray-400">
              {copy.subtitle}
            </p>
          </div>
        </div>

        {role === "player" && playerQuota ? (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
            <div className="font-orbitron text-xs tracking-[0.18em] text-blue-300 uppercase">
              Messaging Quota
            </div>
            <div className="font-rajdhani mt-1">
              {playerQuota.hasUnlimitedAccess
                ? "Unlimited new coach conversations unlocked."
                : `${playerQuota.monthlyConversationStartsRemaining} of ${playerQuota.monthlyConversationStartLimit} new coach intros left this month.`}
            </div>
            {!playerQuota.hasUnlimitedAccess ? (
              <div className="font-rajdhani mt-1 text-xs text-blue-200/80">
                Resets {format(new Date(playerQuota.resetsAt!), "MMM d")}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/30">
        <div
          className={`min-h-0 w-full border-r border-gray-700/50 bg-gray-900/60 lg:flex lg:w-96 lg:flex-shrink-0 lg:flex-col ${
            hasSelectedConversation ? "hidden lg:flex" : "flex flex-col"
          }`}
        >
            <ConversationList
              role={role}
              conversations={conversations}
            selectedId={selectedId}
            searchQuery={search}
            filterStatus={filter}
            isLoading={listQuery.isLoading}
            onSelect={handleSelectConversation}
            onSearchChange={setSearch}
            onFilterChange={setFilter}
            onNewConversation={() => setNewConversationOpen(true)}
            onToggleStar={(conversationId, event) => {
              event.stopPropagation();
              starMutation.mutate(
                { conversationId },
                {
                  onError: (error) => {
                    toast.error(error.message);
                  },
                },
              );
            }}
          />
        </div>

        <div
          className={`min-h-0 flex-1 flex-col bg-gray-900/40 ${
            hasSelectedConversation ? "flex" : "hidden lg:flex"
          }`}
        >
          {selectedId ? (
            detail && contact ? (
              <>
                <ChatHeader
                  contact={contact}
                  isStarred={detail.isStarred}
                  isArchived={detail.isArchived}
                  onBack={() => setSelectedId(null)}
                  onToggleStar={() => {
                    starMutation.mutate(
                      { conversationId: detail.id },
                      {
                        onError: (error) => {
                          toast.error(error.message);
                        },
                      },
                    );
                  }}
                  onToggleArchive={handleToggleArchive}
                />

                <MessageThread
                  messages={detail.messages}
                  role={role}
                  isLoading={detailQuery.isLoading}
                />

                <MessageInput
                  key={detail.id}
                  onSend={handleSendMessage}
                  isPending={sendMutation.isPending}
                />
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <LoaderIcon className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            )
          ) : (
            <>
              <div className="flex h-full flex-col justify-center gap-6 p-6">
                <EmptyChatState
                  onNewConversation={() => setNewConversationOpen(true)}
                  ctaLabel={copy.ctaLabel}
                />
                {role === "player" &&
                playerQuota &&
                !playerQuota.canStartConversation ? (
                  <MessagingPaywall compact />
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      <NewConversationDialog
        role={role}
        open={newConversationOpen}
        onOpenChange={setNewConversationOpen}
        onSend={handleStartConversation}
        isSending={
          role === "coach"
            ? sendCoachConversationMutation.isPending
            : sendPlayerConversationMutation.isPending
        }
        canStartConversation={canStartPlayerConversation}
        playerQuota={role === "player" ? playerQuota : undefined}
      />
    </div>
  );
}
