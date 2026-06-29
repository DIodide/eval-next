import { logger, task, wait } from "@trigger.dev/sdk";

import { sendPlayerMessageEmail } from "@/lib/server/email-bridge";
import { triggerDb as db } from "./db";

export const playerMessageWorkflow = task({
  id: "player-message-workflow",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: {
    conversationId: string;
    messageId: string;
    playerId: string;
    coachId: string;
  }) => {
    const conversation = await db.conversation.findUnique({
      where: { id: payload.conversationId },
      include: {
        coach: true,
        player: {
          include: {
            main_game: true,
            game_profiles: {
              take: 1,
              select: { rank: true },
              orderBy: { updated_at: "desc" },
            },
          },
        },
        messages: {
          where: { id: payload.messageId },
          take: 1,
        },
      },
    });

    if (!conversation) {
      logger.warn("Conversation not found for player message workflow", {
        payload,
      });
      return;
    }

    const coach = conversation.coach;
    const message = conversation.messages[0];

    if (!message) {
      logger.warn("Message not found for player message workflow", {
        payload,
      });
      return;
    }

    if (!coach.clerk_id && coach.forwarded_emails_count < 3) {
      const playerName =
        `${conversation.player.first_name} ${conversation.player.last_name}`.trim() ||
        "A player";

      const sent = await sendPlayerMessageEmail({
        coachEmail: coach.email,
        coachName: `${coach.first_name} ${coach.last_name}`.trim(),
        playerName,
        playerGame: conversation.player.main_game?.name,
        playerRank: conversation.player.game_profiles[0]?.rank,
        playerGpa: conversation.player.gpa?.toString(),
        messagePreview: message.content,
        forwardedEmailsCount: coach.forwarded_emails_count,
      });

      if (sent) {
        await db.coach.update({
          where: { id: coach.id },
          data: {
            forwarded_emails_count: { increment: 1 },
          },
        });
      }
    }

    await wait.for({ hours: 24 });

    const replyCheck = await db.conversation.findUnique({
      where: { id: payload.conversationId },
      include: {
        messages: {
          select: {
            sender_type: true,
          },
        },
      },
    });

    if (!replyCheck) {
      return;
    }

    const coachHasReplied = replyCheck.messages.some(
      (replyMessage) => replyMessage.sender_type === "COACH",
    );

    if (coachHasReplied) {
      logger.info("Skipping coach reminder because coach has replied", {
        conversationId: payload.conversationId,
      });
      return;
    }

    logger.info("Coach reminder is eligible but not implemented yet", {
      conversationId: payload.conversationId,
    });
  },
});
