import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrganizationSettings, FiscalPeriod } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'http://localhost:8080/api/v1/settings';

  constructor(private http: HttpClient) {}

  getOrganizationSettings(): Observable<{data: OrganizationSettings}> {
    return this.http.get<{data: OrganizationSettings}>(`${this.apiUrl}/organization`);
  }

  updateOrganizationSettings(settings: OrganizationSettings): Observable<{data: OrganizationSettings}> {
    return this.http.put<{data: OrganizationSettings}>(`${this.apiUrl}/organization`, settings);
  }

  getFiscalPeriods(): Observable<{data: FiscalPeriod[]}> {
    return this.http.get<{data: FiscalPeriod[]}>(`${this.apiUrl}/fiscal-periods`);
  }

  createFiscalPeriod(period: Partial<FiscalPeriod>): Observable<{data: FiscalPeriod}> {
    return this.http.post<{data: FiscalPeriod}>(`${this.apiUrl}/fiscal-periods`, period);
  }

  closeFiscalPeriod(id: string): Observable<{data: FiscalPeriod}> {
    return this.http.post<{data: FiscalPeriod}>(`${this.apiUrl}/fiscal-periods/${id}/close`, {});
  }
}
