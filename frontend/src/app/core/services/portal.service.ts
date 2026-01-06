import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ClientDashboardDto {
  outstandingInvoices: number;
  totalOutstandingAmount: number;
  activeJobs: number;
  unreadDocuments: number;
  contactName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortalService {
  private apiUrl = `${environment.apiUrl}/portal`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<ClientDashboardDto> {
    return this.http.get<ClientDashboardDto>(`${this.apiUrl}/dashboard`);
  }
}
