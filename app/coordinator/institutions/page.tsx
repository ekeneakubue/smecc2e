import { CoordinatorInstitutions } from "../../components/coordinator-institutions";

export const metadata = {
  title: "Institutions | Coordinator | SMECC2E",
  description: "SMECC2E coordinator dashboard host institutions and programmes.",
};

export const dynamic = "force-dynamic";

export default function CoordinatorInstitutionsPage() {
  return <CoordinatorInstitutions />;
}
