import { randomBytes } from "crypto";
import { normalizeEmail } from "./email-normalize";
import { withPrismaRetry } from "./prisma-errors";
import { prisma } from "./prisma";
import {
  VERIFICATION_TOKEN_TTL_MS,
} from "./verification-constants";

export type PasswordResetToken = {
  token: string;
  email: string;
  expiresAt: string;
};

export async function createPasswordResetToken(
  email: string
): Promise<PasswordResetToken> {
  const normalized = normalizeEmail(email);
  const now = Date.now();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now + VERIFICATION_TOKEN_TTL_MS);

  await withPrismaRetry(() =>
    prisma.$transaction([
      prisma.applicantPasswordResetToken.deleteMany({
        where: { email: normalized },
      }),
      prisma.applicantPasswordResetToken.create({
        data: {
          token,
          email: normalized,
          expiresAt,
        },
      }),
    ])
  );

  return {
    token,
    email: normalized,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function consumePasswordResetToken(
  token: string
): Promise<
  | { email: string }
  | { error: string; code: "expired" | "not_found" }
> {
  const trimmed = token.trim();
  if (!trimmed) {
    return {
      error: "Invalid or expired reset link.",
      code: "not_found",
    };
  }

  const record = await withPrismaRetry(() =>
    prisma.applicantPasswordResetToken.findUnique({
      where: { token: trimmed },
    })
  );

  if (!record) {
    return {
      error: "Invalid or expired reset link.",
      code: "not_found",
    };
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await withPrismaRetry(() =>
      prisma.applicantPasswordResetToken.delete({
        where: { token: trimmed },
      })
    );
    return {
      error: "This reset link has expired. Request a new one from the login page.",
      code: "expired",
    };
  }

  await withPrismaRetry(() =>
    prisma.applicantPasswordResetToken.delete({
      where: { token: trimmed },
    })
  );

  return { email: record.email };
}

export async function getPasswordResetTokenEmail(
  token: string
): Promise<string | null> {
  const trimmed = token.trim();
  if (!trimmed) return null;

  const record = await withPrismaRetry(() =>
    prisma.applicantPasswordResetToken.findUnique({
      where: { token: trimmed },
      select: { email: true, expiresAt: true },
    })
  );

  if (!record || record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  return record.email;
}
