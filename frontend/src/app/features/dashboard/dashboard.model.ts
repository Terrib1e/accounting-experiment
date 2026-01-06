export interface DashboardStats {
  totalRevenue: number;
  outstandingInvoices: number;
  totalExpenses: number;
  netCash: number;
  revenueTrend: string;
  outstandingTrend: string;
  expenseTrend: string;
  netCashTrend: string;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'INVOICE' | 'EXPENSE' | 'JOURNAL' | 'CONTACT' | 'PAYMENT';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  status: string;
  icon: string;
  colorClass: string;
}
