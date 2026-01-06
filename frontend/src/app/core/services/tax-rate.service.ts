import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaxRate } from '../models/tax-rate.model';

@Injectable({
  providedIn: 'root'
})
export class TaxRateService {
  private apiUrl = 'http://localhost:8080/api/v1/tax-rates';

  constructor(private http: HttpClient) {}

  getTaxRates(): Observable<{data: { content: TaxRate[] }}> {
    return this.http.get<{data: { content: TaxRate[] }}>(this.apiUrl);
  }

  createTaxRate(taxRate: Partial<TaxRate>): Observable<{data: TaxRate}> {
    return this.http.post<{data: TaxRate}>(this.apiUrl, taxRate);
  }

  updateTaxRate(id: string, taxRate: Partial<TaxRate>): Observable<{data: TaxRate}> {
    return this.http.put<{data: TaxRate}>(`${this.apiUrl}/${id}`, taxRate);
  }

  deleteTaxRate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
