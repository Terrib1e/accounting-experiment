export interface JournalEntry {
  id: string;
  referenceNumber: string;
  description: string;
  entryDate: string;
  status: 'DRAFT' | 'APPROVED' | 'POSTED' | 'VOID' | 'REVERSED';
  lines?: JournalEntryLine[];
  totalDebit?: number;
  totalCredit?: number;
}

export interface JournalEntryLine {
  id?: string;
  accountId: string;
  accountName?: string;
  description: string;
  debit: number;
  credit: number;
}
