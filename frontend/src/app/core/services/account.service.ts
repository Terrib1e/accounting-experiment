import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account, AccountHierarchy } from '../models/account.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private apiUrl = 'http://localhost:8080/api/v1/accounts';

  constructor(private http: HttpClient) {}

  getAccounts(): Observable<{data: Account[]}> {
    return this.http.get<{data: Account[]}>(this.apiUrl);
  }

  getAccountHierarchy(): Observable<{data: AccountHierarchy[]}> {
    return this.http.get<{data: AccountHierarchy[]}>(`${this.apiUrl}/tree`);
  }

  createAccount(account: Partial<Account>): Observable<{data: Account}> {
    return this.http.post<{data: Account}>(this.apiUrl, account);
  }

  updateAccount(id: string, account: Partial<Account>): Observable<{data: Account}> {
    return this.http.put<{data: Account}>(`${this.apiUrl}/${id}`, account);
  }

  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
