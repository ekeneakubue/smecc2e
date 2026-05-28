import { NextResponse } from "next/server";
import type { ApplicationPayload } from "@/lib/application-types";
import { AuthError, requireCoordinatorSessionUser } from "@/lib/auth-service";
import {
  listApplications,
  submitApplication,
} from "@/lib/applications-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import { sendApplicationConfirmationEmail } from "@/lib/send-application-confirmation-email";

export async function GET() {
  try {
    await requireCoordinatorSessionUser();
    const applications = await listApplications();
    return NextResponse.json({ applications });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("GET /api/applications", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error:
          connectionError ?? "Failed to load applications from database",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApplicationPayload & {
      applicationId?: string;
    };
    const { applicationId, ...payload } = body;
    const record = await submitApplication(payload, applicationId);
    const confirmationEmail = await sendApplicationConfirmationEmail(record);
    return NextResponse.json(
      {
        application: record,
        confirmationEmailSent: confirmationEmail.sent,
        confirmationEmailError: confirmationEmail.error,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/applications", err);
    const connectionError = toUserFacingDatabaseError(err);
    const message =
      connectionError ??
      (err instanceof Error ? err.message : "Failed to save application");
    const isClientError =
      !connectionError &&
      err instanceof Error &&
      (/complete all required fields/i.test(err.message) ||
        /verify your email/i.test(err.message) ||
        /email is required/i.test(err.message));
    return NextResponse.json(
      { error: message },
      { status: connectionError ? 503 : isClientError ? 400 : 500 }
    );
  }
}
