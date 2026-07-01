import { MenuClient } from "@/components/restaurant/menu-client";
import { requireModule } from "@/lib/require-module";

export default async function MenuPage() {
  await requireModule("restaurant");
  return <MenuClient />;
}
