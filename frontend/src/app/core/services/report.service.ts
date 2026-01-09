import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialReport } from '../models/report.model';

export interface AgingBucket {
  label: string;
  daysStart: number;
  daysEnd: number;
  amount: number;
  count: number;
  details: AgingLine[];
}

export interface AgingLine {
  contactId: string;
  contactName: string;
  documentNumber: string;
  documentDate: string;
  dueDate: string;
  daysOverdue: number;
  amount: number;
  currency: string;
}

export interface AgingReport {
  reportType: 'RECEIVABLES' | 'PAYABLES';
  reportDate: string;
  buckets: AgingBucket[];
  totalOutstanding: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/api/v1/reports';

  constructor(private http: HttpClient) {}

  getBalanceSheet(asOfDate?: string): Observable<{data: FinancialReport}> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<{data: FinancialReport}>(`${this.apiUrl}/balance-sheet`, { params });
  }

  getIncomeStatement(startDate: string, endDate: string): Observable<{data: FinancialReport}> {
    let params = new HttpParams()
        .set('startDate', startDate)
        .set('endDate', endDate);
    return this.http.get<{data: FinancialReport}>(`${this.apiUrl}/income-statement`, { params });
  }

  getTrialBalance(asOfDate?: string): Observable<{data: FinancialReport}> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<{data: FinancialReport}>(`${this.apiUrl}/trial-balance`, { params });
  }

  getReceivablesAging(asOfDate?: string): Observable<{data: AgingReport}> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<{data: AgingReport}>(`${this.apiUrl}/aging/receivables`, { params });
  }

  getPayablesAging(asOfDate?: string): Observable<{data: AgingReport}> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<{data: AgingReport}>(`${this.apiUrl}/aging/payables`, { params });
  }

  // ==================== PDF EXPORTS ====================

  exportBalanceSheetPdf(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/balance-sheet/pdf`, { params, responseType: 'blob' });
  }

  exportIncomeStatementPdf(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/income-statement/pdf`, { params, responseType: 'blob' });
  }

  exportTrialBalancePdf(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/trial-balance/pdf`, { params, responseType: 'blob' });
  }

  exportReceivablesAgingPdf(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/aging/receivables/pdf`, { params, responseType: 'blob' });
  }

  exportPayablesAgingPdf(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/aging/payables/pdf`, { params, responseType: 'blob' });
  }

  // ==================== EXCEL EXPORTS ====================

  exportBalanceSheetExcel(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/balance-sheet/excel`, { params, responseType: 'blob' });
  }

  exportIncomeStatementExcel(startDate: string, endDate: string): Observable<Blob> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/income-statement/excel`, { params, responseType: 'blob' });
  }

  exportTrialBalanceExcel(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/trial-balance/excel`, { params, responseType: 'blob' });
  }

  exportReceivablesAgingExcel(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/aging/receivables/excel`, { params, responseType: 'blob' });
  }

  exportPayablesAgingExcel(asOfDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get(`${this.apiUrl}/aging/payables/excel`, { params, responseType: 'blob' });
  }
}
