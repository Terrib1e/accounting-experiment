export interface ReportLine {
  accountName: string;
  accountCode?: string;
  balance: number;
  children?: ReportLine[];
}

export interface FinancialReport {
  reportName: string;
  startDate?: string;
  endDate?: string;
  sections: { [key: string]: ReportLine[] };
  summary: { [key: string]: number };
}
