export interface Invoice {
  id: string;
  invoiceNumber: string;
  contact: { id: string; name: string };
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID' | 'VOID';
  currency: string;
  reference?: string;
  notes?: string;
  lines: InvoiceLine[];
}

export interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  revenueAccount: { id: string; name: string; code: string };
  taxRate?: { id: string; name: string; rate: number };
}
