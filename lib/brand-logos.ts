import fs from "node:fs";
import path from "node:path";

/** Public URL paths for files in `public/images/Brands/` or `public/images/brands/`. */
export function getBrandLogoPublicPaths(): string[] {
  const candidates = [
    path.join(process.cwd(), "public", "images", "Brands"),
    path.join(process.cwd(), "public", "images", "brands"),
  ];

  const brandsDir = candidates.find((d) => {
    try {
      return fs.existsSync(d);
    } catch {
      return false;
    }
  });

  if (!brandsDir) return [];

  const folder = path.basename(brandsDir);

  try {
    return fs
      .readdirSync(brandsDir)
      .filter((f) => /\.(png|jpe?g|svg|webp)$/i.test(f))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      )
      .map((f) => `/images/${folder}/${encodeURIComponent(f)}`);
  } catch {
    return [];
  }
}

/** Alt text from public path filename (e.g. `/images/Brands/1.png` → `1`). */
export function brandLogoAltFromPath(publicPath: string): string {
  const file = decodeURIComponent(publicPath.split("/").pop() ?? "");
  return file.replace(/\.[^.]+$/, "") || "Partner";
}
