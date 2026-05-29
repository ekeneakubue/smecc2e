import { NextResponse } from "next/server";
import type { ApplicationStatus } from "@/lib/application-types";
import { COORDINATOR_APPLICATION_STATUSES } from "@/lib/application-types";
import {
  AuthError,
  requireDashboardSessionUser,
} from "@/lib/auth-service";
import {
  getApplication,
  updateApplicationStatus,
} from "@/lib/applications-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const application = await getApplication(id);
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (application.status !== "draft") {
      await requireDashboardSessionUser();
    }
    return NextResponse.json({ application });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("GET /api/applications/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error:
          connectionError ?? "Failed to load application from database",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireDashboardSessionUser();
    const { id } = await context.params;
    const body = (await request.json()) as { status?: ApplicationStatus };
    if (
      !body.status ||
      !COORDINATOR_APPLICATION_STATUSES.includes(body.status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const application = await updateApplicationStatus(id, body.status);
    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ application });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("PATCH /api/applications/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error:
          connectionError ?? "Failed to update application status",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}
