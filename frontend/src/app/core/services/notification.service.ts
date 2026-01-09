import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/v1/notifications';

  // Signals for reactive state
  unreadCount = signal<number>(0);
  recentNotifications = signal<Notification[]>([]);

  constructor(private http: HttpClient) {
    this.refreshUnreadCount();
  }

  getAllNotifications(page: number = 0, size: number = 20): Observable<{data: {content: Notification[], totalElements: number}}> {
    return this.http.get<{data: {content: Notification[], totalElements: number}}>(
      `${this.apiUrl}?page=${page}&size=${size}`
    );
  }

  getUnreadNotifications(page: number = 0, size: number = 20): Observable<{data: {content: Notification[], totalElements: number}}> {
    return this.http.get<{data: {content: Notification[], totalElements: number}}>(
      `${this.apiUrl}/unread?page=${page}&size=${size}`
    );
  }

  refreshUnreadCount() {
    this.http.get<{data: {unreadCount: number}}>(`${this.apiUrl}/count`)
      .subscribe({
        next: (res) => this.unreadCount.set(res.data.unreadCount),
        error: (err) => console.error('Error fetching notification count', err)
      });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        this.unreadCount.update(count => Math.max(0, count - 1));
        // Optimistically update recent list if present
        this.recentNotifications.update(list =>
          list.map(n => n.id === id ? { ...n, read: true } : n)
        );
      })
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.unreadCount.set(0);
        this.recentNotifications.update(list =>
          list.map(n => ({ ...n, read: true }))
        );
      })
    );
  }
}
