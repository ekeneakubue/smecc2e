import { randomBytes } from "crypto";

export type VerificationToken = {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
};

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

const globalStore = globalThis as typeof globalThis & {
  __smecc2eVerificationTokens?: Map<string, VerificationToken>;
  __smecc2eVerifiedEmails?: Set<string>;
};

function tokens(): Map<string, VerificationToken> {
  if (!globalStore.__smecc2eVerificationTokens) {
    globalStore.__smecc2eVerificationTokens = new Map();
  }
  return globalStore.__smecc2eVerificationTokens;
}

function verifiedEmails(): Set<string> {
  if (!globalStore.__smecc2eVerifiedEmails) {
    globalStore.__smecc2eVerifiedEmails = new Set();
  }
  return globalStore.__smecc2eVerifiedEmails;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function createVerificationToken(email: string): VerificationToken {
  const normalized = normalizeEmail(email);
  const now = Date.now();
  const record: VerificationToken = {
    token: randomBytes(32).toString("hex"),
    email: normalized,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + TOKEN_TTL_MS).toISOString(),
  };

  for (const [key, value] of tokens()) {
    if (value.email === normalized) tokens().delete(key);
  }

  tokens().set(record.token, record);
  return record;
}

export function consumeVerificationToken(
  token: string
): { email: string } | { error: string } {
  const record = tokens().get(token);
  if (!record) return { error: "Invalid or expired verification link." };
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    tokens().delete(token);
    return { error: "This verification link has expired. Please request a new one." };
  }

  tokens().delete(token);
  verifiedEmails().add(record.email);
  return { email: record.email };
}

export function isEmailVerified(email: string): boolean {
  return verifiedEmails().has(normalizeEmail(email));
}

export function markEmailVerified(email: string): void {
  verifiedEmails().add(normalizeEmail(email));
}

export function revokeEmailVerification(email: string): void {
  verifiedEmails().delete(normalizeEmail(email));
}
