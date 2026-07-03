import "server-only";

import { tasks } from "@trigger.dev/sdk";

import { env } from "@/env";

const PLAYER_MESSAGE_WORKFLOW_TASK_ID = "player-message-workflow";

export async function triggerPlayerMessageWorkflow(payload: {
  conversationId: string;
  messageId: string;
  playerId: string;
  coachId: string;
}) {
  if (!env.TRIGGER_SECRET_KEY) {
    console.warn(
      "[background-tasks] TRIGGER_SECRET_KEY not configured, skipping player-message-workflow",
    );
    return;
  }

  try {
    await tasks.trigger(PLAYER_MESSAGE_WORKFLOW_TASK_ID, payload, {
      idempotencyKey: `${PLAYER_MESSAGE_WORKFLOW_TASK_ID}:${payload.messageId}`,
    });
  } catch (error) {
    console.error(
      "[background-tasks] Failed to trigger player-message-workflow",
      error,
    );
  }
}
