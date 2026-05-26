/** Thematic areas for institutions and applicant mobility forms. */
export const THEMATIC_AREA_OPTIONS = [
  "Sustainable Energy",
  "Sustainable Energy Materials",
  "Energy Policy & Regulation",
  "Climate Change Studies",
  "Energy Economics/Energy Finance",
  "Environmental Studies",
] as const;

export type ThematicAreaOption = (typeof THEMATIC_AREA_OPTIONS)[number];

/** @deprecated Use THEMATIC_AREA_OPTIONS */
export const DEFAULT_THEMATIC_AREAS = THEMATIC_AREA_OPTIONS;
