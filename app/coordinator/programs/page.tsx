import { CoordinatorPrograms } from "../../components/coordinator-programs";

export const metadata = {
  title: "Programs | Coordinator | SMECC2E",
  description: "SMECC2E academic programmes by partner institution.",
};

export const dynamic = "force-dynamic";

export default function CoordinatorProgramsPage() {
  return <CoordinatorPrograms />;
}
