import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

export interface ExpenseFilters {
  search?: string;
  status?: string[];
  vendorId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:8080/api/v1/expenses';

  constructor(private http: HttpClient) {}

  getExpenses(filters?: ExpenseFilters): Observable<{data: { content: Expense[] }}> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status?.length) {
        filters.status.forEach(s => params = params.append('status', s));
      }
      if (filters.vendorId) params = params.set('vendorId', filters.vendorId);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<{data: { content: Expense[] }}>(this.apiUrl, { params });
  }

  getExpense(id: string): Observable<{data: Expense}> {
    return this.http.get<{data: Expense}>(`${this.apiUrl}/${id}`);
  }

  createExpense(expense: Partial<Expense>): Observable<{data: Expense}> {
    return this.http.post<{data: Expense}>(this.apiUrl, expense);
  }

  updateExpense(id: string, expense: Partial<Expense>): Observable<{data: Expense}> {
    return this.http.put<{data: Expense}>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approveExpense(id: string): Observable<{data: Expense}> {
      return this.http.post<{data: Expense}>(`${this.apiUrl}/${id}/approve`, {});
  }

  payExpense(id: string, payload: { bankAccountId: string, paymentDate: string }): Observable<{data: Expense}> {
      return this.http.post<{data: Expense}>(`${this.apiUrl}/${id}/pay`, payload);
  }
}
