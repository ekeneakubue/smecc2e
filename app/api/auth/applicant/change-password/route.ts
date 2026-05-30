import { NextResponse } from "next/server";
import {
  changeApplicantPassword,
  findApplicantDraftIdByEmail,
  getApplicantAccount,
} from "@/lib/applicant-account-service";
import {
  ApplicantAuthError,
  getApplicantSessionUser,
} from "@/lib/applicant-auth-service";
import { applicantPasswordChangedLoginPath } from "@/lib/applicant-login-paths";
import {
  APPLICANT_SESSION_COOKIE,
  applicantSessionCookieOptions,
  clearApplicantSessionCookieOptions,
  getApplicantSessionFromCookie,
} from "@/lib/applicant-session";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";

export async function POST(request: Request) {
  try {
    const session = await getApplicantSessionFromCookie();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as {
      newPassword?: string;
      confirmPassword?: string;
      currentPassword?: string;
      redirect?: string;
      staySignedIn?: boolean;
    };

    const account = await getApplicantAccount(session.email);
    if (!account) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const forcedFirstChange = account.mustChangePassword;
    const staySignedIn = body.staySignedIn === true && !forcedFirstChange;

    const newPassword = body.newPassword?.trim() ?? "";
    const confirmPassword = body.confirmPassword?.trim() ?? "";
    if (!newPassword) {
      return NextResponse.json(
        { error: "Enter a new password." },
        { status: 400 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New passwords do not match." },
        { status: 400 }
      );
    }

    if (staySignedIn && !body.currentPassword?.trim()) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }

    await changeApplicantPassword(session.email, newPassword, {
      currentPassword: body.currentPassword,
    });

    const user = await getApplicantSessionUser();

    if (staySignedIn) {
      const applicantId = await findApplicantDraftIdByEmail(session.email);
      const response = NextResponse.json({
        ok: true,
        message: "Password updated successfully.",
        user,
      });

      const opts = await applicantSessionCookieOptions(
        session.email,
        applicantId,
        false
      );
      response.cookies.set(APPLICANT_SESSION_COOKIE, opts.value, {
        httpOnly: opts.httpOnly,
        sameSite: opts.sameSite,
        secure: opts.secure,
        path: opts.path,
        maxAge: opts.maxAge,
      });

      return response;
    }

    await findApplicantDraftIdByEmail(session.email);
    const redirectTo = applicantPasswordChangedLoginPath(session.email);

    const response = NextResponse.json({
      ok: true,
      redirectTo,
      user,
    });

    const clearOpts = clearApplicantSessionCookieOptions();
    response.cookies.set(APPLICANT_SESSION_COOKIE, clearOpts.value, {
      httpOnly: clearOpts.httpOnly,
      sameSite: clearOpts.sameSite,
      secure: clearOpts.secure,
      path: clearOpts.path,
      maxAge: clearOpts.maxAge,
    });

    return response;
  } catch (err) {
    if (err instanceof ApplicantAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/auth/applicant/change-password", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to change password";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
