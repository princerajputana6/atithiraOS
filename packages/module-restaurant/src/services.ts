import { randomBytes } from "node:crypto";
import QRCode from "qrcode";
import { getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import type {
  MenuItem,
  MenuCategory,
  RestaurantTable,
  Reservation,
  Order,
  OrderLine,
  OrderType,
  OrderStatus,
  ReservationStatus,
} from "@atithira/types";
import {
  getMenuRepository,
  getTableRepository,
  getReservationRepository,
  getOrderRepository,
} from "./repositories";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

/* -------------------------------- Menu ------------------------------- */

export interface CreateMenuItemInput {
  name: string;
  category: MenuCategory;
  price: number;
  isVeg?: boolean;
  description?: string;
}

export async function createMenuItem(
  input: CreateMenuItemInput,
): Promise<MenuItem> {
  const repo = await getMenuRepository();
  return repo.insertOne({
    name: input.name,
    category: input.category,
    price: input.price,
    isVeg: input.isVeg ?? true,
    available: true,
    description: input.description,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<MenuItem, "_id" | "tenantId">);
}

export async function listMenu(): Promise<MenuItem[]> {
  return (await getMenuRepository()).list();
}

export async function setMenuAvailability(
  id: string,
  available: boolean,
): Promise<void> {
  await (await getMenuRepository()).setAvailability(id, available);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await (await getMenuRepository()).remove(id);
}

/* ------------------------------- Tables ------------------------------ */

export interface CreateTableInput {
  label: string;
  seats: number;
}

export async function createTable(
  input: CreateTableInput,
): Promise<RestaurantTable> {
  const repo = await getTableRepository();
  return repo.insertOne({
    label: input.label,
    seats: input.seats,
    qrToken: `tbl_${randomBytes(9).toString("hex")}`,
    status: "free",
    createdAt: new Date(),
  } as Omit<RestaurantTable, "_id" | "tenantId">);
}

export interface TableWithQr extends RestaurantTable {
  orderUrl: string;
  qrDataUrl: string;
}

/**
 * Lists tables, each with a scannable QR image (data URL). The QR encodes a
 * public ordering URL for that table — a guest scans it to open the menu and
 * place an order against the table.
 */
export async function listTablesWithQr(baseUrl: string): Promise<TableWithQr[]> {
  const tables = await (await getTableRepository()).list();
  return Promise.all(
    tables.map(async (t) => {
      const orderUrl = `${baseUrl.replace(/\/$/, "")}/order/${t.qrToken}`;
      const qrDataUrl = await QRCode.toDataURL(orderUrl, { width: 240, margin: 1 });
      return { ...t, orderUrl, qrDataUrl };
    }),
  );
}

/* ---------------------------- Reservations --------------------------- */

export interface CreateReservationInput {
  guestName: string;
  phone?: string;
  partySize: number;
  date: string;
  time: string;
  tableId?: string;
  notes?: string;
}

export async function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  const repo = await getReservationRepository();
  return repo.insertOne({
    guestName: input.guestName,
    phone: input.phone,
    partySize: input.partySize,
    date: input.date,
    time: input.time,
    tableId: input.tableId ?? null,
    status: "booked",
    notes: input.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Reservation, "_id" | "tenantId">);
}

export async function listReservations(): Promise<Reservation[]> {
  return (await getReservationRepository()).list();
}

export async function setReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<void> {
  await (await getReservationRepository()).setStatus(id, status);
}

/* ------------------------------- Orders ------------------------------ */

export interface CreateOrderInput {
  type: OrderType;
  tableId?: string;
  items: { menuItemId: string; qty: number }[];
  taxRate?: number;
}

/** Builds an order from menu items (prices resolved server-side), emits placed. */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const ctx = requireCtx();
  if (!input.items?.length) throw new Error("An order needs at least one item");

  const menuRepo = await getMenuRepository();
  const menu = await menuRepo.list();
  const byId = new Map(menu.map((m) => [String(m._id), m]));

  const lines: OrderLine[] = input.items.map((it) => {
    const item = byId.get(it.menuItemId);
    if (!item) throw new Error(`Unknown menu item: ${it.menuItemId}`);
    return { menuItemId: it.menuItemId, name: item.name, qty: it.qty, price: item.price };
  });

  let tableLabel: string | null = null;
  if (input.tableId) {
    const tableRepo = await getTableRepository();
    const tables = await tableRepo.list();
    const table = tables.find((t) => String(t._id) === input.tableId);
    if (table) {
      tableLabel = table.label;
      await tableRepo.setStatus(input.tableId, "occupied");
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const taxRate = input.taxRate ?? 5; // GST 5% for restaurants
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const total = subtotal + taxAmount;

  const orderRepo = await getOrderRepository();
  const order = await orderRepo.insertOne(
    {
      number: `ORD-${Date.now().toString().slice(-8)}`,
      type: input.type,
      tableId: input.tableId ?? null,
      tableLabel,
      items: lines,
      subtotal,
      taxRate,
      taxAmount,
      total,
      currency: "INR",
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<Order, "_id" | "tenantId">,
    { action: "restaurant_order.created" },
  );

  await publishEvent("restaurant/order.placed", {
    tenantId: ctx.tenantId,
    orderId: String(order._id),
    total,
  });

  return order;
}

export async function listOrders(): Promise<Order[]> {
  return (await getOrderRepository()).list();
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const ctx = requireCtx();
  const orderRepo = await getOrderRepository();
  await orderRepo.setStatus(id, status);

  if (status === "paid" || status === "cancelled") {
    const order = await orderRepo.findById(id);
    if (order?.tableId) {
      const tableRepo = await getTableRepository();
      await tableRepo.setStatus(order.tableId, "free");
    }
    if (status === "paid" && order) {
      await publishEvent("restaurant/order.paid", {
        tenantId: ctx.tenantId,
        orderId: id,
        number: order.number,
        total: order.total,
        currency: order.currency,
      });
    }
  }
}
