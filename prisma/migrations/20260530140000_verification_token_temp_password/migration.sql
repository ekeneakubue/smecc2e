-- Store temporary password on verification token for one-time display after verify
ALTER TABLE "email_verification_tokens" ADD COLUMN IF NOT EXISTS "temp_password" TEXT;
