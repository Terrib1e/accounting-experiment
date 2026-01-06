import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancialReport } from '../models/report.model';

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
}
