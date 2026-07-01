import { TenantScopedRepository, getDb } from "@atithira/db";
import { ObjectId, type Collection, type Filter } from "mongodb";
import { ensureTextIndex, textSearch } from "@atithira/core-search";
import type {
  Invoice,
  Payment,
  Expense,
  InvoiceStatus,
  ExpenseStatus,
  Account,
  JournalEntry,
} from "@atithira/types";
import { DEFAULT_CHART_OF_ACCOUNTS } from "@atithira/types";

export class InvoiceRepository extends TenantScopedRepository<Invoice> {
  protected readonly targetType = "invoice";
  constructor(collection: Collection<Invoice>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  async ensureSearchIndex() {
    await ensureTextIndex(this.collection, { number: "text", customerName: "text" });
  }
  search(query: string) {
    return textSearch(this.collection, this.requireTenantId(), query);
  }
  setStatus(id: string, status: InvoiceStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `invoice.${status}` },
    );
  }
  async count() {
    return (await this.list()).length;
  }
}

export class PaymentRepository extends TenantScopedRepository<Payment> {
  protected readonly targetType = "payment";
  constructor(collection: Collection<Payment>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
}

export class ExpenseRepository extends TenantScopedRepository<Expense> {
  protected readonly targetType = "expense";
  constructor(collection: Collection<Expense>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  findById(id: string) {
    return this.findOne({ _id: new ObjectId(id) } as never);
  }
  setStatus(id: string, status: ExpenseStatus) {
    return this.updateOne(
      { _id: new ObjectId(id) } as never,
      { $set: { status, updatedAt: new Date() } },
      { action: `expense.${status}` },
    );
  }
}

export class AccountRepository extends TenantScopedRepository<Account> {
  protected readonly targetType = "account";
  constructor(collection: Collection<Account>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
  /** Idempotent — safe to call before every GL read/write. */
  async ensureSeeded(): Promise<void> {
    const existing = await this.list();
    if (existing.length > 0) return;
    for (const account of DEFAULT_CHART_OF_ACCOUNTS) {
      await this.insertOne(
        { ...account, createdAt: new Date() } as Omit<Account, "_id" | "tenantId">,
        { skipAudit: true },
      );
    }
  }
}

export class JournalEntryRepository extends TenantScopedRepository<JournalEntry> {
  protected readonly targetType = "journal_entry";
  constructor(collection: Collection<JournalEntry>) {
    super(collection);
  }
  list() {
    return this.find({});
  }
}

export async function getInvoiceRepository() {
  const db = await getDb();
  return new InvoiceRepository(db.collection<Invoice>("finance_invoices"));
}
export async function getPaymentRepository() {
  const db = await getDb();
  return new PaymentRepository(db.collection<Payment>("finance_payments"));
}
export async function getExpenseRepository() {
  const db = await getDb();
  return new ExpenseRepository(db.collection<Expense>("finance_expenses"));
}
export async function getAccountRepository() {
  const db = await getDb();
  return new AccountRepository(db.collection<Account>("finance_accounts"));
}
export async function getJournalEntryRepository() {
  const db = await getDb();
  return new JournalEntryRepository(
    db.collection<JournalEntry>("finance_journal_entries"),
  );
}
