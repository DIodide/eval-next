import type { RouterOutputs } from "@/trpc/react";

export type CoachConversation =
  RouterOutputs["messages"]["getConversations"]["conversations"][number];

export type PlayerConversation =
  RouterOutputs["messages"]["getPlayerConversations"]["conversations"][number];

export type CoachConversationDetail =
  RouterOutputs["messages"]["getConversation"];

export type PlayerConversationDetail =
  RouterOutputs["messages"]["getPlayerConversation"];

export interface MessageItem {
  id: string;
  senderId: string;
  senderType: "COACH" | "PLAYER";
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export type FilterStatus = "all" | "unread" | "starred" | "archived";

export type MessagingRole = "coach" | "player";

export interface ContactInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  school?: string | null;
  subtitle?: string;
}
