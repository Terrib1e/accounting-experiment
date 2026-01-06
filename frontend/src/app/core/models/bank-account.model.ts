export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  currency: string;
  currentBalance: number;
  lastReconciledDate?: string;
}
