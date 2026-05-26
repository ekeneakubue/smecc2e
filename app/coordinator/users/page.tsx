import { CoordinatorUsers } from "../../components/coordinator-users";
import { resolveApiError } from "@/lib/prisma-errors";
import { listUsers } from "@/lib/users-service";

export const metadata = {
  title: "Users | Coordinator | SMECC2E",
  description: "SMECC2E coordinator dashboard users.",
};

export const dynamic = "force-dynamic";

export default async function CoordinatorUsersPage() {
  let initialUsers: Awaited<ReturnType<typeof listUsers>> = [];
  let initialLoadError: string | null = null;

  try {
    initialUsers = await listUsers();
  } catch (err) {
    console.error("CoordinatorUsersPage: failed to load users", err);
    initialLoadError = resolveApiError(
      err,
      "Failed to load users from database."
    );
  }

  return (
    <CoordinatorUsers
      initialUsers={initialUsers}
      initialLoadError={initialLoadError}
    />
  );
}
