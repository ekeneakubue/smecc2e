import { NextResponse } from "next/server";
import { AuthError, requireCoordinatorSessionUser } from "@/lib/auth-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import { parseCountriesInput } from "@/lib/regions";
import { deleteRegion, updateRegion } from "@/lib/regions-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireCoordinatorSessionUser();
    const { id } = await context.params;
    const body = (await request.json()) as {
      name?: string;
      countries?: string[];
      countriesText?: string;
    };

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { error: "Region name is required" },
        { status: 400 }
      );
    }

    const countries = Array.isArray(body.countries)
      ? body.countries
      : body.countriesText
        ? parseCountriesInput(body.countriesText)
        : [];

    const { regions } = await updateRegion(id, name, countries);
    return NextResponse.json({
      regions,
      regionNames: regions.map((r) => r.name),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("PATCH /api/regions/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to update region";
    const status =
      message === "Region not found"
        ? 404
        : message.includes("already exists")
          ? 409
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireCoordinatorSessionUser();
    const { id } = await context.params;
    const { regions } = await deleteRegion(id);
    return NextResponse.json({
      regions,
      regionNames: regions.map((r) => r.name),
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("DELETE /api/regions/[id]", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to delete region";
    const status = message === "Region not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
