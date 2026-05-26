import { CoordinatorRegions } from "../../components/coordinator-regions";

export const metadata = {
  title: "Regions | Coordinator | SMECC2E",
  description: "SMECC2E coordinator dashboard regional applicant breakdown.",
};

export const dynamic = "force-dynamic";

export default function CoordinatorRegionsPage() {
  return <CoordinatorRegions />;
}
