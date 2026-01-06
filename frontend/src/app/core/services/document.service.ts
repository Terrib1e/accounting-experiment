import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Document } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) { }

  uploadDocument(file: File, jobId?: string, contactId?: string, description?: string, category?: string): Observable<HttpEvent<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    if (jobId) formData.append('jobId', jobId);
    if (contactId) formData.append('contactId', contactId);
    if (description) formData.append('description', description);
    if (category) formData.append('category', category);

    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request<Document>(req);
  }

  getDocument(id: string): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`);
  }

  getDocumentsForJob(jobId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/job/${jobId}`);
  }

  getDocumentsForContact(contactId: string): Observable<Document[]> {
    return this.http.get<Document[]>(`${this.apiUrl}/contact/${contactId}`);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
