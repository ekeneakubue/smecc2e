import { applicantPrimaryEmail, type ApplicationPayload } from "./application-types";
import {
  ApplicantAuthError,
  requireApplicantPasswordChanged,
  type ApplicantSessionUser,
} from "./applicant-auth-service";
import { normalizeEmail } from "./email-verification-store";
import { getApplication } from "./applications-service";

function emailsForPayload(payload: ApplicationPayload): Set<string> {
  const emails = new Set<string>();
  const registration = normalizeEmail(payload.email ?? "");
  const primary = normalizeEmail(applicantPrimaryEmail(payload) ?? "");
  if (registration) emails.add(registration);
  if (primary) emails.add(primary);
  return emails;
}

export function applicantEmailMatchesSession(
  sessionEmail: string,
  targetEmail: string
): boolean {
  return normalizeEmail(sessionEmail) === normalizeEmail(targetEmail);
}

export function assertApplicantEmailMatchesSession(
  user: ApplicantSessionUser,
  email: string
): void {
  if (!applicantEmailMatchesSession(user.email, email)) {
    throw new ApplicantAuthError("Forbidden", 403);
  }
}

export function assertApplicantPayloadMatchesSession(
  user: ApplicantSessionUser,
  payload: ApplicationPayload
): void {
  const emails = emailsForPayload(payload);
  if (!emails.has(normalizeEmail(user.email))) {
    throw new ApplicantAuthError("Forbidden", 403);
  }
}

export async function requireApplicantOwnsApplication(
  applicationId: string
): Promise<{ user: ApplicantSessionUser; applicationId: string }> {
  const user = await requireApplicantPasswordChanged();
  const application = await getApplication(applicationId);
  if (!application || application.status !== "draft") {
    throw new ApplicantAuthError("Not found", 404);
  }

  const sessionEmail = normalizeEmail(user.email);
  const appEmails = new Set(
    [application.email, application.personalEmail]
      .map((value) => normalizeEmail(value))
      .filter(Boolean)
  );
  if (!appEmails.has(sessionEmail)) {
    throw new ApplicantAuthError("Forbidden", 403);
  }

  return { user, applicationId: application.id };
}
