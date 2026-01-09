import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';

export interface InvoiceFilters {
  search?: string;
  status?: string[];
  contactId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/api/v1/invoices';

  constructor(private http: HttpClient) {}

  getInvoices(filters?: InvoiceFilters): Observable<{data: { content: Invoice[] }}> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.status?.length) {
        filters.status.forEach(s => params = params.append('status', s));
      }
      if (filters.contactId) params = params.set('contactId', filters.contactId);
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
    }

    return this.http.get<{data: { content: Invoice[] }}>(this.apiUrl, { params });
  }

  getInvoice(id: string): Observable<{data: Invoice}> {
    return this.http.get<{data: Invoice}>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: Partial<Invoice>): Observable<{data: Invoice}> {
    return this.http.post<{data: Invoice}>(this.apiUrl, invoice);
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<{data: Invoice}> {
    return this.http.put<{data: Invoice}>(`${this.apiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  approveInvoice(id: string): Observable<{data: Invoice}> {
      return this.http.post<{data: Invoice}>(`${this.apiUrl}/${id}/approve`, {});
  }

  payInvoice(id: string, payload: { bankAccountId: string, paymentDate: string }): Observable<{data: Invoice}> {
      return this.http.post<{data: Invoice}>(`${this.apiUrl}/${id}/pay`, payload);
  }

  downloadPdf(id: string): Observable<Blob> {
      return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }
}
