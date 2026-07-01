/* ------------------------------- Hotel ------------------------------- */

export type RoomStatus = "available" | "occupied" | "maintenance";
export type RoomType = "standard" | "deluxe" | "suite";

export interface Room {
  _id: string;
  tenantId: string;
  number: string;
  type: RoomType;
  ratePerNight: number;
  status: RoomStatus;
  createdAt: Date;
}

export type BookingStatus =
  | "booked"
  | "checked_in"
  | "checked_out"
  | "cancelled";
export const BOOKING_STATUSES: BookingStatus[] = [
  "booked",
  "checked_in",
  "checked_out",
  "cancelled",
];

export interface Booking {
  _id: string;
  tenantId: string;
  guestName: string;
  phone?: string;
  roomId: string;
  roomNumber: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  nights: number;
  ratePerNight: number;
  total: number;
  currency: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------- Clinic ------------------------------ */

export type Gender = "male" | "female" | "other";

export interface Patient {
  _id: string;
  tenantId: string;
  name: string;
  phone?: string;
  gender?: Gender;
  age?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show";
export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
];

export interface Appointment {
  _id: string;
  tenantId: string;
  patientId: string;
  patientName: string;
  practitioner?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  reason?: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------- Retail ------------------------------ */

export interface SaleLine {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Sale {
  _id: string;
  tenantId: string;
  number: string;
  items: SaleLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  paymentMethod: string; // cash / card / upi
  createdAt: Date;
}
