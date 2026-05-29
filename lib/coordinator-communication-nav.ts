export type CommunicationKnowledgeSection =
  | "announcements"
  | "newsletters"
  | "workshops"
  | "conferences"
  | "media_stories"
  | "documents";

export type CommunicationKnowledgeNavId = CommunicationKnowledgeSection;

export type CommunicationKnowledgeNavItem = {
  id: CommunicationKnowledgeNavId;
  label: string;
  href: string;
  section: CommunicationKnowledgeSection;
};

export const COMMUNICATION_KNOWLEDGE_SECTION_LABELS: Record<
  CommunicationKnowledgeSection,
  string
> = {
  announcements: "Announcements",
  newsletters: "Newsletters",
  workshops: "Workshops",
  conferences: "Conferences",
  media_stories: "Media & Stories",
  documents: "Documents",
};

export function buildCommunicationKnowledgeNav(
  basePath: string
): CommunicationKnowledgeNavItem[] {
  const root = basePath.replace(/\/$/, "");
  const base = `${root}/communication`;

  return (
    Object.keys(
      COMMUNICATION_KNOWLEDGE_SECTION_LABELS
    ) as CommunicationKnowledgeSection[]
  ).map((section) => ({
    id: section,
    label: COMMUNICATION_KNOWLEDGE_SECTION_LABELS[section],
    section,
    href:
      section === "announcements"
        ? base
        : `${base}?section=${section}`,
  }));
}

export function parseCommunicationKnowledgeSection(
  sectionParam: string | null
): CommunicationKnowledgeSection {
  if (
    sectionParam &&
    sectionParam in COMMUNICATION_KNOWLEDGE_SECTION_LABELS &&
    sectionParam !== "announcements"
  ) {
    return sectionParam as CommunicationKnowledgeSection;
  }
  return "announcements";
}

export function isCommunicationKnowledgeSubActive(
  item: CommunicationKnowledgeNavItem,
  pathname: string,
  sectionParam: string | null,
  basePath: string
): boolean {
  const root = basePath.replace(/\/$/, "");
  if (pathname !== `${root}/communication`) return false;
  if (item.section === "announcements") {
    return !sectionParam || sectionParam === "announcements";
  }
  return sectionParam === item.section;
}

export function isCommunicationKnowledgeGroupActive(
  items: CommunicationKnowledgeNavItem[],
  pathname: string,
  sectionParam: string | null,
  basePath: string
): boolean {
  return items.some((item) =>
    isCommunicationKnowledgeSubActive(item, pathname, sectionParam, basePath)
  );
}
