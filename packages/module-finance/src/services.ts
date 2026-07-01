import { getTenantContext } from "@atithira/db";
import { publishEvent } from "@atithira/core-events";
import type { Invoice, Payment, Expense } from "@atithira/types";
import {
  getInvoiceRepository,
  getPaymentRepository,
  getExpenseRepository,
} from "./repositories";
import { postJournalEntry } from "./gl-service";

function requireCtx() {
  const ctx = getTenantContext();
  if (!ctx?.tenantId) throw new Error("Missing tenant context");
  return ctx;
}

/* ------------------------------ Invoices ----------------------------- */

export interface CreateInvoiceInput {
  customerName: string;
  amount: number;
  taxRate?: number;
  currency?: string;
  dueDate?: string;
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const ctx = requireCtx();
  const repo = await getInvoiceRepository();
  const taxRate = input.taxRate ?? 18;
  const taxAmount = Math.round((input.amount * taxRate) / 100);
  const total = input.amount + taxAmount;
  const number = `INV-${Date.now().toString().slice(-8)}`;
  const invoice = await repo.insertOne({
    number,
    customerName: input.customerName,
    amount: input.amount,
    taxRate,
    taxAmount,
    total,
    currency: input.currency ?? "INR",
    status: "sent",
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    ownerUserId: ctx.userId ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Invoice, "_id" | "tenantId">);

  await postJournalEntry(`Invoice ${number} issued`, "invoice", invoice._id, [
    { accountCode: "1000", debit: total, credit: 0 },
    { accountCode: "4000", debit: 0, credit: input.amount },
    ...(taxAmount > 0
      ? [{ accountCode: "2100", debit: 0, credit: taxAmount }]
      : []),
  ]);

  return invoice;
}

export async function listInvoices(): Promise<Invoice[]> {
  return (await getInvoiceRepository()).list();
}

/** Records a payment, marks the invoice paid, and emits finance/invoice.paid. */
export async function payInvoice(
  invoiceId: string,
  method = "manual",
): Promise<void> {
  const ctx = requireCtx();
  const invoiceRepo = await getInvoiceRepository();
  const invoice = await invoiceRepo.findById(invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "paid") return;

  const paymentRepo = await getPaymentRepository();
  await paymentRepo.insertOne({
    invoiceId,
    amount: invoice.total,
    method,
    paidAt: new Date(),
    createdAt: new Date(),
  } as Omit<Payment, "_id" | "tenantId">);

  await invoiceRepo.setStatus(invoiceId, "paid");

  await postJournalEntry(`Payment received for ${invoice.number}`, "payment", invoiceId, [
    { accountCode: "1100", debit: invoice.total, credit: 0 },
    { accountCode: "1000", debit: 0, credit: invoice.total },
  ]);

  await publishEvent("finance/invoice.paid", {
    tenantId: ctx.tenantId,
    invoiceId,
    number: invoice.number,
    total: invoice.total,
    currency: invoice.currency,
  });
}

/* ------------------------------ Expenses ----------------------------- */

export interface CreateExpenseInput {
  description: string;
  category: string;
  amount: number;
  currency?: string;
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const ctx = requireCtx();
  const repo = await getExpenseRepository();
  return repo.insertOne({
    description: input.description,
    category: input.category,
    amount: input.amount,
    currency: input.currency ?? "INR",
    status: "pending",
    submittedByUserId: ctx.userId ?? "",
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Omit<Expense, "_id" | "tenantId">);
}

export async function listExpenses(): Promise<Expense[]> {
  return (await getExpenseRepository()).list();
}

export async function decideExpense(
  expenseId: string,
  approve: boolean,
): Promise<void> {
  const ctx = requireCtx();
  const repo = await getExpenseRepository();
  const expense = await repo.findById(expenseId);
  if (!expense) throw new Error("Expense not found");
  await repo.setStatus(expenseId, approve ? "approved" : "rejected");
  if (approve) {
    await postJournalEntry(`Expense approved: ${expense.description}`, "expense", expenseId, [
      { accountCode: "5000", debit: expense.amount, credit: 0 },
      { accountCode: "2000", debit: 0, credit: expense.amount },
    ]);

    await publishEvent("finance/expense.approved", {
      tenantId: ctx.tenantId,
      expenseId,
      amount: expense.amount,
    });
  }
}
