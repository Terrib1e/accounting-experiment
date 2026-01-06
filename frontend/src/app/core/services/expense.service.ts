import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'http://localhost:8080/api/v1/expenses';

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<{data: { content: Expense[] }}> {
    return this.http.get<{data: { content: Expense[] }}>(this.apiUrl);
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
