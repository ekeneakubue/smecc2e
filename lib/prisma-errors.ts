/** Shown when Prisma cannot reach PostgreSQL (Neon down, network, paused DB, etc.). */
export const DATABASE_CONNECTION_MESSAGE =
  "Cannot connect to database now, please check your network and try again.";

const PRISMA_CONNECTION_CODES = new Set(["P1001", "P1002", "P1017"]);

export function isPrismaConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  const prismaErr = err as { code?: string; message?: string };
  if (prismaErr.code && PRISMA_CONNECTION_CODES.has(prismaErr.code)) {
    return true;
  }

  const message =
    typeof prismaErr.message === "string" ? prismaErr.message : String(err);

  return (
    /can't reach database server/i.test(message) ||
    /connection refused/i.test(message) ||
    /database server.*timed out/i.test(message) ||
    /ECONNREFUSED/i.test(message) ||
    /ETIMEDOUT/i.test(message) ||
    /ENOTFOUND/i.test(message)
  );
}

export function toUserFacingDatabaseError(err: unknown): string | null {
  return isPrismaConnectionError(err) ? DATABASE_CONNECTION_MESSAGE : null;
}

export function resolveApiError(err: unknown, fallback: string): string {
  return (
    toUserFacingDatabaseError(err) ??
    (err instanceof Error ? err.message : fallback)
  );
}
