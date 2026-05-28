import type { ApplicationRecord } from "./application-types";
import {
  applicantDisplayName,
  applicantPrimaryEmail,
} from "./application-types";
import { buildApplicationReviewRows } from "./application-review-summary";
import {
  emailDetailsTable,
  emailLayout,
  escapeHtml,
} from "./email-layout";
import {
  getEmailFrom,
  getResendClient,
  isResendConfigured,
  type SendEmailResult,
} from "./resend-client";

function formatSubmittedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export async function sendApplicationConfirmationEmail(
  application: ApplicationRecord
): Promise<SendEmailResult> {
  const to = applicantPrimaryEmail(application).trim();
  if (!to) {
    return { sent: false, error: "No applicant email on record." };
  }

  const resend = getResendClient();
  if (!resend) {
    console.log(
      "[SMECC2E] Application confirmation (Resend not configured) for:",
      application.id,
      "→",
      to
    );
    return {
      sent: false,
      error: "Resend is not configured. Confirmation email was not sent.",
    };
  }

  const name = applicantDisplayName(application) || "Applicant";
  const summaryRows = buildApplicationReviewRows(application, {
    profileUploaded: application.profileUploaded,
  });
  const rows = [
    { label: "Reference", value: application.id },
    { label: "Applicant", value: name },
    { label: "Email", value: to },
    { label: "Submitted", value: formatSubmittedAt(application.submittedAt) },
    { label: "Status", value: "Pending review" },
    ...summaryRows,
  ];

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:20px;color:#062763;">Application received</h1>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;">
      Dear ${escapeHtml(name)},
    </p>
    <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#334155;">
      Thank you for submitting your SMECC2E scholarship application. We have received your application and it is now <strong>pending review</strong>.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;color:#334155;">
      Please keep this email for your records. Your application reference is <strong>${escapeHtml(application.id)}</strong>.
    </p>
    <p style="margin:16px 0 0;font-size:14px;font-weight:600;color:#062763;">
      Your submitted application (review summary)
    </p>
    ${emailDetailsTable(rows)}
    <p style="margin:20px 0 0;font-size:12px;color:#64748b;line-height:1.5;">
      The coordination office will contact you regarding next steps. Do not reply to this automated message.
    </p>
  `;

  const text = [
    "SMECC2E — Application received",
    "",
    `Dear ${name},`,
    "",
    "Thank you for submitting your SMECC2E scholarship application.",
    "",
    "Your submitted application (review summary):",
    "",
    ...rows.map((r) => `${r.label}: ${r.value}`),
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: [to],
      subject: `Application received — ${application.id}`,
      text,
      html: emailLayout({
        title: "Application received",
        preheader: `Your application ${application.id} has been submitted.`,
        bodyHtml,
      }),
    });

    if (error) {
      console.error("[SMECC2E] Resend application confirmation failed:", error);
      return {
        sent: false,
        error: error.message ?? "Could not send confirmation email.",
      };
    }

    return { sent: true };
  } catch (err) {
    console.error("[SMECC2E] Resend application confirmation error:", err);
    return {
      sent: false,
      error: "Could not send confirmation email.",
    };
  }
}

export { isResendConfigured };
