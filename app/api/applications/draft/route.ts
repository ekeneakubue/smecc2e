import { NextResponse } from "next/server";
import type { ApplicationPayload } from "@/lib/application-types";
import {
  findDraftByEmail,
  upsertDraftApplication,
} from "@/lib/applications-store";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email")?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const application = findDraftByEmail(email);
  if (!application) {
    return NextResponse.json({ application: null });
  }

  return NextResponse.json({ application });
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
    const application = upsertDraftApplication(payload, currentPage);
    return NextResponse.json({ application });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save application draft";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
