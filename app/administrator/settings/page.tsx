import { DashboardSettings } from "../../components/dashboard-settings";

export const metadata = {
  title: "Settings | Administrator | SMECC2E",
  description: "Update your profile photo and password.",
};

export const dynamic = "force-dynamic";

export default function AdministratorSettingsPage() {
  return <DashboardSettings />;
}
