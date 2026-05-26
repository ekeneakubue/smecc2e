import { NextResponse } from "next/server";
import type { ApplicationStatus } from "@/lib/application-types";
import { COORDINATOR_APPLICATION_STATUSES } from "@/lib/application-types";
import {
  getApplication,
  updateApplicationStatus,
} from "@/lib/applications-store";
type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const application = getApplication(id);
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ application });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { status?: ApplicationStatus };
  if (
    !body.status ||
    !COORDINATOR_APPLICATION_STATUSES.includes(body.status)
  ) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const application = updateApplicationStatus(id, body.status);
  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ application });
}
