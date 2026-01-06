import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8080/api/v1/contacts';

  constructor(private http: HttpClient) {}

  getContacts(): Observable<{data: { content: Contact[] }}> {
    return this.http.get<{data: { content: Contact[] }}>(this.apiUrl);
  }

  createContact(contact: Partial<Contact>): Observable<{data: Contact}> {
    return this.http.post<{data: Contact}>(this.apiUrl, contact);
  }

  updateContact(id: string, contact: Partial<Contact>): Observable<{data: Contact}> {
    return this.http.put<{data: Contact}>(`${this.apiUrl}/${id}`, contact);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
