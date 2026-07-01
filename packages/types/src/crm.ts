export interface Contact {
  _id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "lost";
export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "lost",
];

export interface Lead {
  _id: string;
  tenantId: string;
  name: string;
  email?: string;
  company?: string;
  source?: string;
  status: LeadStatus;
  score: number;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage =
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";
export const DEAL_STAGES: DealStage[] = [
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

export interface Deal {
  _id: string;
  tenantId: string;
  title: string;
  contactId?: string;
  amount: number;
  currency: string;
  stage: DealStage;
  ownerUserId: string;
  expectedCloseDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
