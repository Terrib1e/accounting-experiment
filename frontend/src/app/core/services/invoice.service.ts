import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = 'http://localhost:8080/api/v1/invoices';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<{data: { content: Invoice[] }}> {
    return this.http.get<{data: { content: Invoice[] }}>(this.apiUrl);
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
