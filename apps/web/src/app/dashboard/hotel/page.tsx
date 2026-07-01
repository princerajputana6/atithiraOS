import Link from "next/link";
import { PageHeader, Card, CardBody } from "@/components/ui";
import { requireModule } from "@/lib/require-module";

const LINKS = [
  { href: "/dashboard/hotel/rooms", title: "Rooms", desc: "Room register, types, nightly rates, and status." },
  { href: "/dashboard/hotel/bookings", title: "Bookings", desc: "Guest bookings with check-in / check-out." },
];

export default async function HotelPage() {
  await requireModule("hotel");
  return (
    <div>
      <PageHeader title="Hotel" description="Manage rooms and guest bookings." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            <Card className="transition hover:shadow-card-hover">
              <CardBody>
                <p className="text-base font-semibold text-slate-900">{l.title}</p>
                <p className="mt-1 text-sm text-slate-500">{l.desc}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
