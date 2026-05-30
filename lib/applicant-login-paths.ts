export function applicantVerifiedLoginPath(email: string): string {
  const normalized = email.trim().toLowerCase();
  return `/applicant/login?email=${encodeURIComponent(normalized)}&verified=1`;
}

export function applicantLoginPath(email: string): string {
  const normalized = email.trim().toLowerCase();
  return `/applicant/login?email=${encodeURIComponent(normalized)}`;
}

export function applicantPasswordChangedLoginPath(email: string): string {
  const normalized = email.trim().toLowerCase();
  return `/applicant/login?email=${encodeURIComponent(normalized)}&password_changed=1`;
}

export const APPLICANT_LOGIN_PATH = "/applicant/login";
export const APPLICANT_FORGOT_PASSWORD_PATH = "/applicant/forgot-password";
export const APPLICANT_RESET_PASSWORD_PATH = "/applicant/reset-password";
