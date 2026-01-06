import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { Expense } from '../models/expense.model';
import { BankAccount } from '../models/bank-account.model';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private apiUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<{data: { content: Invoice[] }}> {
    return this.http.get<{data: { content: Invoice[] }}>(`${this.apiUrl}/invoices`);
  }

  getExpenses(): Observable<{data: { content: Expense[] }}> {
    return this.http.get<{data: { content: Expense[] }}>(`${this.apiUrl}/expenses`);
  }

  getBankAccounts(): Observable<{data: { content: BankAccount[] }}> {
    return this.http.get<{data: { content: BankAccount[] }}>(`${this.apiUrl}/bank-accounts`);
  }
}
