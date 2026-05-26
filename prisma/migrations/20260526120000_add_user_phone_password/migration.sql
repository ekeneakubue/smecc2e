-- Add phone and password columns for existing deployments
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone_number" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" TEXT NOT NULL DEFAULT '';
