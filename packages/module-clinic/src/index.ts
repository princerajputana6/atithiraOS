import { TenantScopedRepository, getDb, getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import { ObjectId, type Collection } from "mongodb";
import type { Patient, Appointment, Gender, AppointmentStatus } from "@atithira/types";

export const CLINIC_PERMISSIONS = {
  PATIENT_READ: "clinic.patient.read",
  PATIENT_WRITE: "clinic.patient.write",
  APPOINTMENT_READ: "clinic.appointment.read",
  APPOINTMENT_WRITE: "clinic.appointment.write",
} as const;

class PatientRepository extends TenantScopedRepository<Patient> {
  protected readonly targetType = "patient";
  constructor(c: Collection<Patient>) {
    super(c);
  }
  list() {
    return this.find({});
  }
}
class AppointmentRepository extends TenantScopedRepository<Appointment> {
  protected readonly targetType = "appointment";
  constructor(c: Collection<Appointment>) {
    super(c);
  }
  list() {
    return this.find({});
  }
  setStatus(id: string, status: AppointmentStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `appointment.${status}` },
    );
  }
}

async function patients() {
  return new PatientRepository((await getDb()).collection<Patient>("clinic_patients"));
}
async function appointments() {
  return new AppointmentRepository((await getDb()).collection<Appointment>("clinic_appointments"));
}
function ctx() {
  const c = getTenantContext();
  if (!c?.tenantId) throw new Error("Missing tenant context");
  return c;
}

export interface CreatePatientInput {
  name: string;
  phone?: string;
  gender?: Gender;
  age?: number;
  notes?: string;
}
export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const repo = await patients();
  return repo.insertOne({
    name: input.name,
    phone: input.phone,
    gender: input.gender,
    age: input.age,
    notes: input.notes,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Patient, "_id" | "tenantId">);
}
export async function listPatients(): Promise<Patient[]> {
  return (await patients()).list();
}

export interface CreateAppointmentInput {
  patientId: string;
  practitioner?: string;
  date: string;
  time: string;
  reason?: string;
}
export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const c = ctx();
  const patientRepo = await patients();
  const all = await patientRepo.list();
  const patient = all.find((p) => String(p._id) === input.patientId);
  if (!patient) throw new Error("Patient not found");
  const repo = await appointments();
  const appt = await repo.insertOne(
    {
      patientId: input.patientId,
      patientName: patient.name,
      practitioner: input.practitioner,
      date: input.date,
      time: input.time,
      reason: input.reason,
      status: "scheduled",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Omit<Appointment, "_id" | "tenantId">,
    { action: "appointment.booked" },
  );
  await publishEvent("clinic/appointment.booked", {
    tenantId: c.tenantId,
    appointmentId: String(appt._id),
    patientId: input.patientId,
  });
  return appt;
}
export async function listAppointments(): Promise<Appointment[]> {
  return (await appointments()).list();
}
export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<void> {
  await (await appointments()).setStatus(id, status);
}
