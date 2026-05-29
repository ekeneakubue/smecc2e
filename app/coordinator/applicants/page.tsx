import { CoordinatorApplicants } from "../../components/coordinator-applicants";

export const metadata = {
  title: "Applicants | Coordinator | SMECC2E",
  description: "Review and manage SMECC2E scholarship applications.",
};

export default async function CoordinatorApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return <CoordinatorApplicants statusFromUrl={status ?? null} />;
}
