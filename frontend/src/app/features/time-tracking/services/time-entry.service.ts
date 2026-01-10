import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, BehaviorSubject, tap } from 'rxjs';
import { TimeEntry, CreateTimeEntryRequest, TimerRequest, TimeEntrySummary } from '../models/time-entry.model';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TimeEntryService {
  private readonly baseUrl = '/api/time-entries';

  private runningTimerSubject = new BehaviorSubject<TimeEntry | null>(null);
  runningTimer$ = this.runningTimerSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load initial timer state
    this.loadRunningTimer();
  }

  private loadRunningTimer(): void {
    this.getCurrentTimer().subscribe(timer => {
      this.runningTimerSubject.next(timer);
    });
  }

  getTimeEntries(startDate?: string, endDate?: string): Observable<TimeEntry[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<TimeEntry[]>>(this.baseUrl, { params })
      .pipe(map(res => res.data));
  }

  getAllTimeEntries(): Observable<TimeEntry[]> {
    return this.http.get<ApiResponse<TimeEntry[]>>(`${this.baseUrl}/all`)
      .pipe(map(res => res.data));
  }

  getTimeEntry(id: string): Observable<TimeEntry> {
    return this.http.get<ApiResponse<TimeEntry>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  getTimeEntriesForJob(jobId: string): Observable<TimeEntry[]> {
    return this.http.get<ApiResponse<TimeEntry[]>>(`${this.baseUrl}/job/${jobId}`)
      .pipe(map(res => res.data));
  }

  getTimeEntriesForContact(contactId: string): Observable<TimeEntry[]> {
    return this.http.get<ApiResponse<TimeEntry[]>>(`${this.baseUrl}/contact/${contactId}`)
      .pipe(map(res => res.data));
  }

  getUnbilledForContact(contactId: string): Observable<TimeEntry[]> {
    return this.http.get<ApiResponse<TimeEntry[]>>(`${this.baseUrl}/contact/${contactId}/unbilled`)
      .pipe(map(res => res.data));
  }

  createTimeEntry(request: CreateTimeEntryRequest): Observable<TimeEntry> {
    return this.http.post<ApiResponse<TimeEntry>>(this.baseUrl, request)
      .pipe(map(res => res.data));
  }

  updateTimeEntry(id: string, request: CreateTimeEntryRequest): Observable<TimeEntry> {
    return this.http.put<ApiResponse<TimeEntry>>(`${this.baseUrl}/${id}`, request)
      .pipe(map(res => res.data));
  }

  deleteTimeEntry(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  approveTimeEntry(id: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/approve`, {})
      .pipe(map(res => res.data));
  }

  // Timer operations
  startTimer(request: TimerRequest): Observable<TimeEntry> {
    return this.http.post<ApiResponse<TimeEntry>>(`${this.baseUrl}/timer/start`, request)
      .pipe(
        map(res => res.data),
        tap(entry => this.runningTimerSubject.next(entry))
      );
  }

  stopTimer(): Observable<TimeEntry> {
    return this.http.post<ApiResponse<TimeEntry>>(`${this.baseUrl}/timer/stop`, {})
      .pipe(
        map(res => res.data),
        tap(() => this.runningTimerSubject.next(null))
      );
  }

  getCurrentTimer(): Observable<TimeEntry | null> {
    return this.http.get<ApiResponse<TimeEntry | null>>(`${this.baseUrl}/timer/current`)
      .pipe(map(res => res.data));
  }

  getSummary(): Observable<TimeEntrySummary> {
    return this.http.get<ApiResponse<TimeEntrySummary>>(`${this.baseUrl}/summary`)
      .pipe(map(res => res.data));
  }

  // Utility methods
  formatDuration(minutes: number): string {
    if (!minutes || minutes === 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }

  calculateBillableAmount(durationMinutes: number, hourlyRate: number): number {
    const hours = durationMinutes / 60;
    return Math.round(hours * hourlyRate * 100) / 100;
  }
}
