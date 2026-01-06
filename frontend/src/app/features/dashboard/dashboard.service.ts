import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from './dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/v1/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<{data: DashboardStats}> {
    return this.http.get<{data: DashboardStats}>(this.apiUrl);
  }
}
