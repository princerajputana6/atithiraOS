import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type {
  MenuItem,
  RestaurantTable,
  Reservation,
  Order,
  MenuCategory,
  TableStatus,
  ReservationStatus,
  OrderStatus,
} from "@atithira/types";

export class MenuRepository extends TenantScopedRepository<MenuItem> {
  protected readonly targetType = "menu_item";
  constructor(collection: Collection<MenuItem>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  setAvailability(id: string, available: boolean) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { available, updatedAt: new Date() } },
      { action: "menu_item.availability" },
    );
  }
  remove(id: string) {
    return this.deleteOne({ _id: new ObjectId(id) } as never, {
      action: "menu_item.deleted",
    });
  }
}

export class TableRepository extends TenantScopedRepository<RestaurantTable> {
  protected readonly targetType = "restaurant_table";
  constructor(collection: Collection<RestaurantTable>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findByQrTokenUnscoped(qrToken: string) {
    return this.collection.findOne({ qrToken } as Filter<RestaurantTable>);
  }
  setStatus(id: string, status: TableStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status } },
      { action: `restaurant_table.${status}` },
    );
  }
}

export class ReservationRepository extends TenantScopedRepository<Reservation> {
  protected readonly targetType = "reservation";
  constructor(collection: Collection<Reservation>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  setStatus(id: string, status: ReservationStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `reservation.${status}` },
    );
  }
}

export class OrderRepository extends TenantScopedRepository<Order> {
  protected readonly targetType = "restaurant_order";
  constructor(collection: Collection<Order>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  setStatus(id: string, status: OrderStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `restaurant_order.${status}` },
    );
  }
}

export async function getMenuRepository() {
  const db = await getDb();
  return new MenuRepository(db.collection<MenuItem>("restaurant_menu_items"));
}
export async function getTableRepository() {
  const db = await getDb();
  return new TableRepository(db.collection<RestaurantTable>("restaurant_tables"));
}
export async function getReservationRepository() {
  const db = await getDb();
  return new ReservationRepository(
    db.collection<Reservation>("restaurant_reservations"),
  );
}
export async function getOrderRepository() {
  const db = await getDb();
  return new OrderRepository(db.collection<Order>("restaurant_orders"));
}

export type { MenuCategory };
