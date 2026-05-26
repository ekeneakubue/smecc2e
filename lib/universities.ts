import type { ProgramRecord } from "./academic-program";
import { regionIdFromName } from "./regions";

export type UniversityRecord = {
  /** URL-safe slug, e.g. university-of-nigeria-unn */
  id: string;
  /** Prisma record id (for relations). */
  dbId: string;
  name: string;
  thematicAreas: string[];
  /** Present when universities are loaded with nested programs. */
  programs?: ProgramRecord[];
};

export function universitySlugFromName(name: string): string {
  return regionIdFromName(name);
}
