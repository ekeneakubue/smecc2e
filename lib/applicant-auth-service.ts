import {
  authenticateApplicantAccount,
  findApplicantDraftIdByEmail,
  findApplicantSummaryByEmail,
  getApplicantAccount,
} from "./applicant-account-service";
import { applicantVerifiedLoginPath } from "./applicant-login-paths";
import {
  getApplicantSessionFromCookie,
  type ApplicantSessionClaims,
  verifyApplicantSessionToken,
} from "./applicant-session";
import type { ApplicationStatus } from "./application-types";

export class ApplicantAuthError extends Error {
  status: number;
  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.name = "ApplicantAuthError";
    this.status = status;
  }
}

export type ApplicantSessionUser = {
  email: string;
  applicantId: string | null;
  mustChangePassword: boolean;
  application: {
    id: string;
    publicId: string | null;
    status: ApplicationStatus;
    currentPage: number | null;
    firstName: string;
    surname: string;
    submittedAt: string | null;
  } | null;
};

export async function getApplicantSessionUser(): Promise<ApplicantSessionUser | null> {
  const session = await getApplicantSessionFromCookie();
  if (!session) return null;

  const account = await getApplicantAccount(session.email);
  if (!account) return null;

  const application = await findApplicantSummaryByEmail(session.email);

  return {
    email: session.email,
    applicantId: session.applicantId,
    mustChangePassword: account.mustChangePassword,
    application: application
      ? {
          id: application.id,
          publicId: application.publicId,
          status: application.status as ApplicationStatus,
          currentPage: application.currentPage,
          firstName: application.firstName,
          surname: application.surname,
          submittedAt: application.submittedAt?.toISOString() ?? null,
        }
      : null,
  };
}

export async function requireApplicantSessionUser(): Promise<ApplicantSessionUser> {
  const user = await getApplicantSessionUser();
  if (!user) throw new ApplicantAuthError();
  return user;
}

export async function requireApplicantPasswordChanged(): Promise<ApplicantSessionUser> {
  const user = await requireApplicantSessionUser();
  if (user.mustChangePassword) {
    throw new ApplicantAuthError("Password change required", 403);
  }
  return user;
}

export async function loginApplicant(
  email: string,
  password: string
): Promise<
  | {
      email: string;
      applicantId: string | null;
      mustChangePassword: boolean;
      currentPage: number | null;
    }
  | { error: string }
> {
  const result = await authenticateApplicantAccount(email, password);
  if ("error" in result) return result;

  const applicantId = await findApplicantDraftIdByEmail(result.account.email);
  const application = await findApplicantSummaryByEmail(result.account.email);

  return {
    email: result.account.email,
    applicantId,
    mustChangePassword: result.account.mustChangePassword,
    currentPage: application?.currentPage ?? null,
  };
}

export { applicantVerifiedLoginPath } from "./applicant-login-paths";

export function applicantContinueApplicationPath(
  currentPage: number | null | undefined
): string {
  const page = currentPage && currentPage > 1 ? currentPage : 2;
  return `/applicant/application?page=${page}`;
}

export function safeApplicantApplicationRedirect(
  redirect: string | null | undefined,
  currentPage?: number | null
): string {
  const fallback = applicantContinueApplicationPath(currentPage);
  if (!redirect) return fallback;
  if (
    redirect === "/applicant/application" ||
    redirect.startsWith("/applicant/application?")
  ) {
    return redirect;
  }
  return fallback;
}

export function applicantLoginRedirect(
  mustChangePassword: boolean,
  currentPage?: number | null
): string {
  const appPath = applicantContinueApplicationPath(currentPage);
  if (mustChangePassword) {
    return `/applicant/change-password?redirect=${encodeURIComponent(appPath)}`;
  }
  return appPath;
}

export async function verifyApplicantSessionFromRequest(
  token: string | undefined
): Promise<ApplicantSessionClaims | null> {
  return verifyApplicantSessionToken(token);
}
