type MessagingEventName =
  | "conversation_created"
  | "message_sent"
  | "bulk_message_sent"
  | "messages_marked_read"
  | "conversation_star_toggled"
  | "conversation_archive_toggled"
  | "player_quota_checked"
  | "player_quota_denied";

export interface MessagingEventPayload {
  actorRole: "coach" | "player" | "system";
  actorId?: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
  status?: "success" | "error";
  durationMs?: number;
  error?: string;
}

export interface MessagingEventRecord extends MessagingEventPayload {
  event: MessagingEventName;
  timestamp: string;
}

type MessagingObserver = (event: MessagingEventRecord) => void;

const observers = new Set<MessagingObserver>();

export function subscribeToMessagingEvents(observer: MessagingObserver) {
  observers.add(observer);
  return () => observers.delete(observer);
}

export function recordMessagingEvent(
  event: MessagingEventName,
  payload: MessagingEventPayload,
) {
  const record: MessagingEventRecord = {
    ...payload,
    event,
    timestamp: new Date().toISOString(),
  };

  console.info("[messaging]", JSON.stringify(record));

  for (const observer of observers) {
    observer(record);
  }
}

export async function observeMessagingEvent<T>(
  event: MessagingEventName,
  payload: MessagingEventPayload,
  operation: () => Promise<T>,
) {
  const startedAt = Date.now();

  try {
    const result = await operation();
    recordMessagingEvent(event, {
      ...payload,
      status: "success",
      durationMs: Date.now() - startedAt,
    });
    return result;
  } catch (error) {
    recordMessagingEvent(event, {
      ...payload,
      status: "error",
      durationMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
