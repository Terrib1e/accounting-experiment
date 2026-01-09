export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  category: 'SYSTEM' | 'INVOICE' | 'EXPENSE' | 'PAYMENT' | 'JOB' | 'APPROVAL' | 'REMINDER';
  read: boolean;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  createdAt: string;
}
