import type { ApplicationPayload } from "./application-types";

export const APPLICATION_DOCUMENT_FIELDS = {
  profile: "profile",
  passport: "passportFileName",
  disadvantagedDoc: "disadvantagedDocFileName",
  academicCertificates: "academicCertificatesFileName",
  academicTranscripts: "academicTranscriptsFileName",
  proofOfRegistration: "proofOfRegistrationFileName",
  proofOfCoursework: "proofOfCourseworkFileName",
  cv: "cvFileName",
  publications: "publicationsFileName",
  studyResearchPlan: "studyResearchPlanFileName",
  researchProposal: "researchProposalFileName",
  languageCertificate: "languageCertificateFileName",
  referenceLetters: "referenceLettersFileName",
  graduateAdmissionProof: "graduateAdmissionProofFileName",
  staffEmploymentProof: "staffEmploymentProofFileName",
  staffHostCommitmentLetter: "staffHostCommitmentLetterFileName",
  medicalFitnessDeclaration: "medicalFitnessDeclarationFileName",
  previousScholarshipDeclaration: "previousScholarshipDeclarationFileName",
} as const;

export type ApplicationDocumentField = keyof typeof APPLICATION_DOCUMENT_FIELDS;

const PAYLOAD_FILE_KEYS = new Set(
  Object.values(APPLICATION_DOCUMENT_FIELDS).filter((value) => value !== "profile")
);

export function isApplicationDocumentField(
  field: string
): field is ApplicationDocumentField {
  return field in APPLICATION_DOCUMENT_FIELDS;
}

export function documentDisplayName(storedName: string): string {
  const idx = storedName.indexOf("__");
  return idx >= 0 ? storedName.slice(idx + 2) : storedName;
}

export function buildStoredDocumentName(originalName: string): string {
  const safe = originalName.replace(/[^\w.\-() +]/g, "_");
  return `${Date.now()}-${crypto.randomUUID().slice(0, 8)}__${safe}`;
}

export function getStoredDocumentName(
  application: ApplicationPayload,
  field: ApplicationDocumentField
): string | null {
  if (field === "profile") {
    return application.profileUploaded ? "profile" : null;
  }

  const payloadKey = APPLICATION_DOCUMENT_FIELDS[field];
  const value = application[payloadKey as keyof ApplicationPayload];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function applicationDocumentUrl(
  applicationId: string,
  field: ApplicationDocumentField
): string {
  return `/api/applications/${encodeURIComponent(applicationId)}/documents?field=${encodeURIComponent(field)}`;
}

export function payloadKeyForDocumentField(
  field: ApplicationDocumentField
): keyof ApplicationPayload | null {
  if (field === "profile") return null;
  const key = APPLICATION_DOCUMENT_FIELDS[field];
  return PAYLOAD_FILE_KEYS.has(key) ? (key as keyof ApplicationPayload) : null;
}
