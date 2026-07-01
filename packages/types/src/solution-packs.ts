import type { ModuleKey } from "./tenancy";

/**
 * A single dynamic requirement field, rendered by the onboarding form based on
 * the chosen industry. This is the "understand what the client wants" layer —
 * the captured answers are stored on the tenant config and can preset module
 * defaults later.
 */
export interface IntakeField {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "boolean";
  options?: string[]; // for type === "select"
  required?: boolean;
  placeholder?: string;
  help?: string;
}

/**
 * Industry Solution Pack (MASTER_PLAN §7) — pure configuration, no code fork.
 * Picking a pack selects which modules a tenant gets, applies industry
 * terminology and regional defaults, and defines the intake questions that
 * make the onboarding form dynamic per vertical.
 */
export interface SolutionPack {
  key: string;
  label: string;
  tagline: string;
  emoji: string;
  modules: ModuleKey[];
  /** Rename core concepts for the vertical, e.g. contacts → "Guests". */
  terminology: Record<string, string>;
  defaults: { currency: string; locale: string; timezone: string };
  intake: IntakeField[];
}

const INDIA_DEFAULTS = {
  currency: "INR",
  locale: "en-IN",
  timezone: "Asia/Kolkata",
};

export const SOLUTION_PACKS: SolutionPack[] = [
  {
    key: "general",
    label: "General Business",
    tagline: "A balanced set of modules for any SME.",
    emoji: "🏢",
    modules: ["crm", "finance", "people", "projects", "intelligence", "automation"],
    terminology: {},
    defaults: INDIA_DEFAULTS,
    intake: [
      {
        key: "businessType",
        label: "What does the business do?",
        type: "text",
        required: true,
        placeholder: "e.g. Digital marketing agency",
      },
      { key: "teamSize", label: "Approx. team size", type: "number", placeholder: "10" },
    ],
  },
  {
    key: "restaurant",
    label: "Restaurant",
    tagline: "Menu, QR table ordering, reservations, orders, and billing.",
    emoji: "🍽️",
    modules: ["restaurant", "inventory", "procurement", "finance", "intelligence", "automation"],
    terminology: { products: "Ingredients", vendors: "Suppliers" },
    defaults: INDIA_DEFAULTS,
    intake: [
      { key: "seatingCapacity", label: "Seating capacity", type: "number", required: true, placeholder: "60" },
      { key: "tableCount", label: "Number of tables", type: "number", placeholder: "18" },
      {
        key: "cuisineType",
        label: "Primary cuisine",
        type: "select",
        options: ["North Indian", "South Indian", "Chinese", "Continental", "Multi-cuisine", "Cafe / Bakery"],
        required: true,
      },
      { key: "onlineOrdering", label: "Needs online ordering / reservations?", type: "boolean" },
    ],
  },
  {
    key: "hotel",
    label: "Hotel",
    tagline: "Guests, rooms, staff, and finance.",
    emoji: "🏨",
    modules: ["hotel", "finance", "inventory", "people", "intelligence", "automation"],
    terminology: {},
    defaults: INDIA_DEFAULTS,
    intake: [
      { key: "roomCount", label: "Number of rooms", type: "number", required: true, placeholder: "40" },
      {
        key: "starRating",
        label: "Star rating",
        type: "select",
        options: ["Unrated", "1", "2", "3", "4", "5"],
      },
      { key: "hasRestaurant", label: "In-house restaurant?", type: "boolean" },
    ],
  },
  {
    key: "retail",
    label: "Retail / Store",
    tagline: "Customers, stock, suppliers, and POS-style billing.",
    emoji: "🛍️",
    modules: ["retail", "inventory", "procurement", "finance", "intelligence", "automation"],
    terminology: { vendors: "Suppliers" },
    defaults: INDIA_DEFAULTS,
    intake: [
      { key: "storeCount", label: "Number of stores / outlets", type: "number", required: true, placeholder: "2" },
      { key: "avgSkuCount", label: "Approx. product SKUs", type: "number", placeholder: "500" },
      { key: "posNeeded", label: "Needs point-of-sale billing?", type: "boolean" },
    ],
  },
  {
    key: "clinic",
    label: "Clinic / Healthcare",
    tagline: "Patients, practitioners, appointments, and billing.",
    emoji: "🩺",
    modules: ["clinic", "people", "finance", "intelligence", "automation"],
    terminology: { employees: "Practitioners" },
    defaults: INDIA_DEFAULTS,
    intake: [
      { key: "practitionerCount", label: "Number of practitioners", type: "number", required: true, placeholder: "4" },
      { key: "specialties", label: "Specialties", type: "text", placeholder: "e.g. Dental, Orthodontics" },
      { key: "appointmentBooking", label: "Needs appointment booking?", type: "boolean" },
    ],
  },
  {
    key: "professional-services",
    label: "Professional Services",
    tagline: "Clients, projects, timesheets, and invoicing.",
    emoji: "💼",
    modules: ["crm", "projects", "finance", "people", "intelligence", "automation"],
    terminology: { contacts: "Clients" },
    defaults: INDIA_DEFAULTS,
    intake: [
      { key: "teamSize", label: "Team size", type: "number", required: true, placeholder: "12" },
      {
        key: "billingModel",
        label: "How do you bill clients?",
        type: "select",
        options: ["Hourly", "Fixed project", "Monthly retainer"],
        required: true,
      },
    ],
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    tagline: "Inventory, procurement, production, and finance.",
    emoji: "🏭",
    modules: ["inventory", "procurement", "finance", "people", "projects", "intelligence", "automation"],
    terminology: { vendors: "Suppliers" },
    defaults: INDIA_DEFAULTS,
    intake: [
      {
        key: "productionType",
        label: "Production model",
        type: "select",
        options: ["Make-to-stock", "Make-to-order", "Assembly", "Job work"],
        required: true,
      },
      { key: "warehouseCount", label: "Number of warehouses", type: "number", placeholder: "1" },
    ],
  },
];

export function getSolutionPack(key: string): SolutionPack | undefined {
  return SOLUTION_PACKS.find((p) => p.key === key);
}
