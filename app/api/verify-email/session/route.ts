import { NextResponse } from "next/server";
import { getVerifiedEmailFromCookie } from "@/lib/verification-session";

/** Returns the verified email from the session cookie (if any). */
export async function GET() {
  const email = await getVerifiedEmailFromCookie();
  return NextResponse.json({ email: email ?? null });
}
