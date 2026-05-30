import type { DashboardUser } from "./dashboard-users";
import { hashPassword, validatePassword, verifyPassword } from "./password";
import { mapPrismaUser } from "./prisma-mappers";
import { prisma } from "./prisma";

const PROFILE_IMAGE_PATH = /^\/uploads\/users\/[\w.-]+$/;

export function isValidUserProfileImageUrl(url: string | null): boolean {
  if (url === null) return true;
  return PROFILE_IMAGE_PATH.test(url);
}

export async function updateOwnProfileImage(
  publicId: string,
  profileImageUrl: string | null
): Promise<DashboardUser> {
  if (!isValidUserProfileImageUrl(profileImageUrl)) {
    throw new Error("Invalid profile image URL");
  }

  const updated = await prisma.user.update({
    where: { publicId },
    data: { profileImageUrl },
  });
  return mapPrismaUser(updated);
}

export async function changeOwnPassword(
  publicId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const row = await prisma.user.findUnique({ where: { publicId } });
  if (!row) throw new Error("User not found");

  const valid = await verifyPassword(currentPassword, row.passwordHash);
  if (!valid) throw new Error("Current password is incorrect");

  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new Error(passwordError);

  await prisma.user.update({
    where: { publicId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
}
