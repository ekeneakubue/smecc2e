import { NextResponse } from "next/server";
import type { ApplicationPayload } from "@/lib/application-types";
import {
  listApplications,
  submitApplication,
} from "@/lib/applications-store";
import { sendApplicationConfirmationEmail } from "@/lib/send-application-confirmation-email";

export async function GET() {
  return NextResponse.json({ applications: listApplications() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApplicationPayload & {
      applicationId?: string;
    };
    const { applicationId, ...payload } = body;
    const record = submitApplication(payload, applicationId);
    const confirmationEmail = await sendApplicationConfirmationEmail(record);
    return NextResponse.json(
      {
        application: record,
        confirmationEmailSent: confirmationEmail.sent,
        confirmationEmailError: confirmationEmail.error,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to save application" },
      { status: 500 }
    );
  }
}
