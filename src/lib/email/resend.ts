import { Resend } from "resend";

let resendClient: Resend | null = null;

export function getResend(): Resend {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY env var missing");
  resendClient = new Resend(key);
  return resendClient;
}

export const EMAIL_FROM = process.env.EMAIL_FROM || "ImmoScorer <noreply@immoscorer.de>";
