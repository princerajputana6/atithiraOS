import Link from "next/link";
import { PageHeader, Card, CardBody } from "@/components/ui";
import { requireModule } from "@/lib/require-module";

const LINKS = [
  { href: "/dashboard/restaurant/menu", title: "Menu", desc: "Dishes, prices, veg/non-veg, and availability." },
  { href: "/dashboard/restaurant/tables", title: "Tables & QR", desc: "Tables with scannable QR codes for ordering." },
  { href: "/dashboard/restaurant/reservations", title: "Reservations", desc: "Table bookings and guest management." },
  { href: "/dashboard/restaurant/orders", title: "Orders", desc: "Dine-in / takeaway orders, KOT status, and payment." },
];

export default async function RestaurantPage() {
  await requireModule("restaurant");
  return (
    <div>
      <PageHeader
        title="Restaurant"
        description="Run the front of house — menu, QR ordering, reservations, and orders."
      />
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
