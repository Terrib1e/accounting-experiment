export type AccountSubtype =
  | 'CASH'
  | 'BANK'
  | 'CURRENT_ASSET'
  | 'FIXED_ASSET'
  | 'INVENTORY'
  | 'ACCOUNTS_RECEIVABLE'
  | 'CURRENT_LIABILITY'
  | 'LONG_TERM_LIABILITY'
  | 'ACCOUNTS_PAYABLE'
  | 'CREDIT_CARD'
  | 'EQUITY'
  | 'RETAINED_EARNINGS'
  | 'INCOME'
  | 'OTHER_INCOME'
  | 'OPERATING_EXPENSE'
  | 'COST_OF_GOODS_SOLD'
  | 'PAYROLL_EXPENSE'
  | 'OTHER_EXPENSE';

export const ACCOUNT_SUBTYPE_OPTIONS: { value: AccountSubtype; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank' },
  { value: 'CURRENT_ASSET', label: 'Current Asset' },
  { value: 'FIXED_ASSET', label: 'Fixed Asset' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'ACCOUNTS_RECEIVABLE', label: 'Accounts Receivable' },
  { value: 'CURRENT_LIABILITY', label: 'Current Liability' },
  { value: 'LONG_TERM_LIABILITY', label: 'Long Term Liability' },
  { value: 'ACCOUNTS_PAYABLE', label: 'Accounts Payable' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'RETAINED_EARNINGS', label: 'Retained Earnings' },
  { value: 'INCOME', label: 'Income' },
  { value: 'OTHER_INCOME', label: 'Other Income' },
  { value: 'OPERATING_EXPENSE', label: 'Operating Expense' },
  { value: 'COST_OF_GOODS_SOLD', label: 'Cost of Goods Sold' },
  { value: 'PAYROLL_EXPENSE', label: 'Payroll Expense' },
  { value: 'OTHER_EXPENSE', label: 'Other Expense' }
];

export interface Account {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  subtype: AccountSubtype;
  active: boolean;
  currency: string;
  parentAccountId?: string;
  children?: Account[];
}

export interface AccountHierarchy {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  subtype: AccountSubtype;
  parentAccountId?: string;
  children?: AccountHierarchy[];
}
