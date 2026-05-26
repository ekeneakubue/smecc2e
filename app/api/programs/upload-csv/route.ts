import { NextResponse } from "next/server";
import { parseCsv } from "@/lib/csv-parse";
import { AFRICAN_COUNTRY_OPTIONS } from "@/lib/african-countries";
import {
  PROGRAM_TYPES,
  type CreateProgramInput,
  type ProgramTypeLabel,
} from "@/lib/academic-program";
import { THEMATIC_AREA_OPTIONS } from "@/lib/thematic-areas";
import { toUserFacingDatabaseError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import {
  importPrograms,
  listUniversitiesWithPrograms,
} from "@/lib/programs-service";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB (keep it consistent with other uploads)

type CsvError = { row: number; message: string };

function normalizeHeader(header: string) {
  return header
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^_+|_+$/g, "");
}

function parseProgramType(value: string): ProgramTypeLabel | null {
  const v = value.trim();
  if (!v) return null;
  if (/master/i.test(v)) return "Master";
  if (/doctor/i.test(v)) return "Doctorate";
  if (PROGRAM_TYPES.includes(v as ProgramTypeLabel)) return v as ProgramTypeLabel;
  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No CSV file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "CSV must be 2MB or smaller" },
        { status: 400 }
      );
    }

    const text = await file.text();
    const { headers, rows } = parseCsv(text);

    if (!headers.length) {
      return NextResponse.json(
        { error: "CSV is missing a header row" },
        { status: 400 }
      );
    }

    const thematicAreaByLower = new Map(
      THEMATIC_AREA_OPTIONS.map((a) => [a.toLowerCase(), a])
    );
    const countryByLower = new Map(
      AFRICAN_COUNTRY_OPTIONS.map((c) => [c.toLowerCase(), c])
    );

    const requiredKeys = [
      "institution",
      "country",
      "type",
      "name",
      "thematicArea",
      "accreditationDetails",
    ] as const;

    const headerKeyIndex: Partial<
      Record<(typeof requiredKeys)[number], number>
    > = {};

    for (let i = 0; i < headers.length; i++) {
      const h = normalizeHeader(headers[i] ?? "");
      // Map CSV headers to our internal keys.
      // Accepts a few common variations.
      if (["institution", "institutionid", "institutionname", "partnerinstitution"].includes(h)) {
        headerKeyIndex.institution = i;
      } else if (h === "country") {
        headerKeyIndex.country = i;
      } else if (
        h === "type" ||
        h === "typeofprogram" ||
        h === "typeofprogramme" ||
        h === "programtype"
      ) {
        headerKeyIndex.type = i;
      } else if (
        ["nameofprogram", "programname", "program", "nameofprogramme", "nameofprogramme"].includes(
          h
        )
      ) {
        headerKeyIndex.name = i;
      } else if (h === "thematicarea" || h === "thematic") {
        headerKeyIndex.thematicArea = i;
      } else if (
        [
          "detailsofaccreditation",
          "accreditationdetails",
          "accreditationdetail",
          "detailsaccreditation",
          "accreditation",
        ].includes(h)
      ) {
        headerKeyIndex.accreditationDetails = i;
      }
    }

    for (const key of requiredKeys) {
      if (headerKeyIndex[key] === undefined) {
        return NextResponse.json(
          {
            error: `CSV is missing required column: ${key}`,
          },
          { status: 400 }
        );
      }
    }

    // Resolve universities once for the whole import.
    const universities = await prisma.university.findMany({
      select: {
        id: true, // Prisma DB id (relation key)
        slug: true,
        name: true,
      },
    });

    const universityIdByDbId = new Map(universities.map((u) => [u.id, u.id]));
    const universityIdBySlug = new Map(universities.map((u) => [u.slug, u.id]));
    const universityIdByNameLower = new Map(
      universities.map((u) => [u.name.toLowerCase(), u.id])
    );

    const resolveUniversityId = (raw: string) => {
      const v = raw.trim();
      if (!v) return null;
      return (
        universityIdByDbId.get(v) ??
        universityIdBySlug.get(v) ??
        universityIdByNameLower.get(v.toLowerCase()) ??
        null
      );
    };

    const validationErrors: CsvError[] = [];
    const inputs: Array<{ row: number } & CreateProgramInput> = [];

    // Data rows are line 2+ (header is line 1).
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r] ?? [];
      const isBlankRow = row.every((cell) => cell.trim() === "");
      if (isBlankRow) continue;
      const lineNumber = r + 2;

      const rawInstitution = (row[headerKeyIndex.institution!] ?? "").trim();
      const rawCountry = (row[headerKeyIndex.country!] ?? "").trim();
      const rawType = (row[headerKeyIndex.type!] ?? "").trim();
      const rawName = (row[headerKeyIndex.name!] ?? "").trim();
      const rawThematicArea = (row[headerKeyIndex.thematicArea!] ?? "").trim();
      const rawAccreditationDetails = (
        row[headerKeyIndex.accreditationDetails!] ?? ""
      ).trim();

      const universityId = resolveUniversityId(rawInstitution);
      if (!universityId) {
        validationErrors.push({
          row: lineNumber,
          message: `Unknown institution: "${rawInstitution}"`,
        });
        continue;
      }

      const type = parseProgramType(rawType);
      if (!type) {
        validationErrors.push({
          row: lineNumber,
          message: `Invalid type "${rawType}" (expected Master or Doctorate)`,
        });
        continue;
      }

      const country =
        countryByLower.get(rawCountry.toLowerCase()) ??
        null;
      if (!country) {
        validationErrors.push({
          row: lineNumber,
          message: `Invalid country "${rawCountry}"`,
        });
        continue;
      }

      const thematicArea =
        thematicAreaByLower.get(rawThematicArea.toLowerCase()) ?? null;
      if (!thematicArea) {
        validationErrors.push({
          row: lineNumber,
          message: `Invalid thematic area "${rawThematicArea}"`,
        });
        continue;
      }

      if (!rawName) {
        validationErrors.push({
          row: lineNumber,
          message: "Missing Name of Program",
        });
        continue;
      }

      if (!rawAccreditationDetails) {
        validationErrors.push({
          row: lineNumber,
          message: "Missing Details of Accreditation",
        });
        continue;
      }

      inputs.push({
        row: lineNumber,
        universityId,
        country,
        type,
        name: rawName,
        thematicArea,
        accreditationDetails: rawAccreditationDetails,
      });
    }

    const importResult = inputs.length
      ? await importPrograms(inputs)
      : { created: 0, errors: [] as CsvError[] };

    const universitiesWithPrograms =
      await listUniversitiesWithPrograms();

    const errors = [
      ...validationErrors,
      ...importResult.errors.map((e) => ({
        row: e.row,
        message: e.message,
      })),
    ];

    if (importResult.created === 0 && errors.length > 0) {
      return NextResponse.json(
        { created: 0, errors, universities: universitiesWithPrograms },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        created: importResult.created,
        errors,
        universities: universitiesWithPrograms,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/programs/upload-csv", err);
    const connectionError = toUserFacingDatabaseError(err);
    return NextResponse.json(
      {
        error: connectionError ?? "Failed to import programs from CSV",
      },
      { status: connectionError ? 503 : 500 }
    );
  }
}

