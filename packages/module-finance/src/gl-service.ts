import type { JournalEntry, JournalLine, TrialBalanceRow } from "@atithira/types";
import {
  getAccountRepository,
  getJournalEntryRepository,
} from "./repositories";

/**
 * Posts a balanced double-entry journal entry. Throws if the lines don't
 * balance — an unbalanced GL is worse than no GL, so this fails closed
 * rather than silently posting a broken ledger.
 */
export async function postJournalEntry(
  memo: string,
  sourceType: JournalEntry["sourceType"],
  sourceId: string,
  lines: JournalLine[],
): Promise<JournalEntry> {
  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  if (Math.round(totalDebit) !== Math.round(totalCredit)) {
    throw new Error(
      `Journal entry does not balance: debit ${totalDebit} != credit ${totalCredit}`,
    );
  }

  const accountRepo = await getAccountRepository();
  await accountRepo.ensureSeeded();

  const journalRepo = await getJournalEntryRepository();
  return journalRepo.insertOne(
    {
      date: new Date(),
      memo,
      sourceType,
      sourceId,
      lines,
      createdAt: new Date(),
    } as Omit<JournalEntry, "_id" | "tenantId">,
    { action: "journal_entry.posted" },
  );
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  return (await getJournalEntryRepository()).list();
}

export async function listAccounts() {
  const accountRepo = await getAccountRepository();
  await accountRepo.ensureSeeded();
  return accountRepo.list();
}

/** Sums debits/credits per account across every posted entry. Balance sheet
 * and P&L are just filtered/summed views of this same row set. */
export async function getTrialBalance(): Promise<TrialBalanceRow[]> {
  const [accounts, entries] = await Promise.all([
    listAccounts(),
    listJournalEntries(),
  ]);

  const totals = new Map<string, { debit: number; credit: number }>();
  for (const account of accounts) {
    totals.set(account.code, { debit: 0, credit: 0 });
  }
  for (const entry of entries) {
    for (const line of entry.lines) {
      const t = totals.get(line.accountCode);
      if (!t) continue;
      t.debit += line.debit;
      t.credit += line.credit;
    }
  }

  return accounts.map((account) => ({
    accountCode: account.code,
    accountName: account.name,
    type: account.type,
    debit: totals.get(account.code)?.debit ?? 0,
    credit: totals.get(account.code)?.credit ?? 0,
  }));
}
