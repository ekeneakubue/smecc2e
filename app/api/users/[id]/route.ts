import { NextResponse } from "next/server";
import type { DashboardUser } from "@/lib/dashboard-users";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import { deleteUser, updateUser } from "@/lib/users-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
      institution?: string;
      profileImageUrl?: string | null;
      role?: DashboardUser["role"];
      status?: DashboardUser["status"];
    };

    const role = body.role ?? "Coordinator";
    const status = body.status ?? "Active";

    if (
      role !== "Coordinator" &&
      role !== "Reviewer" &&
      role !== "Administrator"
    ) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (status !== "Active" && status !== "Inactive") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const { users } = await updateUser(id, {
      name: body.name ?? "",
      email: body.email ?? "",
      phoneNumber: body.phoneNumber ?? "",
      institution: body.institution ?? "",
      profileImageUrl: body.profileImageUrl ?? null,
      role,
      status,
      password: body.password,
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("PATCH /api/users/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to update user";
    const status =
      message === "User not found"
        ? 404
        : message.includes("already exists")
          ? 409
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { users } = await deleteUser(id);
    return NextResponse.json({ users });
  } catch (err) {
    console.error("DELETE /api/users/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to delete user";
    const status = message === "User not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
