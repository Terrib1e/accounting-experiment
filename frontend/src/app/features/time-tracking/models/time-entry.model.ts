export interface TimeEntry {
  id: string;
  description: string;

  jobId?: string;
  jobName?: string;

  contactId?: string;
  contactName?: string;

  userId: string;
  userName?: string;

  date: string;
  startTime?: string;
  endTime?: string;

  durationMinutes: number;
  formattedDuration?: string;

  billable: boolean;
  billableRate?: number;
  billableAmount?: number;

  status: TimeEntryStatus;
  billed: boolean;
  invoiceId?: string;

  timerRunning: boolean;
  timerStartedAt?: string;

  createdAt?: string;
  updatedAt?: string;
}

export type TimeEntryStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'BILLED' | 'WRITTEN_OFF';

export interface CreateTimeEntryRequest {
  description: string;
  jobId?: string;
  contactId?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  billable?: boolean;
  billableRate?: number;
}

export interface TimerRequest {
  description: string;
  jobId?: string;
  contactId?: string;
}

export interface TimeEntrySummary {
  totalMinutesToday: number;
  totalMinutesThisWeek: number;
  totalMinutesThisMonth: number;
  billableAmountThisWeek: number;
  billableAmountThisMonth: number;
  unbilledCount: number;
  unbilledAmount: number;
  hasRunningTimer: boolean;
  runningTimer?: TimeEntry;
}
