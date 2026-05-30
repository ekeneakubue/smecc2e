import { NextResponse } from "next/server";
import {
  changeOwnPassword,
  updateOwnProfileImage,
} from "@/lib/account-service";
import { AuthError, getSessionUser, requireDashboardSessionUser } from "@/lib/auth-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";

export async function PATCH(request: Request) {
  try {
    const sessionUser = await requireDashboardSessionUser();
    const body = (await request.json()) as {
      profileImageUrl?: string | null;
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    let updated = false;

    if (body.profileImageUrl !== undefined) {
      await updateOwnProfileImage(sessionUser.id, body.profileImageUrl);
      updated = true;
    }

    const newPassword = body.newPassword?.trim() ?? "";
    if (newPassword) {
      const currentPassword = body.currentPassword?.trim() ?? "";
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required." },
          { status: 400 }
        );
      }
      const confirmPassword = body.confirmPassword?.trim() ?? "";
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "New passwords do not match." },
          { status: 400 }
        );
      }
      await changeOwnPassword(sessionUser.id, currentPassword, newPassword);
      updated = true;
    }

    if (!updated) {
      return NextResponse.json(
        { error: "No changes provided." },
        { status: 400 }
      );
    }

    const user = await getSessionUser();
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("PATCH /api/auth/account", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to update account";
    const status =
      message === "Current password is incorrect" ||
      message.includes("Password must be")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
