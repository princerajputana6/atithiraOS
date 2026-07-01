export type InvoiceStatus = "draft" | "sent" | "paid" | "void";
export const INVOICE_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "void"];

export interface Invoice {
  _id: string;
  tenantId: string;
  number: string;
  customerName: string;
  amount: number; // pre-tax subtotal
  taxRate: number; // percent, e.g. 18 for GST 18%
  taxAmount: number;
  total: number;
  currency: string;
  status: InvoiceStatus;
  dueDate?: Date | null;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id: string;
  tenantId: string;
  invoiceId: string;
  amount: number;
  method: string;
  paidAt: Date;
  createdAt: Date;
}

export type ExpenseStatus = "pending" | "approved" | "rejected";
export const EXPENSE_STATUSES: ExpenseStatus[] = ["pending", "approved", "rejected"];

export interface Expense {
  _id: string;
  tenantId: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  status: ExpenseStatus;
  submittedByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ------------------------------ General Ledger ----------------------------- */

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface Account {
  _id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  createdAt: Date;
}

/** Default chart of accounts seeded for every tenant — a small, fixed set
 * covers the postings this kernel makes today (invoicing, GST, expenses).
 * Tenants needing more accounts extend this later via the GL API. */
export const DEFAULT_CHART_OF_ACCOUNTS: Omit<Account, "_id" | "tenantId" | "createdAt">[] = [
  { code: "1000", name: "Accounts Receivable", type: "asset" },
  { code: "1100", name: "Cash & Bank", type: "asset" },
  { code: "2000", name: "Accounts Payable", type: "liability" },
  { code: "2100", name: "GST Payable", type: "liability" },
  { code: "3000", name: "Owner's Equity", type: "equity" },
  { code: "4000", name: "Sales Revenue", type: "revenue" },
  { code: "5000", name: "Operating Expenses", type: "expense" },
];

export interface JournalLine {
  accountCode: string;
  debit: number;
  credit: number;
}

/** One double-entry posting — `lines` must balance (sum debit === sum credit). */
export interface JournalEntry {
  _id: string;
  tenantId: string;
  date: Date;
  memo: string;
  sourceType: "invoice" | "payment" | "expense" | "manual";
  sourceId: string;
  lines: JournalLine[];
  createdAt: Date;
}

export interface TrialBalanceRow {
  accountCode: string;
  accountName: string;
  type: AccountType;
  debit: number;
  credit: number;
}
