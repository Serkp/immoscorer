import { getResend, EMAIL_FROM } from "./resend";
import { welcomeEmailSubject, welcomeEmailHtml } from "./templates/welcome";

interface SendWelcomeParams {
  email: string;
  name?: string;
}

export async function sendWelcomeEmail({ email, name }: SendWelcomeParams) {
  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: welcomeEmailSubject(),
    html: welcomeEmailHtml({ name, email }),
  });

  if (error) {
    console.error("[WelcomeEmail] Failed to send:", error);
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }

  console.log("[WelcomeEmail] Sent successfully to", email, "id:", data?.id);
  return data;
}
