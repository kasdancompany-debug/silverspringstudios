import { Resend } from "resend";

const DEFAULT_FROM_EMAIL = "Silver Spring Studios <noreply@silverspringstudios.example>";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function getFromEmail(): string {
  return process.env.EMAIL_FROM ?? DEFAULT_FROM_EMAIL;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | string[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: SendEmailParams): Promise<SendEmailResult> {
  const client = getResendClient();

  if (!client) {
    console.warn(
      "[email] RESEND_API_KEY is not configured. Email not sent:",
      subject,
      "→",
      Array.isArray(to) ? to.join(", ") : to,
    );
    return { success: true, skipped: true };
  }

  try {
    const { data, error } = await client.emails.send({
      from: getFromEmail(),
      to,
      subject,
      html,
      text,
      replyTo,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Unexpected error:", message);
    return { success: false, error: message };
  }
}
