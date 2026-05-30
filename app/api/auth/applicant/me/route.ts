import { NextResponse } from "next/server";
import {
  ApplicantAuthError,
  getApplicantSessionUser,
} from "@/lib/applicant-auth-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";

export async function GET() {
  try {
    const user = await getApplicantSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (err) {
    console.error("GET /api/auth/applicant/me", err);
    if (err instanceof ApplicantAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      { error: connectionError ?? "Failed to load session" },
      { status: connectionError ? 503 : 500 }
    );
  }
}
