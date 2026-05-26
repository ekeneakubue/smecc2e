export const DEFAULT_REGION_OPTIONS = [
  "Northern Africa",
  "Western Africa",
  "Central Africa",
  "Eastern Africa",
  "Southern Africa",
] as const;

export type RegionRecord = {
  id: string;
  name: string;
  countries: string[];
};

/** Default seed list; coordinator may add more via the regions API. */
export const regionOptions = DEFAULT_REGION_OPTIONS;

export type RegionName = (typeof DEFAULT_REGION_OPTIONS)[number];

export function regionIdFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function parseCountriesInput(input: string): string[] {
  const parts = input
    .split(/[,;\n]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

/** Unique country names from all regions, sorted alphabetically. */
export function countriesFromRegions(regions: RegionRecord[]): string[] {
  const names = new Set<string>();
  for (const region of regions) {
    for (const country of region.countries) {
      const trimmed = country.trim();
      if (trimmed) names.add(trimmed);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

/** Find the SMECC2E region that contains the given country (case-insensitive). */
export function regionNameForCountry(
  regions: RegionRecord[],
  country: string
): string {
  const norm = country.trim().toLowerCase();
  if (!norm) return "";
  const region = regions.find((r) =>
    r.countries.some((c) => c.trim().toLowerCase() === norm)
  );
  return region?.name ?? "";
}
