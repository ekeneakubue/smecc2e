import { prisma } from "./prisma";
import { mapPrismaProgram, mapPrismaUniversity } from "./prisma-mappers";
import {
  universitySlugFromName,
  type UniversityRecord,
} from "./universities";

export async function listUniversities(): Promise<UniversityRecord[]> {
  const universities = await prisma.university.findMany({
    orderBy: { name: "asc" },
    include: {
      programs: { orderBy: { name: "asc" } },
    },
  });
  return universities.map((university) => ({
    ...mapPrismaUniversity(university),
    programs: university.programs.map((program) =>
      mapPrismaProgram(program, university.name)
    ),
  }));
}

export async function createUniversity(
  name: string,
  thematicAreas: string[] = []
): Promise<{ universities: UniversityRecord[] }> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("University name is required");
  }

  const slug = universitySlugFromName(trimmed);
  const uniqueThematicAreas = [
    ...new Set(thematicAreas.map((a) => a.trim()).filter(Boolean)),
  ];

  try {
    await prisma.university.create({
      data: {
        slug,
        name: trimmed,
        thematicAreas: uniqueThematicAreas,
      },
    });
  } catch (err) {
    const isPrismaUnique =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002";
    if (isPrismaUnique) {
      throw new Error("A university with this name already exists");
    }
    throw err;
  }

  const universities = await listUniversities();
  return { universities };
}
