import { CoachIntroEmail } from "@/emails/coaches/coach-intro";
import { PlayerMessageEmail } from "@/emails/coaches/player-message";
import { getMessagesFromEmail, getRecruitingFromEmail, getResendClient, isEmailConfigured } from "@/lib/email";
import { render } from "@react-email/components";

/**
 * Send a player-message notification email to a preprovisioned coach.
 * Returns true if sent, false if skipped (email not configured or cap reached).
 */
export async function sendPlayerMessageEmail(opts: {
  coachEmail: string;
  coachName: string;
  playerName: string;
  playerGame?: string | null;
  playerRank?: string | null;
  playerGpa?: string | null;
  messagePreview: string;
  forwardedEmailsCount: number;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn("[email-bridge] Resend not configured, skipping email");
    return false;
  }

  // Cap at 3 forwarded emails per preprovisioned coach
  if (opts.forwardedEmailsCount >= 3) {
    console.log(
      `[email-bridge] Coach ${opts.coachEmail} has reached forwarding cap (${opts.forwardedEmailsCount})`,
    );
    return false;
  }

  const resend = getResendClient();

  const html = await render(
    PlayerMessageEmail({
      coachName: opts.coachName,
      playerName: opts.playerName,
      playerGame: opts.playerGame,
      playerRank: opts.playerRank,
      playerGpa: opts.playerGpa,
      messagePreview: opts.messagePreview,
      viewUrl: `https://evalgaming.com/sign-up/schools?redirect=${encodeURIComponent(`https://evalgaming.com/dashboard/coaches/messages`)}`,
    }),
  );

  const { error } = await resend.emails.send({
    from: getMessagesFromEmail(),
    to: opts.coachEmail,
    subject: `${opts.playerName} sent you a message on EVAL Gaming`,
    html,
  });

  if (error) {
    console.error("[email-bridge] Failed to send player message email:", error);
    return false;
  }

  return true;
}

/**
 * Send the one-time intro email to a preprovisioned coach.
 */
export async function sendCoachIntroEmail(opts: {
  coachEmail: string;
  coachName: string;
  schoolName: string;
}): Promise<boolean> {
  if (!isEmailConfigured()) {
    return false;
  }

  const resend = getResendClient();

  const html = await render(
    CoachIntroEmail({
      coachName: opts.coachName,
      schoolName: opts.schoolName,
      claimUrl: `https://evalgaming.com/sign-up/schools`,
      learnMoreUrl: `https://evalgaming.com/recruiting`,
    }),
  );

  const { error } = await resend.emails.send({
    from: getRecruitingFromEmail(),
    to: opts.coachEmail,
    subject: `Your esports program is on EVAL Gaming`,
    html,
  });

  if (error) {
    console.error("[email-bridge] Failed to send coach intro email:", error);
    return false;
  }

  return true;
}
