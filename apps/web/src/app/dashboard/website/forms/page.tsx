import { FormsClient } from "@/components/website/forms-client";
import { requireModule } from "@/lib/require-module";

export default async function WebsiteFormsPage() {
  await requireModule("website");
  return <FormsClient />;
}
