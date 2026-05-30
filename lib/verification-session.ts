import { cookies } from "next/headers";
import { normalizeEmail } from "./email-normalize";
import { VERIFIED_EMAIL_COOKIE } from "./verification-constants";

export { VERIFIED_EMAIL_COOKIE, VERIFY_TEMP_PASSWORD_COOKIE } from "./verification-constants";

export async function getVerifiedEmailFromCookie(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(VERIFIED_EMAIL_COOKIE)?.value;
  return value ? normalizeEmail(value) : null;
}

export function verifiedEmailCookieOptions(email: string) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    value: normalizeEmail(email),
  };
}
