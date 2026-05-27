import { regionIdFromName, type RegionRecord } from "./regions";
import { prisma } from "./prisma";
import { mapPrismaRegion } from "./prisma-mappers";

export async function listRegions(): Promise<RegionRecord[]> {
  const regions = await prisma.region.findMany({
    orderBy: { name: "asc" },
  });
  return regions.map(mapPrismaRegion);
}

export async function createRegion(
  name: string,
  countries: string[]
): Promise<{ regions: RegionRecord[] }> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Region name is required");
  }

  const slug = regionIdFromName(trimmed);
  const uniqueCountries = [
    ...new Set(countries.map((c) => c.trim()).filter(Boolean)),
  ];

  try {
    await prisma.region.create({
      data: {
        slug,
        name: trimmed,
        countries: uniqueCountries,
      },
    });
  } catch (err) {
    const isPrismaUnique =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002";
    if (isPrismaUnique) {
      throw new Error("A region with this name already exists");
    }
    throw err;
  }

  const regions = await listRegions();
  return { regions };
}

export async function updateRegion(
  slug: string,
  name: string,
  countries: string[]
): Promise<{ regions: RegionRecord[] }> {
  const existing = await prisma.region.findUnique({ where: { slug } });
  if (!existing) {
    throw new Error("Region not found");
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Region name is required");
  }

  const newSlug = regionIdFromName(trimmed);
  const uniqueCountries = [
    ...new Set(countries.map((c) => c.trim()).filter(Boolean)),
  ];

  try {
    await prisma.region.update({
      where: { slug },
      data: {
        slug: newSlug,
        name: trimmed,
        countries: uniqueCountries,
      },
    });
  } catch (err) {
    const isPrismaUnique =
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "P2002";
    if (isPrismaUnique) {
      throw new Error("A region with this name already exists");
    }
    throw err;
  }

  const regions = await listRegions();
  return { regions };
}

export async function deleteRegion(
  slug: string
): Promise<{ regions: RegionRecord[] }> {
  const existing = await prisma.region.findUnique({ where: { slug } });
  if (!existing) {
    throw new Error("Region not found");
  }

  await prisma.region.delete({ where: { slug } });
  const regions = await listRegions();
  return { regions };
}
