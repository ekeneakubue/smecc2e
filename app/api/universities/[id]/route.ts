import { NextResponse } from "next/server";
import { AuthError, requireDashboardSessionUser } from "@/lib/auth-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import {
  deleteUniversity,
  updateUniversity,
} from "@/lib/universities-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireDashboardSessionUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      thematicAreas?: string[];
    };

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "University name is required" },
        { status: 400 }
      );
    }

    const thematicAreas = Array.isArray(body.thematicAreas)
      ? body.thematicAreas
      : [];

    const { universities } = await updateUniversity(id, name, thematicAreas);
    return NextResponse.json({
      universities,
      universityNames: universities.map((u) => u.name),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("PATCH /api/universities/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to update university";
    const status =
      message === "University not found"
        ? 404
        : message.includes("already exists")
          ? 409
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireDashboardSessionUser();
    const { id } = await context.params;
    const { universities } = await deleteUniversity(id);
    return NextResponse.json({
      universities,
      universityNames: universities.map((u) => u.name),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("DELETE /api/universities/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to delete university";
    const status = message === "University not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
