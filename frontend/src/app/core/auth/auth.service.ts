import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/v1/auth';
  currentUser = signal<any>(null); // Type this properly later

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('Full Login Response:', response);
        const token = response.data?.accessToken || response.accessToken || response.data?.access_token || response.access_token;
        console.log('Extracted Token:', token);

        if (token) {
             localStorage.setItem('token', token);
             this.currentUser.set({ name: 'User' });
        } else {
            console.error('Token not found in response');
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
        tap(response => {
            console.log('Register Response:', response);
             const token = response.data?.accessToken || response.accessToken || response.data?.access_token || response.access_token;
            if (token) {
                localStorage.setItem('token', token);
                this.currentUser.set({ name: 'User' });
            }
        })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode JWT payload (base64)
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Spring Security typically uses 'role' or 'authorities' claim
      return payload.role || payload.authorities?.[0]?.replace('ROLE_', '') || null;
    } catch (e) {
      console.error('Failed to decode token', e);
      return null;
    }
  }
}
