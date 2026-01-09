import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';

export interface User {
  name: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/v1/auth';
  currentUser = signal<User | null>(this.decodeToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        const token = response.data?.accessToken || response.accessToken || response.data?.access_token || response.access_token;
        if (token) {
             localStorage.setItem('token', token);
             this.currentUser.set(this.decodeToken());
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
        tap(response => {
             const token = response.data?.accessToken || response.accessToken || response.data?.access_token || response.access_token;
            if (token) {
                localStorage.setItem('token', token);
                this.currentUser.set(this.decodeToken());
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

  private decodeToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = (payload.role || payload.authorities?.[0] || 'USER').replace('ROLE_', '');
      const email = payload.sub || payload.email;
      const name = email ? email.split('@')[0] : 'User';

      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        role: role
      };
    } catch (e) {
      console.error('Failed to decode token', e);
      return null;
    }
  }

  getUserRole(): string | null {
    return this.currentUser()?.role || null;
  }
}
