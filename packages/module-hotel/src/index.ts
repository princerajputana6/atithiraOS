import { TenantScopedRepository, getDb, getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import { ObjectId, type Collection, type Filter } from "mongodb";
import type { Room, Booking, RoomType, RoomStatus, BookingStatus } from "@atithira/types";

export const HOTEL_PERMISSIONS = {
  ROOM_MANAGE: "hotel.room.manage",
  BOOKING_READ: "hotel.booking.read",
  BOOKING_WRITE: "hotel.booking.write",
} as const;

class RoomRepository extends TenantScopedRepository<Room> {
  protected readonly targetType = "room";
  constructor(c: Collection<Room>) {
    super(c);
  }
  list() {
    return this.find({});
  }
  setStatus(id: string, status: RoomStatus) {
    return this.updateOne({ _id: new ObjectId(id) } as never, { $set: { status } }, { action: `room.${status}` });
  }
}
class BookingRepository extends TenantScopedRepository<Booking> {
  protected readonly targetType = "booking";
  constructor(c: Collection<Booking>) {
    super(c);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  setStatus(id: string, status: BookingStatus) {
    return this.updateOne({ _id: new ObjectId(id) } as never, { $set: { status, updatedAt: new Date() } }, { action: `booking.${status}` });
  }
}

async function rooms() {
  return new RoomRepository((await getDb()).collection<Room>("hotel_rooms"));
}
async function bookings() {
  return new BookingRepository((await getDb()).collection<Booking>("hotel_bookings"));
}
function ctx() {
  const c = getTenantContext();
  if (!c?.tenantId) throw new Error("Missing tenant context");
  return c;
}

export interface CreateRoomInput {
  number: string;
  type: RoomType;
  ratePerNight: number;
}
export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const repo = await rooms();
  return repo.insertOne({
    number: input.number,
    type: input.type,
    ratePerNight: input.ratePerNight,
    status: "available",
    createdAt: new Date(),
  } as Omit<Room, "_id" | "tenantId">);
}
export async function listRooms(): Promise<Room[]> {
  return (await rooms()).list();
}

export interface CreateBookingInput {
  guestName: string;
  phone?: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
}
function nightsBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}
export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const c = ctx();
  const roomRepo = await rooms();
  const all = await roomRepo.list();
  const room = all.find((r) => String(r._id) === input.roomId);
  if (!room) throw new Error("Room not found");
  const nights = nightsBetween(input.checkIn, input.checkOut);
  const total = nights * room.ratePerNight;
  const bookingRepo = await bookings();
  const booking = await bookingRepo.insertOne(
    {
      guestName: input.guestName,
      phone: input.phone,
      roomId: input.roomId,
      roomNumber: room.number,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      nights,
      ratePerNight: room.ratePerNight,
      total,
      currency: "INR",
      status: "booked",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<Booking, "_id" | "tenantId">,
    { action: "booking.created" },
  );
  await roomRepo.setStatus(input.roomId, "occupied");
  await publishEvent("hotel/booking.created", { tenantId: c.tenantId, bookingId: String(booking._id), total });
  return booking;
}
export async function listBookings(): Promise<Booking[]> {
  return (await bookings()).list();
}
export async function updateBookingStatus(id: string, status: BookingStatus): Promise<void> {
  const bookingRepo = await bookings();
  await bookingRepo.setStatus(id, status);
  if (status === "checked_out" || status === "cancelled") {
    const b = await bookingRepo.findById(id);
    if (b?.roomId) {
      const roomRepo = await rooms();
      await roomRepo.setStatus(b.roomId, "available");
    }
  }
}
