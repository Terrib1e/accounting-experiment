import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JournalEntry } from '../models/journal-entry.model';

@Injectable({
  providedIn: 'root'
})
export class JournalEntryService {
  private apiUrl = 'http://localhost:8080/api/v1/journal-entries';

  constructor(private http: HttpClient) {}

  getEntries(): Observable<{data: { content: JournalEntry[] }}> {
    return this.http.get<{data: { content: JournalEntry[] }}>(this.apiUrl);
  }

  getEntry(id: string): Observable<{data: JournalEntry}> {
    return this.http.get<{data: JournalEntry}>(`${this.apiUrl}/${id}`);
  }

  createEntry(entry: Partial<JournalEntry>): Observable<{data: JournalEntry}> {
    return this.http.post<{data: JournalEntry}>(this.apiUrl, entry);
  }

  updateEntry(id: string, entry: Partial<JournalEntry>): Observable<{data: JournalEntry}> {
    return this.http.put<{data: JournalEntry}>(`${this.apiUrl}/${id}`, entry);
  }

  approve(id: string): Observable<{data: JournalEntry}> {
    return this.http.post<{data: JournalEntry}>(`${this.apiUrl}/${id}/approve`, {});
  }

  post(id: string): Observable<{data: JournalEntry}> {
    return this.http.post<{data: JournalEntry}>(`${this.apiUrl}/${id}/post`, {});
  }

  voidEntry(id: string): Observable<{data: JournalEntry}> {
    return this.http.post<{data: JournalEntry}>(`${this.apiUrl}/${id}/void`, {});
  }

  reverse(id: string): Observable<{data: JournalEntry}> {
    return this.http.post<{data: JournalEntry}>(`${this.apiUrl}/${id}/reverse`, {});
  }

  deleteEntry(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
