import { NextResponse } from "next/server";
import { AuthError, requireDashboardSessionUser } from "@/lib/auth-service";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import { parseCountriesInput } from "@/lib/regions";
import { createRegion, listRegions } from "@/lib/regions-service";

export async function GET() {
  try {
    const regions = await listRegions();
    return NextResponse.json({
      regions,
      regionNames: regions.map((r) => r.name),
    });
  } catch (err) {
    console.error("GET /api/regions", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error: connectionError ?? "Failed to load regions from database",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireDashboardSessionUser();
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
    const { regions } = await createRegion(name, countries);
    return NextResponse.json(
      {
        regions,
        regionNames: regions.map((r) => r.name),
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: err.status === 403 ? "Forbidden" : "Unauthorized" },
        { status: err.status }
      );
    }
    console.error("POST /api/regions", err);
    const connectionError = toUserFacingDatabaseError(err);
    if (connectionError) {
      return NextResponse.json({ error: connectionError }, { status: 503 });
    }
    const message =
      err instanceof Error ? err.message : "Failed to create region";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
