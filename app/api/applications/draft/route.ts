import { NextResponse } from "next/server";
import type { ApplicationPayload } from "@/lib/application-types";
import {
  findDraftByEmail,
  upsertDraftApplication,
} from "@/lib/applications-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";

export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get("email")?.trim();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const application = await findDraftByEmail(email);
    return NextResponse.json({ application });
  } catch (err) {
    console.error("GET /api/applications/draft", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error:
          connectionError ?? "Failed to load application draft from database",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ApplicationPayload & {
      currentPage?: number;
    };
    const currentPage = body.currentPage;
    if (!currentPage || currentPage < 1) {
      return NextResponse.json(
        { error: "currentPage is required" },
        { status: 400 }
      );
    }

    const { currentPage: _page, ...payload } = body;
    const application = await upsertDraftApplication(payload, currentPage);
    return NextResponse.json({ application });
  } catch (err) {
    console.error("POST /api/applications/draft", err);
    const connectionError = toUserFacingDatabaseError(err);
    const message =
      err instanceof Error ? err.message : "Failed to save application draft";
    return NextResponse.json(
      { error: connectionError ?? message },
      { status: connectionError ? 503 : 400 }
    );
  }
}
