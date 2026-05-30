/** Verification links remain valid for 24 hours (override with VERIFICATION_TOKEN_TTL_HOURS). */
export const VERIFICATION_TOKEN_TTL_MS =
  (Number(process.env.VERIFICATION_TOKEN_TTL_HOURS) || 24) * 60 * 60 * 1000;

export const VERIFICATION_TOKEN_TTL_HOURS = Math.round(
  VERIFICATION_TOKEN_TTL_MS / (60 * 60 * 1000)
);

export const VERIFIED_EMAIL_COOKIE = "smecc2e_verified_email";
export const VERIFY_TEMP_PASSWORD_COOKIE = "smecc2e_verify_temp_pw";
