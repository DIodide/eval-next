import { Resend } from "resend";
import { env } from "@/env";

let resendInstance: Resend | null = null;

export function getResendClient(): Resend {
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  resendInstance ??= new Resend(env.RESEND_API_KEY);
  return resendInstance;
}

/** Coach intro — first touch, recruiting context */
export function getRecruitingFromEmail(): string {
  return env.RESEND_FROM_RECRUITING ?? "EVAL Gaming Recruiting <recruiting@evalgaming.com>";
}

/** Player message notifications */
export function getMessagesFromEmail(): string {
  return env.RESEND_FROM_MESSAGES ?? "EVAL Gaming <messages@evalgaming.com>";
}

/** Reminder / follow-up emails */
export function getRemindersFromEmail(): string {
  return env.RESEND_FROM_REMINDERS ?? "EVAL Gaming <reminders@evalgaming.com>";
}

export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY);
}
