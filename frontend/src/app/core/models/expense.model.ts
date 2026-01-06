export interface Expense {
  id: string;
  vendor: { id: string; name: string };
  referenceNumber: string; // Bill #
  date: string;
  dueDate?: string;
  totalAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'VOID';
  currency: string;
  lines: ExpenseLine[];
}

export interface ExpenseLine {
  id?: string;
  description: string;
  amount: number;
  expenseAccount: { id: string; name: string; code: string };
}
