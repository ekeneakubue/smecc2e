import { access, readdir } from "fs/promises";
import path from "path";
import {
  documentDisplayName,
  type ApplicationDocumentField,
} from "./application-documents";

export function applicationDocumentsDir(applicationRef: string): string {
  return path.join(
    process.cwd(),
    "public",
    "uploads",
    "applications",
    applicationRef
  );
}

export function storedDocumentPath(
  applicationRef: string,
  storedName: string
): string {
  return path.join(applicationDocumentsDir(applicationRef), storedName);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function findProfileDocumentPath(
  applicationRef: string
): Promise<string | null> {
  const dir = applicationDocumentsDir(applicationRef);
  try {
    const files = await readdir(dir);
    const match = files.find((file) => file.startsWith("profile"));
    return match ? path.join(dir, match) : null;
  } catch {
    return null;
  }
}

export async function resolveDocumentPath(
  applicationRef: string,
  storedName: string,
  field: ApplicationDocumentField
): Promise<string | null> {
  if (field === "profile") {
    return findProfileDocumentPath(applicationRef);
  }

  const direct = storedDocumentPath(applicationRef, storedName);
  if (await fileExists(direct)) {
    return direct;
  }

  const dir = applicationDocumentsDir(applicationRef);
  try {
    const files = await readdir(dir);
    const lowerStored = storedName.toLowerCase();
    const match = files.find(
      (file) =>
        file === storedName ||
        file.toLowerCase() === lowerStored ||
        file.endsWith(`__${storedName}`) ||
        documentDisplayName(file) === storedName ||
        documentDisplayName(file).toLowerCase() === lowerStored
    );
    return match ? path.join(dir, match) : null;
  } catch {
    return null;
  }
}

export function mimeTypeForFileName(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  return map[ext] ?? "application/octet-stream";
}
