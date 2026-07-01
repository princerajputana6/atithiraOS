import { RoomsClient } from "@/components/hotel/rooms-client";
import { requireModule } from "@/lib/require-module";

export default async function RoomsPage() {
  await requireModule("hotel");
  return <RoomsClient />;
}
