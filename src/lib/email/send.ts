import { Resend } from "resend";
import type { ReactElement } from "react";

// Lazy-initialized Resend client
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// Default from address
const DEFAULT_FROM = process.env.EMAIL_FROM || "ArCa <noreply@arca.app>";

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend
 * This function is designed to be non-blocking and will not throw errors.
 * Errors are logged and returned in the result object.
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param react - React Email component to render
 * @param from - Optional from address (defaults to ArCa <noreply@arca.app>)
 * @returns SendEmailResult with success status
 */
export async function sendEmail(
  to: string,
  subject: string,
  react: ReactElement,
  from: string = DEFAULT_FROM
): Promise<SendEmailResult> {
  // Validate inputs
  if (!to || !subject || !react) {
    console.error("sendEmail: Missing required parameters", {
      hasTo: !!to,
      hasSubject: !!subject,
      hasReact: !!react,
    });
    return { success: false, error: "Missing required parameters" };
  }

  // Check for API key and get client
  const client = getResendClient();
  if (!client) {
    console.warn("sendEmail: RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("sendEmail: Resend API error", {
        to,
        subject,
        error: error.message,
      });
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("sendEmail: Unexpected error", {
      to,
      subject,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send an email without blocking the main flow
 * Use this when you want to fire-and-forget an email notification
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param react - React Email component to render
 * @param from - Optional from address
 */
export function sendEmailAsync(
  to: string,
  subject: string,
  react: ReactElement,
  from: string = DEFAULT_FROM
): void {
  // Fire and forget - don't await
  sendEmail(to, subject, react, from).catch((error) => {
    console.error("sendEmailAsync: Failed to send email", {
      to,
      subject,
      error,
    });
  });
}
