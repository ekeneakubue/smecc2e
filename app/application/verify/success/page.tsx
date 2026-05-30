import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VerifyEmailSuccess } from "../../../components/verify-email-success";
import { VERIFY_TEMP_PASSWORD_COOKIE } from "@/lib/verification-session";

type VerifySuccessPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifySuccessPage({
  searchParams,
}: VerifySuccessPageProps) {
  const { email } = await searchParams;
  const normalized = email?.trim().toLowerCase();

  if (!normalized) {
    redirect("/applicant/login?error=missing_token");
  }

  const cookieStore = await cookies();
  const tempPassword =
    cookieStore.get(VERIFY_TEMP_PASSWORD_COOKIE)?.value ?? null;
  cookieStore.delete(VERIFY_TEMP_PASSWORD_COOKIE);

  return (
    <VerifyEmailSuccess email={normalized} tempPassword={tempPassword} />
  );
}
