import { NextResponse } from "next/server";
import type { ProgramTypeLabel } from "@/lib/academic-program";
import { PROGRAM_TYPES } from "@/lib/academic-program";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import {
  createProgram,
  listUniversitiesWithPrograms,
} from "@/lib/programs-service";

export async function GET() {
  try {
    const universities = await listUniversitiesWithPrograms();
    return NextResponse.json({ universities });
  } catch (err) {
    console.error("GET /api/programs", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error: connectionError ?? "Failed to load programs from database",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      institutionId?: string;
      country?: string;
      type?: string;
      name?: string;
      thematicArea?: string;
      accreditationDetails?: string;
    };

    const type = body.type as ProgramTypeLabel | undefined;
    if (type && !PROGRAM_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid program type" }, { status: 400 });
    }

    const { universities } = await createProgram({
      universityId: body.institutionId ?? "",
      country: body.country ?? "",
      type: type ?? "Master",
      name: body.name ?? "",
      thematicArea: body.thematicArea ?? "",
      accreditationDetails: body.accreditationDetails ?? "",
    });

    return NextResponse.json({ universities }, { status: 201 });
  } catch (err) {
    console.error("POST /api/programs", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to create program";
    const status =
      message === "Institution not found"
        ? 404
        : message.includes("already exists")
          ? 409
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
