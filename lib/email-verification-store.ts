import { randomBytes } from "crypto";
import type { ApplicationPayload } from "./application-types";
import { applicantPrimaryEmail } from "./application-types";
import { withPrismaRetry } from "./prisma-errors";
import { getVerifiedEmailFromCookie } from "./verification-session";
import { prisma } from "./prisma";

export type VerificationToken = {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
};

/** Verification links remain valid for 24 hours (override with VERIFICATION_TOKEN_TTL_HOURS). */
export const VERIFICATION_TOKEN_TTL_MS =
  (Number(process.env.VERIFICATION_TOKEN_TTL_HOURS) || 24) * 60 * 60 * 1000;

export const VERIFICATION_TOKEN_TTL_HOURS = Math.round(
  VERIFICATION_TOKEN_TTL_MS / (60 * 60 * 1000)
);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export async function createVerificationToken(
  email: string,
  tempPassword?: string | null
): Promise<VerificationToken> {
  const normalized = normalizeEmail(email);
  const now = Date.now();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now + VERIFICATION_TOKEN_TTL_MS);

  await withPrismaRetry(() =>
    prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({ where: { email: normalized } }),
      prisma.emailVerificationToken.create({
        data: {
          token,
          email: normalized,
          expiresAt,
          tempPassword: tempPassword ?? null,
        },
      }),
    ])
  );

  return {
    token,
    email: normalized,
    createdAt: new Date(now).toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}

export async function consumeVerificationToken(
  token: string
): Promise<
  | { email: string; tempPassword: string | null; alreadyVerified: boolean }
  | { error: string; code: "expired" | "not_found" }
> {
  const trimmed = token.trim();
  if (!trimmed) {
    return {
      error: "Invalid or expired verification link.",
      code: "not_found",
    };
  }

  const record = await withPrismaRetry(() =>
    prisma.emailVerificationToken.findUnique({
      where: { token: trimmed },
    })
  );

  if (!record) {
    return {
      error: "Invalid or expired verification link.",
      code: "not_found",
    };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerificationToken
      .delete({ where: { token: trimmed } })
      .catch(() => {});
    return {
      error: `This verification link has expired. Links are valid for ${VERIFICATION_TOKEN_TTL_HOURS} hours. Please request a new one.`,
      code: "expired",
    };
  }

  const alreadyVerified = await isEmailVerified(record.email);

  await withPrismaRetry(() =>
    prisma.verifiedApplicantEmail.upsert({
      where: { email: record.email },
      create: { email: record.email },
      update: { verifiedAt: new Date() },
    })
  );

  return {
    email: record.email,
    tempPassword: record.tempPassword,
    alreadyVerified,
  };
}

export async function isEmailVerified(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const row = await prisma.verifiedApplicantEmail.findUnique({
    where: { email: normalized },
  });
  return Boolean(row);
}

/** Accepts DB verification or the httpOnly session cookie from the verify link. */
export async function isApplicantEmailVerifiedForSubmit(
  payload: ApplicationPayload
): Promise<boolean> {
  const candidates = new Set<string>();
  const registration = normalizeEmail(payload.email ?? "");
  const primary = normalizeEmail(applicantPrimaryEmail(payload) ?? "");
  if (registration) candidates.add(registration);
  if (primary) candidates.add(primary);

  for (const email of candidates) {
    if (await isEmailVerified(email)) {
      return true;
    }
  }

  const cookieEmail = await getVerifiedEmailFromCookie();
  if (cookieEmail && candidates.has(cookieEmail)) {
    await markEmailVerified(cookieEmail);
    return true;
  }

  return false;
}

export async function markEmailVerified(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  await prisma.verifiedApplicantEmail.upsert({
    where: { email: normalized },
    create: { email: normalized },
    update: { verifiedAt: new Date() },
  });
}

export async function revokeEmailVerification(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  await prisma.verifiedApplicantEmail.deleteMany({
    where: { email: normalized },
  });
}
