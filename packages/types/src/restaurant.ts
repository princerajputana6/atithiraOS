export type MenuCategory =
  | "starters"
  | "mains"
  | "breads"
  | "rice"
  | "desserts"
  | "beverages"
  | "other";

export const MENU_CATEGORIES: MenuCategory[] = [
  "starters",
  "mains",
  "breads",
  "rice",
  "desserts",
  "beverages",
  "other",
];

export interface MenuItem {
  _id: string;
  tenantId: string;
  name: string;
  category: MenuCategory;
  price: number;
  isVeg: boolean;
  available: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TableStatus = "free" | "occupied" | "reserved";

export interface RestaurantTable {
  _id: string;
  tenantId: string;
  label: string; // e.g. "T1"
  seats: number;
  qrToken: string; // unique; encoded into the table's QR code
  status: TableStatus;
  createdAt: Date;
}

export type ReservationStatus = "booked" | "seated" | "cancelled" | "no_show";
export const RESERVATION_STATUSES: ReservationStatus[] = [
  "booked",
  "seated",
  "cancelled",
  "no_show",
];

export interface Reservation {
  _id: string;
  tenantId: string;
  guestName: string;
  phone?: string;
  partySize: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  tableId?: string | null;
  status: ReservationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderType = "dine_in" | "takeaway";
export type OrderStatus = "open" | "preparing" | "served" | "paid" | "cancelled";
export const ORDER_STATUSES: OrderStatus[] = [
  "open",
  "preparing",
  "served",
  "paid",
  "cancelled",
];

export interface OrderLine {
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
  tenantId: string;
  number: string;
  type: OrderType;
  tableId?: string | null;
  tableLabel?: string | null;
  items: OrderLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}
