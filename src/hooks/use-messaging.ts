"use client";

import { api } from "@/trpc/react";
import type { FilterStatus, MessagingRole } from "@/components/messaging/types";

const CONVERSATION_LIST_POLL_MS = 5_000;
const ACTIVE_CHAT_POLL_MS = 2_000;
const UNREAD_COUNT_POLL_MS = 10_000;

export function useConversations(
  role: MessagingRole,
  options: { search?: string; filter?: FilterStatus; limit?: number },
) {
  const coachQuery = api.messages.getConversations.useQuery(
    { search: options.search, filter: options.filter ?? "all", limit: options.limit ?? 50 },
    { enabled: role === "coach", refetchInterval: CONVERSATION_LIST_POLL_MS },
  );

  const playerQuery = api.messages.getPlayerConversations.useQuery(
    { search: options.search, filter: options.filter ?? "all", limit: options.limit ?? 50 },
    { enabled: role === "player", refetchInterval: CONVERSATION_LIST_POLL_MS },
  );

  return role === "coach" ? coachQuery : playerQuery;
}

export function useConversation(
  role: MessagingRole,
  conversationId: string | null,
) {
  const coachQuery = api.messages.getConversation.useQuery(
    { conversationId: conversationId! },
    {
      enabled: role === "coach" && !!conversationId,
      refetchInterval: ACTIVE_CHAT_POLL_MS,
    },
  );

  const playerQuery = api.messages.getPlayerConversation.useQuery(
    { conversationId: conversationId! },
    {
      enabled: role === "player" && !!conversationId,
      refetchInterval: ACTIVE_CHAT_POLL_MS,
    },
  );

  return role === "coach" ? coachQuery : playerQuery;
}

export function useSendMessage(
  role: MessagingRole,
  conversationId: string | null,
) {
  const utils = api.useUtils();

  const coachMutation = api.messages.sendMessage.useMutation({
    onMutate: async (newMessage) => {
      if (!conversationId) return;
      await utils.messages.getConversation.cancel({ conversationId });
      const prev = utils.messages.getConversation.getData({ conversationId });

      utils.messages.getConversation.setData({ conversationId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: `optimistic-${Date.now()}`,
              senderId: "self",
              senderType: "COACH" as const,
              content: newMessage.content,
              timestamp: new Date(),
              isRead: false,
            },
          ],
        };
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (conversationId && context?.prev) {
        utils.messages.getConversation.setData(
          { conversationId },
          context.prev,
        );
      }
    },
    onSettled: () => {
      if (conversationId) {
        void utils.messages.getConversation.invalidate({ conversationId });
      }
      void utils.messages.getConversations.invalidate();
    },
  });

  const playerMutation = api.messages.sendPlayerMessage.useMutation({
    onMutate: async (newMessage) => {
      if (!conversationId) return;
      await utils.messages.getPlayerConversation.cancel({ conversationId });
      const prev = utils.messages.getPlayerConversation.getData({
        conversationId,
      });

      utils.messages.getPlayerConversation.setData(
        { conversationId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...old.messages,
              {
                id: `optimistic-${Date.now()}`,
                senderId: "self",
                senderType: "PLAYER" as const,
                content: newMessage.content,
                timestamp: new Date(),
                isRead: false,
              },
            ],
          };
        },
      );

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (conversationId && context?.prev) {
        utils.messages.getPlayerConversation.setData(
          { conversationId },
          context.prev,
        );
      }
    },
    onSettled: () => {
      if (conversationId) {
        void utils.messages.getPlayerConversation.invalidate({
          conversationId,
        });
      }
      void utils.messages.getPlayerConversations.invalidate();
    },
  });

  return role === "coach" ? coachMutation : playerMutation;
}

export function useMarkAsRead(role: MessagingRole) {
  const utils = api.useUtils();

  const coachMutation = api.messages.markAsRead.useMutation({
    onSettled: () => {
      void utils.messages.getConversations.invalidate();
      void utils.messages.getUnreadCount.invalidate();
    },
  });

  const playerMutation = api.messages.markPlayerMessagesAsRead.useMutation({
    onSettled: () => {
      void utils.messages.getPlayerConversations.invalidate();
    },
  });

  return role === "coach" ? coachMutation : playerMutation;
}

export function useToggleStar(role: MessagingRole) {
  const utils = api.useUtils();

  const coachMutation = api.messages.toggleStar.useMutation({
    onSettled: () => {
      void utils.messages.getConversations.invalidate();
    },
  });

  const playerMutation = api.messages.togglePlayerStar.useMutation({
    onSettled: () => {
      void utils.messages.getPlayerConversations.invalidate();
    },
  });

  return role === "coach" ? coachMutation : playerMutation;
}

export function useUnreadCount() {
  return api.messages.getUnreadCount.useQuery(undefined, {
    refetchInterval: UNREAD_COUNT_POLL_MS,
  });
}

export function useMessagingAccess() {
  return api.messages.checkAccess.useQuery();
}
